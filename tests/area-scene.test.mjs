import test from 'node:test';
import assert from 'node:assert/strict';
import {createLoader} from './helpers/load-ts.mjs';
const {classifySpecies,sceneItems}=createLoader()('lib/area-scene.ts');
const species=(id,english,coverage='local')=>({id,name:[english,english,english,english,english],description:['','','','',''],precaution:['','','','',''],sourceIds:[],coverage});

test('catalogue species are sorted into plants and animals with a fitting drawing',()=>{
  assert.deepEqual(classifySpecies('date-palm','Date palm'),{kind:'plant',icon:'treeDeciduous'});
  assert.deepEqual(classifySpecies('spruce-beech','Spruce and beech'),{kind:'plant',icon:'treePine'});
  assert.deepEqual(classifySpecies('seagrass','Seagrass meadows'),{kind:'plant',icon:'wheat'});
  assert.deepEqual(classifySpecies('lichen','Lichen'),{kind:'plant',icon:'sprout'});
  assert.deepEqual(classifySpecies('golden-eagle','Golden eagle'),{kind:'animal',icon:'bird'});
  assert.deepEqual(classifySpecies('capercaillie','Western capercaillie'),{kind:'animal',icon:'bird'});
  assert.deepEqual(classifySpecies('dolphin','Bottlenose dolphin'),{kind:'animal',icon:'fish'});
  assert.deepEqual(classifySpecies('everglades-alligator','American alligator'),{kind:'animal',icon:'worm'});
  assert.deepEqual(classifySpecies('camel','Camel'),{kind:'animal',icon:'paw'});
  assert.deepEqual(classifySpecies('jais-chukar','Chukar partridge'),{kind:'animal',icon:'bird'});
});

test('a scene lists catalogue species first, fills with terrain examples without repeating a drawing, then four essentials',()=>{
  const items=sceneItems('desert',[species('camel','Camel'),species('date-palm','Date palm','terrain-example')],200);
  assert.deepEqual(items.slice(0,2).map(i=>[i.id,i.example]),[['species:camel',false],['species:date-palm',true]]);
  const lifeItems=items.filter(i=>i.kind==='animal'||i.kind==='plant');
  // camel and date palm already use the paw and tree drawings, so those two desert examples are skipped and the pool yields five.
  assert.deepEqual(lifeItems.map(i=>i.id),['species:camel','species:date-palm','fennec','scorpion','acacia']);
  assert.equal(sceneItems('desert',[],200).filter(i=>i.kind==='animal'||i.kind==='plant').length,5,'five desert examples without catalogue species');
  assert.deepEqual(items.filter(i=>!(i.kind==='animal'||i.kind==='plant')).map(i=>i.id),['heat','water','sandstorm','camp']);
  for(const item of items){assert.equal(item.label.length,5,item.id+' has five locales');assert.ok(item.label.every(Boolean));assert.ok(Math.hypot(item.dx,item.dy)<=200+1,'inside the radius');assert.ok(Math.hypot(item.dx,item.dy)>=50,'never on top of the focus mark');}
  assert.deepEqual(sceneItems('desert',[],200),sceneItems('desert',[],200),'deterministic');
  for(const terrain of ['desert','mountain','forest','coast']){const set=sceneItems(terrain,[],120);assert.equal(set.length,9,terrain+' has five life examples and four essentials');assert.equal(new Set(set.map(i=>i.id)).size,9,terrain+' ids unique');}
});
