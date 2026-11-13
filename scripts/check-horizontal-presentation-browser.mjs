import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {actionMapChecks} from '../test-support/h344-browser-checks.mjs';
import {capacityProjection,exteriorVolumes,boundsIntersectPolygon,overlaps} from '../test-support/horizontal-composition.mjs';
import {localityFrame} from '../prototypes/horizontal-map/presentation.mjs';
import {pointInPolygon} from '../prototypes/hospital-workshop/mockup/model.mjs';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const baseline=process.env.PRESENTATION_BASELINE==='1';
const out=resolve(process.env.PRESENTATION_DIR||'/tmp/horizontal-presentation-review');
const origin=process.env.HORIZONTAL_ORIGIN||'http://127.0.0.1:8779';
const json=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url)));
const scene=await json('prototypes/horizontal-map/scene.json');
const assets=(await json('prototypes/hospital-workshop/uploaded-kit.json')).assets;
const obstacles=(await json('test-support/horizontal-obstacles.json')).obstacles;
const t=actionMapChecks({origin,modulePath:'/dist/horizontal-map-qa/map.mjs'});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const result={baseline,browser:browser.version(),physicalMobile:false,records:[]};
await mkdir(out,{recursive:true});

function complete(view){
 const {camera:c,viewport:v}=view;
 return scene.zones.map(z=>{
  const b=localityFrame(z,0),left=c.x+b.x*c.zoom,top=c.y+b.y*c.zoom;
  const right=left+b.width*c.zoom,bottom=top+b.height*c.zoom;
  return {id:z.id,left,top,right,bottom,inside:left>=-1&&top>=-1&&right<=v.width+1&&bottom<=v.height+1};
 });
}
async function qaView(page){await t.frames(page);return page.evaluate(()=>capacityView.inspect());}
async function closePanel(page){if(await page.locator('#panel-content').isVisible())await page.locator('#panel-toggle').click();await t.frames(page);}
async function focus(page,id){await page.selectOption('#locality',id);await closePanel(page);}
async function general(page){await closePanel(page);await page.locator('#reset-view').click();await t.frames(page);}
async function setQa(page,p,label){
 await page.evaluate(({p,label})=>{capacityView.setState(p);document.querySelector('.qa-notice').textContent='QA · SIMULACIÓN · '+label;},{p,label});
 await t.frames(page);
}
function colonyCount(projection,n){
 const p=capacityProjection(projection,'mixed',scene),members=p.characters.filter(c=>c.locationId==='place-0');
 p.characters=p.characters.filter(c=>c.locationId!=='place-0'||members.slice(0,n).some(a=>a.id===c.id));
 const loc=p.locations.find(l=>l.engineIndex===0);loc.survivors=loc.occupied=n;loc.available=loc.capacity-n;
 return p;
}
async function tapWorld(page,position,touch){
 const v=await qaView(page),box=await page.locator('#scene').boundingBox();
 const x=box.x+v.camera.x+position.x*v.camera.zoom,y=box.y+v.camera.y+position.y*v.camera.zoom;
 assert.ok(x>=box.x&&x<=box.x+box.width&&y>=box.y&&y<=box.y+box.height);
 if(touch)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);
 await t.frames(page);
}

