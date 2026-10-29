// Herramienta QA separada. Nunca se importa desde main ni se incluye en el HTML del producto.
import {createApplication} from '../src/application/create-application.mjs';
const {engine}=createApplication();
const bindings=engine.testBindings;
const hostFunctions=new Set(['getComputedStyle','matchMedia','getSelection','requestAnimationFrame','cancelAnimationFrame','setTimeout','clearTimeout','queueMicrotask','addEventListener','removeEventListener','confirm','alert','fetch']);
const scope=new Proxy(bindings,{
 has:(_target,key)=>!['scope','source','argument','eval'].includes(key),
 get(target,key){if(key===Symbol.unscopables)return undefined;if(key in target)return target[key];const value=globalThis[key];return hostFunctions.has(key)&&typeof value==='function'?value.bind(globalThis):value;},
 set(target,key,value){if(key in target){target[key]=value;}else globalThis[key]=value;return true;},
});
const execute=new Function('scope','source','argument','with(scope){return eval("("+source+")(argument)")}');
const install=new Function('scope','source','with(scope){eval(source)}');
Object.defineProperty(globalThis,'__test',{value:Object.freeze({run:(source,arg)=>execute(scope,source,arg),installController:source=>install(scope,source)})});
