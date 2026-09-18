// Run against the compiled, local Worker with its migrated local D1 database.
import assert from 'node:assert/strict';
const origin=process.env.DAROUB_TEST_ORIGIN||'http://127.0.0.1:8787';
if(!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw Error('Only local test Workers are allowed');
const run=crypto.randomUUID();
const auth=owner=>({'oai-authenticated-user-id':owner,'oai-authenticated-user-email':owner+'@example.invalid','X-Daroub-Account':owner});
const request=async(path,options={})=>{const response=await fetch(origin+path,{...options,headers:{...options.headers,Connection:"close"}});const body=await response.arrayBuffer();if(response.status>=500)console.error('Worker failure',path,new TextDecoder().decode(body));return new Response(body,{status:response.status,headers:response.headers});};
let count=0;
async function check(name,fn){await fn();count++;console.log('PASS '+name)}
await check('compiled primary pages and direct links render',async()=>{for(const path of ['/','/regions?destination=liwa','/globe?lat=0&lon=0&terrainId=coast','/trips','/inventory','/editor','/offline','/assistant?destination=jebel-shams','/health','/sources','/offline-fallback']){const r=await request(path,{headers:auth('worker-a')});assert.equal(r.status,200,path);const html=await r.text();assert.ok(html.includes('<html'),path);assert.ok(!html.includes('This page couldn’t load'),path)}});
await check('private APIs reject missing identity and wrong account',async()=>{assert.equal((await request('/api/sync')).status,401);assert.equal((await request('/api/sync',{headers:{...auth('worker-a'),'X-Daroub-Account':'worker-b'}})).status,409)});
const trip={id:run,title:'Worker regression',destinationId:'liwa',terrainId:'desert',location:{lat:23,lon:53},startDate:'2026-10-01',endDate:'2026-10-03',groupSize:3,transport:'Vehicle',notes:'synthetic local fixture',checklist:[{id:'water',label:'Water',category:'essentials',done:false}],revision:0,updatedAt:''};
const operation={operationId:run,entity:'trip',id:run,baseRevision:0,payload:trip};
const send=(body,extra={})=>request('/api/sync',{method:'POST',headers:{...auth('worker-a'),Origin:origin,'Content-Type':'application/json',...extra},body:JSON.stringify(body)});
await check('mutation origin, MIME and payload validation',async()=>{assert.equal((await send(operation,{Origin:'https://other.invalid'})).status,403);assert.equal((await send(operation,{'Content-Type':'text/plain'})).status,415);assert.equal((await send({...operation,payload:{...trip,terrainId:'forest'}})).status,400)});
await check('real D1 create, replay and owner isolation',async()=>{const first=await send(operation);assert.equal(first.status,200);assert.equal((await first.json()).conflict,0);const repeat=await send(operation);assert.equal(repeat.status,200);const own=await(await request('/api/sync',{headers:auth('worker-a')})).json();assert.equal(own.records.filter(r=>r.id===run).length,1);const other=await(await request('/api/sync',{headers:auth('worker-b')})).json();assert.equal(other.records.some(r=>r.id===run),false);assert.equal((await send({...operation,payload:{...trip,title:'Reuse mismatch'}})).status,409)});
await check('real D1 conflicting edits and delete preserve recovery',async()=>{assert.equal((await send({...operation,operationId:crypto.randomUUID(),baseRevision:1,payload:{...trip,title:'First edit'}})).status,200);const stale=await send({...operation,operationId:crypto.randomUUID(),baseRevision:1,payload:{...trip,title:'Recover this edit'}});assert.equal((await stale.json()).conflict,1);const own=await(await request('/api/sync',{headers:auth('worker-a')})).json();assert.ok(own.records.some(r=>r.record.conflictOf===run&&r.record.title==='Recover this edit'));assert.equal((await send({...operation,operationId:crypto.randomUUID(),baseRevision:2,payload:null})).status,200)});
await check('assistant guide mode and invalid requests',async()=>{const r=await request('/api/assistant',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({question:'What equipment should I pack?',locale:'en',destinationId:'liwa',terrainIndex:0,useAI:false})});assert.equal(r.status,200);const answer=await r.json();assert.equal(answer.mode,'guide');assert.ok(answer.sourceIds.length);assert.ok(answer.text.length>20);assert.equal((await request('/api/assistant',{method:'POST',headers:{Origin:'https://other.invalid','Content-Type':'application/json'},body:'{}'})).status,403)});
await check('invalid weather coordinates fail accessibly',async()=>{assert.equal((await request('/api/weather?lat=91&lon=0&part=current')).status,400)});

