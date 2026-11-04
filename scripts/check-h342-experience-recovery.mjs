import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';import {movementMapChecks} from '../test-support/h342-browser-checks.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),out=process.env.H342_RECOVERY_DIR||'/tmp/h342-experience-recovery',origin=process.env.H342_ORIGIN||'http://127.0.0.1:8776';await mkdir(out,{recursive:true});const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}),t=movementMapChecks({origin}),evidence={browser:b.version(),records:[],failures:[],physicalMobile:false};
async function prepare(p){await t.load(p);await t.host(p).evaluate(()=>window.h342RandomValue=.8);await t.host(p).locator('#setupScreen button').filter({hasText:'2 JUGADORES LOCALES'}).click();await t.settle(p);await t.openMap(p);await t.panel(p);await p.locator('.demo-controls').last().evaluate(el=>el.open=true);await p.selectOption('#survivor-select','h0');await p.locator('#move-action').click();await p.locator('#keyboard-destinations').evaluate(el=>el.open=true);await p.selectOption('#move-destination','2');}
try{
 for(const kind of ['reference','hidden','reconnect','stale','reduced']){
  const c=await b.newContext({viewport:{width:1365,height:768},reducedMotion:kind==='reduced'?'reduce':'no-preference'});await t.instrument(c);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const r={kind,errors};evidence.records.push(r);await prepare(p);const start=performance.now();
  if(kind==='stale'){
   const before=await t.raw(p),calls=await t.rng(p);await p.evaluate(()=>{document.querySelector('#confirm-move').click();document.querySelector('#reference-frame').contentWindow.h342Test.dispatch('boostDie');});await p.waitForFunction(()=>window.h342Viewer.inspect().movement.phase==='idle');assert.equal((await t.raw(p)).humans[0].loc,0);assert.equal((await t.raw(p)).humans[0].moved,false);assert.equal(await t.rng(p),calls);assert.equal((await t.view(p)).presentation,null);r.noFalseAnimation=true;
  }else{
   await p.locator('#confirm-move').click();await p.waitForFunction(()=>window.h342Viewer.inspect().view.presentation?.stage==='travel');const actual=await t.raw(p),calls=await t.rng(p);assert.equal(actual.humans[0].loc,2);
   if(kind==='reference'){await p.locator('#reference-mode').click();assert.equal((await t.api(p)).mode,'reference');await t.openMap(p);}
   if(kind==='hidden'){await p.evaluate(()=>{window.qaHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>qaHidden});document.dispatchEvent(new Event('visibilitychange'));});await p.waitForTimeout(150);await p.evaluate(()=>{qaHidden=false;document.dispatchEvent(new Event('visibilitychange'));});r.controlledVisibility=true;}
   if(kind==='reconnect'){await p.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));await p.waitForFunction(()=>window.h342Viewer.inspect().view===null);await p.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await p.waitForFunction(()=>window.h342Viewer.inspect().view!==null);r.controlledLifecycle=true;}
   await p.waitForFunction(()=>window.h342Viewer.inspect().movement.phase==='idle');await t.frames(p);assert.equal((await t.view(p)).presentation,null);assert.deepEqual(await t.raw(p),actual);assert.equal(await t.rng(p),calls);assert.equal((await t.raw(p)).log.filter(l=>l.includes('→ Mara se movió')).length,1);assert.equal(await p.locator('[data-actor-id="h0"]').count(),1);r.noRepeatedMoveOrRoll=true;
   if(kind==='reduced'){assert.ok(performance.now()-start<1800);assert.equal((await t.view(p)).renderer.atmosphere.settings.enabled,false);assert.equal((await t.view(p)).audio.enabled,false);r.shortTransition=true;}
  }
  assert.deepEqual(errors,[]);r.passed=true;await c.close();
 }
 evidence.passed=true;
}catch(e){evidence.passed=false;evidence.failures.push(e.stack);throw e;}finally{await writeFile(resolve(out,'resultados.json'),JSON.stringify(evidence,null,2)+'\n');await b.close();}
console.log(JSON.stringify({passed:evidence.passed,out}));
