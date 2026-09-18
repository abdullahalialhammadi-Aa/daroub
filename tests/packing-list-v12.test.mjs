import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createLoader} from './helpers/load-ts.mjs';
const load=createLoader(),{QuantityChecklist}=load('components/quantity-checklist.tsx'),{checklistText,checklistWords}=load('lib/checklist-copy.ts');
const gearRow=(patch={})=>({id:'lamp',label:'Headlamp',category:'essentials',kind:'equipment',done:false,requiredQuantity:4,assignedQuantity:2,packedQuantity:1,gearId:'owned',gearSnapshot:{name:'My lamp',quantity:4,condition:'ready'},...patch});
const task={id:'call',label:'Call the guide',category:'custom',kind:'task',done:false};
const makeTrip=(rows=[gearRow(),task])=>({id:'trip',title:'Trip',schemaVersion:2,terrainId:'desert',destinationId:'liwa',location:{lat:23,lon:54},startDate:'2027-02-01',endDate:'2027-02-02',groupSize:2,transport:'car',notes:'',checklist:rows,activities:[],itinerary:[],revision:1,updatedAt:'2026-09-17T00:00:00Z'});
const inventory={id:'owned',name:'My lamp',equipmentId:'light',quantity:4,condition:'ready',archived:false,maintenanceDate:'',expiryDate:''};
function nodes(node,predicate){if(!node)return[];if(Array.isArray(node))return node.flatMap(child=>nodes(child,predicate));if(typeof node!=='object')return[];return [...(predicate(node)?[node]:[]),...nodes(node.props?.children,predicate)];}
function harness(rows){let index=0,tree;const slots=[],focus=[],changes=[];
 const react={...React,useId:()=>':detached-add:',useEffect:()=>{},useRef:value=>({current:value}),useState(initial){const i=index++;slots[i]??={value:typeof initial==='function'?initial():initial};return[slots[i].value,value=>{slots[i].value=typeof value==='function'?value(slots[i].value):value}]}};
 const {QuantityChecklist:Component}=createLoader({react,'@/lib/preparation-focus':{focusAfterRender:(...args)=>focus.push(args)}})('components/quantity-checklist.tsx');
 const props={trip:makeTrip(rows),gear:[inventory],trips:[],locale:'en',showSave:false,onChange:next=>{props.trip=next;changes.push(next)}};
 const render=()=>{index=0;tree=Component(props);return tree};render();
 return{props,focus,changes,render,find:predicate=>nodes(tree,predicate)[0],all:predicate=>nodes(tree,predicate),id:id=>nodes(tree,node=>node.props?.id===id)[0],button:label=>nodes(tree,node=>node.type==='button'&&node.props['aria-label']===label)[0]};
}
const htmlFor=(trip,locale='en')=>renderToStaticMarkup(React.createElement(QuantityChecklist,{trip,gear:[inventory],trips:[],locale,onChange:()=>assert.fail('Rendering must not edit the trip'),showSave:false}));

