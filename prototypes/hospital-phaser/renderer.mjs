import Phaser from 'phaser';
import {HospitalGame} from './game.mjs';
import {waitForStartup} from './startup.mjs';
import {disposeGame} from './dispose-game.mjs';
import {scene as config,drawOrder,spriteRect} from '../hospital/scene.mjs';

export function webglAvailable(){
 const probe=document.createElement('canvas');const gl=probe.getContext('webgl2')||probe.getContext('webgl');
 if(!gl)return false;
 gl.getExtension('WEBGL_lose_context')?.loseContext();return true;
}
function shadowTexture(){
 const c=document.createElement('canvas');c.width=128;c.height=64;const x=c.getContext('2d');
 x.translate(64,32);x.scale(64,32);const gradient=x.createRadialGradient(0,0,0,0,0,1);
 gradient.addColorStop(0,'rgba(22,32,38,.3)');gradient.addColorStop(1,'rgba(22,32,38,0)');
 x.fillStyle=gradient;x.beginPath();x.arc(0,0,1,0,Math.PI*2);x.fill();return c;
}
export async function createRenderer(canvas,images,{signal,deadline}={}){
 let world,objects,game,model,preRenderAt=0,renderEvents=0,renderMs=0,disposed=false;
 const frameMode=new URLSearchParams(location.search).get('loop')==='continuous'?'continuous':'demand';
 const wake=()=>{if(!disposed)game.loop.wake();};
 const nextFrame=()=>new Promise(resolve=>{game.events.once(Phaser.Core.Events.POST_RENDER,resolve);wake();});
 let resolveReady,rejectReady;
 const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;});
 // Frontera temporal para errores asíncronos del propio bundle durante boot.
 // No intercepta recursos sin error JS, otras páginas/scripts ni errores runtime.
 const bootError=event=>{if(event.error&&(event.filename===import.meta.url||event.error.stack?.includes(import.meta.url)))rejectReady(event.error);};
 window.addEventListener('error',bootError);
 const release=()=>{if(disposed)return;disposed=true;const result=disposeGame(game,canvas);objects=null;world=null;model=null;return result;};
 try{
  class HospitalScene extends Phaser.Scene{
   create(){
    try{
    if(disposed||signal?.aborted)return;
    world=this;
    for(const key of ['ground','hospital','zombie'])this.textures.addImage('h32-'+key,images[key]);
    this.textures.addCanvas('h32-shadow',shadowTexture());
    const sprite=(key,asset)=>this.add.image(asset.position?.x||0,asset.position?.y||0,'h32-'+key).setOrigin(asset.anchor.x/images[key].width,asset.anchor.y/images[key].height).setScale(asset.scale);
    objects={ground:sprite('ground',config.ground),hospital:sprite('hospital',config.hospital),zombie:sprite('zombie',config.zombie),shadow:this.add.image(0,0,'h32-shadow').setDisplaySize(38,10),selection:this.add.graphics().setDepth(10)};
    this.game.events.on(Phaser.Core.Events.PRE_RENDER,()=>{preRenderAt=performance.now();});
    this.game.events.on(Phaser.Core.Events.POST_RENDER,()=>{renderEvents++;renderMs+=performance.now()-preRenderAt;if(model&&frameMode==='demand')game.loop.sleep();});
    this.game.events.once(Phaser.Core.Events.POST_RENDER,resolveReady);
    }catch(error){rejectReady(error);}
   }
  }
  game=new HospitalGame({type:Phaser.WEBGL,canvas,width:1,height:1,backgroundColor:'#c5ced8',banner:false,autoFocus:false,
   callbacks:{preBoot:instance=>{game=instance;}},audio:{noAudio:true},input:{keyboard:false,mouse:false,touch:false,gamepad:false},scale:{mode:Phaser.Scale.NONE},fps:{target:60},scene:[HospitalScene]});
 await waitForStartup(ready,{signal,deadline});
 window.removeEventListener('error',bootError);
 signal?.throwIfAborted();
 const gl=game.renderer.gl,ext=gl.getExtension('WEBGL_debug_renderer_info');
 const gpu={vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),version:gl.getParameter(gl.VERSION),maxTextureSize:gl.getParameter(gl.MAX_TEXTURE_SIZE)};
 function update(next){
  if(disposed)return;model=next;const {camera,viewport,pose,showHidden,selected}=model;
  const width=Math.round(viewport.width*viewport.dpr),height=Math.round(viewport.height*viewport.dpr);
  if(game.scale.width!==width||game.scale.height!==height)game.scale.resize(width,height);
  canvas.style.width='100%';canvas.style.height='100%';
  world.cameras.main.setViewport(0,0,width,height).setOrigin(0,0).setZoom(camera.zoom*viewport.dpr).setScroll(-camera.x/camera.zoom,-camera.y/camera.zoom);
  objects.zombie.setPosition(pose.position.x,pose.position.y);objects.shadow.setPosition(pose.position.x-7,pose.position.y-1);
  drawOrder(pose).forEach((key,index)=>objects[key].setDepth(index));objects.hospital.setAlpha(showHidden ? .28 : 1);
  const graphics=objects.selection;graphics.clear();
  if(selected){
   const {position,anchor,scale,visibleBounds:b}=config.hospital,x=position.x+(b.x-anchor.x)*scale,y=position.y+(b.y-anchor.y)*scale,w=b.width*scale,h=b.height*scale,arm=10/camera.zoom;
   graphics.lineStyle(1.5/camera.zoom,0xa77a28,1);
   for(const [px,py,dx,dy]of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){
    graphics.beginPath();graphics.moveTo(px+dx*arm,py);graphics.lineTo(px,py);graphics.lineTo(px,py+dy*arm);graphics.strokePath();
   }
  }
  wake();
 }
 return {
  update,
  nextFrame,
  async diagnosticFrame(kind){
   if(!['normal','no-actor','actor-front'].includes(kind))throw Error('Composición diagnóstica inválida');
   objects.zombie.setVisible(kind!=='no-actor');
   drawOrder(model.pose).forEach((key,index)=>objects[key].setDepth(index));
   if(kind==='actor-front')objects.zombie.setDepth(6);
   await nextFrame();
  },
  async diagnosticPixels(){
   return new Promise(resolve=>{game.events.once(Phaser.Core.Events.POST_RENDER,()=>{const width=canvas.width,height=canvas.height,raw=new Uint8Array(width*height*4);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,raw);const data=new Uint8Array(raw.length);for(let y=0;y<height;y++)data.set(raw.subarray((height-1-y)*width*4,(height-y)*width*4),y*width*4);resolve({width,height,data});});wake();});
  },
  worldAt(point){const p=world.cameras.main.getWorldPoint(point.x*model.viewport.dpr,point.y*model.viewport.dpr);return {x:p.x,y:p.y};},
  inspect(){return {phaser:Phaser.VERSION,backend:'WebGL',frameMode,loopRunning:!disposed&&game.loop.running,hasFocus:game.hasFocus,clockInFocus:game.loop.inFocus,clockPauseTime:game.loop._pauseTime,clockPauseDuration:game.loop.pauseDuration,gpu,renderEvents,renderMs,textureKeys:disposed?[]:game.textures.getTextureKeys(),objectCount:disposed?0:world.children.list.length,inputPlugins:{mouse:game.config.inputMouse,touch:game.config.inputTouch,keyboard:game.config.inputKeyboard},actorBounds:disposed?null:spriteRect({...config.zombie,position:model.pose.position},images.zombie),transforms:disposed?{}:Object.fromEntries(['ground','hospital','zombie','shadow'].map(key=>{const o=objects[key],source=o.texture.source[0];return [key,{x:o.x,y:o.y,scaleX:o.scaleX,scaleY:o.scaleY,originX:o.originX,originY:o.originY,depth:o.depth,filter:source.glTexture?.minFilter,textureWidth:source.width,textureHeight:source.height}];}))};},
  destroy:release
 };
 }catch(error){window.removeEventListener('error',bootError);const cleanup=release();if(cleanup?.cleanupErrors.length)error.cleanupErrors=cleanup.cleanupErrors;throw error;}
}
