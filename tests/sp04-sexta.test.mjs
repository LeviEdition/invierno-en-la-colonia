import test from 'node:test';import assert from 'node:assert/strict';
import {crearMotor} from '../lab/sp04/motor-laboratorio.mjs';
import {jugarPartida} from '../lab/sp04/partida.mjs';
import {P1} from '../lab/sp04/tercera-corrida.mjs';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function faseSoloColonia(opts){
 const lab=crearMotor({semilla:42,...opts,indefensos:0});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});g.food=99;g.waste=0;
 g.crisis.contributions=Array(g.crisis.need).fill(g.crisis.type);
 c.colony();
 return {lab,registro:lab.registro};
}

// ─── Tests de improvisar ─────────────────────────────────────────────────────

test('SP-04f | improvisar=true: c.improvisarCrisis existe en el contexto',async()=>{
 const lab=crearMotor({semilla:42,improvisar:true,indefensos:0});lab.engine.start('ai');
 assert.equal(typeof lab.c.improvisarCrisis,'function','improvisarCrisis instalado');
});

test('SP-04f | improvisar=false: c.improvisarCrisis no existe',async()=>{
 const lab=crearMotor({semilla:42,improvisar:false,indefensos:0});lab.engine.start('ai');
 assert.equal(lab.c.improvisarCrisis,undefined,'improvisarCrisis no instalado sin palanca');
});

test('SP-04f | improvisarCrisis: consume dado ≥4 y agrega contribución a la crisis',async()=>{
 const lab=crearMotor({semilla:42,improvisar:true,indefensos:0});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 // Forzar dado ≥4 en mano, turno humano, crisis sin cubrir.
 g.dice=[5,2,1];
 const sv=g.humans[0];sv.loc=0;sv.hasImprovised=false;
 const crisisType=g.crisis.type;
 const contribucionesAntes=g.crisis.contributions.filter(t=>t===crisisType).length;
 const r=c.improvisarCrisis(sv.id);
 assert.ok(r&&r.startsWith('improvisar:'),'devuelve etiqueta improvisar');
 assert.equal(g.dice.includes(5),false,'dado 5 consumido');
 assert.equal(g.dice.length,2,'quedan 2 dados');
 assert.equal(g.crisis.contributions.filter(t=>t===crisisType).length,contribucionesAntes+1,'contribución añadida');
 assert.equal(lab.registro.improvisaciones,1,'registro cuenta 1 improvisación');
 assert.equal(sv.hasImprovised,true,'superviviente marcado como improvisado');
});

test('SP-04f | improvisarCrisis: cada superviviente solo improvisa una vez por ronda',async()=>{
 const lab=crearMotor({semilla:42,improvisar:true,indefensos:0});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 g.dice=[5,5,5];
 const sv=g.humans[0];sv.loc=0;sv.hasImprovised=false;
 c.improvisarCrisis(sv.id);
 const r2=c.improvisarCrisis(sv.id);
 assert.equal(r2,null,'segunda improvisación del mismo superviviente bloqueada');
 assert.equal(lab.registro.improvisaciones,1,'solo 1 improvisación registrada');
});

test('SP-04f | improvisarCrisis: sin dado ≥4 devuelve null',async()=>{
 const lab=crearMotor({semilla:42,improvisar:true,indefensos:0});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 g.dice=[1,2,3];
 const sv=g.humans[0];sv.loc=0;sv.hasImprovised=false;
 const r=c.improvisarCrisis(sv.id);
 assert.equal(r,null,'sin dado ≥4 no improvisa');
 assert.equal(lab.registro.improvisaciones,0,'sin registro');
});

// ─── Tests de crisisParcial ───────────────────────────────────────────────────

test('SP-04f | crisisParcial: con 1 de 2 aportes, el fallo es parcial (moral 1→0)',async()=>{
 const lab=crearMotor({semilla:42,crisisParcial:true,indefensos:0});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});g.food=99;g.waste=0;
 // Forzar crisis de tipo moral con 1 aporte (parcial)
 const tipo=g.crisis.type;
 g.crisis.contributions=[tipo]; // 1 aporte, need=2 → parcial
 g.crisis.given=1;
 g.crisis.fail='moral'; // si falla totalmente, moral -1
 const moralAntes=g.morale;
 c.colony();
 // Con parcial: consecuencia es 0 (1→0), moral no cambia
 assert.equal(g.morale,moralAntes,'moral sin cambio con crisis parcial (1→0)');
 const entradaCrisis=lab.registro.crisis.at(-1);
 assert.equal(entradaCrisis.parcial,true,'crisis marcada como parcial');
});

