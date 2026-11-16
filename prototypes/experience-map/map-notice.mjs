// El aviso pertenece al mapa, no al personaje seleccionado ni al renderer.
// Conservar las identidades consumidas impide reanunciar al reconstruir la vista.
export function createMapNotice({render,setTimer=setTimeout,cancelTimer=clearTimeout,duration=5000}){
 let current=null,timer=null;const seen=new Set();
 function clear(){if(timer!==null)cancelTimer(timer);timer=null;current=null;render(null);}
 function show(notice){
  if(!notice){clear();return;}
  const key=JSON.stringify([notice.scope,notice.id]);if(seen.has(key))return;
  seen.add(key);clear();current=notice;render(current);
  timer=setTimer(()=>{timer=null;current=null;render(null);},duration);
 }
 return {show,clear,inspect:()=>current};
}
