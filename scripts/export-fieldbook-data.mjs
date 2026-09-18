import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await mkdir('work',{recursive:true});
await build({stdin:{contents:"export {seedCatalog as catalog} from './lib/catalog-seed'; export {terrains,locales,words} from './lib/terrain';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile:'work/fieldbook-catalog.mjs'});
const data=await import(pathToFileURL(resolve('work/fieldbook-catalog.mjs')).href+'?fresh='+Date.now());
await writeFile('work/fieldbook-data.json',JSON.stringify(data));
console.log('Fieldbook catalog exported.');
