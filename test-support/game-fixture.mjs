// Motor real del HTML. DOM mínimo solo para pruebas que no afirman geometría/foco real.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createContext,runInContext} from 'node:vm';
const html=readFileSync(new URL('../invierno_colonia_v9_9.html',import.meta.url),'utf8');
const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)][0][1];
const boot=/\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
if(!boot.test(script))throw Error('Revisar arranque del fixture');
export const engineMetadata={htmlSha256:createHash('sha256').update(html).digest('hex'),scriptSha256:createHash('sha256').update(script).digest('hex'),rng:'LCG32: x=(1664525*x+1013904223) modulo 2^32; random=x/2^32'};
export function fixture({mode='local',face=6,seed,render=false,natural=false}={}){
 let rng=seed===undefined?null:seed>>>0;const math=Object.create(Math);let roll=(face-.5)/6;
 math.random=()=>{if(rng===null)return roll;rng=(Math.imul(1664525,rng)+1013904223)>>>0;return rng/4294967296;};
 const nodes=new Map();const node=id=>{
  if(!nodes.has(id)){const classes=new Set();nodes.set(id,{id,hidden:true,innerHTML:'',textContent:'',style:{},dataset:{},disabled:false,
   classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},setAttribute(){},focus(){},appendChild(){},remove(){}});}
  return nodes.get(id);
 };
 const document={addEventListener(){},getElementById:node,querySelector:node};
 const context=createContext({document,Math:math,queueMicrotask,setTimeout(fn){queueMicrotask(fn);},clearTimeout(){}});
 runInContext(script.replace(boot,''),context,{timeout:3000});
 const run=code=>runInContext(code,context,{timeout:4000});
 run((render||natural?'':'paint=()=>{};')+'toast=()=>{};gameMode='+JSON.stringify(mode)+';create();passScreenActive=false;'+(natural?'':'game.crossPending=false;game.crossResolved=true;hide();'));
 return {run,state:expr=>JSON.parse(run('JSON.stringify('+expr+')')),node,roll(face){roll=(face-.5)/6;},seed(value){rng=value>>>0;}};
}
export const silentCross='game.crossRemaining=Array(32).fill(crossroadsDeck.findIndex(c=>c.title==="Un almacén bajo el hielo"));game.crossPending=false;game.crossResolved=true;';
