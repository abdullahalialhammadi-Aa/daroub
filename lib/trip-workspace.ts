import type {Trip} from './toolkit-types';
import {validTrip} from './trip-preparation';
export type TripSection='overview'|'packing'|'itinerary';
const isValid=(trip:Trip):boolean=>validTrip(trip);
/** Validate the complete draft even when its fields are in a different tab. */
export function invalidTripSection(trip:Trip):TripSection|null{
 if(isValid(trip))return null;
 if(!isValid({...trip,checklist:[],itinerary:[]}))return 'overview';
 if(!isValid({...trip,itinerary:[]}))return 'packing';
 return 'itinerary';
}
