import test, {after, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as nodeCrypto from 'node:crypto';
import {Miniflare} from 'miniflare';
import {createLoader} from './helpers/load-ts.mjs';

// Real D1 executes the migration, transactional batches and guarded SQL. Only
// database discovery, current request identity and crypto call counting are mocked.
const mf=new Miniflare({modules:true,script:"export default {fetch(){return new Response('ok')}}",compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'local-auth-server-tests'},host:'127.0.0.1',port:0,inspectorPort:0});
after(()=>mf.dispose());
const db=await mf.getD1Database('DB');
const migration=fs.readdirSync('drizzle').filter(file=>file.endsWith('.sql')).map(file=>fs.readFileSync('drizzle/'+file,'utf8')).find(sql=>sql.includes('CREATE TABLE `local_users`'));
assert.ok(migration,'the generated local authentication migration must exist');
await db.batch(migration.split('--> statement-breakpoint').map(sql=>sql.trim()).filter(Boolean).map(sql=>db.prepare(sql)));
beforeEach(async()=>{await db.batch(['DELETE FROM local_sessions','DELETE FROM local_users','DELETE FROM auth_limits'].map(sql=>db.prepare(sql)));});

const password='a long unique passphrase 2026';
const email='walker@example.test';
const registration={action:'register',email,password,name:'Test Walker'};
const request=(input,options={})=>new Request(options.url??'https://daroub.test/api/auth',{method:'POST',headers:{host:'daroub.test',origin:'https://daroub.test','content-type':'application/json','cf-connecting-ip':'192.0.2.40',...options.headers},body:options.raw??JSON.stringify(input)});
function harness(){
 const state={db,current:null,derivations:0};
 const load=createLoader({'./sync-server':{database:()=>state.db},'@/app/chatgpt-auth':{getChatGPTUser:async()=>state.current},'node:crypto':{...nodeCrypto,scrypt(...args){state.derivations++;return nodeCrypto.scrypt(...args);}}});
 const auth=load('lib/local-auth-server.ts'),route=load('app/api/auth/route.ts');
 return {state,auth,load,post:(input,options)=>route.POST(request(input,options))};
}
const cookie=response=>response.headers.get('set-cookie')?.split(';')[0];
const token=response=>cookie(response)?.split('=')[1];
const identity=(h,response)=>h.auth.localIdentity(new Headers({host:'daroub.test',cookie:cookie(response)}));
const count=async(table)=>(await db.prepare(`SELECT count(*) AS n FROM ${table}`).first()).n;
function noStore(response){assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('pragma'),'no-cache');}
async function error(response,status,code){assert.equal(response.status,status);assert.deepEqual(await response.json(),{ok:false,error:code});noStore(response);assert.equal(response.headers.get('set-cookie'),null);}
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done});return {promise,resolve};};

test('signup and login use a separate identity namespace, hashed secrets, private cookies and no-store responses',async()=>{
 const h=harness(),registered=await h.post({...registration,email:'  WALKER@EXAMPLE.TEST  '});
 assert.equal(registered.status,201);noStore(registered);
 assert.match(registered.headers.get('set-cookie'),/^__Host-daroub_session=[a-f0-9]{64}; Path=\/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure$/);
 const result=await registered.json(),user=await db.prepare('SELECT * FROM local_users').first(),session=await db.prepare('SELECT * FROM local_sessions').first();
 assert.match(result.recoveryCode,/^[a-f0-9]{8}(?:-[a-f0-9]{8}){7}$/);assert.match(user.id,/^daroub:/);assert.equal(user.email,email);
 assert.match(user.password_hash,/^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{64}$/);assert.notEqual(user.password_hash,password);
 assert.equal(user.recovery_hash,h.auth.digest(result.recoveryCode.replaceAll('-','')));assert.equal(session.token_hash,h.auth.digest(token(registered)));assert.notEqual(session.token_hash,token(registered));
 assert.equal((await identity(h,registered)).user.userId,user.id);
 const login=await h.post({action:'login',email,password});assert.equal(login.status,200);noStore(login);assert.notEqual(token(login),token(registered));assert.equal(await count('local_sessions'),2);
 assert.match(h.auth.sessionCookie(new Request('http://127.0.0.1:8787/api/auth'),token(login)),/^daroub_session_local=.*; Max-Age=604800$/);
 assert.ok(!h.auth.sessionCookie(new Request('http://127.0.0.1:8787/api/auth'),token(login)).includes('Secure'));
});

test('concurrent registrations create one account and one session without an orphan',async()=>{
 const h=harness(),responses=await Promise.all([h.post(registration),h.post({...registration,name:'Other name'})]);
 assert.deepEqual(responses.map(response=>response.status).sort(),[201,409]);
 await error(responses.find(response=>response.status===409),409,'account-unavailable');assert.equal(await count('local_users'),1);assert.equal(await count('local_sessions'),1);
});

