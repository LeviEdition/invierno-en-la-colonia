import test from 'node:test';import assert from 'node:assert/strict';
import {fixture,silentCross} from '../test-support/game-fixture.mjs';
import {normalizeTestRules,partialThreshold,halvedConsequence,nightAvailable,TEST_RULE_DEFAULTS} from '../src/domain/test-rules.mjs';
import {nightWatcher,nightWatch} from '../src/domain/reference-night.mjs';

// Reglas de prueba del singleplayer (docs/116). Todas apagadas por defecto: con
// la configuración base el motor resuelve exactamente igual que la referencia.

// Las reglas se eligen en la pantalla de preparación y se aplican al crear la
// partida, igual que en el panel de desarrollo.
function prepare(rules,{mode='ai',seed=20261118,face=6}={}){
 const t=fixture({mode,seed,face});
 t.run('passScreenActive=true;setTestRules('+JSON.stringify(rules||{})+');passScreenActive=false;create();');
 t.run(silentCross);
 return t;
}
// Caras del D12 de exposición: 1 mordedura, 2-3 congelación, 4-6 herida, 7-12 sin efecto.
const D12={bite:0.01,frost:0.12,wound:0.30,none:0.60};
const setDie=(t,value)=>t.run('Math.random=()=>'+value+';');
// Fase de colonia sin ruido ni crisis: deja ver solo lo que aporta cada regla.
const quiet='game.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});game.waste=0;game.food=40;'+
 'game.crisis.contributions=Array(game.crisis.need).fill(game.crisis.type);game.crisis.given=game.crisis.need;';

// ─── Configuración ──────────────────────────────────────────────────────────

test('reglas | el valor por defecto deja todo apagado y la comida en 6',()=>{
 assert.deepEqual({...TEST_RULE_DEFAULTS},{comidaInicial:6,laNoche:false,regreso:false,crisisParcial:false});
});

test('reglas | normalizeTestRules valida nombres y valores',()=>{
 assert.equal(normalizeTestRules({comidaInicial:8}).comidaInicial,8);
 assert.equal(normalizeTestRules({laNoche:true}).laNoche,true);
 assert.throws(()=>normalizeTestRules({comidaInicial:7}),/comidaInicial admite/);
 assert.throws(()=>normalizeTestRules({inventada:true}),/desconocida/);
 assert.throws(()=>normalizeTestRules({laNoche:'si'}),/interruptor/);
});

test('reglas | la mitad pedida sube y la consecuencia baja',()=>{
 assert.equal(partialThreshold(2),1);assert.equal(partialThreshold(3),2);
 assert.deepEqual([2,1].map(halvedConsequence),[1,0]);
});

test('reglas | La noche existe en IA y un grupo, no en dos jugadores locales',()=>{
 assert.deepEqual(['ai','solo','local'].map(nightAvailable),[true,true,false]);
});

test('reglas | las reglas no se cambian con una partida en curso',()=>{
 const t=fixture({mode:'ai',seed:7});
 t.run('setTestRules({laNoche:true});');
 assert.equal(t.state('testRules.laNoche'),false,'con partida activa el cambio se rechaza');
});

// ─── Identidad con todo apagado ─────────────────────────────────────────────

test('reglas | con todo apagado una partida con semilla fija es idéntica',()=>{
 const play=()=>{
  const t=fixture({mode:'ai',seed:20261118});t.run(silentCross);
  const inicial=t.state('game.food');
  t.run('for(let r=0;r<3;r++){game.dice=[6,6,6,6];destination(2);doMove();colony();if(game.ended)break;game.round++;newRound();}');
  return {inicial,fin:t.state('game')};
 };
 const a=play(),b=play();
 assert.equal(a.inicial,6,'la comida inicial sigue siendo 6');
 assert.deepEqual(a.fin,b.fin,'misma semilla, mismo resultado');
 assert.deepEqual(a.fin.testRules,{...TEST_RULE_DEFAULTS},'el registro guarda la configuración base');
});

test('reglas | comidaInicial cambia solo la reserva de salida',()=>{
 for(const comida of [6,8,10]){
  const t=prepare({comidaInicial:comida},{seed:7});
  assert.equal(t.state('game.food'),comida);
  assert.equal(t.state('game.testRules.comidaInicial'),comida,'queda en el registro de la partida');
  assert.equal(t.state('game.morale'),9,'lo demás no cambia');
  assert.equal(t.state('game.humans').length,3);
 }
});

