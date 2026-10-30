// Límite del montaje completo (PNG, Game/Scene y primer frame), no del juego.
// Margen amplio frente a los <0,5 s medidos localmente; se puede reintentar.
export const STARTUP_TIMEOUT_MS=15000;
export function waitForStartup(promise,{signal,deadline=performance.now()+STARTUP_TIMEOUT_MS}={}){
 return new Promise((resolve,reject)=>{
  let timer,settled=false;
  const finish=(fn,value)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);fn(value);};
  const abort=()=>finish(reject,signal.reason||new DOMException('Montaje cancelado','AbortError'));
  if(signal?.aborted)abort();
  else{
  signal?.addEventListener('abort',abort,{once:true});
  timer=setTimeout(()=>finish(reject,Object.assign(Error('El arranque superó 15 segundos'),{code:'STARTUP_TIMEOUT'})),Math.max(0,deadline-performance.now()));
  }
  Promise.resolve(promise).then(value=>finish(resolve,value),error=>finish(reject,error));
 });
}