test('recovery rotates credentials and code, invalidates every old session and rejects the consumed code',async()=>{
 const h=harness(),registered=await h.post(registration),{recoveryCode}=await registered.json(),login=await h.post({action:'login',email,password});
 const recovered=await h.post({action:'recover',email,password:'replacement passphrase 2026',recoveryCode:recoveryCode.toUpperCase()});
 assert.equal(recovered.status,200);noStore(recovered);const next=await recovered.json();assert.notEqual(next.recoveryCode,recoveryCode);
 assert.equal((await identity(h,registered)).user,null);assert.equal((await identity(h,login)).user,null);assert.equal((await identity(h,recovered)).user.email,email);assert.equal(await count('local_sessions'),1);
 const row=await db.prepare('SELECT * FROM local_users').first();assert.equal(row.credential_version,2);assert.equal(row.recovery_hash,h.auth.digest(next.recoveryCode.replaceAll('-','')));
 await error(await h.post({action:'recover',email,password:'another replacement passphrase',recoveryCode}),401,'invalid-credentials');
 await error(await h.post({action:'login',email,password}),401,'invalid-credentials');assert.equal((await h.post({action:'login',email,password:'replacement passphrase 2026'})).status,200);
});

test('concurrent recovery attempts consume a code once and retain only the winning session',async()=>{
 const h=harness(),registered=await h.post(registration),{recoveryCode}=await registered.json();
 const replacements=['first replacement passphrase','second replacement passphrase'];
 const responses=await Promise.all(replacements.map(password=>h.post({action:'recover',email,password,recoveryCode})));
 assert.deepEqual(responses.map(response=>response.status).sort(),[200,401]);
 const winner=responses.findIndex(response=>response.status===200);await error(responses[1-winner],401,'invalid-credentials');
 assert.equal(await count('local_sessions'),1);assert.equal((await db.prepare('SELECT credential_version FROM local_users').first()).credential_version,2);
 assert.ok((await identity(h,responses[winner])).user);assert.equal((await identity(h,registered)).user,null);
 assert.equal((await h.post({action:'login',email,password:replacements[winner]})).status,200);await error(await h.post({action:'login',email,password:replacements[1-winner]}),401,'invalid-credentials');
});

test('a recovery winning after password verification prevents the stale login from inserting a session',async()=>{
 const h=harness(),registered=await h.post(registration),{recoveryCode}=await registered.json(),entered=deferred(),release=deferred();
 h.state.db={prepare(sql){const statement=db.prepare(sql);if(sql.startsWith('INSERT INTO local_sessions')&&sql.includes('AND password_hash=?'))return {bind(...values){return {async run(){entered.resolve();await release.promise;return statement.bind(...values).run();}};}};return statement;},batch:statements=>db.batch(statements)};
 const login=h.post({action:'login',email,password});
 try{await entered.promise;const recovery=await h.post({action:'recover',email,password:'recovered password wins race',recoveryCode});assert.equal(recovery.status,200);assert.ok((await identity(h,recovery)).user);}finally{release.resolve();}
 await error(await login,401,'invalid-credentials');assert.equal(await count('local_sessions'),1);assert.equal((await identity(h,registered)).user,null);
});

test('persistent address and account limits stop hashing, expire, and never set a session cookie',async()=>{
 const h=harness(),key=h.auth.digest(`login:email:${email}`),future=Date.now()+900000;
 await db.prepare('INSERT INTO auth_limits(key,count,reset_at) VALUES(?,10,?)').bind(key,future).run();
 const blocked=await h.post({action:'login',email,password});assert.equal(blocked.headers.get('retry-after'),'900');await error(blocked,429,'rate-limited');assert.equal(h.state.derivations,0);
 await db.prepare('UPDATE auth_limits SET reset_at=0 WHERE key=?').bind(key).run();await error(await h.post({action:'login',email,password}),401,'invalid-credentials');assert.equal(h.state.derivations,1);assert.equal((await db.prepare('SELECT count FROM auth_limits WHERE key=?').bind(key).first()).count,1);
 await db.prepare('UPDATE auth_limits SET count=50,reset_at=? WHERE key=?').bind(future,h.auth.digest('login:ip:192.0.2.40')).run();
 const newEmail='another@example.test';await error(await h.post({action:'login',email:newEmail,password}),429,'rate-limited');assert.equal(h.state.derivations,1);assert.equal(await db.prepare('SELECT * FROM auth_limits WHERE key=?').bind(h.auth.digest(`login:email:${newEmail}`)).first(),null);
 assert.equal(await count('local_sessions'),0);
});

