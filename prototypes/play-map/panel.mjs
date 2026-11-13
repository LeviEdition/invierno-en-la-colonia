const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export function mountPlayPanel({controller,getContext,onRecover,signal}){
 const dialog=document.getElementById('play-dialog');if(!dialog||!controller)return {render(){}};let key='';
 const button=(text,id,fn,disabled=false)=>{const b=el('button',text);b.id=id;b.type='button';b.disabled=disabled;b.addEventListener('click',fn,{signal});return b;};
 dialog.addEventListener('cancel',e=>{e.preventDefault();controller.close();},{signal});
 function render(){const {projection:p,active}=getContext(),s=controller.inspect(),v=p?.play,busy=s.phase==='sending',d=v?.decision;
  const visible=active&&!document.hidden&&v&&(v.managed||s.phase!=='closed');if(!visible){if(dialog.open)dialog.close();dialog.replaceChildren();key='';return;}
  const next=JSON.stringify([s,v]);if(key===next)return;key=next;const focus=document.activeElement?.id,scroll=dialog.scrollTop;dialog.replaceChildren();document.getElementById('floating-menu').hidden=true;document.getElementById('menu-toggle').setAttribute('aria-expanded','false');
  dialog.append(el('h2','Decisión de la partida'));const status=el('p',s.message);status.setAttribute('role','status');dialog.append(status);
  if(s.phase==='unknown'||v.unknown)dialog.append(el('p','Consultá el estado de la misma partida antes de repetir. Si no existe un resultado determinable, la operación seguirá bloqueada.'),button('Consultar estado','play-recover',onRecover));
  else if(d?.kind==='bite'){
   dialog.append(el('h3','Propagación de mordedura · '+d.target.name),el('p','Influencia '+d.target.influence+'. Sacrificar: muere y termina la propagación. Arriesgar: 4–6 lo salva; 1–3 lo mata y continúa la cadena por influencia.'),button('Sacrificar y detener contagio','play-bite-sacrifice',()=>controller.submit('bite',{option:'sacrifice'}),busy),button('Arriesgar tirada','play-bite-risk',()=>controller.submit('bite',{option:'risk'}),busy));
  }else if(d?.kind==='cross'){
   dialog.append(el('h3',d.card.title),el('p',d.card.story));for(const [index,ch]of d.card.choices.entries())dialog.append(button(ch[0]+' — '+ch[1]+(d.automated&&index===d.chosen?' · Decisión de IA':''),'play-cross-'+index,()=>controller.submit('cross',{index}),busy||d.automated||!d.allowed[index]));
   if(d.automated)dialog.append(button('Continuar turno de IA','play-cross-ai',()=>controller.submit('cross-ai'),busy));
  }else if(d?.kind==='recruit')dialog.append(el('h3',d.name),el('p',d.job+' · '+d.skill),button('Continuar','play-recruit',()=>controller.submit('recruit'),busy));
  else if(v.receipt){dialog.append(el('h3','Resultado confirmado'),el('p',v.receipt.summary));for(const e of v.events.filter(e=>e.type==='bite-roll').slice(-1))dialog.append(el('p','Tirada real de '+e.name+': '+e.value+(e.survived?' · se salva.':' · murió; el contagio continúa.')));dialog.append(button('Continuar','play-ack',()=>controller.submit('ack',{receiptId:v.receipt.id}),busy));}
  else dialog.append(button('Volver al mapa','play-close',()=>controller.close(),busy));
  if(!dialog.open)dialog.showModal();if(focus)dialog.querySelector('#'+CSS.escape(focus))?.focus({preventScroll:true});if(!dialog.contains(document.activeElement))dialog.querySelector('button:not(:disabled)')?.focus({preventScroll:true});dialog.scrollTop=scroll;
 }
 document.addEventListener('visibilitychange',render,{signal});signal.addEventListener('abort',()=>dialog.close(),{once:true});return {render};
}