try{
 for(const viewport of [{width:1365,height:768},{width:852,height:393}]){
  const dir=resolve(out,viewport.width+'x'+viewport.height);await mkdir(dir,{recursive:true});
  const touch=viewport.width<1000,context=await browser.newContext({viewport,deviceScaleFactor:touch?2:1,isMobile:touch,hasTouch:touch,reducedMotion:'reduce'});
  await t.instrument(context);
  const page=await context.newPage(),errors=[],r={viewport,errors,colony:[],modes:[],picking:[],panel:[]};result.records.push(r);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text());});
  await t.begin(page);await t.openMap(page);
  const raw=await t.raw(page),rng=await t.rng(page),projection=(await t.api(page)).projection;
  await general(page);r.general=complete(await t.view(page));
  if(!baseline)assert.ok(r.general.every(z=>z.inside),'vista general real completa');
  if(!baseline){const styles=(await t.view(page)).renderer.slotStyles;assert.ok(styles.filter(a=>a.occupant==='empty').every(a=>a.solid&&a.alpha>=.5),'vacías visibles en general');}
  await page.screenshot({path:resolve(dir,'general-real.png')});
  const q=await context.newPage();q.on('pageerror',e=>errors.push(e.message));
  await q.goto(origin+'/dist/horizontal-map-qa/capacity.html');
  await q.evaluate(async p=>window.capacityView=await(await import('/dist/horizontal-map-qa/capacity.mjs')).mountCapacity(p),colonyCount(projection,1));
  await q.waitForFunction(()=>capacityView.inspect().layout.locations.length===7);
  for(const n of [1,6,12]){
   await setQa(q,colonyCount(projection,n),'Colonia '+n+'; vecinos completos; exteriores mixtos');
   await general(q);const g=await qaView(q),characters=g.layout.characters.filter(c=>c.locationId==='place-0');
   assert.equal(characters.length,n);const cx=(Math.min(...characters.map(c=>c.position.x))+Math.max(...characters.map(c=>c.position.x)))/2;
   r.colony.push({count:n,centerX:cx,characters:characters.map(c=>({id:c.id,position:c.position,portraitId:c.portraitId})),general:complete(g)});
   if(!baseline){assert.ok(Math.abs(cx-scene.zones.find(z=>z.id==='colonia').portraitGroup.center.x)<.01,'grupo centrado');assert.ok(complete(g).every(z=>z.inside));}
   await q.screenshot({path:resolve(dir,'colonia-'+n+'-general.png')});
   if(!baseline&&n===1){await tapWorld(q,{x:characters[0].position.x,y:characters[0].position.y-20/g.camera.zoom},touch);assert.equal((await qaView(q)).selected,characters[0].id,'ficha con objetivo44px incluso al alejarse');r.portraitTarget44=true;}
   await focus(q,'place-0');await q.screenshot({path:resolve(dir,'colonia-'+n+'-foco.png')});
   if(!baseline){
    const before=(await qaView(q)).layout.characters.map(c=>({id:c.id,position:c.position,portraitId:c.portraitId}));
    await tapWorld(q,characters[0].position,touch);assert.equal((await qaView(q)).selected,characters[0].id);
    assert.deepEqual((await qaView(q)).layout.characters.map(c=>({id:c.id,position:c.position,portraitId:c.portraitId})),before,'selección no desplaza ni intercambia fichas');
   }
  }
  for(const mode of ['zombies','barricades','mixed']){
   await setQa(q,capacityProjection(projection,mode,scene),'máximos '+mode+'; 36 supervivientes');
   await general(q);const v=await qaView(q),full=complete(v);
   if(!baseline)assert.ok(full.every(z=>z.inside),'vista general máxima completa '+mode);
   r.modes.push({mode,general:full,characters:v.layout.characters.length,zombies:v.layout.nodes.filter(n=>n.role==='zombie').length,barricades:v.layout.nodes.filter(n=>n.role==='barricade').length});
   await q.screenshot({path:resolve(dir,'max-'+mode+'-general.png')});
   for(const z of scene.zones){
    const loc=v.layout.locations.find(l=>l.visualId===z.id);await focus(q,loc.id);
    const view=await qaView(q),f=localityFrame(z,0),c=view.camera,w=view.viewport;
    if(!baseline)for(const [x,y]of [[f.x,f.y],[f.x+f.width,f.y+f.height]])assert.ok(c.x+x*c.zoom>=-1&&c.x+x*c.zoom<=w.width+1&&c.y+y*c.zoom>=-1&&c.y+y*c.zoom<=w.height+1,'foco completo '+z.id);
    if(!baseline&&scene.portraitsOnLocality){for(const c of view.layout.characters.filter(c=>c.locationId===loc.id))assert.equal(pointInPolygon(c.position,z.outlinePolygon),true,'ficha sobre '+z.id);}
    await q.screenshot({path:resolve(dir,'max-'+mode+'-'+z.id+'.png')});
    if(!baseline&&mode==='zombies'){for(const [index,a]of z.accesses.entries()){await closePanel(q);await tapWorld(q,a,touch);const view=await qaView(q);assert.equal(view.selectedLocation,loc.id,'casilla '+z.id+':'+index);const styles=view.renderer.slotStyles,selected=styles.filter(a=>a.zoneId===z.id),others=styles.filter(a=>a.zoneId!==z.id);assert.ok(selected.every(a=>a.width>=1.4&&a.alpha>=.85));assert.ok(others.every(a=>a.width<selected[0].width),'selección con énfasis frente a vecinos');r.picking.push({locality:z.id,index});}if(scene.portraitsOnLocality){await closePanel(q);const c=(await qaView(q)).layout.characters.find(c=>c.locationId===loc.id);await tapWorld(q,c.position,touch);assert.equal((await qaView(q)).selected,c.id,'ficha superpuesta seleccionable '+z.id);r.overlayPicking??=[];r.overlayPicking.push(z.id);}}
   }
  }
  // Estado anterior incompatible simulado: se conservan los conteos y excedentes.
  const legacy=capacityProjection(projection,'zombies');for(const loc of legacy.locations)loc.zombies=loc.engineIndex?4:12;
  await setQa(q,legacy,'QA · estado anterior incompatible: gasolinera4 / biblioteca4');
  for(const [index,extra]of [[4,2],[6,1]]){
   await focus(q,'place-'+index);const loc=(await qaView(q)).layout.locations.find(l=>l.engineIndex===index);assert.equal(loc.zombies,4);assert.equal(loc.externalOverflow,extra);
   await q.locator('#panel-toggle').click();await t.frames(q);
   assert.ok((await q.locator('#locality-overflow').textContent()).includes('Excedente exterior: '+extra));
   await q.screenshot({path:resolve(dir,'excedente-'+index+'.png')});await closePanel(q);
  }
  if(!baseline){
   const badge=await q.locator('.qa-notice').boundingBox(),canvas=await q.locator('#scene').boundingBox();
   assert.ok(badge.y+badge.height<=canvas.y+1,'cartel QA fuera del área de juego');r.qaOutsideMap=true;
   const volumes=exteriorVolumes(scene,assets);
   for(const a of volumes)for(const o of obstacles)assert.equal(boundsIntersectPolygon(a,o.polygon),false,a.locality+' sobre '+o.id);
   for(let i=0;i<volumes.length;i++)for(let j=i+1;j<volumes.length;j++)if(volumes[i].locality!==volumes[j].locality||volumes[i].index!==volumes[j].index)assert.equal(overlaps(volumes[i],volumes[j],2),false,'cuerpos vecinos');
   for(const z of scene.zones)for(const [x,y]of z.portraits){const radius=z.portraitDiameter/2;for(const a of volumes)assert.equal(overlaps({x:x-radius,y:y-radius,width:radius*2,height:radius*2},a,2),false,'ficha sobre actor');}
   r.volumes=volumes.length;
   // Foco y vista general: abrir/cerrar mantiene el modo y es reversible.
   for(const id of ['place-0','place-2','general']){
    if(id==='general')await general(page);else{await page.selectOption('#locality',id);await closePanel(page);}
    const before=(await t.view(page)).camera;
    await page.locator('#panel-toggle').click();await t.frames(page);
    if(id==='general')assert.ok(complete(await t.view(page)).every(z=>z.inside),'general completa con ficha abierta');
    await page.locator('#panel-toggle').click();await t.frames(page);
    const after=(await t.view(page)).camera;
    for(const key of ['x','y','zoom'])assert.ok(Math.abs(before[key]-after[key])<1e-6,'panel reversible '+key);
    r.panel.push(id);
   }
   await page.locator('#zoom-in').click();await page.locator('#zoom-in').click();await page.locator('#zoom-in').click();await t.frames(page);
   const before=(await t.view(page)).camera,box=await page.locator('#scene').boundingBox();
   if(touch){const cdp=await context.newCDPSession(page),x=box.x+box.width*.5,y=box.y+box.height*.55;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x,y}]});for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:x+45*i/8,y:y+25*i/8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}else{await page.mouse.move(box.x+box.width*.5,box.y+box.height*.55);await page.mouse.down();await page.mouse.move(box.x+box.width*.5+45,box.y+box.height*.55+25,{steps:8});await page.mouse.up();}await t.frames(page);
   const after=(await t.view(page)).camera;assert.ok(after.x!==before.x||after.y!==before.y,'desplazamiento');
   await page.locator('#reset-view').click();await t.frames(page);assert.ok(complete(await t.view(page)).every(z=>z.inside));r.panZoomReset=true;
   for(const id of ['zoom-in','zoom-out','panel-toggle']){const box=await page.locator('#'+id).boundingBox();assert.ok(box.width>=44&&box.height>=44,id+'44px');}
  }
  assert.deepEqual(await t.raw(page),raw);assert.equal(await t.rng(page),rng);assert.deepEqual(errors,[]);
  await q.evaluate(()=>capacityView.destroy());await context.close();
 }
 result.passed=true;
}catch(error){result.passed=false;result.error=error.stack;throw error;}
finally{await writeFile(resolve(out,'resultados.json'),JSON.stringify(result,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({passed:result.passed,baseline,out}));
