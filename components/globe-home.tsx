'use client';
import {useEffect,useRef,useState} from 'react';
import {Send,Menu,X,Sparkles,ArrowUpRight,Backpack,Leaf,ShieldCheck,CloudSun,BookOpen,Clock,Users,Sun,Mountain,Trees,Waves,RotateCcw} from 'lucide-react';
import {useSite} from './site-shell';
import {useCatalog} from '@/lib/catalog-client';
import {activeDestinations,catalogDestination} from '@/lib/catalog-seed';
import {terrains} from '@/lib/terrain';
import {suggestedGroupSize} from '@/lib/group-size';
import {terrainIndex,selectionQuery,type ExplorerSelection} from '@/lib/explorer-location';
import {globeText} from '@/lib/globe-dashboard-copy';
import {explorerCopy} from '@/lib/explorer-copy';
import {companionText} from '@/lib/companion-i18n';
import {assistantSource,retrieveGuide,type AssistantRequest,type AssistantTopic} from '@/lib/assistant-guide';
import {fetchWeatherPart} from '@/lib/weather-client';
import {weatherIsStale,type ExplorerWeatherResult} from '@/lib/explorer-weather';
import {getSession} from '@/lib/trip-store';
import type {AIProviderId,AIProviderSummary} from '@/lib/ai-providers';
import type {AssistantAnswer,CatalogSnapshot,SessionInfo} from '@/lib/toolkit-types';
import {useExplorerSelection} from './use-explorer-selection';
import {GlobeSurface} from './globe-surface';
import {AreaView} from './area-view';
import {Weather} from './weather';
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';
import './explorer.css';
import './globe-dashboard.css';
import './globe-home.css';

interface Turn{question:string;answer:AssistantAnswer;catalog:CatalogSnapshot}
type Family='weather'|'clock'|'terrain'|'equipment'|'nature'|'precautions'|'group'|'book';
interface Chip{family:Family;Icon:typeof Sun;value:string;label:string;topic?:AssistantTopic;href?:string;muted?:boolean}
const normalize=(value:string)=>value.normalize('NFKC').toLowerCase().replace(/[ً-ٰٟ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}\s·]/gu,' ').replace(/\s+/g,' ').trim();
const terrainIcons={desert:Sun,mountain:Mountain,forest:Trees,coast:Waves} as const;

