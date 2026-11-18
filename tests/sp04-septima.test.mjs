import test from 'node:test';import assert from 'node:assert/strict';
import {crearMotor} from '../lab/sp04/motor-laboratorio.mjs';
import {jugarPartida} from '../lab/sp04/partida.mjs';
import {crearPolitica} from '../lab/sp04/politicas.mjs';
import {P1} from '../lab/sp04/tercera-corrida.mjs';

// ─── Helpers ────────────────────────────────────────────────────────────────

function motorEnColonia(opts){
 const lab=crearMotor({semilla:42,...opts,indefensos:0});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});g.food=99;g.waste=0;
 return lab;
}

// ─── Bug 1: reserva no bloquea aportar a la crisis ──────────────────────────

test('SP-04g | bug1-fix: cooperativa-prudente aporta la última carta de crisis aunque reserva activa',async()=>{
 const lab=crearMotor({semilla:42,indefensos:0});lab.engine.start('ai');
 const {c,registro}=lab,g=c.game;
 // Forzar mano con exactamente 1 carta del tipo de crisis y ninguna otra de ese tipo.
 // Usar un tipo diferente del default para evitar colisiones.
 g.crisis.type='medicina';g.crisis.need=1;g.crisis.given=0;g.crisis.contributions=[];
 // Colocar exactamente 1 carta de medicina en la mano (la última).
 const idxMedicina=g.items.findIndex(it=>c.kind(it)==='medicina');
 const otherItems=g.items.filter(it=>c.kind(it)!=='medicina');
 // Dejar solo 1 medicina y otras cartas
 g.items=[...otherItems.slice(0,2),g.items[idxMedicina]];
 const medicineIdx=g.items.length-1;
 // La reserva diría: hay 1 carta de medicina → bloqueado; pero ahora debe poder aportar
 const politica=crearPolitica('cooperativa-prudente');
 // Acción: debe aportar la medicina a pesar de que es la última
 let aportó=false;
 for(let i=0;i<30&&!g.ended&&!aportó;i++){
  politica.decidir(c);
  const a=politica.actuar(c,registro);
  if(a&&a.startsWith('aportar-crisis')){aportó=true;}
  else if(a==='terminar-turno')break;
 }
 assert.ok(aportó,'la política aporta la última carta de medicina a la crisis');
});

test('SP-04g | bug1-fix: objetivo-repartido-prudente aporta la última carta de crisis',async()=>{
 // Partida completa: verificar que se producen aportaciones (el bug las bloqueaba cuando era la última carta)
 const r=await jugarPartida({semilla:42,...P1,nocheAfuera:'localidad',regreso:true,comidaInicial:10,politica:'objetivo-repartido-prudente'});
 assert.equal(r.completa,true,r.error);
 const aportaciones=r.traza.filter(a=>a.startsWith('aportar-crisis'));
 assert.ok(aportaciones.length>0,'se producen aportaciones en la partida');
});

// ─── Bug 2: improvisar se evalúa antes de buscar/atacar ─────────────────────

test('SP-04g | bug2-fix: improvisar umbral 4 dispara antes de buscar/atacar',async()=>{
 // Con improvisar=true, umbral=4 y sin cartas de crisis en mano, improvisar ocurre
 // antes que buscar o atacar cuando hay dado ≥4 disponible.
 const lab=crearMotor({semilla:42,improvisar:true,improvisarUmbral:4,indefensos:0});lab.engine.start('ai');
 const {c,registro}=lab,g=c.game;
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});g.food=99;g.waste=0;
 // Forzar dado ≥4 en mano, crisis no cubierta, sin cartas de ese tipo en mano
 g.dice=[5,2];
 const sv=g.humans[0];sv.loc=0;sv.hasImprovised=false;
 // Limpiar mano para que no haya cartas del tipo de crisis
 const crisisType=g.crisis.type;
 g.items=g.items.filter(it=>c.kind(it)!==crisisType);
 const politica=crearPolitica('cooperativa-prudente',{regreso:false});
 let improv=false,buscoAntes=false;
 for(let i=0;i<20&&!g.ended&&!improv;i++){
  if(politica.decidir(c))continue;
  const a=politica.actuar(c,registro);
  if(!a||a==='terminar-turno')break;
  if(a.startsWith('buscar')||a.startsWith('atacar'))buscoAntes=true;
  if(a.startsWith('improvisar')){improv=true;break;}
 }
 assert.ok(improv,'improvisar disparó');
 assert.ok(!buscoAntes,'improvisar ocurrió antes de buscar/atacar');
});

