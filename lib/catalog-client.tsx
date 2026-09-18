"use client";
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {seedCatalog} from './catalog-seed';
import {validateCatalog} from './catalog-validation';
import type {CatalogSnapshot} from './toolkit-types';
interface CatalogState {catalog:CatalogSnapshot;loading:boolean;error:boolean;refresh:()=>Promise<void>}
const CatalogContext=createContext<CatalogState>({catalog:seedCatalog,loading:true,error:false,refresh:async()=>{}});
export function CatalogProvider({children}:{children:ReactNode}){
 const[catalog,setCatalog]=useState(seedCatalog),[loading,setLoading]=useState(true),[error,setError]=useState(false),request=useRef(0);
 const refresh=useCallback(async()=>{const n=++request.current;setLoading(true);try{const response=await fetch('/api/catalog',{cache:'no-store'});if(!response.ok)throw Error('unavailable');const next=validateCatalog(await response.json(),true);if(n===request.current){setCatalog(next);setError(false)}}catch{if(n===request.current)setError(true)}finally{if(n===request.current)setLoading(false)}},[]);
 // Fetch the external published snapshot and invalidate requests after unmount.
 // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
 useEffect(()=>{void refresh();const update=()=>{void refresh()};window.addEventListener('online',update);window.addEventListener('daroub:catalog-published',update);return()=>{request.current++;window.removeEventListener('online',update);window.removeEventListener('daroub:catalog-published',update)}},[refresh]);
 return <CatalogContext.Provider value={{catalog,loading,error,refresh}}>{children}</CatalogContext.Provider>;
}
export function useCatalog(){return useContext(CatalogContext)}
