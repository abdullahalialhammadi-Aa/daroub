import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const bundle=await build({entryPoints:['lib/checklist-view.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {itemPacked,packingCounts,withPacked}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const row={id:'lamp',label:'Headlamp',category:'essentials',kind:'equipment',done:false,requiredQuantity:4,assignedQuantity:2,packedQuantity:1,gearId:'owned',gearSnapshot:{name:'Lamp',quantity:2,condition:'ready'}};
test('quick packing changes actual packed count without changing ownership, assignments or sources',()=>{
 const packed=withPacked(row,4);assert.equal(itemPacked(packed),true);assert.equal(packed.done,true);assert.equal(packed.assignedQuantity,2);assert.equal(packed.gearId,'owned');assert.deepEqual(packed.gearSnapshot,row.gearSnapshot);assert.equal(row.packedQuantity,1);
 const unpacked=withPacked(packed,0);assert.equal(itemPacked(unpacked),false);assert.equal(unpacked.done,false);assert.equal(unpacked.assignedQuantity,2);
 for(const invalid of [-1,5,NaN,1.5])assert.equal(withPacked(row,invalid),row);
 assert.equal(withPacked({...row,requiredQuantity:NaN},1).packedQuantity,1);
});
test('equipment-unit progress and boolean tasks stay separate, including partial and empty states',()=>{
 const counts=packingCounts([row,{id:'task',label:'Charge phone',category:'custom',kind:'task',done:true}]);
 assert.deepEqual(counts,{equipment:4,packed:1,tasks:1,tasksDone:1,items:2,complete:1});assert.equal(itemPacked({...row,done:true}),false);
 assert.deepEqual(packingCounts([]),{equipment:0,packed:0,tasks:0,tasksDone:0,items:0,complete:0});
 assert.equal(itemPacked({...row,requiredQuantity:NaN,packedQuantity:NaN}),false);
});
test('every checklist label is translated in all five supported languages',async()=>{
 const result=await build({entryPoints:['lib/checklist-copy.ts'],bundle:true,write:false,format:'esm',platform:'node'});
 const {checklistWords}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
 for(const [key,words]of Object.entries(checklistWords)){assert.equal(words.length,5,key);assert.ok(words.every(word=>typeof word==='string'&&word.trim()),key)}
});
