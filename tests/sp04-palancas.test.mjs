import test from 'node:test';import assert from 'node:assert/strict';
import {jugarPartida} from '../lab/sp04/partida.mjs';
import {crearMotor} from '../lab/sp04/motor-laboratorio.mjs';
import {palancasBase} from '../lab/sp04/palancas.mjs';
import {EXPOSURE_FACES} from '../src/domain/exposure-die.mjs';
import {elegirMejor} from '../lab/sp04/segunda-corrida.mjs';

const resumen=r=>({resultado:r.resultado,ronda:r.rondaFin,moral:r.moralFin,comida:r.comidaFin,muestras:r.muestrasFin,muertes:r.muertes.map(m=>m.nombre+'@'+m.ronda),azar:r.llamadasAzar,traza:r.traza});
const todas={exposicion:'d12',indefensos:2,comidaInicial:3,crisisFallida:'agravada',moralMuerte:2,equipoMuerto:'mazo',rondasObjetivo:8,rescate:'rescatar-A',conoceIndefensos:true};
// Motor de un grupo arrancado, con el azar del contexto reemplazable por un valor fijo.
function motor(opciones={}){const lab=crearMotor({semilla:5,...opciones});lab.engine.start('ai');return lab;}
const forzar=(lab,valor)=>{lab.forzadas=0;lab.azar.Math.random=()=>{lab.forzadas++;return valor;};};
const cara=n=>(n-.5)/12;
const humano=(lab,id)=>lab.c.game.humans.find(p=>p.id===id);

test('SP-04b | reproducibilidad: misma semilla y palancas, misma partida; otra semilla, otra',async()=>{
 for(const politica of ['cooperativa','objetivo']){
  const a=await jugarPartida({semilla:20261117,politica,...todas}),b=await jugarPartida({semilla:20261117,politica,...todas});
  assert.equal(a.completa,true,a.error);assert.deepEqual(resumen(a),resumen(b),politica);
  assert.deepEqual(a.exposiciones,b.exposiciones);assert.deepEqual(a.rescate,b.rescate);
  const otra=await jugarPartida({semilla:20261118,politica,...todas});assert.notDeepEqual(resumen(otra).traza,resumen(a).traza);
 }
});

test('SP-04b | con las palancas en V9.9 la partida es idéntica a la de la primera corrida',async()=>{
 for(const [politica,escenario] of [['cooperativa','A'],['objetivo','B'],['ia-referencia','E2']]){
  const antes=await jugarPartida({semilla:387276917,politica,escenario}),explicito=await jugarPartida({semilla:387276917,politica,escenario,...palancasBase});
  assert.deepEqual(resumen(explicito),resumen(antes),politica);
  // Saber de los indefensos no cambia nada cuando no hay indefensos.
  const sabe=await jugarPartida({semilla:387276917,politica,escenario,conoceIndefensos:true});
  assert.equal(antes.indefensosFin,0,'semilla elegida sin indefensos ganados');
  assert.deepEqual(resumen(sabe),resumen(antes),politica+': sin indefensos, saber de ellos no cambia la partida');
 }
 assert.throws(()=>crearMotor({semilla:1,variante:'dos-grupos',moralMuerte:2}),/línea base/);
 assert.doesNotThrow(()=>crearMotor({semilla:1,variante:'dos-grupos',exposicion:'d12'}));
 assert.throws(()=>crearMotor({semilla:1,equipoMuerto:'otro'}),/equipoMuerto/);
 assert.throws(()=>crearMotor({semilla:1,palanca:'x'}),/desconocido/);
});

test('SP-04b | D12: una sola muestra de azar por exposición y la cara decide el efecto',()=>{
 for(const n of [1,2,3,4,7,12]){
  const lab=motor({exposicion:'d12'}),p=humano(lab,'h2');p.loc=3;forzar(lab,cara(n));
  const esperado=EXPOSURE_FACES[n-1].outcome,llamadas=[];
  const original=lab.azar.Math.random;lab.azar.Math.random=()=>{llamadas.push(1);return original();};
  const r=lab.c.expose(p,'prueba');
  assert.equal(llamadas.length,1,'cara '+n+': una muestra');assert.equal(r.die.face,n);assert.equal(r.effect,esperado);
  assert.equal(p.wounds,esperado==='wound'?1:0);assert.equal(p.frost,esperado==='frost'?1:0);assert.equal(p.dead,esperado==='bite');
  assert.equal(lab.registro.exposiciones.at(-1).efecto,esperado,'el registro anota la misma cara');
 }
 // Sin la palanca, la exposición es la D6 de V9.9.
 const d6=motor(),p=humano(d6,'h2');p.loc=3;forzar(d6,.99);const r=d6.c.expose(p,'prueba');assert.equal(r.value,6);assert.equal(r.die,undefined);
});

