// Detecta las luces encendidas (ventanas cálidas y brillantes) en la textura ORIGINAL sin
// filtrar y escribe app/mapa/escena/luces.json en coordenadas del mundo. Determinista y sin
// dependencias: decodifica el PNG con zlib y usa el mismo criterio que el filtro frío.
//   node scripts/detectar-luces.mjs           escribe el JSON
//   node scripts/detectar-luces.mjs --check   falla si el JSON no coincide
import {readFileSync,writeFileSync} from 'node:fs';import {inflateSync} from 'node:zlib';import {createHash} from 'node:crypto';
import {resolve} from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
import {warmWeight} from '../app/mapa/render/cold-filter.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export const SOURCE='assets/mapa-horizontal/nuevo mapa.png',OUTPUT='app/mapa/escena/luces.json';
export const CRITERIA=Object.freeze({weight:.5,minArea:6,max:25});

// PNG de 8 bits, RGB o RGBA, sin entrelazado.
export function decodePng(buffer){
 let p=8,width,height,depth,type,interlace;const idat=[];
 while(p<buffer.length){const len=buffer.readUInt32BE(p),kind=buffer.toString('ascii',p+4,p+8),d=buffer.subarray(p+8,p+8+len);
  if(kind==='IHDR'){width=d.readUInt32BE(0);height=d.readUInt32BE(4);depth=d[8];type=d[9];interlace=d[12];}if(kind==='IDAT')idat.push(d);if(kind==='IEND')break;p+=12+len;}
 if(depth!==8||![2,6].includes(type)||interlace)throw Error('PNG no admitido');
 const bpp=type===6?4:3,stride=width*bpp,raw=inflateSync(Buffer.concat(idat)),out=new Uint8Array(height*stride);
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)],src=y*(stride+1)+1,row=y*stride;
  for(let x=0;x<stride;x++){const a=x>=bpp?out[row+x-bpp]:0,b=y?out[row-stride+x]:0,c=x>=bpp&&y?out[row-stride+x-bpp]:0;let v=raw[src+x];
   if(filter===1)v+=a;else if(filter===2)v+=b;else if(filter===3)v+=(a+b)>>1;else if(filter===4){const q=a+b-c,pa=Math.abs(q-a),pb=Math.abs(q-b),pc=Math.abs(q-c);v+=pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
   out[row+x]=v&255;}}
 return {width,height,channels:bpp,data:out};
}

// Manchas conectadas (8 vecinos) de píxeles con peso cálido ≥ criterio; las más grandes primero.
export function detectLights({width,height,channels,data},criteria=CRITERIA){
 const n=width*height,weight=new Float32Array(n),seen=new Uint8Array(n),lights=[];
 for(let i=0;i<n;i++){const j=i*channels;weight[i]=warmWeight(data[j],data[j+1],data[j+2]);}
 const stack=new Int32Array(n);
 for(let start=0;start<n;start++){
  if(seen[start]||weight[start]<criteria.weight)continue;
  let top=0,area=0,sx=0,sy=0,sw=0;stack[top++]=start;seen[start]=1;
  while(top){const i=stack[--top],x=i%width,y=(i-x)/width;area++;sx+=x;sy+=y;sw+=weight[i];
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;const k=ny*width+nx;if(!seen[k]&&weight[k]>=criteria.weight){seen[k]=1;stack[top++]=k;}}}
  if(area>=criteria.minArea)lights.push({x:+(sx/area+.5).toFixed(1),y:+(sy/area+.5).toFixed(1),area,meanWeight:sw/area});
 }
 lights.sort((a,b)=>b.area-a.area||a.y-b.y||a.x-b.x);
 return lights.slice(0,criteria.max).map(l=>({x:l.x,y:l.y,radius:+(Math.sqrt(l.area/Math.PI)*1.8+3).toFixed(1),base:+(.6+.4*l.meanWeight).toFixed(2)}));
}

export function buildLights(){
 const bytes=readFileSync(resolve(root,SOURCE)),image=decodePng(bytes);
 return {source:SOURCE,sha256:createHash('sha256').update(bytes).digest('hex'),generatedBy:'scripts/detectar-luces.mjs',criteria:{...CRITERIA},size:{width:image.width,height:image.height},lights:detectLights(image)};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const text=JSON.stringify(buildLights(),null,1)+'\n',target=resolve(root,OUTPUT);
 if(process.argv.includes('--check')){if(readFileSync(target,'utf8')!==text)throw Error('luces.json desactualizado: node scripts/detectar-luces.mjs');console.log('luces.json al día');}
 else{writeFileSync(target,text);console.log('Escrito '+OUTPUT+' ('+JSON.parse(text).lights.length+' luces)');}
}
