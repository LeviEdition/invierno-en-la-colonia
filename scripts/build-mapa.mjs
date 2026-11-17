// Build del mapa (producto): visor Phaser + host del motor real, desde app/mapa/.
// Sin plugin de variante: el visor importa su escena directamente. Se conserva la
// inyección de reference-data (33 accesos) en el motor, sin tocar src/.
import {build} from 'esbuild';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';import {gzipSync} from 'node:zlib';
import {buildGame} from './build-game.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const plantillaHost='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Motor de partida</title><link rel="icon" href="data:,"></head><body><script>/* __GAME_BUNDLE__ */</script></body></html>';
export async function buildMapa({qa=false,check=false,write=true}={}){
 const directory='dist/mapa'+(qa?'-qa':''),out=resolve(root,directory);
 const mapped=await build({absWorkingDir:root,entryPoints:['app/mapa/main.mjs'],outfile:directory+'/map.mjs',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof',write:false,metafile:true,define:{__ACTION_MAP_QA__:String(qa),__ACTION_MAP_VARIANT__:JSON.stringify('horizontal-map')}});
 const javascript=mapped.outputFiles[0].text,mapBytes=mapped.outputFiles[0].contents,mapInputs=Object.keys(mapped.metafile.inputs).map(p=>p.replaceAll('\\','/'));
 if(mapInputs.some(p=>p.startsWith('src/')))throw Error('El visor no puede importar el motor');
 if(mapInputs.some(p=>p.startsWith('prototypes/')))throw Error('El producto no puede importar prototipos');
 const host=await buildGame({entryPoint:'app/mapa/motor/reference-host.mjs',template:plantillaHost,test:qa,mapExtension:true,plugins:[horizontalRulesPlugin(root)]}),hostInputs=Object.keys(host.metafile.inputs).map(p=>p.replaceAll('\\','/'));
 if(!hostInputs.includes('src/application/reference-engine.mjs')||hostInputs.some(p=>p.includes('node_modules/phaser')))throw Error('El host debe usar el motor real sin otro renderer');
 if(hostInputs.some(p=>p.startsWith('prototypes/')))throw Error('El producto no puede importar prototipos');
 if(!qa&&(/h344Test|h344DropReply|searchMessage|testBindings|__GAME_TEST__/.test(host.html)||/h344Test|__ACTION_MAP_QA__/.test(javascript)))throw Error('Instrumentación QA en producto');
 const files=[['map.mjs',mapBytes],['reference-host.html',Buffer.from(host.html)]];
 if(qa){
  // Copia QA de la página: estilos y bundle por rutas absolutas del servidor QA.
  let html=await readFile(resolve(root,'app/mapa/index.html'),'utf8');
  html=html.replaceAll('href="./estilos/','href="/app/mapa/estilos/').replace('../../dist/mapa/map.mjs','/dist/mapa-qa/map.mjs');
  files.push(['index.html',Buffer.from(html)]);
 }
 for(const [name,bytes] of files){if(check){if(!Buffer.from(bytes).equals(await readFile(resolve(out,name))))throw Error('Build del mapa desactualizado: '+name);}else if(write){await mkdir(out,{recursive:true});await writeFile(resolve(out,name),bytes);}}
 if(qa&&write&&!check){
  await build({absWorkingDir:root,entryPoints:['app/mapa/qa/capacity-preview.mjs'],outfile:'dist/mapa-qa/capacity.mjs',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true});
  const html=(await readFile(resolve(root,'dist/mapa-qa/index.html'),'utf8')).replace(/<script type="module"[^>]*><\/script>/,'');
  await writeFile(resolve(root,'dist/mapa-qa/capacity.html'),html);
 }
 const info={phaser:'4.2.1',esbuild:'0.28.2',qa,map:{rawBytes:mapBytes.length,gzip9Bytes:gzipSync(mapBytes,{level:9}).length,sha256:digest(mapBytes),inputs:mapInputs},host:{rawBytes:Buffer.byteLength(host.html),sha256:digest(host.html),inputs:hostInputs}};
 if(write&&!check)await writeFile(resolve(out,'build.json'),JSON.stringify(info,null,2)+'\n');return {...info,html:host.html,javascript};
}
// Capacidades del mapa (33 accesos) inyectadas al motor en el build, sin tocar src/.
export function horizontalRulesPlugin(root){return {name:'horizontal-rules',setup(b){b.onResolve({filter:/reference-data\.mjs$/},args=>args.importer.replaceAll('\\','/').endsWith('/src/application/reference-engine.mjs')?{path:resolve(root,'app/mapa/motor/reference-data.mjs')}:undefined);}};}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){const {html,javascript,...info}=await buildMapa({qa:process.argv.includes('--qa'),check:process.argv.includes('--check')});console.log(JSON.stringify(info,null,2));}
