import test from 'node:test';
import assert from 'node:assert/strict';
import {createLoader} from './helpers/load-ts.mjs';
const load=createLoader();

const {suggestedGroupSize}=load('lib/group-size.ts');
const {seedCatalog}=load('lib/catalog-seed.ts');
const {newTrip}=load('lib/trip-preparation.ts');
const {selectionFromQuery}=load('lib/explorer-location.ts');

test('group suggestion follows terrain and honours per-place overrides',()=>{
  assert.equal(suggestedGroupSize('desert'),4);
  assert.equal(suggestedGroupSize('mountain'),3);
  assert.equal(suggestedGroupSize('forest'),2);
  assert.equal(suggestedGroupSize('coast'),2);
  const liwa=seedCatalog.destinations.find(d=>d.id==='liwa');
  assert.equal(suggestedGroupSize('desert',liwa),4);
  assert.equal(suggestedGroupSize('desert',{...liwa,id:'al-marmoom'}),3);
  assert.equal(suggestedGroupSize('desert',{...liwa,groupSize:6}),6);
  assert.equal(newTrip('ar','liwa').groupSize,4);
  for(const d of seedCatalog.destinations)assert.ok(newTrip('en',d.id).groupSize>=2,d.id);
});

test('a terrain override in the link applies to a chosen destination',()=>{
  const liwa=seedCatalog.destinations.find(d=>d.id==='liwa');
  const q=new URLSearchParams({destination:'liwa',lat:String(liwa.lat),lon:String(liwa.lon),terrainId:'coast'});
  assert.equal(selectionFromQuery(q,seedCatalog.destinations).terrainId,'coast');
  assert.equal(selectionFromQuery(new URLSearchParams({destination:'liwa'}),seedCatalog.destinations).terrainId,'desert');
  assert.equal(selectionFromQuery(new URLSearchParams({destination:'liwa',terrainId:'lava'}),seedCatalog.destinations).terrainId,'desert');
});
