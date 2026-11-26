// Dirección «objetos a carbón» (sesión 8, informe 127; guía 109 §8). Cada panel es un objeto del
// mundo de la colonia. Solo presentación: no lee reglas ni consume azar del motor. Todo lo que
// varía (giro, hollín, manchas, esquina quemada, texturas generadas) sale de un PRNG con semilla
// fija por objeto: igual entre recargas, nunca Math.random.
import {seedOf} from './papel.mjs';
import {seededRandom} from '../movimiento/d12-orientation.mjs';

// ── Parte pura ──
// Rasgos fijos de un objeto: giro leve, intensidad del hollín, dónde cae la mancha.
export function objectDecor(name){
 const r=seededRandom(seedOf('carbon:'+name));
 return {tilt:+((r()-.5)*2.4).toFixed(2),soot:+(.45+r()*.3).toFixed(2),stain:{x:Math.round(8+r()*70),y:Math.round(r()<.5?4+r()*14:70+r()*18)},burnt:r()<.34};
}
// Cuál de las polaroids del grupo tiene la esquina quemada: siempre la misma para el mismo grupo.
export function burntMate(ids){if(!ids?.length)return null;const sorted=[...ids].sort();return sorted[seedOf('quemada:'+sorted.join(','))%sorted.length];}
// Rayas de conteo raspadas: grupos de cinco (la quinta cruza a las otras cuatro).
export function tallyGroups(n){const v=Math.max(0,Math.floor(Number(n)||0)),out=[];for(let left=v;left>0;left-=5)out.push(Math.min(5,left));return out;}

// Texturas generadas (RGBA, tamaño×tamaño), deterministas por semilla.
export function grainPixels(size,seed,{alpha=60}={}){
 const r=seededRandom(seed),px=new Uint8ClampedArray(size*size*4);
 for(let i=0;i<size*size;i++){const v=Math.floor(r()*255),a=r()<.55?Math.floor(r()*alpha):0;px.set([v,v,v,a],i*4);}return px;
}
// Lona sucia (sobre la que se tiran los dados) y manta azul tejida (donde se apoyan las cartas).
export function weavePixels(size,seed,{base,thread,dirt=.18}){
 // Trama fina: cada hilo (fila o columna) con su tono; arriba y abajo se alternan cada 2 px.
 const r=seededRandom(seed),px=new Uint8ClampedArray(size*size*4),rows=Array.from({length:size},()=>(r()-.5)*26),cols=Array.from({length:size},()=>(r()-.5)*26);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const over=((x>>1)+(y>>1))%2===0,c=over?thread:base,shade=(over?cols[x]:rows[y])+(r()-.5)*10-(r()<dirt*.08?30:0);
  px.set([c[0]+shade,c[1]+shade,c[2]+shade*.8,255],(y*size+x)*4);
 }
 return px;
}
// Chapa galvanizada: la «flor» del zinc (celdas irregulares, cada una con su tono y su veta) y un
// grano fino. Repetible: las distancias se miden dando la vuelta por los bordes.
export function spanglePixels(size,seed,{base,cells=64,spread=9}){
 const r=seededRandom(seed),px=new Uint8ClampedArray(size*size*4),flakes=Array.from({length:cells},()=>({x:r()*size,y:r()*size,tone:(r()-.5)*2*spread,angle:r()*Math.PI}));
 const wrap=d=>d>size/2?d-size:d<-size/2?d+size:d;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  let near=null,first=Infinity,second=Infinity,nx=0,ny=0;
  for(const f of flakes){const dx=wrap(x-f.x),dy=wrap(y-f.y),d=dx*dx+dy*dy;if(d<first){second=first;first=d;near=f;nx=dx;ny=dy;}else if(d<second)second=d;}
  const vein=Math.sin((nx*Math.cos(near.angle)+ny*Math.sin(near.angle))*1.25)*2.5,edge=Math.sqrt(second)-Math.sqrt(first)<1.1?-4:0,shade=near.tone+vein+edge+(r()-.5)*5;
  px.set([base[0]+shade,base[1]+shade,base[2]+shade,255],(y*size+x)*4);
 }
 return px;
}
export const TEXTURES=Object.freeze({
 grano:{size:192,seed:8101,kind:'grain'},
 lona:{size:96,seed:8102,kind:'weave',base:[44,62,88],thread:[60,82,112],dirt:.35},
 manta:{size:96,seed:8103,kind:'weave',base:[38,54,78],thread:[52,72,102],dirt:.2},
 galvanizada:{size:128,seed:8104,kind:'spangle',base:[160,168,175]}
});
const painters={grain:(t)=>grainPixels(t.size,t.seed),weave:(t)=>weavePixels(t.size,t.seed,t),spangle:(t)=>spanglePixels(t.size,t.seed,t)};
export function texturePixels(name){const t=TEXTURES[name];return painters[t.kind](t);}