// ─── La noche ───────────────────────────────────────────────────────────────

test('reglas | centinela: menor influencia y empate por orden del grupo',()=>{
 const grupo=[{id:'h0',loc:2,dead:false,influence:70},{id:'h1',loc:2,dead:false,influence:40},{id:'h2',loc:2,dead:false,influence:40}];
 assert.equal(nightWatcher(grupo,2).id,'h1','gana la menor influencia; el empate lo rompe el orden');
 assert.equal(nightWatcher(grupo,5),null,'sin nadie no hay centinela');
 assert.equal(nightWatcher([{id:'h0',loc:2,dead:true,influence:1}],2),null,'los muertos no hacen guardia');
});

test('reglas | la vigilancia cubre cada localidad exterior ocupada y nunca la colonia',()=>{
 const game={humans:[{id:'h0',loc:0,dead:false,influence:70},{id:'h1',loc:2,dead:false,influence:50},{id:'h2',loc:5,dead:false,influence:60}]};
 assert.deepEqual(nightWatch(game).map(e=>[e.loc,e.watcher.id]),[[2,'h1'],[5,'h2']]);
});

test('reglas | La noche tira una vez por localidad ocupada y ninguna en la colonia',()=>{
 const t=prepare({laNoche:true},{seed:99});
 t.run(quiet+'game.humans[0].loc=1;game.humans[1].loc=2;game.humans[2].loc=0;');
 setDie(t,D12.none);t.run('game.log=[];colony();');
 const noches=t.state('game.log').filter(line=>/la noche en/.test(line));
 assert.equal(noches.length,2,'una tirada por localidad exterior ocupada');
 assert.ok(noches.every(line=>!/Colonia/.test(line)),'la colonia nunca tira');
});

test('reglas | dos supervivientes en la misma localidad reciben una sola tirada',()=>{
 const t=prepare({laNoche:true},{seed:99});
 t.run(quiet+'game.humans.forEach(p=>p.loc=2);');
 setDie(t,D12.none);t.run('game.log=[];colony();');
 assert.equal(t.state('game.log').filter(line=>/la noche en/.test(line)).length,1);
});

test('reglas | La noche no tira por el grupo de la IA',()=>{
 const t=prepare({laNoche:true},{seed:99});
 t.run(quiet+'game.humans.forEach(p=>p.loc=0);game.bots[0].loc=2;game.bots[1].loc=5;');
 setDie(t,D12.none);t.run('game.log=[];colony();');
 assert.equal(t.state('game.log').filter(line=>/la noche en/.test(line)).length,0);
});

test('reglas | La noche usa el D12 de exposición del mapa, no el D6',()=>{
 const efecto=valor=>{
  const t=prepare({laNoche:true},{seed:1});
  t.run(quiet+'game.humans[0].loc=2;game.humans[1].loc=0;game.humans[2].loc=0;');
  setDie(t,valor);t.run('game.log=[];colony();');
  return t.state('game.log').find(line=>/la noche en/.test(line))||'';
 };
 assert.match(efecto(D12.none),/BLANCO/);
 assert.match(efecto(D12.wound),/HERIDA/);
 assert.match(efecto(D12.frost),/CONGELACIÓN/);
 assert.match(efecto(D12.bite),/MORDEDURA/);
});

test('reglas | apagada, La noche no tira nunca',()=>{
 const t=fixture({mode:'ai',seed:99});t.run(silentCross);
 t.run(quiet+'game.humans[0].loc=1;game.humans[1].loc=2;');
 setDie(t,D12.bite);t.run('game.log=[];colony();');
 assert.equal(t.state('game.log').filter(line=>/la noche/.test(line)).length,0);
});

test('reglas | en dos jugadores locales La noche no se aplica',()=>{
 const t=prepare({laNoche:true},{mode:'local',seed:99});
 t.run(quiet+'game.humans[0].loc=1;game.humans[1].loc=2;');
 setDie(t,D12.bite);t.run('game.log=[];colony();');
 assert.equal(t.state('game.log').filter(line=>/la noche/.test(line)).length,0);
});

