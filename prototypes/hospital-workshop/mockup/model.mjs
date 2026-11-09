// Coordenadas y fixtures de presentación. No importa ni evalúa reglas del juego.
const ids=['escuela','biblioteca','hospital','colonia','gasolinera','comisaria','supermercado'];
const finite=Number.isFinite;
const require=(ok,message)=>{if(!ok)throw TypeError('Maqueta: '+message);};
const point=p=>p&&finite(p.x)&&finite(p.y);
const inRect=(p,b)=>p.x>=b.x&&p.x<=b.x+b.width&&p.y>=b.y&&p.y<=b.y+b.height;
export function validateScene(scene){
 require(scene.version===1&&scene.status==='visual-demonstration-not-game-state','versión/estado');
 require(scene.bounds?.width===1448&&scene.bounds?.height===1086&&scene.bounds.x===0&&scene.bounds.y===0,'mapa original');
 require(finite(scene.actorScale?.zombie)&&finite(scene.actorScale?.barricade)&&scene.actorScale.zombie>0&&scene.actorScale.barricade>0,'escala de actores');
 require(scene.zones.length===7&&scene.zones.every((z,i)=>z.id===ids[i]),'siete localidades del mapa');
 const positions=new Set();
 for(const z of scene.zones){
  require(z.survivorCapacity===({colonia:12,gasolinera:2,biblioteca:3}[z.id]||4)&&z.portraits.length===z.survivorCapacity,'capacidad de supervivientes '+z.id);
  require(z.exteriorCapacity===(z.id==='colonia'?12:4)&&z.accesses.length===z.exteriorCapacity,'espacios exteriores independientes '+z.id);
  require(typeof z.description==='string'&&z.description.length>15,'descripción provisional');
  require(Array.isArray(z.selectionPolygon)&&z.selectionPolygon.length>=3&&z.selectionPolygon.every(p=>Array.isArray(p)&&p.length===2&&inRect({x:p[0],y:p[1]},scene.bounds)),'zona de selección '+z.id);
  require(finite(z.portraitDiameter)&&z.portraitDiameter>=32&&z.portraitDiameter<=48,'diámetro de ficha');
  for(const b of [z.buildingBounds,z.focus])require(point(b)&&finite(b.width)&&finite(b.height)&&b.width>0&&b.height>0,'referencia visual/encuadre');
  for(const [x,y]of z.portraits){const p={x,y},key=x+','+y;require(point(p)&&inRect(p,scene.bounds)&&inRect(p,z.buildingBounds)&&!positions.has(key),'ficha sobre localidad '+z.id);positions.add(key);}
  for(const p of z.accesses){const key=p.x+','+p.y;require(point(p)&&inRect(p,scene.bounds)&&!inRect(p,z.buildingBounds)&&!positions.has(key)&&['front','side'].includes(p.side),'acceso de muestra en terreno '+z.id);positions.add(key);}
  if(['hospital','comisaria'].includes(z.id))require(z.accesses.filter(p=>p.side==='front').length===2&&z.accesses.filter(p=>p.side==='side').length===2,'dos accesos delante y dos al costado');
 }
 return scene;
}
const portraits=['survivor-portrait-1','survivor-portrait-2','survivor-portrait-3','survivor-portrait-4'];
const samples=[{name:'Mara',attributes:[5,3,2]},{name:'Superviviente 02',attributes:[3,4,2]},{name:'Superviviente 03',attributes:[4,2,3]},{name:'Superviviente 04',attributes:[2,3,4]}];
export const sampleTurn={round:1,group:'A',morale:6,food:4,dice:[2,3,5,6],demonstration:true};
export function createFixture(scene,mode='hospital'){
 require(['hospital','one-zombie','maximum'].includes(mode),'fixture desconocido');
 const characters=[],accesses=[];
 for(const z of scene.zones){
  const count=mode==='maximum'?z.survivorCapacity:z.id==='hospital'?4:z.id==='colonia'?3:1;
  for(let i=0;i<count;i++)characters.push({id:z.id+'-person-'+(i+1),zoneId:z.id,zoneName:z.name,portraitId:portraits[i%4],position:{x:z.portraits[i][0],y:z.portraits[i][1]},diameter:z.portraitDiameter,group:i%2?'B':'A',...structuredClone(samples[i%4]),demonstration:true});
  z.accesses.forEach((p,i)=>accesses.push({id:z.id+'-access-'+(i+1),zoneId:z.id,position:{x:p.x,y:p.y},side:p.side,width:p.side==='side'?58:72,height:24,rotation:0,occupant:mode==='maximum'?i%2?'barricade':'zombie':mode==='hospital'&&z.id==='hospital'?i%2?'barricade':'zombie':i===0?'zombie':'empty'}));
 }
 return {mode,characters,accesses,demonstration:true};
}
export function sceneCounts(fixture){return {characters:fixture.characters.length,accesses:fixture.accesses.length,zombies:fixture.accesses.filter(a=>a.occupant==='zombie').length,barricades:fixture.accesses.filter(a=>a.occupant==='barricade').length,empty:fixture.accesses.filter(a=>a.occupant==='empty').length};}
export function sceneNodes(scene,fixture){
 const nodes=[{id:'map',assetId:'map',position:{x:0,y:0},depth:0,role:'ground',multiplier:1,visible:true}];
 for(const c of fixture.characters)nodes.push({id:c.id,assetId:c.portraitId,position:{...c.position},depth:7,role:'survivor',multiplier:c.diameter/44,visible:true});
 for(const a of fixture.accesses)if(a.occupant!=='empty')nodes.push({id:a.id,assetId:a.occupant==='zombie'?'zombie':'barricade-marker',position:{...a.position},depth:3,role:a.occupant,multiplier:1,visible:true,...(a.occupant==='zombie'?{shadow:{width:19,height:5,dx:0,dy:0}}:{})});
 return nodes;
}
export function pickCharacter(characters,point,{zoom=1,minSize=0}={}){
 if(!minSize)return [...characters].reverse().find(c=>Math.hypot(point.x-c.position.x,point.y-c.position.y)<=c.diameter/2)?.id||null;
 let nearest=null,distance=Infinity;
 for(const c of [...characters].reverse()){const d=Math.hypot(point.x-c.position.x,point.y-c.position.y);if(d<=Math.max(c.diameter/2,minSize/(2*zoom))&&d<distance){nearest=c.id;distance=d;}}
 return nearest;
}

