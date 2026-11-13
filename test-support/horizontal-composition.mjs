import {spriteBounds} from '../prototypes/horizontal-map/presentation.mjs';
export function boundsIntersectPolygon(b,poly){
 const corners=[[b.x,b.y],[b.x+b.width,b.y],[b.x+b.width,b.y+b.height],[b.x,b.y+b.height]],inside=(p,ps)=>{let yes=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++){const a=ps[i],c=ps[j];if((a[1]>p[1])!==(c[1]>p[1])&&p[0]<(c[0]-a[0])*(p[1]-a[1])/(c[1]-a[1])+a[0])yes=!yes;}return yes;},turn=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 if(corners.some(p=>inside(p,poly))||poly.some(p=>inside(p,corners)))return true;
 return corners.some((a,i)=>poly.some((c,j)=>{const b=corners[(i+1)%4],d=poly[(j+1)%poly.length];return turn(a,b,c)*turn(a,b,d)<0&&turn(c,d,a)*turn(c,d,b)<0;}));
}
export const overlaps=(a,b,gap=0)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;
export function exteriorVolumes(scene,assets){return scene.zones.flatMap(z=>z.accesses.flatMap((p,i)=>['zombie','barricade-marker'].map(id=>({locality:z.id,index:i,asset:id,...spriteBounds(assets.find(a=>a.id===id),p,scene.actorScale[id==='zombie'?'zombie':'barricade'])}))));}
// Solo proyección sintética; no ejecuta comandos ni modifica el host real.
export function capacityProjection(projection,mode,scene){
 const p=structuredClone(projection),original=p.characters,ids=['h0','h1','a1','a0'];let n=0;p.characters=[];
 for(const loc of p.locations){const capacity=loc.capacity;loc.survivors=loc.occupied=capacity;loc.available=loc.helpless=0;const zone=scene?.zones.find(z=>z.id===['colonia','supermercado','hospital','comisaria','gasolinera','escuela','biblioteca'][loc.engineIndex]);const count=zone?.accesses.length??loc.exteriorCapacity;loc.zombies=mode==='zombies'?count:mode==='mixed'?Math.ceil(count/2):0;loc.barricades=mode==='barricades'?count:mode==='mixed'?Math.floor(count/2):0;loc.exteriorAvailable=count-loc.zombies-loc.barricades;
  for(let i=0;i<capacity;i++,n++){const source=n<4?original.find(c=>c.id===ids[n]):null;p.characters.push({...source||original[0],id:source?.id||'qa-'+n,name:source?.name||(String.fromCharCode(65+Math.floor(n/26))+' '+String.fromCharCode(65+n%26)+' (muestra)'),playerId:source?.playerId||(n%2?'ai':'human'),locationId:loc.id});}}
 p.movement.options={};p.search.options={};p.search.private=null;p.action.options={};p.action.operation=null;return p;
}
