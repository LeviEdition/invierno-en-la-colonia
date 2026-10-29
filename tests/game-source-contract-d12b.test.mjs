import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fixture} from '../test-support/game-fixture.mjs';
import {programFromHtml,programFromScript,readTestProgram,programFromTestScript} from '../test-support/game-source.mjs';
import {assertGameRuntimeContract} from '../test-support/game-runtime-contract.mjs';
import {buildPoc} from '../scripts/build-esbuild-poc.mjs';
import {bindCommands} from '../src/presentation/commands.mjs';
const html=await readFile(new URL('../invierno_colonia_v9_9.html',import.meta.url),'utf8');

test('D1.2b: cargador acepta HTML o script y produce la misma partida, sin ejecutar el bootstrap del navegador',()=>{
 const a=readTestProgram(),b=programFromTestScript(a.script);
 assert.equal(a.runtimeSource,b.runtimeSource);assert.equal(a.metadata.scriptSha256,b.metadata.scriptSha256);
 assert.equal(b.metadata.htmlSha256,null,'no inventar hash HTML para una fuente sin HTML');
 const fromHtml=fixture({program:a}),fromScript=fixture({program:b});
 assert.deepEqual(fromHtml.state('game'),fromScript.state('game'));
 assert.equal(fromHtml.metadata.scriptSha256,a.metadata.scriptSha256);
});
test('D1.2b: contrato real pasa con catálogo privado en IIFE sin exigir class ItemCatalog',async()=>{
 const {html:candidate}=await buildPoc();assert.doesNotMatch(candidate,/globalThis\.catalog\s*=/);
 assertGameRuntimeContract(fixture({program:readTestProgram(),render:true}));
});
test('D1.2b: rechaza scripts externos/múltiples y una IIFE completa sin adaptador, sin eliminar código a ciegas',()=>{
 assert.throws(()=>programFromHtml(html.replace('</body>','<script>0;</script></body>')),/único script/);
 assert.throws(()=>programFromHtml('<script src="engine.js"></script>'),/único script/);
 assert.throws(()=>programFromScript('(()=>{'+readTestProgram().script+'})();'),/adaptador explícito/);
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
 const listeners=new Map();let removed=0;
 const root={addEventListener(type,fn,capture){assert.equal(capture,true);listeners.set(type,fn);},removeEventListener(type,fn,capture){assert.equal(capture,true);assert.equal(listeners.get(type),fn);listeners.delete(type);removed++;}};
 const dispatch=(name,{disabled=false,args=[],type='click',event='click',nested=true}={})=>{
  const flags={stopped:false};const attrs={'data-command':name};
  const element={disabled,dataset:{args:typeof args==='string'?args:JSON.stringify(args),event},getAttribute:key=>attrs[key]};
  const target=nested?{closest:()=>element}:Object.assign(element,{closest:()=>element});
  listeners.get(type)?.({type,target,stopPropagation(){flags.stopped=true;}});return flags;
 };
 return {root,dispatch,get removed(){return removed;}};
}
test('D1.2b: inicio IA/local y pase invocan solo comandos inyectados, incluidos objetivos anidados',()=>{
 const d=documentDouble(),calls=[];bindCommands(d.root,{startGame:mode=>calls.push(mode),confirmPass:()=>calls.push('pass')});
 d.dispatch('startGame',{args:['ai']});d.dispatch('startGame',{args:['local']});d.dispatch('confirmPass');assert.deepEqual(calls,['ai','local','pass']);
});
test('D1.2b: otros controles y botones deshabilitados no ejecutan comandos',()=>{
 const d=documentDouble();let calls=0;bindCommands(d.root,{confirmPass:()=>calls++});
 d.dispatch('unknown');d.dispatch('confirmPass',{disabled:true});assert.equal(calls,0);
});
test('D1.2b: valida capacidades, impide doble instalación y permite desconectar/reconectar',()=>{
 const d=documentDouble(),commands={confirmPass(){}};assert.throws(()=>bindCommands(d.root,null),TypeError);
 const dispose=bindCommands(d.root,commands);assert.throws(()=>bindCommands(d.root,commands),/ya están conectados/);
 dispose();dispose();assert.equal(d.removed,4);d.dispatch('confirmPass');bindCommands(d.root,commands)();assert.equal(d.removed,8);
});
test('D1: argumentos inválidos, propiedades heredadas y evento equivocado no ejecutan comandos',()=>{
 const d=documentDouble();let calls=0;bindCommands(d.root,{confirmPass:()=>calls++});
 d.dispatch('confirmPass',{args:'malformed'});d.dispatch('confirmPass',{args:'{}'});d.dispatch('toString');d.dispatch('confirmPass',{type:'change'});assert.equal(calls,0);
});
test('D1: hover usa argumentos propios y atributos únicos, sin confundir mouseenter de un hijo',()=>{
 const listeners=new Map(),calls=[];const root={addEventListener:(type,fn)=>listeners.set(type,fn)};
 bindCommands(root,{statInfo:(key)=>calls.push('enter:'+key),statInfoClose:(key)=>calls.push('leave:'+key)});
 const attrs={'data-command-enter':'statInfo','data-args-enter':'["morale"]','data-command-leave':'statInfoClose','data-args-leave':'["comida"]'};
 const element={dataset:{},getAttribute:key=>attrs[key],closest:()=>element};
 listeners.get('mouseenter')({target:{closest:()=>element}});assert.deepEqual(calls,[]);
 listeners.get('mouseenter')({target:element});listeners.get('mouseleave')({target:element});assert.deepEqual(calls,['enter:morale','leave:comida']);
});
