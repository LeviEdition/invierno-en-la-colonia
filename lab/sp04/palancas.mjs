// Palancas de la segunda, tercera, cuarta y quinta corrida (docs/107, docs/110, docs/111 y docs/113).
// Cada una se aplica con las inyecciones de createEngine o con los setters del contexto; ninguna
// toca src/. Con los valores por defecto (V9.9) no se instala nada y el motor queda exactamente como
// en la primera corrida, que es lo que comprueba la calibración.
import {rollExposureDie} from '../../src/domain/exposure-die.mjs';

export const palancasBase=Object.freeze({
 exposicion:'d6',        // d6 (V9.9) · d12 (regla del mapa, PR #27)
 indefensos:null,        // null = V9.9 (0) · número de indefensos iniciales en la colonia
 comidaInicial:null,     // null = V9.9 (6) · comida inicial
 crisisFallida:'v99',    // v99 · agravada (además muere un indefenso; si no hay, herida al de menor influencia)
 moralMuerte:1,          // moral que cuesta la muerte de un superviviente (V9.9: 1). Indefenso: siempre 1
 equipoMuerto:'v99',     // v99 · perdido · mazo (queda en el mazo del lugar; en la colonia no hay mazo)
 rondasObjetivo:null,    // null = objetivo sorteado (V9.9) · 6 · 8 · 10: objetivo de esa duración
 rescate:null,           // null · retirarse · rescatar · rescatar-A (médico sin curar 2 rondas si el rescatista murió)
 medicoCome:true,        // diagnóstico: false = el médico incorporado no consume comida
 cocinero:null,          // tercera corrida: null · reemplaza (Tomás, cocinero, en lugar de Leo) · suma (Tomás como cuarto)
 medico:'abstracto',     // abstracto (107: cura en la colonia, no juega) · jugable-heridas · jugable-heridas-congelacion (110)
 llegadasColonia:'v99',  // cuarta corrida (regla B): v99 · min2 · min3 · fijo3 — llegadas de población a la colonia
 nocheAfuera:null,       // quinta corrida: null · 'localidad' · 'unica' — exposición al caer la noche
 regreso:false,          // quinta corrida: false · true — permite «Regresar a la colonia» (segundo movimiento, cuesta un dado)
 improvisar:false,       // sexta corrida: false · true — dado ≥4 en colonia aporta 1 contribución válida a la crisis (una vez por ronda por superviviente)
 crisisParcial:false,    // sexta corrida: false · true — aportes ≥ ceil(necesidad/2) reducen la consecuencia a la mitad
});
export const valoresPalancas={
 exposicion:['d6','d12'],
 crisisFallida:['v99','agravada'],
 moralMuerte:[1,2],
 equipoMuerto:['v99','perdido','mazo'],
 rondasObjetivo:[null,6,8,10],
 rescate:[null,'retirarse','rescatar','rescatar-A'],
 medicoCome:[true,false],
 cocinero:[null,'reemplaza','suma'],
 medico:['abstracto','jugable-heridas','jugable-heridas-congelacion'],
 llegadasColonia:['v99','min2','min3','fijo3'],
 nocheAfuera:[null,'localidad','unica'],
 regreso:[false,true],
 improvisar:[false,true],
 crisisParcial:[false,true],
};
// Regla B (docs/111): llegadas de población a la colonia en la fase de colonia, a
// partir de las de V9.9 (⌈(habitantes + indefensos)/2⌉). El ruido y la crisis fallida
// suman aparte, como en el motor.
export const LLEGADA_SALTEADA='llegada-salteada';
export const reglasLlegadas={v99:n=>n,min2:n=>Math.max(n,2),min3:n=>Math.max(n,3),fijo3:()=>3};
export const llegadasV99=(c,g=c.game)=>Math.ceil((c.alive(g).filter(p=>p.loc===0).length+g.helpless)/2);
// Lo que saben las políticas y el evaluador: la regla vigente sobre las llegadas de V9.9.
export const llegadasPrevistasColonia=(c,g=c.game)=>reglasLlegadas[g.labLlegadas||'v99'](llegadasV99(c,g));
// Médico jugable (105 §6): entra con recruit del motor y después se le fija la
// identidad, para que sus atributos no dependan del sorteo del plantel.
export const MEDICO_JUGABLE=Object.freeze({name:'Médico',job:'Médico',skill:'lab-medico',skillName:'Cura a un aliado',skillDesc:'Al empezar cada ronda cura una herida al aliado más herido en su localidad.',attack:4,search:3,influence:70});
export const RONDA_RESCATE=5,RONDAS_SIN_CURAR_A=2;

