import {scene} from '../hospital/scene.mjs';
import {fitCamera,panCamera,zoomCameraAt,pinchCamera,screenToWorld} from '../hospital/camera.mjs';
import {loadImages,makeHospitalHitTest} from '../hospital/renderer.mjs';
import {bindControls} from '../hospital/controls.mjs';
import {createRenderer,webglAvailable} from './renderer.mjs';

let current=null,lastDisposal=null,starts=0,restarts=0,starting=false;
const loading=document.querySelector('#loading'),status=document.querySelector('#renderer-status');
const canvasTemplate=document.querySelector('#scene').cloneNode(false);
const controls=()=>[...document.querySelectorAll('button,input')].filter(el=>el.id!=='restart-scene');
export function inspect(){return {starting,starts,restarts,lastDisposal,state:document.body.dataset.state,app:current?.inspect()||null};}
export async function disposeExperiment(){
 if(!current)return;const app=current;current=null;await app.destroy();lastDisposal={...app.counters,disposed:true};
 document.body.dataset.state='disposed';controls().forEach(el=>el.disabled=true);status.textContent='Escena liberada. Reiniciar vuelve a cargarla.';
}
async function mount(){
 if(starting)return;starting=true;starts++;document.body.dataset.state='loading';loading.hidden=false;loading.setAttribute('role','status');loading.textContent='Cargando imágenes y WebGL…';controls().forEach(el=>el.disabled=true);
 document.querySelector('#restart-scene').disabled=true;
 let canvas,renderer,observer,unbind,signalController,frame=0;
 try{
  await disposeExperiment();document.body.dataset.state='loading';
  const old=document.querySelector('#scene'),replacement=canvasTemplate.cloneNode(false);
  replacement.id='scene';replacement.tabIndex=0;replacement.style.width='100%';replacement.style.height='100%';
  if(old)old.replaceWith(replacement);else document.querySelector('.viewport').prepend(replacement);canvas=replacement;
  if(!webglAvailable())throw Error('WEBGL_UNAVAILABLE');
  const images=await loadImages(),hit=makeHospitalHitTest(images.hospital);
  renderer=await createRenderer(canvas,images);
  let viewport,camera,initialZoom,position='delante',showHidden=false,selected=false;
  const counters={inputCommands:0,drawRequests:0};
  signalController=new AbortController();const options={signal:signalController.signal};
  function render(){frame=0;counters.drawRequests++;renderer.update({images,camera,viewport,pose:scene.positions[position],showHidden,selected});document.querySelector('#zoom-value').value=`${Math.round(camera.zoom/initialZoom*100)} %`;}
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(render);};
  const change=next=>{camera=next;schedule();};
  const center=()=>({x:viewport.width/2,y:viewport.height/2});
  const select=value=>{selected=value;document.querySelector('#select-hospital').setAttribute('aria-pressed',String(value));document.querySelector('#selection-status').textContent=value?'Hospital seleccionado.':'También podés tocar el edificio.';schedule();};
  const command=fn=>(...args)=>{counters.inputCommands++;return fn(...args);};
  const reset=()=>change(fitCamera(scene.bounds,viewport.width,viewport.height));
  function resize(){
   const next={width:canvas.clientWidth,height:canvas.clientHeight,dpr:Math.min(devicePixelRatio||1,3)},fitted=fitCamera(scene.bounds,next.width,next.height);
   if(camera){const oldCenter=screenToWorld(camera,center()),zoom=Math.max(fitted.minZoom,Math.min(fitted.maxZoom,fitted.zoom*camera.zoom/initialZoom));camera={...fitted,zoom,x:next.width/2-oldCenter.x*zoom,y:next.height/2-oldCenter.y*zoom};}else camera=fitted;
   viewport=next;initialZoom=fitted.zoom;schedule();
  }
  observer=new ResizeObserver(resize);observer.observe(canvas);
  unbind=bindControls({canvas,onPan:command((x,y)=>change(panCamera(camera,x,y))),onZoom:command((factor,anchor=center())=>change(zoomCameraAt(camera,factor,anchor))),onPinch:command((previous,next,factor)=>change(pinchCamera(camera,previous,next,factor))),onPick:command(point=>select(hit(screenToWorld(camera,point))?!selected:false)),onReset:command(reset),onSelect:command(()=>select(!selected)),onClear:command(()=>select(false))});
  const listen=(selector,event,callback)=>{for(const el of document.querySelectorAll(selector))el.addEventListener(event,command(callback),options);};
  listen('[data-position]','click',event=>{position=event.currentTarget.dataset.position;for(const button of document.querySelectorAll('[data-position]'))button.setAttribute('aria-pressed',String(button.dataset.position===position));document.querySelector('#position-description').textContent=scene.positions[position].description;schedule();});
  listen('#show-hidden','change',event=>{showHidden=event.target.checked;schedule();});
  listen('#zoom-in','click',()=>change(zoomCameraAt(camera,1.25,center())));listen('#zoom-out','click',()=>change(zoomCameraAt(camera,.8,center())));
  listen('#reset-view','click',reset);listen('#select-hospital','click',()=>select(!selected));
  const pans={left:[48,0],right:[-48,0],up:[0,48],down:[0,-48]};listen('[data-pan]','click',e=>change(panCamera(camera,...pans[e.currentTarget.dataset.pan])));
  canvas.addEventListener('webglcontextlost',()=>{status.textContent='Contexto WebGL perdido. Reiniciá la escena si no se recupera.';controls().forEach(el=>el.disabled=true);},{...options});
  canvas.addEventListener('webglcontextrestored',()=>{status.textContent='Contexto WebGL recuperado';controls().forEach(el=>el.disabled=false);schedule();},options);
  for(const button of document.querySelectorAll('[data-position]'))button.setAttribute('aria-pressed',String(button.dataset.position==='delante'));
  document.querySelector('#show-hidden').checked=false;document.querySelector('#position-description').textContent=scene.positions.delante.description;select(false);resize();if(frame)cancelAnimationFrame(frame);frame=0;render();
  await renderer.nextFrame();
  current={counters,inspect:()=>({camera:{...camera},viewport:{...viewport},position,selected,showHidden,counters:{...counters},renderer:renderer.inspect()}),worldAt:p=>renderer.worldAt(p),diagnosticFrame:kind=>renderer.diagnosticFrame(kind),diagnosticPixels:()=>renderer.diagnosticPixels(),async destroy(){signalController.abort();observer.disconnect();unbind();if(frame)cancelAnimationFrame(frame);frame=0;await renderer.destroy();}};
  loading.hidden=true;status.textContent='Phaser 4.2.1 · WebGL · misma escena de referencia';document.body.dataset.state='ready';controls().forEach(el=>el.disabled=false);performance.mark('hospital-ready');
 }catch(error){
  signalController?.abort();observer?.disconnect();unbind?.();if(frame)cancelAnimationFrame(frame);await renderer?.destroy();
  loading.setAttribute('role','alert');loading.textContent=error.message==='WEBGL_UNAVAILABLE'?'WebGL no está disponible. Podés abrir la referencia Canvas o reintentar.':'No se pudo cargar la escena. Revisá los recursos y reintentá.';
  status.textContent=error.message==='WEBGL_UNAVAILABLE'?'WebGL requerido; no se usa Canvas deprecado de Phaser.':'Fallo de carga';document.body.dataset.state=error.message==='WEBGL_UNAVAILABLE'?'unsupported':'error';
 }finally{starting=false;document.querySelector('#restart-scene').disabled=false;}
}
export function worldAt(point){return current?.worldAt(point)||null;}
// Sondas de comparación del PoC: no están conectadas a los controles normales.
export async function diagnosticFrame(kind){if(!new URLSearchParams(location.search).has('diagnostics'))throw Error('Requiere modo diagnóstico');await current?.diagnosticFrame(kind);}
export async function diagnosticPixels(){if(!new URLSearchParams(location.search).has('diagnostics'))throw Error('Requiere modo diagnóstico');return current?.diagnosticPixels();}
document.querySelector('#restart-scene').addEventListener('click',()=>{restarts++;void mount();});
window.addEventListener('pagehide',()=>{void disposeExperiment();},{once:true});
void mount();
