import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.HOSPITAL_URL||'http://127.0.0.1:8770/prototypes/hospital/';
const output=process.env.HOSPITAL_OUTPUT_DIR||'/tmp/hospital-browser';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const evidence={url,chromium:browser.version(),device:'Chromium; viewports/táctil emulados, no teléfono físico',viewports:[],errors:[]};
const close=(a,b,tolerance=.02)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} != ${b}`);
async function frame(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function matrix(page){return page.locator('#scene').evaluate(canvas=>{
 const m=canvas.getContext('2d').getTransform(),dpr=Math.min(devicePixelRatio||1,3);
 return {x:m.e/dpr,y:m.f/dpr,zoom:m.a/dpr};
});}
async function geometry(page){return page.evaluate(async()=>{
 const {scene}=await import('./scene.mjs');const {fitCamera}=await import('./camera.mjs');
 const canvas=document.querySelector('#scene');return {scene,fitted:fitCamera(scene.bounds,canvas.clientWidth,canvas.clientHeight)};
});}
async function analysis(page){return page.evaluate(async()=>{
 const {scene}=await import('./scene.mjs');const {loadImages,renderScene}=await import('./renderer.mjs');
 const images=await loadImages(),canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d');
 const dpr=Math.min(devicePixelRatio||1,3),m=ctx.getTransform();
 const camera={x:m.e/dpr,y:m.f/dpr,zoom:m.a/dpr};
 const viewport={width:canvas.clientWidth,height:canvas.clientHeight,dpr};
 const mode=document.querySelector('[data-position][aria-pressed=true]').dataset.position;
 const pose=scene.positions[mode],showHidden=document.querySelector('#show-hidden').checked;
 const actual=ctx.getImageData(0,0,canvas.width,canvas.height).data;
 function render(assets,position){
  const surface=document.createElement('canvas');surface.width=canvas.width;surface.height=canvas.height;
  const context=surface.getContext('2d',{willReadFrequently:true});
  renderScene(context,{images:assets,camera,viewport,pose:position,showHidden});
  return context.getImageData(0,0,surface.width,surface.height).data;
 }
 const blank=document.createElement('canvas');blank.width=images.zombie.width;blank.height=images.zombie.height;
 const base=render({...images,zombie:blank},pose),unoccluded=render(images,{...pose,layer:'front'});
 let visible=0,full=0;
 for(let i=0;i<actual.length;i+=4){
  const difference=(a,b)=>Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);
  if(difference(actual,base)>16)visible++;
  if(difference(unoccluded,base)>16)full++;
 }
 const alpha={};
 for(const [name,image]of Object.entries(images)){
  const c=document.createElement('canvas');c.width=image.width;c.height=image.height;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(image,0,0);
  const pixels=x.getImageData(0,0,c.width,c.height).data;let min=255,max=0;
  for(let i=3;i<pixels.length;i+=4){min=Math.min(min,pixels[i]);max=Math.max(max,pixels[i]);}
  alpha[name]={min,max,width:image.width,height:image.height};
 }
 return {mode,showHidden,visiblePixels:visible,unoccludedPixels:full,visibleRatio:visible/full,alpha};
});}
async function canvasPoint(page,camera,point){
 const b=await page.locator('#scene').boundingBox();return {x:b.x+camera.x+point.x*camera.zoom,y:b.y+camera.y+point.y*camera.zoom};
}
try{
 for(const viewport of [{width:1365,height:768},{width:393,height:852},{width:320,height:640}]){
  const mobile=viewport.width<500,context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP ${r.status()} ${r.url()}`);});
  await page.goto(url);await page.locator('#loading').waitFor({state:'hidden'});await frame(page);
  const record={viewport,mobileEmulation:mobile,occlusion:[],checks:[],errors};evidence.viewports.push(record);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Desplazamiento horizontal');
  const {fitted}=await geometry(page),initial=await matrix(page);
  close(initial.x,fitted.x);close(initial.y,fitted.y);close(initial.zoom,fitted.zoom);
  for(const mode of ['delante','detras','esquina']){
   await page.locator(`[data-position="${mode}"]`).click();await frame(page);
   const result=await analysis(page);record.occlusion.push(result);
   assert.ok(result.unoccludedPixels>30,'Personaje demasiado pequeño o no renderizado');
   assert.deepEqual([result.alpha.hospital.min,result.alpha.hospital.max],[0,255]);
   assert.deepEqual([result.alpha.zombie.min,result.alpha.zombie.max],[0,255]);
   assert.deepEqual([result.alpha.ground.min,result.alpha.ground.max],[255,255]);
   if(mode==='delante')assert.ok(result.visibleRatio>.99);
   if(mode==='detras')assert.ok(result.visibleRatio<.02,`Personaje visible detrás: ${result.visibleRatio}`);
   if(mode==='esquina')assert.ok(result.visibleRatio>.1&&result.visibleRatio<.9,`Oclusión esquina: ${result.visibleRatio}`);
   await page.screenshot({path:resolve(output,`${viewport.width}-${mode}.png`),fullPage:true});
  }
  await page.locator('[data-position="detras"]').click();await page.locator('#show-hidden').check();await frame(page);
  const revealed=await analysis(page);record.occlusion.push(revealed);assert.ok(revealed.visibleRatio>.5);
  await page.screenshot({path:resolve(output,`${viewport.width}-ocultos.png`),fullPage:true});
  await page.locator('#show-hidden').uncheck();await frame(page);
  assert.ok((await analysis(page)).visibleRatio<.02);record.checks.push('Mostrar ocultos revela; desactivar restaura oclusión normal');
  await page.locator('[data-position="delante"]').click();
  await page.locator('#scene').scrollIntoViewIfNeeded();await frame(page);
  const camera=await matrix(page),world={x:790,y:360},pick=await canvasPoint(page,camera,world);
  if(mobile)await page.touchscreen.tap(pick.x,pick.y);else await page.mouse.click(pick.x,pick.y);
  assert.equal(await page.locator('#select-hospital').getAttribute('aria-pressed'),'true');
  const transparent=await canvasPoint(page,camera,{x:1000,y:-10});
  if(mobile)await page.touchscreen.tap(transparent.x,transparent.y);else await page.mouse.click(transparent.x,transparent.y);
  assert.equal(await page.locator('#select-hospital').getAttribute('aria-pressed'),'false');
  record.checks.push('Seleccionar hospital por clic/tap y descartar al tocar fuera de su alfa');

  // Comparar el cuadro real antes/después de arrastrar: todas las capas deben trasladarse juntas.
  await page.evaluate(()=>{const c=document.querySelector('#scene');window.__hospitalBefore={pixels:c.getContext('2d').getImageData(0,0,c.width,c.height),dpr:Math.min(devicePixelRatio||1,3)};});
  const start=await canvasPoint(page,camera,world);await page.mouse.move(start.x,start.y);await page.mouse.down();
  await page.mouse.move(start.x+30,start.y+20,{steps:5});await page.mouse.up();await frame(page);
  const panned=await matrix(page);close(panned.x,camera.x+30);close(panned.y,camera.y+20);
  assert.equal(await page.locator('#select-hospital').getAttribute('aria-pressed'),'false','Arrastrar seleccionó el edificio');
  const alignment=await page.evaluate(()=>{
   const c=document.querySelector('#scene'),old=window.__hospitalBefore,now=c.getContext('2d').getImageData(0,0,c.width,c.height);
   const dx=30*old.dpr,dy=20*old.dpr;let equal=0,total=0;
   for(let y=4;y<c.height-dy-4;y+=4)for(let x=4;x<c.width-dx-4;x+=4){
    const i=(y*c.width+x)*4,j=((y+dy)*c.width+x+dx)*4;
    const diff=Math.abs(old.pixels.data[i]-now.data[j])+Math.abs(old.pixels.data[i+1]-now.data[j+1])+Math.abs(old.pixels.data[i+2]-now.data[j+2]);
    total++;if(diff<=4)equal++;
   }
   delete window.__hospitalBefore;return equal/total;
  });
  assert.ok(alignment>.995,`Capas desalineadas: ${alignment}`);record.panPixelAgreement=alignment;
  record.checks.push('Arrastre sin selección accidental; imagen completa y sombras se trasladan juntas');
  await page.locator('#reset-view').click();await page.locator('#scene').scrollIntoViewIfNeeded();await frame(page);
  const b=await page.locator('#scene').boundingBox();
  // Chromium cuantiza las coordenadas de rueda a píxeles CSS enteros.
  const cursor={x:Math.round(b.x+b.width*.63),y:Math.round(b.y+b.height*.45)};
  const anchor={x:cursor.x-b.x,y:cursor.y-b.y};
  await page.mouse.move(cursor.x,cursor.y);const beforeWheel=await matrix(page);
  await page.mouse.wheel(0,-280);await frame(page);const afterWheel=await matrix(page);
  close((anchor.x-beforeWheel.x)/beforeWheel.zoom,(anchor.x-afterWheel.x)/afterWheel.zoom);
  close((anchor.y-beforeWheel.y)/beforeWheel.zoom,(anchor.y-afterWheel.y)/afterWheel.zoom);
  assert.ok(afterWheel.zoom>beforeWheel.zoom);
  for(let i=0;i<4;i++)await page.mouse.wheel(0,-3000);await frame(page);
  close((await matrix(page)).zoom,fitted.maxZoom);
  for(let i=0;i<5;i++)await page.mouse.wheel(0,3000);await frame(page);
  close((await matrix(page)).zoom,fitted.minZoom);
  record.checks.push('Rueda anclada al cursor y límites superior/inferior');

  await page.locator('#reset-view').click();await frame(page);
  await page.locator('#zoom-in').focus();await page.keyboard.press('Enter');await frame(page);
  assert.ok((await matrix(page)).zoom>initial.zoom);
  await page.locator('#zoom-out').focus();await page.keyboard.press('Enter');await frame(page);
  close((await matrix(page)).zoom,initial.zoom);
  await page.locator('[data-position="detras"]').focus();await page.keyboard.press('Space');
  assert.equal(await page.locator('[data-position="detras"]').getAttribute('aria-pressed'),'true');
  await page.locator('#show-hidden').focus();await page.keyboard.press('Space');assert.ok(await page.locator('#show-hidden').isChecked());
  await page.keyboard.press('Space');
  await page.locator('#scene').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#select-hospital').getAttribute('aria-pressed'),'true');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#select-hospital').getAttribute('aria-pressed'),'false');
  await page.keyboard.press('ArrowRight');await frame(page);close((await matrix(page)).x,initial.x-48);
  await page.keyboard.press('0');await frame(page);close((await matrix(page)).x,initial.x);
  await page.locator('[data-pan="left"]').focus();await page.keyboard.press('Enter');await frame(page);close((await matrix(page)).x,initial.x+48);
  await page.locator('#reset-view').focus();await page.keyboard.press('Enter');await frame(page);
  const reset=await matrix(page);close(reset.x,initial.x);close(reset.y,initial.y);close(reset.zoom,initial.zoom);
  record.checks.push('Botones y posiciones con teclado; flechas/Enter/Escape/0 y restablecimiento');
  for(const element of await page.locator('button,.toggle').all()){
   const rect=await element.boundingBox();assert.ok(rect.width>=44&&rect.height>=44,'Control táctil menor de44px');
  }
  if(mobile){
   await page.locator('#scene').scrollIntoViewIfNeeded();await frame(page);
   const rect=await page.locator('#scene').boundingBox(),center={x:rect.x+rect.width/2,y:rect.y+rect.height/2};
   const before=await matrix(page),cdp=await context.newCDPSession(page);
   const touches=(half,dx=0,dy=0)=>[{id:11,x:center.x-half+dx,y:center.y+dy},{id:22,x:center.x+half+dx,y:center.y+dy}];
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches(35)});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:touches(65,10,-8)});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await frame(page);
   const after=await matrix(page),previous={x:rect.width/2,y:rect.height/2},next={x:previous.x+10,y:previous.y-8};
   close(after.zoom,before.zoom*65/35);
   close((previous.x-before.x)/before.zoom,(next.x-after.x)/after.zoom);
   close((previous.y-before.y)/before.zoom,(next.y-after.y)/after.zoom);
   assert.equal(await page.locator('#select-hospital').getAttribute('aria-pressed'),'false');
   await page.locator('#reset-view').click();await page.locator('#scene').scrollIntoViewIfNeeded();await frame(page);
   const swipeStart=await matrix(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:33,x:center.x,y:center.y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:33,x:center.x+24,y:center.y+18}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await frame(page);
   const swiped=await matrix(page);close(swiped.x,swipeStart.x+24);close(swiped.y,swipeStart.y+18);
   assert.equal(await page.locator('#select-hospital').getAttribute('aria-pressed'),'false');
   await page.locator('#reset-view').click();await frame(page);
   record.checks.push('Pinza CDP de dos dedos: escala y centro estables, sin selección accidental');
   record.checks.push('Arrastre CDP de un dedo después de pinza, sin selección accidental');
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);await context.close();
 }
 const failureContext=await browser.newContext(),failurePage=await failureContext.newPage();
 await failurePage.route('**/assets/prototipo-hospital/hospital.png',route=>route.abort());
 await failurePage.goto(url);
 await failurePage.locator('#loading[role="alert"]').waitFor({state:'visible'});
 assert.match(await failurePage.locator('#loading').textContent(),/No se pudieron cargar/);
 assert.equal(await failurePage.locator('button:not(:disabled),input:not(:disabled)').count(),0);
 evidence.missingAssetCheck='PNG inaccesible: aviso visible y controles deshabilitados, sin sustitución';
 await failureContext.close();
 evidence.passed=true;
}catch(error){evidence.passed=false;evidence.errors.push(error.stack);throw error;}
finally{await writeFile(resolve(output,'resultados.json'),JSON.stringify(evidence,null,2)+'\n');await browser.close();}
console.log(JSON.stringify(evidence,null,2));
