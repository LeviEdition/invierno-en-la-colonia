// Interfaz v2, sesión 5 (informe 123): paneles plegables, globos de las chapas, zoom que cubre,
// enfoque más cercano, luces más notorias, contornos y tipografías.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,statSync,readdirSync} from 'node:fs';
import {constrainCamera,fitMapCamera,focusLocality,resizeMapCamera,coverZoom,resolutionMaxZoom,outlineBox,FOCUS} from '../app/mapa/escena/camera.mjs';
import {zoomCameraAt} from '../app/mapa/render/camera.mjs';
import {FOLD_KEYS,FOLD_STORAGE,foldStorage,loadFolds,saveFolds,toggleAll,foldLabel,createCrisisWatcher,isFoldShortcut} from '../app/mapa/experiencia/folds.mjs';
import {statTip,tipPosition,STAT_KEYS} from '../app/mapa/experiencia/stat-tips.mjs';
import {statistics} from '../app/mapa/juego/information.mjs';
import {FLICKER} from '../app/mapa/experiencia/night-lights.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8'),json=p=>JSON.parse(read(p));
const geometry=json('app/mapa/escena/scene.json'),scene={...geometry,bounds:{...geometry.bounds,sourceWidth:3342,sourceHeight:1882,maxZoom:geometry.maxZoom}},b=scene.bounds;
const covers=(c,v)=>c.x<=1e-9&&c.y<=1e-9&&c.x+b.width*c.zoom>=v.width-1e-9&&c.y+b.height*c.zoom>=v.height-1e-9;

test('Sesión 5 · el zoom mínimo cubre el área: nunca franjas, ni al alejar ni al redimensionar',()=>{
 for(const v of [{width:1365,height:768},{width:852,height:393}]){
  const fit=fitMapCamera(b,v);assert.equal(fit.minZoom,coverZoom(b,v));assert.ok(covers(fit,v),'vista general');
  const far=constrainCamera({...fit,zoom:.01,x:5000,y:-5000},b,v);assert.equal(far.zoom,fit.minZoom);assert.ok(covers(far,v),'alejar al máximo');
  const wide={width:v.width+300,height:v.height},resized=resizeMapCamera(fit,null,b,wide);assert.ok(covers(resized,wide),'redimensionar');
  for(const pan of [[9999,9999],[-9999,-9999]]){const c=constrainCamera({...fit,zoom:1.2,x:pan[0],y:pan[1]},b,v);assert.ok(covers(c,v),'el desplazamiento no deja ver fuera del mapa');}
 }
 assert.equal(fitMapCamera(b,{width:1365,height:768}).zoom.toFixed(3),'0.817');assert.equal(fitMapCamera(b,{width:852,height:393}).zoom.toFixed(3),'0.510');
});

test('Sesión 5 · enfoque: la localidad ocupa ~70 % del área libre, con tope por resolución (2)',()=>{
 assert.equal(resolutionMaxZoom(b),2,'3342 px de textura para 1671 de mundo: un píxel por píxel CSS en DPR 1');assert.equal(FOCUS.share,.7);
 const v={width:1365,height:768},inset={top:56,left:256,right:352,bottom:84},W=v.width-inset.left-inset.right,H=v.height-inset.top-inset.bottom;
 for(const z of scene.zones){
  const c=focusLocality(scene,z.id,{...v,inset}),o=outlineBox(z),share=Math.max(o.width*c.zoom/W,o.height*c.zoom/H);
  assert.ok(c.zoom<=2+1e-9,z.id);
  // ~70 %, salvo que lo limite el tope (2) o el encuadre completo (accesos y fichas dentro).
  assert.ok(share>=.69||Math.abs(c.zoom-2)<1e-9,z.id+' ocupa '+share.toFixed(2));
  assert.ok(c.zoom>=Math.min(1.5,c.zoom)-1e-9);
 }
 // El zoom manual conserva su tope de 1,5 (scene.json maxZoom).
 const fit=fitMapCamera(b,v);assert.equal(constrainCamera(zoomCameraAt(fit,1e6,{x:600,y:400}),b,v).zoom,1.5);
 // Desde un enfoque a 2, el desplazamiento conserva el zoom; al alejarse por debajo de 1,5 el tope vuelve a 1,5.
 const close=focusLocality(scene,'biblioteca',{...v,inset});assert.equal(close.zoom,2);
 const panned=constrainCamera({...close,x:close.x-40},b,v);assert.equal(panned.zoom,2,'no salta al desplazarse');
 const out=constrainCamera({...panned,zoom:1.2},b,v),back=constrainCamera(zoomCameraAt(out,1e6,{x:600,y:400}),b,v);assert.equal(back.zoom,1.5,'después, el zoom manual vuelve a su tope');
});

