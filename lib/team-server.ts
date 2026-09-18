import {database,loadOwnedTrip} from './sync-server';
import {TeamError,addPerson,applyTeamEdit,member,publicBoard,teamPreview,type TeamRow,type TeamState} from './team-domain';
import type {TeamAction,TeamResponse,TeamPreview} from './team-types';
const hex=(bytes:Uint8Array)=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const digest=async(value:string)=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))));
const token=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
async function rowById(id:string){return database().prepare('SELECT * FROM team_boards WHERE id=? AND closed=0').bind(id).first<TeamRow>()}
async function ownedPreview(owner:string,id:string):Promise<TeamPreview>{const trip=await loadOwnedTrip(owner,id);if(!trip)throw new TeamError('not_found',404);return teamPreview(trip)}
export async function readTeam(owner:string,url:URL):Promise<TeamResponse>{
 const room=url.searchParams.get('room'),trip=url.searchParams.get('trip');
 if(room&&trip)throw new TeamError('invalid');
 if(trip){
  if(url.searchParams.get('preview')==='1')return {preview:await ownedPreview(owner,trip)};
  const row=await database().prepare('SELECT * FROM team_boards WHERE owner=? AND trip_id=? AND closed=0').bind(owner,trip).first<TeamRow>();return {board:row?publicBoard(row,owner):null};
 }
 if(room){const row=await rowById(room);if(!row)throw new TeamError('not_found',404);return {board:publicBoard(row,owner)}}
 const rows=await database().prepare("SELECT id,owner,state,updated_at FROM team_boards WHERE closed=0 AND (owner=? OR EXISTS (SELECT 1 FROM json_each(team_boards.state,'$.participants') WHERE json_extract(value,'$.userId')=?)) ORDER BY updated_at DESC LIMIT 200").bind(owner,owner).all<Pick<TeamRow,'id'|'owner'|'state'|'updated_at'>>();
 return {boards:rows.results.map(row=>({id:row.id,title:(JSON.parse(row.state) as TeamState).title,isOwner:row.owner===owner,updatedAt:row.updated_at}))};
}
export async function mutateTeam(userId:string,action:TeamAction):Promise<TeamResponse>{
 const db=database(),now=new Date().toISOString();
 if(action.type==='create'){
  const preview=await ownedPreview(userId,action.tripId);if(preview.sourceRevision!==action.expectedSourceRevision)throw new TeamError('conflict',409);
  const state:TeamState={...preview,participants:[{id:crypto.randomUUID(),userId,name:action.name}],allocations:[]};
  // Guard the source revision at the write boundary, so only the reviewed copy is published.
  const created=await db.prepare(`INSERT INTO team_boards(id,owner,trip_id,state,revision,updated_at,closed) SELECT ?,?,?,?,1,?,0 WHERE EXISTS (SELECT 1 FROM records WHERE owner=? AND entity='trip' AND id=? AND revision=? AND deleted=0) AND (SELECT COUNT(*) FROM team_boards WHERE owner=? AND closed=0)<100 ON CONFLICT(owner,trip_id) DO UPDATE SET id=excluded.id,state=excluded.state,revision=1,updated_at=excluded.updated_at,closed=0,invite_hash=NULL,invite_expires_at=NULL WHERE team_boards.closed=1`).bind(crypto.randomUUID(),userId,action.tripId,JSON.stringify(state),now,userId,action.tripId,action.expectedSourceRevision,userId).run();
  if(created.meta.changes!==1)throw new TeamError('conflict',409);
  const saved=await db.prepare('SELECT * FROM team_boards WHERE owner=? AND trip_id=? AND closed=0').bind(userId,action.tripId).first<TeamRow>();
  if(!saved)throw new TeamError('conflict',409);return {board:publicBoard(saved,userId)};
 }
 const row=await rowById(action.roomId);if(!row)throw new TeamError('not_found',404);
 let state:TeamState=JSON.parse(row.state),inviteHash=row.invite_hash,inviteExpires=row.invite_expires_at,inviteToken:string|undefined,closed=0;
 if(action.type==='join'){
  if(member(state,userId))return {board:publicBoard(row,userId)};
  if(!inviteHash||!inviteExpires||inviteExpires<=now||await digest(action.token)!==inviteHash)throw new TeamError('invite_invalid',403);
  state=addPerson(state,{id:crypto.randomUUID(),userId,name:action.name});
 }else{
  if(!member(state,userId))throw new TeamError('not_found',404);
  if(action.revision!==row.revision)throw new TeamError('conflict',409);
  if(action.type==='refresh'&&row.owner!==userId)throw new TeamError('forbidden',403);
  const preview=action.type==='refresh'?await ownedPreview(userId,row.trip_id):undefined;
  state=applyTeamEdit(state,userId,row.owner,action,preview);
  if(action.type==='invite'){inviteToken=token();inviteHash=await digest(inviteToken);inviteExpires=new Date(Date.now()+7*86400000).toISOString()}
  if(action.type==='revoke-invite'||action.type==='close'||action.type==='remove-person'){inviteHash=null;inviteExpires=null}
  if(action.type==='close')closed=1;
 }
 if(state.allocations.length>5000)throw new TeamError('limit');
 const sourceGuard=action.type==='refresh'?" AND EXISTS (SELECT 1 FROM records WHERE owner=? AND entity='trip' AND id=? AND revision=? AND deleted=0)":'';
 const invitationGuard=action.type==='join'?" AND invite_hash=? AND invite_expires_at>strftime('%Y-%m-%dT%H:%M:%fZ','now')":'';
 const bindings:unknown[]=[JSON.stringify(state),row.revision+1,now,inviteHash,inviteExpires,closed,row.id,row.revision];
 if(action.type==='refresh')bindings.push(userId,row.trip_id,action.expectedSourceRevision);
 if(action.type==='join')bindings.push(row.invite_hash);
 // Every membership, invite, and allocation mutation shares this CAS. A revoke wins over stale joins/writes.
 const result=await db.prepare('UPDATE team_boards SET state=?,revision=?,updated_at=?,invite_hash=?,invite_expires_at=?,closed=? WHERE id=? AND revision=? AND closed=0'+sourceGuard+invitationGuard).bind(...bindings).run();
 if(result.meta.changes!==1)throw new TeamError('conflict',409);
 if(action.type==='leave'||action.type==='close')return {board:null};
 const saved={...row,state:JSON.stringify(state),revision:row.revision+1,updated_at:now,invite_hash:inviteHash,invite_expires_at:inviteExpires,closed};
 return {board:publicBoard(saved,userId),...(inviteToken?{inviteToken}:{})};
}
