export const unified=()=>document.body.dataset.experience==='unified';
export function present(dialog,{exclusive=false}={}){
 if(!unified()){if(!dialog.open)dialog.showModal();return;}
 if(!dialog.open)dialog.dataset.opener=document.activeElement?.id||'menu-toggle';
 const mode=exclusive?'exclusive':'context',changed=dialog.dataset.surface!==mode;
 if(changed&&dialog.open)dialog.close();dialog.dataset.surface=mode;
 // Sesión 7 (informe 126): lo que resuelve una acción de turno (data-stage) va al papel del
 // centro; lo que se consulta (Registro, Ajustes, inventario para equipar) va al expediente.
 const stage=dialog.dataset.stage==='true'&&document.getElementById('action-stage');
 const parent=exclusive?document.body:stage||document.getElementById('context-workspace');
 if(dialog.parentElement!==parent)parent.append(dialog);
 if(exclusive){for(const other of document.querySelectorAll('dialog[open]'))if(other!==dialog)other.close();if(!dialog.open)dialog.showModal();}
 else if(!dialog.open)dialog.show();
}
export function clearSurface(dialog){if(dialog.open)dialog.close();}
