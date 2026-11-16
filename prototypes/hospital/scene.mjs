// Coordenadas de un sector ilustrado, no casillas ni reglas de movimiento.
const assetsRoot=new URL('../../assets/prototipo-hospital/',import.meta.url);
export const scene={
 bounds:{x:260,y:-40,width:1040,height:840},
 ground:{url:new URL('suelo-nevado.png',assetsRoot),position:{x:0,y:0},anchor:{x:0,y:0},scale:1},
 hospital:{url:new URL('hospital.png',assetsRoot),position:{x:780,y:670},anchor:{x:630,y:1148},scale:.65,
  visibleBounds:{x:39,y:134,width:1182,height:1014}},
 // Pie más bajo del PNG: los márgenes originales se conservan, no se recorta la imagen.
 zombie:{url:new URL('zombi.png',assetsRoot),anchor:{x:716,y:1218},scale:.095},
 positions:{
  delante:{position:{x:710,y:670},layer:'front',description:'El personaje se ve completo delante del hospital.'},
  detras:{position:{x:790,y:420},layer:'back',description:'El hospital oculta al personaje. Activá Mostrar ocultos para localizarlo.'},
  esquina:{position:{x:411,y:520},layer:'back',description:'Parte del personaje sobresale por la esquina izquierda.'}
 }
};

export function spriteRect(asset,image){
 return {x:asset.position.x-asset.anchor.x*asset.scale,y:asset.position.y-asset.anchor.y*asset.scale,
  width:image.width*asset.scale,height:image.height*asset.scale};
}

// Orden explícito para estas tres demostraciones. No es un algoritmo general por Y.
export function drawOrder(pose){
 return ['ground','shadow',...(pose.layer==='front'?['hospital','zombie']:['zombie','hospital'])];
}
