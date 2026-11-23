// Filtro frío del mapa (docs/109 §8): ajuste de color sobre la ilustración aprobada,
// sin redibujarla. Se hornea una vez en una copia en memoria de la textura del fondo;
// zombis, barricadas, retratos, contornos y la Lámpara de la selección no se filtran.
// Único interruptor: MAP_COLOR_FILTER=null vuelve a la ilustración original.
export const MAP_COLOR_FILTER=Object.freeze({saturate:.5,hueRotate:-28,brightness:.85,contrast:1.05});

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

// RGBA de 8 bits, en el lugar. El alfa no cambia.
export function applyMatrix(data,m){
 const [r0,r1,r2,r3]=m[0],[g0,g1,g2,g3]=m[1],[b0,b1,b2,b3]=m[2],R=r3*255,G=g3*255,B=b3*255;
 for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2];data[i]=r0*r+r1*g+r2*b+R;data[i+1]=g0*r+g1*g+g2*b+G;data[i+2]=b0*r+b1*g+b2*b+B;}
 return data;
}

// Copia filtrada del recurso preparado del fondo. Sin filtro, el recurso queda igual.
export function withMapFilter(prepared,id='map',f=MAP_COLOR_FILTER){
 const p=prepared[id];if(!f||!p)return prepared;
 const canvas=document.createElement('canvas');canvas.width=p.image.width;canvas.height=p.image.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(p.image,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);applyMatrix(pixels.data,filterMatrix(f));ctx.putImageData(pixels,0,0);
 // generated: el renderer libera esta superficie al destruirse.
 return {...prepared,[id]:{...p,image:canvas,generated:true,colorFilter:cssFilter(f)}};
}
