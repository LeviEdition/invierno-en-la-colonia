// Interfaz v2, sesión 7, ajustes 3 (informe 126): lo que el recorrido completo de baterías encontró
// en el juego (casillas tapadas, toques comidos por el anti-doble-toque) y dos detalles del legajo.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createClickGuard} from '../app/mapa/juego/action-bar-model.mjs';
import {safeInsets} from '../app/mapa/experiencia/state-marks.mjs';
import {constrainCamera} from '../app/mapa/escena/camera.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Ajustes 3 · el anti-doble-toque sigue frenando la repetición, pero se libera si otro control deshizo lo hecho',()=>{
 let now=0;const guard=createClickGuard({ms:450,now:()=>now});
 assert.equal(guard('portrait'),true);now=100;assert.equal(guard('portrait'),false,'doble toque: no repite');
 guard.release('portrait');assert.equal(guard('portrait'),true,'cerrado con «×»: el retrato vuelve a abrir enseguida');
 now=200;assert.equal(guard('portrait'),false,'y vuelve a frenar la repetición');
 guard.release('nunca-usado');assert.equal(guard('more'),true,'liberar una clave ajena no rompe nada');
 const view=read('app/mapa/map-view.mjs');
 assert.match(view,/listen\('#panel-toggle','click',\(\)=>\{if\(!portraitClosing\)barGuard\.release\('portrait'\);/,'«×» libera el retrato; el retrato al cerrar, no');
 assert.equal((view.match(/barGuard\.release\('more'\)/g)||[]).length,3,'«Más» se libera al elegir, al tocar fuera y con Esc');
});

test('Ajustes 3 · el grupo flotante cuenta para encuadrar y deja subir el borde inferior del mapa',()=>{
 const view=read('app/mapa/map-view.mjs');
 assert.match(view,/'#action-bar','#bar-group','\.map-tools'/,'focusInset mide el grupo flotante');
 assert.match(view,/slack\.bottom=Math\.max\(0,box\.bottom-r\.top\)/,'margen inferior por el grupo');
 assert.match(view,/for\(const el of \[d,\$\('public-summaries'\)\]\)/,'Objetivo y Crisis dan margen lateral, como la ficha');
 // 1365×768 con 36 supervivientes: el grupo ocupa 638–682 encima de la barra (690–762).
 const box={left:0,top:0,right:1365,bottom:768},inset=safeInsets(box,[{left:6,top:690,right:1359,bottom:762},{left:46,top:638,right:974,bottom:682}]);
 assert.equal(inset.bottom,130,'el área libre termina arriba del grupo');
 // Con el margen, un acceso al pie del mundo puede quedar arriba del grupo.
 const b={x:0,y:0,width:1671,height:941,maxZoom:1.5},v={width:1365,height:768},want={zoom:1,x:0,y:-300};
 assert.equal(constrainCamera(want,b,v).y,768-941,'sin margen, el borde del mundo frena');
 assert.equal(constrainCamera(want,b,{...v,slack:{bottom:130}}).y,-300,'con margen llega');
});

test('Ajustes 3 · legajo: cruz visible en papel, «Más abajo» si no entra y «Ya se movió» en su línea',()=>{
 const css=read('app/mapa/estilos/ajustes-2.css'),html=read('app/mapa/index.html'),view=read('app/mapa/map-view.mjs');
 assert.match(css,/#dossier #panel-toggle\{background-color:#F3E9D2;background-image:none;color:var\(--tinta\);border:2px solid var\(--tinta\)/);
 assert.match(html,/<p class="scroll-more" aria-hidden="true">Más abajo<\/p><\/div>/,'«Más abajo» al pie del contenido del legajo');
 assert.match(view,/if\(unified\(\)\)mountScrollHint\(\$\('panel-content'\),\{signal:ui\.signal\}\);/);
 assert.match(css,/#panel-content:not\(\[data-scroll=bottom\]\):not\(\[data-scroll=both\]\)>\.scroll-more\{display:none\}/,'si entra, no ocupa lugar');
 assert.match(html,/<p id="character-state"><\/p><p id="character-moved" hidden>Ya se movió<\/p>/);
 assert.match(view,/character\.moved===true&&!unified\(\)\?' · Ya se movió':''/,'el modo clásico lo sigue mostrando en la misma línea');
 assert.match(view,/moved\.hidden=!\(unified\(\)&&character\.moved===true\)/);
});

test('Ajustes 3 · contornos: SHA completo y sin «antes» la comparación falla en lugar de callarse',()=>{
 const wf=read('.github/workflows/mapa.yml');
 assert.match(wf,/git cat-file -e "\$BEFORE\^\{commit\}" 2>\/dev\/null \|\| git fetch --no-tags --depth=1 origin "\$BEFORE"\n/);
 const out=mkdtempSync(join(tmpdir(),'contornos-'));
 assert.throws(()=>execFileSync(process.execPath,[new URL('../scripts/contornos-localidades.mjs',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),out,'0000000000000000000000000000000000000000'],{stdio:'pipe'}),/no está disponible/);
});

test('Ajustes 3 · el cartel QA flota debajo de la barra superior, sin recibir toques',()=>{
 const css=read('app/mapa/estilos/interfaz-v2.css');
 assert.match(css,/#map-app>\.qa-notice\{position:absolute;z-index:31;top:70px;left:50%;transform:translateX\(-50%\)/);
 assert.match(read('app/mapa/estilos/mapa.css'),/\.qa-notice\{[^}]*pointer-events:none/);
});

test('Ajustes 3 · si un papel exclusivo cierra el repaso del ciclo, el repaso se vuelve a presentar',()=>{
 const panel=read('app/mapa/ciclo/panel.mjs');
 assert.match(panel,/if\(key===next&&dialog\.open\)return;/,'contenido igual pero cerrado: se vuelve a presentar');
 assert.match(read('app/mapa/experiencia/surfaces.mjs'),/if\(exclusive\)\{for\(const other of document\.querySelectorAll\('dialog\[open\]'\)\)if\(other!==dialog\)other\.close\(\);/,'lo exclusivo cierra a los demás (la causa)');
});
