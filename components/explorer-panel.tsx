"use client";
import {useEffect,useState} from 'react';
import {Bookmark,Check,Copy,MapPin,Trash2} from 'lucide-react';
import {useCatalog} from '@/lib/catalog-client';
import {activeDestinations,catalogDestination} from '@/lib/catalog-seed';
import {terrains} from '@/lib/terrain';
import {explorerCopy} from '@/lib/explorer-copy';
import {parseCoordinates,selectionQuery} from '@/lib/explorer-location';
import type {ExplorerSelection} from '@/lib/explorer-location';
import type {SavedLocation,TerrainId} from '@/lib/toolkit-types';
import {deleteBookmark,getSession,listBookmarks,saveBookmark,syncTrips} from '@/lib/trip-store';
import {useSite} from './site-shell';

export function DestinationSearch({selection,onChoose}:{selection:ExplorerSelection;onChoose:(value:ExplorerSelection)=>void}) {
  const {catalog}=useCatalog(),destinations=activeDestinations(catalog);
  const {tr,t}=useSite(),text=(key:string)=>tr(explorerCopy[key]);
  const [search,setSearch]=useState(''),[latitude,setLatitude]=useState(''),[longitude,setLongitude]=useState(''),[terrain,setTerrain]=useState<TerrainId>('desert'),[error,setError]=useState(false);
  const normalized=search.trim().normalize('NFKC').toLocaleLowerCase();
  const matches=destinations.filter(item=>[...item.names,...item.summary].some(name=>name.normalize('NFKC').toLocaleLowerCase().includes(normalized))||item.id.includes(normalized));
  return <><div className="explorer-search"><label>{text('search')}<input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder={text('searchHint')}/></label></div>
    <div className="explorer-place-list">{matches.map(item=><button className={'place-button '+(selection.destinationId===item.id?'chosen':'')} key={item.id} aria-pressed={selection.destinationId===item.id} onClick={()=>onChoose({destinationId:item.id,terrainId:item.terrainId,lat:item.lat,lon:item.lon})}><img src={item.image} alt=""/><span>{tr(item.names)}<small>{tr(item.summary)}</small></span><MapPin size={17}/></button>)}</div>
    {!matches.length&&<p role="status">{text('noResults')}</p>}
    <details className="coordinate-entry"><summary>{text('manual')}</summary><form onSubmit={event=>{event.preventDefault();const coordinates=parseCoordinates(latitude,longitude);if(!coordinates){setError(true);return;}setError(false);onChoose({...coordinates,terrainId:terrain,destinationId:null});}}><div className="coordinate-fields"><label>{text('latitude')}<input dir="ltr" type="number" step="any" min="-90" max="90" required value={latitude} onChange={event=>setLatitude(event.target.value)}/></label><label>{text('longitude')}<input dir="ltr" type="number" step="any" min="-180" max="180" required value={longitude} onChange={event=>setLongitude(event.target.value)}/></label></div><label>{t('chooseTerrain')}<select className="explorer-copy-input" value={terrain} onChange={event=>setTerrain(event.target.value as TerrainId)}>{terrains.map(item=><option key={item.id} value={item.id}>{tr(item.names)}</option>)}</select></label><button className="outline-btn" type="submit">{text('locate')}</button>{error&&<p role="alert">{text('invalid')}</p>}</form></details>
  </>;
}
export function ExplorerActions({selection,showPlan=true}:{selection:ExplorerSelection;showPlan?:boolean}) {
  const {catalog}=useCatalog(),destinationById=(id:string|null)=>catalogDestination(catalog,id);
  const {tr}=useSite(),text=(key:string)=>tr(explorerCopy[key]);
  const [bookmarks,setBookmarks]=useState<SavedLocation[]>([]),[message,setMessage]=useState(''),[copyFallback,setCopyFallback]=useState(''),[busy,setBusy]=useState(false),[signedIn,setSignedIn]=useState(false);
  useEffect(()=>{
    let active=true;
    const update=async()=>{try{const session=await getSession();if(active)setSignedIn(!!session);const items=session?await listBookmarks():[];if(active)setBookmarks(items)}catch{if(active)setMessage('saveFailed')}};
    void update();
    window.addEventListener('daroub:trip-sync',update);window.addEventListener('storage',update);
    return()=>{active=false;window.removeEventListener('daroub:trip-sync',update);window.removeEventListener('storage',update)};
  },[]);
  const saved=bookmarks.find(item=>item.destinationId===selection.destinationId&&item.terrainId===selection.terrainId&&Math.abs(item.lat-selection.lat)<.00001&&Math.abs(item.lon-selection.lon)<.00001);
  const destination=destinationById(selection.destinationId),label=destination?tr(destination.names):`${selection.lat.toFixed(3)}, ${selection.lon.toFixed(3)}`;
  async function save(){setBusy(true);setMessage('');try{await saveBookmark({...selection,id:crypto.randomUUID(),label,revision:0,updatedAt:new Date().toISOString()});setBookmarks(await listBookmarks());setMessage('saved');void syncTrips().catch(()=>{});}catch{setMessage('saveFailed')}finally{setBusy(false)}}
  async function remove(id:string){setBusy(true);setMessage('');try{await deleteBookmark(id);setBookmarks(await listBookmarks());void syncTrips().catch(()=>{});}catch{setMessage('saveFailed')}finally{setBusy(false)}}
  async function copy(){const url=new URL('/globe?'+selectionQuery(selection),window.location.origin).href;try{await navigator.clipboard.writeText(url);setMessage('copied');setCopyFallback('')}catch{setCopyFallback(url);setMessage('copyFallback')}}
  return <><div className="explorer-actions"><button className="outline-btn" disabled={busy||!!saved||!signedIn} onClick={save}>{saved?<Check size={18}/>:<Bookmark size={18}/>} {text(saved?'saved':'save')}</button>{!signedIn&&<a className="source-link" target="_top" href={"/login?return_to="+encodeURIComponent("/globe?"+selectionQuery(selection))}>{text("signIn")}</a>}<button className="outline-btn" onClick={copy}><Copy size={18}/>{text('share')}</button>{showPlan&&<a className="primary-btn" href={'/trips?'+selectionQuery(selection)}>{text('plan')}</a>}</div>{message&&<p className="explorer-status" role="status">{text(message)}</p>}{copyFallback&&<input className="explorer-copy-input" aria-label={text('copyFallback')} readOnly value={copyFallback} onFocus={event=>event.target.select()}/>}
    <details className="explorer-bookmarks"><summary>{text('bookmarks')} ({bookmarks.length})</summary><p className="subtle">{text(signedIn?'synced':'localOnly')}</p>{!bookmarks.length&&<p>{text('noBookmarks')}</p>}{bookmarks.map(item=><div className="explorer-bookmark" key={item.id}><a href={'/globe?'+selectionQuery(item)}>{item.destinationId&&destinationById(item.destinationId)?tr(destinationById(item.destinationId)!.names):item.label}</a><button className="icon-button" disabled={busy} aria-label={text('remove')+': '+item.label} onClick={()=>void remove(item.id)}><Trash2 size={17}/></button></div>)}</details>
  </>;
}
