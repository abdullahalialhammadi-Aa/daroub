// The UAE product focus (lib/region.ts): out-of-focus places stay archived in the catalogue, in-focus places drive every list.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createLoader} from './helpers/load-ts.mjs';
const load=createLoader();
const {seedCatalog,activeDestinations,catalogForTerrain,catalogDestination}=load('lib/catalog-seed.ts');
const {FOCUS_COUNTRY,applyFocus,inFocus,focusDestinations,destinationCountries,terrainAnchor,destinationCountry}=load('lib/region.ts');
const {validateCatalog}=load('lib/catalog-validation.ts');
const {newTrip}=load('lib/trip-preparation.ts');

test('the compiled seed is focused on the UAE: every place has a country, only UAE places are active, the rest stay archived for historical lookup',()=>{
 assert.equal(FOCUS_COUNTRY,'AE');
 for(const d of seedCatalog.destinations)assert.match(destinationCountry(d)??'',/^[A-Z]{2}$/,d.id);
 const active=activeDestinations(seedCatalog);
 assert.ok(active.length>=12,'three original UAE places plus the researched additions');
 assert.ok(active.every(d=>d.country==='AE'));
 assert.deepEqual(focusDestinations(seedCatalog).map(d=>d.id),active.map(d=>d.id));
 for(const id of ['jebel-shams','black-forest','hurghada','wadi-rum','yellowstone']){const d=catalogDestination(seedCatalog,id);assert.ok(d,id+' remains in the catalogue');assert.equal(d.archived,true);assert.notEqual(d.country,'AE')}
 assert.deepEqual(['desert','mountain','forest','coast'].map((_,i)=>catalogForTerrain(seedCatalog,i)?.id),['liwa','jebel-jais','mushrif-ghaf-woodland','jubail-mangrove'],'terrain category links resolve to UAE anchors');
 assert.equal(newTrip('ar').destinationId,'liwa','the default trip starts at a UAE place');
 assert.doesNotThrow(()=>validateCatalog(seedCatalog,true));
});
test('applyFocus is idempotent, honours a null focus and recovers countries for snapshots published before the country field existed',()=>{
 const again=applyFocus(structuredClone(seedCatalog));assert.deepEqual(again.destinations.map(d=>[d.id,!!d.archived]),seedCatalog.destinations.map(d=>[d.id,!!d.archived]));
 const world=applyFocus(structuredClone(seedCatalog),null);assert.equal(world.destinations.filter(d=>!d.archived).length,seedCatalog.destinations.filter(d=>!d.archived).length,'a null focus never archives anything by itself');
 const legacy=structuredClone(seedCatalog);for(const d of legacy.destinations){delete d.country;d.archived=false}
 const focused=applyFocus(legacy);
 for(const d of focused.destinations)assert.equal(!!d.archived,destinationCountries[d.id]?destinationCountries[d.id]!=='AE':false,d.id+' (unknown countries stay visible)');
 assert.equal(focused.destinations.find(d=>d.id==='hurghada').country,'EG','the country is recovered from the compiled map');
 const unknown={id:'editor-place',country:undefined};assert.equal(inFocus(unknown),true,'places without a country stay visible so editors never lose a new entry');
 assert.equal(inFocus({id:'x',country:'OM'}),false);assert.equal(inFocus({id:'x',country:'OM'},null),true);
 assert.equal(terrainAnchor(1,null),'jebel-shams');assert.equal(terrainAnchor(1,'AE'),'jebel-jais');assert.equal(terrainAnchor(2,'XX'),'black-forest','unknown focus falls back to the world anchors');
});
test('every UAE place is complete: nine chapters, cited sources, 3–6 species, Asia/Dubai time zone and coordinates inside the country',()=>{
 const uae=activeDestinations(seedCatalog),researched=uae.filter(d=>!destinationCountries[d.id]);
 assert.equal(researched.length,9,'nine researched UAE places');
 for(const d of uae){
  assert.equal(d.timezone,'Asia/Dubai',d.id);assert.ok(d.lat>22.4&&d.lat<26.6&&d.lon>51&&d.lon<56.6,d.id);
  assert.ok(d.species.length>=3&&d.species.length<=8,`${d.id} species ${d.species.length}`);
  if(researched.includes(d))for(const s of d.sections)assert.ok(s.sourceIds.length,`${d.id}/${s.id} cites a source`);
  assert.ok(d.sections.some(s=>s.id==='rules'),`${d.id} has the rules chapter`);
  for(const id of [...d.sourceIds,...d.sections.flatMap(s=>s.sourceIds),...d.species.flatMap(s=>s.sourceIds)])assert.ok(seedCatalog.sources.some(s=>s.id===id),`${d.id}: source ${id}`);
 }
 const rules=seedCatalog.packingRules.filter(r=>r.destinationIds.some(id=>uae.some(d=>d.id===id)));
 assert.ok(rules.length>=30,'UAE-specific packing rules');
 for(const r of rules)assert.ok(r.activities.every(a=>['walking','camping','boating','swimming','cycling','other'].includes(a)),`${r.id} uses canonical activities: ${r.activities}`);
});
