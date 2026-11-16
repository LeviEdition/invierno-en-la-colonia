// QA aislada: ralentiza RAF del visor, nunca el reloj ni el azar del host.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {actionMapChecks} from '../test-support/h344-browser-checks.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.H344_STALL_DIR||'/tmp/horizontal-presentation-stalls';await mkdir(out,{recursive:true});
const t=actionMapChecks({origin:process.env.H344_ORIGIN||'http://127.0.0.1:8779',modulePath:process.env.H344_MODULE_PATH||'/dist/horizontal-map-qa/map.mjs'});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const result={browser:browser.version(),physicalMobile:false,method:'RAF del visor demorado 500ms; sondeo independiente cada25ms; host sin instrumentación de tiempo',records:[],failures:[]};
try{
 for(const reduced of [false,true]){
  const context=await browser.newContext({viewport:{width:1365,height:768},reducedMotion:reduced?'reduce':'no-preference'});await t.instrument(context);
  await context.addInitScript(()=>{
   if(window.top!==window)return;
   const raf=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window),timers=new Map();
   window.h344Stall=false;window.h344StallCalls=0;
   window.requestAnimationFrame=fn=>{
    const id=raf(time=>{
     if(!window.h344Stall){fn(time);return;}
     window.h344StallCalls++;
     timers.set(id,setTimeout(()=>{timers.delete(id);fn(performance.now());},500));
    });return id;
   };
   window.cancelAnimationFrame=id=>{clearTimeout(timers.get(id));timers.delete(id);cancel(id);};
  });
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const record={reduced,errors};result.records.push(record);
  try{
   await t.begin(p);await t.openMap(p);await t.panel(p);
   await p.locator('.demo-controls').last().evaluate(el=>el.open=true);await p.selectOption('#survivor-select','h0');await t.frames(p);
   const camera=(await t.view(p)).camera;
   await p.locator('#move-action').click();await p.locator('#keyboard-destinations').evaluate(el=>el.open=true);await p.selectOption('#move-destination','2');
   await p.evaluate(()=>{
    window.h344StageSamples=[];window.h344Stall=true;
    window.h344StageTimer=setInterval(()=>{const v=window.h344Viewer.inspect();window.h344StageSamples.push({time:performance.now(),phase:v.movement.phase,stage:v.view.presentation?.stage||null,camera:v.view.camera});},25);
   });
   await p.locator('#confirm-move').click();
   await p.waitForFunction(()=>window.h344Viewer.inspect().movement.phase==='presenting',null,{polling:25});
   const resolved=await t.raw(p),rng=await t.rng(p);
   await p.waitForFunction(()=>window.h344Viewer.inspect().movement.phase==='idle',null,{polling:50,timeout:60000});
   const samples=await p.evaluate(()=>{clearInterval(window.h344StageTimer);window.h344Stall=false;return window.h344StageSamples;});
   record.stallCalls=await p.evaluate(()=>window.h344StallCalls);record.stages=[...new Set(samples.map(f=>f.stage).filter(Boolean))];
   await writeFile(resolve(out,reduced?'reducido.json':'normal.json'),JSON.stringify(samples,null,2)+'\n');
   assert.ok(record.stallCalls>=5);assert.deepEqual(record.stages,['travel','roll','reveal','consequence']);
   assert.ok(samples.every(f=>JSON.stringify(f.camera)===JSON.stringify(camera)));
   assert.deepEqual(await t.raw(p),resolved);assert.equal(await t.rng(p),rng);
   assert.equal(resolved.log.filter(l=>l.includes('→ Mara se movió')).length,1);
   assert.deepEqual(errors,[]);record.stateAndRandomUnchanged=true;
   await p.screenshot({path:resolve(out,reduced?'reducido.png':'normal.png')});
  }finally{await context.close();}
 }
 result.passed=true;
}catch(error){result.passed=false;result.failures.push(error.stack);throw error;}
finally{await writeFile(resolve(out,'resultados.json'),JSON.stringify(result,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({passed:result.passed,out}));
