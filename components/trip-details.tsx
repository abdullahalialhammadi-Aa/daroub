'use client';

import {terrains,translate,type Locale} from '@/lib/terrain';
import {activeDestinations,catalogDestination} from '@/lib/catalog-seed';
import {prepText} from '@/lib/preparation-copy';
import {releaseText} from '@/lib/preparation-release-copy';
import {workspaceText} from '@/lib/trip-workspace-copy';
import type {Trip,CatalogSnapshot,TerrainId} from '@/lib/toolkit-types';
export function TripDetails({trip,onChange,catalog,locale,creating=false}:{trip:Trip;onChange:(trip:Trip)=>void;catalog:CatalogSnapshot;locale:Locale;creating?:boolean}){
 const p=(k:string)=>prepText(locale,k),w=(k:string)=>workspaceText(locale,k),available=activeDestinations(catalog),destination=catalogDestination(catalog,trip.destinationId),tr=(values:string[])=>translate(locale,values);
 const update=(patch:Partial<Trip>)=>onChange({...trip,...patch});
 function choose(id:string){const next=catalogDestination(catalog,id);update(next?{destinationId:next.id,terrainId:next.terrainId,location:{lat:next.lat,lon:next.lon},...(creating&&destination&&trip.title===tr(destination.names)?{title:tr(next.names)}:{})}:{destinationId:null})}
 return <div className="journey-details">
  {creating&&<fieldset className="journey-destination-field"><legend>{w('choose')}</legend><label className="prep-label"><span className="sr-only">{p('destination')}</span><select className="prep-search" value={trip.destinationId??''} onChange={e=>choose(e.target.value)}>{trip.destinationId&&!available.some(d=>d.id===trip.destinationId)&&<option value={trip.destinationId}>{destination?tr(destination.names):trip.destinationId} · {releaseText(locale,'archived')}</option>}{available.map(d=><option key={d.id} value={d.id}>{tr(d.names)}</option>)}<option value="">{w('custom')}</option></select></label>{destination&&<div className="journey-selected-place"><img src={destination.image} alt=""/><p>{tr(destination.summary)}</p></div>}</fieldset>}
  <div className="prep-fields">
   <label className="prep-wide" htmlFor="journey-title">{p('title')}<input id="journey-title" value={trip.title} maxLength={160} pattern={String.raw`.*\S.*`} required onChange={e=>update({title:e.target.value})}/></label>
   {!creating&&<label className="prep-wide">{p('destination')}<select value={trip.destinationId??''} onChange={e=>choose(e.target.value)}><option value="">{p('custom')}</option>{trip.destinationId&&!available.some(d=>d.id===trip.destinationId)&&<option value={trip.destinationId}>{destination?tr(destination.names):trip.destinationId} · {releaseText(locale,'archived')}</option>}{available.map(d=><option key={d.id} value={d.id}>{tr(d.names)}</option>)}</select></label>}
   {!trip.destinationId&&<><label className="prep-wide">{p('terrain')}<select value={trip.terrainId} onChange={e=>update({terrainId:e.target.value as TerrainId})}>{terrains.map(t=><option key={t.id} value={t.id}>{tr(t.names)}</option>)}</select></label><label>{p('lat')}<input type="number" step="any" min={-90} max={90} required value={Number.isFinite(trip.location.lat)?trip.location.lat:''} onChange={e=>update({location:{...trip.location,lat:e.target.value===''?NaN:Number(e.target.value)}})}/></label><label>{p('lon')}<input type="number" step="any" min={-180} max={180} required value={Number.isFinite(trip.location.lon)?trip.location.lon:''} onChange={e=>update({location:{...trip.location,lon:e.target.value===''?NaN:Number(e.target.value)}})}/></label></>}
   <label>{p('start')}<input type="date" value={trip.startDate} onChange={e=>update({startDate:e.target.value})}/></label><label>{p('end')}<input type="date" min={trip.startDate||undefined} value={trip.endDate} onChange={e=>update({endDate:e.target.value})}/></label>
   <small className="prep-wide">{p('dateOptional')}</small><label>{p('group')}<input type="number" min={1} max={1000} step={1} required value={trip.groupSize||''} onChange={e=>update({groupSize:Number(e.target.value)})}/></label>
  </div>
  <details className="journey-extra" open={trip.transport.length>200||trip.notes.length>10000?true:undefined}><summary>{w('optional')}</summary><div className="prep-fields"><label className="prep-wide">{p('transport')}<input value={trip.transport} maxLength={200} onChange={e=>update({transport:e.target.value})}/></label><label className="prep-wide">{p('notes')}<textarea value={trip.notes} maxLength={10000} onChange={e=>update({notes:e.target.value})}/></label></div></details>
 </div>
}