test('reglas | una mordedura nocturna entra al flujo normal de muerte y sucesión',()=>{
 const t=prepare({laNoche:true},{seed:5});
 // El líder humano sale solo: la mordedura lo mata y obliga a revisar el liderazgo.
 t.run(quiet+'game.humans[0].loc=2;game.humans[1].loc=0;game.humans[2].loc=0;game.leaders.human="h0";');
 setDie(t,D12.bite);t.run('game.log=[];colony();');
 assert.equal(t.state('game.humans[0].dead'),true,'la mordedura mató al centinela');
 assert.ok(t.state('game.log').some(line=>/MORDEDURA/.test(line)),'el aviso de mordedura aparece en el registro');
 assert.ok(t.state('game.log').some(line=>/murió por mordedura/.test(line)),'pasa por la muerte normal');
 assert.notEqual(t.state('game.leaders.human'),'h0','el liderazgo se revisa como en cualquier muerte');
 assert.equal(t.state('game.morale'),8,'la muerte cuesta una moral, como siempre');
});

test('reglas | una mordedura en soledad se resuelve sola y la noche sigue',()=>{
 // Sin compañeros no hay contagio que decidir: biteNext cierra la mordedura y
 // las demás localidades reciben su tirada.
 const t=prepare({laNoche:true},{seed:5});
 t.run(quiet+'game.humans[0].loc=1;game.humans[1].loc=2;game.humans[2].loc=5;');
 setDie(t,D12.bite);t.run('game.log=[];colony();');
 assert.equal(t.state('game.log').filter(line=>/la noche en/.test(line)).length,3);
 assert.equal(t.state('pendingBite'),null,'no queda decisión abierta');
});

test('reglas | una mordedura con compañeros deja la decisión abierta y corta la noche',()=>{
 const t=prepare({laNoche:true},{seed:5});
 // Dos en la escuela (la mordedura amenaza al otro) y uno en la gasolinera.
 t.run(quiet+'game.humans[0].loc=1;game.humans[1].loc=1;game.humans[2].loc=5;'+
  'game.humans[0].influence=40;game.humans[1].influence=70;game.humans[2].influence=60;');
 setDie(t,D12.bite);t.run('game.log=[];colony();');
 assert.equal(t.state('game.log').filter(line=>/la noche en/.test(line)).length,1,'la mordedura pendiente corta la noche');
 assert.equal(t.state('pendingBite.target'),'h1','el compañero queda amenazado');
 assert.equal(t.state('game.humans[2].loc'),5,'la gasolinera no llegó a tirar');
});

// ─── Regresar a la colonia ──────────────────────────────────────────────────

test('reglas | regresar cuesta un dado de cualquier valor y no tira exposición',()=>{
 const t=prepare({regreso:true},{seed:11});
 t.run('game.humans[0].loc=2;game.humans[0].wounds=0;game.humans[0].frost=0;game.dice=[1];selected=0;game.log=[];returnHome();');
 assert.equal(t.state('game.humans[0].loc'),0,'volvió a la colonia');
 assert.deepEqual(t.state('game.dice'),[],'gastó el dado de valor 1');
 assert.equal(t.state('game.humans[0].wounds'),0);
 assert.equal(t.state('game.humans[0].frost'),0);
 assert.ok(!t.state('game.log').some(line=>/Exposición/.test(line)),'no hay tirada de exposición');
});

test('reglas | regresar no consume azar',()=>{
 const sequence=act=>{
  const t=prepare({regreso:true},{seed:11});
  t.run('game.humans[0].loc=2;game.dice=[3];selected=0;'+act);
  return t.run('[Math.random(),Math.random()].join()');
 };
 assert.equal(sequence('returnHome();'),sequence(''),'la secuencia de azar no se adelanta');
});

test('reglas | regresar funciona haya movido o no',()=>{
 for(const moved of [false,true]){
  const t=prepare({regreso:true},{seed:11});
  t.run('game.humans[0].loc=2;game.humans[0].moved='+moved+';game.dice=[2];selected=0;returnHome();');
  assert.equal(t.state('game.humans[0].loc'),0,'moved='+moved);
 }
});

