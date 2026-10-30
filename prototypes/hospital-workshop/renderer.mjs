import Phaser from 'phaser';
import {HospitalGame} from '../hospital-phaser/game.mjs';
import {disposeGame} from '../hospital-phaser/dispose-game.mjs';
import {waitForStartup} from '../hospital-phaser/startup.mjs';
import {addIllustratedTexture} from '../hospital-phaser/texture-quality.mjs';
import {representation} from './kit.mjs';

function shadowTexture(){
 const c=document.createElement('canvas');c.width=128;c.height=64;const x=c.getContext('2d');x.translate(64,32);x.scale(64,32);
 const g=x.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(22,32,38,.3)');g.addColorStop(1,'rgba(22,32,38,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,1,0,Math.PI*2);x.fill();return c;
}
function marker(scene,asset){
 const g=scene.add.graphics(),w=asset.width,h=asset.height;
 if(asset.id==='door-guide'){g.lineStyle(2,0xe7bf76,1);g.strokeRect(-w/2,-h,w,h);g.lineBetween(-w/2+6,-h+6,w/2-6,-h+6);}
 else if(asset.id==='barricade-marker'){g.fillStyle(0x765c42,1);g.fillRect(-w/2,-h,w,h);g.lineStyle(2,0xf0d8a3,1);g.strokeRect(-w/2,-h,w,h);g.lineBetween(-w/2,-h,w/2,0);g.lineBetween(w/2,-h,-w/2,0);}
 else{g.fillStyle(asset.id==='human-guide'?0xdacdac:0x79d9dd,.9);g.fillCircle(0,-h+10,9);g.fillRoundedRect(-11,-h+23,22,h*.42,4);g.fillRect(-10,-h*.38,8,h*.38);g.fillRect(2,-h*.38,8,h*.38);}
 return g;
}
export async function createWorkshopRenderer(canvas,kit,prepared,{signal,deadline}={}){
 let game,world,model,disposed=false,renderEvents=0,resolveReady,rejectReady;
 const assets=Object.fromEntries(kit.assets.map(a=>[a.id,a])),objects=new Map();let diagnostics,slots;
 const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;});
 const wake=()=>{if(!disposed)game.loop.wake();};
 const nextFrame=()=>new Promise(resolve=>{game.events.once(Phaser.Core.Events.POST_RENDER,resolve);wake();});
 const release=()=>{
  if(disposed)return;disposed=true;
  const sources=Object.values(prepared).map(p=>world?.textures.get('h33-'+p.sourceId)?.source[0]),auxiliaries=sources.map(s=>s?.image).filter(c=>c instanceof HTMLCanvasElement),derived=Object.values(prepared).filter(p=>p.factor!==1).map(p=>p.image);
  const result=disposeGame(game,canvas);
  // Solo superficies generadas por esta instancia, después de retirar la GPU.
  // Libera su backing lógico sin esperar al GC; nunca toca las Image originales.
  for(const c of [...auxiliaries,...derived])try{c.width=c.height=1;}catch(error){result.cleanupErrors.push(error.message);}
  objects.clear();world=null;model=null;
  return {...result,sourcesReleased:sources.filter(Boolean).every(s=>s.image===null&&s.glTexture===null),auxiliaryCanvasesReleased:auxiliaries.filter(c=>c.width===1&&c.height===1).length,derivedCanvasesReleased:derived.filter(c=>c.width===1&&c.height===1).length};
 };
 const bootError=e=>{if(e.error&&(e.filename===import.meta.url||e.error.stack?.includes(import.meta.url)))rejectReady(e.error);};window.addEventListener('error',bootError);
 try{
  class WorkshopScene extends Phaser.Scene{
   create(){try{
    if(disposed||signal?.aborted)return;world=this;
    for(const [id,p]of Object.entries(prepared))addIllustratedTexture(this.textures,'h33-'+id,p.image);
    this.textures.addCanvas('h33-shadow',shadowTexture());slots=this.add.graphics().setDepth(1);diagnostics=this.add.graphics().setDepth(100);
    this.game.events.on(Phaser.Core.Events.POST_RENDER,()=>{renderEvents++;if(model)game.loop.sleep();});this.game.events.once(Phaser.Core.Events.POST_RENDER,resolveReady);
   }catch(error){rejectReady(error);}}
  }
  game=new HospitalGame({type:Phaser.WEBGL,canvas,width:1,height:1,backgroundColor:'#c5ced8',banner:false,autoFocus:false,render:{mipmapFilter:'LINEAR_MIPMAP_LINEAR'},callbacks:{preBoot:instance=>{game=instance;}},audio:{noAudio:true},input:{keyboard:false,mouse:false,touch:false,gamepad:false},scale:{mode:Phaser.Scale.NONE},scene:[WorkshopScene]});
  await waitForStartup(ready,{signal,deadline});signal?.throwIfAborted();window.removeEventListener('error',bootError);
  const gl=game.renderer.gl,ext=gl.getExtension('WEBGL_debug_renderer_info'),gpu={renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),version:gl.getParameter(gl.VERSION),maxTextureSize:gl.getParameter(gl.MAX_TEXTURE_SIZE)};
  function update(next){
   if(disposed)return;model=next;const {camera,viewport,nodes,state}=model,width=Math.round(viewport.width*viewport.dpr),height=Math.round(viewport.height*viewport.dpr);
   if(game.scale.width!==width||game.scale.height!==height)game.scale.resize(width,height);canvas.style.width=canvas.style.height='100%';
   world.cameras.main.setViewport(0,0,width,height).setOrigin(0,0).setZoom(camera.zoom*viewport.dpr).setScroll(-camera.x/camera.zoom,-camera.y/camera.zoom);
   const live=new Set(nodes.map(n=>n.id));for(const [id,entry]of objects)if(!live.has(id)){entry.object.destroy();entry.shadow?.destroy();objects.delete(id);}
   for(const node of nodes){
    const asset=assets[node.assetId];let entry=objects.get(node.id);
    if(entry&&entry.assetId!==asset.id){entry.object.destroy();entry.shadow?.destroy();objects.delete(node.id);entry=null;}
    if(!entry){
     const object=asset.kind==='image'?world.add.image(0,0,'h33-'+asset.id,'original'):marker(world,asset),shadow=['survivor','zombie','test-actor'].includes(node.role)?world.add.image(0,0,'h33-shadow'):null;
     entry={object,shadow,assetId:asset.id};objects.set(node.id,entry);
    }
    const {object,shadow}=entry;
    if(asset.kind==='image'){const p=prepared[asset.id],r=representation(asset,p.factor,node.multiplier,node.position);object.setOrigin(r.pivot.x/p.image.width,r.pivot.y/p.image.height).setScale(r.scale);}
    else object.setScale(asset.scale*node.multiplier);
    object.setPosition(node.position.x,node.position.y).setDepth(node.depth).setVisible(node.visible).setAlpha(node.id==='hospital'&&state.showHidden ? .28 : 1);
    if(shadow)shadow.setPosition(node.position.x-7*node.multiplier,node.position.y-node.multiplier).setDisplaySize(38*node.multiplier,10*node.multiplier).setDepth(node.depth-1).setVisible(node.visible&&state.layers.shadows);
   }
   slots.clear();if(state.layers.slots&&state.case!=='occlusion')for(const [color,positions]of [[0x227d8d,kit.survivorPositions],[0x9b6929,kit.accessPositions]]){slots.lineStyle(1.5/camera.zoom,color,1);for(const p of positions)slots.strokeEllipse(p.x,p.y,44,16);}
   diagnostics.clear();const line=1/camera.zoom;
   if(state.grid){diagnostics.lineStyle(line,0x314b61,.25);const b=kit.bounds;let count=0;for(let x=Math.floor(b.x/state.gridStep)*state.gridStep;x<=b.x+b.width&&count++<300;x+=state.gridStep)diagnostics.lineBetween(x,b.y,x,b.y+b.height);count=0;for(let y=Math.floor(b.y/state.gridStep)*state.gridStep;y<=b.y+b.height&&count++<300;y+=state.gridStep)diagnostics.lineBetween(b.x,y,b.x+b.width,y);}
   if(state.axes){const p=kit.buildingPosition;diagnostics.lineStyle(2*line,0x9c3c38,1);diagnostics.lineBetween(p.x,p.y,p.x+90,p.y);diagnostics.lineStyle(2*line,0x287a64,1);diagnostics.lineBetween(p.x,p.y,p.x,p.y-90);}
   for(const node of nodes.filter(n=>n.visible&&n.role!=='ground')){
    const a=assets[node.assetId],scale=a.scale*node.multiplier,r={x:node.position.x-a.pivot.x*scale,y:node.position.y-a.pivot.y*scale};
    if(state.pivots){diagnostics.lineStyle(1.5*line,0x982967,1);diagnostics.lineBetween(node.position.x-5*line,node.position.y,node.position.x+5*line,node.position.y);diagnostics.lineBetween(node.position.x,node.position.y-5*line,node.position.x,node.position.y+5*line);}
    if(state.bounds||state.selected===node.id){const b=a.visibleBounds;diagnostics.lineStyle((state.selected===node.id?2:1)*line,state.selected===node.id?0x9b6521:0x45618a,.9);diagnostics.strokeRect(r.x+b.x*scale,r.y+b.y*scale,b.width*scale,b.height*scale);}
   }
   wake();
  }
  return {update,nextFrame,destroy:release,worldAt(point){const p=world.cameras.main.getWorldPoint(point.x*model.viewport.dpr,point.y*model.viewport.dpr);return {x:p.x,y:p.y};},inspect(){return {gpu,renderEvents,objectCount:world.children.list.length,inputPlugins:{mouse:game.config.inputMouse,touch:game.config.inputTouch,keyboard:game.config.inputKeyboard},nodes:[...objects].map(([id,e])=>({id,x:e.object.x,y:e.object.y,originX:e.object.originX,originY:e.object.originY,scaleX:e.object.scaleX,scaleY:e.object.scaleY,depth:e.object.depth,visible:e.object.visible,displayOriginX:e.object.displayOriginX,displayOriginY:e.object.displayOriginY})),textures:Object.fromEntries(Object.entries(prepared).map(([id,p])=>{const s=world.textures.get('h33-'+id).source[0];return [id,{...p.estimate,factor:p.factor,minFilter:s.glTexture.minFilter,sourceWidth:s.width,sourceHeight:s.height}];}))};},
   async diagnosticFrame(kind){if(!['normal','no-actor','actor-front'].includes(kind))throw Error('Composición inválida');const e=objects.get('test-actor'),node=model.nodes.find(n=>n.id==='test-actor');if(e){e.object.setVisible(kind!=='no-actor'&&node.visible);e.object.setDepth(kind==='actor-front'?9:node.depth);}await nextFrame();},
   async pixels(){return new Promise(resolve=>{game.events.once(Phaser.Core.Events.POST_RENDER,()=>{const width=canvas.width,height=canvas.height,raw=new Uint8Array(width*height*4);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,raw);const data=new Uint8Array(raw.length);for(let y=0;y<height;y++)data.set(raw.subarray((height-y-1)*width*4,(height-y)*width*4),y*width*4);resolve({width,height,data});});wake();});}
  };
 }catch(error){window.removeEventListener('error',bootError);const cleanup=release();if(cleanup?.cleanupErrors.length)error.cleanupErrors=cleanup.cleanupErrors;throw error;}
}
