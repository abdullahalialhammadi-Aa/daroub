import {scrypt,randomBytes,timingSafeEqual,createHash} from 'node:crypto';
import {database} from './sync-server';
import {PASSWORD_MIN,PASSWORD_MAX,type LocalAuthError,type LocalAuthResult} from './local-auth-contract';

const SESSION_SECONDS=7*24*60*60;
const SCRYPT={N:32768,r:8,p:3,maxmem:64*1024*1024};
type AuthUser={id:string;email:string;display_name:string;password_hash:string;recovery_hash:string;credential_version:number};
type HeaderReader={get(name:string):string|null};
export type LocalIdentity={userId:string;displayName:string;email:string;fullName:string;authMethod:'password'};
export class AuthError extends Error {constructor(public code:LocalAuthError,public status=400){super(code);}}
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
function randomToken(){return randomBytes(32).toString('hex');}
function equalHex(a:string,b:string){return /^[a-f0-9]{64}$/.test(a)&&/^[a-f0-9]{64}$/.test(b)&&timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex'));}
function derive(password:string,salt:string):Promise<Buffer>{return new Promise((resolve,reject)=>scrypt(password,Buffer.from(salt,'hex'),32,SCRYPT,(error,key)=>error?reject(error):resolve(key)));}
export async function passwordHash(password:string){const salt=randomBytes(16).toString('hex');return `scrypt-v1$${salt}$${(await derive(password,salt)).toString('hex')}`;}
export async function verifyPassword(password:string,stored:string|null){
 const parts=stored?.split('$');
 const valid=parts?.length===3&&parts[0]==='scrypt-v1'&&/^[a-f0-9]{32}$/.test(parts[1])&&/^[a-f0-9]{64}$/.test(parts[2]);
 const calculated=(await derive(password,valid?parts![1]:'0'.repeat(32))).toString('hex');
 return equalHex(calculated,valid?parts![2]:'0'.repeat(64))&&!!valid;
}
function loopback(host:string){return /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);}
function cookieName(headers:HeaderReader){return loopback(headers.get('host')||'')?'daroub_session_local':'__Host-daroub_session';}
export function sessionCookie(request:Request,token:string|null){
 const url=new URL(request.url),local=url.protocol==='http:'&&loopback(url.host);
 return `${local?'daroub_session_local':'__Host-daroub_session'}=${token??''}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${token?SESSION_SECONDS:0}${local?'':'; Secure'}`;
}
export function localToken(headers:HeaderReader):{present:boolean;token:string|null}{
 const name=cookieName(headers),values=(headers.get('cookie')||'').split(';').map(v=>v.trim()).filter(v=>v.split('=',1)[0]===name);
 if(!values.length)return {present:false,token:null};
 const token=values.length===1?values[0].slice(name.length+1):'';
 return {present:true,token:/^[a-f0-9]{64}$/.test(token)?token:null};
}
export async function localIdentity(headers:HeaderReader):Promise<{handled:boolean;user:LocalIdentity|null}>{
 const cookie=localToken(headers);if(!cookie.present)return {handled:false,user:null};
 if(!cookie.token)return {handled:true,user:null};
 const row=await database().prepare(`SELECT u.id,u.email,u.display_name FROM local_sessions s JOIN local_users u ON u.id=s.user_id AND u.credential_version=s.credential_version WHERE s.token_hash=? AND s.expires_at>?`).bind(digest(cookie.token),Date.now()).first<{id:string;email:string;display_name:string}>();
 return {handled:true,user:row?{userId:row.id,displayName:row.display_name,email:row.email,fullName:row.display_name,authMethod:'password'}:null};
}
export function requireOrigin(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')throw new AuthError('invalid-origin',403);}
export async function limitedBody(request:Request,max=8192){
 if(Number(request.headers.get('content-length')||0)>max)throw new AuthError('invalid-input',413);
 const reader=request.body?.getReader();if(!reader)throw new AuthError('invalid-input');
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new AuthError('invalid-input',413);}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw new AuthError('invalid-input');}
}
export function authResponse(result:LocalAuthResult,status=200,cookie?:string){
 const headers=new Headers({'Cache-Control':'no-store','Pragma':'no-cache'});if(cookie)headers.set('Set-Cookie',cookie);if(status===429)headers.set('Retry-After','900');
 return Response.json(result,{status,headers});
}
export function authFailure(error:unknown){return error instanceof AuthError?authResponse({ok:false,error:error.code},error.status):authResponse({ok:false,error:'unavailable'},503);}
function credentials(input:Record<string,unknown>){
 const email=typeof input.email==='string'?input.email.trim().toLowerCase():'';
 const password=typeof input.password==='string'?input.password:'';
 const length=Array.from(password).length;
 if(email.length>254||!email||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||length<PASSWORD_MIN||length>PASSWORD_MAX||new TextEncoder().encode(password).length>1024)throw new AuthError('invalid-input');
 return {email,password};
}
async function limit(request:Request,action:string,email:string){
 const db=database(),now=Date.now(),window=action==='register'?3600000:900000;
 const ip=request.headers.get('cf-connecting-ip')||'unavailable';
 const maxEmail=action==='login'?10:5,maxIp=action==='login'?50:action==='register'?8:20;
 // Reject a blocked address before allowing it to create buckets for arbitrary emails.
 const keys=[{key:digest(`${action}:ip:${ip}`),max:ip==='unavailable'?100:maxIp},{key:digest(`${action}:email:${email}`),max:maxEmail}];
 for(const entry of keys){
  const row=await db.prepare(`INSERT INTO auth_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<=? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END RETURNING count`).bind(entry.key,now+window,now,now).first<{count:number}>();
  if(!row||row.count>entry.max)throw new AuthError('rate-limited',429);
 }
 await db.batch([db.prepare('DELETE FROM auth_limits WHERE key IN (SELECT key FROM auth_limits WHERE reset_at<? LIMIT 100)').bind(now),db.prepare('DELETE FROM local_sessions WHERE token_hash IN (SELECT token_hash FROM local_sessions WHERE expires_at<? LIMIT 100)').bind(now)]);
}
export async function revokeLocalSession(headers:HeaderReader){const {token}=localToken(headers);if(token)await database().prepare('DELETE FROM local_sessions WHERE token_hash=?').bind(digest(token)).run();}

