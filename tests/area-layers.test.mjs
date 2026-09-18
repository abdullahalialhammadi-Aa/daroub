import test from 'node:test';
import assert from 'node:assert/strict';
import {createLoader} from './helpers/load-ts.mjs';
const {builtinAreaLayers,areaLayer,remoteAreaLayer,clampZoom,imageryDate,tilePoint,tileToLatLon,offsetFrom,placeAtOffset,viewBounds,tileUrl,tilesFor,viewWidthKm,earthLink,streetViewLink,AREA_MIN_ZOOM,AREA_DEFAULT_ZOOM}=createLoader()('lib/area-layers.ts');

test('tile arithmetic follows the slippy-map convention and inverts cleanly',()=>{
  assert.deepEqual(tilePoint(0,0,0),{x:0.5,y:0.5});
  const p=tilePoint(48.3,8.2,10);
  assert.equal(Math.floor(p.x),535);assert.equal(Math.floor(p.y),354);
  assert.deepEqual(tileToLatLon(p.x,p.y,10),{lat:48.3,lon:8.2});
  assert.ok(tilePoint(89,0,2).y<0.001,'latitudes past the mercator limit clamp to the top row');
  assert.equal(tilePoint(0,190,1).x,tilePoint(0,-170,1).x);
});

test('tiles cover the viewport around the centre, wrap at the antimeridian and skip rows outside the world',()=>{
  const layer=areaLayer('relief'),tiles=tilesFor(layer,{lat:48.3,lon:8.2},8,700,400,'2026-09-17');
  assert.ok(tiles.length>=6&&tiles.length<=12,'a 700×400 view needs a small grid');
  for(const tile of tiles){assert.ok(tile.left>-256&&tile.left<700);assert.ok(tile.top>-256&&tile.top<400);assert.match(tile.url,/ASTER_GDEM_Color_Shaded_Relief\/default\/default\/GoogleMapsCompatible_Level12\/8\/\d+\/\d+\.png$/);}
  const wrapped=tilesFor(layer,{lat:0,lon:179.9},4,700,300,'2026-09-17');
  assert.ok(wrapped.some(tile=>tile.x===0)&&wrapped.some(tile=>tile.x===15),'the antimeridian view shows both edges');
  const polar=tilesFor(layer,{lat:84.9,lon:0},3,700,900,'2026-09-17');
  assert.ok(polar.every(tile=>tile.y>=0&&tile.y<8));
  assert.deepEqual(tilesFor(layer,{lat:0,lon:0},5,0,0,'2026-09-17'),[]);
});

test('built-in layers pin their template, maximum zoom and dated imagery; paid providers become proxy layers',()=>{
  assert.deepEqual(builtinAreaLayers.map(layer=>layer.id),['imagery','topo','relief','sky']);
  assert.equal(tileUrl(areaLayer('imagery'),18,90670,136999,'2026-09-17'),'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/18/136999/90670');
  assert.equal(tileUrl(areaLayer('topo'),14,8562,5666,'x'),'https://tile.opentopomap.org/14/8562/5666.png');
  assert.equal(tileUrl(areaLayer('sky'),9,10,20,'2026-09-17'),'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2026-09-17/GoogleMapsCompatible_Level9/9/20/10.jpg');
  assert.equal(clampZoom(14,areaLayer('sky')),9);assert.equal(clampZoom(1,areaLayer('sky')),AREA_MIN_ZOOM);assert.equal(clampZoom(AREA_DEFAULT_ZOOM,areaLayer('imagery')),12);
  assert.equal(imageryDate(Date.parse('2026-09-18T02:00:00Z')),'2026-09-17');
  assert.equal(areaLayer('nope').id,'imagery');
  const google=remoteAreaLayer({id:'google',maxZoom:21,credit:'Google'});
  assert.deepEqual(google,{id:'google',template:'/api/tiles?provider=google&z={z}&x={x}&y={y}',maxZoom:21,dated:false,credit:'Google',remote:true});
  assert.equal(tileUrl(google,12,2140,1416,''),'/api/tiles?provider=google&z=12&x=2140&y=1416');
  assert.equal(remoteAreaLayer({id:'evil',maxZoom:5,credit:'x'}),null);
  assert.equal(remoteAreaLayer({id:'mapbox',maxZoom:'99',credit:'c'}).maxZoom,19,'a malformed zoom falls back to a sane limit');
  assert.equal(areaLayer('google',[google,...builtinAreaLayers]).remote,true);
});

test('marker offsets, click positions, view bounds and the Google Earth link agree with each other',()=>{
  const centre={lat:48.3,lon:8.2};
  const {dx,dy}=offsetFrom(centre,{lat:48.4,lon:8.5},10);
  assert.ok(dx>0&&dy<0,'north-east lies right and above the centre');
  assert.deepEqual(placeAtOffset(centre,10,dx,dy),{lat:48.4,lon:8.5});
  const across=offsetFrom({lat:0,lon:179.5},{lat:0,lon:-179.5},4);
  assert.ok(Math.abs(across.dx)<256*2,'the antimeridian neighbour is close, not a world away');
  const bounds=viewBounds(centre,12,800,600);
  assert.ok(bounds.north>centre.lat&&bounds.south<centre.lat&&bounds.east>centre.lon&&bounds.west<centre.lon);
  assert.ok(viewWidthKm(0,9,1000)>300&&viewWidthKm(0,9,1000)<310,'zoom 9 is about 306 m per pixel at the equator');
  assert.equal(viewWidthKm(48.3,9,0),0);
  assert.equal(earthLink(48.3,8.2,25000),'https://earth.google.com/web/@48.30000,8.20000,0a,30000d,35y,0h,0t,0r');
  assert.match(earthLink(0,0,0),/,20000d,/,'a view without a measured width still opens at a sensible distance');
  assert.equal(streetViewLink(48.3,8.2),'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=48.30000%2C8.20000');
});
