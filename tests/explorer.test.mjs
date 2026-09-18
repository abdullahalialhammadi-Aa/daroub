import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCoordinates,selectionFromQuery,selectionQuery} from '../lib/explorer-location.ts';
import {aggregateMonths,normalizeForecast,seasonMean,weatherCacheKey,isWeatherCache} from '../lib/explorer-weather.ts';
const locations=[{id:'liwa',lat:23.14,lon:53.78,terrainId:'desert'}];

test('coordinates accept real zero and geographic boundaries, reject blanks and invalid values',()=>{
 assert.deepEqual(parseCoordinates('0','0'),{lat:0,lon:0});assert.deepEqual(parseCoordinates('-90','180'),{lat:-90,lon:180});
 for(const pair of [['','0'],[' ','0'],['0',null],['91','0'],['0','-181'],['NaN','0'],['Infinity','0']])assert.equal(parseCoordinates(...pair),null);
});
test('curated URL resolves its canonical coordinates and terrain',()=>{
 assert.deepEqual(selectionFromQuery(new URLSearchParams('destination=liwa'),locations),{destinationId:'liwa',lat:23.14,lon:53.78,terrainId:'desert'});
});
test('mismatching coordinates cannot claim destination-specific guidance',()=>{
 assert.deepEqual(selectionFromQuery(new URLSearchParams('destination=liwa&lat=10&lon=20&terrainId=forest'),locations),{destinationId:null,lat:10,lon:20,terrainId:'forest'});
});
test('malformed shared links do not become plausible zero locations',()=>{
 for(const query of ['destination=missing','destination=liwa&lat=','lat=0&lon=0&terrainId=bogus','lat=0&terrainId=desert','destination=liwa&lat=91&lon=0'])assert.equal(selectionFromQuery(new URLSearchParams(query),locations),null);
});
test('shared location roundtrips arbitrary coordinates and curated locations',()=>{
 for(const selection of [{destinationId:null,lat:-33.987,lon:151.03,terrainId:'coast'},{destinationId:'liwa',lat:23.14,lon:53.78,terrainId:'desert'}])assert.deepEqual(selectionFromQuery(new URLSearchParams(selectionQuery(selection)),locations),selection);
});
test('monthly aggregation ignores null, malformed and wrong-year readings without inventing zero',()=>{
 const months=aggregateMonths({daily:{time:['2025-01-01','2025-01-02','2025-01-03','2024-01-04','2025-02-01'],temperature_2m_min:[1,null,3,99,null],temperature_2m_max:[10,20,Infinity,99,null]}},2025);
 assert.deepEqual(months[0],{low:2,high:15,lowSamples:2,highSamples:2});assert.equal(months[1].low,null);assert.equal(months[1].high,null);assert.equal(months.length,12);
});
test('malformed upstream archive is unavailable rather than a fake climate',()=>{assert.ok(aggregateMonths({daily:null},2025).every(month=>month.high===null&&month.low===null));});
test('season mean weights observed samples, not full months with missing readings',()=>{
 assert.equal(seasonMean([{low:0,high:10,lowSamples:1,highSamples:1},{low:10,high:20,lowSamples:3,highSamples:3}],[0,1],'low'),7.5);
 assert.equal(seasonMean([],[0,1,2],'high'),null);
});
test('forecast keeps units numeric/null and caps at seven days',()=>{
 const days=Array.from({length:9},(_,index)=>`2026-09-${String(index+1).padStart(2,'0')}`);
 const result=normalizeForecast({timezone:'UTC',current:{time:'2026-09-01T10:00',temperature_2m:0,apparent_temperature:null,wind_speed_10m:'bad',precipitation:0},daily:{time:days,temperature_2m_min:[0],temperature_2m_max:[25]}});
 assert.equal(result.forecast.length,7);assert.equal(result.current.temperature_2m,0);assert.equal(result.current.wind_speed_10m,null);assert.equal(result.forecast[1].high,null);assert.equal(result.forecast[0].apparentHigh,null);
});
test('bad forecast shape normalizes safely',()=>{assert.deepEqual(normalizeForecast(null),{current:null,timezone:'',forecast:[]});});
test('cache keys isolate locations, data kinds and archive years',()=>{
 assert.notEqual(weatherCacheKey('current',1,2,2025),weatherCacheKey('current',1,3,2025));assert.notEqual(weatherCacheKey('history',1,2,2025),weatherCacheKey('history',1,2,2024));assert.notEqual(weatherCacheKey('history',1,2,2025),weatherCacheKey('current',1,2,2025));
});
test('corrupt cached data cannot reach rendering',()=>{
 const valid={year:2025,months:aggregateMonths({},2025),...normalizeForecast(null),fetchedAt:'2026-09-17T00:00:00Z'};
 assert.equal(isWeatherCache(valid),true);for(const corrupt of [{...valid,months:[null]},{...valid,current:{time:7}},{...valid,forecast:[{date:'no'}]},{...valid,fetchedAt:'bad'},{...valid,timezone:null}])assert.equal(isWeatherCache(corrupt),false);
});
test('impossible calendar dates do not reach forecast formatting',()=>{assert.deepEqual(normalizeForecast({daily:{time:['2026-02-31','2026-13-01']}}).forecast,[]);});
