import assert from 'node:assert/strict';
import {installLifecycleProbe} from './h32-lifecycle-probe.mjs';
export function actionMapChecks({origin='http://127.0.0.1:8778',modulePath='/dist/action-map-qa/map.mjs'}={}){
const integrated=modulePath.includes('horizontal-map');
const api=p=>p.evaluate(()=>window.h344Viewer.inspect()),view=async p=>(await api(p)).view,frames=async p=>{await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.waitForFunction(()=>{const v=window.h344Viewer?.inspect().view||window.capacityView?.inspect(),panel=v?.panel;return !v?.active||!panel||panel.requestedOpen===panel.presentedOpen&&(!v.renderPending||!!v.presentation);});},host=p=>p.frames().find(f=>f.url().endsWith('/reference-host.html'));
const raw=p=>host(p).evaluate(()=>h344Test.snapshot()),rng=p=>host(p).evaluate(()=>window.h344RandomCalls),sleep=(p,n=70)=>p.waitForTimeout(n);
async function instrument(context){
 await context.addInitScript(()=>{if(window.top===window)return;window.h344RandomValue=.8;window.h344RandomCalls=0;Math.random=()=>{window.h344RandomCalls++;return window.h344RandomValue;};});
 const probe=installLifecycleProbe.toString().replaceAll('/dist/hospital-phaser/game.mjs',modulePath).replace('x.target instanceof HTMLCanvasElement','(x.target instanceof HTMLCanvasElement||x.target instanceof MediaQueryList)');await context.addInitScript({content:'('+probe+')();'});
}
async function load(p){await p.goto(origin+modulePath.replace(/\/map\.mjs$/,'/index.html'));await p.evaluate(async path=>window.h344Viewer=await import(path),modulePath);await p.waitForFunction(()=>window.h344Viewer.inspect().projection?.blocked==='setup');}
async function settle(p){
 const f=host(p);for(let i=0;i<30;i++){
  await sleep(p,50);if(integrated){const choices=['#play-bite-sacrifice','#cycle-death','#cycle-pass','[id^=cycle-leader-]','#play-cross-ai','[id^=play-cross-]:not(:disabled)','#play-recruit','#play-ack','#play-heal-cancel','#play-attract-end','#play-transfer-cancel'];let handled=false;for(const selector of choices){const b=p.locator(selector).first();if(await b.isVisible()&&!await b.isDisabled()){await b.click();handled=true;break;}}if(handled)continue;if(!(await api(p)).projection?.blocked)return;continue;}if((await api(p)).search.phase==='choice')return;const phase=(await api(p)).movement.phase;if(phase==='presenting')await p.waitForFunction(()=>window.h344Viewer.inspect().movement.phase!=='presenting');if((await api(p)).movement.phase==='awaiting-decision')await p.locator('#resolve-decision').click();
  if(await f.locator('#passScreen').isVisible()){await f.locator('[data-command="confirmPass"]').click();continue;}
  if(await f.locator('#deathBackdrop').isVisible()){await f.locator('[data-command="deathContinue"]').click();continue;}
  if(await f.locator('#backdrop').isVisible()){
   const choices=f.locator('#modalContent button[data-command]:enabled'),data=await choices.evaluateAll(list=>list.map(b=>({command:b.dataset.command,args:b.dataset.args,text:b.textContent})));
   const index=data.findIndex(x=>['crossChoose','chooseLeader','chooseBite','chooseLoot','dismissRecruit','crossAiContinue','cancelHeal','cancelAttract','cancelTransfer'].includes(x.command));
   if(index>=0){await choices.nth(index).click();continue;}
   const close=f.locator('[data-command="hide"]:visible');if(await close.count()){await close.first().click();continue;}
   throw Error('Diálogo sin resolución de prueba: '+JSON.stringify(data));
  }
  if(!(await api(p)).projection?.blocked)return;
 }throw Error('La preparación/decisión no terminó');
}
async function dispatch(p,name,...args){await host(p).evaluate(({name,args})=>{const result=h344Test.dispatch(name,...args);if(result?.then)window.h344PendingTurn=result;},{name,args});}
async function sync(p){const g=await raw(p),own=await host(p).evaluate(()=>h344Test.searchState());await p.waitForFunction(expected=>{const p=window.h344Viewer.inspect().projection;return p&&!p.blocked&&p.round===expected.round&&p.food===expected.food&&p.turn===expected.turn&&JSON.stringify(p.search.private)===expected.own;},{round:g.round,food:g.food,turn:g.turn,own:JSON.stringify(own)});return g;}
async function correspondence(p){const g=await sync(p),state=(await api(p)).projection;assert.equal(state.morale,g.morale);assert.equal(state.food,g.food);assert.equal(state.round,g.round);const chars=[...g.humans,...g.bots].filter(c=>!c.dead);assert.equal(state.characters.length,chars.length);for(const c of state.characters){const real=chars.find(x=>x.id===c.id);assert.ok(real);assert.equal(c.name,real.name);assert.equal(c.locationId,'place-'+real.loc);assert.equal(c.wounds,real.wounds);assert.equal(c.frost,real.frost);}for(const l of state.locations){assert.equal(l.zombies,g.zones[l.engineIndex].z);assert.equal(l.barricades,g.zones[l.engineIndex].b);}assert.equal(state.dice.ownerId,g.turn);assert.deepEqual(state.dice.available,g.turn==='ai'?g.botDice:g.dice);for(const key of ['items','botItems','decks','crossCard','crossRemaining','contributions'])assert.ok(!JSON.stringify(state).includes('"'+key+'"'));return {game:g,projection:state};}
async function begin(p,mode='local'){
 await load(p);if(integrated){await p.locator('#play-start-'+mode).click();await settle(p);await p.locator('#menu-toggle').click();await p.locator('#menu-groups').click();await p.locator('#play-leader-h1').click();await settle(p);await correspondence(p);return;}const f=host(p);await f.locator('#setupScreen button').filter({hasText:mode==='local'?'2 JUGADORES LOCALES':'1 JUGADOR + IA'}).click();await settle(p);
 // Elección inicial desde el menú real, sin confirmarla desde el mapa.
 await f.locator('#floatingActions').click();await f.locator(`[data-command="menuGo"][data-args='["group"]']`).click();await f.locator(`[data-command="chooseLeader"][data-args='["h1"]']`).click();await settle(p);await correspondence(p);
}
async function reference(p){if(await p.locator('#reference-mode').isVisible())await p.locator('#reference-mode').click();else{if(!await p.locator('#floating-menu').isVisible())await p.locator('#menu-toggle').click();await p.locator('#return-reference').click();}}
async function openMap(p){if(!integrated)await p.locator('#map-mode').click();await p.waitForFunction(()=>window.h344Viewer.inspect().view!==null);await frames(p);assert.equal((await api(p)).mode,'map');}
async function panel(p){await frames(p);if(!await p.locator('#panel-content').isVisible())await p.locator('#panel-toggle').click();await frames(p);await p.locator('#panel-content').waitFor({state:'visible'});}
async function ambient(p){await panel(p);await p.locator('#atmosphere-controls').evaluate(el=>el.open=true);}
async function pick(p,point,touch=false){const a=await view(p),b=await p.locator('#scene').boundingBox(),x=b.x+a.camera.x+point.x*a.camera.zoom,y=b.y+a.camera.y+point.y*a.camera.zoom;assert.ok(x>b.x&&x<b.x+b.width&&y>b.y&&y<b.y+b.height);if(touch)await p.touchscreen.tap(x,y);else await p.mouse.click(x,y);await frames(p);}
 return {api,view,frames,host,raw,rng,sleep,instrument,load,settle,dispatch,sync,correspondence,begin,openMap,reference,panel,ambient,pick};
}
