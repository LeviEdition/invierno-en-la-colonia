import {scenarioPage} from '../test-support/browser-game-page.mjs';
// D1.2b: prueba arquitectónica con handlers globales sustituidos deliberadamente.
// El resto de la partida continúa usando el motor real; no son partidas completas.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.GAME_URL||'http://127.0.0.1:8765/dist/invierno-test.html';
const output=process.env.D12B_OUTPUT_DIR||'/tmp/d12b-handover';await mkdir(output,{recursive:true});
const html=await (await fetch(url)).text();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const evidence={htmlSha256:createHash('sha256').update(html).digest('hex'),chromium:browser.version(),scope:'inicio/pase, inyección de fallo en globals; estado preparado para pasar turno',records:[],errors:[]};
try{
 for(const viewport of [{width:320,height:640},{width:393,height:852},{width:1365,height:768}])for(const mode of ['local','ai']){
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  await context.addInitScript(()=>Math.random=()=>.45);
  const page=scenarioPage(await context.newPage());page.on('pageerror',error=>evidence.errors.push(error.message));await page.goto(url);
  await page.evaluate(()=>{
   window.d12b={fallbacks:0,creates:0};const originalCreate=create;
   create=()=>{window.d12b.creates++;return originalCreate();};
   window.startGame=window.confirmPass=()=>{window.d12b.fallbacks++;throw Error('Se usó el handler global legado');};
  });
  // Clic sobre el hijo real, no solo el contenedor button.
  await page.locator('[onclick="startGame(\''+mode+'\')"] strong').click();
  const started=await page.evaluate(()=>({mode:game.mode,setupHidden:document.getElementById('setupScreen').hidden,creates:window.d12b.creates,fallbacks:window.d12b.fallbacks,exportedGame:Object.hasOwn(window,'game'),exportedNamespace:Object.hasOwn(window,'CatalogModule')}));
  assert.deepEqual(started,{mode,setupHidden:true,creates:1,fallbacks:0,exportedGame:false,exportedNamespace:false});
  const record={viewport,mode,started};
  if(mode==='local'){
   await page.evaluate(()=>{game.crossPending=false;game.crossResolved=true;hide();game.leaderChosen=true;game.localLeaderChosen=true;paint();});
   await page.locator('#floatingActions').click();await page.locator('#fabEndTurn').click();
   assert.equal(await page.locator('#passScreen').isVisible(),true);
   await page.locator('[onclick="confirmPass()"] ').focus();await page.keyboard.press('Enter');
   record.passed=await page.evaluate(()=>({turn:game.turn,pass:passScreenActive,creates:window.d12b.creates,fallbacks:window.d12b.fallbacks}));
   assert.deepEqual(record.passed,{turn:'ai',pass:false,creates:1,fallbacks:0});
  }
  evidence.records.push(record);await context.close();
 }
 assert.deepEqual(evidence.errors,[]);
}finally{await browser.close();await writeFile(output+'/resultados.json',JSON.stringify(evidence,null,2)+'\n');}
console.log(JSON.stringify({output,checks:evidence.records.length,errors:evidence.errors},null,2));
