import {legacyDb} from './local-db';
import {getSession} from './trip-store';
import {normalizeTrip} from './preparation-schema';
import {validateMutation} from './sync-validation';

export interface LegacyRecoveryRow {store:'records'|'outbox';key:IDBValidKey;value:unknown}
export interface LegacyRecovery {owner:string;generation:string|null;rows:LegacyRecoveryRow[]}
const identityKey='daroub-offline-account',generationKey='daroub-account-generation';
function identity(){try{const value=JSON.parse(localStorage.getItem(identityKey)||'null');return typeof value?.userId==='string'?value.userId:null}catch{return null}}
export function assertLegacyRecoveryCurrent(snapshot:Pick<LegacyRecovery,'owner'|'generation'>){if(identity()!==snapshot.owner||localStorage.getItem(generationKey)!==snapshot.generation)throw Error('Account changed')}
/** Validate in memory only. Neither the legacy row nor the upgraded database is modified. */
export function legacyRowNeedsRecovery(store:'records'|'outbox',value:unknown):boolean{
 try{
  if(!value||typeof value!=='object')return true;
  const row=value as {entity?:string;record?:unknown;deleted?:boolean;mutation?:unknown};
  if(store==='outbox'){
   const raw=row.mutation as {entity?:string;payload?:unknown};
   if(raw?.entity==='trip'&&raw.payload!==null)normalizeTrip(raw.payload);
   validateMutation(row.mutation);return false;
  }
  if(row.deleted)return false;
  if(row.entity==='trip'){normalizeTrip(row.record);return false}
  const record=row.record as {id?:unknown;revision?:unknown};
  validateMutation({operationId:'legacy-recovery-check',protocol:2,entity:row.entity,id:record?.id,baseRevision:record?.revision,payload:record});return false;
 }catch{return true}
}
async function readRows(snapshot:Pick<LegacyRecovery,'owner'|'generation'>):Promise<LegacyRecovery>{
 assertLegacyRecoveryCurrent(snapshot);const db=await legacyDb();assertLegacyRecoveryCurrent(snapshot);
 const rows=await new Promise<LegacyRecoveryRow[]>((resolve,reject)=>{
  const found:LegacyRecoveryRow[]=[],tx=db.transaction(['records','outbox'],'readonly');
  for(const store of ['records','outbox'] as const){const request=tx.objectStore(store).openCursor();request.onsuccess=()=>{try{assertLegacyRecoveryCurrent(snapshot)}catch{tx.abort();return}const cursor=request.result;if(!cursor)return;const row=cursor.value as {key:IDBValidKey;value?:{owner?:unknown}};
   // Ownership must be explicit. Never guess from another account's malformed key or record.
   if(row.value?.owner===snapshot.owner&&legacyRowNeedsRecovery(store,row.value))found.push({store,key:row.key,value:row.value});cursor.continue();};}
  tx.oncomplete=()=>resolve(found);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??Error('Account changed'));
 });assertLegacyRecoveryCurrent(snapshot);return {...snapshot,rows};
}
export async function readLegacyRecovery():Promise<LegacyRecovery|null>{
 const before=localStorage.getItem(generationKey),session=await getSession();
 if(before!==localStorage.getItem(generationKey)||!session)return null;
 return readRows({owner:session.userId,generation:localStorage.getItem(generationKey)});
}
export async function exportLegacyRecovery(snapshot:LegacyRecovery):Promise<string>{
 // Re-read under the captured account so a stale screen cannot export a later account's data.
 const current=await readRows(snapshot);assertLegacyRecoveryCurrent(current);
 return JSON.stringify({format:'daroub-legacy-recovery',version:1,exportedAt:new Date().toISOString(),rows:current.rows},null,2);
}
