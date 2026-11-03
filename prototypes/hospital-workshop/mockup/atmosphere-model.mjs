// Simulación exclusivamente visual. No consume RNG ni estado del motor.
const kinds=['snow','wind','smoke','lights'];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const tau=Math.PI*2;
export function initialAtmosphereSettings(reduced=false){return {enabled:!reduced,snow:true,wind:true,smoke:true,lights:true,intensity:'normal'};}
export function validateAtmosphere(c){
 const require=(ok,label)=>{if(!ok)throw TypeError('Ambientación: '+label);};
 require(c.version===1&&c.bounds.width===1448&&c.bounds.height===1086,'mapa');
 require(c.frameRate>=15&&c.frameRate<=60&&c.maxDelta>0&&c.maxDelta<=.1,'tiempo');
 for(const type of ['snow','smoke','wind'])require(Number.isInteger(c.limits[type])&&c.limits[type]>=0&&c.limits[type]<=128,'pool '+type);
 require(Object.values(c.limits).reduce((a,b)=>a+b,0)<=160,'límite total');
 require(c.smokeEmitters.length>0||c.limits.smoke===0,'pool de humo sin emisor');
 require(c.windZones.length>0||c.limits.wind===0,'pool de viento sin zona');
 for(const z of c.windZones)require(z.width>=80&&z.height>=12&&z.x>=0&&z.y>=0&&z.x+z.width<=c.bounds.width&&z.y+z.height<=c.bounds.height,'calle');
 for(const e of c.smokeEmitters)require(e.source&&e.x>40&&e.x<c.bounds.width-40&&e.y>140&&e.y<c.bounds.height-40,'emisor');
 for(const l of c.lights)require(l.period>=7&&l.base>l.variation&&l.base+l.variation<=.4&&l.polygon.length>=3,'luz lenta');
 require(Number.isFinite(c.lightsHaloScale)&&c.lightsHaloScale>=1&&c.lightsHaloScale<=3&&Number.isFinite(c.lightsHaloAlpha)&&c.lightsHaloAlpha>=0&&c.lightsHaloAlpha<=.5,'halo local');
 return c;
}
function randomSource(seed){let n=seed>>>0;return ()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export function createAtmosphereModel(raw,{seed=1,settings=initialAtmosphereSettings(false)}={}){
 const config=validateAtmosphere(raw),random=randomSource(seed),between=([a,b])=>a+(b-a)*random(),b=config.bounds;
 let options={...initialAtmosphereSettings(false),...settings},elapsed=0,paused=false,steps=0;
 const particles=[],lights=config.lights.map(l=>({...l,alpha:0}));
 for(let i=0;i<config.limits.snow;i++){
  const size=between(config.snow.size);particles.push({type:'snow',index:i,x:3+random()*(b.width-6),y:3+random()*(b.height-6),width:size,height:size,speed:between(config.snow.speed),opacity:between(config.snow.opacity),phase:random()*tau,alpha:0});
 }
 for(let i=0;i<config.limits.smoke;i++){
  const e=config.smokeEmitters[i%config.smokeEmitters.length],life=between(e.life),age=random()*life;
  particles.push({type:'smoke',index:i,emitter:i%config.smokeEmitters.length,x:e.x+age*1.5,y:e.y-age*6,age,life,rise:between(e.rise),size:between(e.size),opacity:between(e.opacity),phase:random()*tau,width:0,height:0,alpha:0});
 }
 for(let i=0;i<config.limits.wind;i++){
  const zone=i%config.windZones.length,z=config.windZones[zone],width=between(config.wind.size),height=between(config.wind.height),life=between(config.wind.life);
  particles.push({type:'wind',index:i,zone,x:z.x+width/2+random()*(z.width-width),y:z.y+height/2+random()*(z.height-height),width,height,age:random()*life,life,opacity:between(config.wind.opacity),alpha:0});
 }
 function running(){return !paused&&options.enabled&&kinds.some(k=>options[k]);}
 function wind(){return options.wind?config.wind.base+config.wind.amplitude*Math.sin(elapsed*tau/config.wind.period)+1.5*Math.sin(elapsed*tau/config.wind.secondaryPeriod):0;}
 function paint(){
  const intensity=config.intensities[options.intensity];
  for(const p of particles){
   let alpha=0;
   if(options.enabled&&options[p.type]&&p.index<Math.ceil(config.limits[p.type]*intensity.count)){
    if(p.type==='snow')alpha=p.opacity*intensity.alpha;
    else if(p.type==='smoke'){const u=p.age/p.life;p.width=p.size*(1+2.6*u);p.height=p.width*1.3;alpha=p.opacity*Math.sin(Math.PI*u)*intensity.alpha;}
    else {const z=config.windZones[p.zone],edge=Math.min(p.x-p.width/2-z.x,z.x+z.width-p.x-p.width/2);alpha=p.opacity*Math.sin(Math.PI*p.age/p.life)**2*clamp(edge/18,0,1)*intensity.alpha;}
   }
   const edge=Math.min(p.x-p.width/2,p.y-p.height/2,b.width-p.x-p.width/2,b.height-p.y-p.height/2);
   p.alpha=edge<0?0:alpha*clamp(edge/config.edgeFade,0,1);
  }
  for(const l of lights)l.alpha=options.enabled&&options.lights?(l.base+l.variation*Math.sin(elapsed*tau/l.period+l.phase))*intensity.alpha:0;
 }
 function step(seconds){
  if(!running())return false;const dt=clamp(Number.isFinite(seconds)?seconds:0,0,config.maxDelta);if(!dt)return false;elapsed+=dt;steps++;const gust=wind();
  for(const p of particles){
   if(!options[p.type])continue;
   if(p.type==='snow'){
    p.x=3+((p.x-3+(gust*(.7+p.width/6)+Math.sin(elapsed*.4+p.phase)*.4)*dt)%(b.width-6)+(b.width-6))%(b.width-6);
    p.y=3+(p.y-3+p.speed*dt)%(b.height-6);
   }else if(p.type==='smoke'){
    p.age+=dt;if(p.age>=p.life){const e=config.smokeEmitters[p.emitter];p.age=0;p.x=e.x;p.y=e.y;}
    p.x+=(gust*.35+Math.sin(elapsed*.6+p.phase)*.4)*dt;p.y-=p.rise*dt;
   }else{
    const z=config.windZones[p.zone];p.age=(p.age+dt)%p.life;p.x+=Math.max(.4,gust+5)*dt;
    if(p.x+p.width/2>z.x+z.width){p.x=z.x+p.width/2;p.age=0;}
   }
  }
  paint();return true;
 }
 function setSettings(patch){
  const next={...options,...patch};if(!config.intensities[next.intensity]||['enabled',...kinds].some(k=>typeof next[k]!=='boolean'))throw TypeError('Opciones de ambientación inválidas');options=next;paint();
 }
 setSettings(options);paint();
 return {particles,lights,step,setSettings,isAnimating:running,setPaused(value){paused=!!value;},snapshot(){return {seed:seed>>>0,settings:{...options},paused,elapsed,steps,poolSize:particles.length,visibleParticles:particles.reduce((n,p)=>n+(p.alpha>0),0),wind:wind(),particles:particles.map(p=>({...p})),lights:lights.map(l=>({...l}))};}};
}
