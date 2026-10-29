import {buildGame} from './build-game.mjs';import {mkdir,writeFile,readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const production=await buildGame(),qa=await buildGame({entryPoint:'test-support/browser-scenario-entry.mjs',test:true});
await mkdir('dist',{recursive:true});await writeFile('dist/invierno-test.html',qa.html);
const paths=Object.keys(production.metafile.inputs).filter(path=>path!=='src/main.mjs');
for(const path of paths)if(!(path in qa.metafile.inputs))throw Error('QA no usa el mismo módulo: '+path);
const hashes=Object.fromEntries(await Promise.all(paths.map(async path=>[path,createHash('sha256').update(await readFile(path)).digest('hex')])));
await writeFile('dist/qa-modules.json',JSON.stringify({productionSha256:createHash('sha256').update(production.html).digest('hex'),qaSha256:createHash('sha256').update(qa.html).digest('hex'),sharedSourceHashes:hashes,scope:'Escenarios QA con acceso privado; no es el artefacto de producto'},null,2)+'\n');
