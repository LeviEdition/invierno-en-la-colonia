// Papel viejo y manchas de sangre seca para los paneles de la interfaz v2 (informe 122,
// guía 109 §8). Se generan UNA vez y se guardan como recurso; el navegador solo los dibuja.
// Deterministas: mulberry32 con semilla fija, nunca Math.random.
//   node scripts/generar-papel.mjs           escribe assets/interfaz/papel/ y estilos/manchas.css
//   node scripts/generar-papel.mjs --check   falla si los archivos no coinciden (compara píxeles)
import {readFileSync,writeFileSync,mkdirSync,statSync} from 'node:fs';import {deflateSync,inflateSync} from 'node:zlib';
import {resolve} from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
import {mulberry32} from '../app/mapa/experiencia/night-lights.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export const DIR='assets/interfaz/papel',CSS='app/mapa/estilos/manchas.css';

// Papel: crema amarillento que oscurece hacia los bordes. Cada variante es un mapa de tono de
// baja resolución (se estira sin perder nada: solo tiene variaciones suaves) y comparte un
// grano fino en mosaico que el CSS multiplica encima.
export const PAPER=Object.freeze({base:[232,219,182],edge:[176,151,104]});
export const VARIANTS=Object.freeze({
 // band: ancho del oscurecimiento del borde en fracción de cada eje (≈ 18–22 px reales);
 // fold: pliegue suave ({axis, at, width}).
 barra:{width:256,height:32,band:[.016,.28],fold:{axis:'x',at:.62,width:.006},seed:11},
 tarjeta:{width:128,height:48,band:[.08,.3],fold:{axis:'x',at:.7,width:.018},seed:23},
 ficha:{width:96,height:192,band:[.06,.035],fold:{axis:'y',at:.42,width:.008},seed:37}
});
// Sangre seca: marrón oxidado desaturado (referencia #6A2E22), nunca el rojo de las señales.
export const BLOOD=Object.freeze({color:[100,50,40],rim:[76,36,28],alpha:.72});
// Una mancha por panel, en una esquina que la disposición deja libre (gutter: lado visible
// en px). La de Crisis es más grande. Las demás posiciones se sortean con la semilla.
export const STAINS=Object.freeze({
 barra:{corner:'bottom-right',size:64,gutter:24,seed:101},
 objetivo:{corner:'top-right',size:64,gutter:26,seed:202},
 crisis:{corner:'top-right',size:112,gutter:40,seed:303},
 ficha:{corner:'bottom-right',size:72,gutter:28,seed:404}
});

const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t;
// Ruido de valor con rejilla periódica (mosaico sin costuras cuando period divide el tamaño).
function valueNoise(rng,cells){const g=Array.from({length:cells*cells},rng);return (u,v)=>{const x=u*cells,y=v*cells,x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,at=(i,j)=>g[((j%cells+cells)%cells)*cells+((i%cells+cells)%cells)],sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);return mix(mix(at(x0,y0),at(x0+1,y0),sx),mix(at(x0,y0+1),at(x0+1,y0+1),sx),sy);};}

