// D12 en 3D (sesión 8, informe 127). Chunk aparte (dist/mapa/d12-3d.mjs): es lo único que importa
// Three.js y se carga solo cuando aparece el primer dado. No toca Phaser ni el motor: recibe la
// orientación ya calculada (d12-orientation.mjs) y dibuja UNA vez por llamada; quieto, no dibuja.
import {WebGLRenderer,Scene,PerspectiveCamera,BufferGeometry,Float32BufferAttribute,Mesh,MeshStandardMaterial,CanvasTexture,DirectionalLight,HemisphereLight,AmbientLight,SRGBColorSpace} from 'three';
import {D12_FACES} from './exposure-die-geometry.mjs';
import {seededRandom} from './d12-orientation.mjs';

const R=1/Math.sqrt(3),CHAMFER=.86,TEX=256;
const MARFIL='#E6DCC3',MARFIL_GASTADO='#CFC2A3',PINTURA='#8E2F2A';
const sub=(a,b)=>a.map((x,i)=>x-b[i]),add=(a,b)=>a.map((x,i)=>x+b[i]),scale=(a,k)=>a.map(x=>x*k),dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const key=p=>p.map(x=>x.toFixed(5)).join(',');

// Cara tallada: marfil con grano, el símbolo hundido (sombra adentro) y la pintura roja saltada.
function faceTexture(outcome,paths,seed){
 const c=document.createElement('canvas');c.width=c.height=TEX;const g=c.getContext('2d'),r=seededRandom(seed);
 g.fillStyle=MARFIL;g.fillRect(0,0,TEX,TEX);
 for(let i=0;i<900;i++){const v=r();g.fillStyle=v<.5?'rgba(90,70,40,.07)':'rgba(255,250,235,.08)';g.fillRect(r()*TEX,r()*TEX,1+r()*2,1+r()*2);}
 const d=paths[outcome];
 if(d){
  const p=new Path2D(d);g.save();g.translate(TEX/2,TEX/2);g.scale(TEX/34,TEX/34);
  const stroke=outcome!=='wound';g.lineCap='round';g.lineJoin='round';
  // Talla: el hueco oscuro, corrido hacia abajo a la derecha (luz de arriba).
  g.save();g.translate(.45,.55);g.strokeStyle='rgba(60,40,25,.55)';g.fillStyle='rgba(60,40,25,.55)';g.lineWidth=2.6;if(stroke)g.stroke(p);else g.fill(p);g.restore();
  g.strokeStyle=PINTURA;g.fillStyle=PINTURA;g.lineWidth=2.1;if(stroke)g.stroke(p);else g.fill(p);
  g.restore();
  // Pintura saltada: se borran manchitas fijas (semilla por cara).
  g.globalCompositeOperation='source-atop';g.fillStyle=MARFIL_GASTADO;
  for(let i=0;i<26;i++){g.beginPath();g.arc(TEX*.25+r()*TEX*.5,TEX*.25+r()*TEX*.5,2+r()*7,0,Math.PI*2);g.fill();}
  g.globalCompositeOperation='source-over';
 }
 const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;return t;
}

