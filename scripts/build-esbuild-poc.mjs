// Alias de compatibilidad de los comandos D1.2. No mantiene otro ensamblador.
import {buildGame} from './build-game.mjs';import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
export const buildPoc=buildGame;
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 await mkdir('dist',{recursive:true});const {html}=await buildGame();
 if(process.argv.includes('--check')){if(await readFile('dist/invierno-esbuild-poc.html','utf8')!==html)throw Error('Salida alternativa desactualizada');}
 else await writeFile('dist/invierno-esbuild-poc.html',html);
}
