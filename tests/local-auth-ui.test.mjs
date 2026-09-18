import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createLoader} from './helpers/load-ts.mjs';
const mocks={'./auth-entry.css':{},'./site-shell':{useSite:()=>({locale:'en'})}},load=createLoader(mocks),{validateAuthFields,parseLocalAuthResult,LocalAuthForm,AuthRecovery}=load('components/auth-entry.tsx'),{authWords,authText}=load('lib/auth-copy.ts');
const code=Array(8).fill('1234abcd').join('-'),password='a long passphrase 🌍 ',fields={name:'Traveler',email:'traveler@example.org',password,confirm:password,recoveryCode:code};
const nodes=(node,predicate)=>Array.isArray(node)?node.flatMap(child=>nodes(child,predicate)):!node||typeof node!=='object'?[]:[...(predicate(node)?[node]:[]),...nodes(node.props?.children,predicate)];
function harness(component,props,fetcher=async()=>({ok:true,json:async()=>null})){
 const slots=[],effects=[],listeners=new Map(),requests=[],navigations=[];let cursor=0,dirty=true,tree;
 const originals={window:globalThis.window,fetch:globalThis.fetch,requestAnimationFrame:globalThis.requestAnimationFrame};
 globalThis.window={location:{search:'?return_to=%2Ftrips%3Fdestination%3Dliwa%26group%3D3',assign:value=>navigations.push(value)},addEventListener:(key,fn)=>listeners.set(key,fn),removeEventListener:(key,fn)=>{if(listeners.get(key)===fn)listeners.delete(key)}};
 globalThis.requestAnimationFrame=fn=>{fn();return 1};globalThis.fetch=async(...args)=>{requests.push(args);return fetcher(...args)};
 const hooks={...React,useId(){return ':auth:'},useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;dirty=true}]},useRef(initial){const i=cursor++;return slots[i]??(slots[i]={current:initial})},useEffect(fn,deps){const i=cursor++,old=slots[i];if(!old||deps.some((value,j)=>value!==old.deps[j]))effects.push(()=>{old?.cleanup?.();slots[i]={deps,cleanup:fn()}})}};
 const components=createLoader({...mocks,react:hooks})('components/auth-entry.tsx');
 const render=()=>{cursor=0;dirty=false;tree=components[component](props);while(effects.length)effects.shift()();return tree};render();
 const find=predicate=>nodes(tree,predicate)[0],input=name=>find(node=>node.type==='input'&&node.props.name===name);
 return {components,requests,navigations,listeners,render,find,all:predicate=>nodes(tree,predicate),input,set(name,value){input(name).props.onChange({target:{value}});render()},submit(){return find(node=>node.type==='form').props.onSubmit({preventDefault(){}})},async flush(){for(let i=0;i<5;i++){await new Promise(setImmediate);if(dirty)render()}},close(){for(const slot of slots)slot?.cleanup?.();Object.assign(globalThis,originals)}};
}
const formProps=(mode='register',overrides={})=>({mode,locale:'en',returnTo:'/trips?destination=liwa&group=3',onRecovery(){},onSessionChanged(){},...overrides});
function fill(h,mode='register'){if(mode==='register')h.set('name',fields.name);h.set('email',fields.email);if(mode==='recover')h.set('recoveryCode',code);h.set('password',password);if(mode!=='login')h.set('confirm',password)}

test('validation counts Unicode characters, preserves spaces and rejects mismatches or incomplete recovery codes',()=>{
 assert.equal(validateAuthFields('register',fields),null);assert.equal(validateAuthFields('register',{...fields,password:'🌍'.repeat(15),confirm:'🌍'.repeat(15)}),null);
 assert.equal(validateAuthFields('register',{...fields,password:'🌍'.repeat(14),confirm:'🌍'.repeat(14)}).field,'password');
 assert.equal(validateAuthFields('register',{...fields,password:' '.repeat(15),confirm:' '.repeat(15)}),null);
 assert.equal(validateAuthFields('register',{...fields,password:'a'.repeat(129)}).field,'password');assert.equal(validateAuthFields('register',{...fields,confirm:'different'}).field,'confirm');
 assert.equal(validateAuthFields('register',{...fields,name:' '} ).field,'name');assert.equal(validateAuthFields('login',{...fields,email:'invalid'}).field,'email');
 assert.equal(validateAuthFields('recover',{...fields,recoveryCode:code.replaceAll('-',' ')}),null);assert.equal(validateAuthFields('recover',{...fields,recoveryCode:'short'}).field,'recoveryCode');
});

