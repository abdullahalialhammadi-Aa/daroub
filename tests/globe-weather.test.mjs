import test from 'node:test';
import assert from 'node:assert/strict';
import {createLoader} from './helpers/load-ts.mjs';
function load(file,mocks={}){return createLoader({'./site-shell':{useSite:()=>({locale:'en',t:key=>key,tr:values=>values[1]})},...mocks})(file)}
const {requestGlobeWeather,weatherAtPoint}=load('components/globe-weather.tsx'),{weatherCacheKey}=load('lib/explorer-weather.ts');
const now=Date.parse('2026-09-17T12:00:00Z'),key=weatherCacheKey('current',23.14,53.78,0),forecast=Array.from({length:7},(_,i)=>({date:`2026-09-${17+i}`,low:15+i,high:25+i,apparentLow:14+i,apparentHigh:26+i,wind:17,precipitation:i}));
const data=(minutes=0)=>({year:2025,months:[],timezone:'Asia/Dubai',fetchedAt:new Date(now-minutes*60000).toISOString(),current:{time:'2026-09-17T15:45',temperature_2m:0,apparent_temperature:null,wind_speed_10m:9,precipitation:0},forecast});
function fixture(saved){const states=[],requests=[],storage=new Map(saved===undefined?[]:[[key,JSON.stringify(saved)]]),abort=new AbortController();const args={lat:23.14,lon:53.78,signal:abort.signal,onState:state=>states.push(state),now:()=>now,online:()=>true,cache:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},fetcher:async(...args)=>{requests.push(args);return new Response(JSON.stringify(data()),{status:200})}};return {args,states,requests,storage,abort}}

test('recent valid current cache avoids an unnecessary network call',async()=>{const f=fixture(data(5));await requestGlobeWeather(f.args);assert.equal(f.requests.length,0);assert.equal(f.states.length,1);assert.equal(f.states[0].status,'cached');assert.equal(f.states[0].data.current.temperature_2m,0);assert.equal(f.states[0].data.current.apparent_temperature,null)});
test('expired cache refreshes current/forecast only and saves a validated response',async()=>{const f=fixture(data(11));await requestGlobeWeather(f.args);assert.deepEqual(f.states.map(state=>state.status),['refreshing','fresh']);assert.equal(f.requests.length,1);const url=new URL(f.requests[0][0],'https://example.test');assert.equal(url.searchParams.get('part'),'current');assert.equal(url.searchParams.get('lat'),'23.140');assert.equal(url.searchParams.get('lon'),'53.780');assert.doesNotMatch(url.href,/history|archive/);assert.equal(JSON.parse(f.storage.get(key)).forecast.length,7);assert.equal(JSON.parse(f.storage.get(key)).fetchedAt,data().fetchedAt)});
test('explicit refresh bypasses the cache but never requests historical weather',async()=>{const f=fixture(data(2));await requestGlobeWeather({...f.args,force:true});assert.equal(f.requests.length,1);assert.equal(f.requests[0][1].cache,'reload');assert.equal(f.states.at(-1).status,'fresh')});
test('manual refresh respects the fallback provider expiry rather than repeating its direct request',async()=>{const saved={...data(2),forecastSource:{provider:'met-norway',transport:'browser',fetchedAt:data(2).fetchedAt,expiresAt:new Date(now+20*60000).toISOString()}},f=fixture(saved);await requestGlobeWeather({...f.args,force:true});assert.equal(f.requests.length,0);assert.equal(f.states.at(-1).status,'cached')});
test('offline state is explicit with or without a saved copy and performs no fetch',async()=>{for(const saved of [data(2),undefined]){const f=fixture(saved);await requestGlobeWeather({...f.args,online:()=>false});assert.equal(f.requests.length,0);assert.equal(f.states.at(-1).status,saved?'stale':'unavailable');assert.equal(!!f.states.at(-1).data,!!saved)}});
test('failed refresh preserves cached values as stale, never inventing replacement readings',async()=>{const f=fixture(data(30));await requestGlobeWeather({...f.args,fetcher:async()=>new Response('unavailable',{status:502})});assert.equal(f.states.at(-1).status,'stale');assert.deepEqual(f.states.at(-1).data,data(30));const empty=fixture();await requestGlobeWeather({...empty.args,fetcher:async()=>{throw Error('network')}});assert.equal(empty.states.at(-1).status,'unavailable');assert.equal(empty.states.at(-1).data,null)});
test('corrupt and history-only payloads cannot become current readings',async()=>{for(const value of [{...data(),current:{time:'bad'}},{...data(),current:null,forecast:[]},{...data(),fetchedAt:'bad'}]){const f=fixture(value);await requestGlobeWeather({...f.args,fetcher:async()=>new Response(JSON.stringify(value),{status:200})});assert.equal(f.states.at(-1).status,'unavailable');assert.equal(f.states.at(-1).data,null)}});
test('a point change hides the previous reading before network effects run',()=>{const old={key,data:data(),status:'fresh'};assert.equal(weatherAtPoint(old,23.14,53.78).data.current.temperature_2m,0);assert.deepEqual(weatherAtPoint(old,40,5),{key:weatherCacheKey('current',40,5,0),data:null,status:'loading'});assert.equal(weatherAtPoint(old,NaN,5).status,'unavailable')});
test('aborted old-coordinate responses cannot publish or write cache even when transport ignores abort',async()=>{let resolve;const pending=new Promise(done=>{resolve=done}),f=fixture(),operation=requestGlobeWeather({...f.args,fetcher:()=>pending});assert.equal(f.states.at(-1).status,'loading');f.abort.abort();resolve(new Response(JSON.stringify(data()),{status:200}));await operation;assert.deepEqual(f.states.map(state=>state.status),['loading']);assert.equal(f.storage.size,0)});
test('abort during JSON decoding also blocks stale publication and cache writes',async()=>{let resolve;const pending=new Promise(done=>{resolve=done}),f=fixture(),operation=requestGlobeWeather({...f.args,fetcher:async()=>({ok:true,json:()=>pending})});await Promise.resolve();f.abort.abort();resolve(data());await operation;assert.equal(f.states.at(-1).status,'loading');assert.equal(f.storage.size,0)});
test('invalid coordinates fail without storage or network access',async()=>{for(const [lat,lon] of [[91,0],[0,-181],[Infinity,0],[0,NaN]]){const f=fixture();await requestGlobeWeather({...f.args,lat,lon,cache:{getItem:()=>{throw Error('should not read')},setItem:()=>{throw Error('should not write')}}});assert.equal(f.states.at(-1).status,'unavailable');assert.equal(f.requests.length,0)}});
test('storage restrictions do not discard valid network data',async()=>{const f=fixture();await requestGlobeWeather({...f.args,cache:{getItem:()=>{throw Error('blocked')},setItem:()=>{throw Error('blocked')}}});assert.equal(f.states.at(-1).status,'fresh');assert.equal(f.states.at(-1).data.forecast[0].precipitation,0)});