test('SP-04g | umbral 3 dispara más veces que umbral 4 en condiciones sin cartas crisis',async()=>{
 // Umbral 3: dados 3,4,5,6 pueden improvisar. Umbral 4: solo 4,5,6.
 // Con la misma semilla, umbral 3 debería disparar más o igual.
 const cfg={...P1,nocheAfuera:'localidad',regreso:true,comidaInicial:10,crisisParcial:true,politica:'cooperativa-prudente'};
 const lote=20;
 let imp4=0,imp3=0;
 for(let s=1;s<=lote;s++){
  const r4=await jugarPartida({semilla:s,...cfg,improvisar:true,improvisarUmbral:4});
  const r3=await jugarPartida({semilla:s,...cfg,improvisar:true,improvisarUmbral:3});
  imp4+=r4.improvisaciones;imp3+=r3.improvisaciones;
 }
 assert.ok(imp3>=imp4,'umbral 3 improvisa al menos tanto como umbral 4 ('+imp3+' vs '+imp4+')');
});

// ─── Sin reserva ─────────────────────────────────────────────────────────────

test('SP-04g | cooperativa-prudente-sin-reserva: juega la última carta de cualquier tipo',async()=>{
 const r=await jugarPartida({semilla:99,...P1,nocheAfuera:'localidad',regreso:true,comidaInicial:10,politica:'cooperativa-prudente-sin-reserva'});
 assert.equal(r.completa,true,r.error);
});

test('SP-04g | objetivo-repartido-prudente-sin-reserva: partida válida',async()=>{
 const r=await jugarPartida({semilla:99,...P1,nocheAfuera:'localidad',regreso:true,comidaInicial:10,politica:'objetivo-repartido-prudente-sin-reserva'});
 assert.equal(r.completa,true,r.error);
});

// ─── Compatibilidad con corridas anteriores ──────────────────────────────────

test('SP-04g | sin palancas nuevas: resultado idéntico a sexta corrida',async()=>{
 const a=await jugarPartida({semilla:1936384585,...P1,nocheAfuera:'localidad',regreso:true,politica:'cooperativa'});
 const b=await jugarPartida({semilla:1936384585,...P1,nocheAfuera:'localidad',regreso:true,politica:'cooperativa',crisisParcial:false,improvisar:false});
 assert.deepEqual(a.traza,b.traza,'sin palancas nuevas la traza es idéntica');
});

test('SP-04g | improvisarUmbral=4 es el default: traza igual a improvisar sin umbral explícito',async()=>{
 const cfg={...P1,nocheAfuera:'localidad',regreso:true,comidaInicial:10,crisisParcial:true,improvisar:true,politica:'cooperativa-prudente'};
 const a=await jugarPartida({semilla:333,...cfg,improvisarUmbral:4});
 const b=await jugarPartida({semilla:333,...cfg});
 assert.deepEqual(a.traza,b.traza,'umbral 4 explícito = umbral por defecto');
});

test('SP-04g | reproducibilidad con todas las palancas nuevas',async()=>{
 const cfg={...P1,nocheAfuera:'localidad',regreso:true,comidaInicial:10,crisisParcial:true,improvisar:true,improvisarUmbral:3,politica:'cooperativa-prudente'};
 const a=await jugarPartida({semilla:555,...cfg});
 const b=await jugarPartida({semilla:555,...cfg});
 assert.equal(a.completa,true,a.error);
 assert.deepEqual(a.traza,b.traza,'trazas idénticas con misma semilla');
 assert.equal(a.improvisaciones,b.improvisaciones,'improvisaciones idénticas');
});
