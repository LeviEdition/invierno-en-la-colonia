// Orientación del D12 en 3D (sesión 8, informe 127). Puro y sin Three.js: lo usan la vista 3D y
// las pruebas. El RESULTADO viene del motor (la cara); acá solo se decide cómo se ve el giro.
// El camino sale de un PRNG con semilla visual (nunca Math.random ni el azar del motor) y en
// progress = 1 la orientación es exactamente la de reposo, con o sin animación.
import {D12_FACES} from './exposure-die-geometry.mjs';
import {rollEase} from './presentation-sequence.mjs';

// Cuaterniones [x, y, z, w].
const mul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
const axisAngle=(axis,angle)=>{const s=Math.sin(angle/2);return [axis[0]*s,axis[1]*s,axis[2]*s,Math.cos(angle/2)];};
export function rotateVector(q,v){const p=mul(mul(q,[v[0],v[1],v[2],0]),[-q[0],-q[1],-q[2],q[3]]);return [p[0],p[1],p[2]];}
function fromMatrix(m){// m: filas de una rotación 3×3
 const [[a,b,c],[d,e,f],[g,h,i]]=m,t=a+e+i;
 if(t>0){const s=Math.sqrt(t+1)*2;return [(h-f)/s,(c-g)/s,(d-b)/s,s/4];}
 if(a>e&&a>i){const s=Math.sqrt(1+a-e-i)*2;return [s/4,(b+d)/s,(c+g)/s,(h-f)/s];}
 if(e>i){const s=Math.sqrt(1+e-a-i)*2;return [(b+d)/s,s/4,(f+h)/s,(c-g)/s];}
 const s=Math.sqrt(1+i-a-e)*2;return [(c+g)/s,(f+h)/s,s/4,(d-b)/s];
}
// Reposo: la cara del motor mira a la cámara (+Z) con su símbolo derecho (+Y), igual que el D12 plano.
export function restQuaternion(face){const f=D12_FACES[face-1];if(!f)throw RangeError('Cara D12 fuera de rango');return fromMatrix([f.right,f.up,f.normal]);}

// PRNG con semilla (mulberry32): mismo número, mismo giro.
export function seededRandom(seed){let a=seed>>>0;return ()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export function spinPath(seed){
 const r=seededRandom(seed),z=r()*2-1,phi=r()*Math.PI*2,k=Math.sqrt(1-z*z);
 return {axis:[k*Math.cos(phi),k*Math.sin(phi),z],turns:2.6+r()*1.4,bounces:1};
}
// Rebote: el dado sube y cae una vez mientras frena; en 0 y en 1 está apoyado.
export function bounceLift(progress){const p=Math.max(0,Math.min(1,progress));return p<=0||p>=1?0:.22*Math.abs(Math.sin(Math.PI*1.6*p))*(1-p)**2;}
// Orientación en un instante de la tirada. reduced o progress ≥ 1: quieto en su cara.
export function d12Orientation(face,{progress=1,reduced=false,seed=1}={}){
 const rest=restQuaternion(face);
 if(reduced||progress>=1)return {quaternion:rest,lift:0};
 const {axis,turns}=spinPath(seed),remaining=(1-rollEase(progress))*turns*Math.PI*2;
 return {quaternion:mul(rest,axisAngle(axis,remaining)),lift:bounceLift(progress)};
}
// Qué cara queda mirando a la cámara con una orientación dada (para las pruebas y el respaldo).
export function faceTowardCamera(quaternion){let best=null,max=-Infinity;for(const f of D12_FACES){const z=rotateVector(quaternion,f.normal)[2];if(z>max){max=z;best=f.face;}}return best;}