// Contraste: color de fondo representativo de cada material (el caso más desfavorable) y el texto
// que va encima (informes 127 y 128). El piso es AA: 4,5 (3 para texto grande).
export const MATERIALS=Object.freeze([
 {material:'chapa galvanizada (números en esténcil)',bg:'#8E969D',text:'#11161A',large:true},
 {material:'chapa galvanizada (etiquetas)',bg:'#8E969D',text:'#1C2329',large:false},
 {material:'chapa galvanizada (comida y residuos en peligro)',bg:'#8E969D',text:'#521308',large:false},
 {material:'pieza estampada (zoom y menú)',bg:'#A9B1B8',text:'#11161A',large:false},
 {material:'pieza estampada apagada',bg:'#98A0A7',text:'#232A30',large:false},
 {material:'hoja del objetivo (lápiz)',bg:'#D9CFB8',text:'#3A342D',large:true},
 {material:'hoja del objetivo (título)',bg:'#D9CFB8',text:'#2B2219',large:false},
 {material:'cartón de la crisis (texto)',bg:'#A88A62',text:'#1E1610',large:false},
 {material:'cartón de la crisis (marcador)',bg:'#A88A62',text:'#6E1F15',large:true},
 {material:'carpeta manila (texto)',bg:'#CDB58A',text:'#2B2219',large:false},
 {material:'carpeta manila (a máquina)',bg:'#CDB58A',text:'#2E2A26',large:false},
 {material:'tablón (texto de la barra)',bg:'#2A2018',text:'#EDE3CF',large:false},
 {material:'etiqueta de papel crema (botones)',bg:'#E9DEC2',text:'#1E1610',large:false},
 {material:'etiqueta apagada (barra)',bg:'#A79C86',text:'#241D15',large:false},
 {material:'botón apagado en un papel',bg:'#BDB29B',text:'#2E271E',large:false},
 {material:'carta de búsqueda (tipo en esténcil)',bg:'#DCCCA8',text:'#4A1F14',large:false},
 {material:'«Terminar turno» (Lámpara)',bg:'#F2C14E',text:'#1E1610',large:false},
 {material:'papel central',bg:'#E4DAC3',text:'#2B2219',large:false},
 {material:'nota a lápiz del mapa',bg:'#E2D8C2',text:'#2F2A24',large:true}
]);
const channel=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4;};
export function luminance(hex){const n=parseInt(hex.slice(1),16);return .2126*channel(n>>16&255)+.7152*channel(n>>8&255)+.0722*channel(n&255);}
export function contrast(a,b){const [x,y]=[luminance(a),luminance(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05);}

// ── Parte con DOM ──
function texUrl(name){
 const t=TEXTURES[name],c=document.createElement('canvas');c.width=c.height=t.size;const g=c.getContext('2d'),img=g.createImageData(t.size,t.size);img.data.set(texturePixels(name));g.putImageData(img,0,0);return 'url('+c.toDataURL('image/png')+')';
}
const span=(cls,parent,before=null)=>{const s=document.createElement('span');s.className=cls;s.setAttribute('aria-hidden','true');parent.insertBefore(s,before);return s;};
const once=(parent,cls,make)=>parent&&(parent.querySelector(':scope>.'+cls.split(' ')[0])||make());
export function mountCarbon(doc=document){
 const root=doc.documentElement;if(root.dataset.carbon==='on')return;root.dataset.carbon='on';
 try{for(const name of Object.keys(TEXTURES))root.style.setProperty('--tex-'+name,texUrl(name));}catch{}
 const objects={'.topbar':'chapa','#objective-card':'hoja','#crisis-card':'carton','#dossier':'carpeta','#action-bar':'tablon','#map-notice':'nota'};
 for(const [sel,name] of Object.entries(objects)){const el=doc.querySelector(sel);if(!el)continue;const d=objectDecor(name);el.dataset.objeto=name;el.style.setProperty('--giro',d.tilt+'deg');el.style.setProperty('--hollin',String(d.soot));el.style.setProperty('--mancha-x',d.stain.x+'%');el.style.setProperty('--mancha-y',d.stain.y+'%');}
 // La misma chapa atornillada en los recursos, el zoom y el menú desplegable.
 for(const sel of ['.topbar','.map-tools','#floating-menu']){const plate=doc.querySelector(sel);once(plate,'tornillo',()=>{for(const k of ['ti','td','bi','bd'])span('tornillo tornillo-'+k,plate);});}
 const obj=doc.querySelector('#objective-card');once(obj,'pliegues',()=>{span('pliegues',obj,obj.firstChild);span('escarcha',obj);});
 const cri=doc.querySelector('#crisis-card');once(cri,'cinta',()=>{span('cinta cinta-i',cri);span('cinta cinta-d',cri);});
 // La pintura del tablón va en el flujo de la barra, entre los dados y las acciones: ocupa solo el
 // hueco libre y ningún control puede taparla (informe 128).
 const bar=doc.querySelector('#action-bar');once(bar,'estencil',()=>{const s=span('estencil',bar,bar.querySelector(':scope>#bar-actions'));const paint=doc.createElement('span');paint.textContent='VÍVERES';s.append(paint);});
}
// Residuos: rayas raspadas en grupos de cinco, además del número.
export function paintTally(el,n){
 if(!el)return;const groups=tallyGroups(n),key=groups.join(',');if(el.dataset.key===key)return;el.dataset.key=key;
 el.replaceChildren(...groups.map(count=>{const g=document.createElement('span');g.className='raya-grupo';g.dataset.count=String(count);for(let i=0;i<Math.min(4,count);i++)g.append(document.createElement('i'));if(count===5){const x=document.createElement('b');g.append(x);}return g;}));
}
