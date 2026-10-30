// Datos de presentación del piloto. No importa ni interpreta reglas del juego.
const finite=n=>Number.isFinite(n);
const require=(ok,message)=>{if(!ok)throw TypeError('Kit: '+message);};
const point=p=>p&&finite(p.x)&&finite(p.y);
export function validateKit(kit){
 require(kit.version===1&&kit.status==='provisional-awaiting-model','versión/estado');
 require(kit.reference?.projection?.status==='pending-model'&&kit.reference.projection.angle===null,'proyección pendiente de maqueta');
 require(point(kit.bounds)&&finite(kit.bounds.width)&&finite(kit.bounds.height)&&kit.bounds.width>0&&kit.bounds.height>0&&point(kit.buildingPosition),'encuadre y apoyo del edificio');
 require(point(kit.guidePositions?.human)&&point(kit.guidePositions?.door),'referencias de escala');
 const ids=new Set();
 for(const a of kit.assets){
  require(typeof a.id==='string'&&/^[a-z][a-z0-9-]*$/.test(a.id)&&!ids.has(a.id),'identificador único');ids.add(a.id);
  require(['image','marker'].includes(a.kind)&&a.reference===kit.reference.id&&a.provisional===true,'referencia/provisional');
  require(finite(a.width)&&finite(a.height)&&a.width>0&&a.height>0&&finite(a.scale)&&a.scale>0,'dimensiones/escala');
  require(point(a.pivot)&&a.pivot.x>=0&&a.pivot.x<=a.width&&a.pivot.y>=0&&a.pivot.y<=a.height,'pivote');
  const b=a.visibleBounds;require(b&&point(b)&&b.x>=0&&b.y>=0&&b.width>0&&b.height>0&&b.x+b.width<=a.width&&b.y+b.height<=a.height,'límites visibles');
  require(Array.isArray(a.states)&&a.states.length>0,'estados');
  if(a.kind==='image')require(/^\.\.\/\.\.\/assets\/(prototipo-hospital|hospital-workshop)\/[a-zA-Z0-9_./-]+\.png$/.test(a.file)&&!a.file.slice(13).split('/').includes('..')&&/^[a-f0-9]{64}$/.test(a.sha256)&&a.bytes>0&&a.provenance?.manifest,'procedencia original');
  else require(a.file===null&&a.provenance?.artApproved===false,'marcador sin arte');
 }
 for(const id of ['ground','hospital','zombie','survivor-marker','barricade-marker','human-guide','door-guide'])require(ids.has(id),'recurso '+id);
 for(const id of ['human-guide','survivor-marker']){const a=kit.assets.find(a=>a.id===id);if(a.kind==='marker')require(a.height*a.scale===kit.reference.scale.humanHeight,'referencia humana');}
 require(kit.assets.find(a=>a.id==='door-guide').height===kit.reference.scale.doorHeight,'referencia de puerta');
 require(kit.profiles.length===3&&new Set(kit.profiles.map(p=>p.id)).size===3,'perfiles del ensayo');
 require(kit.profiles[0].id==='h32'&&kit.profiles[0].factor===1,'referencia sin sustituir');
 for(const p of kit.profiles)require(typeof p.id==='string'&&typeof p.label==='string'&&finite(p.factor)&&p.factor>0&&p.factor<=1,'factor de derivación');
 for(const positions of [kit.survivorPositions,kit.accessPositions])require(positions.length===4&&new Set(positions.map(p=>p.id)).size===4&&positions.every(point),'cuatro marcas de ensayo');
 for(const id of ['delante','detras','esquina'])require(point(kit.poses[id]?.position)&&['front','back'].includes(kit.poses[id].side),'posición de oclusión');
 require(kit.occlusion.method==='explicit-demo-order-not-y-sorting','orden preparado');
 return kit;
}
export function textureEstimate(asset,factor){
 const width=Math.ceil(asset.width*factor),height=Math.ceil(asset.height*factor),potWidth=2**Math.ceil(Math.log2(width)),potHeight=2**Math.ceil(Math.log2(height));
 let w=potWidth,h=potHeight,rgbaWithMips=0;while(true){rgbaWithMips+=w*h*4;if(w===1&&h===1)break;w=Math.max(1,w/2);h=Math.max(1,h/2);}
 return {width,height,potWidth,potHeight,rgbaBase:potWidth*potHeight*4,rgbaWithMips,auxiliaryRgba:potWidth*potHeight*4,derivedRgba:factor===1?0:width*height*4};
}
export function representation(asset,factor,multiplier,position){
 const scale=asset.scale*multiplier/factor;
 return {raster:{width:Math.ceil(asset.width*factor),height:Math.ceil(asset.height*factor)},pivot:{x:asset.pivot.x*factor,y:asset.pivot.y*factor},scale,
  content:{x:position.x-asset.pivot.x*asset.scale*multiplier,y:position.y-asset.pivot.y*asset.scale*multiplier,width:asset.width*asset.scale*multiplier,height:asset.height*asset.scale*multiplier}};
}
export function defaultState(kit){return {profile:kit.profiles[0].id,case:'occlusion',pose:'delante',actorScale:1,grid:false,gridStep:80,axes:true,pivots:true,bounds:false,labels:true,showHidden:false,selected:null,accesses:['zombie','barricade','zombie','barricade'],layers:{ground:true,building:true,actors:true,shadows:true,slots:true,guides:true}};}
export function caseOccupants(state){return state.case==='max-zombies'?Array(4).fill('zombie'):state.case==='max-barricades'?Array(4).fill('barricade'):state.case==='mixed'?['zombie','barricade','zombie','barricade']:[...state.accesses];}
export function sceneNodes(kit,state){
 const nodes=[],add=(id,assetId,position,depth,layer,role,multiplier=1,access=null)=>nodes.push({id,assetId,position:{x:position.x,y:position.y},depth,layer,role,multiplier,access,visible:state.layers[layer]});
 add('ground','ground',{x:0,y:0},0,'ground','ground');add('hospital','hospital',kit.buildingPosition,3,'building','building');
 if(state.case==='occlusion')add('test-actor','zombie',kit.poses[state.pose].position,kit.poses[state.pose].side==='front'?5:2,'actors','test-actor',state.actorScale);
 else{
  for(const p of kit.survivorPositions)add(p.id,'survivor-marker',p,5,'actors','survivor',state.actorScale);
  const occupants=caseOccupants(state);
  kit.accessPositions.forEach((p,i)=>{const occupant=occupants[i];if(occupant!=='empty')add('access-'+p.id,occupant==='zombie'?'zombie':'barricade-marker',p,5,'actors',occupant,occupant==='zombie'?state.actorScale:1,p.id);});
 }
 add('human-guide','human-guide',kit.guidePositions.human,7,'guides','guide',state.actorScale);add('door-guide','door-guide',kit.guidePositions.door,7,'guides','guide');
 return nodes;
}
export function visibleCounts(nodes){
 const n=role=>nodes.filter(x=>x.visible&&x.role===role).length;
 return {survivors:n('survivor'),zombies:n('zombie'),barricades:n('barricade'),testActors:n('test-actor'),accesses:nodes.filter(x=>x.visible&&x.access).length};
}
