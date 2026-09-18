import test from 'node:test';
import assert from 'node:assert/strict';
import {createLoader} from './helpers/load-ts.mjs';
const load=createLoader(),{normalizeMetWeather}=load('lib/weather-providers.ts'),{createWeatherService}=load('lib/weather-service.ts'),{fetchWeatherPart}=load('lib/weather-client.ts'),{usableForecast,isWeatherCache,weatherIsStale}=load('lib/explorer-weather.ts');
const now=Date.parse('2026-09-17T12:20:00Z');
function metRaw(){return {properties:{meta:{updated_at:'2026-09-17T10:00:00Z',units:{air_temperature:'celsius',wind_speed:'m/s',precipitation_amount:'mm'}},timeseries:Array.from({length:190},(_,index)=>({time:new Date(Date.parse('2026-09-17T12:00:00Z')+index*3600000).toISOString(),data:{instant:{details:{air_temperature:index%24,wind_speed:5}},next_1_hours:{details:{precipitation_amount:1}},next_6_hours:{details:{precipitation_amount:99}}}}))}};}
const openRaw=()=>({timezone:'Europe/Berlin',current:{time:'2026-09-17T14:15',temperature_2m:0,apparent_temperature:1,wind_speed_10m:2,precipitation:0},daily:{time:['2026-09-17'],temperature_2m_min:[0],temperature_2m_max:[12]}});
const metResponse=()=>Response.json(metRaw(),{headers:{Expires:new Date(now+1800000).toUTCString()}});

