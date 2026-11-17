// Motor real con las inyecciones que ofrece createEngine. No se modifica src/.
// - dos-grupos: V9.9 tal cual (IA de referencia conectada), para calibrar el arnés.
// - un-grupo: estado sin segundo bando, reglas de fin y de reemplazo limitadas al
//   grupo del jugador, ronda nueva con dados/crisis parametrizados. El bando IA
//   queda inerte (automatismo vacío), así que el turno de la IA no consume nada.
import {createEngine} from '../../src/application/reference-engine.mjs';
import {createReferenceState} from '../../src/domain/reference-state.mjs';
import {createRules} from '../../src/domain/reference-rules.mjs';
import {createTurns} from '../../src/application/reference-turns.mjs';
import {createAgent} from '../../src/agents/reference-agent.mjs';
import {crearAzar} from './azar.mjs';
import {palancasBase,validarPalancas,esBase,ajustarEstado,instalarPalancas,habitantesExtra} from './palancas.mjs';

export const formulasDados={
 v99:n=>1+n,          // V9.9: 1 + supervivientes vivos
 'mas-uno':n=>2+n,    // un dado fijo más
 doble:n=>2*n,        // dos por superviviente
};
export const formulasComida={
 v99:(g,c)=>{const home=c.alive(g).filter(p=>p.loc===0);return Math.max(0,Math.ceil((home.length+g.helpless+habitantesExtra(g))/2)-(home.some(p=>p.skill==='cook')?1:0));},
 ligera:(g,c)=>{const home=c.alive(g).filter(p=>p.loc===0);return Math.max(0,Math.floor((home.length+g.helpless+habitantesExtra(g))/2)-(home.some(p=>p.skill==='cook')?1:0));},
 estricta:(g,c)=>{const home=c.alive(g).filter(p=>p.loc===0);return Math.max(0,home.length+g.helpless+habitantesExtra(g)-(home.some(p=>p.skill==='cook')?1:0));},
};
export const factoresZombis={v99:1,mitad:.5,doble:2};
export const configuracionBase=Object.freeze({variante:'un-grupo',dados:'v99',crisis:2,comida:'v99',zombis:'v99'});

export function crearMotor({semilla,variante='un-grupo',dados='v99',crisis=2,comida='v99',zombis='v99',...resto}={}){
 const palancas={...palancasBase};for(const k of Object.keys(resto)){if(!(k in palancasBase))throw Error('Parámetro desconocido: '+k);palancas[k]=resto[k];}
 validarPalancas(palancas);
 if(!formulasDados[dados])throw Error('Fórmula de dados desconocida: '+dados);
 if(!formulasComida[comida])throw Error('Fórmula de comida desconocida: '+comida);
 if(!(zombis in factoresZombis))throw Error('Factor de zombis desconocido: '+zombis);
 if(!Number.isInteger(crisis)||crisis<0)throw Error('Exigencia de crisis inválida: '+crisis);
 const unGrupo=variante==='un-grupo';
 if(!unGrupo&&(dados!=='v99'||crisis!==2||comida!=='v99'||zombis!=='v99'||!esBase({...palancas,exposicion:'d6'})))throw Error('La línea base de dos grupos no admite barridos: es V9.9 sin cambios (solo admite cambiar el dado de exposición)');
 const azar=crearAzar(semilla);let c=null;
 const registro=crearRegistro();
 const engine=createEngine({
  Math:azar.Math,
  setTimeout:f=>{queueMicrotask(f);return 0;},
  stateFactory:args=>{const g=createReferenceState(args);if(unGrupo){g.bots=[];g.botItems=[];g.botDice=[];g.leaders.ai=null;}return esBase(palancas)?g:ajustarEstado(g,palancas,c.objectives);},
  rulesFactory:(ctx,opciones)=>{
   c=ctx;const reglas=createRules(ctx,opciones);
   if(unGrupo){
    reglas.gameOutcome=g=>{if(g.morale<=0)return 'morale';if(g.noReplacement||!g.humans.some(p=>!p.dead)&&!g.biteResolving)return 'survivors';if(g.samples>=g.goal)return 'victory';return null;};
    reglas.feedingNeed=g=>formulasComida[comida](g,ctx);
   }
   return reglas;
  },
  turnsFactory:(ctx,opciones)=>{
   const turnos=createTurns(ctx,opciones);
   if(unGrupo)turnos.newRound=()=>nuevaRondaUnGrupo(ctx,{dados,crisis});
   return turnos;
  },
  // Un grupo: el turno de la IA existe en el ciclo del motor pero no hace nada.
  automation:unGrupo?{botTurn:()=>Promise.resolve(),botContributeTools(){}}:null,
 });
 if(!unGrupo)engine.connectAutomation(ctx=>createAgent(ctx,{Math:azar.Math,setTimeout:f=>{queueMicrotask(f);return 0;}}));
 if(!c)throw Error('El motor no entregó su contexto a rulesFactory');
 if(unGrupo)limitarReemplazoAlGrupo(c);
 if(unGrupo&&factoresZombis[zombis]!==1)escalarEntradaDeZombis(c,factoresZombis[zombis]);
 const {alEmpezarTurno}=instalarPalancas(c,palancas,registro);
 instrumentar(c,registro);
 return {engine,c,azar,registro,alEmpezarTurno,configuracion:{semilla,variante,dados,crisis,comida,zombis,...palancas}};
}

