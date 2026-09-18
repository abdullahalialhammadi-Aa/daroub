"use client";
import { useEffect,useState } from 'react';
import { BookOpen,Download,Trash2 } from 'lucide-react';
import { Dialog,DialogContent,DialogTitle,DialogDescription } from './ui/dialog';
import { useSite } from './site-shell';
import { LegacyRecoveryNotice } from './legacy-recovery';
import { listGuides,deleteGuide,type SavedGuide } from '@/lib/offline';
import { prepText } from '@/lib/preparation-copy';
import { fieldbookPdf } from '@/lib/fieldbook-editions';
import { fieldbookText } from '@/lib/fieldbook-copy';
import { locales,languageNames } from '@/lib/terrain';
import './preparation.css';

export function savedGuideEdition(guide:SavedGuide){return fieldbookPdf(guide.destinationId,'',guide.locale)}

export function OfflineLibrary(){const{locale,t}=useSite();const p=(k:string)=>prepText(locale,k),b=(k:string)=>fieldbookText(locale,k);const[guides,setGuides]=useState<SavedGuide[]>([]),[open,setOpen]=useState<SavedGuide|null>(null),[error,setError]=useState(false),[loading,setLoading]=useState(true);
 async function refresh(){try{setGuides((await listGuides()).sort((a,b)=>b.savedAt.localeCompare(a.savedAt)));setError(false)}catch{setError(true)}finally{setLoading(false)}}
 // Read the external IndexedDB library after hydration; it is unavailable during SSR.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{void refresh()},[]);
 async function remove(id:string){try{await deleteGuide(id);await refresh()}catch{setError(true)}}
 return <main id="main" className="page inner-page"><div className="view-heading"><div><span className="eyebrow">DAROUB / FIELD LIBRARY</span><h1>{p('library')}</h1><p>{p('offlineIntro')}</p></div><a className="outline-btn" href="/regions">{t('regions')}</a></div><LegacyRecoveryNotice/>{error&&<div role="alert"><p>{p('failed')}</p><button className="outline-btn" onClick={()=>void refresh()}>{t('retry')}</button></div>}{loading?<p role="status">{t('load')}</p>:guides.length===0?<p className="prep-empty">{p('noGuides')}</p>:<div className="prep-library-grid">{guides.map(guide=>{const edition=savedGuideEdition(guide);return <article className="panel" key={guide.id}><BookOpen size={25}/><h2 lang={guide.locale} dir={guide.locale==='ar'?'rtl':'ltr'}>{guide.title}</h2><p className="prep-meta">{languageNames[locales.indexOf(guide.locale)]} · {p('savedAt')} <time dateTime={guide.savedAt}>{new Date(guide.savedAt).toLocaleDateString(locale)}</time></p><div className="prep-actions"><button className="primary-btn" onClick={()=>setOpen(guide)}>{p('read')}</button>{edition&&<a className="outline-btn" href={edition.url} download><Download size={17}/>{b('downloadPdf')}</a>}<button className="outline-btn" onClick={()=>remove(guide.id)}><Trash2 size={17}/>{p('delete')}</button></div>{edition?<p className="prep-meta">{b('edition')} · <time dateTime={edition.publishedAt}>{edition.publishedAt.slice(0,10)}</time> · {edition.pages} {b('pages')}<br/>{b('savedEditionHelp')}</p>:<p className="prep-meta">{b('savedNoPdf')}</p>}</article>})}</div>}<Dialog open={!!open} onOpenChange={value=>{if(!value)setOpen(null)}}><DialogContent className="prep-read-dialog"><DialogTitle lang={open?.locale} dir={open?.locale==='ar'?'rtl':'ltr'}>{open?.title}</DialogTitle><DialogDescription>{b('savedCopy')} · {p('offlineIntro')}</DialogDescription>{open&&<iframe className="prep-reader" title={open.title} srcDoc={open.html} sandbox="allow-popups"/>}</DialogContent></Dialog></main>
}
