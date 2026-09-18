'use client';
import {useEffect,useId,useRef,useState,useSyncExternalStore} from 'react';
import {ArrowDown,ArrowUp,Droplets,RefreshCw,Thermometer,Wind} from 'lucide-react';
import {explorerCopy} from '@/lib/explorer-copy';
import {usableForecast,weatherCacheKey,weatherFreshUntil,weatherIsStale,type ExplorerWeatherResult} from '@/lib/explorer-weather';
import {fetchWeatherPart} from '@/lib/weather-client';
import {weatherCopy} from '@/lib/weather-copy';
import {useSite} from './site-shell';

type WeatherStatus='loading'|'cached'|'fresh'|'refreshing'|'stale'|'unavailable';
export type GlobeWeatherState={key:string;data:ExplorerWeatherResult|null;status:WeatherStatus};
type WeatherRequest={lat:number;lon:number;signal:AbortSignal;onState:(state:GlobeWeatherState)=>void;force?:boolean;cache?:Pick<Storage,'getItem'|'setItem'>;fetcher?:typeof fetch;now?:()=>number;online?:()=>boolean};
type WeatherRequestOutcome='aborted'|'invalid'|'offline'|'cached'|'settled';
const cacheLifetime=10*60*1000;
const validPoint=(lat:number,lon:number)=>Number.isFinite(lat)&&Math.abs(lat)<=90&&Number.isFinite(lon)&&Math.abs(lon)<=180;
const pointKey=(lat:number,lon:number)=>validPoint(lat,lon)?weatherCacheKey('current',lat,lon,0):'invalid';
const usableWeather=usableForecast;

/** Public weather reuses the existing coordinate cache; archive data is never requested here. */
export async function requestGlobeWeather({lat,lon,signal,onState,force=false,cache,fetcher=fetch,now=Date.now,online=()=>navigator.onLine}:WeatherRequest):Promise<WeatherRequestOutcome>{
 const key=pointKey(lat,lon),publish=(data:ExplorerWeatherResult|null,status:WeatherStatus)=>{if(!signal.aborted)onState({key,data,status})};
 if(signal.aborted)return 'aborted';
 if(!validPoint(lat,lon)){publish(null,'unavailable');return 'invalid'}
 let saved:ExplorerWeatherResult|null=null;
 try{const value:unknown=JSON.parse((cache??localStorage).getItem(key)??'null');if(usableWeather(value))saved=value}catch{}
 if(!online()){publish(saved,saved?'stale':'unavailable');return 'offline'}
 const age=saved?now()-Date.parse(saved.fetchedAt):Infinity;
 if(saved&&!saved.stale&&(!force||saved.forecastSource?.provider==='met-norway')&&age>=0&&now()<weatherFreshUntil(saved)){publish(saved,'cached');return 'cached'}
 publish(saved,saved?'refreshing':'loading');
 try{
  const value=await fetchWeatherPart(lat,lon,'current',signal,fetcher,force,now);
  if(signal.aborted)return 'aborted';
  try{(cache??localStorage).setItem(key,JSON.stringify(value))}catch{}
  publish(value,value.stale?'stale':'fresh');
 }catch{if(signal.aborted)return 'aborted';publish(saved,saved?'stale':'unavailable')}
 return 'settled';
}

/** The render guard applies before effects run, so a newly selected point cannot show an old reading. */
export function weatherAtPoint(state:GlobeWeatherState,lat:number,lon:number):GlobeWeatherState{
 const key=pointKey(lat,lon);return state.key===key?state:{key,data:null,status:validPoint(lat,lon)?'loading':'unavailable'};
}
function subscribeNetwork(notify:()=>void){window.addEventListener('online',notify);window.addEventListener('offline',notify);return()=>{window.removeEventListener('online',notify);window.removeEventListener('offline',notify)}}

