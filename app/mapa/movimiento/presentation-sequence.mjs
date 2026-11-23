// Reloj exclusivamente visual: nunca ejecuta comandos ni tira dados.
// Duraciones únicas de toda tirada animada del mapa (moverse, atacar, D12 nocturno): se ajustan acá.
// roll: el dado gira y frena (ease-out); settle: queda quieto en la cara final antes de revelar la
// consecuencia. Ambas viven dentro de la fase 'roll'. Informe 125 (ajustes): 550 → 1200 + 200 ms.
export const sequenceDurations=Object.freeze({travel:1500,roll:1200,settle:200,reveal:1100,consequence:200});
// Movimiento reducido: corto, como antes de los ajustes.
export const reducedDurations=Object.freeze({travel:100,roll:80,settle:0,reveal:450,consequence:80});
// Giro con freno: rápido al principio, lento al final (el mismo ease-out cúbico de la malla del D12).
export const rollEase=p=>1-(1-Math.max(0,Math.min(1,p)))**3;
export function createPresentationSequence(response,{reduced=false,introDuration=sequenceDurations.travel,resultDuration=sequenceDurations.reveal}={}){
 const exposure=response.resolution?.exposure;if(!exposure)throw TypeError('Falta la exposición estructurada');
 const d=reduced?reducedDurations:sequenceDurations,spin=d.roll;
 const duration={travel:reduced?d.travel:introDuration,roll:exposure.rolled?d.roll+d.settle:0,reveal:resultDuration?(reduced?d.reveal:resultDuration):0,consequence:d.consequence};let elapsed=0,interrupted=false;
 function inspect(){let offset=0;for(const stage of ['travel','roll','reveal','consequence']){if(duration[stage]&&elapsed<offset+duration[stage]){const t=elapsed-offset;if(stage==='roll')return {stage,progress:Math.min(1,t/spin),settling:t>=spin,elapsed,exposure,reduced};return {stage,progress:t/duration[stage],elapsed,exposure,reduced};}offset+=duration[stage];}return {stage:interrupted?'interrupted':'done',progress:1,elapsed,exposure,reduced};}
 function advance(ms){if(!interrupted&&Number.isFinite(ms)&&ms>=0)elapsed+=ms;return inspect();}
 return {inspect,advance,
  // Un cuadro tardío no debe saltarse una fase completa:100ms es menor que
  // la consecuencia normal(200);50ms es menor que las fases reducidas(80).
  // Solo dilata la presentación bajo carga; advance conserva la finalización
  // expresa al activar movimiento reducido y no interviene en el motor.
  advanceFrame(ms){return advance(Number.isFinite(ms)?Math.min(reduced?50:100,ms):ms);},
  // Un toque durante la tirada la adelanta al resultado: solo mueve este reloj visual al comienzo
  // de la revelación. No vuelve a tirar, no consume azar ni manda nada al motor.
  skipRoll(){const now=inspect();if(interrupted||now.stage!=='roll')return false;elapsed=(duration.travel||0)+duration.roll;return true;},
  interrupt(){interrupted=true;elapsed=Object.values(duration).reduce((a,b)=>a+b,0);return inspect();}};
}
export function exposureText(e){return e.effect==='avoided'?(e.ability==='silent'?'Paso sigiloso · evitó la exposición sin tirar.':'Resistencia · evitó el daño de la tirada.'):(e.die?.label||{none:'○ Sin daño',wound:'♥ Herida',frost:'❄ Congelación',bite:'☣ Mordedura'}[e.effect]||'Resultado no disponible');}
export function movementSummary(response,locations=[]){const destination=locations.find(l=>l.engineIndex===response.destination)?.name||'su destino',e=response.resolution?.exposure,after=response.resolution?.actorAfter;return (response.name||response.actorId)+' llegó a '+destination+(after?.dead?' · falleció.':e?.effect==='wound'?' · sufrió una herida.':e?.effect==='frost'?' · sufrió congelación.':e?.effect==='bite'?' · sufrió una mordedura.':e?.effect==='avoided'?(e.ability==='silent'?' · evitó la exposición.':' · evitó el daño.'):' · sin daño.');}
