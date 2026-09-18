import {getChatGPTUser} from '@/app/chatgpt-auth';
import {readTeam,mutateTeam} from '@/lib/team-server';
import {parseTeamAction,TeamError} from '@/lib/team-domain';
import {preparationReadOnly} from '@/lib/release-mode';
const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer'};
const fail=(error:unknown)=>Response.json({error:error instanceof TeamError?error.code:'service_unavailable'},{status:error instanceof TeamError?error.status:503,headers});
export async function GET(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'unauthorized'},{status:401,headers});
 if(request.headers.get('X-Daroub-Account')!==user.userId)return Response.json({error:'account_changed'},{status:409,headers});
 try{return Response.json(await readTeam(user.userId,new URL(request.url)),{headers})}catch(error){return fail(error)}
}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'unauthorized'},{status:401,headers});
 if(request.headers.get('X-Daroub-Account')!==user.userId)return Response.json({error:'account_changed'},{status:409,headers});
 if(request.headers.get('Origin')!==new URL(request.url).origin)return Response.json({error:'forbidden'},{status:403,headers});
 if(preparationReadOnly())return Response.json({error:'read_only'},{status:503,headers});
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return Response.json({error:'invalid'},{status:415,headers});
 try{const text=await request.text();if(new TextEncoder().encode(text).length>16384)throw new TeamError('invalid',413);let input:unknown;try{input=JSON.parse(text)}catch{throw new TeamError('invalid')}return Response.json(await mutateTeam(user.userId,parseTeamAction(input)),{headers})}catch(error){return fail(error)}
}
