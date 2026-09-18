import type { ForecastDay, WeatherResult } from './toolkit-types';

export interface ExplorerForecastDay extends ForecastDay { apparentLow: number | null; apparentHigh: number | null }
export interface ClimateMonth { low: number | null; high: number | null; lowSamples: number; highSamples: number }
export interface WeatherSource { provider: 'open-meteo' | 'met-norway'; transport: 'server' | 'browser'; fetchedAt: string; issuedAt?: string; expiresAt?: string }
export interface ExplorerWeatherResult extends Omit<WeatherResult, 'forecast' | 'months'> { months: ClimateMonth[]; forecast?: ExplorerForecastDay[]; forecastSource?: WeatherSource; historySource?: WeatherSource; stale?: boolean; partial?: ('current'|'history')[] }
type DataRecord = Record<string, unknown>;
function record(value: unknown): DataRecord { return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as DataRecord : {}; }
function array(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
export function numberOrNull(value: unknown): number | null { return typeof value === 'number' && Number.isFinite(value) ? value : null; }
const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
function validDay(value: unknown): value is string { if(typeof value!=='string'||!dayPattern.test(value))return false;const date=new Date(value+'T12:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value; }
export function aggregateMonths(raw: unknown, year: number): ClimateMonth[] {
  const daily = record(record(raw).daily), dates = array(daily.time);
  return Array.from({length: 12}, (_, month) => {
    const indexes = dates.flatMap((date, index) => validDay(date) && date.startsWith(`${year}-`) && Number(date.slice(5,7)) === month + 1 ? [index] : []);
    const aggregate = (field: string) => {
      const values = indexes.map(index => numberOrNull(array(daily[field])[index])).filter((value): value is number => value !== null);
      return {value: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 10) / 10 : null, count: values.length};
    };
    const low = aggregate('temperature_2m_min'), high = aggregate('temperature_2m_max');
    return {low: low.value, high: high.value, lowSamples: low.count, highSamples: high.count};
  });
}
export function normalizeForecast(raw: unknown): {current: WeatherResult['current']; timezone: string; forecast: ExplorerForecastDay[]} {
  const data = record(raw), current = record(data.current), daily = record(data.daily);
  const forecast: ExplorerForecastDay[] = array(daily.time).flatMap((date, index) => {
    if (!validDay(date)) return [];
    const at = (key: string) => numberOrNull(array(daily[key])[index]);
    return [{date, low: at('temperature_2m_min'), high: at('temperature_2m_max'), wind: at('wind_speed_10m_max'), precipitation: at('precipitation_sum'), apparentLow: at('apparent_temperature_min'), apparentHigh: at('apparent_temperature_max')}];
  }).slice(0, 7);
  const time = typeof current.time === 'string' ? current.time : undefined;
  return {timezone: typeof data.timezone === 'string' ? data.timezone : '', current: time ? {time, temperature_2m: numberOrNull(current.temperature_2m), apparent_temperature: numberOrNull(current.apparent_temperature), wind_speed_10m: numberOrNull(current.wind_speed_10m), precipitation: numberOrNull(current.precipitation)} : null, forecast};
}
export function seasonMean(months: ClimateMonth[], indexes: number[], field: 'low' | 'high'): number | null {
  let sum = 0, count = 0;
  for (const index of indexes) {
    const month = months[index], value = month?.[field], samples = month?.[field === 'low' ? 'lowSamples' : 'highSamples'];
    if (typeof value === 'number' && Number.isFinite(value) && typeof samples === 'number' && samples > 0) { sum += value * samples; count += samples; }
  }
  return count ? Math.round(sum / count * 10) / 10 : null;
}
export function weatherCacheKey(part: 'current' | 'history', lat: number, lon: number, year: number) { return `daroub-weather-v2:${part}:${lat.toFixed(3)}:${lon.toFixed(3)}:${part === 'history' ? year : ''}`; }
export function isWeatherCache(value: unknown): value is ExplorerWeatherResult {
  const data = record(value);
  const nullableNumber = (item: unknown) => item === null || typeof item === 'number' && Number.isFinite(item);
  if (typeof data.fetchedAt !== 'string' || !Number.isFinite(Date.parse(data.fetchedAt)) || !Array.isArray(data.months) || data.months.length > 12 || typeof data.year !== 'number' || typeof data.timezone !== 'string') return false;
  if (!data.months.every(item => {const month=record(item);return nullableNumber(month.low)&&nullableNumber(month.high)&&Number.isInteger(month.lowSamples)&&Number.isInteger(month.highSamples)&&Number(month.lowSamples)>=0&&Number(month.highSamples)>=0;})) return false;
  if (data.current !== null) {const current=record(data.current);if(typeof current.time!=='string'||!Number.isFinite(Date.parse(current.time))||!['temperature_2m','apparent_temperature','wind_speed_10m','precipitation'].every(key=>nullableNumber(current[key])))return false;}
  for(const key of ['forecastSource','historySource'])if(data[key]!==undefined){const source=record(data[key]);if(!['open-meteo','met-norway'].includes(String(source.provider))||!['server','browser'].includes(String(source.transport))||typeof source.fetchedAt!=='string'||!Number.isFinite(Date.parse(source.fetchedAt)))return false;for(const date of ['issuedAt','expiresAt'])if(source[date]!==undefined&&(typeof source[date]!=='string'||!Number.isFinite(Date.parse(String(source[date])))))return false;}
  if(data.stale!==undefined&&typeof data.stale!=='boolean')return false;
  return data.forecast === undefined || Array.isArray(data.forecast) && data.forecast.length <= 7 && data.forecast.every(item => {const day=record(item);return validDay(day.date)&&['low','high','apparentLow','apparentHigh','wind','precipitation'].every(key=>nullableNumber(day[key]));});
}
export function usableForecast(value:unknown):value is ExplorerWeatherResult{return isWeatherCache(value)&&(!!value.current&&['temperature_2m','wind_speed_10m','precipitation','apparent_temperature'].some(key=>numberOrNull((value.current as DataRecord)[key])!==null)||!!value.forecast?.some(day=>[day.low,day.high,day.wind,day.precipitation].some(value=>value!==null)));}
export function weatherFreshUntil(data:ExplorerWeatherResult,part:'current'|'history'='current'){const source=part==='current'?data.forecastSource:data.historySource;return source?.expiresAt?Date.parse(source.expiresAt):Date.parse(data.fetchedAt)+(part==='history'?86400000:600000);}
export function weatherIsStale(data:ExplorerWeatherResult,now=Date.now()){return data.stale===true||Date.parse(data.fetchedAt)>now+60000||now>weatherFreshUntil(data)+600000||(!!data.forecastSource?.issuedAt&&now-Date.parse(data.forecastSource.issuedAt)>86400000);}
