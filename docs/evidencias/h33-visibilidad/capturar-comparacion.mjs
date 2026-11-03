// Evidencia aislada; no se importa desde el producto. VIS_BUNDLE permite
// servir un bundle histórico sin cambiar el checkout o las imágenes.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const out=process.env.VIS_OUTPUT||'/tmp/h33-vis-comparacion';await mkdir(out,{recursive:true});const old=process.env.VIS_BUNDLE?await readFile(process.env.VIS_BUNDLE,'utf8'):null;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),records=[];
for(const viewport of [{width:1365,height:768},{width:393,height:852},{width:320,height:640}]){
 const c=await browser.newContext({viewport,deviceScaleFactor:viewport.width<500?2:1,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'});await c.addInitScript(()=>{const get=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=a=>{if(a instanceof Uint32Array&&a.length===1){a[0]=0x33c01;return a;}return get(a);};});
 const p=await c.newPage();if(old)await p.route('**/dist/hospital-workshop/mockup.mjs',r=>r.fulfill({body:old,contentType:'application/javascript'}));await p.goto((process.env.H33_ORIGIN||'http://127.0.0.1:8772')+'/prototypes/hospital-workshop/');await p.waitForFunction(()=>document.body.dataset.state==='ready');
 for(const scene of ['general','colonia']){
  if(scene!=='general')await p.selectOption('#locality',scene);
  await p.waitForTimeout(100);await p.evaluate(async()=>{window.visBase=await(await import('/dist/hospital-workshop/mockup.mjs')).diagnosticPixels();});await p.screenshot({path:`${out}/${viewport.width}-${scene}-off.png`});
  await p.locator('#ambient-intensity').evaluate(el=>{el.value='normal';el.dispatchEvent(new Event('change',{bubbles:true}));});await p.locator('#ambient-enabled').evaluate(el=>el.click());await p.waitForTimeout(1000);
  await p.screenshot({path:`${out}/${viewport.width}-${scene}-normal.png`});
  records.push(await p.evaluate(async({viewport,scene})=>{const m=await import('/dist/hospital-workshop/mockup.mjs'),a=m.inspect().app,b=await m.diagnosticPixels(),base=window.visBase;let changed=0,strong=0,energy=0;for(let i=0;i<b.data.length;i+=4){let peak=0;for(let k=0;k<3;k++){const d=Math.abs(b.data[i+k]-base.data[i+k]);peak=Math.max(peak,d);energy+=d;}if(peak)changed++;if(peak>=8)strong++;}return {viewport,scene,camera:a.camera,dpr:a.viewport.dpr,elapsed:a.renderer.atmosphere.elapsed,seed:a.renderer.atmosphere.seed,changed,strong,energy};},{viewport,scene}));
  await p.locator('#ambient-enabled').evaluate(el=>el.click());await p.waitForTimeout(100);
 }
 await c.close();
}
await writeFile(out+'/resultados.json',JSON.stringify({bundleSha256:createHash('sha256').update(old||await readFile(new URL('../../../dist/hospital-workshop/mockup.mjs',import.meta.url))).digest('hex'),browser:browser.version(),physicalMobile:false,seed:0x33c01,mode:'normal',measurement:'Cambios dentro del canvas frente a apagado; strong=canal≥8/255; misma cámara y PNG, tiempo observado registrado, no igualdad exacta de fases',records},null,2));await browser.close();console.log(JSON.stringify(records));
