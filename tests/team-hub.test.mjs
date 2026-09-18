import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),ts=require('typescript'),root=fileURLToPath(new URL('../',import.meta.url)),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function load(file,mocks={}){
 const compiled={exports:{}},source=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',source)(name=>{
  if(name in mocks)return mocks[name];if(name.endsWith('.css')||name.includes('ui/alert-dialog'))return {};
  if(name==='./site-shell')return {useSite:()=>({locale:'en'})};if(name==='./trip-store')return {getSession:async()=>null};
  if(name.startsWith('@/'))return load(name.slice(2)+'.ts',mocks);
  if(name.startsWith('./'))return load(path.join(path.dirname(file),name)+(['./team-board','./team-person-editor'].includes(name)?'.tsx':'.ts'),mocks);
  return require(name);
 },compiled,compiled.exports);return compiled.exports;
}
const {teamPreparationSummary,teamItemMatches,AllocationItem}=load('components/team-board.tsx'),{selectTeamBoards}=load('components/team-page.tsx'),{teamWords}=load('lib/team-copy.ts');
const board={id:'room-one',tripId:'trip-one',title:'Weekend trip',revision:4,updatedAt:'2026-09-17T12:00:00Z',isOwner:true,sourceRevision:3,inviteExpiresAt:null,participants:[{id:'me',name:'Aisha',isYou:true,isOwner:true,linked:true},{id:'other',name:'Sam',isYou:false,isOwner:false,linked:true},{id:'named',name:'Mina',isYou:false,isOwner:false,linked:false}],items:[{id:'water',label:'Water bottles',kind:'equipment',required:8},{id:'tent',label:'Tent',kind:'equipment',required:1},{id:'permit',label:'Check permit',kind:'task',required:1},{id:'map',label:'Map',kind:'equipment',required:1}],allocations:[{itemId:'water',participantId:'me',quantity:4,packed:2},{itemId:'water',participantId:'other',quantity:2,packed:0},{itemId:'tent',participantId:'named',quantity:1,packed:1},{itemId:'permit',participantId:'other',quantity:1,packed:0},{itemId:'map',participantId:'other',quantity:3,packed:0}]};
test('hub progress counts checklist lines without combining incompatible quantities or missing assignments',()=>{
 assert.deepEqual(teamPreparationSummary(board),{total:4,packed:1,remaining:3,unassigned:1,overassigned:1,mine:1,myRemaining:1,joined:2,named:1});
 const overpacked={...board,items:board.items.slice(0,2),allocations:[{itemId:'water',participantId:'me',quantity:20,packed:20}]};
 const result=teamPreparationSummary(overpacked);assert.equal(result.packed,1);assert.equal(result.remaining,1);assert.equal(result.unassigned,1);assert.equal(result.overassigned,1);
 assert.equal(teamPreparationSummary({...board,items:[],allocations:[]}).total,0);
});
test('attention includes fully packed overassignments while mine is tied to membership identity',()=>{
 const finished={...board,allocations:board.allocations.map(row=>({...row,packed:row.quantity}))};
 assert.deepEqual(finished.items.filter(item=>teamItemMatches(finished,item,'remaining')).map(item=>item.id),['water','map']);
 assert.deepEqual(board.items.filter(item=>teamItemMatches(board,item,'unassigned')).map(item=>item.id),['water']);
 assert.deepEqual(board.items.filter(item=>teamItemMatches(board,item,'mine')).map(item=>item.id),['water']);
 const otherAccount={...board,participants:board.participants.map(person=>({...person,isYou:person.id==='other'}))};
 assert.deepEqual(otherAccount.items.filter(item=>teamItemMatches(otherAccount,item,'mine')).map(item=>item.id),['water','permit','map']);
});
test('item rows show who brings each quantity immediately and expose update controls only to permitted members',()=>{
 const member={...board,isOwner:false},html=renderToStaticMarkup(React.createElement(AllocationItem,{board:member,item:board.items[0],locale:'en',locked:false,save:async()=>true}));
 assert.match(html,/Aisha/);assert.match(html,/Sam/);assert.match(html,/2 \/ 4/);assert.match(html,/0 \/ 2/);assert.doesNotMatch(html,/<details/);
 assert.equal((html.match(/Update packing/g)??[]).length,1);
 const ownerHtml=renderToStaticMarkup(React.createElement(AllocationItem,{board,item:board.items[0],locale:'en',locked:false,save:async()=>true}));
 assert.equal((ownerHtml.match(/Update packing/g)??[]).length,2);
});
test('team picker combines role and normalized title search, sorts recent first, and preserves source order',()=>{
 const rows=[{id:'first',title:'Desert weekend',isOwner:true,updatedAt:'2026-09-15T00:00:00Z'},{id:'second',title:'Desert weekend with friends',isOwner:false,updatedAt:'2026-09-17T00:00:00Z'},{id:'third',title:'山地 Ａ',isOwner:true,updatedAt:'2026-09-16T00:00:00Z'}];
 assert.deepEqual(selectTeamBoards(rows,' desert ','all').map(row=>row.id),['second','first']);assert.deepEqual(selectTeamBoards(rows,'desert','owner').map(row=>row.id),['first']);assert.deepEqual(selectTeamBoards(rows,'a','all').map(row=>row.id),['third']);assert.deepEqual(rows.map(row=>row.id),['first','second','third']);
});
function itemHarness(){
 const slots=[],actions=[];let cursor=0,props={board,item:board.items[0],locale:'en',locked:false,visible:true,save:async action=>{actions.push(action);return true},focusList:()=>{focusCount++}},tree,focusCount=0;
 const hooks={useId:()=> 'item',useState(initial){const index=cursor++;if(!(index in slots))slots[index]=initial;return [slots[index],value=>{slots[index]=typeof value==='function'?value(slots[index]):value}]},useRef(initial){const index=cursor++;return slots[index]??(slots[index]={current:initial})}};
 const {AllocationItem:Item}=load('components/team-board.tsx',{react:hooks});
 const render=()=>{cursor=0;tree=Item(props);return tree},find=(node,predicate)=>{if(!node||typeof node!=='object')return null;if(predicate(node))return node;for(const child of [node.props?.children].flat(Infinity)){const found=find(child,predicate);if(found)return found}return null};
 const button=label=>find(tree,node=>node.type==='button'&&[node.props.children].flat().includes(label));
 render();return {render,actions,tree:()=>tree,button,input:suffix=>find(tree,node=>node.props?.id==='item-'+suffix),setProps:next=>{props={...props,...next};render()},focusCount:()=>focusCount};
}
test('an allocation draft survives filtering and polling, then uses reviewed revision and restores focus',async()=>{
 const originalFrame=Object.getOwnPropertyDescriptor(globalThis,'requestAnimationFrame'),originalDocument=Object.getOwnPropertyDescriptor(globalThis,'document'),frames=[];
 Object.defineProperty(globalThis,'requestAnimationFrame',{value:callback=>{frames.push(callback);return frames.length},configurable:true});Object.defineProperty(globalThis,'document',{value:{getElementById:()=>null},configurable:true});
 try{
  const h=itemHarness();h.button('Update packing').props.onClick();h.render();assert.equal(h.input('quantity').props.value,'4');
  h.input('packed').props.onChange({target:{value:'4'}});h.render();h.setProps({visible:false,board:{...board,revision:5}});
  assert.equal(h.tree().props.hidden,false);assert.equal(h.input('packed').props.value,'4');assert.equal(h.button('Save allocation').props.disabled,true);
  assert.equal(h.input('participant').props.disabled,true);assert.equal(h.button('Update packing').props.disabled,true);
  h.button('Reviewed; keep my draft').props.onClick();h.render();assert.equal(h.button('Save allocation').props.disabled,false);
  h.button('Save allocation').props.onClick();await Promise.resolve();await Promise.resolve();h.render();
  assert.deepEqual(h.actions,[{type:'allocate',roomId:'room-one',revision:5,itemId:'water',participantId:'me',quantity:4,packed:4}]);assert.equal(h.tree().props.hidden,true);
  while(frames.length)frames.shift()();assert.equal(h.focusCount(),1);
 }finally{if(originalFrame)Object.defineProperty(globalThis,'requestAnimationFrame',originalFrame);else delete globalThis.requestAnimationFrame;if(originalDocument)Object.defineProperty(globalThis,'document',originalDocument);else delete globalThis.document}
});
test('dynamic hub labels exist in all five locales and authentication uses the local login route',()=>{
 for(const key of ['filter_remaining','filter_mine','filter_unassigned','filter_all','noItemsMember','linkActive','linkExpired','noInvite','ownedTeams','joinedTeams','completeNext','emptyNext','inviteNext','packMineNext','packingNext','excessNext','assignNext']){assert.ok(teamWords[key],key);assert.equal(teamWords[key].length,5);assert.ok(teamWords[key].every(value=>value.trim()))}
 for(const file of ['components/team-board.tsx','components/team-page.tsx']){const source=fs.readFileSync(path.join(root,file),'utf8');assert.match(source,/\/login\?return_to=/);assert.doesNotMatch(source,/\/signin-with-chatgpt/)}
});
test('new assignments require an explicit person and saved row editing retains their actual quantities',async()=>{
 const frame=globalThis.requestAnimationFrame,doc=globalThis.document;
 globalThis.requestAnimationFrame=()=>1;globalThis.document={getElementById:()=>null};
 try{const h=itemHarness();h.button('Assign a quantity to someone').props.onClick();h.render();assert.equal(h.input('participant').props.value,'');assert.equal(h.button('Save allocation').props.disabled,true);
 h.input('participant').props.onChange({target:{value:'named'}});h.render();assert.equal(h.input('quantity').props.value,'2');
 h.button('Save allocation').props.onClick();await Promise.resolve();await Promise.resolve();h.render();assert.deepEqual(h.actions,[{type:'allocate',roomId:'room-one',revision:4,itemId:'water',participantId:'named',quantity:2,packed:0}]);
 }finally{globalThis.requestAnimationFrame=frame;globalThis.document=doc}
});
test('mark packed persists exactly the selected person’s allocation with the current revision',async()=>{
 const frame=globalThis.requestAnimationFrame;globalThis.requestAnimationFrame=callback=>{callback();return 1};
 try{const h=itemHarness();await h.button('Mark my allocation packed').props.onClick();assert.deepEqual(h.actions,[{type:'allocate',roomId:'room-one',revision:4,itemId:'water',participantId:'me',quantity:4,packed:4}]);assert.equal(h.focusCount(),1)}finally{globalThis.requestAnimationFrame=frame}
});
