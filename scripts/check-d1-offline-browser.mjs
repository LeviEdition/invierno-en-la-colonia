import {gamePage,commandLocator} from '../test-support/browser-game-page.mjs';
// D1.1 — Apertura directa file://: el HTML distribuido no necesita servidor ni módulos externos.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');

const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),headless:true,args:['--no-sandbox']});
const url=process.env.GAME_FILE_URL||new URL('../invierno_colonia_v9_9.html',import.meta.url).href;
assert.match(url,/^file:/,'La comprobación offline requiere file://');
const htmlSha256=createHash('sha256').update(await readFile(new URL(url))).digest('hex');
const results=[];
try {
 for(const mode of ['local','ai']){
  const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'reduce'});
  await context.setOffline(true);
  const page=await context.newPage();
  const errors=[],requests=[];
  page.on('request',request=>requests.push(request.url()));
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url);
  await commandLocator(page,'startGame',[mode]).click();
  const qa=await page.evaluate(()=>!!window.__test);
  const state=qa?await gamePage(page).evaluate(()=>({
   mode:game.mode,
   catalogSize:Object.keys(catalog.definitions).length,
   deckSizes:[1,2,3,4,5,6].map(i=>game.decks[i].length),
   initialHand:game.items.length,
   resultOfResolve:catalog.resolve('pistol')?.id,
  })):null;
  if(qa){assert.equal(state.mode,mode);
  assert.equal(state.catalogSize,17);
  assert.deepEqual(state.deckSizes,[20,20,20,20,20,20]);
  assert.equal(state.initialHand,7);
  assert.equal(state.resultOfResolve,'pistol');}
  assert.equal(await page.locator('#setupScreen').isVisible(),false);
  assert.match(await page.locator('#turnLabel').textContent(),mode==='local'?/JUGADOR 1/:/TU TURNO/);
  assert.equal(await page.evaluate(()=>Object.hasOwn(window,'game')),false,'no publicar estado en window');
  assert.deepEqual(errors,[]);
  assert.ok(requests.every(request=>request.startsWith('file:')||request.startsWith('data:')),'Sin solicitudes de red');
  results.push({mode,ok:true,errors,requests,networkOffline:true,variant:qa?'QA: incluye aserciones internas históricas':'producto: interfaz y globals'});
  await context.close();
 }
} finally {await browser.close();}
console.log(JSON.stringify({fileUrl:url,htmlSha256,chromium:browser.version(),results},null,2));
