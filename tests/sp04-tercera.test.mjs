import test from 'node:test';import assert from 'node:assert/strict';
import {crearMotor} from '../lab/sp04/motor-laboratorio.mjs';
import {jugarPartida} from '../lab/sp04/partida.mjs';
import {destinoRepartido} from '../lab/sp04/politicas.mjs';
import {objetivoDelMedico,MEDICO_JUGABLE} from '../lab/sp04/palancas.mjs';
import {P1} from '../lab/sp04/tercera-corrida.mjs';

const {variante,conoceIndefensos,...palancasP1}=P1;
function motor(opciones={}){const lab=crearMotor({semilla:7,...opciones});lab.engine.start('ai');return lab;}
const humano=(lab,id)=>lab.c.game.humans.find(p=>p.id===id);

test('SP-04c | objetivo-repartido: un superviviente por mazo de muestras, sin amontonar',()=>{
 const lab=motor(),{c}=lab,g=c.game,[mara,leo,iris]=g.humans;
 // Los tres en la colonia: cada uno va a un mazo distinto (Biblioteca, Hospital, Escuela).
 const destinos=[];for(const p of [mara,leo,iris]){const d=destinoRepartido(c,p);destinos.push(d);p.loc=d;}
 assert.deepEqual(destinos,[6,2,5]);
 // Quien ya está solo en un mazo que sirve se queda.
 assert.equal(destinoRepartido(c,mara),6);
 // Si la Biblioteca ya no absorbe una llegada más (capacidad − zombis < 1), se va a otro.
 g.zones[6].z=c.zcap[6];assert.notEqual(destinoRepartido(c,mara),6);
 // Mazo vacío: no sirve.
 g.zones[6].z=0;g.decks[6]=[];assert.notEqual(destinoRepartido(c,mara),6);
 // Si ningún mazo sirve, vuelve a la colonia.
 for(const l of [1,2,3,4,5,6])g.decks[l]=[];assert.equal(destinoRepartido(c,mara),0);
});

test('SP-04c | objetivo-repartido: reproducible y sin desbordamientos en la Biblioteca por amontonarse',async()=>{
 const cfg={...palancasP1,conoceIndefensos:true,politica:'objetivo-repartido'};
 const a=await jugarPartida({semilla:147926525,...cfg}),b=await jugarPartida({semilla:147926525,...cfg});
 assert.equal(a.completa,true,a.error);assert.deepEqual(a.traza,b.traza);
 // La política «objetivo» pierde a tres en la Biblioteca con esta semilla (107 §3.1).
 const amontonada=await jugarPartida({semilla:147926525,...cfg,politica:'objetivo'});
 assert.ok(amontonada.muertes.filter(m=>/Biblioteca/.test(m.causa)).length>=2);
 assert.equal(a.muertes.filter(m=>/Biblioteca/.test(m.causa)).length,0);
});

test('SP-04c | cocinero: reemplaza a Leo o se suma como cuarto',()=>{
 const reemplaza=motor({cocinero:'reemplaza'}).c.game;
 assert.deepEqual(reemplaza.humans.map(p=>p.name),['Mara','Tomás','Iris']);assert.equal(reemplaza.humans[1].skill,'cook');assert.equal(reemplaza.dice.length,4);
 const suma=motor({cocinero:'suma'}).c.game;
 assert.deepEqual(suma.humans.map(p=>p.name),['Mara','Leo','Iris','Tomás']);assert.equal(suma.dice.length,5,'1 + 4 vivos');
 const base=motor().c.game;assert.deepEqual(base.humans.map(p=>p.name),['Mara','Leo','Iris']);
});

