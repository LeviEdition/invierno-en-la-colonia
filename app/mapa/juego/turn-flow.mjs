// Interfaz v2, sesión 7 (informe 126): una sola barra para actuar y un expediente para leer.
// Modelos puros: leen la proyección y el estado de los controladores; no calculan reglas,
// costes ni azar. Lo que se muestra (dados válidos, motivo, si una acción está permitida) sale
// tal cual de las opciones del motor.

// Ranuras de equipo de la barra. El límite «uno de cada tipo» es regla del hito de contenido
// (informe 124) y todavía no existe: acá solo se presenta lo que el superviviente tiene.
export const EQUIPMENT_SLOTS=Object.freeze([['herramienta','Herramienta'],['arma','Arma'],['educacion','Libro']]);
export function equipmentSlots(character){
 const items=Array.isArray(character?.equipment)?character.equipment:[];
 return EQUIPMENT_SLOTS.map(([kind,label])=>{const mine=items.filter(e=>e?.kind===kind);return {kind,label,items:mine.map(e=>e.name||'Objeto'),empty:!mine.length};});
}
// Miniaturas del grupo: los supervivientes del mismo jugador que el activo.
export function groupMembers(p,actor){
 if(!p||!actor||!Array.isArray(p.characters))return [];
 return p.characters.filter(c=>c.playerId===actor.playerId).map(c=>({id:c.id,name:c.name||'Nombre no disponible',leader:!!c.leader,active:c.id===actor.id}));
}

const PLAY_LABELS=Object.freeze({clean:'Limpiar residuos',attract:'Atraer zombis',special:'Tratamiento',boost:'Mejorar dado','return-home':'Regresar a la colonia'});
const placeOf=(p,actorId)=>{const c=p?.characters?.find(x=>x.id===actorId);return p?.locations?.find(l=>l.id===c?.locationId)?.name||'su localidad';};
const nameOf=(p,actorId)=>p?.characters?.find(x=>x.id===actorId)?.name||'superviviente';
const dieAsk=(q,chosen)=>chosen!==null&&chosen!==undefined?'dado '+chosen+' elegido · confirmá':q?.requirement>1?'elegí un dado de '+q.requirement+' o más':'elegí un dado';
const list=dice=>Array.isArray(dice)?dice.map(d=>({index:d.index,value:d.value,allowed:!!d.allowed})):null;

// Acción en curso: la tira de una línea sobre la barra y los dados que el motor acepta.
// `c` trae inspect() de cada controlador. Devuelve null si no hay nada en curso.
export function actionInProgress(p,c={}){
 if(!p||p.blocked)return null;
 const {search:s,action:a,play:pl,movement:m,inventory:inv}=c;
 if(s?.phase==='picking'&&s.intent){const q=p.search?.options?.[s.intent.actorId];return {kind:'search',text:'Buscar en '+placeOf(p,s.intent.actorId)+' · '+dieAsk(q,s.intent.dieValue??null),dice:list(q?.dice),chosen:s.intent.dieIndex??null};}
 if(a?.phase==='picking'&&a.intent){const kind=a.intent.kind,q=p.action?.options?.[a.intent.actorId]?.[kind],what=kind==='attack'?'Atacar en ':'Construir barricada en ';
  const ask=a.intent.cost===0?'con la habilidad, sin dado · confirmá':dieAsk(q,a.intent.dieValue??null);
  return {kind:'action',text:what+placeOf(p,a.intent.actorId)+' · '+ask,dice:a.intent.cost===0?null:list(q?.dice),chosen:a.intent.dieIndex??null};}
 if(pl?.intent&&pl.page==='action'){const i=pl.intent,q=i.kind==='boost'?p.play?.boost:p.play?.options?.[i.actorId]?.[i.kind];
  const ask=i.kind==='special'?'elegí paciente':i.dieValue?'dado '+i.dieValue+' elegido · confirmá':i.kind==='boost'?'elegí un dado menor que 6':'elegí un dado';
  return {kind:'play',text:(PLAY_LABELS[i.kind]||'Acción')+(i.kind==='boost'?'':' · '+nameOf(p,i.actorId))+' · '+ask,dice:i.kind==='special'?null:list(q?.dice),chosen:i.dieIndex??null};}
 if(['choosing','confirming'].includes(m?.phase)&&m.intent){const dest=p.locations?.find(l=>l.engineIndex===m.intent.destination)?.name;
  return {kind:'move',text:'Moverse · '+nameOf(p,m.intent.actorId)+(m.phase==='confirming'&&dest?' a '+dest+' · confirmá':' · elegí un edificio iluminado'),dice:null,chosen:null};}
 if(['browsing','picking'].includes(inv?.phase)&&['use','crisis'].includes(inv.purpose)){const own=p.inventory?.private,card=[...(own?.hand||[]),...(own?.equipment||[])].find(x=>x.uid===inv.intent?.cardId);
  const label=inv.purpose==='crisis'?'Aportar a la crisis':'Cartas';
  return {kind:'inventory',text:inv.phase==='picking'&&card?label+' · '+card.name+' · confirmá':label+' · elegí una carta',dice:null,chosen:null};}
 return null;
}

