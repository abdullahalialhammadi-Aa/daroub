import {normalizeTrip} from './preparation-schema';
import { translate, type Locale } from './terrain';
import type { CatalogSnapshot, ChecklistItem, GearItem, PackingSuggestion, Trip } from './toolkit-types';

export function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',') + '}';
  return JSON.stringify(value) ?? 'null';
}
export async function fingerprint(value: unknown): Promise<string> {
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(value)));
  return Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
}
export function tripContentFingerprint(trip:Trip){const content={...normalizeTrip(trip)} as Partial<Trip>;delete content.updatedAt;delete content.revision;return fingerprint(content);}
export function tripDuration(trip: Trip): number | null {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(trip.startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(trip.endDate))return null;
  const first=Date.parse(trip.startDate+'T00:00:00Z'),last=Date.parse(trip.endDate+'T00:00:00Z');
  return Number.isFinite(first)&&Number.isFinite(last)&&new Date(first).toISOString().slice(0,10)===trip.startDate&&new Date(last).toISOString().slice(0,10)===trip.endDate&&last>=first?Math.floor((last-first)/86400000)+1:null;
}
export function tripMonths(trip:Trip):number[]{
  const days=tripDuration(trip);if(days===null)return [];
  if(days>=366)return Array.from({length:12},(_,i)=>i+1);
  const months=new Set<number>();const first=Date.parse(trip.startDate+'T00:00:00Z');
  for(let day=0;day<days;day++)months.add(new Date(first+day*86400000).getUTCMonth()+1);
  return [...months].sort((a,b)=>a-b);
}
export function gearUsable(gear:GearItem,trip:Trip,today=new Date().toISOString().slice(0,10)){
  const through=trip.endDate||trip.startDate||today;
  return !gear.archived&&gear.condition==='ready'&&gear.quantity>0&&(!gear.expiryDate||gear.expiryDate>=through)&&(!gear.maintenanceDate||gear.maintenanceDate>through);
}
export function availableGear(gear:GearItem[],equipmentId:string,trip:Trip,today?:string){return gear.filter(item=>item.equipmentId===equipmentId&&gearUsable(item,trip,today));}
function transportMatches(value:string,options:string[]){
  if(!options.length)return true;const text=value.trim().normalize('NFKC').toLowerCase();
  const aliases:Record<string,RegExp>={car:/car|driv|voiture|سيار|汽车|कार/iu,'4x4':/4x4|4×4|دفع رباعي|四驱/iu,boat:/boat|boating|bateau|قارب|مركب|船|नाव/iu,'on-foot':/on-foot|walk|hiking|à pied|مشي|سير|步行|पैदल/iu,public:/public|bus|train|حافل|قطار|公共|बस|रेल/iu};
  return options.some(option=>text===option.toLowerCase()||!!aliases[option]?.test(text));
}
export async function packingSuggestions(trip:Trip,gear:GearItem[],catalog:CatalogSnapshot,locale:Locale):Promise<PackingSuggestion[]>{
  const months=tripMonths(trip),days=tripDuration(trip),activities=new Set([...(trip.activities??[]),...(trip.itinerary??[]).flatMap(day=>day.entries.map(entry=>entry.activityId))]);
  const matches=catalog.packingRules.filter(rule=>
    (!rule.terrainIds.length||rule.terrainIds.includes(trip.terrainId))&&
    (!rule.destinationIds.length||!!trip.destinationId&&rule.destinationIds.includes(trip.destinationId))&&
    // Local rules must name the verified destination; arbitrary coordinates never inherit them.
    (rule.coverage!=='local'||!!trip.destinationId&&rule.destinationIds.includes(trip.destinationId))&&
    (!rule.activities.length||rule.activities.some(activity=>activities.has(activity)))&&
    (!rule.months.length||rule.months.some(month=>months.includes(month)))&&
    (rule.minDays<=1||days!==null&&days>=rule.minDays)&&transportMatches(trip.transport,rule.transport));
  const groups=new Map<string,typeof matches>();for(const rule of matches){const group=groups.get(rule.equipmentId)??[];group.push(rule);groups.set(rule.equipmentId,group);}
  return Promise.all([...groups].sort(([a],[b])=>a.localeCompare(b)).map(async([equipmentId,rules])=>{
    rules.sort((a,b)=>Number(b.destinationIds.length>0)-Number(a.destinationIds.length>0)||a.id.localeCompare(b.id));const quantity=Math.max(...rules.map(rule=>rule.baseQuantity*(rule.perPerson?trip.groupSize:1)));
    const available=availableGear(gear,equipmentId,trip).reduce((sum,item)=>sum+item.quantity,0);
    const relevant={catalogRevision:catalog.revision,rules:rules.map(rule=>[rule.id,rule.version]),destinationId:trip.destinationId,terrain:trip.terrainId,months,days,activities:[...activities].sort(),transport:trip.transport.trim(),groupSize:trip.groupSize,quantity,available};
    return {key:'equipment:'+equipmentId,fingerprint:await fingerprint(relevant),equipmentId,label:translate(locale,rules[0].label),category:rules[0].category,quantity,quantityBasis:rules.find(rule=>rule.baseQuantity*(rule.perPerson?trip.groupSize:1)===quantity)?.perPerson?'person':'group',destinationSpecific:rules.some(rule=>!!trip.destinationId&&rule.destinationIds.includes(trip.destinationId)),available,reason:rules.map(rule=>translate(locale,rule.reason)).filter((text,index,all)=>all.indexOf(text)===index).join('\n'),sourceIds:[...new Set(rules.flatMap(rule=>rule.sourceIds))],catalogRevision:catalog.revision,coverage:rules.some(rule=>rule.coverage==='local')?'local':'terrain-example'};
  }));
}
export function suggestionState(trip:Trip,suggestion:PackingSuggestion):'new'|'accepted'|'dismissed'|'changed'{
  const decision=trip.suggestionDecisions?.find(item=>item.key===suggestion.key);
  return decision?decision.fingerprint===suggestion.fingerprint?decision.decision:'changed':'new';
}
function decide(trip:Trip,suggestion:PackingSuggestion,decision:'accepted'|'dismissed'):Trip{
  const decisions=(trip.suggestionDecisions??[]).filter(item=>item.key!==suggestion.key);
  if(decisions.length>=300)throw Error('Suggestion limit');
  return {...trip,schemaVersion:2,catalogRevision:suggestion.catalogRevision,suggestionDecisions:[...decisions,{key:suggestion.key,fingerprint:suggestion.fingerprint,decision}]};
}
export function dismissPackingSuggestion(trip:Trip,suggestion:PackingSuggestion){return decide(trip,suggestion,'dismissed');}
export async function acceptPackingSuggestion(trip:Trip,suggestion:PackingSuggestion,gear:GearItem[],quantity=suggestion.quantity,gearId?:string|null):Promise<Trip>{
  if(!Number.isInteger(quantity)||quantity<1||quantity>10000)throw Error('Invalid quantity');
  const selected=gearId?gear.find(item=>item.id===gearId):undefined;
  if(gearId&&(!selected||selected.equipmentId!==suggestion.equipmentId||!gearUsable(selected!,trip)))throw Error('Gear unavailable');
  const existing=trip.checklist.find(item=>item.equipmentId===suggestion.equipmentId||item.suggestionKey===suggestion.key);
  if(!existing&&trip.checklist.length>=200)throw Error('Checklist limit');
  const packed=Math.min(quantity,existing?.packedQuantity??(existing?.done?(existing.requiredQuantity??1):0));
  const item:ChecklistItem={...existing,id:existing?.id??'pack-'+(await fingerprint([trip.id,suggestion.equipmentId])).slice(0,28),label:existing?.label??suggestion.label,category:existing?.category??suggestion.category,kind:'equipment',equipmentId:suggestion.equipmentId,suggestionKey:suggestion.key,requiredQuantity:quantity,packedQuantity:packed,done:packed>=quantity,assignedQuantity:selected?Math.min(selected.quantity,quantity):existing?.assignedQuantity?Math.min(existing.assignedQuantity,quantity):0};
  if(gearId===null){delete item.gearId;item.assignedQuantity=0;}
  if(selected){item.gearId=selected.id;item.gearSnapshot={name:selected.name,quantity:selected.quantity,condition:selected.condition};}
  const updated=decide(trip,suggestion,'accepted');
  return {...updated,checklist:existing?trip.checklist.map(row=>row.id===existing.id?item:row):[...trip.checklist,item]};
}
