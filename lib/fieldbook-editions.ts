import manifest from './fieldbook-pdfs.json';
import type {Locale} from './terrain';
export type FieldbookEdition={url:string;pages:number;publishedAt:string};
/** PDF editions are dated reference copies; the live reader uses the current catalog. */
export function fieldbookPdf(destinationId:string|undefined,terrainId:string,locale:Locale):FieldbookEdition|undefined{
 const editions=manifest as Record<string,Partial<Record<Locale,FieldbookEdition>>>;
 return editions[destinationId??`terrain-${terrainId}`]?.[locale];
}
