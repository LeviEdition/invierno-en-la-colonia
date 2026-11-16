// Biblioteca QA: monta la MISMA vista con una proyección de presentación
// sintética. No importa motor, no cambia partida ni se distribuye en producto.
import {createSearchMapView} from '../map-view.mjs';
import {createMovementController} from '../movimiento/movement-controller.mjs';
import {createSearchController} from '../busqueda/search-controller.mjs';
import {createActionController} from '../acciones/action-controller.mjs';
export async function mountCapacity(projection){
 const send=()=>{throw Error('La escena QA de capacidad no ejecuta comandos');},movement=createMovementController({send}),search=createSearchController({send}),action=createActionController({send});
 movement.update(projection);search.update(projection);action.update(projection);
 const view=await createSearchMapView({movement,search,action,onSearchNative:()=>{}});
 document.body.dataset.presentation='map';const badge=document.createElement('div');badge.className='qa-notice';badge.textContent='QA · Ocupación máxima sintética · No es una partida';document.getElementById('map-app').prepend(badge);view.setState(projection);view.setActive(true);document.getElementById('map-app').hidden=false;document.getElementById('reference-frame').hidden=true;return {...view,async destroy(){badge.remove();return view.destroy();}};
}
