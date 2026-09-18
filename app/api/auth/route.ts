import {getChatGPTUser} from '@/app/chatgpt-auth';
import {AuthError,authFailure,limitedBody,processLocalAuth,requireOrigin} from '@/lib/local-auth-server';
export async function POST(request:Request){
 try{
  requireOrigin(request);
  if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')throw new AuthError('invalid-input',415);
  let input:unknown;try{input=JSON.parse(await limitedBody(request));}catch(error){if(error instanceof AuthError)throw error;throw new AuthError('invalid-input');}
  if(!input||typeof input!=='object'||Array.isArray(input))throw new AuthError('invalid-input');
  return await processLocalAuth(request,input as Record<string,unknown>,await getChatGPTUser());
 }catch(error){return authFailure(error);}
}
