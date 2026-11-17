// Políticas del jugador. Solo eligen entradas del motor; no aplican reglas.
// Cada política ofrece decidir(c) para las decisiones pendientes (muerte, mordedura,
// sucesión, encrucijada, botín, tratamiento…) y actuar(c,registro) para el turno.
// actuar devuelve una etiqueta por comando ejecutado o 'terminar-turno'.
//
// - cooperativa: puerto literal del testController de test-support/autoplay-controller.mjs
//   (C14). Sirve para calibrar el arnés contra runGame y se conserva como política.
// - ia-referencia: la IA de src/agents/reference-agent.mjs trasladada al bando del
//   jugador: mismo orden (habilidades, equipo, mano, movimientos, dados, herramientas)
//   y mismas puntuaciones de botín y mordedura que usa la IA en el motor.
// - abastecer y objetivo: variantes simples de ia-referencia que solo cambian destinos,
//   prioridad de dados, puntuación de botín y umbral de comida.

const foco=(c,p)=>{c.selected=c.controls.group().indexOf(p);c.selectionBySide[c.controls.side]=c.selected;c.target=p.loc;};
const persona=(c,id)=>c.all().find(p=>p.id===id);

// Decisiones comunes: las únicas diferencias entre políticas son el botín y la mordedura.
function decidirComun(c,{botin,mordedura,paciente=pacientePrimero}){
 const g=c.game;
 if(c.deathDirector.active){c.deathDirector.continue();return 'confirmar-muerte';}
 if(c.pendingBite&&!g.ended){const opcion=mordedura(c);c.chooseBite(opcion);return opcion==='risk'?'arriesgar-mordedura':'sacrificar-mordedura';}
 if(c.deathDirector.pending.length)return null;
 if(g.ended&&c.pendingRecruitInfo){c.dismissRecruit();return 'confirmar-rescate-final';}
 if(g.ended)return null;
 if(c.passScreenActive){c.confirmPass();return 'confirmar-pase';}
 if(c.leaderChoiceReady()){
  const p=c.ownerGroup(c.pendingLeaderSide).filter(p=>!p.dead).sort((a,b)=>b.influence-a.influence)[0];
  if(!p)throw Error('sucesión sin candidato');c.chooseLeader(p.id);return 'sucesor:'+p.id;
 }
 const tipo=c.decisionKind();
 if(tipo==='crossroads'){
  if(g.mode==='ai'&&g.crossOwner==='ai'){c.crossAiContinue();return 'resolver-encrucijada';}
  c.crossChoose(c.chooseCrossOption(c.crossroadsDeck[g.crossCard],g.crossOwner));return 'resolver-encrucijada';
 }
 if(tipo==='lootChoice'){
  const indice=c.pendingLoot.items.map((it,i)=>({i,s:botin(c,it,c.pendingLoot)})).sort((a,b)=>b.s-a.s||a.i-b.i)[0].i;
  c.chooseLoot(indice);return 'elegir-botín:'+indice;
 }
 if(tipo==='healTarget'){c.chooseHeal(paciente(c));return 'elegir-paciente';}
 if(tipo==='attractTarget'){
  const i=g.zones.findIndex((z,i)=>i!==c.pendingAttract.loc&&z.z);if(i<0)c.cancelAttract();else c.chooseAttract(i);return 'resolver-atracción';
 }
 if(tipo==='transferTarget'){
  const p=persona(c,c.pendingTransfer.fromId),it=p?.equipment[c.pendingTransfer.itemIndex];
  const id=c.pendingTransfer.targets.find(id=>c.canReceiveTransfer(p,persona(c,id),it));
  if(id)c.chooseTransfer(id);else c.cancelTransfer();return 'resolver-transferencia';
 }
 if(c.pendingRecruitInfo){c.dismissRecruit();return 'confirmar-rescate';}
 return null;
}
// Paciente: el testController toma el primero; la IA, el más herido (botTurn).
const pacientePrimero=c=>c.pendingHeal.targets[0];
const pacienteMasHerido=c=>c.pendingHeal.targets.map(id=>persona(c,id)).sort((a,b)=>b.wounds-a.wounds)[0].id;
// Botín del testController (C14).
const botinCooperativa=(c,it)=>{const d=c.catalog.resolve(it),g=c.game;return d.effect==='research'||d.effect==='sample'?20:d.kind===g.crisis.type&&g.crisis.given<g.crisis.need?15:d.kind==='comida'?12:d.kind==='medicina'?8:d.kind==='superviviente'?7:d.effect==='equip'?6:3;};
// Botín de la IA de referencia (beginSearch, bando IA): muestra que gana, herramienta
// que completa la crisis, muestra, superviviente, comida escasa…
function botinReferencia(c,it,pendiente){
 const g=c.game,p=persona(c,pendiente.actorId),k=c.kind(it);
 const faltan=g.crisis?.type==='herramienta'?g.crisis.need-g.crisis.contributions.filter(t=>t==='herramienta').length:0;
 const tiene=c.currentHand().filter(x=>c.kind(x)==='herramienta').length+c.controls.group().filter(x=>!x.dead).reduce((n,x)=>n+c.equipmentOf(x).filter(y=>c.kind(y)==='herramienta').length,0);
 const completa=faltan>0&&tiene+1===faltan;
 const gana=k==='muestra'&&g.samples+(p?.skill==='researcher'&&!p.bonusUsed?2:1)>=g.goal;
 return gana?12:k==='herramienta'&&completa?11:({muestra:10,superviviente:c.accessible(0)?9:0,comida:g.food<4?8:4,medicina:4,arma:3,herramienta:3,combustible:2,educacion:5}[k]||0);
}
function botinAbastecer(c,it){const d=c.catalog.resolve(it),g=c.game,k=d.kind,necesidad=c.feedingNeed(g);return k==='comida'?(g.food<necesidad+3?12:8):k===g.crisis.type&&g.crisis.given<g.crisis.need?11:k==='superviviente'?(c.accessible(0)?9:0):k==='medicina'?7:k==='muestra'?6:d.effect==='equip'?5:k==='combustible'?3:2;}
function botinObjetivo(c,it){const d=c.catalog.resolve(it),g=c.game,k=d.kind;return k==='muestra'?12:d.id==='notes'?11:k===g.crisis.type&&g.crisis.given<g.crisis.need?7:k==='comida'?(g.food<c.feedingNeed(g)?9:6):k==='superviviente'?5:k==='medicina'?4:d.effect==='equip'?3:2;}
// Mordedura: el testController siempre arriesga; la IA sacrifica cuando la siguiente
// víctima posible vale mucho más (biteNext, bando IA).
const mordeduraRiesgo=()=>'risk';
function mordeduraReferencia(c){
 const t=persona(c,c.pendingBite.target),restantes=c.pendingBite.victims.map(id=>persona(c,id)).filter(Boolean);
 const valiosa=restantes.some(x=>x.influence>=t.influence+5);
 return restantes.length===0||!valiosa?'risk':'sacrifice';
}

