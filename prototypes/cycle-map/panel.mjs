import {describeCycleStep} from './presentation.mjs';
import {cycleMessages} from './controller.mjs';
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export function mountCyclePanel({controller,getContext,onNative,signal}){
 const dialog=document.getElementById('cycle-dialog'),end=document.getElementById('finish-turn');if(!dialog||!controller)return {render(){}};
 let key='',lastVisible=false;
 end.addEventListener('click',()=>controller.begin(),{signal});document.getElementById('review-final')?.addEventListener('click',()=>controller.show(),{signal});
 dialog.addEventListener('cancel',e=>{e.preventDefault();if(controller.inspect().phase==='confirming')controller.cancel();else controller.hide();},{signal});
 function button(text,id,fn,disabled=false){const b=el('button',text);b.type='button';b.id=id;b.disabled=disabled;b.addEventListener('click',fn,{signal});return b;}
 function render(){const {projection:p,active,executing}=getContext(),s=controller.inspect(),c=p?.cycle,busy=['sending','unknown'].includes(s.phase);end.disabled=!active||!c?.finish.allowed||c?.review||executing;end.title=executing?'Esperá el resultado de la acción.':cycleMessages[c?.finish.reason]||'Revisar fin del turno';const status=document.getElementById('cycle-status');if(status)status.textContent=c?.outcome?.label||c?.processing?(c?.outcome?.label|| (c?.mode==='ai'?'IA y ciclo en curso…':'Resolviendo ciclo…')):c?.decision?cycleMessages[c.decision.kind]||'Decisión pendiente.':s.message||'Turno de '+(p?.players.find(x=>x.id===p.turn)?.label||'—');
  const final=document.getElementById('review-final');if(final)final.hidden=!c?.outcome;
  const visible=active&&!document.hidden&&c&&s.phase!=='closed';if(!visible){if(dialog.open)dialog.close();dialog.replaceChildren();key='';if(lastVisible&&active)end.focus({preventScroll:true});lastVisible=false;return;}
  lastVisible=true;const next=JSON.stringify([s,c]);if(key===next)return;key=next;const scroll=dialog.scrollTop;dialog.replaceChildren();dialog.append(el('h2',s.phase==='confirming'?'Terminar turno':'Ciclo de turno y ronda'));
  if(s.message)dialog.append(el('p',s.message));
  if(s.phase==='confirming')dialog.append(button('Confirmar fin de turno','cycle-confirm',()=>controller.confirm()),button('Cancelar','cycle-cancel',()=>controller.cancel()));
  else if(c.decision?.kind==='death'){
   dialog.append(el('h3','Fallecimientos pendientes'));for(const d of c.decision.entries)dialog.append(el('p',d.name+' · '+d.loc+' · '+d.reason));dialog.append(button('Confirmar fallecimientos','cycle-death',()=>controller.resolve('death'),busy||!c.decision.ready));
  }else if(c.review){
   const op=c.operation;dialog.append(el('h3','Resultado del ciclo'),el('p','Los efectos ya están aplicados. Continuar solo revisa la presentación.'));
   const shown=s.index>=op.steps.length?op.steps:[op.steps[s.index]];
   for(const step of shown){const info=describeCycleStep(step),section=el('section');section.className='cycle-step';section.append(el('h3',info.title),el('p',info.explanation));const list=el('ul');for(const change of info.changes)list.append(el('li',change));if(!info.changes.length)list.append(el('li','Sin cambios en los contadores mostrados.'));section.append(list);if(info.events.length){const detail=el('details');detail.append(el('summary','Detalle de efectos y tiradas'));const events=el('ol');for(const text of info.events)events.append(el('li',text));detail.append(events);section.append(detail);}dialog.append(section);}
   if(s.index<op.steps.length)dialog.append(button('Ver todos los pasos','cycle-all',()=>controller.all(),busy));
   dialog.append(button(s.index<op.steps.length-1?'Siguiente paso':'Finalizar revisión','cycle-next',()=>controller.next(),busy));
  }else if(c.decision?.kind==='handover')dialog.append(el('h3','Pasar dispositivo a '+c.decision.label),el('p','Las manos y los dados están ocultos. Entregá el dispositivo antes de confirmar.'),button('Soy '+c.decision.label+' · continuar','cycle-pass',()=>controller.resolve('pass'),busy));
  else if(c.decision?.kind==='leaderChoice'){
   dialog.append(el('h3','Elegir sucesor'));for(const p of c.decision.choices)dialog.append(button(p.name+' · influencia '+p.influence,'cycle-leader-'+p.id,()=>controller.resolve('leader',p.id),busy));
  }else if(c.decision?.native)dialog.append(el('p',(cycleMessages[c.decision.kind]||'Decisión pendiente')+' Este caso conserva su componente original en V9.9.'),button('Resolver en V9.9','cycle-native',onNative,busy));
  else if(c.outcome)dialog.append(el('h3',c.outcome.label),el('p','La partida terminó. No se inicia otra ronda ni se reinicia automáticamente.'),button('Consultar mapa y Registro','cycle-close-final',()=>controller.hide(),busy));
  else if(c.processing){dialog.append(el('p',c.mode==='ai'?'La IA original está actuando; después corresponde la colonia.':'El motor está resolviendo el ciclo.'));if(c.mode==='ai')dialog.append(button('Acortar pausas de IA','cycle-speed',()=>controller.resolve('speed'),busy));}
  else if(s.phase==='unknown')dialog.append(button('Consultar en V9.9','cycle-native',onNative));
  else dialog.append(el('p','Estado actualizado.'),button('Volver al mapa','cycle-close',()=>controller.hide(),busy));
  if(!dialog.open)dialog.showModal();dialog.scrollTop=scroll;
 }
 document.addEventListener('visibilitychange',render,{signal});signal.addEventListener('abort',()=>{dialog.close();dialog.replaceChildren();},{once:true});return {render};
}
