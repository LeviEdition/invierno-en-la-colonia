import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {MAP_COLOR_FILTER,LAMPARA,filterMatrix,remapPixel,warmWeight,applyMapFilter} from '../app/mapa/render/cold-filter.mjs';
import {mulberry32,createFlicker,lightLevel,createNightAtmosphere,FLICKER,NIGHT} from '../app/mapa/experiencia/night-lights.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const hue=([r,g,b])=>{const max=Math.max(r,g,b),min=Math.min(r,g,b);return max===r?60*(g-b)/(max-min):max===g?60*(2+(b-r)/(max-min)):60*(4+(r-g)/(max-min));};

test('Sesión 3 · luces cálidas al tono de la Lámpara; grises y fríos no cambian',()=>{
 const m=filterMatrix(MAP_COLOR_FILTER),lamp=hue(LAMPARA);
 for(const window of [[255,170,80],[240,150,60],[250,190,110]]){
  const out=remapPixel(...window,m),before=remapPixel(...window,m,null);
  assert.ok(Math.abs(hue(out)-lamp)<4,'tono Lámpara: '+window);assert.ok(hue(before)<0||hue(before)>330||hue(before)<15,'sin remapeo se volvía rosada: '+window);
  if(warmWeight(...window)===1)assert.ok(out.every((c,i)=>c<=LAMPARA[i]*.6+.5),'al 60 % del brillo de la Lámpara: '+window);
 }
 for(const plain of [[128,128,128],[90,110,160],[30,30,40],[240,240,240],[220,60,50]])assert.deepEqual(remapPixel(...plain,m),remapPixel(...plain,m,null),'no cambia: '+plain);
 assert.equal(warmWeight(128,128,128),0);assert.equal(warmWeight(90,110,160),0);assert.equal(warmWeight(220,60,50),0,'el rojo de la cruz queda fuera');
 // Mismo cálculo en el recorrido de toda la textura.
 const px=new Uint8ClampedArray([255,170,80,255,128,128,128,9]);applyMapFilter(px);assert.deepEqual([...px],[...remapPixel(255,170,80,m).map(Math.round),255,108,108,108,9]);
 // El mismo interruptor apaga todo.
 const raw=new Uint8ClampedArray([255,170,80,255]);applyMapFilter(raw,null);assert.deepEqual([...raw],[255,170,80,255]);
});

test('Sesión 3 · el contorno de selección sigue siendo lo más vivo',async()=>{
 const {NIGHT_LOOK}=await import('../app/mapa/render/phaser/night-view.mjs').catch(()=>({NIGHT_LOOK:null}));
 const look=NIGHT_LOOK||{glowAlpha:Number(read('app/mapa/render/phaser/night-view.mjs').match(/glowAlpha:([\d.]+)/)[1])};assert.ok(look.glowAlpha>0);
 // Ventana remapeada más el resplandor al máximo (base 1, nivel 1) no supera la Lámpara.
 const window=LAMPARA.map(c=>c*MAP_COLOR_FILTER.warmLights.level),peak=window.map((c,i)=>c+LAMPARA[i]*look.glowAlpha);
 assert.ok(peak.every((c,i)=>c<LAMPARA[i]),peak.join(','));
 assert.match(read('app/mapa/render/kit/renderer.mjs'),/lineStyle\(\(model\.highlightWidth\?\?1\.5\)\*line,0xf2c14e,1\)/,'contorno en Lámpara plena');
});

test('Sesión 3 · generador con semilla',()=>{
 const a=mulberry32(42),b=mulberry32(42),c=mulberry32(43),sa=Array.from({length:50},a),sb=Array.from({length:50},b),sc=Array.from({length:50},c);
 assert.deepEqual(sa,sb);assert.notDeepEqual(sa,sc);assert.ok(sa.every(x=>x>=0&&x<1));
 for(const file of ['app/mapa/experiencia/night-lights.mjs','app/mapa/render/phaser/night-view.mjs'])assert.doesNotMatch(read(file).replace(/nunca usa Math\.random/,''),/Math\.random/,file);
 const one=createFlicker(5,{seed:7}),two=createFlicker(5,{seed:7});for(let i=0;i<200;i++)assert.deepEqual(one.step(16.7),two.step(16.7));
});