export function validarPalancas(p){
 for(const [k,valores] of Object.entries(valoresPalancas))if(!valores.includes(p[k]))throw Error('Palanca '+k+' inválida: '+p[k]);
 for(const k of ['indefensos','comidaInicial'])if(p[k]!==null&&!(Number.isInteger(p[k])&&p[k]>=0))throw Error('Palanca '+k+' inválida: '+p[k]);
}
export const esBase=p=>Object.entries(palancasBase).every(([k,v])=>p[k]===v);

// Estado inicial: indefensos, comida y objetivo fijado por duración. El objetivo se
// reemplaza después del sorteo del motor, así que el azar consumido es el mismo.
export function ajustarEstado(g,p,objetivos){
 if(p.indefensos!==null)g.helpless=p.indefensos;
 if(p.comidaInicial!==null)g.food=p.comidaInicial;
 if(p.rondasObjetivo!==null){
  const o=objetivos.find(o=>o.rounds===p.rondasObjetivo);if(!o)throw Error('Sin objetivo de '+p.rondasObjetivo+' rondas');
  g.objective=o;g.max=o.rounds;g.goal=o.need;
 }
 // Cocinero: Tomás es el único cocinero del plantel. addCharacter completa sus
 // atributos al arrancar, como con cualquier superviviente inicial.
 if(p.cocinero==='reemplaza')g.humans[1]={id:'h1',name:'Tomás',loc:0,wounds:0,frost:0,dead:false};
 if(p.cocinero==='suma')g.humans.push({id:'h'+g.nextId++,name:'Tomás',loc:0,wounds:0,frost:0,dead:false});
 if(p.llegadasColonia!=='v99')g.labLlegadas=p.llegadasColonia;
 if(p.rescate)g.labMedico=false; // true cuando el médico incorporado come como un habitante más (habitantesExtra)
 return g;
}
// Habitantes extra para la alimentación: el médico incorporado.
export const habitantesExtra=g=>g.labMedico?1:0;

