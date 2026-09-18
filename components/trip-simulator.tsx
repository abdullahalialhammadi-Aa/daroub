'use client';
import {useEffect,useId,useMemo,useRef,useState} from 'react';
import {ArrowRight,Check,FlaskConical,RotateCcw,PackagePlus,ChevronDown} from 'lucide-react';
import {tripDuration} from '@/lib/packing-engine';
import {activityIds,releaseText} from '@/lib/preparation-release-copy';
import {prepText} from '@/lib/preparation-copy';
import {packingText} from '@/lib/packing-copy';
import {simulationText} from '@/lib/simulation-copy';
import {applyTripSimulation,scenarioEndDate,simulateTrip,SimulationError,type ScenarioInputs,type TripSimulation} from '@/lib/trip-simulation';
import type {Locale} from '@/lib/terrain';
import type {CatalogSnapshot,GearItem,Trip} from '@/lib/toolkit-types';

interface Controls {source:Trip;group:string;start:string;end:string;duration:string;activities:string[]}
function controlsFor(trip:Trip):Controls{return{source:trip,group:String(trip.groupSize),start:trip.startDate,end:trip.endDate,duration:String(tripDuration(trip)??''),activities:[...trip.activities??[]]};}
function parseControls(value:Controls):ScenarioInputs{
 const group=value.group.trim()===''?NaN:Number(value.group);
 if(value.duration!==''&&scenarioEndDate(value.start,Number(value.duration))!==value.end)throw new SimulationError('invalidScenario');
 return{groupSize:group,startDate:value.start,endDate:value.end,activities:value.activities};
}
interface Snapshot {trip:Trip;gear:GearItem[];catalog:CatalogSnapshot;locale:Locale;controls:Controls}
interface Result extends Snapshot {preview?:TripSimulation;error?:string}
export function TripSimulator({trip,gear,catalog,locale,onApply}:{trip:Trip;gear:GearItem[];catalog:CatalogSnapshot;locale:Locale;onApply:(trip:Trip)=>void}){
 const c=(key:string)=>simulationText(locale,key),r=(key:string)=>releaseText(locale,key),p=(key:string)=>prepText(locale,key),id=useId(),formOwner=id+'-detached',statusId=id+'-status';
 const [stored,setStored]=useState(()=>controlsFor(trip)),[requested,setRequested]=useState<Snapshot|null>(null),[result,setResult]=useState<Result|null>(null),[selection,setSelection]=useState<{result:Result|null;keys:string[]}>({result:null,keys:[]}),[showAll,setShowAll]=useState(false),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 const controls=useMemo(()=>stored.source===trip?stored:controlsFor(trip),[stored,trip]),mounted=useRef(false),applying=useRef(false),reviewHeading=useRef<HTMLHeadingElement>(null),current=useRef({trip,gear,catalog,controls,locale});
 const requestCurrent=requested?.trip===trip&&requested?.gear===gear&&requested?.catalog===catalog&&requested?.controls===controls&&requested?.locale===locale;
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
 useEffect(()=>{current.current={trip,gear,catalog,controls,locale}},[trip,gear,catalog,controls,locale]);
 useEffect(()=>{
  if(!requested||!requestCurrent)return;
  let active=true;
  async function calculate(){try{const preview=await simulateTrip(trip,parseControls(controls),gear,catalog,locale);if(active)setResult({trip,gear,catalog,locale,controls,preview});}catch(error){if(active)setResult({trip,gear,catalog,locale,controls,error:error instanceof SimulationError?error.code:'failed'});}}
  void calculate();return()=>{active=false};
 },[requested,requestCurrent,trip,gear,catalog,locale,controls]);
 const fresh=requestCurrent&&result?.trip===trip&&result?.gear===gear&&result?.catalog===catalog&&result?.controls===controls&&result?.locale===locale,preview=fresh?result?.preview:undefined,calculating=!!requested&&requestCurrent&&!fresh;
 useEffect(()=>{if(fresh)reviewHeading.current?.focus()},[fresh,result]);
 const selected=selection.result===result?selection.keys:[],rows=preview?.rows??[],visible=showAll?rows:rows.filter(row=>row.changed),selectable=visible.filter(row=>row.selectable),selectedRows=rows.filter(row=>selected.includes(row.key));
 const activities=[...new Set([...activityIds,...catalog.packingRules.flatMap(rule=>rule.activities),...controls.activities])],itineraryActivities=[...new Set((trip.itinerary??[]).flatMap(day=>day.entries.map(entry=>entry.activityId)))];
 const number=(value:number)=>new Intl.NumberFormat(locale).format(value);
 const date=(value:string)=>{const time=Date.parse(value+'T12:00:00Z');return value&&Number.isFinite(time)?new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(time):c('notSet')};
 const dateRange=(start:string,end:string)=>start||end?date(start)+' – '+date(end):c('notSet');
 const activityNames=(values:string[])=>values.length?values.map(value=>r(value)).join(' · '):c('noActivities');
 const planLabels=preview?[...new Set(preview.changes.map(value=>value==='groupChange'?p('group'):value==='activityChange'?c('activities'):c('dates')))]:[];
 const comparison=preview?[
  ...(preview.changes.includes('groupChange')?[{label:p('group'),before:number(trip.groupSize),after:number(preview.inputs.groupSize)}]:[]),
  ...(preview.changes.includes('dateChange')?[{label:c('dates'),before:dateRange(trip.startDate,trip.endDate),after:dateRange(preview.inputs.startDate,preview.inputs.endDate)}]:[]),
  ...(preview.changes.includes('durationChange')?[{label:c('days'),before:preview.beforeDays===null?c('notSet'):number(preview.beforeDays),after:preview.afterDays===null?c('notSet'):number(preview.afterDays)}]:[]),
  ...(preview.changes.includes('activityChange')?[{label:c('activities'),before:activityNames(trip.activities??[]),after:activityNames(preview.inputs.activities)}]:[]),
 ]:[];
 function change(patch:Partial<Controls>){setStored({...controls,...patch,source:trip});setStatus('');}
 function dateChange(field:'start'|'end',value:string){const start=field==='start'?value:controls.start,end=field==='end'?value:controls.end;change({start,end,duration:String(tripDuration({...trip,startDate:start,endDate:end})??'')});}
 function durationChange(value:string){let end=controls.end;try{end=value===''?'':scenarioEndDate(controls.start,Number(value));}catch{/* Keep the previous date visible while an incomplete duration is corrected. */}change({duration:value,end});}
 function review(){setRequested({trip,gear,catalog,locale,controls});setResult(null);setSelection({result:null,keys:[]});setShowAll(false);setStatus('');}
 function reset(){setStored(controlsFor(trip));setRequested(null);setResult(null);setSelection({result:null,keys:[]});setStatus('');setShowAll(false);}
 async function apply(){
  if(!preview||!fresh||applying.current)return;applying.current=true;setBusy(true);setStatus('');
  try{const next=await applyTripSimulation(trip,preview,selected,gear,catalog);if(!mounted.current)return;const now=current.current;if(now.trip!==trip||now.gear!==gear||now.catalog!==catalog||now.controls!==controls||now.locale!==locale){setStatus('stale');return;}onApply(next);setStatus('applied');}
  catch(error){if(mounted.current)setStatus(error instanceof SimulationError?error.code:'failed');}
  finally{applying.current=false;if(mounted.current)setBusy(false);}
 }
 return <section className="trip-simulator" aria-labelledby={id+'-title'} dir={locale==='ar'?'rtl':'ltr'}>
  <div className="simulation-heading"><div><span className="simulation-eyebrow"><FlaskConical size={17} aria-hidden="true"/>{c('previewOnly')}</span><h3 id={id+'-title'}>{c('title')}</h3><p>{c('intro')}</p></div><button type="button" className="outline-btn" disabled={busy} onClick={reset}><RotateCcw size={16} aria-hidden="true"/>{c('reset')}</button></div>
  <div className="simulation-current"><h4>{c('currentPlan')}</h4><dl><div><dt>{p('group')}</dt><dd>{number(trip.groupSize)} {c('people')}</dd></div><div><dt>{c('dates')}</dt><dd>{dateRange(trip.startDate,trip.endDate)}</dd></div><div><dt>{c('activities')}</dt><dd>{activityNames(trip.activities??[])}</dd></div></dl></div>
  <section className="simulation-step" aria-labelledby={id+'-change'}>
   <div className="simulation-step-heading"><span aria-hidden="true">{number(1)}</span><h4 id={id+'-change'}>{c('stepChange')}</h4></div><p className="simulation-example">{c('example')}</p>
   <fieldset className="simulation-control-lock" disabled={busy}><legend className="sr-only">{c('trialPlan')}</legend>
    <div className="simulation-controls"><label>{p('group')}<input form={formOwner} type="number" min={1} max={1000} step={1} value={controls.group} onChange={event=>change({group:event.target.value})}/></label><label>{p('start')}<input form={formOwner} type="date" value={controls.start} onChange={event=>dateChange('start',event.target.value)}/></label><label>{p('end')}<input form={formOwner} type="date" min={controls.start||undefined} value={controls.end} onChange={event=>dateChange('end',event.target.value)}/></label><label>{c('duration')}<input form={formOwner} type="number" min={1} max={3660000} step={1} disabled={!controls.start} value={controls.duration} onChange={event=>durationChange(event.target.value)}/></label></div>
    <fieldset className="simulation-activities"><legend>{c('activities')}</legend>{activities.filter(value=>value!=='other').map(value=><label key={value}><input form={formOwner} type="checkbox" checked={controls.activities.includes(value)} disabled={!controls.activities.includes(value)&&controls.activities.length>=30} onChange={event=>change({activities:event.target.checked?[...controls.activities,value]:controls.activities.filter(item=>item!==value)})}/>{r(value)}</label>)}</fieldset>
   </fieldset>
   <p className="simulation-note">{c('dateHelp')}</p>{itineraryActivities.length>0&&<p className="simulation-note">{c('itineraryActivities')}: {itineraryActivities.map(value=>r(value)).join(' · ')}</p>}
   <div className="simulation-preview-action"><button type="button" className="simulation-preview-button" disabled={busy||calculating} aria-controls={id+'-review'} onClick={review}>{calculating?c('calculating'):c('preview')}<ArrowRight size={18} aria-hidden="true"/></button><p>{c('previewHint')}</p></div>
  </section>
  <section className="simulation-step simulation-review" id={id+'-review'} aria-labelledby={id+'-compare'} aria-busy={calculating}>
   <div className="simulation-step-heading"><span aria-hidden="true">{number(2)}</span><h4 id={id+'-compare'} ref={reviewHeading} tabIndex={-1}>{c('stepCompare')}</h4></div>
   {!requestCurrent?<p className="simulation-waiting" role="status">{requested?c(requested.trip===trip&&requested.gear===gear&&requested.catalog===catalog?'reviewAgain':'stale'):c('waitingPreview')}</p>:calculating?<p role="status">{c('calculating')}</p>:result?.error?<p className="simulation-warning" role="alert">{c(result.error)}</p>:preview&&<>
    {comparison.length?<div className="simulation-comparison">{comparison.map(row=><div className="simulation-comparison-row" key={row.label}><strong>{row.label}</strong><div><span>{c('currentPlan')}</span><p>{row.before}</p></div><ArrowRight size={18} aria-hidden="true"/><div><span>{c('trialPlan')}</span><p>{row.after}</p></div></div>)}</div>:<p className="simulation-waiting">{c('samePlan')}</p>}
    {preview.datesUnknown&&<p className="simulation-warning">{c('unknownDates')}</p>}{preview.itineraryDatesMove&&<p className="simulation-warning">{c('movesDates')}</p>}
    <div className="simulation-results-heading"><h5>{c('equipment')}</h5><button className="simulation-text-button" type="button" aria-expanded={showAll} aria-controls={id+'-rows'} onClick={()=>setShowAll(value=>!value)}>{c(showAll?'showChanges':'showAll')}<ChevronDown size={16} aria-hidden="true"/></button>{selectable.length>0&&<button type="button" className="simulation-text-button" disabled={busy} onClick={()=>setSelection({result,keys:selectable.every(row=>selected.includes(row.key))?selected.filter(key=>!selectable.some(row=>row.key===key)):[...new Set([...selected,...selectable.map(row=>row.key)])]})}>{selectable.every(row=>selected.includes(row.key))?c('clearSelection'):c('selectVisible')}</button>}</div>
    <p className="simulation-note">{c('listedMeaning')}</p>
    {!visible.length&&<p className="simulation-empty">{c('noEquipmentChange')}</p>}
    <div className="simulation-rows" id={id+'-rows'}>{visible.map(row=><article className="simulation-row" key={row.key}>
     <div className="simulation-row-heading"><h6>{row.label}</h6><p><span>{c('suggestedTrial')}</span><strong>{number(row.after)}</strong></p></div>
     <div className="simulation-list-effect"><span>{c('inList')}: <bdi>{number(row.listed)}</bdi></span>{row.selectable?<label><input form={formOwner} type="checkbox" aria-label={row.label+": "+c("chooseIncrease")+" +"+number(row.increase)+", "+c("listAfter")+": "+number(row.listed+row.increase)} disabled={busy} checked={selected.includes(row.key)} onChange={event=>setSelection({result,keys:event.target.checked?[...selected,row.key]:selected.filter(key=>key!==row.key)})}/><span>{c('chooseIncrease')} <bdi>+{number(row.increase)}</bdi><small>{c('listAfter')}: {number(row.listed+row.increase)}</small></span></label>:<p>{row.blocked?c(row.blocked):c('keepList')}</p>}</div>
     {!row.changed&&<p className="simulation-note">{c('existingSuggestion')}</p>}{row.after<row.before&&<p className="simulation-note">{c('noReduction')}</p>}{row.stockBefore!==row.stockAfter&&<p className="simulation-stock-alert">{c('stockOnly')}</p>}
     <details className="simulation-stock-details"><summary>{c('stockDetails')}</summary><dl className="simulation-metrics"><div><dt>{c('stock')} · {c('currentPlan')}</dt><dd>{number(row.stockBefore)}</dd></div><div><dt>{c('stock')} · {c('trialPlan')}</dt><dd>{number(row.stockAfter)}</dd></div><div><dt>{c('shortfall')} · {c('currentPlan')}</dt><dd>{number(row.shortfallBefore)}</dd></div><div><dt>{c('shortfall')} · {c('trialPlan')}</dt><dd>{number(row.shortfallAfter)}</dd></div></dl><p>{c('stockNote')}</p></details>
     <details className="simulation-source-details"><summary>{c('why')}</summary><p>{c('suggested')}: {c('before')} {number(row.before)} · {c('after')} {number(row.after)}</p><p>{packingText(locale,row.coverage==='local'?'local':'general')}</p><p>{row.reason}</p>{row.drivers.length>0&&<p>{row.drivers.map(value=>c(value)).join(' · ')}</p>}<p>{row.before!==row.after?c('ruleChange'):row.stockBefore!==row.stockAfter?c('stockChange'):c('sameRule')}</p><ul>{catalog.sources.filter(source=>row.sourceIds.includes(source.id)).map(source=><li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> · <time dateTime={source.reviewedAt}>{source.reviewedAt}</time></li>)}</ul></details>
    </article>)}</div><p className="simulation-note simulation-quantity-note">{c('quantitiesNote')}</p>
   </>}
  </section>
  {preview&&<section className="simulation-step simulation-apply" aria-labelledby={id+'-apply'}>
   <div className="simulation-step-heading"><span aria-hidden="true">{number(3)}</span><h4 id={id+'-apply'}>{c('stepApply')}</h4></div>
   <div className="simulation-apply-summary"><PackagePlus size={23} aria-hidden="true"/><div>{planLabels.length?<p><strong>{c('planUpdates')}: </strong>{planLabels.join(' · ')}</p>:<p>{c('noPlanUpdates')}</p>}{selectedRows.length?<><h5>{c('selectedAdditions')}</h5><ul>{selectedRows.map(row=><li key={row.key}>{row.label} <bdi>+{number(row.increase)}</bdi></li>)}</ul></>:<p>{c('noneSelected')}</p>}</div></div>
   <p className="simulation-save-note" id={id+'-save-note'}>{c('saveNext')}</p>{!preview.changes.length&&!selected.length&&<p className="simulation-note">{c('nothingToApply')}</p>}
   <button type="button" className="primary-btn" disabled={busy||!preview.changes.length&&!selected.length} aria-describedby={id+'-save-note '+statusId} onClick={()=>void apply()}><Check size={17} aria-hidden="true"/>{busy?c('applying'):c('apply')}</button>
  </section>}
  <p id={statusId} className="simulation-status" role="status">{status?c(status):c('draftOnly')}</p>
 </section>;
}