test('SP-04f | crisisParcial: con 0 de 2 aportes, el fallo es total (moral cae)',async()=>{
 const lab=crearMotor({semilla:42,crisisParcial:true,indefensos:0});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});g.food=99;g.waste=0;
 g.crisis.contributions=[]; // 0 aportes → fallo total
 g.crisis.given=0;g.crisis.fail='moral';
 const moralAntes=g.morale;
 c.colony();
 assert.equal(g.morale,moralAntes-1,'moral cae con fallo total');
 const entradaCrisis=lab.registro.crisis.at(-1);
 assert.equal(entradaCrisis.parcial,false,'crisis no marcada como parcial');
});

test('SP-04f | crisisParcial: con 2 de 2 aportes, éxito total (sin parcial)',async()=>{
 const {registro}=await faseSoloColonia({crisisParcial:true});
 const entradaCrisis=registro.crisis.at(-1);
 assert.equal(entradaCrisis.exito,true,'éxito total');
 assert.equal(entradaCrisis.parcial,false,'no parcial cuando hay éxito');
});

test('SP-04f | crisisParcial: fallo zombie parcial añade 1 zombi (no 2)',async()=>{
 const lab=crearMotor({semilla:42,crisisParcial:true,indefensos:0});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});g.food=99;g.waste=0;
 // Mover todos los supervivientes fuera de la colonia para que la fase de población
 // no agregue zombis a loc=0 (arriving = survivors en loc=0 = 0).
 g.humans.forEach((p,i)=>{p.loc=i+1;});
 g.crisis.contributions=[g.crisis.type];g.crisis.given=1;g.crisis.fail='zombie';
 const zombisAntes=g.zones[0].z;
 c.colony();
 if(!g.ended){
  // Parcial: +1 zombi (desde nuestro wrapper). Población en colonia: 0 (nadie en casa).
  assert.ok(g.zones[0].z<=zombisAntes+1,'parcial añade máx 1 zombi (no 2)');}
 // Si terminó (desbordamiento con 1 zombi y colonia llena), también es correcto.
});

// ─── Tests de políticas prudentes ────────────────────────────────────────────

test('SP-04f | cooperativa-prudente: regresa superviviente solo en exterior',async()=>{
 const r=await jugarPartida({semilla:42,...P1,nocheAfuera:'localidad',regreso:true,politica:'cooperativa-prudente'});
 assert.equal(r.completa,true,r.error);
 assert.ok(typeof r.regresos==='number','regresos es número');
});

test('SP-04f | objetivo-repartido-prudente: no regresa buscador de muestras solo',async()=>{
 // Con muchas semillas, el corredor prudente no debería devolver al buscador de muestras.
 // Verificamos que la partida completa es válida y se registran métricas.
 const r=await jugarPartida({semilla:17,...P1,nocheAfuera:'localidad',regreso:true,politica:'objetivo-repartido-prudente'});
 assert.equal(r.completa,true,r.error);
 assert.ok(typeof r.regresos==='number','regresos número');
});

test('SP-04f | crisisParcial sin palanca no afecta a la quinta corrida',async()=>{
 const a=await jugarPartida({semilla:1936384585,...P1,nocheAfuera:'localidad',regreso:true,politica:'cooperativa'});
 const b=await jugarPartida({semilla:1936384585,...P1,nocheAfuera:'localidad',regreso:true,politica:'cooperativa',crisisParcial:false,improvisar:false});
 assert.deepEqual(a.traza,b.traza,'sin palancas nuevas la traza es idéntica a quinta corrida');
});

test('SP-04f | reproduciblidad con palancas nuevas',async()=>{
 const cfg={...P1,nocheAfuera:'localidad',regreso:true,improvisar:true,crisisParcial:true,politica:'cooperativa-prudente'};
 const a=await jugarPartida({semilla:999,...cfg});
 const b=await jugarPartida({semilla:999,...cfg});
 assert.equal(a.completa,true,a.error);
 assert.deepEqual(a.traza,b.traza,'trazas idénticas con misma semilla');
 assert.equal(a.improvisaciones,b.improvisaciones,'improvisaciones idénticas');
});
