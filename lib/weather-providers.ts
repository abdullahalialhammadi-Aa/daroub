import {aggregateMonths,normalizeForecast,numberOrNull,usableForecast,type ExplorerWeatherResult,type ExplorerForecastDay,type WeatherSource} from './explorer-weather';

type RecordData=Record<string,unknown>;
const object=(value:unknown):RecordData=>value!==null&&typeof value==='object'&&!Array.isArray(value)?value as RecordData:{};
const details=(value:unknown)=>object(object(value).details);
const rounded=(value:number)=>Math.round(value*10)/10;
const iso=(value:unknown)=>typeof value==='string'&&Number.isFinite(Date.parse(value))?new Date(value).toISOString():undefined;
export const weatherUserAgent='Daroub/1.0 (+https://daroub-terrain-guide.ifritliwa.chatgpt.site/)';
export const metForecastUrl=(lat:number,lon:number)=>`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}`;
export function openWeatherUrl(lat:number,lon:number,part:'current'|'history',year:number){const base=`latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}`;return part==='history'?`https://archive-api.open-meteo.com/v1/archive?${base}&start_date=${year}-01-01&end_date=${year}-12-31&daily=temperature_2m_max,temperature_2m_min&models=era5&timezone=auto`:`https://api.open-meteo.com/v1/forecast?${base}&current=temperature_2m,apparent_temperature,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,wind_speed_10m_max&forecast_days=7&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm&timezone=auto`;}
export function normalizeOpenWeather(raw:unknown,part:'current'|'history',year:number,now:number,transport:WeatherSource['transport']):ExplorerWeatherResult{
 const fetchedAt=new Date(now).toISOString(),source:WeatherSource={provider:'open-meteo',transport,fetchedAt,expiresAt:new Date(now+(part==='history'?86400000:600000)).toISOString()};
 if(part==='history')return {year,months:aggregateMonths(raw,year),current:null,forecast:[],timezone:typeof object(raw).timezone==='string'?String(object(raw).timezone):'',fetchedAt,historySource:source};
 return {year,months:[],...normalizeForecast(raw),fetchedAt,forecastSource:source};
}

/** MET instant values are sampled forecasts, not observations or exact daily extrema.
 * Rain totals require complete, non-overlapping 24-hour coverage in UTC. */
export function normalizeMetWeather(raw:unknown,now:number,transport:WeatherSource['transport']='server',expires?:string|null):ExplorerWeatherResult{
 const properties=object(object(raw).properties),meta=object(properties.meta),units=object(meta.units),fetchedAt=new Date(now).toISOString();
 const times=Array.isArray(properties.timeseries)?properties.timeseries:[];
 const points=times.flatMap(value=>{const item=object(value),time=iso(item.time);return time?[{time,at:Date.parse(time),data:object(item.data)}]:[]}).sort((a,b)=>a.at-b.at);
 const temperature=(point:typeof points[number])=>units.air_temperature==='celsius'?numberOrNull(details(point.data.instant).air_temperature):null;
 const wind=(point:typeof points[number])=>{const value=units.wind_speed==='m/s'?numberOrNull(details(point.data.instant).wind_speed):null;return value!==null&&value>=0?rounded(value*3.6):null;};
 const rain=(point:typeof points[number],hours:number)=>{const value=units.precipitation_amount==='mm'?numberOrNull(details(point.data[`next_${hours}_hours`]).precipitation_amount):null;return value!==null&&value>=0?value:null;};
 const today=new Date(now).toISOString().slice(0,10),dates=[...new Set(points.map(point=>point.time.slice(0,10)).filter(date=>date>=today))].slice(0,7);
 const forecast:ExplorerForecastDay[]=dates.map(date=>{
  const start=Date.parse(date+'T00:00:00Z'),end=start+86400000,day=points.filter(point=>point.at>=start&&point.at<end),temperatures=day.map(temperature).filter((value):value is number=>value!==null),winds=day.map(wind).filter((value):value is number=>value!==null);
  let cursor=start,total=0;
  for(const point of day){if(point.at!==cursor)continue;for(const hours of [1,6,12]){const amount=rain(point,hours);if(amount!==null&&cursor+hours*3600000<=end){total+=amount;cursor+=hours*3600000;break;}}}
  return {date,low:temperatures.length?Math.min(...temperatures):null,high:temperatures.length?Math.max(...temperatures):null,wind:winds.length?Math.max(...winds):null,precipitation:cursor===end?rounded(total):null,apparentLow:null,apparentHigh:null};
 });
 const nearest=points.filter(point=>point.at>=now-3600000&&point.at<=now+3600000).sort((a,b)=>Math.abs(a.at-now)-Math.abs(b.at-now))[0];
 const current=nearest?{time:nearest.time,temperature_2m:temperature(nearest),apparent_temperature:null,wind_speed_10m:wind(nearest),precipitation:rain(nearest,1)}:null;
 const issuedAt=iso(meta.updated_at),expiry=iso(expires),expiresAt=expiry&&Date.parse(expiry)>now?expiry:new Date(now+600000).toISOString();
 return {year:new Date(now).getUTCFullYear()-1,months:[],timezone:'UTC',current,forecast,fetchedAt,forecastSource:{provider:'met-norway',transport,fetchedAt,...(issuedAt?{issuedAt}:{}),expiresAt},...(issuedAt&&now-Date.parse(issuedAt)>86400000?{stale:true}:{})};
}
export function usableWeatherPart(data:unknown,part:'current'|'history'):data is ExplorerWeatherResult{return part==='current'?usableForecast(data):!!data&&typeof data==='object'&&'months'in data&&Array.isArray(data.months)&&data.months.some(month=>month&&typeof month==='object'&&(numberOrNull(month.low)!==null||numberOrNull(month.high)!==null));}