test('SP-04c | médico jugable: entra con recruit, tira sus dados y su pasiva cura al aliado más herido de su lugar',()=>{
 for(const medico of ['jugable-heridas','jugable-heridas-congelacion']){
  const lab=motor({exposicion:'d12',rescate:'rescatar',medico}),{c}=lab,g=c.game;
  g.round=5;g.turn='human';lab.azar.Math.random=()=>11.5/12; // cara 12: el rescatista vive
  const antes=g.humans.length;assert.match(lab.alEmpezarTurno(),/vive$/);
  assert.equal(g.humans.length,antes+1,'se incorpora con el reclutamiento del motor');
  const m=g.humans.at(-1);for(const k of ['name','attack','search','influence','skill'])assert.equal(m[k],MEDICO_JUGABLE[k]);
  assert.equal(m.dead,false);assert.equal(lab.registro.reclutas.at(-1).lado,'human');
  assert.equal(g.labMedico,false,'no come aparte: come como superviviente');
  // Pasiva: desde la ronda siguiente, una vez por ronda, en su localidad, no a sí mismo.
  const [mara,leo,iris]=g.humans;for(const p of [mara,leo,iris,m])p.loc=2;
  mara.wounds=1;leo.wounds=2;iris.wounds=0;iris.frost=2;m.wounds=2;
  assert.equal(lab.alEmpezarTurno(),null,'no cura en la ronda del rescate');
  g.round=6;const e=lab.alEmpezarTurno();
  if(medico==='jugable-heridas'){assert.equal(e,'medico-cura:'+leo.id);assert.equal(leo.wounds,1);assert.equal(iris.frost,2);}
  else{assert.equal(e,'medico-cura:'+iris.id,'empate en dos daños: gana la mayor influencia (Iris 67 > Leo 58)');assert.equal(iris.frost,1,'cura primero la congelación');assert.equal(leo.wounds,2);}
  assert.equal(m.wounds,2,'no se cura a sí mismo');
  assert.equal(lab.alEmpezarTurno(),null,'una cura por ronda');
  // Solo en su localidad.
  for(const p of [mara,leo,iris])p.loc=1;g.round=7;assert.equal(lab.alEmpezarTurno(),null);
  // Muerto, no cura.
  for(const p of [mara,leo,iris])p.loc=2;c.kill(m,'prueba');g.round=8;assert.equal(lab.alEmpezarTurno(),null);
 }
 // «heridas o congelación» cura primero la congelación del más dañado.
 const lab=motor({exposicion:'d12',rescate:'rescatar',medico:'jugable-heridas-congelacion'}),{c}=lab,[mara,leo]=c.game.humans,m={...MEDICO_JUGABLE,id:'x',loc:0,dead:false};
 leo.wounds=1;leo.frost=1;mara.wounds=1;
 assert.equal(objetivoDelMedico(c,m,'jugable-heridas-congelacion'),leo);assert.equal(objetivoDelMedico(c,m,'jugable-heridas'),mara,'una herida cada uno: gana la mayor influencia');
});

test('SP-04c | médico jugable: rescate reproducible y retirarse no incorpora a nadie',async()=>{
 const cfg={...palancasP1,conoceIndefensos:true,politica:'cooperativa'};
 for(const s of [1013904226,2027808452]){
  const r=await jugarPartida({semilla:s,...cfg,rescate:'rescatar',medico:'jugable-heridas'}),r2=await jugarPartida({semilla:s,...cfg,rescate:'rescatar',medico:'jugable-heridas'});
  assert.equal(r.completa,true,r.error);assert.deepEqual(r.traza,r2.traza);assert.deepEqual(r.rescate,r2.rescate);
  const ret=await jugarPartida({semilla:s,...cfg,rescate:'retirarse',medico:'jugable-heridas'});
  assert.equal(ret.rescate.medico,false);assert.equal(ret.muertes.some(m=>m.nombre==='Médico'),false);
 }
});

test('SP-04c | cooperativa-repartida (diagnóstico): mueve como el corredor repartido y no altera a la cooperativa',async()=>{
 const cfg={...palancasP1,conoceIndefensos:true};
 const a=await jugarPartida({semilla:1013904226,...cfg,politica:'cooperativa-repartida'}),b=await jugarPartida({semilla:1013904226,...cfg,politica:'cooperativa-repartida'});
 assert.equal(a.completa,true,a.error);assert.deepEqual(a.traza,b.traza);
 const coop=await jugarPartida({semilla:1013904226,...cfg,politica:'cooperativa'});
 assert.notDeepEqual(a.traza,coop.traza);
 // Se mueve (el destino repartido lo prueba la primera prueba de este archivo).
 assert.ok(a.traza.some(t=>t.startsWith('mover')));
});
