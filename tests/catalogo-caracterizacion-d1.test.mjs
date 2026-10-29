// D1.0 — Caracterización previa: no cambia el motor ni sustituye las reglas.
// Los tres bloques baseline son COPIAS TESTIGO extraídas de la V9.9 estable
// de main (commit 0b75d01aba013cd029d9d0dd0bdbd20791be15fc).
// Se mantienen independientes de ItemCatalog a propósito: detectar regresiones.
import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from '../test-support/game-fixture.mjs';

const expectedDefinitions={
   ration:{name:'Ración de comida',kind:'comida',icon:'🥫',desc:'Agrega 1 comida a la reserva.',effect:'food',amount:1},
   canned:{name:'Caja de conservas',kind:'comida',icon:'🥫',desc:'Agrega 2 comidas a la reserva.',effect:'food',amount:2},
   bandage:{name:'Vendas',kind:'medicina',icon:'✚',desc:'Cura 1 herida o congelación al personaje seleccionado.',effect:'heal',amount:1},
   medkit:{name:'Botiquín completo',kind:'medicina',icon:'✚',desc:'Cura hasta 2 daños del personaje seleccionado.',effect:'heal',amount:2},
   antifrost:{name:'Tratamiento térmico',kind:'medicina',icon:'✚',desc:'Elimina hasta 2 congelaciones del personaje seleccionado.',effect:'frost',amount:2},
   gascan:{name:'Bidón de combustible',kind:'combustible',icon:'⛽',desc:'Mueve al personaje seleccionado sin tirar exposición.',effect:'move'},
   pistol:{name:'Pistola',kind:'arma',icon:'🔫',desc:'Equipada: evita la exposición del primer ataque de cada ronda.',effect:'equip'},
   shotgun:{name:'Escopeta',kind:'arma',icon:'🔫',desc:'Equipada: elimina hasta 2 zombis por ataque con una exposición.',effect:'equip'},
   rifle:{name:'Rifle de precisión',kind:'arma',icon:'🔫',desc:'Equipado: reduce en 1 el requisito de ataque y evita una exposición por ronda si atacás fuera de la colonia.',effect:'equip'},
   hatchet:{name:'Hacha',kind:'arma',icon:'🔫',desc:'Equipada: reduce en 1 el requisito de ataque y permite construir una barricada después de atacar en la colonia, una vez por ronda.',effect:'equip'},
   crowbar:{name:'Palanca',kind:'herramienta',icon:'⛏️',desc:'Equipada: reduce en 1 el requisito de búsqueda.',effect:'equip'},
   flashlight:{name:'Linterna',kind:'herramienta',icon:'⛏️',desc:'Equipada: revela una carta extra al buscar una vez por ronda sin generar ruido.',effect:'equip'},
   repairkit:{name:'Herramientas de reparación',kind:'herramienta',icon:'⛏️',desc:'Equipadas: construí una barricada adicional por acción de construcción.',effect:'equip'},
   manual:{name:'Manual de fortificación',kind:'educacion',icon:'📖',desc:'Se consume para retirar 2 residuos y colocar una barricada en la localidad del personaje.',effect:'manual'},
   notes:{name:'Notas de laboratorio',kind:'educacion',icon:'📖',desc:'Se consumen para obtener una muestra de investigación.',effect:'research'},
   sample:{name:'Muestra biológica',kind:'muestra',icon:'◈',desc:'Entregala al objetivo general. Se recuerda quién la encontró.',effect:'sample'},
   rescue:{name:'Superviviente encontrado',kind:'superviviente',icon:'👤',desc:'Al elegir esta carta se incorpora automáticamente un superviviente a la colonia.',effect:'rescue'}
  };
const expectedDefaults={comida:'ration',medicina:'bandage',combustible:'gascan',arma:'pistol',herramienta:'crowbar',muestra:'sample',superviviente:'rescue',educacion:'manual'};
const expectedDistribution={
   1:{ration:6,canned:3,bandage:2,gascan:1,flashlight:1,crowbar:1,rescue:2,sample:2,manual:1,pistol:1},
   2:{bandage:5,medkit:4,antifrost:2,ration:1,gascan:1,notes:2,rescue:2,manual:1,flashlight:1,crowbar:1},
   3:{pistol:4,rifle:2,shotgun:1,hatchet:2,gascan:2,ration:1,repairkit:2,rescue:2,bandage:2,sample:2},
   4:{gascan:6,flashlight:2,repairkit:2,ration:2,shotgun:1,crowbar:1,rescue:2,bandage:2,sample:2},
   5:{ration:5,manual:3,notes:3,bandage:2,gascan:1,repairkit:2,rescue:2,sample:1,pistol:1},
   6:{notes:5,manual:4,sample:4,ration:1,bandage:1,flashlight:1,rescue:2,crowbar:1,gascan:1}
  };
