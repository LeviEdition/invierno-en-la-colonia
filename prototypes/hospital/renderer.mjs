import {scene,spriteRect,drawOrder} from './scene.mjs';

export async function loadImages(){
 const entries=await Promise.all(['ground','hospital','zombie'].map(async key=>{
  const image=new Image();image.src=scene[key].url.href;
  await image.decode();return [key,image];
 }));
 return Object.fromEntries(entries);
}

export function makeHospitalHitTest(image){
 const surface=document.createElement('canvas');surface.width=image.width;surface.height=image.height;
 const ctx=surface.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,image.width,image.height).data;
 return point=>{
  const rect=spriteRect(scene.hospital,image);
  const x=Math.floor((point.x-rect.x)/scene.hospital.scale),y=Math.floor((point.y-rect.y)/scene.hospital.scale);
  // Solo alfa real. Ignora residuos alfa1 y el margen, sin eliminar colores ni alterar el PNG.
  return x>=0&&y>=0&&x<image.width&&y<image.height&&pixels[(y*image.width+x)*4+3]>=16;
 };
}

function drawSprite(ctx,image,asset){
 const r=spriteRect(asset,image);ctx.drawImage(image,r.x,r.y,r.width,r.height);
}

function drawShadow(ctx,position){
 ctx.save();ctx.translate(position.x-7,position.y-1);ctx.scale(19,5);
 const gradient=ctx.createRadialGradient(0,0,0,0,0,1);
 gradient.addColorStop(0,'rgba(22,32,38,.3)');gradient.addColorStop(1,'rgba(22,32,38,0)');
 ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawSelection(ctx,camera){
 const {position,anchor,scale,visibleBounds:b}=scene.hospital;
 const x=position.x+(b.x-anchor.x)*scale,y=position.y+(b.y-anchor.y)*scale;
 const w=b.width*scale,h=b.height*scale,arm=10/camera.zoom;
 ctx.save();ctx.strokeStyle='#a77a28';ctx.lineWidth=1.5/camera.zoom;ctx.beginPath();
 for(const [px,py,dx,dy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){
  ctx.moveTo(px+dx*arm,py);ctx.lineTo(px,py);ctx.lineTo(px,py+dy*arm);
 }
 ctx.stroke();ctx.restore();
}

export function renderScene(ctx,{images,camera,viewport,pose,showHidden=false,selected=false}){
 const {width,height,dpr=1}=viewport;
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
 ctx.fillStyle='#c5ced8';ctx.fillRect(0,0,width*dpr,height*dpr);
 // Todas las capas, incluida la sombra independiente, comparten esta transformación.
 ctx.setTransform(dpr*camera.zoom,0,0,dpr*camera.zoom,dpr*camera.x,dpr*camera.y);
 for(const layer of drawOrder(pose)){
  if(layer==='ground')drawSprite(ctx,images.ground,scene.ground);
  else if(layer==='shadow')drawShadow(ctx,pose.position);
  else if(layer==='hospital'){
   ctx.save();ctx.globalAlpha=showHidden ? .28 : 1;drawSprite(ctx,images.hospital,scene.hospital);ctx.restore();
  }else drawSprite(ctx,images.zombie,{...scene.zombie,position:pose.position});
 }
 if(selected)drawSelection(ctx,camera);
}
