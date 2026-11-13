// Correspondencia del índice real de V9.9 con la composición ilustrada H3.3.
// Estas posiciones NO son capacidades, movimiento ni espacios nuevos de reglas.
const visualIds=['colonia','supermercado','hospital','comisaria','gasolinera','escuela','biblioteca'];
export function portraitFor(id){let hash=0;for(const char of String(id))hash=(hash*31+char.codePointAt(0))>>>0;return 'survivor-portrait-'+(hash%4+1);}
export function layoutState(state,scene){
 const nodes=[{id:'map',assetId:'map',position:{x:0,y:0},depth:0,role:'ground',multiplier:1,visible:true}],characters=[],locations=[],known=new Set();
 for(const loc of state.locations){
  const zone=scene.zones.find(z=>z.id===visualIds[loc.engineIndex]);if(!zone)continue;known.add(loc.id);
  const members=state.characters.filter(c=>c.locationId===loc.id),shown=members.slice(0,zone.portraits.length),drawnCharacters=shown.map((c,i)=>({...c,nodeId:'person:'+c.id,position:{x:zone.portraits[i][0],y:zone.portraits[i][1]},diameter:zone.portraitDiameter,portraitId:portraitFor(c.id)}));
  characters.push(...drawnCharacters);for(const c of drawnCharacters)nodes.push({id:c.nodeId,assetId:c.portraitId,position:{...c.position},depth:7,role:'survivor',multiplier:c.diameter/44,visible:true});
  const zombies=loc.zombies??0,barricades=loc.barricades??0,count=Math.min(zone.accesses.length,loc.exteriorCapacity??(zombies+barricades));
  const accesses=zone.accesses.slice(0,count).map((p,i)=>({id:loc.id+'-access-'+i,zoneId:zone.id,position:{x:p.x,y:p.y},side:p.side,width:zone.contourWidth??(p.side==='side'?58:72),height:zone.contourHeight??24,rotation:p.rotation??0,occupant:i<zombies?'zombie':i<zombies+barricades?'barricade':'empty'}));
  for(const a of accesses)if(a.occupant!=='empty')nodes.push({id:a.id,assetId:a.occupant==='zombie'?'zombie':'barricade-marker',position:{...a.position},depth:3,role:a.occupant,multiplier:1,visible:true,...(a.occupant==='zombie'?{shadow:{width:19,height:5,dx:0,dy:0}}:{})});
  locations.push({...loc,visualId:zone.id,engineCapacity:loc.capacity,visualCapacity:zone.portraits.length,characterIds:members.map(c=>c.id),drawnCharacters,characterOverflow:members.slice(shown.length).map(c=>c.id),accesses,externalOverflow:Math.max(0,zombies+barricades-accesses.length),badgePosition:{x:zone.buildingBounds.x+zone.buildingBounds.width/2,y:zone.buildingBounds.y+zone.buildingBounds.height*.55}});
 }
 return {nodes,characters,locations,unmappedCharacterIds:state.characters.filter(c=>!known.has(c.locationId)).map(c=>c.id)};
}
