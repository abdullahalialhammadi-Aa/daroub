const CACHE='daroub-offline-v5';
const assets=['/offline-fallback','/offline-shell.js','/offline-shell.css','/favicon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(assets)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('daroub-offline-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(url.origin!==self.location.origin||event.request.method!=='GET')return;
 if(event.request.mode==='navigate'&&url.pathname==='/signout-with-chatgpt'){event.respondWith(finishSignout(event.request));return;}
 if(event.request.mode==='navigate'){if(url.pathname.startsWith('/sign')||url.pathname==='/callback')return;event.respondWith(fetch(event.request).catch(()=>caches.match('/offline-fallback')));return;}
 if(assets.includes(url.pathname))event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});

/** The authenticated owner is captured before cleanup; another account's rows are never cleared. */
async function purgeOwner(owner){
 if(typeof owner!=='string'||!owner)throw Error('Owner unavailable');
 await Promise.all(['daroub-toolkit','daroub-preparation-v2'].map(name=>new Promise((resolve,reject)=>{
  const request=indexedDB.open(name,1);
  request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Storage blocked'));
  request.onupgradeneeded=()=>{const stores=name==='daroub-toolkit'?['records','outbox','guides']:['records','outbox','meta'];for(const store of stores)if(!request.result.objectStoreNames.contains(store))request.result.createObjectStore(store,{keyPath:'key'})};
  request.onsuccess=()=>{const db=request.result,stores=['records','outbox','meta'].filter(store=>db.objectStoreNames.contains(store));if(!stores.length){db.close();resolve();return}const tx=db.transaction(stores,'readwrite');
   for(const store of stores){const cursorRequest=tx.objectStore(store).openCursor();cursorRequest.onsuccess=()=>{const cursor=cursorRequest.result;if(!cursor)return;const row=cursor.value,markerOwner=store==='meta'&&typeof row.key==='string'&&row.key.startsWith('legacy:')?row.key.slice(7,row.key.lastIndexOf(':')):null;if(row.value?.owner===owner||markerOwner===owner)cursor.delete();cursor.continue()};}
   tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)};tx.onabort=()=>{db.close();reject(tx.error??Error('Cleanup failed'))};
  };
 })));
}
function signoutUnavailable(){
 const messages=[
  ['ar','rtl','تعذّر إكمال تسجيل الخروج','تعذّر التحقق من الحساب أو مسح نسخه الخاصة. أعد الاتصال وحاول مجدداً لإكمال تسجيل الخروج.','إعادة المحاولة'],
  ['en','ltr','Sign-out could not finish','The account could not be verified or its private copies cleared. Reconnect and retry to finish signing out.','Retry'],
  ['fr','ltr','Déconnexion incomplète','Le compte n’a pas pu être vérifié ou ses copies privées effacées. Reconnectez-vous puis réessayez.','Réessayer'],
  ['zh','ltr','退出尚未完成','无法确认账户或清除其私人副本。请重新连接后重试以完成退出。','重试'],
  ['hi','ltr','साइन आउट पूरा नहीं हुआ','खाते की पुष्टि या निजी प्रतियों की सफ़ाई नहीं हो सकी। इंटरनेट से जुड़कर फिर प्रयास करें।','फिर प्रयास करें'],
 ];
 return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Daroub · Sign out</title><style>body{font:18px/1.7 system-ui;background:#f7faf9;color:#16313a;margin:0}main{max-width:780px;margin:auto;padding:24px}section{border-bottom:1px solid #bdcdca;padding-block:16px}h1{font-size:1.25rem}a{display:inline-block;padding:8px 16px;border:1px solid currentColor;border-radius:8px;color:#873d24}a:focus-visible{outline:3px solid #873d24;outline-offset:3px}</style></head><body><main>'+messages.map(([lang,dir,title,body,retry])=>'<section lang="'+lang+'" dir="'+dir+'"><h1>'+title+'</h1><p>'+body+'</p><a href="/signout-with-chatgpt?return_to=/">'+retry+'</a></section>').join('')+'</main></body></html>',{status:503,headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'self'"}});
}
async function finishSignout(request){
 try{
  const response=await fetch(new URL('/api/session',self.location.origin).href,{credentials:'same-origin',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error('Session unavailable');const session=await response.json(),owner=session?.userId;
  if(typeof owner!=='string'||!owner)throw Error('Owner unavailable');
  await purgeOwner(owner);
  return await fetch(request);
 }catch{return signoutUnavailable();}
}


