import {createAtmosphereModel} from './atmosphere-model.mjs';

// Una textura generada y un pool fijo; todo usa la cámara del mundo existente.
export function createAtmosphereView(scene,config,{settings,seed=crypto.getRandomValues(new Uint32Array(1))[0]}={}){
 const model=createAtmosphereModel(config,{settings,seed}),textureKey='h33-atmosphere-soft';
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
 const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);
 gradient.addColorStop(0,'rgba(255,255,255,.85)');gradient.addColorStop(.35,'rgba(255,255,255,.48)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 scene.textures.addCanvas(textureKey,canvas);
 const images=model.particles.map(p=>scene.add.image(p.x,p.y,textureKey).setDepth(config.depths[p.type]).setTint(parseInt(config.colors[p.type].slice(1),16)));
 const glow=scene.add.graphics().setDepth(config.depths.lights),points=model.lights.map(l=>l.polygon.map(([x,y])=>({x,y})));
 let disposed=false;
 function paint(){
  for(let i=0;i<images.length;i++){const p=model.particles[i];images[i].setVisible(p.alpha>0).setPosition(p.x,p.y).setDisplaySize(p.width,p.height).setAlpha(p.alpha);}
  glow.clear();for(let i=0;i<model.lights.length;i++){const l=model.lights[i];if(l.alpha>0)glow.fillStyle(parseInt(config.colors.lights.slice(1),16),l.alpha).fillPoints(points[i],true);}
 }
 paint();
 return {
  step(delta){if(!disposed&&model.step(delta/1000))paint();},
  isAnimating(){return !disposed&&model.isAnimating();},
  setSettings(patch){if(!disposed){model.setSettings(patch);paint();}},
  setPaused(value){model.setPaused(value);},
  inspect(){return {...model.snapshot(),objects:images.length+1,textureBytes:64*64*4,interactiveObjects:images.filter(i=>i.input?.enabled).length,disposed};},
  destroy(){if(disposed)return;disposed=true;for(const image of images)image.destroy();glow.destroy();scene.textures.remove(textureKey);canvas.width=canvas.height=1;return {objectsReleased:images.length+1,textureReleased:!scene.textures.exists(textureKey)};}
 };
}
