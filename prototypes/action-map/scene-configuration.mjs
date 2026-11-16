import scene from '../hospital-workshop/mockup/scene.json';
import uploaded from '../hospital-workshop/uploaded-kit.json';
import manifest from '../../kit_arte_h33/manifest.json';
import atmosphere from '../movement-map/storm.json';
import {makeMockupKit} from '../hospital-workshop/mockup/assets.mjs';
import * as camera from '../hospital-workshop/mockup/camera.mjs';
import {createAtmosphereView} from '../movement-map/storm-view.mjs';
export {scene,atmosphere,camera,createAtmosphereView};
export const kit=makeMockupKit(scene,uploaded,manifest);
