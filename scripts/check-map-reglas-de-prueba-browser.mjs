// Reglas de prueba en el mapa (docs/117): partida nueva con ?dev en modo «un
// grupo» con «La noche» y «Regresar a la colonia» activos, terminar una ronda
// con alguien afuera y ver el aviso nocturno; usar «Regresar» y comprobar que
// después no puede moverse. Batería corta: dos tamaños, sin vídeo.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {actionMapChecks} from '../test-support/h344-browser-checks.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.MAP_REGLAS_DIR||'/tmp/map-reglas-de-prueba';
const origin=process.env.H344_ORIGIN||'http://127.0.0.1:8779';
const modulePath=process.env.H344_MODULE_PATH||'/dist/mapa-qa/map.mjs';
const t=actionMapChecks({origin,modulePath});
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
// .45 cae en la cara 6 del D12 (herida): efecto visible y no mortal.
const NIGHT_RANDOM=.45;
const report={scope:'?dev, modo un grupo, La noche y Regresar en el mapa',viewports:[],errors:[]};
let p;
try{
 for(const [width,height,dpr] of (process.env.MAP_REGLAS_VIEWPORTS||'852x393x2,1365x768x1').split(',').map(v=>v.split('x').map(Number))){
  const ctx=await browser.newContext({viewport:{width,height},hasTouch:width<950,isMobile:width<950,deviceScaleFactor:dpr});
  const dir=out+'/'+width+'x'+height;await mkdir(dir,{recursive:true});
  await t.instrument(ctx);p=await ctx.newPage();p.setDefaultTimeout(20000);
  p.on('pageerror',error=>report.errors.push(width+': '+error.message));
  const row={viewport:{width,height,dpr}};report.viewports.push(row);

  // Sin ?dev el mapa es idéntico a hoy: no hay modo «un grupo» ni reglas.
  await p.goto(origin+modulePath.replace(/\/map\.mjs$/,'/index.html'));
  await p.evaluate(async path=>window.h344Viewer=await import(path),modulePath);
  await p.waitForFunction(()=>window.h344Viewer.inspect().projection?.blocked==='setup');
  // La proyección llega antes que el diálogo: contar cuando la preparación ya se dibujó.
  await p.locator('#play-dialog').waitFor({state:'visible'});
  await p.locator('#play-start-local').waitFor({state:'visible'});
  row.sinDev={solo:await p.locator('#play-start-solo').count(),reglas:await p.locator('#play-test-rules').count(),
   modos:await p.locator('#play-start-local, #play-start-ai').count()};
  assert.deepEqual(row.sinDev,{solo:0,reglas:0,modos:2},'sin ?dev el mapa no ofrece nada nuevo');

  // Con ?dev aparecen el modo y las cuatro reglas.
  await p.goto(origin+modulePath.replace(/\/map\.mjs$/,'/index.html')+'?dev=1');
  await p.evaluate(async path=>window.h344Viewer=await import(path),modulePath);
  await p.waitForFunction(()=>window.h344Viewer.inspect().projection?.blocked==='setup');
  await p.locator('#play-test-rules').waitFor({state:'visible'});
  row.conDev={solo:await p.locator('#play-start-solo').count(),
   comida:await p.locator('#play-rule-food-6, #play-rule-food-8, #play-rule-food-10').count(),
   noche:await p.locator('#play-rule-laNoche').count(),regreso:await p.locator('#play-rule-regreso').count(),
   parcial:await p.locator('#play-rule-crisisParcial').count()};
  assert.deepEqual(row.conDev,{solo:1,comida:3,noche:1,regreso:1,parcial:1},'con ?dev están el modo y las cuatro reglas');
  // Mínimo táctil de 44px en los controles nuevos.
  row.alturas=await p.evaluate(()=>[...document.querySelectorAll('#play-test-rules button, #play-start-solo')]
   .map(b=>({id:b.id,height:Math.round(b.getBoundingClientRect().height)})));
  for(const control of row.alturas)assert.ok(control.height>=44,control.id+' mide '+control.height+'px');
  await p.screenshot({path:dir+'/preparacion.png'});

  // Activar La noche y Regresar, y empezar en «un grupo».
  await p.locator('#play-rule-laNoche').click();await t.frames(p);
  await p.locator('#play-rule-regreso').click();await t.frames(p);
  row.elegidas=await p.evaluate(()=>window.h344Viewer.inspect().projection.play.preparation.testRules);
  assert.deepEqual(row.elegidas,{comidaInicial:6,laNoche:true,regreso:true,crisisParcial:false});
  await p.locator('#play-start-solo').click();await t.settle(p);await t.openMap(p);
  row.inicio=await p.evaluate(()=>{const s=window.h344Viewer.inspect().projection;
   return {mode:s.mode,players:s.players.map(x=>x.id),labels:s.players.map(x=>x.label),personajes:s.characters.length};});
  assert.deepEqual(row.inicio.players,['human'],'no hay bando de la IA');
  assert.deepEqual(row.inicio.labels,['Tu grupo'],'el rótulo no menciona a la IA');
  assert.equal(row.inicio.mode,'solo');
  assert.equal(row.inicio.personajes,3);

  // Preparar una ronda tranquila con dos supervivientes en una localidad exterior.
  const g=await t.raw(p);g.crossPending=false;g.crossResolved=true;g.food=40;g.waste=0;
  g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});
  g.crisis.contributions=Array(g.crisis.need).fill(g.crisis.type);g.crisis.given=g.crisis.need;
  g.humans.forEach(h=>{h.loc=0;h.wounds=0;h.frost=0;h.dead=false;h.moved=false;h.equipment=[];});
  const outside=[...g.humans].sort((a,b)=>a.influence-b.influence).slice(0,2);
  for(const h of outside)h.loc=2;
  const watcher=outside.slice().sort((a,b)=>a.influence-b.influence)[0];
  await t.host(p).evaluate(state=>h344Test.fixture(state),g);await t.frames(p);await t.panel(p);

  // La ficha rotula quién duerme afuera y quién hace la guardia.
  row.ficha=[];
  for(const h of [watcher,outside.find(x=>x.id!==watcher.id),g.humans.find(x=>x.loc===0)]){
   await p.selectOption('#survivor-select',h.id);await t.frames(p);
   row.ficha.push({id:h.id,texto:(await p.locator('#character-night').textContent()).trim(),
    visible:await p.locator('#character-night').isVisible()});
  }
  assert.match(row.ficha[0].texto,/Hace guardia esta noche/,'el centinela se rotula');
  assert.match(row.ficha[1].texto,/Dormirá afuera/,'el acompañante solo duerme afuera');
  assert.equal(row.ficha[2].visible,false,'en la colonia no hay rótulo nocturno');
  await p.screenshot({path:dir+'/ficha-noche.png'});

  // Regresar a la colonia: cuesta un dado y deja sin movimiento.
  await p.selectOption('#survivor-select',watcher.id);await t.frames(p);
  row.regreso={antes:await p.evaluate(id=>{const s=window.h344Viewer.inspect().projection;
   return {dados:s.dice.available.length,movido:s.characters.find(c=>c.id===id).moved,
    pista:document.querySelector('[data-action-hint="return-home-action"]').textContent,
    alto:Math.round(document.getElementById('return-home-action').getBoundingClientRect().height)};},watcher.id)};
  assert.ok(row.regreso.antes.alto>=44,'el botón mide '+row.regreso.antes.alto+'px');
  assert.match(row.regreso.antes.pista,/cuenta como movimiento/);
  const rngBefore=await t.rng(p);
  await p.locator('#return-home-action').click();
  await p.locator('#play-confirm').waitFor();
  const dice=p.locator('[id^=play-die-]:enabled');
  if(await dice.count())await dice.first().click();
  await p.locator('#play-confirm').click();await t.settle(p);await t.frames(p);
  row.regreso.despues=await p.evaluate(id=>{const s=window.h344Viewer.inspect().projection;
   const c=s.characters.find(x=>x.id===id);
   return {locationId:c.locationId,movido:c.moved,dados:s.dice.available.length,
    moverPermitido:!!s.movement.options[id]?.allowed,moverMotivo:s.movement.options[id]?.reason||null,
    estado:document.getElementById('character-state').textContent};},watcher.id);
  assert.equal(row.regreso.despues.locationId,'place-0','volvió a la colonia');
  assert.equal(row.regreso.despues.movido,true,'cuenta como movimiento');
  assert.equal(row.regreso.despues.dados,row.regreso.antes.dados-1,'gastó un dado');
  assert.equal(row.regreso.despues.moverPermitido,false,'ya no puede moverse');
  assert.equal(row.regreso.despues.moverMotivo,'already-moved');
  assert.match(row.regreso.despues.estado,/Ya se movió/,'la ficha lo dice');
  assert.equal(await t.rng(p),rngBefore,'regresar no tira exposición ni consume azar');
  await p.screenshot({path:dir+'/regreso.png'});

  // Terminar la ronda con alguien afuera: el aviso nocturno aparece.
  const board=await t.raw(p);board.humans.find(h=>h.id!==watcher.id&&h.loc===2);
  await t.host(p).evaluate(value=>window.h344RandomValue=value,NIGHT_RANDOM);
  await p.locator('#finish-turn').click();
  await p.locator('#cycle-confirm').waitFor();
  await p.locator('#cycle-confirm').evaluate(b=>{b.click();b.click();});
  await t.settle(p);await t.frames(p);
  row.noche=await p.evaluate(()=>{const s=window.h344Viewer.inspect().projection;
   return {round:s.round,log:s.log.slice(0,14),
    noche:s.log.filter(line=>/La noche:/.test(line)),
    tiradas:s.log.filter(line=>/la noche en/.test(line))};});
  assert.equal(row.noche.noche.length,1,'la noche se anuncia una vez');
  assert.equal(row.noche.tiradas.length,1,'una tirada: una sola localidad exterior ocupada');
  assert.match(row.noche.tiradas[0],/la noche en Hospital/);
  assert.match(row.noche.tiradas[0],/HERIDA/,'la cara 6 del D12 es herida');
  assert.equal(row.noche.round,2,'la ronda siguiente abrió después de la noche');
  await p.screenshot({path:dir+'/aviso-nocturno.png'});
  await ctx.close();console.log('map-reglas-de-prueba',width,height,'ok');
 }
 assert.deepEqual(report.errors,[],'sin errores de página');
 report.passed=true;
}catch(error){report.error=error.stack;if(p&&!p.isClosed()){try{report.last=await t.api(p);}catch{}await p.screenshot({path:out+'/fallo.png'});}throw error;}
finally{await writeFile(out+'/auditoria.json',JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify({passed:report.passed,out}));
