import scene from '../hospital-workshop/mockup/scene.json';
import uploaded from '../hospital-workshop/uploaded-kit.json';
import manifest from '../../kit_arte_h33/manifest.json';
import atmosphere from './storm.json';
import {makeMockupKit} from '../hospital-workshop/mockup/assets.mjs';
import {loadResources,prepareResources} from '../hospital-workshop/resources.mjs';
import {createWorkshopRenderer} from '../hospital-workshop/renderer.mjs';
import {createAtmosphereView} from './storm-view.mjs';
import {initialAtmosphereSettings} from './storm-model.mjs';
import {createWindAudio} from '../hospital-workshop/mockup/atmosphere-audio.mjs';
import {fitMapCamera,constrainCamera,focusLocality} from '../hospital-workshop/mockup/camera.mjs';
import {panCamera,zoomCameraAt,pinchCamera,screenToWorld} from '../hospital/camera.mjs';
import {bindControls} from '../hospital/controls.mjs';
import {pickCharacter,pickLocality} from '../hospital-workshop/mockup/model.mjs';
import {webglAvailable} from '../hospital-phaser/renderer.mjs';
import {waitForStartup,STARTUP_TIMEOUT_MS} from '../hospital-phaser/startup.mjs';
import {layoutState,portraitFor,initials} from './layout.mjs';
import {dieFace} from './dice.mjs';
import {movementMessages} from './movement-controller.mjs';
const kit=makeMockupKit(scene,uploaded,manifest),$=id=>document.getElementById(id),value=x=>x===null||x===undefined?'—':String(x);
const reason={setup:'Completá la preparación en V9.9.',handover:'Confirmá el pase en V9.9.',death:'Confirmá el fallecimiento en V9.9.',decision:'Resolvé el diálogo en V9.9.',waiting:'Esperando la partida.'};
// El renderer elimina su canvas al destruirse: cada montaje parte de esta plantilla.
const canvasTemplate=$('scene').cloneNode(false);
const element=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
export async function createMovementMapView({signal,movement}={}){
 const ui=new AbortController(),options={signal:ui.signal},motion=matchMedia('(prefers-reduced-motion: reduce)'),deadline=performance.now()+STARTUP_TIMEOUT_MS;
 let renderer,audio,observer,unbind,frame=0,disposed=false,active=false,contextLost=false,projection=null,layout={nodes:[],characters:[],locations:[],unmappedCharacterIds:[]},camera,viewport,selected=null,selectedLocation=null,infoKind=null,epoch,lastMovementPhase='idle',commands=0,draws=0;
 let settings=initialAtmosphereSettings(motion.matches);const canvas=canvasTemplate.cloneNode(false);$('scene')?.remove();document.querySelector('.map-viewport').prepend(canvas);
 const feedback=text=>$('view-feedback').textContent=text,listen=(selector,type,fn)=>document.querySelectorAll(selector).forEach(el=>el.addEventListener(type,fn,options));
 function panel(open){document.body.dataset.panelOpen=String(open);$('panel-content').hidden=!open;$('panel-toggle').setAttribute('aria-expanded',String(open));$('panel-toggle').textContent=open?'×':'Ficha';$('panel-toggle').setAttribute('aria-label',open?'Cerrar ficha':'Abrir ficha');}
 function schedule(){if(active&&!disposed&&!frame)frame=requestAnimationFrame(render);}
 const center=()=>({x:(viewport?.width||1)/2,y:(viewport?.height||1)/2});
 function change(next){commands++;camera=constrainCamera(next,scene.bounds,viewport);schedule();}
 function resize(){
  const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;
  const next={width,height,dpr:Math.min(devicePixelRatio||1,3)},base=fitMapCamera(scene.bounds,next);
  if(camera&&viewport){const world=screenToWorld(camera,center()),zoom=Math.max(base.minZoom,Math.min(base.maxZoom,camera.zoom));camera=constrainCamera({...base,zoom,x:width/2-world.x*zoom,y:height/2-world.y*zoom},scene.bounds,next);}else camera=base;
  viewport=next;schedule();
 }
 const reset=()=>{if(viewport)change(fitMapCamera(scene.bounds,viewport));};
 function selectCharacter(id){if(movement.inspect().phase==='sending')return;if(movement.inspect().phase==='choosing')movement.cancel();selected=projection?.characters.some(c=>c.id===id)?id:null;selectedLocation=null;commands++;panel(true);updateUI();schedule();}
 function selectLocality(id){selected=null;selectedLocation=projection?.locations.some(l=>l.id===id)?id:null;commands++;panel(true);updateUI();schedule();}
 function focus(id){const loc=layout.locations.find(l=>l.id===id);if(viewport)change(focusLocality(scene,loc?.visualId||'general',viewport));if(loc){if(movement.inspect().phase==='choosing')movement.choose(loc.engineIndex);else selectLocality(id);}}
 function playerName(id){return projection?.players.find(p=>p.id===id)?.label||'—';}
 function labels(){
  const labels=[];for(const c of layout.characters){
   const d=c.diameter*camera.zoom,marker=element('span',c.portraitId?'':c.initials,'actor-marker '+(c.playerId==='human'?'owner-human':'owner-ai')+(selected===c.id?' actor-selected':''));
   marker.style.left=camera.x+c.position.x*camera.zoom+'px';marker.style.top=camera.y+c.position.y*camera.zoom+'px';marker.style.width=marker.style.height=d+'px';marker.style.fontSize=Math.max(5,d*.32)+'px';marker.style.borderWidth=(selected===c.id?Math.max(2.5,Math.min(5,d*.09)):Math.max(1.2,Math.min(3,d*.055)))+'px';
   marker.setAttribute('aria-label',c.name+', '+playerName(c.playerId)+(selected===c.id?', seleccionado':''));labels.push(marker);
   if(d<22)continue;const el=element('span',c.playerId==='human'?'J1':projection.mode==='local'?'J2':'IA','group-badge group-'+c.playerId);el.style.left=camera.x+c.position.x*camera.zoom+'px';el.style.top=camera.y+(c.position.y+c.diameter*.47)*camera.zoom+'px';labels.push(el);
  }
  for(const loc of layout.locations){const notes=[];if(loc.characterOverflow.length)notes.push('+'+loc.characterOverflow.length+' fichas');if(loc.externalOverflow)notes.push('+'+loc.externalOverflow+' exteriores');if(loc.helpless)notes.push(loc.helpless+' indefensos');if(!notes.length)continue;const el=element('span',notes.join(' · '),'overflow-badge');el.style.left=camera.x+loc.badgePosition.x*camera.zoom+'px';el.style.top=camera.y+loc.badgePosition.y*camera.zoom+'px';labels.push(el);}
  $('map-labels').replaceChildren(...labels);
 }
 function render(){
  frame=0;if(disposed||!active||!viewport||!camera)return;draws++;
  const selectedNode=null,loc=layout.locations.find(l=>l.id===(movement.inspect().intent?.destination!==null&&movement.inspect().intent?'place-'+movement.inspect().intent.destination:selectedLocation)),zone=scene.zones.find(z=>z.id===loc?.visualId);
  renderer.update({camera,viewport,nodes:layout.nodes.length?layout.nodes:[{id:'map',assetId:'map',position:{x:0,y:0},depth:0,role:'ground',multiplier:1,visible:true}],slotContours:layout.locations.flatMap(l=>l.accesses),localityHighlight:zone?.selectionPolygon,state:{selected:selectedNode,showHidden:false,grid:false,gridStep:80,axes:false,pivots:false,bounds:false,layers:{shadows:true,slots:false}}});
  $('zoom-value').value=Math.round(camera.zoom/fitMapCamera(scene.bounds,viewport).zoom*100)+'%';labels();
 }
 function updateUI(){
  const p=projection;if(!p)return;
  $('round').textContent=value(p.round);$('morale').textContent=value(p.morale);$('food').textContent=value(p.food);$('turn').textContent=p.blocked?'—':p.ended?'Finalizada':playerName(p.turn)+(p.automationRunning?' · automático':'');
  const previous=$('locality').value;$('locality').replaceChildren(new Option('Vista general','general'),...p.locations.map(l=>new Option(l.name,l.id)));$('locality').value=[...$('locality').options].some(o=>o.value===previous)?previous:'general';
  $('locality-select').replaceChildren(new Option('Elegir localidad',''),...p.locations.map(l=>new Option(l.name+' · '+l.survivors+' supervivientes',l.id)));$('locality-select').value=selectedLocation||'';
  $('survivor-select').replaceChildren(new Option('Elegir superviviente',''),...p.characters.map(c=>new Option((c.name||'Nombre no disponible')+' · '+playerName(c.playerId)+' · '+(p.locations.find(l=>l.id===c.locationId)?.name||'Localidad no disponible'),c.id)));$('survivor-select').value=selected||'';
  const character=p.characters.find(c=>c.id===selected),loc=p.locations.find(l=>l.id===selectedLocation),drawn=layout.locations.find(l=>l.id===selectedLocation);
  $('character-card').hidden=!character;$('locality-card').hidden=!loc;$('panel-title').textContent=character?'Superviviente':loc?'Localidad':'Selección';
  if(character){$('character-card').dataset.owner=character.playerId;
   const portrait=kit.assets.find(a=>a.id===portraitFor(character.id));$('portrait').hidden=!portrait;$('portrait-initials').hidden=!!portrait;$('portrait-initials').textContent=initials(character.name);if(portrait)$('portrait').src=new URL(portrait.file,import.meta.url).href;$('portrait').alt=character.name+' · retrato provisional exclusivo';$('character-name').textContent=character.name||'Nombre no disponible';$('character-name').classList.toggle('long-name',(character.name?.length||0)>10);$('character-card').dataset.characterId=character.id;
   $('character-location').textContent=p.locations.find(l=>l.id===character.locationId)?.name||'Localidad no disponible';$('character-group').textContent=playerName(character.playerId)+(character.leader?' · Líder':'');$('character-identity').textContent=character.job||'';$('influence').textContent=value(character.influence);$('combat').textContent=value(character.effectiveAttack)+'+'+(character.effectiveAttack!==character.attack?' · base '+value(character.attack):'');$('search').textContent=value(character.effectiveSearch)+'+'+(character.effectiveSearch!==character.search?' · base '+value(character.search):'');
   $('character-state').textContent='Heridas: '+value(character.wounds)+' · Congelación: '+value(character.frost)+(character.moved===true?' · Movimiento registrado':'');$('character-skill').textContent=[character.skill.name,character.skill.description,character.skill.used===true?'Usada esta ronda':null].filter(Boolean).join(' · ')||'Habilidad no disponible';
   $('character-equipment').replaceChildren(...(character.equipment.length?character.equipment.map(e=>element('li',(e.name||'Objeto no disponible')+(e.description?' — '+e.description:'')+(e.usedRound>0?' · Uso registrado en ronda '+e.usedRound:''))):[element('li','Sin equipo equipado.')]));
  }else $('character-card').removeAttribute('data-character-id');
  if(loc){
   $('locality-name').textContent=loc.name;$('locality-description').textContent='';$('locality-capacity').textContent='Ocupación: '+value(loc.occupied)+'/'+value(loc.capacity)+' · Supervivientes: '+loc.survivors+' · Indefensos: '+value(loc.helpless)+' · Plazas libres: '+value(loc.available);$('locality-exterior').textContent='Accesos: '+value(loc.exteriorCapacity)+' · Zombis: '+value(loc.zombies)+' · Barricadas: '+value(loc.barricades)+' · Libres: '+value(loc.exteriorAvailable)+' · Ruido: '+value(loc.noise);
   $('locality-overflow').textContent=drawn?('Fichas dibujadas '+drawn.drawnCharacters.length+'/'+loc.survivors+'. '+(drawn.characterOverflow.length?'Excedente de '+drawn.characterOverflow.length+' por falta de posiciones visuales; lista completa debajo. ':'')+(drawn.externalOverflow?'Excedente exterior: '+drawn.externalOverflow+'. Los conteos siguen completos.':'') ):'Localidad sin posición en este dibujo; datos completos disponibles.';
   $('locality-survivors').replaceChildren(...p.characters.filter(c=>c.locationId===loc.id).map(c=>{const button=element('button');button.dataset.character=c.id;button.setAttribute('aria-label','Consultar a '+c.name+', '+playerName(c.playerId));button.append(element('span',c.name||'Nombre no disponible'),element('span',playerName(c.playerId)));return button;}));
   if(!loc.survivors)$('locality-survivors').append(element('p','Sin supervivientes presentes.'));
  }
  $('dice-owner').textContent=p.dice.ownerId?'Dados de '+playerName(p.dice.ownerId):'Sin turno activo';$('dice-pool').replaceChildren(...(p.dice.available||[]).map((n,i)=>{const face=dieFace(n),die=element('span',face.pips?undefined:face.label,'die'+(face.pips?'':' numeric'));die.dataset.value=String(n);die.setAttribute('aria-label','Dado disponible '+(i+1)+', valor '+n);for(const pos of face.pips||[]){const pip=element('span',undefined,'pip');pip.style.gridRow=Math.ceil(pos/3);pip.style.gridColumn=(pos-1)%3+1;pip.setAttribute('aria-hidden','true');die.append(pip);}return die;}));$('dice-status').textContent=p.dice.available===null?'Reserva no visible en esta fase.':p.dice.available.length?'Disponibles del turno.':'Sin dados disponibles.';
  const totalZ=p.locations.reduce((n,l)=>n+(l.zombies||0),0),totalB=p.locations.reduce((n,l)=>n+(l.barricades||0),0);$('occupation-summary').textContent=p.blocked?reason[p.blocked]:'Partida real: '+p.characters.length+' supervivientes · '+totalZ+' zombis · '+totalB+' barricadas.';$('unmapped-summary').textContent=layout.unmappedCharacterIds.length?layout.unmappedCharacterIds.length+' supervivientes sin posición en el dibujo. Todos disponibles en el selector.':'';updateMovement();if(infoKind&&$('info-dialog').open)showInfo(infoKind,false);
 }
 function cancelMovement(){if(movement.inspect().phase!=='choosing')return;movement.cancel();panel(true);resize();$('move-action').focus({preventScroll:true});}
 function updateMovement(){
  const m=movement.inspect();if(m.phase==='choosing'&&lastMovementPhase!=='choosing'&&matchMedia('(max-width:800px)').matches){panel(false);resize();}lastMovementPhase=m.phase;const info=projection?.movement?.options[selected],busy=m.phase==='sending',choosing=m.phase==='choosing';
  $('move-action').disabled=!active||!info?.allowed||busy||m.phase==='unknown';$('move-action').title=movementMessages[info?.reason]||'Elegir destino y confirmar';$('move-planner').hidden=!choosing&&!busy;
  $('confirm-move').disabled=!choosing||m.intent?.destination===null;$('cancel-move').disabled=busy;$('move-status').textContent=m.message;
  const actor=projection?.characters.find(c=>c.id===m.intent?.actorId),name=id=>projection?.locations.find(l=>l.engineIndex===id)?.name||'—';
  $('move-summary').textContent=actor?actor.name+' · '+name(m.intent.origin)+' → '+name(m.intent.destination):busy?'Resolviendo movimiento…':'';
  const select=$('move-destination'),saved=m.intent?.destination;select.replaceChildren(new Option('Elegí una localidad',''));for(const loc of projection?.locations||[]){const option=new Option(loc.name,loc.engineIndex);option.disabled=!projection.movement.options[m.intent?.actorId]?.destinations.includes(loc.engineIndex);select.append(option);}select.value=saved===null||saved===undefined?'':String(saved);select.disabled=busy;schedule();
 }
 function syncAmbient(){
  if(!audio)return;const sound=audio.inspect(),visual=settings.enabled&&['snow','wind','smoke','lights'].some(k=>settings[k]),any=visual||sound.enabled;$('ambient-enabled').setAttribute('aria-pressed',String(any));$('ambient-enabled').textContent=any?'Ambientación: activada':'Ambientación: desactivada';
  for(const b of document.querySelectorAll('[data-ambient]'))b.setAttribute('aria-pressed',String(settings.enabled&&settings[b.dataset.ambient]));$('ambient-intensity').value=settings.intensity;$('ambient-reduced').hidden=!motion.matches;$('ambient-status').textContent=!active?'En pausa: interfaz V9.9.':visual?'Intensidad '+(settings.intensity==='soft'?'Suave.':'Tormenta.'):'Sin efectos animados.';
  $('ambient-audio').setAttribute('aria-pressed',String(sound.enabled));$('ambient-audio').textContent=sound.enabled?'Ventisca: sonido activado':'Ventisca: sonido desactivado';$('ambient-volume').value=String(Math.round(sound.volume*100));$('ambient-volume-value').value=Math.round(sound.volume*100)+'%';$('ambient-audio-status').textContent=sound.error||(sound.enabled?(sound.paused?'Sonido en pausa.':sound.state==='running'?'Sonido de ventisca activo.':'Audio suspendido; desactivá y volvé a activar el sonido.'):'Sin sonido. Activación expresa disponible.');
 }
 function setAmbient(patch){settings={...settings,...patch};renderer.setAtmosphere(patch);syncAmbient();}
 function pause(){renderer.pauseAtmosphere(!active||document.hidden||contextLost);audio.setPaused(!active||document.hidden||contextLost);syncAmbient();}
 function showInfo(kind,open=true){
  infoKind=kind;const content=$('dialog-content');content.replaceChildren();const add=text=>content.append(element('p',text));
  const titles={objetivo:'Objetivo real',crisis:'Crisis real',registro:'Registro real',equipo:'Equipo público',ayuda:'Ayuda del visor'};$('dialog-title').textContent=titles[kind];
  if(kind==='objetivo'){const o=projection?.objective;add(o?.name||'Objetivo no disponible.');if(o?.description)add(o.description);if(o)add('Muestras: '+value(o.samples)+'/'+value(o.goal)+' · Ronda '+value(projection.round)+'/'+value(projection.maxRounds));}
  if(kind==='crisis'){const c=projection?.crisis;if(c){add('Tipo: '+value(c.type)+' · Aportes: '+value(c.given)+'/'+value(c.need));add('Efecto de fallo: '+({moral:'pérdida de moral',food:'pérdida de comida',zombie:'llegada de zombis',wound:'heridas'}[c.failure]||'información no disponible'));}else add('Crisis no disponible.');}
  if(kind==='registro'){const list=element('ol');for(const line of projection?.log||[])list.append(element('li',line));if(!list.children.length)add('Sin entradas disponibles.');else content.append(list);}
  if(kind==='equipo'){const c=projection?.characters.find(c=>c.id===selected);if(!c)add('Seleccioná un superviviente para consultar su equipo público. Las manos se consultan en V9.9.');else{add(c.name);for(const e of c.equipment)add((e.name||'Objeto sin nombre')+(e.description?' — '+e.description:''));if(!c.equipment.length)add('Sin equipo equipado.');}}
  if(kind==='ayuda')add('Este mapa consulta una única partida real. Arrastrar, rueda/pinza, flechas, +, − y0. Retratos exclusivos o iniciales, con identidad estable. Seleccionar no cambia el personaje del motor ni consume dados. Moverse: elegir destino y confirmar. Las demás acciones y decisiones: V9.9. Los excedentes del dibujo permanecen en las listas.');
  $('floating-menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');if(open&&!$('info-dialog').open)$('info-dialog').showModal();
 }
 try{
  if(!webglAvailable())throw Error('WEBGL_UNAVAILABLE');
  const originals=await waitForStartup(loadResources(kit),{signal,deadline});signal?.throwIfAborted();const prepared=prepareResources(kit,originals,{factor:1});
  renderer=await createWorkshopRenderer(canvas,kit,prepared,{signal,deadline,backgroundColor:'#171d20',atmosphereFrameRate:atmosphere.frameRate,createAtmosphere:world=>createAtmosphereView(world,atmosphere,{settings})});signal?.throwIfAborted();audio=createWindAudio(atmosphere.audio,{onChange:()=>{if(!disposed)syncAmbient();}});pause();
  observer=new ResizeObserver(resize);observer.observe(canvas);window.addEventListener('resize',resize,options);
  unbind=bindControls({canvas,onPan:(x,y)=>viewport&&change(panCamera(camera,x,y)),onZoom:(factor,anchor=center())=>viewport&&change(zoomCameraAt(camera,factor,anchor)),onPinch:(a,b,f)=>viewport&&change(pinchCamera(camera,a,b,f)),onPick:point=>{if(!camera)return;const world=screenToWorld(camera,point);if(movement.inspect().phase==='choosing'){const visual=pickLocality(scene,world),loc=layout.locations.find(l=>l.visualId===visual);if(loc)movement.choose(loc.engineIndex);return;}const id=pickCharacter(layout.characters,world);if(id)selectCharacter(id);else{const visual=pickLocality(scene,world);selectLocality(layout.locations.find(l=>l.visualId===visual)?.id||null);}},onReset:reset,onSelect:()=>selected?selectCharacter(selected):selectedLocation?selectLocality(selectedLocation):projection?.characters[0]&&selectCharacter(projection.characters[0].id),onClear:()=>{if(movement.inspect().phase==='choosing'){cancelMovement();return;}selected=selectedLocation=null;updateUI();schedule();}});
  listen('#move-action','click',()=>movement.begin(selected));listen('#move-destination','change',e=>movement.choose(Number(e.target.value)));listen('#confirm-move','click',()=>movement.confirm());listen('#cancel-move','click',cancelMovement);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&movement.inspect().phase==='choosing'){e.preventDefault();cancelMovement();}},options);
  listen('#panel-toggle','click',()=>{panel(document.body.dataset.panelOpen==='false');resize();});listen('#zoom-in','click',()=>viewport&&change(zoomCameraAt(camera,1.25,center())));listen('#zoom-out','click',()=>viewport&&change(zoomCameraAt(camera,.8,center())));listen('#reset-view','click',reset);listen('#locality','change',e=>e.target.value==='general'?reset():focus(e.target.value));listen('#locality-select','change',e=>selectLocality(e.target.value));listen('#survivor-select','change',e=>selectCharacter(e.target.value));listen('#locality-survivors','click',e=>{const button=e.target.closest('[data-character]');if(button)selectCharacter(button.dataset.character);});
  listen('#menu-toggle','click',()=>{const menu=$('floating-menu');menu.hidden=!menu.hidden;$('menu-toggle').setAttribute('aria-expanded',String(!menu.hidden));});listen('[data-info]','click',e=>showInfo(e.currentTarget.dataset.info));listen('#close-dialog','click',()=>{infoKind=null;$('info-dialog').close();});listen('#info-dialog','close',()=>{if(!$('info-dialog').open)infoKind=null;});
  listen('#ambient-enabled','click',()=>{const on=!(settings.enabled&&['snow','wind','smoke','lights'].some(k=>settings[k])||audio.inspect().enabled);if(!on)audio.setEnabled(false);setAmbient({enabled:on,snow:on,wind:on,smoke:on,lights:on});});listen('[data-ambient]','click',e=>{const key=e.currentTarget.dataset.ambient;setAmbient(settings.enabled?{[key]:!settings[key]}:{enabled:true,snow:false,wind:false,smoke:false,lights:false,[key]:true});});listen('#ambient-intensity','change',e=>setAmbient({intensity:e.target.value}));listen('#ambient-audio','click',()=>audio.setEnabled(!audio.inspect().enabled));listen('#ambient-volume','input',e=>audio.setVolume(Number(e.target.value)/100));motion.addEventListener('change',e=>{if(e.matches)setAmbient({enabled:false,snow:false,wind:false,smoke:false,lights:false});syncAmbient();},options);document.addEventListener('visibilitychange',pause,options);
  canvas.addEventListener('webglcontextlost',()=>{contextLost=true;pause();feedback('Se perdió el contexto gráfico. Podés usar V9.9 o reiniciar el visor.');$('retry-view').hidden=false;},options);canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;pause();$('retry-view').hidden=true;schedule();},options);
  $('loading').hidden=true;$('retry-view').hidden=true;$('floating-menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');panel(!matchMedia('(max-width:800px)').matches);syncAmbient();
  return {
   updateMovement,
   setState(next){if(disposed)return;projection=next;layout=layoutState(next,scene);if(epoch!==next.epoch){selected=null;selectedLocation=null;epoch=next.epoch;camera=null;}if(!next.characters.some(c=>c.id===selected))selected=null;if(selected)selectedLocation=null;else if(!next.locations.some(l=>l.id===selectedLocation))selectedLocation=next.blocked?null:next.locations[0]?.id||null;updateUI();resize();schedule();},
   setActive(value){active=!!value;if(!active){infoKind=null;$('info-dialog').close();$('floating-menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');}if(!active&&frame){cancelAnimationFrame(frame);frame=0;}pause();updateMovement();if(active){resize();schedule();}},
   inspect(){return {active,selected,selectedLocation,epoch,camera:camera?{...camera}:null,viewport:viewport?{...viewport}:null,commands,draws,layout:structuredClone(layout),renderer:renderer.inspect(),audio:audio.inspect(),contextLost,movement:movement.inspect()};},
   worldAt:point=>renderer.worldAt(point),
   async destroy(){if(disposed)return;disposed=true;active=false;ui.abort();observer.disconnect();unbind();if(frame)cancelAnimationFrame(frame);$('info-dialog').close();const graphics=renderer.destroy(),audioRelease=await audio.destroy();$('map-labels').replaceChildren();return {...graphics,audioRelease,disposed:true};}
  };
 }catch(error){disposed=true;ui.abort();observer?.disconnect();unbind?.();if(frame)cancelAnimationFrame(frame);const cleanup=renderer?.destroy();await audio?.destroy();if(cleanup?.cleanupErrors?.length)error.cleanupErrors=cleanup.cleanupErrors;throw error;}
}
