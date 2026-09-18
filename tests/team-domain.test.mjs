import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const bundle=await build({entryPoints:['lib/team-domain.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {parseTeamAction,applyTeamEdit,publicBoard,addPerson,teamPreview}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const state={title:'Trip',sourceRevision:3,items:[{id:'tent',label:'Tent',kind:'equipment',required:1},{id:'task',label:'Charge phone',kind:'task',required:1}],participants:[{id:'owner-person',name:'Owner',userId:'owner'},{id:'member-person',name:'Member',userId:'member'},{id:'named-person',name:'Ahmed',userId:null}],allocations:[]};
const allocate={type:'allocate',roomId:'room',revision:1,itemId:'tent',participantId:'member-person',quantity:1,packed:0};
const row={id:'room',owner:'owner',trip_id:'private-trip',state:JSON.stringify(state),revision:1,updated_at:'2026-09-17T00:00:00Z',invite_hash:'secret-hash',invite_expires_at:'2026-09-18T00:00:00Z',closed:0};
test('shared DTO excludes account identities, private trip IDs and invitation secrets for members',()=>{
 const result=publicBoard(row,'member');assert.equal(result.tripId,null);assert.equal(result.inviteExpiresAt,null);assert.equal(result.participants[1].isYou,true);assert.equal(result.participants[2].linked,false);assert.ok(!JSON.stringify(result).includes('secret-hash'));assert.ok(result.participants.every(p=>!('userId'in p)));assert.throws(()=>publicBoard(row,'outsider'));assert.throws(()=>publicBoard({...row,closed:1},'owner'));
});
test('membership derives from identity, never matching names or placeholder IDs',()=>{
 assert.throws(()=>applyTeamEdit(state,'outsider','owner',allocate));assert.throws(()=>applyTeamEdit(state,'member','owner',{...allocate,participantId:'named-person'}));assert.throws(()=>addPerson(state,{id:'new',name:'Ahmed',userId:'attacker'}));
 assert.equal(applyTeamEdit(state,'member','owner',allocate).allocations[0].participantId,'member-person');
});
test('owner may assign people but members cannot administer invitations, refresh or participants',()=>{
 assert.equal(applyTeamEdit(state,'owner','owner',{...allocate,participantId:'named-person'}).allocations[0].participantId,'named-person');
 for(const type of ['invite','revoke-invite','close','remove-person','add-person','refresh'])assert.throws(()=>applyTeamEdit(state,'member','owner',{type,roomId:'room',revision:1,participantId:'named-person',name:'New'}));
});
test('allocation ownership, packed bounds and task cardinality are checked without silently clamping',()=>{
 assert.throws(()=>applyTeamEdit(state,'member','owner',{...allocate,packed:2}));assert.throws(()=>applyTeamEdit(state,'member','owner',{...allocate,itemId:'missing'}));assert.throws(()=>applyTeamEdit(state,'member','owner',{...allocate,itemId:'task',quantity:2}));
 const next=applyTeamEdit(state,'member','owner',{...allocate,quantity:3,packed:2});assert.equal(next.allocations[0].quantity,3);assert.equal(next.allocations[0].packed,2);assert.equal(next.items[0].required,1);
 assert.equal(applyTeamEdit(next,'member','owner',{...allocate,quantity:0,packed:0}).allocations.length,0);
});
test('refresh checks reviewed source revision and retains quantities for surviving items',()=>{
 const current={...state,allocations:[{itemId:'tent',participantId:'member-person',quantity:3,packed:2},{itemId:'task',participantId:'named-person',quantity:1,packed:1}]};
 const preview={title:'New title',sourceRevision:4,items:[state.items[0]]};
 assert.throws(()=>applyTeamEdit(current,'owner','owner',{type:'refresh',expectedSourceRevision:3},preview));
 const next=applyTeamEdit(current,'owner','owner',{type:'refresh',expectedSourceRevision:4},preview);assert.equal(next.allocations.length,1);assert.deepEqual(next.allocations[0],current.allocations[0]);assert.equal(current.allocations.length,2);
});
test('removal and leave release responsibility without changing the private trip or other participants',()=>{
 const current=applyTeamEdit(state,'member','owner',allocate);const next=applyTeamEdit(current,'owner','owner',{type:'remove-person',participantId:'member-person'});assert.equal(next.allocations.length,0);assert.equal(next.participants.length,2);assert.equal(current.participants.length,3);
 assert.throws(()=>applyTeamEdit(current,'owner','owner',{type:'leave'}));assert.equal(applyTeamEdit(current,'member','owner',{type:'leave'}).participants.length,2);
});
test('strict network actions reject extra identity fields and invalid quantities',()=>{
 assert.throws(()=>parseTeamAction({...allocate,userId:'owner'}));assert.throws(()=>parseTeamAction({...allocate,quantity:1.2}));assert.throws(()=>parseTeamAction({...allocate,quantity:10001}));assert.throws(()=>parseTeamAction({type:'create',tripId:'trip',name:' ',expectedSourceRevision:0}));assert.equal(parseTeamAction({type:'create',tripId:'trip',name:' Name ',expectedSourceRevision:0}).name,'Name');
});
test('the shared source projection never includes personal notes, health, inventory or coordinates',()=>{
 const trip={id:'trip',title:'Trip',destinationId:null,terrainId:'desert',location:{lat:12,lon:33},startDate:'',endDate:'',groupSize:2,transport:'private-transport',notes:'private-notes',checklist:[{id:'tent',label:'Tent',category:'custom',kind:'equipment',done:true,requiredQuantity:2,packedQuantity:2,assignedQuantity:1,gearId:'private-gear'}],revision:3,updatedAt:'2026-09-17T00:00:00Z'};
 assert.deepEqual(teamPreview(trip),{title:'Trip',sourceRevision:3,items:[{id:'tent',label:'Tent',kind:'equipment',required:2}]});
});
test('display names save without changing identity, membership or allocations and respect actor permissions',()=>{
 const edit={type:'rename-person',roomId:'room',revision:1,participantId:'member-person',name:' New member '};
 const action=parseTeamAction(edit);assert.equal(action.name,'New member');
 const current=applyTeamEdit(state,'member','owner',allocate);
 const next=applyTeamEdit(current,'member','owner',action);
 assert.equal(next.participants[1].name,'New member');assert.equal(next.participants[1].userId,'member');assert.deepEqual(next.allocations,current.allocations);
 assert.equal(current.participants[1].name,'Member');
 assert.throws(()=>applyTeamEdit(current,'owner','owner',action),{code:'forbidden'});
 assert.throws(()=>applyTeamEdit(current,'outsider','owner',action),{code:'not_found'});
 assert.throws(()=>applyTeamEdit(current,'member','owner',{...action,participantId:'named-person'}),{code:'forbidden'});
 const named=applyTeamEdit(current,'owner','owner',{...action,participantId:'named-person',name:'Mina'});assert.equal(named.participants[2].name,'Mina');assert.equal(named.participants[2].userId,null);
 assert.throws(()=>applyTeamEdit(current,'member','owner',{...action,name:' OWNER '}),{code:'name_taken'});
 assert.throws(()=>parseTeamAction({...edit,name:' '}));assert.throws(()=>parseTeamAction({...edit,userId:'owner'}));
});