// Inventario con propósitos (un solo componente, informe 126):
// - use: abanico «Cartas», en el centro, con dos secciones: «De uso» (todo lo que no se equipa)
//   y «Equipables» (las que el motor deja equipar ahora al superviviente activo: opciones
//   allowed de inventory.private.options para ese actorId; nada se calcula acá);
// - manage: expediente, cartas para equipar y equipo para «Dar a…»;
// - crisis: la tarjeta de crisis, solo lo legal para aportar;
// - all: la vista clásica (fuera de la interfaz unificada).
export function equipableCards(own,actorId){
 const ok=new Set((own?.options||[]).filter(q=>q.allowed&&q.mode==='use'&&(actorId==null||q.actorId===actorId)).map(q=>q.cardId));
 return (own?.hand||[]).filter(c=>c.effect==='equip'&&ok.has(c.uid));
}
export function inventoryView(own,purpose='all',actorId=null){
 const hand=own?.hand||[],equipment=own?.equipment||[];
 if(purpose==='use')return {hand:hand.filter(c=>c.effect!=='equip'),equipables:equipableCards(own,actorId),equipment:[],cardAction:true,contribute:false,give:false};
 if(purpose==='manage')return {hand:hand.filter(c=>c.effect==='equip'),equipment,cardAction:true,contribute:false,give:true};
 if(purpose==='crisis'){const allowed=new Set((own?.options||[]).filter(q=>q.mode==='contribute'&&q.allowed).map(q=>q.cardId));return {hand:hand.filter(c=>allowed.has(c.uid)),equipment:equipment.filter(c=>allowed.has(c.uid)),cardAction:false,contribute:true,give:false};}
 return {hand,equipment,cardAction:true,contribute:true,give:true};
}
// «Usar carta» (sesión 7) aparece en el abanico solo si el motor permite usar alguna carta de uso ahora.
export function useCardAllowed(own){
 if(!own)return false;const usable=new Set((own.hand||[]).filter(c=>c.effect!=='equip').map(c=>c.uid));
 return (own.options||[]).some(q=>q.allowed&&q.mode==='use'&&usable.has(q.cardId));
}

// «Cartas» (ajustes de la sesión 7): se habilita si hay alguna carta de uso permitida o alguna
// equipable para el superviviente activo.
export function cardsAllowed(own,actorId=null){return useCardAllowed(own)||equipableCards(own,actorId).length>0;}

// Atajos de escritorio: B buscar, A atacar, M moverse, E expediente, 1–4 dado de la acción en
// curso, Espacio terminar turno. Nunca con modificadores, autorrepetición, dentro de campos de
// texto, con un modal abierto ni con la partida bloqueada (pase de dispositivo, muerte, espera).
// Espacio sobre un control lo activa como siempre: no se toma como atajo.
export const SPACE_CONTROLS='button,a[href],summary,input,select,textarea,label,[role=button],[contenteditable=true]';
export function turnShortcut(e,{modalOpen=false,blocked=false}={}){
 if(!e||modalOpen||blocked||e.defaultPrevented||e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey)return null;
 const t=e.target,tag=t?.localName;if(tag==='input'||tag==='select'||tag==='textarea'||t?.isContentEditable)return null;
 const k=e.key;
 if(k===' '||k==='Spacebar')return t?.closest?.(SPACE_CONTROLS)?null:'finish';
 if(/^[1-4]$/.test(k))return 'die:'+(Number(k)-1);
 return {b:'search',a:'attack',m:'move',e:'dossier'}[typeof k==='string'&&k.length===1?k.toLowerCase():'']||null;
}
