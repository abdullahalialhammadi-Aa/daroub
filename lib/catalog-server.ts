import {env} from 'cloudflare:workers';
import {database} from './sync-server';
import {seedCatalog} from './catalog-seed';
import {applyFocus} from './region';
import {validateCatalog,validateDraft,localeContent} from './catalog-validation';
import {canonical} from './preparation-schema';
import type {CatalogSnapshot,CatalogDraft,CatalogHistory,Destination,EditorRole,SourceReference} from './toolkit-types';

export class CatalogConflict extends Error{}
export class CatalogInvalid extends Error{}
export function editorRole(userId:string):EditorRole{
 const config=env as unknown as Record<string,unknown>;
 const includes=(key:string)=>typeof config[key]==='string'&&(config[key] as string).split(',').map(s=>s.trim()).filter(Boolean).includes(userId);
 return includes('DAROUB_OWNER_IDS')?'owner':includes('DAROUB_EDITOR_IDS')?'editor':null;
}
/** The served snapshot: the published head or the compiled seed, with the product focus applied (out-of-focus places archived).
 *  Editorial flows pass `{focus:false}` so drafts and history keep the unfiltered editorial content. */
export async function readCatalog(options:{focus?:boolean}={}):Promise<CatalogSnapshot>{
 const row=await database().prepare('SELECT h.revision,v.payload FROM catalog_heads h LEFT JOIN catalog_versions v ON v.revision=h.revision WHERE h.id=1').first<{revision:number;payload:string|null}>();
 if(row?.revision&&!row.payload)throw Error('Published catalog missing');
 const catalog:CatalogSnapshot=row?.payload?JSON.parse(row.payload):structuredClone(seedCatalog);
 return options.focus===false?catalog:applyFocus(catalog);
}
type DraftRow={id:string;revision:number;base_revision:number;payload:string;reviewed:string;updated_at:string};
const draftRow=(r:DraftRow):CatalogDraft=>({id:r.id,revision:r.revision,baseCatalogRevision:r.base_revision,snapshot:JSON.parse(r.payload),reviewedLocales:JSON.parse(r.reviewed),updatedAt:r.updated_at});
export async function editorState(){const db=database();const [drafts,history,catalog]=await Promise.all([db.prepare('SELECT id,revision,base_revision,payload,reviewed,updated_at FROM catalog_drafts ORDER BY updated_at DESC LIMIT 100').all<DraftRow>(),db.prepare('SELECT revision,published_at,actor,restored_from FROM catalog_versions ORDER BY revision DESC LIMIT 100').all<{revision:number;published_at:string;actor:string;restored_from:number|null}>(),readCatalog({focus:false})]);return {drafts:drafts.results.map(draftRow),history:history.results.map(r=>({revision:r.revision,publishedAt:r.published_at,actor:r.actor,...(r.restored_from!==null?{restoredFrom:r.restored_from}:{})})) as CatalogHistory[],catalog}}
export async function saveCatalogDraft(actor:string,input:unknown){
 let draft:CatalogDraft;try{draft=validateDraft(input)}catch{throw new CatalogInvalid('Invalid draft')}
 const db=database(),prior=await db.prepare('SELECT id,revision,base_revision,payload,reviewed,updated_at FROM catalog_drafts WHERE id=?').bind(draft.id).first<DraftRow>();
 if((prior?.revision??0)!==draft.revision)throw new CatalogConflict('Draft changed');
 const baseline=prior?JSON.parse(prior.payload) as CatalogSnapshot:await readCatalog({focus:false});
 if(draft.baseCatalogRevision!==(prior?.base_revision??baseline.revision))throw new CatalogConflict('Create a new draft to rebase onto published content');
 // Changing a locale or shared source/rule metadata invalidates its earlier review.
 const reviewed=draft.reviewedLocales.filter(locale=>localeContent(baseline,locale)===localeContent(draft.snapshot,locale));
 const result=await db.prepare('INSERT INTO catalog_drafts(id,revision,base_revision,payload,reviewed,updated_at,actor) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,base_revision=excluded.base_revision,payload=excluded.payload,reviewed=excluded.reviewed,updated_at=excluded.updated_at,actor=excluded.actor WHERE catalog_drafts.revision=? RETURNING id,revision,base_revision,payload,reviewed,updated_at').bind(draft.id,draft.revision+1,draft.baseCatalogRevision,JSON.stringify(draft.snapshot),JSON.stringify(reviewed),draft.updatedAt,actor,draft.revision).first<DraftRow>();
 if(!result)throw new CatalogConflict('Draft changed');return draftRow(result);
}
/** Keep identities from history too, including catalogs published before continuity checks existed. */
async function publishedDestinations(){
 const db=database(),rows=await db.prepare("WITH ranked AS (SELECT v.revision,d.value AS destination,ROW_NUMBER() OVER(PARTITION BY json_extract(d.value,'$.id') ORDER BY v.revision DESC) AS position FROM catalog_versions v,json_each(v.payload,'$.destinations') d) SELECT revision,destination FROM ranked WHERE position=1").all<{revision:number;destination:string}>();
 const known=new Map(seedCatalog.destinations.map(destination=>[destination.id,{destination,revision:0}]));
 for(const row of rows.results){const destination=JSON.parse(row.destination) as Destination,prior=known.get(destination.id)?.destination;if(prior&&(prior.terrainId!==destination.terrainId||prior.terrainIndex!==destination.terrainIndex))throw new CatalogInvalid('Published terrain identity changed');known.set(destination.id,{destination,revision:row.revision});}
 const changed=await db.prepare("SELECT json_extract(d.value,'$.id') AS id FROM catalog_versions v,json_each(v.payload,'$.destinations') d GROUP BY json_extract(d.value,'$.id') HAVING COUNT(DISTINCT json_extract(d.value,'$.terrainId')||':'||json_extract(d.value,'$.terrainIndex'))>1 LIMIT 1").first<{id:string}>();
 if(changed)throw new CatalogInvalid('Published terrain identity changed');
 return known;
}
function preserveIdentities(snapshot:CatalogSnapshot,known:Awaited<ReturnType<typeof publishedDestinations>>){
 for(const {destination} of known.values()){const next=snapshot.destinations.find(row=>row.id===destination.id);if(!next)throw new CatalogInvalid('Archive published destinations instead of deleting them');if(next.terrainId!==destination.terrainId||next.terrainIndex!==destination.terrainIndex)throw new CatalogInvalid('Published destination terrain is immutable');}
}
async function retainArchivedDestinations(snapshot:CatalogSnapshot){
 const next=structuredClone(snapshot),known=await publishedDestinations(),versions=new Map<number,SourceReference[]>([[0,seedCatalog.sources]]);
 const sameSource=(a:SourceReference,b:SourceReference)=>canonical({title:a.title,url:a.url,reviewedAt:a.reviewedAt})===canonical({title:b.title,url:b.url,reviewedAt:b.reviewedAt});
 for(const {destination,revision} of known.values()){
  if(next.destinations.some(row=>row.id===destination.id))continue;
  if(next.destinations.length>=100)throw new CatalogInvalid('Archived destination limit exceeded');
  let sources=versions.get(revision);if(!sources){const rows=await database().prepare("SELECT s.value AS source FROM catalog_versions v,json_each(v.payload,'$.sources') s WHERE v.revision=?").bind(revision).all<{source:string}>();sources=rows.results.map(row=>JSON.parse(row.source) as SourceReference);versions.set(revision,sources);}
  const archived=structuredClone(destination),references=[archived,...archived.sections,...archived.species],mapping=new Map<string,string>();
  for(const id of new Set(references.flatMap(row=>row.sourceIds))){
   const source=sources.find(row=>row.id===id);if(!source)throw new CatalogInvalid('Historical destination source is missing');
   const existing=next.sources.find(row=>row.id===id);
   if(existing&&sameSource(existing,source)){mapping.set(id,id);continue;}
   const equivalent=next.sources.find(row=>sameSource(row,source));if(equivalent){mapping.set(id,equivalent.id);continue;}
   if(next.sources.length>=300)throw new CatalogInvalid('Archived source limit exceeded');
   let replacement=id;if(existing){const base=('archive-'+revision+'-'+id).slice(0,110);replacement=base;let counter=1;while(next.sources.some(row=>row.id===replacement))replacement=base+'-'+counter++;}
   next.sources.push({...source,id:replacement});mapping.set(id,replacement);
  }
  for(const row of references)row.sourceIds=row.sourceIds.map(id=>mapping.get(id)!);
  next.destinations.push({...archived,archived:true});
 }
 preserveIdentities(next,known);return next;
}
async function publishSnapshot(actor:string,snapshot:CatalogSnapshot,expected:number,draft?:{id:string;revision:number},restoredFrom?:number){
 preserveIdentities(snapshot,await publishedDestinations());
 const db=database();await db.prepare('INSERT INTO catalog_heads(id,revision) VALUES(1,0) ON CONFLICT(id) DO NOTHING').run();
 const revision=expected+1,now=new Date().toISOString(),operation=crypto.randomUUID(),next={...snapshot,revision,publishedAt:now};
 const condition=draft?' AND EXISTS (SELECT 1 FROM catalog_drafts WHERE id=? AND revision=?)':'';
 const insert=db.prepare(`INSERT INTO catalog_versions(revision,payload,actor,published_at,operation,restored_from) SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM catalog_heads WHERE id=1 AND revision=?)${condition}`).bind(revision,JSON.stringify(next),actor,now,operation,restoredFrom??null,expected,...(draft?[draft.id,draft.revision]:[]));
 const update=db.prepare('UPDATE catalog_heads SET revision=? WHERE id=1 AND revision=? AND EXISTS(SELECT 1 FROM catalog_versions WHERE revision=? AND operation=?)').bind(revision,expected,revision,operation);
 const statements=[insert,update];if(draft)statements.push(db.prepare('DELETE FROM catalog_drafts WHERE id=? AND revision=? AND EXISTS(SELECT 1 FROM catalog_versions WHERE revision=? AND operation=?)').bind(draft.id,draft.revision,revision,operation));
 try{await db.batch(statements)}catch(error){if(/unique|constraint/i.test(String(error)))throw new CatalogConflict('Publication changed');throw error}
 const written=await db.prepare('SELECT operation FROM catalog_versions WHERE revision=?').bind(revision).first<{operation:string}>();if(written?.operation!==operation)throw new CatalogConflict('Publication changed');return next;
}
export async function publishCatalogDraft(actor:string,id:string,revision:number,expected:number){
 const row=await database().prepare('SELECT id,revision,base_revision,payload,reviewed,updated_at FROM catalog_drafts WHERE id=?').bind(id).first<DraftRow>();
 if(!row||row.revision!==revision||row.base_revision!==expected)throw new CatalogConflict('Draft or published content changed');
 const draft=draftRow(row);if(!['ar','en','fr','zh','hi'].every(l=>draft.reviewedLocales.includes(l as typeof draft.reviewedLocales[number])))throw new CatalogInvalid('Review all five translations');
 let snapshot:CatalogSnapshot;try{snapshot=validateCatalog(draft.snapshot,true)}catch{throw new CatalogInvalid('Complete translations and sources')}
 return publishSnapshot(actor,snapshot,expected,{id,revision});
}
export async function rollbackCatalog(actor:string,revision:number,expected:number){
 const row=revision===0?null:await database().prepare('SELECT payload FROM catalog_versions WHERE revision=?').bind(revision).first<{payload:string}>();
 if(revision!==0&&!row)throw new CatalogInvalid('Unknown revision');
 let snapshot:CatalogSnapshot;try{snapshot=validateCatalog(row?JSON.parse(row.payload):seedCatalog,true)}catch{throw new CatalogInvalid('Historical content needs review before publication')}
 snapshot=await retainArchivedDestinations(snapshot);
 try{snapshot=validateCatalog(snapshot,true)}catch{throw new CatalogInvalid('Archived content exceeds limits or needs review')}
 return publishSnapshot(actor,snapshot,expected,undefined,revision);
}
