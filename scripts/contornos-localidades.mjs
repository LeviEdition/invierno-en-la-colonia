// Dibuja el outlinePolygon de cada localidad sobre el fondo ORIGINAL 1× (mismas coordenadas del
// mundo), en un recorte por localidad a escala 2. Sin navegador ni dependencias (informe 123).
//   node scripts/contornos-localidades.mjs <carpeta> [commit]
// Con un commit, además dibuja «antes» con el scene.json de ese commit (git show).
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';import {fileURLToPath} from 'node:url';
import {decodePng} from './detectar-luces.mjs';import {encodePng} from './generar-papel.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),SCENE='app/mapa/escena/scene.json',SOURCE='assets/mapa-horizontal/nuevo mapa.png',SCALE=2,MARGIN=30;
export function overlay(img,polygon){
 const xs=polygon.map(q=>q[0]),ys=polygon.map(q=>q[1]),x0=Math.max(0,Math.floor(Math.min(...xs)-MARGIN)),y0=Math.max(0,Math.floor(Math.min(...ys)-MARGIN)),x1=Math.min(img.width,Math.ceil(Math.max(...xs)+MARGIN)),y1=Math.min(img.height,Math.ceil(Math.max(...ys)+MARGIN));
 const w=(x1-x0)*SCALE,h=(y1-y0)*SCALE,data=new Uint8Array(w*h*3);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=((y0+Math.floor(y/SCALE))*img.width+x0+Math.floor(x/SCALE))*img.channels,j=(y*w+x)*3;data[j]=img.data[i];data[j+1]=img.data[i+1];data[j+2]=img.data[i+2];}
 const dot=(x,y,c,r)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const px=Math.round(x)+dx,py=Math.round(y)+dy;if(px>=0&&py>=0&&px<w&&py<h)data.set(c,(py*w+px)*3);}};
 polygon.forEach((a,k)=>{const b=polygon[(k+1)%polygon.length],ax=(a[0]-x0)*SCALE,ay=(a[1]-y0)*SCALE,bx=(b[0]-x0)*SCALE,by=(b[1]-y0)*SCALE,n=Math.ceil(Math.hypot(bx-ax,by-ay));for(let t=0;t<=n;t++)dot(ax+(bx-ax)*t/n,ay+(by-ay)*t/n,[255,230,0],0);});
 polygon.forEach(q=>dot((q[0]-x0)*SCALE,(q[1]-y0)*SCALE,[0,220,255],2));
 return {width:w,height:h,channels:3,data};
}
const [out,ref]=process.argv.slice(2);
if(out){
 mkdirSync(out,{recursive:true});const img=decodePng(readFileSync(resolve(root,SOURCE)));
 const versions=[['despues',JSON.parse(readFileSync(resolve(root,SCENE),'utf8'))]];
 if(ref)try{versions.push(['antes',JSON.parse(execFileSync('git',['show',ref+':'+SCENE],{cwd:root,encoding:'utf8'}))]);}catch{console.error('Sin «antes»: el commit '+ref+' no está disponible; la comparación no se hizo.');process.exitCode=1;}
 for(const [suffix,scene] of versions)for(const z of scene.zones)writeFileSync(resolve(out,`${z.id}-${suffix}.png`),encodePng(overlay(img,z.outlinePolygon)));
 console.log('Contornos: '+versions.map(v=>v[0]).join(' y ')+' en '+out);
}
