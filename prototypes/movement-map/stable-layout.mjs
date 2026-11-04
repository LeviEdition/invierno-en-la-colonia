import {layoutState} from './layout.mjs';
const ids=['colonia','supermercado','hospital','comisaria','gasolinera','escuela','biblioteca'];
export function createStableLayout(scene){
 const slots=new Map();
 function project(state){
  for(const loc of state.locations){const zone=scene.zones.find(z=>z.id===ids[loc.engineIndex]);if(!zone)continue;let assigned=slots.get(loc.id);if(!assigned){assigned=new Map();slots.set(loc.id,assigned);}const members=state.characters.filter(c=>c.locationId===loc.id);for(const id of assigned.keys())if(!members.some(c=>c.id===id))assigned.delete(id);for(const c of members)if(!assigned.has(c.id)){const free=zone.portraits.findIndex((_,i)=>![...assigned.values()].includes(i));if(free>=0)assigned.set(c.id,free);}}
  const ordered=[...state.characters].sort((a,b)=>(slots.get(a.locationId)?.get(a.id)??999)-(slots.get(b.locationId)?.get(b.id)??999)),layout=layoutState({...state,characters:ordered},scene);
  for(const loc of layout.locations){const zone=scene.zones.find(z=>z.id===loc.visualId);for(const c of loc.drawnCharacters){const slot=slots.get(loc.id).get(c.id),[x,y]=zone.portraits[slot];c.position={x,y};const node=layout.nodes.find(n=>n.id==='person:'+c.id);if(node)node.position={x,y};}}
  return layout;
 }
 return {project,reset(){slots.clear();}};
}
export function destinationPosition(layout,scene,destination){const loc=layout.locations.find(l=>l.engineIndex===destination),zone=scene.zones.find(z=>z.id===loc?.visualId);if(!zone)return {x:0,y:0};const free=zone.portraits.find(([x,y])=>!loc.drawnCharacters.some(c=>c.position.x===x&&c.position.y===y));return free?{x:free[0],y:free[1]}:{...loc.badgePosition};}