test('SP-04b | moral por muerte: −2 por superviviente, −1 por indefenso',()=>{
 const lab=motor({moralMuerte:2,indefensos:1}),g=lab.c.game,m0=g.morale;
 lab.c.kill(humano(lab,'h2'),'prueba');assert.equal(g.morale,m0-2);
 const base=motor();base.c.kill(humano(base,'h2'),'prueba');assert.equal(base.c.game.morale,m0-1,'V9.9: −1');
 // Indefenso: desbordamiento en la colonia vacía.
 for(const p of g.humans)p.loc=1;g.zones[0].z=lab.c.zcap[0];g.zones[0].b=0;const m1=g.morale;
 lab.c.addZombie(0);assert.equal(g.helpless,0);assert.equal(g.morale,m1-1);assert.equal(lab.registro.indefensosPerdidos,1);
});

test('SP-04b | equipo del muerto: V9.9, perdido y queda en el mazo del lugar',()=>{
 const caso=(equipoMuerto,loc)=>{const lab=motor({equipoMuerto}),g=lab.c.game,p=humano(lab,'h2');p.loc=loc;p.equipment=[lab.c.catalog.create('crowbar')];
  const mano=g.items.length,mazo=(g.decks[loc]||[]).length;lab.c.kill(p,'prueba');return {mano:g.items.length-mano,mazo:(g.decks[loc]||[]).length-mazo,perdido:lab.registro.equipoPerdido};};
 assert.deepEqual(caso('v99',0),{mano:1,mazo:0,perdido:0});
 assert.deepEqual(caso('v99',3),{mano:0,mazo:1,perdido:0});
 assert.deepEqual(caso('perdido',0),{mano:0,mazo:0,perdido:1});
 assert.deepEqual(caso('perdido',3),{mano:0,mazo:0,perdido:1});
 assert.deepEqual(caso('mazo',3),{mano:0,mazo:1,perdido:0});
 assert.deepEqual(caso('mazo',0),{mano:0,mazo:0,perdido:1},'en la colonia no hay mazo donde buscarlo');
});

test('SP-04b | crisis agravada: muere un indefenso; sin indefensos, herida al de menor influencia',()=>{
 const preparar=indefensos=>{const lab=motor({crisisFallida:'agravada',indefensos}),g=lab.c.game;g.crisis.contributions=[];g.crisis.fail='moral';return lab;};
 const con=preparar(1),m=con.c.game.morale;con.c.resolveCrisis();
 assert.equal(con.c.game.helpless,0);assert.equal(con.c.game.morale,m-2,'−1 de la crisis V9.9 y −1 del indefenso');assert.equal(con.registro.indefensosPorCrisis,1);
 const sin=preparar(0),g=sin.c.game,menor=g.humans.filter(p=>!p.dead).sort((a,b)=>a.influence-b.influence)[0],m2=g.morale;sin.c.resolveCrisis();
 assert.equal(menor.wounds,1);assert.equal(g.morale,m2-1);
 const v99=motor({indefensos:1}),g3=v99.c.game;g3.crisis.contributions=[];g3.crisis.fail='moral';v99.c.resolveCrisis();assert.equal(g3.helpless,1,'V9.9 no toca indefensos');
});

test('SP-04b | estado inicial: indefensos, comida y objetivo por duración, sin cambiar el azar',()=>{
 const base=motor(),llamadas=base.azar.llamadas();
 for(const rondas of [6,8,10]){
  const lab=motor({indefensos:4,comidaInicial:0,rondasObjetivo:rondas}),g=lab.c.game;
  assert.equal(g.helpless,4);assert.equal(g.food,0);assert.equal(g.max,rondas);assert.equal(g.goal,{6:5,8:7,10:9}[rondas]);assert.equal(g.objective.rounds,rondas);
  assert.equal(lab.azar.llamadas(),llamadas,'fijar el objetivo no consume ni ahorra azar');
  assert.deepEqual(g.dice,base.c.game.dice);
 }
});

