import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {validateKit,textureEstimate} from '../prototypes/hospital-workshop/kit.mjs';
export const workshopRoot=fileURLToPath(new URL('../',import.meta.url));
export async function checkWorkshopKit(){
 const url=new URL('../prototypes/hospital-workshop/kit.json',import.meta.url),kit=validateKit(JSON.parse(await readFile(url)));
 for(const asset of kit.assets.filter(a=>a.kind==='image')){
  const bytes=await readFile(new URL(asset.file,url));
  if(bytes.length<26||bytes.toString('hex',0,8)!=='89504e470d0a1a0a'||bytes.length!==asset.bytes||createHash('sha256').update(bytes).digest('hex')!==asset.sha256||bytes.readUInt32BE(16)!==asset.width||bytes.readUInt32BE(20)!==asset.height||!([2,6].includes(bytes[25]))||(bytes[25]===6)!==asset.alpha)throw Error('PNG no coincide con contrato: '+asset.id);
  if(!/^assets\/(prototipo-hospital|hospital-workshop)\/manifest\.json$/.test(asset.provenance.manifest))throw Error('Manifiesto de procedencia fuera del piloto');
  const provenance=JSON.parse(await readFile(resolve(workshopRoot,asset.provenance.manifest))),record=provenance.assets.find(a=>a.file===asset.provenance.record);
  if(!record||record.sha256!==asset.sha256||record.width!==asset.width||record.height!==asset.height||record.bytes!==asset.bytes)throw Error('Procedencia no coincide: '+asset.id);
 }
 return {kit,profiles:kit.profiles.map(p=>({id:p.id,factor:p.factor,textures:kit.assets.filter(a=>a.kind==='image').map(a=>({id:a.id,...textureEstimate(a,p.factor)}))}))};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)console.log(JSON.stringify(await checkWorkshopKit(),null,2));
