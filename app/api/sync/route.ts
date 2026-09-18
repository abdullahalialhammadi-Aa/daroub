import {getChatGPTUser} from '@/app/chatgpt-auth';
import {validateMutation} from '@/lib/sync-validation';
import {applyMutation,snapshot,MutationReuseError,UpgradeRequired} from '@/lib/sync-server';
import {readCatalog} from '@/lib/catalog-server';
import {preparationReadOnly} from '@/lib/release-mode';
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request){const u=await getChatGPTUser();if(!u)return Response.json({error:'Sign in required'},{status:401,headers});if(request.headers.get('X-Daroub-Account')!==u.userId)return Response.json({error:'Account changed'},{status:409,headers});try{return Response.json({records:await snapshot(u.userId,request.headers.get('X-Daroub-Protocol')==='2'?2:1)},{headers})}catch{return Response.json({error:'Storage unavailable'},{status:503,headers})}}
export async function POST(request:Request){
 const u=await getChatGPTUser();if(!u)return Response.json({error:'Sign in required'},{status:401,headers});
 if(request.headers.get('X-Daroub-Account')!==u.userId)return Response.json({error:'Account changed'},{status:409,headers});
 if(preparationReadOnly())return Response.json({error:'Read-only recovery mode; pending changes retained'},{status:503,headers:{...headers,'Retry-After':'300'}});
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403,headers});
 if(!request.headers.get('content-type')?.startsWith('application/json'))return Response.json({error:'JSON required'},{status:415,headers});
 let mutation;try{const text=await request.text();if(new TextEncoder().encode(text).length>1048576)return Response.json({error:'Payload too large'},{status:413,headers});const raw=JSON.parse(text);if(raw.protocol===2&&request.headers.get('X-Daroub-Protocol')!=='2')throw new UpgradeRequired();mutation=validateMutation(raw);}catch(error){const upgrade=error instanceof UpgradeRequired||(error instanceof Error&&error.message==='Upgrade required');return Response.json({error:upgrade?'Upgrade required':'Invalid mutation'},{status:upgrade?426:400,headers});}
 try{
  if(mutation.payload&&mutation.entity!=='gear'&&'destinationId' in mutation.payload&&mutation.payload.destinationId){const destinationId=mutation.payload.destinationId,catalog=await readCatalog(),destination=catalog.destinations.find(d=>d.id===destinationId);if(!destination||destination.terrainId!==mutation.payload.terrainId)return Response.json({error:'Invalid destination'},{status:400,headers})}
  return Response.json(await applyMutation(u.userId,mutation),{headers});
 }catch(error){return Response.json({error:error instanceof UpgradeRequired?'Upgrade required':error instanceof MutationReuseError?'Operation ID reused':'Storage unavailable'},{status:error instanceof UpgradeRequired?426:error instanceof MutationReuseError?409:503,headers})}
}