export function GlobeWeather({lat,lon}:{lat:number;lon:number}){
 const {locale,t,tr}=useSite(),id=useId(),text=(key:string)=>tr(explorerCopy[key]),key=pointKey(lat,lon);
 const [state,setState]=useState<GlobeWeatherState>({key:'',data:null,status:'loading'}),[request,setRequest]=useState({sequence:0,force:false,key:''}),[clock,setClock]=useState(Date.now),[selection,setSelection]=useState<{key:string;date:string}|null>(null),forced=useRef('');
 const offline=useSyncExternalStore(subscribeNetwork,()=>!navigator.onLine,()=>false);
 useEffect(()=>{
  const abort=new AbortController();
  // Hydration reads browser storage asynchronously; cleanup also guards providers that ignore abort.
  queueMicrotask(()=>{
   if(abort.signal.aborted)return;
   const token=request.sequence+':'+key,force=request.force&&request.key===key&&forced.current!==token;
   void requestGlobeWeather({lat,lon,signal:abort.signal,force,onState:setState}).then(outcome=>{
    // A cancelled or offline attempt has not fulfilled the user's refresh request.
    if(force&&outcome==='settled'&&!abort.signal.aborted)forced.current=token;
   });
  });
  return()=>abort.abort();
 },[key,lat,lon,request,offline]);
 useEffect(()=>{
  const refreshIfVisible=()=>{setClock(Date.now());if(document.visibilityState==='visible'&&navigator.onLine)setRequest(value=>{
   // Passive refresh must not replace an explicit reload still waiting for the network.
   if(value.force&&value.key===key&&forced.current!==value.sequence+':'+key)return value;
   return {sequence:value.sequence+1,force:false,key:''};
  })};
  const freshness=window.setInterval(()=>setClock(Date.now()),60000),refresh=window.setInterval(refreshIfVisible,cacheLifetime);
  document.addEventListener('visibilitychange',refreshIfVisible);
  return()=>{clearInterval(freshness);clearInterval(refresh);document.removeEventListener('visibilitychange',refreshIfVisible)};
 },[key]);
 const current=weatherAtPoint(state,lat,lon),data=current.data,days=data?.forecast??[],selected=days.find(day=>selection?.key===key&&day.date===selection.date)??days[0];
 const number=(value:number|null|undefined)=>typeof value==='number'&&Number.isFinite(value)?new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(value):'—';
 const date=(value:string,full=false)=>new Intl.DateTimeFormat(locale,{weekday:full?'long':'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
 const old=!!data&&weatherIsStale(data,clock),stale=!!data&&(offline||old||current.status==='stale'),pending=current.status==='loading'||current.status==='refreshing',met=data?.forecastSource?.provider==='met-norway',wx=(key:string)=>tr(weatherCopy[key]);
 const savedLabel=tr(['نسخة طقس محفوظة','Saved weather copy','Copie météo enregistrée','已保存的天气副本','सहेजी गई मौसम प्रति']);
 const selectDay=(value:string)=>setSelection({key,date:value});
 return <section className="orb-weather" aria-labelledby={id+'-title'} dir={locale==='ar'?'rtl':'ltr'}>
  <header className="orb-weather-head"><h3 id={id+'-title'}><Thermometer size={18} aria-hidden="true"/>{t('weather')}</h3><button className="orb-weather-refresh" type="button" aria-label={text('refresh')} disabled={offline||pending||!validPoint(lat,lon)} onClick={()=>setRequest(value=>({sequence:value.sequence+1,force:true,key}))}><RefreshCw size={17} aria-hidden="true"/></button></header>
  <div className="orb-weather-status" role="status" aria-live="polite" aria-atomic="true">{offline&&<p>{text('offline')}</p>}{stale?<p>{text('stale')}</p>:current.status==='cached'?<p>{savedLabel}</p>:current.status==='refreshing'?<p>{text('cached')}</p>:current.status==='loading'?<p>{t('load')}</p>:null}{current.status==='unavailable'&&<p>{validPoint(lat,lon)?wx('missing'):text('invalid')}</p>}</div>
  {data&&<>
   <div className="orb-weather-now"><div><span>{met?wx('model'):t('current')}</span><strong className="orb-weather-temperature" dir="ltr">{number(data.current?.temperature_2m)}<small> °C</small></strong></div><div className="orb-weather-position"><span>{t('location')}</span><bdi>{lat.toFixed(3)}, {lon.toFixed(3)}</bdi></div></div>
   {data.current?<><dl className="orb-weather-readings"><div><dt>{text('feels')}</dt><dd dir="ltr">{number(data.current.apparent_temperature)} °C</dd></div><div><dt><Wind size={15} aria-hidden="true"/>{text('wind')}</dt><dd dir="ltr">{number(data.current.wind_speed_10m)} km/h</dd></div><div><dt><Droplets size={15} aria-hidden="true"/>{met?wx('nextHour'):text('rain')}</dt><dd dir="ltr">{number(data.current.precipitation)} mm</dd></div></dl>{data.current.time&&<p className="orb-weather-observed"><time dateTime={data.current.time} dir="ltr">{data.current.time.replace('T',' ')}{data.timezone&&' · '+data.timezone}</time></p>}</>:<p className="orb-weather-note">{t('current')} · {t('unavailable')}</p>}
   <p className="orb-weather-timestamp">{text('updated')}: <time dateTime={data.fetchedAt}>{new Intl.DateTimeFormat(locale,{dateStyle:'short',timeStyle:'short'}).format(new Date(data.fetchedAt))}</time></p>
   <h4 className="orb-weather-forecast-title">{text('forecast')}</h4>
   {days.length?<><div className="orb-weather-days" role="group" aria-label={text('forecast')}>{days.map((day,index)=><button className="orb-weather-day" key={day.date} type="button" aria-pressed={selected?.date===day.date} aria-controls={id+'-forecast'} aria-label={`${date(day.date,true)} · ${t('low')}: ${number(day.low)} °C · ${t('high')}: ${number(day.high)} °C`} onClick={()=>selectDay(day.date)} onKeyDown={event=>{const direction=locale==='ar'?-1:1,next=event.key==='Home'?0:event.key==='End'?days.length-1:event.key==='ArrowRight'?(index+direction+days.length)%days.length:event.key==='ArrowLeft'?(index-direction+days.length)%days.length:-1;if(next<0)return;event.preventDefault();selectDay(days[next].date);const buttons=event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button');buttons?.[next]?.focus()}}><time dateTime={day.date}>{date(day.date)}</time><span dir="ltr"><ArrowDown size={12} aria-hidden="true"/>{number(day.low)}° <ArrowUp size={12} aria-hidden="true"/>{number(day.high)}°</span></button>)}</div>{selected&&<div className="orb-weather-detail" id={id+'-forecast'} aria-live="polite" aria-atomic="true"><h4><time dateTime={selected.date}>{date(selected.date,true)}</time></h4><dl><div><dt>{t('low')} / {t('high')}</dt><dd dir="ltr">{number(selected.low)} / {number(selected.high)} °C</dd></div><div><dt>{text('feels')} · {t('low')} / {t('high')}</dt><dd dir="ltr">{number(selected.apparentLow)} / {number(selected.apparentHigh)} °C</dd></div><div><dt>{text('windMax')}</dt><dd dir="ltr">{number(selected.wind)} km/h</dd></div><div><dt>{text('rainTotal')}</dt><dd dir="ltr">{number(selected.precipitation)} mm</dd></div></dl></div>}</>:<p className="orb-weather-note" role="status">{t('unavailable')}</p>}
   <p className="orb-weather-note">{met?wx('metNote'):text('forecastNote')}</p>
   {data.forecastSource?.issuedAt&&<p className="orb-weather-timestamp">{wx('issued')}: <time dateTime={data.forecastSource.issuedAt}>{new Intl.DateTimeFormat(locale,{dateStyle:'short',timeStyle:'short'}).format(new Date(data.forecastSource.issuedAt))}</time></p>}
   {data.forecastSource?.transport==='browser'&&<p className="orb-weather-note">{wx('browser')}</p>}
   <a className="orb-weather-source" href={met?'https://api.met.no/weatherapi/locationforecast/2.0/documentation':'https://open-meteo.com/'} target="_blank" rel="noreferrer">{met?'MET Norway':'Open-Meteo'} ↗</a>{' · '}<a className="orb-weather-source" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0 ↗</a>
  </>}
 </section>;
}
