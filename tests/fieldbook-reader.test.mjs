import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createLoader} from './helpers/load-ts.mjs';
const base=createLoader(),{seedCatalog}=base('lib/catalog-seed.ts'),{translate,words}=base('lib/terrain.ts'),{fieldbookWords,fieldbookText}=base('lib/fieldbook-copy.ts');
const edition=(destinationId,terrainId,locale)=>['liwa','terrain-forest'].includes(destinationId??`terrain-${terrainId}`)?{url:`/books/${destinationId??`terrain-${terrainId}`}-${locale}.pdf`,pages:18,publishedAt:'2026-09-17'}:undefined;
const ignored=()=>null,site={useSite:()=>({locale:'en',t:key=>translate('en',words[key]??[key]),tr:value=>translate('en',value)})};
const common={'./fieldbook-reader.css':{},'./preparation.css':{},'./site-shell':site,'@/lib/catalog-client':{useCatalog:()=>({catalog:seedCatalog,loading:false,error:false,refresh:async()=>{}})},'@/lib/fieldbook-editions':{fieldbookPdf:edition},'@/lib/offline':{saveGuide:async()=>{},listGuides:async()=>[],deleteGuide:async()=>{}},'./legacy-recovery':{LegacyRecoveryNotice:ignored},'./weather':{Weather:ignored},'./destination-brief':{DestinationBrief:ignored},'./catalog-notice':{CatalogNotice:ignored}};
const load=createLoader(common),{resolveFieldbookChoice,FieldbookDocument}=load('components/fieldbook-reader.tsx');
const nodes=(node,p)=>Array.isArray(node)?node.flatMap(child=>nodes(child,p)):!node||typeof node!=='object'?[]:[...(p(node)?[node]:[]),...nodes(node.props?.children,p)];
const html=(choice,locale='en',catalog=seedCatalog)=>renderToStaticMarkup(React.createElement(FieldbookDocument,{choice,locale,catalog}));
const liwa={destinationId:'liwa',terrainId:'desert'};
const escaped=text=>renderToStaticMarkup(React.createElement('span',null,text)).slice(6,-7);
function harness(file,name,props={},mocks={}){
 let cursor=0,tree,dirty=true;const slots=[],effects=[];
 const hooks={...React,useRef(initial){const i=cursor++;return slots[i]??(slots[i]={current:initial})},useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;dirty=true}]},useEffect(effect,deps){const i=cursor++,old=slots[i];if(!old||deps.some((value,j)=>value!==old.deps[j]))effects.push(()=>{old?.cleanup?.();slots[i]={deps,cleanup:effect()}})}};
 const loaded=createLoader({...common,...mocks,react:hooks})(file);
 const render=()=>{cursor=0;dirty=false;tree=loaded[name](props);while(effects.length)effects.shift()();return tree};render();
 return {render,find:predicate=>nodes(tree,predicate)[0],all:predicate=>nodes(tree,predicate),async flush(){for(let i=0;i<4;i++){await new Promise(setImmediate);if(dirty)render()}},close(){for(const slot of slots)slot?.cleanup?.()}};
}

test('reader context defaults only when no location was requested and validates generic coordinates',()=>{
 assert.deepEqual(resolveFieldbookChoice(new URLSearchParams(),seedCatalog),{choice:liwa});
 assert.deepEqual(resolveFieldbookChoice(new URLSearchParams('destination=unknown'),seedCatalog),{error:'notFound'});
 assert.deepEqual(resolveFieldbookChoice(new URLSearchParams('destination=https://example.org'),seedCatalog),{error:'notFound'});
 assert.deepEqual(resolveFieldbookChoice(new URLSearchParams('terrainId=forest&lat=-12.4&lon=170'),seedCatalog),{choice:{terrainId:'forest',point:{lat:-12.4,lon:170}}});
 assert.deepEqual(resolveFieldbookChoice(new URLSearchParams('terrainId=forest'),seedCatalog),{choice:{terrainId:'forest'}});
 for(const query of ['terrainId=volcano','lat=10&lon=20','terrainId=forest&lat=91&lon=0','terrainId=coast&lat=&lon=4','terrainId=forest&lat=0'])assert.deepEqual(resolveFieldbookChoice(new URLSearchParams(query),seedCatalog),{error:'invalid'},query);
});

