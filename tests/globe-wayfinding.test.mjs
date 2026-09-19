import test from 'node:test';
import assert from 'node:assert/strict';
import {createLoader} from './helpers/load-ts.mjs';

const load=createLoader(),{seedCatalog}=load('lib/catalog-seed.ts');
const {selectionQuery}=load('lib/explorer-location.ts');
const {globeDashboardWords,globeText}=load('lib/globe-dashboard-copy.ts');
const locales=['ar','en','fr','zh','hi'];
function elements(node,predicate){
 if(Array.isArray(node))return node.flatMap(child=>elements(child,predicate));
 if(!node||typeof node!=='object')return[];
 return [...(predicate(node)?[node]:[]),...elements(node.props?.children,predicate)];
}
function text(node){if(Array.isArray(node))return node.map(text).join('');if(typeof node==='string'||typeof node==='number')return String(node);return node&&typeof node==='object'?text(node.props?.children):''}
function harness(locale='en',initial=seedCatalog.destinations[0]){
 const slots=[];let cursor=0,tree,selection={destinationId:initial.id??null,terrainId:initial.terrainId,lat:initial.lat,lon:initial.lon};
 const hooks={useRef(value){const index=cursor++;return slots[index]??(slots[index]={current:value})},useState(value){const index=cursor++;if(!(index in slots))slots[index]=value;return[slots[index],next=>{slots[index]=typeof next==='function'?next(slots[index]):next}]}};
 const component=createLoader({react:hooks,'./explorer.css':{},'./globe-dashboard.css':{},
  './site-shell':{useSite:()=>({locale,reduced:true,t:key=>key,tr:values=>values[locales.indexOf(locale)]})},
  '@/lib/catalog-client':{useCatalog:()=>({catalog:seedCatalog,loading:false})},
  './use-explorer-selection':{useExplorerSelection:()=>({selection,resolved:true,invalidLink:false,choose:next=>{selection=next}})},
  './explorer-panel':{DestinationSearch:'destination-search',ExplorerActions:'explorer-actions'},
  './globe-surface':{GlobeSurface:'globe-surface'},'./globe-weather':{GlobeWeather:'globe-weather'},
  './region-report':{TerrainPicker:'terrain-picker',RegionReport:'region-report'},'./weather':{Weather:'weather-detail'},
  '@/components/ui/dialog':Object.fromEntries(['Dialog','DialogContent','DialogTitle','DialogDescription','DialogClose'].map(name=>[name,name])),
 })('components/globe-view.tsx').GlobeView;
 const render=()=>{cursor=0;tree=component();return tree};render();
 return{render,find:predicate=>elements(tree,predicate),selection:()=>selection};
}

test('each locale keeps three visible primary topics and an explicitly labeled secondary group',()=>{
 for(const locale of locales){const h=harness(locale),g=key=>globeText(locale,key);
  assert.equal(h.find(n=>n.type==='main')[0].props.dir,locale==='ar'?'rtl':'ltr');
  const groups=h.find(n=>n.props?.className==='orb-topics');
  assert.deepEqual(elements(groups[0],n=>n.type==='button').map(text),['overview','equipment','visit'].map(g));
  assert.deepEqual(elements(groups[1],n=>n.type==='button').map(text),['nature','safety','season'].map(g));
  const more=h.find(n=>n.props?.className==='orb-more-topics orb-disclosure')[0];
  assert.equal(more.props.open,undefined);
  assert.equal(text(elements(more,n=>n.type==='summary')[0]),g('moreDetails'));
  for(const key of ['journey','stepChoose','stepExplore','stepPrepare','moreDetails','saveShare','coordinatesTerrain','controlHint'])assert.ok(globeDashboardWords[key][locales.indexOf(locale)].trim());
 }
});

test('wayfinding moves keyboard focus and scroll position while respecting reduced motion',()=>{
 const h=harness(),events=[];
 const search=h.find(n=>n.props?.className==='orb-card orb-search-card')[0];
 const briefing=h.find(n=>n.props?.className==='orb-briefing orb-side')[0];
 for(const [name,panel]of[['choose',search],['explore',briefing]])panel.props.ref.current={focus:options=>events.push([name,'focus',options]),scrollIntoView:options=>events.push([name,'scroll',options])};
 const journey=h.find(n=>n.props?.className==='orb-journey')[0];
 for(const button of elements(journey,n=>n.type==='button'))button.props.onClick();
 assert.deepEqual(events,[['choose','focus',{preventScroll:true}],['choose','scroll',{behavior:'instant',block:'start'}],['explore','focus',{preventScroll:true}],['explore','scroll',{behavior:'instant',block:'start'}]]);
 assert.equal(search.props.tabIndex,-1);assert.equal(briefing.props.tabIndex,-1);
});