const cardIds=Object.keys(expectedDefinitions);
const initialHuman=['ration','bandage','crowbar','pistol','canned','gascan','ration'];
const initialAI=['ration','bandage','gascan','ration','pistol','repairkit','ration'];

function baselineRandom(seed){
  let state=seed>>>0;
  return ()=>{
    state=(Math.imul(1664525,state)+1013904223)>>>0;
    return state/4294967296;
  };
}
function baselineDeck(location,random){
  const cards=Object.entries(expectedDistribution[location]).flatMap(([id,count])=>Array(count).fill(id));
  // Fisher–Yates histórico; una llamada al RNG por posición i>0.
  for(let i=cards.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [cards[i],cards[j]]=[cards[j],cards[i]];
  }
  return cards;
}
const baselineLegend=location=>{
  const totals=new Map();
  for(const [id,count] of Object.entries(expectedDistribution[location])){
    const kind=expectedDefinitions[id].kind;
    totals.set(kind,(totals.get(kind)||0)+count);
  }
  return [...totals].sort((a,b)=>b[1]-a[1]);
};

test('D1.0: los 17 ID y todas las definiciones (nombre, tipo, icono, descripción, efecto y cantidad) son idénticas al baseline',()=>{
  const f=fixture();
  assert.equal(cardIds.length,17);
  assert.deepEqual(f.state('Object.keys(catalog.definitions)'),cardIds);
  assert.deepEqual(f.state('catalog.definitions'),expectedDefinitions);
});

test('D1.0: las 8 equivalencias heredadas de categorías conservan el ID y orden de entrada',()=>{
  const f=fixture();
  assert.equal(Object.keys(expectedDefaults).length,8);
  assert.deepEqual(f.state('catalog.defaults'),expectedDefaults);
  assert.deepEqual(f.state('Object.keys(catalog.defaults)'),Object.keys(expectedDefaults));
  for(const [kind,id] of Object.entries(expectedDefaults)){
    assert.equal(f.state('catalog.resolve('+JSON.stringify(kind)+')?.id'),id);
    assert.equal(f.state('catalog.create('+JSON.stringify(kind)+').cardId'),id);
  }
});

test('D1.0: las seis distribuciones, las multiplicidades, el orden y los 120 objetos son los actuales',()=>{
  const f=fixture();
  assert.deepEqual(f.state('catalog.distribution'),expectedDistribution);
  assert.deepEqual(f.state('Object.keys(catalog.distribution)'),['1','2','3','4','5','6']);
  let total=0;
  for(let loc=1;loc<=6;loc++){
    const count=Object.values(expectedDistribution[loc]).reduce((a,b)=>a+b,0);
    assert.equal(count,20,'localidad '+loc);
    total+=count;
    assert.deepEqual(
      f.state('Object.entries(catalog.distribution['+loc+'])'),
      Object.entries(expectedDistribution[loc])
    );
  }
  assert.equal(total,120);
});

test('D1.0: resolver ID, categoría y carta plana no requiere estado de juego',()=>{
  const f=fixture();
  for(const id of cardIds){
    const actual=f.state('catalog.resolve('+JSON.stringify(id)+')');
    assert.deepEqual(actual,{id,...expectedDefinitions[id]});
    assert.deepEqual(f.state('catalog.resolve({cardId:'+JSON.stringify(id)+'})'),actual);
  }
  assert.equal(f.state('catalog.resolve({kind:"medicina"}).id'),'bandage');
  assert.equal(f.state('catalog.resolve({kind:"arma"}).id'),'pistol');
});

