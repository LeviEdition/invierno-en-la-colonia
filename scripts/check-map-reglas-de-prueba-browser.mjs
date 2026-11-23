// Preparación de reglas de prueba (docs/117): sin ?dev no ofrece nada nuevo;
// con ?dev inicia «un grupo» con La noche y Regresar activos. Dos tamaños.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.MAP_REGLAS_DIR||'/tmp/map-reglas-de-prueba';
const origin=process.env.H344_ORIGIN||'http://127.0.0.1:8779';
const modulePath=process.env.H344_MODULE_PATH||'/dist/mapa-qa/map.mjs';
const timeout=15000;
// evaluate y el cierre del navegador no admiten el timeout de los localizadores.
async function bounded(promise,label){
 let timer;
 try{return await Promise.race([promise,new Promise((_,reject)=>{
  timer=setTimeout(()=>reject(Error('Tiempo agotado (15 s): '+label)),timeout);
 })]);}finally{clearTimeout(timer);}
}
const read=(target,fn,arg)=>bounded(target.evaluate(fn,arg),'leer el mapa');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,timeout,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const report={scope:'preparación con y sin ?dev; inicio de un grupo con La noche y Regresar',viewports:[],errors:[]};
let p;
try{
 for(const [width,height,dpr] of (process.env.MAP_REGLAS_VIEWPORTS||'852x393x2,1365x768x1').split(',').map(v=>v.split('x').map(Number))){
  const ctx=await bounded(browser.newContext({viewport:{width,height},hasTouch:width<950,isMobile:width<950,deviceScaleFactor:dpr}),'crear contexto');
  // El mismo azar constante del recorrido anterior, sin instalar sondas ni resolver decisiones.
  await bounded(ctx.addInitScript(()=>{if(window.top!==window)Math.random=()=>.8;}),'preparar azar de prueba');
  p=await bounded(ctx.newPage(),'crear página');p.setDefaultTimeout(timeout);p.setDefaultNavigationTimeout(timeout);
  p.on('pageerror',error=>report.errors.push(width+': '+error.message));
  const row={viewport:{width,height,dpr}};report.viewports.push(row);

  // Sin ?dev el mapa es idéntico a hoy: no hay modo «un grupo» ni reglas.
  await p.goto(origin+modulePath.replace(/\/map\.mjs$/,'/index.html'),{timeout});
  await read(p,async path=>{window.h344Viewer=await import(path);},modulePath);
  await p.waitForFunction(()=>window.h344Viewer.inspect().projection?.blocked==='setup',undefined,{timeout});
  // La proyección llega antes que el diálogo: contar cuando la preparación ya se dibujó.
  await p.locator('#play-dialog').waitFor({state:'visible',timeout});
  await p.locator('#play-start-local').waitFor({state:'visible',timeout});
  row.sinDev=await read(p,()=>({solo:document.querySelectorAll('#play-start-solo').length,
   reglas:document.querySelectorAll('#play-test-rules').length,
   modos:document.querySelectorAll('#play-start-local, #play-start-ai').length}));
  assert.deepEqual(row.sinDev,{solo:0,reglas:0,modos:2},'sin ?dev el mapa no ofrece nada nuevo');

  // Con ?dev se puede elegir el modo y activar ambas reglas desde sus controles reales.
  await p.goto(origin+modulePath.replace(/\/map\.mjs$/,'/index.html')+'?dev=1',{timeout});
  await read(p,async path=>{window.h344Viewer=await import(path);},modulePath);
  await p.waitForFunction(()=>window.h344Viewer.inspect().projection?.blocked==='setup',undefined,{timeout});
  await p.locator('#play-test-rules').waitFor({state:'visible',timeout});

  // Activar La noche y Regresar, y empezar en «un grupo».
  await p.locator('#play-rule-laNoche').click({timeout});
  await p.waitForFunction(()=>window.h344Viewer.inspect().projection.play.preparation.testRules.laNoche,undefined,{timeout});
  await p.locator('#play-rule-regreso').click({timeout});
  await p.waitForFunction(()=>window.h344Viewer.inspect().projection.play.preparation.testRules.regreso,undefined,{timeout});
  row.elegidas=await read(p,()=>window.h344Viewer.inspect().projection.play.preparation.testRules);
  assert.deepEqual(row.elegidas,{comidaInicial:6,laNoche:true,regreso:true,crisisParcial:false});
  await p.locator('#play-start-solo').click({timeout});
  await p.waitForFunction(()=>{
   const s=window.h344Viewer.inspect().projection;
   return s.mode==='solo'&&s.play.setup===false;
  },undefined,{timeout});
  const host=p.frames().find(f=>f.url().endsWith('/reference-host.html'));
  assert.ok(host,'el motor de QA está disponible');
  row.inicio=await read(host,()=>{const g=h344Test.snapshot();return {mode:g.mode,reglas:g.testRules};});
  assert.equal(row.inicio.mode,'solo');
  assert.deepEqual(row.inicio.reglas,row.elegidas,'la partida usa las reglas elegidas');
  await bounded(ctx.close(),'cerrar contexto');console.log('map-reglas-de-prueba',width,height,'ok');
 }
 assert.deepEqual(report.errors,[],'sin errores de página');
 report.passed=true;
}catch(error){report.error=error.stack;throw error;}
finally{try{await writeFile(out+'/auditoria.json',JSON.stringify(report,null,2));}finally{await bounded(browser.close(),'cerrar navegador');}}
console.log(JSON.stringify({passed:report.passed,out}));
