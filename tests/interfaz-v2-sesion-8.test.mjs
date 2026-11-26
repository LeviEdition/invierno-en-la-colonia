// Interfaz v2, sesión 8 (informe 127): «objetos a carbón» y D12 en 3D.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,statSync} from 'node:fs';
import {d12Orientation,restQuaternion,faceTowardCamera,rotateVector,spinPath,bounceLift,seededRandom} from '../app/mapa/movimiento/d12-orientation.mjs';
import {D12_FACES} from '../app/mapa/movimiento/exposure-die-geometry.mjs';
import {d12Seed} from '../app/mapa/movimiento/exposure-die-view.mjs';
import {objectDecor,burntMate,tallyGroups,texturePixels,MATERIALS,contrast} from '../app/mapa/experiencia/carbon.mjs';
import {carbonFilter,MAP_COLOR_FILTER} from '../app/mapa/render/cold-filter.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const close=(a,b)=>a.every((x,i)=>Math.abs(x-b[i])<1e-9);

test('D12 3D · termina en la cara del motor para cada símbolo, derecha y mirando a la cámara',()=>{
 for(let face=1;face<=12;face++){
  for(const seed of [1,7,12345,d12Seed(face,3)]){
   const {quaternion,lift}=d12Orientation(face,{progress:1,seed});
   assert.equal(faceTowardCamera(quaternion),face,'cara '+face);assert.equal(lift,0,'apoyado');
   const f=D12_FACES[face-1];assert.ok(Math.abs(rotateVector(quaternion,f.normal)[2]-1)<1e-9);assert.ok(Math.abs(rotateVector(quaternion,f.up)[1]-1)<1e-9,'símbolo derecho');
  }
 }
});

test('D12 3D · mismo resultado con o sin animación; movimiento reducido aparece quieto',()=>{
 for(let face=1;face<=12;face++){
  const rest=restQuaternion(face);
  assert.ok(close(d12Orientation(face,{progress:1,seed:99}).quaternion,rest),'final animado = reposo');
  assert.ok(close(d12Orientation(face,{progress:.3,reduced:true,seed:99}).quaternion,rest),'reducido: quieto desde el principio');
  assert.equal(d12Orientation(face,{progress:.3,reduced:true}).lift,0);
 }
 const mid=d12Orientation(4,{progress:.4,seed:5});assert.ok(!close(mid.quaternion,restQuaternion(4)),'a mitad de giro no está en reposo');
 assert.ok(mid.lift>0,'rebota');assert.equal(bounceLift(0),0);assert.equal(bounceLift(1),0);
});

