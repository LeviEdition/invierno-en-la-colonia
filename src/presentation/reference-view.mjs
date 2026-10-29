import {commandAttributes} from './commands.mjs';
// V9.9: extracción con enlaces vivos; las reglas se conservan.
export function createUi(ctx,{document=globalThis.document,window=globalThis.window,Math=globalThis.Math,setTimeout=globalThis.setTimeout}={}){
let toastQueue=[],toastBusy=false;
const listeners=[];const listen=(...args)=>{document.addEventListener(...args);listeners.push(args);};
function toast(t){toastQueue.push(t);ctx.drainToasts();}
async function drainToasts(){if(toastBusy)return;toastBusy=true;const stack=document.getElementById('toastStack');while(toastQueue.length){const t=toastQueue.shift();if(!stack)break;stack.innerHTML='';const item=document.createElement('div');item.className='toast '+(/[☠⚠]|fallid|mordedura|herida|congelación/i.test(t)?'bad':/[✓🏆]|superad|encontró|eliminó|movió/i.test(t)?'good':'');item.textContent=t;stack.appendChild(item);await new Promise(r=>setTimeout(r,ctx.aiRunning&&!ctx.skipAI?1550:2300));item.remove();}toastBusy=false;}
function equipIcons(p){const eq=ctx.equipmentOf(p).map(ctx.kind);return (eq.includes('arma')?'🔫':'')+(eq.includes('herramienta')?'⛏️':'');}
function showStatInfo(key,el,eventType){
 const tooltip=document.getElementById('statInfo'),data=statDetails[key];if(!tooltip||!data)return;
 if(eventType==='hover'&&!window.matchMedia('(hover:hover)').matches)return;
 const same=!tooltip.hidden&&tooltip.dataset.key===key;
 if(eventType==='click'&&same){tooltip.hidden=true;return;}
 tooltip.dataset.key=key;
 tooltip.innerHTML='<b>'+data.title+'</b><span>'+data.description+'</span>';
 tooltip.hidden=false;
 const rect=el.getBoundingClientRect();
 const width=Math.min(290,window.innerWidth-24);
 tooltip.style.width=width+'px';
 tooltip.style.left=Math.max(12,Math.min(rect.left,window.innerWidth-width-12))+'px';
 const below=rect.bottom+8;
 tooltip.style.top=(below+114>window.innerHeight?Math.max(8,rect.top-126):below)+'px';
}
function closeStatInfo(key){const e=document.getElementById('statInfo');if(e&&!e.hidden&&(!key||e.dataset.key===key))e.hidden=true;}
const statDetails={
 morale:{title:'Moral de la colonia',description:'Representa la esperanza del grupo. Disminuye por muertes, hambre y crisis fallidas. Si llega a cero, termina la partida.'},
 comida:{title:'Reserva de comida',description:'Cada ronda se necesita una comida por cada dos habitantes de la colonia, redondeando hacia arriba. También podés gastar comida para mejorar un dado.'},
 hambre:{title:'Hambre acumulada',description:'Si no alcanzan las raciones, se añade una ficha de hambre y se pierde tanta moral como hambre acumulada. No desaparece automáticamente.'},
 ronda:{title:'Rondas restantes',description:'Muestra la ronda actual y el límite del objetivo. Si se agotan las rondas sin cumplir la misión, perdés.'},
 residuos:{title:'Montón de residuos',description:'Las cartas consumidas pueden convertirse en residuos. Por cada diez residuos, la colonia pierde una moral durante cada fase de colonia. Limpiar retira hasta tres.'},
 zombis:{title:'Zombis en el tablero',description:'Suma los zombis de la colonia y todas las localidades. Aparecen en la fase de colonia, con ruido y por algunas encrucijadas.'},
 indefensos:{title:'Supervivientes indefensos',description:'Viven en la colonia, consumen comida y atraen zombis. No pueden realizar acciones ni utilizar dados.'},
 rescates:{title:'Rescates pendientes',description:'Personas encontradas mientras la colonia estaba llena. Llegarán automáticamente cuando quede una plaza disponible.'}
};
listen('pointerdown',e=>{const t=document.getElementById('statInfo');if(t&&!t.hidden&&!e.target.closest('.stat')&&!t.contains(e.target))t.hidden=true;});
function statusText(p){return p.dead?'Fallecido':(p.wounds?'♥'+p.wounds+' ':'')+(p.frost?'❄'+p.frost+' ':'')+(!p.wounds&&!p.frost?'Sano':'')+(p.moved?' · movido':'');}
function token(p){
 const mine=ctx.ownerOf(p)===ctx.controls.side,idx=mine?ctx.controls.group().indexOf(p):-1,eq=ctx.equipIcons(p);
 const head=(ctx.isLeader(p)?'<span class="leaderMark" title="Líder de grupo">♛</span>':'');
 return '<button class="surv '+(ctx.ownerOf(p)==='ai'?'ai ':'')+(mine&&idx===ctx.selected?'active ':'')+'" '+commandAttributes(mine&&ctx.playable()?"select":"profile",[mine&&ctx.playable()?idx:p.id],{stop:true})+' title="'+p.name+' · influencia '+p.influence+' · '+ctx.statusText(p)+'">'+
 '<span class="survtop">'+head+'<b>'+p.name+'</b><span class="infMini">◆'+p.influence+'</span></span>'+ 
 '<small>⚔ '+ctx.effectiveAttack(p)+'+ · ⌕ '+ctx.effectiveSearch(p)+'+</small>'+ 
 '<span class="survCondition">♥ '+p.wounds+' · ❄ '+p.frost+(eq?' · <span class="gearIcons" title="Equipamiento">'+eq+'</span>':'')+'</span>'+ 
 '<span class="skilltag">★ '+(p.skillName||'')+'</span></button>';
}
function toggleFab(force){const menu=document.getElementById('fabMenu'),btn=document.getElementById('floatingActions');const open=typeof force==='boolean'?force:menu.hidden;menu.hidden=!open;btn.textContent=open?'✕':'☰';btn.setAttribute('aria-expanded',String(open));btn.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');}
function menuGo(type){ctx.toggleFab(false);ctx.closeStatInfo();ctx.show(type);}
function menuEndTurn(){ctx.toggleFab(false);ctx.finishTurn();}
listen('click',function(e){const area=document.getElementById('fabArea');if(area&&!area.contains(e.target))ctx.toggleFab(false);});
listen('keydown',e=>{if(e.key==='Escape')ctx.hide()});
function toggleEquipDescription(button){
 const row=button.closest('.equipEntry');if(!row)return;
 const expanded=row.classList.toggle('infoOpen');
 button.setAttribute('aria-expanded',String(expanded));
}
let regularModalOpener=null,deathModalOpener=null,previousActiveDialog=null;
function handoverDialog(){
 const pass=document.getElementById('passScreen'),setup=document.getElementById('setupScreen');
 return pass&&!pass.hidden?pass:setup&&!setup.hidden?setup:null;
}
function activeDialog(){
 const handover=ctx.handoverDialog();if(handover)return handover;
 const death=document.getElementById('deathBackdrop');if(death&&!death.hidden)return death;
 const backdrop=document.getElementById('backdrop');
 return backdrop?.classList?.contains?.('open')?backdrop:null;
}
function dialogButtons(dialog){
 return [...(dialog?.querySelectorAll?.('button:not([disabled])')||[])].filter(el=>el.getClientRects().length);
}
function focusHandover(dialog){ctx.dialogButtons(dialog)[0]?.focus?.();}
function syncHandoverAccessibility(){
 const dialog=ctx.activeDialog(),previous=previousActiveDialog;
 if(document.body?.children){
  for(const child of document.body.children){
   if(child.tagName!=='SCRIPT')child.inert=!!dialog&&child!==dialog;
  }
 }
 if(dialog){
  if(!dialog.contains?.(document.activeElement))ctx.focusHandover(dialog);
 }else if(previous){
  const origin=previous.id==='backdrop'?regularModalOpener:previous.id==='deathBackdrop'?deathModalOpener:null;
  const usable=origin&&origin.isConnected!==false&&origin.getClientRects?.().length&&!origin.closest?.('[inert]');
  (usable?origin:document.getElementById('floatingActions'))?.focus?.();
  if(previous.id==='backdrop')regularModalOpener=null;
  if(previous.id==='deathBackdrop')deathModalOpener=null;
 }
 previousActiveDialog=dialog;
}
function returnFocusAfterHandover(){
 const dialog=ctx.activeDialog();
 if(dialog)ctx.focusHandover(dialog);
 else document.getElementById('floatingActions')?.focus?.();
}
listen('DOMContentLoaded',ctx.syncHandoverAccessibility);
listen('focusin',e=>{
 const dialog=ctx.activeDialog();
 if(dialog&&!dialog.contains?.(e.target))ctx.focusHandover(dialog);
},true);
listen('keydown',e=>{
 if(e.key!=='Tab')return;
 const dialog=ctx.activeDialog();if(!dialog)return;
 const buttons=ctx.dialogButtons(dialog);
 if(!buttons.length){e.preventDefault();return;}
 const first=buttons[0],last=buttons[buttons.length-1],focused=document.activeElement;
 if(!dialog.contains?.(focused)||(e.shiftKey&&focused===first)||(!e.shiftKey&&focused===last)){
  e.preventDefault();(e.shiftKey?last:first).focus();
 }
},true);
function renderModal(){
 const titles={biteChoice:'☣ Propagación de mordedura',attractTarget:'Atraer zombis',transferTarget:'Transferir equipamiento',healTarget:'Elegir paciente',lootChoice:'⌕ Resultado de búsqueda',actions:'Acciones del superviviente',inventory:'Objetos y crisis',log:'Registro de la partida',crossroads:'Encrucijadas',help:'Reglas y controles',group:'Grupos y líderes',leaderChoice:'♛ Elegí un nuevo líder',recruitSuccess:'Un nuevo superviviente',goal:'Objetivo general',crisis:'Crisis actual',profile:'Ficha del superviviente'};
 document.getElementById('modalTitle').textContent=titles[ctx.opened]||'';let html='';
 if(ctx.opened==='leaderChoice'){
  html='<p>Elegí el líder del '+ctx.controls.display(ctx.pendingLeaderSide)+'. Si acaba de morir, designá su sucesor.</p>'+ctx.ownerGroup(ctx.pendingLeaderSide).filter(p=>!p.dead).map(p=>'<button class="leaderOption" '+commandAttributes("chooseLeader",[p.id])+'><b>♛ '+p.name+'</b><span>'+p.job+' · Influencia '+p.influence+' · ⚔ '+ctx.effectiveAttack(p)+'+ · ⌕ '+ctx.effectiveSearch(p)+'+</span><small>★ '+p.skillName+'</small></button>').join('');
 }else if(ctx.opened==='recruitSuccess'){
  const info=ctx.pendingRecruitInfo;
  html=info?'<div class="recruitStory"><div class="recruitSeal">'+(info.queued?'⌛':'♛')+'</div><h3>'+info.name+'</h3><p>'+(!info.queued?'Rescataste a <b>'+info.name+'</b> ('+info.job+'). Se incorporó directamente a tu grupo en la colonia.':'La colonia está llena y el superviviente espera una plaza disponible.')+'</p><p class="tiny">'+info.skill+'</p><button class="action" style="width:100%" '+commandAttributes("dismissRecruit",[])+'>Continuar</button></div>':'';
 }else if(ctx.opened==='group'){
  const row=(side)=>'<div class="groupPanel"><h3>'+(side===ctx.controls.side?'Tu grupo':ctx.game.mode==='local'?ctx.controls.display(side):'Grupo de la IA')+'</h3>'+ctx.ownerGroup(side).filter(p=>!p.dead).map(p=>'<div class="groupMember"><div><b>'+(ctx.isLeader(p)?'♛ ':'')+p.name+'</b><small>'+p.job+' · Influencia '+p.influence+' · '+ctx.places[p.loc]+'</small></div>'+(side===ctx.controls.side&&ctx.canPickStartingLeader()&&!ctx.isLeader(p)?'<button class="action secondary" '+commandAttributes("chooseLeader",[p.id])+'>Elegir líder</button>':'')+'</div>').join('')+'</div>';
  html='<p>La influencia decide el orden de propagación de mordeduras y las víctimas de desbordamientos: se expone primero la menor. Cada grupo tiene un líder; si muere, debe reemplazarse.</p>'+row('human')+row('ai')+(ctx.canPickStartingLeader()?'<p class="message">Durante la primera ronda podés elegir tu líder inicial antes de gastar un dado, moverte o usar una carta.</p>':'')+(ctx.game.rescueQueue.length?'<p class="message">Rescates pendientes: '+ctx.game.rescueQueue.length+'. Llegarán cuando haya lugar en la colonia.</p>':'');
 }else if(ctx.opened==='biteChoice'){
  const p=ctx.pendingBite&&ctx.all().find(x=>x.id===ctx.pendingBite.target);
  html=p?'<div class="message">Una mordedura se propagó hasta <b>'+p.name+'</b> (influencia '+p.influence+').</div><p><b>Sacrificar:</b> el personaje muere y la propagación termina.</p><p><b>Arriesgar:</b> tirás el dado de exposición. Blanco (4–6) lo salva. Cualquier otro resultado lo mata y la mordedura puede extenderse a otra persona.</p><div class="grid2"><button class="action danger" '+commandAttributes("chooseBite",['sacrifice'])+'>Detener el contagio</button><button class="action" '+commandAttributes("chooseBite",['risk'])+'>Arriesgar tirada</button></div>':'<p>La propagación terminó.</p>';
 }else if(ctx.opened==='attractTarget'){
  const t=ctx.pendingAttract;
  html=t?'<p>Quedan '+t.left+' zombis por atraer a <b>'+ctx.places[t.loc]+'</b>. Elegí de qué lugar trasladarlos. La acción ya gastó un dado.</p>'+ctx.places.map((n,i)=>i!==t.loc&&ctx.game.zones[i].z?'<button class="action secondary" style="display:block;width:100%;margin:5px 0" '+commandAttributes("chooseAttract",[i])+'>'+n+' · '+ctx.game.zones[i].z+' zombis</button>':'').join('')+'<button class="action secondary" '+commandAttributes("cancelAttract",[])+'>Terminar la atracción</button>':'';
 }else if(ctx.opened==='transferTarget'){
  const t=ctx.pendingTransfer;
  html=t?'<p>Elegí un superviviente de la misma localidad.</p>'+t.targets.map(id=>{const p=ctx.all().find(x=>x.id===id);return p?'<button class="action" style="display:block;width:100%;margin:7px 0" '+commandAttributes("chooseTransfer",[id])+'>'+p.name+' · '+p.job+'</button>':'';}).join('')+'<button class="action secondary" '+commandAttributes("cancelTransfer",[])+'>Cancelar</button>':'';
 }else if(ctx.opened==='healTarget'){
  const a=ctx.pendingHeal&&ctx.all().find(x=>x.id===ctx.pendingHeal.actor);
  html=a?'<p>Elegí a quién atender con '+a.skillName+'. Solo supervivientes en la localidad de '+a.name+'.</p>'+ctx.pendingHeal.targets.map(id=>{const p=ctx.all().find(x=>x.id===id);return p?'<button class="action" style="display:block;width:100%;margin:7px 0" '+commandAttributes("chooseHeal",[id])+'>'+p.name+' · ♥'+p.wounds+' ❄'+p.frost+'</button>':'';}).join('')+'<button class="action secondary" '+commandAttributes("cancelHeal",[])+'>Cancelar sin usar habilidad</button>':'<p>No hay pacientes disponibles.</p>';
 }else if(ctx.opened==='lootChoice'){
  const t=ctx.pendingLoot,z=t&&ctx.game.zones[t.loc];
  html=t?'<p>Elegí <b>una</b> carta para conservar. Las demás regresarán al fondo del mazo. Podés hacer ruido para revelar otra carta.</p>'+t.items.map((it,i)=>'<button class="action" style="display:block;width:100%;margin:7px 0" '+commandAttributes("chooseLoot",[i])+'>Conservar '+ctx.itemTitle(it)+'</button>').join('')+'<button class="action secondary" style="width:100%;margin-top:10px" '+commandAttributes("addNoiseSearch",[])+' '+(z.noise>=4||!ctx.game.decks[t.loc].length?'disabled':'')+'>🔊 Hacer ruido y revelar otra (+1 ruido)</button><p class="tiny">Ruido en la localidad: '+z.noise+'/4. En la fase de colonia cada ruido genera un zombi si el dado sale de 1 a 3.</p>':'';
 }else if(ctx.opened==='crossroads'){
  const c=ctx.crossroadsDeck[ctx.game.crossCard];
  html=ctx.game.crossPending?'<div class="crossStory"><h3>✧ '+c.title+'</h3><p>'+c.story+'</p>'+(ctx.game.crossOwner==='ai'&&ctx.game.mode!=='local'?'<div class="message">🤖 Turno de la IA · Decisión: <b>'+c.choices[ctx.aiCrossChoice??0][0]+'</b></div>'+c.choices.map((ch,i)=>'<div class="crossChoice '+(i===ctx.aiCrossChoice?'aiSelected':'')+'" style="opacity:'+(i===ctx.aiCrossChoice?'1':'.6')+';pointer-events:none">'+(i+1)+'. '+ch[0]+'<small>'+ch[1]+'</small></div>').join('')+'<button class="action" style="width:100%;margin-top:12px" '+commandAttributes("crossAiContinue",[])+'>Continuar turno de la IA</button>':c.choices.map((ch,i)=>'<button class="crossChoice" '+(!ctx.crossOptionAllowed(c,i,ctx.game.crossOwner)?'disabled title="No se cumplen los requisitos"':'')+' '+commandAttributes("crossChoose",[i])+'>'+(i+1)+'. '+ch[0]+'<small>'+ch[1]+(!ctx.crossOptionAllowed(c,i,ctx.game.crossOwner)?' · No disponible':'')+'</small></button>').join(''))+'</div>':'<div class="crossStory"><h3>✧ Encrucijadas</h3><p>Cada jugador recibe una carta oculta al empezar su turno. Solo se revela si se cumple el desencadenante. Si no ocurre, no se juega ninguna historia.</p><p>'+ (ctx.game.crossResolved?'La carta de este turno ya se resolvió.':'La carta actual sigue oculta.')+'</p><p>Historias originales: '+ctx.crossroadsDeck.length+'.</p></div>';
 }else if(ctx.opened==='profile'){
  const p=ctx.all().find(x=>x.id===ctx.profileId);
  if(!p)html='<p>No se encontró el personaje.</p>';
  else{
   const own=ctx.ownerOf(p)===ctx.controls.side;
   html='<h3>'+(ctx.isLeader(p)?'♛ Líder · ':'')+p.name+' · '+p.job+'</h3><div class="message">'+ctx.places[p.loc]+' · '+(p.dead?'Fallecido':ctx.statusText(p))+(ctx.isLeader(p)?' · ♛ Líder del grupo':'')+'</div><div class="grid2"><div class="profileStat">⚔ Ataque <b>'+ctx.effectiveAttack(p)+'+</b></div><div class="profileStat">⌕ Búsqueda <b>'+ctx.effectiveSearch(p)+'+</b></div><div class="profileStat">♥ Heridas <b>'+p.wounds+'</b></div><div class="profileStat">❄ Congelación <b>'+p.frost+'</b></div><div class="profileStat">◈ Influencia <b>'+p.influence+'</b></div></div><p><b>Movimiento:</b> '+(p.moved?'utilizado':'disponible')+'</p><h3>Equipo</h3>'+
   (ctx.equipmentOf(p).length?ctx.equipmentOf(p).map((it,i)=>'<div class="equiprow"><b>'+ctx.itemTitle(it)+'</b><span class="equipDesc">'+(ctx.catalog.resolve(it)?.desc||'')+'</span>'+(own&&!p.dead?'<button class="action secondary" '+commandAttributes("startTransfer",[i])+'>Transferir</button>'+(ctx.kind(it)===ctx.game.crisis.type&&ctx.game.crisis.given<ctx.game.crisis.need+2?'<button class="action" '+commandAttributes("contributeEquipment",[p.id,i])+'>Aportar a crisis</button>':''):'')+'</div>').join(''):'<p>No tiene objetos equipados.</p>')+
   (own&&!p.dead?'<h3>Equipar desde la mochila</h3>'+(ctx.currentHand().some(it=>['arma','herramienta'].includes(ctx.kind(it)))?ctx.currentHand().map((it,i)=>['arma','herramienta'].includes(ctx.kind(it))?'<div class="equiprow equipEntry"><div class="equipEntryTitle"><strong>'+ctx.itemTitle(it)+'</strong><button type="button" class="equipInfoButton" aria-label="Ver efecto de '+ctx.catalog.resolve(it).name+'" aria-expanded="false" '+commandAttributes("toggleEquipDescription",[])+'>ⓘ</button></div><div class="equipHint" role="note">'+ctx.catalog.resolve(it).desc+'</div><button class="action" '+commandAttributes("equipItem",[i])+'>Equipar</button></div>':'').join(''):'<p>No hay equipamiento disponible.</p>'):'')+
   '<h3>★ '+p.skillName+'</h3><p>'+p.skillDesc+'</p><p class="tiny">'+(p.skillUsed?'Habilidad ya utilizada este turno/ronda.':'Habilidad disponible, si corresponde.')+'</p>';
  }
 }else if(ctx.opened==='goal'){
  html='<h3>'+ctx.game.objective.name+'</h3><p>'+ctx.game.objective.description+'</p><div class="message">Muestras: '+ctx.game.samples+'/'+ctx.game.goal+' · Ronda '+ctx.game.round+'/'+ctx.game.max+'.</div><p>Encontrá muestras con tus supervivientes. La habilidad de investigación solo beneficia al personaje que encontró la muestra.</p>';
 }else if(ctx.opened==='crisis'){
  html='<h3>Crisis de la ronda '+ctx.game.round+'</h3><p>Requiere <b>'+ctx.game.crisis.need+' cartas de '+ctx.game.crisis.type+'</b>.</p><div class="message">Aportes válidos: '+ctx.game.crisis.given+'/'+ctx.game.crisis.need+'. Solo se aceptan cartas del tipo requerido; dos aportes extra otorgan una moral.</div><p>La crisis se resuelve al finalizar la ronda. Si fracasa: '+({moral:'-1 moral',food:'pérdida de comida',wound:'herida en la colonia',zombie:'dos zombis adicionales'}[ctx.game.crisis.fail]||'penalización')+'.</p>';
 }else if(ctx.opened==='actions'){
  const p=ctx.person();
  if(!p||p.dead)html='<p>Seleccioná un superviviente propio vivo.</p>';
  else html='<div class="actorCard"><div class="actorPortrait" aria-hidden="true">👤</div><div class="actorMeta"><strong>'+(ctx.isLeader(p)?'♛ ':'')+p.name+' · '+p.job+'</strong><span>📍 '+ctx.places[p.loc]+' · Destino: '+ctx.places[ctx.target]+'</span><span>⚔ '+ctx.effectiveAttack(p)+'+ · ⌕ '+ctx.effectiveSearch(p)+'+ · ◆ Influencia '+p.influence+' · ♥ '+p.wounds+' · ❄ '+p.frost+'</span><div class="actorSkill">★ '+p.skillName+' — '+p.skillDesc+'</div><div class="actorEquipment">'+(ctx.equipmentOf(p).length?ctx.equipIcons(p)+' '+ctx.equipmentOf(p).map(ctx.itemTitle).join(', '):'Sin equipamiento')+'</div></div></div><h3>Elegí un dado</h3><div class="dice">'+(ctx.actionDice().map((d,i)=>'<button class="die '+(ctx.picked===i?'picked':'')+'" '+commandAttributes("pickActionDie",[i])+'>'+d+'</button>').join('')||'<span class="tiny">No quedan dados.</span>')+'</div><button class="action secondary" '+commandAttributes("boostDie",[])+' '+(ctx.game.food<1||!ctx.actionDice().length?'disabled':'')+'>🥫 +1 al dado seleccionado (cuesta 1 comida)</button><h3>★ Habilidad especial</h3><p class="tiny">'+p.skillDesc+'</p><button class="action secondary" '+commandAttributes("special",[])+'>Usar habilidad activa</button><h3>Movimiento</h3><div class="grid2"><select class="control" id="dest" '+commandAttributes("destinationInput",[],{event:"change"})+'>'+ctx.places.map((n,i)=>'<option value="'+i+'" '+(ctx.target===i?'selected':'')+'>'+n+'</option>').join('')+'</select><button class="action" '+commandAttributes("doMove",[])+'>→ Mover (sin dado)</button></div><h3>Acciones con dado</h3><div class="grid2"><button class="action" '+commandAttributes("search",[])+'>⌕ Buscar</button><button class="action" '+commandAttributes("attack",[])+'>⚔ Atacar zombi</button><button class="action secondary" '+commandAttributes("barricade",[])+'>▥ Barricada</button><button class="action secondary" '+commandAttributes("clean",[])+'>♻ Limpiar 3 residuos</button><button class="action secondary" '+commandAttributes("attract",[])+'>☠ Atraer hasta 2 zombis</button></div><p class="actionsNote">Buscar abre una elección: quedarte con una carta o hacer ruido para revelar más. Movimiento y ataque requieren exposición.</p>';
 }else if(ctx.opened==='inventory'){
  html='<div class="message">Crisis: '+ctx.game.crisis.need+' × '+ctx.game.crisis.type+' · '+ctx.game.crisis.given+'/'+ctx.game.crisis.need+' aportes. Podés aportar dos cartas extra para ganar +1 moral.</div><h3>Cartas de tu mano</h3>'+ 
   (ctx.currentHand().length?ctx.currentHand().map((it,i)=>{const d=ctx.catalog.resolve(it);if(!d)return '';
    const canCrisis=d.kind===ctx.game.crisis.type&&ctx.game.crisis.given<ctx.game.crisis.need+2;
    return '<div class="itemCard"><div class="itemIcon">'+d.icon+'</div><div class="itemDetail"><b>'+d.name+'</b><small>'+d.desc+'</small><span>Tipo: '+d.kind+(d.effect==='equip'?' · Equipable':' · Consumible')+'</span></div><div class="itemControls"><button class="action secondary" '+commandAttributes("playItem",[i])+' '+(ctx.aiRunning||ctx.game.ended?'disabled':'')+'>'+(d.effect==='equip'?'Equipar':'Usar')+'</button>'+(canCrisis?'<button class="action" '+commandAttributes("contribute",[i])+' '+(ctx.aiRunning||ctx.game.ended?'disabled':'')+'>Aportar</button>':'')+'</div></div>';
   }).join(''):'<p>No hay cartas en tu mano.</p>')+
   '<p class="tiny">Los objetos actúan sobre el personaje seleccionado. Las cartas equipadas conservan sus efectos particulares y pueden entregarse a crisis cuando coincida el tipo. Las cartas consumidas generan residuos, salvo eventos y muestras.</p>';

 }else if(ctx.opened==='log')html=ctx.game.log.map(x=>'<div class="logentry">'+x+'</div>').join('');
 else if(ctx.opened==='help'){
  html='<h3>Invierno en la Colonia · V9.9</h3><p>Cooperativo: vos y la IA defendemos la colonia. Sin traidores, exilios ni objetivos secretos. El objetivo general se decide al comenzar.</p><h3>Turnos y dados</h3><p>Al iniciar cada ronda recibís 1 dado más 1 por cada superviviente vivo. Tus dados disponibles permanecen visibles encima del botón ☰. Tocá uno para usarlo en una acción. Podés gastar una comida de la reserva para aumentar un dado en +1, hasta 6.</p><h3>Acciones</h3><p>Buscar y atacar requieren superar el valor del personaje; construir una barricada, limpiar tres cartas de residuos o atraer hasta dos zombis usan cualquier dado. Moverse no gasta dado, pero solo se puede hacer una vez por personaje y turno.</p><h3>Búsqueda</h3><p>Buscás en los mazos de cada localidad. Después de revelar una carta podés hacer ruido, hasta cuatro veces, para revelar otra. Conservás solo una y las demás regresan al fondo. Las cartas de superviviente elegidas se incorporan inmediatamente a la colonia y al grupo que las encontró. Si está llena, el rescate queda pendiente hasta que haya espacio.</p><h3>Exposición y mordeduras</h3><p>Al matar un zombi o moverte, se tira un dado: 1 mordedura, 2 congelación, 3 herida y 4–6 blanco. La mordedura se contagia al personaje con menor influencia presente; podés sacrificarlo para frenar el contagio o arriesgar otra tirada. Tener congelación agrega una herida al inicio del turno del controlador.</p><h3>Influencia y liderazgo</h3><p>Los personajes tienen un valor de influencia (◆) y un líder (♛) por grupo. En una mordedura propagada o un desbordamiento, se elige primero al superviviente de menor influencia. Si muere tu líder, elegís uno nuevo. Consultá el apartado Grupo y líderes del menú.</p><h3>Estadísticas</h3><p>Pasá el mouse o tocá moral, comida, hambre, ronda, residuos, zombis o indefensos para leer sus consecuencias.</p><h3>Colonia</h3><p>Por cada dos habitantes en colonia (incluyendo indefensos) necesitás una comida. Si no alcanza, la comida permanece, aumenta el hambre y se pierde tanta moral como fichas acumuladas. Por cada diez cartas de residuos perdés una moral. Se resuelve la crisis y llegan zombis: uno por cada dos habitantes en colonia, uno por superviviente exterior; cada ruido provoca un zombi solamente con 1–3.</p><h3>Objetos y supervivientes</h3><p>Las cartas jugadas generan residuos salvo los eventos o muestras. Cada objeto tiene un efecto propio (pistola, escopeta, palanca, linterna, manual, botiquín, etc.). Los objetos equipados se transfieren a otros supervivientes en la misma localidad. Cuando un personaje muere, su equipo vuelve a la mano si está en colonia o al mazo de su localidad si está afuera. Si perdés al último superviviente, descartás la mano y robás otro, si quedan personajes y espacio.</p><h3>Encrucijadas</h3><p>Se prepara una carta por cada turno, también el de la IA. Solo se activa si se cumple su condición. El mazo contiene 26 relatos propios, con condiciones de activación; las cartas y personajes son adaptaciones originales; no contienen el texto completo oficial. Hay historias que requieren líderes o determinados valores de influencia.</p><button class="action danger" '+commandAttributes("newGame")+'>Nueva partida</button>';
 }
 document.getElementById('modalContent').innerHTML=html;
}
function paintDice(){
 const el=document.getElementById('floatingDice');if(!el)return;
 if(!ctx.playable()){el.innerHTML='';return;}
 el.innerHTML=ctx.actionDice().map((d,i)=>'<button class="floatingDie '+(ctx.picked===i?'selected':'')+'" '+commandAttributes("pickFloatingDie",[i])+' aria-label="Seleccionar dado de valor '+d+'">'+d+'</button>').join('');
}
function renderSite(i){
 const z=ctx.game.zones[i],people=ctx.alive().filter(p=>p.loc===i),cap=ctx.capacity[i],col=i===0;
 let peopleHtml='';for(let k=0;k<cap;k++){
  const occupant=people[k]?ctx.token(people[k]):col&&k<people.length+ctx.game.helpless?'<div class="helplessToken">👤 Indefenso</div>':'·';
  peopleHtml+='<div class="slot">'+occupant+'</div>';
 }
 let accesses='';for(let k=0;k<ctx.zcap[i];k++){const state=k<z.z?'z':k<z.z+z.b?'b':'e';accesses+='<div class="slot access '+state+'">'+(state==='z'?'☠':state==='b'?'▥':'·')+'</div>';}
 const occupied=people.length+(col?ctx.game.helpless:0);
 return '<section class="site '+(col?'colony ':'')+(ctx.target===i?'selected':'')+'"><div class="sitehead" '+commandAttributes("destination",[i])+'><span>'+ctx.icons[i]+' '+z.name+'</span><small>'+occupied+'/'+cap+' plazas</small></div>'+(col?'':'<div class="lootLegend" aria-label="Objetos ordenados del más frecuente al menos frecuente" title="Objetos más comunes a la izquierda">'+ctx.catalog.legend(i).map(([kind,total])=>'<span title="'+kind+'">'+ctx.em[kind]+'</span>').join('')+'</div>')+'<div class="sitebody"><div class="sectionname">Supervivientes · '+(cap-occupied)+' libres</div><div class="survivorSlots">'+peopleHtml+'</div><div class="sectionname">Accesos · '+z.z+' zombis · '+z.b+' barricadas'+(z.noise?' · <span class="noiseIndicator" title="Ruido acumulado" aria-label="Ruido '+z.noise+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l6 5V4L7 9H3zm12.5-1.9a6 6 0 0 1 0 9.8v-2.6a3.7 3.7 0 0 0 0-4.6V7.1zm2.6-3a10 10 0 0 1 0 15.8v-2.4a7.7 7.7 0 0 0 0-11V4.1z"/></svg>'+z.noise+'</span>':'')+'</div><div class="zombieSlots">'+accesses+'</div></div></section>';
}
function draw(){
 if(!ctx.game)return;
 document.getElementById('board').innerHTML=ctx.places.map((_,i)=>ctx.renderSite(i)).join('');
 const obj=ctx.game.objective;
 document.getElementById('goalCard').innerHTML='<span class="eyebrow">⚑ OBJETIVO GENERAL</span><span class="main"><span>'+obj.name+'</span><span>'+ctx.game.samples+'/'+ctx.game.goal+'</span></span><span class="sub">'+obj.description+'</span><span class="progress"><i style="width:'+Math.min(100,ctx.game.samples/ctx.game.goal*100)+'%"></i></span>';
 document.getElementById('crisisCard').innerHTML='<span class="eyebrow">⚠ CRISIS · RONDA '+ctx.game.round+'</span><span class="main"><span>'+ctx.game.crisis.type+'</span><span>'+ctx.game.crisis.given+'/'+ctx.game.crisis.need+'</span></span><span class="sub">Aportá únicamente el objeto requerido</span><span class="progress"><i style="width:'+Math.min(100,ctx.game.crisis.given/ctx.game.crisis.need*100)+'%"></i></span>';
 document.getElementById('turnLabel').textContent=ctx.game.ended?'FIN DE PARTIDA':ctx.aiRunning?'⌂ FASE DE COLONIA':ctx.game.mode==='local'?'● '+ctx.controls.display().toUpperCase():ctx.game.turn==='ai'?'🤖 TURNO IA':'● TU TURNO';
 const humanLeader=ctx.groupLeader('human'),aiLeader=ctx.groupLeader('ai');
 document.getElementById('leadersSummary').textContent='♛ J1: '+(humanLeader?.name||'Por elegir')+' · '+(ctx.game.mode==='local'?'J2':'IA')+': '+(aiLeader?.name||'Sin líder');
 document.getElementById('skipAI').style.display=ctx.aiRunning?'block':'none';
 document.getElementById('fabEndTurn').disabled=!ctx.playable();
 const fabAction=document.querySelector('#fabMenu button');if(fabAction)fabAction.disabled=!ctx.playable();
 document.getElementById('status').innerHTML=[['Moral',ctx.game.morale,'morale'],['Comida',ctx.game.food,'comida'],['Hambre',ctx.game.hunger,'hambre'],['Ronda',ctx.game.round+'/'+ctx.game.max,'ronda'],['Residuos',ctx.game.waste,'residuos'],['Zombis',ctx.game.zones.reduce((a,z)=>a+z.z,0),'zombis'],['Indefensos',ctx.game.helpless,'indefensos'],...(ctx.game.rescueQueue.length?[['Rescates',ctx.game.rescueQueue.length,'rescates']]:[])].map(([a,b,key])=>'<button type="button" class="stat" data-stat="'+key+'" aria-label="'+a+': '+b+'. Tocá para leer cómo funciona." '+commandAttributes("statInfo",[key],{event:"mouseenter"})+' '+commandAttributes("statInfoClose",[key],{event:"leave"})+' '+commandAttributes("statInfo",[key])+'><span class="statLabel">'+a+'</span><strong>'+b+'</strong><span class="statHint">ⓘ</span></button>').join('');
 document.getElementById('banner').textContent=ctx.game.last;
 document.getElementById('selectedText').textContent=ctx.person()?'Seleccionado: '+ctx.person().name+' · Destino: '+ctx.places[ctx.target]:'';
 ctx.paintDice();if(ctx.opened)ctx.renderModal();ctx.syncHandoverAccessibility();
}
return {dispose(){for(const args of listeners.splice(0))document.removeEventListener(...args);},get toastQueue(){return toastQueue;},get toastBusy(){return toastBusy;},get toast(){return toast;},set toast(value){toast=value;},
get drainToasts(){return drainToasts;},set drainToasts(value){drainToasts=value;},
get equipIcons(){return equipIcons;},set equipIcons(value){equipIcons=value;},
get showStatInfo(){return showStatInfo;},set showStatInfo(value){showStatInfo=value;},
get closeStatInfo(){return closeStatInfo;},set closeStatInfo(value){closeStatInfo=value;},
get statDetails(){return statDetails;},
get statusText(){return statusText;},set statusText(value){statusText=value;},
get token(){return token;},set token(value){token=value;},
get toggleFab(){return toggleFab;},set toggleFab(value){toggleFab=value;},
get menuGo(){return menuGo;},set menuGo(value){menuGo=value;},
get menuEndTurn(){return menuEndTurn;},set menuEndTurn(value){menuEndTurn=value;},
get toggleEquipDescription(){return toggleEquipDescription;},set toggleEquipDescription(value){toggleEquipDescription=value;},
get regularModalOpener(){return regularModalOpener;},set regularModalOpener(value){regularModalOpener=value;},
get deathModalOpener(){return deathModalOpener;},set deathModalOpener(value){deathModalOpener=value;},
get previousActiveDialog(){return previousActiveDialog;},set previousActiveDialog(value){previousActiveDialog=value;},
get handoverDialog(){return handoverDialog;},set handoverDialog(value){handoverDialog=value;},
get activeDialog(){return activeDialog;},set activeDialog(value){activeDialog=value;},
get dialogButtons(){return dialogButtons;},set dialogButtons(value){dialogButtons=value;},
get focusHandover(){return focusHandover;},set focusHandover(value){focusHandover=value;},
get syncHandoverAccessibility(){return syncHandoverAccessibility;},set syncHandoverAccessibility(value){syncHandoverAccessibility=value;},
get returnFocusAfterHandover(){return returnFocusAfterHandover;},set returnFocusAfterHandover(value){returnFocusAfterHandover=value;},
get renderModal(){return renderModal;},set renderModal(value){renderModal=value;},
get paintDice(){return paintDice;},set paintDice(value){paintDice=value;},
get renderSite(){return renderSite;},set renderSite(value){renderSite=value;},
get draw(){return draw;},set draw(value){draw=value;},resetToasts(){document.getElementById('toastStack').innerHTML='';toastQueue=[];toastBusy=false;},
closeBackdrop(){document.getElementById('backdrop').classList.remove('open');},openBackdrop(){document.getElementById('backdrop').classList.add('open');},
prepareModal(){if(!document.getElementById('backdrop').classList.contains?.('open'))regularModalOpener=document.activeElement;},
openDeath(entries){if(!deathModalOpener)deathModalOpener=document.activeElement;document.getElementById('deathHeading').textContent=entries.map(x=>x.name).join(' · ');document.getElementById('deathDetails').innerHTML=entries.map(x=>'<p><strong>'+x.name+'</strong> — '+x.reason+' en '+x.loc+' ('+(x.side==='ai'?'IA':'tu grupo')+').</p>').join('');document.getElementById('deathImpact').textContent='Moral de la colonia −'+entries.length;document.getElementById('deathBackdrop').hidden=false;},
closeDeath(){document.getElementById('deathBackdrop').hidden=true;},clearDeathOpener(){deathModalOpener=null;},
showSetup(){document.getElementById('setupScreen').hidden=false;},hideHandover(){document.getElementById('setupScreen').hidden=true;document.getElementById('passScreen').hidden=true;},hidePass(){document.getElementById('passScreen').hidden=true;},
showPass(side){document.getElementById('passTitle').textContent='Turno del '+ctx.controls.display(side);document.getElementById('passDescription').textContent='Pasale el dispositivo al '+ctx.controls.display(side).toLowerCase()+'. Tocá «Comenzar turno» cuando esté listo.';document.getElementById('passScreen').hidden=false;}};
}
