import {fitCamera} from '../../hospital/camera.mjs';
export function constrainCamera(camera,bounds,viewport){
 const zoom=Math.max(camera.minZoom,Math.min(camera.maxZoom,camera.zoom));
 const axis=(offset,size,origin,world)=>world*zoom<=size?(size-world*zoom)/2-origin*zoom:Math.max(size-(origin+world)*zoom,Math.min(-origin*zoom,offset));
 return {...camera,zoom,x:axis(camera.x,viewport.width,bounds.x,bounds.width),y:axis(camera.y,viewport.height,bounds.y,bounds.height)};
}
export function fitMapCamera(bounds,viewport){const fit=fitCamera(bounds,viewport.width,viewport.height,12);return constrainCamera({...fit,minZoom:fit.zoom,maxZoom:fit.zoom*5},bounds,viewport);}
export function focusLocality(scene,id,viewport){
 const base=fitMapCamera(scene.bounds,viewport),zone=scene.zones.find(z=>z.id===id);if(!zone)return base;
 const fitted=fitCamera(zone.focus,viewport.width,viewport.height,16);
 return constrainCamera({...fitted,minZoom:base.minZoom,maxZoom:base.maxZoom},scene.bounds,viewport);
}