/** The caller validates Origin and resolves trusted platform/local identity first. */
export async function processLocalAuth(request:Request,input:Record<string,unknown>,current:{userId:string;authMethod?:string}|null){
 const action=input.action;
 if(!['register','login','recover','logout'].includes(String(action)))throw new AuthError('invalid-input');
 if(action==='logout'){
  if(current&&request.headers.get('x-daroub-account')!==current.userId)throw new AuthError('already-signed-in',409);
  await revokeLocalSession(request.headers);return authResponse({ok:true},200,sessionCookie(request,null));
 }
 if(current)throw new AuthError('already-signed-in',409);
 const {email,password}=credentials(input);await limit(request,String(action),email);
 const db=database(),now=Date.now(),token=randomToken(),tokenHash=digest(token),expires=now+SESSION_SECONDS*1000;
 if(action==='register'){
  const name=typeof input.name==='string'?input.name.trim():'';
  if(!name||Array.from(name).length>80)throw new AuthError('invalid-input');
  const hash=await passwordHash(password),recovery=randomToken(),id=`daroub:${crypto.randomUUID()}`;
  try{await db.batch([
   db.prepare('INSERT INTO local_users(id,email,display_name,password_hash,recovery_hash,credential_version,created_at) VALUES(?,?,?,?,?,1,?)').bind(id,email,name,hash,digest(recovery),now),
   db.prepare('INSERT INTO local_sessions(token_hash,user_id,credential_version,expires_at,created_at) VALUES(?,?,1,?,?)').bind(tokenHash,id,expires,now),
  ]);}catch(error){if(String(error).includes('UNIQUE constraint failed: local_users.email'))throw new AuthError('account-unavailable',409);throw error;}
  return authResponse({ok:true,recoveryCode:recovery.match(/.{8}/g)!.join('-')},201,sessionCookie(request,token));
 }
 const user=await db.prepare('SELECT * FROM local_users WHERE email=?').bind(email).first<AuthUser>();
 if(action==='login'){
  if(!await verifyPassword(password,user?.password_hash??null)||!user)throw new AuthError('invalid-credentials',401);
  // A concurrent recovery must not permit a session using superseded credentials.
  const result=await db.prepare('INSERT INTO local_sessions(token_hash,user_id,credential_version,expires_at,created_at) SELECT ?,id,credential_version,?,? FROM local_users WHERE id=? AND credential_version=? AND password_hash=?').bind(tokenHash,expires,now,user.id,user.credential_version,user.password_hash).run();
  if(result.meta.changes!==1)throw new AuthError('invalid-credentials',401);
  return authResponse({ok:true},200,sessionCookie(request,token));
 }
 const code=typeof input.recoveryCode==='string'?input.recoveryCode.replace(/[\s-]/g,'').toLowerCase():'';
 if(!/^[a-f0-9]{64}$/.test(code)||!user||!equalHex(digest(code),user.recovery_hash))throw new AuthError('invalid-credentials',401);
 const hash=await passwordHash(password),recovery=randomToken(),recoveryHash=digest(recovery);
 // Compare-and-swap plus guarded statements: only one recovery consumes the code.
 const results=await db.batch([
  db.prepare('UPDATE local_users SET password_hash=?,recovery_hash=?,credential_version=credential_version+1 WHERE id=? AND recovery_hash=? AND credential_version=?').bind(hash,recoveryHash,user.id,user.recovery_hash,user.credential_version),
  db.prepare('DELETE FROM local_sessions WHERE user_id IN (SELECT id FROM local_users WHERE id=? AND recovery_hash=?)').bind(user.id,recoveryHash),
  db.prepare('INSERT INTO local_sessions(token_hash,user_id,credential_version,expires_at,created_at) SELECT ?,id,credential_version,?,? FROM local_users WHERE id=? AND recovery_hash=? AND credential_version=?').bind(tokenHash,expires,now,user.id,recoveryHash,user.credential_version+1),
 ]);
 if(results[0].meta.changes!==1||results[2].meta.changes!==1)throw new AuthError('invalid-credentials',401);
 return authResponse({ok:true,recoveryCode:recovery.match(/.{8}/g)!.join('-')},200,sessionCookie(request,token));
}
