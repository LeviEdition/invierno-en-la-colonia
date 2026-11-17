// Dodecaedro regular: veinte vértices y doce pentágonos. Solo geometría visual.
const phi=(1+Math.sqrt(5))/2,signs=[-1,1];
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0),sub=(a,b)=>a.map((x,i)=>x-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>{const length=Math.hypot(...a);return a.map(x=>x/length);};
const vertices=[];for(const x of signs)for(const y of signs)for(const z of signs)vertices.push([x,y,z]);
for(const a of signs)for(const b of signs)vertices.push([0,a/phi,b*phi],[a/phi,b*phi,0],[a*phi,0,b/phi]);
const normals=[];for(const a of signs)for(const b of signs)normals.push(unit([0,a*phi,b]),unit([a,0,b*phi]),unit([a*phi,b,0]));
export const D12_FACES=normals.map((normal,index)=>{
 const distance=Math.max(...vertices.map(p=>dot(p,normal))),center=normal.map(x=>x*distance),points=vertices.filter(p=>Math.abs(dot(p,normal)-distance)<1e-8);
 const up=unit(sub(points[0],center)),right=unit(cross(up,normal));
 points.sort((a,b)=>Math.atan2(dot(sub(a,center),up),dot(sub(a,center),right))-Math.atan2(dot(sub(b,center),up),dot(sub(b,center),right)));
 return {face:index+1,normal,center,up,right,points};
});
function rotate(p,angles){const [x,y,z]=angles,cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);const a=[p[0],p[1]*cx-p[2]*sx,p[1]*sx+p[2]*cx],b=[a[0]*cy+a[2]*sy,a[1],-a[0]*sy+a[2]*cy];return [b[0]*cz-b[1]*sz,b[0]*sz+b[1]*cz,b[2]];}
export function projectExposureDie(face,{rolling=false,progress=1,reduced=false}={}){
 const target=D12_FACES[face-1];if(!target)throw RangeError('Cara D12 fuera de rango');
 const remaining=rolling&&!reduced?(1-Math.max(0,Math.min(1,progress)))**3:0,angles=[remaining*7.5,remaining*11,remaining*3];
 const orient=p=>rotate([dot(p,target.right),dot(p,target.up),dot(p,target.normal)],angles),screen=p=>[p[0],-p[1]];
 return D12_FACES.map(f=>{const n=orient(f.normal),c=screen(orient(f.center)),u=screen(orient(f.right)),v=screen(orient(f.up));return {face:f.face,visible:n[2]>1e-7,front:n[2],points:f.points.map(p=>screen(orient(p))),symbolMatrix:[u[0]*.06,u[1]*.06,-v[0]*.06,-v[1]*.06,...c],light:Math.max(0,dot(n,unit([-.4,.7,1])))};});
}
