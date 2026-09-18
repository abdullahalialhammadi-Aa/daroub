/**
 * Paid imagery providers for the area view. Keys and session tokens stay on the server:
 * the browser only ever requests /api/tiles?provider=…&z=&x=&y=, and the Worker fetches the upstream tile.
 * Google Map Tiles API (2D satellite tiles with a session token) and Mapbox Satellite are supported.
 */
export const tileProviderIds = ['google', 'mapbox'] as const;
export type TileProviderId = typeof tileProviderIds[number];
export interface TileProviderEnv { IMAGERY_GOOGLE_KEY?: string; IMAGERY_MAPBOX_TOKEN?: string; IMAGERY_DEFAULT?: string }
/** What the client may learn about a provider. */
export interface TileProviderSummary { id: TileProviderId; label: string; maxZoom: number; credit: string }
export interface TileSession { token: string; expiry: number }
export interface TileView { zoom: number; north: number; south: number; east: number; west: number }
type Fetch = typeof fetch;

const GOOGLE = 'https://tile.googleapis.com';
const MAPBOX = 'https://api.mapbox.com';
const details: Record<TileProviderId, Omit<TileProviderSummary, 'id'>> = {
  google: { label: 'Google', maxZoom: 21, credit: 'Google' },
  mapbox: { label: 'Mapbox', maxZoom: 19, credit: '© Mapbox © Maxar' },
};
export const tileProviderMaxZoom = (id: TileProviderId) => details[id].maxZoom;
export const isTileProviderId = (value: unknown): value is TileProviderId => typeof value === 'string' && (tileProviderIds as readonly string[]).includes(value);
/** Keys pasted through editors or dashboards often carry stray whitespace or a carriage return; only the token itself counts. */
const keyFor = (env: TileProviderEnv, id: TileProviderId) => (id === 'google' ? env.IMAGERY_GOOGLE_KEY : env.IMAGERY_MAPBOX_TOKEN)?.trim();
const validKey = (key: string | undefined): key is string => typeof key === 'string' && key.length > 0 && key.length <= 300 && /^[A-Za-z0-9_.-]+$/.test(key);

/** Providers with a plausible key, the operator's IMAGERY_DEFAULT first. Validity is only known after a session check. */
export function configuredTileProviders(env: TileProviderEnv): TileProviderId[] {
  const list = tileProviderIds.filter((id) => validKey(keyFor(env, id))), preferred = env.IMAGERY_DEFAULT?.trim();
  return list.sort((a, b) => Number(b === preferred) - Number(a === preferred));
}

// Per-isolate cache of sessions and token checks, keyed by provider and key so a rotated key gets a fresh session.
const cache = new Map<string, { until: number; value: Promise<TileSession | null> }>();
export function resetTileProviderCache() { cache.clear(); }
const HOUR = 3_600_000, DAY = 86_400_000;

/** A Google Map Tiles session (satellite, hi-DPI) or a Mapbox token check. Null means the key does not work right now. */
export function providerSession(env: TileProviderEnv, id: TileProviderId, fetchImpl: Fetch = fetch, now = Date.now()): Promise<TileSession | null> {
  const key = keyFor(env, id);
  if (!validKey(key)) return Promise.resolve(null);
  const cacheId = `${id}:${key}`, hit = cache.get(cacheId);
  if (hit && hit.until > now) return hit.value;
  const value = (async (): Promise<TileSession | null> => {
    try {
      if (id === 'google') {
        const response = await fetchImpl(`${GOOGLE}/v1/createSession?key=${encodeURIComponent(key)}`, {
          method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(8_000), headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mapType: 'satellite', language: 'en-US', region: 'US', scale: 'scaleFactor2x', highDpi: true }),
        });
        if (!response.ok) { console.warn(JSON.stringify({ event: 'daroub-tile-session-rejected', provider: id, status: response.status, detail: (await response.text()).split(key).join('<key>').slice(0, 200) })); return null; }
        const data = await response.json() as { session?: unknown; expiry?: unknown };
        if (typeof data.session !== 'string' || !data.session) return null;
        const expiry = Number(data.expiry) * 1000;
        return { token: data.session, expiry: Number.isFinite(expiry) && expiry > now ? expiry : now + 7 * DAY };
      }
      const response = await fetchImpl(`${MAPBOX}/tokens/v2?access_token=${encodeURIComponent(key)}`, { redirect: 'manual', signal: AbortSignal.timeout(8_000) });
      if (!response.ok) return null;
      const data = await response.json() as { code?: unknown };
      return data.code === 'TokenValid' ? { token: key, expiry: now + DAY } : null;
    } catch (error) {
      // Operators see why a key is not listed; the key itself never appears in logs.
      console.warn(JSON.stringify({ event: 'daroub-tile-session-failed', provider: id, error: String(error).split(key).join('<key>').slice(0, 200) }));
      return null;
    }
  })();
  // A failure is remembered for a minute so a bad key never hammers the provider; a session is kept until an hour before it expires.
  cache.set(cacheId, { until: now + 60_000, value });
  void value.then((session) => { if (session) cache.set(cacheId, { until: Math.min(session.expiry - HOUR, now + 13 * DAY), value }); });
  return value;
}

/** Providers whose key currently works: the only ones the client is told about. */
export async function tileProviderSummaries(env: TileProviderEnv, fetchImpl: Fetch = fetch, now = Date.now()): Promise<TileProviderSummary[]> {
  const ids = configuredTileProviders(env);
  const sessions = await Promise.all(ids.map((id) => providerSession(env, id, fetchImpl, now)));
  return ids.filter((_, i) => sessions[i]).map((id) => ({ id, ...details[id] }));
}

export function validTile(z: number, x: number, y: number, maxZoom: number): boolean {
  return [z, x, y].every(Number.isInteger) && z >= 0 && z <= maxZoom && x >= 0 && y >= 0 && x < 2 ** z && y < 2 ** z;
}
export function tileUpstream(id: TileProviderId, env: TileProviderEnv, session: TileSession, z: number, x: number, y: number): string {
  if (id === 'google') return `${GOOGLE}/v1/2dtiles/${z}/${x}/${y}?session=${encodeURIComponent(session.token)}&key=${encodeURIComponent(env.IMAGERY_GOOGLE_KEY ?? '')}`;
  return `${MAPBOX}/v4/mapbox.satellite/${z}/${x}/${y}@2x.jpg90?access_token=${encodeURIComponent(session.token)}`;
}
/** Google requires the copyright text of the visible area to be shown; this builds the viewport request for it. */
export function attributionUpstream(env: TileProviderEnv, session: TileSession, view: TileView): string {
  const q = new URLSearchParams({ session: session.token, key: env.IMAGERY_GOOGLE_KEY ?? '', zoom: String(view.zoom), north: String(view.north), south: String(view.south), east: String(view.east), west: String(view.west) });
  return `${GOOGLE}/tile/v1/viewport?${q.toString()}`;
}
export function parseView(params: URLSearchParams): TileView | null {
  const zoom = Number(params.get('zoom')), north = Number(params.get('north')), south = Number(params.get('south')), east = Number(params.get('east')), west = Number(params.get('west'));
  if (![zoom, north, south, east, west].every(Number.isFinite)) return null;
  if (!Number.isInteger(zoom) || zoom < 0 || zoom > 22 || Math.abs(north) > 90 || Math.abs(south) > 90 || Math.abs(east) > 180 || Math.abs(west) > 180 || south > north) return null;
  return { zoom, north, south, east, west };
}
