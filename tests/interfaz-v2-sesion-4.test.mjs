// Interfaz v2, sesión 4 (informe 122): barra de acción, tarjetas, recurso en peligro, papel
// viejo con manchas y transiciones de paneles.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createEngine} from '../src/application/reference-engine.mjs';
import {createReferenceState} from '../src/domain/reference-state.mjs';
import {viewCapabilities} from '../src/application/reference-contracts.mjs';
import {createEngine as createMapEngine} from '../test-support/horizontal-engine.mjs';
import {projectVisibleState} from '../app/mapa/estado/projection.mjs';
import {createPlayBroker} from '../app/mapa/juego/broker.mjs';
import {actionBarModel,cardsModel,spentDice,trackDice,createClickGuard} from '../app/mapa/juego/action-bar-model.mjs';
import {buildPaper,decodePixels,stainPlacement,STAINS,BLOOD,DIR,CSS,VARIANTS} from '../scripts/generar-papel.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8'),bytes=path=>readFileSync(new URL('../'+path,import.meta.url));
function engineWith(prepare,mode='local'){let context,calls=0;const math=Object.create(Math);math.random=()=>{calls++;return .37;};const engine=createEngine({Math:math,queueMicrotask(){},stateFactory:args=>{const g=createReferenceState(args);prepare?.(g);return g;}});engine.connectPresentation(c=>{context=c;return {};});engine.start(mode);return {engine,context,calls:()=>calls};}

test('Sesión 4 · recurso en peligro: lo que el motor pedirá de comida, con su misma condición',()=>{
 assert.ok(viewCapabilities.includes('feedingNeed'),'capacidad de solo lectura, como noiseLimit');
 // La presentación no puede cambiar la partida: la comida se prepara en el estado inicial.
 const probe=engineWith(),need=probe.context.feedingNeed(probe.context.game);assert.ok(need>0);
 const enough=engineWith(g=>{g.food=need;}),short=engineWith(g=>{g.food=need-1;});
 assert.throws(()=>{short.context.game.food=99;},/no puede modificar/,'contexto de solo lectura');
 assert.deepEqual(projectVisibleState(enough.context,{gate:{},renderedPlayable:true}).resources.food,{need,danger:false},'alcanza justo');
 const t=short,before=t.engine.snapshot(),rng=t.calls();
 assert.deepEqual(projectVisibleState(t.context,{gate:{},renderedPlayable:true}).resources.food,{need,danger:true});
 // Es la condición de la fase de colonia del motor (la comida alcanza si food>=need).
 assert.match(read('src/application/reference-engine.mjs'),/const need=feedingNeed\(game\);[\s\S]{0,200}if\(game\.food>=need\)/);
 assert.match(read('app/mapa/estado/projection.mjs'),/danger:need!==null&&food!==null&&!\(food>=need\)/);
 assert.deepEqual(t.engine.snapshot(),before,'proyectar no cambia la partida');assert.equal(t.calls(),rng,'ni consume azar');
 for(const gate of [{pass:true},{setup:true},{death:true},{modal:true}])assert.equal(projectVisibleState(t.context,{gate,renderedPlayable:true}).resources,null);
 // Residuos: el umbral es un literal dentro del motor (game.waste>=10); no se expone ni se inventa.
 assert.doesNotMatch(read('app/mapa/estado/projection.mjs'),/waste/);
});

test('Sesión 4 · privacidad del pase: la barra y las tarjetas quedan vacías',()=>{
 const t=engineWith();
 for(const gate of [{pass:true},{setup:true},{death:true},{modal:true}]){
  const p=projectVisibleState(t.context,{gate,renderedPlayable:true}),bar=actionBarModel(p,{selectedId:'h0',chosenIndex:0}),cards=cardsModel(p);
  assert.equal(bar.actor,null);assert.deepEqual(bar.dice,[]);assert.equal(bar.own,false);assert.deepEqual(cards,{objective:null,crisis:null});
  assert.ok(!JSON.stringify(bar).match(/"value"|wounds|frost/),'sin dados ni datos de supervivientes');
 }
 // Con la partida abierta, el dueño ve sus dados del motor.
 const open=projectVisibleState(t.context,{gate:{},renderedPlayable:true}),bar=actionBarModel(open,{});
 assert.deepEqual(bar.dice.map(d=>d.value),[...t.context.controls.dice()]);assert.ok(bar.actor);
});

