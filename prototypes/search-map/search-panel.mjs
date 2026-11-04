import {searchMessages} from './search-controller.mjs';
import {dieFace} from '../movement-map/dice.mjs';
const $=id=>document.getElementById(id);
function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
function diceButton(d,selected){
 const button=el('button',undefined,'search-die');button.dataset.die=String(d.index);button.disabled=!d.allowed;
 button.setAttribute('aria-label',`Dado ${d.index+1}, valor ${d.value}${d.allowed?', válido':', no alcanza el requisito'}`);button.setAttribute('aria-pressed',String(selected===d.index));
 const face=dieFace(d.value),drawing=el('span',face.pips?'':String(d.value),'die'+(face.pips?'':' numeric'));
 drawing.setAttribute('aria-hidden','true');for(const position of face.pips||[]){const pip=el('span',undefined,'pip');pip.style.gridRow=Math.ceil(position/3);pip.style.gridColumn=(position-1)%3+1;drawing.append(pip);}
 button.append(drawing,el('small','Dado '+(d.index+1)));return button;
}
export function mountSearchPanel({controller,getContext,onCancel,onNative,signal}){
 let oldPhase='idle',cardsKey='',diceKey='',handKey='',focusVersion=0;
 function focusInPanel(target){
  if(!target)return;target.focus({preventScroll:true});
  const panel=$('search-panel'),bounds=panel.getBoundingClientRect(),r=target.getBoundingClientRect();
  // Mover solo el scroll del panel; conservar encuadre y geometría del mapa.
  if(r.top<bounds.top+8)panel.scrollTop+=r.top-bounds.top-8;
  else if(r.bottom>bounds.bottom-8)panel.scrollTop+=r.bottom-bounds.bottom+8;
 }
 const on=(id,type,fn)=>$(id).addEventListener(type,fn,{signal});
 on('search-action','click',()=>{if(getContext().movementPhase==='idle')controller.begin(getContext().selected);});
 on('search-dice','click',event=>{const button=event.target.closest('[data-die]');if(button&&!button.disabled&&controller.chooseDie(Number(button.dataset.die)))focusInPanel($('confirm-search'));});
 on('confirm-search','click',()=>controller.confirm());on('cancel-search','click',()=>{if(controller.cancel())onCancel();});
 on('search-cards','click',event=>{const button=event.target.closest('[data-card]');if(button&&!button.disabled)controller.choose(Number(button.dataset.card));});
 on('search-noise','click',()=>controller.noise());on('search-continue','click',()=>controller.dismiss());on('search-native','click',onNative);
 document.addEventListener('keydown',event=>{if(!event.defaultPrevented&&event.key==='Escape'&&controller.inspect().phase==='picking'){event.preventDefault();if(controller.cancel())onCancel();}},{signal});
 function render(){
  const {projection:p,selected,active,movementPhase}=getContext(),s=controller.inspect(),visible=active&&!!s.ownerId,op=visible?s.operation:null;
  const actor=p?.characters.find(c=>c.id===selected),q=p?.search?.options[selected];
  $('search-action').disabled=!active||actor?.playerId!==p?.turn||!q?.allowed||s.busy||movementPhase!=='idle';
  if(active&&actor?.playerId===p?.turn&&!s.busy&&movementPhase==='idle')$('actions-status').textContent=q?.allowed?'':searchMessages[q?.reason]||'';
  const picking=visible&&s.phase==='picking',busy=['sending','unknown','presenting'].includes(s.phase),choice=op?.status==='choice';
  $('search-panel').hidden=!visible||s.phase==='idle';$('search-draft').hidden=!picking;
  $('search-findings').hidden=!choice;$('search-result').hidden=!op||choice;
  const site=id=>p?.locations.find(l=>l.engineIndex===id)?.name||'su localidad';
  $('search-title').textContent=picking?'Buscar con '+(actor?.name||'superviviente'):op?'Búsqueda de '+op.name:'Buscando…';
  $('search-message').textContent=!visible?'':busy?s.message:choice?'Elegí una carta para conservar. Las demás vuelven al fondo del mazo.':op?.status==='empty'?'El motor no encontró una carta.':s.message;
  $('search-requirement').textContent=picking?site(s.intent.origin)+' · Requisito efectivo '+s.intent.requirement+'+ (incluye habilidad y equipo).':'';
  $('search-confirmation').textContent=picking&&s.intent.dieIndex!==null?`¿Buscar con ${actor?.name} en ${site(s.intent.origin)} usando el dado ${s.intent.dieIndex+1}, valor ${s.intent.dieValue}?`:'';
  $('confirm-search').disabled=!picking||s.intent.dieIndex===null;
  const nextDiceKey=picking?JSON.stringify([s.intent.actorId,q?.dice,s.intent.dieIndex]):'';
  if(nextDiceKey!==diceKey){diceKey=nextDiceKey;$('search-dice').replaceChildren(...(picking?(q?.dice||[]).map(d=>diceButton(d,s.intent.dieIndex)):[]));}
  const nextCardsKey=op?JSON.stringify([op.operationId,op.status,op.cards,busy]):'';
  if(nextCardsKey!==cardsKey){cardsKey=nextCardsKey;const cards=(op?.cards||[]).map(c=>{
   const card=el('article',undefined,'search-card');card.append(el('small','Carta '+(c.index+1)+' · '+(c.kind||'Objeto')),el('h3',c.name),el('p',c.description));
   const button=el('button','Conservar '+c.name);button.dataset.card=String(c.index);button.disabled=busy;card.append(button);return card;
  });$('search-cards').replaceChildren(...cards);}
  $('search-noise').disabled=!choice||busy||!op.canNoise;
  $('search-noise-status').textContent=choice?'Ruido en '+site(op.origin)+': '+op.noise+'. '+(op.canNoise?'Revelar otra carta cuesta +1 ruido.':'No se puede revelar otra carta con ruido ahora.'):'';
  $('search-continue').hidden=!op||op.generalDecision;$('search-continue').disabled=busy;
  $('search-native').hidden=!op?.generalDecision;$('search-native').disabled=busy;
  const result=op?.result;$('search-kept-card').hidden=!result;
  $('search-kept-card').replaceChildren(...(result?[el('small',result.card.kind),el('h3',result.card.name),el('p',result.card.description)]:[]));
  $('search-outcome').textContent=result?op.name+' conservó '+result.card.name+' · '+(result.handDelta>0?'añadida a la mano':'consecuencia automática resuelta por el motor')+' · ruido '+result.noise+'.':op?.status==='empty'?'No se añadió ninguna recompensa.':'';
  $('search-recruit').textContent=op?.recruit?(op.recruit.queued?'El rescate espera una plaza en la colonia.':op.recruit.name+' se incorporó a la colonia.')+' '+op.recruit.skill:'';
  const hand=visible?s.hand:[],nextHandKey=JSON.stringify([visible?s.ownerId:null,hand]);
  $('own-hand').hidden=!visible;$('own-hand-title').textContent=visible?'Mano de '+(p?.players.find(x=>x.id===s.ownerId)?.label||'jugador activo')+' · '+hand.length+' cartas':'Mano del turno';
  if(nextHandKey!==handKey){handKey=nextHandKey;$('own-hand-cards').replaceChildren(...hand.map(c=>el('li',c.name+' · '+c.kind)));}
  if(s.phase!==oldPhase){oldPhase=s.phase;const version=++focusVersion;
   if(visible)requestAnimationFrame(()=>{if(signal.aborted||version!==focusVersion||!getContext().active)return;const target=picking?'#search-dice button:not(:disabled)':s.phase==='choice'?'#search-cards button':s.phase==='result'?(op?.generalDecision?'#search-native':'#search-continue'):null;if(target)focusInPanel(document.querySelector(target));});
  }
 }
 return {render};
}
