import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {crossResultFor} from '../app/mapa/juego/crossroads-view.mjs';
import {localityLabelAnchor,labelVisible,LABEL_WAKE_MS} from '../app/mapa/experiencia/state-marks.mjs';
import {EXIT_MS} from '../app/mapa/experiencia/transitions.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Sesión 2 · chapas de recursos: cuatro, una sola de indefensos, fogata en Lámpara',()=>{
 const html=read('app/mapa/index.html'),css=read('app/mapa/estilos/interfaz-v2.css'),view=read('app/mapa/map-view.mjs');
 const chips=[...html.matchAll(/data-resource="([a-z]+)"/g)].map(m=>m[1]);
 assert.deepEqual(chips,['morale','food','helpless','waste']);
 assert.doesNotMatch(html,/adult|chico|niño/i,'sin distinción adulto/chico: el motor da un solo número');
 for(const id of ['round','turn','hunger','morale','food','helpless','waste'])assert.match(html,new RegExp('<dd id="'+id+'">'));
 assert.equal((html.match(/class="resource-icon"/g)||[]).length,4);assert.doesNotMatch(html,/<img[^>]*resource|resource[^>]*\.(png|jpg|svg)"/,'íconos SVG propios, sin imágenes');
 assert.match(css,/\[data-resource=morale\] \.resource-icon\{fill:var\(--lampara\)/);
 assert.match(view,/\$\('helpless'\)\.textContent=value\(p\.play\?\.statistics\?\.helpless\?\?p\.locations\[0\]\?\.helpless\)/,'el número viene de la proyección');
});

test('Sesión 2 · rótulos de localidad: interacción, desvanecido y selección',()=>{
 const scene=JSON.parse(read('app/mapa/escena/scene.json'));
 for(const z of scene.zones){const a=localityLabelAnchor(z),b=z.buildingBounds;assert.ok(a,z.id);if(!z.portraitGroup)assert.ok(a.x>=b.x&&a.x<=b.x+b.width&&a.y>=b.y&&a.y<=b.y+b.height,z.id);}
 assert.deepEqual(localityLabelAnchor(scene.zones.find(z=>z.id==='colonia')),scene.zones.find(z=>z.id==='colonia').portraitGroup.labelPosition);
 assert.ok(LABEL_WAKE_MS>=2000&&LABEL_WAKE_MS<=5000,'unos segundos');
 assert.equal(labelVisible({id:'place-2',selectedId:null,awakeUntil:1000,now:999}),true);
 assert.equal(labelVisible({id:'place-2',selectedId:null,awakeUntil:1000,now:1000}),false,'se desvanece sin interacción');
 assert.equal(labelVisible({id:'place-2',selectedId:'place-2',awakeUntil:0,now:5000}),true,'la seleccionada conserva el suyo');
 const view=read('app/mapa/map-view.mjs');
 for(const trigger of ["canvas.addEventListener('pointerdown',wakeLabels","function interact(next){glide=null;wakeLabels();","if(camera&&performance.now()>labelsAwakeUntil-LABEL_WAKE_MS+250)wakeLabels();"])assert.ok(view.includes(trigger),trigger);
 assert.ok(!view.includes("'locality-group-label'"),'un solo sistema de rótulos');
 assert.ok(view.includes("noiseMarks(loc)"),'los marcadores de ruido de la sesión 1 siguen');
});

test('Sesión 2 · transiciones: 150–250 ms, movimiento reducido, sin retrasar acciones',()=>{
 const css=read('app/mapa/estilos/interfaz-v2.css'),view=read('app/mapa/map-view.mjs'),tr=read('app/mapa/experiencia/transitions.mjs');
 assert.ok(EXIT_MS>=150&&EXIT_MS<=250);assert.match(css,/--v2-in:200ms/);assert.match(css,/transition:opacity 220ms/);assert.match(view,/GLIDE_MS=220/);
 const animated=css.slice(css.indexOf('@media (prefers-reduced-motion:no-preference)'));assert.ok(animated.indexOf('animation:v2-in')>0,'las entradas solo sin movimiento reducido');
 assert.doesNotMatch(css.slice(0,css.indexOf('@media (prefers-reduced-motion:no-preference)')),/animation:v2-in|transition:opacity/);
 assert.match(tr,/if\(reducedMotion\(\)\|\|/);assert.match(tr,/ghost\.inert=true/);assert.match(css,/\.exit-ghost\{[^}]*pointer-events:none/);
 assert.match(tr,/\(id\|for\|name\|role\|tabindex\|href\|aria-\.\*\|data-\.\*\|on\.\*\)/,'la copia no conserva ids ni datos');
 // La salida oculta el elemento real en el mismo paso: la copia se crea antes y no espera.
 assert.match(tr,/if\(value&&!own\.get\.call\(this\)\)exitGhost\(frame\|\|this\);own\.set\.call\(this,value\);/);
 assert.match(read('app/mapa/map-view.mjs'),/animateExits\(\[\[\$\('panel-content'\),\$\('dossier'\)\]/,'la ficha sale entera, con su fondo');
 assert.match(tr,/if\(this\.open\)exitGhost\(this\);return close\.apply\(this,args\);/);
 // El deslizamiento de cámara solo cambia el dibujo; la lógica usa la cámara final y un toque lo corta.
 assert.match(view,/glide=null;change\(next\);/);assert.match(view,/function interact\(next\)\{glide=null;/);assert.match(view,/camera:shown/);
 assert.match(view,/document\.body\.dataset\.motion=\$\('motion-reduced'\)\.checked\?'reduced':'normal'/);
});

test('Sesión 2 · encrucijada: consecuencias solo después de decidir',()=>{
 const panel=read('app/mapa/juego/panel.mjs');
 assert.doesNotMatch(panel,/ch\[0\]\+' — '\+ch\[1\]/,'los botones no muestran la consecuencia');
 assert.match(panel,/button\(ch\[0\]\+\(d\.automated/);assert.ok(panel.includes("b.title='No disponible con lo que tiene el grupo ahora.'"),'la opción apagada se explica sin revelar la consecuencia');
 assert.match(panel,/button\('Continuar','play-cross-continue',\(\)=>\{crossResult=null;render\(\);\}\)/,'continuar no llama al motor');
 const play={generation:3,events:[{id:'e1',type:'cross',title:'La caja de municiones',choice:'Tomar el arma',effect:'Obtenés una escopeta y 1 ruido en la comisaría.'},{id:'e2',type:'death'}]};
 const pending={title:'La caja de municiones',story:'Un depósito…',generation:3,known:new Set()};
 assert.deepEqual(crossResultFor(pending,play),{title:'La caja de municiones',story:'Un depósito…',choice:'Tomar el arma',effect:'Obtenés una escopeta y 1 ruido en la comisaría.',generation:3});
 assert.equal(crossResultFor({...pending,known:new Set(['e1'])},play),null,'un evento anterior no es el resultado');
 assert.equal(crossResultFor({...pending,title:'Otra'},play),null);assert.equal(crossResultFor(null,play),null);assert.equal(crossResultFor(pending,null),null);
 const view=read('app/mapa/juego/crossroads-view.mjs');assert.match(view,/cross-safe/);assert.doesNotMatch(view,/\.(png|jpg|webp)/,'sin ilustraciones nuevas');
 assert.ok(view.indexOf("'cross-result'")<view.indexOf("'cross-story'"),'la barra de resultado va debajo de la viñeta');
});

test('Sesión 2 · dados de acción con puntos; el D12 no cambia',()=>{
 const panel=read('app/mapa/juego/panel.mjs'),view=read('app/mapa/juego/crossroads-view.mjs');
 assert.match(panel,/b\.prepend\(dieDrawing\(die\.value\)\)/);assert.match(view,/import \{dieFace\} from '\.\.\/movimiento\/dice\.mjs'/);
 assert.doesNotMatch(view,/import[^;]*(exposure|d12)/i,'la viñeta y los dados de acción no usan el D12');
});
