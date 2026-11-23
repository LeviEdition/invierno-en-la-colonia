// Filtro frío del mapa (docs/109 §8): ajuste de color sobre la ilustración aprobada,
// sin redibujarla. Se hornea una vez en una copia en memoria de la textura del fondo;
// zombis, barricadas, retratos, contornos y la Lámpara de la selección no se filtran.
// Único interruptor: MAP_COLOR_FILTER=null vuelve a la ilustración original.
// warmLights (informe 121): las luces cálidas y brillantes (ventanas encendidas) no pasan por
// el giro de tono, que las volvía rosadas: se remapean al tono de la Lámpara (109 §2) al 60 %
// de su brillo. El contorno de selección, la fogata y la opción enfocada siguen más vivos.
export const LAMPARA=Object.freeze([242,193,78]);
export const MAP_COLOR_FILTER=Object.freeze({saturate:.5,hueRotate:-28,brightness:.85,contrast:1.05,warmLights:Object.freeze({color:LAMPARA,level:.6})});

// Equivalente CSS, como referencia del valor aprobado.
export function cssFilter(f){return f?`saturate(${f.saturate}) hue-rotate(${f.hueRotate}deg) brightness(${f.brightness}) contrast(${f.contrast})`:'none';}

// Matrices de Filter Effects (W3C) para saturate, hue-rotate, brightness y contrast,
// aplicadas en ese orden. Cada fila: [r, g, b, desplazamiento en 0..1].
const identity=()=>[[1,0,0,0],[0,1,0,0],[0,0,1,0]];
function saturate(s){return [[.213+.787*s,.715-.715*s,.072-.072*s,0],[.213-.213*s,.715+.285*s,.072-.072*s,0],[.213-.213*s,.715-.715*s,.072+.928*s,0]];}
function hueRotate(deg){const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [
 [.213+c*.787-s*.213,.715-c*.715-s*.715,.072-c*.072+s*.928,0],
 [.213-c*.213+s*.143,.715+c*.285+s*.140,.072-c*.072-s*.283,0],
 [.213-c*.213-s*.787,.715-c*.715+s*.715,.072+c*.928+s*.072,0]];}
const brightness=b=>[[b,0,0,0],[0,b,0,0],[0,0,b,0]];
const contrast=k=>[[k,0,0,.5-.5*k],[0,k,0,.5-.5*k],[0,0,k,.5-.5*k]];
// then(a,b): primero a, después b.
function then(a,b){return b.map(row=>[0,1,2,3].map(j=>row[0]*a[0][j]+row[1]*a[1][j]+row[2]*a[2][j]+(j===3?row[3]:0)));}
export function filterMatrix(f){if(!f)return identity();return [saturate(f.saturate),hueRotate(f.hueRotate),brightness(f.brightness),contrast(f.contrast)].reduce(then,identity());}

// Cuánto de «luz encendida» tiene un píxel original: tono cálido (naranja, 14°–55°; el rojo
// de la cruz o los ladrillos queda fuera),
// saturado y brillante. 0 para grises, fríos y ladrillo apagado. La usa también
// scripts/detectar-luces.mjs, para que ambos sigan el mismo criterio.
const ramp=(x,a,b)=>Math.max(0,Math.min(1,(x-a)/(b-a)));
export function warmWeight(r,g,b){
 const max=Math.max(r,g,b),min=Math.min(r,g,b);if(max!==r||max===min)return 0;
 const hue=60*(g-b)/(max-min),s=(max-min)/max,v=max/255;
 const hw=hue<14?ramp(hue,8,14):hue>55?1-ramp(hue,55,70):1;
 // Los núcleos casi blancos de una ventana (255,235,180) son poco saturados: cuanto más brillante
 // el píxel, menos saturación hace falta para contarlo como luz.
 const low=.35-.22*ramp(v,.8,1);
 return ramp(s,low,low+.25)*ramp(v,.55,.8)*hw;
}
// Un píxel: el filtro frío y, si es una luz cálida, el tono de la Lámpara en su lugar.
export function remapPixel(r,g,b,m,f=MAP_COLOR_FILTER){
 const fr=m[0][0]*r+m[0][1]*g+m[0][2]*b+m[0][3]*255,fg=m[1][0]*r+m[1][1]*g+m[1][2]*b+m[1][3]*255,fb=m[2][0]*r+m[2][1]*g+m[2][2]*b+m[2][3]*255;
 const w=f?.warmLights?warmWeight(r,g,b):0;if(!w)return [fr,fg,fb];
 const k=f.warmLights.level*Math.min(1,Math.max(r,g,b)/255/.85),[lr,lg,lb]=f.warmLights.color;
 return [fr+(lr*k-fr)*w,fg+(lg*k-fg)*w,fb+(lb*k-fb)*w];
}
// Toda la textura, sin asignar memoria por píxel (6,3 millones en el mapa 2×). Mismo cálculo
// que remapPixel.
export function applyMapFilter(data,f=MAP_COLOR_FILTER){
 applyMatrix(data,filterMatrix(f),f?.warmLights?(r,g,b)=>warmWeight(r,g,b):null,f?.warmLights);return data;
}
// RGBA de 8 bits, en el lugar. El alfa no cambia.
export function applyMatrix(data,m,weight=null,warm=null){
 const [r0,r1,r2,r3]=m[0],[g0,g1,g2,g3]=m[1],[b0,b1,b2,b3]=m[2],R=r3*255,G=g3*255,B=b3*255,[lr,lg,lb]=warm?.color||[0,0,0],level=warm?.level||0;
 for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2];let fr=r0*r+r1*g+r2*b+R,fg=g0*r+g1*g+g2*b+G,fb=b0*r+b1*g+b2*b+B;
  const w=weight?weight(r,g,b):0;if(w){const k=level*Math.min(1,Math.max(r,g,b)/255/.85);fr+=(lr*k-fr)*w;fg+=(lg*k-fg)*w;fb+=(lb*k-fb)*w;}
  data[i]=fr;data[i+1]=fg;data[i+2]=fb;}
 return data;
}

// Copia filtrada del recurso preparado del fondo. Sin filtro, el recurso queda igual.
export function withMapFilter(prepared,id='map',f=MAP_COLOR_FILTER){
 const p=prepared[id];if(!f||!p)return prepared;
 const canvas=document.createElement('canvas');canvas.width=p.image.width;canvas.height=p.image.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(p.image,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);applyMapFilter(pixels.data,f);ctx.putImageData(pixels,0,0);
 // generated: el renderer libera esta superficie al destruirse.
 return {...prepared,[id]:{...p,image:canvas,generated:true,colorFilter:cssFilter(f)}};
}
