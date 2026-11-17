// Una partida completa, sin DOM, con el mismo bucle que test-support/run-game.mjs:
// decisiones pendientes primero, después una acción del turno; «terminar-turno»
// lanza finishTurn del motor y se espera su resolución asíncrona.
import {crearMotor} from './motor-laboratorio.mjs';
import {crearPolitica} from './politicas.mjs';
import {aplicarEscenario} from './escenarios.mjs';
import {evaluarCompetencia} from './competencia.mjs';

// conoceIndefensos (segunda corrida): la política y el evaluador de competencia
// cuentan a los indefensos de la colonia. Sin indefensos no cambia nada.
export async function jugarPartida({semilla,escenario='A',politica='ia-referencia',maxPasos=4000,conoceIndefensos=false,...configuracion}){
 const lab=crearMotor({semilla,...configuracion}),{engine,c,registro}=lab,estrategia=crearPolitica(politica,{indefensos:conoceIndefensos});
 const evaluar=()=>evaluarCompetencia(c,{indefensos:conoceIndefensos});
 engine.start('ai');
 aplicarEscenario(c,escenario);
 const inicial={objetivo:c.game.objective.name,necesidad:c.game.goal,rondas:c.game.max,vivos:c.game.humans.filter(p=>!p.dead).length,indefensos:c.game.helpless,comida:c.game.food,moral:c.game.morale};
 const traza=[];let tarea=null,hecha=false,excepcion=null,ocioso=0,completa=false;
 const anotarRonda=()=>{const g=c.game,r=registro.rondas[g.round]||(registro.rondas[g.round]={ronda:g.round,dadosTotal:null,vivos:null,noUsados:null,competencia:null});if(r.dadosTotal===null){traza.push('— ronda '+g.round);r.dadosTotal=g.dice.length;r.vivos=g.humans.filter(p=>!p.dead).length;r.moral=g.morale;r.comida=g.food;r.muestras=g.samples;}return r;};
 const dadosAntes=c.consume;
 c.consume=(min,indice)=>{const r=anotarRonda();if(!r.competencia)r.competencia=evaluar();return dadosAntes(min,indice);};
 try{
  for(let paso=0;paso<maxPasos;paso++){
   await Promise.resolve();
   if(excepcion)throw excepcion;
   const decision=estrategia.decidir(c);
   if(decision){traza.push(decision);ocioso=0;continue;}
   if(tarea){if(hecha){tarea=null;hecha=false;}else{if(++ocioso>250)throw Error('resolución asíncrona sin progreso');continue;}}
   if(c.game.ended){completa=true;break;}
   if(c.game.turn==='human')anotarRonda();
   // Eventos del laboratorio al empezar el turno (rescate del médico, curas), solo
   // sin decisiones pendientes; si ocurre uno, el bucle vuelve a mirar decisiones.
   const evento=lab.alEmpezarTurno();if(evento){traza.push(evento);ocioso=0;continue;}
   const accion=estrategia.actuar(c,registro);
   if(!accion){if(++ocioso>10)throw Error('política sin acción ni decisión');continue;}
   ocioso=0;traza.push(accion);
   if(accion==='terminar-turno'){
    const r=anotarRonda();r.noUsados=c.game.dice.length;if(!r.competencia)r.competencia=evaluar();
    if(registro.busquedaPendiente){registro.busquedaPendiente.categoria='vacia';registro.busquedaPendiente=null;}
    tarea=c.finishTurn();tarea.then(()=>hecha=true,e=>{excepcion=e;hecha=true;});
   }
  }
 }catch(error){return resultado(lab,inicial,traza,false,error);}
 return resultado(lab,inicial,traza,completa,null);
}
function resultado(lab,inicial,traza,completa,error){
 const {c,registro,azar,configuracion}=lab,g=c.game;
 const fin=c.gameOutcome(g)||(g.round>g.max?'time':null);
 return {
  configuracion:{...configuracion},inicial,completa,error:error?String(error.stack||error):null,
  resultado:fin,rondaFin:Math.min(g.round,g.max),moralFin:g.morale,comidaFin:g.food,muestrasFin:g.samples,
  vivosFin:g.humans.filter(p=>!p.dead).length,indefensosFin:g.helpless,llamadasAzar:azar.llamadas(),
  exposiciones:registro.exposiciones,indefensosPerdidos:registro.indefensosPerdidos,indefensosPorCrisis:registro.indefensosPorCrisis,equipoPerdido:registro.equipoPerdido,rescate:registro.rescate,
  dados:registro.dados,muertes:registro.muertes,crisis:registro.crisis,colonia:registro.colonia,rondas:Object.values(registro.rondas),reclutas:registro.reclutas,mejorasComida:registro.mejorasComida,
  traza,
 };
}
