import test from 'node:test';import assert from 'node:assert/strict';
import {createMapNotice} from '../app/mapa/experiencia/map-notice.mjs';
import {eventText} from '../app/mapa/juego/information.mjs';
import {actionNotice} from '../app/mapa/acciones/action-presentation.mjs';
import {fitMapCamera,constrainCamera,resizeMapCamera,focusLocality} from '../app/mapa/escena/camera.mjs';
import {zoomCameraAt,pinchCamera} from '../app/mapa/render/camera.mjs';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url))),geometry=read('app/mapa/escena/scene.json'),manifest=read('assets/mapa-horizontal/manifest.json'),source=manifest.files.find(r=>r.file===manifest.activeMap),bounds={...geometry.bounds,sourceWidth:source.dimensions[0],sourceHeight:source.dimensions[1]},scene={...geometry,bounds};
test('Aviso: caduca una vez y no reaparece al consultar, reconstruir o recuperar el mismo resultado',()=>{
 const renders=[],timers=new Map();let serial=0;const n=createMapNotice({render:x=>renders.push(x),setTimer:fn=>{timers.set(++serial,fn);return serial;},cancelTimer:id=>timers.delete(id)}),a={scope:'s/1/1/human',id:'attack-1',text:'Leo eliminó 1 zombi en el Hospital y sufrió congelación.'};
 n.show(a);assert.equal(timers.size,1);const timer=[...timers.values()][0];n.show({...a});assert.equal(timers.size,1);assert.equal(renders.filter(Boolean).length,1);timer();assert.equal(n.inspect(),null);n.show({...a});assert.equal(n.inspect(),null);assert.equal(renders.filter(Boolean).length,1);n.clear();n.show(a);assert.equal(n.inspect(),null);n.show({...a,scope:'s/2/1/human'});assert.equal(n.inspect().scope,'s/2/1/human');n.clear();assert.equal(n.inspect(),null);
});
test('Aviso: nombre, localidad, víctimas y daño proceden de la operación aceptada',()=>{
 const op={kind:'attack',name:'Leo',origin:2,resolution:{killed:1,exposure:{effect:'frost'},actorAfter:{frost:1}}},locations=[{engineIndex:2,name:'Hospital'}];
 assert.equal(eventText({type:'attack',name:'Leo',count:1,location:2},locations),'Leo eliminó 1 zombi en Hospital.');assert.match(eventText({type:'exposure',name:'Leo',reason:'ataque ',value:2}),/dado 2 \(congelación\)/);
 assert.equal(actionNotice(op,locations),'Leo eliminó 1 zombi en el Hospital y sufrió congelación.');
 for(const effect of ['none','avoided','wound','bite']){const text=actionNotice({...op,resolution:{...op.resolution,killed:2,exposure:{effect}}},locations);assert.match(text,/Leo eliminó 2 zombis en el Hospital/);assert.equal(text.includes('congelación'),false);}
 assert.match(actionNotice({...op,resolution:{...op.resolution,actorAfter:{dead:true}}},locations),/, pero murió/);
});
test('Cámara: máximo se deriva de dimensiones originales, con mundo reescalado',()=>{
 const b={width:2000,height:1000,sourceWidth:1000,sourceHeight:500},c=fitMapCamera(b,{width:4000,height:2000});assert.equal(c.zoom,.5);assert.equal(c.maxZoom,.5);assert.equal(c.minZoom,.5);assert.equal(c.x,1500);assert.equal(c.y,750);
});
for(const [width,height]of [[1025,618],[1365,618],[852,294],[393,600],[2560,1440]])test('Cámara: todas las entradas y enfoque comparten el límite nativo '+width+'×'+height,()=>{
 const v={width,height},fit=fitMapCamera(bounds,v),anchor={x:width/2,y:height/2},max=Math.min(source.dimensions[0]/bounds.width,source.dimensions[1]/bounds.height);
 assert.ok(fit.zoom<=max);for(const z of scene.zones)assert.ok(focusLocality(scene,z.id,v).zoom<=max,z.id);
 for(const next of [zoomCameraAt(fit,1e6,anchor),pinchCamera(fit,anchor,anchor,1e6),{...fit,zoom:1e6}]){const c=constrainCamera(next,bounds,v);assert.equal(c.zoom,max);assert.equal(c.maxZoom,max);assert.equal(Math.round(c.zoom/c.maxZoom*100),100);assert.ok(bounds.width*c.zoom/source.dimensions[0]<=1);}
 if(width>bounds.width&&height>bounds.height){assert.equal(fit.zoom,max);assert.equal(fit.x,(width-bounds.width*max)/2);assert.equal(fit.y,(height-bounds.height*max)/2);}
 const after=resizeMapCamera({...fit,x:fit.x-30},null,bounds,{width:width+200,height});assert.equal(after.zoom,fit.zoom);
});
