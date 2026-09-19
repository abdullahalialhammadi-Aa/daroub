import type { Locale } from './terrain';

export type Localized = [string, string, string, string, string];
export type TerrainId = 'desert' | 'mountain' | 'forest' | 'coast';
export interface Coordinates { lat: number; lon: number }
export interface Terrain { id: TerrainId; names: Localized; image: string }
export interface SourceReference { id: string; title: string; url: string; reviewedAt: string }
export interface GuideSection { id: string; title: Localized; body: Localized; sourceIds: string[] }
export interface SpeciesEntry { id: string; name: Localized; description: Localized; precaution: Localized; sourceIds: string[]; coverage: 'local' | 'terrain-example' }
export interface Destination extends Coordinates { id: string; terrainId: TerrainId; terrainIndex: number; names: Localized; summary: Localized; image: string; imageIsIllustrative: boolean; sourceIds: string[]; sections: GuideSection[]; species: SpeciesEntry[]; timezone?: string; archived?: boolean; /** ISO 3166-1 alpha-2; drives the product focus (lib/region.ts). */ country?: string; /** Editorial minimum party suggestion; see lib/group-size.ts for terrain defaults. */ groupSize?: number }
export interface ChecklistItem { id: string; label: string; category: string; done: boolean; kind?: 'task' | 'equipment'; equipmentId?: string; gearId?: string; requiredQuantity?: number; assignedQuantity?: number; packedQuantity?: number; gearSnapshot?: {name:string;quantity:number;condition:GearCondition}; suggestionKey?: string }
export type GearCondition = 'ready' | 'needs-maintenance' | 'unavailable';
export interface GearItem { id:string; schemaVersion:2; name:string; category:string; equipmentId:string; quantity:number; condition:GearCondition; maintenanceDate:string; expiryDate:string; notes:string; archived:boolean; revision:number; updatedAt:string; conflictOf?:string }
export interface ItineraryEntry { id:string; title:string; activityId:string; place:string; coordinates?:Coordinates; startTime:string; timeZone:string; durationMinutes:number; transport:string; notes:string }
export interface ItineraryDay { id:string; dayOffset:number; entries:ItineraryEntry[] }
export interface SuggestionDecision { key:string; fingerprint:string; decision:'accepted'|'dismissed' }
export interface Trip { id: string; title: string; destinationId: string | null; terrainId: TerrainId; location: Coordinates; startDate: string; endDate: string; groupSize: number; transport: string; notes: string; checklist: ChecklistItem[]; revision: number; updatedAt: string; conflictOf?: string; schemaVersion?:2; activities?:string[]; itinerary?:ItineraryDay[]; suggestionDecisions?:SuggestionDecision[]; catalogRevision?:number }
export interface PackingRule { id:string; version:number; equipmentId:string; label:Localized; category:string; terrainIds:TerrainId[]; activities:string[]; months:number[]; minDays:number; transport:string[]; baseQuantity:number; perPerson:boolean; reason:Localized; sourceIds:string[]; coverage:'local'|'terrain-example'; destinationIds:string[] }
export interface PackingSuggestion { key:string; fingerprint:string; equipmentId:string; label:string; category:string; quantity:number; quantityBasis?:'person'|'group'; destinationSpecific?:boolean; available:number; reason:string; sourceIds:string[]; catalogRevision:number; coverage:'local'|'terrain-example' }
export interface TerrainGuidance { terrainId:TerrainId; sections:GuideSection[]; clothing:Localized; transport:Localized; group:Localized }
export interface CatalogSnapshot { schemaVersion:1; revision:number; publishedAt:string; destinations:Destination[]; sources:SourceReference[]; terrainGuidance:TerrainGuidance[]; packingRules:PackingRule[] }
export interface CatalogDraft { id:string; revision:number; baseCatalogRevision:number; snapshot:CatalogSnapshot; reviewedLocales:Locale[]; updatedAt:string }
export interface CatalogHistory { revision:number; publishedAt:string; actor:string; restoredFrom?:number }
export type EditorRole = 'owner'|'editor'|null;
export interface AssistantProposal { expectedCatalogRevision?:number; suggestionDecision?:SuggestionDecision; id:string; type:'add-equipment'|'add-itinerary'; tripId:string; expectedRevision:number; expectedFingerprint?:string; label:string; items?:ChecklistItem[]; dayOffset?:number; entry?:ItineraryEntry }
export interface SavedLocation extends Coordinates { id: string; label: string; terrainId: TerrainId; destinationId: string | null; revision: number; updatedAt: string }
export interface ForecastDay { date: string; low: number | null; high: number | null; precipitation: number | null; wind: number | null }
export interface WeatherResult { year: number; months: { low: number | null; high: number | null }[]; current: { time?: string; temperature_2m?: number | null; apparent_temperature?: number | null; wind_speed_10m?: number | null; precipitation?: number | null } | null; timezone: string; fetchedAt: string; forecast?: ForecastDay[]; error?: string }
export interface AssistantAnswer { sources?:SourceReference[]; text: string; aiText?: string; aiProvider?: { id: string; label: string }; fallbackReason?: 'unconfigured' | 'sign-in' | 'rate-limit' | 'provider'; locale: Locale; mode: 'guide' | 'ai'; destinationId: string | null; sourceIds: string[]; suggestions: string[]; actions: { type: 'add-equipment'; label: string; items: string[] }[]; proposals?:AssistantProposal[]; tripContext?:{id:string;title:string;revision:number}; catalogRevision?:number }
export interface SessionInfo { userId: string; displayName: string; readOnly?:boolean; authMethod?:'password'|'chatgpt' }
export interface SyncStatus { state: 'synced' | 'offline' | 'sign-in' | 'error' | 'upgrade'; pending: number; conflicts: number }
export interface SyncMutation { operationId: string; entity: 'trip' | 'bookmark' | 'gear'; id: string; baseRevision: number; payload: Trip | SavedLocation | GearItem | null; protocol?:2; replacesOperationId?:string }
