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

// ── Ajustes (informe 125): paneles de la izquierda y tirada más lenta ──
import {createPressMemory,itemTip,LONG_PRESS_MS} from '../app/mapa/experiencia/stat-tips.mjs';
import {createPresentationSequence,sequenceDurations,reducedDurations,rollEase} from '../app/mapa/movimiento/presentation-sequence.mjs';
// Nodo con atributos: lo que el navegador resolvería con closest(FOLD_CONTROLS) y hasAttribute.
function el(parent,{control=false,pass=false}={}){const n=node(parent,{control});n.hasAttribute=a=>a==='data-fold-pass'&&pass;return n;}
function leftPanels(){
 const card=node(),details=el(card,{control:true,pass:true}),title=el(details),consequence=el(details),contribute=el(card,{control:true});
 const bar=node(),chip=el(bar,{control:true,pass:true}),chipValue=el(chip);
 return {card,details,title,consequence,contribute,bar,chip,chipValue};
}

test('Sesión 6, ajustes · tocar el texto del Objetivo o de la Crisis pliega y despliega',()=>{
 const m=leftPanels();
 for(const t of [m.title,m.consequence,m.details])assert.equal(foldTouch(t,m.card,{folded:false}),true);
 const html=read('app/mapa/index.html');
 assert.match(html,/<div id="objective-details" data-tip="">/);assert.match(html,/<div id="crisis-details" data-tip="">/);
 assert.doesNotMatch(html,/<button id="(objective|crisis)-details"|data-info="(objetivo|crisis)"/,'los envoltorios ya no son botones de clic');
 // El detalle sigue disponible: globo (mismo texto que el diálogo) y texto para lectores de pantalla.
 const view=read('app/mapa/map-view.mjs');
 assert.match(view,/function paintCardTips\(p\)\{[^\n]*\n[^\n]*o\.description,'Muestras: '/);
 assert.match(view,/if\(o\?\.description\)\$\('public-objective'\)\.textContent\+=' · '\+o\.description;/);
 assert.match(view,/'Crisis',c\?'Requisito: '[^\n]*\$\('crisis-consequence'\)\.textContent/);
 assert.deepEqual(itemTip({dataset:{tipTitle:'Vacunas',tipText:'Juntar muestras.'}}),{title:'Vacunas',text:'Juntar muestras.'});
 assert.equal(itemTip({querySelector:()=>({id:'round'})}).title,'Rondas restantes','las chapas conservan sus textos');
});

test('Sesión 6, ajustes · tocar una chapa pliega la fila; sigue enfocable con su globo',()=>{
 const m=leftPanels();
 for(const t of [m.chip,m.chipValue])for(const folded of [false,true])assert.equal(foldTouch(t,m.bar,{folded}),true);
 const tips=read('app/mapa/experiencia/stat-tips.mjs');
 // Sesión 7 (informe 126): los motivos de la barra (data-no-fold) no se marcan para plegar.
 assert.match(tips,/item\.tabIndex=0;if\(!item\.hasAttribute\('data-no-fold'\)\)item\.dataset\.foldPass='';/,'tabIndex 0 para el teclado, marcada para que el toque pase');
 assert.match(tips,/querySelectorAll\('#map-app \.stats>div,#map-app \[data-tip\]'\)/);
 assert.match(tips,/addEventListener\('mouseenter'[\s\S]*?addEventListener\('focus'/,'hover y foco siguen mostrando el globo');
 assert.match(read('app/mapa/experiencia/folds.mjs'),/!control\.hasAttribute\?\.\('data-fold-pass'\)/);
});

test('Sesión 6, ajustes · la pulsación larga en una chapa muestra el globo y no pliega',()=>{
 let t=0;const memory=createPressMemory(()=>t),m=leftPanels(),state={resources:false},toggles=[];
 mountFoldPanels([{key:'resources',el:m.bar}],{isFolded:k=>state[k],toggle:k=>{toggles.push(k);state[k]=!state[k];},skip:e=>memory.consume(e.target),gate:createFoldGate(0,()=>t+=1)});
 memory.mark(m.chip);t+=LONG_PRESS_MS+40;click(m.chipValue,m.bar);
 assert.equal(state.resources,false,'el clic que sigue a la pulsación larga no pliega');assert.deepEqual(toggles,[]);
 t+=100;click(m.chip,m.bar);assert.equal(state.resources,true,'un toque común después sí pliega');
 assert.match(read('app/mapa/experiencia/stat-tips.mjs'),/press=setTimeout\(\(\)=>\{show\(item\);pressed\.mark\(item\);\},longPressMs\);/);
 assert.match(read('app/mapa/map-view.mjs'),/skip:e=>!!statTips\?\.longPressed\(e\.target\)/);
});

test('Sesión 6, ajustes · «Aportar a crisis» ejecuta su acción y no pliega',()=>{
 const m=leftPanels(),state={crisis:false},toggles=[];
 mountFoldPanels([{key:'crisis',el:m.card}],{isFolded:k=>state[k],toggle:k=>{toggles.push(k);state[k]=!state[k];}});
 const e=click(m.contribute,m.card);
 assert.equal(m.contribute.action,1);assert.equal(state.crisis,false);assert.deepEqual(toggles,[]);assert.equal(e.stopped||e.prevented,false);
 assert.match(read('app/mapa/index.html'),/<\/div><button id="crisis-contribute">Aportar a crisis<\/button>/);
});

test('Sesión 6, ajustes · la tirada dura ~1200 ms con freno y pausa final; reducido sigue corto',()=>{
 assert.deepEqual({roll:sequenceDurations.roll,settle:sequenceDurations.settle},{roll:1200,settle:200});
 assert.equal(reducedDurations.roll+reducedDurations.settle,80,'movimiento reducido: como antes');
 const response={resolution:{exposure:{rolled:true,value:3,effect:'wound'}}};
 for(const intro of [1500,550,0]){// moverse, atacar, D12 nocturno: la misma constante
  const s=createPresentationSequence(response,{introDuration:intro});s.advance(intro);assert.equal(s.inspect().stage,'roll');
  s.advance(600);const mid=s.inspect();assert.equal(mid.settling,false);assert.ok(rollEase(mid.progress)>.85,'ease-out: a mitad de tiempo ya frenó casi todo');
  s.advance(600);assert.equal(s.inspect().settling,true);assert.equal(s.inspect().progress,1,'quieta en la cara final');
  s.advance(199);assert.equal(s.inspect().stage,'roll','todavía sin revelar la consecuencia');s.advance(1);assert.equal(s.inspect().stage,'reveal');}
 const r=createPresentationSequence(response,{reduced:true});r.advance(100);assert.equal(r.inspect().stage,'roll');r.advance(80);assert.equal(r.inspect().stage,'reveal');
 assert.ok(rollEase(.25)-rollEase(0)>rollEase(1)-rollEase(.75),'las caras cambian rápido al principio y frenan al final');
 const map=read('app/mapa/map-view.mjs');assert.doesNotMatch(map,/roll:\s*550|reduced\?80:550/);
});

test('Sesión 6, ajustes · un toque durante la tirada salta al resultado sin nuevo evento del motor',()=>{
 const response={resolution:{exposure:{rolled:true,value:7,effect:'frost'}}},s=createPresentationSequence(response,{introDuration:550});
 assert.equal(s.skipRoll(),false,'durante el recorrido no hay tirada que adelantar');
 s.advance(600);assert.equal(s.skipRoll(),true);const now=s.inspect();
 assert.equal(now.stage,'reveal');assert.equal(now.progress,0);assert.equal(now.exposure.value,7,'mismo resultado del motor');
 assert.equal(s.skipRoll(),false,'un segundo toque no repite nada');s.interrupt();assert.equal(s.skipRoll(),false);
 const line=read('app/mapa/map-view.mjs').split('\n').find(l=>l.includes('sequence?.skipRoll()'));assert.ok(line);
 assert.doesNotMatch(line,/send\(|request|movement\.|action\.|search\.|cycle\.|Math\.random|\.click\(\)/,'solo mueve el reloj visual');
 assert.match(line,/addEventListener\('click',swallow,\{capture:true,once:true/,'el toque no hace nada más');
});