test('five-language reader contains real chapters, a dated PDF download, contents targets and source links',()=>{
 for(const [key,values]of Object.entries(fieldbookWords)){assert.equal(values.length,5,key);assert.ok(values.every(value=>typeof value==='string'&&value.trim()),key)}
 for(const locale of ['ar','en','fr','zh','hi']){
  const output=html(liwa,locale);assert.match(output,new RegExp(`/books/liwa-${locale}\\.pdf`));assert.match(output,/download=""/);assert.ok(output.includes(escaped(fieldbookText(locale,'editionHelp'))));assert.ok(output.includes(escaped(fieldbookText(locale,'revision'))));assert.match(output,/datetime="2026-09-17"/i);
  for(const [i,chapter]of seedCatalog.destinations.find(d=>d.id==='liwa').sections.entries()){assert.ok(output.includes(`href="#fieldbook-chapter-${i}"`));assert.ok(output.includes(`id="fieldbook-chapter-${i}"`));assert.ok(output.includes(escaped(translate(locale,chapter.title))))}
  assert.match(output,/href="https:\/\//);assert.match(output,new RegExp(`dir="${locale==='ar'?'rtl':'ltr'}"`));assert.doesNotMatch(output,/download[^>]*\.html|srcDoc|<iframe/);
 }
});

test('updated destination text, species and citations are read from one explicit catalog snapshot',()=>{
 const catalog=structuredClone(seedCatalog),destination=catalog.destinations.find(d=>d.id==='liwa');catalog.revision=42;catalog.publishedAt='2027-03-04T00:00:00Z';
 destination.sections=[{id:'place',title:Array(5).fill('Current chapter'),body:Array(5).fill('Snapshot-specific prose'),sourceIds:['snapshot-source']}];destination.species=[{id:'current-species',name:Array(5).fill('Verified entry'),description:Array(5).fill('Description from same snapshot'),precaution:Array(5).fill('Identification is limited'),sourceIds:['snapshot-source'],coverage:'local'}];catalog.sources.push({id:'snapshot-source',title:'Updated official reference',url:'https://example.org/current',reviewedAt:'2027-03-03'});
 const output=html(liwa,'en',catalog);for(const text of ['Current chapter','Snapshot-specific prose','Verified entry','Identification is limited','Updated official reference','2027-03-03','2027-03-04','>42<'])assert.ok(output.includes(text),text);assert.match(output,/href="https:\/\/example.org\/current"/);assert.ok(output.includes('/books/liwa-en.pdf'));
});

test('new catalog destinations never inherit a terrain PDF and generic points never claim local species',()=>{
 const catalog=structuredClone(seedCatalog),added={...structuredClone(catalog.destinations.find(d=>d.id==='black-forest')),id:'new-forest'};catalog.destinations.push(added);
 const fresh=html({destinationId:'new-forest',terrainId:'forest'},'en',catalog);assert.ok(fresh.includes(fieldbookText('en','noPdf')));assert.doesNotMatch(fresh,/href="\/books\//);
 const generic=html({terrainId:'forest',point:{lat:12,lon:34}});assert.match(generic,/\/books\/terrain-forest-en.pdf/);assert.ok(generic.includes(fieldbookText('en','terrainEdition')));assert.ok(generic.includes(fieldbookText('en','noSpecies')));assert.doesNotMatch(generic,/class="fieldbook-species"/);
});

test('official further reading keeps original publisher and format separate from Daroub PDF',()=>{
 const books=base('lib/official-region-books.json');for(const destinationId of ['liwa','jebel-shams']){const destination=seedCatalog.destinations.find(d=>d.id===destinationId),book=books.find(item=>item.destinationId===destinationId),output=html({destinationId,terrainId:destination.terrainId});
  assert.ok(output.includes(escaped(book.title)));assert.ok(output.includes(escaped(book.publisher)));assert.ok(output.includes(`href="${escaped(book.url)}" target="_blank" rel="noreferrer"`));assert.ok(output.includes(fieldbookText('en',book.format==='pdf'?'officialPdf':'webGuide')));assert.ok(output.includes(escaped(fieldbookText('en','officialHelp'))));assert.match(output,/href="#fieldbook-official"/);
 }
});

test('regional book action is a normal reader link and generic coordinates stay explicit',()=>{
 const {RegionReport}=load('components/region-report.tsx');
 const normal=renderToStaticMarkup(React.createElement(RegionReport,{index:0,destinationId:'liwa'})),generic=renderToStaticMarkup(React.createElement(RegionReport,{index:2,point:{lat:12,lon:34}}));
 assert.match(normal,/href="\/fieldbook\?destination=liwa"/);assert.match(generic,/href="\/fieldbook\?terrainId=forest&amp;lat=12&amp;lon=34"/);assert.doesNotMatch(normal,/book-dialog|HTML/);
});

test('save offline uses the displayed snapshot, serializes repeat clicks, and drops an unmounted build',async()=>{
 for(const unmount of [false,true]){let finish;const pending=new Promise(resolve=>{finish=resolve}),builds=[],saves=[];const h=harness('components/fieldbook-reader.tsx','FieldbookDocument',{choice:liwa,catalog:seedCatalog,locale:'en'},{'@/lib/fieldbook':{buildGuideHtml:options=>{builds.push(options);return pending}},'@/lib/offline':{saveGuide:async(...args)=>{saves.push(args)}}});
  try{const button=h.find(n=>n.type==='button'&&n.props.className==='fieldbook-secondary');button.props.onClick();button.props.onClick();assert.equal(builds.length,1);assert.equal(builds[0].catalog,seedCatalog);assert.equal(builds[0].destinationId,'liwa');if(unmount)h.close();finish('<!doctype html><h1>Readable copy</h1>');await h.flush();assert.equal(saves.length,unmount?0:1);if(!unmount){assert.deepEqual(saves[0].slice(0,3),['liwa','en','<!doctype html><h1>Readable copy</h1>']);assert.ok(h.find(n=>n.props?.role==='status'))}}finally{h.close()}
 }
});

test('offline PDF links use saved locale and exact id while custom copies keep their sandboxed reader',async()=>{
 const guides=[{id:'liwa-ar',destinationId:'liwa',locale:'ar',html:'<h1>Saved Arabic copy</h1>',title:'Saved Liwa',savedAt:'2026-09-16T00:00:00Z'},{id:'custom-hi',destinationId:'point-12-34-forest',locale:'hi',html:'<h1>Custom copy</h1>',title:'Custom',savedAt:'2026-09-15T00:00:00Z'}];
 const h=harness('components/offline-library.tsx','OfflineLibrary',{}, {'@/lib/offline':{listGuides:async()=>guides,deleteGuide:async()=>{}}});try{await h.flush();const links=h.all(n=>n.type==='a'&&n.props.download);assert.equal(links.length,1);assert.equal(links[0].props.href,'/books/liwa-ar.pdf');assert.equal(h.all(n=>n.type==='button'&&String(n.props.onClick).includes('downloadText')).length,0);
  const reads=h.all(n=>n.type==='button'&&n.props.className==='primary-btn');reads[1].props.onClick();h.render();const frame=h.find(n=>n.type==='iframe');assert.equal(frame.props.srcDoc,guides[1].html);assert.equal(frame.props.sandbox,'allow-popups');assert.equal(frame.props.title,'Custom');
 }finally{h.close()}
});
