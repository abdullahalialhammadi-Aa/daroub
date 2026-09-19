import type { CatalogSnapshot, Destination, Localized } from './toolkit-types';

/** ISO 3166-1 alpha-2 country of every compiled destination (new entries declare `country` themselves). */
export const destinationCountries: Record<string, string> = {
  liwa: 'AE', 'jebel-jais': 'AE', 'jubail-mangrove': 'AE',
  'wadi-rum': 'JO', alula: 'SA', 'jebel-shams': 'OM', 'wadi-shab': 'OM',
  yellowstone: 'US', everglades: 'US', skaftafell: 'IS', bromo: 'ID', 'black-forest': 'DE', 'plitvice-lakes': 'HR', hurghada: 'EG',
};
/** The destination each terrain category link resolves to when it is active: the four originals for the world, UAE anchors under the UAE focus. */
const terrainAnchors: Record<string, [string, string, string, string]> = {
  world: ['liwa', 'jebel-shams', 'black-forest', 'hurghada'],
  AE: ['liwa', 'jebel-jais', 'mushrif-ghaf-woodland', 'jubail-mangrove'],
};
export function terrainAnchor(index: number, focus: string | null = FOCUS_COUNTRY) { return (terrainAnchors[focus ?? 'world'] ?? terrainAnchors.world)[index]; }

/** Product focus. `'AE'` is the UAE release: destinations outside the focus stay in the catalogue as archived
 *  entries (saved trips and shared links keep resolving) but leave the globe, lists, mention matching, the
 *  fieldbook and the planner. `null` restores the whole world with no data change. Recorded in docs/uae-plan.md. */
export const FOCUS_COUNTRY: string | null = 'AE';
export const focusName: Localized = ['الإمارات العربية المتحدة', 'United Arab Emirates', 'Émirats arabes unis', '阿拉伯联合酋长国', 'संयुक्त अरब अमीरात'];

export function destinationCountry(d: Pick<Destination, 'id' | 'country'>) { return d.country ?? destinationCountries[d.id]; }
/** Unknown countries stay visible so an editor-created place never silently disappears. */
export function inFocus(d: Pick<Destination, 'id' | 'country'>, focus: string | null = FOCUS_COUNTRY) { const country = destinationCountry(d); return !focus || !country || country === focus; }
/** Archives out-of-focus destinations in place (idempotent). Applied to the compiled seed and to every served snapshot. */
export function applyFocus<T extends CatalogSnapshot>(catalog: T, focus: string | null = FOCUS_COUNTRY): T {
  if (!focus) return catalog;
  for (const d of catalog.destinations) { if (!d.country && destinationCountries[d.id]) d.country = destinationCountries[d.id]; if (!inFocus(d, focus)) d.archived = true; }
  return catalog;
}
export function focusDestinations(catalog: CatalogSnapshot, focus: string | null = FOCUS_COUNTRY) { return catalog.destinations.filter(d => !d.archived && inFocus(d, focus)); }
