import {createApplication} from '../../src/application/create-application.mjs';
import {createUi} from '../../src/presentation/reference-view.mjs';
import {observeReferenceView} from '../state-map/reference-observer.mjs';
import {projectVisibleState} from '../state-map/projection.mjs';
import {createActionBroker} from './action-broker.mjs';
const protocol='iec-action-map/v1',lifetime=new AbortController();
let broker,context,view,raw=null,port=null,connections=0,sent=0;
function disconnect(){if(port){port.onmessage=null;port.close();port=null;}}
function send(message){
 if(__GAME_TEST__&&globalThis.h344DropReply&&['search-result','move-result','action-result'].includes(message.type))return;
 if(port){port.postMessage({protocol,...message});sent++;}
}
const application=createApplication({createPresentation:(c,environment)=>{
 context=c;view=observeReferenceView(c,tracked=>createUi(tracked,environment),{
  onState:state=>{raw=state;send({type:'state',state:broker.project(state)});},
  onError:error=>send({type:'error',message:error.message}),
  onDispose:()=>{disconnect();lifetime.abort();},
 });return view;
}});
broker=createActionBroker(application.engine,{readPublic:()=>projectVisibleState(context,{gate:{},renderedPlayable:true,epoch:raw?.epoch||1})});
const commands=new Set(['move','search','search-noise','search-choose','search-dismiss','attack','barricade','barricade-ability','action-dismiss']);
window.addEventListener('message',event=>{
 if(event.source!==window.parent||event.origin!==location.origin||event.data?.protocol!==protocol||event.data.type!=='connect'||event.ports.length!==1)return;
 disconnect();port=event.ports[0];connections++;
 port.onmessage=event=>{
  const data=event.data;if(data?.protocol!==protocol)return;
  if(commands.has(data.type)){const {protocol:_,...request}=data;send(broker.handle(request));return;}
  if(data.type==='snapshot'&&raw)send({type:'state',state:broker.snapshot()});
  if(data.type==='focus')view.syncHandoverAccessibility();
 };
 port.start();if(raw)send({type:'state',state:broker.snapshot()});
},{signal:lifetime.signal});
window.addEventListener('pagehide',event=>{disconnect();if(!event.persisted)application.dispose();},{signal:lifetime.signal});
if(__GAME_TEST__)globalThis.h344Test=Object.freeze({fixture:patch=>{Object.assign(application.engine.testBindings.game,patch);application.engine.testBindings.paint();},snapshot:()=>application.engine.snapshot(),searchState:()=>application.engine.searchSnapshot(),actionState:()=>application.engine.actionSnapshot(),searchMessage:request=>broker.handle(request),dispatch:(name,...args)=>application.engine.dispatch(name,...args),connection:()=>({connections,sent,connected:!!port}),dispose:()=>application.dispose()});
