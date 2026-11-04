import {createApplication} from '../../src/application/create-application.mjs';
import {createUi} from '../../src/presentation/reference-view.mjs';
import {observeReferenceView} from '../state-map/reference-observer.mjs';
import {createMovementBroker} from './movement-broker.mjs';
import {projectVisibleState} from '../state-map/projection.mjs';
let broker,viewContext;
const protocol='iec-movement-map/v1',lifetime=new AbortController();let port=null,cached=null,view,connections=0,sent=0;
function disconnect(){if(port){port.onmessage=null;port.close();port=null;}}
function send(message){if(__GAME_TEST__&&globalThis.h342DropReply&&message.type==='move-result')return;if(port){port.postMessage({protocol,...message});sent++;}}
const application=createApplication({createPresentation:(context,environment)=>{
 viewContext=context;view=observeReferenceView(context,tracked=>createUi(tracked,environment),{
  onState:state=>{cached=broker.project(state);send({type:'state',state:cached});},
  onError:error=>send({type:'error',message:error.message}),
  onDispose:()=>{disconnect();lifetime.abort();}
 });return view;
}});
broker=createMovementBroker(application.engine,{presentationState:()=>projectVisibleState(viewContext,{gate:{},renderedPlayable:false,epoch:cached?.epoch||1})});
window.addEventListener('message',event=>{
 if(event.source!==window.parent||event.origin!==location.origin||event.data?.protocol!==protocol||event.data.type!=='connect'||event.ports.length!==1)return;
 disconnect();port=event.ports[0];connections++;
 port.onmessage=event=>{
  if(event.data?.protocol!==protocol)return;
  // Único comando admitido: intención de movimiento validada y deduplicada.
  if(event.data.type==='move'){const {protocol:_,...request}=event.data;send(broker.handle(request));return;}
  if(event.data.type==='snapshot'&&cached)send({type:'state',state:cached});
  if(event.data.type==='focus')view.syncHandoverAccessibility();
 };
 port.start();if(cached)send({type:'state',state:cached});
},{signal:lifetime.signal});
window.addEventListener('pagehide',event=>{disconnect();if(!event.persisted)application.dispose();},{signal:lifetime.signal});
// Se elimina por completo del host de producto. Solo el servidor QA explícito
// y de loopback permite servir este otro artefacto de validación.
if(__GAME_TEST__)globalThis.h342Test=Object.freeze({snapshot:()=>application.engine.snapshot(),moveMessage:request=>broker.handle(request),dispatch:(name,...args)=>application.engine.dispatch(name,...args),connection:()=>({connections,sent,connected:!!port}),dispose:()=>application.dispose()});
