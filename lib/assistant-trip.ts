import {normalizeTrip} from './preparation-schema';
import {retrieveGuide,type AssistantRequest} from './assistant-guide';
import {assistantPreparationText as text} from './assistant-preparation-copy';
import {acceptPackingSuggestion,canonical,fingerprint,packingSuggestions,suggestionState,tripContentFingerprint,tripDuration} from './packing-engine';
import {terrains} from './terrain';
import type {AssistantAnswer,AssistantProposal,CatalogSnapshot,GearItem,Trip} from './toolkit-types';

export function requestForTrip(request:AssistantRequest,trip:Trip,catalog:CatalogSnapshot):AssistantRequest{
 const destination=catalog.destinations.find(d=>d.id===trip.destinationId);
 return {...request,destinationId:destination?.id??null,terrainIndex:Math.max(0,terrains.findIndex(t=>t.id===trip.terrainId))};
}
export async function retrieveTripGuide(request:AssistantRequest,trip:Trip,gear:GearItem[],catalog:CatalogSnapshot):Promise<AssistantAnswer>{
 const input=requestForTrip(request,trip,catalog),answer=retrieveGuide(input,catalog),c=(key:string)=>text(request.locale,key),expectedFingerprint=await tripContentFingerprint(trip),proposals:AssistantProposal[]=[];
 const normalized=normalizeTrip(trip),equipment=normalized.checklist.filter(item=>item.kind!=='task'),tasks=normalized.checklist.filter(item=>item.kind==='task'),packed=equipment.reduce((sum,item)=>sum+(item.packedQuantity??0),0),required=equipment.reduce((sum,item)=>sum+(item.requiredQuantity??1),0);
 const summary=`${c('summary')}\n${c('dates')}: ${trip.startDate||c('undated')} — ${trip.endDate||c('undated')}\n${c('group')}: ${trip.groupSize}\n${c('packed')}: ${packed}/${required}\n${c('tasks')}: ${tasks.filter(item=>item.done).length}/${tasks.length}\n${c('days')}: ${trip.itinerary?.length??0}`;
 const topic=request.topic;
 if(topic==='equipment'||topic==='planning'||!topic&&/pack|equipment|gear|تجهيز|معد|matériel|équipement|装备|उपकरण/iu.test(request.question)){
  for(const suggestion of (await packingSuggestions(trip,gear,catalog,request.locale)).filter(s=>suggestionState(trip,s)==='new'||suggestionState(trip,s)==='changed').slice(0,12)){
   if(suggestion.quantity<1||suggestion.quantity>10000||trip.checklist.length>=200&&!trip.checklist.some(item=>item.equipmentId===suggestion.equipmentId||item.suggestionKey===suggestion.key)||(trip.suggestionDecisions?.length??0)>=300&&!trip.suggestionDecisions?.some(d=>d.key===suggestion.key))continue;
   const updated=await acceptPackingSuggestion(trip,suggestion,gear);const item=updated.checklist.find(i=>i.equipmentId===suggestion.equipmentId)!;
   proposals.push({id:'proposal-'+(await fingerprint([trip.id,expectedFingerprint,catalog.revision,suggestion.key])).slice(0,28),type:'add-equipment',tripId:trip.id,expectedRevision:trip.revision,expectedCatalogRevision:catalog.revision,expectedFingerprint,label:suggestion.label+'\n'+suggestion.reason,suggestionDecision:{key:suggestion.key,fingerprint:suggestion.fingerprint,decision:'accepted'},items:[item]});
   suggestion.sourceIds.forEach(id=>{if(!answer.sourceIds.includes(id)&&catalog.sources.some(s=>s.id===id))answer.sourceIds.push(id);});
  }
 }
 if(topic==='planning'&&tripDuration(trip)!==null&&(trip.itinerary??[]).reduce((sum,day)=>sum+day.entries.length,0)<600&&((trip.itinerary??[]).find(day=>day.dayOffset===0)?.entries.length??0)<40&&((trip.itinerary?.length??0)<60||trip.itinerary?.some(day=>day.dayOffset===0))){
  const id='plan-'+(await fingerprint([trip.id,'departure-review'])).slice(0,28);
  if(!(trip.itinerary??[]).some(day=>day.entries.some(entry=>entry.id===id))){
   const destination=catalog.destinations.find(d=>d.id===trip.destinationId);
   proposals.push({id:'proposal-'+(await fingerprint([trip.id,expectedFingerprint,catalog.revision,id])).slice(0,28),type:'add-itinerary',tripId:trip.id,expectedRevision:trip.revision,expectedCatalogRevision:catalog.revision,expectedFingerprint,label:c('itinerary'),dayOffset:0,entry:{id,title:c('itineraryTitle'),activityId:'preparation',place:'',startTime:'',timeZone:destination?.timezone??'',durationMinutes:30,transport:'',notes:c('itineraryNote')}});
  }
 }
 return {...answer,sources:catalog.sources.filter(source=>answer.sourceIds.includes(source.id)),text:summary+'\n\n'+answer.text,proposals,tripContext:{id:trip.id,title:trip.title,revision:trip.revision},catalogRevision:catalog.revision};
}
/** A proposal describes a click action; it never writes or executes provider output. */
export async function applyAssistantProposal(trip:Trip,proposal:AssistantProposal,quantity?:number,catalogRevision?:number):Promise<Trip>{
 assertProposalCatalog(proposal,catalogRevision);
 if(trip.id!==proposal.tripId)throw Error('Stale proposal');
 if(trip.revision!==proposal.expectedRevision||!proposal.expectedFingerprint||await tripContentFingerprint(trip)!==proposal.expectedFingerprint)throw Error('Stale proposal');
 if(proposal.type==='add-equipment'){
  if(!proposal.items?.length||proposal.items.length>20)throw Error('Invalid proposal');
  const checklist=[...trip.checklist];for(const suggested of proposal.items){
   const amount=quantity??suggested.requiredQuantity??1;if(!Number.isInteger(amount)||amount<1||amount>10000)throw Error('Invalid quantity');
   const index=checklist.findIndex(item=>item.id===suggested.id||item.equipmentId&&item.equipmentId===suggested.equipmentId||item.suggestionKey&&item.suggestionKey===suggested.suggestionKey),existing=index>=0?checklist[index]:null;
   const packed=Math.min(amount,existing?.packedQuantity??(existing?.done?existing.requiredQuantity??1:0));
   const item={...suggested,...existing,id:existing?.id??suggested.id,kind:'equipment' as const,equipmentId:suggested.equipmentId,suggestionKey:suggested.suggestionKey,requiredQuantity:amount,packedQuantity:packed,assignedQuantity:Math.min(amount,existing?.assignedQuantity??0),done:packed>=amount};
   if(index>=0)checklist[index]=item;else checklist.push(item);
  }
  if(checklist.length>200)throw Error('Checklist limit');
  const decisions=trip.suggestionDecisions??[],suggestionDecisions=proposal.suggestionDecision?[...decisions.filter(d=>d.key!==proposal.suggestionDecision!.key),proposal.suggestionDecision]:decisions;
  if(suggestionDecisions.length>300)throw Error('Suggestion limit');
  return {...trip,schemaVersion:2,checklist,suggestionDecisions,catalogRevision:proposal.expectedCatalogRevision};
 }
 if(proposal.type==='add-itinerary'&&proposal.entry&&Number.isInteger(proposal.dayOffset)&&proposal.dayOffset!>=0&&proposal.dayOffset!<=(tripDuration(trip)??0)-1){
  const itinerary=structuredClone(trip.itinerary??[]),found=itinerary.flatMap(day=>day.entries).find(entry=>entry.id===proposal.entry!.id);
  if(found){if(canonical(found)===canonical(proposal.entry))return trip;throw Error('Entry conflict');}
  let day=itinerary.find(row=>row.dayOffset===proposal.dayOffset);if(!day){day={id:'day-'+(await fingerprint([trip.id,proposal.dayOffset])).slice(0,28),dayOffset:proposal.dayOffset!,entries:[]};itinerary.push(day);}
  if(day.entries.length>=40||itinerary.length>60||itinerary.reduce((sum,row)=>sum+row.entries.length,0)>=600)throw Error('Itinerary limit');
  day.entries.push(proposal.entry);itinerary.sort((a,b)=>a.dayOffset-b.dayOffset);return {...trip,schemaVersion:2,itinerary,catalogRevision:proposal.expectedCatalogRevision};
 }
 throw Error('Invalid proposal');
}

