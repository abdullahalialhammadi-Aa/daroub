import 'fake-indexeddb/auto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import ts from 'typescript';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};globalThis.window=new EventTarget();globalThis.location={assign:()=>{}};Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});
let identity={userId:'A',displayName:'Test A'},online=true,deny=false,snapshotFail=false,posted=[],remote=[];
globalThis.fetch=async(url,options={})=>{if(!online)throw Error('offline');if(url==='/api/session')return Response.json(identity);if(options.method==='POST'){if(deny)return new Response('',{status:401});const m=JSON.parse(options.body);assert.equal(options.headers['X-Daroub-Account'],identity.userId);posted.push(m);remote=[{entity:m.entity,id:m.id,deleted:m.payload===null,record:{...m.payload,revision:m.baseRevision+1}}];return Response.json({conflict:0})}if(snapshotFail)throw Error('snapshot unavailable');return Response.json({records:remote})};
mkdirSync('work/test-client',{recursive:true});for(const name of ['local-db','sync-validation','trip-store','preparation-schema']){const src=readFileSync(`lib/${name}.ts`,'utf8').replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'");writeFileSync(`work/test-client/${name}.mjs`,ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText)}
const store=await import(pathToFileURL(resolve('work/test-client/trip-store.mjs')));const db=await import(pathToFileURL(resolve('work/test-client/local-db.mjs')));
const trip={id:'trip1',title:'Trip A',destinationId:'liwa',terrainId:'desert',location:{lat:23,lon:53},startDate:'2026-10-01',endDate:'2026-10-02',groupSize:2,transport:'Car',notes:'',checklist:[],revision:0,updatedAt:new Date().toISOString()};
await store.getSession();online=false;navigator.onLine=false;await store.saveTrip(trip);await store.syncTrips();await store.saveTrip({...trip,notes:'Offline edited'});await store.syncTrips();assert.equal((await db.allLocal('outbox')).length,1);assert.equal((await store.loadTrips())[0].notes,'Offline edited');console.log('PASS offline edits coalesce and persist');
online=true;navigator.onLine=true;deny=true;let result=await store.syncTrips();assert.equal(result.state,'sign-in');assert.equal((await db.allLocal('outbox')).length,1);console.log('PASS expired session preserves pending changes');
deny=false;snapshotFail=true;await store.syncTrips();assert.equal((await db.allLocal('outbox')).length,0);assert.equal((await store.loadTrips())[0].revision,1);console.log('PASS acknowledged revision survives failed snapshot');
snapshotFail=false;result=await store.syncTrips();assert.equal(result.state,'synced');assert.equal(posted.length,1);console.log('PASS reconnect sends latest edit once');
online=false;navigator.onLine=false;await store.saveTrip({...trip,revision:1,notes:'Private A edit'});await store.syncTrips();online=true;navigator.onLine=true;identity={userId:'B',displayName:'Test B'};remote=[];await store.getSession();assert.equal((await store.loadTrips()).length,0);assert.equal((await db.allLocal('outbox')).length,0);await store.syncTrips();assert.equal(posted.length,1);console.log('PASS account switching never sends former account data');
await store.signOut();assert.equal(localStorage.getItem('daroub-offline-account'),null);assert.equal((await db.allLocal('records')).length,0);console.log('PASS sign-out clears private copies');
console.log('6 client synchronization tests passed');