test('response contract fails closed without a usable registration or replacement code',()=>{
 assert.deepEqual(parseLocalAuthResult({ok:true},'login'),{ok:true});assert.deepEqual(parseLocalAuthResult({ok:true,recoveryCode:code},'register'),{ok:true,recoveryCode:code});
 for(const value of [null,[],{ok:true},{ok:true,recoveryCode:'short'},{ok:false,error:'unknown'}])assert.throws(()=>parseLocalAuthResult(value,'recover'));
 assert.deepEqual(parseLocalAuthResult({ok:false,error:'rate-limited'},'login'),{ok:false,error:'rate-limited'});
});

test('all five languages expose normal account fields and safe recovery acknowledgment without nested forms',()=>{
 for(const [key,values]of Object.entries(authWords)){assert.equal(values.length,5,key);assert.ok(values.every(value=>typeof value==='string'&&value.trim()),key)}
 for(const locale of ['ar','en','fr','zh','hi']){
  const html=renderToStaticMarkup(React.createElement(LocalAuthForm,formProps('register',{locale}))),recovery=renderToStaticMarkup(React.createElement(AuthRecovery,{code,locale,onContinue(){}}));
  for(const key of ['email','password','confirmPassword','noEmail'])assert.ok(html.includes(authText(locale,key)),key);assert.equal((html.match(/<form/g)||[]).length,1);
  assert.match(html,/autoComplete="new-password"/);assert.match(html,/<form[^>]*method="post"/);assert.match(html,/<form[^>]*action="\/api\/auth"/);assert.doesNotMatch(html,/minlength|maxlength/i);assert.ok(recovery.includes(authText(locale,'savedCodeAck')));assert.match(recovery,/class="auth-primary" disabled=""/);
 }
});

test('registration posts only intended credentials once, preserves Unicode and clears secrets before displaying recovery',async()=>{
 let release;const pending=new Promise(resolve=>{release=resolve}),issued=[];
 const h=harness('LocalAuthForm',formProps('register',{onRecovery:value=>issued.push(value)}),()=>pending);
 try{fill(h);h.set('email',' Traveler@EXAMPLE.org ');const first=h.submit(),second=h.submit();assert.equal(h.requests.length,1);const request=h.requests[0][1],body=JSON.parse(request.body);assert.equal(request.method,'POST');assert.equal(request.credentials,'same-origin');assert.equal(request.cache,'no-store');assert.deepEqual(body,{action:'register',email:'traveler@example.org',password,name:fields.name});
  release({ok:true,json:async()=>({ok:true,recoveryCode:code})});await Promise.all([first,second]);h.render();assert.deepEqual(issued,[code]);assert.deepEqual(h.navigations,[]);assert.equal(h.input('password').props.value,'');assert.equal(h.input('confirm').props.value,'');
 }finally{h.close()}
});

test('login redirects only to a sanitized return and failed requests clear password with a visible error',async()=>{
 for(const failure of [false,true]){const h=harness('LocalAuthForm',formProps('login',{returnTo:'https://untrusted.test'}),async()=>({ok:!failure,json:async()=>failure?{ok:false,error:'invalid-credentials'}:{ok:true}}));try{fill(h,'login');await h.submit();h.render();assert.equal(h.input('password').props.value,'');assert.deepEqual(h.navigations,failure?[]:['/trips']);if(failure)assert.ok(h.find(node=>node.props?.role==='alert'));}finally{h.close()}}
});

test('recovery uses the saved code and a new confirmed password, and unmount ignores a delayed success',async()=>{
 const issued=[],h=harness('LocalAuthForm',formProps('login',{onRecovery:value=>issued.push(value)}),async()=>({ok:true,json:async()=>({ok:true,recoveryCode:code})}));
 try{h.find(n=>n.props?.className==='auth-recovery-toggle').props.onClick();h.render();fill(h,'recover');await h.submit();h.render();assert.deepEqual(JSON.parse(h.requests[0][1].body),{action:'recover',email:fields.email,password,recoveryCode:code});assert.deepEqual(issued,[code]);assert.equal(h.input('recoveryCode').props.value,'');assert.equal(h.input('confirm').props.value,'');}finally{h.close()}
 let release;const delayed=new Promise(resolve=>{release=resolve}),stale=[];const late=harness('LocalAuthForm',formProps('register',{onRecovery:value=>stale.push(value)}),()=>delayed);fill(late);const submitting=late.submit();const signal=late.requests[0][1].signal;late.close();release({ok:true,json:async()=>({ok:true,recoveryCode:code})});await submitting;assert.equal(signal.aborted,true);assert.deepEqual(stale,[]);
});

