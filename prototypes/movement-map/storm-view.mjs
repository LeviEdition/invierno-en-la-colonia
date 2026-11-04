import {createAtmosphereModel} from './storm-model.mjs';

// Texturas procedurales pequeñas. La nieve necesita un núcleo más firme que
// el humo: el mismo degradado suave hacía desaparecer copos al alejarse.
export function createAtmosphereView(scene,config,{settings,seed=crypto.getRandomValues(new Uint32Array(1))[0]}={}){
 const model=createAtmosphereModel(config,{settings,seed}),softKey='h33-atmosphere-soft',snowKey='h33-atmosphere-snow',windKey='h33-atmosphere-wind';
 function texture(key,size,firm){
  const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d'),r=size/2,g=x.createRadialGradient(r,r,0,r,r,r);
  g.addColorStop(0,firm?'rgba(255,255,255,1)':'rgba(255,255,255,.85)');g.addColorStop(firm ? .6 : .35,firm?'rgba(255,255,255,.95)':'rgba(255,255,255,.48)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,size,size);scene.textures.addCanvas(key,c);return c;
 }
 const windCanvas=document.createElement('canvas');windCanvas.width=128;windCanvas.height=32;
 const wx=windCanvas.getContext('2d'),edge=wx.createLinearGradient(0,0,128,0),fade=wx.createLinearGradient(0,0,128,0);edge.addColorStop(0,'rgba(25,32,40,0)');edge.addColorStop(.25,'rgba(25,32,40,.2)');edge.addColorStop(.75,'rgba(25,32,40,.2)');edge.addColorStop(1,'rgba(25,32,40,0)');fade.addColorStop(0,'rgba(255,255,255,0)');fade.addColorStop(.25,'rgba(255,255,255,.9)');fade.addColorStop(.75,'rgba(255,255,255,.8)');fade.addColorStop(1,'rgba(255,255,255,0)');
 // Trazos curvos con extremos difuminados: la elipse anterior se perdía en nieve.
 wx.lineCap='round';for(const [y,curve] of [[8,4],[16,-5],[24,3]]){wx.beginPath();wx.moveTo(0,y);wx.bezierCurveTo(38,y+curve,88,y-curve,128,y);wx.strokeStyle=edge;wx.lineWidth=5;wx.stroke();wx.strokeStyle=fade;wx.lineWidth=2;wx.stroke();}
 scene.textures.addCanvas(windKey,windCanvas);
 const canvases=[texture(softKey,64,false),texture(snowKey,16,true),windCanvas];
 const images=model.particles.map(p=>scene.add.image(p.x,p.y,p.type==='snow'?snowKey:p.type==='wind'?windKey:softKey).setDepth((p.foreground?6.8:config.depths[p.type])).setTint(parseInt(config.colors[p.type].slice(1),16)));
 const shade=scene.add.graphics().setDepth(config.depths.lights-.2);
 const lightTint=parseInt(config.colors.lights.slice(1),16),glow=scene.add.graphics().setDepth(config.depths.lights).setBlendMode(1),points=model.lights.map(l=>l.polygon.map(([x,y])=>({x,y})));
 // ADD=1, API pública Phaser4.2.1. Solo cuatro halos locales, no postproceso global.
 const halos=model.lights.map(l=>{const xs=l.polygon.map(p=>p[0]),ys=l.polygon.map(p=>p[1]),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);return scene.add.image((left+right)/2,(top+bottom)/2,softKey).setDepth(config.depths.lights-.1).setDisplaySize((right-left)*config.lightsHaloScale,(bottom-top)*config.lightsHaloScale).setTint(lightTint).setBlendMode(1);});
 let disposed=false;
 function paint(){
  for(let i=0;i<images.length;i++){const p=model.particles[i];images[i].setVisible(p.alpha>0).setPosition(p.x,p.y).setDisplaySize(p.width,p.height).setAlpha(p.alpha);}
  shade.clear();glow.clear();for(let i=0;i<model.lights.length;i++){const l=model.lights[i];halos[i].setVisible(l.alpha>0).setAlpha(l.alpha*config.lightsHaloAlpha);if(l.shadeAlpha>0)shade.fillStyle(0x16120d,l.shadeAlpha).fillPoints(points[i],true);if(l.alpha>0)glow.fillStyle(lightTint,l.alpha).fillPoints(points[i],true);}
 }
 paint();
 return {
  step(delta){if(!disposed&&model.step(delta/1000))paint();},
  isAnimating(){return !disposed&&model.isAnimating();},
  setSettings(patch){if(!disposed){model.setSettings(patch);paint();}},
  setPaused(value){model.setPaused(value);},
  inspect(){return {...model.snapshot(),objects:images.length+halos.length+2,textureBytes:(64*64+16*16+128*32)*4,interactiveObjects:[...images,...halos].filter(i=>i.input?.enabled).length,disposed};},
  destroy(){if(disposed)return;disposed=true;for(const image of [...images,...halos])image.destroy();glow.destroy();shade.destroy();for(const key of [softKey,snowKey,windKey])scene.textures.remove(key);for(const c of canvases)c.width=c.height=1;return {objectsReleased:images.length+halos.length+2,textureReleased:[softKey,snowKey,windKey].every(key=>!scene.textures.exists(key))};}
 };
}
