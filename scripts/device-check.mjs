// Layout and interaction check of the globe core across phone, tablet, laptop and desktop viewports.
// usage: node scripts/device-check.mjs <origin> [chromePath]
// Requires playwright-core (resolved from the cwd or PLAYWRIGHT_CORE) and a Chrome/Chromium binary.
import {createRequire} from 'node:module';
const require=createRequire(process.env.PLAYWRIGHT_CORE??(process.cwd()+'/'));
const {chromium}=require('playwright-core');
const origin=(process.argv[2]??'http://127.0.0.1:8792').replace(/\/$/,'');
const chrome=process.argv[3]??process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe';
const devices=[
  {name:'iPhone SE',width:375,height:667,mobile:true},
  {name:'iPhone 14',width:390,height:844,mobile:true},
  {name:'Pixel 7',width:412,height:915,mobile:true},
  {name:'iPad',width:820,height:1180,mobile:true},
  {name:'Laptop',width:1366,height:768,mobile:false},
  {name:'Desktop',width:1920,height:1080,mobile:false},
];
const overlaps=(a,b)=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
const browser=await chromium.launch({executablePath:chrome,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let failures=0;
for(const device of devices){
  const context=await browser.newContext({viewport:{width:device.width,height:device.height},isMobile:device.mobile,hasTouch:device.mobile,deviceScaleFactor:device.mobile?2:1});
  const page=await context.newPage();
  const problems=[];
  try{
    await page.goto(origin+'/',{waitUntil:'networkidle',timeout:60000});
    await page.waitForSelector('.gc-float',{timeout:30000});
    await page.waitForTimeout(1500);
    const report=await page.evaluate(()=>{
      const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
      const visible=el=>{const s=getComputedStyle(el);const r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;};
      const controls=[...document.querySelectorAll('.globe-controls')].filter(visible).length;
      const credit=document.querySelector('.nasa-credit');
      const chips=[...document.querySelectorAll('.gc-float,.gc-float-title')].filter(visible).map(rect);
      const prompt=document.querySelector('.gc-prompt'),menu=document.querySelector('.gc-menu'),canvas=document.querySelector('.globe-canvas canvas');
      const canvasRect=canvas?rect(canvas):null;
      const centre=canvasRect?document.elementFromPoint((canvasRect.left+canvasRect.right)/2,(canvasRect.top+canvasRect.bottom)/2):null;
      return {
        controls,
        creditPointer:credit?getComputedStyle(credit).pointerEvents:'missing',
        creditRect:credit?rect(credit):null,
        chips,prompt:prompt?rect(prompt):null,menu:menu?rect(menu):null,canvas:canvasRect,
        centreHit:centre?centre.tagName+'.'+centre.className:'none',
        scrollX:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        hasChipsRow:!!document.querySelector('.gc-row'),
      };
    });
    if(report.controls)problems.push('legacy control bar visible');
    if(report.creditPointer!=='none')problems.push('credit intercepts pointer: '+report.creditPointer);
    if(report.scrollX>1)problems.push('horizontal overflow '+report.scrollX+'px');
    if(!report.canvas)problems.push('no globe canvas');
    if(report.canvas&&!/CANVAS/.test(report.centreHit))problems.push('globe centre covered by '+report.centreHit);
    const viewport={left:0,top:0,right:device.width,bottom:device.height};
    for(const chip of report.chips){
      if(chip.left<viewport.left-1||chip.right>viewport.right+1||chip.top<viewport.top-1||chip.bottom>viewport.bottom+1)problems.push('chip outside viewport '+JSON.stringify(chip));
      if(report.prompt&&overlaps(chip,report.prompt))problems.push('chip overlaps prompt');
      if(report.hasChipsRow&&report.canvas&&overlaps(chip,report.canvas))problems.push('chip floats over the globe');
      if(report.menu&&overlaps(chip,report.menu))problems.push('chip overlaps menu button');
    }
    if(report.creditRect&&report.prompt&&overlaps(report.creditRect,report.prompt))problems.push('credit overlaps prompt');
    if(report.creditRect&&report.creditRect.width>device.width*0.6)problems.push('credit too wide '+report.creditRect.width);
    // The gesture hint is a quiet caption: visible, inside the viewport, never over a chip or the prompt.
    await page.waitForTimeout(1200);
    const hint=await page.evaluate(()=>{const el=document.querySelector('.gc-gesture-hint');if(!el)return null;const r=el.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,opacity:Number(getComputedStyle(el).opacity),pointer:getComputedStyle(el).pointerEvents,text:el.textContent};});
    if(!hint)problems.push('gesture hint missing');
    else{
      if(hint.opacity<0.9)problems.push('gesture hint not faded in ('+hint.opacity+')');
      if(hint.pointer!=='none')problems.push('gesture hint intercepts pointer');
      if(hint.left<-1||hint.right>device.width+1||hint.top<-1||hint.bottom>device.height+1)problems.push('gesture hint outside viewport '+JSON.stringify(hint));
      if(report.prompt&&overlaps(hint,report.prompt))problems.push('gesture hint overlaps prompt');
      for(const chip of report.chips)if(overlaps(hint,chip)){problems.push('gesture hint overlaps a chip');break;}
    }
    // Drag rotates the globe: pixels change and the page stays on the globe (no lock). Touch on phones, mouse elsewhere.
    if(report.canvas){
      const cx=(report.canvas.left+report.canvas.right)/2,cy=(report.canvas.top+report.canvas.bottom)/2;
      const before=await page.screenshot({clip:{x:Math.max(0,cx-80),y:Math.max(0,cy-80),width:160,height:160}});
      await page.mouse.move(cx,cy);await page.mouse.down();
      for(let i=1;i<=8;i++){await page.mouse.move(cx+i*20,cy,{steps:2});await page.waitForTimeout(30);}
      await page.mouse.up();await page.waitForTimeout(400);
      const after=await page.screenshot({clip:{x:Math.max(0,cx-80),y:Math.max(0,cy-80),width:160,height:160}});
      if(Buffer.compare(before,after)===0)problems.push('drag did not rotate the globe');
      if(await page.$('.gc-area'))problems.push('a drag locked the globe (area view opened)');
      if(await page.$('.gc-gesture-hint'))problems.push('gesture hint stayed after touching the globe');
      // A tap on the globe locks it (area view), the reset control releases it.
      await page.mouse.click(cx,cy);await page.waitForSelector('.gc-area',{timeout:8000}).catch(()=>problems.push('tap did not open the area view'));
      await page.waitForTimeout(300);
      const layout=await page.evaluate(()=>{const rect=el=>el?.getBoundingClientRect();const prompt=rect(document.querySelector('.gc-prompt')),layers=rect(document.querySelector('.gc-layers')),reset=rect(document.querySelector('.gc-reset')),menu=rect(document.querySelector('.gc-menu'));return {layersOverPrompt:!!(layers&&prompt&&layers.bottom>prompt.top&&layers.left<prompt.right&&layers.right>prompt.left),resetOverMenu:!!(reset&&menu&&reset.left<menu.right&&reset.right>menu.left&&reset.top<menu.bottom&&reset.bottom>menu.top),reset:!!reset};});
      if(layout.layersOverPrompt)problems.push('layer buttons overlap prompt');
      if(layout.resetOverMenu)problems.push('reset overlaps menu button');
      if(!layout.reset)problems.push('reset control missing after lock');
      const reset=await page.$('.gc-reset');if(reset){await reset.click();await page.waitForTimeout(300);if(await page.$('.gc-area'))problems.push('reset did not release the lock');}
    }
    // Suggested questions: focusing the empty prompt lists them inside the viewport; picking one fills the field, send shows the answer card.
    await page.click('#gc-question');
    const list=await page.waitForSelector('.gc-suggest',{timeout:4000}).catch(()=>null);
    if(!list)problems.push('suggestions did not open on focus');
    else{
      const box=await list.boundingBox(),options=await page.$$('.gc-suggest [role=option]');
      if(!box||box.y<-1||box.y+box.height>device.height+1||box.x<-1||box.x+box.width>device.width+1)problems.push('suggestion list outside viewport '+JSON.stringify(box));
      if(options.length<4)problems.push('too few suggestions: '+options.length);
      const text=(await options[0]?.textContent())??'';
      await options[0]?.click();await page.waitForTimeout(150);
      const value=await page.inputValue('#gc-question');
      if(!value||value!==text.trim())problems.push('picking a suggestion did not fill the prompt ('+value+')');
      if(await page.$('.gc-suggest'))problems.push('suggestion list stayed open after a pick');
      await page.click('.gc-send');
      const answer=await page.waitForSelector('.gc-answer .companion-answer',{timeout:20000}).catch(()=>null);
      if(!answer)problems.push('no answer card after sending a suggested question');
      else if(!((await answer.textContent())??'').trim())problems.push('answer card is empty');
      const shown=await page.evaluate(()=>document.querySelector('.gc-question')?.textContent??'');
      if(shown!==text.trim())problems.push('answer card shows a different question');
    }
    await page.screenshot({path:`work/device-${device.name.replace(/\s+/g,'-').toLowerCase()}.png`});
  }catch(error){problems.push('error: '+(error?.message??error));}
  console.log(`${problems.length?'✘':'✔'} ${device.name} ${device.width}×${device.height}${problems.length?'\n   - '+problems.join('\n   - '):''}`);
  failures+=problems.length;
  await context.close();
}
await browser.close();
process.exit(failures?1:0);
