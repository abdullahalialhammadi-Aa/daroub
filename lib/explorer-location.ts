import type { Coordinates, Destination, TerrainId } from './toolkit-types';

export interface ExplorerSelection extends Coordinates { destinationId: string | null; terrainId: TerrainId }
const terrainIds: TerrainId[] = ['desert', 'mountain', 'forest', 'coast'];
export function validCoordinates(lat: unknown, lon: unknown): lat is number {
  return typeof lat === 'number' && Number.isFinite(lat) && Math.abs(lat) <= 90 && typeof lon === 'number' && Number.isFinite(lon) && Math.abs(lon) <= 180;
}
export function parseCoordinates(lat: string | null, lon: string | null): Coordinates | null {
  if (!lat?.trim() || !lon?.trim()) return null;
  const latitude = Number(lat), longitude = Number(lon);
  return validCoordinates(latitude, longitude) ? {lat: latitude, lon: longitude} : null;
}
export function selectionFromQuery(query: URLSearchParams, destinations: Destination[]): ExplorerSelection | null {
  const destination = destinations.find(item => item.id === query.get('destination'));
  const coordinates = parseCoordinates(query.get('lat'), query.get('lon'));
  const hasCoordinates = query.has('lat') || query.has('lon');
  if (hasCoordinates && !coordinates) return null;
  if (destination && (!coordinates || (Math.abs(coordinates.lat-destination.lat)<0.00001 && Math.abs(coordinates.lon-destination.lon)<0.00001))) {
    return {destinationId: destination.id, terrainId: destination.terrainId, lat: destination.lat, lon: destination.lon};
  }
  if (!coordinates) return null;
  const terrainId = query.get('terrainId');
  if (!terrainIds.includes(terrainId as TerrainId)) return null;
  return {...coordinates, destinationId: null, terrainId: terrainId as TerrainId};
}
export function selectionQuery(selection: ExplorerSelection): string {
  const query = new URLSearchParams();
  if (selection.destinationId) query.set('destination', selection.destinationId);
  query.set('lat', String(selection.lat)); query.set('lon', String(selection.lon)); query.set('terrainId', selection.terrainId);
  return query.toString();
}
export function terrainIndex(id: TerrainId) { return terrainIds.indexOf(id); }
export function terrainIdAt(index: number): TerrainId { return terrainIds[index] ?? 'desert'; }
