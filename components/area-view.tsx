'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Satellite,Map as MapIcon,Mountain,CloudSun,Aperture,Layers2,ZoomIn,ZoomOut,ExternalLink,Eye,Rotate3d,PawPrint,Bird,Fish,Bug,Rabbit,Turtle,Worm,Squirrel,Shell,Dog,Cat,TreePine,TreeDeciduous,Flower2,Wheat,Sprout,Leaf,Sun,Droplets,Tent,Wind,Footprints,MountainSnow,Snowflake,Compass,Waves,Flame} from 'lucide-react';
import {useSite} from './site-shell';
import {globeText} from '@/lib/globe-dashboard-copy';
import {areaLayer,builtinAreaLayers,clampZoom,earthLink,imageryDate,offsetFrom,placeAtOffset,remoteAreaLayer,streetViewLink,tileUrl,tilesFor,viewBounds,viewWidthMeters,AREA_DEFAULT_ZOOM,AREA_MIN_ZOOM,type AreaLayer,type AreaLayerId} from '@/lib/area-layers';
import {sceneItems,type SceneIcon,type SceneTopic} from '@/lib/area-scene';
import type {Destination,SpeciesEntry,TerrainId} from '@/lib/toolkit-types';

/** GIBS answers a day without imagery with a valid, all-black JPEG; a tiny sample tells it apart from a real tile. */
function isBlank(img:HTMLImageElement){try{const c=document.createElement('canvas');c.width=c.height=8;const ctx=c.getContext('2d');if(!ctx)return false;ctx.drawImage(img,0,0,8,8);return ctx.getImageData(0,0,8,8).data.every((v,i)=>i%4===3||v<6);}catch{return false;}}
const layerIcons={imagery:Satellite,topo:MapIcon,relief:Mountain,sky:CloudSun,google:Aperture,mapbox:Layers2} as const;
const layerKeys={imagery:'layerImagery',topo:'layerTopo',relief:'layerRelief',sky:'layerSky',google:'layerGoogle',mapbox:'layerMapbox'} as const;
const sceneIcons:Record<SceneIcon,typeof Sun>={paw:PawPrint,bird:Bird,fish:Fish,bug:Bug,rabbit:Rabbit,turtle:Turtle,worm:Worm,squirrel:Squirrel,shell:Shell,dog:Dog,cat:Cat,treePine:TreePine,treeDeciduous:TreeDeciduous,flower:Flower2,wheat:Wheat,sprout:Sprout,leaf:Leaf,sun:Sun,droplets:Droplets,tent:Tent,wind:Wind,footprints:Footprints,mountainSnow:MountainSnow,snowflake:Snowflake,compass:Compass,waves:Waves,flame:Flame};
const DRAG_THRESHOLD=5,SCENE_ZOOM=15,SCENE_TILT='rotateX(52deg) scale(1.9) ';

/**
 * A north-up detail view of the locked place: imagery tiles, the selection at the centre, catalogue destinations in view as markers.
 * Paid providers announced by /api/tiles come first in the switcher; dragging pans the area, clicking moves the focus point.
 * At street scale (or on demand) the imagery tilts into an angled scene with icons of the terrain's life and essentials.
 */
