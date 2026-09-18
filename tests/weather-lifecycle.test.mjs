import test from 'node:test';
import assert from 'node:assert/strict';
import {createLoader} from './helpers/load-ts.mjs';

function harness(){
 const effects=[],states=[],timers=new Map(),saved=new Map();let online=true,sequence=0,requests=0;
 const document=new EventTarget();document.visibilityState='visible';
 const window=new EventTarget();window.setInterval=(callback,delay)=>{const id=++sequence;timers.set(id,{callback,delay});return id;};
 const globals={document,window,navigator:{get onLine(){return online}},localStorage:{getItem:()=>null,setItem(){}},clearInterval:id=>timers.delete(id)};
 for(const [name,value]of Object.entries(globals)){saved.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{value,configurable:true});}
 const hooks={useId:()=>'weather',useEffect:effect=>effects.push(effect),useSyncExternalStore:()=>false,useState(initial){const index=states.length;states.push(typeof initial==='function'?initial():initial);return [states[index],value=>{states[index]=typeof value==='function'?value(states[index]):value}];}};
 const load=createLoader({react:hooks,'./explorer.css':{},'@/components/ui/table':Object.fromEntries(['Table','TableBody','TableCell','TableHead','TableHeader','TableRow'].map(key=>[key,'div'])),'./site-shell':{useSite:()=>({locale:'en',t:key=>key,tr:values=>values[1]})},'@/lib/weather-client':{fetchWeatherPart:async(_lat,_lon,part)=>{requests++;return {year:2025,months:[],current:null,forecast:[],timezone:'UTC',fetchedAt:new Date().toISOString(),[part==='current'?'forecastSource':'historySource']:{provider:'open-meteo',transport:'server',fetchedAt:new Date().toISOString()}};}}});
 load('components/weather.tsx').Weather({lat:48.3,lon:8.2});
 const cleanups=[];
 return {states,timers,document,window,get requests(){return requests},network:value=>{online=value},start(){for(const effect of effects)cleanups.push(effect());},tick(delay){for(const timer of timers.values())if(timer.delay===delay)timer.callback();},async flush(){await new Promise(setImmediate)},close(){for(const cleanup of cleanups)cleanup?.();for(const [name,descriptor]of saved){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}}};
}
test('full weather polling pauses while hidden/offline and resumes on visibility or reconnection',async()=>{
 const h=harness();try{
  h.start();await h.flush();assert.equal(h.requests,2);const retry=h.states[0];
  h.document.visibilityState='hidden';h.tick(600000);assert.equal(h.states[0],retry);h.window.dispatchEvent(new Event('online'));assert.equal(h.states[0],retry);
  h.document.visibilityState='visible';h.document.dispatchEvent(new Event('visibilitychange'));assert.equal(h.states[0],retry+1);
  h.network(false);h.tick(600000);assert.equal(h.states[0],retry+1);h.network(true);h.window.dispatchEvent(new Event('online'));assert.equal(h.states[0],retry+2);
  assert.ok([...h.timers.values()].some(timer=>timer.delay<=60000),'freshness updates independently of the ten-minute fetch timer');
 }finally{h.close();assert.equal(h.timers.size,0);}
});
test('a new response updates the full weather clock immediately, avoiding a false future/stale label',async()=>{
 const h=harness();try{
  h.states[1]=Date.now()-180000;h.start();await h.flush();
  const data=h.states[2].data,{weatherIsStale}=createLoader()('lib/explorer-weather.ts');assert.ok(data);assert.equal(weatherIsStale(data,h.states[1]),false);assert.ok(Date.now()-h.states[1]<1000);
  h.states[1]=Date.now()-180000;h.tick(60000);assert.ok(Date.now()-h.states[1]<1000);
 }finally{h.close();}
});
