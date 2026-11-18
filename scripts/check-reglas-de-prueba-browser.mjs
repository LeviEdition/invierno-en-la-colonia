// Reglas de prueba (docs/116): activar «La noche» desde el panel de desarrollo en
// modo contra la IA, terminar una ronda con alguien afuera y verificar el aviso
// nocturno. Batería corta: no cubre el mapa, solo el motor y su pantalla.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gamePage} from '../test-support/browser-game-page.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.GAME_URL||'http://127.0.0.1:8765/dist/invierno-test.html';
const output=process.env.REGLAS_OUTPUT_DIR||'/tmp/reglas-de-prueba';await mkdir(output,{recursive:true});
const html=await (await fetch(url)).text();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
// .45 cae en la cara 6 del D12 (herida): efecto visible y no mortal.
const RANDOM=.45;
const evidence={htmlSha256:createHash('sha256').update(html).digest('hex'),chromium:browser.version(),
 scope:'panel ?dev=1, comida inicial 8, La noche en modo contra la IA, una ronda con alguien afuera',records:[],errors:[]};
try{
 for(const viewport of [{width:1365,height:768},{width:393,height:852}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  await context.addInitScript(value=>{Math.random=()=>value;},RANDOM);
  const page=await context.newPage();const api=gamePage(page);
  page.on('pageerror',error=>evidence.errors.push(viewport.width+': '+error.message));
  const record={viewport};evidence.records.push(record);

  // Sin ?dev el panel no existe para el jugador.
  await page.goto(url);
  record.panelSinDev=await page.locator('#testRules').isVisible();
  assert.equal(record.panelSinDev,false,'sin ?dev el panel queda oculto');

  // Con ?dev el panel aparece en la pantalla de partida nueva.
  await page.goto(url+'?dev=1');
  await page.locator('#setupScreen').waitFor({state:'visible'});
  record.panelConDev=await page.locator('#testRules').isVisible();
  assert.equal(record.panelConDev,true,'con ?dev el panel está disponible al crear la partida');
  await page.locator('#testRules summary').click();

  // Elegir las reglas desde los controles reales del panel.
  await page.selectOption('#testRulesFood','8');
  await page.locator('#testRulesNight').check();
  record.reglasElegidas=await api.evaluate(()=>({...testRules}));
  assert.deepEqual(record.reglasElegidas,{comidaInicial:8,laNoche:true,regreso:false,crisisParcial:false});
  await page.screenshot({path:output+'/panel-'+viewport.width+'.png'});

  // Empezar en modo contra la IA.
  await page.locator('#setupScreen button').filter({hasText:'1 JUGADOR + IA'}).click();
  await page.locator('#setupScreen').waitFor({state:'hidden'});
  record.inicio=await api.evaluate(()=>({mode:game.mode,food:game.food,round:game.round,registro:{...game.testRules},
   aviso:game.log.some(line=>/Reglas de prueba/.test(line))}));
  assert.equal(record.inicio.mode,'ai');
  assert.equal(record.inicio.food,8,'la comida inicial elegida llega al tablero');
  assert.deepEqual(record.inicio.registro,{comidaInicial:8,laNoche:true,regreso:false,crisisParcial:false});
  assert.equal(record.inicio.aviso,true,'las reglas elegidas quedan en el registro de la partida');

  // Preparar una ronda tranquila con una sola localidad exterior ocupada.
  record.preparacion=await api.evaluate(()=>{
   game.crossPending=false;game.crossResolved=true;
   game.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});game.waste=0;
   game.crisis.contributions=Array(game.crisis.need).fill(game.crisis.type);game.crisis.given=game.crisis.need;
   game.humans.forEach(p=>{p.loc=0;p.wounds=0;p.frost=0;p.moved=false;});
   game.bots.forEach(p=>{p.loc=0;p.wounds=0;p.frost=0;p.moved=false;});
   // Los dos de menor influencia salen juntos: uno solo recibe la tirada.
   const fuera=[...game.humans].sort((a,b)=>a.influence-b.influence).slice(0,2);
   fuera.forEach(p=>{p.loc=2;});
   const centinela=fuera.slice().sort((a,b)=>a.influence-b.influence)[0];
   return {fuera:fuera.map(p=>p.name),centinela:centinela.name,
    vigilancia:nightWatch().map(e=>({loc:e.loc,name:e.watcher.name})),noche:nightEnabled()};
  });
  assert.equal(record.preparacion.noche,true);
  assert.deepEqual(record.preparacion.vigilancia,[{loc:2,name:record.preparacion.centinela}],
   'una sola tirada por localidad, al de menor influencia');

  // La ficha rotula quién duerme afuera y quién hace la guardia.
  record.ficha=await api.evaluate(()=>{
   const leer=name=>{
    selected=controls.group().findIndex(p=>p.name===name);
    show('actions');const texto=document.getElementById('modalContent').textContent;hide();
    return texto;
   };
   return {centinela:leer(game.humans.find(p=>p.loc===2&&nightWatch().some(e=>e.watcher.id===p.id)).name),
    acompanante:leer(game.humans.filter(p=>p.loc===2&&!nightWatch().some(e=>e.watcher.id===p.id))[0].name),
    enCasa:leer(game.humans.find(p=>p.loc===0).name)};
  });
  assert.match(record.ficha.centinela,/hace guardia esta noche/,'el centinela se rotula en su ficha');
  assert.match(record.ficha.acompanante,/dormirá afuera/,'el acompañante solo duerme afuera');
  assert.doesNotMatch(record.ficha.enCasa,/dormirá afuera|hace guardia/,'en la colonia no hay rótulo nocturno');
  await page.screenshot({path:output+'/ficha-'+viewport.width+'.png'});

  // Terminar la ronda: la noche cierra la fase de colonia.
  await api.evaluate(()=>{game.log=[];finishTurn();skipAutomation();});
  await api.waitForFunction(()=>game.round>1||game.ended,undefined,{timeout:60000});
  record.noche=await api.evaluate(()=>({round:game.round,ended:game.ended,
   avisoNoche:game.log.filter(line=>/La noche:/.test(line)),
   tiradas:game.log.filter(line=>/la noche en/.test(line)),
   heridas:game.humans.map(p=>({name:p.name,wounds:p.wounds,frost:p.frost,dead:p.dead}))}));
  assert.equal(record.noche.avisoNoche.length,1,'la noche se anuncia una vez por ronda');
  assert.equal(record.noche.tiradas.length,1,'una tirada: una sola localidad exterior ocupada');
  assert.match(record.noche.tiradas[0],/Exposición de .* \(la noche en Hospital\)/);
  assert.match(record.noche.tiradas[0],/HERIDA/,'la cara 6 del D12 es herida');
  const centinela=record.noche.heridas.find(p=>p.name===record.preparacion.centinela);
  assert.equal(centinela.wounds,1,'la herida recae en el centinela');
  const acompanante=record.noche.heridas.find(p=>p.name!==record.preparacion.centinela&&record.preparacion.fuera.includes(p.name));
  assert.equal(acompanante.wounds,0,'el acompañante no recibe tirada propia');
  await page.screenshot({path:output+'/noche-'+viewport.width+'.png'});
  await context.close();console.log('reglas-de-prueba',viewport.width,'ok');
 }
 assert.deepEqual(evidence.errors,[],'sin errores de página');
 evidence.passed=true;
}catch(error){evidence.error=error.stack;throw error;}
finally{await writeFile(output+'/auditoria.json',JSON.stringify(evidence,null,2));await browser.close();}
console.log(JSON.stringify({passed:evidence.passed,output}));
