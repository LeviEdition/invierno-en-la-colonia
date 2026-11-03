// Playwright1.57 no reintenta un predicado que devuelve Promise<false>:
// toma la promesa como truthy y resuelve el handle a false. Mantener el polling
// síncrono; importar el módulo una sola vez fuera del predicado.
export async function waitForWorkshopMount(page,modulePath,expectedStarts){
 const module=await page.evaluateHandle(async path=>await import(path),modulePath);
 try{
  await page.waitForFunction(({module,expectedStarts})=>{
   const snapshot=module.inspect();
   if(snapshot.state==='error'&&(expectedStarts===undefined||snapshot.starts>=expectedStarts))throw Error('Taller: '+snapshot.lastError?.message);
   return snapshot.state==='ready'&&snapshot.app!==null&&(expectedStarts===undefined||snapshot.starts===expectedStarts);
  },{module,expectedStarts});
 }finally{await module.dispose();}
}

// Mantiene las comparaciones estáticas previas. El gate de ambientación prueba
// aparte los valores iniciales y la interacción real con estos controles.
export async function freezeAtmosphere(page){
 await page.evaluate(()=>{const button=document.getElementById('ambient-enabled');if(button?.getAttribute('aria-pressed')==='true')button.click();});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