// ---------- cooperativa (puerto literal de autoplay-controller.mjs) ----------
function actuarCooperativa(c,registro,{indefensos=false,repartida=false}={}){
 const g=c.game;
 if(!c.playable())return null;
 const group=c.controls.group().filter(p=>!p.dead),hand=c.currentHand();
 if(!group.length)throw Error('sin superviviente y partida activa');
 const use=(p,i)=>{foco(c,p);const id=c.catalog.resolve(hand[i]).id;registro.accionActual='usar';c.playItem(i);return 'usar:'+p.id+':'+id;};
 let i=hand.findIndex(it=>['sample','research'].includes(c.catalog.resolve(it)?.effect));if(i>=0)return use(group[0],i);
 i=hand.findIndex(it=>c.kind(it)===g.crisis.type&&g.crisis.given<g.crisis.need);
 if(i>=0){c.contribute(i);return 'aportar-crisis:'+i;}
 for(const p of group){
  const hurt=group.some(t=>t.loc===p.loc&&(p.skill==='medic'?t.wounds:t.frost));
  if(!p.skillUsed&&(['medic','nurse'].includes(p.skill)&&hurt||p.skill==='builder'&&c.openAccess(p.loc))){foco(c,p);c.special();return 'habilidad:'+p.id;}
 }
 for(let k=0;k<hand.length;k++){
  const d=c.catalog.resolve(hand[k]);
  if(['heal','frost'].includes(d.effect)){const p=group.find(p=>d.effect==='frost'?p.frost:p.wounds+p.frost);if(p)return use(p,k);}
  if(d.effect==='food'&&g.food<c.feedingNeed(g)+3)return use(group[0],k);
  if(d.effect==='equip'){const p=group.find(p=>!c.equipmentOf(p).some(it=>c.kind(it)===d.kind));if(p)return use(p,k);}
  if(d.effect==='manual'&&g.waste>=2)return use(group[0],k);
 }
 const defender=group.slice().sort((a,b)=>c.effectiveAttack(a)-c.effectiveAttack(b)||a.id.localeCompare(b.id))[0];
 for(const p of group){
  if(p===defender||p.moved||p.loc!==0&&g.decks[p.loc]?.length)continue;
  // repartida (diagnóstico de docs/110): el mismo destino que «objetivo-repartido».
  const dest=repartida?((d=>d!==0&&d!==p.loc?d:undefined)(destinoRepartido(c,p))):[6,2,1,4,5,3].find(l=>l!==p.loc&&c.accessible(l)&&g.decks[l]?.length);
  if(dest!==undefined){foco(c,p);c.target=dest;const fuel=hand.findIndex(it=>c.kind(it)==='combustible');if(fuel>=0){registro.accionActual='mover-combustible';c.playItem(fuel);return 'mover-combustible:'+p.id+':'+dest;}registro.accionActual='mover';c.doMove();return 'mover:'+p.id+':'+dest;}
 }
 const dice=c.actionDice();if(!dice.length)return 'terminar-turno';
 const pickMin=()=>dice.indexOf(Math.min(...dice));
 const home=group.find(p=>p.loc===0);
 if(home&&g.waste>=8){foco(c,home);c.picked=pickMin();registro.accionActual='limpiar';c.clean();return 'limpiar:'+home.id;}
 for(const p of group){
  const z=g.zones[p.loc],arriving=indefensos&&p.loc===0&&g.helpless>0?llegadasColonia(c):c.alive().filter(x=>x.loc===p.loc).length;
  const risk=z.z+Math.max(1,arriving)>=c.zcap[p.loc];
  const di=dice.findIndex(d=>d>=c.effectiveAttack(p));
  if(z.z&&risk&&di>=0){foco(c,p);c.picked=di;registro.accionActual='atacar';c.attack();return 'atacar:'+p.id;}
 }
 const searcher=group.filter(p=>p.loc!==0&&g.decks[p.loc]?.length).sort((a,b)=>c.effectiveSearch(a)-c.effectiveSearch(b))[0];
 if(searcher){
  const di=dice.findIndex(d=>d>=c.effectiveSearch(searcher));
  if(di>=0){foco(c,searcher);c.picked=di;registro.accionActual='buscar';c.search();return 'buscar:'+searcher.id;}
  if(g.food>c.feedingNeed(g)+1&&Math.max(...dice)<6){c.picked=dice.indexOf(Math.max(...dice));c.boostDie();return 'mejorar-dado';}
 }
 for(const p of group){const di=dice.findIndex(d=>d>=c.effectiveAttack(p));if(g.zones[p.loc].z&&di>=0){foco(c,p);c.picked=di;registro.accionActual='atacar';c.attack();return 'atacar:'+p.id;}}
 const builder=group.find(p=>c.openAccess(p.loc));if(builder){foco(c,builder);c.picked=pickMin();registro.accionActual='barricada';c.barricade();return 'barricada:'+builder.id;}
 if(home&&g.waste){foco(c,home);c.picked=pickMin();registro.accionActual='limpiar';c.clean();return 'limpiar:'+home.id;}
 return 'terminar-turno';
}

