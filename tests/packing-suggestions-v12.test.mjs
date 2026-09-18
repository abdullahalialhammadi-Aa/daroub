import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createLoader} from './helpers/load-ts.mjs';

const load=createLoader({'./packing.css':{},'./packing-panel.css':{}}),engine=load('lib/packing-engine.ts');
const {PackingSuggestionRow,packingReviewItems}=load('components/packing-panel.tsx'),{packingWords,packingText}=load('lib/packing-copy.ts');
const base={id:'trip-a',title:'Trip',schemaVersion:2,terrainId:'desert',destinationId:'liwa',location:{lat:23,lon:54},startDate:'2026-11-01',endDate:'2026-11-02',groupSize:4,transport:'car',notes:'',checklist:[],activities:[],itinerary:[],revision:1,updatedAt:'2026-09-17T00:00:00Z',suggestionDecisions:[]};
const suggestion={key:'equipment:water',fingerprint:'same-inputs',equipmentId:'water',label:'Water containers',category:'essentials',quantity:4,quantityBasis:'person',available:0,reason:'Carry supplies for the route.\nConfirm conditions locally before departure.',sourceIds:['source'],catalogRevision:1,coverage:'terrain-example',destinationSpecific:true};
const catalog={schemaVersion:1,revision:1,publishedAt:'2026-09-17',destinations:[],packingRules:[],terrainGuidance:[],sources:[{id:'source',title:'Official guide',url:'https://example.org/guide',reviewedAt:'2026-09-17'}]};
const items=Array.from({length:6},(_,index)=>({...suggestion,key:'equipment:item-'+index,equipmentId:'item-'+index,label:'Item '+index,destinationSpecific:index===5}));
const rowHtml=(trip=base,item=suggestion,locale='en')=>renderToStaticMarkup(React.createElement(PackingSuggestionRow,{trip,suggestion:item,catalog,gear:[],locale,busy:false,onAccept(){},onDismiss(){},formOwner:'separate-proposal-owner'}));
function nodes(node,predicate){if(Array.isArray(node))return node.flatMap(child=>nodes(child,predicate));if(!node||typeof node!=='object')return[];return[...(predicate(node)?[node]:[]),...nodes(node.props?.children,predicate)]}

test('compact rows keep quantity meaning visible and put all secondary controls in one disclosure',()=>{
 const html=rowHtml(),start=html.indexOf('<details');assert.equal((html.match(/<details/g)||[]).length,1);
 for(const text of ['Water containers','Carry supplies for the route.','Count to add','1 per person × 4 people = 4','This count is not litres of water'])assert.ok(html.indexOf(text)>0&&html.indexOf(text)<start,text);
 assert.ok(html.indexOf('Confirm conditions locally')>start);assert.ok(html.indexOf('Official guide')>start);assert.ok(html.indexOf('No assignment')>start);
 assert.doesNotMatch(html,/<form/);assert.match(html,/form="separate-proposal-owner"/);assert.match(html,/aria-describedby="[^"]+-basis [^"]+-supply"/);
 assert.match(rowHtml(base,{...suggestion,equipmentId:'food'}),/not a meal count or a sufficient food allowance/);
});

test('existing manual totals and inventory assignment remain the default, with explicit total semantics',()=>{
 const trip={...base,checklist:[{id:'manual',equipmentId:'water',label:'My bottles',category:'essentials',kind:'equipment',done:false,requiredQuantity:8,packedQuantity:3,assignedQuantity:2,gearId:'owned'}]};
 const html=rowHtml(trip);assert.match(html,/value="8"/);assert.match(html,/New total target/);assert.match(html,/replaces the item/);assert.match(html,/Update total/);assert.match(html,/<option value="__keep__" selected="">Keep current assignment/);
});

test('default review stays at four with destination priority; recently handled entries can stay in position',()=>{
 const original=structuredClone(items),review=packingReviewItems(items,base);assert.equal(review.visible.length,4);assert.equal(review.visible[0].key,items[5].key);assert.deepEqual(items,original);
 const accepted={...base,suggestionDecisions:[{key:items[5].key,fingerprint:items[5].fingerprint,decision:'accepted'}]};
 assert.equal(packingReviewItems(items,accepted).visible.some(s=>s.key===items[5].key),false);
 assert.equal(packingReviewItems(items,accepted,false,false,[items[5].key]).visible[0].key,items[5].key);
 assert.equal(packingReviewItems(items,accepted,true,true).visible.length,6);
});

