import type {SyncMutation,Trip} from './toolkit-types';
import {normalizeTrip} from './preparation-schema';
const openings=new Map<string,Promise<IDBDatabase>>();
function open(name:string,stores:string[]){let promise=openings.get(name);if(!promise){promise=new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open(name,1);request.onupgradeneeded=()=>{for(const store of stores)if(!request.result.objectStoreNames.contains(store))request.result.createObjectStore(store,{keyPath:'key'})};request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();openings.delete(name)};resolve(request.result)};request.onerror=()=>{openings.delete(name);reject(request.error)}});openings.set(name,promise)}return promise}
export function localDb(){return open('daroub-preparation-v2',['records','outbox','meta'])}
export function legacyDb(){return open('daroub-toolkit',['records','outbox','guides'])}
const dbFor=(store:string)=>store==='guides'?legacyDb():localDb();
function allFrom<T>(db:IDBDatabase,store:string):Promise<{key:string;value:T}[]>{return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
export async function readLocal<T>(store:string,key:string):Promise<T|undefined>{const db=await dbFor(store);return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).get(key);r.onsuccess=()=>resolve(r.result?.value);r.onerror=()=>reject(r.error)})}
export async function allLocal<T>(store:string){return allFrom<T>(await dbFor(store),store)}
export async function writeLocal(store:string,key:string,value:unknown){const db=await dbFor(store);return new Promise<void>((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put({key,value});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
export async function removeLocal(store:string,key:string){const db=await dbFor(store);return new Promise<void>((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
export async function clearPrivateData(){await Promise.all([localDb(),legacyDb()].map(async pending=>{const db=await pending;await new Promise<void>((resolve,reject)=>{const stores=['records','outbox',...(db.objectStoreNames.contains('meta')?['meta']:[])],tx=db.transaction(stores,'readwrite');stores.forEach(store=>tx.objectStore(store).clear());tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}))}
export async function acknowledgeLegacy(owner:string,operationId:string,isCurrent:()=>boolean){const db=await legacyDb();if(!isCurrent())return;await new Promise<void>((resolve,reject)=>{const tx=db.transaction('outbox','readwrite'),store=tx.objectStore('outbox'),req=store.openCursor();req.onsuccess=()=>{if(!isCurrent()){tx.abort();return}const cursor=req.result;if(!cursor)return;if(cursor.value?.value?.owner===owner&&cursor.value.value.mutation?.operationId===operationId)cursor.delete();cursor.continue()};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
/** Finish a captured owner's explicit cleanup even if another account signs in meanwhile. */
export async function purgePrivateOwner(owner:string){
 if(!owner)throw Error('A captured owner is required');
 await Promise.all([localDb(),legacyDb()].map(async pending=>{const db=await pending;await new Promise<void>((resolve,reject)=>{
  const stores=['records','outbox',...(db.objectStoreNames.contains('meta')?['meta']:[])],tx=db.transaction(stores,'readwrite');
  for(const name of stores){const request=tx.objectStore(name).openCursor();request.onsuccess=()=>{const cursor=request.result;if(!cursor)return;const row=cursor.value as {key:string;value:{owner?:string}};
   // Legacy migration markers contain an unrestricted owner followed by a colon-free operation ID.
   const markerOwner=name==='meta'&&typeof row.key==='string'&&row.key.startsWith('legacy:')?row.key.slice(7,row.key.lastIndexOf(':')):undefined;
   if(row.value?.owner===owner||markerOwner===owner)cursor.delete();cursor.continue();};}
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??Error('Cleanup failed'));
 })}));
}
interface LegacyCached {owner:string;entity:'trip'|'bookmark';record:Trip;deleted:boolean}
interface LegacyPending {owner:string;writer?:string;mutation:SyncMutation}
/** Import is transactional and repeatable; legacy pending operations retain their original receipt identity. */
export async function migrateLegacy(owner:string,isCurrent:()=>boolean){
 const old=await legacyDb();const [records,pending]=await Promise.all([allFrom<LegacyCached>(old,'records'),allFrom<LegacyPending>(old,'outbox')]);if(!isCurrent())return;
 const relevant=pending.filter(row=>row.value.owner===owner),pendingKeys=new Set(relevant.map(row=>row.key)),db=await localDb();if(!isCurrent())return;
 await new Promise<void>((resolve,reject)=>{
  const tx=db.transaction(['records','outbox','meta'],'readwrite'),cache=tx.objectStore('records'),outbox=tx.objectStore('outbox'),meta=tx.objectStore('meta');
  const guard=()=>{if(!isCurrent()){tx.abort();return false}return true};
  for(const row of records.filter(r=>r.value.owner===owner&&!pendingKeys.has(r.key))){const check=cache.get(row.key);check.onsuccess=()=>{if(!guard()||check.result)return;try{const value={...row.value,record:row.value.entity==='trip'&&!row.value.deleted?normalizeTrip(row.value.record):row.value.record};cache.put({key:row.key,value})}catch{/* Keep malformed legacy data in its original database for recovery. */}}}
  for(const row of relevant){const marker='legacy:'+owner+':'+row.value.mutation.operationId,check=meta.get(marker);check.onsuccess=()=>{if(!guard()||check.result)return;const existing=outbox.get(row.key);existing.onsuccess=()=>{const cached=cache.get(row.key);cached.onsuccess=()=>{if(!guard())return;
   // Queue the original receipt identity separately when upgraded data already occupies this key.
   // Only the server can distinguish an acknowledged replay from an unsent legacy edit.
   const raw=row.value.mutation,isolated=!!existing.result||!!cached.result;
   const mutation=raw,key=isolated?'legacy-pending:'+owner+':'+raw.operationId:row.key;
   let record=mutation.payload;try{if(record&&mutation.entity==='trip')record=normalizeTrip(record)}catch{return}
   if(!isolated&&(record||!cached.result))cache.put({key,value:{owner,entity:mutation.entity,record:record??{id:mutation.id,revision:mutation.baseRevision},deleted:record===null}});
   outbox.put({key,value:{owner,writer:'legacy-migration',mutation}});meta.put({key:marker,value:{migratedTo:key}});
  }}};}
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??Error('Account changed'));
 });
}
