import http from 'node:http';import {readFile} from 'node:fs/promises';import {resolve,sep,extname} from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import {networkInterfaces} from 'node:os';
import {createWorkshopServer} from './serve-workshop.mjs';import {buildWorkshop} from './build-workshop.mjs';import {buildHospital} from './build-hospital-phaser.mjs';import {buildStateMap} from './build-state-map.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export function createStateMapServer({qa=false}={}){
 const previous=createWorkshopServer(),prefixes=['/prototypes/state-map/','/dist/state-map/',...(qa?['/dist/state-map-qa/']:[])],types={'.html':'text/html; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
 return http.createServer(async(req,res)=>{
  try{
   let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
   if(pathname==='/'){res.writeHead(302,{Location:'/prototypes/state-map/'});res.end();return;}
   const product=pathname==='/invierno_colonia_v9_9.html';
   if(!product&&!prefixes.some(p=>pathname.startsWith(p))){previous.emit('request',req,res);return;}
   if(pathname.endsWith('/'))pathname+='index.html';const file=resolve(root,'.'+pathname);
   if(pathname.includes('\\')||(!product&&!prefixes.some(p=>file.startsWith(resolve(root,'.'+p)+sep)))){res.writeHead(404);res.end();return;}
   const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'text/plain','Content-Length':bytes.length,'Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404);res.end('Recurso no disponible');}
 });
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const hostIndex=process.argv.indexOf('--host'),host=hostIndex<0?'127.0.0.1':process.argv[hostIndex+1],qa=process.argv.includes('--qa'),port=Number(process.env.STATE_MAP_PORT||8775);
 if(!['127.0.0.1','0.0.0.0'].includes(host)||qa&&host!=='127.0.0.1')throw Error('QA solo en loopback; usar --host 127.0.0.1 o 0.0.0.0 para producto');
 await buildHospital();await buildWorkshop();await buildStateMap();if(qa)await buildStateMap({qa:true});
 const server=createStateMapServer({qa});server.listen(port,host,()=>{console.log(`Partida real de consulta: http://127.0.0.1:${port}/prototypes/state-map/\nMaqueta H3.3 conservada: http://127.0.0.1:${port}/prototypes/hospital-workshop/`);if(qa)console.log(`Solo QA: http://127.0.0.1:${port}/dist/state-map-qa/index.html`);if(host==='0.0.0.0')for(const a of Object.values(networkInterfaces()).flat().filter(a=>a.family==='IPv4'&&!a.internal))console.log(`Red local: http://${a.address}:${port}/prototypes/state-map/`);});server.on('error',error=>{console.error(error.message);process.exitCode=1;});
}
