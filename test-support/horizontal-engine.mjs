import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {horizontalRulesPlugin} from '../scripts/build-action-map.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
async function engineWithExtension(enabled){const r=await build({absWorkingDir:root,entryPoints:['src/application/reference-engine.mjs'],bundle:true,format:'esm',platform:'node',write:false,plugins:[horizontalRulesPlugin(root)],define:{__GAME_TEST__:'true',__MAP_EXTENSION__:String(enabled)}});
return (await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'))).createEngine;}
export const createEngine=await engineWithExtension(true);
export const createUninstrumentedEngine=await engineWithExtension(false);
