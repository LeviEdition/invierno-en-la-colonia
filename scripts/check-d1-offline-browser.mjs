// D1.1 — Apertura directa file://: el HTML distribuido no necesita servidor ni módulos externos.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),headless:true,args:['--no-sandbox']});
const url=new URL('../invierno_colonia_v9_9.html',import.meta.url).href;
const results=[];
try {
 for(const mode of ['local','ai']){
  const context=await browser.newContext({viewport:{width:393,height:852},reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url);
  await page.locator('[onclick="startGame(\''+mode+'\')"]').click();
  const state=await page.evaluate(()=>({
   mode:game.mode,
   catalogSize:Object.keys(catalog.definitions).length,
   deckSizes:[1,2,3,4,5,6].map(i=>game.decks[i].length),
   initialHand:game.items.length,
   resultOfResolve:catalog.resolve('pistol')?.id,
  }));
  assert.equal(state.mode,mode);
  assert.equal(state.catalogSize,17);
  assert.deepEqual(state.deckSizes,[20,20,20,20,20,20]);
  assert.equal(state.initialHand,7);
  assert.equal(state.resultOfResolve,'pistol');
  assert.deepEqual(errors,[]);
  results.push({mode,ok:true,errors});
  await context.close();
 }
} finally {await browser.close();}
console.log(JSON.stringify({fileUrl:url,results},null,2));