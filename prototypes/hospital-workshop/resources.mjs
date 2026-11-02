import {textureEstimate,resourceFactor} from './kit.mjs';

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
export function prepareResources(kit,originals,profile,{portraitQuality='384'}={}){
 return Object.fromEntries(kit.assets.filter(a=>a.kind==='image').map(asset=>{
  const source=originals[asset.id],factor=resourceFactor(asset,profile.factor,portraitQuality),estimate=textureEstimate(asset,factor);let image=source.image;
  const generated=factor!==1||asset.presentation==='circular-portrait';
  if(generated){
   image=document.createElement('canvas');image.width=estimate.width;image.height=estimate.height;
   const ctx=image.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   // Transformación uniforme. ceil solo reserva el margen fraccionario; no estira.
   ctx.setTransform(factor,0,0,factor,0,0);
   if(asset.presentation==='circular-portrait'){ctx.beginPath();ctx.arc(asset.width/2,asset.height/2,asset.width/2,0,Math.PI*2);ctx.clip();}
   ctx.drawImage(source.image,0,0);
  }
  return [asset.id,{...source,image,estimate,factor,generated,sourceId:asset.id,provenance:asset.provenance}];
 }));
}
export function pickNode(nodes,assets,originals,point){
 for(const node of [...nodes].sort((a,b)=>b.depth-a.depth)){
  if(!node.visible||node.role==='ground')continue;
  const asset=assets[node.assetId],scale=asset.scale*node.multiplier,x=Math.floor((point.x-node.position.x)/scale+asset.pivot.x),y=Math.floor((point.y-node.position.y)/scale+asset.pivot.y);
  if(x<0||y<0||x>=asset.width||y>=asset.height)continue;
  if(asset.presentation==='circular-portrait'&&Math.hypot(x-asset.width/2,y-asset.height/2)>asset.width/2)continue;
  if(asset.kind==='marker'||!originals[asset.id].alpha||originals[asset.id].alpha[y*asset.width+x]>=16)return node.id;
 }return null;
}
