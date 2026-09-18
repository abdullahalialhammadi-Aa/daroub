import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const load=async file=>{const result=await build({entryPoints:[fileURLToPath(new URL(file,import.meta.url))],bundle:true,write:false,format:'esm',platform:'node'});return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));};
const engine=await load('../lib/packing-engine.ts'),assistant=await load('../lib/assistant-trip.ts'),guide=await load('../lib/assistant-guide.ts'),{seedCatalog}=await load('../lib/catalog-seed.ts'),{normalizeTrip}=await load('../lib/preparation-schema.ts');
const makeTrip=(changes={})=>({id:'trip-1',title:'Private trip title',destinationId:'liwa',terrainId:'desert',location:{lat:23,lon:53},startDate:'2027-01-31',endDate:'2027-02-02',groupSize:3,transport:'4x4',notes:'PRIVATE-TRIP-NOTES',checklist:[],revision:2,updatedAt:'2026-09-17T01:00:00.000Z',activities:[],itinerary:[],...changes});
const makeGear=(changes={})=>({id:'gear-1',schemaVersion:2,name:'PRIVATE-INVENTORY',category:'essentials',equipmentId:'light',quantity:2,condition:'ready',maintenanceDate:'',expiryDate:'',notes:'PRIVATE-GEAR-NOTES',archived:false,revision:1,updatedAt:'2026-09-17T01:00:00.000Z',...changes});
const rule=(changes={})=>({...seedCatalog.packingRules[0],id:'rule-one',equipmentId:'test-gear',baseQuantity:2,...changes});
const catalog=(rules)=>({...seedCatalog,revision:9,packingRules:rules});
const request={question:'Equipment?',locale:'en',destinationId:'liwa',terrainIndex:0,topic:'equipment'};
test('Packing matches trip seasons, duration, activities, transport, group and local coverage',async()=>{
 const rules=[rule({months:[2],minDays:3,activities:['walking'],transport:['4x4'],perPerson:true}),rule({id:'wrong-month',equipmentId:'wrong-month',months:[3]}),rule({id:'too-long',equipmentId:'too-long',minDays:4}),rule({id:'boat-only',equipmentId:'boat-only',transport:['boat']}),rule({id:'local',equipmentId:'local',coverage:'local',destinationIds:['liwa']})];
 const trip=makeTrip({activities:['walking']}),suggestions=await engine.packingSuggestions(trip,[],catalog(rules),'en');
 assert.equal(suggestions.length,2);assert.equal(suggestions.find(s=>s.equipmentId==='test-gear').quantity,6);
 const arbitrary=await engine.packingSuggestions({...trip,destinationId:null},[],catalog(rules),'en');assert.equal(arbitrary.some(s=>s.coverage==='local'),false);
 assert.deepEqual(engine.tripMonths(trip),[1,2]);assert.equal(engine.tripDuration(trip),3);
});
test('Invalid or missing dates never activate seasonal or multi-day rules',async()=>{
 for(const dates of [{startDate:'',endDate:''},{startDate:'2027-02-30',endDate:'2027-03-04'},{startDate:'2027-03-03',endDate:'2027-03-01'}]){
  const trip=makeTrip(dates);assert.equal(engine.tripDuration(trip),null);assert.deepEqual(await engine.packingSuggestions(trip,[],catalog([rule({months:[3]}),rule({id:'long',minDays:2})]),'en'),[]);
 }
});
test('Inventory availability excludes archive, maintenance, expiry and unavailable items through trip end',async()=>{
 const trip=makeTrip(),items=[makeGear(),makeGear({id:'expired',expiryDate:'2027-02-01',quantity:99}),makeGear({id:'due',maintenanceDate:'2027-01-31',quantity:99}),makeGear({id:'bad',condition:'needs-maintenance',quantity:99}),makeGear({id:'archived',archived:true,quantity:99}),makeGear({id:'unavailable',condition:'unavailable',quantity:99})];
 const suggestion=(await engine.packingSuggestions(trip,items,seedCatalog,'en')).find(s=>s.equipmentId==='light');assert.equal(suggestion.available,2);assert.equal(engine.availableGear(items,'light',trip).length,1);
});
test('Overlapping rules deduplicate by equipment ID and preserve strongest quantity',async()=>{
 const suggestions=await engine.packingSuggestions(makeTrip(),[],catalog([rule(),rule({id:'second',baseQuantity:3,perPerson:true})]),'en');assert.equal(suggestions.length,1);assert.equal(suggestions[0].quantity,9);
 const reverse=await engine.packingSuggestions(makeTrip(),[],catalog([rule({id:'second',baseQuantity:3,perPerson:true}),rule()]),'en');assert.equal(suggestions[0].fingerprint,reverse[0].fingerprint);
});
test('Dismissals persist for unchanged inputs and reappear when relevant inputs change',async()=>{
 const trip=makeTrip(),first=(await engine.packingSuggestions(trip,[],seedCatalog,'en'))[0],dismissed=engine.dismissPackingSuggestion(trip,first);
 assert.equal(engine.suggestionState(dismissed,first),'dismissed');const next=(await engine.packingSuggestions({...dismissed,groupSize:4},[],seedCatalog,'en')).find(s=>s.key===first.key);assert.equal(engine.suggestionState(dismissed,next),'changed');
 const translated=(await engine.packingSuggestions(trip,[],seedCatalog,'ar')).find(s=>s.key===first.key);assert.equal(translated.fingerprint,first.fingerprint);
});
test('Accepting edited quantities assigns usable gear and repeat acceptance keeps stable IDs and manual labels',async()=>{
 const trip=makeTrip(),gear=[makeGear()],s=(await engine.packingSuggestions(trip,gear,seedCatalog,'en')).find(s=>s.equipmentId==='light');
 const accepted=await engine.acceptPackingSuggestion(trip,s,gear,4,'gear-1');assert.equal(accepted.checklist.length,1);assert.equal(accepted.checklist[0].requiredQuantity,4);assert.equal(accepted.checklist[0].assignedQuantity,2);assert.equal(accepted.checklist[0].done,false);
 accepted.checklist[0].label='My edited lamp';accepted.checklist[0].packedQuantity=3;
 const repeated=await engine.acceptPackingSuggestion(accepted,s,gear,2);assert.equal(repeated.checklist.length,1);assert.equal(repeated.checklist[0].id,accepted.checklist[0].id);assert.equal(repeated.checklist[0].label,'My edited lamp');assert.equal(repeated.checklist[0].packedQuantity,2);assert.equal(repeated.checklist[0].done,true);
 await assert.rejects(engine.acceptPackingSuggestion(trip,s,gear,0));await assert.rejects(engine.acceptPackingSuggestion(trip,s,[makeGear({archived:true})],1,'gear-1'));
});
test('Trip fingerprints normalize v1 defaults, ignore timestamps, and detect unsynced same-revision edits',async()=>{
 const trip=makeTrip();assert.equal(await engine.tripContentFingerprint(trip),await engine.tripContentFingerprint(normalizeTrip(trip)));assert.equal(await engine.tripContentFingerprint(trip),await engine.tripContentFingerprint({...trip,updatedAt:'2026-09-18T01:00:00Z'}));assert.notEqual(await engine.tripContentFingerprint(trip),await engine.tripContentFingerprint({...trip,notes:'changed offline'}));
});
test('Assistant uses selected saved trip context and stable editable proposals without mutations',async()=>{
 const trip=makeTrip({destinationId:'hurghada',terrainId:'coast',activities:['boating']}),before=structuredClone(trip),answer=await assistant.retrieveTripGuide(request,trip,[],seedCatalog);
 assert.equal(answer.destinationId,'hurghada');assert.equal(answer.tripContext.id,trip.id);assert.deepEqual(trip,before);assert.ok(answer.proposals.some(p=>p.items?.[0]?.equipmentId==='life-jacket'));assert.ok(answer.sources.length);
 const p=answer.proposals[0],changed=await assistant.applyAssistantProposal(trip,p,7,seedCatalog.revision);assert.equal(changed.checklist[0].requiredQuantity,7);assert.equal(changed.revision,trip.revision);assert.equal(changed.checklist[0].done,false);
 await assert.rejects(assistant.applyAssistantProposal({...trip,groupSize:4},p,undefined,seedCatalog.revision),/Stale/);await assert.rejects(assistant.applyAssistantProposal({...trip,revision:3},p,undefined,seedCatalog.revision),/Stale/);await assert.rejects(assistant.applyAssistantProposal({...trip,id:'someone-else'},p,undefined,seedCatalog.revision),/Stale/);
 const second=await assistant.retrieveTripGuide(request,trip,[],seedCatalog);assert.deepEqual(second.proposals,answer.proposals);
});
test('Applying a repeated equipment proposal cannot duplicate items and requires a fresh source snapshot',async()=>{
 const trip=makeTrip(),answer=await assistant.retrieveTripGuide(request,trip,[],seedCatalog),p=answer.proposals[0],once=await assistant.applyAssistantProposal(trip,p,undefined,seedCatalog.revision);
 await assert.rejects(assistant.applyAssistantProposal(once,p,undefined,seedCatalog.revision),/Stale/);
 const unchanged=await assistant.retrieveTripGuide(request,once,[],seedCatalog);assert.equal(unchanged.proposals.some(proposal=>proposal.items?.[0]?.equipmentId===p.items[0].equipmentId),false);
 const newInputs={...once,groupSize:4},refreshed=await assistant.retrieveTripGuide(request,newInputs,[],seedCatalog),same=refreshed.proposals.find(proposal=>proposal.items?.[0]?.equipmentId===p.items[0].equipmentId),twice=await assistant.applyAssistantProposal(newInputs,same,undefined,seedCatalog.revision);assert.equal(twice.checklist.length,1);assert.equal(twice.checklist[0].id,once.checklist[0].id);
});
test('Itinerary preview is an explicit dated first-day template with no fabricated route or automatic write',async()=>{
 const trip=makeTrip(),answer=await assistant.retrieveTripGuide({...request,topic:'planning'},trip,[],seedCatalog),proposal=answer.proposals.find(p=>p.type==='add-itinerary');assert.equal(proposal.dayOffset,0);assert.equal(proposal.entry.startTime,'');assert.equal(proposal.entry.place,'');assert.equal(proposal.entry.timeZone,'Asia/Dubai');
 const changed=await assistant.applyAssistantProposal(trip,proposal,undefined,seedCatalog.revision);assert.equal(changed.itinerary[0].entries.length,1);assert.equal(trip.itinerary.length,0);
 const second=await assistant.retrieveTripGuide({...request,topic:'planning'},changed,[],seedCatalog);assert.equal(second.proposals.some(p=>p.type==='add-itinerary'),false);
 const undated=await assistant.retrieveTripGuide({...request,topic:'planning'},makeTrip({startDate:'',endDate:''}),[],seedCatalog);assert.equal(undated.proposals.some(p=>p.type==='add-itinerary'),false);
});
test('External AI trip sharing is opt-in and never includes saved notes, titles, free text places, gear or health',()=>{
 const trip=makeTrip({itinerary:[{id:'d',dayOffset:0,entries:[{id:'e',title:'PRIVATE-ENTRY',activityId:'walking',place:'PRIVATE-PLACE',startTime:'10:00',timeZone:'Asia/Dubai',durationMinutes:40,transport:'PRIVATE-TRANSPORT',notes:'PRIVATE-ENTRY-NOTES'}]}],lastReadingAt:1234567}),answer=guide.retrieveGuide(request,seedCatalog);
 const without=JSON.stringify(guide.aiMessages(request,answer,seedCatalog,trip));assert.equal(without.includes('2027-01-31'),false);assert.equal(without.includes('TRIP FACTS'),false);
 const shared=JSON.stringify(guide.aiMessages({...request,shareTripContext:true},answer,seedCatalog,trip));assert.match(shared,/2027-01-31/);assert.match(shared,/walking/);for(const secret of ['Private trip title','PRIVATE-TRIP-NOTES','PRIVATE-ENTRY','PRIVATE-PLACE','PRIVATE-TRANSPORT','1234567','PRIVATE-GEAR-NOTES'])assert.equal(shared.includes(secret),false,secret);
});
test('Published catalog changes drive assistant guidance and sources without compiled-destination leakage',()=>{
 const published=structuredClone(seedCatalog);published.revision=99;published.destinations.push({...published.destinations[0],id:'new-destination',sections:[{id:'equipment',title:['أ','Title','Titre','标题','शीर्षक'],body:['أحدث','New published equipment','Nouveau matériel','新装备','नए उपकरण'],sourceIds:['new-source']}],species:[]});published.sources.push({id:'new-source',title:'New source',url:'https://example.com/source',reviewedAt:'2026-09-17'});
 const input={...request,destinationId:'new-destination'};assert.ok(guide.validateAssistantRequest(input,published));const answer=guide.retrieveGuide(input,published);assert.match(answer.text,/New published equipment/);assert.equal(answer.catalogRevision,99);assert.deepEqual(answer.sourceIds,['new-source']);assert.equal(answer.sources[0].title,'New source');
});
test('New packing and assistant strings include all five languages',async()=>{
 for(const file of ['../lib/packing-copy.ts','../lib/assistant-preparation-copy.ts']){const loadedModule=await load(file),dictionary=loadedModule.packingWords??loadedModule.assistantPreparationWords;for(const [key,values]of Object.entries(dictionary)){assert.equal(values.length,5,key);assert.ok(values.every(s=>typeof s==='string'&&s.trim()),key);}}
});