const owner=process.env.DAROUB_TEST_OWNER||'owner-a',editor=process.env.DAROUB_TEST_EDITOR||'editor-a';
const protocolHeaders={'X-Daroub-Protocol':'2'};
const syncRecords=async(user,protocol=true)=>{const response=await request('/api/sync',{headers:{...auth(user),...(protocol?protocolHeaders:{})}});assert.equal(response.status,200);return (await response.json()).records};
const sendV2=mutation=>send({...mutation,protocol:2},protocolHeaders);
const gearId='gear-'+run,tripId='trip-'+run;
const gear={id:gearId,schemaVersion:2,name:'Synthetic headlamp',category:'essentials',equipmentId:'light',quantity:4,condition:'ready',maintenanceDate:'2027-01-01',expiryDate:'2028-01-01',notes:'Synthetic private gear notes',archived:false,revision:0,updatedAt:new Date().toISOString()};
const planned={...trip,id:tripId,schemaVersion:2,activities:['walking'],catalogRevision:0,suggestionDecisions:[],checklist:[{id:'lamp',label:'Headlamps',category:'essentials',done:false,kind:'equipment',equipmentId:'light',gearId,gearSnapshot:{name:gear.name,quantity:4,condition:'ready'},requiredQuantity:4,assignedQuantity:3,packedQuantity:2},{id:'contact',label:'Share route',category:'custom',done:true,kind:'task'}],itinerary:[{id:'day-1',dayOffset:0,entries:[{id:'walk-1',title:'Synthetic walk',activityId:'walking',place:'Synthetic stop',coordinates:{lat:23,lon:53},startTime:'08:30',timeZone:'Asia/Dubai',durationMinutes:90,transport:'On foot',notes:'Private itinerary notes'}]},{id:'day-2',dayOffset:2,entries:[{id:'review-2',title:'Review supplies',activityId:'preparation',place:'',startTime:'',timeZone:'',durationMinutes:0,transport:'',notes:''}]}]};
await check('v2 equipment and itinerary round-trip with partial quantities, replay and owner isolation',async()=>{
 const gearOperation={operationId:'save-'+gearId,entity:'gear',id:gearId,baseRevision:0,payload:gear};
 const first=await sendV2(gearOperation);assert.equal(first.status,200);assert.equal((await first.json()).conflict,0);assert.equal((await sendV2(gearOperation)).status,200);
 assert.equal((await sendV2({operationId:'save-'+tripId,entity:'trip',id:tripId,baseRevision:0,payload:planned})).status,200);
 const records=await syncRecords('worker-a'),savedGear=records.find(r=>r.id===gearId)?.record,saved=records.find(r=>r.id===tripId)?.record;
 assert.ok(savedGear);for(const field of ['name','quantity','condition','maintenanceDate','expiryDate','notes','archived'])assert.deepEqual(savedGear[field],gear[field],field);
 assert.equal(saved.schemaVersion,2);assert.deepEqual(saved.itinerary,planned.itinerary);assert.deepEqual(saved.activities,['walking']);assert.equal(saved.checklist[0].requiredQuantity,4);assert.equal(saved.checklist[0].assignedQuantity,3);assert.equal(saved.checklist[0].packedQuantity,2);assert.equal(saved.checklist[0].done,false);assert.deepEqual(saved.checklist[0].gearSnapshot,planned.checklist[0].gearSnapshot);assert.equal(saved.checklist[1].done,true);
 assert.equal(records.filter(r=>r.id===gearId).length,1);assert.ok(!(await syncRecords('worker-b')).some(r=>r.id===gearId||r.id===tripId));
 assert.ok(!(await syncRecords('worker-a',false)).some(r=>r.id===gearId||r.id===tripId));
});
await check('v2 updates preserve itinerary and independent packing quantities',async()=>{
 const next={...planned,title:'Edited without replacing nested details',checklist:planned.checklist.map(row=>row.id==='lamp'?{...row,packedQuantity:4,assignedQuantity:1}:row)};
 assert.equal((await sendV2({operationId:crypto.randomUUID(),entity:'trip',id:tripId,baseRevision:1,payload:next})).status,200);
 const saved=(await syncRecords('worker-a')).find(r=>r.id===tripId).record;assert.deepEqual(saved.itinerary,planned.itinerary);assert.equal(saved.checklist[0].packedQuantity,4);assert.equal(saved.checklist[0].assignedQuantity,1);assert.equal(saved.checklist[0].done,true);
 assert.equal((await sendV2({operationId:crypto.randomUUID(),entity:'gear',id:gearId,baseRevision:1,payload:{...gear,archived:true}})).status,200);
 const after=(await syncRecords('worker-a')).find(r=>r.id===tripId).record;assert.deepEqual(after.checklist,saved.checklist,'Archiving must not silently rewrite trip snapshots');
});
await check('legacy writes receive 426 without a receipt or nested-data loss',async()=>{
 const id=crypto.randomUUID(),legacy={...trip,id:tripId,title:'Attempted legacy overwrite'},mutation={operationId:id,entity:'trip',id:tripId,baseRevision:2,payload:legacy};
 assert.equal((await send(mutation)).status,426);assert.equal((await send(mutation)).status,426);
 const before=(await syncRecords('worker-a')).find(r=>r.id===tripId).record;assert.deepEqual(before.itinerary,planned.itinerary);assert.equal(before.revision,2);
 // Reusing the rejected operation identity with an upgraded payload proves rejection wrote no receipt.
 assert.equal((await sendV2({...mutation,payload:{...before,title:'Upgraded safely'}})).status,200);
 assert.equal((await send({operationId:crypto.randomUUID(),entity:'gear',id:gearId,baseRevision:2,payload:gear})).status,426);
 assert.equal((await send({...mutation,operationId:crypto.randomUUID(),protocol:2,payload:planned})).status,426,'Protocol declaration requires matching header');
 const after=(await syncRecords('worker-a')).find(r=>r.id===tripId).record;assert.equal(after.title,'Upgraded safely');assert.deepEqual(after.itinerary,planned.itinerary);
});
await check('compiled v2 validation rejects malformed quantities and time zones before storage',async()=>{
 for(const patch of [{checklist:[{...planned.checklist[0],packedQuantity:5}]},{itinerary:[{...planned.itinerary[0],entries:[{...planned.itinerary[0].entries[0],timeZone:'Invalid/Zone'}]}]},{itinerary:[{...planned.itinerary[0],dayOffset:3651}]}]){
  const id='invalid-'+crypto.randomUUID(),response=await sendV2({operationId:crypto.randomUUID(),entity:'trip',id,baseRevision:0,payload:{...planned,...patch,id}});assert.equal(response.status,400);assert.ok(!(await syncRecords('worker-a')).some(r=>r.id===id));
 }
});
const editorPost=(user,body,extra={})=>request('/api/editor',{method:'POST',headers:{...auth(user),Origin:origin,'Content-Type':'application/json',...extra},body:JSON.stringify(body)});
await check('editor endpoints reject ordinary users and never expose drafts publicly',async()=>{
 assert.equal((await request('/api/editor')).status,401);assert.equal((await request('/api/editor',{headers:auth('worker-a')})).status,403);
 assert.equal((await editorPost('worker-a',{action:'save',draft:{}})).status,403);
 const response=await request('/api/catalog');assert.equal(response.status,200);assert.match(response.headers.get('cache-control')||'',/no-store/);const published=await response.json();assert.equal(published.schemaVersion,1);assert.equal('drafts'in published,false);assert.equal('history'in published,false);
});
await check('owner/editor permissions, private drafts, publication and rollback work in compiled D1',async()=>{
 const stateResponse=await request('/api/editor',{headers:auth(owner)});assert.equal(stateResponse.status,200,'Configure local DAROUB_OWNER_IDS for '+owner);const state=await stateResponse.json();assert.equal(state.role,'owner');const baseline=state.catalog;
 const editorResponse=await request('/api/editor',{headers:auth(editor)});assert.equal(editorResponse.status,200,'Configure local DAROUB_EDITOR_IDS for '+editor);assert.equal((await editorResponse.json()).role,'editor');
 const draftId='catalog-'+run,marker='Synthetic Worker review '+run,snapshot=structuredClone(baseline);snapshot.destinations[0].sections[0].body=snapshot.destinations[0].sections[0].body.map(value=>value+'\n'+marker);
 const initial={id:draftId,revision:0,baseCatalogRevision:baseline.revision,snapshot,reviewedLocales:['ar','en','fr','zh','hi'],updatedAt:new Date().toISOString()};
 assert.equal((await editorPost(owner,{action:'save',draft:initial},{Origin:'https://other.invalid'})).status,403);
 assert.equal((await editorPost(owner,{action:'save',draft:initial},{'Content-Type':'text/plain'})).status,415);
 const firstResponse=await editorPost(editor,{action:'save',draft:initial});assert.equal(firstResponse.status,200);let draft=await firstResponse.json();assert.deepEqual(draft.reviewedLocales,[],'Changed translations must require another review');
 assert.equal(JSON.stringify(await(await request('/api/catalog')).json()).includes(marker),false);
 assert.equal((await editorPost(editor,{action:'publish',id:draftId,revision:draft.revision,expectedCatalogRevision:baseline.revision})).status,403);
 assert.equal((await editorPost(owner,{action:'publish',id:draftId,revision:draft.revision,expectedCatalogRevision:baseline.revision})).status,400,'Unreviewed translations cannot publish');
 const reviewedResponse=await editorPost(editor,{action:'save',draft:{...draft,reviewedLocales:['ar','en','fr','zh','hi']}});assert.equal(reviewedResponse.status,200);draft=await reviewedResponse.json();assert.equal(draft.reviewedLocales.length,5);
 assert.equal((await editorPost(owner,{action:'save',draft:initial})).status,409,'Stale draft rejected');
 let published;
 try{
  const response=await editorPost(owner,{action:'publish',id:draftId,revision:draft.revision,expectedCatalogRevision:baseline.revision});assert.equal(response.status,200);published=await response.json();assert.equal(published.revision,baseline.revision+1);
  const visible=await(await request('/api/catalog')).json();assert.equal(visible.revision,published.revision);assert.ok(JSON.stringify(visible).includes(marker));
  assert.equal((await editorPost(owner,{action:'rollback',revision:baseline.revision,expectedCatalogRevision:baseline.revision})).status,409,'Stale publication head rejected');
  assert.equal((await editorPost(editor,{action:'rollback',revision:baseline.revision,expectedCatalogRevision:published.revision})).status,403);
 }finally{
  if(published){const restoredResponse=await editorPost(owner,{action:'rollback',revision:baseline.revision,expectedCatalogRevision:published.revision});assert.equal(restoredResponse.status,200,'Restore local catalog baseline');const restored=await restoredResponse.json();assert.equal(restored.revision,published.revision+1);assert.deepEqual(restored.destinations,baseline.destinations);assert.deepEqual(restored.packingRules,baseline.packingRules);assert.equal(JSON.stringify(restored).includes(marker),false);}
 }
});
console.log(`${count} compiled Worker checks passed`);


