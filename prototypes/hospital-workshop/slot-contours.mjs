const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Apariencia de presentación; no consulta ni decide legalidad o capacidad.
export function slotContourStyle(access,context,zoom){
 if(!context)return {alpha:1,width:1,dash:4,solid:false};
 const near=clamp((zoom-.5)/.8,0,1),relevant=context.zones.includes(access.zoneId),occupied=access.occupant!=='empty';
 return {alpha:relevant?(context.visibleEmpty?.88+near*.1:.68+near*.2):occupied?.48+near*.15:context.visibleEmpty?.52+near*.12:.10+near*.20,width:relevant?(context.visibleEmpty?1.45:1.1):occupied?.9:context.visibleEmpty?.95:.65,dash:relevant?4:6,solid:!!context.visibleEmpty||relevant||occupied};
}
