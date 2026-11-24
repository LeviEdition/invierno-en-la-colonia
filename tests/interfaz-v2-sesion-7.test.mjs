// Interfaz v2, sesión 7 (informe 126): una sola barra para actuar y un expediente para leer.
// La barra es el único lugar de acción de turno; el expediente solo informa (y las acciones
// propias de carta: Equipar, Dar a…). Nada de esto calcula reglas ni consume azar.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {actionInProgress,turnShortcut,inventoryView,useCardAllowed,equipmentSlots,groupMembers,EQUIPMENT_SLOTS,SPACE_CONTROLS} from '../app/mapa/juego/turn-flow.mjs';
import {actionBarModel} from '../app/mapa/juego/action-bar-model.mjs';
import {isFoldShortcut,foldTouch,FOLD_CONTROLS} from '../app/mapa/experiencia/folds.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('app/mapa/index.html'),view=read('app/mapa/map-view.mjs'),css=read('app/mapa/estilos/barra-unica.css');
const between=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
const bar=between(html,'<section id="action-bar"','<p id="action-strip"'),fan=between(html,'<div id="bar-fan"','<section id="turn-cycle-controls"'),dossier=between(html,'<aside id="dossier"','</aside>');

// Inventario del paso 0 (informe 126): dónde vive cada acción de turno.
const PRIMARY=['search-action','attack-action','move-action'],FAN=['barricade-action','clean-action','attract-action','special-action','return-home-action','use-card-action'];

test('Sesión 7 · cada acción del inventario se alcanza desde la barra o el abanico, nunca desde el expediente',()=>{
 for(const id of PRIMARY){assert.ok(bar.includes(`id="${id}"`),id+' en la barra');assert.ok(!fan.includes(`id="${id}"`),id+' no está en el abanico');}
 for(const id of FAN)assert.ok(fan.includes(`id="${id}"`),id+' en el abanico');
 assert.ok(bar.includes('id="boost-action"')&&!fan.includes('id="boost-action"'),'«+1 (1 comida)» en la zona de dados, no en el abanico');
 assert.ok(bar.includes('id="finish-turn"')&&bar.includes('id="bar-more"'));
 for(const id of [...PRIMARY,...FAN,'boost-action','finish-turn','bar-search','bar-attack','bar-move'])assert.ok(!dossier.includes(`id="${id}"`),id+' fuera del expediente');
 for(const id of [...PRIMARY,...FAN,'boost-action'])assert.equal(html.split(`id="${id}"`).length-1,1,id+' existe una sola vez: nada se duplica');
 assert.ok(!html.includes('class="actions-section"'),'el expediente ya no tiene sección de acciones');
 assert.ok(dossier.includes('id="character-inventory"'),'el expediente conserva la mano y el equipo');
 assert.ok(between(html,'<article id="crisis-card"','</article>').includes('id="crisis-contribute"'),'aportar a la crisis, solo desde su tarjeta');
 assert.deepEqual(view.match(/const FAN_IDS=Object\.freeze\((\[[^\]]+\])\)/)[1].match(/'[^']+'/g).map(s=>s.slice(1,-1)),FAN);
});

