import {build} from 'esbuild';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
export const projectRoot=resolve(fileURLToPath(new URL('../',import.meta.url)));
export async function buildHospital({check=false}={}){
 const result=await build({absWorkingDir:projectRoot,entryPoints:['prototypes/hospital-phaser/main.mjs'],outfile:'dist/hospital-phaser/game.mjs',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof',metafile:true,write:false});
 const bytes=result.outputFiles[0].contents,path=resolve(projectRoot,'dist/hospital-phaser/game.mjs');
 if(check){if(!Buffer.from(await readFile(path)).equals(Buffer.from(bytes)))throw Error('Bundle H3.2 no reproducible; ejecutar npm run build:hospital');}
 else{await mkdir(resolve(projectRoot,'dist/hospital-phaser'),{recursive:true});await writeFile(path,bytes);}
 const info={phaser:'4.2.1',esbuild:'0.28.2',rawBytes:bytes.length,gzip9Bytes:gzipSync(bytes,{level:9}).length,sha256:createHash('sha256').update(bytes).digest('hex'),inputs:Object.keys(result.metafile.inputs).length};
 if(!check)await writeFile(resolve(projectRoot,'dist/hospital-phaser/build.json'),JSON.stringify(info,null,2)+'\n');
 return info;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)console.log(JSON.stringify(await buildHospital({check:process.argv.includes('--check')}),null,2));
