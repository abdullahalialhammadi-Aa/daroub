import type {Destination,TerrainId} from './toolkit-types';

/** Planning suggestion for the smallest sensible party, by terrain: desert travel assumes a two-vehicle convoy,
 *  mountain and wadi routes assume one person can stay with a casualty while another goes for help, and forest,
 *  park or coastal outings follow the buddy rule. Destinations may override it (editorial `groupSize`), and a few
 *  managed UAE reserves with visitor centres or paved tracks are eased below their terrain default. */
const terrainDefaults:Record<TerrainId,number>={desert:4,mountain:3,forest:2,coast:2};
const placeDefaults:Record<string,number>={'al-marmoom':3,'mleiha':3,'sir-bani-yas':2,'ras-al-khor':2};

export function suggestedGroupSize(terrainId:TerrainId,destination?:Destination|null):number{
 if(destination?.groupSize)return destination.groupSize;
 if(destination&&placeDefaults[destination.id])return placeDefaults[destination.id];
 return terrainDefaults[terrainId]??2;
}
