"use client";
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowUpRight,Backpack,Check,Compass,Copy,Download,ExternalLink,Eye,EyeOff,KeyRound,MapPin,ShieldCheck,Smartphone} from 'lucide-react';
import {useSite} from './site-shell';
import {authEntryHref,safeAuthReturn} from '@/lib/auth-entry';
import {authText} from '@/lib/auth-copy';
import {PASSWORD_MIN,PASSWORD_MAX,type LocalAuthAction,type LocalAuthError,type LocalAuthResult} from '@/lib/local-auth-contract';
import type {Locale} from '@/lib/terrain';
import './auth-entry.css';

type Account={userId:string;displayName?:string};
type FormAction=Exclude<LocalAuthAction,'logout'>;
type Fields={name:string;email:string;password:string;confirm:string;recoveryCode:string};
const emptyFields:Fields={name:'',email:'',password:'',confirm:'',recoveryCode:''};
const errorKeys:Record<LocalAuthError,string>={'invalid-input':'invalidInput','invalid-credentials':'invalidCredentials','account-unavailable':'accountUnavailable','rate-limited':'rateLimited','already-signed-in':'alreadySignedIn','unavailable':'requestFailed','invalid-origin':'requestFailed'};
export function validateAuthFields(action:FormAction,fields:Fields):{field:keyof Fields;message:string}|null{
 if(action==='register'&&(!fields.name.trim()||Array.from(fields.name.trim()).length>80))return {field:'name',message:'nameError'};
 if(fields.email.trim().length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))return {field:'email',message:'emailError'};
 if(action==='recover'&&!/^[a-f0-9]{64}$/i.test(fields.recoveryCode.replace(/[\s-]/g,'')))return {field:'recoveryCode',message:'codeError'};
 const length=Array.from(fields.password).length;
 if(length<PASSWORD_MIN||length>PASSWORD_MAX)return {field:'password',message:'passwordHelp'};
 if(action!=='login'&&fields.password!==fields.confirm)return {field:'confirm',message:'confirmError'};
 return null;
}
export function parseLocalAuthResult(value:unknown,action:FormAction):LocalAuthResult{
 if(!value||typeof value!=='object'||Array.isArray(value)||!('ok' in value))throw Error('response');
 if(value.ok===false&&'error' in value&&typeof value.error==='string'&&Object.hasOwn(errorKeys,value.error))return {ok:false,error:value.error as LocalAuthError};
 if(value.ok!==true)throw Error('response');
 if(action==='login')return {ok:true};
 if(!('recoveryCode' in value)||typeof value.recoveryCode!=='string'||value.recoveryCode.length>100||!/^[a-f0-9]{64}$/i.test(value.recoveryCode.replace(/[\s-]/g,'')))throw Error('response');
 return {ok:true,recoveryCode:value.recoveryCode};
}

