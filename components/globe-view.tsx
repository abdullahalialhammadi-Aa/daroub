"use client";
import {useRef,useState} from 'react';
import {Compass,MapPin,ArrowUpRight,BookOpen,Backpack,Leaf,ShieldCheck,Route,CalendarDays,Layers3,X,CloudSun,Globe2,ExternalLink} from 'lucide-react';
import {useSite} from './site-shell';
import {useCatalog} from '@/lib/catalog-client';
import {catalogDestination,catalogGuidance,catalogSources} from '@/lib/catalog-seed';
import {terrains} from '@/lib/terrain';
import {terrainIdAt,terrainIndex,selectionQuery} from '@/lib/explorer-location';
import type {ExplorerSelection} from '@/lib/explorer-location';
import {explorerCopy} from '@/lib/explorer-copy';
import {globeText} from '@/lib/globe-dashboard-copy';
import {prepText} from '@/lib/preparation-copy';
import {useExplorerSelection} from './use-explorer-selection';
import {DestinationSearch,ExplorerActions} from './explorer-panel';
import {GlobeSurface} from './globe-surface';
import {GlobeWeather} from './globe-weather';
import {TerrainPicker,RegionReport} from './region-report';
import {Weather} from './weather';
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';
import './explorer.css';
import './globe-dashboard.css';

