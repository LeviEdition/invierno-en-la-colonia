// Papeles que se desplazan (ajustes 2 de la sesión 7; guía 109 §8): si el contenido no entra,
// un fundido en el borde avisa que hay más (arriba, abajo o ambos). El desplazamiento es el
// nativo del navegador: rueda, teclado (con el foco en una carta o botón del papel) y tacto.
// Solo presentación.
export function scrollEdges({scrollTop=0,scrollHeight=0,clientHeight=0}={}){
 const more=scrollHeight-clientHeight;if(!(more>1))return 'none';
 const top=scrollTop>1,bottom=scrollTop<more-1;return top&&bottom?'both':top?'top':bottom?'bottom':'none';
}
export function mountScrollHint(element,{signal}={}){
 if(!element)return ()=>{};
 const paint=()=>{const v=scrollEdges(element);if(element.dataset.scroll!==v)element.dataset.scroll=v;};
 element.addEventListener('scroll',paint,{passive:true,signal});
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(paint):null;resize?.observe(element);
 const mutation=typeof MutationObserver==='function'?new MutationObserver(()=>requestAnimationFrame(paint)):null;mutation?.observe(element,{childList:true,subtree:true});
 signal?.addEventListener('abort',()=>{resize?.disconnect();mutation?.disconnect();},{once:true});
 paint();return paint;
}