test('Sesión 3 · parpadeo entre 60 y 100 %, intervalos de 80 a 450 ms, a lo sumo 3 destellos por segundo',()=>{
 const f=createFlicker(25,{seed:3});let changes=Array(25).fill(0),last=f.inspect().map(l=>l.target);
 for(let t=0;t<20000;t+=16.7){const v=f.step(16.7);assert.ok(v.every(x=>x>=FLICKER.low-1e-9&&x<=FLICKER.high+1e-9));const now=f.inspect();now.forEach((l,i)=>{assert.ok(l.flashes<=FLICKER.maxFlashesPerSecond);if(l.target!==last[i])changes[i]++;});last=now.map(l=>l.target);}
 for(const n of changes){const interval=20000/n;assert.ok(interval>=FLICKER.minMs&&interval<=FLICKER.maxMs,'intervalo medio '+interval);}
 const values=f.values();assert.ok(new Set(values.map(v=>v.toFixed(3))).size>20,'luces desincronizadas');
});

test('Sesión 3 · día tenue, noche con parpadeo, movimiento reducido fijo',()=>{
 assert.equal(lightLevel({night:0,flicker:.7,reduced:false}),.35);
 assert.equal(lightLevel({night:1,flicker:.7,reduced:false}),.7);
 assert.equal(lightLevel({night:1,flicker:.7,reduced:true}),.8);
 assert.equal(lightLevel({night:1,flicker:1,reduced:true}),.8);
 const n=createNightAtmosphere();n.begin(0);assert.equal(n.level(5000,true),1,'sin rampa con movimiento reducido');n.end(100);assert.equal(n.level(1300,true),0,'amanece sin animar');
 const view=read('app/mapa/render/phaser/night-view.mjs');assert.match(view,/if\(night>0&&!reduced\(\)\)flicker\.step\(delta\)/,'sin parpadeo con movimiento reducido');
 assert.match(read('app/mapa/experiencia/transitions.mjs'),/document\.body\.dataset\.motion==='reduced'/,'también el ajuste del juego');
});

test('Sesión 3 · atmósfera de noche: cuándo entra, mínimo de 1,2 s, se saltea y adopta',()=>{
 const n=createNightAtmosphere();
 assert.equal(n.level(0),0);n.end(10);assert.equal(n.level(20),0,'sin tiradas no hay noche');assert.equal(n.active(20),false);
 n.begin(1000);assert.equal(n.level(1000),0);assert.equal(n.level(1600),.5);assert.equal(n.level(2200),1);assert.equal(n.active(1000),true);
 n.end(1300);assert.equal(n.inspect().end,1000+NIGHT.minMs,'dura al menos 1,2 s');assert.equal(n.level(2200),1);
 assert.equal(n.level(2700),.5,'amanece en 1 s');assert.equal(n.level(3200),0);assert.equal(n.active(3300),false);
 const r=createNightAtmosphere();r.begin(0);r.end(5000);assert.equal(r.level(5500),.5);r.begin(5500);assert.equal(r.level(5500),.5,'otra tirada durante el amanecer sigue desde donde está');assert.equal(r.level(6100),1);
 const a=createNightAtmosphere();a.begin(0);assert.equal(a.level(2000),1);a.adopt();assert.equal(a.level(2001),0,'una vista recuperada adopta el día sin animar');assert.equal(a.active(2001),false);
 const main=read('app/mapa/main.mjs');
 assert.match(main,/viewer\.night\?\.\(frame\.kind==='exposure'\?'begin':'end'\);/,'empieza con la primera tirada nocturna presentada');
 assert.match(main,/stop\(\)\{viewer\?\.stopPresentation\(\);movement\.interruptPresentation\(\);viewer\?\.night\?\.\('adopt'\);\}/,'pase o recuperación: adopta sin animar');
 assert.match(main,/onIdle:\(\)=>\{viewer\?\.night\?\.\('end'\);/);
});

test('Sesión 3 · luces detectadas: reproducibles, en el mundo y como mucho 25',async()=>{
 const {buildLights,CRITERIA}=await import('../scripts/detectar-luces.mjs');
 const saved=JSON.parse(read('app/mapa/escena/luces.json')),fresh=buildLights();
 assert.deepEqual(saved,JSON.parse(JSON.stringify(fresh)),'luces.json coincide con el detector');
 const scene=JSON.parse(read('app/mapa/escena/scene.json'));
 assert.ok(saved.lights.length>0&&saved.lights.length<=CRITERIA.max);assert.deepEqual(saved.size,{width:scene.bounds.width,height:scene.bounds.height},'textura 1× = coordenadas del mundo');
 for(const l of saved.lights){assert.ok(l.x>=0&&l.x<=scene.bounds.width&&l.y>=0&&l.y<=scene.bounds.height);assert.ok(l.radius>0&&l.radius<20,'resplandores chicos');assert.ok(l.base>0&&l.base<=1);}
 const view=read('app/mapa/map-view.mjs');assert.match(view,/import luces from '\.\/escena\/luces\.json';/);
 assert.doesNotMatch(read('app/mapa/render/phaser/night-view.mjs'),/mapa-2x|textures\.get\('h33-map'\)/,'no duplica la textura del mapa');
});
