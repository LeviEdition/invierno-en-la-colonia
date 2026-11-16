export function installLifecycleProbe(){
 window.h32OriginalBlur=()=>{};window.onblur=window.h32OriginalBlur;window.h32OriginalFocus=()=>{};window.onfocus=window.h32OriginalFocus;
 const listeners=[],observers=[],glObjects=new Map();const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
 EventTarget.prototype.addEventListener=function(type,fn,options){const capture=typeof options==='boolean'?options:!!options?.capture;if(!options?.once&&!listeners.some(x=>x.target===this&&x.type===type&&x.fn===fn&&x.capture===capture&&!x.removed&&!x.signal?.aborted))listeners.push({target:this,type,fn,capture,signal:options?.signal,owned:new Error().stack.includes('/dist/hospital-phaser/game.mjs'),removed:false});return add.call(this,type,fn,options);};
 EventTarget.prototype.removeEventListener=function(type,fn,options){const capture=typeof options==='boolean'?options:!!options?.capture;for(const item of listeners)if(item.target===this&&item.type===type&&item.fn===fn&&item.capture===capture)item.removed=true;return remove.call(this,type,fn,options);};
 const OriginalObserver=ResizeObserver;window.ResizeObserver=class extends OriginalObserver{constructor(callback){super(callback);this.targets=new Set();observers.push(this);}observe(target,options){this.targets.add(target);super.observe(target,options);}unobserve(target){this.targets.delete(target);super.unobserve(target);}disconnect(){this.targets.clear();super.disconnect();}};
 for(const proto of [WebGLRenderingContext.prototype,WebGL2RenderingContext.prototype])for(const kind of ['Texture','Buffer','Framebuffer','Renderbuffer','Program','Shader']){
  const create=proto['create'+kind],destroy=proto['delete'+kind];proto['create'+kind]=function(...args){const obj=create.apply(this,args);if(obj)glObjects.set(obj,{kind,canvas:this.canvas,context:this,stack:new Error().stack});return obj;};proto['delete'+kind]=function(obj){glObjects.delete(obj);return destroy.call(this,obj);};
 }
 window.h32TextureStacks=()=>[...glObjects.values()].filter(x=>x.kind==='Texture'&&x.canvas.id==='scene').map(x=>x.stack);
 window.h32Lifecycle=()=>({listeners:listeners.filter(x=>x.owned&&!x.removed&&!x.signal?.aborted&&(x.target===window||x.target===document||x.target instanceof HTMLCanvasElement)).map(x=>({target:x.target===window?'window':x.target===document?'document':x.target.id||'canvas',type:x.type})).sort((a,b)=>(a.target+a.type).localeCompare(b.target+b.type)),resizeTargets:observers.reduce((n,o)=>n+o.targets.size,0),gl:Object.fromEntries(['Texture','Buffer','Framebuffer','Renderbuffer','Program','Shader'].map(kind=>[kind,[...glObjects.entries()].filter(([obj,x])=>x.kind===kind&&x.canvas.id==='scene'&&!x.context.isContextLost()&&x.context['is'+kind](obj)).length]))});
 const contexts=new Set(),getContext=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(type,...args){const value=getContext.call(this,type,...args);if(value&&String(type).includes('webgl'))contexts.add(value);return value;};
 const timers=new Map(),set=window.setTimeout.bind(window),clear=window.clearTimeout.bind(window);
 window.setTimeout=function(callback,delay,...args){
  const tracked=delay>10000&&delay<=15000&&new Error().stack.includes('/dist/hospital-phaser/game.mjs');
  if(!tracked)return set(callback,delay,...args);
  let id;id=set((...values)=>{timers.delete(id);callback(...values);},delay,...args);timers.set(id,delay);return id;
 };
 window.clearTimeout=function(id){timers.delete(id);return clear(id);};
 window.h32StartupProbe=()=>({...window.h32Lifecycle(),startupTimers:timers.size,activeSceneContexts:[...contexts].filter(gl=>gl.canvas.id==='scene'&&!gl.isContextLost()).length});
}
