// Gestos de cámara únicamente: no controla supervivientes ni movimiento del personaje.
export function bindControls({canvas,onPan,onZoom,onPinch,onPick,onReset,onSelect,onClear}){
 const pointers=new Map();const abort=new AbortController();const options={signal:abort.signal};
 let single=null,multiUsed=false;
 const point=event=>{const rect=canvas.getBoundingClientRect();return {x:event.clientX-rect.left,y:event.clientY-rect.top};};
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const gesture=()=>{
  const [a,b]=pointers.values();return {center:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance:distance(a,b)};
 };
 const clear=()=>{pointers.clear();single=null;multiUsed=false;canvas.classList.remove('dragging');};
 canvas.addEventListener('pointerdown',event=>{
  if(event.button!==0||pointers.size>=2)return;
  canvas.focus({preventScroll:true});canvas.setPointerCapture(event.pointerId);
  const p=point(event);pointers.set(event.pointerId,p);
  if(pointers.size===1){single={start:p,dragged:false};multiUsed=false;}
  else{single=null;multiUsed=true;}
 },options);
 canvas.addEventListener('pointermove',event=>{
  if(!pointers.has(event.pointerId))return;
  const before=pointers.get(event.pointerId),p=point(event);
  if(pointers.size===2){
   const previous=gesture();pointers.set(event.pointerId,p);const next=gesture();
   if(previous.distance>1&&next.distance>1)onPinch(previous.center,next.center,next.distance/previous.distance);
  }else{
   pointers.set(event.pointerId,p);
   if(!single)return;
   const wasDragged=single.dragged;
   if(distance(single.start,p)>=6)single.dragged=true;
   if(single.dragged){
    const from=wasDragged?before:single.start;onPan(p.x-from.x,p.y-from.y);
    canvas.classList.add('dragging');
   }
  }
 },options);
 function release(event,cancelled){
  if(!pointers.has(event.pointerId))return;
  if(pointers.size===1&&!cancelled&&single&&!single.dragged&&!multiUsed&&distance(single.start,point(event))<6)onPick(point(event));
  pointers.delete(event.pointerId);
  if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
  canvas.classList.remove('dragging');
  if(pointers.size===1)single={start:[...pointers.values()][0],dragged:true};
  else if(!pointers.size){single=null;multiUsed=false;}
 }
 canvas.addEventListener('pointerup',e=>release(e,false),options);
 canvas.addEventListener('pointercancel',e=>release(e,true),options);
 canvas.addEventListener('lostpointercapture',e=>release(e,true),options);
 canvas.addEventListener('wheel',event=>{
  event.preventDefault();const unit=event.deltaMode===1?16:event.deltaMode===2?canvas.clientHeight:1;
  onZoom(Math.exp(Math.max(-2,Math.min(2,-event.deltaY*unit*.0015))),point(event));
 },{...options,passive:false});
 canvas.addEventListener('keydown',event=>{
  const pan={ArrowLeft:[48,0],ArrowRight:[-48,0],ArrowUp:[0,48],ArrowDown:[0,-48]}[event.key];
  if(pan)onPan(...pan);
  else if(['+','=','-'].includes(event.key))onZoom(event.key==='-'?1/1.25:1.25);
  else if(event.key==='0')onReset();
  else if(event.key==='Enter')onSelect();
  else if(event.key==='Escape')onClear();
  else return;
  event.preventDefault();
 },options);
 window.addEventListener('blur',clear,options);
 return ()=>{clear();abort.abort();};
}
