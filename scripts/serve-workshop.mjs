import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {networkInterfaces} from 'node:os';
import {createPreviewServer} from './serve-hospital.mjs';
import {buildHospital} from './build-hospital-phaser.mjs';
import {buildWorkshop} from './build-workshop.mjs';
import {workshopRoot} from './check-workshop-kit.mjs';
export function createWorkshopServer(){
 const references=createPreviewServer(),prefixes=['/prototypes/hospital-workshop/','/dist/hospital-workshop/','/assets/hospital-workshop/'];
 return http.createServer(async(req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(pathname==='/'){res.writeHead(302,{Location:'/prototypes/hospital-workshop/'});res.end();return;}
   if(!prefixes.some(p=>pathname.startsWith(p))){references.emit('request',req,res);return;}
   const path=pathname.endsWith('/')?pathname+'index.html':pathname,file=resolve(workshopRoot,'.'+path);
   if(path.includes('\\')||!prefixes.some(p=>file.startsWith(resolve(workshopRoot,'.'+p)+sep))){res.writeHead(404);res.end();return;}
   const bytes=await readFile(file),types={'.html':'text/html; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
   res.writeHead(200,{'Content-Type':types[extname(file)]||'text/plain','Content-Length':bytes.length,'Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404);res.end('Recurso no disponible');}
 });
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 await buildHospital();await buildWorkshop();const index=process.argv.indexOf('--host'),host=index<0?'127.0.0.1':process.argv[index+1],port=Number(process.env.WORKSHOP_PORT||8772);
 if(!['127.0.0.1','0.0.0.0'].includes(host))throw Error('Usar --host 127.0.0.1 o 0.0.0.0');
 const server=createWorkshopServer();server.listen(port,host,()=>{console.log(`Taller H3.3: http://127.0.0.1:${port}/prototypes/hospital-workshop/\nCanvas: /prototypes/hospital/ · Phaser H3.2: /prototypes/hospital-phaser/`);if(host==='0.0.0.0')for(const a of Object.values(networkInterfaces()).flat().filter(a=>a.family==='IPv4'&&!a.internal))console.log(`Red local: http://${a.address}:${port}/prototypes/hospital-workshop/`);});server.on('error',e=>{console.error(e.message);process.exitCode=1;});
}
