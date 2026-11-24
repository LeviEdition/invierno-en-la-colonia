import {unified} from './surfaces.mjs';
const $=id=>document.getElementById(id),visible=e=>!!e&&!e.hidden&&e.getClientRects().length>0;
export function mountWorkspace({getContext,panel,signal}){
 if(!unified()||!getContext().inventory||!getContext().play||!getContext().cycle)return {render(){}};
 let current=null,opener=null,lastScope=null,lastBarrier=null;
 const {action,search,inventory,play,movement,cycle}=getContext();
 function cancelDrafts(){
  const a=action.inspect(),s=search.inspect(),p=play.inspect(),m=movement.inspect();
  if([a,s,p,m,inventory.inspect()].some(x=>['sending','unknown','presenting','awaiting-decision'].includes(x.phase)))return false;
  if(inventory.inspect().phase==='picking')inventory.cancel();if(a.phase==='picking')action.cancel();if(s.phase==='picking')search.cancel();if(['choosing','confirming'].includes(m.phase))movement.cancel();
  if(p.intent||p.page==='groups')play.close();if(cycle.inspect().phase==='confirming')cycle.cancel();return true;
 }
 function focusBack(){const e=opener&&document.getElementById(opener);(visible(e)?e:$('menu-toggle')).focus({preventScroll:true});opener=null;}
 function closeQueries(){if($('info-dialog').open)$('info-dialog').close();$('settings-panel').hidden=true;if(inventory.inspect().phase==='browsing')inventory.close();if(play.inspect().page==='groups')play.close();}
 document.getElementById('floating-menu').addEventListener('click',e=>{if(!e.target.closest('button'))return;if(!cancelDrafts()){e.preventDefault();e.stopImmediatePropagation();return;}closeQueries();opener=e.target.id||'menu-toggle';},{capture:true,signal});
 $('menu-settings').addEventListener('click',()=>{$('settings-panel').hidden=false;panel(true);document.body.dataset.sheetExpanded='true';render();$('floating-menu').hidden=true;$('menu-toggle').setAttribute('aria-expanded','false');$('settings-close').focus({preventScroll:true});},{signal});
 $('settings-close').addEventListener('click',()=>{$('settings-panel').hidden=true;render();},{signal});
 $('panel-expand').addEventListener('click',()=>{document.body.dataset.sheetExpanded=String(document.body.dataset.sheetExpanded!=='true');$('panel-expand').setAttribute('aria-expanded',document.body.dataset.sheetExpanded);render();},{signal});
 // Cerrar el expediente cierra solo lo que se consulta en él; las acciones de turno viven en la
 // barra y el centro (informe 126) y no se cancelan por cerrarlo.
 $('panel-toggle').addEventListener('click',()=>{if(document.body.dataset.panelOpen==='true'){const i=inventory.inspect();if(i.phase==='picking'&&i.purpose==='manage')inventory.close();closeQueries();}},{capture:true,signal});
 document.addEventListener('keydown',e=>{
  if(e.defaultPrevented||e.key!=='Escape'||document.querySelector('dialog:modal'))return;
  if($('info-dialog').open){e.preventDefault();$('info-dialog').close();render();return;}
  if(!$('settings-panel').hidden){e.preventDefault();$('settings-panel').hidden=true;render();return;}
  if(['browsing','picking'].includes(inventory.inspect().phase)){e.preventDefault();inventory.close();render();return;}
  if(play.inspect().page==='groups'||play.inspect().intent){e.preventDefault();play.close();render();return;}
  if(cycle.inspect().phase==='confirming'){e.preventDefault();cycle.cancel();render();}
 },{signal});
 const technical=$('development-tools');technical.hidden=!new URLSearchParams(location.search).has('dev');
 function render(){const c=getContext(),p=c.projection;if(!p)return;
  const scope=p.play?`${p.play.session}/${p.play.generation}/${p.turn}`:null;const barrier=p.cycle?.decision?.kind==='handover'?'handover':p.ended?'ended':null;if(scope!==lastScope||barrier&&barrier!==lastBarrier){lastScope=scope;lastBarrier=barrier;closeQueries();}else lastBarrier=barrier;
  const candidates=['info-dialog','settings-panel','inventory-dialog','play-dialog','cycle-dialog','search-panel','action-panel','move-planner'];
  // Solo cuenta lo que está dentro del expediente: el papel del centro (#action-stage) no lo abre.
  const chosen=candidates.find(id=>{const e=$(id);return e&&e.closest('#context-workspace')&&(e.tagName==='DIALOG'?e.open&&e.dataset.surface==='context':!e.hidden);})||null;
  const staged=[...($('action-stage')?.children||[])].some(e=>e.tagName==='DIALOG'?e.open:!e.hidden);document.body.dataset.stage=String(staged);
  for(const el of $('context-workspace').children)el.dataset.contextActive=String(el.id===chosen);
  document.body.dataset.contextActive=String(!!chosen);$('context-default').hidden=!!chosen;$('character-navigation').hidden=!!chosen;
  if(chosen&&chosen!==current){opener=opener||$(chosen).dataset.opener||document.activeElement?.id||'menu-toggle';panel(true);document.body.dataset.sheetExpanded='true';$('panel-content').scrollTop=0;}
  if(!chosen&&current)focusBack();current=chosen;
  const titles={'inventory-dialog':'Inventario','play-dialog':play.inspect().page==='groups'?'Grupo y líderes':'Acción','cycle-dialog':'Colonia','settings-panel':'Ajustes','info-dialog':$('dialog-title').textContent,'search-panel':'Buscar','action-panel':$('action-title').textContent,'move-planner':'Moverse'};
  if(chosen)$('panel-title').textContent=titles[chosen]||'Ficha';
  $('panel-expand').hidden=!matchMedia('(max-width:950px)').matches;
  $('panel-expand').textContent=document.body.dataset.sheetExpanded==='true'?'Compactar':'Ampliar';
 }
 return {render,rememberOpener(id){opener=id||'menu-toggle';},inspect:()=>({current})};
}
