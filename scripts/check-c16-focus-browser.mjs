// C16/A1 — Recorrido de teclado real en Chromium, tres tamaños de pantalla.
// Requiere servidor local en :8765 y PLAYWRIGHT_MODULE/CHROMIUM_PATH como C15.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.GAME_URL||'http://127.0.0.1:8765/invierno_colonia_v9_9.html';
const output=process.env.C16_OUTPUT_DIR||'/tmp/c16-focus';
await mkdir(output,{recursive:true});
const html=await (await fetch(url)).text();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const result={htmlSha256:createHash('sha256').update(html).digest('hex'),chromium:browser.version(),scope:'C16: ayuda, muerte, sucesión, pase, teclado, foco de retorno; sin lector de pantalla físico',records:[],errors:[]};

try{
 for(const viewport of [{width:320,height:640},{width:393,height:852},{width:1365,height:768}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  const page=await context.newPage();
  page.on('pageerror',e=>result.errors.push(e.message));
  await page.goto(url);
  const inside=selector=>page.evaluate(s=>document.querySelector(s).contains(document.activeElement),selector);
  const backgroundInert=()=>page.evaluate(()=>!!document.getElementById('floatingActions').closest('[inert]'));
  const cycle=async(selector,count=8)=>{
   const steps=[];
   for(const key of ['Shift+Tab',...Array(count).fill('Tab')]){
    await page.keyboard.press(key);
    const ok=await inside(selector);
    steps.push({key,inside:ok});
    assert.equal(ok,true,'foco escapó de '+selector+' en '+viewport.width);
   }
   return steps;
  };
  const record={viewport};
  record.setup=await cycle('#setupScreen',4);
  await page.locator('[onclick="startGame(\'local\')"]').click();
  // Preparación de UI real: desactivar encrucijada aleatoria inicial, no simular reglas de acciones.
  await page.evaluate(()=>{game.crossPending=false;game.crossResolved=true;hide();paint();});
  await page.locator('#floatingActions').click();
  await page.locator('[onclick="menuGo(\'help\')"]').click();
  assert.equal(await backgroundInert(),true);
  record.help=await cycle('#backdrop .modal');
  record.helpProtection=await page.evaluate(()=>{
   document.getElementById('floatingActions').focus();
   return {inside:document.querySelector('#backdrop .modal').contains(document.activeElement),
    overlay:!document.getElementById('backdrop').inert};
  });
  assert.deepEqual(record.helpProtection,{inside:true,overlay:true});
  await page.locator('.modalHeader button').click();
  assert.equal(await backgroundInert(),false);
  record.helpFocusReturned=await page.evaluate(()=>document.activeElement.id);
  assert.equal(record.helpFocusReturned,'floatingActions');

  // Fallecimiento con sucesión; el aviso de muerte debe ocultar y bloquear el modal inferior.
  await page.evaluate(()=>{game.leaderChosen=true;game.crossPending=false;game.crossResolved=true;kill(game.humans[0],'verificación de foco C16');paint();});
  await page.locator('#deathBackdrop').waitFor({state:'visible'});
  assert.equal(await backgroundInert(),true);
  record.death=await cycle('#deathBackdrop',6);
  record.deathBackground=await page.evaluate(()=>{
   document.getElementById('floatingActions').focus();
   return {inside:document.getElementById('deathBackdrop').contains(document.activeElement),
    lowerModalInert:document.getElementById('backdrop').inert};
  });
  assert.deepEqual(record.deathBackground,{inside:true,lowerModalInert:true});
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#deathBackdrop').isVisible(),true);
  await page.locator('.deathContinue').click();
  await page.locator('.leaderOption').first().waitFor({state:'visible'});
  assert.equal(await inside('#backdrop .modal'),true);
  assert.equal(await backgroundInert(),true);
  await page.locator('.leaderOption').first().click();
  assert.equal(await backgroundInert(),false);
  record.succession=await page.evaluate(()=>({leader:game.leaders.human,deathHidden:document.getElementById('deathBackdrop').hidden,
   backdropOpen:document.getElementById('backdrop').classList.contains('open')}));
  assert.equal(record.succession.deathHidden,true);
  assert.equal(record.succession.backdropOpen,false);
  assert.ok(record.succession.leader);

  await page.evaluate(()=>showPass('ai'));
  record.pass=await cycle('#passScreen',4);
  await page.locator('[onclick="confirmPass()"]').click();
  assert.equal(await backgroundInert(),false);
  record.overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  assert.equal(record.overflow,false);
  result.records.push(record);
  await context.close();
 }
 assert.deepEqual(result.errors,[]);
}finally{
 await browser.close();
 await writeFile(output+'/resultados.json',JSON.stringify(result,null,2)+'\n');
}
console.log(JSON.stringify({checks:result.records.length,htmlSha256:result.htmlSha256,errors:result.errors,output},null,2));