// Ronda nueva de un grupo: misma secuencia que reference-turns.newRound, sin dados
// del bando IA y con la fórmula de dados y la exigencia de crisis del laboratorio.
function nuevaRondaUnGrupo(c,{dados,crisis}){
 const g=c.game;if(g.ended)return;
 g.turn='human';c.selected=c.selectionBySide.human;g.crossPending=false;g.crossResolved=false;g.noReplacement=false;
 c.reviewLeader('human');c.reviewLeader('ai');
 c.all().forEach(p=>{p.moved=false;p.skillUsed=false;for(const eq of c.equipmentOf(p))if(eq&&typeof eq==='object')eq.usedRound=0;});
 const types=['comida','medicina','herramienta','combustible'];const crisisType=types[c.random(types.length)];
 g.crisis={type:crisisType,need:crisis,given:0,contributions:[],fail:['moral','zombie','food','wound'][c.random(4)]};
 g.dice=Array.from({length:formulasDados[dados](g.humans.filter(p=>!p.dead).length)},c.die);
 g.botDice=[];
 c.picked=0;g.crossAttempts=0;c.crossDraw('human');
 c.message('⚠ Crisis: aportar '+crisis+' '+crisisType+'.');
 c.applyFrost('human');c.replaceLastSurvivors();c.verify();
 if(!g.ended)c.crossTrigger('round',null);
 c.paint();
}
// V9.9 reemplaza de emergencia al último superviviente de cada bando. Con un solo
// grupo, la regla se aplica únicamente al grupo del jugador.
function limitarReemplazoAlGrupo(c){
 c.replaceLastSurvivors=(env=null)=>{
  const g=env?env.game:c.game;
  if(!g||g.ended||g.biteResolving||g.morale<=0||g.humans.some(p=>!p.dead))return;
  const descartadas=g.items.length;g.items.splice(0,g.items.length);
  c.ruleMessage(env,'⚠ Perdiste tu último superviviente. Se descartaron '+descartadas+' cartas de tu mano.');
  if(!c.recruit('human',true,env))g.noReplacement=true;
 };
}
// Barrido de entrada de zombis: multiplica las llegadas de la fase de colonia
// (llegadas por población, por ruido y por crisis fallida). mitad: una de cada dos.
function escalarEntradaDeZombis(c,factor){
 const colonia=c.colony,llegada=c.addZombie;let enColonia=false,contador=0;
 c.colony=()=>{enColonia=true;contador=0;try{colonia();}finally{enColonia=false;}};
 c.addZombie=(i,env=null)=>{
  if(!enColonia||env)return llegada(i,env);
  contador++;
  if(factor===.5){if(contador%2===0)return;return llegada(i,env);}
  for(let k=0;k<factor;k++){if(c.game.ended)return;llegada(i,env);}
 };
}

