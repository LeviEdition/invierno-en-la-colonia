// Comparación controlada de rasterización. Las sondas y variantes no se distribuyen.
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {cpus,totalmem,release} from 'node:os';
import {build} from 'esbuild';
import {projectRoot} from './build-hospital-phaser.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.H32_QUALITY_DIR||'/tmp/h32-quality',base=process.env.H32_ORIGIN||'http://127.0.0.1:8771';
const baselineCommit='6036b81779079c8721d7e5fd4b44744cc9c4459f';
const before=execFileSync('git',['show',baselineCommit+':prototypes/hospital-phaser/renderer.mjs'],{cwd:projectRoot,encoding:'utf8'});
const after=await readFile(new URL('../prototypes/hospital-phaser/renderer.mjs',import.meta.url),'utf8');
const pot=source=>source.replace("for(const key of ['ground','hospital','zombie'])this.textures.addImage('h32-'+key,images[key]);","for(const key of ['ground','hospital','zombie'])addIllustratedTexture(this.textures,'h32-'+key,images[key]);").replace("'h32-'+key).setOrigin","'h32-'+key,'original').setOrigin");
const mip=source=>source.replace('autoFocus:false,',"autoFocus:false,render:{mipmapFilter:'LINEAR_MIPMAP_LINEAR'},");
const variants={before,aaOff:before.replace('autoFocus:false,','autoFocus:false,render:{antialiasGL:false},'),mipOnly:mip(before),potOnly:"import {addIllustratedTexture} from './texture-quality.mjs';\n"+pot(before),after};
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const evidence={baselineCommit,baselineRendererSha256:createHash('sha256').update(before).digest('hex'),chromium:browser.version(),platform:process.platform,node:process.version,physicalDevice:false,conditions:{os:process.platform+' '+release(),cpu:cpus()[0].model,logicalCpus:cpus().length,totalSystemMemoryBytes:totalmem(),headless:true,network:'HTTP localhost sin throttling',isolation:'Variantes secuenciales sin otros gates/builds de esta tarea. Host compartido; carga ajena no controlada',cost:'3 contextos nuevos por variante, orden alternado; 350ms de reposo y 60 comandos de pan por rAF; setup mide CPU/envío, no finalización de GPU; heap JS tras GC excluye superficies/VRAM'},method:'Mismo renderer Canvas original, PNG, cámara, framebuffer, tamaño CSS y DPR. PNG sin reescalar. MAE RGB no equivale a aprobación perceptual.',records:[],failures:[]};
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function bundle(source){
 const contents=source.replace('game=instance;','game=instance;window.h32QualityGame=instance;').replace('world=this;','world=this;window.h32TextureStart=performance.now();').replace('this.game.events.on(Phaser.Core.Events.PRE_RENDER','window.h32TextureSetupMs=performance.now()-window.h32TextureStart;this.game.events.on(Phaser.Core.Events.PRE_RENDER');
 const result=await build({absWorkingDir:projectRoot,entryPoints:['prototypes/hospital-phaser/main.mjs'],bundle:true,minify:true,format:'esm',platform:'browser',target:'es2022',write:false,plugins:[{name:'quality-probe',setup(b){b.onLoad({filter:/hospital-phaser.*renderer\.mjs$/},()=>({contents,loader:'js'}));}}]});
 return result.outputFiles[0].text;
}
// ROI en coordenadas de mundo, iguales en cada backend; no se recorta por contenido.
const regions={hospital:{x:580,y:310,w:320,h:180},ground:{x:1190,y:450,w:60,h:130},zombie:{x:685,y:555,w:60,h:120}};
async function sample(page){
 return page.evaluate(async regions=>{
  const app=await import('/dist/hospital-phaser/game.mjs'),state=app.inspect().app,actual=await app.diagnosticPixels();
  const {scene}=await import('/prototypes/hospital/scene.mjs'),{loadImages,renderScene}=await import('/prototypes/hospital/renderer.mjs'),images=await loadImages();
  const surface=document.createElement('canvas');surface.width=actual.width;surface.height=actual.height;
  const ctx=surface.getContext('2d',{willReadFrequently:true});renderScene(ctx,{images,camera:state.camera,viewport:state.viewport,pose:scene.positions.delante});
  const reference=ctx.getImageData(0,0,surface.width,surface.height),referencePng=surface.toDataURL();
  const phaserPixels=new ImageData(new Uint8ClampedArray(actual.data),actual.width,actual.height);ctx.putImageData(phaserPixels,0,0);const phaserPng=surface.toDataURL();
  const crops={},metrics={};
  for(const [key,region]of Object.entries(regions)){
   // En escritorio hay un parche de nieve más amplio a la izquierda. En móvil
   // queda fuera de cuadro: se usa el parche derecho, igual en los tres backends.
   const r=key==='ground'&&state.viewport.width>600?{x:150,y:300,w:200,h:160}:region;
   const {camera,viewport:{dpr}}=state,x=Math.round((camera.x+r.x*camera.zoom)*dpr),y=Math.round((camera.y+r.y*camera.zoom)*dpr),w=Math.round(r.w*camera.zoom*dpr),h=Math.round(r.h*camera.zoom*dpr);
   if(x<0||y<0||x+w>actual.width||y+h>actual.height)throw Error('ROI fuera de cuadro: '+key);
   const crop=document.createElement('canvas');crop.width=w;crop.height=h;const c=crop.getContext('2d');
   c.putImageData(reference,-x,-y);const canvas=crop.toDataURL();c.putImageData(phaserPixels,-x,-y);crops[key]={canvas,phaser:crop.toDataURL(),rect:{x,y,w,h}};
   let error=0,count=0;for(let py=y;py<y+h;py++)for(let px=x;px<x+w;px++){const i=(py*actual.width+px)*4;for(let k=0;k<3;k++){error+=Math.abs(actual.data[i+k]-reference.data[i+k]);count++;}}
   metrics[key]={maeRGB:error/count};
  }
  const game=window.h32QualityGame,gl=game.renderer.gl,c=document.querySelector('#scene'),css=c.getBoundingClientRect();
  const binding=gl.getParameter(gl.TEXTURE_BINDING_2D);
  const textures=Object.fromEntries(['ground','hospital','zombie'].map(key=>{const t=game.textures.get('h32-'+key),s=t.source[0],f=t.get(t.has('original')?'original':'__BASE'),w=s.glTexture;gl.bindTexture(gl.TEXTURE_2D,w.webGLTexture);return [key,{width:s.width,height:s.height,frame:{x:f.cutX,y:f.cutY,w:f.cutWidth,h:f.cutHeight},minFilter:gl.getTexParameter(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER),magFilter:gl.getTexParameter(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER),mipmaps:w.isMipmap(),source:imageInfo(images[key])}];}));gl.bindTexture(gl.TEXTURE_2D,binding);
  function imageInfo(image){return {width:image.width,height:image.height};}
  return {referencePng,phaserPng,crops,metrics,camera:state.camera,viewport:state.viewport,css:{width:css.width,height:css.height,clientWidth:c.clientWidth,clientHeight:c.clientHeight,imageRendering:getComputedStyle(c).imageRendering},internal:{width:c.width,height:c.height,drawingBufferWidth:gl.drawingBufferWidth,drawingBufferHeight:gl.drawingBufferHeight},config:{antialias:game.config.antialias,antialiasGL:game.config.antialiasGL,pixelArt:game.config.pixelArt,roundPixels:game.config.roundPixels,mipmapFilter:game.config.mipmapFilter},contextAttributes:gl.getContextAttributes(),gpu:state.renderer.gpu,textures};
 },regions);
}
// Comparativas sin interpolación: tres columnas al 100% de sus píxeles físicos.
async function strip(page,images,labels){
 return page.evaluate(async({images,labels})=>{
  const loaded=await Promise.all(images.map(async src=>{const im=new Image();im.src=src;await im.decode();return im;}));
  const width=loaded[0].width,height=loaded[0].height;if(!loaded.every(im=>im.width===width&&im.height===height))throw Error('Escalas distintas');
  const column=Math.max(width,112),out=document.createElement('canvas');out.width=column*loaded.length;out.height=height+32;const x=out.getContext('2d');x.fillStyle='#101b23';x.fillRect(0,0,out.width,out.height);x.font='12px sans-serif';x.fillStyle='#ffffff';
  loaded.forEach((im,i)=>{x.fillText(labels[i],i*column+4,21);x.drawImage(im,i*column+Math.floor((column-width)/2),32);});return out.toDataURL();
 },{images,labels});
}
const png=async(name,url)=>writeFile(output+'/'+name,Buffer.from(url.split(',')[1],'base64'));
try{
 const bundles=Object.fromEntries(await Promise.all(Object.entries(variants).map(async([name,source])=>[name,await bundle(source)])));
 const configurations=[{name:'desktop-dpr1',width:1365,height:768,dpr:1},{name:'desktop-dpr125',width:1365,height:768,dpr:1.25},{name:'mobile-dpr2',width:393,height:852,dpr:2}];
 for(const configuration of configurations){
  const context=await browser.newContext({viewport:{width:configuration.width,height:configuration.height},deviceScaleFactor:configuration.dpr,isMobile:configuration.width<500,hasTouch:configuration.width<500});
  const samples={};
  for(const [variant,body]of Object.entries(bundles)){
   // Variables intermedias solo necesitan el caso de escritorio inicial/reducido.
   if(!['before','after'].includes(variant)&&configuration.name!=='desktop-dpr1')continue;
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/dist/hospital-phaser/game.mjs',r=>r.fulfill({body,contentType:'text/javascript'}));
   await page.goto(base+'/prototypes/hospital-phaser/?diagnostics');await page.waitForFunction(()=>document.body.dataset.state==='ready');
   for(const zoom of ['initial','in','out']){
    await page.locator('#reset-view').click();if(zoom!=='initial')await page.locator(zoom==='in'?'#zoom-in':'#zoom-out').click();await frames(page);
    const shot=await sample(page),{referencePng,phaserPng,crops,...data}=shot;
    if(variant==='after'&&zoom==='initial'&&configuration.name==='desktop-dpr1'){
     evidence.originalTexels=await page.evaluate(async()=>{
      const {loadImages}=await import('/prototypes/hospital/renderer.mjs'),images=await loadImages(),result={};
      for(const key of ['ground','hospital','zombie']){
       const image=images[key],texture=window.h32QualityGame.textures.get('h32-'+key),frame=texture.get('original'),source=texture.source[0].image,c=document.createElement('canvas');c.width=image.width;c.height=image.height;c.getContext('2d').drawImage(image,0,0);
       const original=c.getContext('2d').getImageData(0,0,c.width,c.height).data,derived=source.getContext('2d').getImageData(frame.cutX,frame.cutY,frame.cutWidth,frame.cutHeight).data;
       let differences=0;for(let i=0;i<original.length;i++)if(original[i]!==derived[i])differences++;result[key]={comparedChannels:original.length,differences};
      }return result;
     });
     for(const result of Object.values(evidence.originalTexels))assert.equal(result.differences,0,'El frame auxiliar debe conservar los texeles RGBA del original');
    }
    evidence.records.push({configuration,variant,zoom,...data});samples[variant+'-'+zoom]={referencePng,phaserPng,crops};
    assert.equal(data.internal.width,Math.round(data.viewport.width*data.viewport.dpr));assert.equal(data.internal.height,Math.round(data.viewport.height*data.viewport.dpr));
    assert.equal(data.internal.drawingBufferWidth,data.internal.width);assert.equal(data.internal.drawingBufferHeight,data.internal.height);
    assert.equal(data.css.imageRendering,'auto');assert.equal(data.config.pixelArt,false);assert.equal(data.config.antialias,true);
   }
   assert.deepEqual(errors,[]);await page.close();
  }
  const composer=await context.newPage();
  for(const zoom of ['initial','in','out']){
   const old=samples['before-'+zoom],now=samples['after-'+zoom],name=configuration.name+'-'+zoom;
   await png(name+'.png',await strip(composer,[now.referencePng,old.phaserPng,now.phaserPng],['Canvas','Phaser antes','Phaser despues']));
   for(const key of Object.keys(regions))await png(name+'-'+key+'.png',await strip(composer,[now.crops[key].canvas,old.crops[key].phaser,now.crops[key].phaser],['Canvas','Antes','Despues']));
   const oldRecord=evidence.records.find(r=>r.configuration.name===configuration.name&&r.variant==='before'&&r.zoom===zoom),newRecord=evidence.records.find(r=>r.configuration.name===configuration.name&&r.variant==='after'&&r.zoom===zoom);
   assert.deepEqual(oldRecord.camera,newRecord.camera);assert.deepEqual(oldRecord.internal,newRecord.internal);assert.deepEqual(oldRecord.css,newRecord.css);
  }
  await context.close();
 }
 evidence.costSamples=[];
 // Seis contextos nuevos, orden alternado. Mide QA minificado con las mismas sondas;
 // incluye instalación de atlas/upload, no espera explícita de finalización de GPU.
 for(let trial=0;trial<3;trial++)for(const variant of trial%2?['after','before']:['before','after']){
  const context=await browser.newContext({viewport:{width:1365,height:768},deviceScaleFactor:1}),page=await context.newPage();
  await page.route('**/dist/hospital-phaser/game.mjs',r=>r.fulfill({body:bundles[variant],contentType:'text/javascript'}));
  await page.goto(base+'/prototypes/hospital-phaser/?diagnostics');await page.waitForFunction(()=>document.body.dataset.state==='ready');await frames(page);
  const cost=await page.evaluate(async()=>{
   const app=await import('/dist/hospital-phaser/game.mjs'),initial=app.inspect().app.renderer.renderEvents;
   await new Promise(resolve=>setTimeout(resolve,350));const idleDraws=app.inspect().app.renderer.renderEvents-initial;
   const intervals=[],canvas=document.querySelector('#scene');let last=performance.now();
   for(let i=0;i<60;i++){await new Promise(requestAnimationFrame);const now=performance.now();intervals.push(now-last);last=now;canvas.dispatchEvent(new KeyboardEvent('keydown',{key:i%2?'ArrowRight':'ArrowLeft',bubbles:true,cancelable:true}));}
   intervals.sort((a,b)=>a-b);
   return {readyMs:performance.getEntriesByName('hospital-ready')[0].startTime,textureSetupSubmitMs:window.h32TextureSetupMs,idleDraws,navigationRafMedianMs:intervals[30],navigationRafP95Ms:intervals[57],navigationCommands:app.inspect().app.counters.inputCommands};
  });
  assert.equal(cost.idleDraws,0);assert.equal(cost.navigationCommands,60);
  const cdp=await context.newCDPSession(page);await cdp.send('HeapProfiler.collectGarbage');cost.heapAfterGc=await cdp.send('Runtime.getHeapUsage');
  evidence.costSamples.push({trial,variant,...cost});await context.close();
 }
 for(const record of evidence.records.filter(r=>r.variant==='after'))for(const t of Object.values(record.textures)){
  assert.equal(t.minFilter,9987,'Falta filtrado trilineal con mipmaps reales');assert.equal(t.magFilter,9729);assert.equal(t.mipmaps,true);
  assert.equal(t.frame.w,t.source.width);assert.equal(t.frame.h,t.source.height);
 }
 // Sonda numérica, no aceptación artística: en la vista inicial se exige una
 // reducción de MAE del 20%; al alejar, mejora sin imponer ese mismo porcentaje.
 // Cambia la fase de los niveles de mipmap con el zoom; MAE no mide nitidez.
 for(const zoom of ['initial','out']){
  const get=variant=>evidence.records.find(r=>r.configuration.name==='desktop-dpr1'&&r.variant===variant&&r.zoom===zoom);
  for(const key of ['hospital','zombie'])assert.ok(get('after').metrics[key].maeRGB<get('before').metrics[key].maeRGB*(zoom==='initial'?.8:1),`Sin mejora de ${key}/${zoom}`);
 }
 evidence.passed=true;
}catch(error){evidence.passed=false;evidence.failures.push(error.stack);throw error;}
finally{await writeFile(output+'/resultados.json',JSON.stringify(evidence,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({passed:evidence.passed,records:evidence.records.length,output}));
