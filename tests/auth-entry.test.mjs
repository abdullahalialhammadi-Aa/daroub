import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const bundle=await build({entryPoints:['lib/auth-entry.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {safeAuthReturn,authEntryHref}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
test('auth return paths reject external, encoded, reserved and secret contexts',()=>{
 for(const value of ['https://evil.test','//evil.test','/\\evil.test','/login','/register','/signin-with-chatgpt','/%2F%2Fevil.test','/\n/evil.test','/api/session',null])assert.equal(safeAuthReturn(value),'/trips');
 assert.equal(safeAuthReturn('/team?room=x&invite=SECRET#token'),'/team?room=x');
 assert.equal(safeAuthReturn('/trips?trip=a&return_to=https://evil.test&token=SECRET'),'/trips?trip=a');
 assert.equal(safeAuthReturn('/globe?destination=liwa&lat=23&lon=54'),'/globe?destination=liwa&lat=23&lon=54');
 assert.equal(authEntryHref('/trips?trip=a','register'),'/register?return_to=%2Ftrips%3Ftrip%3Da');
});