export function crearRegistro(){
 return {
  dados:[],      // {ronda,valor,accion,personaje,categoria,detalle}
  muertes:[],    // {ronda,nombre,id,causa,lado}
  crisis:[],     // {ronda,tipo,exito,aportes,fallo}
  colonia:[],    // {ronda,comidaAntes,comidaDespues,necesidad,hambre,moralAntes,moralDespues}
  rondas:{},     // ronda -> {noUsados,vivos,dadosTotal,competencia}
  reclutas:[],   // {ronda,nombre,emergencia}
  mejorasComida:0,
  busquedaPendiente:null,
  exposiciones:[], // {ronda,efecto}: none · wound · frost · bite · avoided
  indefensosPerdidos:0,indefensosPorCrisis:0,equipoPerdido:0,enColonia:false,
  rescate:null,
 };
}
// Observadores: llaman al original y anotan; no alteran resultados ni consumen azar.
function instrumentar(c,registro){
 const consumo=c.consume;
 c.consume=(min,indice)=>{
  const valor=consumo(min,indice);
  if(valor!==null){const p=c.person();const dado={ronda:c.game.round,valor,accion:registro.accionActual||'desconocida',personaje:p?.id||null,nombre:p?.name||null,categoria:null,detalle:null};registro.dados.push(dado);if(dado.accion==='buscar')registro.busquedaPendiente=dado;else dado.categoria=categoriaDeAccion(dado.accion);}
  return valor;
 };
 const matar=c.kill;
 c.kill=(p,causa,env=null)=>{const real=!env&&p&&!p.dead;const antes=real?{ronda:c.game.round,nombre:p.name,id:p.id,causa,lado:c.ownerOf(p),localidad:p.loc,fase:registro.enColonia?'colonia':c.game.turn}:null;const salida=matar(p,causa,env);if(antes)registro.muertes.push(antes);return salida;};
 const crisis=c.resolveCrisis;
 c.resolveCrisis=()=>{const k=c.game.crisis,aportes=k.contributions.filter(t=>t===k.type).length;registro.crisis.push({ronda:c.game.round,tipo:k.type,exito:aportes>=k.need,aportes,necesidad:k.need,fallo:k.fail});return crisis();};
 const colonia=c.colony;
 c.colony=()=>{const g=c.game,antes={comida:g.food,moral:g.morale,hambre:g.hunger,necesidad:c.feedingNeed(g)};registro.enColonia=true;let salida;try{salida=colonia();}finally{registro.enColonia=false;}registro.colonia.push({ronda:g.round,comidaAntes:antes.comida,comidaDespues:g.food,necesidad:antes.necesidad,hambre:g.hunger,hambreNueva:g.hunger>antes.hambre,moralAntes:antes.moral,moralDespues:g.morale});return salida;};
 const reclutar=c.recruit;
 c.recruit=(lado,emergencia=false,env=null)=>{const salida=reclutar(lado,emergencia,env);if(salida&&!env)registro.reclutas.push({ronda:c.game.round,lado,emergencia,nombre:c.ownerGroup(lado).at(-1)?.name});return salida;};
 const exponer=c.expose;
 c.expose=(p,razon)=>{const r=exponer(p,razon);if(r?.rolled)registro.exposiciones.push({ronda:c.game.round,efecto:r.effect});return r;};
 const llegada=c.addZombie;
 c.addZombie=(i,env=null)=>{const antes=env?null:c.game.helpless;const salida=llegada(i,env);if(!env&&c.game.helpless<antes)registro.indefensosPerdidos+=antes-c.game.helpless;return salida;};
 const mejorar=c.boostDie;
 c.boostDie=()=>{const antes=c.game.food;mejorar();if(c.game.food<antes)registro.mejorasComida++;};
 const elegirBotin=c.chooseLoot;
 c.chooseLoot=i=>{const pendiente=c.pendingLoot,carta=pendiente?.items[i];elegirBotin(i);const dado=registro.busquedaPendiente;if(dado&&carta&&!c.pendingLoot){const d=c.catalog.resolve(carta);dado.detalle=d?.id||null;dado.categoria=categoriaDeCarta(d);registro.busquedaPendiente=null;}};
}
export function categoriaDeAccion(accion){return {atacar:'abastecer',barricada:'abastecer',limpiar:'abastecer',atraer:'abastecer'}[accion]||'otros';}
// Búsqueda: se clasifica por la carta conservada. Muestras y notas avanzan el
// objetivo; todo lo demás sostiene la colonia. El manual es fortificación.
export function categoriaDeCarta(d){if(!d)return 'vacia';return ['sample','notes'].includes(d.id)?'objetivo':'abastecer';}
