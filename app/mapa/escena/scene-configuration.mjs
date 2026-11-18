import geometry from './scene.json';import atmosphere from './atmosphere.json';
import capacities from '../../../config/horizontal-capacities.json';
import originals from '../../../assets/mapa-horizontal/manifest.json';
const mapSource=originals.files.find(r=>r.file===originals.activeMap);
// La textura activa puede tener más resolución que el mundo (mapa-2x.webp: 3342×1882
// para un mundo de 1671×941). Se muestra a escala mundo/textura; ninguna coordenada
// del mundo cambia. La escala tiene que ser la misma en los dos ejes.
export const mapTextureScale=geometry.bounds.width/mapSource.dimensions[0];
if(Math.abs(geometry.bounds.height/mapSource.dimensions[1]-mapTextureScale)>1e-9)throw Error('La textura del mapa no conserva la proporción del mundo');
// maxZoom: zoom máximo respecto del tamaño lógico del mundo (1 = un píxel lógico por píxel CSS).
const scene={...geometry,bounds:{...geometry.bounds,sourceWidth:mapSource.dimensions[0],sourceHeight:mapSource.dimensions[1],...(geometry.maxZoom?{maxZoom:geometry.maxZoom}:{})},zones:geometry.zones.map(z=>{if(z.accesses.length!==capacities[z.id])throw Error('Accesos incompatibles: '+z.id);return {...z,exteriorCapacity:capacities[z.id]};})};
import uploaded from '../render/kit/uploaded-kit.json';
import oldManifest from '../../../kit_arte_h33/manifest.json';
import oldScene from '../render/maqueta/scene.json';
import {makeMockupKit} from '../render/maqueta/assets.mjs';
import * as camera from './camera.mjs';
import {createHorizontalEnvironment as createAtmosphereView} from './environment-view.mjs';
export {scene,atmosphere,camera,createAtmosphereView};
const inherited=makeMockupKit(oldScene,uploaded,oldManifest).assets.filter(a=>a.id!=='map');
for(const a of inherited)if(!a.presentation)a.scale=a.id==='zombie'?scene.actorScale.zombie:scene.actorScale.barricade;
const image=id=>{const r=originals.files.find(r=>r.file===originals.activeMap);return {id,kind:'image',file:'../../'+r.file,width:r.dimensions[0],height:r.dimensions[1],bytes:r.bytes,sha256:r.sha256,alpha:r.mode==='RGBA',pivot:{x:0,y:0},scale:mapTextureScale,visibleBounds:{x:0,y:0,width:r.dimensions[0],height:r.dimensions[1]},provenance:{manifest:'assets/mapa-horizontal/manifest.json',uploadCommit:originals.activeMapCommit},provisional:true};};
export const kit={assets:[image('map'),...inherited],bounds:scene.bounds,buildingPosition:scene.zones.find(z=>z.id==='colonia').center,survivorPositions:[],accessPositions:[]};
