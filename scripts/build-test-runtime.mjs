import {build} from 'esbuild';import {mkdir,writeFile} from 'node:fs/promises';
const result=await build({entryPoints:['test-support/reference-test-entry.mjs'],bundle:true,format:'iife',platform:'browser',target:'es2022',write:false,define:{__GAME_TEST__:'true'},charset:'utf8',legalComments:'none'});
await mkdir('dist',{recursive:true});await writeFile('dist/reference-test-runtime.js',result.outputFiles[0].text);
