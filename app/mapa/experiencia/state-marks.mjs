// Marcas permanentes del mapa (interfaz v2, docs/109 §6 y §8). Solo leen campos públicos
// de la proyección; no deducen reglas. En el pase la proyección llega vacía: no hay marcas.
const count=value=>Number.isInteger(value)&&value>0?value:0;
// U+FE0E: presentación de texto, para que el teléfono no los cambie por emoji de color.
export const DAMAGE_SYMBOLS=Object.freeze({wound:'♥︎',frost:'❄︎'});
const DAMAGE_NAMES={wound:['herida','heridas'],frost:['congelación','congelaciones']};

// Herida (Sangre fría) y congelación (Escarcha): cada símbolo solo si su número es mayor que 0.
export function damageMarks(character){
 return [['wound',count(character?.wounds)],['frost',count(character?.frost)]].filter(([,n])=>n>0).map(([kind,n])=>({kind,symbol:DAMAGE_SYMBOLS[kind],count:n,label:n+' '+DAMAGE_NAMES[kind][n===1?0:1]}));
}
export function damageKey(marks){return marks.map(m=>m.kind+m.count).join(' ');}

// Un marcador por ficha de ruido. El tope viene del motor (locations[].noiseLimit): los
// huecos que faltan hasta el tope se dibujan vacíos. Sin ruido no se dibuja nada.
export function noiseMarks(location){
 const n=count(location?.noise),limit=count(location?.noiseLimit);if(!n)return null;
 const filled=limit?Math.min(n,limit):n;
 return {count:n,limit:limit||null,filled,empty:limit?limit-filled:0,label:'Ruido '+n+(limit?' de '+limit:'')};
}
// Sobre el edificio, arriba y al centro, en coordenadas del mundo.
export function noiseAnchor(zone){const b=zone?.buildingBounds;return b?{x:b.x+b.width/2,y:b.y+b.height*.14}:null;}

// Área del mapa libre de paneles flotantes, para encuadrar una localidad sin que un panel
// la tape. El mapa sigue ocupando toda la pantalla; esto solo mueve el centro del enfoque.
// viewport y rects en píxeles CSS de la página ({left,top,right,bottom}).
export function safeInsets(viewport,rects,{minShare=.4}={}){
 const width=viewport.right-viewport.left,height=viewport.bottom-viewport.top,inset={top:0,right:0,bottom:0,left:0};
 if(!(width>0&&height>0))return inset;
 for(const r of rects){
  if(!r||r.right<=viewport.left||r.left>=viewport.right||r.bottom<=viewport.top||r.top>=viewport.bottom||r.right-r.left<=0||r.bottom-r.top<=0)continue;
  const top=Math.max(0,r.top-viewport.top),bottom=Math.min(height,r.bottom-viewport.top),left=Math.max(0,r.left-viewport.left),right=Math.min(width,r.right-viewport.left);
  if(bottom-top<=height*.35){if((top+bottom)/2<height/2)inset.top=Math.max(inset.top,bottom);else inset.bottom=Math.max(inset.bottom,height-top);}
  else if((left+right)/2>width/2)inset.right=Math.max(inset.right,width-left);else inset.left=Math.max(inset.left,right);
 }
 if(width-inset.left-inset.right<width*minShare)inset.left=inset.right=0;
 if(height-inset.top-inset.bottom<height*minShare)inset.top=inset.bottom=0;
 return inset;
}

// Rótulo de localidad (v2): aparece con la interacción y se desvanece; la seleccionada lo
// conserva. Colonia usa su posición de grupo; el resto, el frente del edificio, debajo del ruido.
export const LABEL_WAKE_MS=2800;
export function localityLabelAnchor(zone){const g=zone?.portraitGroup?.labelPosition,b=zone?.buildingBounds;return g?{x:g.x,y:g.y}:b?{x:b.x+b.width/2,y:b.y+b.height*.34}:null;}
export function labelVisible({id,selectedId,awakeUntil,now}){return id===selectedId||now<awakeUntil;}

// Globo de daño anclado a su ficha, en una sola fila: herida a la izquierda y congelación a la
// derecha, con una punta hacia la ficha. La letra se ajusta al diámetro como si cada marca fuera
// sola; con dos marcas el globo puede ser más ancho que su ficha (ver damageLift).
// Ancho estimado de una marca: símbolo y cifras (≈ .75em + .6em por cifra); 2 px entre marcas y
// 6 px de borde, relleno y globo.
export function damageBubble(diameter,marks){
 if(!marks?.length||!(diameter>0))return null;
 const ems=marks.map(m=>.75+.6*String(m.count).length),fontSize=Math.max(8,Math.min(11,Math.floor((diameter-6)/Math.max(...ems))));
 const width=Math.ceil(fontSize*ems.reduce((a,b)=>a+b,0)+2*(marks.length-1)+6);
 return {fontSize,width,maxWidth:width,height:Math.ceil(fontSize*1.15+8),wide:width>diameter};
}
// Globos que se tocan: el segundo (de izquierda a derecha) sube un nivel, y así hasta que no
// pise a ninguno. bubbles: {id,x (centro), y (base, sobre la ficha), width, height} en píxeles
// de pantalla. Devuelve {id: nivel}; el nivel 0 es su lugar de siempre.
export function damageLift(bubbles,{gap=2,maxLevel=4}={}){
 const placed=[],levels={};
 for(const b of [...bubbles].filter(b=>b&&b.width>0).sort((a,c)=>a.x-c.x||String(a.id).localeCompare(String(c.id)))){
  let level=0;const box=l=>({left:b.x-b.width/2,right:b.x+b.width/2,bottom:b.y-l*(b.height+gap),top:b.y-l*(b.height+gap)-b.height});
  const hits=r=>placed.some(p=>r.left<p.right+gap&&r.right>p.left-gap&&r.top<p.bottom&&r.bottom>p.top);
  while(level<maxLevel&&hits(box(level)))level++;
  placed.push(box(level));levels[b.id]=level;
 }
 return levels;
}

// D12 de la noche (solo tiradas nocturnas): bajo el edificio de la localidad que tira, del
// mundo a la pantalla con la cámara dibujada. pin es el centro del dado dentro de su tarjeta.
// Si no entra en el área libre (fuera de pantalla o bajo un panel), se corre adentro sin mover
// la cámara. Coordenadas en píxeles CSS del visor del mapa.
export function nightDieAnchor(zone,camera,viewport,box,{pin,inset={},gap=6,margin=8}={}){
 const b=zone?.buildingBounds;if(!b||!camera||!(viewport?.width>0)||!(box?.width>0))return null;
 const px=pin?.x??box.width/2,want={x:camera.x+(b.x+b.width/2)*camera.zoom-px,y:camera.y+(b.y+b.height)*camera.zoom+gap};
 const minX=(inset.left||0)+margin,minY=(inset.top||0)+margin,maxX=Math.max(minX,viewport.width-(inset.right||0)-margin-box.width),maxY=Math.max(minY,viewport.height-(inset.bottom||0)-margin-box.height);
 const left=Math.round(Math.min(maxX,Math.max(minX,want.x))),top=Math.round(Math.min(maxY,Math.max(minY,want.y)));
 return {left,top,clamped:left!==Math.round(want.x)||top!==Math.round(want.y)};
}
