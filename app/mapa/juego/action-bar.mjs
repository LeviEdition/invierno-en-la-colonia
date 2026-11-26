import {burntMate} from '../experiencia/carbon.mjs';// Vista de la barra de acción, las tarjetas de Objetivo y Crisis y el recurso en peligro
// (interfaz v2, informe 122). Dibuja lo que dicen los modelos (action-bar-model.mjs); las
// transiciones son de experiencia/transitions.mjs y solo animan opacity y transform.
import {dieFace} from '../movimiento/dice.mjs';
import {crossfade,fadeIn,pulse} from '../experiencia/transitions.mjs';
const $=id=>document.getElementById(id);
function element(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text;}
export function mountActionBar({portraitUrl,initials,onSelect=()=>{},onDie=()=>{},signal}){
 let actorId,turnKey,dice=[],cardText={},groupKey='',slotKey='',stripText=null;
 const nodes=new Map();
 // Sesión 7 (informe 126): tocar una miniatura del grupo la hace activa; tocar un dado durante
 // la acción en curso lo elige (por el mismo botón del panel, con las validaciones del motor).
 $('bar-group')?.addEventListener('click',e=>{const b=e.target.closest('[data-group-id]');if(b)onSelect(b.dataset.groupId);},{signal});
 $('bar-dice')?.addEventListener('click',e=>{const n=e.target.closest('.bar-die');if(!n||n.classList.contains('is-used'))return;const free=[...$('bar-dice').children].filter(x=>!x.classList.contains('is-used'));onDie(free.indexOf(n));},{signal});
 function paintGroup(list){
  const box=$('bar-group');if(!box)return;const key=list.map(g=>g.id+(g.active?'*':'')).join(' ');if(key===groupKey)return;groupKey=key;box.hidden=list.length<2;
  box.replaceChildren(...list.map(g=>{const b=element('button',undefined,'bar-mate');b.type='button';b.dataset.groupId=g.id;if(g.id===burntMate(list.map(x=>x.id)))b.dataset.quemada='true';b.setAttribute('aria-pressed',String(g.active));b.setAttribute('aria-label',(g.active?'Activo: ':'Elegir a ')+g.name);b.title=g.name+(g.leader?' · Líder':'');
   // Ajustes de la sesión 7: si no hay retrato (solo cuatro supervivientes tienen uno provisional),
   // o si la imagen no carga, iniciales sobre papel; nunca un círculo vacío.
   const url=portraitUrl(g.id),mark=element('span',initials(g.name),'mate-initials');b.dataset.portrait=String(!!url);b.append(mark);if(url){const img=element('img');img.alt='';img.width=40;img.height=40;img.decoding='async';img.addEventListener('error',()=>{img.remove();b.dataset.portrait='false';},{once:true});img.src=url;b.append(img);}return b;}));
 }
 function paintSlots(slots){
  const box=$('bar-slots');if(!box)return;const key=JSON.stringify(slots||[]);if(key===slotKey)return;slotKey=key;
  for(const s of slots||[]){const el=box.querySelector('[data-slot="'+s.kind+'"]');if(!el)continue;el.dataset.empty=String(s.empty);el.textContent=s.empty?'':s.items.join(' + ');el.title=s.label+': '+(s.empty?'vacía':s.items.join(', '));el.setAttribute('aria-label',el.title);}
 }
 function paintIdentity(m){
  const a=m.actor;$('bar-who').hidden=!a;if(!a)return;
  const url=portraitUrl(a.id),img=$('bar-portrait-img');img.hidden=!url;$('bar-initials').hidden=!!url;if(url&&img.getAttribute('src')!==url)img.src=url;img.alt='';setText($('bar-initials'),initials(a.name));
  setText($('bar-name'),a.name);setText($('bar-role'),[a.job,a.leader?'Líder':''].filter(Boolean).join(' · '));setText($('bar-location'),a.location);
  const damage=$('bar-damage'),key=a.damage.map(d=>d.kind+d.count).join(' ');if(damage.dataset.key!==key){damage.dataset.key=key;damage.replaceChildren(...a.damage.map(d=>{const s=element('span',undefined,'damage-mark damage-'+d.kind);s.title=d.label;s.append(element('span',d.symbol,'damage-symbol'),element('span',String(d.count),'damage-count'));return s;}));}
  $('bar-who').dataset.preview=String(m.preview);$('bar-portrait').setAttribute('aria-label','Expediente de '+a.name+' (E)');
 }
 function paintDice(list){
  const box=$('bar-dice');box.hidden=!list.length;const live=new Set();let i=0;
  for(const d of list){live.add(d.key);let n=nodes.get(d.key);
   if(!n||n.dataset.value!==String(d.value)){const face=dieFace(d.value),fresh=element('span',face.pips?undefined:face.label,'bar-die'+(face.pips?'':' numeric'));fresh.dataset.value=String(d.value);fresh.setAttribute('role','listitem');for(const pos of face.pips||[]){const pip=element('span',undefined,'pip');pip.style.gridRow=Math.ceil(pos/3);pip.style.gridColumn=(pos-1)%3+1;fresh.append(pip);}if(n)n.replaceWith(fresh);n=fresh;nodes.set(d.key,n);}
   const was=n.classList.contains('is-chosen');n.classList.toggle('is-used',d.used);n.classList.toggle('is-chosen',!!d.chosen);if(d.chosen&&!was)pulse(n);
   // Acción en curso: los dados que el motor acepta se resaltan y los demás se apagan.
   n.classList.toggle('is-valid',d.valid===true);n.classList.toggle('is-off',d.valid===false);
   n.setAttribute('aria-label','Dado '+d.value+(d.used?', usado':d.chosen?', elegido':d.valid===false?', no sirve para esta acción':', disponible'));// Solo se mueve si está fuera de lugar: mover un nodo cortaría su transición.
   if(box.children[i]!==n)box.insertBefore(n,box.children[i]||null);i++;}
  for(const [key,n]of nodes)if(!live.has(key)){n.remove();nodes.delete(key);}
 }
 function paintCard(id,card){
  const el=$(id+'-card');if(!el)return;el.dataset.empty=String(!card);
  const text=card?card.title+'|'+card.progress:'';const apply=()=>{setText($(id+'-title'),card?.title||'');setText($(id+'-progress'),card?.progress||'');};
  if(cardText[id]!==undefined&&cardText[id]!==text)crossfade($(id+'-text'),apply);else apply();cardText[id]=text;
  setText($(id+'-strip'),card?.short||'');
  // La barra avanza con transform (escala horizontal), con transición de 300 ms en CSS.
  const bar=$(id+'-bar'),scale='scaleX('+(card?card.ratio:0)+')';if(bar&&bar.style.transform!==scale)bar.style.transform=scale;
 }
 return {
  render(m,cards,resources,flow=null){
   // Cambio de superviviente: fundido cruzado de retrato, nombre, rol, localidad y heridas.
   const id=m.actor?.id??null;if(actorId!==undefined&&id!==actorId&&id&&actorId)crossfade($('bar-who'),()=>paintIdentity(m));else paintIdentity(m);actorId=id;
   paintGroup(m.group||[]);paintSlots(m.actor?.slots);
   // «Terminar turno» y otros cambios de fase: el estado siguiente entra con un fundido corto.
   if(turnKey!==undefined&&m.turnKey!==turnKey)fadeIn($('bar-dice'),{from:0});turnKey=m.turnKey;
   // Validez por valor: un dado sirve si el motor acepta algún dado de ese valor en la acción.
   const ok=flow?.dice?new Set(flow.dice.filter(d=>d.allowed).map(d=>d.value)):null;
   dice=m.dice;paintDice(ok?dice.map(d=>d.used?d:{...d,valid:ok.has(d.value)}):dice);
   // Tira de acción sobre la barra (una línea).
   const strip=$('action-strip');if(strip){const text=flow?.text||'';if(text!==stripText){stripText=text;setText($('action-strip-text'),text);strip.hidden=!text;if(text)fadeIn(strip);}}
   paintCard('objective',cards.objective);paintCard('crisis',cards.crisis);
   const food=document.querySelector('[data-resource=food]');if(food){const danger=!!resources?.food?.danger;food.classList.toggle('is-danger',danger);food.title=danger?'Comida en peligro: la colonia necesita '+resources.food.need+' en la próxima fase de colonia':'';}
   const waste=document.querySelector('[data-resource=waste]');if(waste){const danger=!!resources?.waste?.danger;waste.classList.toggle('is-danger',danger);waste.title=danger?'Residuos en peligro: desde '+resources.waste.limit+' la colonia pierde moral en la fase de colonia':'';}
  },
  dice:()=>dice
 };
}
