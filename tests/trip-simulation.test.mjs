import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createLoader} from './helpers/load-ts.mjs';
const load=createLoader(),simulation=load('lib/trip-simulation.ts'),{seedCatalog}=load('lib/catalog-seed.ts'),{newTrip}=load('lib/trip-preparation.ts'),{simulationWords}=load('lib/simulation-copy.ts'),{TripSimulator}=load('components/trip-simulator.tsx');
const makeTrip=(patch={})=>({...newTrip('en'),id:'trip',groupSize:2,startDate:'2027-02-01',endDate:'2027-02-02',notes:'Keep private notes',...patch});
const gear=(patch={})=>({id:'owned',schemaVersion:2,name:'My light',category:'essentials',equipmentId:'light',quantity:2,condition:'ready',maintenanceDate:'',expiryDate:'',notes:'Private inventory',archived:false,revision:1,updatedAt:'2026-09-17T01:00:00Z',...patch});
const item=(patch={})=>({id:'manual',label:'My edited light',category:'custom',kind:'equipment',equipmentId:'light',requiredQuantity:3,assignedQuantity:2,packedQuantity:2,done:false,gearId:'owned',gearSnapshot:{name:'Earlier light',quantity:2,condition:'ready'},...patch});
const preview=(trip,patch={},items=[],catalog=seedCatalog)=>simulation.simulateTrip(trip,{...simulation.scenarioInputs(trip),...patch},items,catalog,'en');