// Instala las palancas sobre el contexto. Devuelve funciones para el bucle de partida.
export function instalarPalancas(c,p,registro){
 const humano=x=>c.ownerOf(x)==='human';
 if(p.exposicion==='d12')c.expose=(x,razon)=>exponerD12(c,x,razon);
 if(p.moralMuerte!==1||p.equipoMuerto!=='v99'){
  const matar=c.kill;
  c.kill=(x,causa,env=null)=>{
   const g=env?env.game:c.game;
   if(!x||x.dead||!humano(x))return matar(x,causa,env);
   // El motor resta 1; el resto se descuenta antes para que el reemplazo de
   // emergencia y la sucesión vean la moral final.
   if(p.moralMuerte>1)g.morale=Math.max(0,g.morale-(p.moralMuerte-1));
   if(!env&&p.equipoMuerto!=='v99'){
    const equipo=c.equipmentOf(x);
    if(equipo.length&&(p.equipoMuerto==='perdido'||x.loc===0)){registro.equipoPerdido+=equipo.length;x.equipment=[];}
   }
   return matar(x,causa,env);
  };
 }
 if(p.crisisFallida==='agravada'){
  const resolver=c.resolveCrisis;
  c.resolveCrisis=()=>{
   const k=c.game.crisis,falla=k.contributions.filter(t=>t===k.type).length<k.need;
   const salida=resolver();
   if(falla&&!c.game.ended){
    const g=c.game;
    if(g.helpless>0){g.helpless--;g.morale=Math.max(0,g.morale-1);registro.indefensosPerdidos++;registro.indefensosPorCrisis++;c.message('☠ Crisis agravada: murió un indefenso.');}
    else{
     const t=c.alive().filter(humano).sort((a,b)=>a.influence-b.influence)[0];
     if(t){t.wounds++;c.message('♥ Crisis agravada: '+t.name+' sufrió una herida.');if(t.wounds+t.frost>=3)c.kill(t,'heridas de la crisis agravada');}
    }
   }
   return salida;
  };
 }
 // Regla B. La población llega justo después de la crisis (colony(): crisis →
 // verify → población, empezando por la colonia), con los habitantes contados una vez
 // antes de las llegadas. Al terminar la crisis, el laboratorio cuenta lo mismo, hace
 // llegar todas las de la variante con addZombie del motor (mismo desbordamiento) y
 // saltea exactamente las que el motor calcula a continuación: ⌈(habitantes +
 // indefensos)/2⌉ con los que quedaron, que son las primeras addZombie(0) siguientes.
 if(p.llegadasColonia!=='v99'){
  const resolver=c.resolveCrisis,llegada=c.addZombie;let saltear=0;
  c.resolveCrisis=()=>{
   const salida=resolver();saltear=0;
   const g=c.game;if(g.ended)return salida;
   const v99=llegadasV99(c),objetivo=reglasLlegadas[p.llegadasColonia](v99);
   registro.llegadasExtraColonia+=objetivo-v99;
   for(let k=0;k<objetivo&&!g.ended;k++){c.addZombie(0);c.verify();}
   if(!g.ended)saltear=llegadasV99(c);
   return salida;
  };
  c.addZombie=(i,env=null)=>{if(!env&&i===0&&saltear>0){saltear--;return LLEGADA_SALTEADA;}return llegada(i,env);};
 }
 // Improvisación (sexta corrida): instala c.improvisarCrisis(survivorId) si improvisar=true.
 // La función consume el dado de menor valor ≥4 y aporta 1 contribución válida.
 // Cada superviviente puede improvisar una vez por ronda (p.hasImprovised, reseteado en nuevaRondaUnGrupo).
 if(p.improvisar){
  c.improvisarCrisis=(survivorId)=>{
   const g=c.game,k=g.crisis;
   if(g.ended||g.turn!=='human')return null;
   if(k.contributions.filter(t=>t===k.type).length>=k.need)return null;
   const sv=c.alive().find(x=>x.id===survivorId&&x.loc===0&&!x.hasImprovised);
   if(!sv)return null;
   const di=g.dice.findIndex(d=>d>=4);if(di<0)return null;
   const val=g.dice[di];g.dice.splice(di,1);
   k.contributions.push(k.type);k.given=k.contributions.filter(t=>t===k.type).length;
   sv.hasImprovised=true;registro.improvisaciones++;
   c.message('🛠 '+sv.name+' improvisó para la crisis (dado '+val+').');
   return 'improvisar:'+survivorId+':'+val;
  };
 }
 // Crisis parcial (sexta corrida): si los aportes llegan a ceil(necesidad/2) sin completar,
 // la consecuencia se reduce a la mitad (moral 1→0, zombis 2→1, comida 2→1, herida 1→0).
 // Se instala ANTES de instrumentar, por lo que el registro de crisis ya tiene la entrada
 // cuando este wrapper corre; se marca .parcial en ella.
 if(p.crisisParcial){
  const resolverCrisisPalanca=c.resolveCrisis;
  c.resolveCrisis=()=>{
   const k=c.game.crisis,g=c.game;
   const aportes=k.contributions.filter(t=>t===k.type).length;
   const esParcial=aportes>=Math.ceil(k.need/2)&&aportes<k.need;
   // Marcar la entrada que instrumentar (wrapper exterior) ya empujó.
   if(registro.crisis.length)registro.crisis[registro.crisis.length-1].parcial=esParcial;
   if(!esParcial)return resolverCrisisPalanca();
   const failType=k.fail;
   // Rellenar contribuciones para que el motor vea éxito (sin penalidad del motor).
   while(k.contributions.filter(t=>t===k.type).length<k.need)k.contributions.push(k.type);
   const salida=resolverCrisisPalanca();
   // Aplicar penalidad parcial si la partida sigue.
   if(!g.ended){
    if(failType==='food'){g.food=Math.max(0,g.food-1);c.message('⚠ Crisis parcial: -1 comida.');}
    else if(failType==='zombie'){c.addZombie(0);c.verify();c.message('⚠ Crisis parcial: 1 zombi a la colonia.');}
    else if(failType==='wound'){/* 1→0: sin penalidad */c.message('⚠ Crisis parcial: herida reducida a 0.');}
    else{/* moral 1→0 */c.message('⚠ Crisis parcial: pérdida de moral reducida a 0.');}
   }
   return salida;
  };
 }
 // Noche fuera de la colonia (quinta corrida, docs/113). Se ejecuta al terminar la fase de colonia
 // (después del consumo de comida, llegadas de zombis y c.verify). Por cada localidad (modo
 // 'localidad') o por todo el grupo exterior (modo 'unica'), tira el D12 de exposición sobre el
 // superviviente de MENOR INFLUENCIA (empate: primero en c.game.humans). Si hay un mordedura
 // pendiente se detiene; los demás supervivientes del mismo exterior quedan sin tirada esa noche.
 if(p.nocheAfuera){
  const coloniaOriginal=c.colony;
  c.colony=()=>{
   const salida=coloniaOriginal();
   if(!c.game.ended)aplicarNocheAfuera(c,p.nocheAfuera,registro);
   return salida;
  };
 }
 // Rescate del médico (105 §5, simplificado) y Atención médica. Se ejecuta al empezar
 // el turno del jugador, sin decisiones pendientes.
 const medico={activo:false,desde:null,rondasCuradas:new Set(),hecho:false};
 registro.rescate={ocurrio:false,rescatista:null,rescatistaMuere:null,cara:null,medico:false,curas:0};
 function alEmpezarTurno(){
  const g=c.game;if(g.ended||g.turn!=='human'||!p.rescate)return null;
  if(!medico.hecho&&g.round===RONDA_RESCATE){
   medico.hecho=true;
   const vivos=c.alive().filter(humano);if(!vivos.length)return null;
   // El rescatista llega a la puerta con dos daños: está a uno de morir.
   const r=vivos.slice().sort((a,b)=>(b.wounds+b.frost)-(a.wounds+a.frost)||a.influence-b.influence)[0];
   if(r.wounds+r.frost<2)r.wounds=2-r.frost;
   registro.rescate.ocurrio=true;registro.rescate.rescatista=r.name;
   if(p.rescate==='retirarse'){registro.rescate.rescatistaMuere=false;c.verify();return 'rescate:retirarse:'+r.id;}
   const resultado=exponerD12(c,r,'rescate del médico');
   registro.rescate.cara=resultado?.die?.outcome??null;registro.rescate.rescatistaMuere=!!r.dead;
   medico.desde=g.round+1+(p.rescate==='rescatar-A'&&r.dead?RONDAS_SIN_CURAR_A:0);
   if(p.medico==='abstracto'){medico.activo=true;g.labMedico=p.medicoCome;registro.rescate.medico=true;}
   else if(!g.ended&&c.recruit('human')){
    // Superviviente jugable: dados propios (1 + vivos), se mueve, se expone y come.
    medico.persona=g.humans.at(-1);Object.assign(medico.persona,MEDICO_JUGABLE,{skillUsed:false});
    medico.activo=true;registro.rescate.medico=true;
   }
   c.verify();c.paint();
   return 'rescate:'+p.rescate+':'+r.id+':'+(r.dead?'muere':'vive');
  }
  if(medico.activo&&g.round>=medico.desde&&!medico.rondasCuradas.has(g.round)){
   medico.rondasCuradas.add(g.round);
   if(p.medico==='abstracto'){
    const t=c.alive().filter(x=>humano(x)&&x.loc===0&&x.wounds>0).sort((a,b)=>b.influence-a.influence)[0];
    if(t){t.wounds--;registro.rescate.curas++;c.message('✚ El médico curó una herida de '+t.name+'.');return 'medico-cura:'+t.id;}
   }else{
    const t=objetivoDelMedico(c,medico.persona,p.medico);
    if(t){const congelacion=p.medico==='jugable-heridas-congelacion'&&t.frost>0;if(congelacion)t.frost--;else t.wounds--;registro.rescate.curas++;c.message('✚ El médico curó '+(congelacion?'una congelación':'una herida')+' de '+t.name+'.');return 'medico-cura:'+t.id;}
   }
  }
  return null;
 }
 return {alEmpezarTurno};
}

