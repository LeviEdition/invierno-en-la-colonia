import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {validateKit,textureEstimate,resourceFactor} from '../prototypes/hospital-workshop/kit.mjs';
export const workshopRoot=fileURLToPath(new URL('../',import.meta.url));
export async function checkUploadedArtwork(){
 const root=new URL('../kit_arte_h33/',import.meta.url),manifest=JSON.parse(await readFile(new URL('manifest.json',root)));
 if(manifest.version!==1||manifest.files.length!==9||new Set(manifest.files.map(a=>a.file)).size!==9)throw Error('Entrega H3.3 incompleta');
 for(const a of manifest.files){
  if(!/^(assets|referencias)\/[a-z0-9-]+\.png$/.test(a.file)||!['prototype_asset','reference_only'].includes(a.role)||(a.file.startsWith('referencias/')!==(a.role==='reference_only')))throw Error('Ruta/rol fuera de la entrega H3.3');
  const bytes=await readFile(new URL(a.file,root));
  if(bytes.length<26||bytes.toString('hex',0,8)!=='89504e470d0a1a0a'||bytes.length!==a.bytes||createHash('sha256').update(bytes).digest('hex')!==a.sha256||bytes.readUInt32BE(16)!==a.width||bytes.readUInt32BE(20)!==a.height||bytes[25]!==({RGB:2,RGBA:6})[a.mode])throw Error('Original de entrega alterado: '+a.file);
 }
 return manifest;
}
export async function checkWorkshopKit({uploaded=false}={}){
 const url=new URL('../prototypes/hospital-workshop/'+(uploaded?'uploaded-kit.json':'kit.json'),import.meta.url),kit=validateKit(JSON.parse(await readFile(url)));
 if(uploaded)await checkUploadedArtwork();
 for(const asset of kit.assets.filter(a=>a.kind==='image')){
  const bytes=await readFile(new URL(asset.file,url));
  if(bytes.length<26||bytes.toString('hex',0,8)!=='89504e470d0a1a0a'||bytes.length!==asset.bytes||createHash('sha256').update(bytes).digest('hex')!==asset.sha256||bytes.readUInt32BE(16)!==asset.width||bytes.readUInt32BE(20)!==asset.height||!([2,6].includes(bytes[25]))||(bytes[25]===6)!==asset.alpha)throw Error('PNG no coincide con contrato: '+asset.id);
  if(!/^(?:assets\/(?:prototipo-hospital|hospital-workshop)|kit_arte_h33)\/manifest\.json$/.test(asset.provenance.manifest))throw Error('Manifiesto de procedencia fuera del piloto');
  const provenance=JSON.parse(await readFile(resolve(workshopRoot,asset.provenance.manifest))),record=(provenance.assets||provenance.files).find(a=>a.file===asset.provenance.record);
  if(!record||record.sha256!==asset.sha256||record.width!==asset.width||record.height!==asset.height||record.bytes!==asset.bytes)throw Error('Procedencia no coincide: '+asset.id);
 }
 return {kit,profiles:kit.profiles.map(p=>({id:p.id,factor:p.factor,textures:kit.assets.filter(a=>a.kind==='image').map(a=>({id:a.id,...textureEstimate(a,resourceFactor(a,p.factor))}))}))};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)console.log(JSON.stringify(await checkWorkshopKit({uploaded:process.argv.includes('--uploaded')}),null,2));
