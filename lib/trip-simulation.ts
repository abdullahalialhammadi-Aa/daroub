import {acceptPackingSuggestion,availableGear,fingerprint,packingSuggestions,tripDuration} from './packing-engine';
import {normalizeTrip} from './preparation-schema';
import type {Locale} from './terrain';
import type {CatalogSnapshot,ChecklistItem,GearItem,PackingSuggestion,Trip} from './toolkit-types';

export interface ScenarioInputs {groupSize:number;startDate:string;endDate:string;activities:string[]}
export interface SimulationRow {
 key:string;equipmentId:string;label:string;before:number;after:number;stockBefore:number;stockAfter:number;
 shortfallBefore:number;shortfallAfter:number;listed:number;increase:number;applyQuantity:number;
 selectable:boolean;blocked:'quantityLimit'|'manualTask'|null;changed:boolean;reason:string;sourceIds:string[];coverage:'local'|'terrain-example';drivers:('groupChange'|'dateChange'|'activityChange')[];
 suggestion?:PackingSuggestion;
}
export interface TripSimulation {
 fingerprint:string;inputs:ScenarioInputs;rows:SimulationRow[];beforeDays:number|null;afterDays:number|null;
 changes:('groupChange'|'dateChange'|'durationChange'|'activityChange')[];datesUnknown:boolean;itineraryDatesMove:boolean;
}
export class SimulationError extends Error {constructor(public code:'invalidDraft'|'invalidScenario'|'stale'|'selection'|'limit'){super(code);}}
export function scenarioInputs(trip:Trip):ScenarioInputs{return{groupSize:trip.groupSize,startDate:trip.startDate,endDate:trip.endDate,activities:[...(trip.activities??[])]};}
function signature(trip:Trip,gear:GearItem[],catalog:CatalogSnapshot){return fingerprint({trip,gear,catalog});}
function matches(row:ChecklistItem,suggestion:{equipmentId:string;key:string}){return row.equipmentId===suggestion.equipmentId||row.suggestionKey===suggestion.key;}
export function scenarioEndDate(startDate:string,duration:number){
 if(!Number.isInteger(duration)||duration<1||duration>3660000||!/^\d{4}-\d{2}-\d{2}$/.test(startDate))throw new SimulationError('invalidScenario');
 const start=Date.parse(startDate+'T00:00:00Z');if(!Number.isFinite(start)||new Date(start).toISOString().slice(0,10)!==startDate)throw new SimulationError('invalidScenario');
 const end=new Date(start+(duration-1)*86400000).toISOString().slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(end))throw new SimulationError('invalidScenario');return end;
}
function scenarioTrip(trip:Trip,inputs:ScenarioInputs){
 if(!Number.isInteger(inputs.groupSize)||inputs.groupSize<1||inputs.groupSize>1000||!Array.isArray(inputs.activities)||inputs.activities.length>30||new Set(inputs.activities).size!==inputs.activities.length)throw new SimulationError('invalidScenario');
 try{return normalizeTrip({...trip,...inputs});}catch{throw new SimulationError('invalidScenario');}
}
export async function simulateTrip(trip:Trip,inputs:ScenarioInputs,gear:GearItem[],catalog:CatalogSnapshot,locale:Locale):Promise<TripSimulation>{
 let base:Trip;try{base=normalizeTrip(trip);}catch{throw new SimulationError('invalidDraft');}
 const scenario=scenarioTrip(base,inputs),[before,after,hash,groupStep,dateStep]=await Promise.all([
  packingSuggestions(base,gear,catalog,locale),packingSuggestions(scenario,gear,catalog,locale),signature(trip,gear,catalog),
  packingSuggestions({...base,groupSize:scenario.groupSize},gear,catalog,locale),
  packingSuggestions({...base,groupSize:scenario.groupSize,startDate:scenario.startDate,endDate:scenario.endDate},gear,catalog,locale),
 ]);
 const previous=new Map(before.map(item=>[item.key,item])),next=new Map(after.map(item=>[item.key,item]));
 const rows=[...new Set([...previous.keys(),...next.keys()])].sort().map(key=>{
  const a=previous.get(key),b=next.get(key),item=b??a!,existing=base.checklist.find(row=>matches(row,item));
  const listed=base.checklist.filter(row=>row.kind!=='task'&&matches(row,item)).reduce((sum,row)=>sum+(row.requiredQuantity??1),0);
  const quantityBefore=a?.quantity??0,quantityAfter=b?.quantity??0,increase=Math.max(0,quantityAfter-listed),applyQuantity=(existing?.requiredQuantity??0)+increase;
  const stockBefore=a?.available??availableGear(gear,item.equipmentId,base).reduce((sum,g)=>sum+g.quantity,0),stockAfter=b?.available??availableGear(gear,item.equipmentId,scenario).reduce((sum,g)=>sum+g.quantity,0);
  const blocked=existing?.kind==='task'?'manualTask':applyQuantity>10000?'quantityLimit':null;
  const group=groupStep.find(value=>value.key===key),date=dateStep.find(value=>value.key===key),drivers:SimulationRow['drivers']=[];
  if((a?.quantity??0)!==(group?.quantity??0))drivers.push('groupChange');
  if((group?.quantity??0)!==(date?.quantity??0)||stockBefore!==stockAfter)drivers.push('dateChange');
  if((date?.quantity??0)!==(b?.quantity??0))drivers.push('activityChange');
  return{key,equipmentId:item.equipmentId,label:existing?.label??item.label,before:quantityBefore,after:quantityAfter,stockBefore,stockAfter,shortfallBefore:Math.max(0,quantityBefore-stockBefore),shortfallAfter:Math.max(0,quantityAfter-stockAfter),listed,increase,applyQuantity,selectable:!!b&&increase>0&&!blocked,blocked,changed:quantityBefore!==quantityAfter||stockBefore!==stockAfter,reason:item.reason,sourceIds:[...new Set([...(a?.sourceIds??[]),...(b?.sourceIds??[])])],coverage:item.coverage,drivers,suggestion:b} satisfies SimulationRow;
 });
 const beforeDays=tripDuration(base),afterDays=tripDuration(scenario),changes:TripSimulation['changes']=[];
 if(base.groupSize!==scenario.groupSize)changes.push('groupChange');
 if(base.startDate!==scenario.startDate||base.endDate!==scenario.endDate)changes.push('dateChange');
 if(beforeDays!==afterDays)changes.push('durationChange');
 if([...base.activities??[]].sort().join('\0')!==[...scenario.activities??[]].sort().join('\0'))changes.push('activityChange');
 return{fingerprint:hash,inputs:scenarioInputs(scenario),rows,beforeDays,afterDays,changes,datesUnknown:beforeDays===null||afterDays===null,itineraryDatesMove:!!base.itinerary?.length&&base.startDate!==scenario.startDate};
}
/** Returns one complete draft only after every selected action succeeds. It never saves or mutates the source. */
export async function applyTripSimulation(trip:Trip,simulation:TripSimulation,keys:string[],gear:GearItem[],catalog:CatalogSnapshot):Promise<Trip>{
 if(await signature(trip,gear,catalog)!==simulation.fingerprint)throw new SimulationError('stale');
 if(new Set(keys).size!==keys.length||keys.some(key=>!simulation.rows.some(row=>row.key===key&&row.selectable)))throw new SimulationError('selection');
 let next=scenarioTrip(trip,simulation.inputs);
 for(const key of keys){
  const row=simulation.rows.find(item=>item.key===key)!;
  try{next=await acceptPackingSuggestion(next,row.suggestion!,gear,row.applyQuantity,undefined);}catch{throw new SimulationError('limit');}
 }
 return normalizeTrip(next);
}
