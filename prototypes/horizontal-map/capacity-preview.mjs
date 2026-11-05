// Biblioteca QA: monta la MISMA vista con una proyección de presentación
// sintética. No importa motor, no cambia partida ni se distribuye en producto.
import {createSearchMapView} from '../action-map/map-view.mjs';
import {createMovementController} from '../movement-map/movement-controller.mjs';
import {createSearchController} from '../search-map/search-controller.mjs';
import {createActionController} from '../action-map/action-controller.mjs';
export async function mountCapacity(projection){
 const send=()=>{throw Error('La escena QA de capacidad no ejecuta comandos');},movement=createMovementController({send}),search=createSearchController({send}),action=createActionController({send});
 movement.update(projection);search.update(projection);action.update(projection);
 const view=await createSearchMapView({movement,search,action,onSearchNative:()=>{}});
 view.setState(projection);view.setActive(true);document.getElementById('map-app').hidden=false;document.getElementById('reference-frame').hidden=true;return view;
}
