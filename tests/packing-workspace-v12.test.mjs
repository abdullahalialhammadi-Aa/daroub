import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createLoader} from './helpers/load-ts.mjs';
const load=createLoader({'./packing-workspace.css':{}}),{PackingWorkspace}=load('components/packing-workspace.tsx'),{packingWorkspaceWords,packingWorkspaceText}=load('lib/packing-workspace-copy.ts');

test('packing views keep both editors mounted and hide only the inactive editor in every locale',()=>{
 for(const locale of ['ar','en','fr','zh','hi'])for(const view of ['list','suggestions']){
  const html=renderToStaticMarkup(React.createElement(PackingWorkspace,{view,locale,count:3,onViewChange:()=>{},checklist:React.createElement('input',{defaultValue:'UNSAVED CHECKLIST'}),suggestions:React.createElement('input',{defaultValue:'UNSAVED SUGGESTION'}),guide:React.createElement('p',null,'GUIDE')}));
  assert.ok(html.includes(packingWorkspaceText(locale,'list')));assert.ok(html.includes(packingWorkspaceText(locale,'suggestions')));assert.ok(html.includes('UNSAVED CHECKLIST'));assert.ok(html.includes('UNSAVED SUGGESTION'));
  assert.equal((html.match(/ hidden=""/g)||[]).length,1);assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);assert.equal((html.match(/type="button"/g)||[]).length,2);assert.doesNotMatch(html,/<form/);assert.match(html,/<details class="packing-destination-guide">/);
 }
 for(const [key,values] of Object.entries(packingWorkspaceWords)){assert.equal(values.length,5,key);for(const value of values)assert.ok(value.length>2,key)}
});

