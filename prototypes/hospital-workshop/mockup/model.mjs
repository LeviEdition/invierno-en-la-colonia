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
  require(z.capacity===(z.id==='colonia'?12:4)&&z.portraits.length===z.capacity&&z.accesses.length===z.capacity,'capacidad visual '+z.id);
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
  const count=mode==='maximum'?z.capacity:z.id==='hospital'?4:z.id==='colonia'?3:1;
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
export function pickCharacter(characters,point){return [...characters].reverse().find(c=>Math.hypot(point.x-c.position.x,point.y-c.position.y)<=c.diameter/2)?.id||null;}