test('MET fallback converts wind, preserves zero, distinguishes forecast time and never invents apparent temperature',()=>{
 const data=normalizeMetWeather(metRaw(),now,'server',new Date(now+1800000).toUTCString());
 assert.equal(data.current.temperature_2m,0);assert.equal(data.current.wind_speed_10m,18);assert.equal(data.current.apparent_temperature,null);assert.equal(data.current.precipitation,1);assert.equal(data.timezone,'UTC');assert.equal(data.current.time,'2026-09-17T12:00:00.000Z');assert.equal(data.forecast.length,7);assert.equal(data.forecastSource.issuedAt,'2026-09-17T10:00:00.000Z');assert.equal(data.forecastSource.expiresAt,new Date(now+1800000).toISOString());assert.equal(isWeatherCache(data),true);
});
test('MET daily rain uses non-overlapping complete coverage; partial days and missing units stay unavailable',()=>{
 const data=normalizeMetWeather(metRaw(),now);assert.equal(data.forecast[0].precipitation,null);assert.equal(data.forecast[1].precipitation,24,'six-hour alternatives must not double count one-hour rain');
 const raw=metRaw();raw.properties.timeseries.splice(20,1);assert.equal(normalizeMetWeather(raw,now).forecast[1].precipitation,null);
 raw.properties.meta.units={air_temperature:'fahrenheit',wind_speed:'knots',precipitation_amount:'inch'};assert.equal(usableForecast(normalizeMetWeather(raw,now)),false);
});
test('old model issue time remains stale and an absent near-current point cannot masquerade as current',()=>{
 const raw=metRaw();raw.properties.meta.updated_at='2026-09-15T10:00:00Z';assert.equal(weatherIsStale(normalizeMetWeather(raw,now),now),true);
 raw.properties.timeseries=raw.properties.timeseries.slice(24);const data=normalizeMetWeather(raw,now);assert.equal(data.current,null);assert.equal(data.forecast.length,7);assert.ok(usableForecast(data));
});
test('server switches providers on upstream failure, identifies itself, caches to provider expiry and keeps historical calls separate',async()=>{
 const calls=[];let clock=now;
 const service=createWeatherService(async(url,options)=>{calls.push({url,options});return String(url).includes('api.met.no')?metResponse():Response.json({reason:'limit'},{status:429});},()=>clock);
 const first=await service.get(48.3,8.2,'current','https://daroub.test');assert.equal(first.data.forecastSource.provider,'met-norway');assert.equal(calls.length,2);assert.match(calls[1].options.headers['User-Agent'],/Daroub.*https:/);assert.ok(calls.every(call=>!call.url.includes('archive')));
 clock+=15*60000;const cached=await service.get(48.3,8.2,'current','https://daroub.test');assert.equal(calls.length,2);assert.equal(cached.data.fetchedAt,first.data.fetchedAt,'cache hits do not manufacture a new data timestamp');
});
test('all provider failures preserve the original valid copy as stale and back off across coordinates',async()=>{
 let clock=now,failed=false,calls=0;const service=createWeatherService(async()=>{calls++;return failed?new Response('down',{status:503}):Response.json(openRaw());},()=>clock);
 const original=(await service.get(1,2,'current','https://daroub.test')).data;failed=true;clock+=21*60000;
 const result=await service.get(1,2,'current','https://daroub.test');assert.equal(result.data.stale,true);assert.equal(result.data.current.temperature_2m,0);assert.equal(result.data.fetchedAt,original.fetchedAt);assert.equal(calls,3);
 assert.equal((await service.get(3,4,'current','https://daroub.test')).data,null);assert.equal(calls,3);
});
test('an explicit fallback-provider denial does not authorize browser retry around its limit',async()=>{
 const service=createWeatherService(async()=>new Response('blocked',{status:429}),()=>now),result=await service.get(0,0,'current','https://daroub.test');assert.equal(result.data,null);assert.equal(result.browserFallback,null);assert.equal(result.failures.length,2);
 let calls=0;await assert.rejects(()=>fetchWeatherPart(0,0,'current',new AbortController().signal,async()=>{calls++;return Response.json({error:'Weather unavailable',browserFallback:null},{status:502})},false,()=>now));assert.equal(calls,1);
});
test('browser fallback is credential-free and cacheable with correct source, and stale completion is rejected',async()=>{
 const calls=[];const fetcher=async(url,options)=>{calls.push({url,options});return calls.length===1?Response.json({browserFallback:'met-norway'},{status:502}):metResponse();};
 const data=await fetchWeatherPart(44.282,15.525,'current',new AbortController().signal,fetcher,false,()=>now);assert.equal(data.forecastSource.transport,'browser');assert.match(calls[1].url,/api\.met\.no/);assert.equal(calls[1].options.credentials,'omit');assert.equal(calls[1].options.headers,undefined);assert.equal(calls[1].options.mode,'cors');
 const abort=new AbortController();let resolve;const pending=new Promise(done=>{resolve=done});let request=0;const result=fetchWeatherPart(1,2,'current',abort.signal,async()=>++request===1?Response.json({browserFallback:'met-norway'},{status:502}):pending,false,()=>now);await new Promise(setImmediate);abort.abort();resolve(metResponse());await assert.rejects(result,{name:'AbortError'});
});
test('invalid API coordinates cause no provider requests, and all mode retains forecast when history fails',async()=>{
 const calls=[],data=normalizeMetWeather(metRaw(),now);const route=createLoader({'@/lib/weather-service':{createWeatherService:()=>({get:async(lat,lon,part)=>{calls.push(part);return {data:part==='current'?data:null,failures:[],browserFallback:null}}})}})('app/api/weather/route.ts');
 assert.equal((await route.GET(new Request('https://daroub.test/api/weather?lat=NaN&lon=3'))).status,400);assert.equal(calls.length,0);
 const response=await route.GET(new Request('https://daroub.test/api/weather?lat=44.282&lon=15.525'));assert.equal(response.status,200);const body=await response.json();assert.deepEqual(body.partial,['history']);assert.equal(body.forecast.length,7);assert.deepEqual(body.months,[]);
});
test('simultaneous identical requests share one upstream call',async()=>{
 let resolve,calls=0;const pending=new Promise(done=>{resolve=done}),service=createWeatherService(async()=>{calls++;await pending;return Response.json(openRaw())},()=>now);
 const a=service.get(4,5,'current','https://daroub.test'),b=service.get(4,5,'current','https://daroub.test');resolve();assert.equal((await a).data.current.temperature_2m,0);assert.equal((await b).data.current.temperature_2m,0);assert.equal(calls,1);
});
test('provider Retry-After is honored across selected points',async()=>{
 let clock=now,calls=0;const service=createWeatherService(async()=>{calls++;return new Response('limited',{status:429,headers:{'Retry-After':'3600'}})},()=>clock);
 await service.get(1,2,'current','https://daroub.test');clock+=10*60000;await service.get(3,4,'current','https://daroub.test');assert.equal(calls,2);clock+=60*60000;await service.get(3,4,'current','https://daroub.test');assert.equal(calls,4);
});
test('history can recover independently in the browser without requesting a forecast',async()=>{
 const calls=[];const data=await fetchWeatherPart(48.3,8.2,'history',new AbortController().signal,async(url,options)=>{calls.push({url,options});return calls.length===1?Response.json({browserFallback:'open-meteo'},{status:502}):Response.json({timezone:'Europe/Berlin',daily:{time:['2025-01-01'],temperature_2m_min:[0],temperature_2m_max:[10]}})},false,()=>now);
 assert.match(calls[1].url,/archive-api\.open-meteo\.com/);assert.equal(calls[1].options.credentials,'omit');assert.equal(data.historySource.transport,'browser');assert.deepEqual(data.months[0],{low:0,high:10,lowSamples:1,highSamples:1});assert.equal(data.current,null);assert.deepEqual(data.forecast,[]);
});
test('direct browser provider refusals persist across coordinates and forced refresh, honoring both Retry-After formats',async()=>{
 for(const [status,retry,wait]of [[401,null,120000],[403,null,120000],[429,'3600',3600000],[429,new Date(now+3600000).toUTCString(),3600000]]){
  const client=createLoader()('lib/weather-client.ts');let clock=now,direct=0,serverWorks=false;
  const fetcher=async url=>String(url).startsWith('/api/')?serverWorks?Response.json(normalizeMetWeather(metRaw(),clock)):Response.json({browserFallback:'met-norway'},{status:502}):(direct++,new Response('refused',{status,headers:retry?{'Retry-After':retry}:{}}));
  const attempt=lat=>client.fetchWeatherPart(lat,8.2,'current',new AbortController().signal,fetcher,true,()=>clock);
  await assert.rejects(()=>attempt(48.3));clock+=1000;await assert.rejects(()=>attempt(48.4));assert.equal(direct,1);
  serverWorks=true;assert.equal((await attempt(48.5)).forecastSource.provider,'met-norway','the blocked direct provider must not block working Daroub responses');serverWorks=false;
  clock=now+wait-1;await assert.rejects(()=>attempt(48.6));assert.equal(direct,1);clock=now+wait+1;await assert.rejects(()=>attempt(48.7));assert.equal(direct,2);
 }
});
test('invalid browser bodies, unusable payloads and network failures receive a bounded retry cooldown',async()=>{
 for(const failure of [()=>new Response('{'),()=>Response.json({properties:{}}),()=>{throw Error('network')}]){
  const client=createLoader()('lib/weather-client.ts');let clock=now,direct=0;
  const fetcher=async url=>String(url).startsWith('/api/')?Response.json({browserFallback:'met-norway'},{status:502}):(direct++,failure());
  const attempt=lat=>client.fetchWeatherPart(lat,0,'current',new AbortController().signal,fetcher,false,()=>clock);
  await assert.rejects(()=>attempt(1));await assert.rejects(()=>attempt(2));assert.equal(direct,1);clock+=30001;await assert.rejects(()=>attempt(3));assert.equal(direct,2);
 }
});
