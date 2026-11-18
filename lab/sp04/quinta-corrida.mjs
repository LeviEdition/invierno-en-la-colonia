// Quinta corrida del laboratorio SP-04 (docs/113): la noche fuera de la colonia.
// Reproduce todas sus cifras:
//   node lab/sp04/quinta-corrida.mjs                    (500 partidas por celda)
//   node lab/sp04/quinta-corrida.mjs --ejemplo 1936384585 --nocheAfuera localidad --regreso true [--comida todos] [--politica cooperativa]
// Variantes: base · regla A (todos comen) · noche/localidad · noche/única · mejor+regla B.
// Bases: P1 y P1·comida8 de docs/107/111. Políticas: cooperativa, cooperativa-repartida,
// objetivo, objetivo-repartido. Escenarios A y B. 500 partidas y semillas de semillaC14.
import {mkdir,writeFile} from 'node:fs/promises';
import {agregar,agregarSegunda,agregarTercera,agregarCuarta,agregarQuinta,aCsv} from './metricas.mjs';
import {correrCelda} from './segunda-corrida.mjs';
import {P1} from './tercera-corrida.mjs';
import {jugarPartida} from './partida.mjs';
import {mostrarPartida} from './correr.mjs';
import {esPrincipal} from './principal.mjs';

const args=process.argv.slice(2),opcion=(k,d)=>{const i=args.indexOf('--'+k);return i>=0?args[i+1]:d;};
export const ESCENARIOS=['A','B'],POLITICAS=['cooperativa','cooperativa-repartida','objetivo','objetivo-repartido'];
export const BASES={P1:{},'P1 · comida 8':{comidaInicial:8}};
export const UMBRAL_VENTAJA=.05,RANGO_COOPERATIVA=[.35,.55];

// Variantes de la quinta corrida.
export const VARIANTES_NOCHE=[
 {id:'base',         label:'Base (como 111)',           cambios:{}},
 {id:'reglaA',       label:'Regla A (todos comen)',      cambios:{comida:'todos'}},
 {id:'noche-loc',    label:'Noche/localidad + regreso',  cambios:{nocheAfuera:'localidad',regreso:true}},
 {id:'noche-unica',  label:'Noche/única + regreso',      cambios:{nocheAfuera:'unica',regreso:true}},
 // Variante 5 se agrega dinámicamente tras conocer la mejor de localidad y única.
];

// Mismo criterio que en 111: menor ventaja corredor–cooperativa con cooperativa ≥ 35 %.
export function elegirMejorNoche(filas){
 const cumple=f=>f.ventajaRepartido<=UMBRAL_VENTAJA+1e-9&&f.cooperativa>=RANGO_COOPERATIVA[0]&&f.cooperativa<=RANGO_COOPERATIVA[1];
 const ok=filas.filter(cumple);
 if(ok.length)return {...ok.slice().sort((a,b)=>Math.abs(a.cooperativa-.45)-Math.abs(b.cooperativa-.45))[0],cumple:true};
 const viables=filas.filter(f=>f.cooperativa>=RANGO_COOPERATIVA[0]);
 return {...(viables.length?viables:filas).slice().sort((a,b)=>a.ventajaRepartido-b.ventajaRepartido)[0],cumple:false};
}

