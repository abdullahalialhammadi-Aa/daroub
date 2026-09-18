"use client";
import {useCallback,useEffect,useState} from 'react';
import {flushSync} from 'react-dom';
import {Backpack,Leaf,TriangleAlert,Users,BookOpen,MapPin,ArrowUpLeft,Search,Save} from 'lucide-react';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {useSite} from './site-shell';
import {Weather} from './weather';
import {terrains} from '@/lib/terrain';
import {useCatalog} from '@/lib/catalog-client';
import {activeDestinations,catalogDestination,catalogForTerrain,catalogGuidance,catalogSources} from '@/lib/catalog-seed';
import {catalogText} from '@/lib/catalog-copy';
import {prepText} from '@/lib/preparation-copy';
import {buildGuideHtml} from '@/lib/fieldbook';
import {saveGuide} from '@/lib/offline';
import {DestinationBrief} from './destination-brief';
import {adviceText} from '@/lib/destination-advice';
import {CatalogNotice} from './catalog-notice';
import type {Destination,TerrainId} from '@/lib/toolkit-types';
import './preparation.css';

export function TerrainPicker({index,onChange}:{index:number;onChange:(v:number)=>void}){const{t,tr}=useSite();return <Select value={String(index)} onValueChange={v=>onChange(Number(v))}><SelectTrigger aria-label={t('chooseTerrain')} className="terrain-select"><SelectValue/></SelectTrigger><SelectContent>{terrains.map((r,i)=><SelectItem key={r.id} value={String(i)}>{tr(r.names)}</SelectItem>)}</SelectContent></Select>}
function Citations({ids}:{ids:string[]}){const{locale}=useSite(),{catalog}=useCatalog();return <div className="prep-citations">{catalogSources(catalog,ids).map(source=><a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗ <span>· {prepText(locale,'reviewed')} {source.reviewedAt}</span></a>)}</div>}