// Polígonos de selección del arte compuesto; no son colisiones ni reglas.
export function pointInPolygon(point,polygon){
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const [x,y]=polygon[i],[px,py]=polygon[j];
  if(((y>point.y)!==(py>point.y))&&point.x<(px-x)*(point.y-y)/(py-y)+x)inside=!inside;
 }
 return inside;
}
export function pickLocality(scene,point,zoom=1){
 const building=scene.zones.find(z=>pointInPolygon(point,z.selectionPolygon)||(z.outlinePolygon&&pointInPolygon(point,z.outlinePolygon)));
 if(building)return building.id;
 // Opt-in del nuevo mapa: consultar la localidad desde sus apoyos/cuerpos.
 // El área mínima de44px CSS no cambia capacidades ni el objetivo agregado.
 if(scene.selectExteriorAccesses){let nearest=null,distance=Infinity;for(const z of scene.zones)for(const a of z.accesses){const rx=Math.max(16,22/zoom),ry=Math.max(20,22/zoom),d=((point.x-a.x)/rx)**2+((point.y-(a.y-10))/ry)**2;if(d<=1&&d<distance){nearest=z.id;distance=d;}}return nearest;}
 return null;
}
// El margen táctil de una ficha no debe capturar el cuerpo de una casilla
// cercana. Priorizar lo dibujado; usar el margen solo sobre terreno libre.
export function pickMapTarget(scene,characters,point,zoom=1){
 const characterId=pickCharacter(characters,point);
 if(characterId)return {characterId,localityId:null};
 const localityId=pickLocality(scene,point,zoom);
 if(localityId)return {characterId:null,localityId};
 return {characterId:pickCharacter(characters,point,{zoom,minSize:scene.minPickSize||0}),localityId:null};
}
export function localityDetails(scene,fixture,id){
 const zone=scene.zones.find(z=>z.id===id);if(!zone)return null;
 const slots=fixture.accesses.filter(a=>a.zoneId===id);
 return {id,name:zone.name,description:zone.description,survivorCapacity:zone.survivorCapacity,exteriorCapacity:zone.exteriorCapacity,characters:structuredClone(fixture.characters.filter(c=>c.zoneId===id)),zombies:slots.filter(a=>a.occupant==='zombie').length,barricades:slots.filter(a=>a.occupant==='barricade').length,empty:slots.filter(a=>a.occupant==='empty').length};
}