const mainTopics=[['overview',Layers3],['equipment',Backpack],['visit',Route]] as const;
const moreTopics=[['nature',Leaf],['safety',ShieldCheck],['season',CalendarDays]] as const;
type Topic=typeof mainTopics[number][0]|typeof moreTopics[number][0];
export function GlobeView(){
 const {catalog,loading}=useCatalog(),{t,tr,locale,reduced}=useSite(),g=(key:string)=>globeText(locale,key);
 const {selection,choose,invalidLink,resolved}=useExplorerSelection();
 const reportTrigger=useRef<HTMLButtonElement>(null),weatherTrigger=useRef<HTMLButtonElement>(null);
 const searchPanel=useRef<HTMLElement>(null),planetPanel=useRef<HTMLElement>(null),briefingPanel=useRef<HTMLElement>(null);
 function moveTo(panel:HTMLElement|null){panel?.focus({preventScroll:true});panel?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'})}
 function selectDestination(next:ExplorerSelection){choose(next);if(window.matchMedia('(max-width:700px)').matches){planetPanel.current?.focus({preventScroll:true});planetPanel.current?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'})}}
 const [topic,setTopic]=useState<Topic>('overview'),[report,setReport]=useState(false),[weather,setWeather]=useState(false);
 const destination=catalogDestination(catalog,selection.destinationId),index=terrainIndex(selection.terrainId),terrain=terrains[index],guidance=catalogGuidance(catalog,selection.terrainId);
 const title=destination?tr(destination.names):t('selectedPoint'),context=selectionQuery(selection),key=topic==='overview'?'place':topic==='safety'?'hazard':topic;
 const chapter=destination?.sections.find(s=>s.id===key)??(topic==='overview'?guidance.sections.find(s=>s.id==='deeper'):guidance.sections.find(s=>s.id===key));
 const sourceIds=[...new Set([...(chapter?.sourceIds??[]),...(topic==='nature'?destination?.species.flatMap(species=>species.sourceIds)??[]:[])])],ready=resolved&&!loading;
 return <main id="main" className="orbital-page" dir={locale==='ar'?'rtl':'ltr'}>
  <div className="orb-heading"><div><span className="orb-kicker"><Compass size={16} aria-hidden="true"/> DAROUB / EXPLORE</span><h1>{g('explorer')}</h1></div><p>{g('selectionHint')}</p><a className="orb-header-link" href="/regions"><BookOpen size={18} aria-hidden="true"/>{g('fieldGuide')}<ArrowUpRight size={16} aria-hidden="true"/></a></div>
  {invalidLink&&<p className="orb-notice" role="status">{tr(explorerCopy.invalidLink)}</p>}
  {!ready?<div className="orb-initial" role="status" aria-busy="true"><Globe2 size={52} aria-hidden="true"/><p>{t('load')}</p></div>:<>
  <nav className="orb-journey" aria-label={g('journey')}><ol>
   <li><button type="button" onClick={()=>moveTo(searchPanel.current)}><span className="orb-step-number" aria-hidden="true">1</span><span><strong>{g('stepChoose')}</strong><small>{g('stepChooseHint')}</small></span><MapPin size={19} aria-hidden="true"/></button></li>
   <li><button type="button" onClick={()=>moveTo(briefingPanel.current)}><span className="orb-step-number" aria-hidden="true">2</span><span><strong>{g('stepExplore')}</strong><small>{g('stepExploreHint')}</small></span><Compass size={19} aria-hidden="true"/></button></li>
   <li><a href={'/trips?'+context}><span className="orb-step-number" aria-hidden="true">3</span><span><strong>{g('stepPrepare')}</strong><small>{g('stepPrepareHint')}</small></span><ArrowUpRight size={19} aria-hidden="true"/></a></li>
  </ol></nav><div className="orb-grid">
   <aside className="orb-discover orb-side" aria-label={g('destinations')}>
    <section ref={searchPanel} tabIndex={-1} className="orb-card orb-search-card"><div className="orb-card-heading"><MapPin size={18} aria-hidden="true"/><h2>{g('destinations')}</h2><span className="orb-count">{catalog.destinations.filter(d=>!d.archived).length}</span></div><DestinationSearch selection={selection} onChoose={selectDestination}/></section>
    <section className="orb-card orb-weather-card"><GlobeWeather key={`${selection.lat},${selection.lon}`} lat={selection.lat} lon={selection.lon}/><button className="orb-text-button" onClick={event=>{weatherTrigger.current=event.currentTarget;setWeather(true)}}><CloudSun size={17} aria-hidden="true"/>{g('fullWeather')}<ArrowUpRight size={16} aria-hidden="true"/></button></section>
    <details className="orb-saved orb-disclosure"><summary>{g('saveShare')}</summary><div><ExplorerActions selection={selection} showPlan={false}/></div></details>
   </aside>
   <section ref={planetPanel} tabIndex={-1} className="orb-planet" aria-label={g('satellite')}>
    <div className="orb-planet-top"><span><Globe2 size={16} aria-hidden="true"/>{g('satellite')}</span><span className="orb-coordinate-label" dir="ltr">{selection.lat.toFixed(2)}° / {selection.lon.toFixed(2)}°</span></div>
    <GlobeSurface selection={selection} onChoose={choose}/>
    <p className="orb-control-hint">{g('controlHint')}</p>
    <div className="orb-location-bar"><span className="orb-location-icon"><MapPin size={21} aria-hidden="true"/></span><div><small>{g('selected')}</small><h2>{title}</h2></div><button aria-label={g('report')+': '+title} onClick={event=>{reportTrigger.current=event.currentTarget;setReport(true)}}><ArrowUpRight size={21} aria-hidden="true"/></button></div>
    <details className="orb-coordinate-details orb-disclosure"><summary>{g('coordinatesTerrain')}</summary><div className="orb-coordinates"><div><span>{g('lat')}</span><bdi>{selection.lat.toFixed(3)}°</bdi></div><div><span>{g('lon')}</span><bdi>{selection.lon.toFixed(3)}°</bdi></div><div><span>{g('terrain')}</span><strong>{tr(terrain.names)}</strong></div></div></details>
    <p className="orb-marker-note">{destination?g('marker'):g('generic')}</p>
    {!destination&&<div className="orb-terrain-picker"><span>{t('chooseTerrain')}</span><TerrainPicker index={index} onChange={next=>choose({...selection,terrainId:terrainIdAt(next)})}/></div>}
   </section>
   <aside ref={briefingPanel} tabIndex={-1} className="orb-briefing orb-side" aria-label={g('briefing')}>
    <section className="orb-card orb-place-card"><div className="orb-place-image"><img src={destination?.image??terrain.image} alt=""/><span>{t('illustration')}</span></div><div className="orb-place-heading"><span className="orb-terrain-tag"><Layers3 size={14} aria-hidden="true"/>{tr(terrain.names)}</span><h2>{title}</h2><p>{destination?tr(destination.summary):g('noLocal')}</p></div>
    <div className="orb-topic-picker"><div className="orb-topics" role="group" aria-label={g('briefing')}>{mainTopics.map(([id,Icon])=><button key={id} type="button" aria-pressed={topic===id} aria-controls="orb-topic-content" onClick={()=>setTopic(id)}><Icon size={18} aria-hidden="true"/>{g(id)}</button>)}</div>
    <details className="orb-more-topics orb-disclosure"><summary>{g('moreDetails')}{moreTopics.some(([id])=>id===topic)&&<span className="orb-current-topic"> · {g(topic)}</span>}</summary><div className="orb-topics" role="group" aria-label={g('moreDetails')}>{moreTopics.map(([id,Icon])=><button key={id} type="button" aria-pressed={topic===id} aria-controls="orb-topic-content" onClick={()=>setTopic(id)}><Icon size={18} aria-hidden="true"/>{g(id)}</button>)}</div></details></div>
    <div id="orb-topic-content" className="orb-topic-content" role="region" aria-labelledby="orb-topic-title"><h3 id="orb-topic-title">{g(topic)}</h3>{chapter?<p>{tr(chapter.body)}</p>:<p>{g('noLocal')}</p>}
     {topic==='nature'&&destination?.species.length? <ul className="orb-species">{destination.species.map(species=><li key={species.id}><strong>{tr(species.name)}</strong><span>{prepText(locale,species.coverage==='local'?'localCoverage':'exampleCoverage')}</span><p>{tr(species.description)}</p><p>{tr(species.precaution)}</p></li>)}</ul>:null}
     {sourceIds.length>0&&<details className="orb-sources" key={`${destination?.id??'point'}-${topic}`}><summary>{g('sources')} <span>{sourceIds.length}</span></summary>{catalogSources(catalog,sourceIds).map(source=><a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink size={13} aria-hidden="true"/><time dateTime={source.reviewedAt}>{source.reviewedAt}</time></a>)}</details>}
    </div><div className="orb-brief-actions"><a href={'/trips?'+context} className="orb-plan"><Backpack size={18} aria-hidden="true"/>{g('plan')}<ArrowUpRight size={18} aria-hidden="true"/></a><button className="orb-report-button" onClick={event=>{reportTrigger.current=event.currentTarget;setReport(true)}}><BookOpen size={18} aria-hidden="true"/>{g('report')}</button></div></section>
   </aside>
  </div>
  <p className="sr-only" role="status" aria-atomic="true">{g('selected')}: {title}. {selection.lat.toFixed(3)}, {selection.lon.toFixed(3)}. {tr(terrain.names)}</p>
  </>}
  <Dialog open={report} onOpenChange={setReport}><DialogContent showCloseButton={false} className="orb-report-dialog" onCloseAutoFocus={event=>{event.preventDefault();reportTrigger.current?.focus()}} dir={locale==='ar'?'rtl':'ltr'}><DialogTitle>{g('report')} · {title}</DialogTitle><DialogDescription>{destination?g('marker'):g('generic')}</DialogDescription><DialogClose className="dialog-x" aria-label={g('close')}><X size={20}/></DialogClose><div className="orb-modal-scroll"><RegionReport index={index} point={destination?undefined:selection} destinationId={destination?.id}/></div></DialogContent></Dialog>
  <Dialog open={weather} onOpenChange={setWeather}><DialogContent showCloseButton={false} className="orb-weather-dialog" onCloseAutoFocus={event=>{event.preventDefault();weatherTrigger.current?.focus()}} dir={locale==='ar'?'rtl':'ltr'}><DialogTitle>{g('fullWeather')} · {title}</DialogTitle><DialogDescription><bdi>{selection.lat.toFixed(3)}°, {selection.lon.toFixed(3)}°</bdi></DialogDescription><DialogClose className="dialog-x" aria-label={g('close')}><X size={20}/></DialogClose><div className="orb-modal-scroll"><Weather lat={selection.lat} lon={selection.lon}/></div></DialogContent></Dialog>
 </main>;
}


