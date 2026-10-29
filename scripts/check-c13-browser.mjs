import {scenarioPage} from '../test-support/browser-game-page.mjs';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const url=process.env.GAME_URL||'http://127.0.0.1:8765/dist/invierno-test.html';const records=[],errors=[];
try{
 for(const viewport of [{width:393,height:852},{width:1365,height:768}]){
  const ctx=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'});await ctx.addInitScript(()=>Math.random=()=>.45);
  const page=scenarioPage(await ctx.newPage());page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.locator('[onclick="startGame(\'local\')"]').click();
  await page.evaluate(()=>{game.crossPending=false;game.crossResolved=true;hide();game.items=[catalog.create('ration')];game.humans[0].equipment=[catalog.create('pistol')];profile('h0');});
  await page.locator('#modalContent [onclick="startTransfer(0)"]').click();
  assert.equal(await page.evaluate(()=>{const before=JSON.stringify({food:game.food,dice:game.dice,hand:game.items});playItem(0);boostDie();return before===JSON.stringify({food:game.food,dice:game.dice,hand:game.items});}),true);
  await page.locator('[onclick="chooseTransfer(\'h1\')"]').click();
  assert.equal(await page.evaluate(()=>game.humans[1].equipment.length===1&&game.items.length===1),true);
  await page.evaluate(()=>{game.humans[0].loc=1;game.humans[1].loc=2;game.zones[2].z=zcap[2];game.morale=1;game.samples=game.goal-1;game.decks[1]=[catalog.create('ration'),catalog.create('notes'),catalog.create('bandage')];game.dice=[6];game.crossCard=crossroadsDeck.findIndex(c=>c.title==='Un mensaje en la pared');game.crossOwner='human';game.crossResolved=false;show('actions');});
  await page.locator('[onclick="search()"]').click();await page.locator('[onclick="addNoiseSearch()"]').click();
  assert.equal(await page.evaluate(()=>game.zones[1].noise),1);
  await page.locator('[onclick="chooseLoot(1)"]').click();
  assert.equal(await page.evaluate(()=>game.crossPending),true);await page.locator('button.crossChoice').nth(0).click();
  await page.locator('#deathBackdrop').waitFor({state:'visible'});await page.locator('.deathContinue').click();
  const terminal=await page.evaluate(()=>({outcome:gameOutcome(game),ended:game.ended,samples:game.samples,goal:game.goal,leaderRequests:pendingLeaderSides,cross:game.crossPending,loot:pendingLoot}));
  assert.equal(terminal.outcome,'morale');assert.equal(terminal.ended,true);assert.equal(terminal.samples,terminal.goal);assert.deepEqual(terminal.leaderRequests,[]);assert.equal(terminal.cross,false);assert.equal(terminal.loot,null);
  records.push({viewport,chain:'transferencia→búsqueda→ruido→botín→encrucijada→muerte→derrota',terminal});
  await page.evaluate(()=>{startGame('local');game.crossPending=false;game.crossResolved=false;game.crossCard=0;game.crossOwner='human';hide();Math.random=()=>2.5/6;game.humans[0].wounds=2;target=1;show('actions');});
  await page.locator('[onclick="doMove()"]').click();await page.locator('#deathBackdrop').waitFor({state:'visible'});await page.locator('.deathContinue').click();
  await page.locator('[onclick="chooseLeader(\'h1\')"]').click();
  assert.equal(await page.evaluate(()=>opened==='crossroads'&&game.crossPending),true);
  assert.equal(await page.locator('.crossStory').isVisible(),true);await page.locator('button.crossChoice').nth(0).click();
  assert.equal(await page.evaluate(()=>game.crossPending),false);records.push({viewport,chain:'movimiento→muerte→sucesión→encrucijada-visible',continued:true});
  await page.evaluate(()=>{startGame('ai');game.crossOwner='ai';game.crossPending=true;game.crossResolved=false;oldPause=pause();});
  await page.evaluate(async()=>{startGame('local');const before=JSON.stringify(game);await oldPause;window.resetIsolated=before===JSON.stringify(game);});
  assert.equal(await page.evaluate(()=>window.resetIsolated),true);records.push({viewport,chain:'espera-encrucijada→reinicio',isolated:true});await ctx.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks:records.length,errors,records},null,2));
}finally{await browser.close();}
