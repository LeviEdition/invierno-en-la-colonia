// Palancas de la segunda corrida (docs/107). Cada una se aplica con las inyecciones
// de createEngine o con los setters del contexto; ninguna toca src/. Con los valores
// por defecto (V9.9) no se instala nada y el motor queda exactamente como en la
// primera corrida, que es lo que comprueba la calibración.
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
});
export const valoresPalancas={
 exposicion:['d6','d12'],
 crisisFallida:['v99','agravada'],
 moralMuerte:[1,2],
 equipoMuerto:['v99','perdido','mazo'],
 rondasObjetivo:[null,6,8,10],
 rescate:[null,'retirarse','rescatar','rescatar-A'],
 medicoCome:[true,false],
};
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
   medico.activo=true;g.labMedico=p.medicoCome;registro.rescate.medico=true;
   medico.desde=g.round+1+(p.rescate==='rescatar-A'&&r.dead?RONDAS_SIN_CURAR_A:0);
   c.verify();c.paint();
   return 'rescate:'+p.rescate+':'+r.id+':'+(r.dead?'muere':'vive');
  }
  if(medico.activo&&g.round>=medico.desde&&!medico.rondasCuradas.has(g.round)){
   medico.rondasCuradas.add(g.round);
   const t=c.alive().filter(x=>humano(x)&&x.loc===0&&x.wounds>0).sort((a,b)=>b.influence-a.influence)[0];
   if(t){t.wounds--;registro.rescate.curas++;c.message('✚ El médico curó una herida de '+t.name+'.');return 'medico-cura:'+t.id;}
  }
  return null;
 }
 return {alEmpezarTurno};
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
