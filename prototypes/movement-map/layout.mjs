import {layoutState as referenceLayout} from '../state-map/layout.mjs';
// Asignación explícita, única y nunca compactada al morir o llegar alguien.
export const provisionalPortraits=Object.freeze({h0:'survivor-portrait-1',h1:'survivor-portrait-2',a1:'survivor-portrait-3',a0:'survivor-portrait-4'});
export const portraitFor=id=>provisionalPortraits[id]||null;
export const initials=name=>(name||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
export function layoutState(state,scene){
 const layout=referenceLayout(state,scene);
 for(const c of layout.characters){c.portraitId=portraitFor(c.id);c.initials=initials(c.name);}
 layout.nodes=layout.nodes.filter(n=>n.role!=='survivor'||portraitFor(n.id.slice('person:'.length))).map(n=>n.role==='survivor'?{...n,assetId:portraitFor(n.id.slice('person:'.length))}:n);
 return layout;
}