test('Sesión 5 · plegar actualiza las franjas de la cámara y nunca toca el juego',()=>{
 const v={width:1365,height:768},open={top:56,left:256,right:352,bottom:84},folded={top:56,left:0,right:0,bottom:66};
 const before=focusLocality(scene,'supermercado',{...v,inset:open}),after=focusLocality(scene,'supermercado',{...v,inset:folded});
 assert.ok(after.zoom>before.zoom,'con los paneles plegados la localidad se ve más grande');
 const view=read('app/mapa/map-view.mjs'),start=view.indexOf(' function foldTarget('),end=view.indexOf(' function barDetail(');const code=view.slice(start,end);
 assert.match(code,/function refitCamera\(\)\{[^\n]*focusLocality\(scene,loc\.visualId,\{\.\.\.viewport,inset:focusInset\(\),slack:panelSlack\(\)\}\)/,'recalcula inset y slack');
 assert.match(code,/if\(refit\)refitCamera\(\);/);
 assert.doesNotMatch(code,/movement\.|search\.|action\.|cycle\.|play\.|\.click\(\)|send\(|Math\.random/,'plegar no ejecuta acciones ni tira');
 assert.match(read('app/mapa/estilos/papel.css'),/#action-bar\[data-folded=true\] :is\(\.bar-identity,#bar-actions,#cycle-status,\.mancha\)\{display:none\}/,'la barra plegada conserva retrato, dados y «Terminar turno»');
});

test('Sesión 5 · el estado plegado sobrevive a un localStorage que tira error',()=>{
 const unfolded=Object.fromEntries(FOLD_KEYS.map(k=>[k,false]));
 assert.equal(foldStorage(()=>{throw new Error('SecurityError');}),null);
 const throwing={getItem(){throw new Error('bloqueado');},setItem(){throw new Error('lleno');}};
 assert.deepEqual(loadFolds(throwing),unfolded,'si falla, todo desplegado');assert.equal(saveFolds(throwing,{...unfolded,bar:true}),false);
 assert.deepEqual(loadFolds(null),unfolded);assert.deepEqual(loadFolds({getItem:()=>'{roto'}),unfolded);
 const memory=new Map(),store={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
 assert.equal(saveFolds(store,{...unfolded,crisis:true,bar:true}),true);assert.deepEqual(loadFolds(store),{...unfolded,crisis:true,bar:true});assert.ok(memory.has(FOLD_STORAGE));
 assert.deepEqual(toggleAll(unfolded),Object.fromEntries(FOLD_KEYS.map(k=>[k,true])));assert.deepEqual(toggleAll(toggleAll(unfolded)),unfolded);
 assert.equal(foldLabel('crisis',true),'Desplegar la crisis');assert.equal(foldLabel('bar',false),'Plegar la barra de acción');
});

test('Sesión 5 · crisis nueva se despliega una vez; «H» sin conflictos',()=>{
 const seen=createCrisisWatcher(),p=(round,type)=>({blocked:null,round,crisis:{type,need:2,given:0}});
 assert.equal(seen(p(1,'comida')),false,'la primera no cuenta');assert.equal(seen(p(1,'comida')),false);assert.equal(seen(p(2,'medicina')),true,'crisis nueva');assert.equal(seen(p(2,'medicina')),false,'una sola vez');
 assert.equal(seen({blocked:'handover',crisis:null}),false,'en el pase no hay crisis');
 assert.equal(isFoldShortcut({key:'h',target:{localName:'canvas'}}),true);assert.equal(isFoldShortcut({key:'H',target:{localName:'body'}}),true);
 for(const e of [{key:'h',ctrlKey:true},{key:'h',target:{localName:'input'}},{key:'h',target:{localName:'select'}},{key:'Tab'},{key:'0'},{key:'Escape'}])assert.equal(isFoldShortcut({target:{localName:'body'},...e}),false,JSON.stringify(e));
 assert.equal(isFoldShortcut({key:'h',target:{localName:'body'}},{modalOpen:true}),false,'no con una decisión abierta');
 const handlers=[...read('app/mapa/map-view.mjs').matchAll(/key===['"]([^'"]+)['"]/g)].map(m=>m[1]);assert.ok(!handlers.includes('h')&&!handlers.includes('H'));
});

test('Sesión 5 · globos de las chapas: textos de V9, sin tapar la chapa ni salir de la pantalla',()=>{
 const reference=read('src/presentation/reference-view.mjs');
 for(const [name,,title] of statistics.filter(s=>s[2]&&s[0]!=='Turno'))assert.ok(reference.includes("title:'"+title+"'"),name+': mismo título que la ficha V9');
 assert.deepEqual(statTip('round'),{title:'Rondas restantes',text:statistics.find(s=>s[0]==='Ronda')[1]});
 for(const id of Object.keys(STAT_KEYS))assert.ok(statTip(id)?.title&&statTip(id)?.text,id);
 const html=read('app/mapa/index.html');for(const id of Object.keys(STAT_KEYS))assert.ok(html.includes(`<dd id="${id}">`),id);
 const vp={width:1365,height:768},chip={left:500,top:8,right:560,bottom:40,width:60,height:32},tip={width:240,height:70};
 const p=tipPosition(chip,tip,vp);assert.ok(p.top>=chip.bottom,'debajo, sin tapar la chapa');
 const edge=tipPosition({...chip,left:1340,right:1360},tip,vp);assert.ok(edge.left+tip.width<=vp.width-8,'no sale por la derecha');
 const low=tipPosition({...chip,top:720,bottom:750},tip,vp);assert.ok(low.top+tip.height<=720,'si no entra abajo, va arriba');
 const view=read('app/mapa/experiencia/stat-tips.mjs');assert.match(view,/'focus'/);assert.match(view,/pointerType!=='touch'/);assert.match(view,/LONG_PRESS_MS=500/);
});

test('Sesión 5 · luces más notorias, con los mismos límites',()=>{
 assert.deepEqual([FLICKER.low,FLICKER.high,FLICKER.flashDelta,FLICKER.day,FLICKER.maxFlashesPerSecond,FLICKER.minMs,FLICKER.maxMs],[.3,1,.3,.5,3,80,450]);
 const look=read('app/mapa/render/phaser/night-view.mjs');assert.match(look,/glowAlpha:\.38,glowSize:3\.2\}\)/);assert.match(look,/export const FLICKER_FPS=24;/);
 assert.equal(json('app/mapa/escena/luces.json').lights.length<=25,true,'siguen siendo pocas');
});

test('Sesión 5 · contornos corregidos: escuela sin el aro, biblioteca sin la camioneta, colonia al cerco',()=>{
 const zone=id=>scene.zones.find(z=>z.id===id),inside=(poly,[x,y])=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(yi>y!==yj>y&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;};
 assert.ok(Math.max(...zone('escuela').outlinePolygon.map(p=>p[0]))<=540,'el aro de básquet (x≈545) queda afuera');
 assert.equal(inside(zone('biblioteca').outlinePolygon,[1315,232]),false,'la camioneta queda afuera');assert.equal(zone('biblioteca').outlinePolygon.length,25);
 assert.ok(Math.max(...zone('colonia').outlinePolygon.filter(p=>p[1]<360).map(p=>p[0]))<=1077,'esquina superior derecha pegada al cerco');
 // Los contornos no se superponen y cada uno sigue conteniendo el centro de su localidad.
 const boxes=scene.zones.map(z=>({id:z.id,...outlineBox(z)}));
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],c=boxes[j];assert.ok(a.x+a.width<=c.x||c.x+c.width<=a.x||a.y+a.height<=c.y||c.y+c.height<=a.y,a.id+' y '+c.id);}
 for(const z of scene.zones)assert.ok(inside(z.outlinePolygon,[z.buildingBounds.x+z.buildingBounds.width/2,z.buildingBounds.y+z.buildingBounds.height/2]),z.id);
 assert.ok(read('scripts/contornos-localidades.mjs').includes('git show'),'capturas antes y después para el CI');assert.match(read('.github/workflows/mapa.yml'),/node scripts\/contornos-localidades\.mjs \/tmp\/horizontal-contornos 26fe4ec/);
});

