import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createLoader} from './helpers/load-ts.mjs';
const load=createLoader(),{seedCatalog}=load('lib/catalog-seed.ts'),{locales}=load('lib/terrain.ts'),{fieldbookPdf}=load('lib/fieldbook-editions.ts');
const manifest=JSON.parse(fs.readFileSync('lib/fieldbook-pdfs.json','utf8'));
test('every published destination has a real PDF in all five languages',()=>{
 for(const destination of seedCatalog.destinations)for(const locale of locales){
  const edition=fieldbookPdf(destination.id,destination.terrainId,locale);assert.ok(edition,destination.id+' '+locale);
  assert.equal(edition.url,`/fieldbooks/${destination.id}-${locale}.pdf`);assert.ok(edition.pages>=3);
  const bytes=fs.readFileSync('public'+edition.url);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.ok(bytes.length>10000);assert.ok(bytes.subarray(-100).includes(Buffer.from('%%EOF')));
 }
});
test('custom coordinates receive only a generic terrain book and unknown destinations never inherit another book',()=>{
 for(const terrainId of ['desert','mountain','forest','coast'])for(const locale of locales){
  assert.match(fieldbookPdf(undefined,terrainId,locale).url,new RegExp(`/terrain-${terrainId}-${locale}\\.pdf$`));
  assert.equal(fieldbookPdf('unpublished-place',terrainId,locale),undefined);
 }
 assert.equal(fieldbookPdf(undefined,'invalid','ar'),undefined);
 assert.equal(Object.values(manifest).reduce((count,book)=>count+Object.keys(book).length,0),135,'23 destinations and 4 terrain books in five languages');
});
test('further reading is specific, explicit about its language and uses official HTTPS references',()=>{
 const references=JSON.parse(fs.readFileSync('lib/official-region-books.json','utf8'));
 assert.equal(references.length,seedCatalog.destinations.length);
 assert.equal(new Set(references.map(r=>r.destinationId)).size,references.length);
 for(const destination of seedCatalog.destinations){const ref=references.find(r=>r.destinationId===destination.id);assert.ok(ref?.title&&ref.publisher&&ref.language&&ref.format&&ref.coverage);assert.equal(new URL(ref.url).protocol,'https:');}
});
