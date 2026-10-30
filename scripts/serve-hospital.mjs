import http from 'node:http';
import {networkInterfaces} from 'node:os';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildHospital,projectRoot} from './build-hospital-phaser.mjs';
export function createPreviewServer(){
 const prefixes=['/prototypes/hospital/','/prototypes/hospital-phaser/','/assets/prototipo-hospital/','/dist/hospital-phaser/'];
 const types={'.html':'text/html; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json; charset=utf-8'};
 return http.createServer(async(req,res)=>{
  try{
   let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(path==='/'){res.writeHead(302,{Location:'/prototypes/hospital-phaser/'});res.end();return;}
   if(!prefixes.some(prefix=>path.startsWith(prefix))||path.includes('\\')){res.writeHead(404);res.end('No disponible');return;}
   if(path.endsWith('/'))path+='index.html';
   const file=resolve(projectRoot,'.'+path);
   if(!file.startsWith(projectRoot+sep)||!prefixes.some(prefix=>file.startsWith(resolve(projectRoot,'.'+prefix)+sep))){res.writeHead(404);res.end();return;}
   const info=await stat(file);if(!info.isFile())throw Error('No es archivo');
   const etag='"'+info.size+'-'+info.mtimeMs+'"';
   const headers={'Content-Type':types[extname(file)]||'text/plain; charset=utf-8','Cache-Control':'no-cache',ETag:etag};
   if(req.headers['if-none-match']===etag){res.writeHead(304,headers);res.end();return;}
   res.writeHead(200,{...headers,'Content-Length':info.size});res.end(req.method==='HEAD'?undefined:await readFile(file));
  }catch{res.writeHead(404);res.end('Archivo no disponible');}
 });
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 await buildHospital();const port=Number(process.env.HOSPITAL_PORT||8771),server=createPreviewServer();
 const hostIndex=process.argv.indexOf('--host'),host=hostIndex<0?'127.0.0.1':process.argv[hostIndex+1];
 if(!['127.0.0.1','0.0.0.0'].includes(host))throw Error('Usar --host 127.0.0.1 o --host 0.0.0.0 para red local');
 server.listen(port,host,()=>{
  console.log(`Phaser: http://127.0.0.1:${port}/prototypes/hospital-phaser/\nCanvas: http://127.0.0.1:${port}/prototypes/hospital/`);
  if(host==='0.0.0.0')for(const address of Object.values(networkInterfaces()).flat().filter(x=>x.family==='IPv4'&&!x.internal))console.log(`Red local: http://${address.address}:${port}/prototypes/hospital-phaser/ (Canvas: /prototypes/hospital/)`);
 });
 server.on('error',error=>{console.error(error.message);process.exitCode=1;});
}
