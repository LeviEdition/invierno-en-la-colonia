import {build} from 'esbuild';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {checkWorkshopKit,workshopRoot} from './check-workshop-kit.mjs';
import {validateAtmosphere} from '../prototypes/hospital-workshop/mockup/atmosphere-model.mjs';
import {validateScene} from '../prototypes/hospital-workshop/mockup/model.mjs';
import {makeMockupKit} from '../prototypes/hospital-workshop/mockup/assets.mjs';
import {resourceFactor,textureEstimate} from '../prototypes/hospital-workshop/kit.mjs';
export async function buildWorkshop({check=false}={}){
 const {profiles}=await checkWorkshopKit();
 const uploaded=await checkWorkshopKit({uploaded:true});
 const scene=validateScene(JSON.parse(await readFile(resolve(workshopRoot,'prototypes/hospital-workshop/mockup/scene.json'))));
 validateAtmosphere(JSON.parse(await readFile(resolve(workshopRoot,'prototypes/hospital-workshop/mockup/atmosphere.json'))));
 const mapKit=makeMockupKit(scene,uploaded.kit,JSON.parse(await readFile(resolve(workshopRoot,'kit_arte_h33/manifest.json'))));
 async function bundle(entry,filename){
 const result=await build({absWorkingDir:workshopRoot,entryPoints:[entry],outfile:'dist/hospital-workshop/'+filename,bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof',metafile:true,write:false});
 const inputs=Object.keys(result.metafile.inputs).map(p=>p.replaceAll('\\','/'));
 if(inputs.some(p=>p.startsWith('src/')||['prototypes/hospital/main.mjs','prototypes/hospital-phaser/main.mjs'].includes(p)))throw Error('El taller no puede importar motor ni entradas de las referencias');
 const bytes=result.outputFiles[0].contents,file=resolve(workshopRoot,'dist/hospital-workshop',filename);
 if(check){if(!Buffer.from(bytes).equals(await readFile(file)))throw Error('Build del taller no reproducible');}
 else{await mkdir(resolve(workshopRoot,'dist/hospital-workshop'),{recursive:true});await writeFile(file,bytes);}
 return {rawBytes:bytes.length,gzip9Bytes:gzipSync(bytes,{level:9}).length,sha256:createHash('sha256').update(bytes).digest('hex'),inputs};
 }
 const technical=await bundle('prototypes/hospital-workshop/main.mjs','game.mjs'),mockup=await bundle('prototypes/hospital-workshop/mockup/main.mjs','mockup.mjs');
 const info={phaser:'4.2.1',esbuild:'0.28.2',...technical,profiles,mockup:{...mockup,resourceBytes:mapKit.assets.reduce((n,a)=>n+a.bytes,0),textures:mapKit.assets.map(a=>({id:a.id,...textureEstimate(a,resourceFactor(a,1))}))}};
 if(!check)await writeFile(resolve(workshopRoot,'dist/hospital-workshop/build.json'),JSON.stringify(info,null,2)+'\n');return info;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){const info=await buildWorkshop({check:process.argv.includes('--check')});console.log(JSON.stringify({phaser:info.phaser,technical:{rawBytes:info.rawBytes,sha256:info.sha256},mockup:{rawBytes:info.mockup.rawBytes,gzip9Bytes:info.mockup.gzip9Bytes,sha256:info.mockup.sha256}},null,2));}
