// Geometría de presentación del PNG, nunca capacidades ni legalidad del motor.
export function spriteBounds(asset,position,scale=asset.scale){const b=asset.visibleBounds;return {x:position.x+(b.x-asset.pivot.x)*scale,y:position.y+(b.y-asset.pivot.y)*scale,width:b.width*scale,height:b.height*scale};}
export function localityFrame(zone,margin=20){
 const points=[...(zone.outlinePolygon||zone.selectionPolygon)];
 for(const [x,y]of zone.portraits){const r=zone.portraitDiameter/2+3;points.push([x-r,y-r],[x+r,y+r]);}
 if(zone.portraitGroup){const {x,y}=zone.portraitGroup.labelPosition;points.push([x-100,y-32],[x+100,y+32]);}
 for(const a of zone.accesses){const rx=(zone.contourWidth||60)/2,ry=(zone.contourHeight||18)/2,t=a.rotation||0,w=Math.hypot(rx*Math.cos(t),ry*Math.sin(t)),h=Math.hypot(rx*Math.sin(t),ry*Math.cos(t));points.push([a.x-Math.max(16,w),a.y-30],[a.x+Math.max(16,w),a.y+Math.max(8,h)]);}
 const left=Math.min(...points.map(p=>p[0]))-margin,top=Math.min(...points.map(p=>p[1]))-margin,right=Math.max(...points.map(p=>p[0]))+margin,bottom=Math.max(...points.map(p=>p[1]))+margin;
 return {x:left,y:top,width:right-left,height:bottom-top};
}
