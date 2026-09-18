'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Plus,Sparkles,Check,ChevronDown,RefreshCw,SlidersHorizontal} from 'lucide-react';
import {translate,type Locale} from '@/lib/terrain';
import type {CatalogSnapshot,GearItem,PackingSuggestion,Trip} from '@/lib/toolkit-types';
import {acceptPackingSuggestion,availableGear,dismissPackingSuggestion,packingSuggestions,suggestionState,tripDuration} from '@/lib/packing-engine';
import {packingText} from '@/lib/packing-copy';
import {checklistText} from '@/lib/checklist-copy';
import './packing.css';
import './packing-panel.css';

type Decision={key:string;fingerprint:string;decision:'accepted'|'dismissed'};
type Feedback={tripId:string;message:string;label?:string;decision?:Decision};
export function packingReviewItems(items:PackingSuggestion[],trip:Trip,showHandled=false,expanded=false,retainedKeys:string[]=[]){
 const pending=items.filter(s=>['new','changed'].includes(suggestionState(trip,s)));
 const candidates=items.filter(s=>showHandled||pending.includes(s)||retainedKeys.includes(s.key)).sort((a,b)=>Number(b.destinationSpecific===true||b.coverage==='local')-Number(a.destinationSpecific===true||a.coverage==='local'));
 return {pending,candidates,visible:expanded?candidates:candidates.slice(0,4)};
}

