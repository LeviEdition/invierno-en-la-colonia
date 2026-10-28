// Comprobación dirigida opcional; requiere Playwright y Chromium externos a npm test.
// Servir el repositorio: python -m http.server 8765 --bind 127.0.0.1
// PLAYWRIGHT_MODULE=/ruta/a/playwright-core/index.mjs node scripts/check-issue7-browser.mjs
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const url=process.env.ISSUE7_URL||'http://127.0.0.1:8765/invierno_colonia_v9_9.html';
const cases=[
 {id:'R1',title:'La radio encendida',when:'search',food:1,morale:8,pick:0},
 {id:'R2',title:'La radio encendida',when:'search',food:8,morale:2,pick:1},
 {id:'R3',title:'La radio encendida',when:'search',food:0,morale:2,pick:1},
 {id:'M1',title:'Un mensaje en la pared',when:'search',food:8,morale:8,pick:0},
 {id:'M2',title:'Un mensaje en la pared',when:'search',food:8,morale:1,pick:1},
 {id:'S1',title:'La señal del mando',when:'round',food:3,morale:5,pick:1},
];
const results=[],errors=[];
try{
 for(const viewport of [{width:1365,height:768},{width:393,height:852}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  async function start(mode='ai'){
   await page.goto(url);
   await page.locator('[onclick="startGame(\''+mode+'\')"]').click();
  }
  for(const c of cases){
   await start();
   const before=await page.evaluate(c=>{
    hide();deathDirector.reset();game.crossCard=crossroadsDeck.findIndex(x=>x.title===c.title);
    game.crossOwner='ai';game.turn='ai';game.crossPending=false;game.crossResolved=false;
    game.crossActorId=null;aiCrossChoice=null;
    game.zones.forEach(z=>{z.z=0;z.b=0;z.noise=0;});game.food=c.food;game.morale=c.morale;
    game.bots[0].loc=c.when==='round'?0:1;
    if(c.id.startsWith('M')){game.samples=4;game.goal=5;}
    if(c.id==='M2'){game.humans[1].loc=2;game.zones[2].z=zcap[2];}
    if(c.id==='S1')game.zones[0].z=zcap[0];
    const before=JSON.stringify(game);crossTrigger(c.when,c.when==='round'?null:game.bots[0]);
    window.issue7Continued=false;waitForAiCross().then(()=>window.issue7Continued=true);
    return before;
   },c);
   assert.equal(await page.evaluate(()=>aiCrossChoice),c.pick,c.id);
   assert.equal(await page.locator('.aiSelected').count(),1);
   const label=await page.evaluate(()=>crossroadsDeck[game.crossCard].choices[aiCrossChoice][0]);
   assert.ok((await page.locator('.aiSelected').innerText()).includes(label));
   const unchanged=await page.evaluate(before=>{
    const a=JSON.parse(before),b=JSON.parse(JSON.stringify(game));
    for(const key of ['log','last','crossPending','crossActorId']){delete a[key];delete b[key];}
    return JSON.stringify(a)===JSON.stringify(b)&&!game.crossResolved&&!window.issue7Continued;
   },before);
   assert.equal(unchanged,true,'evaluación aislada '+c.id);
   await page.getByRole('button',{name:'Continuar turno de la IA',exact:true}).click();
   const state=await page.evaluate(()=>({food:game.food,morale:game.morale,samples:game.samples,ended:game.ended,dead:game.humans[1].dead,pending:game.crossPending,resolved:game.crossResolved,continued:window.issue7Continued}));
   assert.equal(state.pending,false);assert.equal(state.resolved,true);assert.equal(state.continued,true);
   if(c.id==='R1')assert.equal(state.food,3);
   if(c.id==='R2'||c.id==='R3')assert.equal(state.morale,3);
   if(c.id==='M1'){assert.equal(state.ended,true);assert.equal(state.samples,5);}
   if(c.id==='M2'){assert.equal(state.ended,false);assert.equal(state.dead,false);assert.equal(state.morale,1);}
   if(c.id==='S1')assert.equal(state.food,5);
   results.push({viewport,id:c.id,label,state});
  }
  // J1 y J2 siguen eligiendo mediante botones reales, incluido pase de dispositivo.
  for(const side of ['human','ai']){
   await start('local');
   if(side==='ai'){
    await page.evaluate(async()=>{hide();game.crossPending=false;game.crossResolved=true;await finishTurn();});
    assert.equal(await page.locator('#passScreen').isVisible(),true);
    await page.getByRole('button',{name:'COMENZAR TURNO',exact:false}).click();
   }
   await page.evaluate(side=>{
    hide();game.crossPending=false;game.crossResolved=false;game.crossOwner=side;game.turn=side;
    game.crossCard=crossroadsDeck.findIndex(c=>c.title==='Fiebre en el refugio');
    game.items=[];game.botItems=[];aiCrossChoice=null;crossTrigger('round',null);
   },side);
   assert.equal(await page.evaluate(()=>aiCrossChoice),null);
   assert.equal(await page.locator('button.crossChoice').count(),2);
   assert.equal(await page.locator('button.crossChoice').nth(0).isDisabled(),true);
   const morale=await page.evaluate(()=>game.morale);
   await page.locator('button.crossChoice').nth(1).click();
   assert.equal(await page.evaluate(()=>game.morale),morale-1);
   assert.equal(await page.evaluate(()=>game.crossResolved&&!game.crossPending),true);
   results.push({viewport,id:'local-'+side,manual:true});
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'desbordamiento de página');
  await context.close();
 }
 assert.deepEqual(errors,[],'excepciones JS');
 console.log(JSON.stringify({checks:results.length,errors,results},null,2));
}finally{await browser.close();}
