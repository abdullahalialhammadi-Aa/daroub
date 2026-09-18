import {readCatalog} from '@/lib/catalog-server';
const headers={'Cache-Control':'no-store'};
export async function GET(){try{return Response.json(await readCatalog(),{headers})}catch{return Response.json({error:'Catalog unavailable'},{status:503,headers})}}