test('secondary topic selection keeps its title visible and exposes the selected guide content',()=>{
 const h=harness(),more=h.find(n=>n.props?.className==='orb-more-topics orb-disclosure')[0];
 elements(more,n=>n.type==='button'&&text(n)==='Nature')[0].props.onClick();h.render();
 assert.match(text(h.find(n=>n.props?.className==='orb-more-topics orb-disclosure')[0]),/More: nature, precautions & season · Nature/);
 assert.equal(text(h.find(n=>n.props?.id==='orb-topic-title')[0]),'Nature');
 assert.equal(h.find(n=>n.type==='button'&&n.props?.['aria-pressed']===true).length,1);
 assert.ok(h.find(n=>n.props?.className==='orb-species').length);
 const equipment=h.find(n=>n.type==='button'&&text(n)==='Equipment')[0];equipment.props.onClick();h.render();
 assert.equal(text(h.find(n=>n.props?.id==='orb-topic-title')[0]),'Equipment');
 assert.equal(h.find(n=>n.props?.className==='orb-current-topic').length,0);
});

test('prepare actions follow each globe selection and preserve arbitrary-point context',()=>{
 const h=harness();const selections=[seedCatalog.destinations[12],{terrainId:'mountain',lat:14.125,lon:41.5}];
 for(const place of selections){const next={destinationId:place.id??null,terrainId:place.terrainId,lat:place.lat,lon:place.lon};
  h.find(n=>n.type==='globe-surface')[0].props.onChoose(next);h.render();
  const plans=h.find(n=>n.type==='a'&&n.props?.href?.startsWith('/trips?'));
  assert.equal(plans.length,2);for(const link of plans)assert.equal(link.props.href,'/trips?'+selectionQuery(next));
  assert.deepEqual(h.find(n=>n.type==='explorer-actions')[0].props.selection,next);
  assert.deepEqual(h.find(n=>n.type==='globe-weather')[0].props,{lat:next.lat,lon:next.lon});
  const report=h.find(n=>n.type==='region-report')[0];assert.equal(report.props.destinationId,place.id);
  if(!place.id){assert.deepEqual(report.props.point,next);assert.equal(h.find(n=>n.type==='terrain-picker').length,1);assert.equal(h.find(n=>n.props?.className==='orb-species').length,0)}
 }
});

test('report and weather dialogs restore focus to the exact button that opened them',()=>{
 const h=harness();for(const className of ['orb-report-button','orb-text-button']){
  const button=h.find(n=>n.props?.className===className)[0];let focused=0,prevented=0;
  button.props.onClick({currentTarget:{focus:()=>focused++}});h.render();
  const dialogClass=className==='orb-report-button'?'orb-report-dialog':'orb-weather-dialog';
  h.find(n=>n.type==='DialogContent'&&n.props.className===dialogClass)[0].props.onCloseAutoFocus({preventDefault:()=>prevented++});
  assert.equal(focused,1);assert.equal(prevented,1);
 }
});

test('weather remains outside disclosures while saved actions and coordinate details remain available',()=>{
 const h=harness(),details=h.find(n=>n.type==='details');
 assert.equal(details.flatMap(n=>elements(n,child=>child.type==='globe-weather')).length,0);
 const saved=details.find(n=>n.props.className==='orb-saved orb-disclosure');
 assert.equal(elements(saved,n=>n.type==='explorer-actions').length,1);
 const coordinates=details.find(n=>n.props.className==='orb-coordinate-details orb-disclosure');
 assert.equal(elements(coordinates,n=>n.type==='bdi').length,2);
 assert.equal(h.find(n=>n.type==='globe-surface').length,1);
});

test('suggested prompt questions name the place in every locale and map to real assistant topics',()=>{
 const {suggestedQuestions,suggestedQuestion}=load('lib/globe-dashboard-copy.ts');
 const {assistantTopics}=load('lib/assistant-guide.ts');
 assert.equal(suggestedQuestions.length,6);
 for(const [key,topic] of suggestedQuestions){
  assert.ok(assistantTopics.includes(topic),`${topic} is an assistant topic`);
  assert.equal(globeDashboardWords[key].length,5,`${key} has five locales`);
  for(const locale of locales){const text=suggestedQuestion(locale,key,'Jebel Jais');assert.ok(text.includes('Jebel Jais')&&!text.includes('{place}'),`${locale}/${key}: ${text}`);}
 }
 assert.equal(globeDashboardWords.gestureHint.length,5);
 assert.equal(globeDashboardWords.suggestions.length,5);
});