test('D12 3D · el giro sale de un PRNG con semilla, nunca de Math.random ni del motor',()=>{
 const random=Math.random;Math.random=()=>{throw Error('Math.random');};
 try{
  assert.deepEqual(spinPath(42),spinPath(42),'misma semilla, mismo camino');
  assert.notDeepEqual(spinPath(42),spinPath(43));
  assert.ok(close(d12Orientation(7,{progress:.5,seed:42}).quaternion,d12Orientation(7,{progress:.5,seed:42}).quaternion));
  const r=seededRandom(1);assert.ok(r()>=0&&r()<1);
 }finally{Math.random=random;}
 const view=read('app/mapa/movimiento/exposure-die-view.mjs'),chunk=read('app/mapa/movimiento/d12-3d.mjs');
 for(const s of [view,chunk,read('app/mapa/movimiento/d12-orientation.mjs')])assert.doesNotMatch(s,/Math\.random\(/);
 assert.match(view,/El resultado viene del motor/);
});

test('D12 3D · chunk aparte, respaldo sin WebGL y no dibuja quieto',()=>{
 const view=read('app/mapa/movimiento/exposure-die-view.mjs'),chunk=read('app/mapa/movimiento/d12-3d.mjs'),css=read('app/mapa/movimiento/exposure-die.css'),build=read('scripts/build-mapa.mjs');
 assert.match(view,/import\(\/\* chunk \*\/new URL\('\.\/d12-3d\.mjs',import\.meta\.url\)\.href\)/,'import dinámico por URL: el bundle principal no trae Three.js');
 assert.doesNotMatch(view,/from 'three'/);assert.match(chunk,/from 'three';/);
 assert.match(view,/if\(!m\.webglAvailable\(canvas\)\)\{el\.dataset\.d12='2d'/,'sin WebGL queda el D12 plano');
 assert.match(view,/\.catch\(\(\)=>null\)/,'si el chunk no llega, también');
 assert.match(css,/\.exposure-d12\[data-d12="3d"\] \.d12-solid\{display:none\}/,'el plano solo se oculta cuando el 3D está listo');
 assert.match(chunk,/if\(k===last\)return false;/,'quieto, no vuelve a dibujar');
 assert.match(build,/if\(mapInputs\.some\(p=>p\.includes\('node_modules\/three'\)\)\)throw Error\('Three\.js va solo en el chunk del D12'\)/);
});

test('Carbón · manchas, hollín, giro y quemadura iguales entre recargas',()=>{
 for(const name of ['chapa','hoja','carton','carpeta','tablon','nota'])assert.deepEqual(objectDecor(name),objectDecor(name));
 assert.notDeepEqual(objectDecor('hoja'),objectDecor('carton'));
 for(const name of ['hoja','carton']){const d=objectDecor(name);assert.ok(Math.abs(d.tilt)<=1.2,'apenas torcido');assert.ok(d.soot>=.45&&d.soot<=.75);}
 assert.equal(burntMate(['h2','h0','h1']),burntMate(['h0','h1','h2']),'la misma polaroid, sin importar el orden');
 assert.deepEqual(texturePixels('lona'),texturePixels('lona'));assert.deepEqual(texturePixels('grano'),texturePixels('grano'));
 assert.doesNotMatch(read('app/mapa/experiencia/carbon.mjs'),/Math\.random\(/);
});

test('Carbón · rayas de conteo de residuos en grupos de cinco',()=>{
 assert.deepEqual(tallyGroups(0),[]);assert.deepEqual(tallyGroups(4),[4]);assert.deepEqual(tallyGroups(5),[5]);assert.deepEqual(tallyGroups(12),[5,5,2]);assert.deepEqual(tallyGroups(-3),[]);
});

test('Carbón · contraste AA del texto sobre cada material',()=>{
 for(const m of MATERIALS){const c=contrast(m.bg,m.text);assert.ok(c>=(m.large?3:4.5),m.material+': '+c.toFixed(2));}
});

test('Carbón · mapa más oscuro regulable desde CSS, sin tocar fichas ni Lámpara',()=>{
 const f=carbonFilter(MAP_COLOR_FILTER,{saturacion:.72,brillo:.8});
 assert.ok(Math.abs(f.saturate-MAP_COLOR_FILTER.saturate*.72)<1e-9);assert.ok(Math.abs(f.brightness-MAP_COLOR_FILTER.brightness*.8)<1e-9);
 assert.deepEqual(carbonFilter(MAP_COLOR_FILTER,{}),{...MAP_COLOR_FILTER},'sin variables, como antes');
 assert.equal(carbonFilter(null),null);
 const css=read('app/mapa/estilos/carbon.css');
 assert.match(css,/--mapa-saturacion:[\d.]+;--mapa-brillo:[\d.]+;--mapa-vineta:[\d.]+;--mapa-grano:[\d.]+;/);
 assert.match(css,/--sombra-dura:0 6px 12px -4px #000b/,'la sombra dura pasa a blanda');
 assert.doesNotMatch(css,/3px 3px 0 #/,'ninguna sombra dura desplazada');
});

test('Carbón · fuentes autoalojadas con licencia y los mismos ids de siempre',()=>{
 const fonts=read('app/mapa/estilos/fuentes.css');
 for(const [dir,family,license] of [['caveat','Caveat','OFL.txt'],['stardos-stencil','Stardos Stencil','OFL.txt'],['special-elite','Special Elite','LICENSE-Apache-2.0.txt'],['permanent-marker','Permanent Marker','LICENSE-Apache-2.0.txt']]){
  assert.match(fonts,new RegExp("font-family:'"+family+"'"));assert.ok(statSync(new URL('../assets/fuentes/'+dir+'/'+license,import.meta.url)).size>500);
 }
 assert.doesNotMatch(fonts,/fonts\.googleapis|https?:\/\//,'nada de servidores externos');
 const html=read('app/mapa/index.html');
 for(const id of ['round','turn','morale','food','waste','objective-card','crisis-card','dossier','action-bar','finish-turn','exposure-die','bar-group'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/<span id="waste-tally" class="raya-conteo" aria-hidden="true"><\/span>/);
});
