// Interfaz v2, sesión 7, ajustes 2 (informe 126): residuos en peligro desde el motor, copias
// agrupadas, cartas de tamaño único, opciones alineadas, legajo y toque doble.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createEngine} from '../src/application/reference-engine.mjs';
import {createReferenceState,WASTE_LIMIT} from '../src/domain/reference-state.mjs';
import {viewCapabilities} from '../src/application/reference-contracts.mjs';
import {projectVisibleState} from '../app/mapa/estado/projection.mjs';
import {groupCopies,inventoryView,tapIntent} from '../app/mapa/juego/turn-flow.mjs';
import {legajoModel,damageBoxes,skillKind,skillStatus,DEATH_DAMAGE} from '../app/mapa/experiencia/legajo.mjs';
import {scrollEdges} from '../app/mapa/experiencia/desplazamiento.mjs';
import {cardsModel} from '../app/mapa/juego/action-bar-model.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
function engineWith(prepare,mode='local'){let context,calls=0;const math=Object.create(Math);math.random=()=>{calls++;return .37;};const engine=createEngine({Math:math,queueMicrotask(){},stateFactory:args=>{const g=createReferenceState(args);prepare?.(g);return g;}});engine.connectPresentation(c=>{context=c;return {};});engine.start(mode);return {engine,context,calls:()=>calls};}
const project=t=>projectVisibleState(t.context,{gate:{},renderedPlayable:true});

