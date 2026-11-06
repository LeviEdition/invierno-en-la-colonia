// Alineación DURANTE el gesto: una ficha estática solo cambia su transformación
// de cámara cuando Phaser ha presentado otro cuadro. No basta comprobar al soltar.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {actionMapChecks} from '../test-support/h344-browser-checks.mjs';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.H344_CAMERA_DIR||'/tmp/h344-camera';
const origin=process.env.H344_ORIGIN||'http://127.0.0.1:8778';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const t=actionMapChecks({origin,modulePath:process.env.H344_MODULE_PATH||'/dist/action-map-qa/map.mjs'});
const evidence={browser:browser.version(),physicalMobile:false,method:'RAF + POST_RENDER count and DOM positions during real input; video separately inspectable',records:[],failures:[]};

async function startTrace(p){
 await p.evaluate(()=>{
  window.cameraTrace=[];window.cameraTraceRunning=true;
  function sample(time){
   if(!window.cameraTraceRunning)return;
   const v=h344Viewer.inspect().view;
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
 const viewports=process.env.H344_CAMERA_BASELINE?[{width:1365,height:768}]:[{width:1365,height:768},{width:393,height:852},{width:320,height:640}];
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
  if((process.env.H344_MODULE_PATH||'').includes('/horizontal-map-qa/')){
   // El hover solo modifica el contorno del mapa. Presentar ese cuadro no
   // necesita reescribir atributos idénticos de las fichas.
   await p.waitForFunction(()=>!h344Viewer.inspect().view.renderPending);
   await p.evaluate(()=>{
    const v=h344Viewer.inspect().view,canvas=document.querySelector('#scene'),r=canvas.getBoundingClientRect(),point=v.layout.locations.find(l=>l.id==='place-0').badgePosition;
    canvas.dispatchEvent(new PointerEvent('pointermove',{clientX:r.x+v.camera.x+point.x*v.camera.zoom,clientY:r.y+v.camera.y+point.y*v.camera.zoom,buttons:0}));
   });
   await p.waitForFunction(()=>h344Viewer.inspect().view.pointedLocality==='colonia'&&!h344Viewer.inspect().view.renderPending);
   row.markerRedraw=await p.evaluate(async()=>{
    const container=document.querySelector('#actor-markers'),before=container.innerHTML,camera=h344Viewer.inspect().view.camera,records=[];
    const observer=new MutationObserver(list=>records.push(...list.map(r=>({actor:r.target.closest('[data-actor-id]')?.dataset.actorId,attribute:r.attributeName,old:r.oldValue,next:r.target.getAttribute(r.attributeName)}))));
    observer.observe(container,{subtree:true,attributes:true,attributeOldValue:true,childList:true});
    const start=h344Viewer.inspect().view.renderer.renderEvents;
    document.querySelector('#scene').dispatchEvent(new PointerEvent('pointerleave'));
    await new Promise((resolve,reject)=>{const deadline=performance.now()+15000,poll=()=>{if(!h344Viewer.inspect().view.renderPending)resolve();else if(performance.now()>deadline)reject(Error('El cuadro de contorno no terminó'));else setTimeout(poll,25);};setTimeout(poll,25);});
    observer.disconnect();return {writes:records.length,records,frames:h344Viewer.inspect().view.renderer.renderEvents-start,sameMarkup:before===container.innerHTML,sameCamera:JSON.stringify(camera)===JSON.stringify(h344Viewer.inspect().view.camera)};
   });
   await writeFile(resolve(dir,'diagnostic-redraw.json'),JSON.stringify(row.markerRedraw,null,2)+'\n');
   assert.ok(row.markerRedraw.frames>=1);assert.ok(row.markerRedraw.sameCamera&&row.markerRedraw.sameMarkup);
   assert.equal(row.markerRedraw.writes,0,'Un cambio de contorno no reescribe fichas idénticas');
  }
  for(const profile of process.env.H344_CAMERA_BASELINE?['storm']:['off','soft','storm']){
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
   // Medir reposo después de presentar la selección/panel, no200ms después
   // de solicitarlo: en software ese cuadro puede tardar más.
   await p.waitForFunction(()=>!h344Viewer.inspect().view.renderPending);
   result.idle=await p.evaluate(()=>new Promise(resolve=>{
    let writes=0;const observer=new MutationObserver(records=>writes+=records.length);
    observer.observe(document.querySelector('#actor-markers'),{subtree:true,attributes:true,childList:true});
    const start=h344Viewer.inspect().view.renderer.renderEvents;
    setTimeout(()=>{observer.disconnect();resolve({writes,mapFrames:h344Viewer.inspect().view.renderer.renderEvents-start});},350);
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