export function RegionReport({index,point,destinationId}:{index:number;point?:{lat:number;lon:number};destinationId?:string}){
 const{locale,t,tr}=useSite(),{catalog,loading}=useCatalog();
 const d=catalogDestination(catalog,destinationId)??(!point&&!destinationId?catalogForTerrain(catalog,index):undefined),selectedIndex=d?.terrainIndex??(terrains[index]?index:0),region=terrains[selectedIndex],guidance=catalogGuidance(catalog,region.id as TerrainId);
 const chapter=(id:string)=>d?.sections.find(s=>s.id===id)??guidance.sections.find(s=>s.id===id);
 const body=(id:string)=>{const s=chapter(id);return s?tr(s.body):''};
 const lat=point?.lat??d?.lat??region.lat,lon=point?.lon??d?.lon??region.lon,title=d?tr(d.names):t('selectedPoint'),p=(key:string)=>prepText(locale,key),c=(key:string)=>catalogText(locale,key);
 const[busy,setBusy]=useState(false),[status,setStatus]=useState('');
 // Feedback belongs to the displayed snapshot and location.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>setStatus(''),[destinationId,index,lat,lon,locale,catalog.revision]);
 async function exportBook(){setBusy(true);setStatus('');try{const html=await buildGuideHtml({locale,index:selectedIndex,point,destinationId:d?.id,catalog});await saveGuide(d?.id??`point-${lat}-${lon}-${region.id}`,locale,html,title);setStatus('offlineSaved')}catch{setStatus('failed')}finally{setBusy(false)}}
 if(destinationId&&!d)return <section className="panel"><CatalogNotice/><p role="status">{loading?c('loading'):c('unavailable')}</p></section>;
 const context=d?`destination=${encodeURIComponent(d.id)}`:`terrainId=${region.id}&lat=${lat}&lon=${lon}`,image=d?.image??region.image;
 const first=chapter('place')??chapter('deeper');
 return <div className="prep-report"><CatalogNotice/>{d?.archived&&<p role="status">{c('archivedNotice')}</p>}<div className="report-top"><div><span className="eyebrow">{t('report')}</span><h2>{title}</h2><p className="coords"><MapPin size={16}/><span dir="ltr">{lat.toFixed(3)}°, {lon.toFixed(3)}°</span></p></div><div className="prep-actions"><a className="primary-btn" href={`/trips?${context}`}><Backpack size={18}/>{p('plan')}</a><a className="outline-btn" href={`/fieldbook?${context}`}><BookOpen size={18}/>{t('readBook')}</a></div></div><p className="destination-marker-note">{adviceText(locale,'coordinates')}</p><p className="subtle">{p(d?'coverage':'general')}</p><nav className="prep-chapters" aria-label={t('report')}>{[['place',p('destination')],['equipment',t('equipment')],['nature',t('nature')],['hazard',t('warning')]].map(([id,label])=><a key={id} href={`#guide-${id}`}>{label}</a>)}</nav><div className="report-grid"><div className="report-main"><figure className="region-photo"><img src={image} alt={title}/>{(!d||d.imageIsIllustrative)&&<figcaption>{t('illustration')}</figcaption>}</figure>
 <section id="guide-place" className="panel"><div className="panel-title"><MapPin size={22}/><h3>{first?tr(first.title):t('deeper')}</h3></div><p>{first?tr(first.body):''}</p><Citations ids={first?.sourceIds??[]}/></section>
 <DestinationBrief catalog={catalog} destinationId={d?.id} locale={locale}/><section id="guide-equipment" className="panel"><div className="panel-title"><Backpack size={22}/><h3>{t('equipment')}</h3></div><p>{body('equipment')}</p><Citations ids={chapter('equipment')?.sourceIds??[]}/><a className="source-link" href={`/trips?${context}`}>{p('checklist')} ↗</a></section>
 <section id="guide-nature" className="panel"><div className="panel-title"><Leaf size={22}/><h3>{t('nature')}</h3></div>{d?<><p>{body('nature')}</p><Citations ids={chapter('nature')?.sourceIds??[]}/><div className="prep-species">{d.species.map(species=><article key={species.id}><h4>{tr(species.name)}</h4><span className={'prep-tag '+(species.coverage==='terrain-example'?'example':'')}>{p(species.coverage==='local'?'localCoverage':'exampleCoverage')}</span><p>{tr(species.description)}</p><p className="subtle">{tr(species.precaution)}</p><Citations ids={species.sourceIds}/></article>)}</div></>:<><p>{body('nature')}</p><Citations ids={chapter('nature')?.sourceIds??[]}/></>}<p className="subtle">{t('examples')}</p></section>
 <section id="guide-hazard" className="panel warning-panel"><div className="panel-title"><TriangleAlert size={22}/><h3>{t('warning')}</h3></div><p>{body('hazard')}</p><Citations ids={chapter('hazard')?.sourceIds??[]}/></section>
 <section className="panel group-panel"><Users size={29}/><div><h3>{t('groupCount')}</h3><p>{tr(guidance.group)}</p></div></section><div className="prep-actions"><a className="outline-btn" href={`/assistant?${context}&terrain=${selectedIndex}${d?'':'&generic=1'}`}><span>{t('talk')}</span><ArrowUpLeft size={18}/></a><button className="outline-btn" disabled={busy} onClick={()=>exportBook()}><Save size={18}/>{busy?t('load'):p('saveOffline')}</button><a className="source-link" href="/offline">{p('library')} ↗</a></div>{status&&<p className="prep-status" role="status">{p(status)}</p>}</div><Weather lat={lat} lon={lon}/></div>
 </div>
}

