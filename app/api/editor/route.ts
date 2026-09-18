import {getChatGPTUser} from '@/app/chatgpt-auth';
import {editorRole,editorState,saveCatalogDraft,publishCatalogDraft,rollbackCatalog,CatalogConflict,CatalogInvalid} from '@/lib/catalog-server';
import {recordId} from '@/lib/preparation-schema';
import {preparationReadOnly} from '@/lib/release-mode';
const headers={'Cache-Control':'no-store'};
export async function GET(){const user=await getChatGPTUser();if(!user)return Response.json({error:'Sign in required'},{status:401,headers});const role=editorRole(user.userId);if(!role)return Response.json({error:'Editor access required'},{status:403,headers});try{return Response.json({role,...await editorState()},{headers})}catch{return Response.json({error:'Editor unavailable'},{status:503,headers})}}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Sign in required'},{status:401,headers});const role=editorRole(user.userId);if(!role)return Response.json({error:'Editor access required'},{status:403,headers});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403,headers});
 if(preparationReadOnly())return Response.json({error:'Read-only recovery mode'},{status:503,headers:{...headers,'Retry-After':'300'}});
 if(!request.headers.get('content-type')?.startsWith('application/json'))return Response.json({error:'JSON required'},{status:415,headers});
 try{
  const text=await request.text();if(new TextEncoder().encode(text).length>4*1024*1024)return Response.json({error:'Payload too large'},{status:413,headers});
  const body=JSON.parse(text);if(body.action==='save')return Response.json(await saveCatalogDraft(user.userId,body.draft),{headers});
  if(role!=='owner')return Response.json({error:'Owner publication required'},{status:403,headers});
  if(!Number.isSafeInteger(body.revision)||body.revision<0||!Number.isSafeInteger(body.expectedCatalogRevision)||body.expectedCatalogRevision<0)throw new CatalogInvalid('Invalid revision');
  if(body.action==='publish'&&recordId.safeParse(body.id).success)return Response.json(await publishCatalogDraft(user.userId,body.id,body.revision,body.expectedCatalogRevision),{headers});
  if(body.action==='rollback')return Response.json(await rollbackCatalog(user.userId,body.revision,body.expectedCatalogRevision),{headers});
  throw new CatalogInvalid('Invalid action');
 }catch(error){const status=error instanceof CatalogConflict?409:error instanceof CatalogInvalid||error instanceof SyntaxError?400:503;return Response.json({error:status===503?'Editor unavailable':error instanceof Error?error.message:'Invalid request'},{status,headers})}
}
