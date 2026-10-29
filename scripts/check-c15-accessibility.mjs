import {scenarioPage} from '../test-support/browser-game-page.mjs';
// Auditoría de foco real. No cambia reglas; escenarios de pase/muerte preparados.
// Servir el repositorio en 8765 y definir PLAYWRIGHT_MODULE si es externo.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.GAME_URL||'http://127.0.0.1:8765/dist/invierno-test.html';
const output=process.env.C15_OUTPUT_DIR||'/tmp/c15-focus';
await mkdir(output,{recursive:true});
const html=await (await fetch(url)).text();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const result={chromium:browser.version(),htmlSha256:createHash('sha256').update(html).digest('hex'),scope:'setup/pase: contrato; ayuda/fallecimiento: observación de límite, no aprobación accesible',records:[],errors:[]};
try{
 for(const viewport of [{width:320,height:640},{width:393,height:852},{width:1365,height:768}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  await context.addInitScript(()=>Math.random=()=>.45);
  const page=scenarioPage(await context.newPage());page.on('pageerror',e=>result.errors.push(e.message));
  await page.goto(url);
  async function cycle(id){
   const observations=[];
   for(const key of ['Shift+Tab',...Array(12).fill('Tab')]){
    await page.keyboard.press(key);
    observations.push(await page.evaluate(id=>({inside:document.getElementById(id).contains(document.activeElement),tag:document.activeElement.tagName,id:document.activeElement.id}),id));
   }
   assert.ok(observations.every(o=>o.inside),'foco aislado '+id);
   return observations;
  }
  const record={viewport,setup:await cycle('setupScreen')};
  await page.locator('[onclick="startGame(\'local\')"]').click();
  await page.evaluate(()=>{game.crossPending=false;game.crossResolved=true;hide();showPass('ai');});
  record.pass=await cycle('passScreen');
  record.passProtection=await page.evaluate(()=>{
   const before=JSON.stringify(game);document.getElementById('floatingActions').focus();
   return {focusInside:document.getElementById('passScreen').contains(document.activeElement),gameUnchanged:before===JSON.stringify(game),backgroundInert:!!document.getElementById('floatingActions').closest('[inert]')};
  });
  assert.deepEqual(record.passProtection,{focusInside:true,gameUnchanged:true,backgroundInert:true});
  await page.locator('[onclick="confirmPass()"]').click();
  record.afterPass=await page.evaluate(()=>({inert:!!document.getElementById('floatingActions').closest('[inert]'),focus:document.activeElement.id}));
  assert.equal(record.afterPass.inert,false);
  await page.locator('#floatingActions').click();
  await page.locator('[onclick="menuGo(\'help\')"]').click();
  // Comprobar el límite sin convertirlo en una expectativa de accesibilidad correcta.
  await page.locator('.modalHeader button').focus();
  await page.keyboard.press('Shift+Tab');
  record.help=await page.evaluate(()=>({focusOutside:!document.querySelector('#backdrop .modal').contains(document.activeElement),active:document.activeElement.id||document.activeElement.className,backgroundInert:!!document.getElementById('floatingActions').closest('[inert]')}));
  await page.locator('.modalHeader button').click();
  await page.evaluate(()=>{kill(game.humans[0],'escenario de foco C15');paint();});
  await page.locator('#deathBackdrop').waitFor({state:'visible'});
  await page.keyboard.press('Tab');
  record.death=await page.evaluate(()=>({focusOutside:!document.getElementById('deathBackdrop').contains(document.activeElement),active:document.activeElement.id||document.activeElement.className,backgroundInert:!!document.getElementById('floatingActions').closest('[inert]')}));
  await page.screenshot({path:output+'/'+viewport.width+'-death.png'});
  // La fuga de foco no debe permitir jugar durante una muerte pendiente.
  record.deathGuard=await page.evaluate(()=>{const snapshot=()=>{const state=JSON.parse(JSON.stringify(game));delete state.log;delete state.last;return JSON.stringify(state);};const before=snapshot();boostDie();return before===snapshot();});
  assert.equal(record.deathGuard,true);
  await page.locator('.deathContinue').click();
  record.pageOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  assert.equal(record.pageOverflow,false);
  result.records.push(record);await context.close();
 }
 assert.deepEqual(result.errors,[]);
}finally{
 await browser.close();await writeFile(output+'/resultados.json',JSON.stringify(result,null,2)+'\n');
}
console.log(JSON.stringify({output,checks:result.records.length,errors:result.errors,observations:result.records.map(r=>({viewport:r.viewport,help:r.help,death:r.death}))},null,2));
