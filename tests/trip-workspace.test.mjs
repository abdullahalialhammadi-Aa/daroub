import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const bundle=await build({entryPoints:['lib/trip-workspace.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {invalidTripSection}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const trip={id:'trip',title:'A trip',destinationId:null,terrainId:'desert',location:{lat:23,lon:53},startDate:'',endDate:'',groupSize:2,transport:'',notes:'',checklist:[],revision:0,updatedAt:'2026-09-17T00:00:00Z',itinerary:[]};
test('saving from any tab reveals invalid trip metadata before nested panels',()=>{
 assert.equal(invalidTripSection(trip),null);
 for(const patch of [{title:' '},{groupSize:0},{groupSize:1.5},{location:{lat:NaN,lon:53}},{startDate:'2026-10-10',endDate:'2026-10-01'}])assert.equal(invalidTripSection({...trip,...patch}),'overview');
});
test('hidden packing errors are routed without losing itinerary context',()=>{
 const item={id:'lamp',label:'Lamp',category:'custom',done:false,kind:'equipment',requiredQuantity:2,packedQuantity:3,assignedQuantity:0};
 assert.equal(invalidTripSection({...trip,checklist:[item]}),'packing');
 assert.equal(invalidTripSection({...trip,checklist:[{...item,packedQuantity:2}]}),null);
 assert.equal(invalidTripSection({...trip,checklist:[{...item,label:' ',packedQuantity:0}]}),'packing');
});
test('hidden itinerary title and time-zone errors route to the itinerary',()=>{
 const entry={id:'entry',title:'Walk',activityId:'',place:'',startTime:'09:00',timeZone:'Asia/Dubai',durationMinutes:60,transport:'',notes:''};
 const withEntry=e=>({...trip,itinerary:[{id:'day',dayOffset:0,entries:[e]}]});
 assert.equal(invalidTripSection(withEntry(entry)),null);
 assert.equal(invalidTripSection(withEntry({...entry,title:''})),'itinerary');
 assert.equal(invalidTripSection(withEntry({...entry,timeZone:'not-a-zone'})),'itinerary');
 assert.equal(invalidTripSection({...withEntry(entry),groupSize:0}),'overview');
});
