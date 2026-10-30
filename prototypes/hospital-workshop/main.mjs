import kitData from './kit.json';
import {validateKit,defaultState,sceneNodes,visibleCounts,caseOccupants} from './kit.mjs';
import {loadResources,prepareResources,pickNode} from './resources.mjs';
import {createWorkshopRenderer} from './renderer.mjs';
import {fitCamera,panCamera,zoomCameraAt,pinchCamera,screenToWorld} from '../hospital/camera.mjs';
import {bindControls} from '../hospital/controls.mjs';
import {webglAvailable} from '../hospital-phaser/renderer.mjs';
import {waitForStartup,STARTUP_TIMEOUT_MS} from '../hospital-phaser/startup.mjs';

const kit=validateKit(kitData),assets=Object.fromEntries(kit.assets.map(a=>[a.id,a]));
const loading=document.querySelector('#loading'),status=document.querySelector('#renderer-status'),labels=document.querySelector('#labels'),template=document.querySelector('#scene').cloneNode(false);
const controls=()=>[...document.querySelectorAll('button,input,select')].filter(el=>el.id!=='restart-scene');
let state=defaultState(kit),savedView=null,current=null,lastDisposal=null,lastError=null,starts=0,generation=0,controller=null,serial=Promise.resolve(),pageActive=true;
const enableControls=()=>{controls().forEach(el=>el.disabled=false);document.querySelector('#select-hospital').disabled=!state.layers.building;document.querySelector('#center-selection').disabled=!state.selected;};
export function inspect(){return {state:document.body.dataset.state,starts,lastError,lastDisposal,app:current?.inspect()||null};}
async function clearCurrent(){const app=current;current=null;if(app)lastDisposal=await app.destroy();labels.replaceChildren();}
export function disposeWorkshop(){const id=++generation;controller?.abort();serial=serial.catch(()=>{}).then(async()=>{await clearCurrent();if(id===generation){document.body.dataset.state='disposed';controls().forEach(el=>el.disabled=true);loading.hidden=true;status.textContent='Taller desmontado.';}});return serial;}
function mount(reset=false){
 if(!pageActive)return serial;const id=++generation,requestedAt=performance.now();controller?.abort();const attempt=new AbortController();controller=attempt;
 if(reset){state=defaultState(kit);savedView=null;}document.querySelector('#restart-scene').disabled=true;
 serial=serial.catch(()=>{}).then(async()=>{await clearCurrent();if(id===generation&&!attempt.signal.aborted)await runMount(attempt.signal,id,requestedAt);});return serial;
}
async function runMount(signal,id,requestedAt){
 starts++;lastError=null;document.body.dataset.state='loading';loading.hidden=false;loading.setAttribute('role','status');loading.textContent='Cargando recursos provisionales…';controls().forEach(el=>el.disabled=true);
 const deadline=performance.now()+STARTUP_TIMEOUT_MS;let renderer,observer,unbind,ui,frame=0,contextLost=false;
 const timings={requestedAt,startedAt:performance.now()};
 try{
  const canvas=template.cloneNode(false);canvas.id='scene';document.querySelector('#scene')?.remove();document.querySelector('.viewport').prepend(canvas);
  if(!webglAvailable())throw Error('WEBGL_UNAVAILABLE');
  const originals=await waitForStartup(loadResources(kit),{signal,deadline});signal.throwIfAborted();
  timings.loadAndAlphaMs=performance.now()-timings.startedAt;
  const profile=kit.profiles.find(p=>p.id===state.profile),preparationStart=performance.now(),prepared=prepareResources(kit,originals,profile);timings.derivationSubmitMs=performance.now()-preparationStart;signal.throwIfAborted();
  const rendererStart=performance.now();renderer=await createWorkshopRenderer(canvas,kit,prepared,{signal,deadline});signal.throwIfAborted();
  let camera=savedView?{...savedView.camera}:null,viewport=savedView?{...savedView.viewport}:null,initialZoom=savedView?.initialZoom,nodes=[];
  ui=new AbortController();const options={signal:ui.signal},counters={commands:0,draws:0};
  const center=()=>({x:viewport.width/2,y:viewport.height/2});
  function render(){
   frame=0;counters.draws++;nodes=sceneNodes(kit,state);if(state.selected&&!nodes.some(n=>n.visible&&n.id===state.selected))state.selected=null;renderer.update({camera,viewport,nodes,state});
   document.querySelector('#zoom-value').value=`${Math.round(camera.zoom/initialZoom*100)} %`;
   const text=(id,value)=>{const el=document.querySelector(id);if(el.textContent!==value)el.textContent=value;};
   const count=visibleCounts(nodes);text('#scene-summary',`En capas activas: ${count.survivors} supervivientes marcados · ${count.zombies} zombis · ${count.barricades} barricadas · ${count.testActors} actor de oclusión · ${count.accesses}/4 accesos de ensayo representados.`);
   text('#selection-status',state.selected?`Seleccionado: ${state.selected}.`:'Sin selección.');document.querySelector('#select-hospital').setAttribute('aria-pressed',String(state.selected==='hospital'));
   const visible=nodes.filter(n=>n.visible),selectable=visible.filter(n=>n.role!=='ground'),select=document.querySelector('#selected-resource'),signature=visible.map(n=>n.id+':'+n.role).join('|');
   if(select.dataset.nodes!==signature){select.replaceChildren(new Option('Sin selección',''),...visible.map(n=>new Option(`${n.id} — ${n.assetId}`,n.id)));select.dataset.nodes=signature;}select.value=state.selected||'';
   if(document.body.dataset.state==='ready'&&!contextLost){document.querySelector('#select-hospital').disabled=!state.layers.building;document.querySelector('#center-selection').disabled=!state.selected;}
   for(const b of document.querySelectorAll('[data-pose]'))b.setAttribute('aria-pressed',String(state.case==='occlusion'&&b.dataset.pose===state.pose));
   labels.replaceChildren();if(state.labels)for(const node of selectable){const label=document.createElement('span');label.className='resource-label';label.dataset.node=node.id;label.textContent=node.id==='human-guide'?'H':node.id==='door-guide'?'P':node.id==='test-actor'?'A0':node.id.startsWith('access-')?node.access.toUpperCase():node.id==='hospital'?'Hospital':node.id.toUpperCase();label.style.left=camera.x+node.position.x*camera.zoom+'px';const above=node.access?assets[node.assetId].visibleBounds.height*assets[node.assetId].scale*node.multiplier*camera.zoom+20:0;label.style.top=camera.y+node.position.y*camera.zoom-above+'px';labels.append(label);}
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(render);};
  const change=next=>{camera=next;schedule();};
  const reset=()=>change(fitCamera(kit.bounds,viewport.width,viewport.height));
  const command=fn=>(...args)=>{counters.commands++;return fn(...args);};
  const listen=(selector,type,fn)=>{for(const el of document.querySelectorAll(selector))el.addEventListener(type,command(fn),options);};
  function resize(){const next={width:canvas.clientWidth,height:canvas.clientHeight,dpr:Math.min(devicePixelRatio||1,3)},fitted=fitCamera(kit.bounds,next.width,next.height);if(camera&&viewport){const old=screenToWorld(camera,center()),zoom=Math.max(fitted.minZoom,Math.min(fitted.maxZoom,fitted.zoom*camera.zoom/initialZoom));camera={...fitted,zoom,x:next.width/2-old.x*zoom,y:next.height/2-old.y*zoom};}else camera=fitted;viewport=next;initialZoom=fitted.zoom;schedule();}
  observer=new ResizeObserver(resize);observer.observe(canvas);
  unbind=bindControls({canvas,onPan:command((x,y)=>change(panCamera(camera,x,y))),onZoom:command((factor,anchor=center())=>change(zoomCameraAt(camera,factor,anchor))),onPinch:command((a,b,f)=>change(pinchCamera(camera,a,b,f))),onPick:command(point=>{state.selected=pickNode(nodes,assets,originals,screenToWorld(camera,point));schedule();}),onReset:command(reset),onSelect:command(()=>{state.selected=state.selected==='hospital'?null:'hospital';schedule();}),onClear:command(()=>{state.selected=null;schedule();})});
  listen('#case','change',e=>{state.case=e.target.value;state.accesses=caseOccupants(state);for(const el of document.querySelectorAll('[data-access]'))el.value=state.accesses[Number(el.dataset.access)];state.selected=null;schedule();});
  listen('[data-pose]','click',e=>{state.case='occlusion';state.pose=e.currentTarget.dataset.pose;document.querySelector('#case').value=state.case;for(const b of document.querySelectorAll('[data-pose]'))b.setAttribute('aria-pressed',String(b.dataset.pose===state.pose));schedule();});
  listen('[data-access]','change',e=>{state.case='custom';state.accesses[Number(e.target.dataset.access)]=e.target.value;document.querySelector('#case').value='custom';schedule();});
  for(const key of ['grid','axes','pivots','bounds','show-hidden'])listen('#'+key,'change',e=>{state[key==='show-hidden'?'showHidden':key]=e.target.checked;schedule();});
  listen('#labels-toggle','change',e=>{state.labels=e.target.checked;schedule();});
  listen('#grid-step','change',e=>{state.gridStep=Math.max(40,Math.min(160,Number(e.target.value)||80));e.target.value=state.gridStep;schedule();});
  listen('#actor-scale','input',e=>{state.actorScale=Number(e.target.value);document.querySelector('#scale-value').value=state.actorScale.toFixed(2)+'×';schedule();});
  listen('[data-layer]','change',e=>{state.layers[e.target.dataset.layer]=e.target.checked;schedule();});
  listen('#zoom-in','click',()=>change(zoomCameraAt(camera,1.25,center())));listen('#zoom-out','click',()=>change(zoomCameraAt(camera,.8,center())));listen('#reset-view','click',reset);
  const pans={left:[48,0],right:[-48,0],up:[0,48],down:[0,-48]};listen('[data-pan]','click',e=>change(panCamera(camera,...pans[e.currentTarget.dataset.pan])));
  listen('#select-hospital','click',()=>{state.selected=state.selected==='hospital'?null:'hospital';schedule();});
  listen('#selected-resource','change',e=>{state.selected=e.target.value||null;schedule();});
  listen('#center-selection','click',()=>{const node=nodes.find(n=>n.id===state.selected&&n.visible);if(!node)return;const a=assets[node.assetId],b=a.visibleBounds,scale=a.scale*node.multiplier,x=node.position.x+(b.x+b.width/2-a.pivot.x)*scale,y=node.position.y+(b.y+b.height/2-a.pivot.y)*scale;change({...camera,x:viewport.width/2-x*camera.zoom,y:viewport.height/2-y*camera.zoom});});
  listen('#profile','change',e=>{savedView={camera:{...camera},viewport:{...viewport},initialZoom};state.profile=e.target.value;void mount();});
  canvas.addEventListener('webglcontextlost',()=>{contextLost=true;controls().forEach(el=>el.disabled=true);status.textContent='Contexto perdido; reiniciá si no vuelve.';},options);canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;enableControls();status.textContent='Contexto recuperado.';schedule();},options);
  document.querySelector('#case').value=state.case;document.querySelector('#profile').value=state.profile;document.querySelector('#actor-scale').value=state.actorScale;document.querySelector('#scale-value').value=state.actorScale.toFixed(2)+'×';document.querySelector('#grid-step').value=state.gridStep;
  for(const key of ['grid','axes','pivots','bounds'])document.querySelector('#'+key).checked=state[key];document.querySelector('#labels-toggle').checked=state.labels;document.querySelector('#show-hidden').checked=state.showHidden;
  for(const el of document.querySelectorAll('[data-layer]'))el.checked=state.layers[el.dataset.layer];for(const el of document.querySelectorAll('[data-access]'))el.value=state.accesses[Number(el.dataset.access)];for(const b of document.querySelectorAll('[data-pose]'))b.setAttribute('aria-pressed',String(b.dataset.pose===state.pose));
  const memory=Object.values(prepared).reduce((sum,p)=>sum+p.estimate.rgbaWithMips,0);document.querySelector('#texture-summary').textContent=`${profile.label}: ${(memory/1048576).toFixed(2)} MiB RGBA + mipmaps estimados. No es VRAM medida; excluye auxiliares y framebuffer.`;
  document.querySelector('#resource-list').replaceChildren(...kit.assets.map(a=>{const li=document.createElement('li');li.textContent=`${a.id}: ${a.width}×${a.height}, apoyo (${a.pivot.x}, ${a.pivot.y}), escala ${a.scale}; ${a.kind==='marker'?'marcador sin arte':'PNG original'}, provisional.`;return li;}));
  resize();if(frame)cancelAnimationFrame(frame);render();await waitForStartup(renderer.nextFrame(),{signal,deadline});signal.throwIfAborted();
  timings.rendererAndFirstFrameMs=performance.now()-rendererStart;timings.readyMs=performance.now()-timings.startedAt;timings.totalMountMs=performance.now()-requestedAt;
  current={inspect:()=>({state:structuredClone(state),camera:{...camera},viewport:{...viewport},initialZoom,nodes:structuredClone(nodes),counts:visibleCounts(nodes),counters:{...counters},timings:{...timings},renderer:renderer.inspect()}),worldAt:p=>renderer.worldAt(p),pixels:()=>renderer.pixels(),diagnosticFrame:k=>renderer.diagnosticFrame(k),prepared,
   destroy(){ui.abort();observer.disconnect();unbind();if(frame)cancelAnimationFrame(frame);return {...renderer.destroy(),disposed:true};}};
  document.body.dataset.state='ready';loading.hidden=true;enableControls();status.textContent='Taller provisional · Phaser4.2.1 · sin motor';performance.mark('workshop-ready');
 }catch(error){ui?.abort();observer?.disconnect();unbind?.();if(frame)cancelAnimationFrame(frame);const cleanup=renderer?.destroy();if(signal.aborted||id!==generation)return;lastError={message:error.message,cleanupErrors:error.cleanupErrors||cleanup?.cleanupErrors||[]};document.body.dataset.state='error';loading.hidden=false;loading.setAttribute('role','alert');loading.textContent=error.message==='WEBGL_UNAVAILABLE'?'WebGL no disponible. Abrí Canvas o reintentá.':'No se pudo preparar el taller. Revisá recursos y reintentá.';status.textContent=error.message;
 }finally{if(id===generation)document.querySelector('#restart-scene').disabled=false;}
}
export function worldAt(p){return current?.worldAt(p);}
export function diagnosticPixels(){return current?.pixels();}
export function diagnosticFrame(kind){return current?.diagnosticFrame(kind);}
export async function encodedDerivatives(){
 if(!new URLSearchParams(location.search).has('diagnostics'))throw Error('Requiere diagnostics');
 if(!current||document.body.dataset.state!=='ready')throw Error('Taller no preparado');const profileId=state.profile,prepared=current.prepared;
 return Promise.all(Object.entries(prepared).map(async([id,p])=>{
  const a=assets[id],c=document.createElement('canvas');c.width=p.image.width;c.height=p.image.height;const ctx=c.getContext('2d');ctx.drawImage(p.image,0,0);
  const rgba=ctx.getImageData(0,0,c.width,c.height).data;let minAlpha=255,maxAlpha=0,alphaSum=0;for(let i=3;i<rgba.length;i+=4){minAlpha=Math.min(minAlpha,rgba[i]);maxAlpha=Math.max(maxAlpha,rgba[i]);alphaSum+=rgba[i];}
  let sourceAlphaSum=a.width*a.height*255;if(p.alpha){sourceAlphaSum=0;for(const value of p.alpha)sourceAlphaSum+=value;}
  const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png')),hash=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
  return {id,profile:profileId,factor:p.factor,width:c.width,height:c.height,contentExtent:{width:a.width*p.factor,height:a.height*p.factor},pivot:{x:a.pivot.x*p.factor,y:a.pivot.y*p.factor},canonicalPivot:a.pivot,representationScale:a.scale/p.factor,alphaRange:[minAlpha,maxAlpha],normalizedAlphaCoverage:alphaSum/(a.width*a.height*p.factor*p.factor*255),sourceAlphaCoverage:sourceAlphaSum/(a.width*a.height*255),pngBytes:blob.size,sha256:[...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join(''),sourceSha256:a.sha256,sourceProvenance:a.provenance,referenceSnapshot:kit.sourceSnapshot,storage:'QA-export-not-runtime-network',artApproved:false,dataUrl:c.toDataURL()};
 }));
}
document.querySelector('#restart-scene').addEventListener('click',()=>{void mount(true);});
window.addEventListener('pagehide',()=>{pageActive=false;void disposeWorkshop();});window.addEventListener('pageshow',event=>{pageActive=true;if(event.persisted)void mount(true);});
void mount();
