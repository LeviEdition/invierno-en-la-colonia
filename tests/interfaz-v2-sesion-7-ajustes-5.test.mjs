// Interfaz v2, sesión 7, ajustes 5 (informe 126): el legajo no se reabre al cerrarlo, la
// habilidad de botón se usa desde el legajo y el papel de construir no tiene desplegable.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {buildLine} from '../app/mapa/acciones/action-panel.mjs';
import {skillAction,skillKind} from '../app/mapa/experiencia/legajo.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Ajustes 5 · cerrar el legajo se aplica en el acto; abrir sigue esperando al cuadro',()=>{
 const view=read('app/mapa/map-view.mjs');
 // Antes, con reclaimPanelSpace, el cierre esperaba al cuadro del renderer y uno ya encolado volvía a
 // aplicar «abierta»: la ficha reaparecía un instante (mouse, toque, Esc o retrato, todos pasan por acá).
 assert.match(view,/if\(scene\.reclaimPanelSpace&&active&&renderer&&viewport\)\{\/\*[^*]*\*\/if\(closing\)applyPanel\(false\);sceneDirty=true;resize\(\);schedule\(\);\}else applyPanel\(open\);\}/);
 assert.match(view,/beforePresent:scene\.reclaimPanelSpace\?\(\)=>applyPanel\(panelForFrame\)/,'el cuadro aplica el estado vigente, que ya es «cerrada»');
 const battery=read('scripts/check-map-experience-browser.mjs');
 assert.match(battery,/assert\.equal\(await p\.evaluate\(\(\)=>reopenFrames\),0,'cerrar la ficha no la reabre'\)/,'la batería lo vigila en navegador');
});

test('Ajustes 5 · botón de habilidad del legajo: texto, permiso y motivo del motor',()=>{
 const medic={id:'h0',skill:{id:'medic'}},builder={id:'h1',skill:{id:'builder'}},scout={id:'h2',skill:{id:'scout'}};
 const p=(special,ability)=>({play:{options:{h0:{special}}},action:{options:{h1:{'barricade-ability':ability}}}});
 assert.deepEqual(skillAction(medic,p({allowed:true}),{own:true}),{kind:'special',label:'Curar sin dado',allowed:true,reason:''});
 assert.deepEqual(skillAction(builder,p(null,{allowed:true}),{own:true}),{kind:'barricade-ability',label:'Construir sin dado',allowed:true,reason:''});
 assert.equal(skillAction(builder,p(null,{allowed:false,reason:'skill-used'}),{own:true}).reason,'Ya usada esta ronda');
 assert.equal(skillAction(builder,p(null,{allowed:false,reason:'full'}),{own:true,reasons:{full:'Accesos completos'}}).reason,'Accesos completos','el motivo de la barra manda');
 assert.equal(skillAction(medic,p({allowed:false,reason:'treatment'}),{own:true,reasons:{treatment:'Sin pacientes o ya usada'}}).reason,'Sin pacientes o ya usada');
 assert.equal(skillAction(medic,p({allowed:true}),{own:false}).reason,'No es tu turno');
 assert.equal(skillAction(medic,p({allowed:true}),{own:true,busy:true}).allowed,false,'con una acción en curso, apagado');
 assert.equal(skillAction(scout,p(),{own:true}),null,'las automáticas no llevan botón');
 for(const id of ['medic','nurse','builder'])assert.equal(skillKind(id),'button');
});

test('Ajustes 5 · el botón del legajo usa el mismo control que «Más», una vez por toque',()=>{
 const view=read('app/mapa/map-view.mjs'),html=read('app/mapa/index.html');
 assert.match(html,/<p id="legajo-habilidad-estado"><\/p><button id="legajo-habilidad-usar" type="button" hidden><\/button><p id="legajo-habilidad-motivo" hidden><\/p>/);
 assert.match(view,/listen\('#legajo-habilidad-usar','click',e=>\{const b=e\.currentTarget;if\(b\.disabled\|\|!barGuard\('legajo-skill'\)\)return;if\(b\.dataset\.skillActor!==acting\(\)\)return;if\(b\.dataset\.kind==='special'\)\$\('special-action'\)\.click\(\);else\{\$\('barricade-action'\)\.click\(\);action\?\.chooseMethod\('barricade-ability'\);\}/,'special-action o barricade-ability: sin reglas nuevas');
 assert.match(view,/const own=character\.playerId===p\.turn&&!p\.blocked&&character\.id===acting\(\)/,'en el pase (blocked) o con otro superviviente, apagado');
});

test('Ajustes 5 · construir: sin desplegable, habilidad como casilla y textos claros',()=>{
 const panel=read('app/mapa/acciones/action-panel.mjs');
 assert.match(panel,/\$\('action-method-box'\)\.hidden=!hasMethod\|\|unified\(\);/,'ningún <select> en el papel unificado');
 assert.match(panel,/b\.className='search-die action-ability';b\.dataset\.actionMethod='barricade-ability';b\.disabled=!ability\.allowed;/,'la habilidad es una casilla como los dados');
 assert.match(panel,/if\(controller\.chooseMethod\(m\.dataset\.actionMethod\)\)/);
 assert.match(panel,/if\(controller\.inspect\(\)\.intent\?\.kind==='barricade-ability'\)controller\.chooseMethod\('barricade'\);if\(controller\.chooseDie/,'un dado vuelve a construir con dado');
 assert.match(panel,/'Elegí un dado \(1 o más\)'\+\(ability\?\.allowed\?' o tu habilidad':''\)/);
 assert.match(panel,/\$\('confirm-action'\)\.title=\$\('confirm-action'\)\.disabled&&picking\?\(build&&ability\?\.allowed\?'Elegí un dado o tu habilidad':'Elegí un dado'\):'';/,'«Construir» apagado dice qué falta');
 assert.doesNotMatch(panel.slice(panel.indexOf('if(U){')),/barricada\(s\)/);
 assert.match(read('app/mapa/estilos/ajustes-2.css'),/#action-stage \.search-die\.action-ability\{display:flex/);
});

test('Ajustes 5 · línea de construcción en singular y plural, sin «(s)»',()=>{
 assert.equal(buildLine(1,'Biblioteca',2),'Construye 1 barricada en Biblioteca · quedan 2 accesos libres');
 assert.equal(buildLine(2,'Hospital',2),'Construye 2 barricadas en Hospital · quedan 2 accesos libres');
 assert.equal(buildLine(1,'Escuela',1),'Construye 1 barricada en Escuela · queda 1 acceso libre');
 assert.equal(buildLine(1,'Colonia',null),'Construye 1 barricada en Colonia','sin dato, no inventa');
 assert.equal(buildLine(0,'Colonia',0),'No quedan accesos libres en Colonia.');
});