export function LocalAuthForm({mode,locale,returnTo,onRecovery,onSessionChanged,onBusyChange}:{mode:'login'|'register';locale:Locale;returnTo:string;onRecovery:(code:string)=>void;onSessionChanged:()=>void;onBusyChange?:(busy:boolean)=>void}){
 const a=(key:string)=>authText(locale,key),[action,setAction]=useState<FormAction>(mode),[fields,setFields]=useState<Fields>(emptyFields),[visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState<{message:string;field?:keyof Fields}|null>(null);
 const active=useRef(false),lock=useRef(false),request=useRef<AbortController|null>(null),form=useRef<HTMLFormElement>(null),errorNode=useRef<HTMLParagraphElement>(null);
 useEffect(()=>{active.current=true;return()=>{active.current=false;request.current?.abort()}},[]);
 function change(field:keyof Fields,value:string){setFields(previous=>({...previous,[field]:value}));setError(null)}
 function switchRecovery(){if(lock.current)return;setAction(action==='recover'?'login':'recover');setFields(previous=>({...emptyFields,email:previous.email}));setVisible(false);setError(null);requestAnimationFrame(()=>form.current?.querySelector<HTMLInputElement>('input[name="email"]')?.focus())}
 function showError(message:string,field?:keyof Fields){setError({message,field});requestAnimationFrame(()=>{if(!active.current)return;if(field)form.current?.querySelector<HTMLInputElement>(`input[name="${field}"]`)?.focus();else errorNode.current?.focus()})}
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(lock.current)return;const invalid=validateAuthFields(action,fields);if(invalid){showError(invalid.message,invalid.field);return}
  lock.current=true;setBusy(true);onBusyChange?.(true);setError(null);const controller=new AbortController();request.current=controller;const timeout=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch('/api/auth',{method:'POST',credentials:'same-origin',cache:'no-store',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({action,email:fields.email.trim().toLowerCase(),password:fields.password,...(action==='register'?{name:fields.name.trim()}:{}),...(action==='recover'?{recoveryCode:fields.recoveryCode}:{})})});
   const result=parseLocalAuthResult(await response.json(),action);if(!active.current)return;
   if(!response.ok&&result.ok)throw Error('response');
   if(!result.ok){showError(errorKeys[result.error]);return}
   if(result.recoveryCode)onRecovery(result.recoveryCode);else window.location.assign(safeAuthReturn(returnTo));
  }catch{if(active.current)showError('requestFailed')}finally{clearTimeout(timeout);request.current=null;lock.current=false;if(active.current){setBusy(false);onBusyChange?.(false);setVisible(false);setFields(previous=>({...previous,password:'',confirm:'',recoveryCode:''}))}}
 }
 const errorFor=(field:keyof Fields)=>error?.field===field;
 return <div className="auth-local">
  {action==='recover'&&<div className="auth-recover-intro"><h2>{a('recoverTitle')}</h2><p>{a('recoverHelp')}</p></div>}
  <form ref={form} className="auth-form" method="post" action="/api/auth" noValidate onSubmit={submit} aria-busy={busy}>
   <fieldset disabled={busy}>
    {action==='register'&&<label htmlFor="auth-name">{a('name')}<input id="auth-name" name="name" autoComplete="name" value={fields.name} required aria-invalid={errorFor('name')} aria-describedby={errorFor('name')?'auth-form-error':undefined} onChange={e=>change('name',e.target.value)}/></label>}
    <label htmlFor="auth-email">{a('email')}<input id="auth-email" name="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} dir="ltr" required value={fields.email} aria-invalid={errorFor('email')} aria-describedby={errorFor('email')?'auth-form-error':undefined} onChange={e=>change('email',e.target.value)}/></label>
    {action==='recover'&&<label htmlFor="auth-recovery-code">{a('savedCode')}<input id="auth-recovery-code" name="recoveryCode" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false} dir="ltr" required value={fields.recoveryCode} aria-invalid={errorFor('recoveryCode')} aria-describedby={errorFor('recoveryCode')?'auth-code-help auth-form-error':'auth-code-help'} onChange={e=>change('recoveryCode',e.target.value)}/><small id="auth-code-help">{a('codeHelp')}</small></label>}
    <div className="auth-password-heading"><label htmlFor="auth-password">{a(action==='recover'?'newPassword':'password')}</label><button type="button" className="auth-show-password" aria-pressed={visible} aria-label={a(visible?'hidePasswords':'showPasswords')+' '+a('password')} aria-controls={action==='login'?'auth-password':'auth-password auth-confirm'} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18} aria-hidden="true"/>:<Eye size={18} aria-hidden="true"/>}{a(visible?'hidePasswords':'showPasswords')}</button></div>
    <input id="auth-password" name="password" type={visible?'text':'password'} autoComplete={action==='login'?'current-password':'new-password'} required value={fields.password} aria-invalid={errorFor('password')} aria-describedby="auth-password-help" onChange={e=>change('password',e.target.value)}/>
    <p id="auth-password-help" className="auth-field-help">{a('passwordHelp')}</p>
    {action!=='login'&&<label htmlFor="auth-confirm">{a('confirmPassword')}<input id="auth-confirm" name="confirm" type={visible?'text':'password'} autoComplete="new-password" required value={fields.confirm} aria-invalid={errorFor('confirm')} aria-describedby={errorFor('confirm')?'auth-form-error':undefined} onChange={e=>change('confirm',e.target.value)}/></label>}
    {error&&<p ref={errorNode} id="auth-form-error" tabIndex={-1} className="auth-error" role="alert">{a(error.message)}</p>}
    {error?.message==='alreadySignedIn'&&<button type="button" className="auth-secondary" onClick={onSessionChanged}>{a('checkAccount')}</button>}
    <button className="auth-primary" type="submit" disabled={busy}>{a(busy?'submitting':action==='register'?'register':action==='recover'?'resetPassword':'login')}<ArrowUpRight size={19} aria-hidden="true"/></button>
   </fieldset>
  </form>
  {mode==='login'&&<button type="button" className="auth-recovery-toggle" disabled={busy} onClick={switchRecovery}>{a(action==='recover'?'backToLogin':'recoverLink')}</button>}
  {action==='register'&&<p className="auth-field-help auth-no-email">{a('noEmail')}</p>}
 </div>;
}

