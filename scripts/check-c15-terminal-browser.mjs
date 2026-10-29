import {scenarioPage} from '../test-support/browser-game-page.mjs';
// Regresiones C15 en Chromium real, desde estados preparados y con botones/teclado.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.GAME_URL||'http://127.0.0.1:8765/dist/invierno-test.html';
const output=process.env.C15_OUTPUT_DIR||'/tmp/c15-terminal-browser';await mkdir(output,{recursive:true});
const html=await (await fetch(url)).text();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const result={chromium:browser.version(),htmlSha256:createHash('sha256').update(html).digest('hex'),category:'estados preparados, acciones reales de interfaz',records:[],errors:[]};
try{
 for(const viewport of [{width:393,height:852},{width:1365,height:768}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  await context.addInitScript(()=>Math.random=()=>.45);
  const page=scenarioPage(await context.newPage());page.on('pageerror',e=>result.errors.push(e.message));
  for(const kind of ['hambre','residuos']){
   await page.goto(url);await page.locator('[onclick="startGame(\'local\')"]').click();
   await page.evaluate(kind=>{
    game.crossPending=false;game.crossResolved=true;hide();game.turn='ai';game.leaderChosen=true;game.localLeaderChosen=true;
    game.food=kind==='hambre'?0:30;game.waste=kind==='residuos'?10:0;game.morale=1;
    game.zones.forEach(z=>{z.z=0;z.b=0;z.noise=0});
    game.crisis={type:'comida',need:2,given:4,contributions:Array(4).fill('comida'),fail:'moral'};paint();
   },kind);
   await page.locator('#floatingActions').click();await page.locator('#fabEndTurn').click();
   await page.waitForFunction(()=>game.ended&&!aiRunning);
   const state=await page.evaluate(()=>({morale:game.morale,food:game.food,hunger:game.hunger,given:game.crisis.given,round:game.round,ended:game.ended,zombies:game.zones.map(z=>z.z),pass:passScreenActive}));
   assert.deepEqual(state,{morale:0,food:kind==='hambre'?0:27,hunger:kind==='hambre'?1:0,given:4,round:1,ended:true,zombies:Array(7).fill(0),pass:false});
   result.records.push({viewport,kind,state});
  }
  await page.goto(url);await page.locator('[onclick="startGame(\'local\')"]').click();
  await page.evaluate(()=>{game.crossPending=false;game.crossResolved=true;hide();game.crossCard=0;game.crossOwner='human';game.crossResolved=false;game.humans[0].wounds=2;target=1;Math.random=()=>2.5/6;paint();});
  await page.locator('#floatingActions').click();await page.locator('[onclick="menuGo(\'actions\')"]').click();await page.locator('[onclick="doMove()"] ').click();
  await page.locator('#deathBackdrop').waitFor({state:'visible'});
  const before=await page.evaluate(()=>({leader:game.leaders.human,death:deathDirector.active,queue:[...pendingLeaderSides]}));
  let reached=false;const focus=[];
  for(let i=0;i<12;i++){
   await page.keyboard.press('Tab');const item=await page.evaluate(()=>({tag:document.activeElement.tagName,onclick:document.activeElement.getAttribute('onclick'),leader:document.activeElement.matches('.leaderOption')}));focus.push(item);
   if(item.leader){await page.keyboard.press('Enter');reached=true;break;}
  }
  assert.equal(reached,true,'ejercitar la ruta real de fuga de foco');
  const during=await page.evaluate(()=>({leader:game.leaders.human,death:deathDirector.active,queue:[...pendingLeaderSides]}));
  assert.deepEqual(during,before,'no elegir sucesor mientras se confirma el fallecimiento');
  await page.locator('.deathContinue').click();await page.locator('[onclick="chooseLeader(\'h1\')"]').click();
  assert.equal(await page.evaluate(()=>game.leaders.human),'h1');
  await page.locator('button.crossChoice').nth(1).click();
  assert.equal(await page.evaluate(()=>playable()),true);
  result.records.push({viewport,kind:'teclado-fallecimiento-sucesión',before,during,focus,continued:true});
  await page.screenshot({path:output+'/'+viewport.width+'-continuacion.png'});await context.close();
 }
 assert.deepEqual(result.errors,[]);
}finally{await browser.close();await writeFile(output+'/resultados.json',JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify({output,checks:result.records.length,errors:result.errors},null,2));