test('reglas | regresar solo lleva a la colonia y exige estar afuera',()=>{
 const t=prepare({regreso:true},{seed:11});
 t.run('game.humans[0].loc=0;game.dice=[5];selected=0;target=3;returnHome();');
 assert.equal(t.state('game.humans[0].loc'),0,'desde la colonia no hace nada');
 assert.deepEqual(t.state('game.dice'),[5],'no gasta el dado');
});

test('reglas | apagada, regresar no hace nada',()=>{
 const t=fixture({mode:'ai',seed:11});t.run(silentCross);
 t.run('game.humans[0].loc=2;game.dice=[4];selected=0;returnHome();');
 assert.equal(t.state('game.humans[0].loc'),2);
 assert.deepEqual(t.state('game.dice'),[4]);
});

test('reglas | el movimiento normal a la colonia no cambia: gratis y con exposición',()=>{
 const t=prepare({regreso:true},{seed:13});
 t.run('game.humans[0].loc=2;game.humans[0].moved=false;game.dice=[4];selected=0;target=0;game.log=[];doMove();');
 assert.equal(t.state('game.humans[0].loc'),0);
 assert.deepEqual(t.state('game.dice'),[4],'el movimiento sigue sin costar dado');
 assert.ok(t.state('game.log').some(line=>/Exposición/.test(line)),'el movimiento sigue exponiendo');
});

// ─── Crisis parcial ─────────────────────────────────────────────────────────

const conCrisis=(fail,aportes,{regla=true}={})=>{
 const t=regla?prepare({crisisParcial:true},{seed:3}):(()=>{const f=fixture({mode:'ai',seed:3});f.run(silentCross);return f;})();
 t.run('game.zones.forEach(z=>{z.noise=0;z.b=0;z.z=0;});game.waste=0;game.food=40;'+
  // El grupo de la IA sale de la colonia para que la herida caiga en un humano.
  'game.humans.forEach(p=>{p.loc=0;p.wounds=0;p.frost=0;});game.bots.forEach(p=>p.loc=1);'+
  'game.crisis={type:"comida",need:2,given:'+aportes+',contributions:Array('+aportes+').fill("comida"),fail:"'+fail+'"};'+
  'game.log=[];resolveCrisis();');
 return t;
};

test('reglas | crisis parcial: moral 1→0',()=>{
 const t=conCrisis('moral',1);
 assert.equal(t.state('game.morale'),9,'no pierde moral');
 assert.ok(t.state('game.log').some(line=>/Crisis parcial/.test(line)));
});

test('reglas | crisis parcial: comida 2→1',()=>{
 assert.equal(conCrisis('food',1).state('game.food'),39,'consume una comida en lugar de dos');
});

test('reglas | crisis parcial: zombis 2→1',()=>{
 assert.equal(conCrisis('zombie',1).state('game.zones[0].z'),1,'llega un zombi en lugar de dos');
});

test('reglas | crisis parcial: herida 1→0',()=>{
 assert.deepEqual(conCrisis('wound',1).state('game.humans').map(p=>p.wounds),[0,0,0],'nadie se hiere');
});

test('reglas | sin la mitad de los aportes la crisis falla entera',()=>{
 assert.equal(conCrisis('food',0).state('game.food'),38,'cero aportes: dos comidas');
 assert.equal(conCrisis('zombie',0).state('game.zones[0].z'),2,'cero aportes: dos zombis');
 assert.equal(conCrisis('moral',0).state('game.morale'),8,'cero aportes: -1 moral');
 assert.equal(conCrisis('wound',0).state('game.humans').filter(p=>p.wounds).length,1,'cero aportes: una herida');
});

test('reglas | con los aportes completos la crisis se supera',()=>{
 const t=conCrisis('food',2);
 assert.equal(t.state('game.food'),40,'no hay consecuencia');
 assert.ok(t.state('game.log').some(line=>/Crisis superada/.test(line)));
});

test('reglas | apagada, media crisis sigue fallando entera',()=>{
 const t=conCrisis('food',1,{regla:false});
 assert.equal(t.state('game.food'),38,'sin la regla, un aporte no alcanza');
 assert.ok(t.state('game.log').some(line=>/Crisis fallida/.test(line)));
});
