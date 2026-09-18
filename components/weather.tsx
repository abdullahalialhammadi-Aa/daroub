"use client";
import {useEffect, useId, useState, useSyncExternalStore} from 'react';
import {Thermometer, RefreshCw} from 'lucide-react';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from '@/components/ui/table';
import {explorerCopy} from '@/lib/explorer-copy';
import {isWeatherCache, seasonMean, weatherCacheKey,weatherFreshUntil,weatherIsStale} from '@/lib/explorer-weather';
import {fetchWeatherPart} from '@/lib/weather-client';
import {usableWeatherPart} from '@/lib/weather-providers';
import {weatherCopy} from '@/lib/weather-copy';
import type {ExplorerWeatherResult} from '@/lib/explorer-weather';
import {useSite} from './site-shell';
import './explorer.css';

type WeatherState = {key?:string;data: ExplorerWeatherResult | null; status: 'loading' | 'fresh' | 'refreshing' | 'stale' | 'unavailable'};
function subscribeNetwork(notify:()=>void) {window.addEventListener('online',notify);window.addEventListener('offline',notify);return()=>{window.removeEventListener('online',notify);window.removeEventListener('offline',notify)};}
function useWeatherPart(lat: number, lon: number, part: 'current' | 'history', retry: number,updateClock:(time:number)=>void) {
  const [state, setState] = useState<WeatherState>({data:null,status:'loading'});
  useEffect(() => {
    const abort = new AbortController(), year = new Date().getUTCFullYear() - 1;
    const key = weatherCacheKey(part, lat, lon, year);
    let cached: ExplorerWeatherResult | null = null;
    try { const value: unknown = JSON.parse(localStorage.getItem(key) || 'null'); if (isWeatherCache(value)&&usableWeatherPart(value,part)) cached = value; } catch {}
    // Synchronize the external device cache for the newly requested coordinates before the network response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({key,data: cached, status: cached ? 'refreshing' : 'loading'});
    const update=async()=>{
      updateClock(Date.now());
      if(!navigator.onLine){if(!abort.signal.aborted)setState({key,data:cached,status:cached?'stale':'unavailable'});return;}
      if(cached&&!cached.stale&&Date.parse(cached.fetchedAt)<=Date.now()&&weatherFreshUntil(cached,part)>Date.now()&&(part==='history'||retry===0||cached.forecastSource?.provider==='met-norway')){if(!abort.signal.aborted)setState({key,data:cached,status:'fresh'});return;}
      try{const data=await fetchWeatherPart(lat,lon,part,abort.signal,fetch,retry>0);if(abort.signal.aborted)return;updateClock(Date.now());setState({key,data,status:data.stale?'stale':'fresh'});try{localStorage.setItem(key,JSON.stringify(data));}catch{}}
      catch{if(!abort.signal.aborted)setState({key,data:cached,status:cached?'stale':'unavailable'});}
    };
    void update();
    return () => abort.abort();
  }, [lat, lon, part, retry,updateClock]);
  return state.key===weatherCacheKey(part,lat,lon,new Date().getUTCFullYear()-1)?state:{data:null,status:'loading'} as WeatherState;
}
export function Weather({lat,lon}:{lat:number;lon:number}) {
  const {locale,t,tr}=useSite(), titleId=useId();
  const text=(key:string)=>tr(explorerCopy[key]);
  const [retry,setRetry]=useState(0), [clock,setClock]=useState(Date.now);
  const offline=useSyncExternalStore(subscribeNetwork,()=>!navigator.onLine,()=>false);
  const current=useWeatherPart(lat,lon,'current',retry,setClock), history=useWeatherPart(lat,lon,'history',retry,setClock);
  useEffect(()=>{
    const refresh=()=>{setClock(Date.now());if(document.visibilityState==='visible'&&navigator.onLine)setRetry(value=>value+1);};
    window.addEventListener('online',refresh);
    document.addEventListener('visibilitychange',refresh);
    const timer=window.setInterval(refresh,600000),freshness=window.setInterval(()=>setClock(Date.now()),60000);
    return()=>{clearInterval(timer);clearInterval(freshness);window.removeEventListener('online',refresh);document.removeEventListener('visibilitychange',refresh);};
  },[]);
  const number=(value:number|null|undefined)=>typeof value==='number'&&Number.isFinite(value)?new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(value):'—';
  const updated=(date:string)=>new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(new Date(date));
  const currentOld=current.data && weatherIsStale(current.data,clock),wx=(key:string)=>tr(weatherCopy[key]);
  const status=(state:WeatherState, old=false)=> <>
    {(state.status==='refreshing'||state.status==='stale'||old)&&<p className="weather-cache-note" role="status">{text(state.status==='refreshing'&&!old?'cached':'stale')}</p>}
    {state.status==='loading'&&<p role="status">{t('load')}</p>}
    {state.status==='unavailable'&&<p role="status">{wx('missing')}</p>}
    {state.data&&<p className="weather-updated">{text('updated')}: <time dateTime={state.data.fetchedAt}>{updated(state.data.fetchedAt)}</time></p>}
  </>;
  const data=current.data, climate=history.data,met=data?.forecastSource?.provider==='met-norway';
  return <section className="panel weather-panel" aria-labelledby={titleId}>
    <div className="panel-title"><Thermometer size={22}/><h2 id={titleId}>{t('weather')}</h2><button className="icon-button weather-refresh" type="button" aria-label={text('refresh')} disabled={offline} onClick={()=>setRetry(value=>value+1)}><RefreshCw size={19}/></button></div>
    {offline&&<p role="status" className="weather-cache-note">{text('offline')}</p>}
    {status(current,!!currentOld)}
    {data&&<>
      <div className="weather-now"><div><small>{met?wx('model'):t('current')} · °C</small><strong dir="ltr">{number(data.current?.temperature_2m)}°</strong></div><div className="weather-meta"><span>{t('location')}</span><b dir="ltr">{lat.toFixed(3)}, {lon.toFixed(3)}</b>{data.current?.time&&<time dir="ltr">{data.current.time.replace('T',' ')} · {data.timezone}</time>}</div></div>
      <div className="weather-reading-grid"><div><span>{text('feels')}</span><strong dir="ltr">{number(data.current?.apparent_temperature)} °C</strong></div><div><span>{text('wind')}</span><strong dir="ltr">{number(data.current?.wind_speed_10m)} km/h</strong></div><div><span>{met?wx('nextHour'):text('rain')}</span><strong dir="ltr">{number(data.current?.precipitation)} mm</strong></div></div>
      <h3>{text('forecast')}</h3><p className="subtle">{met?wx('metNote'):text('forecastNote')}</p>
      {data.forecastSource?.issuedAt&&<p className="weather-updated">{wx('issued')}: <time dateTime={data.forecastSource.issuedAt}>{updated(data.forecastSource.issuedAt)}</time></p>}
      {data.forecastSource?.transport==='browser'&&<p className="subtle">{wx('browser')}</p>}
      <a className="source-link" href={met?'https://api.met.no/weatherapi/locationforecast/2.0/documentation':'https://open-meteo.com/'} target="_blank" rel="noreferrer">{met?'MET Norway':'Open-Meteo'} ↗</a>{' · '}<a className="source-link" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0 ↗</a>
      {data.forecast?.length?<div className="table-scroll" tabIndex={0} role="region" aria-label={text('forecast')}><table className="forecast-table"><thead><tr><th scope="col">{text('day')}</th><th scope="col">{t('low')} / {t('high')}</th><th scope="col">{text('feels')} °C</th><th scope="col">{text('windMax')} km/h</th><th scope="col">{text('rainTotal')} mm</th></tr></thead><tbody>{data.forecast.map(day=><tr key={day.date}><th scope="row"><time dateTime={day.date}>{new Intl.DateTimeFormat(locale,{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(day.date+'T12:00:00Z'))}</time></th><td dir="ltr">{number(day.low)} / {number(day.high)}</td><td dir="ltr">{number(day.apparentLow)} / {number(day.apparentHigh)}</td><td dir="ltr">{number(day.wind)}</td><td dir="ltr">{number(day.precipitation)}</td></tr>)}</tbody></table></div>:<p role="status">{t('unavailable')}</p>}
    </>}
    <div className="weather-section"><h3>{t('monthly')} · {climate?.year??new Date().getUTCFullYear()-1}</h3><p className="subtle">{t('weatherNote')}</p>{status(history)}
    {!!climate?.months.length&&<><p className="subtle">{text('seasonGrouping')}</p><div className="season-grid">{['winter','spring','summer','autumn'].map((season,i)=>{const ids=[[11,0,1],[2,3,4],[5,6,7],[8,9,10]][lat<0?(i+2)%4:i];return <div key={season}><b>{t(season)}</b><span dir="ltr">{number(seasonMean(climate.months,ids,'low'))}° / {number(seasonMean(climate.months,ids,'high'))}°</span><small dir="ltr">{ids.map(value=>value+1).join(' · ')}</small></div>})}</div>
      <div className="climate-chart" aria-hidden="true">{climate.months.map((month,i)=><div key={i} className="climate-column"><span dir="ltr">{number(month.high)}°</span><i style={{height:month.high===null?'0px':`${Math.max(8,(month.high+20)*2)}px`}}/><small>{new Intl.DateTimeFormat(locale,{month:'short'}).format(new Date(2024,i,15))}</small></div>)}</div>
      <div className="table-scroll" tabIndex={0} role="region" aria-label={t('monthly')}><Table><TableHeader><TableRow><TableHead scope="col">{t('month')}</TableHead><TableHead scope="col">{t('low')}</TableHead><TableHead scope="col">{t('high')}</TableHead><TableHead scope="col">{text('sampleDays')}</TableHead></TableRow></TableHeader><TableBody>{climate.months.map((month,i)=><TableRow key={i}><TableCell>{new Intl.DateTimeFormat(locale,{month:'long'}).format(new Date(2024,i,15))}</TableCell><TableCell>{number(month.low)}</TableCell><TableCell>{number(month.high)}</TableCell><TableCell dir="ltr">{number(month.lowSamples)} / {number(month.highSamples)}</TableCell></TableRow>)}</TableBody></Table></div>
    </>}
    {climate?.historySource?.transport==='browser'&&<p className="subtle">{wx('browser')}</p>}
    </div><a className="source-link" href="https://open-meteo.com/en/docs/historical-weather-api" target="_blank" rel="noreferrer">Open-Meteo · ERA5 · CC BY 4.0 ↗</a>
  </section>;
}
