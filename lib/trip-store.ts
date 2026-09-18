import type {Trip,GearItem,SavedLocation,SessionInfo,SyncMutation,SyncStatus} from './toolkit-types';
import {allLocal,purgePrivateOwner,localDb,migrateLegacy,acknowledgeLegacy} from './local-db';
import {validateMutation} from './sync-validation';
import {normalizeTrip,canonical} from './preparation-schema';

type RecordValue=Trip|SavedLocation|GearItem;
type Cached={owner:string;entity:'trip'|'bookmark'|'gear';record:RecordValue;deleted:boolean};
type Pending={owner:string;writer?:string;mutation:SyncMutation};
type Change={entity:'trip'|'bookmark'|'gear';id:string;payload:RecordValue|null;expected?:RecordValue};
const identityKey='daroub-offline-account';
const generationKey='daroub-account-generation';
let writer:string|undefined;
// Browser entropy is requested only for a user mutation, never during Worker module evaluation.
const getWriter=()=>writer??=crypto.randomUUID();
let syncing:Promise<SyncStatus>|undefined,syncRequested=false;
const changed=()=>window.dispatchEvent(new Event('daroub:trip-sync'));
const generation=()=>localStorage.getItem(generationKey);
function cachedIdentity():SessionInfo|null{try{const value=JSON.parse(localStorage.getItem(identityKey)||'null');return value&&typeof value.userId==='string'&&typeof value.displayName==='string'?value:null}catch{return null}}
function sameAccount(owner:string,epoch:string|null){return generation()===epoch&&cachedIdentity()?.userId===owner}
function requireAccount(owner:string,epoch:string|null){if(!sameAccount(owner,epoch))throw Error('Account changed');}
export async function getSession():Promise<SessionInfo|null>{
 const epoch=generation();
 try{
  const response=await fetch('/api/session',{cache:'no-store',signal:AbortSignal.timeout(6000)});
  if(!response.ok)throw Error('Session unavailable');
  const user=await response.json() as SessionInfo|null;
  if(epoch!==generation())return null;
  const old=cachedIdentity();
  if(!user){
   // Keep pending data account-scoped, but do not treat a confirmed signed-out account as authenticated offline.
   if(old){localStorage.setItem(generationKey,crypto.randomUUID());localStorage.removeItem(identityKey);}
   return null;
  }
  if(old&&old.userId!==user.userId){
   const transition=crypto.randomUUID();localStorage.setItem(generationKey,transition);localStorage.removeItem(identityKey);
   await purgePrivateOwner(old.userId);
   // Sign-out or another account transition may have happened while IndexedDB was clearing.
   if(generation()!==transition)return null;
  }
  localStorage.setItem(identityKey,JSON.stringify(user));return user;
 }catch{return epoch===generation()?cachedIdentity():null}
}
async function account(){const user=await getSession();if(!user)throw Error('Sign in required');return user}
function key(owner:string,entity:string,id:string){return JSON.stringify([owner,entity,id])}
async function list(entity:'trip'|'bookmark'|'gear'){
 const user=await account(),epoch=generation();await migrateLegacy(user.userId,()=>sameAccount(user.userId,epoch));const values=await allLocal<Cached>('records');requireAccount(user.userId,epoch);
 return values.filter(value=>value.value.owner===user.userId&&value.value.entity===entity&&!value.value.deleted).map(value=>value.value.record);
}
export async function loadTrips(){return (await list('trip') as Trip[]).map(normalizeTrip)}
export async function loadGear(){return await list('gear') as GearItem[]}
export async function listBookmarks(){return await list('bookmark') as SavedLocation[]}
async function mutateBatch(changes:Change[]):Promise<(RecordValue|null)[]>{
 if(changes.length>50)throw Error('Too many changes');if(!changes.length)return [];
 const epoch=generation(),startingOwner=cachedIdentity()?.userId,user=await account();
 if(generation()!==epoch||(startingOwner&&startingOwner!==user.userId))throw Error('Account changed');
 const seen=new Set<string>();
 // Validate the whole batch before opening its single write transaction.
 const prepared=changes.map(change=>{const id=change.entity+':'+change.id;if(seen.has(id))throw Error('Duplicate record ID');seen.add(id);return validateMutation({operationId:crypto.randomUUID(),protocol:2,entity:change.entity,id:change.id,baseRevision:change.payload?.revision??0,payload:change.payload});});
 const tabWriter=getWriter(),db=await localDb();requireAccount(user.userId,epoch);
 const saved:(RecordValue|null)[]=new Array(changes.length);
 await new Promise<void>((resolve,reject)=>{
  const tx=db.transaction(['records','outbox'],'readwrite'),records=tx.objectStore('records'),outbox=tx.objectStore('outbox');
  const fail=(error:unknown)=>{try{tx.abort()}catch{}reject(error)};
  prepared.forEach((original,index)=>{
   const originalKey=key(user.userId,original.entity,original.id),request=records.get(originalKey);
   request.onsuccess=()=>{const pending=outbox.get(originalKey);pending.onsuccess=()=>{try{
    requireAccount(user.userId,epoch);
    const existing=request.result?.value as Cached|undefined,prior=pending.result?.value as Pending|undefined;
    const expected=changes[index].expected;
    if(expected){const current=existing?.record;const normalize=(v:RecordValue)=>original.entity==='trip'?normalizeTrip(v):v;if(!current||existing?.deleted||canonical(normalize(current))!==canonical(normalize(expected)))throw Error('Trip changed. Reload before applying this change.');}
    let payload=original.payload,targetId=original.id,targetKey=originalKey,base=payload?.revision??existing?.record.revision??0;
    if(prior&&prior.writer!==tabWriter){
     if(!payload)throw Error('A different tab has unsynced edits. Sync before deleting.');
     targetId='local-'+crypto.randomUUID();targetKey=key(user.userId,original.entity,targetId);payload={...payload,id:targetId,revision:0,conflictOf:original.id};base=0;
    }
    const mutation=validateMutation({...original,id:targetId,baseRevision:base,payload});
    saved[index]=mutation.payload;
    records.put({key:targetKey,value:{owner:user.userId,entity:original.entity,record:mutation.payload??existing?.record??{id:original.id,revision:base},deleted:payload===null}});
    outbox.put({key:targetKey,value:{owner:user.userId,writer:tabWriter,mutation}});
   }catch(error){fail(error)}}};
  });
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??Error('Save failed'));
 });
 changed();void syncTrips().catch(()=>{});return saved;
}
export async function saveTrip(trip:Trip,options?:{expectedTrip:Trip}){return (await mutateBatch([{entity:'trip',id:trip.id,payload:trip,expected:options?.expectedTrip}]))[0] as Trip}
export async function saveGear(gear:GearItem,options?:{expectedGear:GearItem}){return (await mutateBatch([{entity:'gear',id:gear.id,payload:gear,expected:options?.expectedGear}]))[0] as GearItem}
export async function deleteGear(id:string,options?:{expectedGear:GearItem}){await mutateBatch([{entity:'gear',id,payload:null,expected:options?.expectedGear}])}
export async function savePreparationBatch(trips:Trip[],gear:GearItem[]):Promise<void>{await mutateBatch([...trips.map(trip=>({entity:'trip' as const,id:trip.id,payload:trip})),...gear.map(item=>({entity:'gear' as const,id:item.id,payload:item}))]);}
export async function saveTripsBatch(trips:Trip[]){return await mutateBatch(trips.map(trip=>({entity:'trip' as const,id:trip.id,payload:trip}))) as Trip[]}
export async function deleteTrip(id:string,options?:{expectedTrip:Trip}){await mutateBatch([{entity:'trip',id,payload:null,expected:options?.expectedTrip}])}
export async function saveBookmark(bookmark:SavedLocation){return (await mutateBatch([{entity:'bookmark',id:bookmark.id,payload:bookmark}]))[0] as SavedLocation}
export async function deleteBookmark(id:string){await mutateBatch([{entity:'bookmark',id,payload:null}])}
async function syncPass():Promise<SyncStatus>{
 const user=await getSession();if(!user)return {state:'sign-in',pending:0,conflicts:0};
 const epoch=generation();let conflicts=0;
 await migrateLegacy(user.userId,()=>sameAccount(user.userId,epoch));
 const pending=async()=>(await allLocal<Pending>('outbox')).filter(item=>item.value.owner===user.userId);
 const signedOut=():SyncStatus=>({state:'sign-in',pending:0,conflicts});
 try{
  for(const item of await pending()){
   if(!sameAccount(user.userId,epoch))return signedOut();
   const response=await fetch('/api/sync',{method:'POST',headers:{'Content-Type':'application/json','X-Daroub-Account':user.userId,'X-Daroub-Protocol':'2'},body:JSON.stringify(item.value.mutation),signal:AbortSignal.timeout(15000)});
   if(response.status===426){
    if(item.value.mutation.protocol===2)return {state:'upgrade',pending:(await pending()).length,conflicts};
    // Preserve a legacy full-record edit as a recovery copy, rather than overwrite an upgraded trip.
    const db=await localDb();requireAccount(user.userId,epoch);
    await new Promise<void>((resolve,reject)=>{const tx=db.transaction(['records','outbox'],'readwrite'),out=tx.objectStore('outbox'),req=out.get(item.key);req.onsuccess=()=>{if(!sameAccount(user.userId,epoch)){tx.abort();return}if(req.result?.value.mutation.operationId!==item.value.mutation.operationId)return;const old=item.value.mutation,id=old.payload?'legacy-'+crypto.randomUUID():old.id,newKey=key(user.userId,old.entity,id),payload=old.payload?{...old.payload,id,revision:0,conflictOf:old.id}:null;const mutation=validateMutation({...old,id,operationId:crypto.randomUUID(),replacesOperationId:old.operationId,protocol:2,baseRevision:payload?0:old.baseRevision,payload});out.delete(item.key);out.put({key:newKey,value:{owner:user.userId,writer:getWriter(),mutation}});if(payload){tx.objectStore('records').delete(item.key);tx.objectStore('records').put({key:newKey,value:{owner:user.userId,entity:old.entity,record:mutation.payload,deleted:false}})}};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});
    conflicts++;syncRequested=true;continue;
   }
   if(response.status===401||response.status===409)return {state:'sign-in',pending:(await pending()).length,conflicts};
   if(!response.ok)throw Error('Sync unavailable');
   const receipt=await response.json() as {conflict:boolean};if(receipt.conflict)conflicts++;
   if(!sameAccount(user.userId,epoch))return signedOut();
   const db=await localDb();requireAccount(user.userId,epoch);
   await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction(['outbox','records'],'readwrite'),store=tx.objectStore('outbox'),request=store.get(item.key);
    const guard=()=>{if(!sameAccount(user.userId,epoch)){tx.abort();return false}return true};
    request.onsuccess=()=>{
     if(!guard())return;const newer=request.result?.value as Pending|undefined;
     if(newer?.mutation.operationId===item.value.mutation.operationId)store.delete(item.key);
     else if(newer&&!receipt.conflict){newer.mutation.baseRevision=Math.max(newer.mutation.baseRevision,item.value.mutation.baseRevision+1);store.put({key:item.key,value:newer})}
    };
    if(!receipt.conflict){const recordRequest=tx.objectStore('records').get(item.key);recordRequest.onsuccess=()=>{
     if(!guard())return;
     if(recordRequest.result){recordRequest.result.value.record.revision=Math.max(recordRequest.result.value.record.revision,item.value.mutation.baseRevision+1);tx.objectStore('records').put(recordRequest.result)};
    }}
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??Error('Account changed'));
   });
   await acknowledgeLegacy(user.userId,item.value.mutation.replacesOperationId??item.value.mutation.operationId,()=>sameAccount(user.userId,epoch));
  }
  if(!sameAccount(user.userId,epoch))return signedOut();
  const response=await fetch('/api/sync',{cache:'no-store',headers:{'X-Daroub-Account':user.userId,'X-Daroub-Protocol':'2'},signal:AbortSignal.timeout(15000)});
  if(response.status===401||response.status===409)return {state:'sign-in',pending:(await pending()).length,conflicts};
  if(!response.ok)throw Error('Sync unavailable');
  const data=await response.json() as {records:{entity:'trip'|'bookmark'|'gear';id:string;record:RecordValue;deleted:boolean}[]};
  if(!sameAccount(user.userId,epoch))return signedOut();
  const db=await localDb();requireAccount(user.userId,epoch);
  await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction(['records','outbox'],'readwrite'),records=tx.objectStore('records');
   const guard=()=>{if(!sameAccount(user.userId,epoch)){tx.abort();return false}return true};
   for(const row of data.records){
    const recordKey=key(user.userId,row.entity,row.id),request=tx.objectStore('outbox').get(recordKey);
    request.onsuccess=()=>{if(!guard()||request.result)return;const local=records.get(recordKey);local.onsuccess=()=>{
     if(!guard())return;const existing=local.result?.value as Cached|undefined;
     // A delayed snapshot from another tab must never downgrade an acknowledged edit or tombstone.
     if(existing&&existing.record.revision>row.record.revision)return;
     records.put({key:recordKey,value:{owner:user.userId,entity:row.entity,record:row.record,deleted:row.deleted}});
    }};
   }
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??Error('Account changed'));
  });
  const left=(await pending()).length;changed();return {state:left?'offline':'synced',pending:left,conflicts};
 }catch{
  if(!sameAccount(user.userId,epoch))return signedOut();
  return {state:navigator.onLine?'error':'offline',pending:(await pending()).length,conflicts};
 }
}
export function syncTrips():Promise<SyncStatus>{
 if(syncing){syncRequested=true;return syncing}
 const drain=async()=>{
  let totalConflicts=0,last:SyncStatus={state:'synced',pending:0,conflicts:0};
  // Drain edits made during a request without creating an unbounded background retry loop.
  for(let pass=0;pass<4;pass++){
   syncRequested=false;last=await syncPass();totalConflicts+=last.conflicts;
   if(last.state==='sign-in'||last.state==='error'||last.state==='upgrade'||!navigator.onLine||(!last.pending&&!syncRequested))return {...last,conflicts:totalConflicts};
  }
  return {...last,state:last.pending?'error':last.state,conflicts:totalConflicts};
 };
 syncing=Promise.resolve(navigator.locks?navigator.locks.request('daroub-sync',drain):drain()).then(value=>value as SyncStatus).finally(()=>{syncing=undefined});
 return syncing;
}
export async function signOut(){
 const identity=cachedIdentity(),owner=identity?.userId,epoch=generation();
 if(identity?.authMethod==='password'){
  const response=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json','X-Daroub-Account':identity.userId},body:JSON.stringify({action:'logout'}),cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('Sign out unavailable');
  // A concurrent session refresh may already have observed the revoked cookie.
  // Still finish the promised cleanup for the captured owner, never the new one.
  if(generation()!==epoch||cachedIdentity()?.userId!==owner){if(owner)await purgePrivateOwner(owner);return;}
 }
 const transition=crypto.randomUUID();localStorage.setItem(generationKey,transition);localStorage.removeItem(identityKey);
 if(owner)await purgePrivateOwner(owner);
 if(generation()!==transition||cachedIdentity())return;
 changed();location.assign(identity?.authMethod==='password'?'/':'/signout-with-chatgpt?return_to=/');
}
