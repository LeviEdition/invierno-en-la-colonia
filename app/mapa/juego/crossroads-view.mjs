// Encrucijada en viñeta (interfaz v2, docs/109 §4 y §5). Solo disposición: zona de imagen
// de borde a borde con zona segura central, narración y, después de decidir, la barra de
// resultado. No hay ilustraciones de encrucijadas todavía: la zona queda preparada.
import {dieFace} from '../movimiento/dice.mjs';
const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};

// Resultado publicado por el motor (evento «cross»: título, opción y efecto) que no existía
// al enviar la elección. Sin evento nuevo, no hay vista de resultado.
export function crossResultFor(pending,play){
 if(!pending||!play)return null;
 const e=[...(play.events||[])].reverse().find(e=>e.type==='cross'&&e.title===pending.title&&!pending.known.has(e.id));
 return e?{title:pending.title,story:pending.story,choice:e.choice,effect:e.effect,generation:pending.generation}:null;
}

export function crossVignette({title,story,result=null}){
 const figure=el('figure',undefined,'cross-vignette'),art=el('div',undefined,'cross-art');
 art.setAttribute('role','img');art.setAttribute('aria-label','Escena de la encrucijada (ilustración pendiente)');
 art.append(el('div',undefined,'cross-safe'));figure.append(art);
 const nodes=[el('h3',title,'cross-title'),figure];
 if(result){const bar=el('p',undefined,'cross-result');bar.setAttribute('role','status');bar.append(el('strong',result.choice),document.createTextNode(' · '+result.effect));nodes.push(bar);}
 nodes.push(el('p',story,'cross-story'));
 return nodes;
}

// Dado de acción con puntos, como en la reserva. El D12 no pasa por acá.
export function dieDrawing(value){
 const face=dieFace(value),die=el('span',face.pips?undefined:face.label,'die die-small'+(face.pips?'':' numeric'));die.setAttribute('aria-hidden','true');
 for(const pos of face.pips||[]){const pip=el('span',undefined,'pip');pip.style.gridRow=String(Math.ceil(pos/3));pip.style.gridColumn=String((pos-1)%3+1);die.append(pip);}
 return die;
}