async function todo(){
 const n=Number(opcion('partidas',500)),salida=opcion('salida','lab/sp04/resultados/quinta-corrida'),inicio=Date.now();
 await mkdir(salida,{recursive:true});
 const celdas=[],combos=[];
 const correr=async(variante,base,cambios,politicas)=>{
  const vict={};
  for(const escenario of ESCENARIOS)for(const politica of politicas){
   const t=Date.now(),partidas=await correrCelda({...P1,...BASES[base],...cambios,escenario,politica},n);
   const fila={variante,base,escenario,politica,...agregar(partidas),...agregarSegunda(partidas),...agregarTercera(partidas),...agregarCuarta(partidas),...agregarQuinta(partidas)};
   celdas.push(fila);vict[politica+escenario]=fila.victoria;
   console.error(`[${variante}] ${base} ${escenario} ${politica} · victoria ${Math.round(fila.victoria*100)}% · ${Date.now()-t} ms`);
  }
  const fila={variante,base};
  for(const p of politicas){fila[p]=(vict[p+'A']+vict[p+'B'])/2;fila[p+'A']=vict[p+'A'];fila[p+'B']=vict[p+'B'];}
  if(politicas.includes('objetivo-repartido')&&politicas.includes('cooperativa'))fila.ventajaRepartido=fila['objetivo-repartido']-fila.cooperativa;
  combos.push(fila);return fila;
 };

 // Variantes 1–4 con las dos bases.
 const filasPorVariante=[];
 for(const v of VARIANTES_NOCHE)for(const base of Object.keys(BASES)){
  filasPorVariante.push(await correr(v.id,base,v.cambios,POLITICAS));
 }

 // Variante 5: la mejor de noche/localidad y noche/única, combinada con regla B mínimo 2.
 const nocheCandidatas=filasPorVariante.filter(f=>f.variante==='noche-loc'||f.variante==='noche-unica');
 const mejorNoche=elegirMejorNoche(nocheCandidatas);
 const mejorVarianteNoche=VARIANTES_NOCHE.find(v=>v.id===mejorNoche.variante);
 for(const base of Object.keys(BASES)){
  await correr('mejor+reglaB',base,{...mejorVarianteNoche.cambios,llegadasColonia:'min2'},POLITICAS);
 }

 await writeFile(salida+'/resumen.csv',aCsv(celdas));
 await writeFile(salida+'/ventaja.csv',aCsv(combos));
 await writeFile(salida+'/README.md',`# Resultados SP-04 — quinta corrida (noche fuera de la colonia)\n\nGenerados con \`node lab/sp04/quinta-corrida.mjs --partidas ${n}\` (${celdas.length} celdas, semillas semillaC14(1..${n}), ${Math.round((Date.now()-inicio)/1000)} s). Informe: docs/113-laboratorio-sp04-quinta-corrida.md.\n\n- \`resumen.csv\`: una fila por celda (variante × base × escenario × política).\n- \`ventaja.csv\`: una fila por combinación (variante × base): victoria de cada política (media A y B) y ventaja corredor repartido−cooperativa.\n\nMejor variante de noche (criterio en elegirMejorNoche): ${mejorNoche.base} · ${mejorNoche.variante} (${mejorNoche.cumple?'cumple':'no cumple'} ventaja ≤ 5 puntos con cooperativa entre 35 y 55 %).\nVariante 5: ${mejorVarianteNoche.label} + regla B mínimo 2.\n`);
 console.error('Listo:',salida,'· mejor variante de noche',mejorNoche.base,mejorNoche.variante,mejorNoche.cumple?'(cumple)':'(no cumple)',Math.round((Date.now()-inicio)/1000)+' s');
}

async function ejemplo(){
 const semilla=Number(opcion('ejemplo'));
 const cfg={
  ...P1,
  escenario:opcion('escenario','A'),
  politica:opcion('politica','cooperativa'),
  nocheAfuera:opcion('nocheAfuera',null)||undefined,
  regreso:opcion('regreso','false')==='true',
 };
 // comida y comidaInicial opcionales
 if(opcion('comida')!==undefined)cfg.comida=opcion('comida');
 if(opcion('comidaInicial')!==undefined)cfg.comidaInicial=Number(opcion('comidaInicial'));
 // Limpiar undefined para no pasar palancas inválidas
 for(const k of Object.keys(cfg))if(cfg[k]===undefined)delete cfg[k];
 const r=await jugarPartida({semilla,...cfg});mostrarPartida(r,semilla);
 console.log('\nGuardia por fase de colonia: '+r.colonia.map(x=>'R'+x.ronda+(x.guardia?' sí':' no')).join(' · '));
 console.log('Afuera al caer la noche: '+(r.afueraAlCaerNoche.map(x=>'R'+x.ronda+'×'+x.cantidad).join(' · ')||'ninguno'));
 console.log('Exposiciones de noche: '+(r.exposicionesNoche.map(x=>'R'+x.ronda+' '+x.efecto).join(' · ')||'ninguna'));
 console.log('Muertes de noche: '+r.muertesNoche+' · Regresos: '+r.regresos);
}

if(esPrincipal(import.meta.url)){if(args.includes('--ejemplo'))await ejemplo();else await todo();}
