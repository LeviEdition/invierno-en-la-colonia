// Ventisca procedural opcional. Sin archivos de audio, RNG del motor ni timers.
// El grafo también permite una muestra OfflineAudioContext en QA.
export function createWindGraph(context,config,seed){
 const nodes=[],node=method=>{const n=context[method]();nodes.push(n);return n;};
 const source=node('createBufferSource'),high=node('createBiquadFilter'),low=node('createBiquadFilter'),gain=node('createGain'),analyser=node('createAnalyser'),gust=node('createOscillator'),amplitude=node('createGain'),frequency=node('createGain');
 const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*config.bufferSeconds),context.sampleRate),data=buffer.getChannelData(0);let n=seed>>>0||1;
 for(let i=0;i<data.length;i++){n^=n<<13;n^=n>>>17;n^=n<<5;data[i]=(n>>>0)/2147483648-1;}
 source.buffer=buffer;source.loop=true;high.type='highpass';high.frequency.value=config.highpass;high.Q.value=.5;low.type='lowpass';low.frequency.value=config.lowpass;low.Q.value=.5;analyser.fftSize=2048;
 source.connect(high);high.connect(low);low.connect(gain);gain.connect(analyser);analyser.connect(context.destination);
 gust.type='sine';gust.frequency.value=1/config.gustPeriod;frequency.gain.value=config.lowpass*.3;gust.connect(frequency);frequency.connect(low.frequency);gust.connect(amplitude);amplitude.connect(gain.gain);
 gain.gain.value=amplitude.gain.value=0;source.start();gust.start();const samples=new Float32Array(2048);let destroyed=false;
 function setVolume(volume,immediate=false){const now=context.currentTime;for(const [param,value] of [[gain.gain,config.maxGain*volume],[amplitude.gain,config.maxGain*volume*.3]]){param.cancelScheduledValues(now);if(immediate)param.setValueAtTime(value,now);else param.setTargetAtTime(value,now,.12);}}
 return {bytes:data.byteLength,nodes:nodes.length,setVolume,rms(){analyser.getFloatTimeDomainData(samples);return Math.sqrt(samples.reduce((sum,x)=>sum+x*x,0)/samples.length);},destroy(){if(destroyed)return;destroyed=true;setVolume(0,true);for(const n of [source,gust])try{n.stop();}catch{}for(const n of nodes)n.disconnect();}};
}
export function createWindAudio(config,{contextFactory=()=>{const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)throw Error('Audio no disponible en este navegador.');return new Context();},seed=crypto.getRandomValues(new Uint32Array(1))[0],onChange=()=>{}}={}){
 let context=null,graph=null,enabled=false,paused=false,disposed=false,volume=config.volume,error=null,closedContexts=0;
 const notify=()=>{if(!disposed)onChange();};
 function fail(cause){if(disposed)return;error='No se pudo activar la ventisca. '+cause.message;enabled=false;release();notify();}
 function release(){const old=context;context=null;if(graph){graph.destroy();graph=null;}if(old){old.onstatechange=null;closedContexts++;return old.close().catch(()=>{});}}
 function sync(){
  if(disposed)return;
  try{
   if(enabled&&!paused){
    if(!context){context=contextFactory();graph=createWindGraph(context,config,seed);context.onstatechange=notify;}
    graph.setVolume(volume);const active=context;context.resume().then(()=>{if(context===active)notify();},cause=>{if(context===active&&enabled&&!paused)fail(cause);});
   }else if(context){graph.setVolume(0,true);const active=context;context.suspend().then(()=>{if(context===active)notify();},cause=>{if(context===active)fail(cause);});}
  }catch(cause){fail(cause);}notify();
 }
 return {
  setEnabled(value){if(disposed)return;enabled=!!value;error=null;sync();},setPaused(value){if(disposed)return;paused=!!value;sync();},
  setVolume(value){if(disposed)return;if(!Number.isFinite(value)||value<0||value>1)throw TypeError('Volumen inválido');volume=value;sync();},
  inspect(){return {enabled,paused,volume,state:disposed?'closed':context?.state||'not-created',error,contexts:context?1:0,nodes:graph?.nodes||0,bufferBytes:graph?.bytes||0,rms:enabled&&!paused&&volume>0&&context?.state==='running'?graph.rms():0,disposed};},
  async destroy(){if(disposed)return;disposed=true;enabled=false;await release();return {closedContexts,nodesReleased:true,disposed:true};}
 };
}
