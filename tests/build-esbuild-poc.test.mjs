// Contratos D1.2a conservados sobre el empaquetado adoptado: mismos riesgos, adaptador explícito.
import test from 'node:test';import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createContext,runInContext} from 'node:vm';
import {buildGame} from '../scripts/build-game.mjs';import {ItemCatalog} from '../src/item-catalog.mjs';
import {programFromHtml,readTestProgram} from '../test-support/game-source.mjs';
const template=await readFile(new URL('../src/invierno.template.html',import.meta.url),'utf8'),marker='/* __GAME_BUNDLE__ */';
test('D1: módulos reales y conservación exacta de la plantilla fuera del bundle',async()=>{
 const {html,embedded,metafile}=await buildGame();
 for(const path of ['src/main.mjs','src/item-catalog.mjs','src/application/reference-engine.mjs','src/presentation/commands.mjs','src/agents/reference-agent.mjs'])assert.ok(path in metafile.inputs,path);
 const [before,after]=template.split(marker);assert.equal(html,before+embedded+after);
 assert.equal([...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].length,1);
 assert.doesNotMatch(html,/<script\s+[^>]*(?:src=|type=["']module)/);
});
test('D1: dos construcciones producen exactamente los mismos bytes',async()=>{assert.equal((await buildGame()).html,(await buildGame()).html);});
test('D1: catálogo conserva inyección,17 definiciones y no consume RNG hasta crear mazo',async()=>{
 let calls=0;const catalog=new ItemCatalog(cards=>{calls++;return cards;});
 assert.equal(Object.keys(catalog.definitions).length,17);assert.equal(calls,0);
 assert.equal(catalog.deck(1).length,20);assert.equal(calls,1);
 const {embedded}=await buildGame();assert.doesNotMatch(embedded,/globalThis\.(?:game|catalog|CatalogModule|startGame)\s*=/);
});
test('D1: imports y exports alternativos no dependen de una firma textual de clase',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'d1-esm-'));try{
  const source=await readFile(new URL('../src/item-catalog.mjs',import.meta.url),'utf8');
  await writeFile(join(dir,'catalog.mjs'),source.replace('export class ItemCatalog {','class ItemCatalog {')+'\nexport {ItemCatalog as Alternate};\n');
  await writeFile(join(dir,'entry.mjs'),'import {Alternate} from "./catalog.mjs";const catalog=new Alternate(x=>x);globalThis.probe=catalog.resolve("ration").id;');
  const {embedded}=await buildGame({template,entryPoint:'entry.mjs',workingDir:dir});
  const context=createContext({});runInContext(embedded,context);assert.equal(context.probe,'ration');
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('D1: IIFE privada exige adaptador de pruebas y controles sin handlers globales',async()=>{
 const {html,embedded}=await buildGame();assert.throws(()=>programFromHtml(html),/adaptador explícito/);
 assert.doesNotMatch(html,/\bon(?:click|change|mouseenter|mouseleave)=/);
 assert.doesNotMatch(embedded,/Object\.defineProperties\(globalThis|testBindings|__test|\bwith\s*\(|\beval\(/);
 assert.match(readTestProgram().runtimeSource,/Object\.defineProperties\(globalThis/,'adaptador separado y explícito');
});
test('D1: marcador ausente o duplicado se rechaza antes de generar artefacto',async()=>{
 await assert.rejects(buildGame({template:template.replace(marker,'')}),/exactamente un marcador/);
 await assert.rejects(buildGame({template:template+marker}),/exactamente un marcador/);
});
