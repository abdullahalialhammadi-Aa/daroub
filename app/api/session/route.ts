import {getChatGPTUser} from '@/app/chatgpt-auth';
import {preparationReadOnly} from '@/lib/release-mode';
export async function GET(){try{const user=await getChatGPTUser();return Response.json(user?{userId:user.userId,displayName:user.displayName,readOnly:preparationReadOnly(),authMethod:user.authMethod??'chatgpt'}:null,{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}}
