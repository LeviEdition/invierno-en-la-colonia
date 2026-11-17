// Muerte durante una acción propia: el botón del resultado lleva siempre a una
// decisión visible y confirmable (fallecimiento, contagio o sucesión) y la partida
// sigue hasta el turno siguiente. Fixtures QA declarados: posición, zombis, dados
// y azar fijo (Math.random=0 → exposición 1 = mordedura).
import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';
import {actionMapChecks} from '../test-support/h344-browser-checks.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),out=process.env.DEATH_DECISIONS_DIR||'/tmp/horizontal-death-decisions',origin=process.env.H344_ORIGIN||'http://127.0.0.1:8779',t=actionMapChecks({origin,modulePath:'/dist/mapa-qa/map.mjs'});
await mkdir(out,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}),report={cases:[]};let page;
const cases=[
 {id:'atacante-solo',actor:'h0',with:[],via:'attack',label:'Ver qué pasó',deaths:['Mara']},
 {id:'contagio',actor:'h0',with:['h2'],via:'attack',bite:'h2',deaths:['Mara','Iris']},
 {id:'muerte-del-lider',actor:'h1',with:[],via:'attack',label:'Ver qué pasó',deaths:['Leo'],successor:'h0'},
 {id:'movimiento',actor:'h0',with:[],via:'move',label:'Ver qué pasó',deaths:['Mara']}
];
async function emptyPanels(p){return p.evaluate(()=>[...document.querySelectorAll('dialog[open]')].filter(d=>!d.querySelector('button:not(:disabled)')).map(d=>d.id));}
async function finishTurn(p){
 await p.waitForFunction(()=>!document.getElementById('finish-turn').disabled);await p.locator('#finish-turn').click();await p.locator('#cycle-confirm').click();
 for(let i=0;i<200;i++){const s=(await t.api(p)).projection;if(s.cycle?.decision?.kind==='handover')break;if(s.cycle?.review&&await p.locator('#cycle-next').isVisible()){await p.locator('#cycle-next').click();continue;}await p.waitForTimeout(50);}
 const s=(await t.api(p)).projection;assert.equal(s.cycle.decision.kind,'handover','pase al grupo siguiente');
 assert.equal(await p.locator('#own-hand-cards li').count(),0,'pase sin mano visible');assert.equal(s.dice.available,null,'pase sin dados');assert.deepEqual(s.play.events,[],'pase sin registro');
 await p.locator('#cycle-pass').click();await p.waitForFunction(()=>h344Viewer.inspect().projection?.turn==='ai'&&!h344Viewer.inspect().projection.cycle?.decision);
}
try{for(const [width,height,dpr]of [[1365,768,1],[393,852,2]])for(const c of cases){
 const touch=width<950,context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:touch,isMobile:touch});await t.instrument(context);page=await context.newPage();page.setDefaultTimeout(20000);
 const dir=out+'/'+width+'x'+height+'/'+c.id;await mkdir(dir,{recursive:true});const record={viewport:{width,height},case:c.id};report.cases.push(record);
 await t.begin(page);await t.openMap(page);
 const g=await t.raw(page);g.crossResolved=true;g.crossPending=false;g.dice=[6,6];g.zones[2].z=2;for(const h of g.humans){h.frost=0;h.wounds=0;h.dead=false;h.equipment=[];h.loc=0;}for(const id of [c.actor,...c.with])g.humans.find(h=>h.id===id).loc=c.via==='move'?0:2;
 await t.host(page).evaluate(g=>h344Test.fixture(g),g);await t.frames(page);await t.panel(page);await page.selectOption('#survivor-select',c.actor);
 assert.equal((await t.raw(page)).leaders.human,'h1','Leo es el líder inicial');
 await t.host(page).evaluate(()=>h344RandomValue=0);
 if(c.via==='attack'){await page.locator('#attack-action').click();await page.locator('[data-action-die]:enabled').first().click();await page.locator('#confirm-action').click();await page.waitForFunction(()=>h344Viewer.inspect().action.phase==='result');
  const name=(await t.raw(page)).humans.find(h=>h.id===c.actor).name;assert.equal(await page.locator('#action-summary').textContent(),name+' eliminó 1 zombi, pero murió por la mordedura.');record.summary=name+' eliminó 1 zombi, pero murió por la mordedura.';
  if(!c.bite){await page.waitForFunction(()=>!document.getElementById('map-notice').hidden);assert.equal(await page.locator('#map-notice').textContent(),name+' eliminó 1 zombi en el Hospital, pero murió por la mordedura.');}
 }else{await page.locator('#move-action').click();await page.locator('#keyboard-destinations').evaluate(e=>e.open=true);await page.selectOption('#move-destination','2');await page.locator('#confirm-move').click();await page.waitForFunction(()=>h344Viewer.inspect().movement.phase==='awaiting-decision');}
 const button=c.via==='attack'?'#action-native':'#resolve-decision';
 // El contagio reclama la atención por sí mismo: el panel de mordedura se abre sin pasar por el botón.
 if(!c.bite){assert.equal(await page.locator(button).textContent(),c.label);record.label=c.label;}
 assert.equal(await page.locator('#finish-turn').isDisabled(),true,'fin de turno bloqueado durante la decisión');
 await page.screenshot({path:dir+'/resultado.png'});
 const before=await t.rng(page),beforeGame=await t.raw(page);
 // Doble activación: la segunda pulsación no puede repetir ni abrir un panel vacío.
 if(!c.bite){await page.locator(button).dblclick();await t.frames(page);assert.deepEqual(await emptyPanels(page),[],'sin paneles vacíos');assert.deepEqual(await t.raw(page),beforeGame,'abrir la decisión no cambia la partida');}
 if(c.bite){
  await page.locator('#play-bite-sacrifice').waitFor({state:'visible'});await page.screenshot({path:dir+'/mordedura.png'});await page.locator('#play-bite-sacrifice').dblclick();
  await page.locator('#play-ack').waitFor({state:'visible'});await page.locator('#play-ack').click();
 }
 await page.locator('#cycle-death').waitFor({state:'visible'});const listed=await page.locator('#cycle-dialog p').allTextContents();for(const n of c.deaths)assert.ok(listed.some(x=>x.startsWith(n+' · ')),'fallecimiento listado: '+n);
 assert.equal(await page.locator('#action-panel').isVisible(),false,'el resultado no tapa la confirmación');
 assert.equal(await page.locator('#round').textContent(),'1','la cabecera conserva los datos públicos durante la confirmación');
 await page.screenshot({path:dir+'/fallecimientos.png'});await page.locator('#cycle-death').dblclick();
 if(c.successor){await page.locator('#cycle-leader-'+c.successor).waitFor({state:'visible'});assert.equal(await page.locator('#cycle-dialog h2').textContent(),'Elegir sucesor');await page.screenshot({path:dir+'/sucesion.png'});await page.locator('#cycle-leader-'+c.successor).dblclick();}
 await page.waitForFunction(()=>{const s=h344Viewer.inspect();return !s.projection.cycle?.decision&&!s.projection.play.managed&&s.action.phase==='idle'&&!document.getElementById('finish-turn').disabled;});
 const after=await t.raw(page);assert.equal(await t.rng(page),before,'confirmar y elegir no consumen azar');
 for(const n of c.deaths)assert.equal([...after.humans,...after.bots].find(h=>h.name===n).dead,true,n+' falleció una sola vez');
 assert.equal([...after.humans].filter(h=>h.dead).length,c.deaths.length,'sin muertes de más');
 if(c.successor)assert.equal(after.leaders.human,c.successor,'sucesión aplicada');
 assert.equal(await page.locator('#cycle-dialog').evaluate(d=>d.open),false);assert.deepEqual(await emptyPanels(page),[]);
 record.finishEnabled=true;await page.screenshot({path:dir+'/partida-sigue.png'});
 await finishTurn(page);record.nextTurn=(await t.api(page)).projection.turn;console.log('death',width,c.id,'ok');
 await context.close();page=null;
}
 await writeFile(out+'/report.json',JSON.stringify(report,null,1));console.log('Muertes durante acciones: OK',report.cases.length);
}catch(error){if(page)await page.screenshot({path:out+'/fallo.png'}).catch(()=>{});throw error;}finally{await browser.close();}
