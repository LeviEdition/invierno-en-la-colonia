import {projectExposureDie} from './exposure-die-geometry.mjs';
const ns='http://www.w3.org/2000/svg',views=new WeakMap();
const path={
 wound:'M0-11C-3-6-8-2-8 3a8 8 0 0 0 16 0C8-2 3-6 0-11Z',
 frost:'M0-11V11M-9.5-5.5L9.5 5.5M-9.5 5.5L9.5-5.5M-3-8L0-5 3-8M-3 8L0 5 3 8M-8.5-1L-4.5-2.6-4-6.5M8.5 1L4.5 2.6 4 6.5M-8.5 1L-4.5 2.6-4 6.5M8.5-1L4.5-2.6 4-6.5',
 bite:'M-9-3Q0-12 9-3M-8 5Q0 12 8 5M-7-5L-5-2M-3-7L-2-3M2-7L2-3M6-5L5-2M-6 6L-5 3M-2 8L-2 4M2 8L2 4M6 6L5 3'
};
const svgNode=(name,attrs={})=>{const n=document.createElementNS(ns,name);for(const [key,value]of Object.entries(attrs))n.setAttribute(key,value);return n;};
function mount(el,die){
 const svg=svgNode('svg',{viewBox:'-2 -2 4 4','aria-hidden':'true',class:'d12-solid'}),caption=document.createElement('span');caption.className='d12-caption';
 const faces=die.faces.map((outcome,index)=>{const die={face:index+1,outcome};const group=svgNode('g',{'data-d12-face':die.face,'data-outcome':die.outcome}),polygon=svgNode('polygon'),symbol=svgNode('g',{class:'d12-symbol d12-'+die.outcome});if(path[die.outcome])symbol.append(svgNode('path',{d:path[die.outcome]}));group.append(polygon,symbol);svg.append(group);return {group,polygon,symbol};});
 el.classList.add('exposure-d12');el.removeAttribute('aria-hidden');el.setAttribute('role','img');el.replaceChildren(svg,caption);const view={faces,caption};views.set(el,view);return view;
}
export function paintExposureDie(el,step){
 const e=step.exposure;el.hidden=step.stage==='travel'||!e.rolled;if(el.hidden)return;
 // El resultado viene del motor. El reloj solo orienta la malla; nunca tira.
 const die=e.die;if(die?.sides!==12){views.delete(el);el.classList.remove('exposure-d12');el.textContent=step.stage==='roll'?String(1+Math.floor(step.elapsed/80)%6):String(e.value??'');return;}
 const view=views.get(el)||mount(el,die),rolling=step.stage==='roll',label=rolling?'Tirando…':die.label;
 el.dataset.face=String(die.face);el.dataset.outcome=die.outcome;el.dataset.rolling=String(rolling);
 const aria='Dado de exposición D12: '+label;if(el.getAttribute('aria-label')!==aria)el.setAttribute('aria-label',aria);
 if(view.caption.textContent!==label)view.caption.textContent=label;
 const mesh=projectExposureDie(die.face,{rolling,progress:step.progress,reduced:step.reduced});
 for(const f of mesh){const node=view.faces[f.face-1];node.group.style.display=f.visible?'':'none';if(!f.visible)continue;node.polygon.setAttribute('points',f.points.map(p=>p.join(',')).join(' '));node.polygon.setAttribute('fill',`hsl(42 29% ${62+f.light*24}%)`);node.symbol.setAttribute('transform','matrix('+f.symbolMatrix.join(' ')+')');}
}