test('all five locales retain supply warnings and completed quantity templates',()=>{
 for(const locale of ['ar','en','fr','zh','hi']){const html=rowHtml(base,suggestion,locale),details=html.indexOf('<details');assert.ok(html.indexOf(packingText(locale,'waterCount'))<details);assert.doesNotMatch(html,/\{(?:people|total|each|count)\}/);assert.ok(html.includes(packingText(locale,'addToList')))}
 for(const [key,values]of Object.entries(packingWords)){assert.equal(values.length,5,key);assert.ok(values.every(value=>typeof value==='string'&&value.trim()),key)}
});

test('retained row follows later checklist edits and explicitly reviews conflicting unsent inputs',()=>{
 const slots=[],calls=[];let cursor=0,tree,trip=structuredClone(base);
 const gear=['a','b'].map(id=>({id,name:id,equipmentId:'water',condition:'ready',quantity:12,archived:false,expiryDate:'',maintenanceDate:''}));
 const hooks={useId:()=> 'row',useState(initial){const index=cursor++;if(!(index in slots))slots[index]=initial;return[slots[index],value=>{slots[index]=value}]}};
 const {PackingSuggestionRow:Row}=createLoader({react:hooks,'./packing.css':{},'./packing-panel.css':{}})('components/packing-panel.tsx');
 const render=()=>{cursor=0;tree=Row({trip,suggestion,catalog,gear,locale:'en',busy:false,formOwner:'isolated',onAccept:(...args)=>calls.push(args),onDismiss(){}})};
 const input=()=>nodes(tree,n=>n.type==='input')[0],select=()=>nodes(tree,n=>n.type==='select')[0],accept=()=>nodes(tree,n=>n.props?.className==='primary-btn packing-accept')[0];
 render();select().props.onChange({target:{value:'a'}});render();accept().props.onClick();assert.deepEqual(calls,[[4,'a']]);
 trip={...trip,checklist:[{id:'bottles',equipmentId:'water',requiredQuantity:4,gearId:'a',assignedQuantity:4,packedQuantity:0}],suggestionDecisions:[{key:suggestion.key,fingerprint:suggestion.fingerprint,decision:'accepted'}]};render();
 trip={...trip,checklist:[{...trip.checklist[0],requiredQuantity:6,gearId:'b'}]};render();assert.equal(input().props.value,'6');assert.equal(select().props.value,'__keep__');assert.equal(accept().props['aria-disabled'],true);accept().props.onClick();assert.equal(calls.length,1);
 input().props.onChange({target:{value:'7'}});render();select().props.onChange({target:{value:'a'}});render();
 trip={...trip,checklist:[{...trip.checklist[0],requiredQuantity:9}]};render();assert.equal(input().props.value,'7');assert.equal(select().props.value,'a');assert.equal(accept().props['aria-disabled'],true);accept().props.onClick();assert.equal(calls.length,1);
 const review=nodes(tree,n=>n.props?.className==='packing-baseline-review')[0];assert.ok(review);nodes(review,n=>n.type==='button')[1].props.onClick();render();accept().props.onClick();assert.deepEqual(calls.at(-1),[7,'a']);
});

