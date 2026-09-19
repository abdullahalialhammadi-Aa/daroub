// Validates every UAE place module in lib/uae (except shared.ts / enrich.ts) as if it were published with the seed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=fileURLToPath(new URL('../',import.meta.url)),cache=new Map();
function load(file){const absolute=path.resolve(root,file);if(cache.has(absolute))return cache.get(absolute).exports;if(absolute.endsWith('.json'))return JSON.parse(fs.readFileSync(absolute,'utf8'));const loadedModule={exports:{}};cache.set(absolute,loadedModule);const code=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;const localRequire=name=>name.startsWith('.')?load(path.resolve(path.dirname(absolute),name+(/\.(ts|json)$/.test(name)?'':'.ts'))):require(name);new Function('require','module','exports',code)(localRequire,loadedModule,loadedModule.exports);return loadedModule.exports}
const {seedCatalog}=load('lib/catalog-seed.ts'),{validateCatalog}=load('lib/catalog-validation.ts'),{sectionOrder,sharedUaeSources}=load('lib/uae/shared.ts');
const dir=path.join(root,'lib','uae'),modules=fs.readdirSync(dir).filter(f=>f.endsWith('.ts')&&!['shared.ts','enrich.ts','index.ts'].includes(f));
const scripts={ar:/[\u0600-\u06ff]/,en:/[A-Za-z]/,fr:/[A-Za-z]/,zh:/[\u4e00-\u9fff]/,hi:/[\u0900-\u097f]/},order=['ar','en','fr','zh','hi'];
const LOCALIZED_KEYS=new Set(['names','summary','title','body','name','description','precaution','label','reason']);
function localizedStrings(node,out=[]){if(Array.isArray(node)){node.forEach(v=>localizedStrings(v,out))}else if(node&&typeof node==='object'){for(const [k,v] of Object.entries(node)){if(LOCALIZED_KEYS.has(k)&&Array.isArray(v)&&v.length===5&&v.every(s=>typeof s==='string'))out.push(v);else localizedStrings(v,out)}}return out}
const UAE_BOX={latMin:22.4,latMax:26.6,lonMin:51.0,lonMax:56.6};
for(const file of modules){
 test(`lib/uae/${file} is a complete, publishable UAE place`,()=>{
  const m=load(`lib/uae/${file}`),d=m.destination;
  assert.ok(d,'exports destination');assert.ok(Array.isArray(m.sources),'exports sources');assert.ok(Array.isArray(m.rules),'exports rules');
  assert.equal(d.id,file.replace(/\.ts$/,''),'file name equals destination id');
  assert.equal(d.country,'AE');assert.equal(d.timezone,'Asia/Dubai');assert.equal(d.imageIsIllustrative,true);
  assert.ok(d.lat>UAE_BOX.latMin&&d.lat<UAE_BOX.latMax&&d.lon>UAE_BOX.lonMin&&d.lon<UAE_BOX.lonMax,`coordinates inside the UAE: ${d.lat}, ${d.lon}`);
  assert.deepEqual(d.sections.map(s=>s.id),[...sectionOrder],'nine chapters in the shared order');
  assert.ok(d.species.length>=3&&d.species.length<=6,`3–6 species entries (${d.species.length})`);
  for(const s of d.species)assert.ok(['local','terrain-example'].includes(s.coverage));
  const ownIds=[...m.sources.map(s=>s.id),...m.rules.map(r=>r.id)];for(const id of ownIds)assert.match(id,new RegExp(`^uae-${d.id}-`),`own ids are prefixed uae-${d.id}-: ${id}`);
  for(const s of m.sources)assert.match(s.url,/^https:\/\//);
  for(const r of m.rules){assert.deepEqual(r.destinationIds,[d.id]);assert.equal(r.coverage,'local');assert.ok(r.sourceIds.length,'rule cites a source')}
  const snapshot=structuredClone(seedCatalog);if(!snapshot.destinations.some(x=>x.id===d.id))snapshot.destinations.push(structuredClone(d));for(const s of [...sharedUaeSources,...m.sources])if(!snapshot.sources.some(x=>x.id===s.id))snapshot.sources.push(s);for(const r of m.rules)if(!snapshot.packingRules.some(x=>x.id===r.id))snapshot.packingRules.push(r);
  assert.doesNotThrow(()=>validateCatalog(snapshot,true));
  assert.deepEqual(seedCatalog.destinations.find(x=>x.id===d.id)?.names,d.names,'the compiled seed includes this place');
  for(const values of localizedStrings({names:d.names,summary:d.summary,sections:d.sections,species:d.species,rules:m.rules}))for(let i=0;i<5;i++){const v=values[i];assert.ok(v.trim(),`locale ${order[i]} filled`);assert.match(v,scripts[order[i]],`locale ${order[i]} written in its script: ${v.slice(0,40)}`);if(order[i]==='en'||order[i]==='fr')assert.doesNotMatch(v,/[\u0600-\u06ff\u4e00-\u9fff\u0900-\u097f]/,`no foreign script in ${order[i]}`)}
  assert.ok(d.sections.every(s=>s.sourceIds.length),'every chapter cites at least one source');
 });
}
