// Ajustes de la sesión 3 (informe 121): noche por el camino real, D12 nocturno bajo la
// localidad, marcas de daño en fila y parpadeo constante.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createEngine} from '../test-support/horizontal-engine.mjs';
import {projectVisibleState} from '../app/mapa/estado/projection.mjs';
import {createPlayBroker} from '../app/mapa/juego/broker.mjs';
import {createEventPresentations} from '../app/mapa/experiencia/event-presentations.mjs';
import {createNightAtmosphere,nightCue,NIGHT} from '../app/mapa/experiencia/night-lights.mjs';
import {nightDieAnchor,damageBubble,damageLift,damageMarks} from '../app/mapa/experiencia/state-marks.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const tick=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};

test('Noche por el camino real: motor → broker → cola de presentaciones → atmósfera',async()=>{
 let calls=0;
 const e=createEngine({queueMicrotask(){},setTimeout:f=>{f();return 0;},Math:Object.assign(Object.create(Math),{random:()=>{calls++;return .3;}})});
 e.initialize();e.playExecute({kind:'test-rules',rule:'laNoche',value:'true'});e.playExecute({kind:'start',mode:'solo',confirmed:false});
 const c=e.testBindings,g=c.game;
 g.crossResolved=true;g.crossPending=false;g.crossRemaining=Array(32).fill(0);g.food=40;g.waste=0;
 g.zones.forEach(z=>{z.z=0;z.b=0;z.noise=0;});g.crisis.contributions=Array(g.crisis.need).fill(g.crisis.type);g.crisis.given=g.crisis.need;
 g.humans.forEach((p,i)=>{p.loc=i===0?2:0;p.wounds=0;p.frost=0;p.skill='';});
 const readPublic=()=>projectVisibleState(c,{renderedPlayable:true,epoch:1}),b=createPlayBroker(e,{session:'noche',readPublic});
 b.project(readPublic());e.subscribeCycle(change=>b.capturePresentation(change));
 // El mismo cableado que main.mjs: nightCue sobre la atmósfera real, con un reloj de prueba.
 let now=0;const night=createNightAtmosphere(),log=[];
 const signal=nightCue(kind=>{log.push(kind);if(kind==='begin')night.begin(now);else if(kind==='end')night.end(now);else night.adopt();});
 const done=[],q=createEventPresentations({start:(frame,finish)=>{signal.start(frame);done.push(finish);},stop:signal.stop,onIdle:signal.idle});
 q.update(b.snapshot());
 const revision=b.snapshot().play.revision;
 assert.equal(b.handle({type:'cycle-finish',session:'noche',revision,requestId:'fin_1'}).ok,true);await tick();
 const rolls=calls;q.update(b.snapshot());
 assert.equal(q.inspect().active?.kind,'exposure','la tirada nocturna se presenta');assert.deepEqual(log,['begin']);
 now=350;assert.equal(night.level(now),.5);now=700;assert.equal(night.level(now),1);
 now=1900;done.shift()();assert.deepEqual(log,['begin','end'],'termina cuando la cola se vacía');
 assert.equal(night.level(NIGHT.minMs-1),1,'dura al menos 2,2 s');assert.ok(night.level(NIGHT.minMs+NIGHT.dawnMs/2)>0);assert.equal(night.level(NIGHT.minMs+NIGHT.dawnMs+1),0);
 assert.equal(calls,rolls,'presentar la noche no tira');
 // Una vista recuperada (nueva sesión de presentaciones) adopta sin volver a animar.
 q.update({...b.snapshot(),epoch:99});assert.equal(q.inspect().active,null);
});

