/** Run after React commits a user-triggered add/remove, targeting a stable field ID. */
export function focusAfterRender(id:string,fallbackId?:string){requestAnimationFrame(()=>{const target=document.getElementById(id);(target&&!target.matches(':disabled')?target:fallbackId?document.getElementById(fallbackId):null)?.focus()})}
