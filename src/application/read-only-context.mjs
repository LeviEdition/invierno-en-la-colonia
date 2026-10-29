// Vista viva: conserva identidad de actores y no permite escribir en estado del motor.
export function readOnlyContext(context){
 const cache=new WeakMap(),mutating=new Set(['push','pop','shift','unshift','splice','sort','reverse','fill','copyWithin']);
 const deny=()=>{throw TypeError('La presentación no puede modificar el estado del motor');};
 const wrap=value=>{
  if(value===null||typeof value!=='object')return value;
  if(cache.has(value))return cache.get(value);
  const proxy=new Proxy(value,{
   get(target,key,receiver){
    const result=Reflect.get(target,key,receiver);
    if(typeof result!=='function')return wrap(result);
    if(Array.isArray(target)){
     if(mutating.has(key))return deny;
     // filter/slice producen contenedores nuevos, con actores todavía de solo lectura.
     return (...args)=>Reflect.apply(result,receiver,args);
    }
    return (...args)=>wrap(Reflect.apply(result,target,args));
   },set:deny,deleteProperty:deny,defineProperty:deny,
  });cache.set(value,proxy);return proxy;
 };
 const queries=new Set(['all','alive','person','ownerGroup','groupLeader','equipmentOf','crossActor','ownerHand','ownerGroupHand','currentHand','actionDice']);
 return new Proxy(context,{get(target,key){const value=Reflect.get(target,key);return typeof value==='function'?(queries.has(key)?(...args)=>wrap(value(...args)):value):wrap(value);},set:deny,defineProperty:deny,deleteProperty:deny});
}
