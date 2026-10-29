import {createEngine,commandNames} from './reference-engine.mjs';
import {createUi} from '../presentation/reference-view.mjs';
import {createAgent} from '../agents/reference-agent.mjs';
import {bindCommands} from '../presentation/commands.mjs';
export function createApplication({environment=globalThis,autoStart=true}={}){
 const engine=createEngine();
 const view=engine.connectPresentation(context=>createUi(context,environment));
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
 });
 let dispose;
 try{
  dispose=bindCommands(environment.document,commands);
  if(autoStart)engine.initialize();
 }catch(error){dispose?.();view.dispose();throw error;}
 return {engine,dispose(){dispose();view.dispose();}};
}
