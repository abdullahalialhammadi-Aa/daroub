import {getSession} from './trip-store';
import type {SessionInfo} from './toolkit-types';
import type {TeamAction,TeamAllocation,TeamBoard,TeamResponse} from './team-types';

const errorCodes=new Set(['unauthorized','account_changed','invalid','not_found','forbidden','conflict','read_only','offline','service_unavailable','limit','name_taken','invite_invalid']);
export class TeamApiError extends Error {constructor(public code:string,public status=0){super(code);this.name='TeamApiError'}}
export function teamError(error:unknown){return error instanceof TeamApiError&&errorCodes.has(error.code)?error.code:'service_unavailable'}
type Dependencies={session:()=>Promise<SessionInfo|null>;fetch:typeof fetch;online:()=>boolean;stamp:()=>string};
const browserStamp=()=>{try{const user=JSON.parse(localStorage.getItem('daroub-offline-account')??'null');return user?.userId?JSON.stringify([localStorage.getItem('daroub-account-generation'),user.userId]):''}catch{return ''}};
/** Group content is kept in memory only. The server owns membership and snapshot validation. */
export function createTeamClient(deps:Dependencies){
 async function request(query:string,action?:TeamAction,expectedOwner?:string,signal?:AbortSignal){
  if(!deps.online())throw new TeamApiError('offline');
  const startingStamp=deps.stamp(),session=await deps.session();if(!session)throw new TeamApiError('unauthorized',401);
  if(startingStamp&&startingStamp!==deps.stamp())throw new TeamApiError('account_changed');
  if(expectedOwner&&session.userId!==expectedOwner)throw new TeamApiError('account_changed');
  if(action&&session.readOnly)throw new TeamApiError('read_only');
  const stamp=deps.stamp();let response:Response;
  try{response=await deps.fetch('/api/team'+query,{method:action?'POST':'GET',cache:'no-store',credentials:'same-origin',headers:{'X-Daroub-Account':session.userId,...(action?{'Content-Type':'application/json'}:{})},body:action?JSON.stringify(action):undefined,signal:signal??AbortSignal.timeout(12000)})}
  catch(error){if(signal?.aborted)throw error;throw new TeamApiError(deps.online()?'service_unavailable':'offline')}
  if(stamp!==deps.stamp())throw new TeamApiError('account_changed');
  let data:TeamResponse;try{data=await response.json()}catch{throw new TeamApiError('service_unavailable',response.status)}
  if(stamp!==deps.stamp())throw new TeamApiError('account_changed');
  if(!response.ok||data.error)throw new TeamApiError(data.error&&errorCodes.has(data.error)?data.error:response.status===401?'unauthorized':response.status===409?'conflict':'service_unavailable',response.status);
  return {data,session};
 }
 return {get:(query='',expectedOwner?:string,signal?:AbortSignal)=>request(query,undefined,expectedOwner,signal),mutate:(action:TeamAction,expectedOwner:string,signal?:AbortSignal)=>request('',action,expectedOwner,signal)};
}
export const teamClient=createTeamClient({session:getSession,fetch:(...args)=>fetch(...args),online:()=>typeof navigator==='undefined'||navigator.onLine,stamp:browserStamp});
export function allocationTotals(board:Pick<TeamBoard,'allocations'>,itemId:string,required:number){const rows=board.allocations.filter(row=>row.itemId===itemId),assigned=rows.reduce((sum,row)=>sum+row.quantity,0),packed=rows.reduce((sum,row)=>sum+row.packed,0);return {assigned,packed,gap:Math.max(0,required-assigned),overbooked:Math.max(0,assigned-required)}}
export function validAllocation(quantity:string,packed:string,maximum=10000):Pick<TeamAllocation,'quantity'|'packed'>|null {if(!/^\d+$/.test(quantity)||!/^\d+$/.test(packed))return null;const q=Number(quantity),p=Number(packed);return Number.isSafeInteger(q)&&Number.isSafeInteger(p)&&q<=maximum&&p<=q?{quantity:q,packed:p}:null}
export function invitationUrl(origin:string,roomId:string,token:string){const url=new URL('/team',origin);url.searchParams.set('room',roomId);url.hash='invite='+encodeURIComponent(token);return url.toString()}
export function readInvitation(search:string,hash:string){const roomId=new URLSearchParams(search).get('room')??'',token=new URLSearchParams(hash.replace(/^#/, '')).get('invite')??'';return {roomId,token:roomId&&token.length<=1024?token:''}}
