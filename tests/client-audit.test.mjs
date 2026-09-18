import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';

// Run against this checkout, or set DAROUB_AUDIT_ROOT to inspect a different checkout without editing it.
const sourceRoot=resolve(process.env.DAROUB_AUDIT_ROOT||process.cwd());
const requireFromSource=createRequire(join(sourceRoot,'package.json'));
const {IDBFactory,IDBObjectStore}=requireFromSource('fake-indexeddb');
const ts=requireFromSource('typescript');
const sourceSnapshot=Object.fromEntries(['local-db','sync-validation','trip-store','preparation-schema'].map(name=>[name,readFileSync(join(sourceRoot,'lib',name+'.ts'),'utf8')]));
function deferred(){let resolve;const promise=new Promise(done=>{resolve=done});return {promise,resolve};}
async function harness(){
 const folder=resolve('work/test-client-audit',crypto.randomUUID());mkdirSync(folder,{recursive:true});
 for(const name of ['local-db','sync-validation','trip-store','preparation-schema']){
  const source=sourceSnapshot[name].replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'");
  writeFileSync(join(folder,name+'.mjs'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
 }
 globalThis.indexedDB=new IDBFactory();
 const storage=new Map();let removed;
 globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>{storage.delete(key);removed?.(key)}};
 globalThis.window=new EventTarget();globalThis.location={assign(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});
 const state={identity:{userId:'A',displayName:'A'},online:true,remote:[],postHook:null,getHook:null,sessionHook:null,posted:[]};
 globalThis.fetch=async(url,options={})=>{
  if(!state.online)throw Error('Offline');
  if(url==='/api/session')return state.sessionHook?state.sessionHook():Response.json(state.identity);
  if(options.method==='POST'){
   const mutation=JSON.parse(options.body);state.posted.push({account:options.headers['X-Daroub-Account'],mutation});
   if(state.postHook)return state.postHook(mutation);
   return Response.json({conflict:false});
  }
  return state.getHook?state.getHook():Response.json({records:state.remote});
 };
 const store=await import(pathToFileURL(join(folder,'trip-store.mjs')).href+'?tab=one');
 const second=await import(pathToFileURL(join(folder,'trip-store.mjs')).href+'?tab=two');
 const db=await import(pathToFileURL(join(folder,'local-db.mjs')).href);
 await store.getSession();
 return {store,second,db,state,storage,onRemove:callback=>{removed=callback}};
}
const trip={id:'audit-trip',title:'Original',destinationId:'liwa',terrainId:'desert',location:{lat:23,lon:53},startDate:'2026-10-01',endDate:'2026-10-02',groupSize:2,transport:'Car',notes:'Private A',checklist:[],revision:0,updatedAt:'2026-09-17T00:00:00Z'};
async function legacyPut(db,store,key,value){const legacy=await db.legacyDb();await new Promise((resolve,reject)=>{const tx=legacy.transaction(store,'readwrite');tx.objectStore(store).put({key,value});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
test('legacy migration preserves exact pending receipt identity and repeats without duplication',async()=>{const h=await harness();h.state.online=false;navigator.onLine=false;const key=JSON.stringify(['A','trip',trip.id]),mutation={operationId:'legacy-edit',entity:'trip',id:trip.id,baseRevision:0,payload:trip};await legacyPut(h.db,'records',key,{owner:'A',entity:'trip',record:trip,deleted:false});await legacyPut(h.db,'outbox',key,{owner:'A',mutation});assert.equal((await h.store.loadTrips()).length,1);assert.equal((await h.store.loadTrips()).length,1);const rows=await h.db.allLocal('outbox');assert.equal(rows.length,1);assert.deepEqual(rows[0].value.mutation,mutation);assert.equal((await h.store.loadTrips())[0].schemaVersion,2)});
test('late legacy edits retain their receipt identity without overwriting upgraded offline data',async()=>{const h=await harness();h.state.online=false;navigator.onLine=false;await h.store.saveTrip({...trip,notes:'New data',activities:['hiking'],itinerary:[{id:'day',dayOffset:0,entries:[]}]});await h.store.syncTrips();const key=JSON.stringify(['A','trip',trip.id]);await legacyPut(h.db,'outbox',key,{owner:'A',mutation:{operationId:'late-legacy',entity:'trip',id:trip.id,baseRevision:0,payload:{...trip,notes:'Old tab edit'}}});const rows=await h.store.loadTrips();assert.equal(rows.length,1);assert.equal(rows[0].notes,'New data');assert.equal(rows[0].itinerary.length,1);const out=await h.db.allLocal('outbox');assert.equal(out.length,2);assert.equal(out.find(r=>r.value.mutation.operationId==='late-legacy').value.mutation.payload.notes,'Old tab edit');assert.equal((await h.store.loadTrips()).length,1);assert.equal((await h.db.allLocal('outbox')).length,2)});
test('migration of an acknowledged old outbox entry does not create a new operation or duplicate trip',async()=>{const h=await harness(),key=JSON.stringify(['A','trip',trip.id]),upgraded={...trip,schemaVersion:2,revision:2,activities:['hiking'],itinerary:[],suggestionDecisions:[]};await h.db.writeLocal('records',key,{owner:'A',entity:'trip',record:upgraded,deleted:false});await legacyPut(h.db,'outbox',key,{owner:'A',mutation:{operationId:'already-acked',entity:'trip',id:trip.id,baseRevision:0,payload:trip}});h.state.remote=[{entity:'trip',id:trip.id,deleted:false,record:upgraded}];const result=await h.store.syncTrips();assert.equal(result.state,'synced');assert.equal(h.state.posted.length,1);assert.equal(h.state.posted[0].mutation.operationId,'already-acked');assert.equal((await h.store.loadTrips()).length,1);assert.equal((await h.db.allLocal('outbox')).length,0);assert.deepEqual((await h.store.loadTrips())[0].activities,['hiking'])});
test('guarded writes detect same-revision offline form changes inside the transaction',async()=>{const h=await harness();h.state.online=false;navigator.onLine=false;const original=await h.store.saveTrip({...trip});await h.store.saveTrip({...original,notes:'Newer offline change'});await assert.rejects(()=>h.store.saveTrip({...original,notes:'Stale proposal'},{expectedTrip:original}),/changed/);assert.equal((await h.store.loadTrips())[0].notes,'Newer offline change');await h.store.syncTrips()});
test('legacy upgrade rejection recovers a copy then synchronizes the original upgraded itinerary',async()=>{const h=await harness(),key=JSON.stringify(['A','trip',trip.id]);await legacyPut(h.db,'outbox',key,{owner:'A',mutation:{operationId:'old-operation',entity:'trip',id:trip.id,baseRevision:1,payload:{...trip,revision:1}}});h.state.postHook=async m=>m.protocol===2?Response.json({conflict:false}):Response.json({error:'Upgrade required'},{status:426});h.state.remote=[{entity:'trip',id:trip.id,deleted:false,record:{...trip,schemaVersion:2,revision:2,itinerary:[{id:'day',dayOffset:0,entries:[]}],activities:[],suggestionDecisions:[]}}];const result=await h.store.syncTrips();assert.equal(result.state,'synced');assert.equal(result.conflicts,1);assert.equal(h.state.posted.length,2);assert.equal(h.state.posted[1].mutation.replacesOperationId,'old-operation');const rows=await h.store.loadTrips();assert.equal(rows.length,2);assert.equal(rows.find(r=>r.id===trip.id).itinerary.length,1);assert.equal(rows.find(r=>r.id!==trip.id).conflictOf,trip.id)});
test('sign-out clears both upgraded private data and preserved legacy pending operations',async()=>{const h=await harness(),key=JSON.stringify(['A','trip',trip.id]);await legacyPut(h.db,'outbox',key,{owner:'A',mutation:{operationId:'old',entity:'trip',id:trip.id,baseRevision:0,payload:trip}});await h.store.loadTrips();await h.store.signOut();assert.equal((await h.db.allLocal('records')).length,0);const db=await h.db.legacyDb(),rows=await new Promise(resolve=>{const req=db.transaction('outbox').objectStore('outbox').getAll();req.onsuccess=()=>resolve(req.result)});assert.equal(rows.length,0)});

test('held session response cannot restore identity after sign-out',async()=>{
 const {store,state,storage}=await harness(),response=deferred();
 state.sessionHook=()=>response.promise;const pending=store.getSession();await store.signOut();
 response.resolve(Response.json({userId:'A',displayName:'A'}));await pending;
 assert.equal(storage.get('daroub-offline-account'),undefined);
});
test('confirmed unauthenticated response cannot resurrect old identity offline',async()=>{
 const {store,state,storage}=await harness();state.identity=null;
 assert.equal(await store.getSession(),null);assert.equal(storage.get('daroub-offline-account'),undefined);
 state.online=false;assert.equal(await store.getSession(),null);
});
test('separate tabs preserve both unsent full-document edits',async()=>{
 const {store,second,state,db}=await harness();state.online=false;navigator.onLine=false;
 const first=await store.saveTrip({...trip,notes:'First tab'});await store.syncTrips();
 const copied=await second.saveTrip({...trip,notes:'Second tab'});await second.syncTrips();
 assert.equal(first.id,trip.id);assert.notEqual(copied.id,trip.id);
 const records=(await db.allLocal('records')).map(row=>row.value.record);
 assert.deepEqual(records.map(row=>row.notes).sort(),['First tab','Second tab']);
 assert.equal((await db.allLocal('outbox')).length,2);
});
test('a second tab cannot delete another tab unsent edits',async()=>{
 const {store,second,state,db}=await harness();state.online=false;navigator.onLine=false;
 await store.saveTrip(trip);await store.syncTrips();
 await assert.rejects(second.deleteTrip(trip.id),/different tab|unsynced/i);
 assert.equal((await db.allLocal('outbox')).length,1);
 assert.equal((await db.allLocal('records'))[0].value.deleted,false);
});
test('held sync snapshot cannot repopulate private records after sign-out',async()=>{
 const {store,state,db,storage}=await harness(),started=deferred(),response=deferred();
 state.getHook=()=>{started.resolve();return response.promise};
 const pending=store.syncTrips();await started.promise;await store.signOut();
 response.resolve(Response.json({records:[{entity:'trip',id:trip.id,record:trip,deleted:false}]}));await pending;
 assert.equal(storage.get('daroub-offline-account'),undefined);assert.equal((await db.allLocal('records')).length,0);
});
test('held mutation receipt cannot recreate account A records after switching to B',async()=>{
 const {store,second,state,db}=await harness(),started=deferred(),response=deferred();
 state.postHook=()=>{started.resolve();return response.promise};await store.saveTrip(trip);
 const pending=store.syncTrips();await started.promise;state.identity={userId:'B',displayName:'B'};await second.getSession();
 response.resolve(Response.json({conflict:false}));await pending;
 assert.equal((await db.allLocal('records')).length,0);assert.equal((await db.allLocal('outbox')).length,0);
 assert.equal(state.posted.length,1);assert.equal(state.posted[0].account,'A');
});
test('save started for A cannot attach old form content to a newly signed-in B',async()=>{
 const {store,second,state,db}=await harness(),held=deferred();let first=true;
 state.sessionHook=()=>{if(first){first=false;return held.promise}return Response.json(state.identity)};
 const pending=store.saveTrip(trip);state.identity={userId:'B',displayName:'B'};await second.getSession();
 held.resolve(Response.json({userId:'A',displayName:'A'}));
 const result=await pending.then(()=>({accepted:true}),()=>({accepted:false}));await store.syncTrips();
 assert.equal(result.accepted,false,'An account change must reject the save begun under A.');
 assert.equal((await db.allLocal('records')).length,0);
});
test('sign-out during account-switch clearing cannot reinstall the switching identity',async()=>{
 const {store,second,state,storage,onRemove}=await harness(),signedOut=deferred();let triggered=false;
 onRemove(key=>{if(key==='daroub-offline-account'&&!triggered){triggered=true;queueMicrotask(()=>{second.signOut().then(signedOut.resolve)})}});
 state.identity={userId:'B',displayName:'B'};await store.getSession();await signedOut.promise;
 assert.equal(storage.get('daroub-offline-account'),undefined);
});
test('late older snapshot cannot overwrite a newer revision without Web Locks',async()=>{
 const {store,second,state,db}=await harness(),started=deferred(),held=deferred();let first=true;
 state.getHook=()=>{if(first){first=false;started.resolve();return held.promise}return Response.json({records:[{entity:'trip',id:trip.id,record:{...trip,notes:'Newer',revision:2},deleted:false}]})};
 const older=store.syncTrips();await started.promise;await second.syncTrips();
 assert.equal((await db.allLocal('records'))[0].value.record.revision,2);
 held.resolve(Response.json({records:[{entity:'trip',id:trip.id,record:{...trip,notes:'Older',revision:1},deleted:false}]}));await older;
 const record=(await db.allLocal('records'))[0].value.record;
 assert.equal(record.revision,2);assert.equal(record.notes,'Newer');
});
test('atomic trip batch validates every record before writing anything',async()=>{
 const {store,state,db}=await harness();state.online=false;navigator.onLine=false;
 await assert.rejects(store.saveTripsBatch([trip,{...trip,id:'invalid-second',groupSize:0}]),/Invalid trip/);
 assert.equal((await db.allLocal('records')).length,0);assert.equal((await db.allLocal('outbox')).length,0);
 await assert.rejects(store.saveTripsBatch([trip,trip]),/Duplicate record ID/);
 assert.equal((await db.allLocal('records')).length,0);
});
test('atomic trip batch saves all records and returns their actual IDs',async()=>{
 const {store,state,db}=await harness();state.online=false;navigator.onLine=false;
 const saved=await store.saveTripsBatch([trip,{...trip,id:'second-trip',title:'Second'}]);await store.syncTrips();
 assert.deepEqual(saved.map(item=>item.id),[trip.id,'second-trip']);
 assert.equal((await db.allLocal('records')).length,2);assert.equal((await db.allLocal('outbox')).length,2);
});
test('same-tab edit during a held POST is automatically drained after acknowledgement',async()=>{
 const {store,state,db}=await harness(),started=deferred(),held=deferred();let first=true;
 state.postHook=mutation=>{state.remote=[{entity:'trip',id:mutation.id,record:{...mutation.payload,revision:mutation.baseRevision+1},deleted:false}];if(first){first=false;started.resolve();return held.promise}return Response.json({conflict:false})};
 await store.saveTrip(trip);const syncing=store.syncTrips();await started.promise;
 await store.saveTrip({...trip,notes:'Changed during POST'});held.resolve(Response.json({conflict:false}));
 const result=await syncing;
 assert.equal(result.state,'synced');assert.equal(result.pending,0);assert.equal(state.posted.length,2);
 assert.equal(state.posted[1].mutation.baseRevision,1);assert.equal((await db.allLocal('outbox')).length,0);
 assert.equal((await db.allLocal('records'))[0].value.record.notes,'Changed during POST');
});
test('atomic batch aborts all earlier writes when a later IndexedDB write fails',async()=>{
 const {store,state,db}=await harness();state.online=false;navigator.onLine=false;
 const originalPut=IDBObjectStore.prototype.put;
 IDBObjectStore.prototype.put=function(value,...args){if(this.name==='records'&&value.value.record.id==='fail-write')throw Error('Simulated storage failure');return originalPut.call(this,value,...args)};
 try{await assert.rejects(store.saveTripsBatch([trip,{...trip,id:'fail-write'}]),/Simulated storage failure/)}finally{IDBObjectStore.prototype.put=originalPut}
 assert.equal((await db.allLocal('records')).length,0);assert.equal((await db.allLocal('outbox')).length,0);
});

test('guarded deletion never removes a newer same-revision offline trip or gear edit',async()=>{const h=await harness();h.state.online=false;navigator.onLine=false;const old=await h.store.saveTrip(trip);await h.store.saveTrip({...old,notes:'Keep newer'});await assert.rejects(()=>h.store.deleteTrip(old.id,{expectedTrip:old}),/changed/);assert.equal((await h.store.loadTrips())[0].notes,'Keep newer');const gear=await h.store.saveGear({id:'gear-delete',schemaVersion:2,name:'Lamp',equipmentId:'light',category:'lighting',quantity:1,condition:'ready',maintenanceDate:'',expiryDate:'',notes:'',archived:false,revision:0,updatedAt:''});await h.store.saveGear({...gear,notes:'Keep gear'});await assert.rejects(()=>h.store.deleteGear(gear.id,{expectedGear:gear}),/changed/);assert.equal((await h.store.loadGear())[0].notes,'Keep gear');await h.store.syncTrips()});



test('password sign-out revokes the current server session before clearing private copies',async()=>{
 const h=await harness();h.state.identity={userId:'A',displayName:'A',authMethod:'password'};await h.store.getSession();await h.db.writeLocal('records','private',{owner:'A',entity:'trip',record:trip,deleted:false});
 let redirect;location.assign=value=>{redirect=value};h.state.postHook=body=>{assert.equal(body.action,'logout');assert.ok(h.storage.get('daroub-offline-account'));return Response.json({ok:true})};
 await h.store.signOut();assert.equal(h.state.posted.at(-1).account,'A');assert.equal(h.storage.get('daroub-offline-account'),undefined);assert.equal((await h.db.allLocal('records')).length,0);assert.equal(redirect,'/');
});
test('failed password sign-out retains identity and private data for an honest retry',async()=>{
 const h=await harness();h.state.identity={userId:'A',displayName:'A',authMethod:'password'};await h.store.getSession();await h.db.writeLocal('records','private',{owner:'A',entity:'trip',record:trip,deleted:false});
 h.state.postHook=()=>Response.json({ok:false},{status:503});await assert.rejects(h.store.signOut(),/unavailable/);assert.ok(h.storage.get('daroub-offline-account'));assert.equal((await h.db.allLocal('records')).length,1);
});
test('late password logout response cannot clear a newly selected owner in client storage',async()=>{
 const h=await harness(),started=deferred(),held=deferred();h.state.identity={userId:'A',displayName:'A',authMethod:'password'};await h.store.getSession();
 h.state.postHook=()=>{started.resolve();return held.promise};const pending=h.store.signOut();await started.promise;
 h.state.identity={userId:'B',displayName:'B',authMethod:'password'};await h.second.getSession();held.resolve(Response.json({ok:true}));await pending;
 assert.equal(JSON.parse(h.storage.get('daroub-offline-account')).userId,'B');
});

test('a signed-out session refresh during logout cannot skip captured-owner cleanup',async()=>{
 const h=await harness(),started=deferred(),held=deferred();h.state.identity={userId:'A',displayName:'A',authMethod:'password'};await h.store.getSession();await h.db.writeLocal('records','private',{owner:'A',entity:'trip',record:trip,deleted:false});
 h.state.postHook=()=>{started.resolve();return held.promise};const pending=h.store.signOut();await started.promise;
 h.state.identity=null;await h.second.getSession();assert.equal((await h.db.allLocal('records')).length,1);
 held.resolve(Response.json({ok:true}));await pending;assert.equal((await h.db.allLocal('records')).length,0);
});
