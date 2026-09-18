import test from 'node:test';
import assert from 'node:assert/strict';
import {createLoader} from './helpers/load-ts.mjs';

const locales=['ar','en','fr','zh','hi'];
function find(node,predicate){if(Array.isArray(node))return node.flatMap(child=>find(child,predicate));if(!node||typeof node!=='object')return[];return[...(predicate(node)?[node]:[]),...find(node.props?.children,predicate)]}
function fixture(pathname,locale='en',signedIn=false){
 const user={userId:'user-a',displayName:'Traveller',readOnly:false},status={state:'synced',pending:0,conflicts:0};
 const states=[signedIn?user:null,signedIn?status:null,false];let cursor=0,tree;const calls=[];
 const hooks={useEffect(){},useState(initial){const index=cursor++;if(!(index in states))states[index]=initial;return[states[index],value=>{states[index]=typeof value==='function'?value(states[index]):value}]}};
 const {ToolkitRuntime}=createLoader({react:hooks,'next/navigation':{usePathname:()=>pathname},'./navigation-cards.css':{},'./site-shell':{useSite:()=>({locale,tr:values=>values[locales.indexOf(locale)]})},'@/lib/trip-store':{getSession:async()=>{calls.push('session');return user},syncTrips:async()=>{calls.push('sync');return status},signOut:async()=>{calls.push('signout')}}})('components/toolkit-runtime.tsx');
 const render=()=>{cursor=0;tree=ToolkitRuntime()};render();
 return{render,calls,find:predicate=>find(tree,predicate)};
}

test('all five locales expose four named native navigation links with a single correct current page',()=>{
 for(const locale of locales)for(const path of ['/trips','/team','/inventory','/offline']){
  const h=fixture(path,locale),nav=h.find(n=>n.type==='nav')[0],links=find(nav,n=>n.type==='a');
  assert.ok(nav.props['aria-label'].trim());assert.equal(links.length,4);
  assert.deepEqual(links.map(n=>n.props.href),['/trips','/team','/inventory','/offline']);
  assert.deepEqual(links.filter(n=>n.props['aria-current']==='page').map(n=>n.props.href),[path]);
  for(const link of links){assert.equal(link.props.onClick,undefined);assert.equal(link.props.tabIndex,undefined);assert.equal(link.props.role,undefined);assert.ok(find(link,n=>n.props?.className==='toolkit-nav-label')[0].props.children.trim());assert.equal(find(link,n=>n.props?.className==='toolkit-nav-icon')[0].props.children.props['aria-hidden'],'true')}
 }
});

test('nested toolkit routes retain current state without matching unrelated path prefixes',()=>{
 for(const [path,expected]of[['/trips/example','/trips'],['/team/room','/team'],['/teamwork',undefined],['/globe',undefined],['/login',undefined]]){
  const h=fixture(path),active=h.find(n=>n.type==='a'&&n.props?.['aria-current']==='page');assert.equal(active.length,expected?1:0);if(expected)assert.equal(active[0].props.href,expected);
 }
});

test('account sign-in stays a separate native top navigation link',()=>{
 const h=fixture('/offline'),account=h.find(n=>n.props?.className==='toolkit-account')[0],link=find(account,n=>n.type==='a')[0];
 assert.equal(link.props.target,'_top');assert.match(link.props.href,/^\/login\?return_to=/);assert.equal(link.props.onClick,undefined);
});

test('sync and confirmed sign-out retain their existing handlers after navigation changes',async()=>{
 const h=fixture('/inventory','en',true),account=h.find(n=>n.props?.className==='toolkit-account')[0];
 const buttons=find(account,n=>n.type==='button');assert.equal(buttons.length,2);
 await buttons[0].props.onClick();assert.deepEqual(h.calls,['session','sync']);h.render();
 assert.equal(h.find(n=>n.props?.role==='status')[0].props['aria-busy'],false);
 const previous=Object.getOwnPropertyDescriptor(globalThis,'window');
 try{
  Object.defineProperty(globalThis,'window',{configurable:true,value:{confirm:()=>false}});buttons[1].props.onClick();assert.equal(h.calls.includes('signout'),false);
  window.confirm=()=>true;buttons[1].props.onClick();assert.deepEqual(h.calls,['session','sync','signout']);
 }finally{if(previous)Object.defineProperty(globalThis,'window',previous);else delete globalThis.window}
});
