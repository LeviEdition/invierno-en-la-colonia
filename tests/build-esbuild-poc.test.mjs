import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createContext,runInContext} from 'node:vm';
import {build} from 'esbuild';
import {buildPoc} from '../scripts/build-esbuild-poc.mjs';
const template=await readFile(new URL('../src/invierno.template.html',import.meta.url),'utf8');
const marker='/* __D1_ITEM_CATALOG__ */';

test('D1.2a: bundle usa dos módulos reales y conserva byte a byte la plantilla fuera del catálogo',async()=>{
 const {html,embedded,metafile}=await buildPoc();
 assert.deepEqual(Object.keys(metafile.inputs).sort(),['src/catalog-poc-entry.mjs','src/handover-ui.mjs','src/item-catalog.mjs']);
 const [before,after]=template.split(marker);
 assert.equal(html,before+embedded+after);
 assert.equal([...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].length,1);
 assert.doesNotMatch(html,/<script\s+[^>]*(?:src=|type=["']module)/);
});
test('D1.2a: dos construcciones producen exactamente los mismos bytes',async()=>{
 assert.equal((await buildPoc()).html,(await buildPoc()).html);
});
test('D1.2a: puente de catálogo conserva inyección y no publica estado ni namespace en window',async()=>{
 const {embedded}=await buildPoc();let calls=0;
 const context=createContext({mix:cards=>{calls++;return cards;}});
 const globals=Object.keys(context);runInContext(embedded,context);
 assert.deepEqual(Object.keys(context),globals);
 assert.equal(runInContext('typeof CatalogModule',context),'undefined');
 assert.equal(runInContext('typeof game',context),'undefined');
 assert.equal(runInContext('Object.keys(catalog.definitions).length',context),17);
 assert.equal(calls,0,'crear el catálogo no consume azar');
 assert.equal(runInContext('catalog.deck(1).length',context),20);assert.equal(calls,1);
});
test('D1.2a: imports y exports alternativos no necesitan reemplazar la firma textual de la clase',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'d12a-esm-'));
 try{
  const source=await readFile(new URL('../src/item-catalog.mjs',import.meta.url),'utf8');
  await writeFile(join(dir,'catalog.mjs'),source.replace('export class ItemCatalog {','class ItemCatalog {')+'\nexport {ItemCatalog};\n');
  await writeFile(join(dir,'handover-ui.mjs'),await readFile(new URL('../src/handover-ui.mjs',import.meta.url),'utf8'));
  await writeFile(join(dir,'entry.mjs'),'import {ItemCatalog as Catalog} from "./catalog.mjs"; export {Catalog as ItemCatalog}; export {bindHandoverControls} from "./handover-ui.mjs";');
  const {embedded}=await buildPoc({template,entryPoint:'entry.mjs',workingDir:dir});
  const context=createContext({mix:x=>x});runInContext(embedded,context);
  assert.equal(runInContext('catalog.resolve("ration").id',context),'ration');
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('D1.2a: IIFE del script entero oculta handlers; no se migra UI/fixtures por este experimento',async()=>{
 const html=(await buildPoc()).html;
 const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)][0][1];
 const boot=/\ncreate\(\);\s*\ndocument\.getElementById\('setupScreen'\)\.hidden=false;passScreenActive=true;\s*\npaint\(\);\s*$/;
 assert.match(script,boot);
 const whole=await build({stdin:{contents:script,loader:'js'},bundle:true,format:'iife',treeShaking:false,write:false,target:'es2022'});
 assert.match(whole.outputFiles[0].text,/create\(\);[\s\S]*setupScreen/,'el bundle todavía contiene el arranque');
 assert.doesNotMatch(whole.outputFiles[0].text,boot,'el cargador antiguo no reconoce el arranque dentro de IIFE');
 const {outputFiles}=await build({stdin:{contents:script.replace(boot,''),loader:'js'},bundle:true,format:'iife',treeShaking:false,write:false,target:'es2022'});
 const context=createContext({document:{addEventListener(){}},queueMicrotask(){}});
 runInContext(outputFiles[0].text,context);
 for(const name of ['startGame','show','search','game'])assert.equal(runInContext('typeof '+name,context),'undefined');
 assert.throws(()=>runInContext('startGame("local")',context),{name:'ReferenceError'});
});
test('D1.2a: un marcador ausente o duplicado se rechaza antes de generar artefacto',async()=>{
 await assert.rejects(buildPoc({template:template.replace(marker,'')}),/exactamente un marcador/);
 await assert.rejects(buildPoc({template:template+marker}),/exactamente un marcador/);
});
