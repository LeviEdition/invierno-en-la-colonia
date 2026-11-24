// Barra de acción y tarjetas de Objetivo y Crisis (interfaz v2, informe 122). Solo leen la
// proyección: no calculan costes, reglas ni azar. En el pase la proyección llega bloqueada y
// vacía, así que la barra no muestra superviviente, dados ni nada privado.
import {damageMarks} from '../experiencia/state-marks.mjs';
import {equipmentSlots,groupMembers} from './turn-flow.mjs';
const count=v=>Number.isFinite(v)?v:null,shown=v=>v===null||v===undefined?'—':String(v),ratio=(a,b)=>Number.isFinite(a)&&b>0?Math.max(0,Math.min(1,a/b)):0;
const plural=(n,word)=>n===1||!word?word||'':word+(/[aeiouáéíóú]$/i.test(word)?'s':'es');

// Dados gastados en el turno en curso: los eventos «die» que el motor emite al gastar uno,
// desde el último comienzo de ronda, cambio de turno o inicio de partida.
export function spentDice(events){
 const out=[];for(const e of events||[]){if(['round','turn','start'].includes(e?.type))out.length=0;else if(e?.type==='die'&&Number.isInteger(e.value))out.push(e.value);}
 return out;
}
// Cada dado conserva su lugar en la barra: el que el motor gastó pasa a gris donde estaba, en
// vez de desaparecer. Si las cuentas no cierran (otro turno, otra ronda), se arma de nuevo.
export function trackDice(previous,available,used){
 if(!Array.isArray(available))return [];
 const fresh=()=>[...available.map((value,i)=>({key:'d'+i,value,used:false})),...used.map((value,i)=>({key:'d'+(available.length+i),value,used:true}))];
 if(!Array.isArray(previous)||previous.length!==available.length+used.length)return fresh();
 const pool=[...available],spent=[...used],next=previous.map(d=>({key:d.key,value:d.value,used:d.used}));
 for(const d of next)if(d.used){const j=spent.indexOf(d.value);if(j<0)return fresh();spent.splice(j,1);}
 const missing=[];for(const d of next)if(!d.used){const j=pool.indexOf(d.value);if(j>=0)pool.splice(j,1);else missing.push(d);}
 for(const d of missing){const j=spent.indexOf(d.value);if(j>=0){spent.splice(j,1);d.used=true;}else if(pool.length)d.value=pool.shift();else return fresh();}
 return pool.length||spent.length?fresh():next;
}
// Superviviente activo: el seleccionado; si no hay, el líder del grupo en turno (vista previa).
export function actionBarModel(p,{selectedId=null,chosenIndex=null,previousDice=null}={}){
 const empty={actor:null,preview:false,own:false,dice:[],group:[],turnKey:p?[p.round,p.turn,p.blocked,p.ended].join('|'):''};
 if(!p||p.blocked||!Array.isArray(p.characters))return empty;
 const selected=p.characters.find(c=>c.id===selectedId)||null,leader=p.players?.find(x=>x.id===p.turn)?.leaderId;
 const c=selected||p.characters.find(x=>x.id===leader)||p.characters.find(x=>x.playerId===p.turn)||null;
 const dice=trackDice(previousDice,p.dice?.available??null,spentDice(p.play?.events));
 let k=0;for(const d of dice)d.chosen=!d.used&&Number.isInteger(chosenIndex)&&k++===chosenIndex;
 return {...empty,
  actor:c&&{id:c.id,name:c.name||'Nombre no disponible',job:c.job||'',playerId:c.playerId,leader:!!c.leader,location:p.locations.find(l=>l.id===c.locationId)?.name||'—',damage:damageMarks(c),slots:equipmentSlots(c)},
  // Sesión 7 (informe 126): miniaturas del grupo del activo; tocar una la hace activa.
  group:groupMembers(p,c),
  preview:!selected&&!!c,own:!!c&&!p.ended&&c.playerId===p.turn,dice};
}
// Tarjetas arriba a la izquierda. Los números son los que proyecta el motor.
export function cardsModel(p){
 if(!p||p.blocked)return {objective:null,crisis:null};
 const o=p.objective,c=p.crisis;
 return {
  // short: la tira de la tarjeta plegada (informe 123).
  objective:o?{title:o.name||'Objetivo',progress:`${shown(count(o.samples))} de ${shown(count(o.goal))} muestras · R${shown(count(p.maxRounds))}`,short:`Objetivo ${shown(count(o.samples))}/${shown(count(o.goal))} · R${shown(count(p.maxRounds))}`,ratio:ratio(o.samples,o.goal)}:null,
  crisis:c?{title:'Crisis',progress:`${shown(count(c.need))} ${plural(c.need,c.type)} · ${shown(count(c.given))} de ${shown(count(c.need))}`,short:`Crisis ${shown(count(c.given))}/${shown(count(c.need))}`,ratio:ratio(c.given,c.need)}:null
 };
}
// Un doble clic o un toque repetido sobre el mismo control no lo activa dos veces: después de
// activarse queda trabado un instante (más largo que cualquier transición). Los controladores
// del motor ya rechazan solicitudes repetidas; esto evita además abrir dos veces un borrador.
export function createClickGuard({ms=450,now=()=>performance.now()}={}){
 const last=new Map();
 return id=>{const t=now(),prev=last.get(id);if(prev!==undefined&&t-prev<ms)return false;last.set(id,t);return true;};
}
