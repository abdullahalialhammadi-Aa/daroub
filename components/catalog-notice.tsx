"use client";
import {useCatalog} from '@/lib/catalog-client';
import {catalogText} from '@/lib/catalog-copy';
import {useSite} from './site-shell';
export function CatalogNotice(){const{catalog,error,loading,refresh}=useCatalog(),{locale}=useSite(),c=(key:string)=>catalogText(locale,key);return <div className="catalog-notice"><p className="subtle">{c('revision')} {catalog.revision} · {catalog.publishedAt.slice(0,10)}</p>{loading&&<p role="status">{c('loading')}</p>}{error&&<p role="status">{c('fallback')} <button className="source-link" onClick={()=>void refresh()}>{c('retry')}</button></p>}</div>}
