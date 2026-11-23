// Noche y luces sobre el fondo (informe 121). Una capa multiplicativa azulada entre el fondo y
// las fichas (no una segunda textura del mapa) y un resplandor aditivo teñido de Lámpara por
// luz, todos con una sola textura de 64×64 generada por código. Contornos, zombis, barricadas
// y todo lo que es DOM (fichas, rótulos, marcas, paneles, D12) queda encima y no se tiñe.
import Phaser from 'phaser';
import {createFlicker,lightLevel} from '../../experiencia/night-lights.mjs';
export const NIGHT_LOOK=Object.freeze({glow:0xf2c14e,shade:0x41557a,shadeAlpha:.65,
 // Tope del resplandor: sumado a la ventana remapeada (60 % de la Lámpara) su centro queda
 // por debajo de la Lámpara plena del contorno de selección.
 glowAlpha:.32,glowSize:2.4});
const TEXTURE='night-glow';
// Ritmo del bucle cuando solo parpadean las luces (la nieve, si está activa, pide el suyo).
export const FLICKER_FPS=24;
export function createNightView(scene,{lights,bounds,getNight,active,reduced,look=NIGHT_LOOK}){
 if(!scene.textures.exists(TEXTURE)){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);scene.textures.addCanvas(TEXTURE,c);}
 const shade=scene.add.rectangle(0,0,bounds.width,bounds.height,look.shade).setOrigin(0,0).setDepth(.2).setBlendMode(Phaser.BlendModes.MULTIPLY).setAlpha(0);
 const glows=lights.map(l=>scene.add.image(l.x,l.y,TEXTURE).setDepth(.4).setBlendMode(Phaser.BlendModes.ADD).setTint(look.glow).setScale(l.radius*look.glowSize/32));
 const flicker=createFlicker(lights.length);let paused=false,clock=performance.now(),night=0,frames=0,total=0,worst=0;
 function paint(){
  const t0=performance.now(),still=reduced(),values=flicker.values();
  shade.setAlpha(look.shadeAlpha*night);
  glows.forEach((g,i)=>g.setAlpha(look.glowAlpha*lights[i].base*lightLevel({night,flicker:values[i],reduced:still})));
  return performance.now()-t0;
 }
 function step(delta){
  if(paused)return;clock+=delta;const t0=performance.now();
  night=getNight(performance.now());if(!reduced())flicker.step(delta);paint();
  const cost=performance.now()-t0;frames++;total+=cost;worst=Math.max(worst,cost);
 }
 night=getNight(performance.now());paint();
 return {
  step,
  // Parpadeo siempre (día y noche); con movimiento reducido las luces quedan fijas y el bucle
  // vuelve a dormir salvo mientras dura una noche.
  isAnimating:()=>!paused&&(!reduced()||active(performance.now())||night>0),
  frameRate:FLICKER_FPS,
  setPaused(value){paused=!!value;},
  refresh(){night=getNight(performance.now());paint();},
  inspect:()=>({lights:glows.length,night,shadeAlpha:shade.alpha,glowAlpha:glows.map(g=>+g.alpha.toFixed(3)),cost:{frames,averageMs:frames?total/frames:0,worstMs:worst}}),
  destroy(){shade.destroy();for(const g of glows)g.destroy();if(scene.textures.exists(TEXTURE))scene.textures.remove(TEXTURE);return {nightObjectsReleased:glows.length+1};}
 };
}
