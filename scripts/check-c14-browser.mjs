import {mkdir,writeFile} from 'node:fs/promises';
import {controllerSource} from '../test-support/autoplay-controller.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.C14_BROWSER_OUTPUT||'/tmp/c14-browser';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const url=process.env.GAME_URL||'http://127.0.0.1:8765/invierno_colonia_v9_9.html';
// Selección representativa declarada: victoria y derrota observadas en el lote, por modo.
const defaultCases=[{mode:'ai',seed:2654435761},{mode:'ai',seed:1401181143},{mode:'local',seed:2654435761},{mode:'local',seed:3816266512},{mode:'local',seed:3189639203}];
const cases=process.env.C14_BROWSER_CASES?JSON.parse(process.env.C14_BROWSER_CASES):defaultCases;
const records=[];
try{
 for(const c of cases){
  const viewport=c.mode==='ai'?{width:1365,height:768}:{width:393,height:852};
  const context=await browser.newContext({viewport,isMobile:c.mode==='local',hasTouch:c.mode==='local',reducedMotion:'reduce'});
  await context.addInitScript(seed=>{window.testRandomState=seed;Math.random=()=>{window.testRandomState=(Math.imul(1664525,window.testRandomState)+1013904223)>>>0;return window.testRandomState/4294967296;};},c.seed);
  const page=await context.newPage();const r={...c,viewport,category:'partida completa, motor/DOM reales, acciones y decisiones mediante botones',trace:[],harnessRetries:[],errors:[],invariants:[],completed:false};records.push(r);
  page.on('pageerror',e=>r.errors.push(e.message));await page.goto(url);await page.evaluate(seed=>window.testRandomState=seed,c.seed);
  await page.locator('[onclick="startGame(\''+c.mode+'\')"]').click();await page.evaluate(source=>(0,eval)(source),controllerSource);r.strategy=await page.evaluate(()=>testController.strategy);r.initial=await page.evaluate(()=>({objective:game.objective,food:game.food,morale:game.morale,goal:game.goal,max:game.max}));
  async function clickAction(name,args=[]){
   if(name==='deathContinue'){await page.locator('.deathContinue').click();return;}
   const arg=args.map(a=>typeof a==='string'?"'"+a+"'":String(a)).join(',');
   await page.locator('[onclick="'+name+'('+arg+')"]').first().click();
  }
  async function closeInfo(){
   const opened=await page.evaluate(()=>opened);
   if(opened&&await page.locator('#backdrop').evaluate(el=>el.classList.contains('open')))await page.locator('.modalHeader [onclick="hide()"] ').click();
  }
  async function view(type){
   if(await page.evaluate(t=>opened===t&&document.getElementById('backdrop').classList.contains('open'),type))return;
   await closeInfo();await page.locator('#floatingActions').click();await clickAction('menuGo',[type]);
  }
  try{
   for(let step=0;step<3000;step++){
    const status=await page.evaluate(()=>{
     const violations=testController.invariant(),command=testController.decision(true);
     return {violations,command,decision:testController.plannedDecision,ended:game.ended,aiRunning};
    });
    if(status.violations.length){r.invariants.push(...status.violations);break;}
    if(status.decision){await clickAction(status.decision.name,status.decision.args);r.trace.push({step,command:status.command,ui:true});continue;}
    if(status.ended&&!status.aiRunning){r.completed=true;break;}
    if(status.aiRunning){
     if(await page.locator('#skipAI').isVisible()&&!await page.evaluate(()=>skipAI||document.getElementById('backdrop').classList.contains('open'))){
      try{await page.locator('#skipAI').click({timeout:300});}
      catch(error){
       const now=await page.evaluate(()=>({kind:decisionKind(),ended:game.ended,aiRunning}));
       if(now.kind||now.ended||!now.aiRunning)r.harnessRetries.push({step,reason:'el estado cambió antes del clic de animación',now});else throw error;
      }
     }
     await page.waitForTimeout(20);continue;
    }
    const next=await page.evaluate(()=>{
     const old={selected,target,picked,selection:{...selectionBySide}};
     const command=testController.normal(true),plan=testController.planned;
     selected=old.selected;target=old.target;picked=old.picked;Object.assign(selectionBySide,old.selection);
     return {command,plan};
    });
    if(!next.command){await page.waitForTimeout(20);continue;}
    if(next.command==='terminar-turno'){
     await closeInfo();await page.locator('#floatingActions').click();await page.locator('#fabEndTurn').click();
    }else{
     const p=next.plan;
     if(await page.evaluate(()=>selected)!==p.selected){await closeInfo();await page.locator('.surv[onclick*="select('+p.selected+')"]').click();await closeInfo();}
     const wantsActions=!['playItem','contribute'].includes(p.name);
     if(wantsActions||await page.evaluate(()=>target)!==p.target||await page.evaluate(()=>picked)!==p.picked){
      await view('actions');
      if(await page.evaluate(()=>target)!==p.target)await page.locator('#dest').selectOption(String(p.target));
      if(await page.evaluate(()=>picked)!==p.picked)await page.locator('#modalContent .die').nth(p.picked).click();
     }
     await view(wantsActions?'actions':'inventory');await clickAction(p.name,p.args);
    }
    r.trace.push({step,command:next.command,ui:true,...await page.evaluate(()=>({round:game.round,morale:game.morale,food:game.food,samples:game.samples}))});
   }
  }catch(error){r.errors.push(error.stack||String(error));}
  r.final=await page.evaluate(()=>({round:game.round,result:gameOutcome(game)||(game.round>game.max?'time':null),food:game.food,morale:game.morale,samples:game.samples,goal:game.goal,ended:game.ended,pending:{bite:!!pendingBite,loot:!!pendingLoot,cross:game.crossPending,leaders:pendingLeaderSides,death:deathDirector.active||!!deathDirector.pending.length},opened}));
  r.events=await page.evaluate(()=>gameAudit);
  if(!r.completed)r.interruption='No contar como partida completa: revisar errores, invariantes o límite de pasos';
  await page.screenshot({path:out+'/'+c.mode+'-'+c.seed+'.png'});await context.close();
  console.log(JSON.stringify({mode:r.mode,seed:r.seed,completed:r.completed,final:r.final,errors:r.errors,invariants:r.invariants}));
 }
}finally{await browser.close();await writeFile(out+'/partidas.json',JSON.stringify(records,null,2)+'\n');}
if(records.some(r=>!r.completed||r.errors.length||r.invariants.length))process.exitCode=1;
