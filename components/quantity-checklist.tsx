'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Check,Plus,Minus,Search,ChevronDown,Undo2,Trash2,PackageCheck,Save,Pencil,HelpCircle,AlertCircle} from 'lucide-react';
import {focusAfterRender} from '@/lib/preparation-focus';
import {prepText} from '@/lib/preparation-copy';
import {releaseText} from '@/lib/preparation-release-copy';
import {checklistText} from '@/lib/checklist-copy';
import {invalidChecklistItem,itemPacked,packingCounts,withPacked} from '@/lib/checklist-view';
import {allocationWarnings} from '@/lib/itinerary';
import type {Locale} from '@/lib/terrain';
import type {ChecklistItem,GearItem,Trip} from '@/lib/toolkit-types';

function PackToggle({checked,mixed,label,id,onChange}:{checked:boolean;mixed:boolean;label:string;id:string;onChange:()=>void}){
 const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(input.current)input.current.indeterminate=mixed},[mixed]);
 return <label className="kit-pack-control"><input ref={input} id={id} className="kit-check" type="checkbox" checked={checked} aria-label={label} onChange={onChange}/></label>;
}

export function QuantityChecklist({trip,onChange,gear,trips,locale,dirty=false,canSave=true,showSave=true}:{trip:Trip;onChange:(trip:Trip)=>void;gear:GearItem[];trips:Trip[];locale:Locale;dirty?:boolean;canSave?:boolean;showSave?:boolean}){
 const p=(key:string)=>prepText(locale,key),r=(key:string)=>releaseText(locale,key),c=(key:string,values:Record<string,string|number>={})=>checklistText(locale,key,values),n=(value:number)=>new Intl.NumberFormat(locale).format(value);
 const [label,setLabel]=useState(''),[kind,setKind]=useState<'task'|'equipment'>('equipment'),[filter,setFilter]=useState('all'),[query,setQuery]=useState(''),[announcement,setAnnouncement]=useState(''),[openRows,setOpenRows]=useState<string[]>([]),[removed,setRemoved]=useState<{row:ChecklistItem;index:number}|null>(null);
 const formOwner=useId(),counts=packingCounts(trip.checklist),allComplete=counts.items>0&&counts.complete===counts.items;
 const matches=(row:ChecklistItem)=>row.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())&&(filter==='all'||(filter==='packed'?itemPacked(row):!itemPacked(row)));
 const visible=trip.checklist.filter(row=>matches(row)||openRows.includes(row.id)||invalidChecklistItem(row));
 const update=(id:string,patch:Partial<ChecklistItem>)=>onChange({...trip,checklist:trip.checklist.map(row=>row.id===id?{...row,...patch}:row)});
 const filterFocus=()=>focusAfterRender('kit-filter-'+filter);
 function changePacked(row:ChecklistItem,quantity:number){const next=withPacked(row,quantity);if(next===row)return;update(row.id,next);if(!matches(next)&&!openRows.includes(row.id))filterFocus();}
 function toggle(row:ChecklistItem){
  const next=row.kind==='equipment'?withPacked(row,itemPacked(row)?0:row.requiredQuantity!):{...row,done:!row.done};
  update(row.id,next);setAnnouncement(row.label+': '+c(itemPacked(next)?'packed':'remaining'));if(!matches(next)&&!openRows.includes(row.id))filterFocus();
 }
 function add(){
  if(!label.trim()||trip.checklist.length>=200)return;
  const id=crypto.randomUUID(),name=label.trim();
  onChange({...trip,checklist:[...trip.checklist,{id,label:name,category:'custom',kind,done:false,...(kind==='equipment'?{requiredQuantity:1,assignedQuantity:0,packedQuantity:0}:{})}]});
  setLabel('');setQuery('');setFilter('all');setAnnouncement(r('itemAdded')+': '+name);focusAfterRender('kit-check-'+id);
 }
 function remove(row:ChecklistItem){
  setRemoved({row:structuredClone(row),index:trip.checklist.findIndex(item=>item.id===row.id)});
  onChange({...trip,checklist:trip.checklist.filter(item=>item.id!==row.id)});setOpenRows(ids=>ids.filter(id=>id!==row.id));setAnnouncement(r('itemRemoved')+': '+row.label);focusAfterRender('kit-undo');
 }
 function undo(){
  if(!removed||trip.checklist.length>=200||trip.checklist.some(row=>row.id===removed.row.id))return;
  const rows=[...trip.checklist];rows.splice(Math.min(removed.index,rows.length),0,removed.row);onChange({...trip,checklist:rows});setQuery('');setFilter('all');setAnnouncement(c('restored'));focusAfterRender('kit-check-'+removed.row.id);setRemoved(null);
 }
 return <section className="kit" aria-labelledby="kit-title" dir={locale==='ar'?'rtl':'ltr'}>
  <div className="kit-heading"><div><h3 id="kit-title"><PackageCheck size={23} aria-hidden="true"/>{p('checklist')}</h3><p className="kit-progress-label">{c('completeCount',{done:n(counts.complete),total:n(counts.items)})}</p></div>{allComplete&&<span className="kit-ready"><Check size={17} aria-hidden="true"/>{c('ready')}</span>}</div>
  {counts.items>0&&<progress className="kit-progress" value={counts.complete} max={counts.items} aria-label={c('items')} aria-valuetext={c('completeCount',{done:n(counts.complete),total:n(counts.items)})}/>}
  <div className="kit-add"><label><span>{c('newItem')}</span><input form={formOwner} id="checklist-add-label" value={label} maxLength={300} placeholder={c('example')} onChange={e=>setLabel(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add()}}}/></label><label><span className="sr-only">{c('itemType')}</span><select form={formOwner} value={kind} onChange={e=>setKind(e.target.value as 'task'|'equipment')}><option value="equipment">{r('equipment')}</option><option value="task">{r('task')}</option></select></label><button className="kit-add-button" type="button" disabled={!label.trim()||trip.checklist.length>=200} onClick={add}><Plus size={17} aria-hidden="true"/>{r('addRow')}</button></div>{trip.checklist.length>=200&&<p role="status">{c('limit')}</p>}
  <div className="kit-tools"><div className="kit-filters" role="group" aria-label={p('checklist')}>{['all','remaining','packed'].map(value=><button id={'kit-filter-'+value} key={value} type="button" aria-pressed={filter===value} onClick={()=>{setFilter(value);setOpenRows([])}}>{c(value)} <bdi>{n(value==='all'?counts.items:value==='packed'?counts.complete:counts.items-counts.complete)}</bdi></button>)}</div><label className="kit-search"><Search size={17} aria-hidden="true"/><input form={formOwner} type="search" aria-label={c('search')} placeholder={c('search')} value={query} onChange={e=>{setQuery(e.target.value);setOpenRows([])}}/></label></div>
  <p className="sr-only" role="status" aria-atomic="true">{announcement}</p>
  {removed&&<div className="kit-undo" role="status"><span>{r('itemRemoved')}: {removed.row.label}</span><button id="kit-undo" type="button" onClick={undo} disabled={trip.checklist.length>=200||trip.checklist.some(row=>row.id===removed.row.id)}><Undo2 size={16} aria-hidden="true"/>{c('undo')}</button></div>}
  {trip.checklist.length===0?<div className="kit-empty"><PackageCheck size={28} aria-hidden="true"/><strong>{c('empty')}</strong><p>{c('emptyHelp')}</p></div>:visible.length===0?<div className="kit-empty"><p>{c('noMatch')}</p><button className="outline-btn" type="button" onClick={()=>{setFilter('all');setQuery('')}}>{c('reset')}</button></div>:<ul className="kit-list">{visible.map(row=>{
   const isGear=row.kind==='equipment',complete=itemPacked(row),warnings=allocationWarnings(trip,row,gear,trips),linked=gear.find(g=>g.id===row.gearId);
   const validRequired=Number.isInteger(row.requiredQuantity)&&row.requiredQuantity!>=1&&row.requiredQuantity!<=10000;
   const validPacked=Number.isInteger(row.packedQuantity)&&row.packedQuantity!>=0&&row.packedQuantity!<=row.requiredQuantity!;
   const invalidAssigned=!Number.isInteger(row.assignedQuantity)||row.assignedQuantity!<0||(validRequired&&row.assignedQuantity!>row.requiredQuantity!);
   const invalid=invalidChecklistItem(row);
   const open=openRows.includes(row.id)||invalid;
   return <li key={row.id} className={'kit-item'+(complete?' is-packed':'')}>
    <div className="kit-row"><PackToggle id={'kit-check-'+row.id} checked={complete} mixed={isGear&&!complete&&(row.packedQuantity??0)>0} label={`${c(isGear?(complete?'unmark':'mark'):(complete?'unmarkTask':'markTask'))}: ${row.label}`} onChange={()=>toggle(row)}/><div className="kit-item-name"><strong>{row.label||r('name')}</strong><div className="kit-item-status"><span>{isGear?c('packedCount',{packed:Number.isFinite(row.packedQuantity)?n(row.packedQuantity!):'—',required:Number.isFinite(row.requiredQuantity)?n(row.requiredQuantity!):'—'}):c('task')+' · '+c(complete?'packed':'remaining')}</span>{warnings.length>0&&<span className="kit-review"><AlertCircle size={13} aria-hidden="true"/>{c('warning')}</span>}</div></div>
     {isGear?<div className="kit-quantity"><div className="kit-stepper"><button type="button" aria-label={`${c('decrease')}: ${row.label}`} disabled={!validRequired||!validPacked||row.packedQuantity===0} onClick={()=>changePacked(row,row.packedQuantity!-1)}><Minus size={16} aria-hidden="true"/></button><label><span className="sr-only">{r('packed')}: {row.label}</span><input type="number" inputMode="numeric" min="0" max={validRequired?row.requiredQuantity:10000} step="1" required value={Number.isFinite(row.packedQuantity)?row.packedQuantity:''} onChange={e=>{const n=e.target.value===''?NaN:Number(e.target.value);if(validRequired&&Number.isInteger(n)&&n>=0&&n<=row.requiredQuantity!)changePacked(row,n);else update(row.id,{packedQuantity:n,done:false})}}/></label><button type="button" aria-label={`${c('increase')}: ${row.label}`} disabled={!validRequired||!validPacked||row.packedQuantity!>=row.requiredQuantity!} onClick={()=>changePacked(row,row.packedQuantity!+1)}><Plus size={16} aria-hidden="true"/></button></div></div>:<span className="kit-task-mark" aria-hidden="true">{complete&&<Check size={19}/>}</span>}
     <button className="kit-expand" type="button" aria-expanded={open} aria-controls={'kit-detail-'+row.id} aria-label={`${c('edit')}: ${row.label}`} onClick={()=>{setOpenRows(ids=>open?ids.filter(id=>id!==row.id):[...ids,row.id]);if(open&&!matches(row))filterFocus()}}><Pencil size={15} aria-hidden="true"/><span>{c('edit')}</span><ChevronDown size={15} aria-hidden="true"/></button>
    </div>
    {open&&<div id={'kit-detail-'+row.id} className="kit-detail"><div className="prep-fields"><label className="prep-wide">{r('name')}<input id={'checklist-name-'+row.id} value={row.label} maxLength={300} pattern={String.raw`.*\S.*`} required onChange={e=>update(row.id,{label:e.target.value})}/></label>{isGear&&<label className="prep-wide">{c('planned')}<input type="number" inputMode="numeric" min="1" max="10000" step="1" required value={Number.isFinite(row.requiredQuantity)?row.requiredQuantity:''} onChange={e=>update(row.id,{requiredQuantity:e.target.value===''?NaN:Number(e.target.value)})}/><small>{c('plannedHelp')}</small></label>}</div>
     {invalid&&<p className="prep-warning">{c('invalid')}</p>}
     {isGear&&<details className="kit-inventory" open={warnings.length>0||invalidAssigned}><summary>{c('inventoryOptional')}</summary><p>{c('inventoryHelp')}</p><div className="prep-fields"><label className="prep-wide">{r('linkGear')}<select value={row.gearId??''} onChange={e=>{const g=gear.find(i=>i.id===e.target.value);update(row.id,g?{gearId:g.id,gearSnapshot:{name:g.name,quantity:g.quantity,condition:g.condition}}:{gearId:undefined,assignedQuantity:0})}}><option value="">{r('noLink')}</option>{row.gearId&&!linked&&<option value={row.gearId}>{row.gearSnapshot?.name??c('unavailableEquipment')} · {r('gearUnavailable')}</option>}{gear.filter(g=>!g.archived||g.id===row.gearId).map(g=><option key={g.id} value={g.id}>{g.name} ({n(g.quantity)}) · {r(g.condition)}</option>)}</select></label>{row.gearId&&<label className="prep-wide">{c('reserved')}<input type="number" inputMode="numeric" min="0" max={validRequired?row.requiredQuantity:10000} step="1" required value={Number.isFinite(row.assignedQuantity)?row.assignedQuantity:''} onChange={e=>update(row.id,{assignedQuantity:e.target.value===''?NaN:Number(e.target.value)})}/>{linked&&<small>{c('availableCount',{count:n(linked.quantity)})}</small>}</label>}</div>
     {!row.gearId&&invalidAssigned&&<button type="button" className="outline-btn" onClick={()=>update(row.id,{assignedQuantity:0})}>{c('clearReservation')}</button>}{warnings.length>0&&<ul className="prep-warning-list">{warnings.map(key=><li className="prep-warning" key={key}>{r(key)}</li>)}</ul>}{warnings.includes('snapshotChanged')&&row.gearSnapshot&&linked&&<div className="prep-release-note"><p>{r('snapshot')}: {row.gearSnapshot.name} · {r('quantity')}: {row.gearSnapshot.quantity} · {r(row.gearSnapshot.condition)}</p><p>{r('current')}: {linked.name} · {r('quantity')}: {linked.quantity} · {r(linked.condition)}</p><button className="outline-btn" type="button" onClick={()=>update(row.id,{gearSnapshot:{name:linked.name,quantity:linked.quantity,condition:linked.condition}})}>{r('refreshSnapshot')}</button></div>}</details>}
     <button className="kit-remove" type="button" aria-label={p('remove')+': '+row.label} onClick={()=>remove(row)}><Trash2 size={16} aria-hidden="true"/>{p('remove')}</button></div>}
   </li>;
  })}</ul>}

  <details className="kit-guide"><summary><HelpCircle size={16} aria-hidden="true"/>{c('help')}</summary><p>{c('progressHelp')}</p><p>{c('countExample')}</p><dl><div><dt>{c('planned')}</dt><dd>{c('plannedHelp')}</dd></div><div><dt>{c('packedLabel')}</dt><dd>{c('packedHelp')}</dd></div><div><dt>{c('inventoryOptional')}</dt><dd>{c('inventoryHelp')}</dd></div></dl><p>{c('unitsNote')}</p><p>{c('note')}</p><p>{c('removeHint')}</p></details>{showSave&&<div className="kit-save"><span>{c(dirty?'saveHint':'saved')}</span><button type="submit" className="primary-btn" disabled={!canSave||!dirty}><Save size={17} aria-hidden="true"/>{c('save')}</button></div>}
 </section>;
}