test('D1.0: IDs inexistentes, objetos sin ID y cardId desconocido conservan semántica',()=>{
  const f=fixture();
  for(const expr of ['catalog.resolve("no-existe")','catalog.resolve({})','catalog.resolve(null)','catalog.resolve({cardId:"no-existe",kind:"medicina"})']){
    assert.equal(f.state(expr),null,expr);
  }
  assert.deepEqual(f.state('({id:catalog.resolve({cardId:"sample",kind:"comida"}).id})'),{id:'sample'});
  assert.deepEqual(f.state('Object.keys(catalog.definitions).length'),17);
});

test('D1.0: crear cartas genera estructuras planas y conserva metadatos de búsqueda y equipamiento',()=>{
  const f=fixture();
  for(const id of cardIds){
    assert.deepEqual(f.state('catalog.create('+JSON.stringify(id)+')'),{kind:expectedDefinitions[id].kind,cardId:id});
  }
  assert.deepEqual(f.state('catalog.create("sample",{finderId:"h7",usedRound:2})'),{
    kind:'muestra',cardId:'sample',finderId:'h7',usedRound:2
  });
  assert.deepEqual(f.state('catalog.create("ration",{cardId:"manual",kind:"educacion"})'),{
    kind:'educacion',cardId:'manual'
  },'el spread de meta hoy puede sobreescribir campos: compatibilidad que no se modifica en D1.0');
});

test('D1.0: no se crean cartas desconocidas; mensaje de error histórico',()=>{
  const f=fixture();
  assert.deepEqual(f.state('(()=>{try{catalog.create("no-existe");return "sin error";}catch(e){return e.message;}})()'),'Carta desconocida no-existe');
});

test('D1.0: etiquetas incluyen el icono y nombre exactos; fallback de desconocidos',()=>{
  const f=fixture();
  for(const id of cardIds){
    const expected=expectedDefinitions[id].icon+' '+expectedDefinitions[id].name;
    assert.equal(f.state('catalog.label('+JSON.stringify(id)+')'),expected);
  }
  assert.equal(f.state('catalog.label({kind:"medicina"})'),'✚ Vendas');
  assert.equal(f.state('catalog.label({cardId:"desconocido"})'),'Objeto desconocido');
});

test('D1.0: las leyendas de localidades agregan por categoría y ordenan con criterio estable',()=>{
  const f=fixture();
  for(let loc=1;loc<=6;loc++){
    assert.deepEqual(f.state('catalog.legend('+loc+')'),baselineLegend(loc),'localidad '+loc);
  }
});

test('D1.0: definición, equivalencias y distribución tienen congelado superficial histórico',()=>{
  const f=fixture();
  assert.deepEqual(f.state('({defs:Object.isFrozen(catalog.definitions),defaults:Object.isFrozen(catalog.defaults),distribution:Object.isFrozen(catalog.distribution),entry:Object.isFrozen(catalog.definitions.ration)})'),{
    defs:true,defaults:true,distribution:true,entry:false
  });
});

for(const seed of [0,1,2654435761,1401181143]){
  test('D1.0: mazos directos, orden RNG y exactamente 19 extracciones por localidad — semilla '+seed,()=>{
    const f=fixture();
    f.seed(seed);
    const actual=f.state('Array.from({length:6},(_,i)=>catalog.deck(i+1).map(it=>it.cardId))');
    const random=baselineRandom(seed);
    const expected=Array.from({length:6},(_,i)=>baselineDeck(i+1,random));
    assert.deepEqual(actual,expected);
    assert.equal(f.state('Math.random()'),random(),'el catálogo no debe añadir consumos de azar');
  });
}

for(const seed of [1,2654435761,1401181143]){
  for(const mode of ['ai','local']){
    test('D1.0: partida inicial, manos, objetivo y mazos completos — '+mode+' / '+seed,()=>{
      const f=fixture({mode,seed});
      const actual=f.state('({mode:game.mode,objective:game.objective.name,hand:game.items.map(x=>x.cardId),botHand:game.botItems.map(x=>x.cardId),decks:Array.from({length:6},(_,i)=>game.decks[i+1].map(x=>x.cardId))})');
      const random=baselineRandom(seed);
      const objective=['Encontrar la cura','Operación antídoto','Última esperanza'][Math.floor(random()*3)];
      const decks=Array.from({length:6},(_,i)=>baselineDeck(i+1,random));
      assert.deepEqual(actual,{mode,objective,hand:initialHuman,botHand:initialAI,decks});
    });
  }
}
