import type { Destination, GuideSection, PackingRule, SourceReference, SpeciesEntry } from '../toolkit-types';
import { sharedUaeSources } from './shared';
import * as jebelHafeet from './jebel-hafeet';
import * as hatta from './hatta';
import * as mleiha from './mleiha';
import * as alMarmoom from './al-marmoom';
import * as sirBaniYas from './sir-bani-yas';
import * as wadiWurayah from './wadi-wurayah';
import * as rasAlKhor from './ras-al-khor';
import * as dibba from './dibba-snoopy-island';
import * as mushrif from './mushrif-ghaf-woodland';
import { enrichRules, enrichSections, enrichSources, enrichSpecies } from './enrich';

/** UAE catalogue additions researched 2026-09-18 (docs/uae-plan.md §3). Order = order on the globe list within each terrain. */
const places = [jebelHafeet, hatta, mleiha, alMarmoom, sirBaniYas, wadiWurayah, rasAlKhor, dibba, mushrif];
export const uaeDestinations: Destination[] = places.map(p => p.destination);
export const uaeSources: SourceReference[] = [...sharedUaeSources, ...places.flatMap(p => p.sources), ...enrichSources];
export const uaeRules: PackingRule[] = [...places.flatMap(p => p.rules), ...enrichRules];

const speciesById: Partial<Record<string, SpeciesEntry[]>> = enrichSpecies;
const sectionsById: Partial<Record<string, GuideSection[]>> = enrichSections;
/** Appends the sourced species and the rules chapter to the three pre-existing UAE places (liwa, jebel-jais, jubail-mangrove). */
export function enrichUaeDestination(destination: Destination): Destination {
  const species = speciesById[destination.id], sections = sectionsById[destination.id];
  if (!species && !sections) return destination;
  return { ...destination, species: [...destination.species, ...(species ?? []).filter(s => !destination.species.some(x => x.id === s.id))], sections: [...destination.sections, ...(sections ?? []).filter(s => !destination.sections.some(x => x.id === s.id))] };
}
