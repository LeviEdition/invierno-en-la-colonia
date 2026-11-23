// Luces y noche (interfaz v2, informe 121). Solo presentación: no lee ni escribe la partida y
// nunca usa Math.random (el motor y las baterías lo reemplazan): el azar visual tiene semilla.

// mulberry32: misma semilla, misma secuencia.
export function mulberry32(seed){let a=seed>>>0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}

// Informe 123: más amplitud (de 60–100 % a 30–100 %), destellos más marcados (salto de 0,3) y
// día más visible (de 35 % a 50 %). Antes: low .6, flashDelta .2, day .35.
export const FLICKER=Object.freeze({low:.3,high:1,minMs:80,maxMs:450,smoothMs:70,flashDelta:.3,maxFlashesPerSecond:3,reduced:.8,day:.5});

// Parpadeo errático: cada luz con su propio ritmo (desfasado), entre 60 % y 100 % de su base,
// nunca apagada; cambios cada 80–450 ms con suavizado. Un salto de 0,2 o más cuenta como
// destello: como mucho 3 por segundo por luz; si no, el siguiente cambio es suave.
export function createFlicker(count,{seed=0x1c0ffee,config=FLICKER}={}){
 const rng=mulberry32(seed),lights=Array.from({length:count},()=>({value:config.low+(config.high-config.low)*rng(),target:0,wait:config.minMs+(config.maxMs-config.minMs)*rng(),flashes:[]}));
 let clock=0;for(const l of lights)l.target=l.value;
 function step(dt){
  clock+=dt;
  for(const l of lights){
   l.wait-=dt;
   if(l.wait<=0){
    l.flashes=l.flashes.filter(t=>clock-t<1000);
    let next=config.low+(config.high-config.low)*rng();
    if(Math.abs(next-l.value)>=config.flashDelta){if(l.flashes.length>=config.maxFlashesPerSecond)next=l.value+Math.sign(next-l.value)*(config.flashDelta*.5);else l.flashes.push(clock);}
    l.target=Math.min(config.high,Math.max(config.low,next));l.wait+=config.minMs+(config.maxMs-config.minMs)*rng();
   }
   l.value+=(l.target-l.value)*(1-Math.exp(-dt/config.smoothMs));
  }
  return lights.map(l=>l.value);
 }
 return {step,values:()=>lights.map(l=>l.value),inspect:()=>lights.map(l=>({value:l.value,target:l.target,flashes:l.flashes.length}))};
}

// Brillo de cada luz: parpadea siempre; de día sobre una base tenue (35 %), de noche plena.
// Con movimiento reducido, fija al 80 % (de esa base). night ∈ [0,1] mezcla ambos.
export function lightLevel({night,flicker,reduced,config=FLICKER}){return (reduced?config.reduced:flicker)*(config.day+(1-config.day)*night);}

// Noche (opción A): solo mientras se presentan tiradas nocturnas. Entra en 0,7 s, dura al menos
// 2,2 s y amanece en 1,2 s. Sin tiradas no empieza. adopt(): una vista recuperada toma el estado
// actual (día) sin volver a animar.
export const NIGHT=Object.freeze({inMs:700,minMs:2200,dawnMs:1200});
export function createNightAtmosphere(config=NIGHT){
 let start=null,end=null;const calls={begin:0,end:0,adopt:0};
 const rise=(t,reduced)=>reduced?1:Math.min(1,Math.max(0,(t-start)/config.inMs));
 function level(t,reduced=false){
  if(start===null)return 0;
  if(end===null||t<end)return rise(t,reduced);
  const fall=reduced?0:1-(t-end)/config.dawnMs;
  if(fall<=0){start=end=null;return 0;}
  return rise(end,reduced)*fall;
 }
 return {
  begin(t){calls.begin++;if(start===null){start=t;end=null;return;}if(end!==null){const current=level(t);start=t-current*config.inMs;end=null;}},
  end(t){calls.end++;if(start!==null&&end===null)end=Math.max(t,start+config.minMs);},
  adopt(){calls.adopt++;start=end=null;},
  level,
  active:t=>level(t)>0||start!==null&&end===null,
  inspect:()=>({start,end,calls:{...calls}})
 };
}

// Señal de la noche desde la cola de presentaciones (la usa main.mjs): empieza con la primera
// tirada nocturna presentada, termina cuando la cola se vacía, y el pase o una vista recuperada
// adoptan el día sin animar. night(kind) recibe 'begin' | 'end' | 'adopt'.
export function nightCue(night){return {start:frame=>night(frame?.kind==='exposure'?'begin':'end'),stop:()=>night('adopt'),idle:()=>night('end')};}
