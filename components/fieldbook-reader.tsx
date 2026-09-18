'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,BookOpen,Download,FileText,MapPin,Printer,Save} from 'lucide-react';
import {useSite} from './site-shell';
import {useCatalog} from '@/lib/catalog-client';
import {catalogDestination,catalogGuidance,catalogSources} from '@/lib/catalog-seed';
import {catalogText} from '@/lib/catalog-copy';
import {terrains,translate,words,type Locale} from '@/lib/terrain';
import {parseCoordinates} from '@/lib/explorer-location';
import {fieldbookPdf} from '@/lib/fieldbook-editions';
import officialBooks from '@/lib/official-region-books.json';
import {fieldbookText} from '@/lib/fieldbook-copy';
import {prepText} from '@/lib/preparation-copy';
import {buildGuideHtml} from '@/lib/fieldbook';
import {saveGuide} from '@/lib/offline';
import type {CatalogSnapshot,Coordinates,TerrainId} from '@/lib/toolkit-types';
import './fieldbook-reader.css';

export type FieldbookChoice={destinationId?:string;terrainId:TerrainId;point?:Coordinates};
export function resolveFieldbookChoice(query:URLSearchParams,catalog:CatalogSnapshot):{choice:FieldbookChoice}|{error:'notFound'|'invalid'}{
 if(query.has('destination')){const destination=catalogDestination(catalog,query.get('destination'));return destination?{choice:{destinationId:destination.id,terrainId:destination.terrainId}}:{error:'notFound'}}
 const terrain=terrains.find(item=>item.id===query.get('terrainId')),hasCoordinates=query.has('lat')||query.has('lon');
 if(query.has('terrainId')||hasCoordinates){if(!terrain)return {error:'invalid'};const point=hasCoordinates?parseCoordinates(query.get('lat'),query.get('lon')):null;if(hasCoordinates&&!point)return {error:'invalid'};return {choice:{terrainId:terrain.id as TerrainId,...(point?{point}:{})}}}
 const destination=catalogDestination(catalog,'liwa');return destination?{choice:{destinationId:destination.id,terrainId:destination.terrainId}}:{error:'notFound'};
}
function Citations({catalog,ids,locale}:{catalog:CatalogSnapshot;ids:string[];locale:Locale}){
 return <ul className="fieldbook-citations">{catalogSources(catalog,ids).map(source=><li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={14} aria-hidden="true"/></a><span>{fieldbookText(locale,'reviewed')} <time dateTime={source.reviewedAt}>{source.reviewedAt}</time></span></li>)}</ul>;
}
export function FieldbookDocument({choice,catalog,locale}:{choice:FieldbookChoice;catalog:CatalogSnapshot;locale:Locale}){
 const tr=(value:string[])=>translate(locale,value),t=(key:string)=>tr(words[key]??[key]),b=(key:string)=>fieldbookText(locale,key),p=(key:string)=>prepText(locale,key);
 const destination=catalogDestination(catalog,choice.destinationId),index=terrains.findIndex(item=>item.id===choice.terrainId),terrain=terrains[index],guidance=catalogGuidance(catalog,choice.terrainId),sections=destination?.sections??guidance.sections;
 const title=destination?tr(destination.names):choice.point?`${t('selectedPoint')} · ${tr(terrain.names)}`:tr(terrain.names),edition=fieldbookPdf(destination?.id,terrain.id,locale),image=destination?.image??terrain.image;
 const official=officialBooks.filter(book=>book.destinationId===destination?.id),languageNames:Record<string,string>={ar:'العربية',en:'English',fr:'Français',de:'Deutsch','en-de':'English / Deutsch','en/de':'English / Deutsch'};
 const sourceIds=[...new Set([...(destination?.sourceIds??[]),...sections.flatMap(section=>section.sourceIds),...(destination?.species??[]).flatMap(species=>species.sourceIds)])];
 const query=new URLSearchParams(destination?{destination:destination.id}:{terrainId:terrain.id,...(choice.point?{lat:String(choice.point.lat),lon:String(choice.point.lon)}:{})}),location=choice.point??destination;
 const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),active=useRef(false),locked=useRef(false);
 useEffect(()=>{active.current=true;return()=>{active.current=false}},[]);
 async function store(){if(locked.current)return;locked.current=true;setBusy(true);setStatus('');try{
  const html=await buildGuideHtml({locale,index,point:choice.point,destinationId:destination?.id,catalog});if(!active.current)return;
  await saveGuide(destination?.id??(choice.point?`point-${choice.point.lat}-${choice.point.lon}-${terrain.id}`:`terrain-${terrain.id}`),locale,html,title);if(active.current)setStatus('offlineSaved');
 }catch{if(active.current)setStatus('failed')}finally{locked.current=false;if(active.current)setBusy(false)}}
 return <div className="fieldbook-document" dir={locale==='ar'?'rtl':'ltr'}>
  <a className="fieldbook-back" href="/regions">{b('back')}</a>
  <header className="fieldbook-cover"><div className="fieldbook-cover-copy"><span className="fieldbook-eyebrow">DAROUB · {b('title')}</span><h1>{title}</h1><p>{destination?tr(destination.summary):b('general')}</p><div className="fieldbook-version"><span>{b('reader')}</span><span>{b('revision')} <bdi>{catalog.revision}</bdi> · <time dateTime={catalog.publishedAt}>{catalog.publishedAt.slice(0,10)}</time></span></div>{location&&<p className="fieldbook-location"><MapPin size={16} aria-hidden="true"/>{b('location')} <bdi>{location.lat.toFixed(3)}, {location.lon.toFixed(3)}</bdi></p>}</div><figure><img src={image} alt=""/>{(!destination||destination.imageIsIllustrative)&&<figcaption>{t('illustration')}</figcaption>}</figure></header>
  {destination?.archived&&<p className="fieldbook-warning" role="status">{b('archived')}</p>}
  <div className="fieldbook-layout"><aside className="fieldbook-sidebar"><section className="fieldbook-download" aria-labelledby="fieldbook-download-title"><h2 id="fieldbook-download-title"><FileText size={20} aria-hidden="true"/>{b('edition')}</h2>{edition?<><p><time dateTime={edition.publishedAt}>{edition.publishedAt.slice(0,10)}</time> · <bdi>{edition.pages}</bdi> {b('pages')}</p><p>{b('editionHelp')}</p>{!destination&&<p>{b('terrainEdition')}</p>}<a className="fieldbook-primary" href={edition.url} download><Download size={18} aria-hidden="true"/>{b('downloadPdf')}</a><a className="fieldbook-secondary" href={edition.url} target="_blank" rel="noreferrer">{b('openPdf')}<ArrowUpRight size={17} aria-hidden="true"/></a></>:<p>{b('noPdf')}</p>}<button type="button" className="fieldbook-secondary" disabled={busy} onClick={()=>void store()}><Save size={18} aria-hidden="true"/>{busy?t('load'):p('saveOffline')}</button><p>{b('saveNote')}</p>{status&&<p className="fieldbook-save-status" role="status">{p(status)}</p>}<button type="button" className="fieldbook-text-button" onClick={()=>window.print()}><Printer size={17} aria-hidden="true"/>{b('print')}</button><a className="fieldbook-back" href="/offline">{p('library')}</a></section><nav className="fieldbook-contents" id="fieldbook-contents" aria-label={b('contents')}><h2><BookOpen size={20} aria-hidden="true"/>{b('contents')}</h2><ol>{sections.map((section,i)=><li key={section.id}><a href={`#fieldbook-chapter-${i}`}>{tr(section.title)}</a></li>)}<li><a href="#fieldbook-nature">{t('nature')}</a></li><li><a href="#fieldbook-group">{t('group')}</a></li>{official.length>0&&<li><a href="#fieldbook-official">{b('officialBooks')}</a></li>}<li><a href="#fieldbook-sources">{b('sources')}</a></li></ol></nav></aside>
   <article className="fieldbook-pages" aria-label={b('reader')}><p className="fieldbook-scope">{p(destination?'coverage':'general')}</p>{sections.map((section,i)=><section className="fieldbook-chapter" key={section.id} id={`fieldbook-chapter-${i}`} tabIndex={-1}><span className="fieldbook-chapter-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><h2>{tr(section.title)}</h2><p>{tr(section.body)}</p><Citations catalog={catalog} ids={section.sourceIds} locale={locale}/></section>)}
    <section className="fieldbook-chapter" id="fieldbook-nature" tabIndex={-1}><h2>{t('nature')}</h2>{destination?.species.length?destination.species.map(species=><section className="fieldbook-species" key={species.id}><h3>{tr(species.name)}</h3><span className="fieldbook-coverage">{p(species.coverage==='local'?'localCoverage':'exampleCoverage')}</span><p>{tr(species.description)}</p><p className="fieldbook-precaution">{tr(species.precaution)}</p><Citations catalog={catalog} ids={species.sourceIds} locale={locale}/></section>):<p>{b('noSpecies')}</p>}<p className="fieldbook-scope">{t('examples')}</p></section>
    <section className="fieldbook-chapter" id="fieldbook-group" tabIndex={-1}><h2>{t('group')}</h2><p>{tr(guidance.group)}</p><p className="fieldbook-precaution">{b('safety')}</p></section>
    {official.length>0&&<section className="fieldbook-chapter" id="fieldbook-official" tabIndex={-1}><h2>{b('officialBooks')}</h2><p>{b('officialHelp')}</p><ul className="fieldbook-official-list">{official.map(book=><li key={book.url}><span className="fieldbook-coverage">{b(book.format.startsWith('pdf')?'officialPdf':'webGuide')}</span><h3><a href={book.url} target="_blank" rel="noreferrer">{book.title}<ArrowUpRight size={16} aria-hidden="true"/></a></h3><p>{book.publisher}</p><p><bdi>{languageNames[book.language]??book.language}</bdi> · {b('linkChecked')} <time dateTime={book.verifiedAt}>{book.verifiedAt}</time></p></li>)}</ul></section>}
    <section className="fieldbook-chapter" id="fieldbook-sources" tabIndex={-1}><h2>{b('sources')}</h2><Citations catalog={catalog} ids={sourceIds} locale={locale}/></section><footer className="fieldbook-end"><a className="fieldbook-primary" href={'/trips?'+query}>{p('plan')}<ArrowUpRight size={18} aria-hidden="true"/></a><a href="#fieldbook-contents">{b('top')}</a></footer>
   </article></div>
 </div>;
}
export function FieldbookReader(){
 const {locale}=useSite(),{catalog,loading,error,refresh}=useCatalog(),[search,setSearch]=useState<string|null>(null),b=(key:string)=>fieldbookText(locale,key);
 // The URL is external navigation state; keep the server and initial browser render identical.
 useEffect(()=>{const read=()=>setSearch(window.location.search);read();window.addEventListener('popstate',read);return()=>window.removeEventListener('popstate',read)},[]);
 const resolved=search===null?null:resolveFieldbookChoice(new URLSearchParams(search),catalog);
 return <main id="main" className="fieldbook-reader" dir={locale==='ar'?'rtl':'ltr'}>{error&&<div className="fieldbook-warning" role="status">{catalogText(locale,'fallback')} <button type="button" className="fieldbook-text-button" onClick={()=>void refresh()}>{catalogText(locale,'retry')}</button></div>}{loading||!resolved?<section className="fieldbook-empty"><h1>{b('title')}</h1><p role="status">{b('loading')}</p></section>:'error' in resolved?<section className="fieldbook-empty"><h1>{b('title')}</h1><p role="status">{b(resolved.error)}</p><a className="fieldbook-primary" href="/regions">{b('back')}</a></section>:<FieldbookDocument key={JSON.stringify([resolved.choice,locale,catalog.revision,catalog.publishedAt])} choice={resolved.choice} catalog={catalog} locale={locale}/>}</main>;
}
