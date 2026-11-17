// Tercera corrida del laboratorio SP-04 (docs/110). Reproduce todas sus cifras:
//   node lab/sp04/tercera-corrida.mjs                   (500 partidas por celda)
//   node lab/sp04/tercera-corrida.mjs --partidas 100    (más rápido)
//   node lab/sp04/tercera-corrida.mjs --ejemplo 17 --politica objetivo-repartido --dados mas-uno   (una partida sobre P1)
// Base P1 de docs/107: D12, 2 indefensos, comida 6, crisis V9.9, 8 rondas, moral −2,
// equipo perdido, 1 + vivos dados. Escenarios A y B; políticas cooperativa, objetivo
// y objetivo-repartido, las tres sabiendo de los indefensos. Semillas semillaC14(1..n).
//   1. Corredor que reparte: P1 con las tres políticas.
//   2. Indefensos compensados: cocinero (reemplaza a Leo · se suma), 2 + vivos dados, comida 8.
//   3. Médico jugable en el rescate de la ronda 5: retirarse · rescatar con pasiva
//      «heridas» · rescatar con pasiva «heridas o congelación». Sobre P1 y sobre la
//      compensación de 2 que deja a la cooperativa más cerca del 50 %.
import {mkdir,writeFile} from 'node:fs/promises';
import {agregar,agregarSegunda,agregarTercera,aCsv} from './metricas.mjs';
import {palancasBase} from './palancas.mjs';
import {politicasTerceraCorrida} from './politicas.mjs';
import {correrCelda} from './segunda-corrida.mjs';
import {esPrincipal} from './principal.mjs';
import {jugarPartida} from './partida.mjs';
import {mostrarPartida} from './correr.mjs';

const args=process.argv.slice(2),opcion=(k,d)=>{const i=args.indexOf('--'+k);return i>=0?args[i+1]:d;};
export const ESCENARIOS=['A','B'];
export const P1=Object.freeze({variante:'un-grupo',dados:'v99',crisis:2,comida:'v99',zombis:'v99',...palancasBase,exposicion:'d12',indefensos:2,comidaInicial:6,crisisFallida:'v99',moralMuerte:2,equipoMuerto:'perdido',rondasObjetivo:8,conoceIndefensos:true});
export const compensaciones={'cocinero-reemplaza':{cocinero:'reemplaza'},'cocinero-suma':{cocinero:'suma'},'dados-2+vivos':{dados:'mas-uno'},'comida-8':{comidaInicial:8}};
export const rescates={retirarse:{rescate:'retirarse'},'rescatar-heridas':{rescate:'rescatar',medico:'jugable-heridas'},'rescatar-heridas-congelacion':{rescate:'rescatar',medico:'jugable-heridas-congelacion'}};

// La compensación «más cerca del 50 %»: la de victoria cooperativa media (A y B) más
// próxima a 0,5. Solo elige la base extra de la pregunta 3; no es una recomendación.
export const masCercaDel50=filas=>filas.slice().sort((a,b)=>Math.abs(a.cooperativa-.5)-Math.abs(b.cooperativa-.5))[0];

