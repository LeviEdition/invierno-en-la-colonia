import {build} from 'esbuild';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';import {gzipSync} from 'node:zlib';
import {buildGame} from './build-game.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export const isActionMapView=importer=>importer.replaceAll('\\','/').endsWith('/action-map/map-view.mjs');
export async function buildActionMap({qa=false,check=false,write=true,variant='action-map'}={}){
 if(!['action-map','horizontal-map'].includes(variant))throw Error('Variante no admitida');
 const directory='dist/'+variant+(qa?'-qa':''),out=resolve(root,directory);
 const plugins=variant==='horizontal-map'?[{name:'horizontal-scene',setup(b){b.onResolve({filter:/^\.\/scene-configuration\.mjs$/},args=>isActionMapView(args.importer)?{path:resolve(root,'prototypes/horizontal-map/scene-configuration.mjs')}:undefined);}}]:[];
 const mapped=await build({absWorkingDir:root,entryPoints:['prototypes/action-map/main.mjs'],outfile:directory+'/map.mjs',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof',write:false,metafile:true,plugins,define:{__ACTION_MAP_QA__:String(qa),__ACTION_MAP_VARIANT__:JSON.stringify(variant)}});
 const javascript=mapped.outputFiles[0].text,mapBytes=mapped.outputFiles[0].contents,mapInputs=Object.keys(mapped.metafile.inputs).map(p=>p.replaceAll('\\','/'));
 if(mapInputs.some(p=>p.startsWith('src/')))throw Error('El visor no puede importar el motor');
 const host=await buildGame({entryPoint:'prototypes/action-map/reference-host.mjs',test:qa,plugins:variant==='horizontal-map'?[horizontalRulesPlugin(root)]:[]}),hostInputs=Object.keys(host.metafile.inputs).map(p=>p.replaceAll('\\','/'));
 if(!hostInputs.includes('src/application/reference-engine.mjs')||hostInputs.some(p=>p.includes('node_modules/phaser')))throw Error('El host debe usar el motor real sin otro renderer');
 if(!qa&&(/h344Test|h344DropReply|searchMessage|testBindings|__GAME_TEST__/.test(host.html)||/h344Test|__ACTION_MAP_QA__/.test(javascript)))throw Error('Instrumentación QA en producto');
 const files=[['map.mjs',mapBytes],['reference-host.html',Buffer.from(host.html)]];
 if(qa){let html=await readFile(resolve(root,'prototypes/'+variant+'/index.html'),'utf8');html=html.replaceAll('../hospital-workshop/','/prototypes/hospital-workshop/').replace('href="./style.css"','href="/prototypes/'+variant+'/style.css"').replace('../../dist/'+variant+'/map.mjs','/dist/'+variant+'-qa/map.mjs');files.push(['index.html',Buffer.from(html)]);}
 for(const [name,bytes] of files){if(check){if(!Buffer.from(bytes).equals(await readFile(resolve(out,name))))throw Error('Build de estado real desactualizado: '+name);}else if(write){await mkdir(out,{recursive:true});await writeFile(resolve(out,name),bytes);}}
 const info={phaser:'4.2.1',esbuild:'0.28.2',qa,map:{rawBytes:mapBytes.length,gzip9Bytes:gzipSync(mapBytes,{level:9}).length,sha256:digest(mapBytes),inputs:mapInputs},host:{rawBytes:Buffer.byteLength(host.html),sha256:digest(host.html),inputs:hostInputs}};
 if(write&&!check)await writeFile(resolve(out,'build.json'),JSON.stringify(info,null,2)+'\n');return {...info,html:host.html,javascript};
}
export function horizontalRulesPlugin(root){return {name:'horizontal-rules',setup(b){b.onResolve({filter:/reference-data\.mjs$/},args=>args.importer.replaceAll('\\','/').endsWith('/src/application/reference-engine.mjs')?{path:resolve(root,'prototypes/horizontal-map/reference-data.mjs')}:undefined);}};}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){const {html,javascript,...info}=await buildActionMap({qa:process.argv.includes('--qa'),check:process.argv.includes('--check')});console.log(JSON.stringify(info,null,2));}
