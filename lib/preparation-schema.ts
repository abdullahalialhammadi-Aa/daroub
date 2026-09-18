import {z} from 'zod';
import type {Trip,GearItem} from './toolkit-types';
export const recordId=z.string().regex(/^[a-zA-Z0-9_-]{1,120}$/);
export const calendarDate=z.string().refine(value=>value===''||(/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value),'Invalid calendar date');
const text=(max:number)=>z.string().max(max);
const name=(max:number)=>text(max).refine(v=>!!v.trim());
export const coordinates=z.object({lat:z.number().finite().min(-90).max(90),lon:z.number().finite().min(-180).max(180)});
export const terrainId=z.enum(['desert','mountain','forest','coast']);
const quantity=z.number().int().min(0).max(10000);
const condition=z.enum(['ready','needs-maintenance','unavailable']);
const checklist=z.object({id:recordId,label:name(300),category:text(80),done:z.boolean(),kind:z.enum(['task','equipment']).optional(),equipmentId:recordId.optional(),gearId:recordId.optional(),requiredQuantity:quantity.min(1).optional(),assignedQuantity:quantity.optional(),packedQuantity:quantity.optional(),gearSnapshot:z.object({name:name(160),quantity,condition}).optional(),suggestionKey:text(240).optional()});
export function validTimeZone(value:string){try{new Intl.DateTimeFormat('en',{timeZone:value});return !!value}catch{return false}}
const entry=z.object({id:recordId,title:name(160),activityId:text(80),place:text(240),coordinates:coordinates.optional(),startTime:z.string().regex(/^(?:|(?:[01]\d|2[0-3]):[0-5]\d)$/),timeZone:text(100),durationMinutes:z.number().int().min(0).max(10080),transport:text(200),notes:text(2000)}).refine(v=>!v.startTime||validTimeZone(v.timeZone),'Timed entries require a valid time zone');
const day=z.object({id:recordId,dayOffset:z.number().int().min(0).max(3650),entries:z.array(entry).max(40)});
const tripSchema=z.object({id:recordId,title:name(160),destinationId:recordId.nullable(),terrainId,location:coordinates,startDate:calendarDate,endDate:calendarDate,groupSize:z.number().int().min(1).max(1000),transport:text(200),notes:text(10000),checklist:z.array(checklist).max(200),revision:z.number().int().nonnegative(),updatedAt:z.string().refine(v=>Number.isFinite(Date.parse(v))),conflictOf:recordId.optional(),schemaVersion:z.literal(2).optional(),activities:z.array(text(80)).max(30).default([]),itinerary:z.array(day).max(60).default([]),suggestionDecisions:z.array(z.object({key:text(240),fingerprint:text(200),decision:z.enum(['accepted','dismissed'])})).max(300).default([]),catalogRevision:z.number().int().nonnegative().default(0)}).refine(v=>!v.startDate||!v.endDate||v.endDate>=v.startDate,'Invalid trip date range');
function unique(values:string[]){if(new Set(values).size!==values.length)throw Error('Duplicate item ID')}
export function normalizeTrip(input:unknown):Trip{
 const parsed=tripSchema.safeParse(input);if(!parsed.success)throw Error('Invalid trip');const trip=parsed.data;unique(trip.checklist.map(i=>i.id));unique(trip.itinerary.map(i=>i.id));unique(trip.itinerary.flatMap(d=>d.entries.map(e=>e.id)));unique(trip.suggestionDecisions.map(i=>i.key));
 if(trip.itinerary.reduce((n,d)=>n+d.entries.length,0)>600)throw Error('Too many itinerary entries');
 const items=trip.checklist.map(item=>{
  if(item.kind==='task')return item;
  const requiredQuantity=item.requiredQuantity??1,assignedQuantity=item.assignedQuantity??0,packedQuantity=item.packedQuantity??(item.done?requiredQuantity:0);
  if(assignedQuantity>requiredQuantity||packedQuantity>requiredQuantity)throw Error('Invalid equipment quantities');
  return {...item,kind:'equipment' as const,requiredQuantity,assignedQuantity,packedQuantity,done:packedQuantity>=requiredQuantity};
 });
 return {...trip,schemaVersion:2,checklist:items};
}
const gearSchema=z.object({id:recordId,schemaVersion:z.literal(2),name:name(160),category:text(80),equipmentId:z.union([recordId,z.literal('')]),quantity,condition,maintenanceDate:calendarDate,expiryDate:calendarDate,notes:text(5000),archived:z.boolean(),revision:z.number().int().nonnegative(),updatedAt:z.string().refine(v=>Number.isFinite(Date.parse(v))),conflictOf:recordId.optional()});
export function validateGear(input:unknown):GearItem{return gearSchema.parse(input)}
export function canonical(value:unknown):string{if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')+'}';return JSON.stringify(value)}
