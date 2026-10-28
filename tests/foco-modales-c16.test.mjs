// C16/A1 — Contratos de foco: Ayuda, fallecimiento y continuidad de las decisiones.
// La geometría y el recorrido de teclado reales requieren Chromium (script separado).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';

const html=readFileSync(new URL('../invierno_colonia_v9_9.html',import.meta.url),'utf8');
const source=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)][0][1]
 .replace(/\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/,'');

function fixture(){
 const handlers=new Map(),nodes=new Map();
 const document={body:{children:[]},activeElement:null,
  addEventListener(type,fn){if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push(fn);},
  getElementById(id){return node(id);},
  querySelector(selector){
   if(selector==='.deathContinue')return node('deathContinue');
   if(selector==='#fabMenu button')return node('menuAction');
   return null;
  }};
 function dispatch(type,event={}){for(const fn of handlers.get(type)||[])fn(event);}
 function node(id){
  if(!nodes.has(id)){
   const classes=new Set();
   nodes.set(id,{id,tagName:'DIV',inert:false,hidden:true,style:{},dataset:{},textContent:'',innerHTML:'',disabled:false,
    classList:{add(x){classes.add(x);},remove(x){classes.delete(x);},contains(x){return classes.has(x);}},
    focus(){document.activeElement=this;dispatch('focusin',{target:this});},
    contains(other){return this===other||other?.parentDialog===this;},
    getClientRects(){return [{}];},setAttribute(){},
    querySelector(selector){return selector.includes('button')?this.dialogButtons?.[0]||null:null;},
    querySelectorAll(selector){return selector.includes('button')?this.dialogButtons||[]:[];}
   });
  }return nodes.get(id);
 }
 const setup=node('setupScreen'),pass=node('passScreen'),backdrop=node('backdrop'),death=node('deathBackdrop');
 setup.dialogButtons=[node('setup1'),node('setup2')];
 pass.dialogButtons=[node('pass1')];
 backdrop.dialogButtons=[node('modalClose'),node('modalOption')];
 death.dialogButtons=[node('deathContinue')];
 for(const dialog of [setup,pass,backdrop,death]){
  for(const button of dialog.dialogButtons){button.tagName='BUTTON';button.parentDialog=dialog;}
 }
 const board=node('goalCard'),fab=node('floatingActions');
 document.body.children=[board,fab,backdrop,death,setup,pass];
 const context=createContext({document,Math,queueMicrotask(){},setTimeout(){},clearTimeout(){}});
 runInContext(source,context,{timeout:3000});
 const run=js=>runInContext(js,context,{timeout:3000});
 run('toast=()=>{};toggleFab=()=>{};gameMode="local";create();game.crossPending=false;game.crossResolved=true;');
 const key=(name,shiftKey=false)=>{const e={key:name,shiftKey,prevented:false,preventDefault(){this.prevented=true;}};dispatch('keydown',e);return e;};
 return {run,node,document,key,dispatch,board,fab,setup,pass,backdrop,death};
}

test('C16 | Ayuda aísla el tablero y enfoca un control del diálogo',()=>{
 const t=fixture();t.fab.focus();t.run('show("help")');
 assert.equal(t.document.activeElement,t.node('modalClose'));
 assert.equal(t.board.inert,true);
 assert.equal(t.fab.inert,true);
 assert.equal(t.backdrop.inert,false);
});

test('C16 | Tab, Shift+Tab y foco programático permanecen dentro de Ayuda',()=>{
 const t=fixture();t.fab.focus();t.run('show("help")');
 t.node('modalClose').focus();assert.equal(t.key('Tab',true).prevented,true);
 assert.equal(t.document.activeElement,t.node('modalOption'));
 t.node('modalOption').focus();assert.equal(t.key('Tab').prevented,true);
 assert.equal(t.document.activeElement,t.node('modalClose'));
 t.board.focus();assert.equal(t.document.activeElement,t.node('modalClose'));
});

test('C16 | cerrar Ayuda libera el tablero y recupera el origen',()=>{
 const t=fixture();t.fab.focus();t.run('show("help");hide();');
 assert.equal(t.board.inert,false);
 assert.equal(t.backdrop.inert,false);
 assert.equal(t.document.activeElement,t.fab);
 assert.equal(t.key('Tab').prevented,false);
});

test('C16 | fallecimiento aísla tablero, modal inferior y foco del teclado',()=>{
 const t=fixture();t.fab.focus();t.run('show("help");kill(game.humans[0],"foco");deathDirector.open();');
 assert.equal(t.death.hidden,false);
 assert.equal(t.document.activeElement,t.node('deathContinue'));
 assert.equal(t.board.inert,true);assert.equal(t.backdrop.inert,true);
 assert.equal(t.key('Tab').prevented,true);
 assert.equal(t.key('Tab',true).prevented,true);
 t.board.focus();assert.equal(t.document.activeElement,t.node('deathContinue'));
 t.key('Escape');assert.equal(t.backdrop.classList.contains('open'),true);
});

test('C16 | tras fallecimiento se enfoca la sucesión y no queda el fondo inerte',()=>{
 const t=fixture();t.fab.focus();t.run('kill(game.humans[0],"foco");deathDirector.open();deathDirector.continue();');
 assert.equal(t.death.hidden,true);
 assert.equal(t.backdrop.classList.contains('open'),true);
 assert.equal(t.document.activeElement,t.node('modalClose'));
 assert.equal(t.board.inert,true);
 t.run('chooseLeader("h1");');
 assert.equal(t.board.inert,false);
 assert.equal(t.death.inert,false);
});

test('C16 | el pase local sigue teniendo prioridad sobre Ayuda',()=>{
 const t=fixture();t.run('show("help");showPass("ai");');
 assert.equal(t.pass.hidden,false);assert.equal(t.document.activeElement,t.node('pass1'));
 assert.equal(t.backdrop.inert,true);
 t.run('confirmPass()');
 assert.equal(t.pass.hidden,true);
 assert.equal(t.document.activeElement,t.node('modalClose'));
});