// ---------- ia-referencia y perfiles ----------
const perfiles={
 'ia-referencia':{
  destino:(c,p)=>p.search<=3?([2,6,1].find(i=>c.accessible(i)&&c.game.decks[i].length)??p.loc):([1,3,4,5].find(i=>c.accessible(i)&&c.game.decks[i].length)??p.loc),
  umbralComida:c=>Math.ceil((c.alive().filter(p=>p.loc===0).length+c.game.helpless)/2)+1,
  prioridad:['buscar','atacar','barricada','limpiar'],
  botin:botinReferencia,mordedura:mordeduraReferencia,defensor:false,mejorar:false,
 },
 abastecer:{
  // Un defensor se queda en la colonia; el resto va a los mazos con más comida.
  destino:(c,p,defensor)=>p===defensor?0:([1,5,4].find(i=>c.accessible(i)&&c.game.decks[i].length)??[3,2,6].find(i=>c.accessible(i)&&c.game.decks[i].length)??p.loc),
  umbralComida:c=>c.feedingNeed(c.game)+3,
  prioridad:['atacar','buscar-comida','barricada','buscar','limpiar'],
  botin:botinAbastecer,mordedura:mordeduraReferencia,defensor:true,mejorar:false,
 },
 objetivo:{
  // Todos salen hacia los mazos con muestras y notas; se ataca solo ante desbordamiento.
  destino:(c,p)=>[6,2,5].find(i=>c.accessible(i)&&c.game.decks[i].length)??[1,3,4].find(i=>c.accessible(i)&&c.game.decks[i].length)??p.loc,
  umbralComida:c=>c.feedingNeed(c.game),
  prioridad:['buscar-muestras','atacar-riesgo','mejorar','buscar','barricada','limpiar'],
  botin:botinObjetivo,mordedura:mordeduraReferencia,defensor:false,mejorar:true,defensorSiPeligra:true,
 },
 // Tercera corrida (docs/110): corre a las muestras como «objetivo», pero reparte al
 // grupo entre mazos y no amontona. Mismas reglas de dados, botín y defensa.
 'objetivo-repartido':{
  destino:(c,p)=>destinoRepartido(c,p),
  umbralComida:c=>c.feedingNeed(c.game),
  prioridad:['buscar-muestras','atacar-riesgo','mejorar','buscar','barricada','limpiar'],
  botin:botinObjetivo,mordedura:mordeduraReferencia,defensor:false,mejorar:true,defensorSiPeligra:true,
 },
};
// Destino repartido. Candidatos: los mazos de muestras y notas (Biblioteca, Hospital,
// Escuela); si ninguno sirve, los demás (Supermercado, Comisaría, Gasolinera). Un
// mazo sirve si tiene cartas, si hay plaza para uno más y si los accesos absorben las
// llegadas de la próxima fase de colonia: llega un zombi por superviviente presente y
// la localidad aguanta capacidad − zombis (accesos libres más barricadas) sin
// desbordarse. Se elige el que tenga menos compañeros del grupo; a igualdad, el
// primero de la lista. Quien ya está en un mazo que sirve y no tiene menos gente en
// otro, se queda. Si no sirve ninguno, vuelve a la colonia.
export const mazosRepartidos=[[6,2,5],[1,3,4]];
export function destinoRepartido(c,p){
 const g=c.game,otros=l=>c.alive().filter(x=>x!==p&&x.loc===l).length;
 const sirve=l=>g.decks[l]?.length>0&&otros(l)+1<=c.capacity[l]&&otros(l)+1<=c.zcap[l]-g.zones[l].z;
 for(const lista of mazosRepartidos){
  const ok=lista.filter(sirve);if(!ok.length)continue;
  const menor=Math.min(...ok.map(otros));
  if(ok.includes(p.loc)&&otros(p.loc)===menor)return p.loc;
  return ok.find(l=>otros(l)===menor);
 }
 return 0;
}
const mazosComida=[1,5,4],mazosMuestras=[6,2,5];
// Segunda corrida (opción indefensos). Llegadas a la colonia en la próxima fase:
// ⌈(habitantes + indefensos)/2⌉, como en colony(). La colonia peligra si esas
// llegadas, más dos por una crisis que atraiga zombis, alcanzan lo que absorben los
// accesos libres y las barricadas (capacidad − zombis).
const llegadasColonia=c=>Math.ceil((c.alive().filter(x=>x.loc===0).length+c.game.helpless)/2);
const coloniaEnPeligro=c=>{const g=c.game,z=g.zones[0];return g.helpless>0&&c.zcap[0]-z.z<=llegadasColonia(c)+2;};
function actuarReferencia(c,registro,perfil,{indefensos=false}={}){
 const g=c.game;
 if(!c.playable())return null;
 const group=c.controls.group().filter(p=>!p.dead),hand=c.currentHand();
 if(!group.length)throw Error('sin superviviente y partida activa');
 const use=(p,i,etiqueta)=>{foco(c,p);const id=c.catalog.resolve(hand[i]).id;registro.accionActual=etiqueta;c.playItem(i);return etiqueta+':'+p.id+':'+id;};
 // 1. Habilidades sin dado (orden de botTurn).
 for(const p of group){
  if(p.skillUsed)continue;
  if(['medic','nurse'].includes(p.skill)&&c.alive().some(x=>x.loc===p.loc&&(p.skill==='medic'?x.wounds:x.frost))){foco(c,p);c.special();return 'habilidad:'+p.id;}
  if(p.skill==='builder'&&c.openAccess(p.loc)){foco(c,p);c.special();return 'habilidad:'+p.id;}
 }
 // 2. Equipar lo que falte.
 for(const p of group)for(let k=hand.length-1;k>=0;k--){const d=c.catalog.resolve(hand[k]);if(d?.effect==='equip'&&!c.equipmentOf(p).some(it=>c.kind(it)===d.kind))return use(p,k,'equipar');}
 // 3. Mano, desde el final como la IA.
 for(let k=hand.length-1;k>=0;k--){
  const d=c.catalog.resolve(hand[k]);if(!d)continue;
  if(d.kind===g.crisis.type&&d.kind!=='herramienta'&&g.crisis.contributions.length<g.crisis.need){c.contribute(k);return 'aportar-crisis:'+k;}
  const herido=group.filter(p=>d.effect==='frost'?p.frost:p.wounds+p.frost).sort((a,b)=>(b.wounds+b.frost)-(a.wounds+a.frost))[0];
  if((d.effect==='heal'||d.effect==='frost')&&herido)return use(herido,k,'curar');
  if(d.effect==='food'&&g.food<perfil.umbralComida(c))return use(group[0],k,'comida');
  if(d.effect==='research'||d.effect==='sample')return use(group[0],k,'muestra');
  if(d.effect==='manual'&&g.waste>=2)return use(group[0],k,'manual');
  if(d.effect==='rescue'&&c.accessible(0))return use(group[0],k,'rescate');
 }
 // 4. Movimientos: cada superviviente una vez por ronda.
 // Con indefensos, «objetivo» deja (o hace volver) al mejor atacante a la colonia
 // solo cuando la colonia está por desbordarse; si no, todos siguen corriendo.
 const vuelveDefensor=indefensos&&perfil.defensorSiPeligra&&coloniaEnPeligro(c);
 const defensor=perfil.defensor||vuelveDefensor?group.slice().sort((a,b)=>c.effectiveAttack(a)-c.effectiveAttack(b)||a.id.localeCompare(b.id))[0]:null;
 for(const p of group){
  if(p.moved)continue;
  const dest=vuelveDefensor&&p===defensor?0:perfil.destino(c,p,defensor);if(dest===p.loc||!c.accessible(dest))continue;
  foco(c,p);c.target=dest;const fuel=hand.findIndex(it=>c.kind(it)==='combustible');
  if(fuel>=0){registro.accionActual='mover-combustible';c.playItem(fuel);return 'mover-combustible:'+p.id+':'+dest;}
  registro.accionActual='mover';c.doMove();return 'mover:'+p.id+':'+dest;
 }
 // 5. Dados, según la prioridad del perfil.
 const dice=c.actionDice();
 if(dice.length)for(const regla of perfil.prioridad){
  const r=reglaDeDados(c,regla,group,dice,registro);if(r)return r;
 }
 // 6. Herramientas: solo si alcanzan para completar la crisis (botContributeTools).
 const herramientas=aportarHerramientas(c,group);if(herramientas)return herramientas;
 return 'terminar-turno';
}
function reglaDeDados(c,regla,group,dice,registro){
 const g=c.game;
 const buscar=(candidatos)=>{for(const p of candidatos){const di=dice.findIndex(d=>d>=c.effectiveSearch(p));if(p.loc!==0&&g.decks[p.loc].length&&di>=0){foco(c,p);c.picked=di;registro.accionActual='buscar';c.search();return 'buscar:'+p.id;}}return null;};
 const atacar=(condicion)=>{for(const p of group){const di=dice.findIndex(d=>d>=c.effectiveAttack(p));if(di>=0&&g.zones[p.loc].z>0&&condicion(p)){foco(c,p);c.picked=di;registro.accionActual='atacar';c.attack();return 'atacar:'+p.id;}}return null;};
 if(regla==='buscar')return buscar(group);
 if(regla==='buscar-comida')return buscar(group.filter(p=>mazosComida.includes(p.loc)));
 if(regla==='buscar-muestras')return buscar(group.filter(p=>mazosMuestras.includes(p.loc)));
 if(regla==='atacar')return atacar(()=>true);
 if(regla==='atacar-riesgo')return atacar(p=>{const z=g.zones[p.loc],llegan=p.loc===0?Math.ceil((c.alive().filter(x=>x.loc===0).length+g.helpless)/2):c.alive().filter(x=>x.loc===p.loc).length;return z.z+z.b+llegan>=c.zcap[p.loc];});
 if(regla==='mejorar'){
  const buscador=group.find(p=>p.loc!==0&&g.decks[p.loc].length&&!dice.some(d=>d>=c.effectiveSearch(p)));
  if(buscador&&g.food>c.feedingNeed(g)+1&&Math.max(...dice)<6){c.picked=dice.indexOf(Math.max(...dice));c.boostDie();return 'mejorar-dado';}
  return null;
 }
 if(regla==='barricada'){const p=group.find(p=>c.openAccess(p.loc));if(p){foco(c,p);c.picked=0;registro.accionActual='barricada';c.barricade();return 'barricada:'+p.id;}return null;}
 if(regla==='limpiar'){const p=group.find(p=>p.loc===0&&g.waste);if(p){foco(c,p);c.picked=0;registro.accionActual='limpiar';c.clean();return 'limpiar:'+p.id;}return null;}
 throw Error('Regla de dados desconocida: '+regla);
}
function aportarHerramientas(c,group){
 const g=c.game,k=g.crisis;if(g.ended||!k||k.type!=='herramienta')return null;
 const faltan=Math.max(0,k.need-k.contributions.filter(t=>t==='herramienta').length);if(!faltan)return null;
 const hand=c.currentHand(),disponibles=hand.filter(it=>c.kind(it)==='herramienta').length+group.reduce((n,p)=>n+c.equipmentOf(p).filter(it=>c.kind(it)==='herramienta').length,0);
 if(disponibles<faltan)return null;
 const i=hand.findIndex(it=>c.kind(it)==='herramienta');
 if(i>=0){c.contribute(i);return 'aportar-herramienta:'+i;}
 const p=group.find(p=>c.equipmentOf(p).some(it=>c.kind(it)==='herramienta'));if(!p)return null;
 const j=c.equipmentOf(p).findIndex(it=>c.kind(it)==='herramienta');c.contributeEquipment(p.id,j);return 'aportar-herramienta-equipo:'+p.id;
}