test('Ajustes 2 · residuos en peligro desde la capacidad del motor (wasteLimit), sin escribir el 10 en la interfaz',()=>{
 assert.equal(WASTE_LIMIT,10,'la regla no cambia: desde 10 residuos');
 assert.ok(viewCapabilities.includes('wasteLimit'),'capacidad de solo lectura, como noiseLimit');
 // La fase de colonia usa la constante del dominio (mismo comportamiento: −1 moral por cada 10).
 const engine=read('src/application/reference-engine.mjs');
 assert.match(engine,/if\(game\.waste>=WASTE_LIMIT\)\{const loss=Math\.floor\(game\.waste\/WASTE_LIMIT\);/);assert.doesNotMatch(engine,/game\.waste>=10/);
 const below=engineWith(g=>{g.waste=WASTE_LIMIT-1;}),at=engineWith(g=>{g.waste=WASTE_LIMIT;});
 assert.equal(at.context.wasteLimit,WASTE_LIMIT);
 assert.deepEqual(project(below).resources.waste,{count:WASTE_LIMIT-1,limit:WASTE_LIMIT,danger:false});
 const before=at.engine.snapshot(),rng=at.calls();
 assert.deepEqual(project(at).resources.waste,{count:WASTE_LIMIT,limit:WASTE_LIMIT,danger:true});
 assert.deepEqual(at.engine.snapshot(),before,'proyectar no cambia la partida');assert.equal(at.calls(),rng,'ni consume azar');
 // Con la partida bloqueada no hay recursos.
 assert.equal(projectVisibleState(at.context,{gate:{pass:true}}).resources,null);
 // La barra pinta el mismo estado que la comida (anillo y número #B5473F) y no conoce el número.
 const bar=read('app/mapa/juego/action-bar.mjs');assert.match(bar,/\[data-resource=waste\][^\n]*resources\?\.waste\?\.danger/);assert.doesNotMatch(bar,/waste[^\n]*>=\s*10/);
 assert.match(read('app/mapa/estilos/ajustes-2.css'),/\.resource\.is-danger \.resource-icon\{fill:var\(--peligro\)/);
});

test('Ajustes 2 · copias iguales agrupadas en una ficha «×N»; usar una descuenta una',()=>{
 const ration=uid=>({uid,name:'Ración de comida',description:'Agrega 1 comida a la reserva.',kind:'comida',effect:'food',quantity:1});
 const hand=[ration('r1'),{uid:'b1',name:'Vendas',description:'Cura 1 herida.',kind:'medicina',effect:'heal',quantity:1},ration('r2'),{uid:'p1',name:'Pistola',description:'Arma.',kind:'arma',effect:'equip',quantity:1}];
 const grouped=groupCopies(hand.filter(c=>c.effect!=='equip'));
 assert.deepEqual(grouped.map(c=>[c.name,c.quantity,c.uid,c.uids]),[['Ración de comida',2,'r1',['r1','r2']],['Vendas',1,'b1',['b1']]],'una ficha por carta, en el orden de su primera copia');
 const own={hand,equipment:[],options:[{cardId:'p1',mode:'use',actorId:'h0',allowed:true}]};
 assert.deepEqual(inventoryView(own,'use','h0').hand.map(c=>c.name+' ×'+c.quantity),['Ración de comida ×2','Vendas ×1']);
 // El motor quita la copia usada (r1): la próxima proyección agrupa una menos.
 assert.deepEqual(inventoryView({...own,hand:hand.filter(c=>c.uid!=='r1')},'use','h0').hand.map(c=>[c.name,c.quantity,c.uid]),[['Vendas',1,'b1'],['Ración de comida',1,'r2']],'la ficha sigue a su primera copia que queda');
 assert.equal(groupCopies([]).length,0);assert.notEqual(groupCopies(hand)[0],hand[0],'no muta la proyección');
 // La ficha actúa con la primera copia: el botón lleva su uid.
 assert.match(read('app/mapa/inventario/panel.mjs'),/b\.dataset\.inventoryUid=c\.uid/);
});

test('Ajustes 2 · cartas de tamaño único para búsqueda, «Cartas» y mochila, medidas para 220 caracteres',()=>{
 const css=read('app/mapa/estilos/ajustes-2.css');
 const [w,h]=[/--carta-w:(\d+)px/,/--carta-h:(\d+)px/].map(r=>Number(css.match(r)?.[1]));
 assert.equal(w,220);assert.ok(h>=300,'alto para el texto más largo previsto (Hacha de bombero, 220 caracteres)');
 // Un solo bloque de reglas para las tres: misma medida, misma letra (15 px), sin achicar.
 assert.match(css,/:is\(\.carta,#action-stage \.search-cards>\.search-card,#search-kept-card\)\{box-sizing:border-box;flex:0 0 var\(--carta-w\);width:var\(--carta-w\);height:var\(--carta-h\);/);
 assert.match(css,/:is\(p,\.search-card-text,span:not\(\.carta-copias\):not\(\.search-card-keep\)\)\{flex:none;margin:0;font:15px\/1\.4/);
 const phone=css.slice(css.indexOf('@media (max-height:500px)'));assert.doesNotMatch(phone,/--carta-[wh]:/,'el teléfono no cambia la medida');assert.doesNotMatch(phone,/search-card\{[^}]*font-size:1[0-4]px/);
 // Las fichas de «Cartas» y mochila usan el mismo componente; la búsqueda ya no numera las cartas.
 assert.match(read('app/mapa/inventario/panel.mjs'),/article\.className='carta'/);
 assert.doesNotMatch(read('app/mapa/busqueda/search-panel.mjs'),/'Carta '\+\(c\.index\+1\)/);
});

test('Ajustes 2 · «Mejorar dado»: un título, dados iguales en una fila y acciones abajo a la derecha',()=>{
 const panel=read('app/mapa/juego/panel.mjs');
 // El h3 repetido solo queda fuera de la interfaz unificada.
 assert.match(panel,/if\(!unified\(\)\)dialog\.append\(el\('h3',\(\{clean:'Limpiar residuos'/);
 // Dados: botones sin texto, con el dibujo de puntos y aria-pressed; nada de «seleccionado».
 assert.match(panel,/b=button\(unified\(\)\?'':'Dado '\+die\.value\+\(picked\?' · seleccionado':''\)/);
 assert.match(panel,/b\.setAttribute\('aria-pressed',String\(picked\)\)/);assert.match(panel,/paperOptions\('dice',dice\)/);
 assert.match(panel,/boost:'Mejorar · 1 comida'/);assert.match(panel,/paperActions\(confirm,cancel\)/);
 // Componente: las opciones en su grilla; la principal (una) en Lámpara y a la izquierda de «Cancelar».
 const made=[];globalThis.document={createElement:tag=>{const n={tag,className:'',dataset:{},children:[],textContent:'',classes:new Set(),append(...k){n.children.push(...k);}};n.classList={add:c=>n.classes.add(c)};made.push(n);return n;}};
 return import('../app/mapa/juego/panel.mjs').then(({paperOptions,paperActions})=>{
  const a={classes:new Set(),classList:{add(c){a.classes.add(c);}}},c={classes:new Set(),classList:{add(x){c.classes.add(x);}}};
  const row=paperActions(a,c);assert.equal(row.className,'paper-actions');assert.deepEqual(row.children,[a,c]);assert.ok(a.classes.has('is-primary'));assert.ok(!c.classes.has('is-primary'),'una sola principal');
  const opts=paperOptions('dice',[a,c]);assert.equal(opts.className,'paper-options');assert.equal(opts.dataset.options,'dice');
  assert.deepEqual(paperActions(null,c).children,[c],'un papel puede no tener principal');
  const css=read('app/mapa/estilos/ajustes-2.css');
  assert.match(css,/:is\(\.die-choice,\.search-die\)\{box-sizing:border-box;width:58px;height:58px;/,'casillas cuadradas iguales');
  assert.match(css,/:is\(\.die-choice,\.search-die\)\[aria-pressed=true\]\{outline:4px solid var\(--lampara\)/,'el elegido con borde Lámpara');
  assert.match(css,/:is\(\.paper-actions,\.search-buttons\)\{display:flex;flex-wrap:wrap;justify-content:flex-end;/,'acciones abajo a la derecha');
  delete globalThis.document;
 });
});

test('Ajustes 2 · toque: el primero selecciona, uno sobre el activo abre el legajo, nunca una acción',()=>{
 assert.equal(tapIntent(null,'h0'),'select','sin elegido, el primer toque elige');
 assert.equal(tapIntent('h1','h0'),'select','otro superviviente: se elige');
 assert.equal(tapIntent('h0','h0'),'dossier','el activo: se abre su expediente');
 assert.equal(tapIntent('h0','h0',{blocked:true}),null,'en el pase de dispositivo no se abre');
 assert.equal(tapIntent('h0',null),null);
 const view=read('app/mapa/map-view.mjs'),fn=view.slice(view.indexOf(' function tapCharacter('),view.indexOf('\n',view.indexOf(' function tapCharacter(')));
 assert.match(fn,/tapIntent\(selected,id,\{blocked:!!projection\?\.blocked\|\|!active\}\)/,'activo = el elegido; bloqueado en el pase');
 assert.match(fn,/if\(intent==='dossier'\)\{dossierTab='survivor';if\(!panelTarget\)panel\(true\);updateUI\(\);return;\}/,'abre la pestaña Superviviente');
 assert.doesNotMatch(fn,/submit|dispatch|begin|confirm|chooseDie/,'ningún toque ejecuta acciones ni consume azar');
 assert.match(view,/onSelect:id=>tapCharacter\(id\)/,'círculos del grupo flotante');assert.match(view,/if\(target\.characterId\)tapCharacter\(target\.characterId\);/,'fichas del mapa (el toque ya identifica la ficha encimada)');
 assert.match(view,/listen\('#bar-portrait','click',\(\)=>\{if\(barGuard\('portrait'\)\)barDetail\(\);\}\)/,'el retrato sigue abriéndolo');
});

test('Ajustes 2 · legajo: sello de guardia, medallones, daño hasta el límite, habilidad visible y ranuras',()=>{
 const c={id:'h0',name:'Mara',job:'Médica',playerId:'human',locationId:'place-2',leader:true,influence:76,effectiveAttack:4,effectiveSearch:3,wounds:1,frost:1,night:{outside:true,watch:true},skill:{id:'medic',name:'Primeros auxilios',description:'Una vez por ronda cura 1 herida.',used:false},equipment:[{name:'Pistola',kind:'arma'}]};
 const p={locations:[{id:'place-2',name:'Hospital'}]},m=legajoModel(c,p,{playerName:()=>'Tu grupo'});
 assert.equal(m.role,'Líder');assert.equal(m.place,'Hospital');assert.equal(m.group,'Tu grupo');assert.equal(m.guard,true);
 assert.deepEqual(m.medals.map(([k,v])=>k+v),['Influencia76','Ataque4','Búsqueda3']);
 assert.deepEqual(m.damage.boxes,['wound','frost','empty']);assert.equal(m.damage.limit,3);
 assert.deepEqual(m.skill,{name:'Primeros auxilios',text:'Una vez por ronda cura 1 herida.',kind:'button',kindLabel:'Botón',status:'Disponible esta ronda'});
 assert.deepEqual(m.slots.map(s=>s.kind+':'+s.items.join()),['herramienta:','arma:Pistola','educacion:']);
 assert.equal(m.art,null);assert.equal(m.story,null,'sin datos de historia: no se muestran');
 assert.match(m.number,/^\d{3}$/);assert.equal(legajoModel(c,p).number,m.number,'el número no cambia entre lecturas');
 assert.equal(legajoModel({...c,night:{outside:true,watch:false}},p).guard,false);assert.equal(legajoModel({...c,night:null},p).outside,false);
 assert.equal(skillKind('resilient'),'reaction');assert.equal(skillKind('scout'),'automatic');assert.equal(skillStatus({id:'scout'}),'Siempre activa');assert.equal(skillStatus({id:'nurse',used:true}),'Ya usada esta ronda');
 assert.deepEqual(damageBoxes({wounds:0,frost:0}),['empty','empty','empty']);
 // El límite de muerte es el del motor (todavía un 3 literal, hallazgo 26): si el motor cambia, esto falla.
 assert.equal(DEATH_DAMAGE,3);assert.match(read('src/domain/map-exposure.mjs'),/if\(p\.frost\+p\.wounds>=3\)ctx\.kill/);
 const html=read('app/mapa/index.html'),card=html.slice(html.indexOf('<section id="character-card"'),html.indexOf('</section>',html.indexOf('legajo-historia'))+10);
 for(const id of ['portrait','character-name','character-identity','legajo-rol','character-location','character-group','character-night','influence','combat','search','legajo-casillas','character-state','character-skill','legajo-habilidad-estado','legajo-equipo','legajo-historia'])assert.ok(card.includes('id="'+id+'"'),id);
 assert.ok(!card.includes('<details'),'la habilidad no va plegada');
 // Sello de guardia en tinta azul oscura, no rojo.
 assert.match(read('app/mapa/estilos/ajustes-2.css'),/\.legajo-sello\{[^}]*border:3px double #1F3A5C;color:#1F3A5C/);
 // Sin «Dados de tu grupo» ni desplegable visible: el selector queda para teclado y lector.
 assert.match(html,/<section class="dice-section" aria-label="Reserva de dados" hidden="">/);
 assert.match(html,/<label id="character-navigation" class="v2-sr">/);
 assert.match(html,/<nav id="dossier-tabs"[^>]*>(<button[^>]*data-tab="(survivor|backpack|colony|registry)"[^>]*>[^<]+<\/button>){4}<\/nav>/,'cuatro pestañas en orden');
});

test('Ajustes 2 · textos: objetivo con ronda, crisis con artículo y papel que avisa si hay más abajo',()=>{
 const p={blocked:null,round:1,maxRounds:10,objective:{name:'Última esperanza',samples:0,goal:9},crisis:null};
 assert.equal(cardsModel(p).objective.progress,'0 de 9 muestras · ronda 1 de 10');
 assert.match(read('app/mapa/map-view.mjs'),/wound:p\.characters\.some\(ch=>ch\.locationId==='place-0'\)\?'1 herida al de menor influencia en la colonia'/);
 assert.equal(scrollEdges({scrollTop:0,scrollHeight:900,clientHeight:500}),'bottom');
 assert.equal(scrollEdges({scrollTop:200,scrollHeight:900,clientHeight:500}),'both');
 assert.equal(scrollEdges({scrollTop:400,scrollHeight:900,clientHeight:500}),'top');
 assert.equal(scrollEdges({scrollTop:0,scrollHeight:500,clientHeight:500}),'none');
 assert.match(read('app/mapa/estilos/ajustes-2.css'),/:is\(\[data-scroll=bottom\],\[data-scroll=both\]\)>\.scroll-more\{visibility:visible\}/);
});
