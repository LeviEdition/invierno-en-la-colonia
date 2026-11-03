import atmosphereConfig from './atmosphere.json';
import {initialAtmosphereSettings} from './atmosphere-model.mjs';
import {createAtmosphereView} from './atmosphere-view.mjs';
import {createWindAudio} from './atmosphere-audio.mjs';
import sceneData from './scene.json';
import uploadedKit from '../uploaded-kit.json';
import manifest from '../../../kit_arte_h33/manifest.json';
import {validateScene,createFixture,sceneCounts,sceneNodes,pickCharacter,pickLocality,localityDetails,sampleTurn} from './model.mjs';
import {makeMockupKit} from './assets.mjs';
import {fitMapCamera,constrainCamera,focusLocality} from './camera.mjs';
import {panCamera,zoomCameraAt,pinchCamera,screenToWorld} from '../../hospital/camera.mjs';
import {bindControls} from '../../hospital/controls.mjs';
import {loadResources,prepareResources} from '../resources.mjs';
import {createWorkshopRenderer} from '../renderer.mjs';
import {webglAvailable} from '../../hospital-phaser/renderer.mjs';
import {waitForStartup,STARTUP_TIMEOUT_MS} from '../../hospital-phaser/startup.mjs';

const scene=validateScene(sceneData),kit=makeMockupKit(scene,uploadedKit,manifest);
const $=id=>document.getElementById(id),template=$('scene').cloneNode(false);
const controls=()=>[...document.querySelectorAll('button,select,input')].filter(el=>!['restart-mockup','retry-load','close-dialog'].includes(el.id));
const defaults=()=>({fixture:'hospital',selected:'hospital-person-1',selectedLocality:null,selectedDie:null,panelOpen:!matchMedia('(max-width:800px)').matches,debug:false,focus:'general'});
let state=defaults(),current=null,starts=0,generation=0,controller,serial=Promise.resolve(),pageActive=true,lastDisposal=null,lastError=null;
export function inspect(){return {state:document.body.dataset.state,starts,lastDisposal,lastError,app:current?.inspect()||null};}
async function clearCurrent(){const previous=current;current=null;if(previous)lastDisposal=await previous.destroy();$('debug-labels').replaceChildren();}
export function disposeMockup(){
 const id=++generation;controller?.abort();serial=serial.catch(()=>{}).then(async()=>{await clearCurrent();if(id===generation){document.body.dataset.state='disposed';controls().forEach(el=>el.disabled=true);$('loading').hidden=true;$('retry-load').hidden=true;}});return serial;
}
function mount(reset=true){
 if(!pageActive)return serial;const id=++generation;controller?.abort();controller=new AbortController();const attempt=controller;
 if(reset)state=defaults();$('restart-mockup').disabled=$('retry-load').disabled=true;
 serial=serial.catch(()=>{}).then(async()=>{await clearCurrent();if(id===generation&&!attempt.signal.aborted)await runMount(attempt.signal,id);});return serial;
}
async function runMount(signal,id){
 starts++;lastError=null;document.body.dataset.state='loading';$('loading').hidden=false;$('loading').setAttribute('role','status');$('loading').textContent='Cargando el mapa y las fichas…';$('retry-load').hidden=true;controls().forEach(el=>el.disabled=true);
 const deadline=performance.now()+STARTUP_TIMEOUT_MS,timings={startedAt:performance.now()},motionQuery=matchMedia('(prefers-reduced-motion: reduce)');let ambientSettings=initialAtmosphereSettings(motionQuery.matches),renderer,audio,observer,unbind,ui,frame=0;
 try{
  const canvas=template.cloneNode(false);$('scene')?.remove();document.querySelector('.map-viewport').prepend(canvas);
  if(!webglAvailable())throw Error('WEBGL_UNAVAILABLE');
  const originals=await waitForStartup(loadResources(kit),{signal,deadline});signal.throwIfAborted();timings.loadAndAlphaMs=performance.now()-timings.startedAt;
  const prepared=prepareResources(kit,originals,{factor:1}),prepareEnd=performance.now();timings.preparationMs=prepareEnd-timings.startedAt-timings.loadAndAlphaMs;
  renderer=await createWorkshopRenderer(canvas,kit,prepared,{signal,deadline,backgroundColor:'#171d20',atmosphereFrameRate:atmosphereConfig.frameRate,createAtmosphere:world=>createAtmosphereView(world,atmosphereConfig,{settings:ambientSettings})});signal.throwIfAborted();
  audio=createWindAudio(atmosphereConfig.audio,{onChange:()=>{if(ui&&!ui.signal.aborted)syncAmbientUI();}});
  let fixture=createFixture(scene,state.fixture),camera,viewport,nodes=[],panelKey='',contextLost=false,menuOpen=false;
  const log=[],counters={commands:0,draws:0},images=Object.fromEntries(kit.assets.map(a=>[a.id,a]));
  ui=new AbortController();const options={signal:ui.signal};
  function feedback(message){$('demo-feedback').textContent=message;$('demo-feedback').title=message;}
  function panel(open){state.panelOpen=open;document.body.dataset.panelOpen=String(open);$('panel-content').hidden=!open;$('panel-toggle').textContent=open?'×':'Ficha';$('panel-toggle').setAttribute('aria-expanded',String(open));$('panel-toggle').setAttribute('aria-label',open?'Cerrar ficha':'Abrir ficha');}
  function closeMenu(){menuOpen=false;$('floating-menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');}
  function updatePanel(){
   const key=state.fixture+'|'+state.selected+'|'+state.selectedLocality+'|'+state.debug;if(panelKey===key)return;panelKey=key;
   const character=fixture.characters.find(c=>c.id===state.selected);
   $('survivor-select').replaceChildren(new Option('Sin selección',''),...fixture.characters.map(c=>new Option(`${c.name} · ${c.zoneName} · ${c.id.split('-').at(-1)}`,c.id)));$('survivor-select').value=state.selected||'';
   const locality=localityDetails(scene,fixture,state.selectedLocality);
   $('panel-title').textContent=locality?'Localidad':character?'Superviviente':'Selección';$('dossier').setAttribute('aria-label',locality?'Ficha de '+locality.name:'Ficha del superviviente');
   $('locality-card').hidden=!locality;$('character-card').hidden=!character;$('no-selection').hidden=!!character||!!locality;
   document.querySelector('.character-details').hidden=!character;document.querySelector('.history').hidden=!character;
   $('locality-select').value=state.selectedLocality||'';
   if(locality){
    $('locality-name').textContent=locality.name;$('locality-description').textContent=locality.description;$('locality-occupancy').textContent=`${locality.characters.length}/${locality.survivorCapacity}`;
    $('locality-exterior-total').textContent=`(${locality.exteriorCapacity})`;for(const type of ['zombies','barricades','empty'])$('locality-'+type).textContent=locality[type];
    $('locality-survivors').replaceChildren(...locality.characters.map(c=>{const b=document.createElement('button');b.dataset.character=c.id;b.setAttribute('aria-label',`Ver a ${c.name}, grupo ${c.group}`);const img=document.createElement('img');img.src=new URL(images[c.portraitId].file,import.meta.url).href;img.alt='';const label=document.createElement('span');label.textContent=c.name;b.append(img,label);return b;}));
   }
   if(character){$('portrait').src=new URL(images[character.portraitId].file,import.meta.url).href;$('portrait').alt=character.name+' — retrato de muestra';$('character-name').textContent=character.name;$('character-name').classList.toggle('long-name',character.name.length>10);$('character-location').textContent=character.zoneName;$('character-group').textContent='Grupo '+character.group;for(const [i,key]of ['influence','combat','search'].entries())$(key).textContent=character.attributes[i];$('character-id').textContent=character.id;}
   $('character-id').hidden=!state.debug;
   const count=sceneCounts(fixture);$('occupation-summary').textContent=`Composición: ${count.characters}/33 fichas; ${count.zombies} zombis, ${count.barricades} barricadas y ${count.empty} vacíos.`;
  }
  function render(){
   frame=0;counters.draws++;nodes=sceneNodes(scene,fixture);
   renderer.update({camera,viewport,nodes,slotContours:fixture.accesses,localityHighlight:scene.zones.find(z=>z.id===state.selectedLocality)?.selectionPolygon,state:{selected:state.selected,grid:state.debug,gridStep:80,axes:false,pivots:state.debug,bounds:state.debug,showHidden:false,layers:{shadows:true,slots:false}}});
   $('zoom-value').value=Math.round(camera.zoom/fitMapCamera(scene.bounds,viewport).zoom*100)+'%';$('locality').value=state.focus;
   updatePanel();$('debug-labels').replaceChildren();if(state.debug)for(const a of fixture.accesses){const el=document.createElement('span');el.className='debug-label';el.dataset.technicalLabel=a.id;el.textContent=a.id;el.style.left=camera.x+a.position.x*camera.zoom+'px';el.style.top=camera.y+a.position.y*camera.zoom+'px';$('debug-labels').append(el);}
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(render);};
  const center=()=>({x:viewport.width/2,y:viewport.height/2});
  function change(next,focus='custom'){camera=constrainCamera(next,scene.bounds,viewport);state.focus=focus;schedule();}
  const reset=()=>change(fitMapCamera(scene.bounds,viewport),'general');
  function resize(){
   const next={width:canvas.clientWidth,height:canvas.clientHeight,dpr:Math.min(devicePixelRatio||1,3)},fitted=fitMapCamera(scene.bounds,next);
   if(camera&&viewport){const world=screenToWorld(camera,center()),zoom=Math.max(fitted.minZoom,Math.min(fitted.maxZoom,camera.zoom));camera=constrainCamera({...fitted,zoom,x:next.width/2-world.x*zoom,y:next.height/2-world.y*zoom},scene.bounds,next);}else camera=fitted;
   viewport=next;schedule();
  }
  function select(id){state.selectedLocality=null;state.selected=id;panel(true);updatePanel();schedule();if(id){const c=fixture.characters.find(c=>c.id===id);feedback(`${c.name} · ${c.zoneName}. Ficha de demostración seleccionada.`);}}
  function selectLocality(id){
   const locality=scene.zones.find(z=>z.id===id);if(!locality)return;
   state.selectedLocality=id;state.selected=null;panel(true);updatePanel();$('panel-content').scrollTop=0;schedule();feedback(`${locality.name} seleccionada. Datos de la composición actual.`);
  }
  function clearSelection(){state.selected=null;state.selectedLocality=null;updatePanel();schedule();feedback('Seleccioná un edificio o un retrato.');}
  const command=fn=>(...args)=>{counters.commands++;return fn(...args);};
  const listen=(selector,type,fn)=>{for(const el of document.querySelectorAll(selector))el.addEventListener(type,command(fn),options);};
  panel(state.panelOpen);closeMenu();$('debug-toggle').setAttribute('aria-pressed',String(state.debug));$('demo-controls').open=false;document.querySelector('.history').open=false;document.querySelector('.character-details').open=false;$('panel-content').scrollTop=0;$('fixture').value=state.fixture;
  $('locality-select').replaceChildren(new Option('Elegir localidad',''),...scene.zones.map(z=>new Option(z.name,z.id)));
  if(!$('locality').querySelector('[value=custom]'))$('locality').append(new Option('Vista libre','custom'));$('locality').querySelector('[value=custom]').disabled=true;
  const pipPositions={2:[1,9],3:[1,5,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};
  $('dice-pool').replaceChildren(...sampleTurn.dice.map((value,i)=>{const b=document.createElement('button');b.className='die';b.dataset.die=i;b.dataset.value=value;b.setAttribute('aria-label',`Dado ${i+1}, valor ${value}, reserva del grupo ${sampleTurn.group}`);b.setAttribute('aria-pressed','false');for(const pos of pipPositions[value]){const pip=document.createElement('span');pip.className='pip';pip.setAttribute('aria-hidden','true');pip.style.gridRow=Math.ceil(pos/3);pip.style.gridColumn=(pos-1)%3+1;b.append(pip);}return b;}));
  $('round').textContent=sampleTurn.round;$('turn').textContent='Grupo '+sampleTurn.group;$('morale').textContent=sampleTurn.morale;$('food').textContent=sampleTurn.food;
  observer=new ResizeObserver(resize);observer.observe(canvas);window.addEventListener('resize',resize,options);
  unbind=bindControls({canvas,onPan:command((x,y)=>change(panCamera(camera,x,y))),onZoom:command((factor,anchor=center())=>change(zoomCameraAt(camera,factor,anchor))),onPinch:command((a,b,f)=>change(pinchCamera(camera,a,b,f))),onPick:command(p=>{const point=screenToWorld(camera,p),selected=pickCharacter(fixture.characters,point),locality=pickLocality(scene,point);if(selected)select(selected);else if(locality)selectLocality(locality);else clearSelection();}),onReset:command(reset),onSelect:command(()=>state.selectedLocality?selectLocality(state.selectedLocality):select(state.selected||fixture.characters[0].id)),onClear:command(clearSelection)});
  const ambientKinds=['snow','wind','smoke','lights'];
  function syncAmbientUI(){
   const visual=ambientSettings.enabled&&ambientKinds.some(k=>ambientSettings[k]),sound=audio.inspect(),active=visual||sound.enabled;$('ambient-enabled').setAttribute('aria-pressed',String(active));$('ambient-enabled').textContent=active?'Ambientación: activada':'Ambientación: desactivada';
   $('ambient-audio').setAttribute('aria-pressed',String(sound.enabled));$('ambient-audio').textContent=sound.enabled?'Ventisca: sonido activado':'Ventisca: sonido desactivado';$('ambient-volume').value=String(Math.round(sound.volume*100));$('ambient-volume-value').value=Math.round(sound.volume*100)+'%';
   $('ambient-audio-status').textContent=sound.error||(sound.enabled?(sound.paused?'Sonido en pausa.':sound.state==='running'?'Sonido de ventisca activo.':'Audio suspendido por el navegador; desactivá y volvé a activar el sonido.'):'Sin sonido. Se activa solo con este botón.');
   for(const button of document.querySelectorAll('[data-ambient]'))button.setAttribute('aria-pressed',String(ambientSettings.enabled&&ambientSettings[button.dataset.ambient]));
   $('ambient-intensity').value=ambientSettings.intensity;$('ambient-reduced').hidden=!motionQuery.matches;
   $('ambient-status').textContent=visual?(document.hidden?'En pausa: pestaña oculta.':ambientSettings.intensity==='low'?'Intensidad baja.':'Intensidad normal.'):'Sin efectos animados.';
  }
  function setAmbient(patch){ambientSettings={...ambientSettings,...patch};renderer.setAtmosphere(patch);syncAmbientUI();}
  listen('#ambient-enabled','click',()=>{const on=!(ambientSettings.enabled&&ambientKinds.some(k=>ambientSettings[k])||audio.inspect().enabled);if(!on)audio.setEnabled(false);setAmbient({enabled:on,snow:on,wind:on,smoke:on,lights:on});});
  listen('[data-ambient]','click',e=>{const kind=e.currentTarget.dataset.ambient;setAmbient(ambientSettings.enabled?{[kind]:!ambientSettings[kind]}:{enabled:true,snow:false,wind:false,smoke:false,lights:false,[kind]:true});});
  listen('#ambient-intensity','change',e=>setAmbient({intensity:e.target.value}));
  listen('#ambient-audio','click',()=>audio.setEnabled(!audio.inspect().enabled));
  listen('#ambient-volume','input',e=>audio.setVolume(Number(e.target.value)/100));
  const visibility=()=>{renderer.pauseAtmosphere(document.hidden||contextLost);audio.setPaused(document.hidden||contextLost);syncAmbientUI();};document.addEventListener('visibilitychange',visibility,options);
  motionQuery.addEventListener('change',e=>{if(e.matches)setAmbient({enabled:false,snow:false,wind:false,smoke:false,lights:false});syncAmbientUI();},options);
  $('atmosphere-controls').open=false;visibility();
  listen('#locality','change',e=>{const id=e.target.value;if(id!=='general')selectLocality(id);resize();change(focusLocality(scene,id,viewport),id);});
  listen('#locality-select','change',e=>{if(e.target.value)selectLocality(e.target.value);else clearSelection();});
  listen('#locality-survivors','click',e=>{const b=e.target.closest('[data-character]');if(b)select(b.dataset.character);});
  listen('#zoom-in','click',()=>change(zoomCameraAt(camera,1.25,center())));listen('#zoom-out','click',()=>change(zoomCameraAt(camera,.8,center())));listen('#reset-view','click',reset);
  listen('#survivor-select','change',e=>{if(e.target.value)select(e.target.value);else clearSelection();});
  listen('#fixture','change',e=>{state.fixture=e.target.value;fixture=createFixture(scene,state.fixture);if(!fixture.characters.some(c=>c.id===state.selected))state.selected=null;panelKey='';updatePanel();schedule();feedback('Cambió la composición visual de muestra; no es una preparación de partida.');});
  listen('#panel-toggle','click',()=>panel(!state.panelOpen));
  listen('#menu-toggle','click',()=>{menuOpen=!menuOpen;$('floating-menu').hidden=!menuOpen;if(menuOpen)$('floating-menu').scrollTop=0;$('menu-toggle').setAttribute('aria-expanded',String(menuOpen));});
  listen('#debug-toggle','click',()=>{state.debug=!state.debug;$('debug-toggle').setAttribute('aria-pressed',String(state.debug));closeMenu();panelKey='';schedule();feedback(state.debug?'Diagnóstico visible; coordenadas de presentación, no casillas de juego.':'Vista principal sin etiquetas técnicas.');});
  listen('#dice-pool','click',event=>{const button=event.target.closest('[data-die]');if(!button)return;state.selectedDie=Number(button.dataset.die);for(const b of $('dice-pool').children)b.setAttribute('aria-pressed',String(b===button));feedback(`Señalado dado ${button.dataset.value} del grupo ${sampleTurn.group}. Demostración: no se consume.`);});
  listen('[data-action]','click',e=>{const action=e.currentTarget.dataset.action;log.push(action+' (demostración)');feedback(`Demostración: ${action}. No cambia dados, recursos, turnos ni ocupación.`);});
  listen('[data-info]','click',e=>{
   const kind=e.currentTarget.dataset.info,titles={objetivo:'Objetivo de muestra',crisis:'Crisis de muestra',inventarios:'Inventarios de muestra',registro:'Registro de demostración',ayuda:'Ayuda de la maqueta'};
   const text={objetivo:'Aquí se presentará el objetivo de la partida. Esta maqueta no evalúa victorias ni derrotas.',crisis:'Ejemplo de panel de crisis. No solicita ni consume recursos.',inventarios:'Sin objetos funcionales. Este panel muestra dónde se consultarán los inventarios.',registro:log.length?log.slice(-8).join(' · '):'Todavía no se pulsaron acciones de demostración.',ayuda:'Arrastrá para desplazar; rueda o pinza para acercar. El selector centra una localidad. Tocá un edificio para su ficha; los retratos abren al superviviente. Con foco en el mapa: flechas, +, − y0. Seleccioná una ficha o usá el selector del expediente. El menú permite reiniciar y abrir el taller técnico. Las acciones y los dados solo muestran feedback.'};
   $('dialog-title').textContent=titles[kind];$('dialog-content').textContent=text[kind];closeMenu();$('info-dialog').showModal();
  });
  listen('#close-dialog','click',()=>$('info-dialog').close());
  canvas.addEventListener('webglcontextlost',()=>{contextLost=true;renderer.pauseAtmosphere(true);audio.setPaused(true);controls().forEach(el=>el.disabled=true);$('retry-load').hidden=false;feedback('Se perdió el contexto gráfico; reiniciá si no se recupera.');},options);
  canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;renderer.pauseAtmosphere(document.hidden);audio.setPaused(document.hidden);controls().forEach(el=>el.disabled=false);$('retry-load').hidden=true;feedback('Contexto gráfico recuperado.');schedule();},options);
  resize();if(frame)cancelAnimationFrame(frame);render();await waitForStartup(renderer.nextFrame(),{signal,deadline});signal.throwIfAborted();
  timings.readyMs=performance.now()-timings.startedAt;
  current={inspect:()=>({state:structuredClone(state),fixture:structuredClone(fixture),counts:sceneCounts(fixture),locality:localityDetails(scene,fixture,state.selectedLocality),turn:structuredClone(sampleTurn),camera:{...camera},viewport:{...viewport},nodes:structuredClone(nodes),counters:{...counters},timings:{...timings},renderer:renderer.inspect(),audio:audio.inspect(),contextLost}),worldAt:p=>renderer.worldAt(p),pixels:()=>renderer.pixels(),async destroy(){ui.abort();observer.disconnect();unbind();if(frame)cancelAnimationFrame(frame);$('info-dialog').close();$('floating-menu').hidden=true;const graphics=renderer.destroy(),audioRelease=await audio.destroy();return {...graphics,audioRelease,disposed:true};}};
  document.body.dataset.state='ready';$('loading').hidden=true;controls().forEach(el=>el.disabled=false);feedback('Seleccioná un edificio o un retrato.');
 }catch(error){ui?.abort();observer?.disconnect();unbind?.();if(frame)cancelAnimationFrame(frame);const cleanup=renderer?.destroy();await audio?.destroy();if(signal.aborted||id!==generation)return;lastError={message:error.message,cleanupErrors:error.cleanupErrors||cleanup?.cleanupErrors||[]};document.body.dataset.state='error';$('loading').setAttribute('role','alert');$('loading').textContent=error.message==='WEBGL_UNAVAILABLE'?'Este navegador no ofrece WebGL. Podés abrir la referencia Canvas.':'No se pudo cargar la maqueta. '+error.message;const link=document.createElement('a');link.href='../hospital/';link.textContent='Abrir referencia Canvas';$('loading').append(link);$('loading').hidden=false;$('retry-load').hidden=false;
 }finally{if(id===generation)$('restart-mockup').disabled=$('retry-load').disabled=false;}
}
export function worldAt(point){return current?.worldAt(point);}
export function diagnosticPixels(){return current?.pixels();}
$('restart-mockup').addEventListener('click',()=>void mount(true));$('retry-load').addEventListener('click',()=>void mount(true));
window.addEventListener('pagehide',()=>{pageActive=false;void disposeMockup();});window.addEventListener('pageshow',event=>{pageActive=true;if(event.persisted)void mount(true);});
void mount();
