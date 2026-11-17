// Una entrada por cara física; los doce intervalos tienen el mismo ancho.
const labels={none:'Sin efecto',wound:'Herida',frost:'Congelación',bite:'Mordedura'};
function createExposureFaces(){return Object.freeze(['bite','frost','frost','wound','wound','wound','none','none','none','none','none','none'].map((outcome,index)=>Object.freeze({sides:12,face:index+1,outcome,label:labels[outcome]})));}
export const EXPOSURE_FACES=/* @__PURE__ */createExposureFaces();
export function rollExposureDie(random=globalThis.Math.random){
 const sample=random();if(!Number.isFinite(sample)||sample<0||sample>=1)throw RangeError('La tirada requiere azar en [0,1).');
 return Object.freeze({...EXPOSURE_FACES[globalThis.Math.floor(sample*EXPOSURE_FACES.length)],faces:Object.freeze(EXPOSURE_FACES.map(f=>f.outcome))});
}
