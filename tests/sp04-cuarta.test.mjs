import test from 'node:test';import assert from 'node:assert/strict';
import {crearMotor} from '../lab/sp04/motor-laboratorio.mjs';
import {jugarPartida} from '../lab/sp04/partida.mjs';
import {llegadasPrevistasColonia} from '../lab/sp04/palancas.mjs';
import {elegirMejorVariante} from '../lab/sp04/cuarta-corrida.mjs';
import {P1} from '../lab/sp04/tercera-corrida.mjs';

// Fase de colonia controlada: crisis cubierta, comida de sobra, sin ruido ni residuos.
function fase(llegadasColonia,{enCasa=0,indefensos=0,zombis=0}={}){
 const lab=crearMotor({semilla:11,llegadasColonia,indefensos});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 g.humans.forEach((p,i)=>{p.loc=i<enCasa?0:i+1;});
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});g.zones[0].z=zombis;g.food=99;g.waste=0;
 g.crisis.contributions=Array(g.crisis.need).fill(g.crisis.type);
 const previstas=llegadasPrevistasColonia(c),antes=g.zones[0].z;
 c.colony();
 return {lab,g,previstas,llegadas:g.zones[0].z-antes};
}

test('SP-04d | regla B: llegadas a la colonia vacía según la variante',()=>{
 for(const [variante,esperadas] of [['v99',0],['min2',2],['min3',3],['fijo3',3]]){
  const r=fase(variante);
  assert.equal(r.llegadas,esperadas,variante);assert.equal(r.previstas,esperadas,variante+': las políticas prevén lo mismo');
  assert.equal(r.lab.registro.llegadasExtraColonia,esperadas,variante);
 }
});

test('SP-04d | regla B: con la colonia llena de gente, mínimo no recorta y fijo 3 sí',()=>{
 // 3 supervivientes y 4 indefensos: V9.9 trae ⌈7/2⌉ = 4.
 for(const [variante,esperadas] of [['v99',4],['min2',4],['min3',4],['fijo3',3]]){
  const r=fase(variante,{enCasa:3,indefensos:4});
  assert.equal(r.llegadas,esperadas,variante);assert.equal(r.previstas,esperadas,variante);
  assert.equal(r.lab.registro.desbordesColonia.length,0,variante+': una llegada salteada no es un desborde');
 }
});

test('SP-04d | regla B: las llegadas extra desbordan con la regla del motor (indefenso −1)',()=>{
 const lab=crearMotor({semilla:11,llegadasColonia:'min3',indefensos:2});lab.engine.start('ai');
 const {c}=lab,g=c.game;g.humans.forEach((p,i)=>{p.loc=i+1;});
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});g.zones[0].z=c.zcap[0];g.food=99;g.waste=0;
 g.crisis.contributions=Array(g.crisis.need).fill(g.crisis.type);
 const moral=g.morale;c.colony();
 // V9.9 trae ⌈2/2⌉ = 1 y la regla lleva a 3: tres desbordes; mueren los dos indefensos y el tercero no encuentra a nadie.
 assert.equal(g.helpless,0);assert.equal(lab.registro.indefensosPerdidos,2);
 assert.deepEqual(lab.registro.desbordesColonia.map(d=>d.victima),['indefenso','indefenso','nadie']);
 assert.equal(g.morale,moral-2,'−1 por indefenso; el desborde sin nadie no cuesta moral');
});

test('SP-04d | regla B: reproducible en partida completa y V9.9 idéntico a no tener la palanca',async()=>{
 for(const politica of ['cooperativa','objetivo-repartido']){
  const cfg={...P1,politica,llegadasColonia:'min3'};
  const a=await jugarPartida({semilla:1936384585,...cfg}),b=await jugarPartida({semilla:1936384585,...cfg});
  assert.equal(a.completa,true,a.error);assert.deepEqual(a.traza,b.traza);assert.deepEqual(a.desbordesColonia,b.desbordesColonia);
  assert.ok(a.colonia.every(x=>typeof x.guardia==='boolean'));
  const v99=await jugarPartida({semilla:1936384585,...P1,politica}),{llegadasColonia,...sin}=P1,sinPalanca=await jugarPartida({semilla:1936384585,...sin,politica});
  assert.deepEqual(v99.traza,sinPalanca.traza);assert.equal(v99.llegadasExtraColonia,0);
 }
});

test('SP-04d | elección de la mejor variante',()=>{
 const f=(cooperativa,repartido,nombre)=>({llegadasColonia:nombre,cooperativa,ventajaRepartido:repartido-cooperativa});
 assert.equal(elegirMejorVariante([f(.40,.60,'a'),f(.46,.49,'b'),f(.36,.40,'c'),f(.30,.20,'d')]).llegadasColonia,'b','cumplen b y c; b está más cerca del 45 %');
 const ninguna=elegirMejorVariante([f(.40,.60,'a'),f(.36,.50,'b'),f(.30,.20,'c')]);
 assert.equal(ninguna.cumple,false);assert.equal(ninguna.llegadasColonia,'b','menor ventaja con la cooperativa en ≥ 35 %');
});