export function paperTone(name){
 const v=VARIANTS[name],rng=mulberry32(v.seed),n1=valueNoise(rng,6),n2=valueNoise(rng,13),data=new Uint8Array(v.width*v.height*3);
 for(let y=0;y<v.height;y++)for(let x=0;x<v.width;x++){
  const u=(x+.5)/v.width,w=(y+.5)/v.height,inner=smooth(0,v.band[0],Math.min(u,1-u))*smooth(0,v.band[1],Math.min(w,1-w));
  const s=(v.fold.axis==='x'?u:w)-v.fold.at,fold=Math.exp(-((s/v.fold.width)**2)),light=Math.exp(-(((s-v.fold.width*1.6)/v.fold.width)**2));
  const mottle=(n1(u,w)-.5)*.06+(n2(u,w)-.5)*.03,shade=(1+mottle)*(1-.07*fold)*(1+.025*light);
  const i=(y*v.width+x)*3;for(let c=0;c<3;c++)data[i+c]=Math.round(clamp(mix(PAPER.edge[c],PAPER.base[c],Math.pow(inner,.8))*shade,0,255));
 }
 return {width:v.width,height:v.height,channels:3,data};
}
// Grano y fibra finos, en gris casi blanco, 128×128 en mosaico.
export function paperGrain(size=128,seed=7){
 const rng=mulberry32(seed),f=new Float32Array(size*size).fill(255);
 for(let i=0;i<f.length;i++)f[i]-=rng()*9;
 for(let k=0;k<90;k++){let x=rng()*size,y=rng()*size;const angle=(rng()-.5)*1.1+(rng()<.2?Math.PI/2:0),len=8+rng()*20,dark=9+rng()*13,bend=(rng()-.5)*.08;let a=angle;
  for(let t=0;t<len;t+=.5){const px=((Math.floor(x)%size)+size)%size,py=((Math.floor(y)%size)+size)%size,j=py*size+px;f[j]=Math.min(f[j],255-dark*(1-Math.abs(t/len-.5)));x+=Math.cos(a)*.5;y+=Math.sin(a)*.5;a+=bend;}}
 return {width:size,height:size,channels:1,data:Uint8Array.from(f,v=>Math.round(clamp(v,0,255)))};
}
// Mancha: borde irregular, anillo más oscuro de sangre seca y gotas sueltas.
export function bloodStain(name){
 const s=STAINS[name],S=s.size,rng=mulberry32(s.seed),data=new Uint8Array(S*S*4),r0=S*(name==='crisis'?.31:.27);
 const waves=Array.from({length:5},(_,k)=>({k:k+2,a:(.05+.09*rng())/(1+k*.4),p:rng()*Math.PI*2})),grain=valueNoise(rng,7);
 const drops=Array.from({length:3+Math.floor(rng()*4)},()=>{const ang=rng()*Math.PI*2,d=r0*(1.12+rng()*.5);return {x:S/2+Math.cos(ang)*d,y:S/2+Math.sin(ang)*d,r:S*(.012+rng()*.03)};});
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){
  const dx=x+.5-S/2,dy=y+.5-S/2,ang=Math.atan2(dy,dx),edge=r0*(1+waves.reduce((t,w)=>t+w.a*Math.sin(w.k*ang+w.p),0)),d=Math.hypot(dx,dy)/edge;
  let a=d<1?clamp((1-d)*edge/1.2)*(.42+.4*smooth(.62,1,d)+(grain(x/S,y/S)-.5)*.2):0,rim=d<1?smooth(.7,1,d):0;
  for(const p of drops){const e=Math.hypot(x+.5-p.x,y+.5-p.y);if(e<p.r+1){const da=clamp(p.r+1-e)*.78;if(da>a){a=da;rim=.6;}}}
  const i=(y*S+x)*4;for(let c=0;c<3;c++)data[i+c]=Math.round(mix(BLOOD.color[c],BLOOD.rim[c],rim));data[i+3]=Math.round(clamp(a*BLOOD.alpha)*255);
 }
 return {width:S,height:S,channels:4,data};
}
// Posición fija por tipo de panel: el centro de la mancha cae en la esquina, con un corrimiento
// sorteado de ±4 px. Solo se ve el cuarto que entra en el recuadro visible (gutter).
export function stainPlacement(name){
 const s=STAINS[name],rng=mulberry32(s.seed^0x5eed),jx=Math.round((rng()-.5)*8),jy=Math.round((rng()-.5)*8),[v,h]=s.corner.split('-');
 const x=h==='right'?s.gutter-s.size/2+jx:-s.size/2+jx,y=v==='bottom'?s.gutter-s.size/2+jy:-s.size/2+jy;
 return {corner:s.corner,vertical:v,horizontal:h,gutter:s.gutter,size:s.size,x,y};
}
export function stainCss(){
 const rules=Object.keys(STAINS).map(name=>{const p=stainPlacement(name);return `body[data-interfaz=v2] #map-app .mancha[data-mancha=${name}]{${p.vertical}:0;${p.horizontal}:0;width:${p.gutter}px;height:${p.gutter}px;background:url(../../../${DIR}/sangre-${name}.png) ${p.x}px ${p.y}px/${p.size}px ${p.size}px no-repeat}`;});
 return '/* Generado por scripts/generar-papel.mjs: no editar a mano. Manchas de sangre seca en capa\n   aparte del papel (informe 122): para moverlas o quitarlas, cambiar STAINS y regenerar. */\n'+rules.join('\n')+'\n';
}