// Run the component's real effect callbacks with deterministic hook scheduling and browser events.
function componentHarness(){
 const slots=[],effects=[],requests=[],pending=[],storage=new Map([[key,JSON.stringify({...data(),fetchedAt:new Date().toISOString()})]]),saved=new Map();
 let cursor=0,dirty=true,tree,online=true;
 const document=new EventTarget();document.visibilityState='visible';
 const window=new EventTarget();window.setInterval=()=>0;
 const globals={document,window,navigator:{get onLine(){return online}},localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},fetch:(url,options)=>new Promise(resolve=>{requests.push({url,options});pending.push(resolve)})};
 for(const [name,value] of Object.entries(globals)){saved.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{value,configurable:true})}
 const hooks={
  useId:()=> 'weather',
  useState(initial){const index=cursor++;if(!(index in slots))slots[index]=typeof initial==='function'?initial():initial;return [slots[index],value=>{const next=typeof value==='function'?value(slots[index]):value;if(!Object.is(next,slots[index])){slots[index]=next;dirty=true}}]},
  useRef(initial){const index=cursor++;return slots[index]??(slots[index]={current:initial})},
  useEffect(effect,deps){const index=cursor++,previous=slots[index];if(!previous||deps.some((value,i)=>!Object.is(value,previous.deps[i]))){effects.push(()=>{previous?.cleanup?.();slots[index]={deps,cleanup:effect()}})}},
  useSyncExternalStore(_subscribe,getSnapshot){return getSnapshot()},
 };
 const {GlobeWeather}=load('components/globe-weather.tsx',{react:hooks});
 const render=()=>{cursor=0;dirty=false;tree=GlobeWeather({lat:23.14,lon:53.78});while(effects.length)effects.shift()()};
 const find=(node,predicate)=>{if(!node||typeof node!=='object')return null;if(predicate(node))return node;for(const child of [node.props?.children].flat(Infinity)){const found=find(child,predicate);if(found)return found}return null};
 return {requests,storage,pending,weather:()=>slots[0],async flush(){for(let i=0;i<6;i++){if(dirty)render();await new Promise(setImmediate)}},clickRefresh(){find(tree,node=>node.props?.className==='orb-weather-refresh').props.onClick()},network(value){online=value;dirty=true},passiveRefresh(){document.dispatchEvent(new Event('visibilitychange'))},close(){for(const slot of slots)slot?.cleanup?.();for(const [name,descriptor]of saved){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}}};
}

test('manual refresh survives offline/reconnect and ignores the aborted older response',async()=>{
 const h=componentHarness();try{
  await h.flush();assert.equal(h.requests.length,0);
  h.clickRefresh();await h.flush();assert.equal(h.requests.length,1);assert.equal(h.requests[0].options.cache,'reload');
  h.network(false);await h.flush();assert.equal(h.requests[0].options.signal.aborted,true);
  h.network(true);await h.flush();assert.equal(h.requests.length,2);assert.equal(h.requests[1].options.cache,'reload');
  const fresh={...data(),fetchedAt:new Date().toISOString(),current:{...data().current,temperature_2m:20}};
  h.pending[1](new Response(JSON.stringify(fresh)));await h.flush();
  h.pending[0](new Response(JSON.stringify({...fresh,current:{...fresh.current,temperature_2m:77}})));await h.flush();
  assert.equal(JSON.parse(h.storage.get(key)).current.temperature_2m,20);
  h.passiveRefresh();await h.flush();assert.equal(h.requests.length,2);
 }finally{h.close()}
});
test('a visibility refresh cannot cancel an in-flight explicit reload',async()=>{
 const h=componentHarness();try{
  await h.flush();h.clickRefresh();await h.flush();
  h.passiveRefresh();await h.flush();assert.equal(h.requests.length,1);assert.equal(h.requests[0].options.signal.aborted,false);
  h.pending[0](new Response(JSON.stringify({...data(),fetchedAt:new Date().toISOString()})));await h.flush();
  h.passiveRefresh();await h.flush();assert.equal(h.requests.length,1);
 }finally{h.close()}
});
test('a completed failed reload releases the manual intent for later passive cache checks',async()=>{
 const h=componentHarness();try{
  await h.flush();h.clickRefresh();await h.flush();
  h.pending[0](new Response('unavailable',{status:502}));await h.flush();assert.equal(h.weather().status,'stale');
  h.passiveRefresh();await h.flush();assert.equal(h.requests.length,1);assert.equal(h.weather().status,'cached');
 }finally{h.close()}
});
