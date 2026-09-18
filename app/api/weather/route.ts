import {parseCoordinates} from '@/lib/explorer-location';
import {createWeatherService} from '@/lib/weather-service';

const service=createWeatherService();
export async function GET(request:Request){
 const url=new URL(request.url),query=url.searchParams,coordinates=parseCoordinates(query.get('lat'),query.get('lon')),part=query.get('part')??'all';
 if(!coordinates||!['all','current','history'].includes(part))return Response.json({error:'Invalid weather request'},{status:400,headers:{'Cache-Control':'no-store'}});
 const {lat,lon}=coordinates,[forecast,history]=await Promise.all([part==='history'?null:service.get(lat,lon,'current',url.origin),part==='current'?null:service.get(lat,lon,'history',url.origin)]);
 if(!forecast?.data&&!history?.data)return Response.json({error:'Weather unavailable',browserFallback:(part==='history'?history:forecast)?.browserFallback??null,failures:[...(forecast?.failures??[]),...(history?.failures??[])]},{status:502,headers:{'Cache-Control':'no-store'}});
 const data=forecast?.data??history!.data!,stale=!!forecast?.data?.stale||!!history?.data?.stale;
 return Response.json({...data,...(history?.data?{year:history.data.year,months:history.data.months,historySource:history.data.historySource}:{}),...(forecast?.data?{forecastSource:forecast.data.forecastSource}:{}),stale,partial:[...(forecast&&!forecast.data?['current']:[]),...(history&&!history.data?['history']:[])]},{headers:{'Cache-Control':stale?'no-store':`public, max-age=${part==='history'?86400:600}`}});
}
