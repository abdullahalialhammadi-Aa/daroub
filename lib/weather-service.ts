import {isWeatherCache,weatherFreshUntil,type ExplorerWeatherResult} from './explorer-weather';
import {metForecastUrl,normalizeMetWeather,normalizeOpenWeather,openWeatherUrl,usableWeatherPart,weatherUserAgent} from './weather-providers';

type Part='current'|'history';
type Failure={provider:string;reason:'rate-limit'|'denied'|'upstream'|'network'|'invalid';status?:number};
export type WeatherPartResult={data:ExplorerWeatherResult|null;failures:Failure[];browserFallback:'met-norway'|'open-meteo'|null};
/** Public coordinate-only weather cache: no cookies, account state or private API responses. */
export function createWeatherService(fetcher:typeof fetch=fetch,clock:()=>number=Date.now){
 const memory=new Map<string,ExplorerWeatherResult>(),pending=new Map<string,Promise<WeatherPartResult>>(),cooldown=new Map<string,{until:number;failure:Failure}>();
 const edge=()=> (globalThis as unknown as {caches?:{default?:Cache}}).caches?.default;
 async function run(lat:number,lon:number,part:Part,origin:string):Promise<WeatherPartResult>{
  const now=clock(),year=new Date(now).getUTCFullYear()-1,key=`${part}:${lat.toFixed(3)}:${lon.toFixed(3)}:${year}`,cacheUrl=`${origin}/__daroub-public-weather-v3/${key}`;
  let saved=memory.get(key)??null;
  if(!saved)try{const response=await edge()?.match(cacheUrl);const value:unknown=response?await response.json():null;if(isWeatherCache(value)&&usableWeatherPart(value,part))saved=value;}catch{}
  if(saved&&Date.parse(saved.fetchedAt)<=now+60000&&weatherFreshUntil(saved,part)>now&&!saved.stale)return {data:saved,failures:[],browserFallback:null};
  const failures:Failure[]=[];
  const providers=part==='current'?['open-meteo','met-norway']:['open-meteo'];
  for(const provider of providers){
   const lane=provider+':'+part,blocked=cooldown.get(lane);if(blocked&&blocked.until>now){failures.push(blocked.failure);continue;}
   let failure:Failure,retryAfterUntil=0;
   try{
    const url=provider==='met-norway'?metForecastUrl(lat,lon):openWeatherUrl(lat,lon,part,year);
    const response=await fetcher(url,{signal:AbortSignal.timeout(part==='history'?12000:6500),headers:provider==='met-norway'?{'User-Agent':weatherUserAgent}:undefined});
    if(!response.ok){failure={provider,status:response.status,reason:response.status===429?'rate-limit':response.status===403?'denied':'upstream'};const retry=response.headers.get('retry-after');if(retry){const seconds=Number(retry);retryAfterUntil=Number.isFinite(seconds)?now+Math.max(0,seconds)*1000:Date.parse(retry);if(!Number.isFinite(retryAfterUntil))retryAfterUntil=0;}await response.body?.cancel();}
    else{
     const raw:unknown=await response.json(),data=provider==='met-norway'?normalizeMetWeather(raw,clock(),'server',response.headers.get('expires')):normalizeOpenWeather(raw,part,year,clock(),'server');
     if(usableWeatherPart(data,part)){
      memory.delete(key);memory.set(key,data);if(memory.size>100)memory.delete(memory.keys().next().value!);
      try{await edge()?.put(cacheUrl,Response.json(data,{headers:{'Cache-Control':'public, max-age=86400'}}));}catch{}
      return {data,failures,browserFallback:null};
     }
     failure={provider,reason:'invalid'};
    }
   }catch{failure={provider,reason:'network'};}
   failures.push(failure);
   // Back off across locations so changing selected points cannot hammer a blocked IP.
   if(failure.reason!=='invalid'&&failure.status!==400)cooldown.set(lane,{until:Math.max(retryAfterUntil,now+(failure.reason==='rate-limit'||failure.reason==='denied'?120000:30000)),failure});
  }
  const target=part==='current'?'met-norway':'open-meteo',blocked=failures.some(failure=>failure.provider===target&&(failure.reason==='rate-limit'||failure.reason==='denied'));
  const retained=saved&&now-Date.parse(saved.fetchedAt)<(part==='history'?366*86400000:86400000)&&Date.parse(saved.fetchedAt)<=now+60000?{...saved,stale:true}:null;
  return {data:retained,failures,browserFallback:blocked?null:target};
 }
 return {get(lat:number,lon:number,part:Part,origin:string){const key=`${origin}:${part}:${lat.toFixed(3)}:${lon.toFixed(3)}`;const existing=pending.get(key);if(existing)return existing;const operation=run(lat,lon,part,origin).finally(()=>pending.delete(key));pending.set(key,operation);return operation;}};
}
