import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createLoader} from './helpers/load-ts.mjs';

const load=createLoader(),{ItineraryEditor}=load('components/itinerary-editor.tsx'),{seedCatalog}=load('lib/catalog-seed.ts'),{newTrip}=load('lib/trip-preparation.ts'),{itineraryWords}=load('lib/itinerary-copy.ts');
const entry=(patch={})=>({id:'walk',title:'Dawn walk',activityId:'walking',place:'Visitor centre',coordinates:{lat:23,lon:53},startTime:'06:30',timeZone:'Asia/Dubai',durationMinutes:90,transport:'On foot',notes:'Bring the saved route',...patch});
const trip=(patch={})=>({...newTrip('en'),startDate:'2027-01-01',endDate:'2027-01-04',itinerary:[{id:'day-one',dayOffset:0,entries:[entry()]}],...patch});
function nodes(node,predicate){if(!node)return [];if(Array.isArray(node))return node.flatMap(child=>nodes(child,predicate));if(typeof node!=='object')return [];return [...(predicate(node)?[node]:[]),...nodes(node.props?.children,predicate)];}
function text(node){if(Array.isArray(node))return node.map(text).join('');if(typeof node==='string'||typeof node==='number')return String(node);return node&&typeof node==='object'?text(node.props?.children):'';}
function harness(initial){
 let current=initial,index=0;const state=[],focus=[];
 const react={...React,useState(value){const i=index++;if(!(i in state))state[i]=typeof value==='function'?value():value;return[state[i],next=>{state[i]=typeof next==='function'?next(state[i]):next}];}};
 const {ItineraryEditor:Editor}=createLoader({'react':react,'@/lib/preparation-focus':{focusAfterRender:(id)=>focus.push(id)}})('components/itinerary-editor.tsx');
 const render=()=>{index=0;return Editor({trip:current,catalog:seedCatalog,locale:'en',onChange:next=>{current=next}})};
 return {render,focus,get value(){return current},button(label){const matches=nodes(render(),n=>n.type==='button'&&text(n)===label);assert.ok(matches.length,'Missing button '+label);return matches[0];},byId(id){const result=nodes(render(),n=>n.props?.id===id)[0];assert.ok(result,'Missing '+id);return result}};
}

test('saved activities render readable summaries without a wall of editing fields',()=>{
 const original=trip(),html=renderToStaticMarkup(React.createElement(ItineraryEditor,{trip:original,locale:'en',catalog:seedCatalog,onChange:()=>assert.fail('render must not mutate')}));
 for(const text of ['Dawn walk','06:30','Asia/Dubai','90','Visitor centre','2027-01-01'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('id="entry-title-walk"'));assert.ok(!html.includes('id="day-offset-day-one"'));assert.ok(html.includes('aria-expanded="false"'));
 assert.equal(original.itinerary[0].entries[0].notes,'Bring the saved route');
});

test('invalid dates, required names, durations and time zones open their editors in all languages',()=>{
 for(const locale of ['ar','en','fr','zh','hi']){
  const value=trip({itinerary:[{id:'invalid-day',dayOffset:NaN,entries:[entry({title:' ',timeZone:'Invalid/Zone',durationMinutes:NaN})]}]});
  const html=renderToStaticMarkup(React.createElement(ItineraryEditor,{trip:value,locale,catalog:seedCatalog,onChange:()=>{}}));
  for(const id of ['day-offset-invalid-day','entry-title-walk','zone-walk','duration-error-walk'])assert.ok(html.includes('id="'+id+'"'),locale+': '+id);
  assert.match(html,/aria-invalid="true"/);assert.ok(!html.includes('NaN'));assert.ok(html.includes('class="itinerary-entry is-editing"'));
 }
});

test('editing one field preserves all hidden data; closing and reopening does not mutate it',()=>{
 const h=harness(trip());h.button('Edit').props.onClick();h.byId('entry-title-walk').props.onChange({target:{value:'Sunrise walk'}});
 assert.equal(h.value.itinerary[0].entries[0].title,'Sunrise walk');assert.deepEqual(h.value.itinerary[0].entries[0].coordinates,{lat:23,lon:53});assert.equal(h.value.itinerary[0].entries[0].notes,'Bring the saved route');
 h.button('Done editing').props.onClick();assert.equal(nodes(h.render(),n=>n.props?.id==='entry-title-walk').length,0);h.button('Edit').props.onClick();assert.equal(h.byId('entry-title-walk').props.value,'Sunrise walk');
 assert.ok(h.focus.includes('entry-title-walk'));assert.ok(h.focus.includes('entry-heading-walk'));
});

test('whitespace names participate in native invalid-field routing and clear their error after correction',()=>{
 const h=harness(trip({itinerary:[{id:'day-one',dayOffset:0,entries:[entry({title:' '})]}]}));let message='';
 h.byId('entry-title-walk').props.ref({setCustomValidity:value=>{message=value}});assert.match(message,/Enter a name/);
 h.byId('entry-title-walk').props.onChange({target:{value:'A named stop'}});h.byId('entry-title-walk').props.ref({setCustomValidity:value=>{message=value}});assert.equal(message,'');
});

test('day reordering keeps original calendar slots and identities; copying creates independent entries',()=>{
 const h=harness(trip({itinerary:[{id:'first',dayOffset:0,entries:[entry()]},{id:'second',dayOffset:3,entries:[entry({id:'swim',title:'Swim'})]}]}));
 h.byId('day-toggle-second').props.onClick();h.button('Move up').props.onClick();
 assert.deepEqual(h.value.itinerary.map(day=>[day.id,day.dayOffset]),[['second',0],['first',3]]);assert.equal(h.value.itinerary[0].entries[0].id,'swim');
 h.button('Duplicate day').props.onClick();const copy=h.value.itinerary[2];assert.equal(copy.dayOffset,4);assert.notEqual(copy.id,'second');assert.notEqual(copy.entries[0].id,'swim');assert.deepEqual(copy.entries[0].coordinates,{lat:23,lon:53});assert.equal(copy.entries[0].notes,'Bring the saved route');
});

test('adding an activity opens its required field and respects day and total limits',()=>{
 const h=harness(trip());h.byId('add-entry-day-one').props.onClick();const added=h.value.itinerary[0].entries[1];assert.equal(added.title,'');assert.ok(h.byId('entry-title-'+added.id));assert.equal(h.focus.at(-1),'entry-title-'+added.id);
 const full=trip({itinerary:Array.from({length:15},(_,d)=>({id:'d'+d,dayOffset:d,entries:Array.from({length:40},(_,i)=>entry({id:`e${d}-${i}`}))}))}),limit=harness(full);
 assert.equal(limit.byId('add-entry-d0').props.disabled,true);assert.equal(limit.value.itinerary.reduce((n,day)=>n+day.entries.length,0),600);
 const maxDays=harness(trip({itinerary:Array.from({length:60},(_,d)=>({id:'d'+d,dayOffset:d,entries:[]}))}));assert.equal(maxDays.byId('add-itinerary-day').props.disabled,true);
});

test('every new itinerary label has complete five-language coverage',()=>{
 for(const [key,values] of Object.entries(itineraryWords)){assert.equal(values.length,5,key);assert.ok(values.every(value=>typeof value==='string'&&value.trim()),key);}
});
