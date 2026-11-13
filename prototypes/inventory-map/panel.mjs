export function contributionCards(own){const allowed=new Set(own?.options.filter(q=>q.mode==='contribute'&&q.allowed).map(q=>q.cardId));return {hand:(own?.hand||[]).filter(c=>allowed.has(c.uid)),equipment:(own?.equipment||[]).filter(c=>allowed.has(c.uid))};}
import {inventoryMessages} from './controller.mjs';
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export function mountInventoryPanel({controller,getContext,onNative,signal}){
 const dialog=document.getElementById('inventory-dialog');if(!dialog||!controller)return {render(){}};
 let key='',lastStep='';
 const closeTools=()=>{const menu=document.getElementById('floating-menu');if(menu)menu.hidden=true;document.getElementById('menu-toggle')?.setAttribute('aria-expanded','false');};
 const open=()=>{const {selected}=getContext();if(controller.open(selected))closeTools();};
 for(const id of ['inventory-open','character-inventory','hand-inventory','menu-inventory'])document.getElementById(id)?.addEventListener('click',open,{signal});
 document.getElementById('crisis-contribute')?.addEventListener('click',()=>{if(controller.open(null,'crisis'))closeTools();},{signal});
 const close=()=>controller.close();dialog.addEventListener('cancel',e=>{e.preventDefault();close();},{signal});
 function button(text,id,fn,disabled=false){const b=el('button',text);b.type='button';b.id=id;b.disabled=disabled;b.addEventListener('click',fn,{signal});return b;}
 function select(id,label,items,value,fn,disabled=false){const wrap=el('label',label),s=el('select');s.id=id;s.disabled=disabled;s.append(new Option('Elegir…',''),...items.map(x=>new Option(x.name,String(x.id))));s.value=value??'';s.addEventListener('change',()=>fn(s.value),{signal});wrap.htmlFor=id;wrap.append(s);return wrap;}
 function render(){
  const {projection:p,active,searchBusy,actionBusy,movementPhase}=getContext(),s=controller.inspect(),inv=p?.inventory,own=inv?.private,visible=active&&!document.hidden&&s.phase!=='closed'&&(own||inv?.receipt),busy=['sending','unknown'].includes(s.phase);
  for(const id of ['inventory-open','character-inventory','hand-inventory','menu-inventory','crisis-contribute']){const b=document.getElementById(id);if(b)b.disabled=!active||!own||searchBusy||actionBusy||movementPhase!=='idle'||busy;}
  if(!visible){if(dialog.open)dialog.close();dialog.replaceChildren();key='';return;}
  const next=JSON.stringify([s,inv]);if(key===next)return;key=next;const focusId=document.activeElement?.id,step=s.phase+'/'+(s.intent?.cardId||''),scroll=step===lastStep?dialog.scrollTop:0;lastStep=step;dialog.replaceChildren();
  const header=el('div');header.className='inventory-heading';header.append(el('h2','Inventario · '+(p.players.find(x=>x.id===own?.ownerId)?.label||'Jugador activo')),button('Cerrar','inventory-close',close,busy));dialog.append(header);
  const status=el('p',s.message);status.id='inventory-status';status.setAttribute('role','status');dialog.append(status);
  if(inv?.receipt){dialog.append(el('h3','Resultado'),el('p',inv.receipt.summary));if(inv.receipt.generalDecision){dialog.append(el('p',p.cycle?.outcome?'El motor finalizó la partida. Consultá el resultado en el mapa.':'Hay una decisión pendiente que continúa en V9.9. No se resuelve automáticamente.'),button(p.cycle?.outcome?'Ver resultado final':'Continuar en V9.9','inventory-native',onNative));}else dialog.append(button('Continuar en inventario','inventory-continue',()=>controller.dismiss(),busy));}
  else if(own){
   const contribution=s.purpose==='crisis',shown=contribution?contributionCards(own):own;
   if(s.phase==='picking'){
    const c=[...own.hand,...own.equipment].find(c=>c.uid===s.intent.cardId),q=controller.option();dialog.append(el('h3',c?.name),el('p',c?.description));
    if(s.intent.mode!=='contribute'&&(c?.requiresActor||c?.ownerId))dialog.append(select('inventory-actor',c.ownerId?'Entrega el equipo':'Superviviente',own.actors,s.intent.actorId,v=>controller.choose({actorId:v||null,targetId:null,destination:null}),!!c.ownerId));
    if(s.intent.mode!=='contribute'&&c?.ownerId)dialog.append(select('inventory-target','Recibe el equipo (misma localidad)',(own.recipients||own.actors).filter(a=>a.id!==c.ownerId),s.intent.targetId,v=>controller.choose({targetId:v||null})));
    if(s.intent.mode!=='contribute'&&c?.effect==='move')dialog.append(select('inventory-destination','Destino con plaza de superviviente',p.locations.map(l=>({id:l.engineIndex,name:l.name})),s.intent.destination,v=>controller.choose({destination:v===''?null:Number(v)})));
    const actor=p.characters.find(a=>a.id===s.intent.actorId);if(actor){dialog.append(el('p','Equipo actual de '+actor.name+': '+(actor.equipment.map(e=>e.name).join(', ')||'sin equipo')+'.'));}
    if(s.intent.mode==='contribute')dialog.append(el('p','La entrega es definitiva: V9.9 no ofrece recuperar la carta aportada.'));
    const summary=el('p',q.summary);summary.id='inventory-preview';dialog.append(summary);const reason=el('p',q.allowed?'Sin gasto de dados. Confirmá para aplicar.':inventoryMessages[q.reason]||'Esta operación no está disponible.');reason.id='inventory-reason';dialog.append(reason,button('Confirmar','inventory-confirm',()=>controller.confirm(),!q.allowed),button('Cancelar','inventory-cancel',()=>controller.cancel()));
   }else if(!busy){
    dialog.append(el('h3',(contribution?'Cartas legales para aportar · ':'Mano compartida del jugador · ')+shown.hand.length+' cartas'));const cards=el('div');cards.className='inventory-cards';
    for(const c of shown.hand){const article=el('article');article.dataset.inventoryCard=c.uid;article.append(el('strong',c.name+' ×'+c.quantity),el('p',c.description));const b=button(c.effect==='equip'?'Equipar':'Usar','inventory-card-'+c.uid,()=>controller.chooseCard(c.uid));b.dataset.inventoryUid=c.uid;if(!contribution)article.append(b);article.append(button('Aportar a la crisis','inventory-contribute-'+c.uid,()=>controller.chooseCard(c.uid,'contribute')));cards.append(article);}if(!shown.hand.length)cards.append(el('p','No hay cartas en la mano compartida.'));dialog.append(cards,el('h3','Equipo de cada superviviente'));
    for(const a of own.actors){const row=el('article');row.append(el('strong',a.name));const equipment=shown.equipment.filter(e=>e.ownerId===a.id);for(const e of equipment){row.append(el('p',e.name+' — '+e.description+(e.usedRound?' · Ya usado esta ronda':'')));if(!contribution)row.append(button('Transferir '+e.name,'inventory-equipment-'+e.uid,()=>controller.chooseCard(e.uid)));row.append(button('Aportar '+e.name+' a la crisis','inventory-contribute-'+e.uid,()=>controller.chooseCard(e.uid,'contribute')));}if(!equipment.length)row.append(el('p','Sin equipo equipado.'));dialog.append(row);}
    dialog.append(el('p','El equipo no vuelve a la mano ni se sustituye directamente. Para cambiar un tipo, transferí primero el anterior a un receptor legal en su localidad. En modo local puede pertenecer al otro jugador; con IA solo al propio grupo. El combustible se usa eligiendo superviviente y destino.'));
   }
  }
  if(!dialog.open)dialog.showModal();else if(focusId)dialog.querySelector('#'+CSS.escape(focusId))?.focus({preventScroll:true});dialog.scrollTop=scroll;
 }
 document.addEventListener('visibilitychange',render,{signal});signal.addEventListener('abort',()=>{dialog.close();dialog.replaceChildren();},{once:true});return {render};
}
