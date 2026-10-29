// Reproduce los clics de cinco partidas QA sobre el HTML exacto del producto, sin acceso al motor.
import assert from 'node:assert/strict';import {readFile,mkdir,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {legacySelector,commandLocator} from '../test-support/browser-game-page.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const input=process.env.REPLAY_SOURCE||'/tmp/d1d2-browser-games-fixed/partidas.json',output=process.env.REPLAY_OUTPUT||'/tmp/d1d2-production';
const plans=JSON.parse(await readFile(input,'utf8'));assert.equal(plans.length,5);assert.ok(plans.every(p=>p.completed&&!p.errors.length&&!p.invariants.length));
await mkdir(output,{recursive:true});const url=process.env.PRODUCT_URL||'http://127.0.0.1:8765/invierno_colonia_v9_9.html';const html=await(await fetch(url)).text();
const result={htmlSha256:createHash('sha256').update(html).digest('hex'),scope:'HTML de producto, sin QA ni estado global; entradas reales y resultado visible comparado',records:[],smoke:[]};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const plan of plans){
  const context=await browser.newContext({viewport:plan.viewport,isMobile:plan.mode==='local',hasTouch:plan.mode==='local',reducedMotion:'reduce'});
  await context.addInitScript(seed=>{window.testRandomState=seed;Math.random=()=>{window.testRandomState=(Math.imul(1664525,window.testRandomState)+1013904223)>>>0;return window.testRandomState/4294967296;};},plan.seed);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const record={mode:plan.mode,seed:plan.seed,viewport:plan.viewport,errors,completed:false,inputs:0};result.records.push(record);
  await page.goto(url);await page.evaluate(seed=>window.testRandomState=seed,plan.seed);
  assert.deepEqual(await page.evaluate(()=>[typeof game,typeof startGame,typeof __test]),['undefined','undefined','undefined']);
  for(const input of plan.replay){
   let locator=page.locator(legacySelector(input.selector));if(input.first)locator=locator.first();
   if(input.type==='select')await locator.selectOption(input.value);else await locator.click();record.inputs++;
   if(errors.length)throw Error(errors.join('; '));
  }
  await page.waitForFunction(()=>document.getElementById('turnLabel').textContent==='FIN DE PARTIDA'&&getComputedStyle(document.getElementById('skipAI')).display==='none');
  const state=await page.evaluate(()=>({label:document.getElementById('turnLabel').textContent,banner:document.getElementById('banner').textContent,stats:Object.fromEntries([...document.querySelectorAll('.stat')].map(el=>[el.dataset.stat,el.querySelector('strong').textContent])),goal:document.getElementById('goalCard').textContent}));
  assert.equal(Number(state.stats.comida),plan.final.food);assert.equal(Number(state.stats.morale),plan.final.morale);
  assert.ok(state.goal.includes(plan.final.samples+'/'+plan.final.goal));
  assert.ok(state.banner.includes(plan.final.result==='victory'?'Victoria':'Derrota'));
  assert.equal(await page.locator('#deathBackdrop').isVisible(),false);assert.equal(await page.locator('#passScreen').isVisible(),false);
  record.final=state;record.completed=true;await page.screenshot({path:output+'/'+plan.mode+'-'+plan.seed+'.png'});await context.close();
 }
 for(const viewport of [{width:320,height:640},{width:393,height:852},{width:1365,height:768}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});await context.addInitScript(()=>Math.random=()=>.45);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await commandLocator(page,'startGame',['local']).click();
  assert.equal(await page.locator('.site').count(),7);
  const initialChoice=page.locator('[data-command="crossChoose"]:not([disabled])');if(await initialChoice.count())await initialChoice.first().click();
  const recruit=page.locator('[data-command="dismissRecruit"]');if(await recruit.count())await recruit.click();
  const dice=page.locator('.floatingDie');assert.ok(await dice.count()>0);
  const geometry=await dice.evaluateAll(elements=>elements.map(el=>{const {x,y,width,height}=el.getBoundingClientRect();return {x,y,width,height};}));assert.ok(geometry.every(r=>r.width>=44&&r.height>=44));
  if(viewport.width<500)await dice.first().tap();else await dice.first().click();assert.equal(await page.locator('.floatingDie.selected').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#floatingActions').click();await commandLocator(page,'menuGo',['help']).click();assert.equal(await page.locator('#backdrop').evaluate(el=>el.classList.contains('open')),true);
  await page.locator('.modalHeader button').click();assert.deepEqual(errors,[]);
  result.smoke.push({viewport,geometry,errors,ok:true});await page.screenshot({path:output+'/viewport-'+viewport.width+'.png'});await context.close();
 }
}finally{await browser.close();await writeFile(output+'/resultados.json',JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify({productionGames:result.records.filter(r=>r.completed).length,viewports:result.smoke.length,htmlSha256:result.htmlSha256,output},null,2));
