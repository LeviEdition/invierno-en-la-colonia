import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.H32_LIFECYCLE_DIR||'/tmp/h32-lifecycle';await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1365,height:768}}),evidence={method:'Sondas QA de listeners, observers y objetos GL creados/eliminados; no miden VRAM',cycles:[]};
await page.addInitScript(()=>{
 window.h32OriginalBlur=()=>{};window.onblur=window.h32OriginalBlur;window.h32OriginalFocus=()=>{};window.onfocus=window.h32OriginalFocus;
 const listeners=[],observers=[],glObjects=new Map();const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
 EventTarget.prototype.addEventListener=function(type,fn,options){const capture=typeof options==='boolean'?options:!!options?.capture;if(!options?.once&&!listeners.some(x=>x.target===this&&x.type===type&&x.fn===fn&&x.capture===capture&&!x.removed&&!x.signal?.aborted))listeners.push({target:this,type,fn,capture,signal:options?.signal,owned:new Error().stack.includes('/dist/hospital-phaser/game.mjs'),removed:false});return add.call(this,type,fn,options);};
 EventTarget.prototype.removeEventListener=function(type,fn,options){const capture=typeof options==='boolean'?options:!!options?.capture;for(const item of listeners)if(item.target===this&&item.type===type&&item.fn===fn&&item.capture===capture)item.removed=true;return remove.call(this,type,fn,options);};
 const OriginalObserver=ResizeObserver;window.ResizeObserver=class extends OriginalObserver{constructor(callback){super(callback);this.targets=new Set();observers.push(this);}observe(target,options){this.targets.add(target);super.observe(target,options);}unobserve(target){this.targets.delete(target);super.unobserve(target);}disconnect(){this.targets.clear();super.disconnect();}};
 for(const proto of [WebGLRenderingContext.prototype,WebGL2RenderingContext.prototype])for(const kind of ['Texture','Buffer','Framebuffer','Renderbuffer','Program','Shader']){
  const create=proto['create'+kind],destroy=proto['delete'+kind];proto['create'+kind]=function(...args){const obj=create.apply(this,args);if(obj)glObjects.set(obj,{kind,canvas:this.canvas,context:this,stack:new Error().stack});return obj;};proto['delete'+kind]=function(obj){glObjects.delete(obj);return destroy.call(this,obj);};
 }
 window.h32TextureStacks=()=>[...glObjects.values()].filter(x=>x.kind==='Texture'&&x.canvas.id==='scene').map(x=>x.stack);
 window.h32Lifecycle=()=>({listeners:listeners.filter(x=>x.owned&&!x.removed&&!x.signal?.aborted&&(x.target===window||x.target===document||x.target instanceof HTMLCanvasElement)).map(x=>({target:x.target===window?'window':x.target===document?'document':x.target.id||'canvas',type:x.type})).sort((a,b)=>(a.target+a.type).localeCompare(b.target+b.type)),resizeTargets:observers.reduce((n,o)=>n+o.targets.size,0),gl:Object.fromEntries(['Texture','Buffer','Framebuffer','Renderbuffer','Program','Shader'].map(kind=>[kind,[...glObjects.entries()].filter(([obj,x])=>x.kind===kind&&x.canvas.id==='scene'&&!x.context.isContextLost()&&x.context['is'+kind](obj)).length]))});
});
const snapshot=()=>page.evaluate(()=>window.h32Lifecycle());
const ready=()=>page.waitForFunction(()=>document.body.dataset.state==='ready');
try{
 await page.goto((process.env.H32_ORIGIN||'http://127.0.0.1:8771')+'/prototypes/hospital-phaser/');await ready();
 const initial=await snapshot();evidence.initial=initial;assert.equal(initial.resizeTargets,1);
 for(let i=0;i<5;i++){await page.locator('#restart-scene').click();await ready();const next=await snapshot();evidence.cycles.push(next);assert.deepEqual(next.listeners,initial.listeners,'Listeners no deben crecer tras reiniciar');assert.equal(next.resizeTargets,1);assert.deepEqual(next.gl,initial.gl,'Objetos GL activos estables en cada reinicio');}
 // Selección real por alfa: punto en la fachada y margen transparente, tras cambio de cámara.
 const inspect=()=>page.evaluate(async()=>(await import('/dist/hospital-phaser/game.mjs')).inspect());
 const pick=async(x,y)=>{await page.locator('#scene').scrollIntoViewIfNeeded();const {app:{camera}}=await inspect(),b=await page.locator('#scene').boundingBox();await page.mouse.click(b.x+camera.x+x*camera.zoom,b.y+camera.y+y*camera.zoom);};
 await pick(750,500);assert.ok((await inspect()).app.selected);await page.locator('#scene').scrollIntoViewIfNeeded();const box=await page.locator('#scene').boundingBox();await page.mouse.click(box.x+40,box.y+40);assert.equal((await inspect()).app.selected,false);
 await page.locator('#zoom-in').click();await pick(750,500);assert.ok((await inspect()).app.selected);
 evidence.selection='Click sobre alfa de fachada, margen vacío y selección tras zoom';
 for(let i=0;i<14;i++)await page.locator('#zoom-in').click();let data=await inspect();assert.equal(data.app.camera.zoom,data.app.camera.maxZoom);
 for(let i=0;i<22;i++)await page.locator('#zoom-out').click();data=await inspect();assert.equal(data.app.camera.zoom,data.app.camera.minZoom);evidence.zoomLimits=true;
 await page.evaluate(()=>{window.h32ContextExtension=document.querySelector('#scene').getContext('webgl').getExtension('WEBGL_lose_context');window.h32ContextExtension.loseContext();});
 await page.waitForFunction(()=>document.querySelector('#renderer-status').textContent.includes('perdido'));await page.waitForTimeout(150);
 await page.evaluate(()=>window.h32ContextExtension.restoreContext());await page.waitForFunction(()=>document.querySelector('#renderer-status').textContent.includes('recuperado'));
 await page.locator('#reset-view').click();evidence.contextRecovery=true;
 await page.evaluate(async()=>(await import('/dist/hospital-phaser/game.mjs')).disposeExperiment());const final=await snapshot();evidence.disposed=final;evidence.contextRelease='Game.destroy elimina wrappers; WEBGL_lose_context libera también la textura temporal no registrada de Phaser 4.2.1. Conteo GL excluye contextos perdidos; no es una medición de VRAM';evidence.contextReleasedTextureHandles=await page.evaluate(()=>window.h32TextureStacks().length);
 assert.equal(final.resizeTargets,0);assert.deepEqual(final.gl,{Texture:0,Buffer:0,Framebuffer:0,Renderbuffer:0,Program:0,Shader:0});assert.deepEqual(final.listeners,[]);
 assert.ok(await page.evaluate(()=>window.onblur===window.h32OriginalBlur&&window.onfocus===window.h32OriginalFocus));evidence.existingWindowHandlersPreserved=true;
 evidence.passed=true;
}catch(error){evidence.passed=false;evidence.error=error.stack;throw error;}
finally{await writeFile(output+'/resultados.json',JSON.stringify(evidence,null,2)+'\n');await browser.close();}
console.log(JSON.stringify(evidence,null,2));
