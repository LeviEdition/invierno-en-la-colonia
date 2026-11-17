import {exposureText} from '../movimiento/presentation-sequence.mjs';
export function actionExposureText(e){return e?.ability==='pistol'?'Pistola · evitó la exposición sin tirar.':e?.ability==='rifle'?'Rifle · evitó la exposición sin tirar.':e?exposureText(e):'Sin exposición.';}
// Causa de muerte legible a partir del resultado real; nunca la deduce la interfaz por su cuenta.
export function actionFate(r){return r?.actorAfter?.dead?(r.exposure?.effect==='bite'?'murió por la mordedura':['wound','frost'].includes(r.exposure?.effect)?'murió por el daño acumulado':'murió'):null;}
export function actionNotice(op,locations=[]){
 const r=op.resolution,place=locations.find(l=>l.engineIndex===(op.target??op.origin))?.name||'su localidad';
 const site=place==='Colonia'?'en la Colonia':'en '+(/^(Hospital|Supermercado|Depósito)$/.test(place)?'el ':/^(Escuela|Biblioteca|Gasolinera|Comisaría)$/.test(place)?'la ':'')+place;
 const outcome=op.kind==='attack'?`eliminó ${r.killed} zombi${r.killed===1?'':'s'}`:`construyó ${r.built} barricada${r.built===1?'':'s'}`;
 const effect={frost:' y sufrió congelación',wound:' y sufrió una herida',bite:' y sufrió una mordedura',avoided:' y evitó el daño'}[r.exposure?.effect]||'';
 const reinforced=op.kind==='attack'?Math.max(0,(r.zoneAfter?.b||0)-(r.zoneBefore?.b||0)):0;
 const fate=actionFate(r);
 return `${op.name} ${outcome} ${site}${fate?'':effect}${reinforced?` y reforzó ${reinforced} barricada${reinforced===1?'':'s'}`:''}${fate?', pero '+fate:''}.`;
}
export function actionSummary(op){
 const r=op?.resolution;if(!r)return '';
 const done=op.kind==='attack'?`eliminó ${r.killed} zombi${r.killed===1?'':'s'}`:`construyó ${r.built} barricada${r.built===1?'':'s'}`;
 const added=op.kind==='attack'?Math.max(0,r.zoneAfter?.b-r.zoneBefore?.b):0,fate=actionFate(r);
 if(fate)return `${op.name} ${done}${added?` y reforzó ${added} barricada${added===1?'':'s'}`:''}, pero ${fate}.`;
 const outcome=op.name+' '+done+'. ';
 return outcome+(op.kind==='attack'?actionExposureText(r.exposure):'El acceso quedó reforzado.')+(added?` Además reforzó ${added} barricada(s).`:'');
}