// Pasiva del médico jugable: el aliado vivo más herido en su misma localidad, sin
// contarse a sí mismo. «heridas»: solo heridas. «heridas-congelacion»: heridas o
// congelación; cura primero la congelación, que hiere cada ronda. A igualdad, el de
// mayor influencia.
export function objetivoDelMedico(c,m,variante){
 if(!m||m.dead)return null;
 const dano=x=>variante==='jugable-heridas'?x.wounds:x.wounds+x.frost;
 return c.alive().filter(x=>x!==m&&c.ownerOf(x)==='human'&&x.loc===m.loc&&dano(x)>0).sort((a,b)=>dano(b)-dano(a)||b.influence-a.influence)[0]||null;
}

// Noche fuera de la colonia: tira el D12 sobre el superviviente de menor influencia de cada
// localidad exterior ('localidad') o de todos los que están afuera ('unica').
// Empate de influencia: el primero en el orden de c.game.humans.
// Si un bite queda pendiente o el juego termina, se detiene sin exponer más.
function aplicarNocheAfuera(c,modo,registro){
 const humano=x=>c.ownerOf(x)==='human';
 const afuera=c.alive().filter(x=>humano(x)&&x.loc!==0);
 if(!afuera.length)return;
 registro.afueraAlCaerNoche.push({ronda:c.game.round,cantidad:afuera.length});
 const exponer=(objetivo,loc)=>{
  if(c.game.ended||c.pendingBite)return;
  if(!objetivo||objetivo.dead)return;
  const r=exponerD12(c,objetivo,'noche fuera de la colonia'+(loc!=null?' (loc '+loc+')':''));
  c.verify();
  if(r?.rolled){
   registro.exposicionesNoche.push({ronda:c.game.round,efecto:r.effect,localidad:loc??null});
   if(objetivo.dead||r.fatal)registro.muertesNoche++;
  }
 };
 if(modo==='unica'){
  exponer(minimoInfluencia(afuera,c.game.humans),null);
 }else{
  const locs=[...new Set(afuera.map(x=>x.loc))];
  for(const loc of locs){
   if(c.game.ended||c.pendingBite)break;
   const enLoc=afuera.filter(x=>x.loc===loc&&!x.dead);
   if(enLoc.length)exponer(minimoInfluencia(enLoc,c.game.humans),loc);
  }
 }
}
// Superviviente de menor influencia de la lista; en empate, el primero en el orden de humans.
function minimoInfluencia(candidatos,orden){
 const minInf=Math.min(...candidatos.map(x=>x.influence));
 const conMin=candidatos.filter(x=>x.influence===minInf);
 if(conMin.length===1)return conMin[0];
 for(const p of orden)if(conMin.includes(p))return p;
 return conMin[0];
}

