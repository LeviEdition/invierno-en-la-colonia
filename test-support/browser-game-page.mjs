// Solo para HTML de escenarios QA: las funciones no dependen de globals del producto.
export function gamePage(page){return {
 evaluate(fn,argument){return page.evaluate(({source,argument})=>window.__test.run(source,argument),{source:fn.toString(),argument});},
 waitForFunction(fn,argument,options){return page.waitForFunction(({source,argument})=>window.__test.run(source,argument),{source:fn.toString(),argument},options);},
};}
export function commandLocator(page,name,args=[]){return page.locator('[data-command='+JSON.stringify(name)+'][data-args='+JSON.stringify(JSON.stringify(args))+']');}
// Traducción de selectores históricos de los recorridos: no interpreta ni ejecuta handlers.
export function legacySelector(selector){
 return selector.replace(/\[onclick(?:\*)?="([^"]*)"\]/g,(_match,handler)=>{
  const call=handler.match(/^(\w+)\((.*)\)$/);if(!call)throw Error('Selector histórico sin adaptación: '+handler);
  const args=call[2]?call[2].split(',').map(arg=>arg.startsWith("'")?arg.slice(1,-1):Number(arg)):[];
  return '[data-command='+JSON.stringify(call[1])+'][data-args='+JSON.stringify(JSON.stringify(args))+']';
 });
}
export function scenarioPage(page){
 const access=gamePage(page);
 return new Proxy(page,{get(target,key){
  if(key==='evaluate'||key==='waitForFunction')return access[key];
  if(key==='locator')return (selector,...options)=>page.locator(legacySelector(selector),...options);
  const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;
 }});
}
