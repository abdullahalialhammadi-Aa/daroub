import test from 'node:test';
import assert from 'node:assert/strict';
import {createLoader} from './helpers/load-ts.mjs';

const env={};
const load=createLoader({'cloudflare:workers':{env}});
const providers=load('lib/tile-providers.ts');
const route=load('app/api/tiles/route.ts');
const originalFetch=globalThis.fetch;
/** A fake upstream: records requests and answers Google, Mapbox and tile calls the way the real services do. */
function upstream(options={}){
  const calls=[];
  globalThis.fetch=async(input,init={})=>{
    const url=String(input);calls.push({url,init});
    if(url.startsWith('https://tile.googleapis.com/v1/createSession'))return options.googleBad?new Response('{"error":"bad key"}',{status:400}):Response.json({session:'sess-1',expiry:Math.floor(Date.now()/1000)+14*86400,tileWidth:512,tileHeight:512,imageFormat:'jpeg'});
    if(url.startsWith('https://api.mapbox.com/tokens/v2'))return Response.json({code:options.mapboxBad?'TokenInvalid':'TokenValid'});
    if(url.startsWith('https://tile.googleapis.com/tile/v1/viewport'))return Response.json({copyright:'Imagery ©2026 Maxar Technologies',maxZoomRects:[]});
    if(url.startsWith('https://tile.googleapis.com/v1/2dtiles/')||url.startsWith('https://api.mapbox.com/v4/mapbox.satellite/'))return options.tileFails?new Response('nope',{status:500}):new Response(new Uint8Array([255,216,255]),{headers:{'Content-Type':'image/jpeg'}});
    throw Error('unexpected '+url);
  };
  return calls;
}
function reset(values){for(const key of Object.keys(env))delete env[key];Object.assign(env,values);providers.resetTileProviderCache();}
const get=(path,headers={})=>route.GET(new Request('https://daroub.example'+path,{headers}));
test.after(()=>{globalThis.fetch=originalFetch;});

test('without keys nothing is listed and tile requests are refused',async()=>{
  reset({});const calls=upstream();
  assert.deepEqual(await (await get('/api/tiles')).json(),{providers:[]});
  assert.equal((await get('/api/tiles?provider=google&z=3&x=1&y=1')).status,404);
  assert.equal(calls.length,0,'no upstream call without a key');
});

test('a Google key creates one hi-DPI satellite session, lists the provider without secrets and proxies tiles',async()=>{
  reset({IMAGERY_GOOGLE_KEY:'AIzaTestKey_123'});const calls=upstream();
  const listing=await (await get('/api/tiles')).json();
  assert.deepEqual(listing,{providers:[{id:'google',label:'Google',maxZoom:21,credit:'Google'}]});
  assert.equal(calls.length,1);assert.equal(calls[0].init.method,'POST');
  assert.deepEqual(JSON.parse(calls[0].init.body),{mapType:'satellite',language:'en-US',region:'US',scale:'scaleFactor2x',highDpi:true});
  const tile=await get('/api/tiles?provider=google&z=12&x=2140&y=1416',{'sec-fetch-site':'same-origin'});
  assert.equal(tile.status,200);assert.equal(tile.headers.get('content-type'),'image/jpeg');assert.match(tile.headers.get('cache-control'),/private/);
  assert.equal(calls.length,2,'the session is cached, not recreated per tile');
  assert.equal(calls[1].url,'https://tile.googleapis.com/v1/2dtiles/12/2140/1416?session=sess-1&key=AIzaTestKey_123');
  assert.ok(!JSON.stringify(listing).includes('AIzaTestKey'),'the key never reaches the client');
});

test('attribution for the visible area comes from the viewport endpoint and is validated',async()=>{
  reset({IMAGERY_GOOGLE_KEY:'AIzaTestKey_123'});const calls=upstream();
  const bad=await get('/api/tiles?provider=google&attribution=1&zoom=12&north=95&south=1&east=2&west=1');
  assert.equal(bad.status,400);
  const ok=await get('/api/tiles?provider=google&attribution=1&zoom=12&north=48.4&south=48.2&east=8.3&west=8.1');
  assert.deepEqual(await ok.json(),{copyright:'Imagery ©2026 Maxar Technologies'});
  assert.match(calls.at(-1).url,/^https:\/\/tile\.googleapis\.com\/tile\/v1\/viewport\?session=sess-1&key=AIzaTestKey_123&zoom=12&north=48\.4&south=48\.2&east=8\.3&west=8\.1$/);
});

