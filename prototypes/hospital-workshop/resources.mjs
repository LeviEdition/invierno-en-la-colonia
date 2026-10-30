import {textureEstimate} from './kit.mjs';

export async function loadResources(kit){
 const records=await Promise.all(kit.assets.filter(a=>a.kind==='image').map(async asset=>{
  const image=new Image();image.src=new URL(asset.file,import.meta.url).href;await image.decode();
  if(image.width!==asset.width||image.height!==asset.height)throw Error('Dimensiones distintas del manifiesto: '+asset.id);
  let alpha=null;
  if(asset.alpha){
   const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(image,0,0);
   const rgba=x.getImageData(0,0,c.width,c.height).data;alpha=new Uint8Array(image.width*image.height);for(let i=0;i<alpha.length;i++)alpha[i]=rgba[i*4+3];c.width=c.height=1;
  }
  return [asset.id,{image,alpha}];
 }));return Object.fromEntries(records);
}
export function prepareResources(kit,originals,profile){
 return Object.fromEntries(kit.assets.filter(a=>a.kind==='image').map(asset=>{
  const source=originals[asset.id],estimate=textureEstimate(asset,profile.factor);let image=source.image;
  if(profile.factor!==1){
   image=document.createElement('canvas');image.width=estimate.width;image.height=estimate.height;
   const ctx=image.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   // Transformación uniforme. ceil solo reserva el margen fraccionario; no estira.
   ctx.setTransform(profile.factor,0,0,profile.factor,0,0);ctx.drawImage(source.image,0,0);
  }
  return [asset.id,{...source,image,estimate,factor:profile.factor,sourceId:asset.id,provenance:asset.provenance}];
 }));
}
export function pickNode(nodes,assets,originals,point){
 for(const node of [...nodes].sort((a,b)=>b.depth-a.depth)){
  if(!node.visible||node.role==='ground')continue;
  const asset=assets[node.assetId],scale=asset.scale*node.multiplier,x=Math.floor((point.x-node.position.x)/scale+asset.pivot.x),y=Math.floor((point.y-node.position.y)/scale+asset.pivot.y);
  if(x<0||y<0||x>=asset.width||y>=asset.height)continue;
  if(asset.kind==='marker'||!originals[asset.id].alpha||originals[asset.id].alpha[y*asset.width+x]>=16)return node.id;
 }return null;
}
