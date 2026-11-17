// Siluetas complementarias sobre UNA textura original. Earcut es la API pública
// Phaser.Geom.Polygon.Earcut de4.2.1. Las bandas comparten la misma deformación
// en sus bordes; no hay recortes duplicados, nuevas texturas ni alfa inventado.
export const groupPolygon=g=>g.outline;
function clipY(poly,y,above){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],inside=above?a[1]>=y:a[1]<=y,next=above?b[1]>=y:b[1]<=y;if(inside)out.push(a);if(inside!==next){const t=(y-a[1])/(b[1]-a[1]);out.push([a[0]+(b[0]-a[0])*t,y]);}}return out;}
export function vegetationGeometry(bounds,groups,triangulate){
 const points=[0,0,bounds.width,0,bounds.width,bounds.height,0,bounds.height],holes=[];
 for(const g of groups){holes.push(points.length/2);for(const p of groupPolygon(g))points.push(...p);}
 const indices=triangulate(points,holes,2),dynamic=groups.map(g=>{
  const points=[],indices=[],top=g.rect[1],bottom=top+g.rect[3],levels=[top,bottom,g.bendFromY,g.anchor.y,...Array.from({length:Math.ceil(g.rect[3]/22)},(_,i)=>top+i*22)].filter(y=>y>=top&&y<=bottom).sort((a,b)=>a-b);
  for(let i=0;i<levels.length-1;i++){if(levels[i+1]-levels[i]<1e-6)continue;const poly=clipY(clipY(g.outline,levels[i],true),levels[i+1],false);if(poly.length<3)continue;const flat=poly.flat(),offset=points.length/2;points.push(...flat);indices.push(...triangulate(flat,null,2).map(n=>n+offset));}
  return {group:g,points,indices};
 });
 return {static:{points,indices},dynamic,sourcePoints:points,holes};
}
