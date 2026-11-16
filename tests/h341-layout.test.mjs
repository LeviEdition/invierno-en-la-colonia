import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {layoutState,portraitFor} from '../prototypes/state-map/layout.mjs';
const scene=JSON.parse(await readFile(new URL('../prototypes/hospital-workshop/mockup/scene.json',import.meta.url)));
const locations=Array.from({length:7},(_,i)=>({id:'place-'+i,engineIndex:i,name:'Localidad '+i,capacity:i===0?12:4,exteriorCapacity:i===0?12:4,zombies:0,barricades:0,helpless:0}));
const state=characters=>({blocked:null,characters,locations:structuredClone(locations)});
test('H3.4.1 dibujo: gasolinera conserva capacidad real y expone todos los excedentes visuales',()=>{
 const characters=Array.from({length:4},(_,i)=>({id:'h'+i,name:'Nombre '+i,locationId:'place-4',playerId:'human'})),data=state(characters),before=structuredClone(data),layout=layoutState(data,scene),gas=layout.locations.find(l=>l.id==='place-4');assert.equal(gas.drawnCharacters.length,2);assert.deepEqual(gas.characterOverflow,['h2','h3']);assert.equal(gas.engineCapacity,4);assert.equal(gas.characterIds.length,4);assert.equal(layout.nodes.filter(n=>n.role==='survivor').length,2);assert.deepEqual(data,before);
});
test('H3.4.1 dibujo: espacios compartidos, vacíos y excedente de ocupación no crean reglas',()=>{
 const data=state([]);data.locations[2]={...data.locations[2],zombies:3,barricades:3,exteriorCapacity:6};const l=layoutState(data,scene),hospital=l.locations.find(z=>z.id==='place-2');assert.equal(hospital.accesses.length,4);assert.equal(hospital.externalOverflow,2);assert.equal(hospital.zombies,3);assert.equal(hospital.barricades,3);assert.equal(l.nodes.filter(n=>n.role==='zombie'||n.role==='barricade').length,4);assert.ok(l.locations.find(z=>z.id==='place-5').accesses.every(a=>a.occupant==='empty'));
});
test('H3.4.1 dibujo: compartir retrato no altera nombres/IDs y la asignación es estable',()=>{
 const portraits=new Map();let pair;for(let i=0;i<20&&!pair;i++){const id='h'+i,p=portraitFor(id);if(portraits.has(p))pair=[portraits.get(p),id];else portraits.set(p,id);}const data=state(pair.map((id,i)=>({id,name:i?'Otra persona':'Nombre original',locationId:'place-0',playerId:i?'ai':'human'}))),l=layoutState(data,scene);assert.equal(l.characters[0].portraitId,l.characters[1].portraitId);assert.notEqual(l.characters[0].id,l.characters[1].id);assert.notEqual(l.characters[0].name,l.characters[1].name);data.characters[0].locationId='place-2';assert.equal(layoutState(data,scene).characters.find(c=>c.id===pair[0]).portraitId,l.characters[0].portraitId);
});
test('H3.4.1 dibujo: una localidad sin correspondencia permanece consultable y el bloqueo vacía el mapa',()=>{
 const c={id:'h99',name:'Fuera del dibujo',locationId:'place-7',playerId:'human'},l=layoutState(state([c]),scene);assert.deepEqual(l.unmappedCharacterIds,['h99']);assert.equal(layoutState({blocked:'handover',characters:[],locations:[]},scene).nodes.length,1);
});
