// Interfaz v2, sesión 6 (informe 125): los paneles se pliegan y despliegan tocándolos, sin pestañas
// con flecha. Delegación en folds.mjs; los controles internos ejecutan solo lo suyo.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {FOLD_KEYS,FOLD_CONTROLS,FOLD_GUARD_MS,foldTouch,createFoldGate,mountFoldPanels} from '../app/mapa/experiencia/folds.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

// DOM mínimo: cada nodo sabe si es un control (lo que FOLD_CONTROLS seleccionaría) y sus clases.
function node(parent=null,{control=false,cls=[]}={}){
 const n={parent,control,cls,listeners:[],action:0,
  contains(o){for(let x=o;x;x=x.parent)if(x===n)return true;return false;},
  closest(sel){for(let x=n;x;x=x.parent){if(sel===FOLD_CONTROLS?x.control:x.cls.includes(sel.slice(1)))return x;}return null;},
  addEventListener(type,fn){n.listeners.push(fn);}};
 return n;
}
// Clic que burbujea: primero el oyente propio del control (su acción), después el del panel.
function click(target,panel){const e={target,stopped:false,prevented:false,stopPropagation(){e.stopped=true;},preventDefault(){e.prevented=true;}};
 if(target.control)target.action++;for(const fn of panel.listeners)fn(e);return e;}
function mount(key='bar',{zone=null,folded=false,now}={}){
 const panel=node(),hit=node(panel,{control:true}),heading=node(panel,{cls:['panel-heading']}),strip=node(panel),paper=node(panel);
 const die=node(node(panel,{control:true}),{}),button=node(panel,{control:true}),chip=node(panel,{control:true});
 const state={[key]:folded},toggles=[];let t=0;
 mountFoldPanels([{key,el:panel,hit,zone}],{isFolded:k=>state[k],toggle:k=>{toggles.push(k);state[k]=!state[k];},gate:createFoldGate(FOLD_GUARD_MS,now||(()=>t+=1000))});
 return {panel,hit,heading,strip,paper,die,button,chip,state,toggles};
}

test('Sesión 6 · tocar la tira de un panel plegado lo despliega',()=>{
 const m=mount('objective',{folded:true});click(m.strip,m.panel);
 assert.equal(m.state.objective,false);assert.deepEqual(m.toggles,['objective']);
 const d=mount('dossier',{folded:true,zone:'.panel-heading'});click(d.paper,d.panel);assert.equal(d.state.dossier,false,'plegada, cualquier papel de la ficha la abre');
});

test('Sesión 6 · desplegado, el encabezado o el papel libre lo pliegan',()=>{
 const m=mount('bar');click(m.paper,m.panel);assert.equal(m.state.bar,true,'papel libre de la barra');
 const d=mount('dossier',{zone:'.panel-heading'});click(d.paper,d.panel);assert.equal(d.state.dossier,false,'la ficha abierta no se cierra por tocar su contenido');
 click(d.heading,d.panel);assert.equal(d.state.dossier,true,'sí por su encabezado');
});

test('Sesión 6 · un dado, un botón interno o una chapa no cambian el plegado y ejecutan su acción una vez',()=>{
 for(const folded of [false,true]){const m=mount('bar',{folded});
  for(const t of [m.die.parent,m.die,m.button,m.chip]){const e=click(t,m.panel);assert.equal(e.stopped||e.prevented,false,'la delegación no frena el evento');}
  assert.equal(m.state.bar,folded);assert.deepEqual(m.toggles,[]);
  assert.equal(m.button.action,1);assert.equal(m.chip.action,1);assert.equal(m.die.parent.action,1);}
 // El selector cubre lo que hay en los paneles: botones, campos, chapas con globo (tabIndex 0) y dados.
 for(const s of ['button','select','input','[tabindex]:not([tabindex="-1"])','[data-no-fold]'])assert.ok(FOLD_CONTROLS.includes(s),s);
 assert.match(read('app/mapa/index.html'),/<div id="bar-dice" class="bar-dice" data-no-fold=""/);
});

