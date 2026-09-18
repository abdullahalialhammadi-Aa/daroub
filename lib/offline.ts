import type {Locale} from './terrain';
import {allLocal,readLocal,writeLocal,removeLocal} from './local-db';
export interface SavedGuide{id:string;destinationId:string;locale:Locale;html:string;savedAt:string;title:string}
export async function saveGuide(destinationId:string,locale:Locale,html:string,title=destinationId):Promise<SavedGuide>{const guide={id:destinationId+'-'+locale,destinationId,locale,html,title,savedAt:new Date().toISOString()};await writeLocal('guides',guide.id,guide);return guide}
export async function listGuides(){return(await allLocal<SavedGuide>('guides')).map(r=>r.value)}
export async function getGuide(id:string){return readLocal<SavedGuide>('guides',id)}
export async function deleteGuide(id:string){await removeLocal('guides',id)}