/** The globe core: the globe is the page, one prompt drives the cited guide assistant, and a selected place is briefed by floating icons. */
export function GlobeHome(){
 const {locale,t,tr}=useSite(),{catalog}=useCatalog(),g=(key:string)=>globeText(locale,key),c=(key:string)=>companionText(locale,key);
 const {selection,choose,resolved}=useExplorerSelection();
 const [question,setQuestion]=useState(''),[turn,setTurn]=useState<Turn|null>(null),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
 const [providers,setProviders]=useState<AIProviderSummary[]>([]),[brain,setBrain]=useState<AIProviderId|''>(''),[brainOpen,setBrainOpen]=useState(false),[chrome,setChrome]=useState(false);
 const [weather,setWeather]=useState<{key:string;data:ExplorerWeatherResult|null;failed:boolean}>({key:'',data:null,failed:false}),[weatherOpen,setWeatherOpen]=useState(false);
 const [clock,setClock]=useState(()=>Date.now()),[ring,setRing]=useState({w:0,h:0}),[locked,setLocked]=useState(false),[viewReset,setViewReset]=useState(0),[terrainOpen,setTerrainOpen]=useState(false);
 // A user-driven selection locks the globe on the place (the surface zooms in and stops); the reset control releases it.
 const pick=(next:ExplorerSelection)=>{setLocked(true);choose(next);};
 const sessionRef=useRef<SessionInfo|null>(null),requestRef=useRef<AbortController|null>(null),inputRef=useRef<HTMLInputElement>(null),stageRef=useRef<HTMLDivElement>(null),weatherTrigger=useRef<HTMLButtonElement>(null);
 const destination=catalogDestination(catalog,selection.destinationId),index=terrainIndex(selection.terrainId),terrain=terrains[index];
 const title=destination?tr(destination.names):t('selectedPoint'),context=selectionQuery(selection);
 const weatherKey=`${selection.lat.toFixed(3)},${selection.lon.toFixed(3)}`;
 useEffect(()=>{let active=true;void getSession().then(user=>{if(active)sessionRef.current=user;}).catch(()=>{});
  fetch('/api/assistant',{credentials:'same-origin'}).then((r):Promise<{providers?:AIProviderSummary[]}>=>r.ok?r.json():Promise.resolve({providers:[]})).then(data=>{if(active)setProviders(Array.isArray(data.providers)?data.providers:[]);}).catch(()=>{if(active)setProviders([]);});
  const tick=setInterval(()=>setClock(Date.now()),60_000),onPop=()=>setLocked(true);window.addEventListener('popstate',onPop);
  return()=>{active=false;clearInterval(tick);window.removeEventListener('popstate',onPop);requestRef.current?.abort();};},[]);
 // Live current weather for the selected point (one small request; stale copies are flagged, never invented).
 useEffect(()=>{if(!resolved)return;const controller=new AbortController();
  fetchWeatherPart(selection.lat,selection.lon,'current',controller.signal).then(data=>{if(!controller.signal.aborted)setWeather({key:weatherKey,data,failed:false});}).catch(()=>{if(!controller.signal.aborted)setWeather({key:weatherKey,data:null,failed:true});});
  return()=>controller.abort();},[weatherKey,selection.lat,selection.lon,resolved]);
 // The floating icons orbit the stage centre, where the locked place sits.
 useEffect(()=>{const el=stageRef.current;if(!el)return;const ro=new ResizeObserver(()=>setRing({w:el.clientWidth,h:el.clientHeight}));ro.observe(el);return()=>ro.disconnect();},[resolved]);
 useEffect(()=>{document.body.classList.toggle('gc-chrome-open',chrome);return()=>{document.body.classList.remove('gc-chrome-open');};},[chrome]);
 useEffect(()=>{if(!chrome&&!brainOpen&&!terrainOpen)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setChrome(false);setBrainOpen(false);setTerrainOpen(false);}};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[chrome,brainOpen,terrainOpen]);
 function mentioned(text:string){
  const q=normalize(text);if(q.length<3)return null;
  const strip=(w:string)=>w.replace(/^(و|ف|ب|ل|ك|لل|بال|وال|فال|ال)/,'');
  const words=new Set(q.split(' ').map(strip).filter(w=>w.length>=3));
  const items=activeDestinations(catalog);
  for(const item of items)for(const name of item.names){const full=normalize(name);if(full&&q.includes(full))return item;}
  const generic=new Set(['oasis','coast','park','lakes','mountain','national','united','states','واحه','ساحل','منتزه','بحيرات','جبل','وادي','قرم','الولايات','المتحده']);
  const hits=items.filter(item=>item.names.some(name=>normalize(name).split(/[\s·]+/).map(strip).some(w=>w.length>=3&&!generic.has(w)&&words.has(w))));
  return hits.length===1?hits[0]:null;
 }
 async function ask(text:string,topic?:AssistantTopic){
  if(busy||!text.trim())return;
  let target:ExplorerSelection=selection;
  const hit=topic?null:mentioned(text);
  if(hit&&hit.id!==selection.destinationId){target={destinationId:hit.id,terrainId:hit.terrainId,lat:hit.lat,lon:hit.lon};choose(target,true);setLocked(true);}
  const targetDestination=catalogDestination(catalog,target.destinationId);
  const input:AssistantRequest={question:text.trim().slice(0,1500),locale,destinationId:targetDestination?.id??null,terrainIndex:terrainIndex(target.terrainId),topic,useAI:!!brain,provider:brain||undefined};
  setBusy(true);setStatus('');setQuestion('');
  const controller=new AbortController();requestRef.current?.abort();requestRef.current=controller;
  let result:AssistantAnswer;let local=false;
  try{const owner=sessionRef.current?.userId;const response=await fetch('/api/assistant',{method:'POST',credentials:'same-origin',signal:controller.signal,headers:{'Content-Type':'application/json',...(owner?{'X-Daroub-Account':owner}:{})},body:JSON.stringify(input)});if(!response.ok)throw Error('offline');result=await response.json() as AssistantAnswer;}
  catch{if(controller.signal.aborted)return;result=retrieveGuide(input,catalog);local=true;}
  if(requestRef.current!==controller)return;
  setTurn({question:input.question,answer:result,catalog});
  if(local)setStatus('fallback');else if(result.fallbackReason)setStatus('ai-'+result.fallbackReason);
  setBusy(false);requestRef.current=null;
 }
 // quick-overview data per icon family
 const live=weather.key===weatherKey?weather:null;
 const localTime=(()=>{const zone=destination?.timezone??live?.data?.timezone;if(!zone)return null;try{return new Intl.DateTimeFormat(locale,{hour:'2-digit',minute:'2-digit',timeZone:zone}).format(clock);}catch{return null;}})();
 const temperature=live?.data?.current?.temperature_2m;
 const weatherValue=!live?'…':typeof temperature==='number'?`${Math.round(temperature)}°`:'—';
 const weatherStale=!!live?.data&&weatherIsStale(live.data,clock);
 const rules=catalog.packingRules.filter(rule=>rule.terrainIds.includes(selection.terrainId)).length;
 const species=destination?.species.length??0,sections=destination?.sections.length??0,group=suggestedGroupSize(selection.terrainId,destination);
 const chips:Chip[]=[
  {family:'weather',Icon:CloudSun,value:weatherValue,label:g('liveWeather')+(weatherStale?' · '+t('stale'):''),muted:weatherValue==='—'},
  {family:'clock',Icon:Clock,value:localTime??'—',label:t('location'),muted:!localTime},
  {family:'terrain',Icon:terrainIcons[selection.terrainId]??Sun,value:tr(terrain.names),label:g('terrain'),topic:'terrain'},
  {family:'equipment',Icon:Backpack,value:String(rules),label:g('equipment'),topic:'equipment'},
  {family:'nature',Icon:Leaf,value:destination?String(species):'·',label:g('nature'),topic:'nature'},
  {family:'precautions',Icon:ShieldCheck,value:'!',label:g('safety'),topic:'precautions'},
  {family:'group',Icon:Users,value:group+'+',label:g('groupSuggested'),topic:'group'},
  {family:'book',Icon:BookOpen,value:destination?String(sections):'·',label:g('guide'),href:destination?'/fieldbook?destination='+encodeURIComponent(destination.id):'/regions?terrain='+index},
 ];
 const radius=Math.min(ring.w,ring.h)*0.36,ringMode=ring.w>=700&&radius>150;
 function open(chip:Chip){if(chip.family==='weather'){setWeatherOpen(true);return;}if(chip.family==='clock')return;if(chip.family==='terrain'){setTerrainOpen(v=>!v);return;}if(chip.topic)void ask(c(chip.topic==='precautions'?'precautions':chip.topic),chip.topic);}
 // Terrain is a lens on the selected point: the place stays, its guidance (equipment rules, assistant topic) follows the chosen landscape.
 function chooseTerrain(id:ExplorerSelection['terrainId']){setTerrainOpen(false);if(id!==selection.terrainId)choose({...selection,terrainId:id});}
 const brainLabel=brain?(providers.find(item=>item.id===brain)?.label??brain):c('guideMode');
 return <main id="main" className="orbital-page globe-core" dir={locale==='ar'?'rtl':'ltr'}>
  <button type="button" className="gc-menu" aria-expanded={chrome} aria-controls="gc-chrome-note" aria-label={t('home')} onClick={()=>setChrome(open=>!open)}>{chrome?<X size={20} aria-hidden/>:<Menu size={20} aria-hidden/>}</button>
  {locked&&<button type="button" className="gc-reset" onClick={()=>{stageRef.current?.querySelector<HTMLElement>('.globe-canvas')?.focus({preventScroll:true});setLocked(false);setViewReset(n=>n+1);}} aria-label={tr(explorerCopy.resetGlobe)}><RotateCcw size={18} aria-hidden/><span>{tr(explorerCopy.resetGlobe)}</span></button>}
  <span id="gc-chrome-note" className="sr-only">{t('home')} · {t('regions')} · {t('globe')}</span>
  <div className="gc-stage"><div className="gc-stage-inner" ref={stageRef}>
   {resolved?<GlobeSurface selection={selection} onChoose={pick} locked={locked} viewReset={viewReset}/>:<p className="globe-loading" role="status">{t('load')}</p>}
   {resolved&&locked&&<AreaView lat={selection.lat} lon={selection.lon} label={g('areaView')+' · '+title} terrainId={selection.terrainId} species={destination?.species??[]} onTopic={(topic,text)=>void ask(text,topic)} destinations={activeDestinations(catalog)} selectedId={selection.destinationId} onPick={point=>pick({destinationId:null,terrainId:selection.terrainId,lat:point.lat,lon:point.lon})} onPickDestination={item=>pick({destinationId:item.id,terrainId:item.terrainId,lat:item.lat,lon:item.lon})}/>}
   {resolved&&!turn&&!busy&&<div className={'gc-float-layer'+(ringMode?' gc-ring':' gc-row')} role="group" aria-label={g('summary')+' · '+title}>
    <p className="gc-float-title"><span>{title}</span>{destination&&<small>{tr(destination.summary)}</small>}</p>
    {chips.map((chip,i)=>{const angle=(-90+i*(360/chips.length))*Math.PI/180;const style=ringMode?{left:`calc(50% + ${Math.round(Math.cos(angle)*radius)}px)`,top:`calc(50% + ${Math.round(Math.sin(angle)*radius)}px)`}:undefined;
     const inner=<><chip.Icon size={18} aria-hidden/><b>{chip.value}</b><span>{chip.label}</span></>;
     return chip.href?<a key={chip.family} className={'gc-float gc-'+chip.family} style={style} href={chip.href} title={chip.label}>{inner}</a>
      :<button key={chip.family} ref={chip.family==='weather'?weatherTrigger:undefined} type="button" className={'gc-float gc-'+chip.family+(chip.muted?' gc-muted':'')} style={style} onClick={()=>open(chip)} disabled={busy||chip.family==='clock'} aria-label={chip.label+': '+chip.value} title={chip.family==='terrain'?g('changeTerrain'):chip.label} aria-haspopup={chip.family==='terrain'?'listbox':undefined} aria-expanded={chip.family==='terrain'?terrainOpen:undefined}>{inner}</button>;})}
    {terrainOpen&&<ul className="gc-terrain-menu" role="listbox" aria-label={g('changeTerrain')}>
     {terrains.map(item=>{const I=terrainIcons[item.id as keyof typeof terrainIcons]??Sun;return <li key={item.id}><button type="button" role="option" aria-selected={item.id===selection.terrainId} onClick={()=>chooseTerrain(item.id as ExplorerSelection['terrainId'])}><I size={16} aria-hidden/><span>{tr(item.names)}</span></button></li>;})}
     <li className="gc-terrain-ask"><button type="button" onClick={()=>{setTerrainOpen(false);void ask(c('terrain'),'terrain');}}><Sparkles size={14} aria-hidden/><span>{g('askTerrain')}</span></button></li>
    </ul>}
   </div>}
  </div></div>
  <p className="sr-only" role="status" aria-atomic="true">{g('selected')}: {title}. {selection.lat.toFixed(3)}, {selection.lon.toFixed(3)}. {tr(terrain.names)}</p>
  {(turn||busy)&&<section className="gc-answer" aria-label={t('assistant')} lang={turn?.answer.locale} dir={(turn?.answer.locale??locale)==='ar'?'rtl':'ltr'}>
   <header className="gc-answer-head">
    <span className="gc-place">{turn?catalogDestination(turn.catalog,turn.answer.destinationId)?tr(catalogDestination(turn.catalog,turn.answer.destinationId)!.names):t('selectedPoint'):title}</span>
    <button type="button" className="gc-close" aria-label={t('close')} onClick={()=>{setTurn(null);setStatus('');}}><X size={18} aria-hidden/></button>
   </header>
   {busy&&<p className="gc-busy" role="status">{c('busy')}</p>}
   {turn&&<div className="gc-answer-body">
    <p className="gc-question">{turn.question}</p>
    {turn.answer.aiText&&<section className="companion-ai-draft"><h3>{companionText(turn.answer.locale,'aiMode')}{turn.answer.aiProvider?` · ${turn.answer.aiProvider.label}`:''}</h3><p className="subtle">{companionText(turn.answer.locale,'aiUnverified')}</p><p className="companion-answer">{turn.answer.aiText}</p></section>}
    <p className="gc-pill"><Sparkles size={14} aria-hidden/><span className="mode-pill">{companionText(turn.answer.locale,'guideMode')}</span></p>
    <p className="companion-answer">{turn.answer.text}</p>
    {turn.answer.sourceIds.length>0&&<details className="companion-sources"><summary>{companionText(turn.answer.locale,'sources')} ({turn.answer.sourceIds.length})</summary><ul>{turn.answer.sourceIds.map(id=>{const source=turn.answer.sources?.find(item=>item.id===id)??assistantSource(id,turn.catalog);return source?<li key={id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><small>{companionText(turn.answer.locale,'reviewed')}: {source.reviewedAt}</small></li>:null;})}</ul></details>}
    {status&&<p className="status-message" role="status">{c(status)}</p>}
    <a className="gc-plan" href={'/trips?'+context}>{g('plan')}<ArrowUpRight size={14} aria-hidden/></a>
   </div>}
  </section>}
  <form className="gc-prompt" onSubmit={e=>{e.preventDefault();void ask(question);}}>
   <div className="gc-brain">
    <button type="button" className="gc-chip" aria-haspopup="listbox" aria-expanded={brainOpen} aria-label={c('aiProvider')} onClick={()=>setBrainOpen(open=>!open)} disabled={providers.length===0&&!brain}>{brainLabel}</button>
    {brainOpen&&<ul className="gc-brain-list" role="listbox" aria-label={c('aiProvider')}>
     <li><button type="button" role="option" aria-selected={!brain} onClick={()=>{setBrain('');setBrainOpen(false);inputRef.current?.focus();}}>{c('guideMode')}</button></li>
     {providers.map(item=><li key={item.id}><button type="button" role="option" aria-selected={brain===item.id} onClick={()=>{setBrain(item.id);setBrainOpen(false);inputRef.current?.focus();}}>{item.label}<small>{item.model}</small></button></li>)}
     <li className="gc-brain-note">{c('aiProviderNote')}</li>
    </ul>}
   </div>
   <label htmlFor="gc-question" className="sr-only">{t('question')}</label>
   <input ref={inputRef} id="gc-question" value={question} onChange={e=>setQuestion(e.target.value)} placeholder={t('question')} maxLength={1500} required autoComplete="off" enterKeyHint="send"/>
   <button disabled={busy||!question.trim()} type="submit" className="gc-send" aria-label={t('send')}><Send size={20} aria-hidden/></button>
  </form>
  <Dialog open={weatherOpen} onOpenChange={setWeatherOpen}><DialogContent showCloseButton={false} className="orb-weather-dialog" onCloseAutoFocus={event=>{event.preventDefault();weatherTrigger.current?.focus();}} dir={locale==='ar'?'rtl':'ltr'}><DialogTitle>{g('fullWeather')} · {title}</DialogTitle><DialogDescription><bdi>{selection.lat.toFixed(3)}°, {selection.lon.toFixed(3)}°</bdi></DialogDescription><DialogClose className="dialog-x" aria-label={g('close')}><X size={20} aria-hidden/></DialogClose><div className="orb-modal-scroll">{weatherOpen&&<Weather lat={selection.lat} lon={selection.lon}/>}</div></DialogContent></Dialog>
 </main>;
}
