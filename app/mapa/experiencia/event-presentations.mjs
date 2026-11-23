// Cola exclusivamente visual. Los resultados e instantáneas ya vienen del motor.
export function createEventPresentations({canPresent=()=>true,start,stop=()=>{},onIdle=()=>{}}){
 let scope=null,active=null,queued=[];const seen=new Set();
 const frames=p=>[p?.play?.presentation,...(p?.cycle?.presentations||[])].filter(Boolean).sort((a,b)=>a.order-b.order);
 function interrupt(){const had=!!active;active=null;queued=[];if(had)stop();}
 function pump(){
  if(active||!queued.length)return;
  const frame=active=queued.shift();
  start(frame,()=>{if(active!==frame)return;active=null;if(queued.length)pump();else onIdle();});
 }
 function update(p){
  const key=p?.play?`${p.movement.session}/${p.play.generation}/${p.epoch}`:null;
  const incoming=frames(p);
  // Una vista nueva adopta el estado recuperado sin volver a animar su historia.
  if(key!==scope){interrupt();scope=key;seen.clear();for(const f of incoming)seen.add(f.id);return false;}
  const allowed=canPresent()&&!['setup','handover','waiting'].includes(p?.blocked);
  for(const f of incoming)if(!seen.has(f.id)){seen.add(f.id);if(allowed)queued.push(f);}
  if(!allowed){interrupt();return false;}
  pump();return !!active;
 }
 return {update,interrupt,busy:()=>!!active,inspect:()=>({active:active?{id:active.id,kind:active.kind||'move',actorId:active.actorId}:null,pending:queued.length})};
}
