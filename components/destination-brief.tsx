'use client';
import {MapPin,Route,Shirt,Car,CalendarDays,ArrowUpLeft} from 'lucide-react';
import type {CatalogSnapshot} from '@/lib/toolkit-types';
import {translate,type Locale} from '@/lib/terrain';
import {catalogDestination,catalogSources} from '@/lib/catalog-seed';
import {adviceText,advicePreview} from '@/lib/destination-advice';
import './destination-brief.css';
export function DestinationBrief({catalog,destinationId,locale,compact=false}:{catalog:CatalogSnapshot;destinationId:string|null|undefined;locale:Locale;compact?:boolean}){
 const destination=catalogDestination(catalog,destinationId);if(!destination)return null;
 const a=(key:string)=>adviceText(locale,key),tr=(values:string[])=>translate(locale,values),equipment=destination.sections.find(section=>section.id==='equipment');
 const cards=([['visit',Route],['clothing',Shirt],['transport',Car],['season',CalendarDays]] as const).map(([id,Icon])=>({id,Icon,section:destination.sections.find(section=>section.id===id)})).filter(card=>card.section);
 if(!cards.length)return null;
 const content=<div className="destination-advice-grid">{cards.map(({id,Icon,section})=>{const body=tr(section!.body),preview=advicePreview(body),rest=body.slice(preview.length).trim();return <details className="destination-advice-card" key={id}><summary><span className="destination-advice-label"><Icon size={20} aria-hidden="true"/>{a(id)}</span><span className="destination-advice-preview">{preview}</span></summary>{rest&&<p>{rest}</p>}<div className="destination-advice-sources" aria-label={a('sources')}>{catalogSources(catalog,section!.sourceIds).map(source=><a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title}<span> · {source.reviewedAt}</span></a>)}</div></details>})}</div>;
 return <section className={'destination-brief'+(compact?' is-compact':'')} aria-label={a('title')}><div className="destination-brief-heading"><div><MapPin size={22} aria-hidden="true"/><h3>{a('title')}<span>{tr(destination.names)}</span></h3></div>{compact&&<a href={'/regions?destination='+encodeURIComponent(destination.id)}>{a('full')}<ArrowUpLeft size={16} aria-hidden="true"/></a>}</div>{compact?<>{equipment&&<p className="destination-equipment-preview">{advicePreview(tr(equipment.body))}</p>}<details className="destination-advice-more"><summary>{a('more')}</summary>{content}</details></>:content}</section>
}
