import {paintExposureDie} from './movimiento/exposure-die-view.mjs';
import {mountWorkspace} from './experiencia/workspace.mjs';
import {present,unified} from './experiencia/surfaces.mjs';
import {help,statistics,eventText} from './juego/information.mjs';
import {mountPlayPanel} from './juego/panel.mjs';
import {describeCycleStep} from './ciclo/presentation.mjs';
import {mountCyclePanel} from './ciclo/panel.mjs';
import {mountInventoryPanel} from './inventario/panel.mjs';
import Phaser from 'phaser';
import {scene,kit,atmosphere,camera as cameraFunctions,createAtmosphereView} from './escena/scene-configuration.mjs';
import {loadResources,prepareResources} from './render/kit/resources.mjs';
import {withMapFilter} from './render/cold-filter.mjs';
import {animateExits,reducedMotion,crossfade} from './experiencia/transitions.mjs';
import {createNightAtmosphere} from './experiencia/night-lights.mjs';
import {createNightView} from './render/phaser/night-view.mjs';
import luces from './escena/luces.json';
import {damageMarks,damageKey,noiseMarks,noiseAnchor,safeInsets,localityLabelAnchor,labelVisible,LABEL_WAKE_MS,damageBubble,damageLift,nightDieAnchor} from './experiencia/state-marks.mjs';
import {createWorkshopRenderer} from './render/kit/renderer.mjs';
import {initialAtmosphereSettings} from './movimiento/storm-model.mjs';
import {createWindAudio} from './render/maqueta/atmosphere-audio.mjs';
import {panCamera,zoomCameraAt,pinchCamera,screenToWorld} from './render/camera.mjs';
import {bindControls} from './render/controls.mjs';
import {pickMapTarget,pickLocality} from './render/maqueta/model.mjs';
import {webglAvailable} from './render/phaser/renderer.mjs';
import {waitForStartup,STARTUP_TIMEOUT_MS} from './render/phaser/startup.mjs';
import {portraitFor,initials} from './movimiento/layout.mjs';
import {dieFace} from './movimiento/dice.mjs';
import {actionBarModel,cardsModel,createClickGuard} from './juego/action-bar-model.mjs';
import {mountActionBar} from './juego/action-bar.mjs';
import {FOLD_KEYS,foldStorage,loadFolds,saveFolds,toggleAll,foldLabel,createCrisisWatcher,isFoldShortcut,mountFoldPanels} from './experiencia/folds.mjs';
import {mountStatTips} from './experiencia/stat-tips.mjs';
import {createPresentationSequence,exposureText,movementSummary} from './movimiento/presentation-sequence.mjs';
import {createStableLayout,destinationPosition} from './movimiento/stable-layout.mjs';
import {mountSearchPanel} from './busqueda/search-panel.mjs';
import {mountActionPanel} from './acciones/action-panel.mjs';
import {actionSummary,actionExposureText} from './acciones/action-presentation.mjs';
import {movementMessages} from './movimiento/movement-controller.mjs';
import {actionInProgress,turnShortcut} from './juego/turn-flow.mjs';
// Motivos que el motor da para una acción no disponible (códigos `reason` de sus opciones).
const ACTION_REASONS=Object.freeze({colony:'Fuera de colonia','deck-empty':'Mazo agotado','no-target':'Sin zombis',clean:'Colonia y residuos',attract:'Sin origen o accesos',treatment:'Sin pacientes o ya usada','already-moved':'Movimiento usado',rule:'Regla apagada',home:'Ya está en la colonia',turn:'Esperá tu turno',decision:'Decisión pendiente',receipt:'Actualizando resultado','no-dice':'Sin dados',insufficient:'Dados insuficientes',full:'Accesos completos'});
// Acciones de turno del abanico de «Más» (informe 126).
const FAN_IDS=Object.freeze(['barricade-action','clean-action','attract-action','special-action','return-home-action','use-card-action']);
const {fitMapCamera,constrainCamera,focusLocality,resizeMapCamera,focusAnchor}=cameraFunctions,$=id=>document.getElementById(id),value=x=>x===null||x===undefined?'—':String(x);
const reason={setup:'Elegí el modo para comenzar.',handover:'Confirmá el pase de dispositivo.',death:'Confirmá los fallecimientos.',decision:'Resolvé la decisión pendiente.',waiting:'Esperando la partida.'};
// El renderer elimina su canvas al destruirse: cada montaje parte de esta plantilla.
const canvasTemplate=$('scene').cloneNode(false);
const element=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
export async function createSearchMapView({signal,movement,search,action,inventory,cycle,play,onRecover,onSearchNative}={}){
 const ui=new AbortController(),options={signal:ui.signal},motion=matchMedia('(prefers-reduced-motion: reduce)'),deadline=performance.now()+STARTUP_TIMEOUT_MS;
 let renderer,audio,observer,unbind,frame=0,disposed=false,active=false,contextLost=false,projection=null,layout={nodes:[],characters:[],locations:[],unmappedCharacterIds:[]},camera,viewport,selected=null,selectedLocation=null,infoKind=null,epoch,lastMovementPhase='idle',commands=0,draws=0;
 const stableLayout=createStableLayout(scene),actors=new Map();let sequence=null,sequenceResponse=null,sequenceFrom=null,sequenceTo=null,sequenceLast=null,sequenceCallback=null,sequenceApplied=false,hoveredLocation=null;let pointedLocality=null;let sceneDirty=true,lastPanelActor=null;const localityLabels=new Map(),nightState=createNightAtmosphere();let nightView=null;let labelsAwakeUntil=0,labelTimer=0,glide=null;const GLIDE_MS=220;
 let windowWidth=innerWidth,windowHeight=innerHeight;
 const foldStore=foldStorage(),crisisNew=createCrisisWatcher();let folds=loadFolds(foldStore);
 let panelFocusTarget=null,panelTarget=document.body.dataset.panelOpen!=='false',resizeAnchor=null,resizeZoom=null,submittedCamera=null,submittedViewport=null,displayCamera=null,displayViewport=null,lastSearchPhase='idle',lastActionPhase='idle',impactApplied=false;
 const workspace=mountWorkspace({getContext:()=>({projection,selected,active,action,search,inventory,play,movement,cycle}),panel,signal:ui.signal});
 // Sesión 7 (informe 126): las acciones de turno actúan sobre el superviviente activo de la barra:
 // el seleccionado o, si no hay, el líder del grupo en turno (la misma vista previa de la barra).
 const acting=()=>{if(selected)return selected;const p=projection;if(!p||p.blocked||p.ended)return null;const leader=p.players?.find(x=>x.id===p.turn)?.leaderId;return (p.characters.find(x=>x.id===leader)||p.characters.find(x=>x.playerId===p.turn))?.id??null;};
 const playPanel=mountPlayPanel({controller:play,getContext:()=>({projection,active,selected:acting(),executing:[movement,search,action,inventory].some(c=>c.inspect().busy||['sending','unknown','presenting','awaiting-decision'].includes(c.inspect().phase))}),onRecover,signal:ui.signal});
 const cyclePanel=mountCyclePanel({controller:cycle,getContext:()=>({projection,active,competing:!!projection?.play?.managed||!!play&&play.inspect().phase!=='closed'||!!$('inventory-dialog')?.open||!$('search-panel').hidden||!$('action-panel').hidden||['presenting','awaiting-decision'].includes(movement.inspect().phase),executing:[movement,search,action,inventory].some(c=>['sending','unknown','presenting','awaiting-decision'].includes(c.inspect().phase))}),onNative:onSearchNative,onRecover,signal:ui.signal});
 const inventoryPanel=mountInventoryPanel({controller:inventory,getContext:()=>({projection,selected:acting(),active,searchBusy:search.inspect().busy,actionBusy:action.inspect().busy,movementPhase:movement.inspect().phase}),onNative:onSearchNative,signal:ui.signal});
 const searchPanel=mountSearchPanel({inventoryLabel:'Inventario',controller:search,getContext:()=>({projection,selected:acting(),active,movementPhase:movement.inspect().phase}),onCancel:()=>focusPanelControl('search-action'),onNative:onSearchNative,signal:ui.signal});
 const actionPanel=mountActionPanel({controller:action,getContext:()=>({projection,selected:acting(),active,movementPhase:movement.inspect().phase,searchBusy:search.inspect().busy,targetOnRight:camera&&viewport?(camera.x+(layout.characters.find(c=>c.id===acting())?.position.x||0)*camera.zoom)>viewport.width/2:false}),onCancel:kind=>focusPanelControl(kind+'-action'),onNative:onSearchNative,signal:ui.signal});
 let settings=initialAtmosphereSettings(motion.matches);const canvas=canvasTemplate.cloneNode(false);$('scene')?.remove();document.querySelector('.map-viewport').prepend(canvas);
 const feedback=text=>$('view-feedback').textContent=text,listen=(selector,type,fn)=>document.querySelectorAll(selector).forEach(el=>el.addEventListener(type,fn,options));
 function applyPanel(open){$('panel-content').hidden=!open;document.body.dataset.panelOpen=String(open);$('panel-toggle').setAttribute('aria-expanded',String(open));$('panel-toggle').textContent=open?'×':'Expediente';$('panel-toggle').setAttribute('aria-label',open?'Cerrar el expediente (E o Esc)':'Abrir el expediente (E)');if(open&&panelTarget&&panelFocusTarget){const id=panelFocusTarget;panelFocusTarget=null;$(id)?.focus({preventScroll:true});}}
 function panel(open){const closing=panelTarget&&!open;panelTarget=open;if(folds&&folds.dossier===open){folds={...folds,dossier:!open};saveFolds(foldStore,folds);}if(!open)panelFocusTarget=null;if(closing&&camera&&viewport)glideTo(camera);if(scene.reclaimPanelSpace&&active&&renderer&&viewport){sceneDirty=true;resize();schedule();}else applyPanel(open);}
 // Sesión 7: los controles de acción viven en la barra. Volver a uno del abanico lo reabre, así
 // el foco regresa al lugar de donde salió la acción (Esc o Cancelar).
 function focusPanelControl(id){panelFocusTarget=null;const e=$(id);if(e?.closest('#bar-fan'))setFan(true);e?.focus({preventScroll:true});}
 function schedule(){if(active&&!disposed&&!frame)frame=requestAnimationFrame(render);}
 const center=()=>({x:(viewport?.width||1)/2,y:(viewport?.height||1)/2});
 function change(next){pointedLocality=null;sceneDirty=true;commands++;camera=constrainCamera(next,scene.bounds,{...viewport,slack:panelSlack()});if(scene.reclaimPanelSpace){resizeAnchor=screenToWorld(camera,center());resizeZoom=camera.zoom;}schedule();}
 function wakeLabels(){labelsAwakeUntil=performance.now()+LABEL_WAKE_MS;clearTimeout(labelTimer);labelTimer=setTimeout(()=>{if(!disposed&&displayCamera)labels(displayCamera,displayViewport);},LABEL_WAKE_MS+30);if(displayCamera)labels(displayCamera,displayViewport);}
 // Cambio de localidad rápido pero suave: la lógica usa la cámara final al instante; solo
 // el dibujo recorre el camino. Los toques usan la cámara dibujada (displayCamera).
 function glideFrame(now){const t=Math.min(1,(now-glide.start)/GLIDE_MS),e=1-Math.pow(1-t,3),z=glide.from.zoom*Math.pow(glide.to.zoom/glide.from.zoom,e),c=center(),a=screenToWorld(glide.from,c),b=screenToWorld(glide.to,c),w={x:a.x+(b.x-a.x)*e,y:a.y+(b.y-a.y)*e};return {...glide.to,zoom:z,x:c.x-w.x*z,y:c.y-w.y*z};}
 function glideTo(next){const from=camera&&viewport&&!reducedMotion()?(glide?glideFrame(performance.now()):{...camera}):null;glide=null;change(next);if(from&&camera&&(Math.abs(from.zoom-camera.zoom)>1e-6||Math.abs(from.x-camera.x)>.5||Math.abs(from.y-camera.y)>.5))glide={from,to:{...camera},start:performance.now()};}
 function interact(next){glide=null;wakeLabels();change(Object.hasOwn(next,'overview')?{...next,overview:false}:next);}
 function resize(){
  const target=scene.reclaimPanelSpace?canvas.parentElement:canvas,actual=document.body.dataset.panelOpen;
  // Medir el layout deseado y restaurar el actual antes del paint. El cambio
  // visible se confirma junto con canvas/cámara en PRE_RENDER, sin banda vacía.
  if(scene.reclaimPanelSpace)document.body.dataset.panelOpen=String(panelTarget);
  const width=target.clientWidth,height=target.clientHeight;
  if(scene.reclaimPanelSpace)document.body.dataset.panelOpen=actual;
  if(!width||!height)return;
  const windowResized=windowWidth!==innerWidth||windowHeight!==innerHeight;windowWidth=innerWidth;windowHeight=innerHeight;
  const next={width,height,dpr:Math.min(devicePixelRatio||1,3)};if(viewport&&camera&&next.width===viewport.width&&next.height===viewport.height&&next.dpr===viewport.dpr)return;sceneDirty=true;const base=fitMapCamera(scene.bounds,next);
  if(camera&&viewport){const world=scene.reclaimPanelSpace?(resizeAnchor||screenToWorld(camera,center())):screenToWorld(camera,center()),zoom=Math.max(base.minZoom,Math.min(base.maxZoom,camera.zoom));camera=unified()?(camera.overview&&windowResized?base:resizeMapCamera(camera,world,scene.bounds,next)):scene.reclaimPanelSpace?resizeMapCamera(camera,world,scene.bounds,next,resizeZoom??camera.zoom):constrainCamera({...base,zoom,x:width/2-world.x*zoom,y:height/2-world.y*zoom},scene.bounds,next);if(scene.reclaimPanelSpace&&!resizeAnchor)resizeAnchor=world;}else camera=base;
  if(scene.reclaimPanelSpace&&resizeZoom===null)resizeZoom=camera.zoom;viewport=next;schedule();
 }
 const actionSelectionBusy=()=>action.inspect().busy&&(!unified()||action.inspect().phase!=='presenting');
 const reset=()=>{if(viewport){if(unified())$('locality').value='general';glideTo(fitMapCamera(scene.bounds,viewport));}};
 function selectCharacter(id,{open=true}={}){if(search.inspect().busy||actionSelectionBusy())return;if(['sending','unknown','presenting','awaiting-decision'].includes(movement.inspect().phase))return;if(['choosing','confirming'].includes(movement.inspect().phase))movement.cancel();selected=projection?.characters.some(c=>c.id===id)?id:null;selectedLocation=null;localityChosen=false;commands++;if(open)panel(true);updateUI();schedule();}
 // Barra de acción (informes 122 y 126): el ÚNICO lugar de acción de turno. Los botones de
 // acción son los reales (mismos ids, controladores y validaciones del motor); la barra solo
 // decide qué se ve: principales siempre, el resto en el abanico de «Más» si el motor lo permite.
  const actionBar=mountActionBar({portraitUrl:id=>{const a=kit.assets.find(x=>x.id===portraitFor(id));return a?new URL(a.file,import.meta.url).href:null;},initials,onSelect:id=>selectCharacter(id,{open:false}),onDie:k=>{if(k>=0)chooseDieAt(k);},signal:ui.signal}),barGuard=createClickGuard();let barState=null,flow=null,fanOpen=false,stageWas=false,lastOpener=null,localityChosen=false;
 function chosenDie(){const s=search.inspect(),a=action.inspect();return s.phase==='picking'?s.intent?.dieIndex??null:a.phase==='picking'?a.intent?.dieIndex??null:play?.inspect().intent?.dieIndex??null;}
 function setFan(open){fanOpen=!!open;const fan=$('bar-fan');if(fan.hidden===!fanOpen)return;fan.hidden=!fanOpen;$('bar-more').setAttribute('aria-expanded',String(fanOpen));}
 function renderBar(){if(!projection)return;if(crisisNew(projection)&&folds.crisis)setFold('crisis',false);
  flow=active?actionInProgress(projection,{search:search.inspect(),action:action.inspect(),play:play?.inspect(),movement:movement.inspect(),inventory:inventory?.inspect()}):null;
  barState=actionBarModel(projection,{selectedId:selected,chosenIndex:chosenDie(),previousDice:barState?.dice});actionBar.render(barState,cardsModel(projection),projection.resources,flow);
  const own=!!barState.own&&active,id=acting();$('action-bar').dataset.own=String(own);$('action-bar').dataset.busy=String(!!flow);
  // Principales siempre visibles; apagadas, con el motivo del motor en el globo de papel. Sin
  // motivo del motor (turno ajeno, acción en curso), quedan apagadas sin globo (informe 126).
  const options={'search-action':projection.search?.options?.[id],'attack-action':projection.action?.options?.[id]?.attack,'move-action':projection.movement?.options?.[id]};
  for(const [bid,q]of Object.entries(options)){const b=$(bid),wrap=b.closest('.action-control'),reason=own&&!flow&&b.disabled&&q&&q.allowed===false?ACTION_REASONS[q.reason]||movementMessages[q.reason]||'':'';
   if(reason){wrap.dataset.tipTitle=b.textContent.trim()+' no disponible';wrap.dataset.tipText=reason;wrap.tabIndex=0;}else{delete wrap.dataset.tipTitle;delete wrap.dataset.tipText;wrap.tabIndex=-1;}}
  // Abanico: solo lo que el motor permite ahora.
  let any=false;for(const fid of FAN_IDS){const b=$(fid),c=b?.closest('.action-control');if(!c)continue;const off=b.disabled||c.hidden;c.dataset.fanOff=String(off);if(!off)any=true;}
  $('bar-fan').dataset.empty=String(!any);const more=!own||!any||!!flow;if($('bar-more').disabled!==more)$('bar-more').disabled=more;if(more&&fanOpen)setFan(false);
  // Al cerrarse el papel del centro, si el foco quedó suelto vuelve a la barra.
  const staged=document.body.dataset.stage==='true';if(stageWas&&!staged&&(!document.activeElement||document.activeElement===document.body)){const back=[lastOpener,'bar-more','finish-turn'].map(x=>x&&$(x)).find(e=>e&&!e.disabled&&e.getClientRects().length);back?.focus({preventScroll:true});}stageWas=staged;}
 // Elegir el dado k de la acción en curso: por el mismo botón del panel (mismas validaciones).
 function chooseDieAt(k){const f=flow;if(!active||!f?.dice)return false;const die=f.dice.find(d=>d.index===k);if(!die?.allowed)return false;const b=document.querySelector(f.kind==='search'?'#search-dice [data-die="'+k+'"]':f.kind==='action'?'#action-dice [data-action-die="'+k+'"]':'#play-die-'+k);if(!b||b.disabled)return false;b.click();return true;}
 // «Cancelar (Esc)» de la tira: los mismos caminos que Escape en cada panel.
 function cancelCurrent(){const a=action.inspect(),s=search.inspect(),m=movement.inspect(),pl=play?.inspect(),i=inventory?.inspect();
  if(a.phase==='picking'){const kind=a.intent?.kind||'attack';if(action.cancel())focusPanelControl(kind.startsWith('barricade')?'barricade-action':'attack-action');return;}
  if(s.phase==='picking'){if(search.cancel())focusPanelControl('search-action');return;}
  if(['choosing','confirming'].includes(m.phase)){movement.cancel();focusPanelControl('move-action');return;}
  if(pl?.intent){const kind=pl.intent.kind;play.close();focusPanelControl(kind+'-action');return;}
  if(i&&['browsing','picking'].includes(i.phase)&&['use','crisis'].includes(i.purpose)){inventory.close();focusPanelControl(i.purpose==='use'?'use-card-action':'crisis-contribute');}}
 // Plegado: el estado vive en folds; cada panel lo refleja en data-folded y en su botón de plegado.
 function foldTarget(key){return {objective:$('objective-card'),crisis:$('crisis-card'),resources:document.querySelector('#map-app .topbar'),bar:$('action-bar')}[key]||null;}
 function paintFold(key){const el=foldTarget(key),folded=!!folds[key];if(el&&el.dataset.folded!==String(folded))el.dataset.folded=String(folded);for(const tab of document.querySelectorAll('.fold-hit[data-fold='+key+']')){tab.setAttribute('aria-expanded',String(!folded));tab.setAttribute('aria-label',foldLabel(key,folded));}}
 function applyFolds(){for(const k of FOLD_KEYS)if(k!=='dossier')paintFold(k);}
 function setFold(key,folded,{refit=true}={}){if(!FOLD_KEYS.includes(key)||folds[key]===folded)return;if(key==='dossier'){panel(!folded);return;}folds={...folds,[key]:folded};saveFolds(foldStore,folds);const el=foldTarget(key);if(el)crossfade(el,()=>paintFold(key));else paintFold(key);if(refit)refitCamera();}
 // Al plegar, la cámara recalcula las franjas tapadas: el enfoque vuelve a encuadrar en el
 // área libre nueva y la vista libre se reacomoda a los bordes.
 function refitCamera(){if(!camera||!viewport)return;const id=$('locality').value,loc=id&&id!=='general'&&!camera.overview?layout.locations.find(l=>l.id===id):null;if(loc)glideTo(focusLocality(scene,loc.visualId,{...viewport,inset:focusInset(),slack:panelSlack()}));else change(camera);}
 // Expediente (informe 126): se abre y se cierra con el retrato o con E (y se cierra con Esc).
 // Si el jugador eligió una localidad en el mapa, muestra esa localidad; si no, el superviviente activo
 // (la colonia que el visor marca por defecto no cuenta como elegida).
 function barDetail(){if(panelTarget){$('panel-toggle').click();return;}if(barState?.preview&&barState.actor&&!localityChosen)selectCharacter(barState.actor.id,{open:false});panel(true);}
 function selectLocality(id){sceneDirty=true;if(search.inspect().busy||action.inspect().busy)return;if(['sending','presenting','awaiting-decision'].includes(movement.inspect().phase))return;selected=null;selectedLocation=projection?.locations.some(l=>l.id===id)?id:null;localityChosen=!!selectedLocation;commands++;updateUI();schedule();}
 function focus(id){const loc=layout.locations.find(l=>l.id===id),choosing=['choosing','confirming'].includes(movement.inspect().phase),prepare=()=>{selectLocality(id);if(scene.closePanelOnFocus&&matchMedia('(max-width:950px)').matches)panel(false);};if(unified()&&loc&&!choosing)prepare();if(viewport)glideTo(focusLocality(scene,loc?.visualId||'general',{...viewport,inset:focusInset(),slack:panelSlack()}));if(scene.reclaimPanelSpace&&loc)resizeAnchor={...(focusAnchor?.(scene,loc.visualId)||scene.zones.find(z=>z.id===loc.visualId).center)};if(loc){if(choosing)movement.choose(loc.engineIndex);else if(!unified())prepare();}}
 // Ficha abierta (v2): margen lateral de cámara igual a lo que tapa, para que un borde del
 // mapa pueda quedar a la vista. Solo horizontal; el zoom y las posiciones no cambian.
 function panelSlack(){if(!panelTarget)return undefined;const box=document.querySelector('.map-viewport')?.getBoundingClientRect(),d=$('dossier');if(!box||!d?.getClientRects().length)return undefined;const i=safeInsets(box,[d.getBoundingClientRect()]);return i.left||i.right?{left:i.left,right:i.right}:undefined;}
 // Paneles que flotan sobre el mapa (interfaz v2): el enfoque usa el área que dejan libre.
 function focusInset(){const box=document.querySelector('.map-viewport')?.getBoundingClientRect();if(!box)return undefined;const rects=['.topbar','#public-summaries','#action-bar','.map-tools','#menu-toggle',...(panelTarget?['#dossier']:[])].map(s=>document.querySelector(s)).filter(el=>el?.getClientRects().length).map(el=>el.getBoundingClientRect());return safeInsets(box,rects);}
 function playerName(id){return projection?.players.find(p=>p.id===id)?.label||'—';}
 // Phaser puede dibujar a30FPS mientras el DOM recibe RAF más frecuentes.
 // Publicar la misma cámara DESPUÉS de su cuadro evita que las fichas adelanten
 // al mapa. La animación propia de una ficha sigue usando el reloj visual.
 function mountAtmosphere(world){
  const events=world.game.events,onFrame=()=>{
   if(disposed||!active||!submittedCamera||displayCamera===submittedCamera)return;
   displayCamera=submittedCamera;displayViewport=submittedViewport;
   labels(displayCamera,displayViewport);
  };
  events.on(Phaser.Core.Events.POST_RENDER,onFrame);
  ui.signal.addEventListener('abort',()=>events.off(Phaser.Core.Events.POST_RENDER,onFrame),{once:true});
  // Noche y luces (informe 121) comparten el bucle de la atmósfera: un solo paso por cuadro,
  // en pausa con la pestaña oculta.
  const env=createAtmosphereView(world,atmosphere,{settings,kit});
  nightView=createNightView(world,{lights:luces.lights,bounds:scene.bounds,getNight:t=>nightState.level(t,reducedMotion()),active:t=>nightState.active(t),reduced:reducedMotion});
  return {step(d){env.step(d);nightView.step(d);},isAnimating:()=>env.isAnimating()||nightView.isAnimating(),frameRate:()=>env.isAnimating()?atmosphere.frameRate:nightView.frameRate,setSettings(p){env.setSettings(p);},setPaused(v){env.setPaused(v);nightView.setPaused(v);},inspect:()=>({...env.inspect(),night:{...nightView.inspect(),state:nightState.inspect()}}),destroy:()=>({...env.destroy(),...nightView.destroy()})};
 }
 function labels(camera,viewport){
  const alive=new Set(layout.characters.map(c=>c.id));for(const [id,node]of actors)if(!alive.has(id)){node.remove();actors.delete(id);}
  const bubbles=[];
  for(const c of layout.characters){
   let marker=actors.get(c.id);if(!marker){marker=element('span',undefined,'actor-marker');marker.dataset.actorId=c.id;const portrait=kit.assets.find(a=>a.id===c.portraitId);if(portrait){const image=element('img');image.src=new URL(portrait.file,import.meta.url).href;image.alt='';image.draggable=false;marker.append(image);}else marker.append(element('span',c.initials,'actor-initials'));marker.append(element('span',c.playerId==='human'?'J1':projection.mode==='local'?'J2':'IA','group-badge'));$('actor-markers').append(marker);actors.set(c.id,marker);}
   const d=c.diameter*camera.zoom,classes='actor-marker '+(c.playerId==='human'?'owner-human':'owner-ai')+(selected===c.id?' actor-selected':''),label=c.name+', '+playerName(c.playerId)+(selected===c.id?', seleccionado':''),badge=marker.querySelector('.group-badge');
   // Un redraw del contorno no cambia las fichas. class/hidden/aria-label
   // pueden emitir mutaciones aun al asignarles su valor actual.
   if(marker.className!==classes)marker.className=classes;
   marker.style.left=camera.x+c.position.x*camera.zoom+'px';marker.style.top=camera.y+c.position.y*camera.zoom+'px';marker.style.width=marker.style.height=d+'px';marker.style.fontSize=Math.max(5,d*.32)+'px';marker.style.borderWidth=(selected===c.id?Math.max(2.5,Math.min(5,d*.09)):Math.max(1.2,Math.min(3,d*.055)))+'px';
   if(badge.hidden!==(d<22))badge.hidden=d<22;
   if(marker.getAttribute('aria-label')!==label)marker.setAttribute('aria-label',label);
   // Daño siempre visible (v2): herida y congelación, cada una solo si es mayor que 0.
   const damage=damageMarks(c),damageId=damageKey(damage);if(marker.dataset.damage!==damageId){marker.dataset.damage=damageId;marker.querySelector('.damage-marks')?.remove();if(damage.length){const box=element('span',undefined,'damage-marks');for(const m of damage){const mark=element('span',undefined,'damage-mark damage-'+m.kind);mark.dataset.kind=m.kind;mark.dataset.count=String(m.count);mark.append(element('span',m.symbol,'damage-symbol'),element('span',String(m.count),'damage-count'));box.append(mark);}marker.append(box);}}
   {const box=marker.querySelector('.damage-marks'),bubble=box&&damageBubble(d,damage);if(bubble){const size=bubble.fontSize+'px';if(box.style.fontSize!==size)box.style.fontSize=size;bubbles.push({id:c.id,box,x:camera.x+c.position.x*camera.zoom,y:camera.y+c.position.y*camera.zoom-d/2-4,width:box.offsetWidth||bubble.width,height:box.offsetHeight||bubble.height});}}
  }
  // Globos en fila: si uno más ancho que su ficha toca al de la vecina, el segundo sube un nivel.
  {const lift=damageLift(bubbles);for(const b of bubbles){const v=lift[b.id]?'0 '+(-lift[b.id]*(b.height+2))+'px':'';if(b.box.style.translate!==v)b.box.style.translate=v;const l=String(lift[b.id]||0);if(b.box.dataset.lift!==l)b.box.dataset.lift=l;}}
  const decorations=[];for(const loc of layout.locations){const zone=scene.zones.find(z=>z.id===loc.visualId);{const noise=noiseMarks(loc),anchor=noise&&noiseAnchor(zone);if(anchor){const el=element('span',undefined,'noise-marks');el.dataset.locality=loc.id;el.dataset.noise=String(noise.count);el.title=noise.label;el.style.left=camera.x+anchor.x*camera.zoom+'px';el.style.top=camera.y+anchor.y*camera.zoom+'px';for(let i=0;i<noise.filled+noise.empty;i++)el.append(element('span',undefined,'noise-mark'+(i<noise.filled?' noise-on':'')));decorations.push(el);}}const notes=[];if(loc.characterOverflow.length)notes.push('+'+loc.characterOverflow.length+' fichas');if(loc.externalOverflow)notes.push('+'+loc.externalOverflow+' exteriores');if(loc.helpless)notes.push(loc.helpless+' indefensos');if(notes.length){const el=element('span',notes.join(' · '),'overflow-badge');el.style.left=camera.x+loc.badgePosition.x*camera.zoom+'px';el.style.top=camera.y+loc.badgePosition.y*camera.zoom+'px';decorations.push(el);}}
  const m=movement.inspect(),selecting=['choosing','confirming'].includes(m.phase),legal=projection?.movement?.options[m.intent?.actorId]?.destinations||[];
  $('destination-name').hidden=!selecting||!hoveredLocation;
  if(selecting){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('destination-zones');svg.setAttribute('viewBox',`0 0 ${viewport.width} ${viewport.height}`);for(const loc of layout.locations){if(!legal.includes(loc.engineIndex))continue;const zone=scene.zones.find(z=>z.id===loc.visualId),polygon=document.createElementNS(svg.namespaceURI,'polygon');polygon.setAttribute('points',(zone.outlinePolygon||zone.selectionPolygon).map(([x,y])=>(camera.x+x*camera.zoom)+','+(camera.y+y*camera.zoom)).join(' '));polygon.classList.add(loc.engineIndex===m.intent.destination?'destination-chosen':'destination-legal');polygon.dataset.destination=loc.id;svg.append(polygon);}decorations.unshift(svg);}
  const operation=action.inspect().intent||action.inspect().operation;
  if(action.inspect().busy&&operation){const loc=layout.locations.find(l=>l.engineIndex===(operation.target??operation.origin));for(const a of loc?.accesses.filter(a=>operation.kind==='attack'?a.occupant==='zombie':a.occupant==='barricade')||[]){const mark=element('span',undefined,'action-target-marker '+(operation.kind==='attack'?'attack-target':'build-target'));mark.style.left=camera.x+a.position.x*camera.zoom+'px';mark.style.top=camera.y+a.position.y*camera.zoom+'px';mark.style.width=60*camera.zoom+'px';mark.style.height=28*camera.zoom+'px';decorations.push(mark);}}
  $('map-labels').replaceChildren(...decorations);
  paintLocalityLabels(camera);placeNightDie(camera,viewport);
 }
 // D12 de la noche bajo la localidad que tira; el de combate y movimiento no cambia de lugar.
 function placeNightDie(camera,viewport){
  const card=$('move-sequence'),die=$('exposure-die'),op=sequenceResponse,night=!!sequence&&op?.kind==='exposure'&&!card.hidden;
  if(!night){if(card.dataset.anchor){delete card.dataset.anchor;for(const k of ['left','top','bottom','transform'])card.style[k]='';}return;}
  const loc=layout.locations.find(l=>l.engineIndex===op.origin),zone=scene.zones.find(z=>z.id===loc?.visualId),pin=die.hidden?undefined:{x:die.offsetLeft+die.offsetWidth/2};
  const at=nightDieAnchor(zone,camera,viewport,{width:card.offsetWidth,height:card.offsetHeight},{pin,inset:focusInset()});if(!at)return;
  card.dataset.anchor=at.clamped?'locality-clamped':'locality';card.style.left=at.left+'px';card.style.top=at.top+'px';card.style.bottom='auto';card.style.transform='none';
 }
 // Rótulos persistentes: así el desvanecimiento es una transición y no un salto.
 function paintLocalityLabels(camera){
  const now=performance.now(),selectedId=selectedLocation||projection?.characters.find(c=>c.id===selected)?.locationId||null,live=new Set();
  for(const loc of layout.locations){const zone=scene.zones.find(z=>z.id===loc.visualId),anchor=localityLabelAnchor(zone);if(!anchor)continue;live.add(loc.id);let label=localityLabels.get(loc.id);if(!label){label=element('span',undefined,'locality-label');label.dataset.locality=loc.id;$('locality-labels').append(label);localityLabels.set(loc.id,label);}
   if(label.textContent!==loc.name)label.textContent=loc.name;label.style.left=camera.x+anchor.x*camera.zoom+'px';label.style.top=camera.y+anchor.y*camera.zoom+'px';label.classList.toggle('is-awake',labelVisible({id:loc.id,selectedId:null,awakeUntil:labelsAwakeUntil,now}));label.classList.toggle('is-selected',loc.id===selectedId);}
  for(const [id,label]of localityLabels)if(!live.has(id)){label.remove();localityLabels.delete(id);}
 }
 function slotContext(){
  const zones=new Set(),add=index=>{const z=layout.locations.find(l=>l.engineIndex===index);if(z)zones.add(z.visualId);},hero=layout.characters.find(c=>c.id===selected),chosen=layout.locations.find(l=>l.id===(hero?.locationId||selectedLocation));if(chosen)zones.add(chosen.visualId);
  const m=movement.inspect();if(m.intent&&m.phase!=='idle'){add(m.intent.origin);add(m.intent.destination);}
  const a=action.inspect();if(a.phase!=='idle'){const op=a.intent||a.operation;if(op){add(op.origin);add(op.target);}}
  return {zones:[...zones],visibleEmpty:!!scene.visibleEmptySlots};
 }
 function render(time=performance.now()){
  frame=0;if(disposed||!active||!viewport||!camera)return;draws++;
  if(sequence){const step=sequence.advanceFrame(sequenceLast===null?0:Math.max(0,time-sequenceLast));sequenceLast=time;if(sequenceResponse.kind==='barricade'&&impactApplied)sceneDirty=true;const actor=layout.characters.find(c=>c.id===sequenceResponse.actorId);if(actor&&!sequenceApplied&&!sequenceResponse.kind){const t=step.stage==='travel'?(step.reduced?(step.progress<.5?0:1):step.progress):1;actor.position={x:sequenceFrom.x+(sequenceTo.x-sequenceFrom.x)*t,y:sequenceFrom.y+(sequenceTo.y-sequenceFrom.y)*t};}if(sequenceResponse.kind&&!impactApplied&&(step.stage!=='travel'||sequenceResponse.kind==='barricade'&&step.progress>=.35)){impactApplied=true;applyImpact();}if(['consequence','done'].includes(step.stage)&&!sequenceApplied){sequenceApplied=true;applyPresentationState();}paintSequence(step);if(step.stage==='done'){sequence=null;sequenceLast=null;const done=sequenceCallback;sequenceCallback=null;done?.();}}
  let newBarricades=new Set(),barricadeOpacity=1;
  if(sequence&&sequenceResponse.kind==='barricade'&&impactApplied){const l=layout.locations.find(l=>l.engineIndex===sequenceResponse.origin);newBarricades=new Set((l?.accesses.filter(a=>a.occupant==='barricade')||[]).slice(sequenceResponse.resolution.zoneBefore.b).map(a=>a.id));const step=sequence.inspect();barricadeOpacity=step.stage==='travel'?Math.max(0,Math.min(1,(step.progress-.35)/.65)):1;}
  const selectedNode=null,loc=layout.locations.find(l=>l.id===(movement.inspect().intent?.destination!==null&&movement.inspect().intent?'place-'+movement.inspect().intent.destination:selectedLocation)),zone=scene.zones.find(z=>z.id===loc?.visualId);
  const shown=glide?glideFrame(time):camera;if(glide){sceneDirty=true;if(time-glide.start>=GLIDE_MS)glide=null;}
  if(sceneDirty){submittedCamera={...shown};submittedViewport={...viewport};const panelForFrame=panelTarget;renderer.update({beforePresent:scene.reclaimPanelSpace?()=>applyPanel(panelForFrame):undefined,camera:shown,viewport,nodes:layout.nodes.length?layout.nodes.filter(n=>n.role!=='survivor').map(n=>newBarricades.has(n.id)?{...n,opacity:barricadeOpacity}:n):[{id:'map',assetId:'map',position:{x:0,y:0},depth:0,role:'ground',multiplier:1,visible:true}],slotContours:layout.locations.flatMap(l=>l.accesses),slotContext:scene.slotHierarchy?slotContext():undefined,highlightWidth:scene.outlineWidth,localityHover:scene.hoverOutline&&pointedLocality!==zone?.id&&!['choosing','confirming'].includes(movement.inspect().phase)?scene.zones.find(z=>z.id===pointedLocality)?.outlinePolygon:undefined,localityHighlight:['choosing','confirming'].includes(movement.inspect().phase)?undefined:(zone?.outlinePolygon||zone?.selectionPolygon),state:{selected:selectedNode,showHidden:false,grid:false,gridStep:80,axes:false,pivots:false,bounds:false,layers:{shadows:true,slots:false}}});}
  $('zoom-value').value=Math.round(camera.zoom/(scene.nativeZoomLabel?1:fitMapCamera(scene.bounds,viewport).zoom)*100)+' %';$('zoom-in').disabled=camera.zoom>=camera.maxZoom-1e-10;if(displayCamera)labels(displayCamera,displayViewport);sceneDirty=false;if(sequence||glide)schedule();
 }
 function updateUI(){
  const p=projection;if(!p)return;
  if($('public-objective')){const o=p.objective,c=p.crisis;$('public-objective').textContent=o?o.name+' · Muestras '+value(o.samples)+'/'+value(o.goal):'Objetivo no disponible.';$('public-crisis').textContent=p.cycle?.operation?.colony&&(p.cycle.processing||p.cycle.review)?'Crisis del ciclo en revisión':c?'Crisis: '+value(c.need)+' '+c.type+' · Cartas entregadas: '+value(c.given):'Crisis no disponible.';}
  if(unified()){const o=p.objective,c=p.crisis;$('public-objective').textContent=o?`Objetivo: ${o.samples}/${o.goal} muestras · límite R${p.maxRounds}`:'Elegí un modo para comenzar';$('public-crisis').textContent=c?`Crisis: pide ${c.need} ${c.type} · entregadas: ${c.given}`:'Crisis pendiente';$('crisis-consequence').textContent=c?'Si falla: '+({moral:'−1 moral',food:'hasta −2 comida',zombie:'2 zombis en colonia',wound:p.characters.some(ch=>ch.locationId==='place-0')?'1 herida a menor influencia en colonia':'−1 moral (colonia sin supervivientes)'}[c.failure]||'consultá los detalles'):'';paintCardTips(p);$('hunger').textContent=p.play?.statistics?.hunger??'—';$('waste').textContent=p.play?.statistics?.waste??'—';$('helpless').textContent=value(p.play?.statistics?.helpless??p.locations[0]?.helpless);}
  $('round').textContent=p.ended?(p.cycle?.outcome?.reason==='time'?value(p.maxRounds):value(p.round))+' · fin':value(p.round);$('morale').textContent=value(p.morale);$('food').textContent=value(p.food);$('turn').textContent=p.ended?'Finalizada':p.blocked?(unified()?({setup:'Preparación',handover:'Pase privado',death:'Fallecimientos',waiting:'Conectando',decision:p.turn?playerName(p.turn)+' · decisión':'Decisión'})[p.blocked]:'—'):playerName(p.turn)+(p.automationRunning?' · automático':'');
  const previous=$('locality').value;$('locality').replaceChildren(new Option('Vista general','general'),...p.locations.map(l=>new Option(l.name,l.id)));$('locality').value=[...$('locality').options].some(o=>o.value===previous)?previous:'general';
  $('locality-select').replaceChildren(new Option('Elegir localidad',''),...p.locations.map(l=>new Option(l.name+' · '+l.survivors+' supervivientes',l.id)));$('locality-select').value=selectedLocation||'';
  $('survivor-select').replaceChildren(new Option('Elegir superviviente',''),...p.characters.map(c=>new Option((c.name||'Nombre no disponible')+' · '+playerName(c.playerId)+' · '+(p.locations.find(l=>l.id===c.locationId)?.name||'Localidad no disponible'),c.id)));$('survivor-select').value=selected||'';
  const character=p.characters.find(c=>c.id===selected),loc=p.locations.find(l=>l.id===selectedLocation),drawn=layout.locations.find(l=>l.id===selectedLocation);
  $('character-card').hidden=!character;$('locality-card').hidden=!loc;$('panel-title').textContent=unified()?(character?.name||loc?.name||'Seleccioná una ficha'):character?'Superviviente':loc?'Localidad':'Selección';
  // Al cambiar de superviviente o de localidad, la ficha vuelve arriba (informe 120, punto 10).
  {const subject=character?.id||loc?.id||null;if(subject&&subject!==lastPanelActor)$('panel-content').scrollTop=0;lastPanelActor=subject;}
  if(character){$('character-card').dataset.owner=character.playerId;
   const portrait=kit.assets.find(a=>a.id===portraitFor(character.id));$('portrait').hidden=!portrait;$('portrait-initials').hidden=!!portrait;$('portrait-initials').textContent=initials(character.name);if(portrait){const url=new URL(portrait.file,import.meta.url).href;if($('portrait').src!==url)$('portrait').src=url;}$('portrait').alt=character.name;$('character-name').textContent=character.name||'Nombre no disponible';$('character-name').classList.toggle('long-name',(character.name?.length||0)>10);$('character-card').dataset.characterId=character.id;
   $('character-location').textContent=p.locations.find(l=>l.id===character.locationId)?.name||'Localidad no disponible';$('character-group').textContent=playerName(character.playerId)+(character.leader?' · Líder':'');$('character-identity').textContent=character.job||'';$('influence').textContent=value(character.influence);$('combat').textContent=value(character.effectiveAttack)+'+'+(character.effectiveAttack!==character.attack?' · base '+value(character.attack):'');$('search').textContent=value(character.effectiveSearch)+'+'+(character.effectiveSearch!==character.search?' · base '+value(character.search):'');
   $('character-state').textContent='Heridas: '+value(character.wounds)+' · Congelación: '+value(character.frost)+(character.moved===true?' · Ya se movió':'');{const n=character.night,label=n?.watch?'☾ Hace guardia esta noche · recibe la tirada':n?.outside?'☾ Dormirá afuera':'';$('character-night').textContent=label;$('character-night').hidden=!label;}if(unified())document.querySelector('.skill-details summary').textContent='Habilidad: '+character.skill.name+(!['medic','nurse','builder'].includes(character.skill.id)?' · automática':character.skill.used?' · usada':'');$('character-skill').textContent=[character.skill.name,character.skill.description,character.skill.used===true?'Usada esta ronda':null].filter(Boolean).join(' · ')||'Habilidad no disponible';
   $('character-equipment').replaceChildren(...(character.equipment.length?character.equipment.map(e=>element('li',(e.name||'Objeto no disponible')+(e.description?' — '+e.description:'')+(e.usedRound>0?' · Ya usado esta ronda':''))):[element('li','Sin equipo equipado.')]));
  }else $('character-card').removeAttribute('data-character-id');
  if(loc){
   $('locality-name').textContent=loc.name;$('locality-description').textContent=p.play?.lootLegend?.find(l=>l.index===loc.engineIndex)?.types.map(t=>t.kind+' ('+t.total+')').join(' · ')||'';if($('locality-description').textContent)$('locality-description').textContent='Frecuencia inicial de objetos: '+$('locality-description').textContent;$('locality-capacity').textContent='Ocupación: '+value(loc.occupied)+'/'+value(loc.capacity)+' · Supervivientes: '+loc.survivors+' · Indefensos: '+value(loc.helpless)+' · Plazas libres: '+value(loc.available);$('locality-exterior').textContent=(drawn&&drawn.accesses.length!==loc.exteriorCapacity?'Casillas en mapa: '+drawn.accesses.length+' · Límite actual de partida: '+value(loc.exteriorCapacity):'Accesos: '+value(loc.exteriorCapacity))+' · Zombis: '+value(loc.zombies)+' · Barricadas: '+value(loc.barricades)+' · Libres: '+value(loc.exteriorAvailable)+' · Ruido: '+value(loc.noise);
   $('locality-overflow').textContent=unified()?'':drawn?('Fichas dibujadas '+drawn.drawnCharacters.length+'/'+loc.survivors+'. '+(drawn.characterOverflow.length?'Excedente de '+drawn.characterOverflow.length+' por falta de posiciones visuales; lista completa debajo. ':'')+(drawn.externalOverflow?'Excedente exterior: '+drawn.externalOverflow+'. Los conteos siguen completos.':'') ):'Localidad sin posición en este dibujo; datos completos disponibles.';
   $('locality-survivors').replaceChildren(...p.characters.filter(c=>c.locationId===loc.id).map(c=>{const button=element('button');button.dataset.character=c.id;button.setAttribute('aria-label','Consultar a '+c.name+', '+playerName(c.playerId));button.append(element('span',c.name||'Nombre no disponible'),element('span',playerName(c.playerId)));return button;}));
   if(!loc.survivors)$('locality-survivors').append(element('p','Sin supervivientes presentes.'));
  }
  if(unified())$('character-inventory').hidden=!character||character.playerId!==p.turn;
  $('dice-owner').textContent=p.dice.ownerId?'Dados de '+playerName(p.dice.ownerId):unified()?(p.ended?'Partida finalizada':p.turn?'Dados de '+playerName(p.turn)+' · en pausa':'Dados'):'Sin turno activo';$('dice-pool').replaceChildren(...(p.dice.available||[]).map((n,i)=>{const face=dieFace(n),die=element('span',face.pips?undefined:face.label,'die'+(face.pips?'':' numeric'));die.dataset.value=String(n);die.setAttribute('aria-label','Dado disponible '+(i+1)+', valor '+n);for(const pos of face.pips||[]){const pip=element('span',undefined,'pip');pip.style.gridRow=Math.ceil(pos/3);pip.style.gridColumn=(pos-1)%3+1;pip.setAttribute('aria-hidden','true');die.append(pip);}return die;}));$('dice-status').textContent=p.dice.available===null?'Reserva no visible en esta fase.':p.dice.available.length?'Disponibles del turno.':'Sin dados disponibles.';
  const totalZ=p.locations.reduce((n,l)=>n+(l.zombies||0),0),totalB=p.locations.reduce((n,l)=>n+(l.barricades||0),0);$('occupation-summary').textContent=p.blocked?reason[p.blocked]:'En el mapa: '+p.characters.length+' supervivientes · '+totalZ+' zombis · '+totalB+' barricadas.';$('unmapped-summary').textContent=layout.unmappedCharacterIds.length?layout.unmappedCharacterIds.length+' supervivientes sin posición en el dibujo. Todos disponibles en el selector.':'';updateMovement();if(infoKind&&$('info-dialog').open)showInfo(infoKind,false);
 }
 function cancelMovement(){const phase=movement.inspect().phase;if(phase==='confirming'){movement.back();$('scene').focus({preventScroll:true});return;}if(phase!=='choosing')return;movement.cancel();focusPanelControl('move-action');}
 function updateMovement(){sceneDirty=true;
  const m=movement.inspect();if(m.phase!==lastMovementPhase){sceneDirty=true;lastMovementPhase=m.phase;if(m.phase==='choosing'){$('keyboard-destinations').open=unified();if(!unified()&&matchMedia(scene.closePanelOnFocus?'(max-width:950px)':'(max-width:800px)').matches)panel(false);}}const info=projection?.movement?.options[acting()],busy=action.inspect().busy||search.inspect().busy||['sending','unknown','presenting','awaiting-decision'].includes(m.phase),choosing=['choosing','confirming'].includes(m.phase),confirming=m.phase==='confirming';
  $('keyboard-destinations').hidden=confirming;$('move-action').disabled=!active||!info?.allowed||busy;$('move-action').title=movementMessages[info?.reason]||'Elegir destino y confirmar';$('actions-status').textContent=info?.allowed?'':movementMessages[info?.reason]||'';$('move-planner').hidden=!choosing;
  $('confirm-move').disabled=!confirming;$('move-confirmation').hidden=!confirming;$('cancel-move').hidden=!confirming;$('move-guide').hidden=confirming;$('move-guide').textContent=m.message;$('move-status').textContent=m.message;
  const actor=projection?.characters.find(c=>c.id===m.intent?.actorId),name=id=>projection?.locations.find(l=>l.engineIndex===id)?.name||'—';$('move-summary').textContent=actor&&confirming?'¿Mover a '+actor.name+' de '+name(m.intent.origin)+' a '+name(m.intent.destination)+'?':actor?'Mover a '+actor.name:'';
  const select=$('move-destination'),saved=m.intent?.destination;select.replaceChildren(new Option('Elegí una localidad',''));for(const loc of projection?.locations||[]){const option=new Option(loc.name,loc.engineIndex);option.disabled=!projection.movement.options[m.intent?.actorId]?.destinations.includes(loc.engineIndex);select.append(option);}select.value=saved===null||saved===undefined?'':String(saved);
  $('survivor-select').disabled=search.inspect().busy||actionSelectionBusy()||['sending','unknown','presenting','awaiting-decision'].includes(m.phase);$('locality-select').disabled=busy;
  if(m.phase==='awaiting-decision'){$('move-sequence').hidden=false;$('sequence-status').textContent=m.message;$('resolve-decision').hidden=false;}
  else if(!sequence){$('move-sequence').hidden=true;$('resolve-decision').hidden=true;}
  inventoryPanel.render();searchPanel.render();if(action.inspect().busy)$('search-action').disabled=true;
  actionPanel.render();if(unified()){const sel=acting(),a=projection?.characters.find(c=>c.id===sel),opts=projection?.play?.options?.[sel];for(const id of ['move','search','attack','barricade','clean','attract','special','return-home']){const b=$(id+'-action'),hint=document.querySelector('[data-action-hint=\"'+id+'-action\"]');if(id==='special')b.closest('.action-control').hidden=!['medic','nurse'].includes(a?.skill.id);if(id==='return-home')b.closest('.action-control').hidden=opts?.['return-home']?.reason==='rule';if(hint){const q=id==='move'?projection?.movement.options[sel]:id==='search'?projection?.search.options[sel]:['attack','barricade'].includes(id)?projection?.action.options[sel]?.[id]:opts?.[id];hint.textContent=q?.allowed?({move:'Sin dado · exposición',search:(q.requirement||1)+'+',attack:(q.requirement||1)+'+',barricade:'Dado 1+ o habilidad',clean:'Dado 1+',attract:'Dado 1+',special:'Una vez por ronda','return-home':'Dado 1+ · cuenta como movimiento'})[id]:(ACTION_REASONS[q?.reason]||'No disponible ahora');if(id==='barricade'){const free=projection?.action.options[sel]?.['barricade-ability'];hint.textContent=free?.allowed?(q?.allowed?'Dado 1+ o habilidad sin dado':'Habilidad sin dado'):q?.allowed?'Dado 1+':free?.reason==='skill-used'?'Habilidad usada · '+hint.textContent:hint.textContent;}}}}cyclePanel.render();playPanel.render();workspace.render();if(inventory?.inspect().busy)for(const id of ['search-action','attack-action','barricade-action','move-action'])$(id).disabled=true;const show=active&&projection?.characters.find(c=>c.id===selected)?.playerId===projection?.turn;
  $('action-shortcuts').hidden=unified()||!show||action.inspect().busy||search.inspect().busy||movement.inspect().phase!=='idle';for(const b of document.querySelectorAll('[data-shortcut]'))b.disabled=$(b.dataset.shortcut).disabled;
  renderBar();schedule();
 }
 function updateActions(){const phase=action.inspect().phase;if(phase!==lastActionPhase){lastActionPhase=phase;if(!unified()&&phase==='picking'&&matchMedia('(max-width:950px),(max-height:500px)').matches)panel(false);}updateMovement();}
 function updateSearch(){const phase=search.inspect().phase;if(phase!==lastSearchPhase){lastSearchPhase=phase;if(!unified()&&phase==='picking'&&matchMedia('(max-width:800px)').matches)panel(false);}updateMovement();}
 function applyPresentationState(){if(!sequenceResponse?.presentation)return;const next={...sequenceResponse.presentation,movement:projection.movement,search:projection.search,action:projection.action};projection=next;layout=stableLayout.project(next);if(!next.characters.some(c=>c.id===selected))selected=null;updateUI();sceneDirty=true;}
 function applyImpact(){
  if(!['attack','barricade'].includes(sequenceResponse.kind))return;
  if(sequenceResponse.kind==='barricade'){applyPresentationState();sequenceApplied=true;return;}
  const next={...projection,locations:projection.locations.map(l=>l.engineIndex===sequenceResponse.origin?{...l,zombies:sequenceResponse.resolution.zoneBefore.z-sequenceResponse.resolution.killed}:l)};
  projection=next;layout=stableLayout.project(next);sceneDirty=true;
 }
 function paintSequence(step){
  const op=sequenceResponse,isAction=!!op.kind;
  const text=op.kind==='exposure'?('La noche en '+projection.locations.find(l=>l.engineIndex===op.origin)?.name+' · '+op.name+(['travel','roll'].includes(step.stage)?'': ' · '+exposureText(step.exposure))):isAction?(step.stage==='travel'?(op.kind==='attack'?op.name+' ataca a los zombis.':op.name+' construye barricadas.'):step.stage==='roll'?'Exposición · '+op.name:step.stage==='reveal'?op.name+' · '+actionExposureText(step.exposure):actionSummary(op)):(step.stage==='travel'?'Traslado · '+op.name:step.stage==='roll'?'Exposición · '+op.name:step.stage==='reveal'?op.name+' · '+exposureText(step.exposure):movementSummary(op,projection.locations));
  if($('sequence-status').textContent!==text)$('sequence-status').textContent=text;
  // Sesión 7 (informe 126): el dado nocturno va centrado en su casilla de papel: título arriba,
  // dado al medio y «Tirando…» o el resultado abajo. #sequence-status conserva el texto entero.
  const night=op.kind==='exposure',card=$('move-sequence');if(night){card.dataset.kind='night';const title='La noche en '+(projection.locations.find(l=>l.engineIndex===op.origin)?.name||'—')+' · '+op.name,result=['travel','roll'].includes(step.stage)?'Tirando…':exposureText(step.exposure);if($('night-title').textContent!==title)$('night-title').textContent=title;if($('night-result').textContent!==result)$('night-result').textContent=result;}else if(card.dataset.kind){delete card.dataset.kind;$('night-title').textContent=$('night-result').textContent='';}
  $('move-sequence').dataset.stage=step.stage;paintExposureDie($('exposure-die'),step);
 }
 function startActionPresentation(response,done){
  stopPresentation();$('floating-menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');sequenceResponse=response;sequenceCallback=done;sequenceApplied=false;impactApplied=false;sequenceLast=null;
  sequence=createPresentationSequence({...response,resolution:{...response.resolution,exposure:response.resolution.exposure||{rolled:false,value:null,effect:'none'}}},{reduced:motion.matches||!!$('motion-reduced')?.checked,introDuration:response.kind==='exposure'?0:550,resultDuration:response.kind==='barricade'?0:1100});
  $('move-sequence').hidden=false;$('resolve-decision').hidden=true;selected=response.actorId;if(response.kind==='exposure')updateUI();else updateActions();schedule();
 }
 function startPresentation(response,done){
  stopPresentation();$('floating-menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');sequenceResponse=response;let actor=layout.characters.find(c=>c.id===response.actorId);if(!actor){const data=projection.characters.find(c=>c.id===response.actorId),loc=layout.locations.find(l=>l.engineIndex===response.from),zone=scene.zones.find(z=>z.id===loc?.visualId);actor={...data,portraitId:portraitFor(response.actorId),initials:initials(data?.name),diameter:zone?.portraitDiameter||44,position:{...loc.badgePosition}};layout.characters.push(actor);}sequenceFrom={...actor.position};sequenceTo=destinationPosition(layout,scene,response.destination);sequenceCallback=done;sequenceApplied=false;sequenceLast=null;sequence=createPresentationSequence(response,{reduced:motion.matches||!!$('motion-reduced')?.checked});$('move-sequence').hidden=false;$('resolve-decision').hidden=true;selected=response.actorId;updateMovement();schedule();
 }
 function stopPresentation(){sequence?.interrupt();sequence=null;sequenceLast=null;sequenceCallback=null;delete $('move-sequence').dataset.kind;$('move-sequence').hidden=true;placeNightDie();}
 function syncAmbient(){
  if(!audio)return;const sound=audio.inspect(),visual=settings.enabled&&['snow','wind','smoke','lights'].some(k=>settings[k]),any=visual||sound.enabled;$('ambient-enabled').setAttribute('aria-pressed',String(any));$('ambient-enabled').textContent=any?'Ambientación: activada':'Ambientación: desactivada';
  for(const b of document.querySelectorAll('[data-ambient]'))b.setAttribute('aria-pressed',String(settings.enabled&&settings[b.dataset.ambient]));$('ambient-intensity').value=settings.intensity;$('ambient-reduced').hidden=!motion.matches;$('ambient-status').textContent=!active?'Ambientación en pausa.':visual?'Intensidad '+(settings.intensity==='soft'?'Suave.':'Tormenta.'):'Sin efectos animados.';
  $('ambient-audio').setAttribute('aria-pressed',String(sound.enabled));$('ambient-audio').textContent=sound.enabled?'Ventisca: sonido activado':'Ventisca: sonido desactivado';$('ambient-volume').value=String(Math.round(sound.volume*100));$('ambient-volume-value').value=Math.round(sound.volume*100)+'%';$('ambient-audio-status').textContent=sound.error||(sound.enabled?(sound.paused?'Sonido en pausa.':sound.state==='running'?'Sonido de ventisca activo.':'Audio suspendido; desactivá y volvé a activar el sonido.'):'Sin sonido. Activación expresa disponible.');
 }
 function setAmbient(patch){settings={...settings,...patch};renderer.setAtmosphere(patch);syncAmbient();}
 function pause(){renderer.pauseAtmosphere(!active||document.hidden||contextLost);audio.setPaused(!active||document.hidden||contextLost);syncAmbient();}
 // Detalle de las tarjetas en globos (informe 125, ajustes): mismo texto que el diálogo de información.
 // La descripción del objetivo también queda en el texto para lectores de pantalla.
 function paintCardTips(p){const o=p.objective,c=p.crisis,set=(el,title,text)=>{if(!el)return;if(el.dataset.tipTitle!==title)el.dataset.tipTitle=title;if(el.dataset.tipText!==text)el.dataset.tipText=text;};
  set($('objective-details'),o?.name||'Objetivo',o?[o.description,'Muestras: '+value(o.samples)+'/'+value(o.goal)+' · Ronda '+value(p.round)+'/'+value(p.maxRounds)].filter(Boolean).join(' · '):'Objetivo no disponible.');
  if(o?.description)$('public-objective').textContent+=' · '+o.description;
  set($('crisis-details'),'Crisis',c?'Requisito: '+value(c.need)+' '+value(c.type)+' · Cartas entregadas: '+value(c.given)+' · '+$('crisis-consequence').textContent:'Crisis no disponible.');}
 function showInfo(kind,open=true){
  if(open)workspace.rememberOpener?.(document.activeElement?.id);infoKind=kind;const content=$('dialog-content');content.replaceChildren();const add=text=>content.append(element('p',text));
  const titles={objetivo:'Objetivo',crisis:'Crisis',registro:'Registro',equipo:'Equipo del superviviente',ayuda:'Ayuda',encrucijadas:'Encrucijadas'};$('dialog-title').textContent=titles[kind];
  if(kind==='encrucijadas'){const c=projection?.play?.crossStatus;add(c?'Carta del turno: '+c.state+'. Relatos existentes: '+c.count+'.':'Sin información de encrucijadas.');add('Cada turno prepara una carta oculta. Solo se revela al cumplir su condición; si no se activa, no se juega. Las cartas futuras permanecen ocultas.');}
  if(kind==='objetivo'){const o=projection?.objective;add(o?.name||'Objetivo no disponible.');if(o?.description)add(o.description);if(o)add('Muestras: '+value(o.samples)+'/'+value(o.goal)+' · Ronda '+value(projection.round)+'/'+value(projection.maxRounds));}
  if(kind==='crisis'){const c=projection?.crisis;if(c){add('Requisito: '+value(c.need)+' '+value(c.type)+' · Cartas entregadas: '+value(c.given));add('Efecto de fallo: '+({moral:'pérdida de moral',food:'pérdida de comida',zombie:'llegada de zombis',wound:'heridas'}[c.failure]||'información no disponible'));}else add('Crisis no disponible.');}
  if(kind==='registro'){
   const events=projection?.play?.events||[],journal=projection?.cycle?.journal||[],rounds=[...new Set([...events,...journal].map(e=>e.round))].sort((a,b)=>a-b);
   if(!rounds.length)add('Todavía no hay eventos registrados.');
   for(const round of rounds){content.append(element('h3','Ronda '+round));const list=element('ol');
    const rows=[...events.filter(e=>e.round===round).map(e=>({order:e.order,event:e})),...journal.filter(e=>e.round===round).map(entry=>({order:entry.order,entry}))].sort((a,b)=>(a.order||0)-(b.order||0));
    for(const item of rows){const row=element('li');if(item.event){const e=item.event,important=['death','cross','bite-roll','bite-sacrifice','end','leader','recruit'].includes(e.type),detail=['die','findings','equipment-use','ability'].includes(e.type),text=eventText(e,projection.locations,projection.players)+(e.audience==='public'?'':' · Solo tu grupo');if(detail){const d=element('details');d.append(element('summary','Detalle · '+(e.name||'acción')),element('p',text));row.append(d);}else row.append(element('strong',important?'Evento importante · ':'Acción · '),document.createTextNode(text));}else{const info=describeCycleStep(item.entry),d=element('details');d.append(element('summary','Colonia · '+info.title),element('p',info.explanation));for(const change of info.changes)d.append(element('p',change));row.append(d);}list.append(row);}content.append(list);
   }
  }
  if(kind==='equipo'){const c=projection?.characters.find(c=>c.id===selected);if(!c)add('Seleccioná un superviviente para consultar su equipo público. La mano del turno está en el panel lateral.');else{add(c.name);for(const e of c.equipment)add((e.name||'Objeto sin nombre')+(e.description?' — '+e.description:''));if(!c.equipment.length)add('Sin equipo equipado.');}}
  if(kind==='ayuda'&&projection?.play){for(const [title,text]of help){content.append(element('h3',title));add(text);}const s=projection.play.statistics;if(s)add('Hambre: '+s.hunger+' · Residuos: '+s.waste+' · Indefensos: '+s.helpless+' · Rescates: '+s.rescues);for(const [title,text]of statistics){content.append(element('h3',title));add(text);}}
  if(kind==='ayuda'&&scene.slotHierarchy)add('Seleccioná una localidad o acercá la cámara para destacar sus espacios. El trazo continuo y el grosor distinguen la selección; zombis y barricadas permanecen visibles.');
  if(kind==='ayuda'&&!projection?.play)add('Arrastrá para desplazar y usá rueda o pinza para acercar. Con teclado: flechas, +, − y0. Seleccioná un superviviente propio para moverse, buscar, atacar o construir. Revisá el coste y confirmá; Escape cancela antes de ejecutar. Los dados y el inventario pertenecen al grupo del turno; el equipo pertenece a cada superviviente. Otras acciones y decisiones continúan en V9.9. Las listas incluyen a todos los supervivientes.');
  $('floating-menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');if(open)present($('info-dialog'));workspace.render();
 }
 try{
  if(!webglAvailable())throw Error('WEBGL_UNAVAILABLE');
  const originals=await waitForStartup(loadResources(kit),{signal,deadline});signal?.throwIfAborted();const prepared=withMapFilter(prepareResources(kit,originals,{factor:1}));
  renderer=await createWorkshopRenderer(canvas,kit,prepared,{signal,deadline,backgroundColor:'#171d20',atmosphereFrameRate:atmosphere.frameRate,atomicResize:!!scene.reclaimPanelSpace,createAtmosphere:mountAtmosphere});signal?.throwIfAborted();audio=createWindAudio(atmosphere.audio,{onChange:()=>{if(!disposed)syncAmbient();}});pause();
  observer=new ResizeObserver(resize);observer.observe(scene.reclaimPanelSpace?canvas.parentElement:canvas);window.addEventListener('resize',resize,options);
  unbind=bindControls({canvas,onPan:(x,y)=>viewport&&interact(panCamera(camera,x,y)),onZoom:(factor,anchor=center())=>viewport&&interact(zoomCameraAt(camera,factor,anchor)),onPinch:(a,b,f)=>viewport&&interact(pinchCamera(camera,a,b,f)),onPick:point=>{if(!camera||search.inspect().busy||actionSelectionBusy())return;const world=screenToWorld(displayCamera||camera,point);if(['sending','presenting','awaiting-decision','unknown'].includes(movement.inspect().phase))return;if(['choosing','confirming'].includes(movement.inspect().phase)){const visual=pickLocality(scene,world,(displayCamera||camera).zoom),loc=layout.locations.find(l=>l.visualId===visual);if(loc)movement.choose(loc.engineIndex);return;}const target=pickMapTarget(scene,layout.characters,world,(displayCamera||camera).zoom);if(target.characterId)selectCharacter(target.characterId,{open:false});else selectLocality(layout.locations.find(l=>l.visualId===target.localityId)?.id||null);},onReset:reset,onSelect:()=>selected?selectCharacter(selected,{open:false}):selectedLocation?selectLocality(selectedLocation):projection?.characters[0]&&selectCharacter(projection.characters[0].id,{open:false}),onClear:()=>{if(document.querySelector('#inventory-dialog')?.open)return;if(action.inspect().phase==='picking'){const kind=action.inspect().intent.kind;action.cancel();focusPanelControl(kind.startsWith('barricade')?'barricade-action':'attack-action');return;}if(search.inspect().phase==='picking'){if(search.cancel())focusPanelControl('search-action');return;}if(search.inspect().busy||action.inspect().busy)return;if(['sending','unknown','presenting','awaiting-decision'].includes(movement.inspect().phase))return;if(['choosing','confirming'].includes(movement.inspect().phase)){cancelMovement();return;}selected=selectedLocation=null;updateUI();schedule();}});
  listen('[data-shortcut]','click',e=>$(e.currentTarget.dataset.shortcut).click());listen('#move-action','click',()=>movement.begin(acting()));
  // Paneles plegables (informe 123): pestañas de papel y «H» para todo. Nunca tocan el juego.
  // Tocar el panel lo pliega o despliega (delegación en folds.mjs); los controles internos no. La ficha pasa por «×/Ficha», el mismo camino que ya descarta borradores.
  let statTips=null;
  mountFoldPanels(FOLD_KEYS.map(key=>({key,el:document.querySelector('[data-fold-zone='+key+']'),hit:document.querySelector('.fold-hit[data-fold='+key+']'),zone:key==='dossier'?'.panel-heading':null})),{isFolded:key=>key==='dossier'?document.body.dataset.panelOpen==='false':!!folds[key],toggle:key=>{if(key==='dossier')$('panel-toggle').click();else setFold(key,!folds[key]);},skip:e=>!!statTips?.longPressed(e.target),signal:ui.signal});
  // Un toque durante la tirada la adelanta al resultado (informe 125, ajustes). Solo mueve el reloj visual: no tira, no manda nada al motor, y ese toque no hace nada más.
  document.addEventListener('pointerdown',e=>{if(!active||!sequence?.skipRoll())return;e.preventDefault();e.stopPropagation();const swallow=ev=>{ev.preventDefault();ev.stopPropagation();};document.addEventListener('click',swallow,{capture:true,once:true,signal:ui.signal});setTimeout(()=>document.removeEventListener('click',swallow,{capture:true}),600);schedule();},{capture:true,signal:ui.signal});
  document.addEventListener('keydown',e=>{if(!active||!isFoldShortcut(e,{modalOpen:!!document.querySelector('dialog:modal')}))return;e.preventDefault();const next=toggleAll(folds);for(const k of FOLD_KEYS)if(next[k]!==folds[k])setFold(k,next[k],{refit:false});refitCamera();},{signal:ui.signal});
  statTips=mountStatTips({signal:ui.signal});applyFolds();panel(false);
  // Sesión 7 (informe 126): barra única. Un doble clic o doble toque (detail>1) sobre una
  // acción de la barra se descarta antes de llegar al botón: nunca abre dos veces un borrador.
  $('action-bar').addEventListener('click',e=>{const b=e.target.closest?.('button');if(!b||!b.closest('#bar-actions,.bar-dice-zone'))return;if(e.detail>1){e.stopImmediatePropagation();e.preventDefault();return;}if(b.id)lastOpener=b.id;},{capture:true,signal:ui.signal});
  listen('#bar-more','click',()=>{if(barGuard('more'))setFan(!fanOpen);});listen('#bar-fan','click',e=>{if(e.target.closest('button'))setFan(false);});
  document.addEventListener('pointerdown',e=>{if(fanOpen&&!e.target.closest?.('#bar-fan,#bar-more'))setFan(false);},{capture:true,signal:ui.signal});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fanOpen&&!e.defaultPrevented){e.preventDefault();e.stopPropagation();setFan(false);$('bar-more').focus({preventScroll:true});}},{capture:true,signal:ui.signal});
  listen('#action-strip-cancel','click',()=>{if(barGuard('strip-cancel'))cancelCurrent();});
  listen('#bar-portrait','click',()=>{if(barGuard('portrait'))barDetail();});listen('[data-dossier-open]','click',e=>$(e.currentTarget.dataset.dossierOpen)?.click());
  // Atajos de escritorio (turn-flow.mjs): nunca en campos de texto, con modificadores, con un modal ni en el pase.
  document.addEventListener('keydown',e=>{if(!active)return;const k=turnShortcut(e,{modalOpen:!!document.querySelector('dialog:modal'),blocked:!projection||!!projection.blocked});if(!k)return;
   if(k==='dossier'){e.preventDefault();if(barGuard('key:dossier'))barDetail();return;}
   if(k==='finish'){const b=$('finish-turn');if(!b||b.disabled||!b.getClientRects().length)return;e.preventDefault();if(barGuard('key:finish'))b.click();return;}
   if(k.startsWith('die:')){if(!flow?.dice)return;e.preventDefault();chooseDieAt(Number(k.slice(4)));return;}
   const b=$(k+'-action');if(!b||b.disabled||flow)return;e.preventDefault();if(barGuard('key:'+k))b.click();},options);listen('#move-destination','change',e=>{if(movement.choose(Number(e.target.value)))$('confirm-move').focus({preventScroll:true});});listen('#confirm-move','click',()=>movement.confirm());listen('#cancel-move','click',cancelMovement);listen('#exit-move','click',()=>{if(['choosing','confirming'].includes(movement.inspect().phase)){movement.cancel();focusPanelControl('move-action');}});document.addEventListener('keydown',e=>{if(e.defaultPrevented)return;if(e.key==='Escape'&&['choosing','confirming'].includes(movement.inspect().phase)){e.preventDefault();cancelMovement();}},options);
  // Esc cierra el expediente si nada más lo usó (borradores, Registro, Ajustes, inventario).
  // Con el foco en el mapa, Esc ya lo consume el lienzo (limpia la selección): igual cierra el expediente,
  // salvo que ese mismo Esc haya cancelado una acción en curso (se mira el estado al empezar la tecla).
  let escFlow=false;document.addEventListener('keydown',e=>{if(e.key==='Escape')escFlow=!!flow;},{capture:true,signal:ui.signal});
  document.addEventListener('keydown',e=>{if((e.defaultPrevented&&e.target!==canvas)||e.key!=='Escape'||!panelTarget||flow||escFlow||document.querySelector('dialog:modal'))return;e.preventDefault();$('panel-toggle').click();$('bar-portrait')?.focus({preventScroll:true});},options);
  listen('#panel-toggle','click',()=>{panel(scene.reclaimPanelSpace?!panelTarget:document.body.dataset.panelOpen==='false');resize();});listen('#zoom-in','click',()=>viewport&&interact(zoomCameraAt(camera,1.25,center())));listen('#zoom-out','click',()=>viewport&&interact(zoomCameraAt(camera,.8,center())));listen('#reset-view','click',reset);listen('#locality','change',e=>e.target.value==='general'?reset():focus(e.target.value));listen('#locality-select','change',e=>selectLocality(e.target.value));listen('#survivor-select','change',e=>selectCharacter(e.target.value));listen('#locality-survivors','click',e=>{const button=e.target.closest('[data-character]');if(button)selectCharacter(button.dataset.character);});
  listen('#menu-toggle','click',()=>{const menu=$('floating-menu');menu.hidden=!menu.hidden;$('menu-toggle').setAttribute('aria-expanded',String(!menu.hidden));});listen('[data-info]','click',e=>showInfo(e.currentTarget.dataset.info));listen('#close-dialog','click',()=>{infoKind=null;$('info-dialog').close();workspace.render();});listen('#info-dialog','close',()=>{if(!$('info-dialog').open)infoKind=null;});
  // Un panel de contexto (por ejemplo, Grupo y líderes) que se cierra dentro de la ficha no
  // deja la ficha desplazada sobre la lista de la localidad (informe 120, punto 10).
  $('panel-content').addEventListener('close',e=>{if(e.target?.dataset?.surface==='context')$('panel-content').scrollTop=0;},{capture:true,signal:ui.signal});
  animateExits([[$('panel-content'),$('dossier')],...['floating-menu','info-dialog','play-dialog','cycle-dialog','inventory-dialog'].map($)],ui.signal);
  if($('motion-reduced')){$('motion-reduced').checked=motion.matches;listen('#motion-reduced','change',()=>{document.body.dataset.motion=$('motion-reduced').checked?'reduced':'normal';if($('motion-reduced').checked&&sequence){sequence.advance(1e6);schedule();}});}
  // Movimiento reducido: luces fijas y el bucle vuelve a dormir; al quitarlo, vuelve el parpadeo.
  {const wakeLights=()=>{nightView?.refresh();renderer?.setAtmosphere({});};motion.addEventListener?.('change',wakeLights,{signal:ui.signal});listen('#motion-reduced','change',wakeLights);}
  listen('#ambient-enabled','click',()=>{const on=!(settings.enabled&&['snow','wind','smoke','lights'].some(k=>settings[k])||audio.inspect().enabled);if(!on)audio.setEnabled(false);setAmbient({enabled:on,snow:on,wind:on,smoke:on,lights:on});});listen('[data-ambient]','click',e=>{const key=e.currentTarget.dataset.ambient;setAmbient(settings.enabled?{[key]:!settings[key]}:{enabled:true,snow:false,wind:false,smoke:false,lights:false,[key]:true});});listen('#ambient-intensity','change',e=>setAmbient({intensity:e.target.value}));listen('#ambient-audio','click',()=>audio.setEnabled(!audio.inspect().enabled));listen('#ambient-volume','input',e=>audio.setVolume(Number(e.target.value)/100));motion.addEventListener('change',e=>{if(e.matches&&sequence){sequence.advance(1e6);schedule();}if(e.matches)setAmbient({enabled:false,snow:false,wind:false,smoke:false,lights:false});syncAmbient();},options);document.addEventListener('visibilitychange',pause,options);
  canvas.addEventListener('pointerdown',wakeLabels,options);
  canvas.addEventListener('pointermove',event=>{if(camera&&performance.now()>labelsAwakeUntil-LABEL_WAKE_MS+250)wakeLabels();if(!camera||!scene.hoverOutline&&!['choosing','confirming'].includes(movement.inspect().phase))return;if(event.buttons){if(pointedLocality){pointedLocality=null;sceneDirty=true;schedule();}return;}const rect=canvas.getBoundingClientRect(),visual=pickLocality(scene,screenToWorld(displayCamera||camera,{x:event.clientX-rect.left,y:event.clientY-rect.top}),(displayCamera||camera).zoom),loc=layout.locations.find(l=>l.visualId===visual);if(scene.hoverOutline&&pointedLocality!==visual){pointedLocality=visual;sceneDirty=true;schedule();}if(!['choosing','confirming'].includes(movement.inspect().phase))return;hoveredLocation=loc?.id||null;$('destination-name').textContent=loc?.name||'';$('destination-name').hidden=!loc;},options);
  canvas.addEventListener('pointerleave',()=>{if(pointedLocality){pointedLocality=null;sceneDirty=true;schedule();}hoveredLocation=null;$('destination-name').hidden=true;},options);
  canvas.addEventListener('webglcontextlost',()=>{contextLost=true;pause();feedback('Se perdió el contexto gráfico. Usá Reintentar mapa para recuperar la misma partida.');$('retry-view').hidden=false;},options);canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;pause();$('retry-view').hidden=true;schedule();},options);
  $('loading').hidden=true;$('retry-view').hidden=true;$('floating-menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');panel(false);syncAmbient();// Sesión 7: el expediente empieza cerrado; se abre con el retrato o E.
  return {
   updateMovement,updateSearch,updateActions,startPresentation,startActionPresentation,stopPresentation,
   setState(next){if(disposed)return;if(projection?.turn!==next.turn){selected=null;selectedLocation=null;}projection=next;sceneDirty=true;if(epoch!==next.epoch)stableLayout.reset();layout=stableLayout.project(next);if(epoch!==next.epoch){selected=null;selectedLocation=null;epoch=next.epoch;camera=null;resizeAnchor=null;resizeZoom=null;}if(!next.characters.some(c=>c.id===selected))selected=null;if(!selected&&next.characters.some(c=>c.id===next.search?.private?.operation?.actorId))selected=next.search.private.operation.actorId;if(!selected&&next.characters.some(c=>c.id===next.action?.operation?.actorId))selected=next.action.operation.actorId;if(selected)selectedLocation=null;else if(!next.locations.some(l=>l.id===selectedLocation)){selectedLocation=next.blocked?null:next.locations[0]?.id||null;localityChosen=false;}updateUI();resize();schedule();},
   restoreView(saved){if(!viewport||!saved?.camera)return;selected=projection?.characters.some(c=>c.id===saved.selected)?saved.selected:null;selectedLocation=projection?.locations.some(l=>l.id===saved.selectedLocation)?saved.selectedLocation:null;change({...saved.camera});updateUI();schedule();},
   setActive(value){active=!!value;if(!active){pointedLocality=null;infoKind=null;$('info-dialog').close();workspace.render();$('floating-menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');}if(!active&&frame){cancelAnimationFrame(frame);frame=0;}pause();updateMovement();if(active){resize();schedule();}},
   inspect(){return {active,selected,selectedLocation,epoch,pointedLocality,renderPending:!!frame||submittedCamera!==displayCamera,panel:{requestedOpen:panelTarget,presentedOpen:!$('panel-content').hidden},camera:camera?{...camera}:null,viewport:viewport?{...viewport}:null,commands,draws,layout:structuredClone(layout),renderer:renderer.inspect(),audio:audio.inspect(),contextLost,presentation:sequence?.inspect()||null,action:action.inspect(),movement:movement.inspect(),workspace:workspace.inspect?.()};},
   // Atmósfera de noche, solo presentación: begin/end acompañan las tiradas nocturnas que ya
   // presenta la cola; adopt toma el estado actual (día) sin animar.
   night(kind){if(disposed)return;const now=performance.now();if(kind==='begin')nightState.begin(now);else if(kind==='end')nightState.end(now);else nightState.adopt();nightView?.refresh();renderer?.setAtmosphere({});},
   worldAt:point=>renderer.worldAt(point),
   async destroy(){if(disposed)return;disposed=true;active=false;playPanel.render();cyclePanel.render();inventoryPanel.render();searchPanel.render();actionPanel.render();stopPresentation();ui.abort();observer.disconnect();unbind();if(frame)cancelAnimationFrame(frame);$('info-dialog').close();const graphics=renderer.destroy(),audioRelease=await audio.destroy();clearTimeout(labelTimer);$('map-labels').replaceChildren();$('locality-labels').replaceChildren();localityLabels.clear();$('actor-markers').replaceChildren();actors.clear();return {...graphics,audioRelease,disposed:true};}
  };
 }catch(error){disposed=true;ui.abort();observer?.disconnect();unbind?.();if(frame)cancelAnimationFrame(frame);const cleanup=renderer?.destroy();await audio?.destroy();if(cleanup?.cleanupErrors?.length)error.cleanupErrors=cleanup.cleanupErrors;throw error;}
}
