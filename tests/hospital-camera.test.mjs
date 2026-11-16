import test from 'node:test';
import assert from 'node:assert/strict';
import {createCamera, worldToScreen, screenToWorld, panCamera, zoomCameraAt, pinchCamera, fitCamera} from '../prototypes/hospital/camera.mjs';

const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
const pointClose=(a,b)=>{close(a.x,b.x);close(a.y,b.y);};

test('Cámara hospital: coordenadas mundo/pantalla conservan el punto con zoom y desplazamiento',()=>{
 const camera=createCamera({x:27,y:-95,zoom:.42});
 for(const point of [{x:0,y:0},{x:1320,y:-278},{x:-50,y:1.7}])
  pointClose(screenToWorld(camera,worldToScreen(camera,point)),point);
});

test('Cámara hospital: arrastrar desplaza por píxeles de pantalla a cualquier zoom, sin mutar el origen',()=>{
 for(const zoom of [.2,1,2.5]){
  const camera=createCamera({x:10,y:20,zoom}),point={x:120,y:80};
  const before=worldToScreen(camera,point),after=worldToScreen(panCamera(camera,37,-19),point);
  pointClose(after,{x:before.x+37,y:before.y-19});
  assert.equal(camera.x,10);assert.equal(camera.y,20);
 }
});

test('Cámara hospital: la rueda mantiene el mundo bajo el cursor incluso al llegar al límite',()=>{
 const origin=createCamera({x:-240,y:65,zoom:.7,minZoom:.2,maxZoom:2.8});
 const cursor={x:301,y:209},world=screenToWorld(origin,cursor);
 for(const factor of [.0001,.6,1.5,10000]){
  const camera=zoomCameraAt(origin,factor,cursor);
  pointClose(worldToScreen(camera,world),cursor);
  assert.ok(camera.zoom>=.2&&camera.zoom<=2.8);
 }
 assert.equal(origin.zoom,.7);
});

test('Cámara hospital: la pinza conserva su punto del mundo mientras escala y mueve el centro',()=>{
 const camera=createCamera({x:70,y:-25,zoom:.8});
 const previous={x:110,y:240},next={x:140,y:220};
 const world=screenToWorld(camera,previous);
 const result=pinchCamera(camera,previous,next,1.6);
 pointClose(worldToScreen(result,world),next);
 close(result.zoom,1.28);
});

test('Cámara hospital: encuadrar deja toda la escena dentro del margen en escritorio y móvil',()=>{
 const bounds={x:-350,y:-500,width:1700,height:1100};
 for(const [width,height] of [[320,400],[393,570],[1365,620]]){
  const camera=fitCamera(bounds,width,height,24);
  const top=worldToScreen(camera,{x:bounds.x,y:bounds.y});
  const bottom=worldToScreen(camera,{x:bounds.x+bounds.width,y:bounds.y+bounds.height});
  assert.ok(top.x>=24-1e-8&&top.y>=24-1e-8);
  assert.ok(bottom.x<=width-24+1e-8&&bottom.y<=height-24+1e-8);
  pointClose(worldToScreen(camera,{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2}),{x:width/2,y:height/2});
 }
});

test('Cámara hospital: restablecer recupera el encuadre original después de arrastrar y ampliar',()=>{
 const bounds={x:-200,y:-300,width:1200,height:850};
 const original=fitCamera(bounds,393,500),modified=panCamera(zoomCameraAt(original,2,{x:60,y:90}),80,120);
 assert.notDeepEqual(modified,original);
 assert.deepEqual(fitCamera(bounds,393,500),original);
});

test('Cámara hospital: un viewport pequeño sigue teniendo una transformación finita y límites coherentes',()=>{
 const camera=fitCamera({x:0,y:0,width:1000,height:900},1,1);
 assert.ok(Number.isFinite(camera.x)&&Number.isFinite(camera.y)&&camera.zoom>0);
 assert.ok(camera.minZoom<camera.zoom&&camera.zoom<camera.maxZoom);
});
