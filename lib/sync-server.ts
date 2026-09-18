import { env } from 'cloudflare:workers';
import type { SyncMutation,Trip,GearItem } from './toolkit-types';
export function database(): D1Database { if(!env.DB) throw Error('Storage unavailable'); return env.DB; }
export class MutationReuseError extends Error {}
export class UpgradeRequired extends Error {}
function stable(value:unknown):string { if(Array.isArray(value))return '['+value.map(stable).join(',')+']';if(value&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+stable(v)).join(',')+'}';return JSON.stringify(value); }
async function hash(value:unknown){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(stable(value)));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('')}
export async function snapshot(owner:string,protocol=2) {
  const r=await database().prepare('SELECT entity,id,payload,revision,deleted FROM records WHERE owner=?').bind(owner).all<{entity:string;id:string;payload:string;revision:number;deleted:number}>();
  const rows=r.results.map(row=>({entity:row.entity,id:row.id,deleted:!!row.deleted,record:{...JSON.parse(row.payload),revision:row.revision}}));
  return protocol===2?rows:rows.filter(row=>row.entity!=='gear'&&!(row.record.schemaVersion>=2));
}
export async function loadOwnedTrip(owner:string,id:string):Promise<Trip|null>{const row=await database().prepare("SELECT payload,revision FROM records WHERE owner=? AND entity='trip' AND id=? AND deleted=0").bind(owner,id).first<{payload:string;revision:number}>();return row?{...JSON.parse(row.payload),revision:row.revision}:null}
export async function loadOwnedGear(owner:string):Promise<GearItem[]>{const rows=await database().prepare("SELECT payload,revision FROM records WHERE owner=? AND entity='gear' AND deleted=0").bind(owner).all<{payload:string;revision:number}>();return rows.results.map(row=>({...JSON.parse(row.payload),revision:row.revision}))}
export async function applyMutation(owner:string,m:SyncMutation) {
  const fields=m.payload?{...m.payload}:null;if(fields){delete (fields as Partial<typeof fields>).updatedAt;delete (fields as Partial<typeof fields>).revision;}
  const requestHash=await hash(m.protocol===2?[m.entity,m.id,m.baseRevision,fields,{protocol:2,replacesOperationId:m.replacesOperationId??null}]:[m.entity,m.id,m.baseRevision,fields]);
  const db=database(); const previous=await db.prepare('SELECT result FROM sync_receipts WHERE owner=? AND operation_id=?').bind(owner,m.operationId).first<{result:string}>();
  if(previous){const result=JSON.parse(previous.result);if(result.requestHash!==requestHash)throw new MutationReuseError('Operation ID reused');return result;}
  if(m.protocol!==2){const current=await database().prepare('SELECT payload FROM records WHERE owner=? AND entity=? AND id=?').bind(owner,m.entity,m.id).first<{payload:string}>();if(current&&JSON.parse(current.payload).schemaVersion>=2)throw new UpgradeRequired('Upgrade required');}
  const now=new Date().toISOString(), revision=m.baseRevision+1, deleted=m.payload===null?1:0;
  const payload=JSON.stringify({...m.payload,...(deleted&&m.protocol===2&&m.entity!=='bookmark'?{schemaVersion:2}:{}),id:m.id,revision,updatedAt:now});
  const copyId='conflict-'+await hash(m.operationId);
  const copy=JSON.stringify({...m.payload,id:copyId,revision:1,updatedAt:now,conflictOf:m.id});
  const notReceipt='NOT EXISTS (SELECT 1 FROM sync_receipts WHERE owner=? AND operation_id=?)';
  // Repeat the compatibility check inside the same atomic batch as every side effect.
  const compatible=m.protocol===2?'1':"NOT EXISTS (SELECT 1 FROM records WHERE owner=? AND entity=? AND id=? AND COALESCE(json_extract(payload,'$.schemaVersion'),1)>=2)";
  const compatibilityArgs=m.protocol===2?[]:[owner,m.entity,m.id];
  const statements=[
    db.prepare(`INSERT INTO records(owner,entity,id,payload,revision,deleted,updated_at,last_operation) SELECT ?,?,?,?,?,?,?,? WHERE ?=0 AND ${notReceipt} ON CONFLICT(owner,entity,id) DO NOTHING`).bind(owner,m.entity,m.id,payload,revision,deleted,now,m.operationId,m.baseRevision,owner,m.operationId),
    db.prepare(`UPDATE records SET payload=?,revision=?,deleted=?,updated_at=?,last_operation=? WHERE owner=? AND entity=? AND id=? AND revision=? AND deleted=0 ${m.protocol===2?'':"AND COALESCE(json_extract(payload,'$.schemaVersion'),1)<2"} AND ${notReceipt}`).bind(payload,revision,deleted,now,m.operationId,owner,m.entity,m.id,m.baseRevision,owner,m.operationId),
    db.prepare(`INSERT INTO records(owner,entity,id,payload,revision,deleted,updated_at,last_operation) SELECT ?,?,?,?,1,0,?,? WHERE ?=0 AND ${notReceipt} AND NOT EXISTS (SELECT 1 FROM records WHERE owner=? AND entity=? AND id=? AND last_operation=?) AND ${compatible} ON CONFLICT(owner,entity,id) DO NOTHING`).bind(owner,m.entity,copyId,copy,now,m.operationId,deleted,owner,m.operationId,owner,m.entity,m.id,m.operationId,...compatibilityArgs),
    db.prepare(`INSERT INTO sync_receipts(owner,operation_id,result,created_at) SELECT ?,?,json_object('requestHash',?,'operationId',?,'entity',?,'id',?,'conflict',CASE WHEN EXISTS(SELECT 1 FROM records WHERE owner=? AND entity=? AND id=? AND last_operation=?) THEN 0 ELSE 1 END,'copyId',CASE WHEN EXISTS(SELECT 1 FROM records WHERE owner=? AND entity=? AND id=?) THEN ? ELSE NULL END),? WHERE ${compatible} ON CONFLICT(owner,operation_id) DO NOTHING`).bind(owner,m.operationId,requestHash,m.operationId,m.entity,m.id,owner,m.entity,m.id,m.operationId,owner,m.entity,copyId,copyId,now,...compatibilityArgs),
  ];
  await db.batch(statements);
  const receipt=await db.prepare('SELECT result FROM sync_receipts WHERE owner=? AND operation_id=?').bind(owner,m.operationId).first<{result:string}>();
  if(!receipt){if(m.protocol!==2){const current=await db.prepare('SELECT payload FROM records WHERE owner=? AND entity=? AND id=?').bind(owner,m.entity,m.id).first<{payload:string}>();if(current&&JSON.parse(current.payload).schemaVersion>=2)throw new UpgradeRequired('Upgrade required');}throw Error('Sync receipt missing');}
  const result=JSON.parse(receipt.result);if(result.requestHash!==requestHash)throw new MutationReuseError('Operation ID reused');return result;
}
