// Diario público del ciclo; nunca contiene manos, mazos ni cartas aportadas.
export function createMapCycle(context,{generation,clear}){
 let stampGeneration=-1,serial=0,operation=null,journal=[],deathEntries=[],listener=()=>{},busy=false,pendingStep=null;
 const clone=x=>structuredClone(x);
 function sync(){if(stampGeneration!==generation()){stampGeneration=generation();operation=null;journal=[];deathEntries=[];busy=false;pendingStep=null;}}
 const publish=()=>listener();
 function facts(){const g=context().game;if(!g)return null;return {round:g.round,turn:g.turn,food:g.food,morale:g.morale,waste:g.waste,hunger:g.hunger,samples:g.samples,helpless:g.helpless,ended:g.ended,locations:g.zones.map((z,i)=>({index:i,name:z.name,zombies:z.z,barricades:z.b,noise:z.noise})),people:context().all().map(p=>({id:p.id,name:p.name,location:p.loc,dead:!!p.dead,wounds:p.wounds,frost:p.frost}))};}
 function decision(){
  const g=context().game;if(!g)return null;
  if(context().passScreenActive)return {kind:'handover',side:g.turn,label:context().controls.display(g.turn)};
  if(context().deathDirector.active||context().deathDirector.pending.length)return {kind:'death',ready:context().deathDirector.active,entries:clone(deathEntries)};
  if(context().pendingBite)return {kind:'biteChoice',native:true};
  const leader=context().pendingLeader&&(!context().controls.local||context().pendingLeaderSide===context().controls.side);
  if(leader)return {kind:'leaderChoice',side:context().pendingLeaderSide,choices:context().ownerGroup(context().pendingLeaderSide).filter(p=>!p.dead).map(p=>({id:p.id,name:p.name,influence:p.influence}))};
  for(const [kind,value]of [['lootChoice',context().pendingLoot],['healTarget',context().pendingHeal],['attractTarget',context().pendingAttract],['transferTarget',context().pendingTransfer],['crossroads',g.crossPending]])if(value)return {kind,native:true};
  return null;
 }
 function availability(){const g=context().game,d=decision();const reason=!g?'no-game':g.ended?'ended':context().aiRunning||busy?'processing':d?.kind||null;return {allowed:!reason,reason,diceRemaining:!reason?context().controls.dice().length:null};}
 function outcome(){if(!context().game?.ended)return null;const reason=context().gameOutcome(context().game)||(context().game.round>context().game.max?'time':'ended');return {reason,label:{victory:'Victoria: objetivo general completado.',morale:'Derrota: la moral llegó a cero.',survivors:'Derrota: no hay supervivientes disponibles.',time:'Derrota: se agotaron las rondas.',ended:'Partida finalizada.'}[reason]};}
 function cycleSnapshot(){sync();if(!context().game)return null;return {generation:generation(),round:context().game.round,turn:context().game.turn,mode:context().game.mode,processing:busy||context().aiRunning,operation:operation?clone(operation):null,review:!!operation?.review,decision:decision(),finish:availability(),outcome:outcome(),journal:clone(journal)};}
 function cycleExecute(r){
  sync();if(r.kind==='finish'){
   const q=availability();if(!q.allowed||operation?.review)return {ok:false,reason:operation?.review?'review':q.reason};
   const game=context().game,gen=generation();clear();busy=true;operation={id:'cycle_'+gen+'_'+(++serial),requestId:r.requestId,generation:gen,round:game.round,owner:game.turn,mode:game.mode,status:'processing',review:false,colony:false,steps:[],before:facts()};publish();
   const active=operation;
   Promise.resolve(context().finishTurn()).then(()=>{if(context().game!==game||generation()!==gen)return;busy=false;active.status='resolved';active.review=active.colony||game.ended;active.after=facts();publish();},()=>{if(context().game!==game||generation()!==gen)return;busy=false;active.status='unknown';active.error='No se confirmó el cierre. Consultá el estado en V9.9 antes de continuar.';publish();});
   return {ok:true,operationId:active.id};
  }
  const d=decision();
  if(r.kind==='speed'){if(!busy||context().game.mode!=='ai')return {ok:false,reason:'stale'};context().skipAutomation();publish();return {ok:true};}
  if(r.kind==='pass'){if(d?.kind!=='handover'||context().game.ended)return {ok:false,reason:'stale'};context().confirmPass();if(!operation?.review&&!busy)operation=null;publish();return {ok:true};}
  if(r.kind==='death'){if(d?.kind!=='death'||!d.ready)return {ok:false,reason:'stale'};context().deathContinue();publish();return {ok:true};}
  if(r.kind==='leader'){if(d?.kind!=='leaderChoice'||!d.choices.some(p=>p.id===r.target))return {ok:false,reason:'target'};context().chooseLeader(r.target);publish();return {ok:true};}
  if(r.kind==='ack'){if(!operation||operation.id!==r.operationId||busy||operation.status!=='resolved')return {ok:false,reason:'stale'};operation=null;publish();return {ok:true};}
  return {ok:false,reason:'invalid'};
 }
 const api={cycleSnapshot,cycleExecute,subscribeCycle(fn){listener=fn||(()=>{});return ()=>{listener=()=>{};};}};
 function before(kind,meta={}){sync();pendingStep={kind,meta:clone(meta),before:facts(),events:[]};if(operation?.status==='processing')operation.stage=kind;publish();}
 function after(){if(!pendingStep)return;const step={...pendingStep,after:facts()};pendingStep=null;if(operation?.status==='processing')operation.steps.push(step);journal.push({round:step.before.round,...step});if(journal.length>80)journal.shift();publish();}
 function annotate(meta){if(pendingStep)Object.assign(pendingStep.meta,clone(meta));}
 function event(type,data){sync();if(pendingStep)pendingStep.events.push({type,...clone(data)});else{journal.push({kind:type,round:context().game?.round,meta:clone(data)});if(journal.length>80)journal.shift();publish();}}
 return {api,deaths(entries){sync();deathEntries=clone(entries);},facts,before,after,annotate,event,startColony(){sync();if(operation?.status==='processing'){operation.colony=true;operation.stage='colony';}publish();}};
}