test('an invalid Google key is not listed and is retried only after a pause; Mapbox tokens are checked too',async()=>{
  reset({IMAGERY_GOOGLE_KEY:'AIzaBroken',IMAGERY_MAPBOX_TOKEN:'pk.abc.def',IMAGERY_DEFAULT:'mapbox'});const calls=upstream({googleBad:true});
  assert.deepEqual(await (await get('/api/tiles')).json(),{providers:[{id:'mapbox',label:'Mapbox',maxZoom:19,credit:'© Mapbox © Maxar'}]});
  assert.equal((await get('/api/tiles?provider=google&z=3&x=1&y=1')).status,503);
  assert.equal(calls.filter(c=>c.url.includes('createSession')).length,1,'a failed session is remembered briefly');
  const tile=await get('/api/tiles?provider=mapbox&z=12&x=2140&y=1416');
  assert.equal(tile.status,200);
  assert.equal(calls.at(-1).url,'https://api.mapbox.com/v4/mapbox.satellite/12/2140/1416@2x.jpg90?access_token=pk.abc.def');
  reset({IMAGERY_MAPBOX_TOKEN:'pk.bad'});upstream({mapboxBad:true});
  assert.deepEqual(await (await get('/api/tiles')).json(),{providers:[]});
});

test('bad tiles, cross-site callers and upstream failures never leak anything',async()=>{
  reset({IMAGERY_GOOGLE_KEY:'AIzaTestKey_123'});upstream();
  for(const q of ['z=25&x=0&y=0','z=3&x=8&y=0','z=3&x=-1&y=0','z=3.5&x=1&y=1','z=a&x=1&y=1'])assert.equal((await get('/api/tiles?provider=google&'+q)).status,400,q);
  assert.equal((await get('/api/tiles?provider=google&z=3&x=1&y=1',{'sec-fetch-site':'cross-site'})).status,403);
  assert.equal((await get('/api/tiles?provider=google&z=3&x=1&y=1',{referer:'https://evil.example/page'})).status,403);
  assert.equal((await get('/api/tiles?provider=google&z=3&x=1&y=1',{referer:'https://daroub.example/'})).status,200);
  reset({IMAGERY_GOOGLE_KEY:'AIzaTestKey_123'});upstream({tileFails:true});
  const failed=await get('/api/tiles?provider=google&z=3&x=1&y=1');
  assert.equal(failed.status,502);assert.ok(!(await failed.text()).includes('AIza'));
});

test('tile validation and upstream URL builders are exact',()=>{
  assert.equal(providers.validTile(0,0,0,21),true);assert.equal(providers.validTile(21,2**21-1,0,21),true);assert.equal(providers.validTile(22,0,0,21),false);assert.equal(providers.validTile(2,4,0,21),false);
  assert.equal(providers.parseView(new URLSearchParams('zoom=5&north=10&south=20&east=1&west=0')),null,'south above north is rejected');
  assert.deepEqual(providers.parseView(new URLSearchParams('zoom=5&north=20&south=10&east=1&west=0')),{zoom:5,north:20,south:10,east:1,west:0});
  assert.deepEqual(providers.configuredTileProviders({IMAGERY_GOOGLE_KEY:'ok',IMAGERY_MAPBOX_TOKEN:'pk.x',IMAGERY_DEFAULT:'mapbox'}),['mapbox','google']);
  assert.deepEqual(providers.configuredTileProviders({IMAGERY_GOOGLE_KEY:'has space',IMAGERY_MAPBOX_TOKEN:''}),[]);
  assert.deepEqual(providers.configuredTileProviders({IMAGERY_GOOGLE_KEY:'AIzaPasted_key\r\n',IMAGERY_DEFAULT:'google\r'}),['google'],'a key saved with Windows line endings still counts');
});