export function PackingPanel({trip,onChange,gear,catalog,locale}:{trip:Trip;onChange:(trip:Trip)=>void;gear:GearItem[];catalog:CatalogSnapshot;locale:Locale}){
 // A nonexistent form owner isolates proposal inputs from the enclosing trip form.
 const formOwner=useId(),titleId=useId(),mounted=useRef(false),actionLock=useRef(false);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
 const c=(key:string,values:Record<string,string|number>={})=>packingText(locale,key,values),u=(key:string)=>checklistText(locale,key),n=(value:number)=>new Intl.NumberFormat(locale).format(value);
 const [result,setResult]=useState<{trip:Trip;gear:GearItem[];catalog:CatalogSnapshot;locale:Locale;items:PackingSuggestion[]}|null>(null),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
 const [view,setView]=useState({tripId:trip.id,show:false,expanded:false}),[retained,setRetained]=useState<{tripId:string;decisions:Decision[]}>({tripId:trip.id,decisions:[]}),[feedback,setFeedback]=useState<Feedback|null>(null);
 const show=view.tripId===trip.id&&view.show,expanded=view.tripId===trip.id&&view.expanded;
 const current=useRef({trip,gear,catalog,locale});useEffect(()=>{current.current={trip,gear,catalog,locale}},[trip,gear,catalog,locale]);
 useEffect(()=>{let active=true;packingSuggestions(trip,gear,catalog,locale).then(items=>{if(active){setResult({trip,gear,catalog,locale,items});setFeedback(previous=>previous?.tripId===trip.id&&previous.message==='calculating'?null:previous)}}).catch(()=>{if(active)setFeedback({tripId:trip.id,message:'error'})});return()=>{active=false}},[trip,gear,catalog,locale,retry]);
 const fresh=result?.trip===trip&&result?.gear===gear&&result?.catalog===catalog&&result?.locale===locale;
 const items=result?.trip.id===trip.id&&result.locale===locale?result.items:[];
 const stillDecided=(decision:Decision)=>trip.suggestionDecisions?.some(d=>d.key===decision.key&&d.fingerprint===decision.fingerprint&&d.decision===decision.decision)??false;
 const retainedKeys=retained.tripId===trip.id?retained.decisions.filter(stillDecided).map(d=>d.key):[];
 const {pending,candidates,visible}=packingReviewItems(items,trip,show,expanded,retainedKeys),destination=catalog.destinations.find(d=>d.id===trip.destinationId),place=destination?translate(locale,destination.names):c('local');
 const notice=feedback?.tripId===trip.id&&(!feedback.decision||stillDecided(feedback.decision))?feedback:null;
 const sameContext=()=>current.current.trip===trip&&current.current.gear===gear&&current.current.catalog===catalog&&current.current.locale===locale;
 function publish(updated:Trip,s:PackingSuggestion,decision:'accepted'|'dismissed',message:string){
  const record:Decision={key:s.key,fingerprint:s.fingerprint,decision};
  // Block a second action from the previous render until the parent supplies its new draft.
  current.current={trip:updated,gear,catalog,locale};
  setRetained(previous=>({tripId:trip.id,decisions:[...(previous.tripId===trip.id?previous.decisions:[]).filter(d=>d.key!==s.key),record]}));
  onChange(updated);setFeedback({tripId:trip.id,message,label:s.label,decision:record});
 }
 async function apply(s:PackingSuggestion,quantity:number,gearId:string|undefined){
  if(!fresh||actionLock.current||!mounted.current||!sameContext())return;
  actionLock.current=true;setBusy(true);
  try{
   const existing=trip.checklist.some(row=>row.equipmentId===s.equipmentId||row.suggestionKey===s.key);
   const updated=await acceptPackingSuggestion(trip,s,gear,quantity,gearId===undefined?undefined:gearId||null);
   if(!mounted.current)return;
   if(!sameContext())return;
   publish(updated,s,'accepted',existing?'updatedItem':'addedItem');
  }catch{if(mounted.current)setFeedback({tripId:trip.id,message:'error'})}finally{actionLock.current=false;if(mounted.current)setBusy(false)}
 }
 function dismiss(s:PackingSuggestion){
  if(!fresh||actionLock.current||!mounted.current||!sameContext())return;
  actionLock.current=true;
  try{publish(dismissPackingSuggestion(trip,s),s,'dismissed','dismissedItem')}catch{setFeedback({tripId:trip.id,message:'error'})}finally{actionLock.current=false}
 }
 return <section className="packing-panel packing-clear packing-suggestions-view" aria-labelledby={titleId}>
  <header className="packing-header"><div className="packing-heading"><Sparkles size={21} aria-hidden="true"/><h2 id={titleId}>{c('title')}</h2>{pending.length>0&&<span>{n(pending.length)} {u('review')}</span>}</div><p>{c('intro')}</p>{tripDuration(trip)===null&&<p className="packing-dates-note">{c('dates')}</p>}</header>
  <div className="packing-content">
   {notice&&<p className={'packing-feedback'+(notice.message==='error'?' packing-feedback-error':'')} role="status">{notice.decision&&<Check size={18} aria-hidden="true"/>}<span>{c(notice.message,{item:notice.label??''})}</span></p>}
   {!fresh&&<p className="packing-loading" role="status">{c(items.length?'calculating':'loading')}</p>}
   {notice?.message==='error'&&!fresh&&<button className="outline-btn" type="button" onClick={()=>{setFeedback(null);setRetry(value=>value+1)}}>{c('retry')}</button>}
   {fresh&&visible.length===0?<p className="packing-empty">{items.length?u('reviewed'):c('empty')}</p>:visible.length>0&&<>
    <p className="packing-count">{c('reviewCount',{shown:n(visible.length),total:n(candidates.length)})}</p>
    {(['local','terrain-example'] as const).map(coverage=>{const group=visible.filter(s=>(s.destinationSpecific===true||s.coverage==='local')===(coverage==='local'));return group.length>0&&<section className="packing-group" key={coverage} aria-labelledby={titleId+'-'+coverage}><h3 id={titleId+'-'+coverage}>{c(coverage==='local'?'destinationSuggestions':'commonSuggestions',{place})}</h3><ul className="packing-list">{group.map(s=><PackingSuggestionRow formOwner={formOwner} key={trip.id+':'+s.key+':'+s.fingerprint} suggestion={s} trip={trip} gear={gear} catalog={catalog} locale={locale} busy={busy||!fresh} onAccept={(qty,id)=>void apply(s,qty,id)} onDismiss={()=>dismiss(s)}/>)}</ul></section>})}
    {candidates.length>4&&<button className="outline-btn packing-more" type="button" aria-expanded={expanded} onClick={()=>setView({tripId:trip.id,show,expanded:!expanded})}><ChevronDown size={18} aria-hidden="true"/>{expanded?c('fewer'):c('more',{count:n(candidates.length-visible.length)})}</button>}
   </>}
   <label className="packing-checkbox packing-history"><input form={formOwner} type="checkbox" checked={show} onChange={e=>setView({tripId:trip.id,show:e.target.checked,expanded:false})}/>{u('showHandled')}</label>
  </div>
 </section>;
}