test('saved-code acknowledgment is required and protects against accidental departure',()=>{
 let continued=0;const h=harness('AuthRecovery',{code,locale:'en',onContinue:()=>continued++});try{
  const button=()=>h.find(n=>n.type==='button'&&n.props.className==='auth-primary');assert.equal(button().props.disabled,true);button().props.onClick();assert.equal(continued,0);assert.ok(h.listeners.has('beforeunload'));
  h.find(n=>n.type==='input'&&n.props.type==='checkbox').props.onChange({target:{checked:true}});h.render();assert.equal(button().props.disabled,false);assert.equal(h.listeners.has('beforeunload'),false);button().props.onClick();assert.equal(continued,1);
 }finally{h.close()}
});

test('recovery copy and download require explicit actions and never acknowledge saving automatically',async()=>{
 const navigatorDescriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator'),oldDocument=globalThis.document,createUrl=URL.createObjectURL;let copied,downloadedBlob,clicked=0;const link={click(){clicked++}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async value=>{copied=value}}}});globalThis.document={createElement:()=>link};URL.createObjectURL=blob=>{downloadedBlob=blob;return createUrl(blob)};
 const h=harness('AuthRecovery',{code,locale:'en',onContinue(){assert.fail('No automatic navigation')}});
 try{assert.equal(copied,undefined);assert.equal(downloadedBlob,undefined);const buttons=()=>h.all(n=>n.type==='button'&&n.props.className==='auth-secondary');buttons()[0].props.onClick();await h.flush();assert.equal(copied,code);assert.ok(h.find(n=>n.props?.role==='status'));buttons()[1].props.onClick();assert.equal(clicked,1);assert.equal(link.download,'daroub-recovery-code.txt');const text=await downloadedBlob.text();assert.ok(text.includes(code));assert.ok(text.includes(authText('en','codeFileNote')));assert.equal(h.find(n=>n.type==='input'&&n.props.type==='checkbox').props.checked,false);
  globalThis.navigator.clipboard.writeText=async()=>{throw Error('denied')};buttons()[0].props.onClick();await h.flush();assert.ok(h.find(n=>n.props?.role==='alert'));assert.equal(h.find(n=>n.type==='button'&&n.props.className==='auth-primary').props.disabled,true);
 }finally{h.close();globalThis.document=oldDocument;URL.createObjectURL=createUrl;if(navigatorDescriptor)Object.defineProperty(globalThis,'navigator',navigatorDescriptor);else delete globalThis.navigator}
});

test('ChatGPT uses a secondary sibling native POST and recovery screen survives signed-in session refresh',async()=>{
 let current=null;const h=harness('AuthEntry',{mode:'register'},async()=>({ok:true,json:async()=>current}));try{
  await h.flush();const local=h.find(n=>n.type===h.components.LocalAuthForm),provider=h.find(n=>n.type==='form'&&n.props.action==='/auth/chatgpt');assert.ok(local);assert.ok(provider);assert.equal(provider.props.method,'post');assert.equal(provider.props.target,'_top');assert.equal(nodes(provider,n=>n.type==='input')[0].props.value,'/trips?destination=liwa&group=3');
  local.props.onBusyChange(true);h.render();const guarded=h.find(n=>n.type==='form'&&n.props.action==='/auth/chatgpt');assert.equal(nodes(guarded,n=>n.type==='button')[0].props.disabled,true);let prevented=false;guarded.props.onSubmit({preventDefault(){prevented=true}});assert.equal(prevented,true);
  local.props.onRecovery(code);h.render();current={userId:'local:test',displayName:'Traveler'};h.listeners.get('pageshow')({persisted:true});await h.flush();assert.ok(h.find(n=>n.type===h.components.AuthRecovery));assert.equal(h.find(n=>n.props?.className==='auth-existing'),undefined);assert.deepEqual(h.navigations,[]);
 }finally{h.close()}
 const source=fs.readFileSync('components/auth-entry.tsx','utf8');assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|fetch\(['"]\/signin-with-chatgpt/);
});
