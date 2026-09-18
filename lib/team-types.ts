/** A shared packing board is a separate, explicitly published copy of a private trip. */
export interface TeamParticipant {id:string;name:string;isYou:boolean;isOwner:boolean;linked:boolean}
export interface TeamItem {id:string;label:string;kind:'equipment'|'task';required:number}
export interface TeamAllocation {itemId:string;participantId:string;quantity:number;packed:number}
export interface TeamBoard {id:string;tripId:string|null;title:string;revision:number;updatedAt:string;isOwner:boolean;participants:TeamParticipant[];items:TeamItem[];allocations:TeamAllocation[];sourceRevision:number;inviteExpiresAt:string|null}
export interface TeamBoardSummary {id:string;title:string;isOwner:boolean;updatedAt:string}
export type TeamAction=
 | {type:'create';tripId:string;name:string;expectedSourceRevision:number}
 | {type:'join';roomId:string;token:string;name:string}
 | {type:'invite';roomId:string;revision:number}
 | {type:'revoke-invite';roomId:string;revision:number}
 | {type:'refresh';roomId:string;revision:number;expectedSourceRevision:number}
 | {type:'add-person';roomId:string;revision:number;name:string}
 | {type:'rename-person';roomId:string;revision:number;participantId:string;name:string}
 | {type:'remove-person';roomId:string;revision:number;participantId:string}
 | {type:'allocate';roomId:string;revision:number;itemId:string;participantId:string;quantity:number;packed:number}
 | {type:'leave';roomId:string;revision:number}
 | {type:'close';roomId:string;revision:number};
export interface TeamPreview {title:string;items:TeamItem[];sourceRevision:number}
export interface TeamResponse {board?:TeamBoard|null;boards?:TeamBoardSummary[];preview?:TeamPreview;inviteToken?:string;error?:string}
