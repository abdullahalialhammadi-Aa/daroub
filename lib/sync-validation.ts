import type {SyncMutation,SavedLocation,Trip} from './toolkit-types';
import {recordId,coordinates,terrainId,normalizeTrip,validateGear} from './preparation-schema';
export function validCoordinate(v:unknown):v is {lat:number;lon:number}{return coordinates.safeParse(v).success}
export function validateMutation(input:unknown):SyncMutation{
 const m=input as SyncMutation;
 if(!m||!['trip','bookmark','gear'].includes(m.entity)||!recordId.safeParse(m.id).success||!recordId.safeParse(m.operationId).success||!Number.isSafeInteger(m.baseRevision)||m.baseRevision<0||(m.protocol!==undefined&&m.protocol!==2)||(m.replacesOperationId!==undefined&&!recordId.safeParse(m.replacesOperationId).success))throw Error('Invalid mutation');
 if(m.entity==='gear'&&m.protocol!==2)throw Error('Upgrade required');
 if(m.replacesOperationId&&m.protocol!==2)throw Error('Invalid replacement operation');
 if(m.payload===null)return {operationId:m.operationId,entity:m.entity,id:m.id,baseRevision:m.baseRevision,payload:null,...(m.protocol===2?{protocol:2 as const}:{}),...(m.replacesOperationId?{replacesOperationId:m.replacesOperationId}:{})};
 if(m.baseRevision===0&&m.id.startsWith('conflict-'))throw Error('Reserved record ID');
 if(!m.payload||m.payload.id!==m.id)throw Error('Invalid record');
 const raw={...m.payload,revision:m.baseRevision,updatedAt:new Date().toISOString()};
 let payload:SyncMutation['payload'];
 if(m.entity==='gear')payload=validateGear(raw);
 else if(m.entity==='trip'){
  const t=normalizeTrip(raw);
  if(m.protocol===2)payload=t;
  else{
   if((m.payload as Trip).schemaVersion!==undefined)throw Error('Upgrade required');
   const {id,title,destinationId,terrainId,location,startDate,endDate,groupSize,transport,notes,revision,updatedAt,conflictOf}=t;
   payload={id,title,destinationId,terrainId,location,startDate,endDate,groupSize,transport,notes,revision,updatedAt,...(conflictOf?{conflictOf}:{}),checklist:t.checklist.map(({id,label,category,done})=>({id,label,category,done}))};
  }
 }else{
  const b=raw as SavedLocation;
  if(!validCoordinate(b)||!terrainId.safeParse(b.terrainId).success||!(b.destinationId===null||recordId.safeParse(b.destinationId).success)||typeof b.label!=='string'||!b.label.trim()||b.label.length>160)throw Error('Invalid bookmark');
  payload={id:b.id,label:b.label,lat:b.lat,lon:b.lon,destinationId:b.destinationId,terrainId:b.terrainId,revision:m.baseRevision,updatedAt:raw.updatedAt};
 }
 return {operationId:m.operationId,entity:m.entity,id:m.id,baseRevision:m.baseRevision,payload,...(m.protocol===2?{protocol:2 as const}:{}),...(m.replacesOperationId?{replacesOperationId:m.replacesOperationId}:{})};
}
