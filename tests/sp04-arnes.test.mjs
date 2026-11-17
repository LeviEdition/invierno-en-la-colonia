import test from 'node:test';import assert from 'node:assert/strict';
import {jugarPartida} from '../lab/sp04/partida.mjs';
import {crearMotor} from '../lab/sp04/motor-laboratorio.mjs';
import {semillaC14} from '../lab/sp04/azar.mjs';
import {runGame} from '../test-support/run-game.mjs';
const resumen=r=>({resultado:r.resultado,ronda:r.rondaFin,moral:r.moralFin,comida:r.comidaFin,muestras:r.muestrasFin,muertes:r.muertes.map(m=>m.nombre+'@'+m.ronda),azar:r.llamadasAzar,traza:r.traza});
test('SP-04 | misma semilla y misma configuración: partida idéntica',async()=>{
 for(const cfg of [{variante:'dos-grupos',politica:'cooperativa'},{variante:'un-grupo',politica:'ia-referencia',escenario:'B'},{variante:'un-grupo',politica:'objetivo',escenario:'E2',dados:'doble',crisis:3,comida:'estricta',zombis:'doble'}]){
  const a=await jugarPartida({semilla:20261116,...cfg}),b=await jugarPartida({semilla:20261116,...cfg});
  assert.equal(a.completa,true,JSON.stringify(cfg)+' '+a.error);assert.deepEqual(resumen(a),resumen(b),JSON.stringify(cfg));
  const otra=await jugarPartida({semilla:20261117,...cfg});assert.notDeepEqual(resumen(a).traza,resumen(otra).traza,'otra semilla cambia la partida');
 }
});
test('SP-04 | línea base de dos grupos: coincide con runGame (C14) partida por partida',{timeout:120000},async()=>{
 for(let i=1;i<=6;i++){
  const semilla=semillaC14(i),referencia=await runGame({mode:'ai',seed:semilla}),lab=await jugarPartida({semilla,variante:'dos-grupos',politica:'cooperativa'});
  const etiqueta='semilla '+semilla;
  assert.equal(referencia.completed,true,etiqueta);assert.equal(lab.completa,true,etiqueta+' '+lab.error);
  assert.equal(lab.resultado,referencia.final.result,etiqueta);
  assert.equal(lab.rondaFin,Math.min(referencia.final.round,referencia.final.max),etiqueta);
  assert.deepEqual({moral:lab.moralFin,comida:lab.comidaFin,muestras:lab.muestrasFin},{moral:referencia.final.morale,comida:referencia.final.food,muestras:referencia.final.samples},etiqueta);
  assert.deepEqual(lab.muertes.map(m=>m.nombre+'@'+m.ronda),referencia.events.deaths.map(m=>m.name+'@'+m.round),etiqueta);
  assert.deepEqual(lab.traza.filter(t=>!t.startsWith('— ronda')),referencia.trace.map(t=>t.command),etiqueta+': misma secuencia de comandos');
 }
});
test('SP-04 | un grupo: sin segundo bando, dados y crisis según la configuración, turno de IA inerte',async()=>{
 const {engine,c}=crearMotor({semilla:5,variante:'un-grupo'});engine.start('ai');
 assert.deepEqual(c.game.bots,[]);assert.deepEqual(c.game.botDice,[]);assert.equal(c.game.dice.length,4,'V9.9: 1 + 3 vivos');assert.equal(c.game.crisis.need,2);
 assert.equal(c.gameOutcome(c.game),null,'sin bots la partida sigue');
 const doble=crearMotor({semilla:5,variante:'un-grupo',dados:'doble',crisis:3});doble.engine.start('ai');
 assert.equal(doble.c.game.dice.length,6);assert.equal(doble.c.game.crisis.need,3);
 // Cerrar el turno sin actuar: la IA no gasta azar ni cambia el estado fuera de la colonia.
 const antes=c.azar;const llamadas=crearMotor({semilla:5,variante:'un-grupo'});llamadas.engine.start('ai');const n0=llamadas.azar.llamadas();
 await llamadas.c.finishTurn();
 assert.equal(llamadas.c.game.round,2);assert.deepEqual(llamadas.c.game.bots,[]);assert.ok(llamadas.azar.llamadas()>n0,'la colonia y la ronda nueva sí tiran dados');
 assert.throws(()=>crearMotor({semilla:1,variante:'dos-grupos',dados:'doble'}),/línea base/);
});
test('SP-04 | escenarios: un solo cambio por vez sobre el mismo estado inicial',async()=>{
 const base=await jugarPartida({semilla:9,escenario:'A',maxPasos:1});
 for(const [nombre,vivos] of [['A',3],['B',2],['C',2],['D',2],['E1',4],['E2',5]]){
  const r=await jugarPartida({semilla:9,escenario:nombre,maxPasos:1});
  assert.equal(r.inicial.vivos,vivos,nombre);assert.equal(r.inicial.objetivo,base.inicial.objetivo,nombre+': mismo objetivo sorteado');
 }
});
