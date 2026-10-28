import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const records=[],errors=[];const url=process.env.GAME_URL||'http://127.0.0.1:8765/invierno_colonia_v9_9.html';
try{
 for(const viewport of [{width:393,height:852},{width:1365,height:768}])for(const order of ['human-ai','ai-human','ai-auto']){
  const ctx=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'});await ctx.addInitScript(()=>Math.random=()=>.45);
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
  await page.locator('[onclick="startGame(\''+(order==='ai-auto'?'ai':'local')+'\')"]').click();
  await page.evaluate(order=>{
   game.crossPending=false;game.crossResolved=true;hide();game.leaderChosen=true;game.localLeaderChosen=true;game.food=30;game.morale=9;
   if(order==='ai-auto'){kill(game.humans[0],'control C12');kill(game.bots[1],'control C12');paint();return;}
   game.turn='ai';selected=0;if(order==='ai-human')game.leaders.ai='a2';
   game.humans.forEach(p=>p.loc=p.id===game.leaders.human?0:1);game.bots.forEach(p=>p.loc=p.id===game.leaders.ai?0:1);
   game.zones.forEach(z=>{z.z=0;z.b=0;z.noise=0;});game.zones[0].z=zcap[0];
   game.crisis={type:'comida',need:2,given:0,contributions:[],fail:'zombie'};
   game.crossRemaining=Array(8).fill(crossroadsDeck.findIndex(c=>c.title==='Un almacén bajo el hielo'));paint();
  },order);
  if(order!=='ai-auto'){await page.locator('#floatingActions').click();await page.locator('#fabEndTurn').click();}
  await page.locator('#deathBackdrop').waitFor({state:'visible'});const deathText=await page.locator('#deathHeading').innerText();await page.locator('.deathContinue').click();
  if(order!=='ai-auto'){await page.locator('#passScreen').waitFor({state:'visible'});await page.locator('[onclick="confirmPass()"] ').click();}
  await page.locator('[onclick="chooseLeader(\'h1\')"]').click();
  if(order!=='ai-auto'){
   assert.deepEqual(await page.evaluate(()=>pendingLeaderSides),['ai']);
   await page.locator('#floatingActions').click();await page.locator('#fabEndTurn').click();await page.locator('#passScreen').waitFor({state:'visible'});
   assert.equal(await page.evaluate(()=>leaderChoiceReady()),false);await page.locator('[onclick="confirmPass()"] ').click();
   assert.equal(await page.locator('.leaderOption').count(),2);await page.locator('[onclick="chooseLeader(\'a0\')"]').click();
  }
  const state=await page.evaluate(()=>({leaders:game.leaders,pending:pendingLeaderSides,turn:game.turn,round:game.round}));
  assert.deepEqual(state.leaders,{human:'h1',ai:'a0'});assert.deepEqual(state.pending,[]);
  records.push({viewport,order,deathText,state});await ctx.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks:records.length,errors,records},null,2));
}finally{await browser.close();}
