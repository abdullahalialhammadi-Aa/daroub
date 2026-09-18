import {z} from 'zod';
import {recordId,normalizeTrip} from './preparation-schema';
import type {TeamAction,TeamAllocation,TeamItem,TeamPreview,TeamBoard} from './team-types';
import type {Trip} from './toolkit-types';
export class TeamError extends Error{constructor(public code:string,public status=400){super(code)}}
export interface TeamPerson {id:string;name:string;userId:string|null}
export interface TeamState {title:string;sourceRevision:number;items:TeamItem[];participants:TeamPerson[];allocations:TeamAllocation[]}
export interface TeamRow {id:string;owner:string;trip_id:string;state:string;revision:number;updated_at:string;invite_hash:string|null;invite_expires_at:string|null;closed:number}
const name=z.string().trim().min(1).max(80),revision=z.number().int().min(0),base={roomId:recordId,revision};
const actionSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('create'),tripId:recordId,name,expectedSourceRevision:revision}).strict(),
 z.object({type:z.literal('join'),roomId:recordId,token:z.string().regex(/^[a-f0-9]{64}$/),name}).strict(),
 ...(['invite','revoke-invite','leave','close'] as const).map(type=>z.object({type:z.literal(type),...base}).strict()),
 z.object({type:z.literal('refresh'),...base,expectedSourceRevision:revision}).strict(),
 z.object({type:z.literal('add-person'),...base,name}).strict(),
 z.object({type:z.literal('rename-person'),...base,participantId:recordId,name}).strict(),
 z.object({type:z.literal('remove-person'),...base,participantId:recordId}).strict(),
 z.object({type:z.literal('allocate'),...base,itemId:recordId,participantId:recordId,quantity:z.number().int().min(0).max(10000),packed:z.number().int().min(0).max(10000)}).strict(),
]);
export function parseTeamAction(input:unknown):TeamAction{const result=actionSchema.safeParse(input);if(!result.success)throw new TeamError('invalid');return result.data as TeamAction}
export function teamPreview(input:Trip):TeamPreview{const trip=normalizeTrip(input);return {title:trip.title,sourceRevision:trip.revision,items:trip.checklist.map(item=>({id:item.id,label:item.label,kind:item.kind==='task'?'task':'equipment',required:item.kind==='task'?1:item.requiredQuantity??1}))}}
export function member(state:TeamState,userId:string){return state.participants.find(p=>p.userId===userId)}
export function publicBoard(row:TeamRow,userId:string):TeamBoard{
 const state:TeamState=JSON.parse(row.state);if(row.closed||!member(state,userId))throw new TeamError('not_found',404);
 return {id:row.id,tripId:row.owner===userId?row.trip_id:null,title:state.title,revision:row.revision,updatedAt:row.updated_at,isOwner:row.owner===userId,items:state.items,allocations:state.allocations,sourceRevision:state.sourceRevision,inviteExpiresAt:row.owner===userId?row.invite_expires_at:null,participants:state.participants.map(person=>({id:person.id,name:person.name,isYou:person.userId===userId,isOwner:person.userId===row.owner,linked:person.userId!==null}))};
}
export function addPerson(state:TeamState,person:TeamPerson):TeamState{
 if(state.participants.length>=50)throw new TeamError('limit');
 const normalized=(s:string)=>s.normalize('NFKC').trim().toLowerCase();
 if(state.participants.some(p=>normalized(p.name)===normalized(person.name)))throw new TeamError('name_taken');
 if(person.userId&&member(state,person.userId))return state;
 return {...state,participants:[...state.participants,person]};
}
export function applyTeamEdit(state:TeamState,actor:string,owner:string,action:TeamAction,preview?:TeamPreview):TeamState{
 const person=member(state,actor);if(!person)throw new TeamError('not_found',404);
 const owns=owner===actor;
 if(action.type==='rename-person'){
  const target=state.participants.find(p=>p.id===action.participantId);
  if(!target)throw new TeamError('invalid');
  // Account-linked participants own their display name; organizers may rename managed names.
  if(target.id!==person.id&&!(owns&&target.userId===null))throw new TeamError('forbidden',403);
  const nextName=name.safeParse(action.name);if(!nextName.success)throw new TeamError('invalid');
  const normalized=(s:string)=>s.normalize('NFKC').trim().toLowerCase();
  if(state.participants.some(p=>p.id!==target.id&&normalized(p.name)===normalized(nextName.data)))throw new TeamError('name_taken');
  return {...state,participants:state.participants.map(p=>p.id===target.id?{...p,name:nextName.data}:p)};
 }
 if(action.type==='allocate'){
  if(!owns&&person.id!==action.participantId)throw new TeamError('forbidden',403);
  const item=state.items.find(item=>item.id===action.itemId);
  if(!item||!state.participants.some(p=>p.id===action.participantId)||action.packed>action.quantity||(item.kind==='task'&&action.quantity>1))throw new TeamError('invalid');
  const rest=state.allocations.filter(a=>a.itemId!==action.itemId||a.participantId!==action.participantId);
  return {...state,allocations:action.quantity?[...rest,{itemId:action.itemId,participantId:action.participantId,quantity:action.quantity,packed:action.packed}]:rest};
 }
 if(action.type==='leave'){
  if(owns)throw new TeamError('forbidden',403);
  return {...state,participants:state.participants.filter(p=>p.id!==person.id),allocations:state.allocations.filter(a=>a.participantId!==person.id)};
 }
 if(!owns)throw new TeamError('forbidden',403);
 if(action.type==='add-person')return addPerson(state,{id:crypto.randomUUID(),name:action.name,userId:null});
 if(action.type==='remove-person'){
  if(action.participantId===person.id||!state.participants.some(p=>p.id===action.participantId))throw new TeamError('invalid');
  return {...state,participants:state.participants.filter(p=>p.id!==action.participantId),allocations:state.allocations.filter(a=>a.participantId!==action.participantId)};
 }
 if(action.type==='refresh'){
  if(!preview||preview.sourceRevision!==action.expectedSourceRevision)throw new TeamError('conflict',409);
  // Explicitly confirmed refresh removes deleted items; surviving allocations are never clamped.
  return {...state,...preview,allocations:state.allocations.filter(a=>preview.items.some(i=>i.id===a.itemId))};
 }
 return state;
}
