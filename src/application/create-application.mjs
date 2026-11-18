import {createEngine,commandNames} from './reference-engine.mjs';
import {createUi} from '../presentation/reference-view.mjs';
import {createAgent} from '../agents/reference-agent.mjs';
import {bindCommands} from '../presentation/commands.mjs';
// Las reglas de prueba solo se ofrecen con ?dev en la dirección de la página.
function revealTestRules(environment){
 const panel=environment.document?.getElementById?.('testRules');
 if(!panel)return;
 const search=environment.location?.search||'';
 panel.hidden=!new URLSearchParams(search).has('dev');
}
export function createApplication({environment=globalThis,autoStart=true,createPresentation=createUi}={}){
 const engine=createEngine();
 const view=engine.connectPresentation(context=>createPresentation(context,environment));
 engine.connectAutomation(context=>createAgent(context));
 const commands=Object.fromEntries(commandNames.map(name=>[name,(...args)=>engine.dispatch(name,...args)]));
 Object.assign(commands,{
  toggleFab:()=>view.toggleFab(),menuGo:type=>view.menuGo(type),menuEndTurn:()=>view.menuEndTurn(),
  backdropHide:({element,event})=>{if(event.target===element)engine.dispatch('hide');},
  toggleEquipDescription:({element})=>view.toggleEquipDescription(element),
  destinationInput:({element})=>engine.dispatch('destination',Number(element.value)),
  newGame:()=>{if(environment.confirm('¿Comenzar una partida nueva?')){engine.dispatch('hide');engine.dispatch('showSetup');}},
  statInfo:(key,{element,event})=>view.showStatInfo(key,element,event.type==='mouseenter'?'hover':'click'),
  statInfoClose:key=>view.closeStatInfo(key),
  // El panel de desarrollo solo elige valores; las consecuencias viven en el motor.
  testRuleFood:({element})=>engine.dispatch('setTestRules',{comidaInicial:Number(element.value)}),
  testRuleFlag:(key,{element})=>engine.dispatch('setTestRules',{[key]:!!element.checked}),
 });
 let dispose;
 try{
  dispose=bindCommands(environment.document,commands);
  if(autoStart){revealTestRules(environment);engine.initialize();}
 }catch(error){dispose?.();view.dispose();throw error;}
 return {engine,dispose(){dispose();view.dispose();}};
}
