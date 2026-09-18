import {isWeatherCache,type ExplorerWeatherResult} from './explorer-weather';
import {metForecastUrl,normalizeMetWeather,normalizeOpenWeather,openWeatherUrl,usableWeatherPart} from './weather-providers';

// Shared across both weather panels and coordinate changes in this browser module.
// A successful Daroub response remains usable while the direct provider cools down.
const directCooldown=new Map<string,number>();
function holdProvider(provider:string,now:number,status?:number,retryAfter?:string|null){
 const delay=status===401||status===403||status===429?120000:30000;
 let until=now+delay;
 if(retryAfter){const seconds=Number(retryAfter),requested=Number.isFinite(seconds)?now+Math.max(0,seconds)*1000:Date.parse(retryAfter);if(Number.isFinite(requested))until=Math.max(until,requested);}
 directCooldown.set(provider,Math.max(directCooldown.get(provider)??0,until));
}

/** Simple CORS is a last resort for server network failures. Provider 403/429
 * responses disable this path; no cookies or private headers leave Daroub. */
export async function fetchWeatherPart(lat:number,lon:number,part:'current'|'history',signal:AbortSignal,fetcher:typeof fetch=fetch,force=false,now:()=>number=Date.now):Promise<ExplorerWeatherResult>{
 let fallback:string|null=null;
 try{
  const response=await fetcher(`/api/weather?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}&part=${part}`,{signal:AbortSignal.any([signal,AbortSignal.timeout(17000)]),cache:force?'reload':'default'});
  const value:unknown=await response.json().catch(()=>null);
  if(response.ok&&isWeatherCache(value)&&usableWeatherPart(value,part)){if(signal.aborted)throw new DOMException('Aborted','AbortError');return value;}
  if(value&&typeof value==='object'&&'failures'in value&&Array.isArray(value.failures))for(const failure of value.failures){if(failure&&typeof failure==='object'&&['open-meteo','met-norway'].includes(failure.provider)&&[401,403,429].includes(failure.status))holdProvider(failure.provider,now(),failure.status);}
  if(value&&typeof value==='object'&&'browserFallback'in value)fallback=typeof value.browserFallback==='string'?value.browserFallback:null;
 }catch(error){if(signal.aborted)throw error;fallback=part==='current'?'met-norway':'open-meteo';}
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 if(fallback!==(part==='current'?'met-norway':'open-meteo'))throw Error('Weather unavailable');
 if((directCooldown.get(fallback)??0)>now())throw Error('Weather provider temporarily unavailable');
 const year=new Date(now()).getUTCFullYear()-1,url=part==='current'?metForecastUrl(lat,lon):openWeatherUrl(lat,lon,part,year);
 try{
  const response=await fetcher(url,{signal:AbortSignal.any([signal,AbortSignal.timeout(8000)]),credentials:'omit',mode:'cors',referrerPolicy:'origin'});
  if(!response.ok){holdProvider(fallback,now(),response.status,response.headers.get('retry-after'));await response.body?.cancel();throw Error('Weather unavailable');}
  const raw:unknown=await response.json(),data=part==='current'?normalizeMetWeather(raw,now(),'browser',response.headers.get('expires')):normalizeOpenWeather(raw,part,year,now(),'browser');
  if(signal.aborted)throw new DOMException('Aborted','AbortError');
  if(!isWeatherCache(data)||!usableWeatherPart(data,part))throw Error('Weather unavailable');
  return data;
 }catch(error){if(!signal.aborted)holdProvider(fallback,now());throw error;}
}
