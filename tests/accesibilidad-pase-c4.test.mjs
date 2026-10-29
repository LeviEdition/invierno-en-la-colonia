import {readTestProgram} from '../test-support/game-source.mjs';
// C4 #12 — pruebas de contrato del foco con el script real y un DOM mínimo.
// La comprobación visual real se ejecuta por separado en Chromium/Playwright.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createContext,runInContext} from 'node:vm';

const source=readTestProgram().runtimeSource;

function fixture(){
 const events=new Map(),nodes=new Map();
 const document={body:{children:[]},activeElement:null,
  addEventListener(type,callback){if(!events.has(type))events.set(type,[]);events.get(type).push(callback);},
  getElementById(id){return node(id);},
  querySelector(selector){return selector==='#fabMenu button'?node('menuActionsButton'):null;}};
 function dispatch(type,event={}){for(const fn of events.get(type)||[])fn(event);}
 function node(id){
  if(!nodes.has(id)){
   const classes=new Set();
   nodes.set(id,{id,tagName:'DIV',inert:false,hidden:true,style:{},dataset:{},textContent:'',innerHTML:'',disabled:false,
    classList:{add(k){classes.add(k);},remove(k){classes.delete(k);},contains(k){return classes.has(k);}},
    focus(){document.activeElement=this;dispatch('focusin',{target:this});},
    contains(other){return this===other||other?.parentDialog===this;},
    getClientRects(){return [{}];},setAttribute(){},
    querySelector(selector){return selector.includes('button')?this.dialogButtons?.[0]||null:null;},
    querySelectorAll(selector){return selector.includes('button')?this.dialogButtons||[]:[];},
   });
  }
  return nodes.get(id);
 }
 const setup=node('setupScreen'),pass=node('passScreen');
 setup.dialogButtons=[node('setup1'),node('setup2')];pass.dialogButtons=[node('pass1')];
 for(const button of [...setup.dialogButtons,...pass.dialogButtons]){
  button.tagName='BUTTON';button.parentDialog=button.id==='pass1'?pass:setup;
 }
 const background=node('goalCard'),backdrop=node('backdrop');
 backdrop.dialogButtons=[node('modalClose')];backdrop.dialogButtons[0].parentDialog=backdrop;
 document.body.children=[background,node('floatingActions'),backdrop,setup,pass];
 const seededMath=Object.create(Math);seededMath.random=()=>.45; // Sin variación de encrucijada inicial entre CI.
 const ctx=createContext({document,Math:seededMath,queueMicrotask(){}});
 runInContext(source,ctx,{filename:'invierno_colonia_v9_9.js',timeout:2000});
 runInContext('toast=()=>{};toggleFab=()=>{};gameMode="local";create();game.crossPending=false;game.crossResolved=true;',ctx);
 function key(key,shiftKey=false){const evt={key,shiftKey,prevented:false,preventDefault(){this.prevented=true;}};dispatch('keydown',evt);return evt;}
 return {run(js){return runInContext(js,ctx,{timeout:2000});},state(js){return JSON.parse(runInContext('JSON.stringify('+js+')',ctx));},node,document,setup,pass,background,events,key,dispatch};
}

test('C4 #12 | al cargar inicio se enfoca su primera opción y el tablero se vuelve inerte',()=>{
 const t=fixture();t.setup.hidden=false;t.dispatch('DOMContentLoaded');
 assert.equal(t.document.activeElement,t.setup.dialogButtons[0]);
 assert.equal(t.background.inert,true);
 assert.equal(t.pass.inert,true);
 assert.equal(t.setup.inert,false);
});

test('C4 #12 | Shift+Tab desde primera opción y Tab desde última circulan dentro del inicio',()=>{
 const t=fixture();t.setup.hidden=false;t.dispatch('DOMContentLoaded');
 assert.equal(t.key('Tab',true).prevented,true);
 assert.equal(t.document.activeElement,t.setup.dialogButtons[1]);
 assert.equal(t.key('Tab').prevented,true);
 assert.equal(t.document.activeElement,t.setup.dialogButtons[0]);
});

test('C4 #12 | cerrar inicio devuelve acceso al tablero y permite empezar local',()=>{
 const t=fixture();t.setup.hidden=false;t.dispatch('DOMContentLoaded');
 // Aislar la salida de setup de la eventual encrucijada inicial.
 t.run('startGame("local");game.crossPending=false;game.crossResolved=true;hide();');
 assert.equal(t.setup.hidden,true);
 assert.equal(t.background.inert,false);
 assert.ok([t.node('floatingActions'),t.node('modalClose')].includes(t.document.activeElement));
});

test('C4 #12 | el pase enfoca comenzar turno, impide foco exterior y lo restaura al confirmar',()=>{
 const t=fixture();t.run('startGame("local");game.crossPending=false;game.crossResolved=true;hide();showPass("ai")');
 assert.equal(t.pass.hidden,false);
 assert.equal(t.document.activeElement,t.pass.dialogButtons[0]);
 assert.equal(t.background.inert,true);
 assert.equal(t.key('Tab').prevented,true);
 assert.equal(t.document.activeElement,t.pass.dialogButtons[0]);
 assert.equal(t.key('Tab',true).prevented,true);
 t.document.activeElement=t.background;
 t.dispatch('focusin',{target:t.background});
 assert.equal(t.document.activeElement,t.pass.dialogButtons[0]);
 t.run('confirmPass()');
 assert.equal(t.pass.hidden,true);
 assert.equal(t.background.inert,false);
 assert.ok([t.node('floatingActions'),t.node('modalClose')].includes(t.document.activeElement));
});

test('C4 #12 | Tab no se secuestra una vez finalizado el pase',()=>{
 const t=fixture();t.run('startGame("local");game.crossPending=false;game.crossResolved=true;hide();showPass("ai");confirmPass()');
 assert.equal(t.key('Tab').prevented,false);
});
