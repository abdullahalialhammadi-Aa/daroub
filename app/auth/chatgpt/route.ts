import {safeAuthReturn} from '@/lib/auth-entry';
import {authFailure,AuthError,limitedBody,requireOrigin,revokeLocalSession,sessionCookie} from '@/lib/local-auth-server';
/** Native form navigation keeps the dispatch-managed sign-in flow out of client fetches. */
export async function POST(request:Request){
 try{
  requireOrigin(request);
  if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/x-www-form-urlencoded')throw new AuthError('invalid-input',415);
  const fields=new URLSearchParams(await limitedBody(request,2048));
  const returnTo=safeAuthReturn(fields.get('return_to'));
  await revokeLocalSession(request.headers);
  return new Response(null,{status:303,headers:{Location:`/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`,'Cache-Control':'no-store','Set-Cookie':sessionCookie(request,null)}});
 }catch(error){return authFailure(error);}
}
