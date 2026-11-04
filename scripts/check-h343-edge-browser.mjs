import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';
import {searchMapChecks} from '../test-support/h343-browser-checks.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),origin=process.env.H343_ORIGIN||'http://127.0.0.1:8777',out=process.env.H343_EDGE_DIR||'/tmp/h343-edge';await mkdir(out,{recursive:true});const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}),t=searchMapChecks({origin}),evidence={browser:b.version(),physicalMobile:false,records:[],failures:[]};
async function prepare(p,{actor='h0',seed=.8}={}){
 await t.load(p);await t.host(p).evaluate(v=>h343RandomValue=v,seed);await t.host(p).locator('#setupScreen button').filter({hasText:'2 JUGADORES LOCALES'}).click();await t.settle(p);await t.openMap(p);await t.panel(p);await p.locator('.demo-controls').last().evaluate(e=>e.open=true);await p.selectOption('#survivor-select',actor);
 await p.locator('#move-action').click();await p.locator('#keyboard-destinations').evaluate(e=>e.open=true);await p.selectOption('#move-destination','2');await t.host(p).evaluate(()=>h343RandomValue=.8);await p.locator('#confirm-move').click();await p.waitForFunction(()=>h343Viewer.inspect().movement.phase!=='sending'&&h343Viewer.inspect().movement.phase!=='presenting');
 if((await t.api(p)).movement.phase==='awaiting-decision'){await p.locator('#resolve-decision').click();await t.settle(p);await t.openMap(p);}
 await t.panel(p);await p.locator('.demo-controls').last().evaluate(e=>e.open=true);await p.selectOption('#survivor-select',actor);await p.locator('#search-action').click();await p.locator('[data-die="0"]:enabled').click();
}
async function searching(p){await p.locator('#confirm-search').click();await p.waitForFunction(()=>h343Viewer.inspect().search.phase==='choice');}
try{
 const kinds=['reference','hidden','reconnect','lost-reply','stale','scout','reduced','general','player-two','restart'];
 for(const kind of process.env.H343_EDGE_CASES?process.env.H343_EDGE_CASES.split(','):kinds){
  const context=await b.newContext({viewport:{width:1365,height:768},reducedMotion:kind==='reduced'?'reduce':'no-preference'});await t.instrument(context);const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const r={kind,errors};evidence.records.push(r);await prepare(p,{actor:kind==='scout'?'h2':'h0',seed:kind==='general'?.6:.8});
  if(kind==='player-two'){
   await p.locator('#cancel-search').click();await p.locator('#reference-mode').click();await t.dispatch(p,'finishTurn');await t.settle(p);await t.openMap(p);await t.panel(p);await p.locator('.demo-controls').last().evaluate(e=>e.open=true);await p.selectOption('#survivor-select','a0');await p.locator('#move-action').click();await p.locator('#keyboard-destinations').evaluate(e=>e.open=true);await p.selectOption('#move-destination','2');await p.locator('#confirm-move').click();await p.waitForFunction(()=>!['sending','presenting'].includes(h343Viewer.inspect().movement.phase));
   if((await t.api(p)).movement.phase==='awaiting-decision'){await p.locator('#resolve-decision').click();await t.settle(p);await t.openMap(p);}
   await t.panel(p);await p.locator('.demo-controls').last().evaluate(e=>e.open=true);await p.selectOption('#survivor-select','a0');await p.locator('#search-action').click();await p.locator('[data-die="0"]:enabled').click();const g=await t.raw(p);await searching(p);assert.equal((await t.api(p)).search.ownerId,'ai');assert.equal((await t.raw(p)).botDice.length,g.botDice.length-1);assert.deepEqual((await t.raw(p)).dice,g.dice);await p.locator('[data-card="0"]').click();await p.waitForFunction(()=>h343Viewer.inspect().search.phase==='result');assert.equal((await t.raw(p)).botItems.length,g.botItems.length+1);assert.deepEqual((await t.raw(p)).items,g.items);r.ownDieAndHand=true;
  }else if(kind==='stale'){
   const g=await t.raw(p),calls=await t.rng(p);await p.evaluate(()=>{document.querySelector('#confirm-search').click();document.querySelector('#reference-frame').contentWindow.h343Test.dispatch('boostDie');});await p.waitForFunction(()=>h343Viewer.inspect().search.phase==='idle');assert.equal((await t.raw(p)).decks[2].length,g.decks[2].length);assert.equal((await t.raw(p)).dice.length,g.dice.length);assert.equal(await t.rng(p),calls);assert.equal((await t.api(p)).search.operation,null);r.noFakeDiscovery=true;
  }else if(kind==='lost-reply'){
   await t.host(p).evaluate(()=>h343DropReply=true);await p.locator('#confirm-search').click();await p.waitForFunction(()=>h343Viewer.inspect().search.phase==='sending');const actual=await t.raw(p),calls=await t.rng(p);await p.waitForFunction(()=>h343Viewer.inspect().search.phase==='choice',{},{timeout:15000});assert.deepEqual(await t.raw(p),actual);assert.equal(await t.rng(p),calls);assert.equal((await t.api(p)).search.operation.cards.length,1);await t.host(p).evaluate(()=>h343DropReply=false);r.noResend=true;
  }else{
   const began=performance.now();await searching(p);const actual=await t.raw(p),calls=await t.rng(p),id=(await t.api(p)).search.operation.operationId;
   if(kind==='reference'){await p.locator('#reference-mode').click();assert.equal(await p.locator('#search-cards .search-card').count(),0);await t.openMap(p);}
   if(kind==='hidden'){await p.evaluate(()=>{window.h343Hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>h343Hidden});document.dispatchEvent(new Event('visibilitychange'));});await p.waitForTimeout(100);await p.evaluate(()=>{h343Hidden=false;document.dispatchEvent(new Event('visibilitychange'));});r.controlledVisibility=true;}
   if(kind==='reconnect'){await p.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));await p.waitForFunction(()=>h343Viewer.inspect().view===null);assert.equal(await p.locator('#search-cards .search-card').count(),0);assert.equal(await p.locator('#own-hand-cards li').count(),0);await p.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await p.waitForFunction(()=>h343Viewer.inspect().view!==null&&h343Viewer.inspect().search.phase==='choice');r.controlledLifecycle=true;}
   if(kind==='restart'){
    const listeners=await p.evaluate(()=>h32Lifecycle().listeners);const starts=(await t.api(p)).starts;
    for(let i=0;i<3;i++){await p.locator('#menu-toggle').click();await p.locator('#restart-view').click();await p.waitForFunction(n=>h343Viewer.inspect().starts===n&&h343Viewer.inspect().view!==null,starts+i+1);await t.frames(p);assert.equal((await t.api(p)).search.phase,'choice');assert.equal(await p.locator('canvas#scene').count(),1);assert.deepEqual(await p.evaluate(()=>h32Lifecycle().listeners),listeners);}
    r.threeRestarts=true;r.listenersStable=true;
   }
   if(kind==='scout'){assert.equal((await t.api(p)).search.operation.cards.length,2);r.skillActual=true;}
   if(kind==='reduced'){assert.ok(performance.now()-began<1500);assert.equal((await t.view(p)).renderer.atmosphere.settings.enabled,false);assert.equal((await t.view(p)).audio.enabled,false);r.reducedAndSilent=true;}
   assert.equal((await t.api(p)).search.operation.operationId,id);assert.deepEqual(await t.raw(p),actual);assert.equal(await t.rng(p),calls);
   await p.locator('[data-card="0"]').click();await p.waitForFunction(()=>h343Viewer.inspect().search.phase==='result');
   if(kind==='general'){
    assert.equal((await t.api(p)).search.operation.generalDecision,true);assert.equal((await t.api(p)).mode,'map');assert.equal(await p.locator('#search-native').isVisible(),true);await p.screenshot({path:resolve(out,'general-espera.png')});await p.locator('#search-native').click();assert.equal((await t.api(p)).mode,'reference');await t.settle(p);await t.openMap(p);r.deliberateNative=true;
   }
   if((await t.api(p)).search.phase==='result'){await p.locator('#search-continue').click();await p.waitForFunction(()=>h343Viewer.inspect().search.phase==='idle');}
   r.recoveryNoDraw=true;
  }
  assert.deepEqual(errors,[]);r.passed=true;await context.close();
 }
 evidence.passed=true;
}catch(e){evidence.passed=false;evidence.failures.push(e.stack);throw e;}finally{await writeFile(resolve(out,'resultados.json'),JSON.stringify(evidence,null,2)+'\n');await b.close();}
console.log(JSON.stringify({passed:evidence.passed,out}));
