import type {CatalogDraft,CatalogSnapshot,Destination,GuideSection,Localized,PackingRule,SourceReference,SpeciesEntry,TerrainId} from './toolkit-types';
import {catalogGuidance} from './catalog-seed';
import {FOCUS_COUNTRY} from './region';
export const emptyText=():Localized=>['','','','',''];
export function createCatalogDraft(snapshot:CatalogSnapshot,id:string):CatalogDraft{return{id,revision:0,baseCatalogRevision:snapshot.revision,snapshot:structuredClone(snapshot),reviewedLocales:[],updatedAt:new Date().toISOString()}}
export function editCatalogDraft(draft:CatalogDraft,edit:(snapshot:CatalogSnapshot)=>void):CatalogDraft{const next=structuredClone(draft);edit(next.snapshot);next.reviewedLocales=[];return next}
export function emptyDestination(snapshot:CatalogSnapshot,id:string,terrainId:TerrainId='desert'):Destination {return{id,terrainId,terrainIndex:['desert','mountain','forest','coast'].indexOf(terrainId),names:emptyText(),summary:emptyText(),lat:0,lon:0,image:'/images/desert.jpg',imageIsIllustrative:true,sourceIds:[],sections:structuredClone(catalogGuidance(snapshot,terrainId).sections),species:[],timezone:'',archived:false,...(FOCUS_COUNTRY?{country:FOCUS_COUNTRY}:{})}}
export function emptySection(id:string):GuideSection{return{id,title:emptyText(),body:emptyText(),sourceIds:[]}}
export function emptySpecies(id:string):SpeciesEntry{return{id,name:emptyText(),description:emptyText(),precaution:emptyText(),sourceIds:[],coverage:'terrain-example'}}
export function emptySource(id:string):SourceReference{return{id,title:'',url:'',reviewedAt:new Date().toISOString().slice(0,10)}}
export function emptyRule(id:string):PackingRule{return{id,version:1,equipmentId:id,label:emptyText(),category:'essentials',terrainIds:['desert'],activities:[],months:[],minDays:0,transport:[],baseQuantity:1,perPerson:false,reason:emptyText(),sourceIds:[],coverage:'terrain-example',destinationIds:[]}}
export function sourceIsUsed(snapshot:CatalogSnapshot,id:string){return snapshot.destinations.some(d=>d.sourceIds.includes(id)||d.sections.some(s=>s.sourceIds.includes(id))||d.species.some(s=>s.sourceIds.includes(id)))||snapshot.terrainGuidance.some(t=>t.sections.some(s=>s.sourceIds.includes(id)))||snapshot.packingRules.some(r=>r.sourceIds.includes(id))}
export function sourceReviewOverdue(date:string,now=Date.now()){return Number.isFinite(Date.parse(date))&&now-Date.parse(date+'T00:00:00Z')>180*86400000}
export function splitTokens(value:string){return [...new Set(value.split(',').map(v=>v.trim()).filter(Boolean))]}