test('request boundaries reject cross-origin, unsupported media, malformed JSON/UTF-8 and oversized bodies before hashing',async()=>{
 const h=harness();
 for(const [options,status,code] of [
  [{headers:{origin:'https://other.test'}},403,'invalid-origin'],
  [{headers:{'sec-fetch-site':'cross-site'}},403,'invalid-origin'],
  [{headers:{origin:''}},403,'invalid-origin'],
  [{headers:{'content-type':'text/plain'}},415,'invalid-input'],
  [{raw:'null'},400,'invalid-input'],[{raw:'[]'},400,'invalid-input'],[{raw:'{'},400,'invalid-input'],
  [{raw:new Uint8Array([0xc3,0x28])},400,'invalid-input'],
  [{raw:' '.repeat(8193)},413,'invalid-input'],[{headers:{'content-length':'8193'}},413,'invalid-input'],
 ])await error(await h.post(registration,options),status,code);
 for(const body of [{...registration,password:'short'},{...registration,password:'x'.repeat(129)},{...registration,email:'bad'},{action:'unknown'}])await error(await h.post(body),400,'invalid-input');
 assert.equal(h.state.derivations,0);assert.equal(await count('local_users'),0);assert.equal(await count('auth_limits'),0);
});

test('malformed stored hashes fail safely and malformed, duplicate, expired or stale-version cookies cannot authenticate',async()=>{
 const h=harness();for(const stored of [null,'bad','scrypt-v1$'+'0'.repeat(32)+'$bad','scrypt-v1$'+'0'.repeat(32)+'$'+'0'.repeat(64)+'$extra'])assert.equal(await h.auth.verifyPassword(password,stored),false);
 assert.equal(h.state.derivations,4,'unknown or invalid hashes retain the password derivation path');
 const registered=await h.post(registration),valid=cookie(registered);
 for(const invalid of ['__Host-daroub_session=short',valid+'; '+valid,'__Host-daroub_session='+token(registered).toUpperCase()])assert.deepEqual(await h.auth.localIdentity(new Headers({host:'daroub.test',cookie:invalid})),{handled:true,user:null});
 await db.prepare('UPDATE local_sessions SET expires_at=0').run();assert.deepEqual(await identity(h,registered),{handled:true,user:null});
 await db.prepare('UPDATE local_sessions SET expires_at=?,credential_version=0').bind(Date.now()+100000).run();assert.deepEqual(await identity(h,registered),{handled:true,user:null});
 assert.deepEqual(await h.auth.localIdentity(new Headers({host:'daroub.test'})),{handled:false,user:null});
});

test('local identity takes precedence over trusted platform headers without merging accounts by email',async()=>{
 const h=harness(),registered=await h.post(registration),local=(await identity(h,registered)).user;
 let incoming=new Headers({host:'daroub.test',cookie:cookie(registered),'oai-authenticated-user-id':'platform-user','oai-authenticated-user-email':email});
 const load=createLoader({'next/headers':{headers:async()=>incoming},'next/navigation':{redirect(){throw Error('unexpected redirect');}},'@/lib/local-auth-server':h.auth});
 const getUser=load('app/chatgpt-auth.ts').getChatGPTUser;
 assert.equal((await getUser()).userId,local.userId);assert.notEqual(local.userId,'platform-user');assert.equal((await getUser()).authMethod,'password');
 incoming.delete('cookie');assert.equal((await getUser()).userId,'platform-user');assert.equal((await getUser()).authMethod,'chatgpt');
 incoming.set('cookie','__Host-daroub_session=malformed');assert.equal(await getUser(),null,'an invalid local session must not switch silently to the provider identity');
 incoming.delete('cookie');incoming.delete('oai-authenticated-user-id');assert.equal(await getUser(),null);
});

test('signed-in auth changes are refused, and logout is bound to the current account and revokes its session',async()=>{
 const h=harness(),registered=await h.post(registration);h.state.current=(await identity(h,registered)).user;
 for(const action of ['register','login','recover'])await error(await h.post({...registration,action}),409,'already-signed-in');
 await error(await h.post({action:'logout'},{headers:{cookie:cookie(registered),'x-daroub-account':'different-account'}}),409,'already-signed-in');assert.ok((await identity(h,registered)).user);
 const logout=await h.post({action:'logout'},{headers:{cookie:cookie(registered),'x-daroub-account':h.state.current.userId}});assert.equal(logout.status,200);noStore(logout);assert.match(logout.headers.get('set-cookie'),/^__Host-daroub_session=; Path=\/; HttpOnly; SameSite=Lax; Max-Age=0; Secure$/);assert.equal((await identity(h,registered)).user,null);assert.equal(await count('local_sessions'),0);
});
