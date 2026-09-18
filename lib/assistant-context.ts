import {seedCatalog,catalogDestination,catalogForTerrain} from './catalog-seed';
import { terrains } from './terrain';
import type { CatalogSnapshot,Coordinates } from './toolkit-types';

export function assistantContext(query: URLSearchParams,catalog:CatalogSnapshot=seedCatalog) {
  const destination = catalogDestination(catalog,query.get('destination'));
  if (destination) return { destinationId: destination.id, terrainIndex: destination.terrainIndex, point: null as Coordinates | null };
  const stableIndex = terrains.findIndex(terrain => terrain.id === query.get('terrainId'));
  const legacy = Number(query.get('terrain'));
  const terrainIndex = stableIndex >= 0 ? stableIndex : Number.isInteger(legacy) && terrains[legacy] ? legacy : 0;
  if (query.has('generic') || query.has('lat') || query.has('lon')) {
    const lat = Number(query.get('lat')), lon = Number(query.get('lon'));
    const valid = !!query.get('lat')?.trim() && !!query.get('lon')?.trim() && Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lon) && Math.abs(lon) <= 180;
    return { destinationId: null, terrainIndex, point: valid ? { lat, lon } : null };
  }
  return { destinationId: catalogForTerrain(catalog,terrainIndex)?.id??null, terrainIndex, point: null as Coordinates | null };
}
export function assistantReportHref(destinationId: string | null, terrainIndex: number, point: Coordinates | null) {
  if (destinationId) return `/regions?destination=${encodeURIComponent(destinationId)}`;
  if (point) return `/regions?terrainId=${terrains[terrainIndex].id}&lat=${point.lat}&lon=${point.lon}`;
  return '/regions';
}
