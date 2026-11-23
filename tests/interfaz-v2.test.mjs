import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createEngine} from '../src/application/reference-engine.mjs';
import {createReferenceState,NOISE_LIMIT} from '../src/domain/reference-state.mjs';
import {viewCapabilities} from '../src/application/reference-contracts.mjs';
import {projectVisibleState} from '../app/mapa/estado/projection.mjs';
import {damageMarks,damageKey,noiseMarks,noiseAnchor,safeInsets,DAMAGE_SYMBOLS} from '../app/mapa/experiencia/state-marks.mjs';
import {MAP_COLOR_FILTER,cssFilter,filterMatrix,applyMatrix} from '../app/mapa/render/cold-filter.mjs';
import {focusLocality,fitMapCamera} from '../app/mapa/escena/camera.mjs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
function engineWith(prepare){let context,calls=0;const math=Object.create(Math);math.random=()=>{calls++;return .37;};const engine=createEngine({Math:math,queueMicrotask(){},stateFactory:args=>{const g=createReferenceState(args);prepare?.(g);return g;}});engine.connectPresentation(c=>{context=c;return {};});engine.start('local');return {engine,context,calls:()=>calls};}

test('Interfaz v2 · proyección: ruido y tope de fichas salen del motor',()=>{
 const t=engineWith(g=>{g.zones[2].noise=3;g.zones[5].noise=NOISE_LIMIT;}),before=t.engine.snapshot(),rng=t.calls();
 assert.equal(NOISE_LIMIT,4,'la regla no cambia: cuatro fichas por localidad');
 assert.ok(viewCapabilities.includes('noiseLimit'));assert.equal(t.context.noiseLimit,NOISE_LIMIT);
 const p=projectVisibleState(t.context,{gate:{},renderedPlayable:true,epoch:1});
 assert.equal(p.locations.length,7);
 for(const loc of p.locations){assert.equal(loc.noiseLimit,NOISE_LIMIT,loc.id);assert.equal(loc.noise,t.context.game.zones[loc.engineIndex].noise,loc.id);}
 assert.equal(p.locations[2].noise,3);assert.equal(p.locations[5].noise,4);assert.equal(p.locations[0].noise,0);
 assert.deepEqual(t.engine.snapshot(),before,'proyectar no cambia la partida');assert.equal(t.calls(),rng,'ni consume azar');
});
test('Interfaz v2 · proyección: en el pase y demás bloqueos no hay localidades ni supervivientes',()=>{
 const t=engineWith(g=>{g.zones[2].noise=2;}),real=t.context.game,hero={...real.humans[0],wounds:1,frost:2},game={...real,humans:[hero,...real.humans.slice(1)]},context=new Proxy(t.context,{get:(target,key)=>key==='game'?game:Reflect.get(target,key)});
 for(const gate of [{pass:true},{setup:true},{death:true},{modal:true}]){const p=projectVisibleState(context,{gate,renderedPlayable:true});assert.deepEqual(p.locations,[]);assert.deepEqual(p.characters,[]);assert.ok(!JSON.stringify(p).includes('noiseLimit'));}
 const open=projectVisibleState(context,{gate:{},renderedPlayable:true}),h=open.characters.find(c=>c.id===String(hero.id));
 assert.equal(h.wounds,1);assert.equal(h.frost,2);
});
test('Interfaz v2 · el motor usa el mismo tope que se proyecta',()=>{
 const source=read('src/application/reference-engine.mjs');
 assert.doesNotMatch(source,/noise\s*(>=|<)\s*4\b|Math\.min\(4,/,'sin literales del tope de ruido');
 assert.equal((source.match(/NOISE_LIMIT/g)||[]).length,6);
});

test('Interfaz v2 · daño: cada símbolo solo si su número es mayor que 0',()=>{
 assert.deepEqual(damageMarks({wounds:0,frost:0}),[],'una ficha sana no muestra nada');
 assert.deepEqual(damageMarks({}),[]);assert.deepEqual(damageMarks(null),[]);
 assert.deepEqual(damageMarks({wounds:null,frost:-1}),[]);assert.deepEqual(damageMarks({wounds:1.5,frost:'2'}),[]);
 assert.deepEqual(damageMarks({wounds:2,frost:0}).map(m=>[m.kind,m.symbol,m.count]),[['wound',DAMAGE_SYMBOLS.wound,2]]);
 assert.deepEqual(damageMarks({wounds:0,frost:1}).map(m=>[m.kind,m.symbol,m.count]),[['frost',DAMAGE_SYMBOLS.frost,1]]);
 const both=damageMarks({wounds:1,frost:3});assert.deepEqual(both.map(m=>m.kind),['wound','frost']);assert.deepEqual(both.map(m=>m.label),['1 herida','3 congelaciones']);
 assert.equal(DAMAGE_SYMBOLS.wound,'♥︎');assert.equal(DAMAGE_SYMBOLS.frost,'❄︎');
 assert.equal(damageKey(both),'wound1 frost3');assert.equal(damageKey([]),'');
});
test('Interfaz v2 · ruido: un marcador por ficha, huecos hasta el tope del motor',()=>{
 assert.equal(noiseMarks({noise:0,noiseLimit:4}),null);assert.equal(noiseMarks({noise:null,noiseLimit:4}),null);assert.equal(noiseMarks(undefined),null);
 assert.deepEqual(noiseMarks({noise:1,noiseLimit:4}),{count:1,limit:4,filled:1,empty:3,label:'Ruido 1 de 4'});
 assert.deepEqual(noiseMarks({noise:4,noiseLimit:4}),{count:4,limit:4,filled:4,empty:0,label:'Ruido 4 de 4'});
 assert.deepEqual(noiseMarks({noise:3,noiseLimit:null}),{count:3,limit:null,filled:3,empty:0,label:'Ruido 3'});
 const scene=JSON.parse(read('app/mapa/escena/scene.json'));
 for(const z of scene.zones){const a=noiseAnchor(z),b=z.buildingBounds;assert.ok(a.x>=b.x&&a.x<=b.x+b.width&&a.y>=b.y&&a.y<=b.y+b.height,z.id);}
});
test('Interfaz v2 · área libre de paneles para enfocar',()=>{
 const v={left:0,top:0,right:852,bottom:393};
 assert.deepEqual(safeInsets(v,[]),{top:0,right:0,bottom:0,left:0});
 const top={left:6,top:6,right:500,bottom:50},bottom={left:6,top:335,right:756,bottom:387},dossier={left:546,top:56,right:846,bottom:323},away={left:900,top:0,right:1000,bottom:40};
 assert.deepEqual(safeInsets(v,[top,bottom,away]),{top:50,right:0,bottom:58,left:0});
 assert.deepEqual(safeInsets(v,[top,bottom,dossier]),{top:50,right:306,bottom:58,left:0});
 assert.deepEqual(safeInsets(v,[{left:0,top:0,right:852,bottom:130},{left:0,top:260,right:852,bottom:393}]),{top:0,right:0,bottom:0,left:0},'si casi no queda mapa, se ignora');
});
test('Interfaz v2 · enfoque: sin márgenes igual que antes; con márgenes, la localidad queda en el área libre',()=>{
 const geometry=JSON.parse(read('app/mapa/escena/scene.json')),scene={...geometry,bounds:{...geometry.bounds,sourceWidth:3342,sourceHeight:1882,maxZoom:geometry.maxZoom}};
 const v={width:852,height:393},inset={top:56,right:0,bottom:64,left:0};
 for(const z of scene.zones){
  assert.deepEqual(focusLocality(scene,z.id,{...v,inset:{top:0,right:0,bottom:0,left:0}}),focusLocality(scene,z.id,v),z.id);
  const c=focusLocality(scene,z.id,{...v,inset});
  for(const [x,y]of [...z.accesses.map(a=>[a.x,a.y]),...z.portraits]){const sy=c.y+y*c.zoom,sx=c.x+x*c.zoom;assert.ok(sy>=inset.top&&sy<=v.height-inset.bottom&&sx>=0&&sx<=v.width,z.id+' '+x+','+y);}
 }
 assert.deepEqual(fitMapCamera(scene.bounds,v),fitMapCamera(scene.bounds,{...v,inset}),'la vista general usa toda la pantalla');
});

test('Interfaz v2 · filtro frío: valores aprobados y un solo lugar',()=>{
 assert.deepEqual({...MAP_COLOR_FILTER},{saturate:.5,hueRotate:-28,brightness:.85,contrast:1.05});
 assert.equal(cssFilter(MAP_COLOR_FILTER),'saturate(0.5) hue-rotate(-28deg) brightness(0.85) contrast(1.05)');assert.equal(cssFilter(null),'none');
 const id=filterMatrix(null),neutral=filterMatrix({saturate:1,hueRotate:0,brightness:1,contrast:1});
 for(let i=0;i<3;i++)for(let j=0;j<4;j++)assert.ok(Math.abs(neutral[i][j]-id[i][j])<1e-12);
 // Un gris sigue gris: saturación y tono no lo mueven; brillo y contraste sí.
 const px=new Uint8ClampedArray([128,128,128,200,255,255,255,255,242,193,78,255]);applyMatrix(px,filterMatrix(MAP_COLOR_FILTER));
 assert.deepEqual([...px.slice(0,4)],[108,108,108,200],'gris medio; el alfa no cambia');
 assert.deepEqual([...px.slice(4,7)],[221,221,221]);
 assert.ok(px[10]>78&&px[8]<242,'un amarillo cálido se enfría');
 const view=read('app/mapa/map-view.mjs');assert.equal((view.match(/withMapFilter\(/g)||[]).length,1);
 for(const css of ['maqueta','mapa','acciones','busqueda','experiencia','interfaz-v2'])assert.doesNotMatch(read('app/mapa/estilos/'+css+'.css'),/(^|[;{])\s*filter\s*:/,'el canvas no se filtra entero: '+css);
});
test('Interfaz v2 · página: hoja reversible, materiales servidos y aviso vertical',()=>{
 const html=read('app/mapa/index.html'),css=read('app/mapa/estilos/interfaz-v2.css');
 assert.match(html,/<body[^>]*data-interfaz="v2"/);assert.match(html,/href="\.\/estilos\/interfaz-v2\.css"/);assert.match(html,/id="rotate-notice"/);
 assert.ok(html.indexOf('interfaz-v2.css')>html.indexOf('experiencia.css'),'se carga al final');
 for(const file of ['chapa.jpg','nieve.png','pinos-izq.png','pinos-der.png'])if(css.includes(file))assert.match(css,new RegExp('\\.\\./\\.\\./\\.\\./assets/interfaz/'+file.replace('.','\\.')));
 assert.doesNotMatch(css,/guirnalda|garland/i);
 for(const [name,hex]of [['sangre-fria','#B5473F'],['escarcha','#7FC4E8'],['lampara','#F2C14E']])assert.match(css,new RegExp('--'+name+':'+hex));
 assert.match(css,/\.damage-wound \.damage-symbol\{color:var\(--sangre-fria\)\}/);assert.match(css,/\.damage-frost \.damage-symbol\{color:var\(--escarcha\)\}/);
 // La Lámpara solo en la fogata (moral, 109 §8) y en la opción de encrucijada enfocada (§2.1).
 const lamp=css.split(/\r?\n/).filter(l=>l.includes('var(--lampara)'));assert.equal(lamp.length,2,lamp.join(' | '));assert.ok(lamp.some(l=>l.includes('[data-resource=morale]')));assert.ok(lamp.some(l=>l.includes('.cross-choices button:hover')&&l.includes(':focus-visible')));
 for(const material of ['chapa','damage','noise'])assert.ok(!lamp.some(l=>l.includes(material)),material);
});
