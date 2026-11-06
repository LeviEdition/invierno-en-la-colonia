import {localityFrame} from './presentation.mjs';
// Cámara de presentación, sin distancias ni legalidad del motor.
export function constrainCamera(camera,b,viewport){
 const minZoom=Math.max(viewport.width/b.width,viewport.height/b.height),maxZoom=Math.max(minZoom,1.5),zoom=Math.max(minZoom,Math.min(maxZoom,camera.zoom));
 return {...camera,minZoom,maxZoom,zoom,x:Math.max(viewport.width-b.width*zoom,Math.min(0,camera.x)),y:Math.max(viewport.height-b.height*zoom,Math.min(0,camera.y))};
}
export function fitMapCamera(b,v){const zoom=Math.max(v.width/b.width,v.height/b.height);return constrainCamera({zoom,x:(v.width-b.width*zoom)/2,y:(v.height-b.height*zoom)/2},b,v);}
// Conservar el ancla deseada incluso cuando el borde del mapa obliga a limitar
// un resize. Así abrir/cerrar el panel es reversible y no acumula desplazamiento.
export function resizeMapCamera(camera,anchor,b,v,preferredZoom=camera.zoom){const base=fitMapCamera(b,v),zoom=Math.max(base.minZoom,Math.min(base.maxZoom,preferredZoom));return constrainCamera({...base,zoom,x:v.width/2-anchor.x*zoom,y:v.height/2-anchor.y*zoom},b,v);}
export function focusAnchor(scene,id){const z=scene.zones.find(z=>z.id===id);if(!z)return null;const b=scene.fitPresentation?localityFrame(z):null;return b?{x:b.x+b.width/2,y:b.y+b.height/2}:z.center;}
export function focusLocality(scene,id,v){const z=scene.zones.find(z=>z.id===id);if(!z)return fitMapCamera(scene.bounds,v);const frame=scene.fitPresentation?localityFrame(z):z.focus,anchor=focusAnchor(scene,id),base=fitMapCamera(scene.bounds,v),zoom=Math.min(base.maxZoom,Math.max(base.minZoom,Math.min(v.width/frame.width,v.height/frame.height)));return constrainCamera({zoom,x:v.width/2-anchor.x*zoom,y:v.height/2-anchor.y*zoom},scene.bounds,v);}