test('headline progress counts complete rows rather than mixing supply quantities',()=>{
 const html=htmlFor(makeTrip([gearRow({requiredQuantity:100,packedQuantity:100,done:true}),gearRow({id:'tent',label:'Tent',requiredQuantity:1,packedQuantity:0,assignedQuantity:0}),{...task,done:true}]));
 assert.match(html,/2 of 3 items complete/);assert.match(html,/<progress[^>]*value="2"[^>]*max="3"/);assert.equal((html.match(/<progress/g)||[]).length,1);assert.match(html,/Packed 100 of 100/);assert.match(html,/Packed 0 of 1/);assert.doesNotMatch(html,/101|Packed out of your planned quantity/);
 assert.doesNotMatch(htmlFor(makeTrip([])),/<progress/);
});
test('all five locales show plain row counts, top quick add and collapsed help',()=>{
 for(const locale of ['ar','en','fr','zh','hi']){
  const html=htmlFor(makeTrip(),locale),n=value=>new Intl.NumberFormat(locale).format(value);
  assert.ok(html.includes(checklistText(locale,'packedCount',{packed:n(1),required:n(4)})));
  assert.ok(html.indexOf('id="checklist-add-label"')<html.indexOf('class="kit-list"'));
  const help=html.indexOf('<details class="kit-guide">');assert.ok(help>0);assert.ok(html.indexOf(checklistText(locale,'countExample'))>help);assert.doesNotMatch(html,/<details class="kit-guide" open/);assert.doesNotMatch(html,/<form|\{(?:packed|required|done|total)\}/);assert.ok(html.includes('dir="'+(locale==='ar'?'rtl':'ltr')+'"'));
 }
 for(const [key,values] of Object.entries(checklistWords)){assert.equal(values.length,5,key);assert.ok(values.every(value=>value.trim()),key)}
});
test('stepper and pack-all preserve inventory links and task semantics',()=>{
 const h=harness();const initial=structuredClone(h.props.trip.checklist[0]);
 h.button('Increase packed: Headlamp').props.onClick();h.render();assert.equal(h.props.trip.checklist[0].packedQuantity,2);
 h.id('kit-check-lamp').props.onChange();h.render();assert.equal(h.props.trip.checklist[0].packedQuantity,4);assert.equal(h.props.trip.checklist[0].done,true);
 h.id('kit-check-lamp').props.onChange();h.render();assert.equal(h.props.trip.checklist[0].packedQuantity,0);assert.equal(h.button('Decrease packed: Headlamp').props.disabled,true);
 const current=h.props.trip.checklist[0];assert.equal(current.assignedQuantity,initial.assignedQuantity);assert.equal(current.gearId,initial.gearId);assert.deepEqual(current.gearSnapshot,initial.gearSnapshot);
 h.id('kit-check-call').props.onChange();h.render();assert.equal(h.props.trip.checklist[1].done,true);assert.equal(h.props.trip.checklist[1].packedQuantity,undefined);
});
test('quick add stays outside the parent form and Enter adds without submitting',()=>{
 const h=harness([]);let prevented=false;
 assert.ok(h.id('checklist-add-label').props.form);assert.equal(h.all(node=>node.type==='form').length,0);
 h.id('checklist-add-label').props.onChange({target:{value:'  Spare layer  '}});h.render();h.id('checklist-add-label').props.onKeyDown({key:'Enter',preventDefault(){prevented=true}});h.render();
 assert.equal(prevented,true);assert.equal(h.props.trip.checklist.length,1);assert.equal(h.props.trip.checklist[0].label,'Spare layer');assert.equal(h.props.trip.checklist[0].requiredQuantity,1);assert.equal(h.props.trip.checklist[0].packedQuantity,0);assert.equal(h.id('checklist-add-label').props.value,'');assert.deepEqual(h.focus.at(-1),['kit-check-'+h.props.trip.checklist[0].id]);
 const selector=h.find(node=>node.type==='select'&&node.props.form);selector.props.onChange({target:{value:'task'}});h.render();h.id('checklist-add-label').props.onChange({target:{value:'Check permits'}});h.render();h.find(node=>node.type==='button'&&node.props.className==='kit-add-button').props.onClick();h.render();assert.equal(h.props.trip.checklist[1].kind,'task');assert.equal(h.props.trip.checklist[1].requiredQuantity,undefined);
});
test('filtered completion recovers focus while an open edit row stays visible until closed',()=>{
 const h=harness();h.id('kit-filter-remaining').props.onClick();h.render();h.button('Edit: Headlamp').props.onClick();h.render();h.id('kit-check-lamp').props.onChange();h.render();
 assert.ok(h.id('kit-detail-lamp'));assert.ok(h.id('kit-check-lamp'));
 h.button('Edit: Headlamp').props.onClick();h.render();assert.equal(h.id('kit-check-lamp'),undefined);assert.deepEqual(h.focus.at(-1),['kit-filter-remaining']);
 h.id('kit-check-call').props.onChange();h.render();assert.equal(h.id('kit-check-call'),undefined);assert.deepEqual(h.focus.at(-1),['kit-filter-remaining']);
});
test('removal and undo retain exact quantities, row position and focus targets',()=>{
 const h=harness(),before=structuredClone(h.props.trip.checklist);h.button('Edit: Headlamp').props.onClick();h.render();h.find(node=>node.type==='button'&&node.props.className==='kit-remove').props.onClick();h.render();
 assert.equal(h.props.trip.checklist.length,1);assert.deepEqual(h.focus.at(-1),['kit-undo']);h.id('kit-undo').props.onClick();h.render();assert.deepEqual(h.props.trip.checklist,before);assert.deepEqual(h.focus.at(-1),['kit-check-lamp']);assert.equal(h.id('kit-undo'),undefined);
});
test('empty numeric edits remain NaN and recoverable without invalid bounds or hidden fields',()=>{
 const h=harness();const packed=h.find(node=>node.type==='input'&&node.props.type==='number');packed.props.onChange({target:{value:''}});h.render();assert.ok(Number.isNaN(h.props.trip.checklist[0].packedQuantity));assert.ok(h.id('kit-detail-lamp'));
 assert.equal(h.find(node=>node.type==='input'&&node.props.type==='number').props.value,'');
 const invalid=makeTrip([gearRow({requiredQuantity:NaN,packedQuantity:NaN,assignedQuantity:NaN,gearId:undefined})]),html=htmlFor(invalid);
 assert.match(html,/id="kit-detail-lamp"/);assert.match(html,/id="checklist-name-lamp"/);assert.match(html,/<details class="kit-inventory" open/);assert.match(html,/Clear inventory reservation/);assert.doesNotMatch(html,/NaN/);
});