export function AreaView({lat,lon,label,terrainId,species,destinations,selectedId,onPick,onPickDestination,onTopic}:{lat:number;lon:number;label:string;terrainId:TerrainId;species:SpeciesEntry[];destinations:Destination[];selectedId:string|null;onPick:(point:{lat:number;lon:number})=>void;onPickDestination:(destination:Destination)=>void;onTopic?:(topic:SceneTopic,text:string)=>void}){
 const {locale,tr}=useSite(),g=(key:string)=>globeText(locale,key);
 const [remote,setRemote]=useState<AreaLayer[]>([]),[chosen,setChosen]=useState<AreaLayerId|null>(null),[zoom,setZoom]=useState(AREA_DEFAULT_ZOOM),[size,setSize]=useState({w:0,h:0});
 const [failed,setFailed]=useState<Set<string>>(()=>new Set()),[copyright,setCopyright]=useState(''),[pan,setPan]=useState({dx:0,dy:0,active:false}),[sceneChoice,setSceneChoice]=useState<boolean|null>(null);
 const host=useRef<HTMLDivElement>(null),wheelAt=useRef(0),drag=useRef<{id:number;x:number;y:number;dx:number;dy:number;moved:boolean}|null>(null),skipClick=useRef(false);
 const layers=useMemo(()=>[...remote,...builtinAreaLayers],[remote]);
 // The operator's paid provider is the default view when its key works; otherwise the key-free imagery.
 const layer=areaLayer(chosen??layers[0].id,layers),z=clampZoom(zoom,layer),date=imageryDate();
 // The scene is the final view: it turns on at street scale unless the user chose otherwise, and the button toggles it at any zoom.
 const sceneOn=sceneChoice??z>=SCENE_ZOOM;
 useEffect(()=>{let active=true;fetch('/api/tiles',{credentials:'same-origin'}).then((r):Promise<{providers?:unknown[]}>=>r.ok?r.json():Promise.resolve({providers:[]})).then(data=>{if(!active)return;const list=(Array.isArray(data.providers)?data.providers:[]).map(item=>remoteAreaLayer(item as {id?:unknown;maxZoom?:unknown;credit?:unknown})).filter((item):item is AreaLayer=>!!item);setRemote(list);}).catch(()=>{});return()=>{active=false;};},[]);
 useEffect(()=>{const el=host.current;if(!el)return;const ro=new ResizeObserver(()=>setSize({w:el.clientWidth,h:el.clientHeight}));ro.observe(el);return()=>ro.disconnect();},[]);
 // The grid is widened by the pan and by the tilt so no bare ground shows at the edges of the pane.
 const marginX=(sceneOn?size.w*0.2:0)+Math.abs(pan.dx),marginY=(sceneOn?size.h*0.5:0)+Math.abs(pan.dy);
 const tiles=useMemo(()=>tilesFor(layer,{lat,lon},z,size.w+2*marginX,size.h+2*marginY,date).map(tile=>({...tile,left:tile.left-marginX,top:tile.top-marginY})),[layer,lat,lon,z,size.w,size.h,date,marginX,marginY]);
 const allFailed=tiles.length>0&&tiles.every(tile=>failed.has(tile.url));
 const markers=useMemo(()=>destinations.map(destination=>({destination,...offsetFrom({lat,lon},destination,z)})).filter(m=>Math.abs(m.dx)<size.w/2-20&&Math.abs(m.dy)<size.h/2-20&&(Math.abs(m.dx)>14||Math.abs(m.dy)>14)),[destinations,lat,lon,z,size.w,size.h]);
 const scene=useMemo(()=>sceneItems(terrainId,species,Math.min(size.w,size.h)*0.26),[terrainId,species,size.w,size.h]);
 // Google's terms require the copyright of the visible area; it is fetched through the proxy, debounced while the view settles.
 useEffect(()=>{if(layer.id!=='google'||size.w===0)return;const controller=new AbortController();const bounds=viewBounds({lat,lon},z,size.w,size.h);const q=new URLSearchParams({provider:'google',attribution:'1',zoom:String(z),north:String(bounds.north),south:String(bounds.south),east:String(bounds.east),west:String(bounds.west)});
  const timer=setTimeout(()=>{fetch('/api/tiles?'+q.toString(),{credentials:'same-origin',signal:controller.signal}).then((r):Promise<{copyright?:unknown}>=>r.ok?r.json():Promise.resolve({})).then(data=>{if(!controller.signal.aborted)setCopyright(typeof data.copyright==='string'?data.copyright:'');}).catch(()=>{});},400);
  return()=>{clearTimeout(timer);controller.abort();};},[layer.id,lat,lon,z,size.w,size.h]);
 // A paid provider has no tile beyond its local coverage (404). Holes are filled with the key-free imagery tile of the same address, credited,
 // so zooming in stays possible; only past the fill's own limit does the view step out until imagery exists.
 const fill=layer.remote&&z<=areaLayer('imagery').maxZoom?areaLayer('imagery'):null,filled=!!fill&&tiles.some(tile=>failed.has(tile.url));
 useEffect(()=>{if(!allFailed||!layer.remote||fill||z<=AREA_MIN_ZOOM)return;const timer=setTimeout(()=>setZoom(z-1),150);return()=>clearTimeout(timer);},[allFailed,layer.remote,fill,z]);
 // Functional update: rapid clicks or wheel ticks must not read a stale zoom from the render closure.
 const step=(delta:number)=>setZoom(prev=>clampZoom(clampZoom(prev,layer)+delta,layer));
 const markFailed=(url:string)=>setFailed(prev=>{const next=new Set(prev);next.add(url);return next;});
 const widthMeters=viewWidthMeters(lat,z,size.w),km=Math.round(widthMeters/1000);
 const credit=(layer.id==='google'&&copyright?`Google · ${copyright}`:layer.credit)+(filled?` · ${fill!.credit}`:'');
 // Drag to pan: the pane follows the pointer; on release the place under the centre becomes the new focus point.
 const onPointerDown=(event:React.PointerEvent<HTMLDivElement>)=>{if(event.button!==0||(event.target as HTMLElement).closest('button'))return;drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,dy:0,moved:false};event.currentTarget.setPointerCapture(event.pointerId);};
 const onPointerMove=(event:React.PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==event.pointerId)return;d.dx=event.clientX-d.x;d.dy=event.clientY-d.y;if(!d.moved&&Math.hypot(d.dx,d.dy)<DRAG_THRESHOLD)return;d.moved=true;setPan({dx:d.dx,dy:d.dy,active:true});};
 const endDrag=(event:React.PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==event.pointerId)return;drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);if(!d.moved)return;skipClick.current=true;setPan({dx:0,dy:0,active:false});onPick(placeAtOffset({lat,lon},z,-d.dx,-d.dy));};
 const paneStyle=pan.active?{transform:`${sceneOn?SCENE_TILT:''}translate(${pan.dx/(sceneOn?1.9:1)}px,${pan.dy/(sceneOn?1.9:1)}px)`}:undefined;
 return <>
  <div ref={host} className={'gc-area'+(pan.active?' gc-dragging':'')+(sceneOn?' gc-scene':'')} role="group" tabIndex={-1} aria-label={label} title={g('dragHint')}
   onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}
   onClick={event=>{if(skipClick.current){skipClick.current=false;return;}if((event.target as HTMLElement).closest('button'))return;const rect=event.currentTarget.getBoundingClientRect();onPick(placeAtOffset({lat,lon},z,event.clientX-rect.left-rect.width/2,event.clientY-rect.top-rect.height/2));}}
   onWheel={event=>{if(event.deltaY===0)return;const now=Date.now();if(now-wheelAt.current<220)return;wheelAt.current=now;step(event.deltaY<0?1:-1);}}>
   <div className="gc-area-pane" style={paneStyle}>
    {tiles.map(tile=>failed.has(tile.url)?(fill?<img key={tile.key+'-fill'} src={tileUrl(fill,tile.z,tile.x,tile.y,date)} alt="" draggable={false} decoding="async" referrerPolicy="strict-origin-when-cross-origin" style={{left:tile.left,top:tile.top}}/>:null):<img key={tile.key} src={tile.url} alt="" draggable={false} decoding="async" crossOrigin={layer.dated?'anonymous':undefined} referrerPolicy={layer.remote?'same-origin':'strict-origin-when-cross-origin'} style={{left:tile.left,top:tile.top}} onLoad={event=>{if(layer.dated&&isBlank(event.currentTarget))markFailed(tile.url);}} onError={()=>markFailed(tile.url)}/>)}
    {markers.map(({destination,dx,dy})=><button key={destination.id} type="button" className="gc-area-dest" style={{left:`calc(50% + ${Math.round(dx)}px)`,top:`calc(50% + ${Math.round(dy)}px)`}} aria-pressed={destination.id===selectedId} onClick={()=>{host.current?.focus({preventScroll:true});onPickDestination(destination);}}>{tr(destination.names)}</button>)}
    {sceneOn&&scene.map(item=>{const Icon=sceneIcons[item.icon];return <button key={item.id} type="button" className={'gc-scene-item gc-'+item.kind} style={{left:`calc(50% + ${item.dx}px)`,top:`calc(50% + ${item.dy}px)`}} aria-label={tr(item.label)} onClick={()=>onTopic?.(item.topic,tr(item.label))}><i><Icon aria-hidden/></i><span>{tr(item.label)}</span></button>;})}
   </div>
   {allFailed&&!fill&&(!layer.remote||z<=AREA_MIN_ZOOM)&&<p className="gc-area-note" role="status">{g('areaUnavailable')}</p>}
   {sceneOn&&<p className="gc-scene-note">{g('sceneNote')}</p>}
   <div className="gc-area-mark" aria-hidden/>
  </div>
  <div className="gc-layers" role="group" aria-label={g('areaLayers')}>
   {layers.map(item=>{const Icon=layerIcons[item.id];return <button key={item.id} type="button" aria-pressed={item.id===layer.id} aria-label={g(layerKeys[item.id])} title={g(layerKeys[item.id])} onClick={()=>setChosen(item.id)}><Icon size={18} aria-hidden/></button>;})}
   <button type="button" className="gc-scene-toggle" aria-pressed={sceneOn} aria-label={g('sceneToggle')} title={g('sceneToggle')} onClick={()=>setSceneChoice(!sceneOn)}><Rotate3d size={18} aria-hidden/></button>
   <hr/>
   <button type="button" aria-label={tr(['تقريب','Zoom in','Agrandir','放大','ज़ूम इन'])} aria-disabled={z>=layer.maxZoom} onClick={()=>step(1)}><ZoomIn size={18} aria-hidden/></button>
   <button type="button" aria-label={tr(['تبعيد','Zoom out','Réduire','缩小','ज़ूम आउट'])} aria-disabled={z<=AREA_MIN_ZOOM} onClick={()=>step(-1)}><ZoomOut size={18} aria-hidden/></button>
   <hr/>
   <a href={earthLink(lat,lon,widthMeters)} target="_blank" rel="noreferrer noopener" aria-label={g('openEarth')} title={g('openEarth')}><ExternalLink size={18} aria-hidden/></a>
   <a href={streetViewLink(lat,lon)} target="_blank" rel="noreferrer noopener" aria-label={g('openStreetView')} title={g('openStreetView')}><Eye size={18} aria-hidden/></a>
  </div>
  <p className="gc-area-credit">{credit}{layer.dated?` · ${date}`:''}{km>0?` · ${g('viewWidth')} ≈ ${km} km`:''}</p>
 </>;
}
