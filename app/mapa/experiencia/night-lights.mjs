// Luces y noche (interfaz v2, informe 121). Solo presentación: no lee ni escribe la partida y
// nunca usa Math.random (el motor y las baterías lo reemplazan): el azar visual tiene semilla.

// mulberry32: misma semilla, misma secuencia.
export function mulberry32(seed){let a=seed>>>0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}

export const FLICKER=Object.freeze({low:.6,high:1,minMs:80,maxMs:450,smoothMs:70,flashDelta:.2,maxFlashesPerSecond:3,reduced:.8,day:.35});

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

// Brillo de cada luz: de día tenue y quieta; de noche, el parpadeo (o fijo con movimiento
// reducido). night ∈ [0,1] mezcla ambos.
export function lightLevel({night,flicker,reduced,config=FLICKER}){return config.day+((reduced?config.reduced:flicker)-config.day)*night;}

// Noche (opción A): solo mientras se presentan tiradas nocturnas. Entra en 1,2 s, dura al menos
// 1,2 s y amanece en 1 s. Sin tiradas no empieza. adopt(): una vista recuperada toma el estado
// actual (día) sin volver a animar.
export const NIGHT=Object.freeze({inMs:1200,minMs:1200,dawnMs:1000});
export function createNightAtmosphere(config=NIGHT){
 let start=null,end=null;
 const rise=(t,reduced)=>reduced?1:Math.min(1,Math.max(0,(t-start)/config.inMs));
 function level(t,reduced=false){
  if(start===null)return 0;
  if(end===null||t<end)return rise(t,reduced);
  const fall=reduced?0:1-(t-end)/config.dawnMs;
  if(fall<=0){start=end=null;return 0;}
  return rise(end,reduced)*fall;
 }
 return {
  begin(t){if(start===null){start=t;end=null;return;}if(end!==null){const current=level(t);start=t-current*config.inMs;end=null;}},
  end(t){if(start!==null&&end===null)end=Math.max(t,start+config.minMs);},
  adopt(){start=end=null;},
  level,
  active:t=>level(t)>0||start!==null&&end===null,
  inspect:()=>({start,end})
 };
}
