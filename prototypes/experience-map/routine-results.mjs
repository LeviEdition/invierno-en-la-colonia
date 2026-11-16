import {actionNotice} from '../action-map/action-presentation.mjs';
export function playResult(receipt){const r=receipt.result||{};
 if(receipt.type==='bite'&&receipt.result)return r.option==='sacrifice'?r.targetName+' fue sacrificado; el contagio se detuvo.':r.roll?r.targetName+' arriesgó: dado '+r.roll.value+(r.roll.survived?' · se salvó.':' · murió; el contagio continuó.'):receipt.summary;
 if(receipt.type==='clean')return `Retiraste ${r.removedWaste} residuos · dado ${r.die}.`;
 if(receipt.type==='boost')return `Dado ${r.die} → ${r.improvedDie} · gastaste ${r.foodSpent} comida.`;
 if(receipt.type==='heal')return `${r.targetName}: ${r.woundsHealed||0} heridas y ${r.frostHealed||0} congelaciones curadas.`;
 if(receipt.type==='heal-cancel')return 'Tratamiento cancelado sin gastar la habilidad.';
 if(receipt.type.startsWith('attract'))return `Atrajiste ${r.attracted||0} zombis. El dado gastado no se devuelve.`;
 return receipt.summary;
}
export function inventoryResult(receipt){const r=receipt.result;if(!r)return receipt.summary;
 if(r.kind==='contribute')return 'Aportaste una carta a la crisis.';
 if(r.kind==='transfer')return `${r.cardName} entregado a ${r.targetName}.`;
 if(r.kind==='equip')return `${r.targetName} equipó ${r.cardName}.`;
 if(r.kind==='heal'||r.kind==='frost')return `${r.targetName}: ${r.woundsHealed} heridas y ${r.frostHealed} congelaciones curadas con ${r.cardName}.`;
 if(r.kind==='food')return `${r.cardName}: +${r.foodAdded} comida.`;
 if(r.kind==='sample'||r.kind==='research')return `${r.cardName}: +${r.samplesAdded} muestras.`;
 if(r.kind==='move')return `${r.targetName} se movió con combustible, sin exposición.`;
 return receipt.summary;
}
// Reconocer resultados solo elimina metadatos de presentación, mediante los
// mismos comandos de reconocimiento existentes. Nunca reenvía la acción.
export function createRoutineResults({action,search,inventory,play,onNotice=()=>{},enqueue=queueMicrotask}){
 let state=null,scope=null,notice=null,scheduled=false;const seen=new Set();
 const key=p=>p?.play?`${p.play.session}/${p.play.generation}/${p.round}/${p.turn}`:null;
 function remember(id,text){if(seen.has(id))return;seen.add(id);notice={id,text,scope};onNotice(notice);}
 function update(next){state=next;const s=key(next),privateBarrier=!next||['setup','handover','death','waiting'].includes(next.blocked)||next.cycle?.decision?.kind==='handover'||next.ended;
  if(s!==scope||privateBarrier){scope=s;notice=null;seen.clear();onNotice(null);}
  if(!next?.play||privateBarrier||scheduled)return;scheduled=true;enqueue(()=>{scheduled=false;if(state!==next){update(state);return;}
   const a=action.inspect(),q=search.inspect(),i=inventory.inspect(),p=play.inspect(),d=next.play.decision;
   if(d?.kind==='recruit'&&!['sending','unknown'].includes(p.phase)){remember('recruit_'+next.play.generation+'_'+d.name,d.name+' se incorporó al grupo · '+d.job+'. '+d.skill);play.submit('recruit');return;}
   if(d||next.cycle?.decision)return;
   if(a.phase==='result'&&a.operation&&!a.operation.generalDecision){remember(a.operation.operationId,actionNotice(a.operation,next.locations));action.dismiss();return;}
   if(q.phase==='result'&&q.operation&&!q.operation.generalDecision){const r=q.operation.result;remember(q.operation.operationId,r?`${q.operation.name} conservó ${r.card.name}.`: 'No quedaron cartas para conservar.');search.dismiss();return;}
   const ir=next.inventory?.receipt;if(ir&&!ir.generalDecision&&i.phase==='result'){remember(ir.id,inventoryResult(ir));inventory.dismiss();return;}
   const pr=next.play.receipt;if(pr&&pr.type!=='bite'&&!next.play.decision&&p.phase!=='sending'&&p.phase!=='unknown'){remember(pr.id,playResult(pr));play.submit('ack',{receiptId:pr.id});}
  });
 }
 function clear(){notice=null;onNotice(null);}
 return {update,clear,finishAction(op,next){remember(op.operationId,actionNotice(op,next.locations));},inspect:()=>notice};
}
