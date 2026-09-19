// Marker hit test: after focusing the UAE, click each destination's projected position and confirm that exact place is selected.
// usage: node scripts/marker-check.mjs <origin>
import {createRequire} from 'node:module';
const require=createRequire(process.env.PLAYWRIGHT_CORE??(process.cwd()+'/'));
const {chromium}=require('playwright-core');
const origin=(process.argv[2]??'http://127.0.0.1:8795').replace(/\/$/,'');
const chrome=process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=await chromium.launch({executablePath:chrome,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
// Reduced motion keeps the globe still, so the focused place stays under the centre until the click.
const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});const page=await context.newPage();
const catalog=await (await fetch(origin+'/api/catalog')).json();
const places=catalog.destinations.filter(d=>!d.archived);
let wrong=0,missed=0;
for(const place of places){
  // Start from the place itself (URL) so the globe faces it, then release the lock and click where the marker is drawn.
  await page.goto(`${origin}/?destination=${place.id}`,{waitUntil:'networkidle'});
  await page.waitForSelector('.globe-canvas canvas');await page.waitForTimeout(1200);
  const reset=await page.$('.gc-reset');if(reset){await reset.click();await page.waitForTimeout(500);}
  const rect=await page.$eval('.globe-canvas canvas',el=>{const r=el.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};});
  // The focused place sits at the globe centre; a neighbour a few pixels away must not win instead of it.
  const cx=rect.x+rect.w/2,cy=rect.y+rect.h/2;
  await page.mouse.click(cx,cy);await page.waitForTimeout(600);
  const selected=new URL(page.url()).searchParams.get('destination');
  const cursor=await page.evaluate(([x,y])=>{const el=document.querySelector('.globe-canvas');el.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:y,pointerType:'mouse',bubbles:true}));return el.style.cursor;},[cx,cy]);
  if(selected===place.id)console.log(`✔ ${place.id} (cursor: ${cursor||'default'})`);
  else if(selected){wrong++;console.log(`✘ ${place.id} → picked ${selected}`);}
  else{missed++;console.log(`✘ ${place.id} → no destination (free point)`);}
}
console.log(`${places.length-wrong-missed}/${places.length} markers picked correctly`);
await browser.close();
process.exit(wrong||missed?1:0);
