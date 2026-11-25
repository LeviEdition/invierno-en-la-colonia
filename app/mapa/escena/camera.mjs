import {localityFrame} from './presentation.mjs';
// Cámara de presentación, sin distancias ni legalidad del motor.
// Tope por resolución del fondo (informe 123): un píxel de la ilustración por píxel CSS en DPR 1
// como máximo. Con la textura 2× (3342 px para un mundo de 1671) da 2.
export function resolutionMaxZoom(b){return Math.min((b.sourceWidth??b.width)/b.width,(b.sourceHeight??b.height)/b.height);}
// Zoom mínimo que CUBRE el área visible: el mapa nunca deja franjas vacías alrededor.
export function coverZoom(b,v){return Math.max(v.width/b.width,v.height/b.height);}
export function constrainCamera(camera,b,viewport){
 // Tope configurable (scene.json maxZoom, relativo al mundo lógico). Sin él, el de
 // antes: dimensiones originales / tamaño del fondo en el mundo, un píxel de la
 // ilustración por píxel CSS como máximo, con independencia del DPR.
 // camera.ceiling: el enfoque de una localidad puede pasar el tope manual hasta el de la
 // resolución; se conserva mientras la cámara siga por encima del tope manual.
 const manual=b.maxZoom??resolutionMaxZoom(b),ceiling=camera.ceiling>manual?Math.min(camera.ceiling,resolutionMaxZoom(b)):null,maxZoom=ceiling&&camera.zoom>manual+1e-9?ceiling:manual,minZoom=Math.min(maxZoom,coverZoom(b,viewport)),zoom=Math.max(minZoom,Math.min(maxZoom,camera.zoom));
 // Cuando el mapa cabe en un eje, centrarlo con margen de interfaz. Al
 // acercarse se conserva el pan hasta el borde real, sin estirar el fondo.
 // viewport.slack (opcional): margen extra de desplazamiento cuando un panel flotante tapa
 // un borde (la ficha abierta): permite llevar ese borde del mapa a la zona libre.
 const s=viewport.slack||{},axis=(position,size,available,before=0,after=0)=>size<=available?(available-size)/2:Math.max(available-size-after,Math.min(before,position));
 const {ceiling:_,...rest}=camera;
 return {...rest,...(maxZoom>manual?{ceiling:maxZoom}:{}),minZoom,maxZoom,zoom,x:axis(camera.x,b.width*zoom,viewport.width,s.left||0,s.right||0),y:axis(camera.y,b.height*zoom,viewport.height,s.top||0,s.bottom||0)};
}
// Vista general: cubre el área y recorta centrado.
export function fitMapCamera(b,v){const zoom=coverZoom(b,v);return constrainCamera({overview:true,zoom,x:(v.width-b.width*zoom)/2,y:(v.height-b.height*zoom)/2},b,v);}
// Un cambio de espacio disponible conserva la escala y el pan elegidos, sin bajar del zoom que
// cubre el área (informe 123: nunca franjas vacías al redimensionar).
// Solo los bordes (o centrar un eje donde cabe la imagen) mueven la cámara.
export function resizeMapCamera(camera,anchor,b,v){return constrainCamera({...camera,retainedMin:Math.min(camera.minZoom,camera.zoom)},b,v);}
export function focusAnchor(scene,id){const z=scene.zones.find(z=>z.id===id);if(!z)return null;const b=scene.fitPresentation?localityFrame(z):null;return b?{x:b.x+b.width/2,y:b.y+b.height/2}:z.center;}
// El enfoque de una localidad tiene su propio tope (scene.json focusMaxZoom): con el mapa 2×
// el zoom manual y el enfoque llegan a 1,5; el encuadre de cada localidad también limita.
// v.inset (opcional, interfaz v2): franjas tapadas por paneles flotantes. La localidad se
// encuadra en el área libre; los bordes del mapa siguen mandando.
// Informe 123: la localidad (su contorno) ocupa cerca del 70 % del área libre, nunca con menos
// zoom que el enfoque anterior; el encuadre completo (accesos y fichas) siempre cabe y el tope es
// el de la resolución del fondo (resolutionMaxZoom, 2) en vez de focusMaxZoom (1,5).
export const FOCUS=Object.freeze({share:.7});
export function outlineBox(z){const p=z.outlinePolygon||z.selectionPolygon;if(!p?.length)return z.focus;const xs=p.map(q=>q[0]),ys=p.map(q=>q[1]);return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};}
export function focusLocality(scene,id,v){const z=scene.zones.find(z=>z.id===id);if(!z)return fitMapCamera(scene.bounds,v);const i=v.inset||{},left=i.left||0,top=i.top||0,width=v.width-left-(i.right||0),height=v.height-top-(i.bottom||0),box=outlineBox(z),anchor=focusAnchor(scene,id),base=fitMapCamera(scene.bounds,v),ceiling=resolutionMaxZoom(scene.bounds),frame=scene.fitPresentation?localityFrame(z):z.focus,whole=Math.min(width/frame.width,height/frame.height),share=FOCUS.share*Math.min(width/box.width,height/box.height),before=Math.min(whole,scene.focusMaxZoom??Infinity),zoom=Math.min(ceiling,whole,Math.max(base.minZoom,share,before));return constrainCamera({overview:false,ceiling,zoom,x:left+width/2-anchor.x*zoom,y:top+height/2-anchor.y*zoom},scene.bounds,v);}
