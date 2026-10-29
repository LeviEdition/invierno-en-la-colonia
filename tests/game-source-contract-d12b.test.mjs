import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fixture} from '../test-support/game-fixture.mjs';
import {programFromHtml,programFromScript} from '../test-support/game-source.mjs';
import {assertGameRuntimeContract} from '../test-support/game-runtime-contract.mjs';
import {buildPoc} from '../scripts/build-esbuild-poc.mjs';
import {bindHandoverControls} from '../src/handover-ui.mjs';
const html=await readFile(new URL('../invierno_colonia_v9_9.html',import.meta.url),'utf8');

test('D1.2b: cargador acepta HTML o script y produce la misma partida, sin ejecutar el bootstrap del navegador',()=>{
 const a=programFromHtml(html),b=programFromScript(a.script);
 assert.equal(a.runtimeSource,b.runtimeSource);assert.equal(a.metadata.scriptSha256,b.metadata.scriptSha256);
 assert.equal(b.metadata.htmlSha256,null,'no inventar hash HTML para una fuente sin HTML');
 const fromHtml=fixture({program:a}),fromScript=fixture({program:b});
 assert.deepEqual(fromHtml.state('game'),fromScript.state('game'));
 assert.equal(fromHtml.metadata.scriptSha256,a.metadata.scriptSha256);
});
test('D1.2b: contrato real pasa con catálogo privado en IIFE sin exigir class ItemCatalog',async()=>{
 const {html:candidate}=await buildPoc();assert.doesNotMatch(candidate,/\bclass ItemCatalog\b/);
 assertGameRuntimeContract(fixture({program:programFromHtml(candidate),render:true}));
});
test('D1.2b: rechaza scripts externos/múltiples y una IIFE completa sin adaptador, sin eliminar código a ciegas',()=>{
 assert.throws(()=>programFromHtml(html.replace('</body>','<script>0;</script></body>')),/único script/);
 assert.throws(()=>programFromHtml('<script src="engine.js"></script>'),/único script/);
 assert.throws(()=>programFromScript('(()=>{'+programFromHtml(html).script+'})();'),/adaptador explícito/);
});
for(const [label,mutation] of [
 ['resolución errónea del catálogo','catalog.resolve=()=>({id:"incorrecto"});'],
 ['clase de turnos ausente','TurnController=null;'],
 ['acción de objetos ausente','delete ItemEngine.prototype.attack;'],
 ['director sin interfaz de muerte','DeathDirector=class {constructor(){this.pending=[];}};'],
 ['crisis que acepta cualquier carta','CrisisManager.canContribute=()=>true;'],
 ['entrada paint ausente','paint=undefined;'],
])test('D1.2b: contrato detecta '+label,()=>{
 const t=fixture({render:true});assertGameRuntimeContract(t);t.run(mutation);
 assert.throws(()=>assertGameRuntimeContract(t));
});

function documentDouble(){
 let listener;let removed=0;
 const root={addEventListener(type,fn,capture){assert.equal(type,'click');assert.equal(capture,true);listener=fn;},
  removeEventListener(type,fn,capture){assert.equal(type,'click');assert.equal(capture,true);assert.equal(listener,fn);listener=undefined;removed++;}};
 const dispatch=(selector,{disabled=false}={})=>{
  const flags={prevented:false,stopped:false};
  const button={disabled,matches:value=>value===selector};
  listener?.({target:{closest:value=>{assert.equal(value,'button');return button;}},preventDefault(){flags.prevented=true;},stopImmediatePropagation(){flags.stopped=true;}});
  return flags;
 };
 return {root,dispatch,get removed(){return removed;}};
}
test('D1.2b: inicio IA/local y pase invocan solo los comandos inyectados y detienen el handler inline',()=>{
 const d=documentDouble(),calls=[];
 bindHandoverControls(d.root,{startGame:mode=>calls.push(mode),confirmPass:()=>calls.push('pass')});
 for(const selector of ['#setupScreen [onclick="startGame(\'ai\')"]','#setupScreen [onclick="startGame(\'local\')"]','#passScreen [onclick="confirmPass()"]']){
  assert.deepEqual(d.dispatch(selector),{prevented:true,stopped:true});
 }
 assert.deepEqual(calls,['ai','local','pass']);
});
test('D1.2b: otros controles y botones deshabilitados conservan su evento sin ejecutar comandos',()=>{
 const d=documentDouble();let calls=0;
 bindHandoverControls(d.root,{startGame:()=>calls++,confirmPass:()=>calls++});
 assert.deepEqual(d.dispatch('#floatingActions'),{prevented:false,stopped:false});
 assert.deepEqual(d.dispatch('#passScreen [onclick="confirmPass()"]',{disabled:true}),{prevented:false,stopped:false});
 assert.equal(calls,0);
});
test('D1.2b: valida capacidades, impide doble instalación y permite desconectar/reconectar sin listeners residuales',()=>{
 const d=documentDouble(),commands={startGame(){},confirmPass(){}};
 assert.throws(()=>bindHandoverControls(d.root,{startGame(){}}),TypeError);
 const dispose=bindHandoverControls(d.root,commands);
 assert.throws(()=>bindHandoverControls(d.root,commands),/ya están conectados/);
 dispose();dispose();assert.equal(d.removed,1);
 assert.deepEqual(d.dispatch('#passScreen [onclick="confirmPass()"]'),{prevented:false,stopped:false});
 bindHandoverControls(d.root,commands)();assert.equal(d.removed,2);
});