test('Sesión 5 · tipografías autoalojadas: OFL 1.1, latino y latino extendido, sin servidores externos',()=>{
 const css=read('app/mapa/estilos/fuentes.css'),faces=css.match(/@font-face\{[^}]*\}/g);
 assert.equal(faces.length,10,'Bitter 600 y 700; Alegreya Sans 400, 500 y 700; dos subconjuntos');
 for(const f of faces){assert.match(f,/font-display:swap/);assert.match(f,/src:url\(\.\.\/\.\.\/\.\.\/assets\/fuentes\//);assert.match(f,/format\('woff2'\)/);}
 assert.doesNotMatch(css+read('app/mapa/index.html')+read('app/mapa/estilos/papel.css'),/fonts\.googleapis|fonts\.gstatic|https?:\/\/[^)"']*\.woff2?/);
 // El subconjunto latino cubre todo el español: ñ, tildes, ¿¡ y «».
 assert.ok(faces.filter(f=>/-latin-[0-9]/.test(f)).every(f=>f.includes('U+0000-00FF')));for(const ch of 'ñáéíóúü¿¡«»Ñ')assert.ok(ch.codePointAt(0)<=0xFF,ch);
 let total=0;for(const family of ['bitter','alegreya-sans']){const dir='assets/fuentes/'+family;assert.match(read(dir+'/OFL.txt'),/SIL Open Font License, Version 1\.1/);for(const f of readdirSync(new URL('../'+dir,import.meta.url)).filter(f=>f.endsWith('.woff2')))total+=statSync(new URL('../'+dir+'/'+f,import.meta.url)).size;}
 assert.ok(total<240*1024,'peso total '+total);assert.match(read('assets/fuentes/LEEME.md'),/5\.3\.0/);
 const papel=read('app/mapa/estilos/papel.css');assert.match(papel,/--fuente-texto:'Alegreya Sans',/);assert.match(papel,/--fuente-titulo:'Bitter',/);
 assert.match(read('scripts/serve-mapa.mjs'),/'\/assets\/fuentes\/'/);
});
