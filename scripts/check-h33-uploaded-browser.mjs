import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {cpus,totalmem,release} from 'node:os';
import {installLifecycleProbe} from '../test-support/h32-lifecycle-probe.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.H33_ORIGIN||'http://127.0.0.1:8772',output=process.env.H33_UPLOADED_OUTPUT_DIR||'/tmp/h33-uploaded',path='/dist/hospital-workshop/game.mjs',url=origin+'/prototypes/hospital-workshop/?kit=uploaded&diagnostics';
const kit=JSON.parse(await readFile(new URL('../prototypes/hospital-workshop/uploaded-kit.json',import.meta.url))),assets=Object.fromEntries(kit.assets.map(a=>[a.id,a]));
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,ignoreDefaultArgs:['--disable-back-forward-cache'],args:['--no-sandbox']});
const evidence={browser:browser.version(),upload:kit.sourceSnapshot,physicalMobile:false,build:JSON.parse(await readFile(new URL('../dist/hospital-workshop/build.json',import.meta.url))),conditions:{os:process.platform+' '+release(),cpu:cpus()[0].model,logicalCpus:cpus().length,totalSystemMemoryBytes:totalmem(),node:process.version,headless:true,network:'HTTP localhost sin throttling; caché caliente al cambiar perfil',timings:'Una observación por configuración; prueba funcional, no benchmark estadístico ni tiempo GPU. No VRAM medida.'},records:[],comparisons:[],failures:[]};
const frames=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const api=(p,method='inspect',arg)=>p.evaluate(async({path,method,arg})=>(await import(path))[method](arg),{path,method,arg});
const app=async p=>(await api(p)).app;
const ready=p=>p.waitForFunction(()=>document.body.dataset.state==='ready');
const near=(a,b)=>assert.ok(Math.abs(a-b)<.02,`${a} != ${b}`);
const probe=p=>p.evaluate(()=>window.h32StartupProbe());
async function profile(p,id){const n=(await api(p)).starts;await p.selectOption('#profile',id);await p.waitForFunction(({path,n})=>import(path).then(m=>m.inspect().starts===n+1&&m.inspect().state==='ready'),{path,n});await frames(p);}
function geometry(a){
 for(const node of a.nodes.filter(n=>n.visible&&assets[n.assetId].kind==='image')){
  const t=a.renderer.textures[node.assetId],s=a.renderer.nodes.find(n=>n.id===node.id),asset=assets[node.assetId];
  near(s.x,node.position.x);near(s.y,node.position.y);near(s.x-s.displayOriginX*s.scaleX,node.position.x-asset.pivot.x*asset.scale*node.multiplier);near(s.y-s.displayOriginY*s.scaleY,node.position.y-asset.pivot.y*asset.scale*node.multiplier);
  near(s.scaleX*t.factor,asset.scale*node.multiplier);near(s.scaleX,s.scaleY);
 }
 assert.equal(Object.keys(a.renderer.textures).length,8);
 for(const id of kit.survivorAssetIds){const t=a.renderer.textures[id],size=a.state.portraitQuality==='original'?Math.ceil(1254*kit.profiles.find(p=>p.id===a.state.profile).factor):384;assert.equal(t.width,size);assert.equal(t.height,size);}
}
async function portraitComparison(p){
 await profile(p,'h32');await p.selectOption('#selected-resource','s1');await frames(p);const baseline=await app(p),panels=[];evidence.portraitComparison={viewport:baseline.viewport,camera:baseline.camera,panel:{width:192,height:160,unit:'physical-pixel-no-resize'},profiles:[]};
 for(const quality of ['original','384']){
  const starts=(await api(p)).starts;await p.selectOption('#portrait-quality',quality);await p.waitForFunction(({path,starts})=>import(path).then(m=>m.inspect().starts===starts+1&&m.inspect().state==='ready'),{path,starts});await frames(p);const after=await app(p);geometry(after);near(after.camera.x,baseline.camera.x);near(after.camera.y,baseline.camera.y);assert.equal(after.state.selected,'s1');
  evidence.portraitComparison.profiles.push({quality,textures:after.renderer.textures,timings:after.timings});
  panels.push(await p.evaluate(async path=>{const m=await import(path),shot=await m.diagnosticPixels(),c=document.createElement('canvas');c.width=shot.width;c.height=shot.height;c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(shot.data),shot.width,shot.height),0,0);const crop=document.createElement('canvas');crop.width=192;crop.height=160;crop.getContext('2d').drawImage(c,Math.floor(c.width/2)-96,Math.floor(c.height/2)-80,192,160,0,0,192,160);return crop.toDataURL();},path));
 }
 const strip=await p.evaluate(async panels=>{const c=document.createElement('canvas');c.width=384;c.height=160;for(let i=0;i<2;i++){const image=new Image();image.src=panels[i];await image.decode();c.getContext('2d').drawImage(image,192*i,0);}return c.toDataURL();},panels);
 evidence.portraitComparison.file='1365-retrato-original-vs384-max.png';await writeFile(resolve(output,evidence.portraitComparison.file),Buffer.from(strip.split(',')[1],'base64'));
}
async function ratio(p){return p.evaluate(async path=>{
 const m=await import(path),shots=[];for(const kind of ['normal','no-actor','actor-front']){await m.diagnosticFrame(kind);shots.push((await m.diagnosticPixels()).data);}await m.diagnosticFrame('normal');
 let visible=0,total=0;const [a,b,c]=shots;for(let i=0;i<a.length;i+=4){const diff=(x,y)=>Math.abs(x[i]-y[i])+Math.abs(x[i+1]-y[i+1])+Math.abs(x[i+2]-y[i+2]);if(diff(a,b)>16)visible++;if(diff(c,b)>16)total++;}return {visible,total,ratio:visible/total};
},path);}
async function compareCrops(p,viewport){
 await p.selectOption('#case','mixed');await frames(p);
 for(const resource of ['access-a3','access-a2','s1'])for(const zoom of ['initial','max']){
  await p.locator('#reset-view').click();if(zoom==='max')for(let i=0;i<8;i++)await p.locator('#zoom-in').click();
  await p.selectOption('#selected-resource',resource);await frames(p);await p.locator('#center-selection').click();await p.locator('#scene').focus();await p.keyboard.press('Escape');await frames(p);
  const before=await app(p),panels=[];
  for(const id of ['h32','three-quarter','half']){
   await profile(p,id);const a=await app(p);near(a.camera.x,before.camera.x);near(a.camera.y,before.camera.y);near(a.camera.zoom,before.camera.zoom);
   const crop=await p.evaluate(async path=>{
    const m=await import(path),shot=await m.diagnosticPixels(),canvas=document.createElement('canvas');canvas.width=shot.width;canvas.height=shot.height;canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(shot.data),shot.width,shot.height),0,0);
    const c=document.createElement('canvas');c.width=192;c.height=160;c.getContext('2d').drawImage(canvas,Math.floor(shot.width/2)-96,Math.floor(shot.height/2)-80,192,160,0,0,192,160);return c.toDataURL();
   },path);panels.push(crop);
  }
  const strip=await p.evaluate(async panels=>{const c=document.createElement('canvas');c.width=576;c.height=160;for(let i=0;i<panels.length;i++){const image=new Image();image.src=panels[i];await image.decode();c.getContext('2d').drawImage(image,i*192,0);}return c.toDataURL();},panels);
  const file=`${viewport.width}-${resource}-${zoom}.png`;await writeFile(resolve(output,file),Buffer.from(strip.split(',')[1],'base64'));evidence.comparisons.push({file,viewport,dpr:before.viewport.dpr,resource,zoom,camera:before.camera,zoomRatio:before.camera.zoom/before.initialZoom,panel:{width:192,height:160,unit:'physical-pixel-no-resize'},order:['h32','three-quarter','half'],portraitRasterLimit:384});
 }
}
try{
 for(const viewport of [{width:1365,height:768},{width:393,height:852},{width:320,height:640}]){
  const context=await browser.newContext({viewport,deviceScaleFactor:viewport.width<500?2:1,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  await context.addInitScript({content:'('+installLifecycleProbe.toString().replaceAll('/dist/hospital-phaser/game.mjs',path)+')();'});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const start=Date.now();await p.goto(url);await ready(p);await frames(p);const initial=await app(p);geometry(initial);
  const r={viewport,dpr:initial.viewport.dpr,readyWallMs:Date.now()-start,timings:initial.timings,gpu:initial.renderer.gpu,occlusion:[],profiles:[],errors};evidence.records.push(r);
  r.network=await p.evaluate(()=>performance.getEntriesByType('resource').filter(x=>x.name.endsWith('.png')).map(x=>({file:new URL(x.name).pathname,transferSize:x.transferSize,encodedBodySize:x.encodedBodySize,duration:x.duration})));
  for(const id of ['axes','pivots','labels-toggle'])await p.locator('#'+id).uncheck();await p.locator('[data-layer="guides"]').uncheck();
  for(const pose of ['delante','detras','esquina']){await p.locator(`[data-pose="${pose}"]`).click();await frames(p);const v=await ratio(p);assert.ok(v.total>100);if(pose==='delante')assert.ok(v.ratio>.99);else if(pose==='detras')assert.ok(v.ratio<.02);else assert.ok(v.ratio>.02&&v.ratio<.98,'La nueva silueta debe estar parcialmente oculta, no ser equivalente píxel a píxel a otra imagen');r.occlusion.push({pose,...v});if(pose!=='detras')await p.locator('.viewport').screenshot({path:resolve(output,`${viewport.width}-${pose}.png`)});}
  await p.locator('[data-pose="detras"]').click();await p.locator('#show-hidden').check();await frames(p);assert.ok((await ratio(p)).ratio>.5);await p.locator('#show-hidden').uncheck();
  await p.selectOption('#case','mixed');await frames(p);assert.deepEqual((await app(p)).counts,{survivors:4,zombies:2,barricades:2,testActors:0,accesses:4});
  assert.equal(new Set((await app(p)).nodes.filter(n=>n.role==='survivor').map(n=>n.assetId)).size,4);
  await p.selectOption('#selected-resource','s1');await frames(p);await p.locator('#scene').scrollIntoViewIfNeeded();let a=await app(p),rect=await p.locator('#scene').boundingBox(),node=a.nodes.find(n=>n.id==='s1');await p.mouse.click(rect.x+a.camera.x+node.position.x*a.camera.zoom,rect.y+a.camera.y+node.position.y*a.camera.zoom);await frames(p);assert.equal((await app(p)).state.selected,'s1');
  for(const id of ['three-quarter','half','h32']){const before=await app(p);await profile(p,id);const after=await app(p);geometry(after);near(after.camera.x,before.camera.x);near(after.camera.y,before.camera.y);assert.equal(after.state.selected,'s1');r.profiles.push({id,textures:after.renderer.textures,timings:after.timings});}
  await p.locator('#actor-scale').focus();await p.keyboard.press('End');await frames(p);geometry(await app(p));await p.keyboard.press('Home');await frames(p);geometry(await app(p));await p.locator('#actor-scale').evaluate(el=>{el.value='1';el.dispatchEvent(new Event('input',{bubbles:true}));});await frames(p);
  for(const [c,z,b]of [['max-zombies',4,0],['max-barricades',0,4],['mixed',2,2]]){await p.selectOption('#case',c);await frames(p);const a=await app(p);assert.equal(a.counts.zombies,z);assert.equal(a.counts.barricades,b);assert.equal(a.counts.survivors,4);assert.equal(new Set(a.nodes.filter(n=>n.access).map(n=>n.access)).size,4);}
  await p.selectOption('[data-access="0"]','empty');await frames(p);assert.equal((await app(p)).counts.accesses,3);await p.selectOption('#case','mixed');
  await p.selectOption('#selected-resource','s1');await p.locator('[data-layer="actors"]').uncheck();await frames(p);assert.equal((await app(p)).state.selected,null);await p.locator('[data-layer="actors"]').check();
  await p.locator('#scene').focus();await p.keyboard.press('Escape');await frames(p);const n=(await app(p)).counters.commands;await p.locator('#zoom-in').focus();await p.keyboard.press('Enter');await frames(p);assert.equal((await app(p)).counters.commands,n+1);
  await p.locator('#reset-view').click();await p.locator('#scene').scrollIntoViewIfNeeded();await frames(p);rect=await p.locator('#scene').boundingBox();const point={x:Math.round(rect.x+rect.width/2),y:Math.round(rect.y+rect.height/2)},local={x:point.x-rect.x,y:point.y-rect.y},world=await api(p,'worldAt',local);await p.mouse.move(point.x,point.y);await p.mouse.wheel(0,-180);await frames(p);const afterWheel=await api(p,'worldAt',local);near(world.x,afterWheel.x);near(world.y,afterWheel.y);
  const old=await app(p);await p.mouse.move(point.x,point.y);await p.mouse.down();await p.mouse.move(point.x+28,point.y+16,{steps:4});await p.mouse.up();await frames(p);near((await app(p)).camera.x,old.camera.x+28);assert.equal((await app(p)).state.selected,old.state.selected);
  if(viewport.width<500){
   await p.locator('#scene').scrollIntoViewIfNeeded();rect=await p.locator('#scene').boundingBox();const cdp=await context.newCDPSession(p),center={x:rect.x+rect.width/2,y:rect.y+rect.height/2},local={x:rect.width/2,y:rect.height/2},old=await api(p,'worldAt',local),touches=d=>[{id:1,x:center.x-d,y:center.y},{id:2,x:center.x+d,y:center.y}];
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches(30)});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:touches(45)});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await frames(p);const now=await api(p,'worldAt',local);near(now.x,old.x);near(now.y,old.y);
   const n=(await app(p)).counters.commands;await p.locator('#select-hospital').tap();await frames(p);assert.equal((await app(p)).counters.commands,n+1);r.emulatedTouch='Pinza anclada y tap: un comando; no teléfono físico';
  }
  await p.locator('#reset-view').click();await p.selectOption('#selected-resource','s1');await frames(p);await p.locator('.viewport').screenshot({path:resolve(output,`${viewport.width}-mixto.png`)});await p.screenshot({path:resolve(output,`${viewport.width}-interfaz.png`)});
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));for(const el of await p.locator('button,select,input[type=number],input[type=range]').all()){const b=await el.boundingBox();assert.ok(b.width>=44&&b.height>=44);}
  await p.setViewportSize(viewport.width<500?{width:360,height:740}:{width:1110,height:800});await frames(p);geometry(await app(p));assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.setViewportSize(viewport);await frames(p);
  if(viewport.width!==320)await compareCrops(p,viewport);
  if(viewport.width===1365)await portraitComparison(p);
  await profile(p,'h32');r.exports=await p.evaluate(async path=>(await (await import(path)).encodedDerivatives()).map(({dataUrl,...x})=>x),path);
  for(const id of kit.survivorAssetIds){const e=r.exports.find(x=>x.id===id);assert.deepEqual(e.alphaRange,[0,255]);assert.ok(Math.abs(e.normalizedAlphaCoverage-Math.PI/4)<.005);assert.equal(e.sourceAlphaCoverage,1);}
  // Comparar cinco instancias con la misma composición inicial. La escena mixta
  // anterior puede haber compilado un shader adicional por sus diagnósticos.
  {const s=(await api(p)).starts;await p.locator('#restart-scene').click();await p.waitForFunction(({path,s})=>import(path).then(m=>m.inspect().starts===s+1&&m.inspect().state==='ready'),{path,s});await frames(p);}
  const stable=await probe(p);for(let i=0;i<5;i++){const s=(await api(p)).starts;await p.locator('#restart-scene').click();await p.waitForFunction(({path,s})=>import(path).then(m=>m.inspect().starts===s+1&&m.inspect().state==='ready'),{path,s});await frames(p);const check=await probe(p);assert.deepEqual(check.listeners,stable.listeners);assert.deepEqual(check.gl,stable.gl);assert.equal(check.activeSceneContexts,1);assert.equal((await api(p)).lastDisposal.sourcesReleased,true);}
  await profile(p,'three-quarter');await p.evaluate(()=>{window.uploadedContext=document.querySelector('#scene').getContext('webgl').getExtension('WEBGL_lose_context');window.uploadedContext.loseContext();});await p.waitForFunction(()=>document.querySelector('#renderer-status').textContent.includes('perdido'));await p.waitForTimeout(150);await p.evaluate(()=>window.uploadedContext.restoreContext());await p.waitForFunction(()=>document.querySelector('#renderer-status').textContent.includes('recuperado'));await frames(p);geometry(await app(p));
  const draws=(await app(p)).renderer.renderEvents;await p.waitForTimeout(350);assert.equal((await app(p)).renderer.renderEvents,draws);r.idleDraws=0;
  await api(p,'disposeWorkshop');r.disposed=await probe(p);r.cleanup=(await api(p)).lastDisposal;assert.equal(r.cleanup.auxiliaryCanvasesReleased,8);assert.equal(r.cleanup.derivedCanvasesReleased,8);assert.equal(r.disposed.activeSceneContexts,0);assert.equal(r.disposed.resizeTargets,0);assert.equal(r.disposed.startupTimers,0);assert.deepEqual(r.disposed.gl,{Texture:0,Buffer:0,Framebuffer:0,Renderbuffer:0,Program:0,Shader:0});assert.deepEqual(r.disposed.listeners,[{target:'window',type:'pagehide'},{target:'window',type:'pageshow'}]);assert.ok(await p.evaluate(()=>window.onblur===window.h32OriginalBlur&&window.onfocus===window.h32OriginalFocus));assert.deepEqual(errors,[]);await context.close();
 }
 const fail=await browser.newContext(),p=await fail.newPage();await p.route('**/kit_arte_h33/assets/zombi.png',r=>r.abort());await p.goto(url);await p.waitForFunction(()=>document.body.dataset.state==='error');assert.equal(await p.locator('#loading').getAttribute('role'),'alert');await p.unroute('**/kit_arte_h33/assets/zombi.png');await p.locator('#restart-scene').click();await ready(p);evidence.resourceRecovery=true;await fail.close();
 const navigation=await browser.newContext(),back=await navigation.newPage();await back.addInitScript(()=>{window.uploadedDocument=crypto.randomUUID();window.addEventListener('pageshow',e=>window.uploadedPersisted=e.persisted);});await back.goto(url);await ready(back);const token=await back.evaluate(()=>window.uploadedDocument);await back.selectOption('#kit-source','reference');await ready(back);assert.equal(await back.locator('#kit-source').inputValue(),'reference');await back.goBack({waitUntil:'commit'});await ready(back);assert.equal(await back.locator('#kit-source').inputValue(),'uploaded');evidence.navigation={persisted:await back.evaluate(()=>window.uploadedPersisted),sameDocument:await back.evaluate(()=>window.uploadedDocument)===token,profile:(await app(back)).state.profile};assert.equal(evidence.navigation.profile,'h32');await navigation.close();
 evidence.passed=true;
}catch(error){evidence.passed=false;evidence.failures.push(error.stack);throw error;}
finally{await writeFile(resolve(output,'resultados.json'),JSON.stringify(evidence,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({passed:evidence.passed,viewports:evidence.records.length,comparisons:evidence.comparisons.length,output}));
