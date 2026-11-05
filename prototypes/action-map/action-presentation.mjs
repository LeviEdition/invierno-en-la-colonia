import {exposureText} from '../movement-map/presentation-sequence.mjs';
export function actionExposureText(e){return e?.ability==='pistol'?'Pistola · evitó la exposición sin tirar.':e?.ability==='rifle'?'Rifle · evitó la exposición sin tirar.':e?exposureText(e):'Sin exposición.';}
export function actionSummary(op){
 const r=op?.resolution;if(!r)return '';
 const outcome=op.name+(op.kind==='attack'?` eliminó ${r.killed} zombi${r.killed===1?'':'s'}. `:` construyó ${r.built} barricada${r.built===1?'':'s'}. `);
 const added=op.kind==='attack'?Math.max(0,r.zoneAfter?.b-r.zoneBefore?.b):0;
 return outcome+(op.kind==='attack'?actionExposureText(r.exposure):'El acceso quedó reforzado.')+(added?` Además reforzó ${added} barricada(s).`:'')+(r.actorAfter.dead?' Falleció; continuá para resolver sus consecuencias.':'');
}