export function AuthRecovery({code,locale,onContinue}:{code:string;locale:Locale;onContinue:()=>void}){
 const a=(key:string)=>authText(locale,key),[saved,setSaved]=useState(false),[copied,setCopied]=useState(false),[copyFailed,setCopyFailed]=useState(false),heading=useRef<HTMLHeadingElement>(null),active=useRef(false);
 useEffect(()=>{active.current=true;heading.current?.focus();return()=>{active.current=false}},[]);
 useEffect(()=>{if(saved)return;const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue=''};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[saved]);
 async function copy(){try{await navigator.clipboard.writeText(code);if(active.current){setCopied(true);setCopyFailed(false)}}catch{if(active.current){setCopied(false);setCopyFailed(true)}}}
 function download(){const url=URL.createObjectURL(new Blob([a('codeFileTitle')+'\n\n'+code+'\n\n'+a('codeFileNote')+'\n'],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='daroub-recovery-code.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 return <section className="auth-recovery-success" aria-labelledby="auth-code-title"><KeyRound size={28} aria-hidden="true"/><h1 ref={heading} tabIndex={-1} id="auth-code-title">{a('saveCodeTitle')}</h1><p>{a('saveCodeHelp')}</p><label htmlFor="auth-issued-code">{a('recoveryCode')}<textarea id="auth-issued-code" dir="ltr" readOnly autoComplete="off" spellCheck={false} value={code} rows={3}/></label><div className="auth-code-actions"><button type="button" className="auth-secondary" onClick={()=>void copy()}><Copy size={18} aria-hidden="true"/>{a('copyCode')}</button><button type="button" className="auth-secondary" onClick={download}><Download size={18} aria-hidden="true"/>{a('downloadCode')}</button></div>{copied&&<p role="status" className="auth-field-help">{a('copied')}</p>}{copyFailed&&<p role="alert" className="auth-error">{a('copyFailed')}</p>}<p className="auth-field-help">{a('codePrivate')}</p><label className="auth-code-saved"><input type="checkbox" checked={saved} onChange={e=>setSaved(e.target.checked)}/><span>{a('savedCodeAck')}</span></label><button type="button" className="auth-primary" disabled={!saved} onClick={()=>{if(saved)onContinue()}}>{a('continueJourney')}<ArrowUpRight size={19} aria-hidden="true"/></button></section>;
}

export function AuthEntry({mode}:{mode:'login'|'register'}){
 const {locale}=useSite(),a=(key:string)=>authText(locale,key),card=useRef<HTMLElement>(null);
 const [returnTo,setReturnTo]=useState('/trips'),[hydrated,setHydrated]=useState(false),[issuedCode,setIssuedCode]=useState<string|null>(null),[authBusy,setAuthBusy]=useState(false);
 const [session,setSession]=useState<{account:Account|null;failed:boolean}|null>(null),[attempt,setAttempt]=useState(0);
 // Browser URL hydration follows the server's stable initial render.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{const params=new URLSearchParams(window.location.search);setReturnTo(safeAuthReturn(params.get('return_to')));setHydrated(true)},[]);
 useEffect(()=>{
  let active=true;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  void(async()=>{
   try{
    const response=await fetch('/api/session',{credentials:'same-origin',cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('unavailable');
    const value:unknown=await response.json();if(!active)return;
    if(value===null){setSession({account:null,failed:false});return}
    if(typeof value!=='object'||Array.isArray(value)||!('userId' in value)||typeof value.userId!=='string'||!value.userId)throw Error('unavailable');
    setSession({account:{userId:value.userId,displayName:'displayName' in value&&typeof value.displayName==='string'?value.displayName:undefined},failed:false});
   }catch{if(active)setSession({account:null,failed:true})}finally{clearTimeout(timeout)}
  })();
  return()=>{active=false;controller.abort();clearTimeout(timeout)};
 },[attempt]);
 useEffect(()=>{const restore=(event:PageTransitionEvent)=>{if(event.persisted){setSession(null);setAttempt(value=>value+1)}};window.addEventListener('pageshow',restore);return()=>window.removeEventListener('pageshow',restore)},[]);
 function retry(){setSession(null);setAttempt(value=>value+1);card.current?.focus({preventScroll:true})}
 const ready=hydrated&&session!==null;
 return <main id="main" className="auth-entry" dir={locale==='ar'?'rtl':'ltr'}><div className="auth-entry-layout">
  <aside className="auth-story" aria-label={a('benefitTitle')}><span className="auth-brand"><Compass size={27} aria-hidden="true"/> DAROUB</span><div className="auth-orbit" aria-hidden="true"><Compass size={110}/></div><h2>{a('benefitTitle')}</h2><ul><li><MapPin size={19} aria-hidden="true"/>{a('benefitPlaces')}</li><li><Backpack size={19} aria-hidden="true"/>{a('benefitPacking')}</li><li><ShieldCheck size={19} aria-hidden="true"/>{a('benefitTrips')}</li></ul><a href="/globe">{a('back')}<ArrowUpRight size={18} aria-hidden="true"/></a></aside>
  <section ref={card} tabIndex={-1} className="auth-card" aria-labelledby={issuedCode?'auth-code-title':'auth-title'}>
   {issuedCode?<AuthRecovery code={issuedCode} locale={locale} onContinue={()=>{setIssuedCode(null);window.location.assign(safeAuthReturn(returnTo))}}/>:<>
    <nav className="auth-mode" aria-label={a('accountPages')}><a href={authEntryHref(returnTo,'login')} aria-disabled={authBusy} onClick={event=>{if(authBusy)event.preventDefault()}} aria-current={mode==='login'?'page':undefined}>{a('login')}</a><a href={authEntryHref(returnTo,'register')} aria-disabled={authBusy} onClick={event=>{if(authBusy)event.preventDefault()}} aria-current={mode==='register'?'page':undefined}>{a('register')}</a></nav>
    <h1 id="auth-title">{a(mode==='login'?'loginTitle':'registerTitle')}</h1><p className="auth-intro">{a(mode==='login'?'loginIntro':'registerIntro')}</p>
    {!ready?<p className="auth-notice" role="status" aria-busy="true">{a('checking')}</p>:session.failed?<div className="auth-unavailable"><p className="auth-error" role="alert">{a('unavailable')}</p><button type="button" className="auth-secondary" onClick={retry}>{a('retry')}</button></div>:session.account?<div className="auth-existing"><span className="auth-existing-icon"><Check size={24} aria-hidden="true"/></span><h2>{a('existing')}</h2>{session.account.displayName&&<p>{session.account.displayName}</p>}<a className="auth-primary" href={returnTo} target="_top">{a('continueJourney')}<ArrowUpRight size={19} aria-hidden="true"/></a></div>:<><LocalAuthForm key={mode} mode={mode} locale={locale} returnTo={returnTo} onRecovery={setIssuedCode} onSessionChanged={retry} onBusyChange={setAuthBusy}/><div className="auth-provider-alternative"><p>{a('otherMethod')}</p><form method="post" action="/auth/chatgpt" target="_top" onSubmit={event=>{if(authBusy)event.preventDefault()}}><input type="hidden" name="return_to" value={safeAuthReturn(returnTo)}/><button type="submit" disabled={authBusy} className="auth-secondary auth-chatgpt">{a('continueProvider')}<ArrowUpRight size={19} aria-hidden="true"/></button></form><p className="auth-field-help">{a('sameMethod')}</p></div></>}
    <details className="auth-methods"><summary><Smartphone size={18} aria-hidden="true"/>{a('methods')}</summary><h2>{a('google')}</h2><p>{a('googleHelp')}</p><h2>{a('phone')}</h2><ol><li>{a('phone1')}</li><li>{a('phone2')}</li><li>{a('phone3')}</li></ol><p className="auth-phone-note">{a('phoneNote')}</p><a href="https://help.openai.com/en/articles/20001039" target="_blank" rel="noreferrer">{a('phoneGuide')}<ExternalLink size={14} aria-hidden="true"/></a></details>
    <noscript><p className="auth-error">{a('noScript')}</p></noscript>
   </>}
  </section>
 </div></main>;
}
