import type {ChecklistItem} from './toolkit-types';
export function invalidChecklistItem(row:ChecklistItem){
 return !row.label.trim()||(row.kind==='equipment'&&(!Number.isInteger(row.requiredQuantity)||row.requiredQuantity!<1||row.requiredQuantity!>10000||!Number.isInteger(row.packedQuantity)||row.packedQuantity!<0||row.packedQuantity!>row.requiredQuantity!||!Number.isInteger(row.assignedQuantity)||row.assignedQuantity!<0||row.assignedQuantity!>row.requiredQuantity!));
}
export function itemPacked(row:ChecklistItem){
 return row.kind==='equipment'?Number.isInteger(row.requiredQuantity)&&row.requiredQuantity!>0&&Number.isInteger(row.packedQuantity)&&row.packedQuantity===row.requiredQuantity:row.done;
}
export function packingCounts(rows:ChecklistItem[]){
 const equipment=rows.filter(row=>row.kind==='equipment'),tasks=rows.filter(row=>row.kind!=='equipment');
 const safe=(n:number|undefined)=>Number.isInteger(n)&&n!>=0?n!:0;
 return {equipment:equipment.reduce((n,r)=>n+safe(r.requiredQuantity),0),packed:equipment.reduce((n,r)=>n+Math.min(safe(r.packedQuantity),safe(r.requiredQuantity)),0),tasks:tasks.length,tasksDone:tasks.filter(r=>r.done).length,items:rows.length,complete:rows.filter(itemPacked).length};
}
export function withPacked(row:ChecklistItem,quantity:number):ChecklistItem{
 if(row.kind!=='equipment'||!Number.isInteger(row.requiredQuantity)||row.requiredQuantity!<1||!Number.isInteger(quantity)||quantity<0||quantity>row.requiredQuantity!)return row;
 return {...row,packedQuantity:quantity,done:quantity===row.requiredQuantity};
}