export const nombresDePoliticas=['cooperativa','ia-referencia','abastecer','objetivo']; // plan de la primera corrida
export const politicasTerceraCorrida=['cooperativa','objetivo','objetivo-repartido'];
// opciones.indefensos (segunda corrida): la política sabe de los indefensos. Solo
// cambia algo cuando hay indefensos en la colonia; sin ellos juega igual que antes.
export function crearPolitica(nombre,opciones={}){
 if(nombre==='cooperativa-repartida')return {nombre,decidir:c=>decidirComun(c,{botin:botinCooperativa,mordedura:mordeduraRiesgo}),actuar:(c,registro)=>actuarCooperativa(c,registro,{...opciones,repartida:true})};
 if(nombre==='cooperativa')return {nombre,decidir:c=>decidirComun(c,{botin:botinCooperativa,mordedura:mordeduraRiesgo}),actuar:(c,registro)=>actuarCooperativa(c,registro,opciones)};
 const perfil=perfiles[nombre];if(!perfil)throw Error('Política desconocida: '+nombre);
 return {nombre,decidir:c=>decidirComun(c,{botin:perfil.botin,mordedura:perfil.mordedura,paciente:pacienteMasHerido}),actuar:(c,registro)=>actuarReferencia(c,registro,perfil,opciones)};
}
