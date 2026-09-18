import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createLoader} from './helpers/load-ts.mjs';
const load=createLoader(),simulation=load('lib/trip-simulation.ts'),{seedCatalog}=load('lib/catalog-seed.ts'),{newTrip}=load('lib/trip-preparation.ts');
const trip=()=>({...newTrip('en'),id:'clarity',groupSize:2,startDate:'2027-02-01',endDate:'2027-02-02',checklist:[{id:'light',label:'My light',category:'essentials',kind:'equipment',equipmentId:'light',requiredQuantity:3,assignedQuantity:2,packedQuantity:2,done:false}]});
function nodes(node,predicate){if(!node)return[];if(Array.isArray(node))return node.flatMap(child=>nodes(child,predicate));if(typeof node!=='object')return[];return [...(predicate(node)?[node]:[]),...nodes(node.props?.children,predicate)];}
function harness(overrides={}){
 let index=0,pending=[],tree;const slots=[],applied=[],calls=[],jobs=new Set();
 const track=value=>{const job=Promise.resolve(value);jobs.add(job);job.then(()=>jobs.delete(job),()=>jobs.delete(job));return job};
 const react={...React,useId(){return ':clarity:'},useState(initial){const i=index++;slots[i]??={value:typeof initial==='function'?initial():initial};return[slots[i].value,value=>{slots[i].value=typeof value==='function'?value(slots[i].value):value}]},useRef(initial){return slots[index++]??={current:initial}},useMemo(fn,deps){const i=index++;if(!slots[i]||deps.some((value,n)=>value!==slots[i].deps[n]))slots[i]={value:fn(),deps};return slots[i].value},useEffect(fn,deps){const i=index++;if(!slots[i]||deps.some((value,n)=>value!==slots[i].deps[n])){const previous=slots[i];slots[i]={deps,cleanup:previous?.cleanup};pending.push(()=>{slots[i].cleanup?.();slots[i].cleanup=fn()})}}};
 const props={trip:trip(),gear:[],catalog:seedCatalog,locale:'en',onApply:value=>applied.push(value)};
 const methods={...simulation,...overrides};
 const {TripSimulator}=createLoader({react,'@/lib/trip-simulation':{...methods,simulateTrip:(...args)=>{calls.push(args);return track(methods.simulateTrip(...args))},applyTripSimulation:(...args)=>track(methods.applyTripSimulation(...args))}})('components/trip-simulator.tsx');
 const render=()=>{index=0;pending=[];tree=TripSimulator(props);for(const effect of pending)effect();return tree};
 const button=className=>nodes(tree,node=>node.type==='button'&&node.props.className===className)[0];
 const group=()=>nodes(tree,node=>node.type==='input'&&node.props.type==='number')[0];
 const settle=async()=>{while(jobs.size)await Promise.allSettled([...jobs]);await Promise.resolve();render()};
 render();return{props,applied,calls,render,button,group,settle,html:()=>renderToStaticMarkup(tree),all:predicate=>nodes(tree,predicate),preview:async()=>{button('simulation-preview-button').props.onClick();render();await settle()},dispose:()=>slots.forEach(slot=>slot?.cleanup?.())};
}
test('the initial view explains the current draft and requires an explicit preview',async()=>{
 const h=harness();assert.match(h.html(),/Your current draft/);assert.match(h.html(),/For example, add more people/);assert.equal(h.calls.length,0);assert.equal(h.button('primary-btn'),undefined);
 h.group().props.onChange({target:{value:'5'}});h.render();assert.equal(h.calls.length,0);assert.equal(h.applied.length,0);
 await h.preview();assert.equal(h.calls.length,1);assert.match(h.html(),/Trial plan/);assert.ok(h.button('primary-btn'));assert.equal(h.applied.length,0);h.dispose();
});
test('equipment cards distinguish listed quantity from the selected addition and keep stock collapsed',async()=>{
 const h=harness();h.group().props.onChange({target:{value:'5'}});h.render();await h.preview();
 const row=h.all(node=>node.type==='article'&&renderToStaticMarkup(node).includes('My light'))[0],html=renderToStaticMarkup(row);
 assert.match(html,/Already in your list.*?3/s);assert.match(html,/Add to your list.*?\+2/s);assert.match(html,/List total after adding.*?5/s);
 for(const details of nodes(row,node=>node.type==='details'))assert.ok(!details.props.open);
 const choice=nodes(row,node=>node.type==='input'&&node.props.type==='checkbox')[0];assert.equal(choice.props.checked,false);choice.props.onChange({target:{checked:true}});h.render();
 assert.match(h.html(),/Your selected additions/);await h.button('primary-btn').props.onClick();await h.settle();
 assert.equal(h.applied.length,1);const light=h.applied[0].checklist.find(item=>item.id==='light');assert.equal(light.requiredQuantity,5);assert.equal(light.packedQuantity,2);assert.equal(light.assignedQuantity,2);assert.equal(h.props.trip.checklist[0].requiredQuantity,3);h.dispose();
});
test('editing a reviewed trial hides Apply and requires a fresh comparison and selection',async()=>{
 const h=harness();h.group().props.onChange({target:{value:'5'}});h.render();await h.preview();assert.ok(h.button('primary-btn'));
 h.group().props.onChange({target:{value:'7'}});h.render();assert.equal(h.button('primary-btn'),undefined);assert.match(h.html(),/preview it again before applying/);assert.equal(h.calls.length,1);
 await h.preview();assert.equal(h.calls.length,2);assert.match(h.html(),/No equipment additions selected/);assert.equal(h.applied.length,0);h.dispose();
});
test('a delayed preview cannot restore Apply after the user changes the trial',async()=>{
 let resolve;const deferred=new Promise(done=>{resolve=done}),h=harness({simulateTrip:()=>deferred});
 h.button('simulation-preview-button').props.onClick();h.render();h.group().props.onChange({target:{value:'9'}});h.render();
 resolve(await simulation.simulateTrip(h.props.trip,simulation.scenarioInputs(h.props.trip),[],seedCatalog,'en'));await h.settle();
 assert.equal(h.button('primary-btn'),undefined);assert.match(h.html(),/preview it again before applying/);assert.equal(h.applied.length,0);h.dispose();
});