// PNG de 8 bits (gris, RGB o RGBA), sin entrelazado; filtro «sub» por fila.
const CRC=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
const crc=buf=>{let c=0xffffffff;for(const b of buf)c=CRC[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
function chunk(type,data){const out=Buffer.alloc(12+data.length);out.writeUInt32BE(data.length,0);out.write(type,4,'ascii');data.copy(out,8);out.writeUInt32BE(crc(out.subarray(4,8+data.length)),8+data.length);return out;}
export function encodePng({width,height,channels,data}){
 const stride=width*channels,raw=Buffer.alloc((stride+1)*height);
 for(let y=0;y<height;y++){raw[y*(stride+1)]=1;for(let x=0;x<stride;x++)raw[y*(stride+1)+1+x]=(data[y*stride+x]-(x>=channels?data[y*stride+x-channels]:0))&255;}
 const head=Buffer.alloc(13);head.writeUInt32BE(width,0);head.writeUInt32BE(height,4);head[8]=8;head[9]={1:0,3:2,4:6}[channels];
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
export function decodePixels(buffer){
 let p=8,width,height,type;const idat=[];
 while(p<buffer.length){const len=buffer.readUInt32BE(p),kind=buffer.toString('ascii',p+4,p+8),d=buffer.subarray(p+8,p+8+len);if(kind==='IHDR'){width=d.readUInt32BE(0);height=d.readUInt32BE(4);type=d[9];}if(kind==='IDAT')idat.push(d);if(kind==='IEND')break;p+=12+len;}
 const channels={0:1,2:3,6:4}[type],stride=width*channels,raw=inflateSync(Buffer.concat(idat)),out=new Uint8Array(height*stride);
 for(let y=0;y<height;y++){const f=raw[y*(stride+1)];if(f!==1&&f!==0)throw Error('filtro no admitido');for(let x=0;x<stride;x++){const v=raw[y*(stride+1)+1+x];out[y*stride+x]=f===1?(v+(x>=channels?out[y*stride+x-channels]:0))&255:v;}}
 return {width,height,channels,data:out};
}
export function buildPaper(){
 const files={['papel-grano.png']:paperGrain()};
 for(const name of Object.keys(VARIANTS))files['papel-'+name+'.png']=paperTone(name);
 for(const name of Object.keys(STAINS))files['sangre-'+name+'.png']=bloodStain(name);
 return {files,css:stainCss()};
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){
 const {files,css}=buildPaper(),check=process.argv.includes('--check');let total=0;
 if(!check)mkdirSync(resolve(root,DIR),{recursive:true});
 for(const [name,image] of Object.entries(files)){const path=resolve(root,DIR,name);
  if(check){const saved=decodePixels(readFileSync(path));if(saved.width!==image.width||saved.height!==image.height||!Buffer.from(saved.data).equals(Buffer.from(image.data)))throw Error('Papel desactualizado: '+name);}
  else writeFileSync(path,encodePng(image));total+=statSync(path).size;}
 if(check){if(readFileSync(resolve(root,CSS),'utf8')!==css)throw Error('Manchas desactualizadas: '+CSS);}else writeFileSync(resolve(root,CSS),css);
 console.log((check?'Papel al día':'Papel generado')+': '+Object.keys(files).length+' texturas, '+(total/1024).toFixed(1)+' KB en total.');
}
