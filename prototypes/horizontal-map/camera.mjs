// Cámara de presentación, sin distancias ni legalidad del motor.
export function constrainCamera(camera,b,viewport){
 const minZoom=Math.max(viewport.width/b.width,viewport.height/b.height),maxZoom=Math.max(minZoom,1.5),zoom=Math.max(minZoom,Math.min(maxZoom,camera.zoom));
 return {...camera,minZoom,maxZoom,zoom,x:Math.max(viewport.width-b.width*zoom,Math.min(0,camera.x)),y:Math.max(viewport.height-b.height*zoom,Math.min(0,camera.y))};
}
export function fitMapCamera(b,v){const zoom=Math.max(v.width/b.width,v.height/b.height);return constrainCamera({zoom,x:(v.width-b.width*zoom)/2,y:(v.height-b.height*zoom)/2},b,v);}
export function focusLocality(scene,id,v){const z=scene.zones.find(z=>z.id===id);if(!z)return fitMapCamera(scene.bounds,v);const base=fitMapCamera(scene.bounds,v),zoom=Math.min(base.maxZoom,Math.max(base.minZoom,Math.min(v.width/z.focus.width,v.height/z.focus.height)));return constrainCamera({zoom,x:v.width/2-z.center.x*zoom,y:v.height/2-z.center.y*zoom},scene.bounds,v);}
