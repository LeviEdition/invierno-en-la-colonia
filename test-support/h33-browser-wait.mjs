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
