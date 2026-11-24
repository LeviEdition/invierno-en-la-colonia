// Expediente como legajo (ajustes 2 de la sesión 7; guía 109 §8.7). Modelo puro: lee la
// proyección y devuelve lo que la pestaña «Superviviente» muestra; no calcula reglas ni azar.
import {DAMAGE_SYMBOLS} from './state-marks.mjs';
import {equipmentSlots} from '../juego/turn-flow.mjs';
import {seedOf} from './papel.mjs';

// Límite de muerte por daños acumulados (heridas + congelaciones). El motor lo aplica como un
// 3 literal en varios lugares (map-exposure, crisis parcial) y todavía no lo expone como
// capacidad; hasta que lo haga (hallazgo abierto en el tablero) la interfaz lo presenta con
// esta constante y una prueba la compara con el motor.
export const DEATH_DAMAGE=3;

// Tipo de habilidad, para leerla de un vistazo: «botón» si se usa desde la barra (Tratamiento,
// Construir sin dado), «reacción» si responde a un resultado, «automática» el resto.
const SKILL_KINDS=Object.freeze({medic:'button',nurse:'button',builder:'button',resilient:'reaction'});
const SKILL_KIND_LABELS=Object.freeze({button:'Botón',reaction:'Reacción',automatic:'Automática'});
export function skillKind(id){return SKILL_KINDS[id]||'automatic';}

// Estado de la habilidad con el dato del motor (skill.used): solo las de una vez por ronda lo traen.
export function skillStatus(skill){
 const kind=skillKind(skill?.id);
 if(kind==='automatic')return 'Siempre activa';
 if(skill?.used===true)return 'Ya usada esta ronda';
 if(skill?.used===false)return 'Disponible esta ronda';
 return '';
}

// Casillas de daño hasta el límite: primero las heridas, después las congelaciones, el resto vacías.
export function damageBoxes(character,limit=DEATH_DAMAGE){
 const w=Math.max(0,Number(character?.wounds)||0),f=Math.max(0,Number(character?.frost)||0),out=[];
 for(let i=0;i<Math.max(limit,w+f);i++)out.push(i<w?'wound':i<w+f?'frost':'empty');
 return out;
}

export function legajoModel(character,p,{playerName=id=>id}={}){
 if(!character)return null;
 const n=character.night,place=p?.locations?.find(l=>l.id===character.locationId)?.name||'Localidad no disponible';
 return {
  id:character.id,
  // Número de legajo: decorativo y fijo por persona (semilla del nombre), nunca azar de partida.
  number:String(100+seedOf(character.id+'/'+(character.name||''))%900).padStart(3,'0'),
  name:character.name||'Nombre no disponible',job:character.job||'',role:character.leader?'Líder':'',
  place,group:playerName(character.playerId),
  guard:!!n?.watch,outside:!n?.watch&&!!n?.outside,
  medals:[['Influencia',character.influence],['Ataque',character.effectiveAttack],['Búsqueda',character.effectiveSearch]],
  damage:{wounds:character.wounds,frost:character.frost,limit:DEATH_DAMAGE,boxes:damageBoxes(character),symbols:DAMAGE_SYMBOLS},
  skill:{name:character.skill?.name||'Habilidad no disponible',text:character.skill?.description||'',kind:skillKind(character.skill?.id),kindLabel:SKILL_KIND_LABELS[skillKind(character.skill?.id)],status:skillStatus(character.skill)},
  slots:equipmentSlots(character),
  // Preparado para el hito de contenido: ilustración e historia. Hoy no hay datos y no se muestran.
  art:null,story:null
 };
}

// Pinta la pestaña «Superviviente» (mismos ids que la ficha anterior: las baterías y el lector
// de pantalla siguen encontrando nombre, estado y habilidad).
export function paintLegajo(m,{$=id=>document.getElementById(id),setText=(e,t)=>{if(e&&e.textContent!==t)e.textContent=t;}}={}){
 if(!m)return;
 setText($('legajo-numero'),'Legajo n.º '+m.number);
 setText($('character-identity'),m.job);
 const role=$('legajo-rol');if(role){role.hidden=!m.role;setText(role,m.role);}
 setText($('character-location'),m.place);setText($('character-group'),m.group);
 const seal=$('character-night');if(seal){const text=m.guard?'Guardia · recibe la tirada esta noche':m.outside?'Duerme afuera esta noche':'';seal.hidden=!text;seal.dataset.sello=m.guard?'guardia':m.outside?'afuera':'';setText(seal,text);}
 const [inf,atk,src]=m.medals.map(([,v])=>v===null||v===undefined?'—':String(v));setText($('influence'),inf);setText($('combat'),atk==='—'?atk:atk+'+');setText($('search'),src==='—'?src:src+'+');
 const boxes=$('legajo-casillas');if(boxes){const key=m.damage.boxes.join(',');if(boxes.dataset.key!==key){boxes.dataset.key=key;boxes.replaceChildren(...m.damage.boxes.map(k=>{const b=document.createElement('span');b.className='legajo-casilla';b.dataset.kind=k;b.textContent=k==='empty'?'':m.damage.symbols[k];return b;}));}}
 setText($('legajo-habilidad-nombre'),m.skill.name+' · '+m.skill.kindLabel);
 setText($('character-skill'),m.skill.text);
 const status=$('legajo-habilidad-estado');if(status){status.dataset.status=m.skill.status==='Ya usada esta ronda'?'usada':m.skill.status?'lista':'';setText(status,m.skill.status);}
 const slots=$('legajo-equipo');if(slots)for(const s of m.slots){const el=slots.querySelector('[data-slot="'+s.kind+'"]');if(!el)continue;el.dataset.empty=String(s.empty);setText(el,s.items.join(' · '));el.title=s.empty?s.label+': vacío':s.label+': '+s.items.join(', ');}
 const story=$('legajo-historia');if(story)story.hidden=!m.art&&!m.story;
}
