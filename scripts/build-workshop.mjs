import {build} from 'esbuild';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {checkWorkshopKit,workshopRoot} from './check-workshop-kit.mjs';
export async function buildWorkshop({check=false}={}){
 const {profiles}=await checkWorkshopKit();
 const result=await build({absWorkingDir:workshopRoot,entryPoints:['prototypes/hospital-workshop/main.mjs'],outfile:'dist/hospital-workshop/game.mjs',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof',metafile:true,write:false});
 const inputs=Object.keys(result.metafile.inputs).map(p=>p.replaceAll('\\','/'));
 if(inputs.some(p=>p.startsWith('src/')||['prototypes/hospital/main.mjs','prototypes/hospital-phaser/main.mjs'].includes(p)))throw Error('El taller no puede importar motor ni entradas de las referencias');
 const bytes=result.outputFiles[0].contents,file=resolve(workshopRoot,'dist/hospital-workshop/game.mjs');
 if(check){if(!Buffer.from(bytes).equals(await readFile(file)))throw Error('Build del taller no reproducible');}
 else{await mkdir(resolve(workshopRoot,'dist/hospital-workshop'),{recursive:true});await writeFile(file,bytes);}
 const info={phaser:'4.2.1',esbuild:'0.28.2',rawBytes:bytes.length,gzip9Bytes:gzipSync(bytes,{level:9}).length,sha256:createHash('sha256').update(bytes).digest('hex'),inputs,profiles};
 if(!check)await writeFile(resolve(workshopRoot,'dist/hospital-workshop/build.json'),JSON.stringify(info,null,2)+'\n');return info;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){const info=await buildWorkshop({check:process.argv.includes('--check')});console.log(JSON.stringify({phaser:info.phaser,rawBytes:info.rawBytes,gzip9Bytes:info.gzip9Bytes,sha256:info.sha256},null,2));}
