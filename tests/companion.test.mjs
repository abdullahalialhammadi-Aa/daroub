import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

async function load(file) {
  const built = await build({ entryPoints: [fileURLToPath(new URL(file, import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node' });
  return import('data:text/javascript;base64,' + Buffer.from(built.outputFiles[0].text).toString('base64'));
}
const health = await load('../lib/health-monitor.ts');
const guide = await load('../lib/assistant-guide.ts');
const i18n = await load('../lib/companion-i18n.ts');
const context = await load('../lib/assistant-context.ts');
const {seedCatalog}=await load('../lib/catalog-seed.ts');
const data = bytes => new DataView(Uint8Array.from(bytes).buffer);

test('BLE UINT8 and little-endian UINT16 measurements, extra fields, contact flags', () => {
  assert.deepEqual(health.parseHeartRate(data([0, 72])), { kind: 'reading', bpm: 72, contact: 'unsupported' });
  assert.deepEqual(health.parseHeartRate(data([1, 44, 1])), { kind: 'reading', bpm: 300, contact: 'unsupported' });
  assert.deepEqual(health.parseHeartRate(data([0x1e, 80, 99, 0, 0, 0])), { kind: 'reading', bpm: 80, contact: 'detected' });
  assert.deepEqual(health.parseHeartRate(data([4, 90])), { kind: 'no-contact' });
  assert.equal(health.parseHeartRate(data([2, 90])).kind, 'reading');
});
test('BLE malformed and impossible readings never throw or produce a pulse', () => {
  for (const bytes of [[], [0], [1, 80], [0, 0], [1, 45, 1], [1, 255, 255]]) assert.equal(health.parseHeartRate(data(bytes)).kind, 'invalid');
});
test('Alert requires continuous out-of-range readings and observes cooldown', () => {
  let state = health.emptyAlertState(); const limits = { low: 50, high: 120, durationMs: 15000 };
  for (let now = 0; now < 15000; now += 1000) { const next = health.checkHeartRate(state, 130, now, limits); assert.equal(next.alert, false); state = next.state; }
  let next = health.checkHeartRate(state, 130, 15000, limits); assert.equal(next.alert, true); state = next.state;
  for (let now = 16000; now < 75000; now += 1000) { next = health.checkHeartRate(state, 130, now, limits); assert.equal(next.alert, false); state = next.state; }
  assert.equal(health.checkHeartRate(state, 130, 75000, limits).alert, true);
});
test('In-range, packet gaps, invalid/contact resets, and disabled thresholds break continuity', () => {
  const limits = { low: 50, high: 120, durationMs: 5000 };
  const first = health.checkHeartRate(health.emptyAlertState(), 130, 0, limits).state;
  assert.equal(health.checkHeartRate(first, 120, 5000, limits).state.outsideSince, null);
  assert.equal(health.checkHeartRate(first, 50, 5000, limits).alert, false);
  assert.equal(health.checkHeartRate(first, 130, 16000, limits).alert, false);
  assert.equal(health.checkHeartRate(health.resetContinuity(first), 130, 5000, limits).alert, false);
  assert.equal(health.checkHeartRate(first, 130, 5000, null).alert, false);
});
test('Assistant validates destination, locale, topic, boolean, and input bounds', () => {
  const base = { question: 'Equipment?', locale: 'en', destinationId: 'liwa', terrainIndex: 0 };
  assert.ok(guide.validateAssistantRequest(base));
  for (const change of [{ question: ' ' }, { question: 'a'.repeat(1501) }, { locale: 'xx' }, { destinationId: 'nowhere' }, { terrainIndex: 4 }, { terrainIndex: 0.5 }, { topic: 'delete' }, { useAI: 'yes' }]) assert.equal(guide.validateAssistantRequest({ ...base, ...change }), null);
});
test('Each locale retrieves published equipment guidance and clarification', () => {
  for (const locale of ['ar', 'en', 'fr', 'zh', 'hi']) {
    const request = { question: 'x', locale, destinationId: 'liwa', terrainIndex: 0, topic: 'equipment' };
    const answer = guide.retrieveGuide(request);
    assert.equal(answer.mode, 'guide'); assert.equal(answer.destinationId, 'liwa'); assert.deepEqual(answer.actions, []); assert.equal(answer.catalogRevision,0);
    assert.ok(answer.sourceIds.length); assert.ok(answer.sourceIds.every(id => guide.assistantSource(id)));
    const clarification = guide.retrieveGuide({ ...request, topic: undefined, question: 'zzzzzz' });
    assert.equal(clarification.actions.length, 0); assert.ok(clarification.suggestions.length); assert.equal(clarification.text, i18n.companionText(locale, 'clarify'));
  }
});
test('Coordinate-only context never claims local species; weather response directs to live report', () => {
  const nature = guide.retrieveGuide({ question: 'plants', locale: 'en', destinationId: null, terrainIndex: 2 });
  assert.equal(nature.destinationId, null); assert.match(nature.text, /General terrain guidance/); assert.match(nature.text, /not a complete inventory/);
  const weather = guide.retrieveGuide({ question: 'weather', locale: 'en', destinationId: 'hurghada', terrainIndex: 0 });
  assert.match(weather.text, /not a live forecast/); assert.equal(weather.actions.length, 0);
});
test('Assistant preserves arbitrary coordinates and stable terrain IDs in report roundtrips', () => {
  const selected = context.assistantContext(new URLSearchParams('terrainId=forest&terrain=0&lat=-12.3&lon=44.5&generic=1'));
  assert.equal(selected.destinationId, null); assert.equal(selected.terrainIndex, 2); assert.deepEqual(selected.point, { lat: -12.3, lon: 44.5 });
  assert.equal(context.assistantReportHref(selected.destinationId, selected.terrainIndex, selected.point), '/regions?terrainId=forest&lat=-12.3&lon=44.5');
  assert.equal(context.assistantContext(new URLSearchParams('terrain=1&generic=1&lat=91&lon=10')).point, null);
  assert.equal(context.assistantContext(new URLSearchParams('terrain=1')).destinationId, 'jebel-shams');
  assert.equal(context.assistantContext(new URLSearchParams('destination=hurghada')).terrainIndex, 3);
});
test('Provider context excludes trips, telemetry and invented actions', () => {
  const request = { question: 'What should I pack?', locale: 'en', destinationId: 'liwa', terrainIndex: 0 };
  const answer = guide.retrieveGuide(request); const messages = guide.aiMessages(request, answer);
  assert.equal(messages.length, 2); assert.equal(messages[1].content, request.question); assert.match(messages[0].content, /without adding factual claims/); assert.equal(JSON.stringify(messages).includes('lastReadingAt'), false);
});
test('All companion strings have five non-empty translations', () => {
  for (const [key, strings] of Object.entries(i18n.companionWords)) { assert.equal(strings.length, 5, key); assert.ok(strings.every(s => typeof s === 'string' && s.trim()), key); }
});

globalThis.__daroubTestEnv = {};
globalThis.__daroubTestUser = null;
globalThis.__daroubCatalog=seedCatalog;
globalThis.__daroubOwnedTrip=null;
globalThis.__daroubOwnedTripOwner=null;
globalThis.__daroubOwnedGear=[];
const routeBuild = await build({ entryPoints: [fileURLToPath(new URL('../app/api/assistant/route.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'test-runtime', setup(builder) {
  builder.onResolve({ filter: /^cloudflare:workers$|^@\/app\/chatgpt-auth$|^@\/lib\/catalog-server$|^@\/lib\/sync-server$/ }, args => ({ path: args.path, namespace: 'test-runtime' }));
  builder.onLoad({ filter: /.*/, namespace: 'test-runtime' }, args => ({ contents: args.path === 'cloudflare:workers' ? 'export const env = globalThis.__daroubTestEnv;' : args.path==='@/lib/catalog-server'?'export async function readCatalog(){return globalThis.__daroubCatalog;}':args.path==='@/lib/sync-server'?'export async function loadOwnedTrip(owner,id){return owner===globalThis.__daroubOwnedTripOwner&&id===globalThis.__daroubOwnedTrip?.id?globalThis.__daroubOwnedTrip:null;}export async function loadOwnedGear(){return globalThis.__daroubOwnedGear;}':'export async function getChatGPTUser(){ return globalThis.__daroubTestUser; }', loader: 'js' }));
} }] });
const route = await import('data:text/javascript;base64,' + Buffer.from(routeBuild.outputFiles[0].text).toString('base64'));
const requestBody = { question: 'Equipment?', locale: 'en', destinationId: 'liwa', terrainIndex: 0, topic: 'equipment' };
const request = (body = requestBody, customHeaders = {}) => new Request('https://daroub.example/api/assistant', { method: 'POST', headers: { Origin: 'https://daroub.example', 'Content-Type': 'application/json', ...customHeaders }, body: typeof body === 'string' ? body : JSON.stringify(body) });
test('Assistant endpoint rejects cross-origin, wrong content type, malformed and oversized bodies', async () => {
  assert.equal((await route.POST(request(requestBody, { Origin: 'https://attacker.example' }))).status, 403);
  assert.equal((await route.POST(request(requestBody, { 'Content-Type': 'text/plain' }))).status, 415);
  assert.equal((await route.POST(request(requestBody, { 'Content-Type': 'application/jsonp' }))).status, 415);
  assert.equal((await route.POST(request('{'))).status, 400);
  assert.equal((await route.POST(request('a'.repeat(10001)))).status, 400);
  const response = await route.POST(request()); assert.equal(response.status, 200); assert.match(response.headers.get('cache-control'), /no-store/); assert.equal((await response.json()).mode, 'guide');
});
test('AI opt-in needs configured HTTPS provider and authentication, failures fall back', async () => {
  const originalFetch = globalThis.fetch; let calls = 0;
  globalThis.fetch = async () => { calls++; throw Error('provider unavailable'); };
  try {
    Object.assign(globalThis.__daroubTestEnv, { AI_BASE_URL: 'https://provider.example/v1', AI_MODEL: 'test-model', AI_API_KEY: 'test-only' });
    assert.equal((await (await route.POST(request({ ...requestBody, useAI: true }))).json()).mode, 'guide'); assert.equal(calls, 0);
    globalThis.__daroubTestUser = { userId: 'test-user' };
    assert.equal((await (await route.POST(request({ ...requestBody, useAI: true }))).json()).mode, 'guide'); assert.equal(calls, 1);
    globalThis.__daroubTestEnv.AI_BASE_URL = 'http://provider.example';
    assert.equal((await (await route.POST(request({ ...requestBody, useAI: true }))).json()).mode, 'guide'); assert.equal(calls, 1);
  } finally { globalThis.fetch = originalFetch; }
});
test('AI output may change wording only; verified citations and click actions are preserved', async () => {
  const originalFetch = globalThis.fetch; globalThis.__daroubTestEnv.AI_BASE_URL = 'https://provider.example/v1'; let payload;
  globalThis.fetch = async (url, options) => { assert.equal(url.href, 'https://provider.example/v1/chat/completions'); payload = JSON.parse(options.body); return Response.json({ choices: [{ message: { content: 'Use the listed guide equipment.' } }], actions: [{ type: 'delete-trip' }] }); };
  try {
    const answer = await (await route.POST(request({ ...requestBody, useAI: true }))).json();
    assert.equal(answer.mode, 'ai'); assert.equal(answer.aiText, 'Use the listed guide equipment.'); assert.equal(answer.text, guide.retrieveGuide(requestBody).text); assert.deepEqual(answer.actions, []); assert.ok(answer.sourceIds.length); assert.equal(payload.messages.length, 2); assert.equal('trips' in payload, false);
  } finally { globalThis.fetch = originalFetch; }
});
test('Provider links, markup and oversized output fall back without attaching unverified source claims', async () => {
  const originalFetch = globalThis.fetch; globalThis.__daroubTestUser = { userId: 'output-tests' };
  try {
    for (const text of ['Visit https://evil.example', '<a href="evil">go</a>', 'a'.repeat(6001)]) {
      globalThis.fetch = async () => Response.json({ choices: [{ message: { content: text } }] });
      const answer = await (await route.POST(request({ ...requestBody, useAI: true }))).json();
      assert.equal(answer.mode, 'guide'); assert.equal(answer.aiText, undefined); assert.equal(answer.fallbackReason, 'provider'); assert.equal(answer.text, guide.retrieveGuide(requestBody).text);
    }
  } finally { globalThis.fetch = originalFetch; }
});
test('AI throttle is per user and communicates a safe fallback reason', async () => {
  const originalFetch = globalThis.fetch; globalThis.__daroubTestUser = { userId: 'quota-tests' }; let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({ choices: [{ message: { content: 'Guide summary.' } }] }); };
  try { for (let i = 0; i < 6; i++) assert.equal((await (await route.POST(request({ ...requestBody, useAI: true }))).json()).mode, 'ai'); const answer = await (await route.POST(request({ ...requestBody, useAI: true }))).json(); assert.equal(calls, 6); assert.equal(answer.fallbackReason, 'rate-limit'); assert.equal(answer.mode, 'guide'); }
  finally { globalThis.fetch = originalFetch; }
});

const tripFixture={id:'owned-trip',title:'SAVED-PRIVATE-TITLE',destinationId:'liwa',terrainId:'desert',location:{lat:23,lon:53},startDate:'2027-06-01',endDate:'2027-06-03',groupSize:7,transport:'car',notes:'SAVED-PRIVATE-NOTES',checklist:[],revision:3,updatedAt:'2026-09-17T01:00:00.000Z',activities:['walking'],itinerary:[]};
test('Selected-trip endpoint requires authentication, exact account guard, and owner-scoped lookup',async()=>{
 globalThis.__daroubOwnedTrip=tripFixture;globalThis.__daroubOwnedTripOwner='owner-a';globalThis.__daroubTestUser=null;
 assert.equal((await route.POST(request({...requestBody,tripId:'owned-trip'}))).status,401);
 globalThis.__daroubTestUser={userId:'owner-a'};assert.equal((await route.POST(request({...requestBody,tripId:'owned-trip'}))).status,409);
 globalThis.__daroubTestUser={userId:'owner-b'};const other=await route.POST(request({...requestBody,tripId:'owned-trip'},{'X-Daroub-Account':'owner-b'}));assert.equal(other.status,404);assert.equal((await other.text()).includes('SAVED-PRIVATE'),false);
 globalThis.__daroubTestUser={userId:'owner-a'};const good=await route.POST(request({...requestBody,tripId:'owned-trip'},{'X-Daroub-Account':'owner-a'}));assert.equal(good.status,200);const answer=await good.json();assert.equal(answer.tripContext.id,'owned-trip');assert.ok(answer.proposals.length);assert.ok(answer.proposals.every(p=>p.expectedRevision===3&&p.expectedFingerprint));assert.equal(answer.text.includes('SAVED-PRIVATE-NOTES'),false);
});
test('Provider request excludes selected trip without second consent; opt-in transmits only allowed fields',async()=>{
 const originalFetch=globalThis.fetch;globalThis.__daroubTestUser={userId:'owner-a'};globalThis.__daroubTestEnv.AI_BASE_URL='https://provider.example/v1';let payload;
 globalThis.fetch=async(url,options)=>{payload=JSON.parse(options.body);return Response.json({choices:[{message:{content:'Guide text.'}}]});};
 try{
  const body={...requestBody,tripId:'owned-trip',useAI:true};await route.POST(request(body,{'X-Daroub-Account':'owner-a'}));const publicOnly=JSON.stringify(payload);assert.equal(publicOnly.includes('2027-06-01'),false);assert.equal(publicOnly.includes('SAVED-PRIVATE'),false);
  await route.POST(request({...body,shareTripContext:true,trip:{notes:'CLIENT-INJECTED'},health:{bpm:12345}}, {'X-Daroub-Account':'owner-a'}));const shared=JSON.stringify(payload);assert.ok(shared.includes('2027-06-01'));for(const forbidden of ['SAVED-PRIVATE','CLIENT-INJECTED','12345'])assert.equal(shared.includes(forbidden),false);
 }finally{globalThis.fetch=originalFetch;}
});
test('Endpoint consumes the current explicit published catalog and pins source records',async()=>{
 const prior=globalThis.__daroubCatalog;globalThis.__daroubCatalog=structuredClone(prior);globalThis.__daroubCatalog.revision=77;globalThis.__daroubCatalog.destinations[0].sections=[{id:'equipment',title:['أ','New title','f','中','ह'],body:['أ','Published-only equipment text','f','中','ह'],sourceIds:['essentials']}];
 try{const answer=await(await route.POST(request())).json();assert.equal(answer.catalogRevision,77);assert.match(answer.text,/Published-only equipment text/);assert.ok(answer.sources.every(source=>answer.sourceIds.includes(source.id)));}finally{globalThis.__daroubCatalog=prior;}
});

const providers = await load('../lib/ai-providers.ts');
test('Provider registry lists only configured providers, without secrets or endpoints', () => {
  assert.deepEqual(providers.publicProviders({}), []);
  assert.deepEqual(providers.publicProviders({ AI_GROK_API_KEY: 'k' }), [], 'a key without a model is not a provider');
  assert.deepEqual(providers.publicProviders({ AI_CLAUDE_API_KEY: 'k' }), [{ id: 'claude', label: 'Claude', model: 'claude-opus-5' }], 'Claude defaults its model');
  const env = { AI_GROK_API_KEY: 'g', AI_GROK_MODEL: 'grok-test', AI_OPENAI_API_KEY: 'o', AI_OPENAI_MODEL: 'codex-test', AI_CLAUDE_API_KEY: 'c', AI_CLAUDE_MODEL: 'claude-test', AI_BASE_URL: 'https://provider.example/v1', AI_MODEL: 'custom-test', AI_API_KEY: 'x', AI_DEFAULT_PROVIDER: 'claude' };
  const list = providers.publicProviders(env);
  assert.deepEqual(list.map(p => p.id), ['claude', 'grok', 'codex', 'custom']);
  for (const p of list) { assert.deepEqual(Object.keys(p).sort(), ['id', 'label', 'model']); assert.equal(JSON.stringify(p).includes('http'), false); }
  assert.equal(providers.resolveProvider(env, 'grok').endpoint.href, 'https://api.x.ai/v1/chat/completions');
  assert.equal(providers.resolveProvider(env, 'codex').endpoint.href, 'https://api.openai.com/v1/chat/completions');
  assert.equal(providers.resolveProvider(env, 'claude').endpoint.href, 'https://api.anthropic.com/v1/messages');
  assert.equal(providers.resolveProvider(env).id, 'claude', 'operator default first');
  assert.equal(providers.resolveProvider({ ...env, AI_GROK_BASE_URL: 'http://insecure.example' }, 'grok'), null, 'plain http is refused');
  assert.equal(providers.resolveProvider({ ...env, AI_CLAUDE_BASE_URL: 'https://u:p@api.example/v1' }, 'claude'), null, 'credentials in the URL are refused');
  assert.equal(providers.resolveProvider({ AI_CLAUDE_API_KEY: 'c' }, 'grok'), null, 'a requested provider must be configured, never substituted');
  assert.equal(guide.validateAssistantRequest({ ...requestBody, provider: 'nope' }), null);
  assert.equal(guide.validateAssistantRequest({ ...requestBody, provider: 'claude' }).provider, 'claude');
});
test('Each provider receives its own request shape and the draft is labelled with the provider', async () => {
  const originalFetch = globalThis.fetch; const originalEnv = { ...globalThis.__daroubTestEnv }; globalThis.__daroubTestUser = { userId: 'provider-shapes' };
  Object.assign(globalThis.__daroubTestEnv, { AI_GROK_API_KEY: 'grok-key', AI_GROK_MODEL: 'grok-test', AI_OPENAI_API_KEY: 'openai-key', AI_OPENAI_MODEL: 'codex-test', AI_CLAUDE_API_KEY: 'claude-key' });
  const seen = [];
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body); seen.push({ url: url.href, headers: options.headers, body });
    if (url.hostname === 'api.anthropic.com') return Response.json({ content: [{ type: 'text', text: 'Claude wording.' }], stop_reason: 'end_turn' });
    return Response.json({ choices: [{ message: { content: url.hostname === 'api.x.ai' ? 'Grok wording.' : 'Codex wording.' } }] });
  };
  try {
    const grok = await (await route.POST(request({ ...requestBody, useAI: true, provider: 'grok' }))).json();
    assert.equal(grok.mode, 'ai'); assert.equal(grok.aiText, 'Grok wording.'); assert.deepEqual(grok.aiProvider, { id: 'grok', label: 'Grok' });
    const codex = await (await route.POST(request({ ...requestBody, useAI: true, provider: 'codex' }))).json();
    assert.equal(codex.aiText, 'Codex wording.'); assert.deepEqual(codex.aiProvider, { id: 'codex', label: 'Codex' });
    const claude = await (await route.POST(request({ ...requestBody, useAI: true, provider: 'claude' }))).json();
    assert.equal(claude.aiText, 'Claude wording.'); assert.deepEqual(claude.aiProvider, { id: 'claude', label: 'Claude' }); assert.equal(claude.text, guide.retrieveGuide(requestBody).text);
    assert.deepEqual(seen.map(s => s.url), ['https://api.x.ai/v1/chat/completions', 'https://api.openai.com/v1/chat/completions', 'https://api.anthropic.com/v1/messages']);
    assert.equal(seen[0].headers.Authorization, 'Bearer grok-key'); assert.equal(seen[0].body.model, 'grok-test'); assert.equal(seen[0].body.messages.length, 2);
    assert.equal(seen[1].headers.Authorization, 'Bearer openai-key'); assert.equal(seen[1].body.model, 'codex-test');
    assert.equal(seen[2].headers['x-api-key'], 'claude-key'); assert.equal(seen[2].headers['anthropic-version'], '2023-06-01'); assert.equal(seen[2].headers.Authorization, undefined);
    assert.equal(seen[2].body.model, 'claude-opus-5'); assert.equal(typeof seen[2].body.system, 'string'); assert.deepEqual(seen[2].body.messages.map(m => m.role), ['user']); assert.equal('temperature' in seen[2].body, false);
    assert.ok(seen[2].body.system.includes('GUIDE:'), 'guide text travels as the system text');
    globalThis.fetch = async () => Response.json({ content: [], stop_reason: 'refusal', stop_details: { type: 'refusal' } });
    const refused = await (await route.POST(request({ ...requestBody, useAI: true, provider: 'claude' }))).json();
    assert.equal(refused.mode, 'guide'); assert.equal(refused.fallbackReason, 'provider'); assert.equal(refused.aiText, undefined);
    let calls = 0; globalThis.fetch = async () => { calls++; return Response.json({}); };
    delete globalThis.__daroubTestEnv.AI_BASE_URL; // the legacy custom provider from earlier tests is now unconfigured
    const unconfigured = await (await route.POST(request({ ...requestBody, useAI: true, provider: 'custom' }))).json();
    assert.equal(unconfigured.fallbackReason, 'unconfigured'); assert.equal(calls, 0, 'an unconfigured choice never calls another provider');
    assert.equal((await route.POST(request({ ...requestBody, useAI: true, provider: 'nope' }))).status, 400);
    const listed = await (await route.GET()).json();
    assert.deepEqual(listed.providers.map(p => p.id), ['grok', 'codex', 'claude']); assert.equal(JSON.stringify(listed).includes('key'), false);
  } finally { globalThis.fetch = originalFetch; for (const k of Object.keys(globalThis.__daroubTestEnv)) delete globalThis.__daroubTestEnv[k]; Object.assign(globalThis.__daroubTestEnv, originalEnv); }
});