async function todo(){
 const n=Number(opcion('partidas',500)),salida=opcion('salida','lab/sp04/resultados/tercera-corrida'),inicio=Date.now();
 await mkdir(salida,{recursive:true});
 const celdas=[],combos=[];
 const correr=async(pregunta,nombre,cambios,politicas=politicasTerceraCorrida)=>{
  const combo={...P1,...cambios},vict={};
  for(const escenario of ESCENARIOS)for(const politica of politicas){
   const t=Date.now(),partidas=await correrCelda({...combo,escenario,politica},n);
   const fila={pregunta,combinacion:nombre,escenario,politica,...cambiosTexto(cambios),...agregar(partidas),...agregarSegunda(partidas),...agregarTercera(partidas)};
   celdas.push(fila);vict[politica+escenario]=fila.victoria;
   console.error(`[${pregunta}] ${nombre} ${escenario} ${politica} · victoria ${Math.round(fila.victoria*100)}% · ${Date.now()-t} ms`);
  }
  const m=pol=>(vict[pol+'A']+vict[pol+'B'])/2;
  const fila={pregunta,combinacion:nombre,cooperativa:m('cooperativa'),objetivo:m('objetivo'),repartido:m('objetivo-repartido'),cooperativaA:vict.cooperativaA,cooperativaB:vict.cooperativaB,objetivoA:vict.objetivoA,objetivoB:vict.objetivoB,repartidoA:vict['objetivo-repartidoA'],repartidoB:vict['objetivo-repartidoB']};
  if(politicas.includes('cooperativa-repartida'))Object.assign(fila,{cooperativaRepartida:m('cooperativa-repartida'),cooperativaRepartidaA:vict['cooperativa-repartidaA'],cooperativaRepartidaB:vict['cooperativa-repartidaB']});
  fila.ventajaObjetivo=fila.objetivo-fila.cooperativa;fila.ventajaRepartido=fila.repartido-fila.cooperativa;fila.ventajaMejorCorredor=Math.max(fila.ventajaObjetivo,fila.ventajaRepartido);
  combos.push(fila);return fila;
 };
 // Pregunta 1, más un diagnóstico: la cooperativa con el mismo destino repartido.
 await correr('1','P1',{},[...politicasTerceraCorrida,'cooperativa-repartida']);
 const filas2=[];for(const [nombre,cambios] of Object.entries(compensaciones))filas2.push(await correr('2',nombre,cambios));
 const base3=masCercaDel50(filas2).combinacion;
 for(const [nombreBase,cambiosBase] of [['P1',{}],[base3,compensaciones[base3]]])
  for(const [nombre,cambios] of Object.entries(rescates))await correr('3',nombreBase+' · '+nombre,{...cambiosBase,...cambios});
 await writeFile(salida+'/resumen.csv',aCsv(celdas));
 await writeFile(salida+'/ventaja.csv',aCsv(combos));
 await writeFile(salida+'/README.md',`# Resultados SP-04 — tercera corrida\n\nGenerados con \`node lab/sp04/tercera-corrida.mjs --partidas ${n}\` (${celdas.length} celdas, semillas semillaC14(1..${n}), ${Math.round((Date.now()-inicio)/1000)} s). Informe: docs/110-laboratorio-sp04-tercera-corrida.md.\n\n- \`resumen.csv\`: una fila por celda (pregunta × combinación × escenario × política).\n- \`ventaja.csv\`: una fila por combinación: victoria de cada política (media de A y B y por escenario) y ventaja de cada corredor frente a la cooperativa.\n\nBase extra de la pregunta 3 (compensación más cerca del 50 % cooperativo): ${base3}.\n`);
 console.error('Listo:',salida,Math.round((Date.now()-inicio)/1000)+' s');
}
const cambiosTexto=c=>({cocinero:c.cocinero??'',dados:c.dados??'v99',comidaInicial:c.comidaInicial??6,rescate:c.rescate??'',medico:c.medico??''});
async function ejemplo(){
 const semilla=Number(opcion('ejemplo')),cfg={...P1,escenario:opcion('escenario','A'),politica:opcion('politica','cooperativa')};
 for(const k of ['dados','cocinero','rescate','medico'])if(opcion(k)!==undefined)cfg[k]=opcion(k);
 if(opcion('comidaInicial')!==undefined)cfg.comidaInicial=Number(opcion('comidaInicial'));
 const r=await jugarPartida({semilla,...cfg});mostrarPartida(r,semilla);
 if(r.rescate?.ocurrio)console.log(`
Rescate: ${r.rescate.rescatista} · ${cfg.rescate} · ${r.rescate.rescatistaMuere?'muere':'vive'} · médico ${r.rescate.medico?'incorporado':'no'} · curas ${r.rescate.curas}`);
}
if(esPrincipal(import.meta.url)){if(args.includes('--ejemplo'))await ejemplo();else await todo();}