test('Full checklists and itineraries still return a useful guide without impossible new proposals',async()=>{
 const trip=makeTrip({checklist:Array.from({length:200},(_,i)=>({id:'manual-'+i,label:'Manual item',category:'custom',done:false})),itinerary:[{id:'full-day',dayOffset:0,entries:Array.from({length:40},(_,i)=>({id:'entry-'+i,title:'Manual entry',activityId:'walking',place:'',startTime:'',timeZone:'',durationMinutes:0,transport:'',notes:''}))}]}),before=structuredClone(trip),snapshot=structuredClone(seedCatalog);
 const result=await assistant.retrieveTripGuide({...request,topic:'planning'},trip,[],seedCatalog);assert.equal(result.proposals.length,0);assert.ok(result.text);assert.deepEqual(trip,before);assert.deepEqual(seedCatalog,snapshot);
});
test('Changing catalog rule version invalidates a dismissed fingerprint without mutating manual work',async()=>{
 const trip=makeTrip(),original=catalog([rule()]),suggestion=(await engine.packingSuggestions(trip,[],original,'en'))[0],saved=engine.dismissPackingSuggestion(trip,suggestion),before=structuredClone(saved),revised=catalog([rule({version:2,baseQuantity:5})]);
 const next=(await engine.packingSuggestions(saved,[],revised,'en'))[0];assert.equal(next.key,suggestion.key);assert.notEqual(next.fingerprint,suggestion.fingerprint);assert.equal(engine.suggestionState(saved,next),'changed');assert.deepEqual(saved,before);assert.equal(original.packingRules[0].baseQuantity,2);
});

