/** Keep only trip selection fields; the return path is always local and fixed. */
export function tripSignInHref(search:string){
 const input=new URLSearchParams(search),allowed=new URLSearchParams();
 for(const key of ['trip','destination','terrainId','lat','lon','group','activity']){
  const value=input.get(key);if(value&&value.length<=100)allowed.set(key,value);
 }
 const target='/trips'+(allowed.size?'?'+allowed.toString():'');
 return '/login?return_to='+encodeURIComponent(target);
}