test('SP-04b | rescate del médico: dos daños, una tirada D12, cura desde la ronda siguiente; A la demora dos rondas',()=>{
 const ronda5=(rescate,valor)=>{const lab=motor({rescate,exposicion:'d12'}),g=lab.c.game;g.round=5;g.turn='human';if(valor!==undefined)forzar(lab,valor);const n=lab.azar.llamadas();lab.forzadas=0;const evento=lab.alEmpezarTurno();return {lab,g,evento,tiradas:lab.azar.llamadas()-n+lab.forzadas};};
 const retirada=ronda5('retirarse');
 assert.match(retirada.evento,/^rescate:retirarse/);assert.equal(retirada.tiradas,0,'retirarse no tira');
 const r=retirada.g.humans.find(p=>p.name===retirada.lab.registro.rescate.rescatista);assert.equal(r.wounds+r.frost,2);assert.equal(retirada.g.labMedico,false);
 assert.equal(retirada.lab.alEmpezarTurno(),null,'el rescate ocurre una sola vez');
 // Sobrevive (cara 12): el médico se incorpora, come y cura desde la ronda 6.
 const vive=ronda5('rescatar',cara(12));assert.match(vive.evento,/vive$/);assert.equal(vive.g.labMedico,true);
 const necesidad=vive.lab.c.feedingNeed(vive.g);vive.g.labMedico=false;assert.equal(vive.lab.c.feedingNeed(vive.g)<=necesidad,true);vive.g.labMedico=true;
 const herido=vive.g.humans.find(p=>!p.dead&&p.loc===0);herido.wounds=1;
 assert.equal(vive.lab.alEmpezarTurno(),null,'no cura en la ronda del rescate');
 vive.g.round=6;assert.match(vive.lab.alEmpezarTurno(),/^medico-cura/);assert.equal(vive.lab.alEmpezarTurno(),null,'una cura por ronda');
 // Muere (cara 4, herida: tercer daño). Sin A cura desde la 6; con A, desde la 8.
 for(const [rescate,desde] of [['rescatar',6],['rescatar-A',8]]){
  const muere=ronda5(rescate,cara(4));assert.match(muere.evento,/muere$/);assert.equal(muere.tiradas,1,'una sola tirada');assert.equal(muere.lab.registro.rescate.rescatistaMuere,true);
  const herido=muere.g.humans.find(p=>!p.dead&&p.loc===0);herido.wounds=1;muere.lab.azar.Math.random=Math.random;
  for(let ronda=6;ronda<=8;ronda++){muere.g.round=ronda;const e=muere.lab.alEmpezarTurno();assert.equal(!!e,ronda>=desde,rescate+' ronda '+ronda);herido.wounds=1;}
 }
});

test('SP-04b | elección de la mejor combinación: v2, la más exigente viable dentro del ruido; v1, la de menor ventaja',()=>{
 const f=(cooperativa,objetivo)=>({combo:{cooperativa,objetivo},cooperativa,objetivo,ventaja:objetivo-cooperativa});
 // ventajas: −40, −37, −30, −30 (cooperativa 30 %: no viable), +10 (correr domina)
 const filas=[f(.8,.4),f(.5,.13),f(.4,.1),f(.3,0),f(.6,.7)];
 assert.deepEqual(elegirMejor(filas,'v1').combo,{cooperativa:.8,objetivo:.4},'v1: la menor ventaja, aunque sea la más fácil');
 assert.deepEqual(elegirMejor(filas).combo,{cooperativa:.5,objetivo:.13},'v2: −40 y −37 están en la banda de 5 puntos; gana la de menor victoria cooperativa');
 assert.deepEqual(elegirMejor([f(.2,.5),f(.3,.1)]).combo,{cooperativa:.3,objetivo:.1},'sin factibles, la de más victoria cooperativa');
 assert.throws(()=>elegirMejor(filas,'v3'),/Criterio/);
});
