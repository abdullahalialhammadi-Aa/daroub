'use client';
import {useId,useState} from 'react';
import {Check,Pencil} from 'lucide-react';
import type {Locale} from '@/lib/terrain';
import type {TeamAction,TeamBoard,TeamParticipant} from '@/lib/team-types';
import {teamText} from '@/lib/team-copy';

export function TeamPersonEditor({board,person,locale,locked,save}:{board:TeamBoard;person:TeamParticipant;locale:Locale;locked:boolean;save:(action:TeamAction)=>Promise<boolean>}){
 const id=useId(),t=(key:string)=>teamText(locale,key);
 const [draft,setDraft]=useState<{name:string;original:string;revision:number}|null>(null);
 const stale=!!draft&&draft.revision!==board.revision;
 const editable=person.isYou||(board.isOwner&&!person.linked);
 const close=()=>{setDraft(null);requestAnimationFrame(()=>document.getElementById(id+'-edit')?.focus())};
 if(!editable)return null;
 if(!draft)return <button id={id+'-edit'} type="button" className="team-button team-compact" disabled={locked} onClick={()=>{setDraft({name:person.name,original:person.name,revision:board.revision});requestAnimationFrame(()=>document.getElementById(id)?.focus())}}><Pencil size={15} aria-hidden="true"/>{t(person.isYou?'editMyName':'editName')}<span className="team-sr"> · {person.name}</span></button>;
 return <div className="team-name-editor"><label htmlFor={id}>{t(person.isYou?'yourName':'personName')}<input id={id} form={id+'-detached'} value={draft.name} disabled={locked} maxLength={80} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>{stale&&<div className="team-warning" role="status"><p>{t('nameChanged')} <strong>{person.name}</strong></p><button type="button" className="team-button" disabled={locked} onClick={()=>setDraft({...draft,original:person.name,revision:board.revision})}>{t('keepDraft')}</button></div>}<div className="team-actions"><button type="button" className="team-button team-primary" disabled={locked||stale||!draft.name.trim()||draft.name.trim()===person.name} onClick={async()=>{if(await save({type:'rename-person',roomId:board.id,revision:draft.revision,participantId:person.id,name:draft.name.trim()}))close()}}><Check size={16} aria-hidden="true"/>{t('saveName')}</button><button type="button" className="team-button" disabled={locked} onClick={close}>{t('cancel')}</button></div></div>;
}