test('Explicit no-assignment unlinks inventory, clears assigned quantity and retains historical snapshot',async()=>{
 const trip=makeTrip(),gear=[makeGear()],suggestion=(await engine.packingSuggestions(trip,gear,seedCatalog,'en')).find(s=>s.equipmentId==='light'),linked=await engine.acceptPackingSuggestion(trip,suggestion,gear,4,'gear-1');
 const kept=await engine.acceptPackingSuggestion(linked,suggestion,gear,4);assert.equal(kept.checklist[0].gearId,'gear-1');assert.equal(kept.checklist[0].assignedQuantity,2);
 const unlinked=await engine.acceptPackingSuggestion(linked,suggestion,gear,4,null);assert.equal(unlinked.checklist[0].gearId,undefined);assert.equal(unlinked.checklist[0].assignedQuantity,0);assert.deepEqual(unlinked.checklist[0].gearSnapshot,linked.checklist[0].gearSnapshot);assert.equal(linked.checklist[0].gearId,'gear-1');
});
test('Maintenance due on the trip end date is unavailable; expiry remains valid through its stated date',()=>{
 const trip=makeTrip();assert.equal(engine.gearUsable(makeGear({maintenanceDate:trip.endDate}),trip),false);assert.equal(engine.gearUsable(makeGear({maintenanceDate:'2027-02-03'}),trip),true);assert.equal(engine.gearUsable(makeGear({expiryDate:trip.endDate}),trip),true);assert.equal(engine.gearUsable(makeGear({expiryDate:'2027-02-01'}),trip),false);
});
test('Assistant summaries show packed equipment quantities separately from completed tasks in every language',async()=>{
 const trip=makeTrip({checklist:[{id:'light',kind:'equipment',label:'Lamps',category:'equipment',done:false,requiredQuantity:4,packedQuantity:2,assignedQuantity:0},{id:'task-a',kind:'task',label:'Check permit',category:'tasks',done:true},{id:'task-b',kind:'task',label:'Check route',category:'tasks',done:false}]});
 const {assistantPreparationText}=await load('../lib/assistant-preparation-copy.ts');for(const locale of ['ar','en','fr','zh','hi']){const result=await assistant.retrieveTripGuide({...request,locale,topic:'terrain'},trip,[],seedCatalog);assert.ok(result.text.includes(assistantPreparationText(locale,'packed')+': 2/4'));assert.ok(result.text.includes(assistantPreparationText(locale,'tasks')+': 1/2'));}
});
test('Catalog publication changes invalidate assistant proposals even when trip revision and fingerprint match',async()=>{
 const trip=makeTrip(),answer=await assistant.retrieveTripGuide(request,trip,[],seedCatalog),proposal=answer.proposals[0];assert.equal(proposal.expectedCatalogRevision,seedCatalog.revision);
 await assert.rejects(assistant.applyAssistantProposal(trip,proposal,undefined,seedCatalog.revision+1),/Catalog changed/);await assert.rejects(assistant.applyAssistantProposal(trip,proposal),/Catalog changed/);
 const newer=await assistant.retrieveTripGuide(request,trip,[],{...seedCatalog,revision:1});assert.notEqual(newer.proposals[0].id,proposal.id);
 assert.deepEqual(await assistant.checkProposalCatalog(proposal,seedCatalog,false),{revision:0,offline:true});await assert.rejects(assistant.checkProposalCatalog(proposal,{...seedCatalog,revision:1},false),/Catalog changed/);
 let requests=0;const fetchRevision=revision=>async(url,options)=>{requests++;assert.equal(url,'/api/catalog');assert.equal(options.cache,'no-store');return Response.json({schemaVersion:1,revision});};
 assert.deepEqual(await assistant.checkProposalCatalog(proposal,seedCatalog,true,fetchRevision(0)),{revision:0,offline:false});await assert.rejects(assistant.checkProposalCatalog(proposal,seedCatalog,true,fetchRevision(1)),/Catalog changed/);
 await assert.rejects(assistant.checkProposalCatalog(proposal,{...seedCatalog,revision:1},true,fetchRevision(0)),/Catalog changed/);assert.equal(requests,2,'Known newer publication must reject before a stale network response can override it');
 await assert.rejects(assistant.checkProposalCatalog(proposal,seedCatalog,true,async()=>{throw Error('network');}),/Catalog unavailable/);
});

