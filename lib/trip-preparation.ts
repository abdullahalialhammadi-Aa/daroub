import { terrains, translate, type Locale } from './terrain';
import { activeDestinations, catalogDestination, seedCatalog } from './catalog-seed';
import { normalizeTrip, validateGear } from './preparation-schema';
import { suggestedGroupSize } from './group-size';
import type { Trip, TerrainId, ChecklistItem, GearItem, CatalogSnapshot } from './toolkit-types';

export function newId(){return crypto.randomUUID()}
export function defaultChecklist(terrainId:TerrainId,locale:Locale,catalog=seedCatalog):ChecklistItem[]{return catalog.packingRules.filter(r=>r.terrainIds.includes(terrainId)&&!r.destinationIds.length&&!r.activities.length&&!r.months.length&&!r.transport.length&&r.coverage==='terrain-example').map(r=>({id:newId(),label:translate(locale,r.label),category:r.category,done:false,kind:'equipment',equipmentId:r.equipmentId,requiredQuantity:Math.max(1,r.baseQuantity),assignedQuantity:0,packedQuantity:0}))}
export function newTrip(locale:Locale,destinationId?:string,catalog:CatalogSnapshot=seedCatalog):Trip{const d=catalogDestination(catalog,destinationId)??activeDestinations(catalog)[0];return{id:newId(),schemaVersion:2,title:d?translate(locale,d.names):translate(locale,terrains[0].names),destinationId:d?.id??null,terrainId:d?.terrainId??'desert',location:{lat:d?.lat??terrains[0].lat,lon:d?.lon??terrains[0].lon},startDate:'',endDate:'',groupSize:suggestedGroupSize(d?.terrainId??'desert',d),transport:'',notes:'',checklist:[],activities:[],itinerary:[],suggestionDecisions:[],catalogRevision:catalog.revision,revision:0,updatedAt:new Date().toISOString()}}
export function validTrip(value:unknown):value is Trip{try{normalizeTrip(value);return true}catch{return false}}
export function copyTrip(trip:Trip):Trip{const copy=structuredClone(normalizeTrip(trip));return{...copy,id:newId(),checklist:copy.checklist.map(i=>({...i,id:newId()})),itinerary:(copy.itinerary??[]).map(d=>({...d,id:newId(),entries:d.entries.map(e=>({...e,id:newId()}))})),revision:0,updatedAt:new Date().toISOString(),conflictOf:undefined}}
export function newGear():GearItem{return{id:newId(),schemaVersion:2,name:'',category:'custom',equipmentId:'custom',quantity:1,condition:'ready',maintenanceDate:'',expiryDate:'',notes:'',archived:false,revision:0,updatedAt:new Date().toISOString()}}
export interface PreparationBundle {trips:Trip[];gear:GearItem[]}
/** Validate the complete input before generating any replacement identities or writing storage. */
export function parsePreparationImport(text:string):PreparationBundle{
 if(new TextEncoder().encode(text).length>4*1024*1024)throw Error('size');const data=JSON.parse(text);
 if(!data||!((data.format==='daroub-trips'&&data.version===1)||(data.format==='daroub-preparation'&&data.version===2))||!Array.isArray(data.trips))throw Error('format');
 const gearInput=data.format==='daroub-trips'?[]:data.gear;if(!Array.isArray(gearInput)||data.trips.length+gearInput.length<1||data.trips.length+gearInput.length>50)throw Error('count');
 const trips:Trip[]=data.trips.map(normalizeTrip),gear:GearItem[]=gearInput.map(validateGear);
 if(new Set(trips.map(t=>t.id)).size!==trips.length||new Set(gear.map(g=>g.id)).size!==gear.length)throw Error('duplicate');
 const ids=new Map(gear.map(g=>[g.id,newId()]));const stamp=new Date().toISOString();
 return{gear:gear.map(g=>({...g,id:ids.get(g.id)!,revision:0,updatedAt:stamp,conflictOf:undefined})),trips:trips.map(t=>{const copy=copyTrip(t);copy.checklist=copy.checklist.map(row=>row.gearId?{...row,gearId:ids.get(row.gearId),assignedQuantity:ids.has(row.gearId)?row.assignedQuantity:0}:row);return copy})};
}
export function parseTripImport(text:string):Trip[]{const result=parsePreparationImport(text);if(result.gear.length)throw Error('gear requires atomic preparation import');return result.trips}
export function exportPreparation(trips:Trip[],gear:GearItem[]=[]){if(trips.length+gear.length>50)throw Error('count');const value=JSON.stringify({format:'daroub-preparation',version:2,trips:trips.map(normalizeTrip),gear:gear.map(validateGear)},null,2);if(new TextEncoder().encode(value).length>4*1024*1024)throw Error('size');return value}
export function exportTrips(trips:Trip[]){return exportPreparation(trips)}
export function escapeHtml(value:string){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
export function downloadText(text:string,name:string,type='text/html;charset=utf-8'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
