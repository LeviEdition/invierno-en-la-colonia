// C11/#13: geometría real y acciones con la interfaz, sin sustituir funciones del juego.
// Servir raíz con python -m http.server 8765 --bind 127.0.0.1.
// PLAYWRIGHT_MODULE=/ruta/a/playwright-core/index.mjs node scripts/check-issue13-browser.mjs
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.C11_OUTPUT_DIR||'/tmp/c11-browser';
const url=process.env.ISSUE13_URL||'http://127.0.0.1:8765/invierno_colonia_v9_9.html';
await mkdir(output,{recursive:true});
const servedHtml=await (await fetch(url)).text();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const evidence={label:process.env.C11_LABEL||'actual',chromium:browser.version(),htmlSha256:createHash('sha256').update(servedHtml).digest('hex'),viewports:[],errors:[],failures:[]};
const check=(ok,reason)=>{if(!ok)evidence.failures.push(reason);};
try{
 for(const viewport of [{width:320,height:640},{width:393,height:852},{width:1365,height:768},{width:852,height:393},{width:640,height:320},{width:320,height:480}]){
  const touch=Math.min(viewport.width,viewport.height)<500;
  const context=await browser.newContext({viewport,isMobile:touch,hasTouch:touch,reducedMotion:'reduce'});
  await context.addInitScript(()=>{Math.random=()=>.45;});
  const page=await context.newPage();page.on('pageerror',e=>evidence.errors.push({viewport,error:e.message}));
  const record={viewport,touch,measurements:[],trace:[]};evidence.viewports.push(record);
  async function interact(locator){
   await locator.evaluate(el=>{window.c11Click=false;el.addEventListener('click',()=>window.c11Click=true,{once:true});});
   if(touch)await locator.tap();else await locator.click();
   await page.waitForFunction(()=>window.c11Click);
  }
  const state=()=>page.evaluate(()=>({dice:[...game.dice],botDice:[...game.botDice],picked,food:game.food,waste:game.waste,turn:game.turn,leaderChosen:game.leaderChosen,localLeaderChosen:game.localLeaderChosen,selected:[...document.querySelectorAll('.floatingDie.selected')].map(el=>el.textContent)}));
  const measure=async(label,{menu=false}={})=>{
   const m=await page.evaluate(({label,menu})=>{
    const box=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const visibleBox=el=>{
     const r=box(el);
     for(let a=el.parentElement;a;a=a.parentElement){
      const css=getComputedStyle(a),b=box(a);
      if(css.overflowX!=='visible'){r.x=Math.max(r.x,b.x+a.clientLeft);r.right=Math.min(r.right,b.x+a.clientLeft+a.clientWidth);}
      if(css.overflowY!=='visible'){r.y=Math.max(r.y,b.y+a.clientTop);r.bottom=Math.min(r.bottom,b.y+a.clientTop+a.clientHeight);}
     }
     return r.right>r.x&&r.bottom>r.y?r:null;
    };
    const intersects=(a,b)=>a.x<b.right-.1&&a.right>b.x+.1&&a.y<b.bottom-.1&&a.bottom>b.y+.1;
    const panel=document.getElementById('floatingDice'),panelBox=box(panel),dice=[...panel.querySelectorAll('.floatingDie')];
    const obstacles=[...document.querySelectorAll('.surv,.sitehead,.mission,.stat,#floatingActions')];
    const collisions=[];
    for(const [i,die] of dice.entries()){
     const visible=visibleBox(die);if(!visible)continue;
     for(const el of obstacles){const b=visibleBox(el);if(b&&intersects(visible,b))collisions.push({die:i,element:el.id||el.className});}
    }
    const buttons=[...document.querySelectorAll('#fabMenu button')];
    const pairGaps=[];
    for(let i=0;i<dice.length;i++)for(let j=i+1;j<dice.length;j++){
     const a=box(dice[i]),b=box(dice[j]);
     if(Math.abs(a.y-b.y)<.1)pairGaps.push(Math.max(b.x-a.right,a.x-b.right));
     if(Math.abs(a.x-b.x)<.1)pairGaps.push(Math.max(b.y-a.bottom,a.y-b.bottom));
    }
    return {label,dice:dice.map(box),visibleDice:dice.map(visibleBox).filter(Boolean),panel:panelBox,burger:box(document.getElementById('floatingActions')),menu:menu?box(document.getElementById('fabMenu')):null,menuButtons:menu?buttons.map(box):[],collisions,minGap:pairGaps.length?Math.min(...pairGaps):null,pageWidth:document.documentElement.scrollWidth,boardClientWidth:document.querySelector('.boardwrap').clientWidth,boardScrollWidth:document.querySelector('.boardwrap').scrollWidth,boardClientHeight:document.querySelector('.boardwrap').clientHeight,panelScrollHeight:panel.scrollHeight,panelClientHeight:panel.clientHeight};
   },{label,menu});
   record.measurements.push(m);
   check(m.dice.every(r=>r.width>=44&&r.height>=44),viewport.width+' '+label+': dados menores de44×44');
   check(m.minGap===null||m.minGap>=8,viewport.width+' '+label+': separación menor de8');
   check(m.pageWidth<=viewport.width&&m.boardScrollWidth<=m.boardClientWidth,viewport.width+' '+label+': scroll horizontal');
   check(m.burger.x>=0&&m.burger.y>=0&&m.burger.right<=viewport.width&&m.burger.bottom<=viewport.height,viewport.width+' '+label+': menú principal fuera de pantalla');
   if(!menu)check(m.collisions.length===0,viewport.width+' '+label+': dados tapan controles del tablero');
   if(menu){
    const r=m.menu;check(r.x>=0&&r.y>=0&&r.right<=viewport.width&&r.bottom<=viewport.height,viewport.width+' '+label+': menú abierto fuera de pantalla');
    check(m.visibleDice.every(d=>d.bottom<=r.y||d.y>=r.bottom||d.right<=r.x||d.x>=r.right),viewport.width+' '+label+': menú superpuesto a dados');
   }
   return m;
  };
  await page.goto(url);
  await interact(page.locator('[onclick="startGame(\'local\')"]'));
  await page.evaluate(()=>{game.crossPending=false;game.crossResolved=true;hide();game.dice=[1,2,6,4];game.botDice=[2,5,6];game.waste=6;picked=0;paint();});
  // En ventanas bajas se permite desplazar la página para alcanzar la franja.
  // Se usa entrada de rueda real, no scrollIntoView sobre un overflow:hidden.
  if(viewport.height<=520){
   await page.mouse.move(5,5);await page.mouse.wheel(0,2000);
   await page.waitForFunction(()=>{const r=document.getElementById('floatingActions').getBoundingClientRect();return r.y>=0&&r.bottom<=innerHeight;},{},{timeout:2500});
  }
  await measure('cuatro-dados');
  await page.screenshot({path:output+'/'+viewport.width+'-dados.png'});
  const before=await state();
  const die=page.locator('#floatingDice .floatingDie').nth(2);
  if(touch){const b=await die.boundingBox();await page.touchscreen.tap(b.x+3,b.y+3);await page.waitForFunction(()=>picked===2);}else await interact(die);
  const selected=await state();assert.deepEqual({...selected,picked:before.picked,selected:before.selected},before);
  assert.equal(selected.picked,2);assert.deepEqual(selected.selected,['6']);record.trace.push({event:'seleccionar-tercero',state:selected});
  await interact(page.locator('#floatingActions'));await measure('menu-cuatro',{menu:true});
  await page.screenshot({path:output+'/'+viewport.width+'-menu.png'});
  // Cada entrada se comprueba sin activar Terminar turno ni Nueva partida.
  for(const type of ['inventory','group','crossroads','log','help','actions']){
   if(await page.locator('#fabMenu').isHidden())await interact(page.locator('#floatingActions'));
   await interact(page.locator('#fabMenu [onclick="menuGo(\''+type+'\')"]'));
   assert.equal(await page.locator('#backdrop').evaluate(el=>el.classList.contains('open')),true);
   assert.equal(await page.evaluate(()=>opened),type);
   if(type!=='actions')await interact(page.locator('.modalHeader [onclick="hide()"]'));
  }
  assert.equal(await page.locator('#modalContent .die.picked').innerText(),'6');
  await interact(page.locator('#modalContent [onclick="clean()"]'));
  assert.deepEqual((await state()).dice,[1,2,4]);assert.equal((await state()).waste,3);
  record.trace.push({event:'limpiar-consume-solo-el-elegido',state:await state()});
  await interact(page.locator('.modalHeader [onclick="hide()"]'));
  // Mantiene el bloqueo previo: en fases no interactivas se ocultan, no se gastan.
  await page.evaluate(()=>{aiRunning=true;paintDice();});
  assert.equal(await page.locator('.floatingDie').count(),0);
  await page.evaluate(()=>{aiRunning=false;pendingHeal={actor:'h0',targets:['h1']};paintDice();});
  assert.equal(await page.locator('.floatingDie').count(),0);
  await page.evaluate(()=>{pendingHeal=null;paintDice();});
  await interact(page.locator('#floatingActions'));assert.equal(await page.locator('#fabEndTurn').isEnabled(),true);
  await interact(page.locator('#fabEndTurn'));
  assert.equal(await page.locator('#passScreen').isVisible(),true);
  assert.equal(await page.locator('.floatingDie').count(),0);
  await interact(page.locator('[onclick="confirmPass()"]'));
  await page.evaluate(()=>{if(game.crossPending){game.crossPending=false;game.crossResolved=true;hide();}paint();});
  await interact(page.locator('#floatingDice .floatingDie').nth(1));
  assert.equal(await page.evaluate(()=>picked),1);
  assert.deepEqual((await state()).dice,[1,2,4]);assert.deepEqual((await state()).botDice,[2,5,6]);
  record.trace.push({event:'pase-j2-y-selecciona-segundo',state:await state()});
  // Extremo de presentación: hasta16dados es posible con15supervivientes y un compañero.
  await page.evaluate(()=>{game.turn='human';game.dice=Array.from({length:16},(_,i)=>i%6+1);picked=0;paint();});
  if(viewport.height<=520){await page.mouse.move(5,5);await page.mouse.wheel(0,2000);await page.waitForTimeout(150);}
  await measure('dieciseis-dados');
  const pool=await page.evaluate(()=>[...game.dice]);
  for(let i=0;i<16;i++){
   await interact(page.locator('#floatingDice .floatingDie').nth(i));
   assert.equal(await page.evaluate(()=>picked),i);assert.deepEqual(await page.evaluate(()=>game.dice),pool);
  }
  await interact(page.locator('#floatingActions'));await measure('menu-dieciseis',{menu:true});
  for(const button of await page.locator('#fabMenu button').all()){
   await button.scrollIntoViewIfNeeded();
   const hit=await button.evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('#fabMenu button')===el;});
   check(hit,viewport.width+': entrada menú inaccesible con16dados');
  }
  await interact(page.locator('#floatingActions'));
  record.boardVisited=[];
  for(let i=0;i<7;i++){
   await interact(page.locator('.sitehead').nth(i));
   assert.equal(await page.evaluate(()=>target),i);record.boardVisited.push(i);
  }
  await page.evaluate(()=>{game.dice=[];paintDice();});assert.equal(await page.locator('.floatingDie').count(),0);
  assert.equal(await page.locator('#floatingDice').isVisible(),false);
  await page.evaluate(()=>{game.dice=[6];game.ended=true;paintDice();});assert.equal(await page.locator('.floatingDie').count(),0);
  record.trace.push({event:'gastados-y-fin-no-reaparecen',remaining:await page.evaluate(()=>game.dice)});
  await context.close();
 }
 check(evidence.errors.length===0,'excepciones JavaScript');
}catch(error){evidence.failures.push(error.stack||String(error));}
finally{
 await browser.close();await writeFile(output+'/resultados.json',JSON.stringify(evidence,null,2)+'\n');
 console.log(JSON.stringify({output,viewports:evidence.viewports.length,errors:evidence.errors,failures:evidence.failures},null,2));
 if(evidence.failures.length)process.exitCode=1;
}
