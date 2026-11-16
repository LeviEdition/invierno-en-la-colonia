import assert from 'node:assert/strict';
import {resolve} from 'node:path';

// QA de presentación: ninguna importación del motor ni modificación del fixture.
export async function visibleControl(page,locator){
 await locator.scrollIntoViewIfNeeded();
 const rect=await locator.evaluate(el=>{
  const r=el.getBoundingClientRect();let left=0,top=0,right=innerWidth,bottom=innerHeight;
  for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),b=p.getBoundingClientRect();if(/hidden|auto|scroll|clip/.test(s.overflowX)){left=Math.max(left,b.left);right=Math.min(right,b.right);}if(/hidden|auto|scroll|clip/.test(s.overflowY)){top=Math.max(top,b.top);bottom=Math.min(bottom,b.bottom);}}
  return {label:el.getAttribute('aria-label')||el.id||el.textContent.trim(),x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,clip:{left,top,right,bottom}};
 });
 assert.ok(rect.width>=44&&rect.height>=44,JSON.stringify(rect));
 assert.ok(rect.x>=rect.clip.left-1&&rect.y>=rect.clip.top-1&&rect.right<=rect.clip.right+1&&rect.bottom<=rect.clip.bottom+1,'Control recortado: '+JSON.stringify(rect));
 return rect;
}
export async function checkInitialInterface(page,viewport){
 const records=[];
 for(const el of await page.locator('.map-tools button,.map-tools select,.mission button').all())records.push(await visibleControl(page,el));
 if(viewport.width>800)for(const el of await page.locator('[data-action],.die').all()){
  // No scroll para ocultar el defecto original de acciones fuera de vista inicial.
  const b=await el.boundingBox();assert.ok(b.y>=0&&b.y+b.height<=viewport.height,'Acción/dado fuera de vista inicial');records.push(await visibleControl(page,el));
 }
 for(const [i,value]of [2,3,5,6].entries()){
  const die=page.locator(`[data-die="${i}"]`);assert.equal(await die.locator('.pip').count(),value);assert.ok((await die.getAttribute('aria-label')).includes('valor '+value));assert.ok((await die.getAttribute('aria-label')).includes('grupo A'));
 }
 assert.equal(await page.locator('[data-action] svg[aria-hidden=true]').count(),4);return records;
}
export async function checkLocalities({page:p,viewport,app,frames,output}){
 if(!await p.locator('#panel-content').isVisible())await p.locator('#panel-toggle').click();await frames(p);
 const points={escuela:[450,165],biblioteca:[1100,178],hospital:[280,475],colonia:[950,470],gasolinera:[260,815],comisaria:[705,850],supermercado:[1180,860]},records=[];
 async function pick(world){const a=await app(p),b=await p.locator('#scene').boundingBox(),x=b.x+a.camera.x+world.x*a.camera.zoom,y=b.y+a.camera.y+world.y*a.camera.zoom;assert.ok(x>=b.x&&x<=b.x+b.width&&y>=b.y&&y<=b.y+b.height);if(viewport.width<500)await p.touchscreen.tap(x,y);else await p.mouse.click(x,y);await frames(p);}
 for(const [id,[x,y]]of Object.entries(points)){
  await p.selectOption('#locality',id);await frames(p);let a=await app(p);const camera=a.camera;
  await p.locator('#scene').focus();await p.keyboard.press('Escape');await frames(p);await pick({x,y});a=await app(p);assert.equal(a.state.selectedLocality,id);assert.equal(a.state.selected,null);assert.equal(await p.locator('#panel-title').textContent(),'Localidad');assert.deepEqual(a.camera,camera);
  assert.equal(await p.locator('#locality-occupancy').textContent(),a.locality.characters.length+'/'+a.locality.survivorCapacity);assert.equal(await p.locator('#locality-survivors button').count(),a.locality.characters.length);
  for(const key of ['zombies','barricades','empty'])assert.equal(Number(await p.locator('#locality-'+key).textContent()),a.locality[key]);
  const character=a.fixture.characters.find(c=>c.zoneId===id);await pick(character.position);a=await app(p);assert.equal(a.state.selected,character.id);assert.equal(a.state.selectedLocality,null);assert.equal(await p.locator('#panel-title').textContent(),'Superviviente');assert.deepEqual(a.camera,camera);
  // El selector HTML consulta sin centrar ni mover la cámara.
  await p.locator('#demo-controls').evaluate(el=>el.open=true);await p.selectOption('#locality-select',id);await frames(p);assert.equal((await app(p)).state.selectedLocality,id);assert.deepEqual((await app(p)).camera,camera);await p.locator('#demo-controls').evaluate(el=>el.open=false);await p.locator('#panel-content').evaluate(el=>el.scrollTop=0);
  await p.locator('#locality-survivors button').first().click();await frames(p);assert.equal((await app(p)).state.selected,character.id);
  // Empezar sin selección: un drag terminado encima del edificio no debe elegirlo.
  await p.locator('#scene').focus();await p.keyboard.press('Escape');await frames(p);a=await app(p);const b=await p.locator('#scene').boundingBox(),sx=b.x+a.camera.x+x*a.camera.zoom,sy=b.y+a.camera.y+y*a.camera.zoom;
  await p.mouse.move(sx,sy);await p.mouse.down();await p.mouse.move(sx+18,sy+12,{steps:3});await p.mouse.up();await frames(p);assert.equal((await app(p)).state.selectedLocality,null);assert.equal((await app(p)).state.selected,null);
  records.push({id,counts:{characters:a.locality?.characters.length||a.fixture.characters.filter(c=>c.zoneId===id).length},selection:'edificio, retrato prioritario, lista de ocupantes, selector HTML y drag sin selección'});
 }
 await p.locator('#reset-view').click();await frames(p);await pick({x:520,y:600});assert.equal((await app(p)).state.selectedLocality,null);
 await p.locator('#demo-controls').evaluate(el=>el.open=true);await p.locator('#locality-select').focus();await p.keyboard.press('Home');await p.keyboard.press('ArrowDown');await frames(p);assert.equal((await app(p)).state.selectedLocality,'escuela');
 await p.locator('#demo-controls').evaluate(el=>el.open=false);await p.locator('#panel-content').evaluate(el=>el.scrollTop=0);
 await p.selectOption('#locality','hospital');await frames(p);await p.screenshot({path:resolve(output,`${viewport.width}-localidad-hospital.png`)});
 // Recuperar el expediente original para las regresiones restantes.
 await p.locator('#locality-survivors button').first().click();await frames(p);await p.locator('#panel-content').evaluate(el=>el.scrollTop=0);
 return records;
}
export async function assertReadableName(page){
 const result=await page.locator('#character-name').evaluate(el=>{
  const text=el.firstChild;const words=[...text.textContent.matchAll(/\S+/g)].map(m=>{const r=document.createRange();r.setStart(text,m.index);r.setEnd(text,m.index+m[0].length);return {word:m[0],fragments:[...r.getClientRects()].filter(r=>r.width>0).length};});return {text:el.textContent,words,overflow:el.scrollWidth>el.clientWidth+1};
 });
 assert.ok(!result.overflow&&result.words.every(w=>w.fragments===1),JSON.stringify(result));return result;
}
