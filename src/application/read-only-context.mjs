// Vista viva: conserva identidad de actores y no permite escribir en estado del motor.
export function readOnlyContext(context){
 const cache=new WeakMap(),mutating=new Set(['push','pop','shift','unshift','splice','sort','reverse','fill','copyWithin']);
 const deny=()=>{throw TypeError('La presentación no puede modificar el estado del motor');};
 const wrap=value=>{
  if(value===null||typeof value!=='object')return value;
  if(cache.has(value))return cache.get(value);
  // Propiedades congeladas requieren un target espejo para no violar invariantes de Proxy.
  const target=Object.isExtensible(value)?value:Array.isArray(value)?Array.from(value):Object.assign(Object.create(Object.getPrototypeOf(value)),value);
  const proxy=new Proxy(target,{
   get(target,key,receiver){
    const result=Reflect.get(target,key,receiver);
    if(typeof result!=='function')return wrap(result);
    if(Array.isArray(target)){
     if(mutating.has(key))return deny;
     // filter/slice producen contenedores nuevos, con actores todavía de solo lectura.
     return (...args)=>Reflect.apply(result,receiver,args);
    }
    return (...args)=>wrap(Reflect.apply(result,target,args));
   },set:deny,deleteProperty:deny,defineProperty:deny,setPrototypeOf:deny,preventExtensions:deny,
   getOwnPropertyDescriptor(target,key){const descriptor=Reflect.getOwnPropertyDescriptor(target,key);if(descriptor&&'value' in descriptor)return {...descriptor,value:wrap(descriptor.value)};return descriptor;},
  });cache.set(value,proxy);return proxy;
 };
 let catalogView,controlsView;
 const controlsFor=value=>controlsView??=Object.freeze({
  get side(){return value.side;},get local(){return value.local;},get interactive(){return value.interactive;},
  group:(...args)=>wrap(value.group(...args)),hand:(...args)=>wrap(value.hand(...args)),dice:(...args)=>wrap(value.dice(...args)),
  display:(...args)=>value.display(...args),
 });
 const queries=new Set(['all','alive','person','ownerGroup','groupLeader','equipmentOf','crossActor','ownerHand','ownerGroupHand','currentHand','actionDice']);
 return new Proxy(context,{get(target,key){const value=Reflect.get(target,key);if(key==='controls')return controlsFor(value);if(key==='catalog'){catalogView??=Object.freeze({get definitions(){return wrap(value.definitions);},resolve:(...args)=>wrap(value.resolve(...args)),label:(...args)=>value.label(...args),legend:(...args)=>wrap(value.legend(...args))});return catalogView;}return typeof value==='function'?(queries.has(key)?(...args)=>wrap(value(...args)):value):wrap(value);},set:deny,defineProperty:deny,deleteProperty:deny});
}
