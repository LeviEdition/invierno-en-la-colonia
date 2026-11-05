import {buildActionMap} from './build-action-map.mjs';
import {build} from 'esbuild';import {readFile,writeFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
export async function buildHorizontalMap(options={}){
 const result=await buildActionMap({...options,variant:'horizontal-map'});
 if(options.qa&&options.write!==false&&!options.check){
  const root=fileURLToPath(new URL('../',import.meta.url));
  await build({absWorkingDir:root,entryPoints:['prototypes/horizontal-map/capacity-preview.mjs'],outfile:'dist/horizontal-map-qa/capacity.mjs',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,plugins:[{name:'horizontal-qa-scene',setup(b){b.onResolve({filter:/^\.\/scene-configuration\.mjs$/},args=>args.importer.endsWith('/action-map/map-view.mjs')?{path:resolve(root,'prototypes/horizontal-map/scene-configuration.mjs')}:undefined);}}]});
  const html=(await readFile(resolve(root,'dist/horizontal-map-qa/index.html'),'utf8')).replace(/<script type="module"[^>]*><\/script>/,'');
  await writeFile(resolve(root,'dist/horizontal-map-qa/capacity.html'),html);
 }
 return result;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){const {html,javascript,...info}=await buildHorizontalMap({qa:process.argv.includes('--qa'),check:process.argv.includes('--check')});console.log(JSON.stringify(info,null,2));}
