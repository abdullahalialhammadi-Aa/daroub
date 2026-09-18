import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { aiMessages, retrieveGuide, validateAssistantRequest } from '@/lib/assistant-guide';
import { providerRequest, providerText, publicProviders, resolveProvider, type AIProviderEnv } from '@/lib/ai-providers';
import {readCatalog} from '@/lib/catalog-server';
import {loadOwnedTrip,loadOwnedGear} from '@/lib/sync-server';
import {requestForTrip,retrieveTripGuide} from '@/lib/assistant-trip';
import type { AssistantAnswer } from '@/lib/toolkit-types';

const windows = new Map<string, { started: number; count: number }>();
const headers = { 'Cache-Control': 'private, no-store' };
function fallback(answer: AssistantAnswer, reason: NonNullable<AssistantAnswer['fallbackReason']>) {
  console.warn(JSON.stringify({ event: 'daroub-assistant-fallback', reason }));
  return Response.json({ ...answer, fallbackReason: reason }, { headers });
}
/** Best-effort per-user/per-isolate throttling, not a distributed quota. */
function allowed(key: string) {
  const now = Date.now();
  for (const [id, window] of windows) if (now - window.started > 60_000) windows.delete(id);
  const window = windows.get(key);
  if (!window) { if (windows.size >= 1000) return false; windows.set(key, { started: now, count: 1 }); return true; }
  return ++window.count <= 6;
}
async function smallJSON(request: Request | Response, maxBytes = 10_000) {
  const reader = request.body?.getReader(); if (!reader) throw Error('Missing body');
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) { const chunk = await reader.read(); if (chunk.done) break; length += chunk.value.byteLength; if (length > maxBytes) { await reader.cancel(); throw Error('Body too large'); } chunks.push(chunk.value); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
/** Lists the generative providers the operator configured: identifiers, labels and model names only, never keys or endpoints. */
export async function GET() {
  return Response.json({ providers: publicProviders(env as AIProviderEnv) }, { headers });
}
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Origin rejected' }, { status: 403, headers });
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return Response.json({ error: 'JSON required' }, { status: 415, headers });
  let body;try{body=await smallJSON(request);}catch{return Response.json({error:'Invalid request'},{status:400,headers});}
  let catalog;try{catalog=await readCatalog();}catch{return Response.json({error:'Guide unavailable'},{status:503,headers});}
  const input=validateAssistantRequest(body,catalog);
  if (!input) return Response.json({ error: 'Invalid request' }, { status: 400, headers });
  // A trip identifier is always resolved under the authenticated owner, never from client data.
  const user=(input.tripId||input.useAI)?await getChatGPTUser():null;
  let trip;
  let answer=retrieveGuide(input,catalog);
  let publicInput=input;
  if(input.tripId){
    if(!user)return Response.json({error:'Sign in required'},{status:401,headers});
    if(request.headers.get('X-Daroub-Account')!==user.userId)return Response.json({error:'Account changed'},{status:409,headers});
    try{trip=await loadOwnedTrip(user.userId,input.tripId);if(!trip)return Response.json({error:'Trip unavailable'},{status:404,headers});const gear=await loadOwnedGear(user.userId);publicInput=requestForTrip(input,trip,catalog);answer=await retrieveTripGuide(publicInput,trip,gear,catalog);}catch{return Response.json({error:'Trip unavailable'},{status:503,headers});}
  }
  if (!input.useAI) return Response.json(answer, { headers });
  // The user picks which configured provider rephrases the guide; an unconfigured choice never silently falls through to another provider.
  const provider = resolveProvider(env as AIProviderEnv, input.provider);
  if (!provider) return fallback(answer, 'unconfigured');
  if (!user) return fallback(answer, 'sign-in');
  if (!allowed(user.userId)) return fallback(answer, 'rate-limit');
  try {
    // Always rebuild public guide text, so a trip-aware answer cannot leak saved fields without consent.
    const publicAnswer=retrieveGuide(publicInput,catalog);
    const outbound = providerRequest(provider, aiMessages(publicInput, publicAnswer,catalog,input.shareTripContext?trip??undefined:undefined), { maxTokens: 1000, timeoutMs: 12_000 });
    const response = await fetch(outbound.url, outbound.init);
    if (!response.ok) return fallback(answer, 'provider');
    const text = providerText(provider, await smallJSON(response, 64_000));
    // Provider wording is unverified supplemental text. It never replaces cited guide text.
    if (typeof text === 'string' && text.trim() && text.length <= 6000 && !/https?:\/\/|www\.|<\/?[a-z][^>]*>/iu.test(text)) return Response.json({ ...answer, aiText: text.trim(), mode: 'ai', aiProvider: { id: provider.id, label: provider.label } }, { headers });
  } catch { /* Never expose provider responses, credentials, or request text in errors. */ }
  return fallback(answer, 'provider');
}
