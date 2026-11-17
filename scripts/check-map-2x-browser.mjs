// Mapa en doble resolución (docs/112). Comprueba, con el mapa real servido en QA:
// - la textura activa decodifica a 3342×1882 y se dibuja a escala 0,5: el mundo sigue en 1671×941;
// - a zoom de ajuste, los 33 accesos y los nodos del mapa quedan en las mismas posiciones de
//   pantalla que antes (fixture grabada contra main con MAPA2X_RECORD);
// - el zoom máximo es 1,5 respecto del mundo y el rótulo dice 150 %.
// Capturas a zoom máximo en el directorio de salida (artifact del CI).
//   MAPA2X_RECORD=test-support/mapa-2x-ajuste.json  graba la fixture (contra el build de main)
import assert from 'node:assert/strict';import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {actionMapChecks} from '../test-support/h344-browser-checks.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.MAPA2X_DIR||'/tmp/horizontal-mapa-2x',origin=process.env.H344_ORIGIN||'http://127.0.0.1:8779',record=process.env.MAPA2X_RECORD||null;
const t=actionMapChecks({origin,modulePath:'/dist/mapa-qa/map.mjs'});
const fixtureUrl=new URL('../test-support/mapa-2x-ajuste.json',import.meta.url);
const fixture=record?null:JSON.parse(await readFile(fixtureUrl));
const manifest=JSON.parse(await readFile(new URL('../assets/mapa-horizontal/manifest.json',import.meta.url))),scene=JSON.parse(await readFile(new URL('../app/mapa/escena/scene.json',import.meta.url)));
const viewports=[[1365,768,1],[852,393,2],[393,852,2]],capturas=new Set(['1365x768','852x393']);
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}),report={record:!!record,cases:[]};let page;
const near=(a,b,msg,tol=.01)=>assert.ok(Math.abs(a-b)<=tol,`${msg}: ${a} frente a ${b}`);
try{
 for(const [width,height,dpr]of viewports){
  const key=width+'x'+height,touch=width<950,context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true,isMobile:touch});
  await t.instrument(context);page=await context.newPage();page.setDefaultTimeout(20000);await t.begin(page);await t.openMap(page);
  await page.locator('#reset-view').click();await t.frames(page);
  const v=await t.view(page),cam=v.camera,accesses=v.layout.locations.flatMap(l=>l.accesses.map(a=>({id:a.id,zone:a.zoneId,world:a.position,screen:{x:cam.x+a.position.x*cam.zoom,y:cam.y+a.position.y*cam.zoom}})));
  const nodes=v.renderer.nodes.filter(n=>n.id!=='map').map(n=>({id:n.id,x:n.x,y:n.y})).sort((a,b)=>a.id.localeCompare(b.id));
  const row={viewport:{width,height,dpr},camera:{x:cam.x,y:cam.y,zoom:cam.zoom},mapViewport:{width:v.viewport.width,height:v.viewport.height},accesses,nodes};report.cases.push(row);
  assert.equal(accesses.length,33,key+': 33 accesos');
  if(!record){
   // Textura: el archivo activo decodifica a 3342×1882 y el renderer la usa de ese tamaño a escala 0,5.
   const decoded=await page.evaluate(async url=>{const b=await createImageBitmap(await (await fetch(url)).blob());const r={width:b.width,height:b.height};b.close();return r;},origin+'/'+manifest.activeMap);
   assert.deepEqual(decoded,{width:3342,height:1882},key+': textura decodificada');
   const tex=v.renderer.textures.map,map=v.renderer.nodes.find(n=>n.id==='map');
   assert.deepEqual([tex.width,tex.height],[3342,1882],key+': textura del renderer');
   assert.equal(map.scaleX,.5);assert.equal(map.scaleY,.5);
   assert.deepEqual([map.scaleX*tex.width,map.scaleY*tex.height],[scene.bounds.width,scene.bounds.height],key+': el mundo sigue en 1671×941');
   row.texture={decoded,renderer:{width:tex.width,height:tex.height,potWidth:tex.potWidth,potHeight:tex.potHeight,sourceWidth:tex.sourceWidth,sourceHeight:tex.sourceHeight},scale:[map.scaleX,map.scaleY]};
   // Mismas posiciones que antes, a zoom de ajuste.
   const before=fixture.cases.find(c=>c.viewport.width===width&&c.viewport.height===height);assert.ok(before,key+': fixture');
   assert.deepEqual(row.mapViewport,before.mapViewport,key+': mismo espacio del mapa');
   for(const k of ['x','y','zoom'])near(cam[k],before.camera[k],key+' cámara de ajuste '+k,1e-6);
   for(const a of accesses){const b=before.accesses.find(x=>x.id===a.id);assert.ok(b,a.id);assert.deepEqual(a.world,b.world,a.id+' mundo');near(a.screen.x,b.screen.x,a.id+' x');near(a.screen.y,b.screen.y,a.id+' y');}
   assert.deepEqual(nodes,before.nodes,key+': zombis, barricadas y retratos en las mismas coordenadas');
   // Zoom máximo 1,5 del mundo lógico.
   for(let i=0;i<40&&!(await page.locator('#zoom-in').isDisabled());i++){await page.locator('#zoom-in').click();await t.frames(page);}
   const z=await t.view(page);
   assert.equal(z.camera.maxZoom,1.5);near(z.camera.zoom,1.5,key+' zoom máximo',1e-9);
   assert.equal((await page.locator('#zoom-value').textContent()).trim(),'150 %');
   assert.ok(3342*.5*z.camera.zoom/3342<=1,'un píxel de la textura ocupa como mucho un píxel CSS');
   row.maxZoom={camera:z.camera,label:'150 %'};
   if(capturas.has(key))await page.screenshot({path:out+'/zoom-maximo-'+key+'.png'});
  }
  await context.close();console.log('mapa-2x',key,record?'grabado':'ok');
 }
 if(record)await writeFile(record,JSON.stringify({generatedFrom:process.env.MAPA2X_SOURCE||'build anterior',cases:report.cases.map(({viewport,camera,mapViewport,accesses,nodes})=>({viewport,camera,mapViewport,accesses,nodes}))},null,1)+'\n');
 report.passed=true;
}catch(error){report.error=error.stack;if(page&&!page.isClosed())await page.screenshot({path:out+'/fallo.png'}).catch(()=>{});throw error;}
finally{await writeFile(out+'/auditoria.json',JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify({passed:report.passed,out}));