/** The caller supplies a freshly checked publication revision, or the explicitly identified offline copy. */
export function assertProposalCatalog(proposal:AssistantProposal,revision:number|undefined){
 if(!Number.isSafeInteger(proposal.expectedCatalogRevision)||!Number.isSafeInteger(revision)||proposal.expectedCatalogRevision!==revision)throw Error('Catalog changed');
}
export async function checkProposalCatalog(proposal:AssistantProposal,catalog:CatalogSnapshot,online:boolean,fetcher:typeof fetch=fetch):Promise<{revision:number;offline:boolean}>{
 if(proposal.expectedCatalogRevision!==undefined&&catalog.revision>proposal.expectedCatalogRevision)throw Error('Catalog changed');
 if(!online){assertProposalCatalog(proposal,catalog.revision);return {revision:catalog.revision,offline:true};}
 let revision:number;
 try{const response=await fetcher('/api/catalog',{cache:'no-store',signal:AbortSignal.timeout(6000)});if(!response.ok)throw Error();const snapshot=await response.json() as CatalogSnapshot;if(snapshot.schemaVersion!==1||!Number.isSafeInteger(snapshot.revision))throw Error();revision=snapshot.revision;}catch{throw Error('Catalog unavailable');}
 assertProposalCatalog(proposal,revision);return {revision,offline:false};
}
