import {createReferenceData as referenceData} from '../../src/domain/reference-data.mjs';
import capacities from '../../config/horizontal-capacities.json' with {type:'json'};
export function createReferenceData(){return {...referenceData(),zcap:['colonia','supermercado','hospital','comisaria','gasolinera','escuela','biblioteca'].map(id=>capacities[id])};}
