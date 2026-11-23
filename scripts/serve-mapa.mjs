// Servidor de desarrollo del mapa: construye y sirve solo lo que el producto usa.
//   node scripts/serve-mapa.mjs              http://127.0.0.1:8779/app/mapa/
//   node scripts/serve-mapa.mjs --host 0.0.0.0   (celular en la red local)
//   node scripts/serve-mapa.mjs --qa         (además dist/mapa-qa, solo loopback)
import http from 'node:http';import {readFile} from 'node:fs/promises';import {resolve,sep,extname} from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import {networkInterfaces} from 'node:os';
import {buildMapa} from './build-mapa.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const tipos={'.html':'text/html','.css':'text/css','.mjs':'application/javascript','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2'};
export function createMapaServer({qa=false}={}){
 const prefixes=['/app/mapa/','/dist/mapa/','/assets/mapa-horizontal/','/assets/interfaz/','/assets/fuentes/','/kit_arte_h33/assets/',...(qa?['/dist/mapa-qa/']:[])];
 return http.createServer(async(req,res)=>{
  try{
   let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(path==='/'){res.writeHead(302,{Location:'/app/mapa/'});res.end();return;}
   if(!prefixes.some(p=>path.startsWith(p)))throw Error('Fuera del producto');
   if(path.endsWith('/'))path+='index.html';
   const file=resolve(root,'.'+path);
   if(!qa&&path.startsWith('/app/mapa/qa/'))throw Error('Solo QA');
   if(path.includes('\\')||!prefixes.some(p=>file.startsWith(resolve(root,'.'+p)+sep)))throw Error('Ruta');
   const data=await readFile(file);
   res.writeHead(200,{'Content-Type':(tipos[extname(file)]||'text/plain')+'; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404);res.end('Recurso no disponible');}
 });
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const i=process.argv.indexOf('--host'),host=i<0?'127.0.0.1':process.argv[i+1],qa=process.argv.includes('--qa'),port=Number(process.env.MAPA_PORT||process.env.HORIZONTAL_MAP_PORT||8779);
 if(!['127.0.0.1','0.0.0.0'].includes(host)||qa&&host!=='127.0.0.1')throw Error('QA solo en loopback');
 await buildMapa();if(qa)await buildMapa({qa:true});
 const server=createMapaServer({qa});
 server.listen(port,host,()=>{console.log(`Mapa: http://127.0.0.1:${port}/app/mapa/`);if(host==='0.0.0.0')for(const a of Object.values(networkInterfaces()).flat().filter(a=>a.family==='IPv4'&&!a.internal))console.log(`Red local: http://${a.address}:${port}/app/mapa/`);});
 server.on('error',e=>{console.error(e.message);process.exitCode=1;});
}
