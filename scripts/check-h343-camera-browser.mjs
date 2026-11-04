// Alineación DURANTE el gesto: una ficha estática solo cambia su transformación
// de cámara cuando Phaser ha presentado otro cuadro. No basta comprobar al soltar.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {searchMapChecks} from '../test-support/h343-browser-checks.mjs';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.H343_CAMERA_DIR||'/tmp/h343-camera';
const origin=process.env.H343_ORIGIN||'http://127.0.0.1:8777';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const t=searchMapChecks({origin});
const evidence={browser:browser.version(),physicalMobile:false,method:'RAF + POST_RENDER count and DOM positions during real input; video separately inspectable',records:[],failures:[]};

async function startTrace(p){
 await p.evaluate(()=>{
  window.cameraTrace=[];window.cameraTraceRunning=true;
  function sample(time){
   if(!window.cameraTraceRunning)return;
   const v=h343Viewer.inspect().view;
   if(v){const node=document.querySelector('[data-actor-id="h0"]');
    cameraTrace.push({time,renderEvents:v.renderer.renderEvents,camera:{...v.camera},marker:node?{x:parseFloat(node.style.left),y:parseFloat(node.style.top),width:parseFloat(node.style.width)}:null,actorNodes:document.querySelectorAll('[data-actor-id="h0"]').length});
   }
   requestAnimationFrame(sample);
  }
  requestAnimationFrame(sample);
 });
}
async function endTrace(p){return p.evaluate(()=>{window.cameraTraceRunning=false;return cameraTrace;});}
function analyze(frames){
 const gaps=[];let moved=0;
 for(let i=1;i<frames.length;i++){
  const a=frames[i-1],b=frames[i];if(!a.marker||!b.marker)continue;
  const delta=Math.hypot(b.marker.x-a.marker.x,b.marker.y-a.marker.y)+Math.abs(b.marker.width-a.marker.width);
  if(delta>.05){moved++;if(a.renderEvents===b.renderEvents)gaps.push({index:i,renderEvents:b.renderEvents,delta});}
 }
 return {samples:frames.length,movingSamples:moved,changedWithoutMapFrame:gaps};
}
async function pan(p,touch,box){
 const x=box.x+box.width*.38,y=box.y+box.height*.55;
 if(!touch){
  await p.mouse.move(x,y);await p.mouse.down();
  for(let i=1;i<=75;i++){await p.mouse.move(x+Math.sin(i/12)*80,y+Math.sin(i/15)*42);await p.waitForTimeout(8);}
  await p.mouse.up();
 }else{
  const cdp=await p.context().newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x,y}]});
  for(let i=1;i<=60;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:x+Math.sin(i/10)*42,y:y+Math.sin(i/13)*32}]});await p.waitForTimeout(8);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 }
}
async function zoom(p,touch,box){
 const x=box.x+box.width*.4,y=box.y+box.height*.45;
 if(!touch){
  await p.mouse.move(x,y);
  for(let i=0;i<18;i++){await p.mouse.wheel(0,i<9?-12:12);await p.waitForTimeout(12);}
 }else{
  const cdp=await p.context().newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:x-25,y},{id:2,x:x+25,y}]});
  for(let i=0;i<24;i++){const d=25+12*Math.sin(i*Math.PI/24);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:x-d,y},{id:2,x:x+d,y}]});await p.waitForTimeout(10);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 }
}
try{
 const viewports=process.env.H343_CAMERA_BASELINE?[{width:1365,height:768}]:[{width:1365,height:768},{width:393,height:852},{width:320,height:640}];
 for(const viewport of viewports){
  const dir=resolve(out,String(viewport.width));await mkdir(dir,{recursive:true});
  const touch=viewport.width<500;
  const context=await browser.newContext({viewport,deviceScaleFactor:touch?2:1,isMobile:touch,hasTouch:touch,reducedMotion:'no-preference',recordVideo:{dir,size:viewport}});
  await t.instrument(context);const p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const row={viewport,errors,profiles:[]};evidence.records.push(row);
  await t.begin(p);await t.openMap(p);await p.selectOption('#locality','place-0');await t.frames(p);
  await t.panel(p);await p.locator('.demo-controls').last().evaluate(el=>el.open=true);await p.selectOption('#survivor-select','h0');
  const game=await t.raw(p),rng=await t.rng(p);
  for(const profile of process.env.H343_CAMERA_BASELINE?['storm']:['off','soft','storm']){
   await p.selectOption('#locality','place-0');await t.panel(p);
   await p.locator('.demo-controls').last().evaluate(el=>el.open=true);await p.selectOption('#survivor-select','h0');
   await t.ambient(p);const current=await t.view(p);
   if(profile==='off'&&current.renderer.atmosphere.settings.enabled)await p.locator('#ambient-enabled').click();
   if(profile!=='off'){
    if(!current.renderer.atmosphere.settings.enabled)await p.locator('#ambient-enabled').click();
    await p.selectOption('#ambient-intensity',profile);
   }
   if(touch)await p.locator('#panel-toggle').click();
   await p.waitForTimeout(250);const box=await p.locator('#scene').boundingBox();
   await startTrace(p);await pan(p,touch,box);await zoom(p,touch,box);await p.waitForTimeout(150);
   const trace=await endTrace(p),result={profile,...analyze(trace)};row.profiles.push(result);
   await writeFile(resolve(dir,profile+'-frames.json'),JSON.stringify(trace,null,2)+'\n');
   await p.screenshot({path:resolve(dir,profile+'-after.png')});
   const marker=await p.locator('[data-actor-id="h0"]').boundingBox();
   await p.mouse.click(marker.x+marker.width/2,marker.y+marker.height/2);
   assert.equal((await t.view(p)).selected,'h0','Clic sobre la ficha visible tras el gesto');
   if(touch)await p.locator('#panel-toggle').click();
   await p.waitForTimeout(200);
   result.idle=await p.evaluate(()=>new Promise(resolve=>{
    let writes=0;const observer=new MutationObserver(records=>writes+=records.length);
    observer.observe(document.querySelector('#actor-markers'),{subtree:true,attributes:true,childList:true});
    const start=h343Viewer.inspect().view.renderer.renderEvents;
    setTimeout(()=>{observer.disconnect();resolve({writes,mapFrames:h343Viewer.inspect().view.renderer.renderEvents-start});},350);
   }));
   assert.equal(result.idle.writes,0,'Sin escrituras de fichas en reposo aunque la nieve anime');
   if(profile==='off')assert.equal(result.idle.mapFrames,0,'Apagado conserva renderizado bajo demanda');
   assert.ok(result.movingSamples>=10,'El gesto debe desplazar/escalar fichas realmente');
   assert.ok(trace.every(f=>f.actorNodes===1),'Una sola ficha durante el gesto');
  }
  assert.deepEqual(await t.raw(p),game);assert.equal(await t.rng(p),rng);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  assert.deepEqual(errors,[]);const video=p.video();await context.close();row.video=await video.path();
  for(const result of row.profiles)assert.equal(result.changedWithoutMapFrame.length,0,`Desfase de cámara ${viewport.width}/${result.profile}: la ficha cambió antes de otro cuadro del mapa`);
 }
 evidence.passed=true;
}catch(error){evidence.passed=false;evidence.failures.push(error.stack);throw error;}
finally{await writeFile(resolve(out,'resultados.json'),JSON.stringify(evidence,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({passed:evidence.passed,out}));
