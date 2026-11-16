// Detecta dependencias de la pantalla anterior, incluida interacción indirecta.
const probes=new WeakMap();
export async function installNoV9Guard(context){
 const attempts=[];probes.set(context,attempts);context.on('page',page=>{const check=frame=>{const url=frame.url();if(/invierno_colonia_v9_9\.html|\/(?:prototypes|dist)\/(?:action-map|search-map|movement-map|state-map)(?:-qa)?\//.test(url))attempts.push(url.split('?')[0]);};page.on('framenavigated',check);check(page.mainFrame());});
 await context.addInitScript(()=>{
  globalThis.v9Attempts=[];globalThis.v9Clicks=0;
  if(window.top!==window){document.addEventListener('click',e=>{if(e.target.closest?.('[data-command]'))v9Clicks++;},true);return;}
  const inspect=()=>{if(document.body?.dataset.presentation==='reference')v9Attempts.push('presentation-reference');const frame=document.getElementById('reference-frame');if(frame&&!frame.hidden)v9Attempts.push('reference-frame-visible');};
  new MutationObserver(inspect).observe(document,{subtree:true,attributes:true,childList:true});
  document.addEventListener('click',e=>{if(e.target.closest?.('#reference-mode,#return-reference'))v9Attempts.push('reference-control');},true);
 });
}
export async function assertNoV9(page,assert){assert.deepEqual(probes.get(page.context()),[],'Se navegó o abrió otra ventana hacia V9');assert.deepEqual(await page.evaluate(()=>v9Attempts),[],'Se intentó abrir V9');const host=page.frames().find(f=>f.url().endsWith('/reference-host.html'));assert.equal(await host.evaluate(()=>v9Clicks),0,'Se usó un control de la pantalla V9');assert.equal(await host.locator('#setupScreen,#board,#floatingActions').count(),0,'El host montó la pantalla V9');assert.equal(await page.locator('#reference-frame').isVisible(),false);}