function harness({deferred=false}={}){
 const slots=[],effects=[],updates=[],calls=[],operations=[];let cursor=0,dirty=true,tree,props={trip:structuredClone(base),gear:[],catalog,locale:'en'};
 let release;const gate=new Promise(resolve=>{release=resolve});
 const hooks={useId(){const index=cursor++;return slots[index]??(slots[index]='id-'+index)},useRef(initial){const index=cursor++;return slots[index]??(slots[index]={current:initial})},useState(initial){const index=cursor++;if(!(index in slots))slots[index]=typeof initial==='function'?initial():initial;return[slots[index],value=>{slots[index]=typeof value==='function'?value(slots[index]):value;dirty=true}]},useEffect(effect,deps){const index=cursor++,old=slots[index];if(!old||deps.some((value,i)=>value!==old.deps[i]))effects.push(()=>{old?.cleanup?.();slots[index]={deps,cleanup:effect()}})}};
 const mocked={...engine,packingSuggestions:async()=>items,acceptPackingSuggestion:(...args)=>{calls.push(args);const operation=(async()=>{if(deferred&&calls.length===1)await gate;return engine.acceptPackingSuggestion(...args)})();operations.push(operation);return operation}};
 const loaded=createLoader({react:hooks,'./packing.css':{},'./packing-panel.css':{},'@/lib/packing-engine':mocked})('components/packing-panel.tsx');
 const render=()=>{cursor=0;dirty=false;tree=loaded.PackingPanel({...props,onChange:updated=>{updates.push(updated);props={...props,trip:updated};dirty=true}});while(effects.length)effects.shift()()};
 return{updates,calls,release,settle:()=>Promise.all(operations),async flush(){for(let i=0;i<7;i++){if(dirty)render();await new Promise(setImmediate)}},rows:()=>nodes(tree,node=>node.type===loaded.PackingSuggestionRow),find:predicate=>nodes(tree,predicate),props:()=>props,update(changes){props={...props,...changes};dirty=true},close(){for(const slot of slots)slot?.cleanup?.()}};
}

test('rapid additions serialize against the current draft and retain row identity without moving focus',async()=>{
 const h=harness({deferred:true});try{
  await h.flush();assert.equal(h.find(n=>n.type==='details').length,0);assert.equal(h.rows().length,4);
  const [first,second]=h.rows();first.props.onAccept(4,undefined);second.props.onAccept(4,undefined);second.props.onDismiss();assert.equal(h.calls.length,1);
  h.release();await h.settle();await h.flush();assert.equal(h.updates.length,1);assert.equal(h.updates[0].checklist.length,1);
  assert.equal(h.rows()[0].key,first.key);assert.equal(h.rows()[0].props.suggestion.key,first.props.suggestion.key);
  const feedback=h.find(n=>n.props?.className==='packing-feedback')[0];assert.equal(feedback.props.role,'status');assert.ok(feedback.props.children[1].props.children.includes(first.props.suggestion.label));
  const next=h.rows().find(row=>row.props.suggestion.key===second.props.suggestion.key);next.props.onAccept(4,undefined);await h.settle();await h.flush();assert.equal(h.updates.length,2);assert.equal(h.updates[1].checklist.length,2);assert.equal(h.calls[1][0].checklist.length,1);
 }finally{h.close()}
});

test('stale asynchronous application cannot cross trip, inventory, catalog, locale, or unmount changes',async()=>{
 for(const kind of ['trip','gear','catalog','locale','unmount']){const h=harness({deferred:true});try{
  await h.flush();h.rows()[0].props.onAccept(4,undefined);
  if(kind==='unmount')h.close();else{h.update(kind==='trip'?{trip:{...h.props().trip,groupSize:5}}:kind==='gear'?{gear:[]}:kind==='catalog'?{catalog:{...catalog,revision:2}}:{locale:'ar'});await h.flush()}
  h.release();await h.settle();await h.flush();assert.equal(h.updates.length,0,kind);
 }finally{h.close()}}
});

test('review options reset for another trip and completed actions stay available in history',async()=>{
 const h=harness();try{await h.flush();h.find(n=>n.props?.className==='outline-btn packing-more')[0].props.onClick();await h.flush();assert.equal(h.rows().length,6);
  h.find(n=>n.type==='input'&&n.props.type==='checkbox')[0].props.onChange({target:{checked:true}});await h.flush();assert.equal(h.rows().length,4);
  const first=h.rows()[0];first.props.onDismiss();await h.flush();assert.equal(engine.suggestionState(h.props().trip,first.props.suggestion),'dismissed');assert.ok(h.rows().some(row=>row.key===first.key));
  h.update({trip:{...base,id:'trip-b'}});await h.flush();assert.equal(h.rows().length,4);assert.equal(h.find(n=>n.type==='input'&&n.props.type==='checkbox')[0].props.checked,false);assert.equal(h.find(n=>n.props?.className==='packing-feedback').length,0);
 }finally{h.close()}
});
