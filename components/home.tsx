"use client";

import {useRef, useState} from 'react';
import {ArrowUpRight,Globe2,Sparkles,Watch,Mountain,Trees,Waves,Sun,ShieldCheck,Search,X,MapPin,ChevronDown,Compass,Backpack,Route} from 'lucide-react';
import {useSite} from './site-shell';
import {TripLauncher} from './trip-launcher';
import {terrains} from '@/lib/terrain';
import {useCatalog} from '@/lib/catalog-client';
import {activeDestinations} from '@/lib/catalog-seed';
import {catalogCopy} from '@/lib/catalog-copy';
import {homeText} from '@/lib/home-explorer-copy';
import type {TerrainId} from '@/lib/toolkit-types';
import './home-explorer.css';

export const terrainIcons=[Sun,Mountain,Trees,Waves];
const normalize=(value:string)=>value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().trim();

export function Home(){
 const {t,tr,locale}=useSite(),{catalog,loading,error,refresh}=useCatalog(),h=(key:string)=>homeText(locale,key);
 const [query,setQuery]=useState(''),[filter,setFilter]=useState<TerrainId|'all'>('all');
 const search=useRef<HTMLInputElement>(null),destinations=activeDestinations(catalog),terms=normalize(query).split(/\s+/).filter(Boolean);
 const matches=destinations.filter(destination=>{
  if(filter!=='all'&&destination.terrainId!==filter)return false;
  const terrain=terrains.find(item=>item.id===destination.terrainId);
  const text=normalize([...destination.names,...destination.summary,...(terrain?.names??[]),destination.id].join(' '));
  return terms.every(term=>text.includes(term));
 });
 const reset=()=>{setQuery('');setFilter('all');search.current?.focus()};
 return <main id="main" className="home-explorer" dir={locale==='ar'?'rtl':'ltr'}>
  <section className="home-intro" aria-labelledby="home-title">
   <div className="home-intro-copy"><p className="home-eyebrow"><Compass size={17} aria-hidden="true"/>{h('eyebrow')}</p><h1 id="home-title">{h('title')}</h1><p className="home-intro-description">{h('intro')}</p><div className="home-intro-actions"><a className="home-primary" href="#home-destinations"><Search size={18} aria-hidden="true"/>{h('browse')}</a><a className="home-secondary" href="/globe"><Globe2 size={18} aria-hidden="true"/>{h('globe')}<ArrowUpRight className="home-direction" size={17} aria-hidden="true"/></a></div></div>
   <figure className="home-landscape"><img src="/images/mountain.jpg" alt="" width="1200" height="900" fetchPriority="high"/><div className="home-landscape-inset" aria-hidden="true"><img src="/images/desert.jpg" alt="" width="1200" height="900"/></div><figcaption><span className="home-photo-tag"><Mountain size={18} aria-hidden="true"/><span>{tr(terrains[1].names)}</span><span className="home-photo-divider" aria-hidden="true"/><Sun size={18} aria-hidden="true"/><span>{tr(terrains[0].names)}</span></span><span>{t('illustration')}</span></figcaption></figure>
  </section>

  <section className="home-destinations" aria-labelledby="home-destinations">
   <div className="home-section-head"><div><h2 id="home-destinations" tabIndex={-1}>{h('destinations')}</h2><p>{h('destinationsIntro')}</p></div><a className="home-inline-link" href="/globe"><Globe2 size={18} aria-hidden="true"/>{h('globe')}<ArrowUpRight className="home-direction" size={16} aria-hidden="true"/></a></div>
   <div className="home-search-panel"><label className="home-search-label" htmlFor="home-search">{h('search')}</label><div className="home-search-field"><Search size={20} aria-hidden="true"/><input ref={search} id="home-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={h('searchHint')} autoComplete="off" aria-controls="home-destination-results"/>{query&&<button type="button" aria-label={h('clearSearch')} onClick={()=>{setQuery('');search.current?.focus()}}><X size={19} aria-hidden="true"/></button>}</div><div className="home-filters" role="group" aria-label={h('filter')}><button type="button" aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>{h('all')}</button>{terrains.map((terrain,index)=>{const Icon=terrainIcons[index];return <button key={terrain.id} type="button" aria-pressed={filter===terrain.id} onClick={()=>setFilter(terrain.id as TerrainId)}><Icon size={17} aria-hidden="true"/>{tr(terrain.names)}</button>})}</div></div>
   <details className="home-planner"><summary><span className="home-planner-icon"><Route size={25} aria-hidden="true"/></span><span className="home-planner-copy"><strong>{h('ready')}</strong><span>{h('readyHint')}</span></span><span className="home-planner-label">{h('openPlanner')}<ChevronDown size={19} aria-hidden="true"/></span></summary><TripLauncher/></details>
   <div className="home-results-meta"><p role="status" aria-live="polite" aria-atomic="true">{h('results')}: <bdi>{new Intl.NumberFormat(locale).format(matches.length)} / {new Intl.NumberFormat(locale).format(destinations.length)}</bdi>{loading&&<span> · {tr(catalogCopy.loading)}</span>}</p></div>
   {error&&<div className="home-catalog-warning" role="status"><p>{tr(catalogCopy.fallback)}</p><button type="button" disabled={loading} onClick={()=>void refresh()}>{tr(catalogCopy.retry)}</button></div>}
   <div id="home-destination-results" className="home-destination-grid" aria-busy={loading}>
    {matches.map(destination=>{const index=terrains.findIndex(item=>item.id===destination.terrainId),terrain=terrains[index],Icon=terrainIcons[index],name=tr(destination.names),context=new URLSearchParams({destination:destination.id}).toString();return <article key={destination.id} className={'home-destination home-destination-'+destination.terrainId}><a className="home-destination-main" href={'/globe?'+context} aria-label={h('explorePlace')+': '+name}><div className="home-destination-top"><span className="home-destination-icon"><Icon size={21} aria-hidden="true"/></span><span className="home-destination-terrain">{tr(terrain.names)}</span><ArrowUpRight className="home-direction" size={17} aria-hidden="true"/></div><h3>{name}</h3><p>{tr(destination.summary)}</p></a><div className="home-destination-bottom"><span className="home-coordinate" aria-hidden="true"><MapPin size={13}/><bdi>{destination.lat.toFixed(1)}°, {destination.lon.toFixed(1)}°</bdi></span><a href={'/trips?'+context} aria-label={h('planPlace')+': '+name}><Backpack size={16} aria-hidden="true"/>{h('planPlace')}</a></div></article>})}
    {!matches.length&&<div className="home-empty"><Search size={28} aria-hidden="true"/><h3>{h('empty')}</h3><p>{h('emptyHint')}</p><div><button className="home-primary" type="button" onClick={reset}>{h('reset')}</button><a className="home-secondary" href="/globe">{h('globe')}<ArrowUpRight className="home-direction" size={17} aria-hidden="true"/></a></div></div>}
   </div>
  </section>

  <section className="home-terrains" aria-labelledby="home-terrain-title"><div className="home-section-head"><div><h2 id="home-terrain-title">{h('terrains')}</h2><p>{h('terrainsIntro')}</p></div></div><div className="home-terrain-grid">{terrains.map((terrain,index)=>{const Icon=terrainIcons[index];return <a className="home-terrain-card" href={`/regions?terrain=${index}`} key={terrain.id}><div className="home-terrain-photo"><img src={terrain.image} alt="" width="1200" height="900" loading="lazy"/><span><Icon size={22} aria-hidden="true"/></span></div><div className="home-terrain-content"><h3>{tr(terrain.names)}</h3><p>{tr(terrain.descriptions)}</p><span className="home-terrain-link">{h('terrainGuide')}<ArrowUpRight className="home-direction" size={18} aria-hidden="true"/></span></div></a>})}</div></section>

  <section className="home-tools" aria-labelledby="home-tools-title"><h2 id="home-tools-title">{h('support')}</h2><div className="home-tool-grid">{[{href:'/trips',title:'saved',body:'savedHint',Icon:Backpack},{href:'/assistant',title:'assistant',body:'assistantHint',Icon:Sparkles},{href:'/health',title:'health',body:'healthHint',Icon:Watch}].map(({href,title,body,Icon})=><a className="home-tool" key={href} href={href}><span className="home-tool-icon"><Icon size={22} aria-hidden="true"/></span><div><h3>{h(title)}<ArrowUpRight className="home-direction" size={17} aria-hidden="true"/></h3><p>{h(body)}</p></div></a>)}</div></section>
  <div className="home-safety"><ShieldCheck size={19} aria-hidden="true"/><p>{t('safety')}</p></div>
 </main>;
}
