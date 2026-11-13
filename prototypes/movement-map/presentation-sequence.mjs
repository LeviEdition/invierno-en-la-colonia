// Reloj exclusivamente visual: nunca ejecuta comandos ni tira dados.
export const sequenceDurations=Object.freeze({travel:1500,roll:550,reveal:1100,consequence:200});
export function createPresentationSequence(response,{reduced=false,introDuration=1500,resultDuration=1100}={}){
 const exposure=response.resolution?.exposure;if(!exposure)throw TypeError('Falta la exposición estructurada');
 const duration={travel:reduced?100:introDuration,roll:exposure.rolled?(reduced?80:550):0,reveal:resultDuration?(reduced?450:resultDuration):0,consequence:reduced?80:200};let elapsed=0,interrupted=false;
 function inspect(){let offset=0;for(const stage of ['travel','roll','reveal','consequence']){if(duration[stage]&&elapsed<offset+duration[stage])return {stage,progress:(elapsed-offset)/duration[stage],elapsed,exposure,reduced};offset+=duration[stage];}return {stage:interrupted?'interrupted':'done',progress:1,elapsed,exposure,reduced};}
 function advance(ms){if(!interrupted&&Number.isFinite(ms)&&ms>=0)elapsed+=ms;return inspect();}
 return {inspect,advance,
  // Un cuadro tardío no debe saltarse una fase completa:100ms es menor que
  // la consecuencia normal(200);50ms es menor que las fases reducidas(80).
  // Solo dilata la presentación bajo carga; advance conserva la finalización
  // expresa al activar movimiento reducido y no interviene en el motor.
  advanceFrame(ms){return advance(Number.isFinite(ms)?Math.min(reduced?50:100,ms):ms);},
  interrupt(){interrupted=true;elapsed=Object.values(duration).reduce((a,b)=>a+b,0);return inspect();}};
}
export function exposureText(e){return e.effect==='avoided'?(e.ability==='silent'?'Paso sigiloso · evitó la exposición sin tirar.':'Resistencia · evitó el daño de la tirada.'):({none:'○ Sin daño',wound:'♥ Herida',frost:'❄ Congelación',bite:'☣ Mordedura'}[e.effect]||'Resultado no disponible');}
export function movementSummary(response,locations=[]){const destination=locations.find(l=>l.engineIndex===response.destination)?.name||'su destino',e=response.resolution?.exposure,after=response.resolution?.actorAfter;return (response.name||response.actorId)+' llegó a '+destination+(after?.dead?' · falleció.':e?.effect==='wound'?' · sufrió una herida.':e?.effect==='frost'?' · sufrió congelación.':e?.effect==='bite'?' · sufrió una mordedura.':e?.effect==='avoided'?(e.ability==='silent'?' · evitó la exposición.':' · evitó el daño.'):' · sin daño.');}