test('group scenarios compare source-backed quantities and stock without changing the original trip',async()=>{
 const trip=makeTrip(),source=structuredClone(trip),owned=[gear()],result=await preview(trip,{groupSize:4},owned),row=result.rows.find(row=>row.equipmentId==='light');
 assert.deepEqual(trip,source);assert.deepEqual([row.before,row.after,row.stockBefore,row.stockAfter,row.shortfallBefore,row.shortfallAfter],[2,4,2,2,0,2]);assert.deepEqual(row.drivers,['groupChange']);assert.ok(row.sourceIds.includes('essentials'));assert.ok(row.reason);assert.equal(result.changes.includes('groupChange'),true);
});
test('camping adds the three reviewed rules while duration alone invents no quantity multiplier',async()=>{
 const trip=makeTrip(),camp=await preview(trip,{activities:['camping']}),long=await preview(trip,{endDate:'2027-02-09'});
 for(const id of ['sleeping-bag','sleeping-pad','camping-tent']){const row=camp.rows.find(row=>row.equipmentId===id);assert.equal(row.before,0);assert.equal(row.after,id==='camping-tent'?1:2);assert.ok(row.sourceIds.includes('nps-camping-bedding'));assert.ok(row.drivers.includes('activityChange'));}
 assert.ok(long.rows.every(row=>row.before===row.after));assert.equal(long.afterDays,9);
});
test('date changes use maintenance and expiry boundaries and report stock-only changes',async()=>{
 const trip=makeTrip({endDate:'2027-02-01'}),owned=[gear({maintenanceDate:'2027-02-03'})],result=await preview(trip,{endDate:'2027-02-03'},owned),row=result.rows.find(row=>row.equipmentId==='light');
 assert.deepEqual([row.before,row.after,row.stockBefore,row.stockAfter,row.shortfallAfter],[2,2,2,0,2]);assert.deepEqual(row.drivers,['dateChange']);
 const expires=await preview(trip,{endDate:'2027-02-03'},[gear({expiryDate:'2027-02-03'})]);assert.equal(expires.rows.find(row=>row.equipmentId==='light').stockAfter,2);
});
test('selected increases preserve manual labels, inventory links, packed amounts, tasks and itinerary offsets',async()=>{
 const trip=makeTrip({checklist:[item(),{id:'task',label:'Call guide',category:'custom',kind:'task',done:true}],itinerary:[{id:'day',dayOffset:2,entries:[]}]}),owned=[gear()],result=await preview(trip,{groupSize:5,startDate:'2027-03-01',endDate:'2027-03-03'},owned),next=await simulation.applyTripSimulation(trip,result,['equipment:light'],owned,seedCatalog);
 assert.equal(result.itineraryDatesMove,true);assert.equal(next.checklist[0].requiredQuantity,5);assert.equal(next.checklist[0].packedQuantity,2);assert.equal(next.checklist[0].assignedQuantity,2);assert.equal(next.checklist[0].label,'My edited light');assert.equal(next.checklist[0].gearId,'owned');assert.deepEqual(next.checklist[0].gearSnapshot,trip.checklist[0].gearSnapshot);assert.deepEqual(next.checklist[1],trip.checklist[1]);assert.deepEqual(next.itinerary,trip.itinerary);assert.equal(next.notes,trip.notes);assert.equal(trip.checklist[0].requiredQuantity,3);
});
test('smaller scenarios and unchecked suggestions never reduce, remove or replace manual rows',async()=>{
 const trip=makeTrip({groupSize:5,checklist:[item({requiredQuantity:8,assignedQuantity:5,packedQuantity:7})]}),result=await preview(trip,{groupSize:1}),row=result.rows.find(row=>row.equipmentId==='light');
 assert.equal(row.selectable,false);assert.equal(row.increase,0);const next=await simulation.applyTripSimulation(trip,result,[],[],seedCatalog);assert.equal(next.groupSize,1);assert.deepEqual(next.checklist,trip.checklist);
 await assert.rejects(simulation.applyTripSimulation(trip,result,['equipment:light'],[],seedCatalog),{code:'selection'});
});
test('duplicate equipment records count toward the total while only the necessary increase touches the first',async()=>{
 const trip=makeTrip({checklist:[item({requiredQuantity:3}),item({id:'second',label:'Second manual light',requiredQuantity:4})]}),result=await preview(trip,{groupSize:9}),row=result.rows.find(row=>row.equipmentId==='light');
 assert.deepEqual([row.listed,row.increase,row.applyQuantity],[7,2,5]);const next=await simulation.applyTripSimulation(trip,result,[row.key],[],seedCatalog);assert.equal(next.checklist[0].requiredQuantity,5);assert.deepEqual(next.checklist[1],trip.checklist[1]);assert.equal(next.checklist.length,2);
});
test('missing dates do not activate duration or season rules and itinerary activities remain effective',async()=>{
 const catalog=structuredClone(seedCatalog);catalog.packingRules.push({...catalog.packingRules[0],id:'seasonal',equipmentId:'seasonal',months:[2],minDays:3});
 const trip=makeTrip({startDate:'',endDate:'',activities:[],itinerary:[{id:'campday',dayOffset:0,entries:[{id:'camp',title:'Camp',activityId:'camping',place:'',startTime:'',timeZone:'',durationMinutes:0,transport:'',notes:''}]}]}),result=await preview(trip,{},[],catalog);
 assert.equal(result.datesUnknown,true);assert.equal(result.afterDays,null);assert.ok(!result.rows.some(row=>row.equipmentId==='seasonal'));assert.ok(result.rows.some(row=>row.equipmentId==='sleeping-bag'));
});
test('a changed trip, inventory or catalog invalidates the complete preview before applying',async()=>{
 const trip=makeTrip(),owned=[gear()],result=await preview(trip,{groupSize:5},owned);
 for(const [source,items,catalog] of [[{...trip,notes:'New edit'},owned,seedCatalog],[trip,[gear({quantity:8})],seedCatalog],[trip,owned,{...seedCatalog,revision:99}]])await assert.rejects(simulation.applyTripSimulation(source,result,[],items,catalog),{code:'stale'});
});
test('invalid drafts, invalid scenarios and invalid durations fail clearly without partial changes',async()=>{
 await assert.rejects(preview(makeTrip({title:' '})),{code:'invalidDraft'});await assert.rejects(preview(makeTrip(),{groupSize:NaN}),{code:'invalidScenario'});await assert.rejects(preview(makeTrip(),{endDate:'2027-01-01'}),{code:'invalidScenario'});
 assert.equal(simulation.scenarioEndDate('2028-02-28',3),'2028-03-01');assert.throws(()=>simulation.scenarioEndDate('2027-02-30',3),{code:'invalidScenario'});assert.throws(()=>simulation.scenarioEndDate('2027-02-01',1.5),{code:'invalidScenario'});
 const trip=makeTrip({checklist:Array.from({length:199},(_,i)=>({id:'task'+i,label:'Task',category:'custom',kind:'task',done:false}))}),source=structuredClone(trip),result=await preview(trip,{activities:['camping']}),keys=result.rows.filter(row=>row.selectable).slice(0,2).map(row=>row.key);
 await assert.rejects(simulation.applyTripSimulation(trip,result,keys,[],seedCatalog),{code:'limit'});assert.deepEqual(trip,source);
});
test('oversized rule quantities and semantic manual tasks are never silently converted',async()=>{
 const catalog=structuredClone(seedCatalog);catalog.packingRules=catalog.packingRules.filter(rule=>rule.equipmentId==='light').map(rule=>({...rule,baseQuantity:10000}));
 const huge=await preview(makeTrip(),{groupSize:1000},[],catalog);assert.equal(huge.rows[0].blocked,'quantityLimit');assert.equal(huge.rows[0].selectable,false);
 const manual=await preview(makeTrip({checklist:[{id:'task',label:'Check my light',category:'custom',kind:'task',equipmentId:'light',done:true}]}),{groupSize:3});assert.equal(manual.rows.find(row=>row.equipmentId==='light').blocked,'manualTask');
});
test('five-language controls are separate from a containing trip form and do not apply during render',()=>{
 for(const locale of ['ar','en','fr','zh','hi']){const html=renderToStaticMarkup(React.createElement(TripSimulator,{trip:makeTrip(),gear:[],catalog:seedCatalog,locale,onApply:()=>assert.fail('Unrequested apply')}));for(const input of html.matchAll(/<input\b[^>]*>/g))assert.match(input[0],/form="[^"]+"/);assert.ok(!html.includes('<form'));}
 for(const [key,values] of Object.entries(simulationWords)){assert.equal(values.length,5,key);assert.ok(values.every(value=>typeof value==='string'&&value.trim()),key);}
});

test('deferred Apply cannot overwrite another draft after the simulator unmounts',async()=>{
 let index=0,effects=[];const slots=[],cleanups=[],applied=[];
 const react={...React,useId:()=>':test:',useState(initial){const i=index++;slots[i]??={value:typeof initial==='function'?initial():initial};return[slots[i].value,value=>{slots[i].value=typeof value==='function'?value(slots[i].value):value}];},useRef(value){const i=index++;return slots[i]??={current:value}},useMemo(fn,deps){const i=index++;if(!slots[i]||deps.some((value,n)=>value!==slots[i].deps[n]))slots[i]={value:fn(),deps};return slots[i].value},useEffect(fn,deps){const i=index++;if(!slots[i]||deps.some((value,n)=>value!==slots[i].deps[n])){slots[i]={deps};effects.push(fn);}}};
 let resolveApply,started=0;const delayed=new Promise(resolve=>{resolveApply=resolve}),trip=makeTrip(),gear=[],fake={fingerprint:'test',inputs:simulation.scenarioInputs(trip),rows:[],beforeDays:2,afterDays:2,changes:['groupChange'],datesUnknown:false,itineraryDatesMove:false};
 const {TripSimulator:Component}=createLoader({'react':react,'@/lib/trip-simulation':{...simulation,simulateTrip:async()=>fake,applyTripSimulation:()=>{started++;return delayed}}})('components/trip-simulator.tsx');
 function render(){index=0;effects=[];const tree=Component({trip,gear,catalog:seedCatalog,locale:'en',onApply:value=>applied.push(value)});for(const fn of effects){const cleanup=fn();if(cleanup)cleanups.push(cleanup)}return tree;}
 function find(node,className='primary-btn'){if(!node)return;if(Array.isArray(node)){for(const child of node){const result=find(child,className);if(result)return result}}else if(typeof node==='object'){if(node.type==='button'&&node.props.className===className)return node;return find(node.props?.children,className)}}
 find(render(),'simulation-preview-button').props.onClick();render();await Promise.resolve();await Promise.resolve();const button=find(render());assert.ok(button);button.props.onClick();assert.equal(started,1);for(const cleanup of cleanups)cleanup();resolveApply({...trip,groupSize:99});await Promise.resolve();await Promise.resolve();assert.deepEqual(applied,[]);
});