export function Regions(){
 const{t,tr,locale}=useSite(),{catalog,loading}=useCatalog(),destinations=activeDestinations(catalog);
 const[index,setIndex]=useState(0),[destinationId,setDestinationId]=useState<string|undefined>('liwa'),[search,setSearch]=useState(''),[filter,setFilter]=useState('all'),[point,setPoint]=useState<{lat:number;lon:number}|undefined>();
 const fromUrl=useCallback(()=>{const q=new URLSearchParams(location.search),requested=q.get('destination'),d=catalogDestination(catalog,requested);if(requested){setDestinationId(requested);setIndex(d?.terrainIndex??0);setPoint(undefined);return}const terrain=q.get('terrainId'),i=terrains.findIndex(r=>r.id===terrain),legacy=Number(q.get('terrain')),next=i>=0?i:Number.isInteger(legacy)&&legacy>=0&&legacy<terrains.length?legacy:0;setIndex(next);const lat=Number(q.get('lat')),lon=Number(q.get('lon')),coordinates=q.get('lat')?.trim()&&q.get('lon')?.trim()&&Number.isFinite(lat)&&Math.abs(lat)<=90&&Number.isFinite(lon)&&Math.abs(lon)<=180?{lat,lon}:undefined;setPoint(coordinates);setDestinationId(coordinates?undefined:catalogForTerrain(catalog,next)?.id)},[catalog]);
 // URL and published snapshot are external state; preserve stable destination IDs.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{if(loading)return;fromUrl();addEventListener('popstate',fromUrl);return()=>removeEventListener('popstate',fromUrl)},[fromUrl,loading]);
 const change=useCallback((d:Destination)=>{setIndex(d.terrainIndex);setDestinationId(d.id);setPoint(undefined);history.pushState(null,'',`?destination=${encodeURIComponent(d.id)}`)},[]);
 useEffect(()=>{const context=(document as Document & {modelContext?:{registerTool:(tool:Record<string,unknown>,options:{signal:AbortSignal})=>unknown}}).modelContext;if(!context?.registerTool)return;const controller=new AbortController();try{Promise.resolve(context.registerTool({name:'select_terrain',title:'Select a terrain',description:'Select desert, mountain, forest or coast in the visible region guide.',inputSchema:{type:'object',properties:{terrain:{type:'string',enum:terrains.map(r=>r.id)}},required:['terrain'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input:unknown){if(!input||typeof input!=='object'||Object.keys(input).length!==1)throw Error('Expected a terrain');const supplied=(input as Record<string,unknown>).terrain;if(typeof supplied!=='string')throw Error('Expected a terrain');const i=terrains.findIndex(r=>r.id===supplied),d=catalogForTerrain(catalog,i);if(!d)throw Error('No published destination for this terrain');flushSync(()=>change(d));return{selected:d.terrainId,destinationId:d.id,coordinates:{lat:d.lat,lon:d.lon}}}},{signal:controller.signal})).catch(()=>{})}catch{}return()=>controller.abort()},[catalog,change]);
 const matches=destinations.filter(d=>(filter==='all'||filter===d.terrainId)&&[...d.names,...d.summary,...terrains[d.terrainIndex].names].join(' ').toLocaleLowerCase().includes(search.toLocaleLowerCase().trim()));
 return <main id="main" className="page inner-page"><div className="view-heading"><div><div className="eyebrow">DAROUB / FIELD GUIDE</div><h1>{t('regions')}</h1><p>{t('guideIntro')}</p></div><a className="outline-btn" href="/offline"><BookOpen size={18}/>{prepText(locale,'library')}</a></div><div className="prep-searchbar"><label className="prep-label"><span><Search size={16}/> {prepText(locale,'search')}</span><input type="search" className="prep-search" value={search} maxLength={120} onChange={e=>setSearch(e.target.value)}/></label><label className="prep-label">{prepText(locale,'terrain')}<select className="prep-search" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">{prepText(locale,'all')}</option>{terrains.map(r=><option key={r.id} value={r.id}>{tr(r.names)}</option>)}</select></label></div><div className="prep-destinations">{matches.map(d=><button className="prep-destination" aria-pressed={!point&&destinationId===d.id} key={d.id} onClick={()=>change(d)}><img src={d.image} alt=""/><span>{tr(d.names)}</span><small>{tr(d.summary)}</small></button>)}</div>{!matches.length&&<p role="status">{prepText(locale,'none')}</p>}<RegionReport index={index} point={point} destinationId={destinationId}/></main>
}
