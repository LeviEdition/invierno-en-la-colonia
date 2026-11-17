// Transformación única para suelo, edificio, personaje y sombras. Sin DOM ni reglas.
export function createCamera({x=0,y=0,zoom=1,minZoom=.1,maxZoom=4}={}){
 return {x,y,zoom:Math.max(minZoom,Math.min(maxZoom,zoom)),minZoom,maxZoom};
}

export function worldToScreen(camera,{x,y}){
 return {x:camera.x+x*camera.zoom,y:camera.y+y*camera.zoom};
}

export function screenToWorld(camera,{x,y}){
 return {x:(x-camera.x)/camera.zoom,y:(y-camera.y)/camera.zoom};
}

export function panCamera(camera,dx,dy){
 return {...camera,x:camera.x+dx,y:camera.y+dy};
}

export function zoomCameraAt(camera,factor,anchor){
 const world=screenToWorld(camera,anchor);
 const zoom=Math.max(camera.minZoom,Math.min(camera.maxZoom,camera.zoom*factor));
 return {...camera,zoom,x:anchor.x-world.x*zoom,y:anchor.y-world.y*zoom};
}

export function pinchCamera(camera,previousCenter,nextCenter,factor){
 const zoomed=zoomCameraAt(camera,factor,previousCenter);
 return panCamera(zoomed,nextCenter.x-previousCenter.x,nextCenter.y-previousCenter.y);
}

export function fitCamera(bounds,width,height,padding=24){
 const margin=Math.max(0,Math.min(padding,(width-1)/2,(height-1)/2));
 const zoom=Math.min(Math.max(1,width-2*margin)/bounds.width,Math.max(1,height-2*margin)/bounds.height);
 return createCamera({
  x:width/2-(bounds.x+bounds.width/2)*zoom,
  y:height/2-(bounds.y+bounds.height/2)*zoom,
  zoom,minZoom:zoom/2,maxZoom:zoom*4
 });
}
