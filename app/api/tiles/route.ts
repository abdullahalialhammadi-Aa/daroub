import { env } from 'cloudflare:workers';
import { attributionUpstream, configuredTileProviders, isTileProviderId, parseView, providerSession, tileProviderMaxZoom, tileProviderSummaries, tileUpstream, validTile, type TileProviderEnv } from '@/lib/tile-providers';

const headers = { 'Cache-Control': 'private, no-store' };
const windows = new Map<string, { started: number; count: number }>();
/** Best-effort per-client/per-isolate throttle on paid tiles, not a distributed quota. */
function allowed(key: string) {
  const now = Date.now();
  for (const [id, window] of windows) if (now - window.started > 60_000) windows.delete(id);
  const window = windows.get(key);
  if (!window) { if (windows.size >= 2000) return false; windows.set(key, { started: now, count: 1 }); return true; }
  return ++window.count <= 900;
}
/** Paid tiles are for this site's pages only: reject cross-site fetches and foreign referers (hotlinking would spend the operator's quota). */
function sameSite(request: Request) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return false;
  const referer = request.headers.get('referer');
  if (!referer) return true;
  try { return new URL(referer).origin === new URL(request.url).origin; } catch { return false; }
}
export async function GET(request: Request) {
  const url = new URL(request.url), e = env as TileProviderEnv, provider = url.searchParams.get('provider');
  // The registry: identifiers, labels, zoom limits and credits of providers whose key works. Never keys or tokens.
  if (!provider) return Response.json({ providers: await tileProviderSummaries(e) }, { headers: { 'Cache-Control': 'private, max-age=300' } });
  if (!sameSite(request)) return Response.json({ error: 'Cross-site request rejected' }, { status: 403, headers });
  if (!isTileProviderId(provider) || !configuredTileProviders(e).includes(provider)) return Response.json({ error: 'Unknown provider' }, { status: 404, headers });
  const session = await providerSession(e, provider);
  if (!session) return Response.json({ error: 'Provider unavailable' }, { status: 503, headers });
  if (url.searchParams.get('attribution') === '1') {
    if (provider !== 'google') return Response.json({ copyright: '© Mapbox © Maxar' }, { headers: { 'Cache-Control': 'private, max-age=3600' } });
    const view = parseView(url.searchParams);
    if (!view) return Response.json({ error: 'Invalid view' }, { status: 400, headers });
    try {
      const upstream = await fetch(attributionUpstream(e, session, view), { redirect: 'manual', signal: AbortSignal.timeout(8_000) });
      if (!upstream.ok) return Response.json({ error: 'Attribution unavailable' }, { status: 502, headers });
      const data = await upstream.json() as { copyright?: unknown };
      return Response.json({ copyright: typeof data.copyright === 'string' ? data.copyright.slice(0, 500) : '' }, { headers: { 'Cache-Control': 'private, max-age=3600' } });
    } catch { return Response.json({ error: 'Attribution unavailable' }, { status: 502, headers }); }
  }
  const z = Number(url.searchParams.get('z')), x = Number(url.searchParams.get('x')), y = Number(url.searchParams.get('y'));
  if (!validTile(z, x, y, tileProviderMaxZoom(provider))) return Response.json({ error: 'Invalid tile' }, { status: 400, headers });
  if (!allowed(request.headers.get('cf-connecting-ip') ?? 'anonymous')) return Response.json({ error: 'Too many tiles' }, { status: 429, headers });
  try {
    const upstream = await fetch(tileUpstream(provider, e, session, z, x, y), { redirect: 'manual', signal: AbortSignal.timeout(10_000) });
    const type = upstream.headers.get('content-type') ?? '';
    if (!upstream.ok || !type.startsWith('image/')) return Response.json({ error: 'Tile unavailable' }, { status: 502, headers });
    // The image passes through untouched; the browser may keep it for a day, shared caches never see it.
    return new Response(upstream.body, { headers: { 'Content-Type': type, 'Cache-Control': 'private, max-age=86400', 'X-Content-Type-Options': 'nosniff' } });
  } catch { /* Never expose provider responses or the key in errors. */ }
  return Response.json({ error: 'Tile unavailable' }, { status: 502, headers });
}
