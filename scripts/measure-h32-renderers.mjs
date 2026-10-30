import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {cpus,totalmem,platform,release} from 'node:os';
import {resolve} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.H32_PERF_DIR||'/tmp/h32-performance',base=process.env.H32_ORIGIN||'http://127.0.0.1:8771';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const evidence={conditions:{os:platform()+' '+release(),cpu:cpus()[0].model,logicalCpus:cpus().length,totalSystemMemoryBytes:totalmem(),node:process.version,chromium:browser.version(),headless:true,network:'HTTP localhost, sin compresión ni throttling',gpu:'consultar renderer por muestra; no GPU física garantizada',isolation:'Ensayos de renderizadores secuenciales; sin otros tests de navegador o builds ejecutados por esta tarea durante la medición. Host compartido, carga externa no controlada',physicalMobile:false,heap:'CDP JSHeapUsedSize después de GC forzada; no incluye memoria GPU',navigation:'4 s, una tecla de pan por rAF, dirección alternada cada 30 cuadros; zoom cada 45. Eventos DOM reales de teclado sintéticos, no entrada humana',idle:'3 s sin interacción; instrumentación drawImage/drawArrays/drawElements',samplesPerConfiguration:3},build:JSON.parse(await readFile('dist/hospital-phaser/build.json')),samples:[]};
const waitReady=async page=>{await page.locator('#loading').waitFor({state:'hidden'});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
async function loadRecord(page){return page.evaluate(()=>({readyMs:window.h32Metrics.readyMs,domContentLoadedMs:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,resources:performance.getEntriesByType('resource').filter(x=>x.initiatorType!=='fetch').map(x=>({name:new URL(x.name).pathname,transferSize:x.transferSize,encodedBodySize:x.encodedBodySize,durationMs:x.duration})),navigation:performance.getEntriesByType('navigation').map(x=>({transferSize:x.transferSize,encodedBodySize:x.encodedBodySize})),userAgent:navigator.userAgent}));}
try{
 for(const viewport of [{width:1365,height:768},{width:393,height:852}])for(let trial=0;trial<3;trial++){
  // Orden rotativo para no favorecer siempre al mismo renderer por calentamiento del host.
  const configs=[{name:'Canvas',path:'hospital/'},{name:'Phaser-demand',path:'hospital-phaser/'},{name:'Phaser-continuous',path:'hospital-phaser/?loop=continuous'}];
  for(const config of [...configs.slice(trial),...configs.slice(0,trial)]){
   const context=await browser.newContext({viewport,deviceScaleFactor:viewport.width<500?2:1,isMobile:viewport.width<500,hasTouch:viewport.width<500});
   await context.addInitScript(()=>{
    const m=window.h32Metrics={drawCalls:0,drawSubmissionMs:0,readyMs:null};
    function hook(proto,name){const original=proto[name];proto[name]=function(...args){if(this.canvas?.id!=='scene')return original.apply(this,args);const start=performance.now();m.drawCalls++;try{return original.apply(this,args);}finally{m.drawSubmissionMs+=performance.now()-start;}};}
    hook(CanvasRenderingContext2D.prototype,'drawImage');
    for(const proto of [WebGLRenderingContext.prototype,WebGL2RenderingContext.prototype])for(const name of ['drawArrays','drawElements'])hook(proto,name);
    const observer=new MutationObserver(()=>{if(m.readyMs===null&&document.querySelector('#loading')?.hidden){m.readyMs=performance.now();observer.disconnect();}});observer.observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
   });
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/prototypes/'+config.path);await waitReady(page);const cold=await loadRecord(page);
   await page.reload();await waitReady(page);const warm=await loadRecord(page);
   const cdp=await context.newCDPSession(page);await cdp.send('HeapProfiler.collectGarbage');await cdp.send('Performance.enable');
   const heap=async()=>{const {metrics}=await cdp.send('Performance.getMetrics');return Object.fromEntries(metrics.map(x=>[x.name,x.value])).JSHeapUsedSize;};
   const heapBytes=await heap();
   const idleBefore=await page.evaluate(()=>({...window.h32Metrics,time:performance.now()}));await page.waitForTimeout(3000);const idleAfter=await page.evaluate(()=>({...window.h32Metrics,time:performance.now()}));
   const navigation=await page.evaluate(async()=>{
    const canvas=document.querySelector('#scene'),m=window.h32Metrics,start=performance.now(),before={...m};let last=start,index=0;const intervals=[];
    await new Promise(resolve=>{function step(now){if(now-start>=4000){resolve();return;}if(index)intervals.push(now-last);last=now;
     const key=Math.floor(index/30)%2?'ArrowLeft':'ArrowRight';canvas.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));
     if(index%45===0)canvas.dispatchEvent(new KeyboardEvent('keydown',{key:Math.floor(index/45)%2?'-':'+',bubbles:true,cancelable:true}));index++;requestAnimationFrame(step);}requestAnimationFrame(step);});
    intervals.sort((a,b)=>a-b);return {elapsedMs:performance.now()-start,scheduledFrames:index,p50FrameIntervalMs:intervals[Math.floor(intervals.length*.5)],p95FrameIntervalMs:intervals[Math.floor(intervals.length*.95)],over33ms:intervals.filter(x=>x>33.4).length,drawCalls:m.drawCalls-before.drawCalls,drawSubmissionMs:m.drawSubmissionMs-before.drawSubmissionMs};
   });
   const renderer=config.name==='Canvas'?null:await page.evaluate(async()=>(await import('/dist/hospital-phaser/game.mjs')).inspect().app.renderer);
   evidence.samples.push({configuration:config.name,viewport,dpr:viewport.width<500?2:1,trial:trial+1,cold,warm,idle:{elapsedMs:idleAfter.time-idleBefore.time,drawCalls:idleAfter.drawCalls-idleBefore.drawCalls,drawSubmissionMs:idleAfter.drawSubmissionMs-idleBefore.drawSubmissionMs},navigation,heapBytes,renderer,errors});
   console.log(`${config.name} ${viewport.width} ensayo ${trial+1}: cold ${cold.readyMs.toFixed(0)}ms idle ${idleAfter.drawCalls-idleBefore.drawCalls} draws p95 ${navigation.p95FrameIntervalMs.toFixed(1)}ms`);await context.close();
  }
 }
 evidence.passed=evidence.samples.every(x=>x.errors.length===0&&x.idle.drawCalls===(x.configuration==='Phaser-continuous'?x.idle.drawCalls:0));
}finally{await writeFile(resolve(output,'resultados.json'),JSON.stringify(evidence,null,2)+'\n');await browser.close();}
if(!evidence.passed)throw Error('Errores o dibujos inesperados en reposo; consultar evidencia');
