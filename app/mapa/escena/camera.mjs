import {localityFrame} from './presentation.mjs';
// Cámara de presentación, sin distancias ni legalidad del motor.
export function constrainCamera(camera,b,viewport){
 // Tope configurable (scene.json maxZoom, relativo al mundo lógico). Sin él, el de
 // antes: dimensiones originales / tamaño del fondo en el mundo, un píxel de la
 // ilustración por píxel CSS como máximo, con independencia del DPR.
 const maxZoom=b.maxZoom??Math.min((b.sourceWidth??b.width)/b.width,(b.sourceHeight??b.height)/b.height),minZoom=Math.min(maxZoom,viewport.width/b.width,viewport.height/b.height,camera.retainedMin??Infinity),zoom=Math.max(minZoom,Math.min(maxZoom,camera.zoom));
 // Cuando el mapa cabe en un eje, centrarlo con margen de interfaz. Al
 // acercarse se conserva el pan hasta el borde real, sin estirar el fondo.
 const axis=(position,size,available)=>size<=available?(available-size)/2:Math.max(available-size,Math.min(0,position));
 return {...camera,minZoom,maxZoom,zoom,x:axis(camera.x,b.width*zoom,viewport.width),y:axis(camera.y,b.height*zoom,viewport.height)};
}
export function fitMapCamera(b,v){const zoom=Math.min(v.width/b.width,v.height/b.height);return constrainCamera({overview:true,zoom,x:0,y:0},b,v);}
// Un cambio de espacio disponible conserva la escala y el pan elegidos.
// Solo los bordes (o centrar un eje donde cabe la imagen) mueven la cámara.
export function resizeMapCamera(camera,anchor,b,v){return constrainCamera({...camera,retainedMin:Math.min(camera.minZoom,camera.zoom)},b,v);}
export function focusAnchor(scene,id){const z=scene.zones.find(z=>z.id===id);if(!z)return null;const b=scene.fitPresentation?localityFrame(z):null;return b?{x:b.x+b.width/2,y:b.y+b.height/2}:z.center;}
// El enfoque de una localidad tiene su propio tope (scene.json focusMaxZoom): con el mapa 2×
// el zoom manual y el enfoque llegan a 1,5; el encuadre de cada localidad también limita.
// v.inset (opcional, interfaz v2): franjas tapadas por paneles flotantes. La localidad se
// encuadra en el área libre; los bordes del mapa siguen mandando.
export function focusLocality(scene,id,v){const z=scene.zones.find(z=>z.id===id);if(!z)return fitMapCamera(scene.bounds,v);const i=v.inset||{},left=i.left||0,top=i.top||0,width=v.width-left-(i.right||0),height=v.height-top-(i.bottom||0),frame=scene.fitPresentation?localityFrame(z):z.focus,anchor=focusAnchor(scene,id),base=fitMapCamera(scene.bounds,v),zoom=Math.min(base.maxZoom,scene.focusMaxZoom??Infinity,Math.max(base.minZoom,Math.min(width/frame.width,height/frame.height)));return constrainCamera({overview:false,zoom,x:left+width/2-anchor.x*zoom,y:top+height/2-anchor.y*zoom},scene.bounds,v);}
