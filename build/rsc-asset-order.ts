import type {Plugin} from 'vite';

const manifestPluginName='rsc:virtual:vite-rsc/assets-manifest';

/**
 * plugin-rsc 0.5.26 collects JS dependencies before Vite 8 removes CSS-only
 * proxy chunks. Those deleted proxies otherwise become broken modulepreloads.
 * Collect from the final graph instead, after CSS metadata reaches importers.
 */
export function orderRscAssetManifest(plugins:readonly Plugin[]){
 const matches=plugins.filter(plugin=>plugin.name===manifestPluginName);
 if(matches.length!==1||!matches[0].generateBundle)throw new Error('Expected one RSC asset manifest build hook; review asset ordering after the framework update.');
 const plugin=matches[0],hook=plugin.generateBundle!;
 plugin.generateBundle=typeof hook==='function'?{order:'post',handler:hook}:{...hook,order:'post'};
}

export function rscAssetOrder():Plugin{
 return {name:'daroub:rsc-asset-order',apply:'build',configResolved(config){orderRscAssetManifest(config.plugins)}};
}
