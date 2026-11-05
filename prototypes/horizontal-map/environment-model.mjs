const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function vegetationOffset(g,x,y,time,wind){
 const [left,top,w,h]=g.rect;if(x<=left||x>=left+w||y<=top||y>=g.anchor.y-12||!wind)return 0;
 const side=Math.sin(Math.PI*(x-left)/w)**2,root=clamp((g.anchor.y-12-y)/(h-12),0,1),crown=Math.sin(Math.PI*(y-top)/h);
 return g.amplitude*side*root*crown*clamp(wind/150,-1,1)*(.68+.32*Math.sin(time*.8+g.phase));
}
export function lightLevel(l,time){return l.base+l.variation*(.75*Math.sin(time*2*Math.PI/l.period+l.phase)+.25*Math.sin(time*2*Math.PI/(l.period*1.73)+l.phase*2));}
export function polygonInterior(x,y,polygon){let inside=false,distance=Infinity;for(let i=0;i<polygon.length;i++){const [a,b]=polygon[i],[c,d]=polygon[(i+1)%polygon.length],dx=c-a,dy=d-b,t=clamp(((x-a)*dx+(y-b)*dy)/(dx*dx+dy*dy||1),0,1);distance=Math.min(distance,Math.hypot(x-a-t*dx,y-b-t*dy));if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;}return inside?distance:0;}
export function unlitColor([r,g,b],source,edge){const warmth=clamp((r-b-4)/30,0,1)*clamp(edge/(source?2:5),0,1),level=(r+g+b)/3,target=source?[level*.20,level*.21,level*.26]:[b*.84,b*.80,b];return [r,g,b].map((c,i)=>c+(target[i]-c)*warmth);}
export function staticVegetationRects(bounds,groups){
 let rects=[[0,0,bounds.width,bounds.height]];
 for(const g of groups){const [x,y,w,h]=g.rect;rects=rects.flatMap(([a,b,c,d])=>{const l=Math.max(a,x),t=Math.max(b,y),r=Math.min(a+c,x+w),e=Math.min(b+d,y+h);if(l>=r||t>=e)return [[a,b,c,d]];return [[a,b,c,t-b],[a,e,c,b+d-e],[a,t,l-a,e-t],[r,t,a+c-r,e-t]].filter(r=>r[2]>0&&r[3]>0);});}
 return rects;
}
