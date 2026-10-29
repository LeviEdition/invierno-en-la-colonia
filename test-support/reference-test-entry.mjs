// Adaptador EXCLUSIVO de pruebas. El artefacto del producto no importa este archivo.
import {createEngine} from '../src/application/reference-engine.mjs';
import {createUi} from '../src/presentation/reference-view.mjs';
import {createAgent} from '../src/agents/reference-agent.mjs';
const engine=createEngine();
engine.connectPresentation(c=>createUi(c));
engine.connectAutomation(c=>createAgent(c));
Object.defineProperties(globalThis,Object.getOwnPropertyDescriptors(engine.testBindings));
