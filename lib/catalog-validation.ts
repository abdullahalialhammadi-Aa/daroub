import {z} from 'zod';
import {calendarDate,coordinates,recordId,terrainId,validTimeZone,canonical} from './preparation-schema';
import type {CatalogSnapshot,CatalogDraft} from './toolkit-types';
import type {Locale} from './terrain';
const localized=(max:number)=>z.tuple([z.string().max(max),z.string().max(max),z.string().max(max),z.string().max(max),z.string().max(max)]);
const refs=z.array(recordId).max(300);
export function safeSourceUrl(value:string){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname.includes('.')&&!u.hostname.endsWith('.local')&&!u.hostname.endsWith('.internal')&&!/^[\d.:\[\]]+$/.test(u.hostname)&&u.hostname!=='localhost'}catch{return false}}
const url=z.string().max(2048).refine(safeSourceUrl);
const image=z.string().max(2048).refine(v=>/^\/(?!\/)[\w/.-]+$/.test(v)||safeSourceUrl(v));
const section=z.object({id:recordId,title:localized(160),body:localized(10000),sourceIds:refs});
const source=z.object({id:recordId,title:z.string().min(1).max(300),url,reviewedAt:calendarDate.refine(Boolean)});
const species=z.object({id:recordId,name:localized(160),description:localized(10000),precaution:localized(10000),sourceIds:refs,coverage:z.enum(['local','terrain-example'])});
const destination=z.object({id:recordId,terrainId,terrainIndex:z.number().int().min(0).max(3),names:localized(160),summary:localized(2000),image,imageIsIllustrative:z.boolean(),sourceIds:refs,sections:z.array(section).min(1).max(30),species:z.array(species).max(100),lat:coordinates.shape.lat,lon:coordinates.shape.lon,timezone:z.string().refine(validTimeZone).optional(),archived:z.boolean().optional(),country:z.string().regex(/^[A-Z]{2}$/).optional()});
const rule=z.object({id:recordId,version:z.number().int().min(1),equipmentId:recordId,label:localized(300),category:z.string().max(80),terrainIds:z.array(terrainId).max(4),activities:z.array(z.string().max(80)).max(30),months:z.array(z.number().int().min(1).max(12)).max(12),minDays:z.number().int().min(0).max(3650),transport:z.array(z.string().max(200)).max(30),baseQuantity:z.number().int().min(1).max(10000),perPerson:z.boolean(),reason:localized(2000),sourceIds:refs,coverage:z.enum(['local','terrain-example']),destinationIds:z.array(recordId).max(100)});
const schema=z.object({schemaVersion:z.literal(1),revision:z.number().int().nonnegative(),publishedAt:z.string().max(60),destinations:z.array(destination).min(4).max(100),sources:z.array(source).max(300),terrainGuidance:z.array(z.object({terrainId,sections:z.array(section).min(1).max(30),clothing:localized(10000),transport:localized(10000),group:localized(2000)})).length(4),packingRules:z.array(rule).max(300)});
const terrainIds=['desert','mountain','forest','coast'];
function unique(values:string[]){if(new Set(values).size!==values.length)throw Error('Duplicate ID')}
export function validateCatalog(input:unknown,publishing=false):CatalogSnapshot{
 if(new TextEncoder().encode(JSON.stringify(input)).length>1500000)throw Error('Catalog exceeds storage limit');
 const value=schema.parse(input);unique(value.destinations.map(d=>d.id));unique(value.sources.map(s=>s.id));unique(value.packingRules.map(r=>r.id));unique(value.terrainGuidance.map(t=>t.terrainId));
 const sourceIds=new Set(value.sources.map(s=>s.id)),destinations=new Set(value.destinations.map(d=>d.id));
 function references(ids:string[]){if(ids.some(id=>!sourceIds.has(id)))throw Error('Unknown source reference')}
 for(const d of value.destinations){if(terrainIds[d.terrainIndex]!==d.terrainId)throw Error('Terrain mismatch');references(d.sourceIds);unique(d.sections.map(s=>s.id));unique(d.species.map(s=>s.id));for(const s of [...d.sections,...d.species])references(s.sourceIds)}
 for(const t of value.terrainGuidance){unique(t.sections.map(s=>s.id));t.sections.forEach(s=>references(s.sourceIds))}
 for(const r of value.packingRules){references(r.sourceIds);if(r.destinationIds.some(id=>!destinations.has(id)))throw Error('Unknown destination');if(r.coverage==='local'&&!r.destinationIds.length)throw Error('Local rule requires destination')}
 if(!['liwa','jebel-shams','black-forest','hurghada'].every(id=>destinations.has(id)))throw Error('Preserve original destination identifiers');
 if(publishing){
  const visit=(node:unknown)=>{if(Array.isArray(node)){if(node.length===5&&node.every(v=>typeof v==='string')&&node.some(v=>!v.trim()))throw Error('Complete all five translations');node.forEach(visit)}else if(node&&typeof node==='object')Object.values(node).forEach(visit)};visit(value);
  if(value.destinations.some(d=>!d.sourceIds.length||d.species.some(s=>!s.sourceIds.length))||value.packingRules.some(r=>!r.sourceIds.length))throw Error('Sources required');
 }
 return value;
}
export function validateDraft(input:unknown):CatalogDraft{
 const raw=input as CatalogDraft;if(!raw||!recordId.safeParse(raw.id).success||!Number.isSafeInteger(raw.revision)||raw.revision<0||!Number.isSafeInteger(raw.baseCatalogRevision)||raw.baseCatalogRevision<0||!Array.isArray(raw.reviewedLocales)||raw.reviewedLocales.some(l=>!['ar','en','fr','zh','hi'].includes(l)))throw Error('Invalid draft');
 return {id:raw.id,revision:raw.revision,baseCatalogRevision:raw.baseCatalogRevision,snapshot:validateCatalog(raw.snapshot),reviewedLocales:[...new Set(raw.reviewedLocales)],updatedAt:new Date().toISOString()};
}
export function localeContent(snapshot:CatalogSnapshot,locale:Locale){
 const index=['ar','en','fr','zh','hi'].indexOf(locale);
 function select(node:unknown):unknown{
  if(Array.isArray(node))return node.map(select);
  if(node&&typeof node==='object'){
   const obj=node as Record<string,unknown>,localized=new Set<string>();
   if('names'in obj&&'terrainIndex'in obj){localized.add('names');localized.add('summary')}
   if('body'in obj&&'sourceIds'in obj){localized.add('title');localized.add('body')}
   if('precaution'in obj){for(const key of ['name','description','precaution'])localized.add(key)}
   if('equipmentId'in obj&&'reason'in obj){localized.add('label');localized.add('reason')}
   if('clothing'in obj&&'group'in obj){for(const key of ['clothing','transport','group'])localized.add(key)}
   return Object.fromEntries(Object.entries(obj).filter(([k])=>!['revision','publishedAt'].includes(k)).map(([k,v])=>[k,localized.has(k)&&Array.isArray(v)?v[index]:select(v)]));
  }return node;
 }return canonical(select(snapshot));
}