test('Sesión 6 · Enter y Espacio sobre el botón real de plegado funcionan; accesibilidad sin flecha',()=>{
 // Enter y Espacio sobre un <button> llegan como clic con target en el botón: cuenta aunque sea un control.
 const m=mount('crisis');click(m.hit,m.panel);assert.equal(m.state.crisis,true);
 const d=mount('dossier',{zone:'.panel-heading'});assert.equal(foldTouch(d.hit,d.panel,{hit:d.hit,zone:'.panel-heading'}),true);
 const html=read('app/mapa/index.html'),css=read('app/mapa/estilos/papel.css'),view=read('app/mapa/map-view.mjs');
 assert.doesNotMatch(html+css+view,/fold-tab|--fold-arrow/,'sin pestañas ni flechas');
 for(const k of ['objective','crisis','resources','bar']){
  assert.match(html,new RegExp(`<button class="fold-hit" data-fold="${k}" type="button" aria-expanded="true" aria-label="Plegar [^"]+"></button>`),k);
  assert.match(html,new RegExp(`data-fold-zone="${k}"`),k);}
 assert.match(html,/<aside id="dossier" data-fold-zone="dossier"/);
 assert.match(view,/querySelectorAll\('\.fold-hit\[data-fold='\+key\+'\]'\)\)\{tab\.setAttribute\('aria-expanded'/,'aria-expanded y aria-label siguen al estado');
 assert.match(css,/\[data-fold-zone\]:has\(>\.fold-hit:focus-visible\)\{outline:2px solid var\(--lampara\)/,'foco visible sobre el panel');
 assert.match(css,/\[data-fold-zone\]\{pointer-events:auto;cursor:pointer\}/,'cursor de toque');
 assert.match(css,/:hover:not\(:has\([^)]*:hover\)\)::before[^{]*\{filter:brightness/,'leve cambio de tono, no sobre controles');
});

test('Sesión 6 · doble toque rápido deja un estado consistente y no repite acciones',()=>{
 let t=0;const m=mount('objective',{now:()=>t});
 click(m.paper,m.panel);t+=120;click(m.paper,m.panel);
 assert.equal(m.state.objective,true,'el segundo toque dentro de la ventana se ignora');assert.equal(m.toggles.length,1);
 t+=FOLD_GUARD_MS;click(m.strip,m.panel);assert.equal(m.state.objective,false,'pasada la ventana, vuelve a responder');
 t+=10;click(m.button,m.panel);t+=10;click(m.button,m.panel);assert.equal(m.button.action,2,'cada toque de un control es suyo; el plegado no lo duplica ni lo come');
 assert.equal(m.toggles.length,2);
});

test('Sesión 6 · el plegado por toque no ejecuta juego ni azar y conserva «H», memoria y cámara',()=>{
 const folds=read('app/mapa/experiencia/folds.mjs'),view=read('app/mapa/map-view.mjs');
 assert.doesNotMatch(folds,/Math\.random|stopPropagation|preventDefault\(\)\s*;?\s*toggle/);
 const mountLine=view.split('\n').find(l=>l.includes('mountFoldPanels(FOLD_KEYS'));
 assert.ok(mountLine,'un oyente por panel, montado desde map-view');
 assert.doesNotMatch(mountLine,/movement\.|search\.|action\.|cycle\.|play\.|send\(|Math\.random/);
 assert.match(mountLine,/toggle:key=>\{if\(key==='dossier'\)\$\('panel-toggle'\)\.click\(\);else setFold\(key,!folds\[key\]\);\}/,'la ficha usa su camino de siempre; el resto, setFold (transición, memoria y cámara)');
 assert.match(view,/isFoldShortcut\(e,/);assert.equal(FOLD_KEYS.length,5);
});