test('Sesión 4 · barra: superviviente activo, vista previa y textos de las tarjetas',()=>{
 const p={blocked:null,round:2,turn:'human',ended:false,maxRounds:8,players:[{id:'human',leaderId:'h1'}],locations:[{id:'place-0',name:'Colonia'},{id:'place-2',name:'Hospital'}],
  characters:[{id:'h0',name:'Mara',job:'Médica',playerId:'human',locationId:'place-2',wounds:2,frost:1,leader:false},{id:'h1',name:'Leo',job:'Cocinero',playerId:'human',locationId:'place-0',wounds:0,frost:0,leader:true}],
  dice:{available:[3,5]},play:{events:[]},objective:{name:'Encontrar la cura',samples:4,goal:7},crisis:{type:'medicina',need:2,given:1}};
 const preview=actionBarModel(p,{});assert.equal(preview.actor.id,'h1','sin selección: el líder del grupo en turno');assert.equal(preview.preview,true);assert.equal(preview.own,true);
 const chosen=actionBarModel(p,{selectedId:'h0',chosenIndex:1});assert.equal(chosen.preview,false);assert.equal(chosen.actor.location,'Hospital');
 assert.deepEqual(chosen.actor.damage.map(d=>d.kind+d.count),['wound2','frost1']);assert.deepEqual(chosen.dice.map(d=>d.chosen),[false,true]);
 assert.deepEqual(cardsModel(p),{objective:{title:'Encontrar la cura',progress:'4 de 7 muestras · R8',ratio:4/7},crisis:{title:'Crisis',progress:'2 medicinas · 1 de 2',ratio:.5}});
 assert.equal(cardsModel({...p,crisis:{type:'combustible',need:1,given:0}}).crisis.progress,'1 combustible · 0 de 1');
 assert.equal(actionBarModel({...p,turn:'ai'},{selectedId:'h0'}).own,false,'fuera de turno no actúa');
});

test('Sesión 4 · dados: el usado pasa a gris donde estaba, con los eventos del motor',()=>{
 assert.deepEqual(spentDice([{type:'die',value:4},{type:'round'},{type:'die',value:3},{type:'move'},{type:'die',value:6}]),[3,6]);
 assert.deepEqual(spentDice([{type:'die',value:2},{type:'turn'}]),[]);
 const first=trackDice(null,[3,5,6,2],[]);
 const after=trackDice(first,[5,6,2],[3]);assert.deepEqual(after.map(d=>d.key+':'+d.value+(d.used?'u':'')),['d0:3u','d1:5','d2:6','d3:2'],'mismo lugar, ahora usado');
 const twice=trackDice(after,[5,2],[3,6]);assert.deepEqual(twice.map(d=>d.value+(d.used?'u':'')),['3u','5','6u','2']);
 assert.equal(trackDice(twice,[4,4,1],[]).length,3,'otra ronda: se arma de nuevo');
 // Camino real: el motor gasta un dado (Regresar a la colonia) y la proyección del broker lo muestra usado.
 let calls=0;const e=createMapEngine({queueMicrotask(){},setTimeout:f=>{f();return 0;},Math:Object.assign(Object.create(Math),{random:()=>{calls++;return .8;}})});
 e.initialize();e.playExecute({kind:'test-rules',rule:'regreso',value:'true'});e.playExecute({kind:'start',mode:'solo',confirmed:false});
 const c=e.testBindings,g=c.game;g.crossResolved=true;g.crossPending=false;g.crossRemaining=Array(32).fill(0);g.food=40;g.dice=[2,5];g.humans.forEach((h,i)=>{h.loc=i===0?2:0;h.skill='';});
 const read=()=>projectVisibleState(c,{renderedPlayable:true,epoch:1}),b=createPlayBroker(e,{session:'s4',readPublic:read});b.project(read());
 const before=actionBarModel(b.snapshot(),{selectedId:'h0'});assert.deepEqual(before.dice.map(d=>d.value+(d.used?'u':'')),['2','5']);
 const d=e.playSnapshot().options.h0['return-home'].dice[0],rng=calls;
 const r=b.handle({type:'play-command',session:'s4',revision:b.snapshot().play.revision,requestId:'r1',kind:'return-home',actorId:'h0',dieId:d.id,dieIndex:d.index,dieValue:d.value});assert.equal(r.ok,true);
 // Mientras el recibo está abierto el broker oculta los dados (barrera); el panel lo confirma.
 assert.equal(b.snapshot().dice.available,null);
 assert.equal(b.handle({type:'play-command',session:'s4',revision:b.snapshot().play.revision,requestId:'r2',kind:'ack',receiptId:b.snapshot().play.receipt.id}).ok,true);
 const now=actionBarModel(b.snapshot(),{selectedId:'h0',previousDice:before.dice});
 assert.deepEqual(now.dice.map(x=>x.value+(x.used?'u':'')),[d.value===2?'2u':'2',d.value===5?'5u':'5']);assert.equal(calls,rng,'mostrar el dado no tira');
 // Repetir la misma solicitud (doble clic o recuperación) no gasta otro dado.
 b.handle({type:'play-command',session:'s4',revision:b.snapshot().play.revision,requestId:'r1',kind:'return-home',actorId:'h0',dieId:d.id,dieIndex:d.index,dieValue:d.value});
 assert.equal(g.dice.length,1);assert.equal(spentDice(b.snapshot().play.events).length,1);
});