test('D12 nocturno bajo la localidad: mundo → pantalla con la cámara dibujada',()=>{
 const zone={buildingBounds:{x:100,y:200,width:80,height:60}},camera={x:10,y:-20,zoom:2},viewport={width:1365,height:768},box={width:350,height:100};
 const at=nightDieAnchor(zone,camera,viewport,box,{pin:{x:53}});
 // Centro del edificio en x = 10+140·2 = 290; base en y = −20+260·2 = 500 (+6 de separación).
 assert.deepEqual(at,{left:290-53,top:506,clamped:false});
 // Fuera de pantalla a la izquierda y abajo: se corre adentro sin mover la cámara.
 const out=nightDieAnchor(zone,{x:-900,y:400,zoom:1},viewport,box,{pin:{x:53}});
 assert.equal(out.clamped,true);assert.equal(out.left,8);assert.equal(out.top,768-8-100);
 // Bajo un panel a la derecha: queda en el área libre.
 const panel=nightDieAnchor({buildingBounds:{x:1200,y:100,width:100,height:50}},{x:0,y:0,zoom:1},viewport,box,{inset:{right:350,top:60}});
 assert.equal(panel.clamped,true);assert.ok(panel.left+box.width<=1365-350-8);assert.ok(panel.top>=60);
 assert.equal(nightDieAnchor(null,camera,viewport,box),null);assert.equal(nightDieAnchor(zone,camera,viewport,{width:0,height:0}),null);
 const view=read('app/mapa/map-view.mjs');
 assert.match(view,/night=!!sequence&&op\?\.kind==='exposure'&&!card\.hidden/,'solo tiradas nocturnas; combate y movimiento no cambian de lugar');
 assert.match(view,/inset:focusInset\(\)/);assert.match(view,/placeNightDie\(camera,viewport\);/);assert.match(view,/hidden=true;placeNightDie\(\);\}/,'al terminar vuelve a su lugar');
 assert.doesNotMatch(view.slice(view.indexOf('function placeNightDie'),view.indexOf('function placeNightDie')+900),/glideTo|change\(|Math\.random/,'no mueve la cámara ni tira');
});

test('Marcas de daño en una fila; si se tocan, la segunda sube un nivel',()=>{
 const both=damageMarks({wounds:2,frost:1});assert.deepEqual(both.map(m=>m.kind),['wound','frost'],'herida a la izquierda, congelación a la derecha');
 assert.deepEqual(damageMarks({wounds:0,frost:3}).map(m=>m.kind),['frost'],'solo si es mayor que 0');
 const one=damageBubble(30,damageMarks({wounds:2})),two=damageBubble(30,both);
 assert.ok(two.width>one.width,'fila: dos marcas son más anchas');assert.equal(two.height,one.height,'una sola fila');assert.equal(two.wide,true);
 const css=read('app/mapa/estilos/interfaz-v2.css');
 assert.match(css,/\.actor-marker>\.damage-marks\{[^}]*flex-direction:row;/);assert.match(css,/\.actor-marker>\.damage-marks::after\{[^}]*top:100%/,'punta hacia su ficha');
 // Fichas a 33 px: globos de 47 px se tocan → el segundo sube; el tercero ya no toca al segundo.
 const lift=damageLift([{id:'a',x:100,y:50,width:47,height:21},{id:'b',x:133,y:50,width:47,height:21},{id:'c',x:166,y:50,width:24,height:21}]);
 assert.deepEqual(lift,{a:0,b:1,c:0});
 assert.deepEqual(damageLift([{id:'a',x:100,y:50,width:24,height:21},{id:'b',x:140,y:50,width:24,height:21}]),{a:0,b:0},'separados: sin cambios');
 assert.deepEqual(damageLift([{id:'b',x:120,y:50,width:47,height:21},{id:'a',x:100,y:50,width:47,height:21},{id:'c',x:140,y:50,width:47,height:21}]),{a:0,b:1,c:2},'de izquierda a derecha, sin pisarse');
 const view=read('app/mapa/map-view.mjs');assert.match(view,/const lift=damageLift\(bubbles\)/);assert.match(view,/b\.box\.style\.translate=v/);
});
