import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';import {actionMapChecks} from '../test-support/h344-browser-checks.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=resolve(process.env.CYCLE_DIR||'/tmp/horizontal-cycle'),t=actionMapChecks({origin:process.env.H344_ORIGIN||'http://127.0.0.1:8779',modulePath:'/dist/horizontal-map-qa/map.mjs'});await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const result={passed:false,controlled:true,physicalMobile:false,records:[]};let lastPage,lastDir;
try{for(const [width,height]of (process.env.CYCLE_VIEWPORTS||'1365x768,852x393').split(',').map(s=>s.split('x').map(Number)))for(const scenario of (process.env.CYCLE_SCENARIOS||'local,ai,death,time').split(',')){
 const dir=resolve(out,width+'x'+height,scenario);lastDir=dir;await mkdir(dir,{recursive:true});const context=await browser.newContext({viewport:{width,height},hasTouch:width<950,isMobile:width<950,deviceScaleFactor:width<950?2:1,recordVideo:{dir,size:{width,height}}});await t.instrument(context);const p=await context.newPage();lastPage=p;const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await t.begin(p,scenario==='ai'?'ai':'local');let g=await t.raw(p);g.crossResolved=true;g.crossPending=false;g.crossRemaining=[0,0];g.food=100;g.waste=scenario==='local'?10:0;g.crisis={type:'comida',need:2,given:scenario==='local'?0:2,contributions:scenario==='local'?[]:['comida','comida'],fail:'moral'};for(const z of g.zones){z.z=0;z.b=0;z.noise=0;}if(scenario==='time')g.max=1;if(scenario==='death'){g.leaders.human='h0';g.humans[0].loc=4;g.zones[4].z=2;}if(scenario==='ai'){g.botItems=[];g.botDice=[5];for(const b of g.bots){b.moved=true;b.skillUsed=true;}}
 await t.host(p).evaluate(g=>h344Test.fixture(g),g);await t.openMap(p);await p.evaluate(text=>{const b=document.createElement('div');b.className='qa-notice';b.textContent=text;document.body.prepend(b);},'QA · Escenario controlado · '+scenario+' · cartas/recursos preparados en motor real');
 await t.frames(p);await p.waitForFunction(()=>{const v=h344Viewer.inspect().view,b=document.querySelector('#scene').getBoundingClientRect();return Math.abs(v.viewport.width-b.width)<1&&Math.abs(v.viewport.height-b.height)<1;});
 const api=()=>t.api(p);const raw=()=>t.raw(p);const phases=[];
 async function finish(){await p.locator('#finish-turn').click();await p.locator('#cycle-confirm').waitFor();const box=await p.locator('#cycle-confirm').boundingBox();assert.ok(box.height>=44);await p.locator('#cycle-confirm').evaluate(b=>{b.click();b.click();});}
 async function pass(){await p.locator('#cycle-pass').waitFor();await p.waitForFunction(()=>!document.querySelector('#cycle-pass')?.disabled);assert.equal((await api()).projection.inventory.private,null);assert.equal((await api()).projection.dice.available,null);await p.locator('#cycle-pass').click();}
 async function review(){await p.locator('#cycle-all').waitFor();const s=await api();phases.push(...s.projection.cycle.operation.steps.map(x=>x.kind));const before=await raw(),rng=await t.rng(p);await p.locator('#cycle-all').click();assert.deepEqual(await raw(),before);assert.equal(await t.rng(p),rng);await p.screenshot({path:resolve(dir,'colonia.png')});await p.locator('#cycle-next').click();assert.deepEqual(await raw(),before);assert.equal(await t.rng(p),rng);}
 if(scenario==='local'){
  await p.locator('#crisis-contribute').click();await p.locator('#inventory-dialog').waitFor();const names=await p.locator('#inventory-dialog article strong').allTextContents();assert.ok(names.every(s=>s.includes('comida')||s.includes('conservas')||['Mara','Leo','Iris'].includes(s)),'Solo cartas legales');
  const before=await raw();await p.locator('[id^="inventory-contribute-"]').first().click();await p.locator('#inventory-cancel').click();assert.deepEqual(await raw(),before);
  for(let i=0;i<2;i++){await p.locator('[id^="inventory-contribute-"]').first().click();await p.locator('#inventory-confirm').scrollIntoViewIfNeeded();await p.locator('#inventory-confirm').evaluate(b=>{b.click();b.click();});await p.locator('#inventory-continue').waitFor();await p.locator('#inventory-continue').click();}
  await p.locator('#inventory-close').click();assert.match(await p.locator('#public-crisis').textContent(),/entregadas: 2/);assert.equal(JSON.stringify((await api()).projection.cycle).includes('Ración de comida'),false);
  await t.panel(p);await p.locator('#survivor-select').evaluate(el=>el.closest('details').open=true);await p.selectOption('#survivor-select','h0');await p.locator('#barricade-action').click();await p.locator('[data-action-die="0"]').click();await p.locator('#confirm-action').click();await p.waitForFunction(()=>h344Viewer.inspect().action.phase==='result');await p.locator('#action-continue').click();await p.waitForFunction(()=>h344Viewer.inspect().action.phase==='idle');
  const cancel=await raw();await p.locator('#finish-turn').click();await p.locator('#cycle-cancel').click();assert.deepEqual(await raw(),cancel);
 }
 const camera=(await t.view(p)).camera;result.cameraBefore={scenario,width,camera,viewport:(await t.view(p)).viewport};
 if(scenario!=='ai'){
  if(scenario==='local'&&width===1365)await t.host(p).evaluate(()=>h344DropReply=true);
  await finish();await p.waitForFunction(()=>h344Viewer.inspect().projection.cycle?.decision?.kind==='handover');const after=await raw(),rng=await t.rng(p);await p.waitForFunction(()=>!document.querySelector('#cycle-pass')?.disabled);assert.deepEqual(await raw(),after);assert.equal(await t.rng(p),rng);if(scenario==='local'&&width===1365)await t.host(p).evaluate(()=>h344DropReply=false);
  await p.screenshot({path:resolve(dir,'pase.png')});await pass();await p.waitForFunction(()=>!document.querySelector('#cycle-dialog').open);assert.equal((await api()).mode,'map');assert.equal((await api()).projection.turn,'ai');await finish();
 }else{
  await finish();await p.locator('#cycle-speed').waitFor();await p.locator('#cycle-speed').click();
 }
 if(scenario==='death'){await p.locator('#cycle-death').waitFor();assert.match(await p.locator('#cycle-dialog').textContent(),/Mara/);await p.screenshot({path:resolve(dir,'fallecimiento.png')});await p.locator('#cycle-death').click();}
 await p.locator('#cycle-all').waitFor();
 if(scenario==='local'&&width===1365){
  const before=await raw(),rng=await t.rng(p),id=(await api()).projection.cycle.operation.id,starts=(await api()).starts;
  await p.evaluate(()=>document.querySelector('#restart-view').click());await p.waitForFunction(starts=>h344Viewer.inspect().starts>starts&&document.body.dataset.viewState==='ready',starts);await p.locator('#cycle-all').waitFor();assert.equal((await api()).projection.cycle.operation.id,id);assert.deepEqual(await raw(),before);assert.equal(await t.rng(p),rng);
  const connections=await t.host(p).evaluate(()=>h344Test.connection().connections);await p.evaluate(()=>document.querySelector('#reconnect-source').click());await t.host(p).waitForFunction(n=>h344Test.connection().connections>n,connections);await p.locator('#cycle-all').waitFor();assert.deepEqual(await raw(),before);assert.equal(await t.rng(p),rng);
 }
 await review();
 if(scenario==='time'){
  await p.locator('#cycle-close-final').waitFor();assert.match(await p.locator('#cycle-dialog').textContent(),/agotaron las rondas/);await p.screenshot({path:resolve(dir,'fin-partida.png')});await p.locator('#cycle-close-final').click();assert.equal(await p.locator('#finish-turn').isDisabled(),true);assert.equal((await raw()).ended,true);
 }else{
  if(scenario!=='ai')await pass();
  if(scenario==='death'){await p.locator('#cycle-leader-h1').waitFor();assert.equal((await raw()).leaders.human,null);await p.screenshot({path:resolve(dir,'sucesion.png')});await p.locator('#cycle-leader-h1').click();}
  await p.waitForFunction(()=>!document.querySelector('#cycle-dialog').open);assert.equal((await raw()).round,2);assert.equal((await api()).projection.round,2);assert.equal((await api()).projection.dice.ownerId,'human');assert.equal((await api()).mode,'map');
  for(const k of ['zoom','x','y'])assert.ok(Math.abs((await t.view(p)).camera[k]-camera[k])<.01,'cámara '+k+' '+scenario);
  await p.screenshot({path:resolve(dir,'nueva-ronda.png')});
 }
 assert.equal(errors.length,0,JSON.stringify(errors));const s=await api();assert.equal(s.projection.locations.reduce((n,l)=>n+l.exteriorCapacity,0),33);assert.equal(s.projection.locations[4].capacity,4);assert.equal(s.projection.locations[6].capacity,4);
 const video=await p.video().path();result.records.push({viewport:{width,height},scenario,phases,round:(await raw()).round,outcome:s.projection.cycle.outcome,cameraBefore:camera,cameraAfter:(await t.view(p)).camera,mode:s.mode,errors,video,passed:true});await context.close();lastPage=null;
}result.passed=true;}catch(error){result.error=error.stack;if(lastPage){result.last=await t.api(lastPage);result.raw=await t.raw(lastPage);await lastPage.screenshot({path:resolve(lastDir,'fallo.png')});}throw error;}finally{await writeFile(resolve(out,'resultados.json'),JSON.stringify(result,null,2));await browser.close();}
console.log(JSON.stringify({passed:result.passed,out}));
