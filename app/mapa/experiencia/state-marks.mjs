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