export function PackingSuggestionRow({suggestion:s,trip,gear,catalog,locale,busy,onAccept,onDismiss,formOwner}:{suggestion:PackingSuggestion;trip:Trip;gear:GearItem[];catalog:CatalogSnapshot;locale:Locale;busy:boolean;formOwner:string;onAccept:(qty:number,id:string|undefined)=>void;onDismiss:()=>void}){
 const c=(key:string,values:Record<string,string|number>={})=>packingText(locale,key,values),u=(key:string)=>checklistText(locale,key),id=useId(),n=(value:number)=>new Intl.NumberFormat(locale).format(value);
 const existingRow=trip.checklist.find(row=>row.equipmentId===s.equipmentId||row.suggestionKey===s.key),existing=!!existingRow;
 const baseline=JSON.stringify(existingRow?[existingRow.id,existingRow.requiredQuantity,existingRow.gearId,existingRow.assignedQuantity]:null),defaultQuantity=String(existingRow?.requiredQuantity??s.quantity),defaultGear=existing?'__keep__':'';
 const [draft,setDraft]=useState({baseline,quantity:defaultQuantity,gearId:defaultGear,quantityEdited:false,gearEdited:false});
 const changedBaseline=draft.baseline!==baseline,quantity=changedBaseline&&!draft.quantityEdited?defaultQuantity:draft.quantity,gearId=changedBaseline&&!draft.gearEdited?defaultGear:draft.gearId;
 const editedBaseline=changedBaseline&&(draft.quantityEdited||draft.gearEdited);
 const state=suggestionState(trip,s),usable=availableGear(gear,s.equipmentId,trip),qty=Number(quantity),valid=/^\d+$/.test(quantity)&&Number.isInteger(qty)&&qty>=1&&qty<=10000;
 const unchanged=state==='accepted'&&existingRow?.requiredQuantity===qty&&(gearId==='__keep__'||(gearId||undefined)===existingRow?.gearId);
 const basis=s.quantityBasis==='person'&&trip.groupSize>0?c('personBasis',{each:n(s.quantity/trip.groupSize),people:n(trip.groupSize),total:n(s.quantity)}):s.quantityBasis==='group'?c('groupBasis',{count:n(s.quantity)}):c('planningBasis');
 const supplyNote=s.equipmentId==='water'?'waterCount':s.equipmentId==='food'?'foodCount':null;
 const reduction=existingRow&&qty<Math.max(existingRow.packedQuantity??0,existingRow.assignedQuantity??0);
 const shortReason=s.reason.split('\n').map(reason=>reason.trim()).find(Boolean)??c('planningBasis');
 const action=unchanged?'inList':existing?'updateTotal':'addToList';
 return <li className={'packing-row'+(state==='accepted'?' packing-row-accepted':'')} aria-labelledby={id+'-name'}>
  <div className="packing-row-main"><div className="packing-row-description"><div className="packing-row-top"><h4 id={id+'-name'}>{s.label}</h4>{state!=='new'&&<span className="packing-state">{state==='accepted'&&<Check size={15} aria-hidden="true"/>}{c(state==='changed'?'changedShort':state)}</span>}</div><p className="packing-reason">{shortReason}</p></div>
   <div className="packing-choose"><label htmlFor={id+'-quantity'}>{c(existing?'newTarget':'countToAdd')}<input id={id+'-quantity'} form={formOwner} inputMode="numeric" type="number" min="1" max="10000" step="1" value={quantity} aria-invalid={!valid} aria-describedby={[id+'-basis',...(supplyNote?[id+'-supply']:[]),...(existing?[id+'-target']:[]),...(reduction?[id+'-reduction']:[]),...(editedBaseline?[id+'-changed']:[]),...(!valid?[id+'-invalid']:[])].join(' ')} disabled={busy} onChange={e=>setDraft({baseline:editedBaseline?draft.baseline:baseline,quantity:e.target.value,gearId,quantityEdited:true,gearEdited:draft.gearEdited})}/></label><button type="button" className="primary-btn packing-accept" aria-label={`${c(action)}: ${s.label}`} aria-disabled={busy||!valid||unchanged||editedBaseline} onClick={()=>{if(!busy&&valid&&!unchanged&&!editedBaseline){setDraft({baseline,quantity,gearId,quantityEdited:false,gearEdited:false});onAccept(qty,gearId==='__keep__'?undefined:gearId)}}}>{unchanged?<Check size={18} aria-hidden="true"/>:existing?<RefreshCw size={18} aria-hidden="true"/>:<Plus size={18} aria-hidden="true"/>}{c(action)}</button></div>
  </div>
  <div className="packing-count-notes"><p id={id+'-basis'}>{basis}</p>{existing&&<p id={id+'-target'} className="packing-target-note">{c('updatedCount')}</p>}{supplyNote&&<p id={id+'-supply'} className="packing-supply-note">{c(supplyNote)}</p>}{reduction&&<p id={id+'-reduction'} className="packing-supply-note">{c('reduction')}</p>}{editedBaseline&&<div className="packing-baseline-review"><p id={id+'-changed'}>{c('draftChanged')}</p><div><button type="button" onClick={()=>setDraft({baseline,quantity:defaultQuantity,gearId:defaultGear,quantityEdited:false,gearEdited:false})}>{c('useCurrent')}</button><button type="button" onClick={()=>setDraft({...draft,baseline,quantity,gearId})}>{c('keepEdits')}</button></div></div>}{!valid&&<p id={id+'-invalid'} className="packing-input-error" role="status">{c('needsCount')}</p>}</div>
  <details className="packing-adjust"><summary><SlidersHorizontal size={16} aria-hidden="true"/>{c('adjustDetails')}</summary><div className="packing-detail-content"><div className="packing-detail-reason"><h5>{c('why')}</h5><p>{s.reason}</p><p className="packing-evidence-coverage">{c(s.coverage==='local'?'local':'general')}</p>{s.sourceIds.length>0&&<div className="packing-evidence"><h5>{c('sources')}</h5><ul>{catalog.sources.filter(source=>s.sourceIds.includes(source.id)).map(source=><li key={source.id}><a href={source.url} rel="noreferrer" target="_blank">{source.title}</a><span>{source.reviewedAt}</span></li>)}</ul></div>}</div>
   <div className="packing-inventory"><h5>{c('inventoryOptional')}</h5><p>{s.available>0?`${c('available')}: ${n(s.available)}`:c('inventoryEmpty')}</p><label htmlFor={id+'-gear'}>{c('assign')}<select id={id+'-gear'} form={formOwner} value={gearId} disabled={busy} onChange={e=>setDraft({baseline:editedBaseline?draft.baseline:baseline,quantity,gearId:e.target.value,quantityEdited:draft.quantityEdited,gearEdited:true})}>{existing&&<option value="__keep__">{u('keepLink')}</option>}<option value="">{c('none')}</option>{usable.map(item=><option key={item.id} value={item.id}>{item.name} ({n(item.quantity)})</option>)}</select></label><p className="packing-inventory-note">{c('inventoryExplained')}</p></div>
   <div className="packing-detail-actions"><button type="button" className="packing-dismiss" aria-disabled={busy||state==='dismissed'} onClick={()=>{if(!busy&&state!=='dismissed')onDismiss()}}>{c('dismiss')}</button></div>
  </div></details>
 </li>;
}
