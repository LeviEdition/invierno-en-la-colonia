import {createAtmosphereView} from '../movement-map/storm-view.mjs';
import {addIllustratedTexture} from '../hospital-phaser/texture-quality.mjs';
import config from './environment.json';import sceneConfig from './scene.json';
import {vegetationOffset,lightLevel,staticVegetationRects,polygonInterior,unlitColor} from './environment-model.mjs';

// Todo es presentación. Mesh2D es la API pública 2D de Phaser4.2.1:
// no modelos3D, shader propio, motor nuevo o coordenadas del juego.
export function createHorizontalEnvironment(scene,atmosphere,options){
 const weather=createAtmosphereView(scene,atmosphere,options),objects=[],surfaces=[],keys=[];
 const vegetation=scene.textures.get('h33-vegetation'),vf=vegetation.get('original'),base=scene.textures.get('h33-map'),bf=base.get('original'),source=base.getSourceImage();
 const meshes=[],affected=[];
 function addMesh(rects,group){const vertices=[],indices=[],anchor=group?.anchor||{x:0,y:0};
  for(const [x,y,w,h]of rects){const X=group?Array.from({length:3},(_,i)=>x+w*i/2):[x,x+w],Y=group?[...new Set([...Array.from({length:5},(_,i)=>y+h*i/4),group.anchor.y-12])].sort((a,b)=>a-b):[y,y+h],offset=vertices.length/4;
   for(const y of Y)for(const x of X){const i=vertices.length;vertices.push(x-anchor.x,y-anchor.y,vf.u0+(vf.u1-vf.u0)*x/1672,vf.v0+(vf.v1-vf.v0)*y/941);if(group)affected.push({i,x,y,base:x-anchor.x,vertices,group});}
   for(let j=0;j<Y.length-1;j++)for(let i=0;i<X.length-1;i++){const a=offset+j*X.length+i,b=a+X.length,c=a+1,d=b+1;indices.push(a,b,c,0,b,c,d,0);}
  }
  const mesh=scene.add.mesh2d(anchor.x,anchor.y,vegetation,vertices,indices).setOrigin(0,0).setDepth(.2);mesh.indicesOrdered=indices;mesh.setUseOrderedIndices(true);objects.push(mesh);meshes.push({vertices,indices});
 }
 addMesh(staticVegetationRects(sceneConfig.bounds,config.groups));for(const g of config.groups)addMesh([g.rect],g);
 function canvasTexture(key,w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),c);addIllustratedTexture(scene.textures,key,c);surfaces.push(c,scene.textures.get(key).getSourceImage());keys.push(key);return key;}
 function sprite(key,x,y,depth){const o=scene.add.image(x,y,key,'original').setOrigin(0,0).setDepth(depth);objects.push(o);return o;}
 function path(ctx,poly,ox,oy){ctx.beginPath();poly.forEach(([x,y],i)=>i?ctx.lineTo(x-ox,y-oy):ctx.moveTo(x-ox,y-oy));ctx.closePath();}
 // El fondo generativo y la vegetación no encajan exactamente. Restituir los
 // polígonos del edificio desde el MISMO fondo evita árboles sobre fachadas.
 for(const z of sceneConfig.zones){const p=z.selectionPolygon,left=Math.floor(Math.min(...p.map(p=>p[0]))),top=Math.floor(Math.min(...p.map(p=>p[1]))),w=Math.ceil(Math.max(...p.map(p=>p[0])))-left,h=Math.ceil(Math.max(...p.map(p=>p[1])))-top;
  const key=canvasTexture('horizontal-building-'+z.id,w,h,ctx=>{path(ctx,p,left,top);ctx.clip();ctx.drawImage(source,bf.cutX+left,bf.cutY+top,w,h,0,0,w,h);});sprite(key,left,top,.5);
 }
 const lights=config.lights.map(l=>{const p=[...l.polygon,...l.spill],left=Math.floor(Math.min(...p.map(p=>p[0])))-2,top=Math.floor(Math.min(...p.map(p=>p[1])))-2,w=Math.ceil(Math.max(...p.map(p=>p[0])))-left+2,h=Math.ceil(Math.max(...p.map(p=>p[1])))-top+2;
  const original=canvasTexture(l.id+'-source',w,h,ctx=>{for(const polygon of [l.polygon,l.spill]){ctx.save();path(ctx,polygon,left,top);ctx.clip();ctx.drawImage(source,bf.cutX+left,bf.cutY+top,w,h,0,0,w,h);ctx.restore();}});
  const dark=canvasTexture(l.id+'-unlit',w,h,ctx=>{const frame=scene.textures.get(original).get('original');ctx.drawImage(scene.textures.get(original).getSourceImage(),frame.cutX,frame.cutY,w,h,0,0,w,h);const d=ctx.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const x=left+(i/4)%w,y=top+Math.floor(i/4/w),core=polygonInterior(x,y,l.polygon),edge=core||polygonInterior(x,y,l.spill),color=unlitColor([d.data[i],d.data[i+1],d.data[i+2]],!!core,edge);for(let j=0;j<3;j++)d.data[i+j]=color[j];}ctx.putImageData(d,0,0);});
  sprite(dark,left,top,.65);const lit=sprite(original,left,top,.7);
  const spill=canvasTexture(l.id+'-spill',w,h,ctx=>{path(ctx,l.spill,left,top);ctx.clip();const g=ctx.createLinearGradient(0,l.polygon[2][1]-top,0,h);g.addColorStop(0,'rgba(255,192,103,.26)');g.addColorStop(1,'rgba(255,192,103,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);const d=ctx.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4)d.data[i+3]*=Math.min(1,polygonInterior(left+(i/4)%w,top+Math.floor(i/4/w),l.spill)/5);ctx.putImageData(d,0,0);});const ground=sprite(spill,left,top,.8);
  return {...l,lit,ground,level:1};
 });
 let disposed=false,updates=0,lastClock=weather.visualClock(),lastWind=0;
 function paint(){const c=weather.visualClock(),enabled=c.settings.enabled&&!c.paused,wind=enabled&&c.settings.wind?c.wind*(c.settings.intensity==='storm'?1.8:.4):0;lastClock=c;
  lastWind=wind;for(const v of affected)v.vertices[v.i]=v.base+vegetationOffset(v.group,v.x,v.y,c.elapsed,wind);
  for(const l of lights){l.level=enabled&&c.settings.lights?lightLevel(l,c.elapsed):0;l.lit.setAlpha(l.level);l.ground.setAlpha(enabled&&c.settings.lights?l.level:0);}updates++;
 }
 paint();
 return {step(delta){weather.step(delta);if(!disposed&&weather.isAnimating())paint();},isAnimating:()=>weather.isAnimating(),setSettings(p){weather.setSettings(p);paint();},setPaused(v){weather.setPaused(v);},inspect(){const w=weather.inspect();return {...w,environment:{updates,groups:config.groups.map(g=>({id:g.id,anchor:g.anchor,crownOffset:vegetationOffset(g,g.anchor.x,g.rect[1]+g.rect[3]*.35,lastClock.elapsed,lastWind),baseOffset:vegetationOffset(g,g.anchor.x,g.anchor.y,lastClock.elapsed,lastWind)})),dynamicVertices:affected.length,maxVertexOffset:Math.max(0,...affected.map(v=>Math.abs(v.vertices[v.i]-v.base))),meshVertices:meshes.reduce((n,m)=>n+m.vertices.length/4,0),triangles:meshes.reduce((n,m)=>n+m.indices.length/4,0),interactiveObjects:objects.filter(o=>o.input?.enabled).length,lights:lights.map(l=>({id:l.id,sourceAlpha:l.lit.alpha,spillAlpha:l.ground.alpha,level:l.level})),runtimeTextureBytes:surfaces.reduce((n,c)=>n+c.width*c.height*4,0)}};},destroy(){if(disposed)return;disposed=true;objects.forEach(o=>o.destroy());keys.forEach(k=>scene.textures.remove(k));surfaces.forEach(c=>{c.width=c.height=1;});return {...weather.destroy(),environmentObjectsReleased:objects.length,environmentTexturesReleased:keys.every(k=>!scene.textures.exists(k))};}};
}
