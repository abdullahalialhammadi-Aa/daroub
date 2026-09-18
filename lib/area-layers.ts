/**
 * Area layers: a Web Mercator tile view of the selected place.
 * Built-in layers need no key (Esri World Imagery, OpenTopoMap, NASA GIBS); paid providers arrive from GET /api/tiles
 * and are fetched through the Worker so their keys never reach the browser. Everything here is pure and unit-tested.
 */
export type AreaLayerId = 'imagery' | 'topo' | 'relief' | 'sky' | 'google' | 'mapbox';
export interface AreaLayer { id: AreaLayerId; template: string; maxZoom: number; dated: boolean; credit: string; remote?: boolean }
export interface AreaTile { key: string; url: string; left: number; top: number; z: number; x: number; y: number }

export const AREA_TILE = 256;
export const AREA_MIN_ZOOM = 3;
export const AREA_DEFAULT_ZOOM = 12;
const GIBS = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best';
/** Switcher order. Imagery first (the "Google Earth" view), then the trail map, the relief, then yesterday's sky. */
export const builtinAreaLayers: readonly AreaLayer[] = [
  { id: 'imagery', template: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', maxZoom: 19, dated: false, credit: 'Esri, Maxar, Earthstar Geographics, GIS User Community' },
  { id: 'topo', template: 'https://tile.opentopomap.org/{z}/{x}/{y}.png', maxZoom: 17, dated: false, credit: '© OpenStreetMap contributors, SRTM · OpenTopoMap (CC-BY-SA)' },
  { id: 'relief', template: `${GIBS}/ASTER_GDEM_Color_Shaded_Relief/default/default/GoogleMapsCompatible_Level12/{z}/{y}/{x}.png`, maxZoom: 12, dated: false, credit: 'NASA GIBS · ASTER GDEM' },
  { id: 'sky', template: `${GIBS}/MODIS_Terra_CorrectedReflectance_TrueColor/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`, maxZoom: 9, dated: true, credit: 'NASA GIBS · MODIS Terra' },
];
const remoteIds = ['google', 'mapbox'] as const;
/** A paid provider announced by the server becomes a layer that loads through the same-origin proxy. */
export function remoteAreaLayer(summary: { id?: unknown; maxZoom?: unknown; credit?: unknown }): AreaLayer | null {
  const id = summary.id;
  if (typeof id !== 'string' || !(remoteIds as readonly string[]).includes(id)) return null;
  const maxZoom = typeof summary.maxZoom === 'number' && Number.isInteger(summary.maxZoom) ? Math.max(AREA_MIN_ZOOM, Math.min(22, summary.maxZoom)) : 19;
  return { id: id as AreaLayerId, template: `/api/tiles?provider=${id}&z={z}&x={x}&y={y}`, maxZoom, dated: false, credit: typeof summary.credit === 'string' ? summary.credit.slice(0, 120) : id, remote: true };
}
export const areaLayer = (id: string, layers: readonly AreaLayer[] = builtinAreaLayers): AreaLayer => layers.find((layer) => layer.id === id) ?? layers[0];

/** Daily satellite imagery is complete a few hours after the day ends, so the sky layer shows yesterday (UTC). */
export function imageryDate(now = Date.now()): string { return new Date(now - 86_400_000).toISOString().slice(0, 10); }

const MAX_LAT = 85.0511;
export const clampZoom = (zoom: number, layer: AreaLayer) => Math.max(AREA_MIN_ZOOM, Math.min(layer.maxZoom, Math.round(zoom)));

/** Fractional tile coordinates of a point at a zoom level (slippy-map convention). */
export function tilePoint(lat: number, lon: number, zoom: number): { x: number; y: number } {
  const n = 2 ** zoom, clamped = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat)), phi = clamped * Math.PI / 180;
  const x = ((lon + 180) / 360) * n;
  const y = ((1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2) * n;
  return { x: ((x % n) + n) % n, y: Math.max(0, Math.min(n, y)) };
}
/** Inverse of tilePoint for fractional tile coordinates. */
export function tileToLatLon(x: number, y: number, zoom: number): { lat: number; lon: number } {
  const n = 2 ** zoom;
  const lon = (((x / n) * 360 - 180 + 540) % 360) - 180;
  const lat = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180 / Math.PI;
  return { lat: Math.round(lat * 1000) / 1000, lon: Math.round(lon * 1000) / 1000 };
}
/** Pixel offset of a point from the view centre, for markers. */
export function offsetFrom(center: { lat: number; lon: number }, point: { lat: number; lon: number }, zoom: number): { dx: number; dy: number } {
  const a = tilePoint(center.lat, center.lon, zoom), b = tilePoint(point.lat, point.lon, zoom), n = 2 ** zoom;
  let dx = b.x - a.x; if (dx > n / 2) dx -= n; if (dx < -n / 2) dx += n;
  return { dx: dx * AREA_TILE, dy: (b.y - a.y) * AREA_TILE };
}
/** The place under a pixel offset from the view centre (clicks on the area re-centre the selection). */
export function placeAtOffset(center: { lat: number; lon: number }, zoom: number, dx: number, dy: number): { lat: number; lon: number } {
  const c = tilePoint(center.lat, center.lon, zoom), n = 2 ** zoom;
  return tileToLatLon(((c.x + dx / AREA_TILE) % n + n) % n, Math.max(0, Math.min(n, c.y + dy / AREA_TILE)), zoom);
}
/** Geographic bounds of the viewport, for provider attribution requests. */
export function viewBounds(center: { lat: number; lon: number }, zoom: number, width: number, height: number): { north: number; south: number; east: number; west: number } {
  const nw = placeAtOffset(center, zoom, -width / 2, -height / 2), se = placeAtOffset(center, zoom, width / 2, height / 2);
  return { north: nw.lat, south: se.lat, east: se.lon, west: nw.lon };
}
export function tileUrl(layer: AreaLayer, z: number, x: number, y: number, date: string): string {
  return layer.template.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y)).replace('{date}', date);
}
/** Tiles covering a width×height viewport centred on the place; longitude wraps, latitude rows outside the world are skipped. */
export function tilesFor(layer: AreaLayer, center: { lat: number; lon: number }, zoom: number, width: number, height: number, date: string): AreaTile[] {
  if (width <= 0 || height <= 0) return [];
  const z = clampZoom(zoom, layer), n = 2 ** z, c = tilePoint(center.lat, center.lon, z);
  const left = c.x * AREA_TILE - width / 2, top = c.y * AREA_TILE - height / 2, tiles: AreaTile[] = [];
  for (let ty = Math.floor(top / AREA_TILE); ty * AREA_TILE < top + height; ty++) {
    if (ty < 0 || ty >= n) continue;
    for (let tx = Math.floor(left / AREA_TILE); tx * AREA_TILE < left + width; tx++) {
      const x = ((tx % n) + n) % n;
      tiles.push({ key: `${z}/${x}/${ty}`, url: tileUrl(layer, z, x, ty, date), left: tx * AREA_TILE - left, top: ty * AREA_TILE - top, z, x, y: ty });
    }
  }
  return tiles;
}
/** Approximate ground width of the viewport in metres. */
export function viewWidthMeters(lat: number, zoom: number, width: number): number {
  return ((40_075_016.686 * Math.cos((lat * Math.PI) / 180)) / (AREA_TILE * 2 ** zoom)) * width;
}
export function viewWidthKm(lat: number, zoom: number, width: number): number { return Math.round(viewWidthMeters(lat, zoom, width) / 1000); }
/** Google Street View at the nearest panorama, through the public Maps URL scheme; no key needed, opens in a new tab. */
export function streetViewLink(lat: number, lon: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat.toFixed(5)}%2C${lon.toFixed(5)}`;
}
/** A Google Earth deep link at the same place and roughly the same extent; no key needed, opens in a new tab. */
export function earthLink(lat: number, lon: number, widthMeters: number): string {
  const distance = Math.round(Math.max(500, Math.min(20_000_000, widthMeters * 1.2 || 20_000)));
  return `https://earth.google.com/web/@${lat.toFixed(5)},${lon.toFixed(5)},0a,${distance}d,35y,0h,0t,0r`;
}
