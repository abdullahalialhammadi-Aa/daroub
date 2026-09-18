import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createLoader} from './helpers/load-ts.mjs';
const {orderRscAssetManifest,rscAssetOrder}=createLoader()('build/rsc-asset-order.ts');
const name='rsc:virtual:vite-rsc/assets-manifest';

test('RSC manifest collects the final CSS graph instead of removed JavaScript placeholders',async()=>{
 const manifest={name,generateBundle(_options,bundle){assert.equal(this.environment.name,'client');this.deps={js:[...bundle.entry.imports],css:[...bundle.entry.css]}}};
 const css={name:'vite:css-post',generateBundle(_options,bundle){bundle.entry.imports=[];bundle.entry.css.push(...bundle.proxy.css);delete bundle.proxy}};
 const plugins=[manifest,css],context={environment:{name:'client'}};
 const bundle=()=>({entry:{imports:['proxy'],css:[]},proxy:{css:['preparation.css']}});
 const run=async graph=>{for(const plugin of [...plugins].sort((a,b)=>(a.generateBundle.order==='post'?1:0)-(b.generateBundle.order==='post'?1:0))){const hook=plugin.generateBundle;await (typeof hook==='function'?hook:hook.handler).call(context,{},graph)}};
 await run(bundle());assert.deepEqual(context.deps,{js:['proxy'],css:[]});
 orderRscAssetManifest(plugins);await run(bundle());assert.deepEqual(context.deps,{js:[],css:['preparation.css']});
});
test('ordering preserves hook metadata and context and leaves unrelated plugins unchanged',()=>{
 const handler=function(){return this.marker},manifest={name,generateBundle:{handler,order:'pre',sequential:true}},other={name:'other',generateBundle:()=>{}};
 orderRscAssetManifest([other,manifest]);assert.equal(manifest.generateBundle.order,'post');assert.equal(manifest.generateBundle.sequential,true);assert.equal(manifest.generateBundle.handler,handler);assert.equal(manifest.generateBundle.handler.call({marker:7}),7);assert.equal(typeof other.generateBundle,'function');
 orderRscAssetManifest([manifest]);assert.equal(manifest.generateBundle.handler,handler);
});
test('build-only guard fails visibly if an upstream update changes the targeted manifest hook',()=>{
 assert.equal(rscAssetOrder().apply,'build');
 for(const plugins of [[],[{name}],[{name,generateBundle(){}},{name,generateBundle(){}}]])assert.throws(()=>orderRscAssetManifest(plugins),/review asset ordering/);
});

const manifests=['dist/server/__vite_rsc_assets_manifest.js','dist/server/ssr/__vite_rsc_assets_manifest.js'];
test('fresh build manifests reference emitted JS/CSS and retain both preparation stylesheets',{skip:!manifests.some(file=>fs.existsSync(file))},()=>{
 for(const file of manifests){
  const manifest=JSON.parse(fs.readFileSync(file,'utf8').replace(/^export default /,''));
  const entries=[...Object.values(manifest.clientReferenceDeps),...Object.values(manifest.serverResources)],js=[...new Set(entries.flatMap(entry=>entry.js))],css=[...new Set(entries.flatMap(entry=>entry.css))];
  const bootstrap=manifest.bootstrapScriptContent.match(/import\("([^"]+)"\)/)?.[1];assert.ok(bootstrap,file+': bootstrap');
  for(const url of [...js,...css,bootstrap])assert.ok(fs.existsSync(path.join('dist/client',url.slice(1))),file+': missing '+url);
  assert.ok(css.some(url=>/\/preparation\.[^/]+\.css$/.test(url)),file+': preparation styles');
  assert.ok(css.some(url=>/\/preparation-release\.[^/]+\.css$/.test(url)),file+': release styles');
 }
});
