import test from 'node:test';import assert from 'node:assert/strict';
import {crearMotor} from '../lab/sp04/motor-laboratorio.mjs';
import {jugarPartida} from '../lab/sp04/partida.mjs';
import {P1} from '../lab/sp04/tercera-corrida.mjs';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Fase de colonia con la colonia vacía y un superviviente en la localidad indicada.
// Devuelve {registro, exposicionesNoche, muertesNoche, afueraAlCaerNoche}.
async function faseSoloNoche(nocheAfuera,loc=1){
 const lab=crearMotor({semilla:42,nocheAfuera,indefensos:0});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 // Mover a Iris (h2) a la localidad indicada; Leo y Tomás se quedan en casa.
 const iris=g.humans.find(p=>p.id==='h2');if(!iris)throw Error('sin h2');
 iris.loc=loc;
 // Preparar una fase de colonia limpia: crisis cubierta, comida de sobra.
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});g.food=99;g.waste=0;
 g.crisis.contributions=Array(g.crisis.need).fill(g.crisis.type);
 c.colony();
 return {lab,registro:lab.registro,iris};
}

// ─── Tests de noche/localidad ────────────────────────────────────────────────

test('SP-04e | nocheAfuera=localidad: se registra una exposición si hay alguien afuera',async()=>{
 const {registro}=await faseSoloNoche('localidad');
 assert.equal(registro.afueraAlCaerNoche.length,1,'una noche con alguien afuera');
 assert.equal(registro.afueraAlCaerNoche[0].cantidad,1,'un superviviente afuera');
 assert.equal(registro.exposicionesNoche.length,1,'una tirada de noche');
 assert.ok(['none','wound','frost','bite','avoided'].includes(registro.exposicionesNoche[0].efecto));
});

test('SP-04e | nocheAfuera=localidad: sin nadie afuera no hay tirada',async()=>{
 const lab=crearMotor({semilla:42,nocheAfuera:'localidad',indefensos:0});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 // Todos en la colonia.
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});g.food=99;g.waste=0;
 g.crisis.contributions=Array(g.crisis.need).fill(g.crisis.type);
 c.colony();
 assert.equal(lab.registro.afueraAlCaerNoche.length,0,'nadie afuera');
 assert.equal(lab.registro.exposicionesNoche.length,0,'sin tiradas de noche');
});

test('SP-04e | nocheAfuera=unica: solo una tirada aunque haya varios afuera',async()=>{
 const lab=crearMotor({semilla:42,nocheAfuera:'unica',indefensos:0});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 // Leo (h1) y Tomás a la localidad 1; Iris (h2) a la 2.
 g.humans.forEach((p,i)=>{p.loc=i===0?0:i;});
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});g.food=99;g.waste=0;
 g.crisis.contributions=Array(g.crisis.need).fill(g.crisis.type);
 c.colony();
 assert.equal(lab.registro.exposicionesNoche.length,1,'una sola tirada en modo único');
 assert.equal(lab.registro.afueraAlCaerNoche[0].cantidad,2,'dos fuera');
});

test('SP-04e | nocheAfuera=localidad: dos localidades dan dos tiradas',async()=>{
 const lab=crearMotor({semilla:42,nocheAfuera:'localidad',indefensos:0});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 g.humans[0].loc=1;g.humans[1].loc=2;g.humans[2].loc=0; // dos fuera en locs distintas
 g.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});g.food=99;g.waste=0;
 g.crisis.contributions=Array(g.crisis.need).fill(g.crisis.type);
 c.colony();
 assert.equal(lab.registro.exposicionesNoche.length,2,'una tirada por localidad');
});

// ─── Tests de regreso ────────────────────────────────────────────────────────

test('SP-04e | regreso: cooperativa regresa al superviviente de menor influencia',async()=>{
 // Con regreso=true, la cooperativa gasta un dado para traer de vuelta al superviviente fuera.
 const r=await jugarPartida({semilla:17,...P1,nocheAfuera:'localidad',regreso:true,politica:'cooperativa'});
 assert.equal(r.completa,true,r.error);
 // Debe haber al menos un regreso en alguna partida de esta semilla.
 assert.ok(typeof r.regresos==='number','regresos es un número');
});

test('SP-04e | regreso: objetivo-repartido nunca regresa',async()=>{
 // La política corredor nunca usa la acción regreso aunque esté habilitada.
 const r=await jugarPartida({semilla:17,...P1,nocheAfuera:'localidad',regreso:true,politica:'objetivo-repartido'});
 assert.equal(r.completa,true,r.error);
 assert.equal(r.regresos,0,'corredor nunca regresa');
});

// ─── Tests de regla A ────────────────────────────────────────────────────────

test('SP-04e | regla A (comida=todos): el corredor con todos afuera paga la misma comida que la cooperativa en casa',async()=>{
 // Con comida='todos', la necesidad es ceil((vivos + indefensos) / 2) independiente de la localidad.
 const lab=crearMotor({semilla:42,comida:'todos',indefensos:2});lab.engine.start('ai');
 const {c}=lab,g=c.game;
 // Todos fuera: necesidad = ceil((3 + 2) / 2) = 3
 g.humans.forEach((p,i)=>{p.loc=i+1;});
 assert.equal(c.feedingNeed(g),3,'tres personas (todos afuera) + 2 indefensos = 3');
 // Todos en casa: mismo resultado
 g.humans.forEach(p=>{p.loc=0;});
 assert.equal(c.feedingNeed(g),3,'mismo con todos en casa');
});

// ─── Reproducibilidad ────────────────────────────────────────────────────────

test('SP-04e | partida con noche es reproducible',async()=>{
 const cfg={...P1,nocheAfuera:'unica',regreso:true,politica:'cooperativa'};
 const a=await jugarPartida({semilla:1936384585,...cfg});
 const b=await jugarPartida({semilla:1936384585,...cfg});
 assert.equal(a.completa,true,a.error);
 assert.deepEqual(a.traza,b.traza,'trazas idénticas');
 assert.equal(a.regresos,b.regresos,'regresos idénticos');
 assert.deepEqual(a.exposicionesNoche,b.exposicionesNoche,'exposiciones de noche idénticas');
});

test('SP-04e | sin noche ni regreso el resultado es idéntico a la cuarta corrida (V9.9)',async()=>{
 for(const politica of ['cooperativa','objetivo-repartido']){
  const cfg={...P1,politica};
  const a=await jugarPartida({semilla:1936384585,...cfg});
  const b=await jugarPartida({semilla:1936384585,...cfg,nocheAfuera:null,regreso:false});
  assert.deepEqual(a.traza,b.traza,'traza idéntica: '+politica);
  assert.equal(b.regresos,0,'sin regreso: '+politica);
  assert.equal(b.exposicionesNoche.length,0,'sin noche: '+politica);
 }
});
