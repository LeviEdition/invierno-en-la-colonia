import {latestBiteRoll} from './information.mjs';
import {playResult} from '../experiencia/routine-results.mjs';
import {present,unified} from '../experiencia/surfaces.mjs';
import {mountScrollHint} from '../experiencia/desplazamiento.mjs';
import {crossVignette,crossResultFor,dieDrawing} from './crossroads-view.mjs';
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
// Papeles centrales (ajustes 2 de la sesión 7; guía 109 §8): las opciones del mismo tipo (dados,
// cartas, destinos, supervivientes) van en su propia fila o grilla y miden lo mismo; las
// acciones van abajo a la derecha, a la misma altura, con la principal en Lámpara (una por papel).
export function paperOptions(kind,nodes){const d=el('div');d.className='paper-options';d.dataset.options=kind;d.append(...nodes);return d;}
export function paperActions(primary,...rest){const d=el('div');d.className='paper-actions';if(primary)primary.classList.add('is-primary');d.append(...[primary,...rest].filter(Boolean));return d;}
// Las reglas de prueba y el modo «un grupo» solo se ofrecen con ?dev. Sin él, el
// mapa es idéntico a hoy.
const development=()=>new URLSearchParams(location.search).has('dev');
const RULE_LABELS={laNoche:'La noche · tirada D12 por localidad exterior ocupada',regreso:'Regresar a la colonia · un dado de cualquier valor, sin exposición',crisisParcial:'Crisis parcial · media consecuencia con la mitad de los aportes'};
export function mountPlayPanel({controller,getContext,onRecover,signal}){
 const dialog=document.getElementById('play-dialog');if(!dialog||!controller)return {render(){}};let key='';const hint=mountScrollHint(dialog,{signal});
 const button=(text,id,fn,disabled=false)=>{const b=el('button',text);b.id=id;b.type='button';b.disabled=disabled;b.addEventListener('click',fn,{signal});return b;};
 // El panel solo elige valores; las reglas y sus consecuencias viven en el motor.
 function appendTestRules(dialog,v,busy){
  const rules=v.preparation.testRules||{},options=v.preparation.testRuleOptions||{};
  dialog.append(button('Un grupo (sin IA)'+(v.setup?'':' · abandonar partida'),'play-start-solo',()=>controller.submit('start',{mode:'solo',confirmed:!v.setup}),busy));
  const box=el('details');box.id='play-test-rules';box.open=true;box.append(el('summary','Reglas de prueba (desarrollo)'));
  box.append(el('p','Apagadas por defecto. Se aplican a la próxima partida. «La noche» no se aplica en dos jugadores locales.'));
  const food=el('fieldset');food.append(el('legend','Comida inicial'));
  for(const amount of options.comidaInicial||[]){
   const b=button(String(amount)+(amount===6?' (actual)':'')+(rules.comidaInicial===amount?' · elegida':''),'play-rule-food-'+amount,()=>controller.submit('test-rules',{rule:'comidaInicial',value:String(amount)}),busy||rules.comidaInicial===amount);
   food.append(b);
  }
  box.append(food);
  for(const flag of options.flags||[])box.append(button((rules[flag]?'Desactivar: ':'Activar: ')+RULE_LABELS[flag],'play-rule-'+flag,()=>controller.submit('test-rules',{rule:flag,value:rules[flag]?'false':'true'}),busy));
  dialog.append(box);
 }
 // Encrucijada (109 §4.3): las consecuencias se muestran después de decidir. Tras enviar la
 // elección se recuerda la carta; cuando el motor publica su evento «cross», se muestra el
 // resultado. «Continuar» solo cierra esta vista: no vuelve a llamar al motor.
 let crossPending=null,crossResult=null;
 const rememberCross=(d,v)=>{crossPending={title:d.card.title,story:d.card.story,generation:v.generation,known:new Set((v.events||[]).filter(e=>e.type==='cross').map(e=>e.id))};};
 dialog.addEventListener('cancel',e=>{e.preventDefault();if(crossResult){crossResult=null;render();return;}controller.close();},{signal});
 document.getElementById('menu-groups')?.addEventListener('click',()=>controller.open('groups'),{signal});
 for(const id of ['menu-new-game','final-new-game'])document.getElementById(id)?.addEventListener('click',()=>controller.open('new-game'),{signal});
 for(const kind of ['clean','attract','special','boost','return-home'])document.getElementById(kind+'-action')?.addEventListener('click',()=>{const {selected}=getContext();const {projection}=getContext(),dice=(kind==='boost'?projection?.play?.boost:projection?.play?.options?.[selected]?.[kind])?.dice?.filter(d=>d.allowed)||[],one=unified()&&dice.length===1?dice[0]:null;controller.open('action',{kind,actorId:kind==='boost'?null:selected,dieId:one?.id??null,dieIndex:one?.index??null,dieValue:one?.value??null});},{signal});
 function render(){const {projection:p,active,selected,executing}=getContext(),s=controller.inspect(),v=p?.play,busy=s.phase==='sending',d=v?.decision;
  // Pase, otra partida u otra decisión: la vista de resultado se descarta (nunca se recupera).
  if(!v||['setup','handover','death','waiting'].includes(p?.blocked)||(crossResult&&crossResult.generation!==v.generation))crossPending=crossResult=null;
  if(crossPending&&d?.kind!=='cross'){crossResult=crossResultFor(crossPending,v);crossPending=null;}
  if(crossResult&&d&&d.kind!=='cross')crossResult=null;
  for(const kind of ['clean','attract','special','boost','return-home']){const b=document.getElementById(kind+'-action'),q=kind==='boost'?v?.boost:v?.options?.[selected]?.[kind];if(b){b.disabled=!active||!q?.allowed||executing||v?.managed;b.title=q?.summary||'Seleccioná un superviviente propio.';// Sesión 7 (informe 126): «+1 (1 comida)» vive en la zona de dados de la barra y solo se
   // muestra cuando play.boost lo permite; si no está disponible, no aparece.
   if(kind==='boost'&&unified())b.hidden=b.disabled;if(kind==='special')b.textContent=q?.reason==='automatic'?'Habilidad automática':q?.reason==='builder'?'Constructor: usar Construir':'Usar habilidad de tratamiento';}}
  const visible=active&&!document.hidden&&v&&(v.revision===s.revision&&(v.managed||s.phase!=='closed')||!!crossResult&&!d);if(!visible){if(dialog.open)dialog.close();dialog.replaceChildren();key='';return;}
  const next=JSON.stringify([s,v,crossResult&&{title:crossResult.title,choice:crossResult.choice}]);if(key===next)return;key=next;const focus=document.activeElement?.id,scroll=dialog.scrollTop;dialog.replaceChildren();document.getElementById('floating-menu').hidden=true;document.getElementById('menu-toggle').setAttribute('aria-expanded','false');
  dialog.classList.toggle('crossroads',d?.kind==='cross'||!!crossResult&&!d);dialog.append(el('h2',crossResult&&!d?'Encrucijada':v.setup||s.page==='new-game'?'Nueva partida':d?.kind==='bite'?'Mordedura':d?.kind==='cross'?'Encrucijada':s.page==='groups'?'Grupo y líderes':d?.kind==='heal'?'Tratamiento':d?.kind==='attract'?'Atracción':s.intent?({clean:'Limpiar residuos',attract:'Atraer zombis',special:'Tratamiento',boost:'Mejorar dado','return-home':'Regresar a la colonia'})[s.intent.kind]:'Resultado'));const status=el('p',busy?'Resolviendo…':s.phase==='unknown'?s.message:'');status.setAttribute('role','status');dialog.append(status);
  if(crossResult&&!d){dialog.append(...crossVignette({title:crossResult.title,story:crossResult.story,result:crossResult}),paperActions(button('Continuar','play-cross-continue',()=>{crossResult=null;render();})));}
  else if(s.phase==='unknown'||v.unknown)dialog.append(el('p','Consultá el estado de la misma partida antes de repetir. Si no existe un resultado determinable, la operación seguirá bloqueada.'),button('Consultar estado','play-recover',onRecover));
  else if(v.setup||s.page==='new-game'){
   dialog.append(el('h3',v.setup?'Preparar partida':'Comenzar otra partida'),el('p','Elegí el modo; el objetivo se sortea al comenzar. En Grupo y líderes podés cambiar el líder inicial antes de tu primera acción con coste.'));
   dialog.append(el('p','Con IA jugás con tu grupo y el segundo actúa solo. Entre dos jugadores, pasan el dispositivo con las manos ocultas.'));
   if(!v.setup)dialog.append(el('p','Confirmar abandona la partida actual y sus operaciones pendientes. No hay guardado persistente.'));
   for(const group of v.preparation?.groups||[])dialog.append(el('p',(group.side==='human'?'Grupo 1: ':'Grupo 2: ')+group.members.map(p=>p.name+' ('+p.job+')').join(', ')));
   dialog.append(paperOptions('modes',[button(v.setup?'Dos jugadores en este dispositivo':'Abandonar y jugar de a dos','play-start-local',()=>controller.submit('start',{mode:'local',confirmed:!v.setup}),busy),button(v.setup?'Jugar con IA':'Abandonar y jugar con IA','play-start-ai',()=>controller.submit('start',{mode:'ai',confirmed:!v.setup}),busy)]));
   if(development()&&v.preparation)appendTestRules(dialog,v,busy);
   if(!v.setup)dialog.append(paperActions(null,button('Cancelar y conservar partida','play-close',()=>controller.close(),busy)));
  }else if(d?.kind==='bite'){
   const roll=latestBiteRoll(v.events);if(roll)dialog.append(el('p','Tirada anterior real: '+roll.name+' → '+roll.value+(roll.survived?' · se salva.':' · murió; continúa el contagio.')));
   dialog.append(el('h3','Propagación de mordedura · '+d.target.name),el('p','Influencia '+d.target.influence+'. Sacrificar: muere y termina la propagación. Arriesgar: 4–6 lo salva; 1–3 lo mata y continúa la cadena por influencia.'),paperOptions('choices',[button('Sacrificar y detener contagio','play-bite-sacrifice',()=>controller.submit('bite',{option:'sacrifice'}),busy),button('Arriesgar tirada','play-bite-risk',()=>controller.submit('bite',{option:'risk'}),busy)]));
  }else if(d?.kind==='loot'){dialog.append(el('p','Elegí una carta para conservar.'),paperOptions('cards',d.cards.map(ch=>{const b=button('','play-loot-'+ch.index,()=>controller.submit('loot',{index:ch.index}),busy);b.classList.add('carta');b.setAttribute('aria-label','Conservar '+ch.name);b.append(el('small',ch.kind||'Objeto'),el('strong',ch.name),el('span',ch.description));return b;})),paperActions(null,button('Revelar otra · +1 ruido','play-loot-noise',()=>controller.submit('loot-noise'),busy||!d.canNoise)));
  }else if(d?.kind==='transfer'){dialog.append(el('p',d.name+' entrega '+d.item+'. Elegí quién la recibe.'),paperOptions('survivors',d.targets.map(t=>button(t.name,'play-transfer-'+t.id,()=>controller.submit('transfer',{target:t.id}),busy))),paperActions(null,button('Cancelar','play-transfer-cancel',()=>controller.submit('transfer-cancel'),busy)));
  }else if(d?.kind==='heal'){
   dialog.append(el('p',d.actor.name+' · '+d.skill+'. Elegí un paciente en su localidad. No consume carta ni dado.'),paperOptions('survivors',d.patients.map(t=>{const b=button('','play-heal-'+t.id,()=>controller.submit('heal',{target:t.id}),busy);b.setAttribute('aria-label','Atender a '+t.name+' · heridas '+t.wounds+' · congelación '+t.frost);b.append(el('strong',t.name),el('small','♥︎ '+t.wounds+' · ❄︎ '+t.frost));return b;})),paperActions(null,button('Cancelar','play-heal-cancel',()=>controller.submit('heal-cancel'),busy)));
  }else if(d?.kind==='attract'){
   dialog.append(el('p','Hacia '+(p.locations.find(l=>l.engineIndex===d.destination)?.name||'su localidad')+'. El dado ya se gastó. Quedan '+d.left+' atracciones y '+d.free+' accesos libres.'),paperOptions('places',d.sources.map(src=>{const b=button('','play-attract-'+src.index,()=>controller.submit('attract-choose',{source:src.index}),busy);b.setAttribute('aria-label','Atraer desde '+src.name+' · '+src.count+' zombis');b.append(el('strong',src.name),el('small',src.count+' zombis'));return b;})),paperActions(null,button('Terminar','play-attract-end',()=>controller.submit('attract-end'),busy)));
  }else if(d?.kind==='cross'){
   dialog.append(...crossVignette({title:d.card.title,story:d.card.story}));const choices=el('div');choices.className='cross-choices paper-options';choices.dataset.options='choices';
   // Una opción no disponible lo dice sin revelar su consecuencia.
   for(const [index,ch]of d.card.choices.entries()){const b=button(ch[0]+(d.automated&&index===d.chosen?' · Decisión de IA':''),'play-cross-'+index,()=>{rememberCross(d,v);controller.submit('cross',{index});},busy||d.automated||!d.allowed[index]);if(!d.allowed[index])b.title='No disponible con lo que tiene el grupo ahora.';choices.append(b);}
   dialog.append(el('p','Elegí una opción.'),choices);
   if(d.automated)dialog.append(paperActions(button('Continuar turno de IA','play-cross-ai',()=>{rememberCross(d,v);controller.submit('cross-ai');},busy)));
  }else if(d?.kind==='recruit')dialog.append(el('h3',d.name),el('p',d.job+' · '+d.skill),paperActions(button('Continuar','play-recruit',()=>controller.submit('recruit'),busy)));
  else if(v.receipt){dialog.append(el('h3',v.receipt.type==='bite'?'Contagio resuelto':'Acción completada'),el('p',playResult(v.receipt)));for(const e of v.receipt.type==='bite'&&!v.receipt.result?[latestBiteRoll(v.events)].filter(Boolean):[])dialog.append(el('p','Tirada real de '+e.name+': '+e.value+(e.survived?' · se salva.':' · murió; el contagio continúa.')));dialog.append(paperActions(button('Continuar','play-ack',()=>controller.submit('ack',{receiptId:v.receipt.id}),busy)));}
  else if(s.page==='groups'){dialog.append(el('h3','Grupos y líderes'),el('p','La influencia determina el orden de propagación y víctimas de desbordamiento. La elección inicial permanece abierta hasta gastar un dado, moverse o usar una carta.'));
   for(const group of v.groups||[]){dialog.append(el('h3',group.label),el('p','Rescates pendientes: '+group.rescues));for(const p of group.members){dialog.append(el('p',(group.leaderId===p.id?'Líder · ':'')+p.name+' · influencia '+p.influence+' · '+(getContext().projection.locations.find(l=>l.engineIndex===p.location)?.name||'—')));if(group.canChoose&&group.leaderId!==p.id)dialog.append(button('Elegir líder: '+p.name,'play-leader-'+p.id,()=>controller.submit('starting-leader',{target:p.id}),busy));}}
   dialog.append(button('Volver al mapa','play-close',()=>controller.close(),busy));
  }else if(s.page==='action'&&s.intent){const i=s.intent,q=i.kind==='boost'?v.boost:v.options?.[i.actorId]?.[i.kind];if(!unified())dialog.append(el('h3',({clean:'Limpiar residuos',attract:'Atraer zombis',special:'Tratamiento por habilidad',boost:'Mejorar dado con comida','return-home':'Regresar a la colonia'})[i.kind]));dialog.append(el('p',q?.summary||'La acción cambió.'));
   if(i.kind==='attract'&&q?.targets.length)dialog.append(el('p','Orígenes con zombis: '+q.targets.map(t=>t.name+' ('+t.count+')').join(', ')+'. Accesos libres en destino: '+p.locations.find(l=>l.id===p.characters.find(c=>c.id===i.actorId)?.locationId)?.exteriorAvailable));
   const dice=(q?.dice||[]).map(die=>{const picked=i.dieId===die.id,b=button(unified()?'':'Dado '+die.value+(picked?' · seleccionado':''),'play-die-'+die.index,()=>controller.choose({dieId:die.id,dieIndex:die.index,dieValue:die.value}),!die.allowed||busy);b.prepend(dieDrawing(die.value));b.classList.add('die-choice');if(unified()){b.setAttribute('aria-label','Dado '+die.value+(die.allowed?'':', no sirve para esta acción'));b.setAttribute('aria-pressed',String(picked));}return b;});
   if(unified()){if(dice.length)dialog.append(paperOptions('dice',dice));}else dialog.append(...dice);
   const confirm=button(unified()?({special:'Elegir paciente',clean:'Limpiar · hasta '+q?.maximum,attract:'Atraer · hasta 2',boost:'Mejorar · 1 comida','return-home':'Regresar'})[i.kind]:i.kind==='special'?'Elegir paciente':({clean:'Limpiar hasta '+q.maximum+' residuos',attract:'Atraer hasta 2 zombis',boost:'Mejorar dado · gastar 1 comida','return-home':'Regresar a la colonia · cuenta como movimiento'})[i.kind]+(i.dieValue?' · dado '+i.dieValue:''),'play-confirm',()=>{const {kind,...args}=controller.inspect().intent;controller.submit(kind,args);},busy||!q?.allowed||i.kind!=='special'&&!q.dice.some(d=>d.id===i.dieId&&d.allowed)),cancel=button(unified()?'Cancelar':'Cancelar antes de ejecutar','play-cancel',()=>controller.close(),busy);
   if(unified())dialog.append(paperActions(confirm,cancel));else dialog.append(confirm,cancel);
  }else dialog.append(paperActions(button('Volver al mapa','play-close',()=>controller.close(),busy)));
  // Lo que resuelve una acción o decisión de turno va al papel del centro; «Grupo y líderes» es consulta y va al expediente.
  dialog.dataset.stage=String(s.page!=='groups');
  present(dialog,{exclusive:!!v.setup||s.page==='new-game'||['bite','cross'].includes(d?.kind)||!!crossResult&&!d});if(focus)dialog.querySelector('#'+CSS.escape(focus))?.focus({preventScroll:true});if(!dialog.contains(document.activeElement))dialog.querySelector('button:not(:disabled)')?.focus({preventScroll:true});if(unified()){const more=el('p','Más abajo');more.className='scroll-more';more.setAttribute('aria-hidden','true');dialog.append(more);}dialog.scrollTop=scroll;hint();
 }
 document.addEventListener('visibilitychange',render,{signal});signal.addEventListener('abort',()=>dialog.close(),{once:true});return {render};
}
