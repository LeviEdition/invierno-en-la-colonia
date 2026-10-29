// Cargador de pruebas: separa lectura del artefacto y preparación del script clásico.
// No interpreta reglas ni intenta abrir automáticamente el ámbito de una IIFE completa.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const bootstrap=/\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
const hash=value=>createHash('sha256').update(value).digest('hex');
export function programFromScript(script,{html}={}){
 if(!bootstrap.test(script))throw Error('Arranque no separable: este formato necesita un adaptador explícito de pruebas');
 return Object.freeze({script,runtimeSource:script.replace(bootstrap,''),metadata:Object.freeze({
  htmlSha256:html===undefined?null:hash(html),scriptSha256:hash(script)})});
}
export function programFromHtml(html){
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 if(scripts.length!==1||/<script\s+[^>]*(?:src=|type=["']module)/.test(html))throw Error('Se requiere un único script clásico embebido');
 return programFromScript(scripts[0][1],{html});
}
export function readGameProgram(file=new URL('../invierno_colonia_v9_9.html',import.meta.url)){
 return programFromHtml(readFileSync(file,'utf8'));
}

// D2: entrada explícita para el motor modular; no intenta abrir una IIFE de producción.
export function readTestProgram(){
 const runtimeSource=readFileSync(new URL('../dist/reference-test-runtime.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../invierno_colonia_v9_9.html',import.meta.url),'utf8');
 return Object.freeze({runtimeSource,script:runtimeSource,metadata:Object.freeze({htmlSha256:hash(html),scriptSha256:hash(runtimeSource)})});
}
export function programFromTestScript(script,{html}={}){
 if(!script.startsWith('// Invierno: adaptador de pruebas\n'))throw Error('Se requiere un adaptador explícito de pruebas');
 return Object.freeze({script,runtimeSource:script,metadata:Object.freeze({htmlSha256:html===undefined?null:hash(html),scriptSha256:hash(script)})});
}