test('Sesión 7 · el abanico solo lista lo que el motor permite y se cierra al elegir, con Esc o tocando fuera',()=>{
 assert.match(view,/const off=b\.disabled\|\|c\.hidden;c\.dataset\.fanOff=String\(off\);/,'cada entrada se apaga si su botón (validado por el motor) está deshabilitado');
 assert.match(css,/#bar-fan \.action-control\[data-fan-off=true\]\{display:none\}/);
 assert.match(view,/listen\('#bar-fan','click',e=>\{if\(e\.target\.closest\('button'\)\)setFan\(false\);\}\);/,'se cierra al elegir');
 assert.match(view,/if\(fanOpen&&!e\.target\.closest\?\.\('#bar-fan,#bar-more'\)\)setFan\(false\);/,'se cierra tocando fuera');
 assert.match(view,/if\(e\.key==='Escape'&&fanOpen&&!e\.defaultPrevented\)\{e\.preventDefault\(\);e\.stopPropagation\(\);setFan\(false\);/,'se cierra con Esc');
 assert.match(view,/const more=!own\|\|!any\|\|!!flow;/,'«Más» se apaga sin acciones permitidas, en turno ajeno o con una acción en curso');
 // «Usar carta»: solo si el motor permite usar alguna carta de uso ahora.
 const own={hand:[{uid:'a',effect:'equip'},{uid:'b',effect:'heal'}],equipment:[],options:[{mode:'use',cardId:'a',allowed:true},{mode:'use',cardId:'b',allowed:false}]};
 assert.equal(useCardAllowed(own),false,'equipar no cuenta como «usar carta»');
 own.options[1].allowed=true;assert.equal(useCardAllowed(own),true);assert.equal(useCardAllowed(null),false);
});

test('Sesión 7 · inventario: un solo componente con propósitos, sin duplicar acciones',()=>{
 const own={hand:[{uid:'h1',effect:'equip'},{uid:'h2',effect:'move'},{uid:'h3',effect:'food'}],equipment:[{uid:'e1',ownerId:'p'}],options:[{mode:'contribute',cardId:'h3',allowed:true}]};
 const use=inventoryView(own,'use'),manage=inventoryView(own,'manage'),crisis=inventoryView(own,'crisis');
 assert.deepEqual(use.hand.map(c=>c.uid),['h2','h3'],'usar: cartas de uso, incluido el combustible con destino');assert.deepEqual(use.equipment,[]);assert.equal(use.contribute,false);
 assert.deepEqual(manage.hand.map(c=>c.uid),['h1'],'expediente: cartas para equipar');assert.deepEqual(manage.equipment.map(c=>c.uid),['e1']);assert.equal(manage.give,true);assert.equal(manage.contribute,false,'aportar no aparece en el expediente');
 assert.deepEqual(crisis.hand.map(c=>c.uid),['h3']);assert.equal(crisis.cardAction,false);assert.equal(crisis.contribute,true);
 const panel=read('app/mapa/inventario/panel.mjs');
 assert.match(panel,/getElementById\('use-card-action'\)\?\.addEventListener\('click',open\('use'\)/);
 assert.match(panel,/for\(const id of \['character-inventory','menu-inventory'\]\)document\.getElementById\(id\)\?\.addEventListener\('click',open\(unified\(\)\?'manage':'all'\)/);
 assert.match(panel,/dialog\.dataset\.stage=String\(\['use','crisis'\]\.includes\(s\.purpose\)\);/,'usar y aportar, al centro; equipar y dar, en el expediente');
});

test('Sesión 7 · principales siempre visibles; apagadas con el motivo del motor o sin globo',()=>{
 assert.match(view,/reason=own&&!flow&&b\.disabled&&q&&q\.allowed===false\?ACTION_REASONS\[q\.reason\]\|\|movementMessages\[q\.reason\]\|\|'':'';/,'el motivo sale del código reason del motor; si no hay, no se inventa');
 assert.match(view,/wrap\.dataset\.tipTitle=b\.textContent\.trim\(\)\+' no disponible';wrap\.dataset\.tipText=reason;wrap\.tabIndex=0;/,'globo de papel de las sesiones 5 y 6');
 assert.match(css,/#action-bar \.action-control>button:disabled\{pointer-events:none\}/,'el envoltorio recibe el mouse del botón apagado');
 assert.doesNotMatch(css,/#action-bar \.action-control\[hidden\]|#bar-actions \.action-control\{display:none/,'nunca se ocultan');
 // El toque sobre un motivo no pliega la barra (folds.mjs): el envoltorio es un control.
 const panel={contains:o=>!!o},wrap={closest:s=>s===FOLD_CONTROLS?wrap:null,hasAttribute:a=>a==='data-no-fold'};
 assert.equal(foldTouch(wrap,panel,{folded:false}),false);
});

const P={round:1,turn:'p1',blocked:null,players:[{id:'p1',leaderId:'h0'}],locations:[{id:'L0',engineIndex:0,name:'Colonia'},{id:'L5',engineIndex:5,name:'Biblioteca'}],
 characters:[{id:'h0',name:'Leo',playerId:'p1',locationId:'L5',leader:true,equipment:[{kind:'arma',name:'Hacha'}]},{id:'h1',name:'Ana',playerId:'p1',locationId:'L0',equipment:[]},{id:'a0',name:'Bruno',playerId:'p2',locationId:'L0',equipment:[]}],
 dice:{available:[2,5],used:[]},play:{events:[],options:{h0:{clean:{allowed:true,dice:[{id:'x',index:0,value:2,allowed:true}]}}},boost:{allowed:true,dice:[{id:'x',index:0,value:2,allowed:true},{id:'y',index:1,value:5,allowed:true}]}},
 search:{options:{h0:{allowed:true,requirement:3,dice:[{index:0,value:2,allowed:false},{index:1,value:5,allowed:true}]}}},
 action:{options:{h0:{attack:{allowed:true,requirement:4,dice:[{index:0,value:2,allowed:false},{index:1,value:5,allowed:true}]}}}},
 inventory:{private:{hand:[{uid:'c1',name:'Combustible',effect:'move'}],equipment:[]}}};

test('Sesión 7 · tira de la acción en curso: texto de una línea y dados que el motor acepta',()=>{
 let f=actionInProgress(P,{search:{phase:'picking',intent:{actorId:'h0',dieIndex:null,dieValue:null}}});
 assert.equal(f.text,'Buscar en Biblioteca · elegí un dado de 3 o más');assert.deepEqual(f.dice.filter(d=>d.allowed).map(d=>d.value),[5]);
 f=actionInProgress(P,{search:{phase:'picking',intent:{actorId:'h0',dieIndex:1,dieValue:5}}});assert.equal(f.text,'Buscar en Biblioteca · dado 5 elegido · confirmá');assert.equal(f.chosen,1);
 f=actionInProgress(P,{action:{phase:'picking',intent:{actorId:'h0',kind:'attack',cost:1,dieIndex:null}}});assert.equal(f.text,'Atacar en Biblioteca · elegí un dado de 4 o más');
 f=actionInProgress(P,{action:{phase:'picking',intent:{actorId:'h0',kind:'barricade-ability',cost:0,dieIndex:null}}});assert.match(f.text,/con la habilidad, sin dado/);assert.equal(f.dice,null);
 f=actionInProgress(P,{play:{page:'action',intent:{kind:'boost',actorId:null}}});assert.equal(f.text,'Mejorar dado · elegí un dado menor que 6');assert.equal(f.dice.length,2);
 f=actionInProgress(P,{play:{page:'action',intent:{kind:'clean',actorId:'h0'}}});assert.equal(f.text,'Limpiar residuos · Leo · elegí un dado');
 f=actionInProgress(P,{movement:{phase:'choosing',intent:{actorId:'h0'}}});assert.equal(f.text,'Moverse · Leo · elegí un edificio iluminado');assert.equal(f.dice,null);
 f=actionInProgress(P,{movement:{phase:'confirming',intent:{actorId:'h0',destination:0}}});assert.equal(f.text,'Moverse · Leo a Colonia · confirmá');
 f=actionInProgress(P,{inventory:{phase:'picking',purpose:'use',intent:{cardId:'c1'}}});assert.equal(f.text,'Cartas · Combustible · confirmá');
 assert.equal(actionInProgress(P,{inventory:{phase:'browsing',purpose:'manage'}}),null,'equipar en el expediente no es acción en curso');
 assert.equal(actionInProgress(P,{}),null);
 assert.equal(actionInProgress({...P,blocked:'handover'},{search:{phase:'picking',intent:{actorId:'h0'}}}),null,'en el pase la tira no muestra nada');
});

test('Sesión 7 · cancelar con Esc o con la tira: los mismos caminos de cada panel, sin consumir nada',()=>{
 const start=view.indexOf(' function cancelCurrent('),cancel=view.slice(start,view.indexOf("focusPanelControl(i.purpose==='use'",start)+80);
 for(const call of ['action.cancel()','search.cancel()','movement.cancel()','play.close()','inventory.close()'])assert.ok(cancel.includes(call),call);
 assert.doesNotMatch(cancel,/submit\(|confirm\(|send\(|Math\.random/,'cancelar nunca confirma ni manda al motor');
 assert.match(view,/listen\('#action-strip-cancel','click',\(\)=>\{if\(barGuard\('strip-cancel'\)\)cancelCurrent\(\);\}\);/);
 assert.match(html,/<p id="action-strip"[^>]*role="status"[^>]*hidden=""><span id="action-strip-text"><\/span><button id="action-strip-cancel" type="button">Cancelar \(Esc\)<\/button><\/p>/);
 // Esc sigue en manos de cada panel; el expediente se cierra con Esc solo si nada más lo usó.
 assert.match(view,/if\(\(e\.defaultPrevented&&e\.target!==canvas\)\|\|e\.key!=='Escape'\|\|!panelTarget\|\|flow\|\|escFlow\|\|document\.querySelector\('dialog:modal'\)\)return;/);
 assert.match(view,/document\.addEventListener\('keydown',e=>\{if\(e\.key==='Escape'\)escFlow=!!flow;\},\{capture:true/,'un Esc que cancela una acción no cierra además el expediente');
});

test('Sesión 7 · doble toque y teclas repetidas no repiten una acción',()=>{
 assert.match(view,/\$\('action-bar'\)\.addEventListener\('click',e=>\{const b=e\.target\.closest\?\.\('button'\);if\(!b\|\|!b\.closest\('#bar-actions,\.bar-dice-zone'\)\)return;if\(e\.detail>1\)\{e\.stopImmediatePropagation\(\);e\.preventDefault\(\);return;\}/,'en captura, antes del botón');
 const key=(k,extra={})=>({key:k,target:{localName:'canvas',closest:()=>null},...extra});
 assert.equal(turnShortcut(key('b',{repeat:true})),null,'autorrepetición del teclado');
 assert.match(view,/if\(barGuard\('key:'\+k\)\)b\.click\(\);/,'el atajo pasa por la misma traba de la barra');
 assert.doesNotMatch(read('app/mapa/juego/turn-flow.mjs'),/Math\.random|send\(|submit\(/);
});

test('Sesión 7 · atajos: B, A, M, E, 1–4 y Espacio; sin conflictos y bloqueados donde corresponde',()=>{
 const t={localName:'canvas',closest:()=>null},key=(k,extra={})=>({key:k,target:t,...extra});
 assert.equal(turnShortcut(key('b')),'search');assert.equal(turnShortcut(key('A')),'attack');assert.equal(turnShortcut(key('m')),'move');assert.equal(turnShortcut(key('e')),'dossier');
 assert.equal(turnShortcut(key('1')),'die:0');assert.equal(turnShortcut(key('4')),'die:3');assert.equal(turnShortcut(key('5')),null);
 assert.equal(turnShortcut(key(' ')),'finish','Espacio fuera de un control');
 assert.equal(turnShortcut(key(' ',{target:{localName:'button',closest:s=>s===SPACE_CONTROLS?{}:null}})),null,'Espacio sobre un botón lo activa como siempre');
 // Sin conflictos con los atajos existentes.
 for(const k of ['Escape','Enter','-','+','0','ArrowLeft','ArrowUp','h','H'])assert.equal(turnShortcut(key(k)),null,k);
 for(const k of ['b','a','m','e','1',' '])assert.equal(isFoldShortcut(key(k)),false,'H no se pisa con '+k);
 // Bloqueos.
 for(const mod of ['ctrlKey','altKey','metaKey','shiftKey'])assert.equal(turnShortcut(key('b',{[mod]:true})),null,mod);
 for(const tag of ['input','select','textarea'])assert.equal(turnShortcut(key('b',{target:{localName:tag,closest:()=>null}})),null,tag);
 assert.equal(turnShortcut(key('b',{target:{localName:'div',isContentEditable:true,closest:()=>null}})),null);
 assert.equal(turnShortcut(key('b'),{modalOpen:true}),null,'modal');
 assert.equal(turnShortcut(key('b'),{blocked:true}),null,'pase de dispositivo u otra barrera');
 assert.match(view,/turnShortcut\(e,\{modalOpen:!!document\.querySelector\('dialog:modal'\),blocked:!projection\|\|!!projection\.blocked\}\)/);
 // Documentados en la ayuda y en las instrucciones del mapa.
 const help=read('app/mapa/juego/information.mjs');assert.match(help,/B buscar · A atacar · M moverse · E abrir o cerrar el expediente · 1 a 4 elegir dado/);
 assert.match(html,/Atajos: B buscar, A atacar, M moverse, E expediente, 1 a 4 elegir dado en la acción en curso, Espacio terminar turno\./);
});

test('Sesión 7 · barra: grupo, superviviente activo con tres ranuras y privacidad del pase',()=>{
 const m=actionBarModel(P,{selectedId:'h0'});
 assert.deepEqual(m.group.map(g=>[g.id,g.active]),[['h0',true],['h1',false]],'solo el grupo del activo; el activo marcado');
 assert.deepEqual(m.actor.slots.map(s=>[s.kind,s.empty,s.items]),[['herramienta',true,[]],['arma',false,['Hacha']],['educacion',true,[]]]);
 assert.deepEqual(EQUIPMENT_SLOTS.map(s=>s[0]),['herramienta','arma','educacion']);
 // El límite «uno de cada tipo» no se implementa: dos armas se muestran las dos.
 assert.deepEqual(equipmentSlots({equipment:[{kind:'arma',name:'A'},{kind:'arma',name:'B'}]})[1].items,['A','B']);
 assert.deepEqual(groupMembers(null,null),[]);
 const blocked=actionBarModel({...P,blocked:'handover'},{selectedId:'h0'});assert.equal(blocked.actor,null);assert.deepEqual(blocked.group,[]);assert.deepEqual(blocked.dice,[]);
 for(const slot of ['herramienta','arma','educacion'])assert.ok(bar.includes(`data-slot="${slot}" data-empty="true"`),slot);
 assert.match(css,/\.bar-slot\[data-empty=true\]\{border-style:dashed;/);
 assert.match(css,/button\.bar-mate:not\(#bar-portrait\):not\(#objective-details\):not\(#crisis-details\):not\(\.fold-hit\)\[aria-pressed=true\]\{border:3px solid var\(--lampara\)/,'el activo con borde Lámpara');
 assert.match(view,/onSelect:id=>tapCharacter\(id\)/,'tocar una miniatura pasa por tapIntent: la primera la hace activa (ajustes 2)');
});

test('Sesión 7 · expediente: solo información; se abre con el retrato o E y no al tocar el mapa',()=>{
 assert.match(view,/function barDetail\(\)\{if\(panelTarget\)\{\$\('panel-toggle'\)\.click\(\);return;\}/,'el retrato y E lo cierran por el mismo camino que «×»');
 assert.match(view,/listen\('#bar-portrait','click',\(\)=>\{if\(barGuard\('portrait'\)\)barDetail\(\);\}\)/);
 assert.match(view,/if\(target\.characterId\)tapCharacter\(target\.characterId\);/,'el primer toque sobre una ficha solo la hace activa; el expediente se abre si ya era la activa (ajustes 2)');
 assert.doesNotMatch(view.slice(view.indexOf(' function selectLocality('),view.indexOf('\n',view.indexOf(' function selectLocality('))),/panel\(true\)/);
 assert.match(view,/applyFolds\(\);panel\(false\);/,'empieza cerrado');
 assert.match(css,/\[data-panel-open=false\] #map-app #dossier\{display:none\}/);
 assert.match(dossier,/id="dossier-tabs"[^]*data-info="registro"/,'registro como pestaña del legajo (ajustes 2); ajustes y ayuda, en el menú');
 // Cerrar el expediente no cancela una acción de turno en curso.
 const ws=read('app/mapa/experiencia/workspace.mjs');assert.doesNotMatch(ws.slice(ws.indexOf("$('panel-toggle').addEventListener"),ws.indexOf('\n',ws.indexOf("$('panel-toggle').addEventListener"))),/cancelDrafts\(\)/);
});

test('Sesión 7 · diálogos de acción en papel al centro, sin tapar la barra',()=>{
 const stage=between(html,'<section id="action-stage"','<section id="move-planner"');
 for(const id of ['search-panel','action-panel'])assert.ok(stage.includes(`id="${id}"`),id+' al centro');
 assert.ok(!dossier.includes('id="search-panel"')&&!dossier.includes('id="action-panel"')&&!dossier.includes('id="move-planner"'));
 assert.match(read('app/mapa/experiencia/surfaces.mjs'),/const stage=dialog\.dataset\.stage==='true'&&document\.getElementById\('action-stage'\);/);
 assert.match(read('app/mapa/juego/panel.mjs'),/dialog\.dataset\.stage=String\(s\.page!=='groups'\);/);
 assert.match(read('app/mapa/ciclo/panel.mjs'),/dialog\.dataset\.stage='true';/);
 assert.match(css,/#action-stage\{position:absolute;z-index:34;left:50%;top:calc\(var\(--v2-top\) \+ 4px\);bottom:calc\(var\(--v2-bottom\) \+ 46px\);/,'termina arriba de la barra y de la tira');
 assert.match(css,/#action-stage \.search-cards\{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;/,'cartas grandes lado a lado');
 assert.match(css,/#move-planner\{position:absolute;z-index:32;top:auto;left:50%;right:auto;bottom:calc\(var\(--v2-bottom\) \+ 48px\);/,'movimiento: papel chico sobre la barra, nada al centro');
 assert.match(read('app/mapa/experiencia/workspace.mjs'),/e\.closest\('#context-workspace'\)/,'lo del centro no abre el expediente');
});

test('Sesión 7 · dado nocturno centrado en su casilla de papel',()=>{
 const seq=between(html,'<section id="move-sequence"','</section>');
 assert.ok(seq.indexOf('id="night-title"')<seq.indexOf('id="exposure-die"')&&seq.indexOf('id="exposure-die"')<seq.indexOf('id="night-result"'),'título, dado y resultado, en ese orden');
 // Ajustes de la sesión 7: la noche usa la casilla única de tiradas (data-kind=roll, roll-card.mjs).
 assert.match(css,/#move-sequence\[data-kind=roll\]\{display:flex;flex-direction:column;align-items:center;/);
 assert.match(css,/#move-sequence\[data-kind=roll\]\{[^}]*background:var\(--papel-fondo\)/,'papel, no la caja gris');
 assert.match(view,/rollCardText\(\{kind:op\.kind,stage:step\.stage,name:op\.name,place:projection\.locations\.find\(l=>l\.engineIndex===op\.origin\)\?\.name,/);
 assert.match(view,/if\(\$\('sequence-status'\)\.textContent!==text\)\$\('sequence-status'\)\.textContent=text;/,'el texto completo sigue en #sequence-status para lectores y baterías');
});

test('Sesión 7 · Objetivo y Crisis del mismo ancho, también plegadas',()=>{
 assert.match(css,/#public-summaries,body\[data-interfaz=v2\] #map-app #public-summaries:has\(\.paper-card\[data-folded=true\]\)\{display:grid;grid-template-columns:max-content;justify-items:stretch;/,'una columna del ancho de la más ancha');
 assert.match(css,/#public-summaries>\.paper-card\{box-sizing:border-box;width:auto\}/,'plegadas, se estiran a la columna');
 assert.match(css,/#public-summaries>\.paper-card:not\(\[data-folded=true\]\)\{width:244px\}/);
});

test('Sesión 7 · «+1 (1 comida)» solo cuando play.boost lo permite',()=>{
 assert.match(bar,/<button id="boost-action" type="button" hidden="" disabled=""[^>]*>\+1 \(1 comida\)<\/button>/);
 assert.match(read('app/mapa/juego/panel.mjs'),/if\(kind==='boost'&&unified\(\)\)b\.hidden=b\.disabled;/);
 assert.doesNotMatch(read('app/mapa/juego/panel.mjs'),/boost-reason/,'sin texto de motivo: si no está disponible, no se muestra');
});
