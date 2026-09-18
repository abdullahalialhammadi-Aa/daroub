"use client";
import {useCallback,useEffect,useState} from 'react';
import {useCatalog} from '@/lib/catalog-client';
import {activeDestinations} from '@/lib/catalog-seed';
import {selectionFromQuery,selectionQuery} from '@/lib/explorer-location';
import type {ExplorerSelection} from '@/lib/explorer-location';

export function useExplorerSelection() {
  const {catalog,loading}=useCatalog(),destinations=catalog.destinations;
  const first=activeDestinations(catalog)[0]??destinations[0];
  const defaultSelection:ExplorerSelection={destinationId:first.id,terrainId:first.terrainId,lat:first.lat,lon:first.lon};
  const [selection,setSelection]=useState<ExplorerSelection>(defaultSelection),[invalidLink,setInvalidLink]=useState(false),[resolved,setResolved]=useState(false);
  const choose=useCallback((next:ExplorerSelection,replace=false)=>{
    setSelection(next);setInvalidLink(false);
    const query=selectionQuery(next),url=new URL(window.location.href);
    for(const key of ['destination','lat','lon','terrainId'])url.searchParams.delete(key);
    new URLSearchParams(query).forEach((value,key)=>url.searchParams.set(key,value));
    if(replace)window.history.replaceState(window.history.state,'',url);else if(url.href!==window.location.href)window.history.pushState(window.history.state,'',url);
    try{localStorage.setItem('daroub-last-location-v1',query)}catch{}
  },[]);
  useEffect(()=>{
    if(loading)return;
    const read=(initial=false)=>{
      const params=new URLSearchParams(window.location.search);
      const explicit=['destination','lat','lon','terrainId'].some(key=>params.has(key));
      let next=selectionFromQuery(params,destinations);
      if(initial&&!explicit){try{next=selectionFromQuery(new URLSearchParams(localStorage.getItem('daroub-last-location-v1')||''),destinations)}catch{}}
      if(explicit&&!next){setInvalidLink(true);setSelection(defaultSelection);setResolved(true);return;}
      choose(next??defaultSelection,true);setResolved(true);
    };
    read(true);const pop=()=>read();window.addEventListener('popstate',pop);
    return()=>window.removeEventListener('popstate',pop);
  // Re-resolve stable IDs after publication, retaining explicit URL coordinates.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[choose,catalog,loading]);
  return {selection,choose,invalidLink,resolved};
}
