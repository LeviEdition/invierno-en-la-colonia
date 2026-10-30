import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {cpus,totalmem,release} from 'node:os';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.H33_ORIGIN||'http://127.0.0.1:8772',output=process.env.H33_TEXTURE_DIR||'/tmp/h33-textures',path='/dist/hospital-workshop/game.mjs';await mkdir(output,{recursive:true});
const kit=JSON.parse(await readFile(new URL('../prototypes/hospital-workshop/kit.json',import.meta.url)));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const evidence={conditions:{os:process.platform+' '+release(),cpu:cpus()[0].model,logicalCpus:cpus().length,totalSystemMemoryBytes:totalmem(),node:process.version,chromium:browser.version(),headless:true,physicalMobile:false,network:'HTTP localhost, sin compresión ni throttling; PNG originales comunes, caché caliente durante cambios de perfil',method:'3 ensayos por perfil/viewport, orden rotativo, sin exportación PNG durante tiempos; host compartido con carga ajena no controlada. Tiempos CPU/envío y primer frame, no finalización GPU; no VRAM medida',memory:'RGBA teórica por dimensiones/potencias/niveles; excluye framebuffer, driver, cachés y marcadores. Auxiliares y derivados separados.'},sourceSnapshot:kit.sourceSnapshot,originalFiles:kit.assets.filter(a=>a.kind==='image').map(a=>({id:a.id,width:a.width,height:a.height,bytes:a.bytes,sha256:a.sha256,alpha:a.alpha})),samples:[],exports:[],comparisons:[],failures:[]};
evidence.build=JSON.parse(await readFile(new URL('../dist/hospital-workshop/build.json',import.meta.url)));
const inspect=page=>page.evaluate(async path=>(await import(path)).inspect(),path),frames=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function profile(page,id){const starts=(await inspect(page)).starts;await page.locator('#profile').selectOption(id);await page.waitForFunction(({path,starts})=>import(path).then(m=>m.inspect().starts===starts+1&&m.inspect().state==='ready'),{path,starts});await frames(page);}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const savePng=(file,url)=>writeFile(output+'/'+file,Buffer.from(url.split(',')[1],'base64'));
try{
 for(const viewport of [{width:1365,height:768},{width:393,height:852}]){
  const dpr=viewport.width<500?2:1,context=await browser.newContext({viewport,deviceScaleFactor:dpr,isMobile:viewport.width<500,hasTouch:viewport.width<500}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/prototypes/hospital-workshop/?diagnostics');await page.waitForFunction(()=>document.body.dataset.state==='ready');await frames(page);
  const cold=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/assets/')).map(r=>({name:new URL(r.name).pathname,transferSize:r.transferSize,encodedBodySize:r.encodedBodySize,duration:r.duration})));
  for(let trial=0;trial<3;trial++)for(const p of [...kit.profiles.slice(trial),...kit.profiles.slice(0,trial)]){
   await profile(page,p.id);const app=(await inspect(page)).app;
   const before=app.renderer.renderEvents;await page.waitForTimeout(350);const idle=(await inspect(page)).app.renderer.renderEvents-before;assert.equal(idle,0);
   const textures=app.renderer.textures;for(const t of Object.values(textures)){assert.equal(t.sourceWidth,t.potWidth);assert.equal(t.sourceHeight,t.potHeight);assert.equal(t.minFilter,9987);}
   evidence.samples.push({viewport,dpr,trial:trial+1,profile:p.id,factor:p.factor,timings:app.timings,gpu:app.renderer.gpu,textures,idleDraws:idle,coldResources:trial===0&&p.id===kit.profiles[0].id?cold:undefined});
  }
  // Las exportaciones son artefactos QA, no archivos que descargue el taller.
  for(const p of kit.profiles){
   await profile(page,p.id);const exports=await page.evaluate(async path=>(await import(path)).encodedDerivatives(),path);
   for(const value of exports){const {dataUrl,...record}=value,bytes=Buffer.from(dataUrl.split(',')[1],'base64');assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);assert.equal(bytes.length,record.pngBytes);assert.equal(bytes[25],6);if(record.id==='ground')assert.deepEqual(record.alphaRange,[255,255]);else{assert.equal(record.alphaRange[0],0);assert.ok(record.alphaRange[1]>200);assert.ok(Math.abs(record.normalizedAlphaCoverage/record.sourceAlphaCoverage-1)<.01,'Cobertura alfa debe conservarse al reducir (±1% relativo)');}
    const dir='derivatives/'+viewport.width+'/'+p.id;await mkdir(output+'/'+dir,{recursive:true});const file=dir+'/'+record.id+'.png';await writeFile(output+'/'+file,bytes);evidence.exports.push({viewport,dpr,...record,file});
   }
  }
  for(const id of ['axes','pivots','bounds','labels-toggle','grid'])await page.locator('#'+id).uncheck();await page.locator('[data-layer="guides"]').uncheck();await page.locator('#case').selectOption('occlusion');await page.locator('[data-pose="delante"]').click();
  for(const resource of ['hospital','ground','zombie'])for(const zoom of ['min','initial','max']){
   await page.locator('[data-layer="building"]').setChecked(resource==='hospital');await page.locator('[data-layer="actors"]').setChecked(resource==='zombie');await page.locator('[data-layer="shadows"]').uncheck();await page.locator('#reset-view').click();
   if(zoom==='max')for(let i=0;i<8;i++)await page.locator('#zoom-in').click();if(zoom==='min')for(let i=0;i<4;i++)await page.locator('#zoom-out').click();await frames(page);
   await page.locator('#selected-resource').selectOption(resource==='zombie'?'test-actor':resource);await frames(page);await page.locator('#center-selection').click();await frames(page);await page.locator('#scene').focus();await page.keyboard.press('Escape');await frames(page);
   const reference=(await inspect(page)).app,images=[],record={viewport,dpr,resource,zoom,zoomRatio:reference.camera.zoom/reference.initialZoom,camera:reference.camera,panels:[]};
   for(const p of kit.profiles){
    await profile(page,p.id);const app=(await inspect(page)).app;near(app.camera.x,reference.camera.x);near(app.camera.y,reference.camera.y);near(app.camera.zoom,reference.camera.zoom);
    const crop=await page.evaluate(async path=>{const pixels=await(await import(path)).diagnosticPixels(),w=192,h=160,x=Math.round((pixels.width-w)/2),y=Math.round((pixels.height-h)/2),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(pixels.data),pixels.width,pixels.height),-x,-y);return {dataUrl:canvas.toDataURL(),rect:{x,y,width:w,height:h},backing:{width:pixels.width,height:pixels.height}};},path);images.push(crop.dataUrl);record.panels.push({profile:p.id,factor:p.factor,crop:crop.rect,backing:crop.backing});
   }
   const strip=await page.evaluate(async({images,labels})=>{const list=await Promise.all(images.map(async src=>{const i=new Image();i.src=src;await i.decode();return i;}));const c=document.createElement('canvas');c.width=192*3;c.height=192;const x=c.getContext('2d');x.fillStyle='#101b23';x.fillRect(0,0,c.width,c.height);x.fillStyle='#ffffff';x.font='12px sans-serif';list.forEach((im,i)=>{if(im.width!==192||im.height!==160)throw Error('Escala de recorte incorrecta');x.fillText(labels[i],i*192+6,21);x.drawImage(im,i*192,32);});return c.toDataURL();},{images,labels:['100% (H3.2)','75% ensayo','50% ensayo']});
   record.file=`${viewport.width}-${resource}-${zoom}.png`;await savePng(record.file,strip);evidence.comparisons.push(record);
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 for(const profile of kit.profiles)for(const id of ['hospital','ground','zombie']){const values=evidence.exports.filter(x=>x.profile===profile.id&&x.id===id);assert.equal(values.length,2);assert.equal(values[0].sha256,values[1].sha256,'Derivado debe ser independiente del DPR de cámara');}evidence.exportsIndependentOfDpr=true;
 evidence.passed=true;
}catch(error){evidence.passed=false;evidence.failures.push(error.stack);throw error;}
finally{await writeFile(output+'/resultados.json',JSON.stringify(evidence,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({passed:evidence.passed,samples:evidence.samples.length,comparisons:evidence.comparisons.length,output}));
