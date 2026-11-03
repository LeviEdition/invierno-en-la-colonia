import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import os from 'node:os';
import {installLifecycleProbe} from '../test-support/h32-lifecycle-probe.mjs';
import {waitForWorkshopMount} from '../test-support/h33-browser-wait.mjs';
import {checkLocalities,visibleControl} from '../test-support/h33-locality-checks.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.H33_ORIGIN||'http://127.0.0.1:8772',output=process.env.H33_ATMOSPHERE_OUTPUT_DIR||'/tmp/h33-atmosphere',path='/dist/hospital-workshop/mockup.mjs';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox'],ignoreDefaultArgs:['--disable-back-forward-cache']});
const evidence={browser:browser.version(),physicalMobile:false,conditions:{particleSeed:0x33c01,platform:os.platform(),architecture:os.arch(),cpu:os.cpus()[0]?.model,availableParallelism:os.availableParallelism(),node:process.version,playwright:'1.57.0',softwareRenderingExpected:true,throttling:'Sin throttling de red/CPU aplicado',method:'Mismo documento/semilla/configuración/DPR/cámara, recursos calientes; tres ventanas de reposo de1s por apagado/baja/normal, más recorrido idéntico. Performance.getMetrics TaskDuration/ScriptDuration/heap; no VRAM ni teléfono.'},build:JSON.parse(await readFile(new URL('../dist/hospital-workshop/build.json',import.meta.url))),records:[],failures:[]};
const api=p=>p.evaluate(async path=>(await import(path)).inspect(),path),app=async p=>(await api(p)).app,ambient=async p=>(await app(p)).renderer.atmosphere;
// Solo QA: fija la única extracción Uint32 de la fuente visual para repetir
// distribución/medición sin cambiar el RNG ni la configuración de producción.
async function seedContext(context){await context.addInitScript(()=>{const original=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=array=>{if(array instanceof Uint32Array&&array.length===1){array[0]=0x33c01;return array;}return original(array);};});}
const frames=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function controls(p){if(!await p.locator('#panel-content').isVisible())await p.locator('#panel-toggle').click();if(!await p.locator('#atmosphere-controls').evaluate(el=>el.open))await p.locator('#atmosphere-controls summary').click();}
async function all(p,on){await controls(p);if(await p.locator('#ambient-enabled').getAttribute('aria-pressed')!==String(on))await p.locator('#ambient-enabled').click();await frames(p);}
async function level(p,value){await all(p,value!=='off');if(value!=='off')await p.selectOption('#ambient-intensity',value);await p.locator('#atmosphere-controls').evaluate(el=>el.open=false);await p.locator('#panel-content').evaluate(el=>el.scrollTop=0);await p.locator('#reset-view').click();await p.waitForTimeout(180);}
async function idle(p,ms=350){await p.waitForTimeout(100);const a=await app(p);await p.waitForTimeout(ms);const b=await app(p);assert.equal(b.renderer.renderEvents,a.renderer.renderEvents);assert.equal(b.renderer.atmosphere.steps,a.renderer.atmosphere.steps);assert.equal(b.renderer.loopRunning,false);}
async function metric(client){return Object.fromEntries((await client.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));}
async function sample(p){return p.evaluate(async path=>{const a=(await import(path)).inspect().app;return {at:performance.now(),renders:a.renderer.renderEvents,steps:a.renderer.atmosphere.steps,pool:a.renderer.atmosphere.poolSize,visible:a.renderer.atmosphere.visibleParticles,limit:a.renderer.frameRateLimit,seed:a.renderer.atmosphere.seed};},path);}
async function measure(p,client,mode,navigation=false){
 await level(p,mode);await client.send('HeapProfiler.collectGarbage');const before=await metric(client),first=await sample(p);
 if(navigation){const b=await p.locator('#scene').boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;await p.mouse.move(x,y);await p.mouse.wheel(0,-180);for(let i=0;i<12;i++){await p.mouse.down();await p.mouse.move(x+(i%2?0:12),y+(i%2?0:8));await p.mouse.up();await p.waitForTimeout(75);}await p.mouse.wheel(0,180);}else await p.waitForTimeout(1000);
 const last=await sample(p),after=await metric(client),elapsed=last.at-first.at,metricElapsedMs=(after.Timestamp-before.Timestamp)*1000;
 const result={mode,navigation,elapsedMs:elapsed,metricElapsedMs,renders:last.renders-first.renders,steps:last.steps-first.steps,taskMs:(after.TaskDuration-before.TaskDuration)*1000,scriptMs:(after.ScriptDuration-before.ScriptDuration)*1000,heapBytes:after.JSHeapUsedSize,pool:last.pool,visible:last.visible,limit:last.limit,seed:last.seed};
 result.renderedFps=result.renders/(elapsed/1000);result.taskMsPerSecond=result.taskMs/(metricElapsedMs/1000);assert.equal(result.pool,120);if(mode==='off'&&!navigation)assert.equal(result.renders,0);if(mode!=='off'){assert.ok(result.renders>0);if(!navigation)assert.ok(result.renderedFps<=35,'Límite de animación excedido: '+result.renderedFps);}return result;
}
async function rememberPixels(p){await p.evaluate(async path=>{window.ambientPixelBaseline=await(await import(path)).diagnosticPixels();},path);}
async function changedPixels(p){return p.evaluate(async path=>{const a=window.ambientPixelBaseline,b=await(await import(path)).diagnosticPixels();let changed=0,strong=0,maxChannel=0;for(let i=0;i<a.data.length;i+=4){let difference=0,pixelMax=0;for(let k=0;k<3;k++){const d=Math.abs(a.data[i+k]-b.data[i+k]);difference+=d;pixelMax=Math.max(pixelMax,d);}maxChannel=Math.max(maxChannel,pixelMax);if(difference)changed++;if(pixelMax>=8)strong++;}return {changed,strong,maxChannel};},path);}
async function outsidePixels(p){return p.evaluate(async path=>{const m=await import(path),a=m.inspect().app,pixels=await m.diagnosticPixels(),samples=[];for(let x=2;x<pixels.width;x+=19)for(const y of [2,pixels.height-3]){const wx=(x/a.viewport.dpr-a.camera.x)/a.camera.zoom,wy=(y/a.viewport.dpr-a.camera.y)/a.camera.zoom;if(wx<-3||wx>1451||wy<-3||wy>1089){const i=(y*pixels.width+x)*4;samples.push(...pixels.data.slice(i,i+4));}}return samples;},path);}
try{
 for(const viewport of [{width:1365,height:768},{width:393,height:852},{width:320,height:640}]){
  const context=await browser.newContext({viewport,deviceScaleFactor:viewport.width<500?2:1,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  await seedContext(context);
  const probeCode=installLifecycleProbe.toString().replaceAll('/dist/hospital-phaser/game.mjs',path).replace('x.target instanceof HTMLCanvasElement','(x.target instanceof HTMLCanvasElement||x.target instanceof MediaQueryList)');await context.addInitScript({content:'('+probeCode+')();'});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await p.goto(origin+'/prototypes/hospital-workshop/');await waitForWorkshopMount(p,path);await frames(p);
  const initial=await app(p),r={viewport,dpr:initial.viewport.dpr,gpu:initial.renderer.gpu,seed:initial.renderer.atmosphere.seed,initial:initial.renderer.atmosphere.settings,errors};evidence.records.push(r);assert.equal(initial.renderer.atmosphere.settings.intensity,'normal');assert.equal(initial.renderer.atmosphere.settings.enabled,true);assert.equal(initial.renderer.atmosphere.poolSize,120);assert.equal(initial.renderer.atmosphere.interactiveObjects,0);
  // Señal técnica de visibilidad en vista general. El gate anterior solo
  // exigía algún píxel distinto en un acercamiento: no detectaba el problema.
  // 500 píxeles con diferencia >=8/255 separan la muestra roja (86–172)
  // de la nueva (1327–2166), con margen. No sustituye aprobación perceptual.
  await level(p,'off');await idle(p);await rememberPixels(p);await p.screenshot({path:resolve(output,`${viewport.width}-general-apagado.png`)});
  await level(p,'normal');await p.waitForTimeout(700);r.generalVisibility=await changedPixels(p);assert.ok(r.generalVisibility.strong>=500,'Ambientación casi invisible en vista general: '+r.generalVisibility.strong);await p.evaluate(()=>delete window.ambientPixelBaseline);
  await p.screenshot({path:resolve(output,`${viewport.width}-general-normal.png`)});const fixture=initial.fixture,turn=initial.turn;
  r.localities=await checkLocalities({page:p,viewport,app,frames,output});assert.deepEqual((await app(p)).fixture,fixture);assert.deepEqual((await app(p)).turn,turn);
  // Rueda y pinza con los efectos en marcha, sin duplicar la selección.
  const selected=(await app(p)).state.selected,box=await p.locator('#scene').boundingBox(),oldZoom=(await app(p)).camera.zoom;await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.wheel(0,-120);await frames(p);assert.ok((await app(p)).camera.zoom>oldZoom);assert.equal((await app(p)).state.selected,selected);
  if(viewport.width<500){const client=await context.newCDPSession(p),center={x:box.x+box.width/2,y:box.y+box.height/2},points=d=>[{id:1,x:center.x-d,y:center.y},{id:2,x:center.x+d,y:center.y}];await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(22)});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(31)});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await frames(p);assert.equal((await app(p)).state.selected,selected);await client.detach();}
  await all(p,false);await idle(p);await controls(p);await p.selectOption('#ambient-intensity','normal');r.independent=[];
  for(const kind of ['snow','wind','smoke','lights']){
   await controls(p);await p.selectOption('#locality','colonia');await frames(p);
   if(kind==='wind'){
    // Comprobar rasterización en un acercamiento a una estela configurada,
    // no exigir contraste perceptible al minificarla a menos de un píxel.
    const a=await app(p),particle=a.renderer.atmosphere.particles.find(x=>x.type==='wind'&&x.zone===1),b=await p.locator('#scene').boundingBox();
    await p.mouse.move(b.x+a.camera.x+particle.x*a.camera.zoom,b.y+a.camera.y+particle.y*a.camera.zoom);await p.mouse.wheel(0,-500);await frames(p);
   }
   await rememberPixels(p);await p.locator(`[data-ambient="${kind}"]`).click();await p.waitForTimeout(700);const a=await ambient(p);assert.equal(a.settings[kind],true);assert.ok(['snow','wind','smoke','lights'].filter(k=>k!==kind).every(k=>!a.settings[k]));assert.ok(a.particles.every(x=>x.type===kind||x.alpha===0));if(kind!=='lights')assert.ok(a.lights.every(x=>x.alpha===0));let pixels=await changedPixels(p);if(!pixels.changed){await p.waitForTimeout(1400);pixels=await changedPixels(p);}assert.ok(pixels.changed>0,'Efecto sin cambios de píxeles: '+kind);r.independent.push({kind,pool:a.poolSize,visible:a.visibleParticles,pixels});await p.evaluate(()=>delete window.ambientPixelBaseline);await all(p,false);await idle(p,120);
  }
  // Muestreo fuera del rectángulo del mapa: ninguna capa invade el letterbox.
  await level(p,'off');const clean=await outsidePixels(p);await level(p,'normal');const active=await outsidePixels(p);assert.ok(clean.length>0);assert.deepEqual(active,clean);r.outsideSamples=clean.length/4;
  for(const id of ['hospital','colonia']){await p.selectOption('#locality',id);await p.waitForTimeout(300);await p.screenshot({path:resolve(output,`${viewport.width}-${id}-normal.png`)});}
  // Ocultación de pestaña real cuando headless la exponga; alternativa controlada rotulada.
  const second=await context.newPage();await second.goto('about:blank');await second.bringToFront();await p.waitForTimeout(100);let hidden=await p.evaluate(()=>document.hidden);r.visibility={realTabHidden:hidden};
  if(!hidden){await p.evaluate(()=>{window.ambientHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.ambientHidden});document.dispatchEvent(new Event('visibilitychange'));});r.visibility.controlledOverride=true;}
  const paused=await ambient(p);assert.equal(paused.paused,true);await p.waitForTimeout(350);const still=await ambient(p);assert.equal(still.steps,paused.steps);assert.equal(still.elapsed,paused.elapsed);
  await p.bringToFront();if(!hidden)await p.evaluate(()=>{window.ambientHidden=false;document.dispatchEvent(new Event('visibilitychange'));});await second.close();await p.waitForTimeout(160);assert.equal((await ambient(p)).paused,false);assert.ok((await ambient(p)).elapsed-paused.elapsed<.5);r.visibility.noCatchUp=true;
  if(!hidden)await p.evaluate(()=>delete document.hidden);
  // Reinicios con partículas activas: pools/objetos GL/listeners estables.
  async function restart(){await p.locator('#menu-toggle').click();const n=(await api(p)).starts;await p.locator('#restart-mockup').click();await waitForWorkshopMount(p,path,n+1);await frames(p);}
  await restart();const stable=await p.evaluate(()=>window.h32StartupProbe());for(let i=0;i<5;i++){await restart();const next=await p.evaluate(()=>window.h32StartupProbe());assert.deepEqual(next.listeners,stable.listeners);assert.deepEqual(next.gl,stable.gl);assert.equal(next.activeSceneContexts,1);assert.equal((await ambient(p)).poolSize,120);assert.equal((await api(p)).lastDisposal.atmosphereRelease.objectsReleased,125);assert.equal((await api(p)).lastDisposal.atmosphereRelease.textureReleased,true);}
  r.restarts=5;r.pool=120;r.objects=(await ambient(p)).objects;
  const client=await context.newCDPSession(p);await client.send('Performance.enable');r.performance=[];
  for(const mode of ['off','low','normal'])for(let i=0;i<3;i++)r.performance.push(await measure(p,client,mode));
  for(const mode of ['off','low','normal'])r.performance.push(await measure(p,client,mode,true));await client.detach();
  await controls(p);for(const b of await p.locator('#atmosphere-controls button,#atmosphere-controls select').all())await visibleControl(p,b);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.evaluate(async path=>{await(await import(path)).disposeMockup();},path);r.disposed=await p.evaluate(()=>window.h32StartupProbe());assert.equal(r.disposed.activeSceneContexts,0);assert.equal(r.disposed.resizeTargets,0);assert.equal(r.disposed.startupTimers,0);assert.deepEqual(r.disposed.gl,{Texture:0,Buffer:0,Framebuffer:0,Renderbuffer:0,Program:0,Shader:0});assert.deepEqual(r.disposed.listeners,[{target:'window',type:'pagehide'},{target:'window',type:'pageshow'}]);assert.deepEqual(errors,[]);await context.close();
 }
 // Preferencia inicial y cambio de preferencia durante la sesión.
 const reduced=await browser.newContext({reducedMotion:'reduce'});await seedContext(reduced);const p=await reduced.newPage();await p.goto(origin+'/prototypes/hospital-workshop/');await waitForWorkshopMount(p,path);assert.equal((await ambient(p)).settings.enabled,false);await idle(p);await all(p,true);await p.waitForTimeout(200);assert.ok((await ambient(p)).steps>0);await p.evaluate(()=>{window.h33MotionChanges=[];matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>window.h33MotionChanges.push(e.matches));});await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForFunction(()=>window.h33MotionChanges.at(-1)===false);await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>window.h33MotionChanges.at(-1)===true);assert.equal((await ambient(p)).settings.enabled,false);await idle(p);evidence.reducedMotion={initialOff:true,explicitOptIn:true,preferenceChangeStops:true};await reduced.close();
 // Video corto del canvas: muestra movimiento, no es medición de FPS ni móvil físico.
 const video=await browser.newContext({viewport:{width:1365,height:768}});await seedContext(video);const v=await video.newPage();await v.goto(origin+'/prototypes/hospital-workshop/');await waitForWorkshopMount(v,path);await level(v,'normal');await v.selectOption('#locality','colonia');await v.waitForTimeout(300);
 const result=await v.evaluate(async()=>{
  const canvas=document.querySelector('#scene');if(!canvas.captureStream||!window.MediaRecorder)return {supported:false};const stream=canvas.captureStream(30),mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm',recorder=new MediaRecorder(stream,{mimeType:mime}),chunks=[];
  const done=new Promise(resolve=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=async()=>{const blob=new Blob(chunks,{type:mime});for(const t of stream.getTracks())t.stop();resolve({supported:true,mime,bytes:Array.from(new Uint8Array(await blob.arrayBuffer()))});};});recorder.start();await new Promise(resolve=>setTimeout(resolve,8000));recorder.stop();return done;
 });
 evidence.video={supported:result.supported,intensity:'normal',scene:'colonia',durationRequestedSeconds:8,canvasOnly:true};if(result.supported){await writeFile(resolve(output,'colonia-ambientacion.webm'),Buffer.from(result.bytes));evidence.video.bytes=result.bytes.length;}await video.close();
 evidence.passed=true;
}catch(error){evidence.passed=false;evidence.failures.push(error.stack);throw error;}
finally{await writeFile(resolve(output,'resultados.json'),JSON.stringify(evidence,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({passed:evidence.passed,records:evidence.records.length,output}));
