import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const bundle=await build({entryPoints:['lib/trip-signin.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {tripSignInHref}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
test('sign-in preserves launcher selections and private trip deep links on a fixed local return path',()=>{
 const href=new URL(tripSignInHref('?destination=liwa&activity=camping&group=3&return_to=https://evil.invalid&invite=secret'),'https://example.test');
 const target=new URL(href.searchParams.get('return_to'),'https://example.test');
 assert.equal(target.origin,'https://example.test');assert.equal(target.pathname,'/trips');
 assert.equal(target.search,'?destination=liwa&group=3&activity=camping');
 assert.equal(new URL(tripSignInHref('?trip=trip-a'),'https://example.test').searchParams.get('return_to'),'/trips?trip=trip-a');
 assert.equal(new URL(tripSignInHref('?destination='+'x'.repeat(101)),'https://example.test').searchParams.get('return_to'),'/trips');
});
