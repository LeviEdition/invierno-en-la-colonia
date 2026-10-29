import {capabilities,viewCapabilities,agentCapabilities} from './reference-contracts.mjs';
import {createReferenceData} from '../domain/reference-data.mjs';
import {createReferenceState} from '../domain/reference-state.mjs';
import {createItemEngine} from '../domain/reference-items.mjs';
import {createCrisisManager} from '../domain/reference-crisis.mjs';
import {createDeathDirector} from '../application/death-director.mjs';
import {readOnlyContext} from './read-only-context.mjs';
import {ItemCatalog} from '../item-catalog.mjs';
import {createRules} from '../domain/reference-rules.mjs';
import {createTurns} from './reference-turns.mjs';
const noop=()=>{};
export function createEngine({Math=globalThis.Math,queueMicrotask=globalThis.queueMicrotask||((f)=>Promise.resolve().then(f)),setTimeout=globalThis.setTimeout,stateFactory=createReferenceState,rulesFactory=createRules,turnsFactory=createTurns,effects={},automation=null}={}){
let view=new Proxy(effects,{get:(target,key)=>target[key]||noop});
let hasAutomation=!!automation;
let agent=automation||{botTurn:()=>Promise.resolve(),botContributeTools:noop};
let toast=(...args)=>view["toast"](...args);
let drainToasts=(...args)=>view["drainToasts"](...args);
let equipIcons=(...args)=>view["equipIcons"](...args);
let showStatInfo=(...args)=>view["showStatInfo"](...args);
let closeStatInfo=(...args)=>view["closeStatInfo"](...args);
let statusText=(...args)=>view["statusText"](...args);
let token=(...args)=>view["token"](...args);
let toggleFab=(...args)=>view["toggleFab"](...args);
let menuGo=(...args)=>view["menuGo"](...args);
let menuEndTurn=(...args)=>view["menuEndTurn"](...args);
let toggleEquipDescription=(...args)=>view["toggleEquipDescription"](...args);
let handoverDialog=(...args)=>view["handoverDialog"](...args);
let activeDialog=(...args)=>view["activeDialog"](...args);
let dialogButtons=(...args)=>view["dialogButtons"](...args);
let focusHandover=(...args)=>view["focusHandover"](...args);
let syncHandoverAccessibility=(...args)=>view["syncHandoverAccessibility"](...args);
let returnFocusAfterHandover=(...args)=>view["returnFocusAfterHandover"](...args);
let renderModal=(...args)=>view["renderModal"](...args);
let paintDice=(...args)=>view["paintDice"](...args);
let renderSite=(...args)=>view["renderSite"](...args);
let draw=(...args)=>view["draw"](...args);
let equipmentOf=(...args)=>rules["equipmentOf"](...args);
let ownerGroup=(...args)=>rules["ownerGroup"](...args);
let groupLeader=(...args)=>rules["groupLeader"](...args);
let isLeader=(...args)=>rules["isLeader"](...args);
let canPickStartingLeader=(...args)=>rules["canPickStartingLeader"](...args);
let kind=(...args)=>rules["kind"](...args);
let ownerHand=(...args)=>rules["ownerHand"](...args);
let crossActor=(...args)=>rules["crossActor"](...args);
let ownerOf=(...args)=>rules["ownerOf"](...args);
let accessible=(...args)=>rules["accessible"](...args);
let openAccess=(...args)=>rules["openAccess"](...args);
let hasAnyAccess=(...args)=>rules["hasAnyAccess"](...args);
let itemTitle=(...args)=>rules["itemTitle"](...args);
let effectiveAttack=(...args)=>rules["effectiveAttack"](...args);
let effectiveSearch=(...args)=>rules["effectiveSearch"](...args);
let gameOutcome=(...args)=>rules["gameOutcome"](...args);
let canReceiveTransfer=(...args)=>rules["canReceiveTransfer"](...args);
let crossHandIndex=(...args)=>rules["crossHandIndex"](...args);
let ownerGroupHand=(...args)=>rules["ownerGroupHand"](...args);
let colonyRoom=(...args)=>rules["colonyRoom"](...args);
let crossOptionAllowed=(...args)=>rules["crossOptionAllowed"](...args);
let feedingNeed=(...args)=>rules["feedingNeed"](...args);
let crossResourceValue=(...args)=>rules["crossResourceValue"](...args);
let crossRank=(...args)=>rules["crossRank"](...args);
let compareCrossRanks=(...args)=>rules["compareCrossRanks"](...args);
let evaluateCrossOptions=(...args)=>rules["evaluateCrossOptions"](...args);
let chooseCrossOption=(...args)=>rules["chooseCrossOption"](...args);
let newRound=(...args)=>turns["newRound"](...args);
let applyFrost=(...args)=>turns["applyFrost"](...args);
let finishTurn=(...args)=>turns["finishTurn"](...args);
let botContributeTools=(...args)=>agent["botContributeTools"](...args);
let botTurn=(...args)=>agent["botTurn"](...args);
const c={get pickActionDie(){return pickActionDie;},get skipAutomation(){return skipAutomation;},get deathContinue(){return deathContinue;},get view(){return view;},get queueMicrotask(){return fn=>queueMicrotask(fn); },get Math(){return Math;},get toastQueue(){return view.toastQueue;},get toastBusy(){return view.toastBusy;},get places(){return places;},
get icons(){return icons;},
get em(){return em;},
get capacity(){return capacity;},
get zcap(){return zcap;},
get objectives(){return objectives;},
get roster(){return roster;},
get random(){return random;},
get die(){return die;},
get game(){return game;},set game(value){game=value;},
get selected(){return selected;},set selected(value){selected=value;},
get target(){return target;},set target(value){target=value;},
get picked(){return picked;},set picked(value){picked=value;},
get opened(){return opened;},set opened(value){opened=value;},
get profileId(){return profileId;},set profileId(value){profileId=value;},
get skipAI(){return skipAI;},set skipAI(value){skipAI=value;},
get aiRunning(){return aiRunning;},set aiRunning(value){aiRunning=value;},
get pendingHeal(){return pendingHeal;},set pendingHeal(value){pendingHeal=value;},
get pendingLoot(){return pendingLoot;},set pendingLoot(value){pendingLoot=value;},
get gameMode(){return gameMode;},set gameMode(value){gameMode=value;},
get passScreenActive(){return passScreenActive;},set passScreenActive(value){passScreenActive=value;},
get selectionBySide(){return selectionBySide;},
get controls(){return controls;},
get playable(){return playable;},
get canResolve(){return canResolve;},
get actionDice(){return actionDice;},
get currentHand(){return currentHand;},
get all(){return all;},
get alive(){return alive;},
get person(){return person;},
get pause(){return pause;},set pause(value){pause=value;},
get crossroadsDeck(){return crossroadsDeck;},
get pendingLeader(){return pendingLeader;},set pendingLeader(value){pendingLeader=value;},
get pendingLeaderSide(){return pendingLeaderSide;},set pendingLeaderSide(value){pendingLeaderSide=value;},
get pendingLeaderSides(){return pendingLeaderSides;},set pendingLeaderSides(value){pendingLeaderSides=value;},
get leaderWaiters(){return leaderWaiters;},set leaderWaiters(value){leaderWaiters=value;},
get pendingRecruitInfo(){return pendingRecruitInfo;},set pendingRecruitInfo(value){pendingRecruitInfo=value;},
get pendingBite(){return pendingBite;},set pendingBite(value){pendingBite=value;},
get pendingAttract(){return pendingAttract;},set pendingAttract(value){pendingAttract=value;},
get pendingTransfer(){return pendingTransfer;},set pendingTransfer(value){pendingTransfer=value;},
get biteWaiters(){return biteWaiters;},set biteWaiters(value){biteWaiters=value;},
get aiCrossChoice(){return aiCrossChoice;},set aiCrossChoice(value){aiCrossChoice=value;},
get aiCrossWaiters(){return aiCrossWaiters;},set aiCrossWaiters(value){aiCrossWaiters=value;},
get mix(){return mix;},
get addWaste(){return addWaste;},
get itemEngine(){return itemEngine;},
get deathDirector(){return deathDirector;},
get waitForBite(){return waitForBite;},
get waitForAiCross(){return waitForAiCross;},
get special(){return special;},set special(value){special=value;},
get chooseHeal(){return chooseHeal;},set chooseHeal(value){chooseHeal=value;},
get TurnController(){return TurnController;},set TurnController(value){TurnController=value;},
get deathWaiting(){return deathWaiting;},set deathWaiting(value){deathWaiting=value;},
get decisionKind(){return decisionKind;},set decisionKind(value){decisionKind=value;},
get message(){return message;},set message(value){message=value;},
get select(){return select;},set select(value){select=value;},
get profile(){return profile;},set profile(value){profile=value;},
get destination(){return destination;},set destination(value){destination=value;},
get messageAndPaint(){return messageAndPaint;},set messageAndPaint(value){messageAndPaint=value;},
get syncLeaderRequests(){return syncLeaderRequests;},set syncLeaderRequests(value){syncLeaderRequests=value;},
get requestLeader(){return requestLeader;},set requestLeader(value){requestLeader=value;},
get clearLeaderRequest(){return clearLeaderRequest;},set clearLeaderRequest(value){clearLeaderRequest=value;},
get resetLeaderRequests(){return resetLeaderRequests;},set resetLeaderRequests(value){resetLeaderRequests=value;},
get leaderChoiceReady(){return leaderChoiceReady;},set leaderChoiceReady(value){leaderChoiceReady=value;},
get chooseLeader(){return chooseLeader;},set chooseLeader(value){chooseLeader=value;},
get reviewLeader(){return reviewLeader;},set reviewLeader(value){reviewLeader=value;},
get waitForLeader(){return waitForLeader;},set waitForLeader(value){waitForLeader=value;},
get dismissRecruit(){return dismissRecruit;},set dismissRecruit(value){dismissRecruit=value;},
get processRescueQueue(){return processRescueQueue;},set processRescueQueue(value){processRescueQueue=value;},
get confirmStartingLeader(){return confirmStartingLeader;},set confirmStartingLeader(value){confirmStartingLeader=value;},
get addCharacter(){return addCharacter;},set addCharacter(value){addCharacter=value;},
get recruit(){return recruit;},set recruit(value){recruit=value;},
get replaceLastSurvivors(){return replaceLastSurvivors;},set replaceLastSurvivors(value){replaceLastSurvivors=value;},
get ItemEngine(){return ItemEngine;},set ItemEngine(value){ItemEngine=value;},
get create(){return create;},set create(value){create=value;},
get DeathDirector(){return DeathDirector;},set DeathDirector(value){DeathDirector=value;},
get kill(){return kill;},set kill(value){kill=value;},
get ruleMessage(){return ruleMessage;},set ruleMessage(value){ruleMessage=value;},
get verify(){return verify;},set verify(value){verify=value;},
get biteNext(){return biteNext;},set biteNext(value){biteNext=value;},
get settleDecisionWaiters(){return settleDecisionWaiters;},set settleDecisionWaiters(value){settleDecisionWaiters=value;},
get cancelPendingDecisions(){return cancelPendingDecisions;},set cancelPendingDecisions(value){cancelPendingDecisions=value;},
get chooseBite(){return chooseBite;},set chooseBite(value){chooseBite=value;},
get expose(){return expose;},set expose(value){expose=value;},
get drawItem(){return drawItem;},set drawItem(value){drawItem=value;},
get stashLoot(){return stashLoot;},set stashLoot(value){stashLoot=value;},
get beginSearch(){return beginSearch;},set beginSearch(value){beginSearch=value;},
get addNoiseSearch(){return addNoiseSearch;},set addNoiseSearch(value){addNoiseSearch=value;},
get chooseLoot(){return chooseLoot;},set chooseLoot(value){chooseLoot=value;},
get consume(){return consume;},set consume(value){consume=value;},
get boostDie(){return boostDie;},set boostDie(value){boostDie=value;},
get pickFloatingDie(){return pickFloatingDie;},set pickFloatingDie(value){pickFloatingDie=value;},
get search(){return search;},set search(value){search=value;},
get attack(){return attack;},set attack(value){attack=value;},
get doMove(){return doMove;},set doMove(value){doMove=value;},
get barricade(){return barricade;},set barricade(value){barricade=value;},
get clean(){return clean;},set clean(value){clean=value;},
get attract(){return attract;},set attract(value){attract=value;},
get chooseAttract(){return chooseAttract;},set chooseAttract(value){chooseAttract=value;},
get CrisisManager(){return CrisisManager;},set CrisisManager(value){CrisisManager=value;},
get contribute(){return contribute;},set contribute(value){contribute=value;},
get contributeEquipment(){return contributeEquipment;},set contributeEquipment(value){contributeEquipment=value;},
get playItem(){return playItem;},set playItem(value){playItem=value;},
get equipItem(){return equipItem;},set equipItem(value){equipItem=value;},
get unequipItem(){return unequipItem;},set unequipItem(value){unequipItem=value;},
get startTransfer(){return startTransfer;},set startTransfer(value){startTransfer=value;},
get chooseTransfer(){return chooseTransfer;},set chooseTransfer(value){chooseTransfer=value;},
get gainSample(){return gainSample;},set gainSample(value){gainSample=value;},
get crossDraw(){return crossDraw;},set crossDraw(value){crossDraw=value;},
get resolveCross(){return resolveCross;},set resolveCross(value){resolveCross=value;},
get crossTrigger(){return crossTrigger;},set crossTrigger(value){crossTrigger=value;},
get crossAction(){return crossAction;},set crossAction(value){crossAction=value;},
get crossChoose(){return crossChoose;},set crossChoose(value){crossChoose=value;},
get crossAiContinue(){return crossAiContinue;},set crossAiContinue(value){crossAiContinue=value;},
get addZombie(){return addZombie;},set addZombie(value){addZombie=value;},
get resolveCrisis(){return resolveCrisis;},set resolveCrisis(value){resolveCrisis=value;},
get colony(){return colony;},set colony(value){colony=value;},
get showSetup(){return showSetup;},set showSetup(value){showSetup=value;},
get startGame(){return startGame;},set startGame(value){startGame=value;},
get showPass(){return showPass;},set showPass(value){showPass=value;},
get confirmPass(){return confirmPass;},set confirmPass(value){confirmPass=value;},
get show(){return show;},set show(value){show=value;},
get hide(){return hide;},set hide(value){hide=value;},
get cancelAttract(){return cancelAttract;},set cancelAttract(value){cancelAttract=value;},
get cancelHeal(){return cancelHeal;},set cancelHeal(value){cancelHeal=value;},
get cancelTransfer(){return cancelTransfer;},set cancelTransfer(value){cancelTransfer=value;},
get paint(){return paint;},set paint(value){paint=value;},
get toast(){return toast;},set toast(value){toast=value;},
get drainToasts(){return drainToasts;},set drainToasts(value){drainToasts=value;},
get equipIcons(){return equipIcons;},set equipIcons(value){equipIcons=value;},
get showStatInfo(){return showStatInfo;},set showStatInfo(value){showStatInfo=value;},
get closeStatInfo(){return closeStatInfo;},set closeStatInfo(value){closeStatInfo=value;},
get statDetails(){return view.statDetails;},
get statusText(){return statusText;},set statusText(value){statusText=value;},
get token(){return token;},set token(value){token=value;},
get toggleFab(){return toggleFab;},set toggleFab(value){toggleFab=value;},
get menuGo(){return menuGo;},set menuGo(value){menuGo=value;},
get menuEndTurn(){return menuEndTurn;},set menuEndTurn(value){menuEndTurn=value;},
get toggleEquipDescription(){return toggleEquipDescription;},set toggleEquipDescription(value){toggleEquipDescription=value;},
get regularModalOpener(){return view.regularModalOpener;},
get deathModalOpener(){return view.deathModalOpener;},
get previousActiveDialog(){return view.previousActiveDialog;},
get handoverDialog(){return handoverDialog;},set handoverDialog(value){handoverDialog=value;},
get activeDialog(){return activeDialog;},set activeDialog(value){activeDialog=value;},
get dialogButtons(){return dialogButtons;},set dialogButtons(value){dialogButtons=value;},
get focusHandover(){return focusHandover;},set focusHandover(value){focusHandover=value;},
get syncHandoverAccessibility(){return syncHandoverAccessibility;},set syncHandoverAccessibility(value){syncHandoverAccessibility=value;},
get returnFocusAfterHandover(){return returnFocusAfterHandover;},set returnFocusAfterHandover(value){returnFocusAfterHandover=value;},
get renderModal(){return renderModal;},set renderModal(value){renderModal=value;},
get paintDice(){return paintDice;},set paintDice(value){paintDice=value;},
get renderSite(){return renderSite;},set renderSite(value){renderSite=value;},
get draw(){return draw;},set draw(value){draw=value;},
get equipmentOf(){return equipmentOf;},set equipmentOf(value){equipmentOf=value;},
get ownerGroup(){return ownerGroup;},set ownerGroup(value){ownerGroup=value;},
get groupLeader(){return groupLeader;},set groupLeader(value){groupLeader=value;},
get isLeader(){return isLeader;},set isLeader(value){isLeader=value;},
get canPickStartingLeader(){return canPickStartingLeader;},set canPickStartingLeader(value){canPickStartingLeader=value;},
get kind(){return kind;},
get ownerHand(){return ownerHand;},
get crossActor(){return crossActor;},
get ownerOf(){return ownerOf;},
get accessible(){return accessible;},
get openAccess(){return openAccess;},
get hasAnyAccess(){return hasAnyAccess;},
get itemTitle(){return itemTitle;},
get effectiveAttack(){return effectiveAttack;},set effectiveAttack(value){effectiveAttack=value;},
get effectiveSearch(){return effectiveSearch;},set effectiveSearch(value){effectiveSearch=value;},
get gameOutcome(){return gameOutcome;},set gameOutcome(value){gameOutcome=value;},
get canReceiveTransfer(){return canReceiveTransfer;},set canReceiveTransfer(value){canReceiveTransfer=value;},
get crossHandIndex(){return crossHandIndex;},set crossHandIndex(value){crossHandIndex=value;},
get ownerGroupHand(){return ownerGroupHand;},set ownerGroupHand(value){ownerGroupHand=value;},
get colonyRoom(){return colonyRoom;},set colonyRoom(value){colonyRoom=value;},
get crossOptionAllowed(){return crossOptionAllowed;},set crossOptionAllowed(value){crossOptionAllowed=value;},
get feedingNeed(){return feedingNeed;},set feedingNeed(value){feedingNeed=value;},
get crossResourceValue(){return crossResourceValue;},set crossResourceValue(value){crossResourceValue=value;},
get crossRank(){return crossRank;},set crossRank(value){crossRank=value;},
get compareCrossRanks(){return compareCrossRanks;},set compareCrossRanks(value){compareCrossRanks=value;},
get evaluateCrossOptions(){return evaluateCrossOptions;},set evaluateCrossOptions(value){evaluateCrossOptions=value;},
get chooseCrossOption(){return chooseCrossOption;},set chooseCrossOption(value){chooseCrossOption=value;},
get newRound(){return newRound;},set newRound(value){newRound=value;},
get applyFrost(){return applyFrost;},set applyFrost(value){applyFrost=value;},
get finishTurn(){return finishTurn;},set finishTurn(value){finishTurn=value;},
get botContributeTools(){return botContributeTools;},set botContributeTools(value){botContributeTools=value;},
get botTurn(){return botTurn;},set botTurn(value){botTurn=value;},get catalog(){return catalog;}};
const rules=rulesFactory(c),turns=turnsFactory(c,{Math,setTimeout});
const catalog=new ItemCatalog(cards=>mix(cards));
'use strict';
const {places,icons,em,capacity,zcap,objectives,roster}=createReferenceData();





function special(){const p=person();if(!p||p.dead||!playable()||game.ended)return;if(p.skillUsed)return messageAndPaint('Ya usaste esta habilidad en la ronda.');if(p.skill==='builder'){const z=game.zones[p.loc];if(z.z+z.b>=zcap[p.loc])return messageAndPaint('No hay accesos libres.');z.b++;p.skillUsed=true;message('★ '+p.name+' construyó una barricada.');paint();}else if(p.skill==='medic'||p.skill==='nurse'){if(pendingLoot)return;const targets=alive().filter(x=>x.loc===p.loc&&(p.skill==='medic'?x.wounds:x.frost));if(!targets.length)return messageAndPaint('No hay nadie que necesite ese tratamiento aquí.');pendingHeal={actor:p.id,targets:targets.map(x=>x.id)};show('healTarget');}else return messageAndPaint('La habilidad de este personaje es automática.');}
function chooseHeal(id){if(!pendingHeal||!pendingHeal.targets.includes(id))return;const p=all().find(x=>x.id===pendingHeal.actor),t=all().find(x=>x.id===id);if(!p||!t||p.dead||t.dead||p.skillUsed||p.loc!==t.loc||!canResolve('healTarget'))return;const key=p.skill==='medic'?'wounds':'frost';if(!t[key])return; t[key]--;p.skillUsed=true;pendingHeal=null;message('✚ '+p.name+' atendió a '+t.name+' con '+p.skillName+'.');hide();paint();}
const random=n=>Math.floor(Math.random()*n),die=()=>random(6)+1;
let game,selected=0,target=0,picked=0,opened='',profileId='',skipAI=false,aiRunning=false,pendingHeal=null,pendingLoot=null;
let gameMode='ai',passScreenActive=false;
const selectionBySide={human:0,ai:0};
class TurnController {
 get side(){return game?.turn==='ai'?'ai':'human';}
 get local(){return game?.mode==='local';}
 get interactive(){return !!game&&!game.ended&&!passScreenActive&&!aiRunning&&(game.turn==='human'||(this.local&&game.turn==='ai'));}
 group(side=this.side){return side==='ai'?game.bots:game.humans;}
 hand(side=this.side){return side==='ai'?game.botItems:game.items;}
 dice(side=this.side){return side==='ai'?game.botDice:game.dice;}
 display(side=this.side){return side==='human'?'Jugador 1':(this.local?'Jugador 2':'IA');}
}
const controls=new TurnController();
function deathWaiting(){return deathDirector.active||deathDirector.pending.length>0;}
function decisionKind(){
 if(pendingBite)return 'biteChoice';if(leaderChoiceReady())return 'leaderChoice';
 if(pendingLoot)return 'lootChoice';if(pendingHeal)return 'healTarget';
 if(pendingAttract)return 'attractTarget';if(pendingTransfer)return 'transferTarget';
 return game?.crossPending?'crossroads':null;
}
const playable=()=>controls.interactive&&!deathWaiting()&&!decisionKind();
const canResolve=type=>controls.interactive&&!deathWaiting()&&decisionKind()===type;
const actionDice=()=>controls.dice();
const currentHand=()=>controls.hand();
const all=(g=game)=>[...g.humans,...g.bots],alive=(g=game)=>all(g).filter(p=>!p.dead),person=()=>controls.group()[selected];
let pause=async()=>{
 const pausedGame=game;paint();
 await waitForAiCross();if(game!==pausedGame||game.ended)return;
 await waitForLeader();if(game!==pausedGame||game.ended)return;
 await deathDirector.wait();if(game!==pausedGame||game.ended)return;
 if(!skipAI)await new Promise(r=>setTimeout(r,1750));
};
function message(t){game.log.unshift('R'+game.round+' · '+t);game.log=game.log.slice(0,120);game.last=t;toast(t);}
const crossroadsDeck=[
{title:'Golpes en la puerta',when:'move',story:'Una familia exhausta sigue a tu grupo hasta el portón. Piden refugio, pero las reservas ya escasean.',choices:[['Darles refugio','Llegan 2 indefensos; +1 moral.',g=>{g.helpless+=2;g.morale++;},g=>colonyRoom(g,2)],['Compartir provisiones y despedirlos','-2 comida; +1 moral.',g=>{g.food=Math.max(0,g.food-2);g.morale++;},g=>g.food>=2]]},
{title:'La radio encendida',when:'search',story:'Entre interferencias, una voz ofrece coordenadas de un depósito de suministros. También podrían ser saqueadores.',choices:[['Confiar en la señal','+2 comida, pero llegan 2 zombis al exterior.',(g,env)=>{g.food+=2;addZombie(1,env);addZombie(1,env);}],['Apagar la radio','+1 moral: la colonia evita el riesgo.',g=>{g.morale++;}]]},
{title:'Una mano entre los escombros',when:'search',story:'Encontrás a una persona atrapada. Rescatarla demora y puede atraer a los muertos.',choices:[['Intentar el rescate','Reclutás un superviviente, si hay espacio; +1 zombi.',(g,env)=>{recruit(g.crossOwner,false,env);addZombie(2,env);}],['Buscar provisiones primero','+2 comida, -1 moral.',g=>{g.food+=2;g.morale=Math.max(0,g.morale-1);}]]},
{title:'El último cargador',when:'attack',story:'Una persona te pide munición para defender a su hermano. Es lo último que le queda a la colonia.',choices:[['Entregar las municiones','-1 comida, -1 zombi en la colonia.',g=>{g.food=Math.max(0,g.food-1);g.zones[0].z=Math.max(0,g.zones[0].z-1);}],['Reservarlas para el grupo','+1 barricada en la colonia, si hay lugar.',g=>{if(g.zones[0].z+g.zones[0].b<zcap[0])g.zones[0].b++;}]]},
{title:'Fiebre en el refugio',when:'round',story:'Un niño del refugio tiembla de fiebre. La medicina es escasa y otros también la necesitan.',choices:[['Usar el botiquín','Consumís 1 medicina, si hay; +1 moral.',g=>{let i=crossHandIndex(g,'medicina');if(i>=0){ownerHand(g).splice(i,1);g.morale++;}else g.morale=Math.max(0,g.morale-1);},(g,side)=>ownerGroupHand(g,side).some(it=>kind(it)==='medicina')],['Aislar al enfermo','Sin costo de objetos; -1 moral.',g=>{g.morale=Math.max(0,g.morale-1);}]]},
{title:'Huellas sobre la nieve',when:'move',story:'Unas pisadas recientes se alejan del camino. Podrían conducir a un refugio seguro.',choices:[['Seguir las huellas','+1 herramienta y +1 zombi en la localidad.',(g,env)=>{ownerHand(g).push('herramienta');addZombie(crossActor(g).loc,env);}],['Regresar sin investigar','+1 barricada en la colonia, si hay lugar.',g=>{if(g.zones[0].z+g.zones[0].b<zcap[0])g.zones[0].b++;}]]},
{title:'El generador averiado',when:'round',story:'La calefacción de la colonia se apaga en plena noche. Solo queda combustible para una emergencia.',choices:[['Encender el generador','Consumís 1 combustible, si hay; +1 moral.',g=>{let i=crossHandIndex(g,'combustible');if(i>=0){ownerHand(g).splice(i,1);g.morale++;}else g.waste+=2;},(g,side)=>ownerGroupHand(g,side).some(it=>kind(it)==='combustible')],['Ahorrar combustible','+2 residuos por improvisar braseros.',g=>{g.waste+=2;}]]},
{title:'Un mensaje en la pared',when:'search',story:'Un mapa dibujado a mano señala un laboratorio abandonado. La ruta está infestada.',choices:[['Investigar el laboratorio','+1 muestra y +2 zombis en el hospital.',(g,env)=>{g.samples++;addZombie(2,env);addZombie(2,env);}],['Evitar la zona','+1 comida.',g=>{g.food++;}]]},
{title:'El perro del estacionamiento',when:'move',story:'Un perro hambriento se acerca al grupo. Sus ladridos podrían alertar a los zombis.',choices:[['Alimentarlo','-1 comida, +1 moral.',g=>{g.food=Math.max(0,g.food-1);g.morale++;},g=>g.food>=1],['Alejarlo','+1 zombi en la ubicación del superviviente.',(g,env)=>{addZombie(crossActor(g).loc,env);}]]},
{title:'Una discusión por las raciones',when:'round',story:'Dos habitantes discuten por el reparto. La tensión amenaza con dividir al refugio.',choices:[['Repartir comida extra','-2 comida, +2 moral.',g=>{g.food=Math.max(0,g.food-2);g.morale+=2;},g=>g.food>=2],['Mantener las raciones','-1 moral.',g=>{g.morale=Math.max(0,g.morale-1);}]]},
{title:'El autobús varado',when:'move',story:'Hay personas atrapadas en un autobús. Sacarlas implica hacer ruido y gastar tiempo.',choices:[['Evacuarlas','+3 indefensos, +1 moral, +2 zombis en la colonia.',(g,env)=>{g.helpless+=3;g.morale++;addZombie(0,env);addZombie(0,env);},g=>colonyRoom(g,3)],['No intervenir','-1 moral.',g=>{g.morale=Math.max(0,g.morale-1);}]]},
{title:'La guardia nocturna',when:'round',story:'Un centinela descubre una abertura en el perímetro. Repararla implica gastar herramientas o arriesgar la seguridad.',choices:[['Reparar el muro','Consumís una herramienta; añadís dos barricadas si hay accesos.',(g,env)=>{const k=crossHandIndex(g,'herramienta');if(k>=0){ownerHand(g).splice(k,1);for(let i=0;i<2;i++)if(g.zones[0].z+g.zones[0].b<zcap[0])g.zones[0].b++;}else{g.morale=Math.max(0,g.morale-1);ruleMessage(env,'Sin herramientas: -1 moral.');}},(g,side)=>ownerGroupHand(g,side).some(it=>kind(it)==='herramienta')],['Mantener una guardia improvisada','Un zombi menos en la colonia, pero +1 residuo.',g=>{g.zones[0].z=Math.max(0,g.zones[0].z-1);g.waste++;}]]},
{title:'La farmacia saqueada',when:'search',story:'Encontrás un armario con medicinas y una nota que advierte que otros refugiados volverán por ellas.',choices:[['Llevar los medicamentos','Obtenés dos medicinas; +1 zombi en tu localidad.',(g,env)=>{ownerHand(g).push('medicina','medicina');addZombie(crossActor(g).loc,env);} ],['Dejar parte para otros','Obtenés una medicina; +1 moral.',g=>{ownerHand(g).push('medicina');g.morale++;}]]},
{title:'El último puente',when:'move',story:'Un puente de tablones cruje bajo los pasos de un grupo de civiles que intenta llegar al refugio.',choices:[['Ayudar a cruzar','Llegan dos indefensos y +1 moral.',g=>{g.helpless+=2;g.morale++;},g=>colonyRoom(g,2)],['Cerrar el paso','Añadís una barricada en la colonia si hay lugar.',g=>{if(g.zones[0].z+g.zones[0].b<zcap[0])g.zones[0].b++;}]]},
{title:'Disparos a lo lejos',when:'attack',story:'Una patrulla desconocida dispara contra los muertos. Sus miembros piden suministros a cambio de cubrir la retirada.',choices:[['Compartir una ración','Gastás una comida y eliminás hasta dos zombis de tu localidad.',(g,env)=>{if(g.food>0){g.food--;g.zones[crossActor(g).loc].z=Math.max(0,g.zones[crossActor(g).loc].z-2);}else ruleMessage(env,'No había comida para negociar.');},g=>g.food>=1],['Rechazar el trato','La tensión atrae un zombi a tu localidad.',(g,env)=>{addZombie(crossActor(g).loc,env);}]]},
{title:'El depósito bajo llave',when:'search',story:'Una puerta de acero oculta suministros. Forzarla dejaría un acceso desprotegido.',choices:[['Forzar la puerta','+3 comida, +1 zombi en la localidad.',(g,env)=>{g.food+=3;addZombie(crossActor(g).loc,env);}],['Asegurar el edificio','+1 barricada donde estás, si hay espacio.',g=>{const z=g.zones[crossActor(g).loc];if(z.z+z.b<zcap[crossActor(g).loc])z.b++;}]]}
,{title:'La señal del mando',when:'round',require:(p,g)=>!!p&&p.loc===0&&p.influence>=55,story:'El líder reúne a los habitantes bajo una lona improvisada. Su autoridad puede unirlos, pero todos esperan una respuesta.',choices:[['Organizar una guardia','Colocá una barricada en la colonia y ganá una moral si hay un acceso libre.',g=>{if(openAccess(0,g)){g.zones[0].b++;g.morale++;}}],['Racionar las provisiones','Obtené dos comidas para afrontar el frío.',g=>{g.food+=2;}]]}
,{title:'El aviso del centinela',when:'attack',require:(p)=>!!p&&p.influence>=65,story:'Un superviviente respetado ve una emboscada desde el segundo piso. Su aviso llega justo a tiempo.',choices:[['Reagrupar a los defensores','Retirá un zombi de esta localidad si lo hay.',g=>{const z=g.zones[crossActor(g).loc];z.z=Math.max(0,z.z-1);}],['Asegurar la salida','Añadí una barricada aquí si hay lugar.',g=>{const l=crossActor(g).loc;if(openAccess(l,g))g.zones[l].b++;}]]}
,{title:'Una petición al líder',when:'move',require:(p)=>!!p&&isLeader(p),story:'En el trayecto, dos refugiados reconocen al líder del grupo y le piden que decida si regresar con ellos a la colonia.',choices:[['Escoltarlos','Se incorporan dos indefensos si hay lugar. +1 moral.',g=>{g.helpless+=2;g.morale++;},g=>colonyRoom(g,2)],['Indicar una ruta segura','Recibís una comida y una medicina.',g=>{ownerHand(g).push('comida','medicina');}]]}
,{title:'El rescate de la plaza',when:'search',require:(p)=>!!p&&p.influence>=60,story:'Un grupo de vecinos pide ayuda. Te reconocen como alguien capaz de mantenerlos unidos y quieren seguirte.',choices:[['Llevar a uno hasta la colonia','Reclutás un superviviente si hay sitio.',(g,env)=>{recruit(g.crossOwner,false,env);},g=>accessible(0,g)&&roster.some(r=>!all(g).some(p=>p.name===r.name))],['Organizar una caravana de suministros','Incorporá dos comidas a la reserva.',g=>{g.food+=2;}]]}
,{title:'Un juramento bajo la nieve',when:'round',require:(p,g)=>!!p&&p.loc===0&&g.morale<=6,story:'La moral está bajando y los refugiados miran al líder buscando una razón para seguir luchando.',choices:[['Hablar ante la colonia','Recuperá una moral.',g=>{g.morale++;}],['Preparar defensas','Agregá dos barricadas, si hay lugar.',g=>{for(let i=0;i<2&&openAccess(0,g);i++)g.zones[0].b++;}]]}
,{title:'La ruta de los veteranos',when:'search',require:(p)=>!!p&&!isLeader(p)&&p.influence<=55,story:'Un explorador poco conocido descubre un camino discreto hacia un viejo depósito. Nadie le cree todavía.',choices:[['Confiar en su hallazgo','Obtené un combustible, pero acumulá un ruido en esta localidad.',g=>{ownerHand(g).push('combustible');g.zones[crossActor(g).loc].noise=Math.min(4,g.zones[crossActor(g).loc].noise+1);} ],['Evitar riesgos','Ganás una herramienta.',g=>{ownerHand(g).push('herramienta');}]]}

,{title:'Un almacén bajo el hielo',when:'search',require:(p,g)=>!!p&&p.loc===4,story:'Un bidón todavía tibio aparece junto a una moto cubierta por la nieve. Alguien acaba de irse.',choices:[['Recoger el combustible','Tu grupo obtiene un bidón de combustible, pero atraés un zombi.',(g,env)=>{ownerHand(g).push(catalog.create('gascan'));addZombie(4,env);}],['Buscar señales de vida','Encontrás notas de laboratorio.',g=>{ownerHand(g).push(catalog.create('notes'));}]]}
,{title:'La caja de municiones',when:'attack',require:(p)=>!!p&&p.loc===3,story:'Un depósito olvidado abre nuevas opciones para defenderse. Una escopeta espera entre los escombros.',choices:[['Tomar el arma','Obtenés una escopeta y 1 ruido en la comisaría.',g=>{ownerHand(g).push(catalog.create('shotgun'));g.zones[3].noise=Math.min(4,g.zones[3].noise+1);}],['Cerrar la armería','Construís una barricada si queda espacio.',g=>{if(openAccess(3,g))g.zones[3].b++;}]]}
,{title:'Páginas de otro mundo',when:'search',require:(p)=>!!p&&p.loc===6,story:'En una biblioteca abandonada hay instrucciones para fabricar defensas, pero el papel sirve también para calentar el refugio.',choices:[['Guardar el manual','Obtenés un manual de fortificación.',g=>{ownerHand(g).push(catalog.create('manual'));}],['Usar el papel como abrigo','Quitás 2 residuos de la colonia.',g=>{g.waste=Math.max(0,g.waste-2);}]]}
,{title:'El último botiquín',when:'search',require:(p)=>!!p&&p.loc===2,story:'Hay un botiquín intacto en un armario, y una familia enferma en la sala contigua.',choices:[['Conservar el botiquín','Obtenés un botiquín completo.',g=>{ownerHand(g).push(catalog.create('medkit'));}],['Atender a la familia','La moral aumenta 1, pero se incorporan 2 indefensos.',g=>{g.morale++;g.helpless+=2;}]]}

];
function select(i){const group=controls.group();if(!playable()||!group[i]||group[i].dead)return;if(selected===i){profileId=group[i].id;show('profile');return;}selected=i;selectionBySide[controls.side]=i;target=person().loc;paint();}
function profile(id){profileId=id;show('profile');}
function destination(i){target=i;paint();}
function messageAndPaint(t){message('⚠ '+t);paint();}
let pendingLeader=false,pendingLeaderSide='human',pendingLeaderSides=[],leaderWaiters=[],pendingRecruitInfo=null;
function syncLeaderRequests(){
 pendingLeader=pendingLeaderSides.length>0;
 pendingLeaderSide=game?.mode==='local'&&pendingLeaderSides.includes(controls.side)?controls.side:pendingLeaderSides[0]||'human';
}
function requestLeader(side){
 if(pendingLeaderSides.includes(side))return;
 pendingLeaderSides.push(side);syncLeaderRequests();
 message('♛ El líder del '+controls.display(side)+' murió: elegí a su sucesor.');
}
function clearLeaderRequest(side){
 pendingLeaderSides=pendingLeaderSides.filter(s=>s!==side);syncLeaderRequests();
 if(!pendingLeader)leaderWaiters.splice(0).forEach(done=>done());
}
function resetLeaderRequests(){
 pendingLeaderSides=[];syncLeaderRequests();leaderWaiters.splice(0).forEach(done=>done());
}
function leaderChoiceReady(){
 syncLeaderRequests();
 return !!game&&!game.ended&&pendingLeader&&!passScreenActive&&(game.mode!=='local'||pendingLeaderSide===controls.side);
}
function chooseLeader(id){
 if(pendingBite||deathWaiting())return;
 const succession=leaderChoiceReady(),side=succession?pendingLeaderSide:controls.side;
 const group=ownerGroup(side).filter(p=>!p.dead),p=group.find(x=>x.id===id);
 if(!p||(!succession&&!canPickStartingLeader()))return;
 game.leaders[side]=p.id;
 if(side==='human')game.leaderChosen=true;
 else game.localLeaderChosen=true;
 if(succession)clearLeaderRequest(side);
 message('♛ '+p.name+' asume el liderazgo del '+controls.display(side)+' (influencia '+p.influence+').');
 opened='';view.closeBackdrop();
 paint();
}
function reviewLeader(side,env=null){
 const g=env?env.game:game;
 const group=ownerGroup(side,g).filter(p=>!p.dead);
 if(!group.length||groupLeader(side,g)){if(!env&&groupLeader(side,g))clearLeaderRequest(side);return;}
 if(env&&(side==='human'||g.mode==='local')&&group.length>1)return;
 if((side==='ai'&&g.mode!=='local')||group.length===1){
  const next=group.slice().sort((a,b)=>b.influence-a.influence)[0];g.leaders[side]=next.id;
  if(!env)clearLeaderRequest(side);
  if(side==='human')g.leaderChosen=true;else if(g.mode==='local')g.localLeaderChosen=true;
  ruleMessage(env,'♛ '+next.name+' es el nuevo líder de '+(side==='ai'?'la IA':'tu grupo')+' (influencia '+next.influence+').');
 }else if(!env)requestLeader(side);
}
function waitForLeader(){return pendingLeader?new Promise(resolve=>leaderWaiters.push(resolve)):Promise.resolve();}
function dismissRecruit(){pendingRecruitInfo=null;opened='';view.closeBackdrop();paint();}
function processRescueQueue(){
 if(!game?.rescueQueue?.length||!accessible(0)||game.ended)return;
 const entry=game.rescueQueue.shift();
 if(recruit(entry.side)){const p=ownerGroup(entry.side).at(-1);if(entry.side==='human'||game.mode==='local')pendingRecruitInfo={side:entry.side,name:p.name,job:p.job,skill:p.skillDesc,queued:false};message('🏠 Se abrió una plaza: llegó un superviviente que esperaba refugio.');}
 else game.rescueQueue.unshift(entry);
}
function confirmStartingLeader(){
 if(controls.side==='human')game.leaderChosen=true;
 else if(game.mode==='local')game.localLeaderChosen=true;
}
let pendingBite=null,pendingAttract=null,pendingTransfer=null,biteWaiters=[],aiCrossChoice=null,aiCrossWaiters=[];
em.superviviente='👥';
const mix=a=>{for(let i=a.length-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const addWaste=(n=1)=>{game.waste+=n;};
function addCharacter(p){const r=roster.find(x=>x.name===p.name);if(r)Object.assign(p,{job:r.job,skill:r.skill,skillName:r.skillName,skillDesc:r.skillDesc,attack:r.attack,search:r.search,influence:r.influence});p.skillUsed=false;p.bonusUsed=false;p.equipment=p.equipment||[];p.moved=!!p.moved;return p;}
function recruit(side,emergency=false,env=null){
 const g=env?env.game:game;
 const available=roster.filter(r=>!all(g).some(p=>p.name===r.name));
 if(!available.length){ruleMessage(env,'⚠ El mazo de supervivientes está agotado.');return false;}
 let loc=0;if(!accessible(0,g)){if(!emergency){ruleMessage(env,'⚠ La colonia está llena: no se puede reclutar.');return false;}loc=places.findIndex((_,i)=>accessible(i,g));}
 if(loc<0){ruleMessage(env,'⚠ Ninguna localidad tiene espacio para recibir al superviviente.');return false;}
 const r=available[env?env.random(available.length):random(available.length)],group=side==='ai'?g.bots:g.humans;
 const p=addCharacter({id:(side==='ai'?'a':'h')+g.nextId++,name:r.name,loc,wounds:0,frost:0,dead:false,moved:false});group.push(p);
 ruleMessage(env,'👥 '+(side==='ai'?'La IA incorporó':'Incorporaste a')+' '+p.name+' ('+p.job+')'+(emergency?' como reemplazo.':'.'));
 if(!groupLeader(side,g))reviewLeader(side,env);
 if(!env&&side===controls.side&&(selected>=controls.group().length||!person()||person().dead)){selected=controls.group().indexOf(p);selectionBySide[side]=selected;target=p.loc;}
 return true;
}
function replaceLastSurvivors(env=null){
 const g=env?env.game:game;
 if(!g||g.ended||g.biteResolving||g.morale<=0)return;
 for(const [side,group] of [['human',g.humans],['ai',g.bots]]){
  if(group.some(p=>!p.dead))continue;
  const hand=side==='human'?g.items:g.botItems;
  const discarded=hand.length;hand.splice(0,hand.length); // La mano se descarta, no se añade a basura.
  ruleMessage(env,'⚠ '+(side==='human'?'Perdiste':'La IA perdió')+' su último superviviente. Se descartaron '+discarded+' cartas de su mano.');
  if(!recruit(side,true,env))g.noReplacement=true;
 }
}
let ItemEngine=createItemEngine(c);
const itemEngine=new ItemEngine();
function create(){
 view.resetToasts();deathDirector.reset();skipAI=false;aiRunning=false;selected=0;target=0;picked=0;opened='';profileId='';pendingHeal=null;pendingLoot=null;pendingBite=null;pendingAttract=null;pendingTransfer=null;aiCrossChoice=null;settleDecisionWaiters();resetLeaderRequests();pendingRecruitInfo=null;selectionBySide.human=0;selectionBySide.ai=0;closeStatInfo();
 const objective=objectives[random(objectives.length)];
 game=stateFactory({gameMode,objective,places,catalog});
 all().forEach(addCharacter);
 for(let loc=1;loc<places.length;loc++)game.decks[loc]=catalog.deck(loc);
 message('Objetivo: '+objective.name+' · '+objective.description);newRound();
}
let DeathDirector=createDeathDirector(c);
const deathDirector=new DeathDirector();
function kill(p,reason,env=null){
 const g=env?env.game:game;
 if(!p||p.dead)return;
 p.dead=true;if(env)env.deaths++;g.morale=Math.max(0,g.morale-1);
 if(!env&&ownerOf(p)===controls.side&&person()===p){const next=controls.group().findIndex(x=>!x.dead);if(next>=0){selected=next;selectionBySide[controls.side]=next;target=controls.group()[next].loc;}}
 const equipment=[...equipmentOf(p)];p.equipment=[];
 if(equipment.length){if(p.loc===0){(ownerOf(p)==='human'?g.items:g.botItems).push(...equipment);ruleMessage(env,'🎒 Los objetos de '+p.name+' regresan a la mano.');}
 else {const deck=[...(g.decks[p.loc]||[]),...equipment];g.decks[p.loc]=env?deck:mix(deck);ruleMessage(env,'🎒 El equipamiento de '+p.name+' se mezcló con el mazo de '+places[p.loc]+'.');}}
 ruleMessage(env,'☠ '+p.name+' murió por '+reason+'. Moral -1.');if(!env)deathDirector.record(p,reason);
 if(g.leaders[ownerOf(p)]===p.id)g.leaders[ownerOf(p)]=null;
 replaceLastSurvivors(env);reviewLeader(ownerOf(p),env);
}
function ruleMessage(env,text){if(!env)message(text);}
function verify(env=null){
 const g=env?env.game:game;
 if(g.ended)return;
 replaceLastSurvivors(env);
 const result=gameOutcome(g);
 if(result){
  g.ended=true;g.turn='end';
  ruleMessage(env,result==='morale'?'☠ Derrota: la moral llegó a cero.':result==='survivors'?'☠ Derrota: no hay supervivientes disponibles para continuar.':'🏆 ¡Victoria! Se completó el objetivo general.');
  if(!env)cancelPendingDecisions();
 }
}
function biteNext(){
 if(!pendingBite)return;
 while(pendingBite.victims.length){
  const id=pendingBite.victims.shift(),t=all().find(p=>p.id===id);
  if(!t||t.dead)continue;
  pendingBite.target=id;
  if(game.mode==='local'||ownerOf(t)==='human'){message('☣ La mordedura amenaza a '+t.name+'. Elegí sacrificarlo o arriesgar la tirada.');show('biteChoice');return;}
  // La última víctima jamás se sacrifica: tiene probabilidad de salvarse sin poner a nadie más en riesgo.
  const remaining=pendingBite.victims.map(id=>all().find(x=>x.id===id)).filter(Boolean);
  const highValueNext=remaining.some(x=>x.influence>=t.influence+5);
  const risk=remaining.length===0||!highValueNext;
  if(!risk){kill(t,'sacrificio estratégico para detener la mordedura');message('🤖 La IA sacrificó a '+t.name+' para proteger a otro superviviente de alta influencia.');break;}
  const d=die();message('🤖 ☣ '+t.name+' arriesga la exposición: '+d+(d>=4?' · ¡sobrevivió!':' · murió; el contagio continúa.'));
  if(d>=4){pendingBite.victims=[];break;}
  kill(t,'propagación de mordedura');
 }
 pendingBite=null;game.biteResolving=false;replaceLastSurvivors();reviewLeader('human');reviewLeader('ai');verify();paint();deathDirector.open();biteWaiters.splice(0).forEach(done=>done());
}
function settleDecisionWaiters(){biteWaiters.splice(0).forEach(done=>done());aiCrossWaiters.splice(0).forEach(done=>done());}
function cancelPendingDecisions(){
 pendingBite=null;pendingHeal=null;pendingLoot=null;pendingAttract=null;pendingTransfer=null;aiCrossChoice=null;
 game.crossPending=false;game.biteResolving=false;
 resetLeaderRequests();settleDecisionWaiters();
 opened='';view.closeBackdrop();syncHandoverAccessibility();
}
const waitForBite=()=>pendingBite?new Promise(resolve=>biteWaiters.push(resolve)):Promise.resolve();
function chooseBite(option){
 if(!pendingBite||game.ended)return;
 const p=all().find(x=>x.id===pendingBite.target);if(!p||p.dead)return;
 if(option==='sacrifice'){kill(p,'sacrificio para detener la mordedura');pendingBite.victims=[];}
 else if(option==='risk'){
  const d=die();message('☣ '+p.name+' se arriesga: dado '+d+(d>=4?' — blanco, se salva.':' — la infección avanza.'));
  if(d<4)kill(p,'propagación de mordedura');else pendingBite.victims=[];
 }
 else return;
 opened='';view.closeBackdrop();biteNext();
}
function expose(p,reason){
 if(!p||p.dead)return;
 const d=die();message('🎲 Exposición de '+p.name+' ('+reason+'): '+(d===1?'MORDEDURA':d===2?'CONGELACIÓN':d===3?'HERIDA':'BLANCO')+'.');
 if(d<4&&p.skill==='resilient'&&!p.skillUsed){p.skillUsed=true;message('★ '+p.name+' evitó la exposición gracias a su habilidad.');return;}
 if(d===1){
  const coLocated=alive().filter(x=>x.id!==p.id&&x.loc===p.loc).sort((a,b)=>a.influence-b.influence).map(x=>x.id);
  game.biteResolving=true;pendingBite={victims:coLocated,target:null};kill(p,'mordedura');biteNext();
 }else if(d===2||d===3){if(d===2)p.frost++;else p.wounds++;message((d===2?'❄ Congelación de ':'♥ Herida de ')+p.name+'.');if(p.frost+p.wounds>=3)kill(p,'tres daños acumulados');}
}
function drawItem(loc){return game.decks[loc]&&game.decks[loc].length?game.decks[loc].shift():null;}
function stashLoot(it,p,side){
 if(kind(it)==='superviviente'){
  if(accessible(0)&&recruit(side)){
   const recruited=ownerGroup(side).at(-1);
   if(side==='human'||game.mode==='local')pendingRecruitInfo={side,name:recruited.name,job:recruited.job,skill:recruited.skillDesc,queued:false};
   message('🏠 '+recruited.name+' llegó directamente a la colonia tras el rescate.');
  }else{
   game.rescueQueue.push({side,origin:p.loc});
   if(side==='human'||game.mode==='local')pendingRecruitInfo={side,name:'Rescate pendiente',job:'Colonia completa',skill:'Esta persona llegará cuando quede un espacio libre en la colonia.',queued:true};
   message('👥 La colonia está llena. Un superviviente espera una plaza (rescate pendiente).');
  }
  return;
 }
 if(side==='human'||game.mode==='local'){
  controls.hand(side).push(kind(it)==='muestra'?{...catalog.create('sample'),finderId:p.id}:it);
 }else if(kind(it)==='muestra'){gainSample(p);}else if(['arma','herramienta'].includes(kind(it))){
  if(!equipmentOf(p).some(eq=>kind(eq)===kind(it))){p.equipment.push(it);message('🤖 '+p.name+' equipó '+itemTitle(it)+'.');}else game.botItems.push(it);
 }else game.botItems.push(it);
}
function beginSearch(p,side){
 const first=drawItem(p.loc);if(!first){message('⌕ El mazo de '+places[p.loc]+' se agotó.');return;}
 const cards=[first]; if(p.skill==='scout'){const next=drawItem(p.loc);if(next)cards.push(next);}if(itemEngine.useFlashlight(p)){const extra=drawItem(p.loc);if(extra){cards.push(extra);message('🔦 '+p.name+' reveló otra carta sin generar ruido.');}}
 if(side==='human'||game.mode==='local'){
  pendingLoot={items:cards,actorId:p.id,loc:p.loc};message('⌕ '+p.name+' encontró '+cards.map(itemTitle).join(' y ')+'.');show('lootChoice');
 }else{
  // C7-R1: priorizar una herramienta revelada solo cuando ella completa
  // la crisis con los recursos que ya posee la IA y aportó el humano.
  // Una muestra que completa la victoria inmediata conserva prioridad superior.
  const needed=game.crisis?.type==='herramienta'
   ?game.crisis.need-game.crisis.contributions.filter(type=>type==='herramienta').length:0;
  const held=game.botItems.filter(it=>kind(it)==='herramienta').length+
   game.bots.filter(bot=>!bot.dead).reduce((n,bot)=>n+equipmentOf(bot).filter(it=>kind(it)==='herramienta').length,0);
  const toolCompletes=needed>0&&held+1===needed;
  const sampleWins=it=>kind(it)==='muestra'&&game.samples+
   (p.skill==='researcher'&&!p.bonusUsed?2:1)>=game.goal;
  const score=it=>sampleWins(it)?12:kind(it)==='herramienta'&&toolCompletes?11:
   ({muestra:10,superviviente:accessible(0)?9:0,comida:game.food<4?8:4,medicina:4,arma:3,herramienta:3,combustible:2,educacion:5}[kind(it)]||0);
  const chosen=cards.slice().sort((a,b)=>score(b)-score(a))[0];game.decks[p.loc].push(...cards.filter(x=>x!==chosen));
  stashLoot(chosen,p,side);message('⌕ IA '+p.name+' encontró '+itemTitle(chosen)+'.');
 }
}
function addNoiseSearch(){
 if(!pendingLoot||game.ended||!canResolve('lootChoice'))return;
 const loc=pendingLoot.loc,z=game.zones[loc];if(z.noise>=4||!game.decks[loc].length)return;
 z.noise++;const newCard=drawItem(loc);pendingLoot.items.push(newCard);message('🔊 Ruido en '+places[loc]+': se reveló '+itemTitle(newCard)+'.');paint();
}
function chooseLoot(i){
 if(!pendingLoot||game.ended||!canResolve('lootChoice')||!Number.isInteger(i)||i<0||i>=pendingLoot.items.length)return;
 const {items,actorId,loc}=pendingLoot,p=all().find(x=>x.id===actorId);pendingLoot=null;
 if(!p||p.dead)return;
 const chosen=items[i];game.decks[loc].push(...items.filter((_,j)=>j!==i));stashLoot(chosen,p,controls.side);
 message('⌕ '+p.name+' eligió '+itemTitle(chosen)+'; las demás cartas regresaron al fondo del mazo.');
 opened='';view.closeBackdrop();crossAction('search',p);verify();paint();if(pendingRecruitInfo&&!game.crossPending)show('recruitSuccess');
}
function consume(min){
 if(game.ended||!playable()||pendingLoot||pendingBite||leaderChoiceReady()||game.crossPending)return null;
 if(!actionDice().length)return messageAndPaint('No quedan dados de acción.'),null;
 const dice=actionDice(),i=Math.max(0,Math.min(picked,dice.length-1)),value=dice[i];
 if(value<min)return messageAndPaint('Necesitás un dado de '+min+' o más (seleccionado: '+value+').'),null;
 dice.splice(i,1);picked=Math.min(i,dice.length-1);confirmStartingLeader();message('🎲 Dado utilizado: '+value+' (mínimo '+min+').');return value;
}
function boostDie(){
 if(game.ended||!playable()||!actionDice().length||game.food<1)return messageAndPaint('Necesitás comida de la reserva y un dado disponible.');
 const i=Math.max(0,Math.min(picked,actionDice().length-1));if(actionDice()[i]>=6)return messageAndPaint('El dado ya tiene valor 6.');
 game.food--;actionDice()[i]++;message('🥫 Gastaste una comida para mejorar el dado a '+actionDice()[i]+'.');paint();
}
function pickFloatingDie(i){if(!playable()||game.ended)return;picked=i;paint();}
function search(noise=false){
 if(!playable()||game.ended||pendingLoot||pendingBite||leaderChoiceReady())return;
 const p=person();if(!p||p.dead||p.loc===0)return messageAndPaint('Elegí un superviviente vivo que esté fuera de la colonia.');
 if(!game.decks[p.loc].length)return messageAndPaint('No quedan cartas en esta localidad.');
 if(consume(effectiveSearch(p))===null)return;
 beginSearch(p,controls.side);paint();
}
function attack(){
 if(!playable()||game.ended||pendingBite||leaderChoiceReady())return;
 const p=person();if(!p||p.dead||!game.zones[p.loc].z)return messageAndPaint('No hay zombis que atacar con este superviviente.');
 if(consume(effectiveAttack(p))===null)return;
 itemEngine.attack(p,controls.side);
 if(!pendingBite)crossAction('attack',p);verify();paint();
}
function doMove(){
 if(!playable()||game.ended||pendingBite||leaderChoiceReady())return;
 const p=person();if(!p||p.dead)return;
 if(p.moved)return messageAndPaint('El superviviente ya se movió durante este turno.');
 if(p.loc===target)return messageAndPaint('Elegí otro destino.');
 if(!accessible(target))return messageAndPaint('No hay espacios disponibles en el destino.');
 confirmStartingLeader();p.loc=target;p.moved=true;message('→ '+p.name+' se movió a '+places[target]+'.');
 if(p.skill==='silent'&&!p.skillUsed){p.skillUsed=true;message('★ '+p.name+' evitó la exposición.');}else expose(p,'movimiento');
 if(!pendingBite)crossAction('move',p);verify();paint();
}
function barricade(){
 if(!playable()||game.ended)return;
 const p=person();if(!p||p.dead||!openAccess(p.loc))return messageAndPaint('No hay acceso libre para colocar una barricada.');
 if(consume(1)===null)return;
 let n=0;const max=(p.skill==='guard'?2:1)+(itemEngine.has(p,'repairkit')?1:0);for(let i=0;i<max&&openAccess(p.loc);i++){game.zones[p.loc].b++;n++;}
 message('▥ '+p.name+' construyó '+n+' barricada(s).');crossAction('barricade',p);paint();
}
function clean(){
 if(!playable()||game.ended)return;
 const p=person();if(!p||p.dead||p.loc!==0||!game.waste)return messageAndPaint('Se necesita un superviviente en la colonia y residuos para limpiar.');
 if(consume(1)===null)return;
 const n=Math.min(3,game.waste);game.waste-=n;message('♻ '+p.name+' retiró '+n+' cartas del montón de residuos.');paint();
}
function attract(){
 if(!playable()||game.ended)return;
 const p=person();if(!p||p.dead||!openAccess(p.loc))return messageAndPaint('La localidad necesita accesos libres.');
 const sources=places.map((_,i)=>i).filter(i=>i!==p.loc&&game.zones[i].z>0);
 if(!sources.length)return messageAndPaint('No hay zombis en otras localidades para atraer.');
 if(consume(1)===null)return;
 pendingAttract={loc:p.loc,left:2};show('attractTarget');
}
function chooseAttract(src){
 if(!pendingAttract||!canResolve('attractTarget'))return;
 const dst=pendingAttract.loc;
 if(!Number.isInteger(src)||src===dst||!game.zones[src].z||!openAccess(dst))return;
 game.zones[src].z--;game.zones[dst].z++;pendingAttract.left--;
 message('🔊 Atraíste 1 zombi de '+places[src]+' a '+places[dst]+'.');
 if(!pendingAttract.left||!openAccess(dst)||!game.zones.some((z,i)=>i!==dst&&z.z)){pendingAttract=null;hide();}
 paint();
}
let CrisisManager=createCrisisManager(c);
function contribute(i){
 if(game.ended||!playable()||game.crossPending||pendingBite||pendingLoot||deathDirector.active)return;
 CrisisManager.fromHand(i);
}
function contributeEquipment(id,i){
 if(game.ended||!playable()||game.crossPending||pendingBite||pendingLoot||deathDirector.active)return;
 CrisisManager.fromEquipment(id,i);
}
function playItem(i){
 if(game.ended||!playable()||game.crossPending||pendingBite||pendingLoot||leaderChoiceReady()||deathDirector.active)return;
 if(itemEngine.use(i,person(),controls.side)){confirmStartingLeader();verify();paint();}
 else paint();
}
function equipItem(i){
 const p=all().find(x=>x.id===profileId);if(!p||p.dead||ownerOf(p)!==controls.side||!playable())return;
 if(itemEngine.use(i,p,controls.side))paint();else paint();
}
function unequipItem(i){messageAndPaint('Los objetos equipados solo pueden transferirse a otro superviviente de la misma localidad.');}
function startTransfer(i){
 const p=all().find(x=>x.id===profileId);if(!p||p.dead||ownerOf(p)!==controls.side||!playable()||!p.equipment[i])return;
 const it=p.equipment[i],targets=alive().filter(x=>canReceiveTransfer(p,x,it));
 if(!targets.length)return messageAndPaint(game.mode==='local'
  ?'No hay supervivientes disponibles en esta localidad que puedan recibir el objeto.'
  :'No hay un superviviente de tu grupo en esta localidad que pueda recibir el objeto.');
 pendingTransfer={fromId:p.id,itemIndex:i,itemRef:it,targets:targets.map(x=>x.id)};show('transferTarget');
}
function chooseTransfer(id){
 const transfer=pendingTransfer;
 if(!transfer||!transfer.targets.includes(id)||!canResolve('transferTarget'))return;
 const p=all().find(x=>x.id===transfer.fromId),t=all().find(x=>x.id===id);
 const it=p?.equipment?.[transfer.itemIndex];
 // Revalidar al confirmar: el turno, el mismo objeto y la elegibilidad del receptor
 // pueden cambiar mientras el diálogo está abierto o por invocación directa.
 if(!p||p.dead||ownerOf(p)!==controls.side||it!==transfer.itemRef||!canReceiveTransfer(p,t,it))return;
 p.equipment.splice(transfer.itemIndex,1);
 t.equipment.push(it);pendingTransfer=null;message('🎒 '+p.name+' entregó '+itemTitle(it)+' a '+t.name+'.');hide();paint();
}
function gainSample(p){const bonus=p&&p.skill==='researcher'&&!p.bonusUsed?2:1;game.samples+=bonus;if(bonus===2){p.bonusUsed=true;message('◈ '+p.name+' duplicó la muestra mediante investigación.');}}
function crossDraw(side='human'){
 if(!game.crossRemaining.length)game.crossRemaining=mix(crossroadsDeck.map((_,i)=>i));
 game.crossCard=game.crossRemaining.pop();game.crossOwner=side;game.crossActorId=null;game.crossResolved=false;game.crossPending=false;
}
function resolveCross(i){
 const card=crossroadsDeck[game.crossCard],choice=card.choices[i];
 if(!choice||!crossOptionAllowed(card,i,game.crossOwner))return false;
 game.crossPending=false;game.crossResolved=true;
 choice[2](game);message('✧ '+card.title+': '+choice[0]+'. '+choice[1]);verify();return true;
}
function crossTrigger(kind,actor){
 if(!game||game.ended||game.crossResolved||game.crossPending||game.biteResolving)return;
 const card=crossroadsDeck[game.crossCard];if(!card||game.crossOwner!==game.turn||card.when!==kind)return;
 if(card.require&&!card.require(actor||groupLeader(game.crossOwner),game))return;
 if(actor)game.crossActorId=actor.id;
 const possible=card.choices.map((_,i)=>i).filter(i=>crossOptionAllowed(card,i,game.crossOwner));if(!possible.length)return;
 game.crossPending=true;message('✧ ENCRUCIJADA: '+card.title+'.');
 if(game.turn==='ai'&&game.mode!=='local'){
  // Mostrar siempre la historia y la decisión de la IA antes de continuar el turno.
  aiCrossChoice=chooseCrossOption(card,game.crossOwner);
 }
 show('crossroads');
}
function crossAction(kind,actor){crossTrigger(kind,actor);return !!game.crossPending;}
function crossChoose(i){if(!game.crossPending||!canResolve('crossroads')||game.crossOwner!==controls.side||!resolveCross(i))return;opened='';view.closeBackdrop();paint();if(pendingRecruitInfo)show('recruitSuccess');}
function crossAiContinue(){
 if(game.ended||passScreenActive||deathWaiting()||decisionKind()!=='crossroads'||game.crossOwner!=='ai'||aiCrossChoice===null)return;
 if(!resolveCross(aiCrossChoice))return;
 aiCrossChoice=null;opened='';view.closeBackdrop();paint();
 aiCrossWaiters.splice(0).forEach(done=>done());
}
const waitForAiCross=()=>game.crossPending&&game.crossOwner==='ai'?new Promise(resolve=>aiCrossWaiters.push(resolve)):Promise.resolve();
function addZombie(i,env=null){
 const g=env?env.game:game;
 const z=g.zones[i];if(openAccess(i,g)){z.z++;return;}
 if(z.b>0){z.b--;ruleMessage(env,'▥ Una barricada bloqueó un zombi en '+places[i]+'.');return;}
 const victims=alive(g).filter(p=>p.loc===i).sort((a,b)=>a.influence-b.influence);
 if(victims.length){kill(victims[0],'desbordamiento en '+places[i],env);}
 else if(i===0&&g.helpless>0){g.helpless--;if(env)env.deaths++;g.morale=Math.max(0,g.morale-1);ruleMessage(env,'☠ Murió un superviviente indefenso durante el desbordamiento.');}
 else ruleMessage(env,'☠ '+places[i]+' sufrió un desbordamiento sin habitantes; no se pierde moral.');
}
function resolveCrisis(){
 const c=game.crisis;const points=c.contributions.filter(it=>it===c.type).length;
 if(points>=c.need){message('✓ Crisis superada: '+points+' aportes válidos de '+c.need+'.');if(points>=c.need+2){game.morale++;message('✓ Aporte excepcional: +1 moral.');}}
 else{
  message('⚠ Crisis fallida ('+points+'/'+c.need+').');
  if(c.fail==='food'){game.food=Math.max(0,game.food-2);message('🥫 La crisis consumió hasta 2 comidas.');}
  else if(c.fail==='zombie'){addZombie(0);addZombie(0);message('☠ La crisis atrajo dos zombis a la colonia.');}
  else if(c.fail==='wound'){const t=alive().filter(p=>p.loc===0).sort((a,b)=>a.influence-b.influence)[0];if(t){t.wounds++;message('♥ '+t.name+' sufrió una herida durante la crisis.');if(t.wounds+t.frost>=3)kill(t,'heridas de la crisis');}else{game.morale=Math.max(0,game.morale-1);}}
  else{game.morale=Math.max(0,game.morale-1);message('⚠ Crisis: -1 moral.');}
 }
 c.contributions=[];c.given=0;
}
function colony(){
 if(game.ended)return;
 message('⌂ Fase de colonia: alimentación → residuos → crisis → zombis.');
 const need=feedingNeed(game);
 if(game.food>=need){game.food-=need;message('🥫 Alimentación: '+need+' comida(s), quedan '+game.food+'.');}
 else{game.hunger++;game.morale=Math.max(0,game.morale-game.hunger);message('⚠ HAMBRE acumulada: '+game.hunger+' ficha(s), -'+game.hunger+' moral. La comida existente permanece.');}
 verify();if(game.ended)return;
 if(game.waste>=10){const loss=Math.floor(game.waste/10);game.morale=Math.max(0,game.morale-loss);message('♻ Basura: '+game.waste+' cartas, -'+loss+' moral.');}
 verify();if(game.ended)return;
 resolveCrisis();
 verify();if(game.ended)return;
 const inhabitants=alive().filter(p=>p.loc===0).length+game.helpless;
 for(let i=0;i<places.length;i++){
  const arriving=i===0?Math.ceil(inhabitants/2):alive().filter(p=>p.loc===i).length;
  for(let j=0;j<arriving;j++){addZombie(i);verify();if(game.ended)return;}
 }
 for(const [i,z] of game.zones.entries()){
  const n=z.noise;z.noise=0;
  for(let j=0;j<n;j++){const d=die();message('🔊 '+places[i]+': ruido '+(j+1)+'/'+n+' → dado '+d+(d<=3?', llega un zombi.':', sin aparición.'));if(d<=3)addZombie(i);verify();if(game.ended)return;}
 }
 verify();
}
function showSetup(){
 if(aiRunning)return;
 hide();view.showSetup();passScreenActive=true;
 toggleFab(false);syncHandoverAccessibility();
}
function startGame(mode){
 if(mode==='ai'&&!hasAutomation)throw Error('Falta un automatismo para el modo IA');
 if(mode!=='ai'&&mode!=='local')return;
 gameMode=mode;
 view.hideHandover();
 passScreenActive=false;
 create();paint();syncHandoverAccessibility();returnFocusAfterHandover();
}
function showPass(side){
 if(game.mode!=='local'||game.ended)return;
 view.showPass(side);passScreenActive=true;
 toggleFab(false);syncHandoverAccessibility();
}
function confirmPass(){
 view.hidePass();
 passScreenActive=false;
 syncHandoverAccessibility();paint();
 if(game.crossPending)show('crossroads');
 else if(leaderChoiceReady())show('leaderChoice');
 returnFocusAfterHandover();
}
function show(type){
 if(type==='actions'&&!playable())return;
 type=decisionKind()||type;
 view.prepareModal();
 opened=type;view.openBackdrop();renderModal();syncHandoverAccessibility();
}
function hide(){
 if(deathWaiting()||pendingBite||leaderChoiceReady()||pendingLoot||pendingHeal||pendingAttract||pendingTransfer||game&&game.crossPending)return;
 opened='';view.closeBackdrop();syncHandoverAccessibility();
}
function cancelAttract(){if(!canResolve('attractTarget'))return;pendingAttract=null;hide();paint();}
function cancelHeal(){if(!canResolve('healTarget'))return;pendingHeal=null;hide();paint();}
function cancelTransfer(){if(!canResolve('transferTarget'))return;pendingTransfer=null;hide();paint();}
function paint(){if(!game)return;processRescueQueue();const decision=decisionKind();if(decision&&!game.ended&&!passScreenActive&&!deathWaiting()){opened=decision;view.openBackdrop();}view.draw();}
function pickActionDie(i){picked=i;renderModal();paintDice();}
function skipAutomation(){skipAI=true;}
function deathContinue(){deathDirector.continue();}
// Comandos primitivos de compatibilidad: la política no escribe directamente en la partida.
const actor=id=>all().find(p=>p.id===id);
const automationActions=Object.freeze({
 contributeHand(i){if(!CrisisManager.add(game.botItems[i],'La IA'))return false;game.botItems.splice(i,1);return true;},
 contributeEquipment(id,j){const p=actor(id);if(!CrisisManager.add(p.equipment[j],p.name))return false;p.equipment.splice(j,1);return true;},
 treat(id,targetId){const p=actor(id),t=actor(targetId);if(p.skill==='medic')t.wounds--;else t.frost--;p.skillUsed=true;message('★ '+p.name+' atendió a '+t.name+'.');},
 buildFree(id){const p=actor(id);game.zones[p.loc].b++;p.skillUsed=true;message('★ '+p.name+' construyó una barricada sin dado.');},
 useItem(i,id){return itemEngine.use(i,actor(id),'ai');},
 moveWithFuel(id,dest,i){return itemEngine.moveWithFuel(actor(id),dest,'ai',i);},
 move(id,dest){const p=actor(id);p.loc=dest;p.moved=true;message('🤖 '+p.name+' se movió a '+places[dest]+'.');},
 exposeMove(id){const p=actor(id);if(p.skill==='silent'&&!p.skillUsed)p.skillUsed=true;else expose(p,'movimiento IA');},
 spendDie(i){return game.botDice.splice(i,1)[0];},
 search(id,d){const p=actor(id);beginSearch(p,'ai');message('🎲 IA '+p.name+' usó dado '+d+' para buscar.');crossAction('search',p);},
 attack(id,d){const p=actor(id);message('🎲 IA '+p.name+' gastó dado '+d+' al combatir.');return itemEngine.attack(p,'ai');},
 clean(d){const n=Math.min(3,game.waste);game.waste-=n;message('♻ IA limpió '+n+' residuos con dado '+d+'.');},
 barricade(id,d){const p=actor(id),n=(p.skill==='guard'?2:1)+(itemEngine.has(p,'repairkit')?1:0);for(let j=0;j<n&&openAccess(p.loc);j++)game.zones[p.loc].b++;message('▥ IA '+p.name+' colocó barricadas con dado '+d+'.');},
});
return Object.freeze({
 snapshot:()=>game===undefined?null:JSON.parse(JSON.stringify(game)),
 dispatch(name,...args){if(!commands.has(name))throw TypeError('Comando desconocido: '+name);return c[name](...args);},
 connectPresentation(factory){const result=factory(capabilities(readOnlyContext(c),viewCapabilities));effects=result;view=new Proxy(result,{get:(target,key)=>target[key]||noop});return result;},
 connectAutomation(factory){agent=factory(capabilities(new Proxy(readOnlyContext(c),{get(target,key){return key==='actions'?automationActions:Reflect.get(target,key);}}),agentCapabilities));hasAutomation=true;},
 start(mode='local'){return startGame(mode);},
 initialize(){create();view.showSetup();passScreenActive=true;paint();},
 ...(typeof __GAME_TEST__!=='undefined'&&__GAME_TEST__?{testBindings:c}:{}),
});
}
export const commandNames=Object.freeze(["pickActionDie","skipAutomation","deathContinue","startGame","confirmPass","finishTurn","show","hide","showSetup","select","profile","destination","special","chooseHeal","chooseLeader","dismissRecruit","chooseBite","chooseAttract","cancelAttract","chooseTransfer","cancelTransfer","cancelHeal","chooseLoot","addNoiseSearch","crossAiContinue","crossChoose","startTransfer","contributeEquipment","equipItem","unequipItem","boostDie","pickFloatingDie","search","attack","doMove","barricade","clean","attract","playItem","contribute"]);
const commands=new Set(commandNames);