test('Sesión 4 · doble clic: la barra no activa dos veces el mismo control',()=>{
 let t=0;const guard=createClickGuard({ms:450,now:()=>t});
 assert.equal(guard('search-action'),true);t=30;assert.equal(guard('search-action'),false,'segundo clic del doble clic');assert.equal(guard('move-action'),true,'otro control sí');
 t=500;assert.equal(guard('search-action'),true,'pasado el instante, vuelve a responder');
 const view=read('app/mapa/map-view.mjs');
 assert.match(view,/function barAct\(source\)\{if\(!barGuard\(source\)/);
 assert.match(view,/const b=\$\(source\);if\(b&&!b\.disabled\)b\.click\(\);\}/,'usa el botón de la ficha: mismos controladores y validaciones');
 assert.match(view,/listen\('#bar-more','click',\(\)=>\{if\(!barGuard\('more'\)\)return;/);
 assert.doesNotMatch(read('app/mapa/juego/action-bar.mjs')+read('app/mapa/juego/action-bar-model.mjs'),/Math\.random|send\(|handle\(/,'la barra no tira ni manda comandos');
});

test('Sesión 4 · transiciones: solo opacity y transform, interrumpibles, y movimiento reducido',async()=>{
 const css=read('app/mapa/estilos/papel.css'),tr=read('app/mapa/experiencia/transitions.mjs');
 const motion=css.slice(css.indexOf('@keyframes v2-slide'));
 assert.match(motion,/@keyframes v2-slide\{from\{opacity:0;translate:var\(--v2-shift,0 8px\)\}\}/);
 // Solo dentro de «sin preferencia de movimiento reducido» y sin el ajuste del juego.
 const animated=css.slice(css.indexOf('@media (prefers-reduced-motion:no-preference)'));assert.match(animated,/animation:v2-slide var\(--v2-in\) ease-out/);
 assert.doesNotMatch(css.slice(0,css.indexOf('@media (prefers-reduced-motion:no-preference)')),/animation:|transition:/);
 for(const rule of css.match(/transition:[^;}]*/g))assert.match(rule,/transition:(opacity|transform) \d+ms/,rule);
 assert.doesNotMatch(css,/will-change/,'will-change solo durante la transición, desde el código');
 for(const shift of css.match(/--v2-shift:[^;}]*/g)){const n=Math.max(...shift.match(/\d+/g).map(Number));assert.ok(n>=8&&n<=12,shift);}
 assert.match(tr,/export const ENTER_MS=200,SWAP_MS=200;/);assert.match(css,/transition:transform 300ms ease-out/,'barra de progreso');
 assert.match(tr,/startOpacity=Number\(now\.opacity\)\|\|1/,'la salida parte desde donde estaba');assert.match(tr,/willChange:'opacity, translate'/);
 // Con movimiento reducido no hay copia, ni fundido, ni pulso: el cambio es instantáneo.
 const body={dataset:{motion:'reduced'}};globalThis.document={body};globalThis.matchMedia=()=>({matches:false});
 try{
  const {exitGhost,crossfade,fadeIn,pulse,reducedMotion}=await import('../app/mapa/experiencia/transitions.mjs');
  assert.equal(reducedMotion(),true);let applied=0;const el={isConnected:true,getClientRects:()=>[1],getBoundingClientRect:()=>({width:10,height:10}),getAnimations:()=>[],animate(){throw Error('no debe animar');}};
  globalThis.getComputedStyle=()=>({opacity:'0.4',getPropertyValue:()=>'0 10px',translate:'none'});
  assert.equal(crossfade(el,()=>applied++),false);assert.equal(applied,1);assert.equal(fadeIn(el),null);assert.equal(pulse(el),null);assert.equal(exitGhost(el),null);
 }finally{delete globalThis.document;delete globalThis.matchMedia;delete globalThis.getComputedStyle;}
});

test('Sesión 4 · papel y manchas: generados una vez, con semilla, en esquinas y en capa aparte',()=>{
 const one=buildPaper(),two=buildPaper();assert.equal(one.css,two.css);
 for(const [name,image]of Object.entries(one.files)){assert.deepEqual(image.data,two.files[name].data,name);const saved=decodePixels(bytes(DIR+'/'+name));assert.deepEqual([saved.width,saved.height],[image.width,image.height]);assert.ok(Buffer.from(saved.data).equals(Buffer.from(image.data)),'recurso al día: '+name);}
 assert.equal(read(CSS),one.css,'manchas.css al día');
 const total=Object.keys(one.files).reduce((n,name)=>n+bytes(DIR+'/'+name).length,0);assert.ok(total<64*1024,'peso total razonable: '+total);
 assert.doesNotMatch(read('scripts/generar-papel.mjs').replace('nunca Math.random',''),/Math\.random/);assert.deepEqual(Object.keys(VARIANTS),['barra','tarjeta','ficha'],'tres variantes');
 // Sangre seca: marrón oxidado oscuro, lejos del rojo de señal (#B5473F) en brillo y saturación.
 const sat=([r,g,b])=>(Math.max(r,g,b)-Math.min(r,g,b))/Math.max(r,g,b),lum=([r,g,b])=>.2126*r+.7152*g+.0722*b,signal=[181,71,63];
 assert.ok(lum(BLOOD.color)<lum(signal)*.75&&sat(BLOOD.color)<sat(signal),'no se lee como herida');
 // Una mancha por panel, en una esquina; la de Crisis es la más grande.
 for(const name of Object.keys(STAINS)){const p=stainPlacement(name);assert.match(p.corner,/^(top|bottom)-(left|right)$/);assert.ok(p.gutter<=40);}
 assert.ok(STAINS.crisis.size>Math.max(STAINS.barra.size,STAINS.objetivo.size,STAINS.ficha.size));
 const html=read('app/mapa/index.html');for(const name of Object.keys(STAINS))assert.equal(html.split(`data-mancha="${name}"`).length-1,1,name);
 assert.match(html,/<link rel="stylesheet" href="\.\/estilos\/papel\.css"><link rel="stylesheet" href="\.\/estilos\/manchas\.css">/);
 // Capa aparte: el papel es ::before; la mancha es su propio elemento, debajo del contenido.
 const css=read('app/mapa/estilos/papel.css');assert.match(css,/#map-app \.mancha\{position:absolute;z-index:-1;pointer-events:none\}/);
 // La nieve queda solo en el mapa.
 assert.doesNotMatch(read('app/mapa/estilos/interfaz-v2.css')+css,/nieve\.png/);
});

test('Sesión 4 · estructura: la barra conserva los ids del turno y la ficha su contenido',()=>{
 const html=read('app/mapa/index.html'),bar=html.slice(html.indexOf('<section id="action-bar"'),html.indexOf('<section id="connection-banner"'));
 for(const id of ['bar-portrait','bar-name','bar-role','bar-location','bar-damage','bar-dice','bar-search','bar-attack','bar-move','bar-more','turn-cycle-controls','finish-turn','cycle-status','final-new-game','review-final'])assert.ok(bar.includes(`id="${id}"`),id);
 for(const id of ['search-action','attack-action','move-action','dice-pool','character-card','public-objective','public-crisis','crisis-contribute','objective-details','crisis-details'])assert.equal(html.split(`id="${id}"`).length-1,1,id);
 assert.match(read('app/mapa/estilos/papel.css'),/--fuente-texto:'Alegreya Sans',Georgia,'Times New Roman',serif;/);
});
