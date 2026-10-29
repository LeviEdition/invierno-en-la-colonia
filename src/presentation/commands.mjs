const installed=new WeakSet();
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#39;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function commandAttributes(name,args=[],{event='click',stop=false}={}){
 const suffix=event==='enter'?'-enter':event==='leave'?'-leave':'';
 return 'data-command'+suffix+'="'+escape(name)+'" data-args'+suffix+'="'+escape(JSON.stringify(args))+'"'+(event==='change'?' data-event="change"':'')+(stop?' data-stop="true"':'');
}
export function bindCommands(root,commands){
 if(!commands||Object.values(commands).some(fn=>typeof fn!=='function'))throw TypeError('Se requieren comandos explícitos');
 if(installed.has(root))throw Error('Los comandos ya están conectados');
 const listeners=[];
 for(const type of ['click','change','mouseenter','mouseleave']){
  const suffix=type==='mouseenter'?'-enter':type==='mouseleave'?'-leave':'';
  const listener=event=>{
   const element=event.target?.closest?.('[data-command'+suffix+']');
   if(!element||element.disabled||root.contains&&!root.contains(element))return;
   if(suffix&&element!==event.target)return;
   if(!suffix&&(element.dataset.event||'click')!==type)return;
   const name=element.getAttribute('data-command'+suffix);
   if(!Object.hasOwn(commands,name)||typeof commands[name]!=='function')return;
   let args;try{args=JSON.parse((suffix?element.getAttribute('data-args'+suffix):element.dataset.args)||'[]');}catch{return;}
   if(!Array.isArray(args))return;
   if(element.dataset.stop==='true')event.stopPropagation();
   commands[name](...args,{element,event});
  };
  root.addEventListener(type,listener,true);listeners.push([type,listener]);
 }
 installed.add(root);let disposed=false;
 return ()=>{if(disposed)return;disposed=true;for(const [type,listener] of listeners)root.removeEventListener(type,listener,true);installed.delete(root);};
}
