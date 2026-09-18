'use client';
import {useId,type ReactNode} from 'react';
import {ListChecks,Sparkles,BookOpen,ChevronDown} from 'lucide-react';
import {packingWorkspaceText} from '@/lib/packing-workspace-copy';
import type {Locale} from '@/lib/terrain';
import './packing-workspace.css';

export type PackingView='list'|'suggestions';
export function PackingWorkspace({view,onViewChange,locale,count,checklist,suggestions,guide}:{view:PackingView;onViewChange:(view:PackingView)=>void;locale:Locale;count:number;checklist:ReactNode;suggestions:ReactNode;guide?:ReactNode}){
 const id=useId(),w=(key:Parameters<typeof packingWorkspaceText>[1])=>packingWorkspaceText(locale,key);
 return <div className="packing-workspace">
  <div className="packing-view-switch" role="group" aria-label={w('views')}>
   <button id={`${id}-list-button`} type="button" aria-pressed={view==='list'} aria-controls={`${id}-list`} onClick={()=>onViewChange('list')}>
    <ListChecks size={23} aria-hidden="true"/><span><strong>{w('list')} <bdi className="packing-view-count">{count}</bdi></strong><small>{w('listHint')}</small></span>
   </button>
   <button id={`${id}-suggestions-button`} type="button" aria-pressed={view==='suggestions'} aria-controls={`${id}-suggestions`} onClick={()=>onViewChange('suggestions')}>
    <Sparkles size={23} aria-hidden="true"/><span><strong>{w('suggestions')}</strong><small>{w('suggestionsHint')}</small></span>
   </button>
  </div>
  <section id={`${id}-list`} aria-labelledby={`${id}-list-button`} hidden={view!=='list'}>{checklist}</section>
  <section id={`${id}-suggestions`} aria-labelledby={`${id}-suggestions-button`} hidden={view!=='suggestions'}>{suggestions}{guide&&<details className="packing-destination-guide"><summary><BookOpen size={18} aria-hidden="true"/>{w('guide')}<ChevronDown size={16} aria-hidden="true"/></summary>{guide}</details>}</section>
 </div>;
}
