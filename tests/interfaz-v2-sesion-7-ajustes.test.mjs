// Interfaz v2, sesión 7 (ajustes; informe 126, «Ajustes»): grupo flotante, «Cartas», dado único,
// papel real, tipografía base, papel de búsqueda, nada sobre el papel central y Objetivo visible.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inventoryView,cardsAllowed,equipableCards} from '../app/mapa/juego/turn-flow.mjs';
import {rollCardText} from '../app/mapa/experiencia/roll-card.mjs';
import {mulberry32,seedOf,tornPolygon,paperStyle,PAPER_SURFACES} from '../app/mapa/experiencia/papel.mjs';
import {shownFolded,STAGE_FOLDS,FOLD_KEYS} from '../app/mapa/experiencia/folds.mjs';
import {portraitFor} from '../app/mapa/movimiento/layout.mjs';
import {createSearchController} from '../app/mapa/busqueda/search-controller.mjs';
import {decodePixels,PAPER} from '../scripts/generar-papel.mjs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const bytes=p=>readFileSync(new URL('../'+p,import.meta.url));
const css=()=>read('app/mapa/estilos/barra-unica.css'),papel=()=>read('app/mapa/estilos/papel.css');

test('Ajustes · la barra no lleva miniaturas: el grupo flota en círculos arriba a la izquierda y se pliega con ella',()=>{
 const c=css();
 assert.match(c,/#action-bar \.bar-group\{position:absolute;z-index:1;left:40px;bottom:calc\(100% \+ 8px\)/,'fuera del flujo de la barra, sobre su borde superior');
 assert.match(c,/#action-bar\[data-folded=true\] \.bar-group\{display:none\}/,'se pliega con la barra');
 // Círculos, no óvalos: tamaño fijo, sin el mínimo global de 44 px de ancho que los estiraba.
 assert.match(c,/button\.bar-mate[^{]*\{position:relative;flex:none;width:44px;height:44px;min-width:0;min-height:0;aspect-ratio:1;padding:0;[^}]*border-radius:50%/);
 assert.doesNotMatch(c,/max-width:1250px\)\{\n body\[data-interfaz=v2\] #map-app \.bar-group\{display:none\}/,'ya no se esconde en escritorio angosto');
});

test('Ajustes · ningún retrato vacío: sin retrato o si la imagen falla, iniciales sobre papel',()=>{
 // Causa: solo cuatro supervivientes tienen retrato provisional; el tercero del grupo (h2) no.
 assert.equal(portraitFor('h2'),null);assert.ok(portraitFor('h0')&&portraitFor('h1'));
 const bar=read('app/mapa/juego/action-bar.mjs');
 assert.match(bar,/mark=element\('span',initials\(g\.name\),'mate-initials'\);b\.dataset\.portrait=String\(!!url\);b\.append\(mark\);/,'las iniciales siempre están debajo');
 assert.match(bar,/img\.addEventListener\('error',\(\)=>\{img\.remove\(\);b\.dataset\.portrait='false';\},\{once:true\}\)/,'si la imagen no carga, quedan las iniciales');
 assert.doesNotMatch(bar,/'portrait-initials'\)\);return b;/,'no reusa la clase de la ficha (círculo oscuro)');
 assert.match(css(),/button\.bar-mate[^{]*\{[^}]*background:#EDE2C8;color:var\(--tinta\)/,'iniciales en tinta sobre papel');
});

const own={hand:[{uid:'u1',name:'Vendas',effect:'heal'},{uid:'e1',name:'Palanca',effect:'equip'},{uid:'e2',name:'Pistola',effect:'equip'}],equipment:[{uid:'q1',name:'Hacha',ownerId:'h0'}],
 options:[{mode:'use',cardId:'u1',actorId:'h0',allowed:true},{mode:'use',cardId:'e1',actorId:'h0',allowed:true},{mode:'use',cardId:'e2',actorId:'h1',allowed:true},{mode:'use',cardId:'e2',actorId:'h0',allowed:false,reason:'equip'}]};
test('Ajustes · «Cartas»: «De uso» y «Equipables» según las opciones del motor para el activo',()=>{
 const v=inventoryView(own,'use','h0');
 assert.deepEqual(v.hand.map(c=>c.uid),['u1'],'de uso: como antes');
 assert.deepEqual(v.equipables.map(c=>c.uid),['e1'],'equipables: solo lo que el motor deja equipar a h0');
 assert.deepEqual(equipableCards(own,'h1').map(c=>c.uid),['e2']);
 assert.equal(cardsAllowed({...own,options:own.options.filter(q=>q.cardId!=='u1')},'h0'),true,'una equipable alcanza');
 assert.equal(cardsAllowed({...own,options:[]},'h0'),false);
 assert.deepEqual(inventoryView(own,'manage').hand.map(c=>c.uid),['e1','e2'],'«Equipar» sigue en el expediente');
 const panel=read('app/mapa/inventario/panel.mjs');
 assert.match(panel,/for\(const \[title,list,verb\] of \[\['De uso',shown\.hand,'Usar'\],\['Equipables',view\.equipables,'Equipar'\]\]\)\{if\(!list\.length\)continue;/,'sección vacía: no se muestra');
 assert.match(read('app/mapa/index.html'),/<button id="use-card-action" type="button" disabled="">Cartas<\/button>/);
});

test('Ajustes · un solo componente para todas las tiradas animadas',()=>{
 assert.deepEqual(rollCardText({kind:'exposure',stage:'roll',name:'Leo',place:'Escuela'}),{title:'La noche en Escuela · Leo',result:'Tirando…'});
 assert.deepEqual(rollCardText({kind:undefined,stage:'roll',name:'Leo'}),{title:'Exposición · Leo',result:'Tirando…'});
 assert.deepEqual(rollCardText({kind:'attack',stage:'reveal',name:'Leo',reveal:'Sin efecto'}),{title:'Exposición · Leo',result:'Sin efecto'});
 assert.equal(rollCardText({kind:undefined,stage:'consequence',name:'Leo',summary:'Leo llegó.'}).result,'Leo llegó.');
 const view=read('app/mapa/map-view.mjs');
 assert.equal(view.split("card.dataset.kind='roll'").length-1,1,'una sola casilla');
 assert.doesNotMatch(view+css(),/data-kind=night|dataset\.kind='night'/,'sin variante aparte para la noche');
 assert.match(css(),/#move-sequence\[data-kind=roll\]\{display:flex;flex-direction:column;align-items:center/);
 // La duración, el freno y el salto con un toque siguen en la secuencia (no se tocaron).
 assert.match(view,/introDuration:response\.kind==='exposure'\?0:550,resultDuration:response\.kind==='barricade'\?0:1100/);
});

test('Ajustes · bordes rasgados: iguales entre recargas, distintos entre paneles, sin Math.random',()=>{
 const a=tornPolygon(seedOf('objective-card')),b=tornPolygon(seedOf('objective-card'));assert.equal(a,b);
 const all=PAPER_SURFACES.map(([s])=>paperStyle(s.slice(1))['--torn']);assert.equal(new Set(all).size,all.length,'uno por panel');
 assert.ok(a.split(',').length>70,'muchos quiebres');assert.match(a,/^polygon\(0% /);
 const r1=mulberry32(7),r2=mulberry32(7);assert.deepEqual([r1(),r1(),r1()],[r2(),r2(),r2()]);
 assert.doesNotMatch(read('app/mapa/experiencia/papel.mjs').replace('nunca Math.random',''),/Math\.random/);
 // Sin assets nuevos para los bordes; las texturas son las de papel-fuente.
 assert.match(papel(),/--papel-arrugas:\.8;--papel-grano:\.7;/);
 assert.match(papel(),/url\(\.\.\/\.\.\/\.\.\/assets\/interfaz\/papel-fuente\/papel-arrugas\.webp\)/);
 assert.match(papel(),/\.papel-relieve\{position:absolute;inset:0;z-index:-1;clip-path:var\(--torn\);background:#808080;mix-blend-mode:soft-light;pointer-events:none\}/);
 // La mancha sigue en su capa aparte: el relieve va primero, debajo de ella.
 assert.match(read('app/mapa/experiencia/papel.mjs'),/span\.className='papel-relieve';span\.setAttribute\('aria-hidden','true'\);el\.prepend\(span\);/);
});

test('Ajustes · papel de búsqueda según la cantidad de cartas; toda la carta es el botón',()=>{
 const c=css(),w=n=>Number(c.match(new RegExp('#search-panel\\[data-cards="'+n+'"\\]\\{width:min\\((\\d+)px'))[1]);
 assert.ok(w(1)<w(2)&&w(2)<w(3),'crece con las cartas');assert.ok(w(1)<=340,'una carta: papel angosto');
 const panel=read('app/mapa/busqueda/search-panel.mjs');
 assert.match(panel,/const card=el\('button',undefined,'search-card'\);card\.type='button';card\.dataset\.card=String\(c\.index\);card\.disabled=busy;card\.setAttribute\('aria-label','Conservar '\+c\.name\);/);
 assert.match(panel,/\$\('search-panel'\)\.dataset\.cards=String\(Math\.min\(cards\.length,3\)\)/);
 // «Revelar otra carta» y los demás botones del centro: papel con sombra dura, no bloques oscuros.
 assert.match(c,/:is\(#action-stage,#move-planner,#move-sequence\) button:not\(\.search-card\):not\(\.die\):not\(\.search-die\)[^{]*\{background:#F3E9D2;color:var\(--tinta\);border:2px solid var\(--tinta\);box-shadow:var\(--sombra-dura\)\}/);
});

test('Ajustes · tocar la carta la conserva una sola vez',()=>{
 const sent=[];let n=0;const c=createSearchController({send:r=>sent.push(r),requestId:()=>'q'+(++n)});
 const op={operationId:'op',ownerId:'human',gameGeneration:1,round:1,actorId:'h0',status:'choice',cards:[{name:'Vendas',index:0}],canNoise:true,step:'choice_1_0'};
 c.update({blocked:null,search:{session:'s',revision:1,options:{},private:{gameGeneration:1,round:1,ownerId:'human',hand:[],operation:op}}});
 assert.equal(c.inspect().phase,'choice');assert.notEqual(c.choose(0),false);assert.equal(c.choose(0),false);assert.equal(sent.length,1);
 // El segundo toque de un doble toque no cae en el botón que aparece debajo («Continuar»).
 assert.match(read('app/mapa/map-view.mjs'),/\$\('action-stage'\)\?\.addEventListener\('click',e=>\{if\(e\.detail>1&&e\.target\.closest\?\.\('button'\)\)\{e\.stopImmediatePropagation\(\);e\.preventDefault\(\);\}\},\{capture:true/);
});

test('Ajustes · con papel central, Objetivo y Crisis plegadas sin guardar; al cerrar, como estaban',()=>{
 const saved=Object.fromEntries(FOLD_KEYS.map(k=>[k,false]));
 assert.deepEqual(STAGE_FOLDS,['objective','crisis']);
 assert.equal(shownFolded(saved,'objective',true),true);assert.equal(shownFolded(saved,'crisis',true),true);assert.equal(shownFolded(saved,'bar',true),false);
 assert.equal(shownFolded(saved,'objective',false),false,'al cerrarse vuelve');
 assert.equal(shownFolded({...saved,crisis:true},'crisis',false),true,'lo plegado por el jugador sigue plegado');
 const view=read('app/mapa/map-view.mjs');
 assert.match(view,/if\(staged!==stageFold\)\{stageFold=staged;for\(const k of STAGE_FOLDS\)paintFold\(k\);\}/,'solo repinta: no llama a setFold ni a saveFolds');
 assert.match(css(),/\[data-stage=true\] #map-app :is\(#locality-labels,#destination-name,#map-labels\)\{visibility:hidden\}/,'rótulos por debajo');
 assert.match(css(),/#public-summaries\{top:var\(--v2-cards-top,calc\(var\(--v2-top\) \+ 8px\)\)\}/,'Objetivo debajo de la barra del zoom');
});

// Contraste AA (4,5:1) de la tinta sobre el papel más oscuro posible: el tono más oscuro del
// interior de la tarjeta, por el grano viejo más oscuro, y en soft-light con las capas nuevas en
// el percentil 1 de cada una (el 1 % más oscuro: arrugas 114, grano 87; medido en el navegador el
// 24/11/2026). Tres extremos a la vez: el caso real es más claro. En motas sueltas (0,1 % de los
// píxeles) el contraste local baja a unos 3,6:1; el informe 126 lo dice.
test('Ajustes · contraste de la tinta sobre el papel con relieve y grano',()=>{
 const k={arrugas:.8,grano:.7};assert.match(papel(),new RegExp('--papel-arrugas:\\.'+String(k.arrugas).slice(2)+';--papel-grano:\\.'+String(k.grano).slice(2)+';'));
 const lin=c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4,L=([r,g,b])=>.2126*lin(r)+.7152*lin(g)+.0722*lin(b),ratio=(a,b)=>(Math.max(L(a),L(b))+.05)/(Math.min(L(a),L(b))+.05);
 const soft=(b,s)=>s<=.5?b-(1-2*s)*b*(1-b):b+(2*s-1)*((b<=.25?((16*b-12)*b+4)*b:Math.sqrt(b))-b),overlay=(b,s)=>b<=.5?2*b*s:1-2*(1-b)*(1-s);
 const g=.5+k.grano*(87/255-.5),t=g+k.arrugas*(overlay(g,114/255)-g);
 const card=decodePixels(bytes('assets/interfaz/papel/papel-tarjeta.png')),grain=decodePixels(bytes('assets/interfaz/papel/papel-grano.png'));
 let dark=[1,1,1];const ch=card.data.length/(card.width*card.height);
 for(let y=Math.floor(card.height*.15);y<card.height*.85;y++)for(let x=Math.floor(card.width*.1);x<card.width*.9;x++){const i=(y*card.width+x)*ch,c=[card.data[i]/255,card.data[i+1]/255,card.data[i+2]/255];if(L(c)<L(dark))dark=c;}
 let gmin=1;const gch=grain.data.length/(grain.width*grain.height);for(let i=0;i<grain.data.length;i+=gch)gmin=Math.min(gmin,grain.data[i]/255);
 const paper=dark.map(c=>soft(c*gmin,t)),tinta=[0x2B/255,0x22/255,0x19/255];
 assert.ok(ratio(tinta,paper)>=4.5,'tinta '+ratio(tinta,paper).toFixed(2)+':1 sobre el peor papel');
 assert.ok(ratio(tinta,PAPER.base.map(v=>v/255))>=7,'y holgado sobre el crema base');
});

test('Ajustes · tipografía en toda la interfaz: base Alegreya Sans y Bitter en títulos y números',()=>{
 const p=papel();assert.match(p,/body\[data-interfaz=v2\]\{--fuente-ui:var\(--fuente-texto\);font-family:var\(--fuente-texto\)\}/);
 assert.match(p,/:is\(\.stats dd,#zoom-value,\.bar-die\.numeric,\.damage-count\)[^{]*\{--fuente-ui:var\(--fuente-titulo\);font-family:var\(--fuente-titulo\)\}/);
 // Lo que decía system-ui pasa por la variable (en v2, la fuente de texto); fuera de v2 no cambia.
 for(const f of ['acciones','busqueda','experiencia','interfaz-v2','mapa','maqueta','papel'])assert.doesNotMatch(read('app/mapa/estilos/'+f+'.css').replaceAll('var(--fuente-ui,system-ui)',''),/system-ui/,f);
 assert.doesNotMatch(p+read('app/mapa/index.html'),/fonts\.googleapis|fonts\.gstatic/,'nada externo');
});

test('Ajustes · libro: ícono con tapas, lomo y hojas, mismo trazo que herramienta y arma',()=>{
 const c=css(),icon=k=>c.match(new RegExp('\\.bar-slot\\[data-slot='+k+'\\]\\{--icono:url\\("([^"]+)"\\)'))[1];
 for(const k of ['herramienta','arma','educacion'])assert.match(decodeURIComponent(icon(k)),/stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/,k);
 assert.equal((decodeURIComponent(icon('educacion')).match(/<path /g)||[]).length,3,'tapa, canto de las hojas y lomo');
 assert.doesNotMatch(c,/content:'❧'/);
});