// Réplica de resolveMapExposure (src/domain/map-exposure.mjs) sin mapPlay: una sola
// muestra de azar del motor, misma cara para efecto, mensaje y registro.
export function exponerD12(c,x,razon){
 if(!x||x.dead)return;
 const antes={wounds:x.wounds,frost:x.frost},die=rollExposureDie(()=>c.Math.random());
 const r={rolled:true,value:die.face,die,effect:die.outcome,ability:null,wounds:0,frost:0,fatal:false};
 c.message('🎲 Exposición D12 de '+x.name+' ('+razon+'): '+die.label+'.');
 if(die.outcome!=='none'&&x.skill==='resilient'&&!x.skillUsed){x.skillUsed=true;c.message('★ '+x.name+' evitó la exposición gracias a su habilidad.');return {...r,effect:'avoided',ability:'resilient'};}
 if(die.outcome==='bite'){
  const victimas=c.alive().filter(y=>y.id!==x.id&&y.loc===x.loc).sort((a,b)=>a.influence-b.influence).map(y=>y.id);
  c.game.biteResolving=true;c.pendingBite={victims:victimas,target:null};c.kill(x,'mordedura');c.biteNext();
 }else if(die.outcome==='frost'||die.outcome==='wound'){
  if(die.outcome==='frost')x.frost++;else x.wounds++;
  c.message((die.outcome==='frost'?'❄ Congelación de ':'♥ Herida de ')+x.name+'.');
  if(x.frost+x.wounds>=3)c.kill(x,'tres daños acumulados');
 }
 return {...r,wounds:x.wounds-antes.wounds,frost:x.frost-antes.frost,fatal:!!x.dead};
}
