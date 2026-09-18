import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
export function createLoader(mocks={},root=process.cwd()){
 const cache=new Map();
 function load(file){let absolute=path.resolve(root,file);if(!path.extname(absolute)){absolute+=fs.existsSync(absolute+'.ts')?'.ts':'.tsx'}if(absolute.endsWith('.json'))return JSON.parse(fs.readFileSync(absolute,'utf8'));if(cache.has(absolute))return cache.get(absolute).exports;
  const loadedModule={exports:{}};cache.set(absolute,loadedModule);const result=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const localRequire=name=>Object.hasOwn(mocks,name)?mocks[name]:name.startsWith('@/')?load(name.slice(2)):name.startsWith('.')?load(path.resolve(path.dirname(absolute),name)):require(name);new Function('require','module','exports',result)(localRequire,loadedModule,loadedModule.exports);return loadedModule.exports;
 }return load;
}

