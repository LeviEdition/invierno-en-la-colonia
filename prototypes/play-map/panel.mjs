const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export function mountPlayPanel({controller,getContext,onRecover,signal}){
 const dialog=document.getElementById('play-dialog');if(!dialog||!controller)return {render(){}};let key='';
 const button=(text,id,fn,disabled=false)=>{const b=el('button',text);b.id=id;b.type='button';b.disabled=disabled;b.addEventListener('click',fn,{signal});return b;};
 dialog.addEventListener('cancel',e=>{e.preventDefault();controller.close();},{signal});
 for(const kind of ['clean','attract','special','boost'])document.getElementById(kind+'-action')?.addEventListener('click',()=>{const {selected}=getContext();controller.open('action',{kind,actorId:kind==='boost'?null:selected,dieId:null,dieIndex:null,dieValue:null});},{signal});
 function render(){const {projection:p,active,selected,executing}=getContext(),s=controller.inspect(),v=p?.play,busy=s.phase==='sending',d=v?.decision;
  for(const kind of ['clean','attract','special','boost']){const b=document.getElementById(kind+'-action'),q=kind==='boost'?v?.boost:v?.options?.[selected]?.[kind];if(b){b.disabled=!active||!q?.allowed||executing||v?.managed;b.title=q?.summary||'Seleccioná un superviviente propio.';if(kind==='special')b.textContent=q?.reason==='automatic'?'Habilidad automática':q?.reason==='builder'?'Constructor: usar Construir':'Usar habilidad de tratamiento';}}
  const visible=active&&!document.hidden&&v&&(v.managed||s.phase!=='closed');if(!visible){if(dialog.open)dialog.close();dialog.replaceChildren();key='';return;}
  const next=JSON.stringify([s,v]);if(key===next)return;key=next;const focus=document.activeElement?.id,scroll=dialog.scrollTop;dialog.replaceChildren();document.getElementById('floating-menu').hidden=true;document.getElementById('menu-toggle').setAttribute('aria-expanded','false');
  dialog.append(el('h2','Decisión de la partida'));const status=el('p',s.message);status.setAttribute('role','status');dialog.append(status);
  if(s.phase==='unknown'||v.unknown)dialog.append(el('p','Consultá el estado de la misma partida antes de repetir. Si no existe un resultado determinable, la operación seguirá bloqueada.'),button('Consultar estado','play-recover',onRecover));
  else if(d?.kind==='bite'){
   dialog.append(el('h3','Propagación de mordedura · '+d.target.name),el('p','Influencia '+d.target.influence+'. Sacrificar: muere y termina la propagación. Arriesgar: 4–6 lo salva; 1–3 lo mata y continúa la cadena por influencia.'),button('Sacrificar y detener contagio','play-bite-sacrifice',()=>controller.submit('bite',{option:'sacrifice'}),busy),button('Arriesgar tirada','play-bite-risk',()=>controller.submit('bite',{option:'risk'}),busy));
  }else if(d?.kind==='heal'){
   dialog.append(el('h3',d.actor.name+' · '+d.skill),el('p','Elegí un paciente en su localidad. No consume carta ni dado. El uso queda gastado al aplicar el tratamiento.'));for(const t of d.patients)dialog.append(button('Atender a '+t.name+' · heridas '+t.wounds+' · congelación '+t.frost,'play-heal-'+t.id,()=>controller.submit('heal',{target:t.id}),busy));dialog.append(button('Cancelar sin usar habilidad','play-heal-cancel',()=>controller.submit('heal-cancel'),busy));
  }else if(d?.kind==='attract'){
   dialog.append(el('h3','Atraer zombis a '+p.locations.find(l=>l.engineIndex===d.destination)?.name),el('p','El dado ya fue consumido. Quedan '+d.left+' atracciones y '+d.free+' accesos libres.'));for(const src of d.sources)dialog.append(button('Atraer desde '+src.name+' · '+src.count+' zombis','play-attract-'+src.index,()=>controller.submit('attract-choose',{source:src.index}),busy));dialog.append(button('Terminar atracción · no devuelve el dado','play-attract-end',()=>controller.submit('attract-end'),busy));
  }else if(d?.kind==='cross'){
   dialog.append(el('h3',d.card.title),el('p',d.card.story));for(const [index,ch]of d.card.choices.entries())dialog.append(button(ch[0]+' — '+ch[1]+(d.automated&&index===d.chosen?' · Decisión de IA':''),'play-cross-'+index,()=>controller.submit('cross',{index}),busy||d.automated||!d.allowed[index]));
   if(d.automated)dialog.append(button('Continuar turno de IA','play-cross-ai',()=>controller.submit('cross-ai'),busy));
  }else if(d?.kind==='recruit')dialog.append(el('h3',d.name),el('p',d.job+' · '+d.skill),button('Continuar','play-recruit',()=>controller.submit('recruit'),busy));
  else if(v.receipt){dialog.append(el('h3','Resultado confirmado'),el('p',v.receipt.summary));for(const e of v.events.filter(e=>e.type==='bite-roll').slice(-1))dialog.append(el('p','Tirada real de '+e.name+': '+e.value+(e.survived?' · se salva.':' · murió; el contagio continúa.')));dialog.append(button('Continuar','play-ack',()=>controller.submit('ack',{receiptId:v.receipt.id}),busy));}
  else if(s.page==='action'&&s.intent){const i=s.intent,q=i.kind==='boost'?v.boost:v.options?.[i.actorId]?.[i.kind];dialog.append(el('h3',({clean:'Limpiar residuos',attract:'Atraer zombis',special:'Tratamiento por habilidad',boost:'Mejorar dado con comida'})[i.kind]),el('p',q?.summary||'La acción cambió.'));
   for(const die of q?.dice||[])dialog.append(button('Dado '+die.value+(i.dieId===die.id?' · seleccionado':''),'play-die-'+die.index,()=>controller.choose({dieId:die.id,dieIndex:die.index,dieValue:die.value}),!die.allowed||busy));
   dialog.append(button('Confirmar coste y ejecutar','play-confirm',()=>{const {kind,...args}=controller.inspect().intent;controller.submit(kind,args);},busy||!q?.allowed||i.kind!=='special'&&!q.dice.some(d=>d.id===i.dieId&&d.allowed)),button('Cancelar antes de ejecutar','play-cancel',()=>controller.close(),busy));
  }else dialog.append(button('Volver al mapa','play-close',()=>controller.close(),busy));
  if(!dialog.open)dialog.showModal();if(focus)dialog.querySelector('#'+CSS.escape(focus))?.focus({preventScroll:true});if(!dialog.contains(document.activeElement))dialog.querySelector('button:not(:disabled)')?.focus({preventScroll:true});dialog.scrollTop=scroll;
 }
 document.addEventListener('visibilitychange',render,{signal});signal.addEventListener('abort',()=>dialog.close(),{once:true});return {render};
}
