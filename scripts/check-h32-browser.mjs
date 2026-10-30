import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {compareOcclusion} from '../test-support/h32-pixels.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.H32_ORIGIN||'http://127.0.0.1:8771',output=process.env.H32_OUTPUT_DIR||'/tmp/h32-browser';await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const evidence={chromium:browser.version(),url:base,physicalDevice:false,records:[],failures:[]};
const near=(a,b,t=.02)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const inspect=page=>page.evaluate(async()=>(await import('/dist/hospital-phaser/game.mjs')).inspect());
async function ready(page){await page.waitForFunction(()=>document.body.dataset.state==='ready');await frames(page);}
async function moduleCall(page,name,arg){return page.evaluate(async({name,arg})=>(await import('/dist/hospital-phaser/game.mjs'))[name](arg),{name,arg});}
async function verifyCamera(page){
 const data=await inspect(page),{camera,viewport}=data.app;
 for(const p of [{x:0,y:0},{x:viewport.width*.37,y:viewport.height*.53}]){
  const actual=await moduleCall(page,'worldAt',p);near(actual.x,(p.x-camera.x)/camera.zoom);near(actual.y,(p.y-camera.y)/camera.zoom);
 }
 return data;
}
try{
 for(const viewport of [{width:1365,height:768},{width:393,height:852},{width:320,height:640}]){
  const context=await browser.newContext({viewport,deviceScaleFactor:viewport.width<500?2:1,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto(base+'/prototypes/hospital-phaser/?diagnostics=1');await ready(page);
  const initial=await verifyCamera(page),record={viewport,dpr:initial.app.viewport.dpr,gpu:initial.app.renderer.gpu,occlusion:[],checks:[],errors};evidence.records.push(record);
  assert.equal(initial.app.renderer.phaser,'4.2.1');assert.deepEqual(initial.app.renderer.inputPlugins,{mouse:false,touch:false,keyboard:false});
  const transforms=initial.app.renderer.transforms;
  near(transforms.hospital.x,780,1e-9);near(transforms.hospital.y,670,1e-9);near(transforms.hospital.scaleX,.65,1e-9);
  near(transforms.hospital.originX,630/1254,1e-9);near(transforms.hospital.originY,1148/1254,1e-9);
  near(transforms.zombie.originX,716/1175,1e-9);near(transforms.zombie.originY,1218/1338,1e-9);near(transforms.zombie.scaleX,.095,1e-9);
  record.transforms=transforms;
  for(const button of await page.locator('button').all()){const r=await button.boundingBox();assert.ok(r.width>=44&&r.height>=44);}
  for(const pose of ['delante','detras','esquina']){
   await page.locator(`[data-position="${pose}"]`).click();await frames(page);
   const metric=await compareOcclusion(page);record.occlusion.push(metric);
   assert.ok(metric.phaser.total>30);
   if(pose==='delante')assert.ok(metric.phaser.ratio>.99);
   if(pose==='detras')assert.ok(metric.phaser.ratio<.02);
   if(pose==='esquina')assert.ok(metric.absoluteDifference<=metric.tolerance,JSON.stringify(metric));
   await page.screenshot({path:resolve(output,`${viewport.width}-${pose}.png`),fullPage:true,animations:'disabled'});
  }
  await page.locator('[data-position="detras"]').click();await page.locator('#show-hidden').check();await frames(page);
  const shown=await compareOcclusion(page);assert.ok(shown.phaser.ratio>.5);record.occlusion.push(shown);
  await page.locator('#show-hidden').uncheck();await frames(page);assert.ok((await compareOcclusion(page)).phaser.ratio<.02);
  record.checks.push('Composición por backend, esquina ±3pp calibrada sobre Canvas, ocultos y oclusión normal');
  await page.locator('#reset-view').click();await page.locator('#scene').scrollIntoViewIfNeeded();await frames(page);
  const b=await page.locator('#scene').boundingBox(),point={x:Math.round(b.x+b.width*.63),y:Math.round(b.y+b.height*.45)};
  const before=await moduleCall(page,'worldAt',{x:point.x-b.x,y:point.y-b.y});
  await page.mouse.move(point.x,point.y);await page.mouse.wheel(0,-280);await frames(page);
  const after=await moduleCall(page,'worldAt',{x:point.x-b.x,y:point.y-b.y});near(before.x,after.x);near(before.y,after.y);
  await verifyCamera(page);
  const cameraBefore=(await inspect(page)).app.camera;await page.evaluate(async()=>{window.h32BeforePan=await(await import('/dist/hospital-phaser/game.mjs')).diagnosticPixels();});
  await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+30,point.y+20,{steps:5});await page.mouse.up();await frames(page);
  const panned=await verifyCamera(page);near(panned.app.camera.x,cameraBefore.x+30);near(panned.app.camera.y,cameraBefore.y+20);assert.equal(panned.app.selected,false);
  record.panPixelAgreement=await page.evaluate(async dpr=>{const a=window.h32BeforePan,b=await(await import('/dist/hospital-phaser/game.mjs')).diagnosticPixels(),dx=30*dpr,dy=20*dpr;let same=0,total=0;for(let y=0;y<a.height-dy;y++)for(let x=0;x<a.width-dx;x++){const i=(y*a.width+x)*4,j=((y+dy)*b.width+x+dx)*4;const diff=Math.abs(a.data[i]-b.data[j])+Math.abs(a.data[i+1]-b.data[j+1])+Math.abs(a.data[i+2]-b.data[j+2]);if(diff<=16)same++;total++;}delete window.h32BeforePan;return same/total;},initial.app.viewport.dpr);assert.ok(record.panPixelAgreement>.995,`Desalineación de capas: ${record.panPixelAgreement}`);
  await page.locator('#reset-view').click();await frames(page);near((await inspect(page)).app.camera.zoom,initial.app.camera.zoom);
  for(const id of ['zoom-in','zoom-out']){const n=(await inspect(page)).app.counters.inputCommands;await page.locator('#'+id).focus();await page.keyboard.press('Enter');await frames(page);assert.equal((await inspect(page)).app.counters.inputCommands,n+1);}
  await page.locator('#select-hospital').focus();await page.keyboard.press('Enter');assert.ok((await inspect(page)).app.selected);
  await page.locator('#scene').focus();await page.keyboard.press('Escape');assert.equal((await inspect(page)).app.selected,false);
  const x=(await inspect(page)).app.camera.x;await page.keyboard.press('ArrowRight');await frames(page);near((await inspect(page)).app.camera.x,x-48);await page.keyboard.press('0');await frames(page);
  record.checks.push('Rueda anclada y cámara real Phaser; pan, reset, teclado y un comando por activación');
  if(viewport.width<500){
   await page.locator('#scene').scrollIntoViewIfNeeded();const rect=await page.locator('#scene').boundingBox(),center={x:rect.x+rect.width/2,y:rect.y+rect.height/2};
   const beforePinch=(await inspect(page)).app.camera,local={x:rect.width/2,y:rect.height/2},old=await moduleCall(page,'worldAt',local),cdp=await context.newCDPSession(page);
   const touches=(half,dx=0,dy=0)=>[{id:1,x:center.x-half+dx,y:center.y+dy},{id:2,x:center.x+half+dx,y:center.y+dy}];
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches(35)});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:touches(65,10,-8)});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await frames(page);
   const next=await moduleCall(page,'worldAt',{x:local.x+10,y:local.y-8});near(old.x,next.x);near(old.y,next.y);near((await inspect(page)).app.camera.zoom,beforePinch.zoom*65/35);
   await page.locator('#reset-view').click();await page.locator('#scene').scrollIntoViewIfNeeded();await frames(page);
   const start=(await inspect(page)).app.camera;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:3,x:center.x,y:center.y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:3,x:center.x+24,y:center.y+18}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await frames(page);
   near((await inspect(page)).app.camera.x,start.x+24);near((await inspect(page)).app.camera.y,start.y+18);
   await page.locator('#reset-view').click();record.checks.push('Pinza real CDP y arrastre de un dedo, sin selección accidental');
  }
  await page.setViewportSize(viewport.width>500?{width:1110,height:800}:{width:360,height:740});await frames(page);await verifyCamera(page);
  await page.locator('#reset-view').click();await frames(page);await verifyCamera(page);
  for(let i=0;i<3;i++){
   const starts=(await inspect(page)).starts;await page.locator('#restart-scene').click();await page.waitForFunction(starts=>document.body.dataset.state==='ready',starts);await ready(page);
   const next=await inspect(page);assert.equal(next.starts,starts+1);assert.equal(next.app.position,'delante');assert.equal(next.app.counters.inputCommands,0);assert.ok(next.lastDisposal.disposed);
   const count=next.app.counters.inputCommands;await page.locator('#zoom-in').click();await frames(page);assert.equal((await inspect(page)).app.counters.inputCommands,count+1);
   assert.ok(await page.locator('#scene').getAttribute('aria-label'));
  }
  await moduleCall(page,'disposeExperiment');assert.equal((await inspect(page)).app,null);assert.equal(await page.locator('#scene').count(),0);
  await page.locator('#restart-scene').click();await ready(page);assert.equal(await page.locator('#scene').count(),1);
  record.checks.push('Resize y encuadre, tres reinicios y destrucción/reapertura sin duplicar comandos');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);await context.close();
 }
 const failure=await browser.newContext(),page=await failure.newPage();await page.route('**/assets/prototipo-hospital/hospital.png',r=>r.abort());await page.goto(base+'/prototypes/hospital-phaser/');await page.waitForFunction(()=>document.body.dataset.state==='error');
 assert.equal(await page.locator('button:not(:disabled),input:not(:disabled)').count(),1);await page.unroute('**/assets/prototipo-hospital/hospital.png');await page.locator('#restart-scene').click();await ready(page);await failure.close();evidence.resourceFailure='Aviso y recuperación al reintentar, sin app parcial';
 const disabled=await browser.newContext();await disabled.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.startsWith('webgl')||type==='experimental-webgl')return null;return original.call(this,type,...args);};});
 const noGL=await disabled.newPage();await noGL.goto(base+'/prototypes/hospital-phaser/');await noGL.waitForFunction(()=>document.body.dataset.state==='unsupported');assert.ok(await noGL.locator('#loading').isVisible());await noGL.locator('a[href="../hospital/"]').click();await noGL.locator('#loading').waitFor({state:'hidden'});await disabled.close();evidence.webglAbsent='Aviso explícito y enlace Canvas funcional; sin fallback Phaser silencioso';
 evidence.passed=true;
}catch(error){evidence.passed=false;evidence.failures.push(error.stack);throw error;}
finally{await writeFile(resolve(output,'resultados.json'),JSON.stringify(evidence,null,2)+'\n');await browser.close();}
console.log(JSON.stringify(evidence,null,2));
