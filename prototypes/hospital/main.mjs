import {scene} from './scene.mjs';
import {fitCamera,panCamera,zoomCameraAt,pinchCamera,screenToWorld} from './camera.mjs';
import {loadImages,makeHospitalHitTest,renderScene} from './renderer.mjs';
import {bindControls} from './controls.mjs';

const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d');
const loading=document.querySelector('#loading');
const controls=[...document.querySelectorAll('button,input')];
controls.forEach(control=>control.disabled=true);
let viewport,camera,initialZoom,frame=0,position='delante',showHidden=false,selected=false;

try{
 const images=await loadImages(),hitHospital=makeHospitalHitTest(images.hospital);
 function render(){
  frame=0;if(!camera)return;
  renderScene(ctx,{images,camera,viewport,pose:scene.positions[position],showHidden,selected});
  document.querySelector('#zoom-value').value=`${Math.round(camera.zoom/initialZoom*100)} %`;
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(render);};
 const changeCamera=next=>{camera=next;schedule();};
 const center=()=>({x:viewport.width/2,y:viewport.height/2});
 const select=value=>{
  selected=value;document.querySelector('#select-hospital').setAttribute('aria-pressed',String(selected));
  document.querySelector('#selection-status').textContent=selected?'Hospital seleccionado.':'También podés tocar el edificio.';schedule();
 };
 const reset=()=>{changeCamera(fitCamera(scene.bounds,viewport.width,viewport.height));};
 function resize(){
  const next={width:canvas.clientWidth,height:canvas.clientHeight,dpr:Math.min(devicePixelRatio||1,3)};
  const fitted=fitCamera(scene.bounds,next.width,next.height);
  if(camera){
   const oldCenter=screenToWorld(camera,center());
   const zoom=Math.max(fitted.minZoom,Math.min(fitted.maxZoom,fitted.zoom*camera.zoom/initialZoom));
   camera={...fitted,zoom,x:next.width/2-oldCenter.x*zoom,y:next.height/2-oldCenter.y*zoom};
  }else camera=fitted;
  viewport=next;initialZoom=fitted.zoom;
  canvas.width=Math.round(next.width*next.dpr);canvas.height=Math.round(next.height*next.dpr);schedule();
 }
 new ResizeObserver(resize).observe(canvas);
 bindControls({canvas,
  onPan:(x,y)=>changeCamera(panCamera(camera,x,y)),
  onZoom:(factor,anchor=center())=>changeCamera(zoomCameraAt(camera,factor,anchor)),
  onPinch:(previous,next,factor)=>changeCamera(pinchCamera(camera,previous,next,factor)),
  onPick:point=>select(hitHospital(screenToWorld(camera,point))?!selected:false),
  onReset:reset,onSelect:()=>select(!selected),onClear:()=>select(false)
 });
 for(const button of document.querySelectorAll('[data-position]'))button.addEventListener('click',()=>{
  position=button.dataset.position;
  for(const sibling of document.querySelectorAll('[data-position]'))sibling.setAttribute('aria-pressed',String(sibling===button));
  document.querySelector('#position-description').textContent=scene.positions[position].description;schedule();
 });
 document.querySelector('#position-description').textContent=scene.positions[position].description;
 document.querySelector('#show-hidden').addEventListener('change',event=>{showHidden=event.target.checked;schedule();});
 document.querySelector('#zoom-in').addEventListener('click',()=>changeCamera(zoomCameraAt(camera,1.25,center())));
 document.querySelector('#zoom-out').addEventListener('click',()=>changeCamera(zoomCameraAt(camera,1/1.25,center())));
 document.querySelector('#reset-view').addEventListener('click',reset);
 document.querySelector('#select-hospital').addEventListener('click',()=>select(!selected));
 const pans={left:[48,0],right:[-48,0],up:[0,48],down:[0,-48]};
 for(const button of document.querySelectorAll('[data-pan]'))button.addEventListener('click',()=>changeCamera(panCamera(camera,...pans[button.dataset.pan])));
 resize();loading.hidden=true;controls.forEach(control=>control.disabled=false);
}catch(error){
 loading.setAttribute('role','alert');loading.textContent='No se pudieron cargar las imágenes. Serví la raíz del repositorio y recargá la página.';
 console.error(error);
}