// Dodecaedro con aristas achaflanadas: 12 pentágonos (uno por cara, con su textura), 30 franjas y
// 20 triángulos en las esquinas. Cada vértice lleva la normal de su cara: el chaflán se sombrea
// como una arista redondeada.
function buildGeometry(){
 const pos=[],nor=[],uv=[],groups=[];
 const shrunk=D12_FACES.map(f=>{const c=scale(f.center,R);return f.points.map(p=>add(c,scale(sub(scale(p,R),c),CHAMFER)));});
 const push=(p,n,u=[0,0])=>{pos.push(...p);nor.push(...n);uv.push(...u);};
 D12_FACES.forEach((f,i)=>{const start=pos.length/3,c=scale(f.center,R),pts=shrunk[i],toUv=p=>{const d=sub(p,c);return [.5+dot(d,f.right)*1.35,.5+dot(d,f.up)*1.35];};
  for(let k=0;k<5;k++){push(c,f.normal,toUv(c));push(pts[k],f.normal,toUv(pts[k]));push(pts[(k+1)%5],f.normal,toUv(pts[(k+1)%5]));}
  groups.push([start,15,i]);});
 const bevelStart=pos.length/3,owners=new Map();
 D12_FACES.forEach((f,i)=>f.points.forEach((p,k)=>{const id=key(p);if(!owners.has(id))owners.set(id,[]);owners.get(id).push([i,k]);}));
 const at=(i,p)=>shrunk[i][D12_FACES[i].points.findIndex(q=>key(q)===key(p))];
 const done=new Set();
 D12_FACES.forEach((f,i)=>f.points.forEach((a,k)=>{const b=f.points[(k+1)%5],edge=[key(a),key(b)].sort().join('|');if(done.has(edge))return;done.add(edge);
  const j=D12_FACES.findIndex((g,gi)=>gi!==i&&g.points.some(q=>key(q)===key(a))&&g.points.some(q=>key(q)===key(b)));const n1=f.normal,n2=D12_FACES[j].normal;
  const a1=at(i,a),b1=at(i,b),a2=at(j,a),b2=at(j,b);/* antihorario visto desde afuera */push(a1,n1);push(b2,n2);push(b1,n1);push(a1,n1);push(a2,n2);push(b2,n2);}));
 for(const list of owners.values()){const [[i0],[i1],[i2]]=list,p=D12_FACES[i0].points[list[0][1]],tri=[[i0,at(i0,p)],[i1,at(i1,p)],[i2,at(i2,p)]];
  // Orden antihorario visto desde afuera.
  const [x,y,z]=tri.map(t=>t[1]),n=[(y[1]-x[1])*(z[2]-x[2])-(y[2]-x[2])*(z[1]-x[1]),(y[2]-x[2])*(z[0]-x[0])-(y[0]-x[0])*(z[2]-x[2]),(y[0]-x[0])*(z[1]-x[1])-(y[1]-x[1])*(z[0]-x[0])];
  const order=dot(n,p)>0?tri:[tri[0],tri[2],tri[1]];for(const [fi,q] of order)push(q,D12_FACES[fi].normal);}
 groups.push([bevelStart,pos.length/3-bevelStart,12]);
 const geo=new BufferGeometry();geo.setAttribute('position',new Float32BufferAttribute(pos,3));geo.setAttribute('normal',new Float32BufferAttribute(nor,3));geo.setAttribute('uv',new Float32BufferAttribute(uv,2));
 for(const [start,count,material] of groups)geo.addGroup(start,count,material);return geo;
}

export function webglAvailable(canvas){try{return !!(canvas.getContext('webgl2')||canvas.getContext('webgl'));}catch{return false;}}
// faces: el resultado de cada cara, en el orden del motor (los mismos datos que el D12 plano).
export function createD12View(canvas,{faces,paths,seed=1}){
 const renderer=new WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});
 renderer.outputColorSpace=SRGBColorSpace;renderer.setPixelRatio(Math.min(2,globalThis.devicePixelRatio||1));
 const scene=new Scene(),camera=new PerspectiveCamera(26,1,.1,20);camera.position.set(0,0,4.7);
 const materials=faces.map((outcome,i)=>new MeshStandardMaterial({map:faceTexture(outcome,paths,seed*31+i+1),roughness:.78,metalness:0}));
 materials.push(new MeshStandardMaterial({color:MARFIL_GASTADO,roughness:.85,metalness:0}));
 const mesh=new Mesh(buildGeometry(),materials);scene.add(mesh);
 const warm=new DirectionalLight('#FFD9A0',2.4);warm.position.set(-.8,3,2.4);scene.add(warm);
 scene.add(new HemisphereLight('#9FB4D0','#1B1F24',.55),new AmbientLight('#FFFFFF',.18));
 let size='',last='';
 return {
  render([x,y,z,w],lift=0){
   const r=canvas.getBoundingClientRect(),s=Math.round(r.width)+'x'+Math.round(r.height);
   if(s!==size){size=s;renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);camera.updateProjectionMatrix();last='';}
   const k=[x,y,z,w,lift].map(v=>v.toFixed(5)).join(',');if(k===last)return false;last=k;
   mesh.quaternion.set(x,y,z,w);mesh.position.y=lift;renderer.render(scene,camera);return true;
  },
  dispose(){mesh.geometry.dispose();for(const m of materials){m.map?.dispose();m.dispose();}renderer.dispose();}
 };
}
