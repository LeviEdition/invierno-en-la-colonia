import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {startupFaultBundle} from '../test-support/h32-startup-faults.mjs';
import {installLifecycleProbe} from '../test-support/h32-lifecycle-probe.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.H32_ADAPTER_DIR||'/tmp/h32-adapter';await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext();await context.addInitScript(installLifecycleProbe);await context.addInitScript(()=>{
 window.h32Foreign={blur:0,focus:0,visibility:0};window.onblur=window.h32OriginalBlur=()=>window.h32Foreign.blur++;window.onfocus=window.h32OriginalFocus=()=>window.h32Foreign.focus++;document.addEventListener('visibilitychange',()=>window.h32Foreign.visibility++);
});
const page=await context.newPage(),errors=[],evidence={browser:browser.version(),physicalDevice:false};page.on('pageerror',e=>errors.push(e.message));const body=await startupFaultBundle();await page.route('**/dist/hospital-phaser/game.mjs',r=>r.fulfill({contentType:'application/javascript',body}));
try{
 await page.goto((process.env.H32_ORIGIN||'http://127.0.0.1:8771')+'/prototypes/hospital-phaser/');await page.waitForFunction(()=>document.body.dataset.state==='ready');
 const result=await page.evaluate(async()=>{
  const game=window.h32QaGame,events={pause:0,resume:0,hidden:0,visible:0,blur:0,focus:0};for(const name of Object.keys(events))game.events.on(name,()=>events[name]++);
  const read=()=>({focus:game.hasFocus,clockInFocus:game.loop.inFocus,pauseTime:game.loop._pauseTime,pauseDuration:game.loop.pauseDuration,events:{...events},foreign:{...window.h32Foreign}});
  const before=read();window.dispatchEvent(new Event('blur'));const blurred=read();window.dispatchEvent(new Event('focus'));const focused=read();
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));const hidden=read();
  await new Promise(resolve=>setTimeout(resolve,30));Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));const visible=read();delete document.hidden;
  return {before,blurred,focused,hidden,visible,foreignHandlersPreserved:window.onblur===window.h32OriginalBlur&&window.onfocus===window.h32OriginalFocus,audioObjects:game.sound.sounds.length,input:{mouse:game.config.inputMouse,touch:game.config.inputTouch,keyboard:game.config.inputKeyboard},customPlugins:game.plugins.plugins.length};
 });
 assert.equal(result.blurred.focus,false);assert.equal(result.blurred.clockInFocus,false);assert.equal(result.focused.focus,true);assert.equal(result.focused.clockInFocus,true);assert.ok(result.hidden.pauseTime>0);assert.equal(result.hidden.events.pause,1);assert.equal(result.visible.events.resume,1);assert.ok(result.visible.pauseDuration>=0);assert.ok(result.foreignHandlersPreserved);assert.equal(result.visible.foreign.visibility,result.before.foreign.visibility+2);assert.equal(result.focused.foreign.focus,result.before.foreign.focus+1);assert.equal(result.blurred.foreign.blur,result.before.foreign.blur+1);
 // Se constata y documenta la omisión, no se presume equivalencia de broadcasts.
 for(const name of ['hidden','visible','blur','focus'])assert.equal(result.visible.events[name],0);evidence.syntheticFocusVisibility=result;
 const cdp=await context.newCDPSession(page);await page.evaluate(()=>{window.h32Freeze={planned:Date.now()};setTimeout(()=>window.h32Freeze.fired=Date.now(),200);});await cdp.send('Page.setWebLifecycleState',{state:'frozen'});await new Promise(resolve=>setTimeout(resolve,400));const resumedAt=Date.now();await cdp.send('Page.setWebLifecycleState',{state:'active'});await page.waitForFunction(()=>window.h32Freeze.fired);const freeze=await page.evaluate(()=>window.h32Freeze);evidence.cdpFreeze={...freeze,resumedAt,verified:freeze.fired-freeze.planned>=350&&freeze.fired>=resumedAt-20,note:'Solo se cuenta suspensión si el timer realmente quedó detenido. Un comando CDP aceptado no basta; tampoco equivale a suspensión física del teléfono/SO'};
 const before=await page.evaluate(async()=>(await import('/dist/hospital-phaser/game.mjs')).inspect());await page.locator('#zoom-in').click();const after=await page.evaluate(async()=>(await import('/dist/hospital-phaser/game.mjs')).inspect());assert.equal(after.starts,before.starts);assert.equal(after.app.counters.inputCommands,before.app.counters.inputCommands+1);
 await page.evaluate(async()=>{await(await import('/dist/hospital-phaser/game.mjs')).disposeExperiment();});const disposed=await page.evaluate(()=>window.h32StartupProbe());assert.equal(disposed.activeSceneContexts,0);assert.equal(disposed.resizeTargets,0);assert.deepEqual(disposed.listeners,[{target:'window',type:'pagehide'},{target:'window',type:'pageshow'}]);
 const foreignAfter=await page.evaluate(()=>{const before={...window.h32Foreign},focus=window.h32QaGame.hasFocus;window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));return {before,after:{...window.h32Foreign},focusUnchanged:window.h32QaGame.hasFocus===focus,preserved:window.onblur===window.h32OriginalBlur&&window.onfocus===window.h32OriginalFocus};});assert.ok(foreignAfter.preserved&&foreignAfter.focusUnchanged);assert.equal(foreignAfter.after.focus,foreignAfter.before.focus+1);assert.equal(foreignAfter.after.blur,foreignAfter.before.blur+1);evidence.afterDestroy={disposed,foreignAfter};assert.deepEqual(errors,[]);evidence.passed=true;
}catch(error){evidence.passed=false;evidence.error=error.stack;throw error;}
finally{await writeFile(output+'/resultados.json',JSON.stringify(evidence,null,2)+'\n');await browser.close();}
console.log(JSON.stringify(evidence,null,2));
