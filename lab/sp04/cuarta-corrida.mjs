// Cuarta corrida del laboratorio SP-04 (docs/111): regla B, llegadas a la colonia aunque
// esté vacía. Reproduce todas sus cifras:
//   node lab/sp04/cuarta-corrida.mjs                    (500 partidas por celda)
//   node lab/sp04/cuarta-corrida.mjs --ejemplo 17 --llegadasColonia min3 [--politica …] [--comidaInicial 8]
// Bases: P1 de docs/107 y P1 con comida 8. Variantes de llegadas: v99 · min2 · min3 ·
// fijo3. Políticas: cooperativa, cooperativa-repartida, objetivo, objetivo-repartido.
// Escenarios A y B. Para la mejor variante: rescate del médico jugable (solo heridas),
// retirarse frente a rescatar, con la cooperativa y el corredor repartido.
import {mkdir,writeFile} from 'node:fs/promises';
import {agregar,agregarSegunda,agregarTercera,agregarCuarta,aCsv} from './metricas.mjs';
import {correrCelda} from './segunda-corrida.mjs';
import {P1} from './tercera-corrida.mjs';
import {jugarPartida} from './partida.mjs';
import {mostrarPartida} from './correr.mjs';
import {esPrincipal} from './principal.mjs';

const args=process.argv.slice(2),opcion=(k,d)=>{const i=args.indexOf('--'+k);return i>=0?args[i+1]:d;};
export const ESCENARIOS=['A','B'],POLITICAS=['cooperativa','cooperativa-repartida','objetivo','objetivo-repartido'];
export const BASES={P1:{},'P1 · comida 8':{comidaInicial:8}},VARIANTES=['v99','min2','min3','fijo3'];
export const UMBRAL_VENTAJA=.05,RANGO_COOPERATIVA=[.35,.55];

// Mejor variante: el corredor repartido no domina (ventaja frente a la cooperativa
// ≤ 5 puntos) y la cooperativa queda entre 35 y 55 %; entre las que cumplen, la de
// cooperativa más cerca del 45 %. Si ninguna cumple, la de menor ventaja con la
// cooperativa en ≥ 35 % (o la de menor ventaja, si tampoco), y se informa que no cumple.
export function elegirMejorVariante(filas){
 const cumple=f=>f.ventajaRepartido<=UMBRAL_VENTAJA+1e-9&&f.cooperativa>=RANGO_COOPERATIVA[0]&&f.cooperativa<=RANGO_COOPERATIVA[1];
 const ok=filas.filter(cumple);
 if(ok.length)return {...ok.slice().sort((a,b)=>Math.abs(a.cooperativa-.45)-Math.abs(b.cooperativa-.45))[0],cumple:true};
 const viables=filas.filter(f=>f.cooperativa>=RANGO_COOPERATIVA[0]);
 return {...(viables.length?viables:filas).slice().sort((a,b)=>a.ventajaRepartido-b.ventajaRepartido)[0],cumple:false};
}

async function todo(){
 const n=Number(opcion('partidas',500)),salida=opcion('salida','lab/sp04/resultados/cuarta-corrida'),inicio=Date.now();
 await mkdir(salida,{recursive:true});
 const celdas=[],combos=[];
 const correr=async(pregunta,base,cambios,politicas,etiqueta)=>{
  const vict={};
  for(const escenario of ESCENARIOS)for(const politica of politicas){
   const t=Date.now(),partidas=await correrCelda({...P1,...BASES[base],...cambios,escenario,politica},n);
   const fila={pregunta,base,llegadasColonia:cambios.llegadasColonia,rescate:cambios.rescate??'',escenario,politica,...agregar(partidas),...agregarSegunda(partidas),...agregarTercera(partidas),...agregarCuarta(partidas)};
   celdas.push(fila);vict[politica+escenario]=fila.victoria;
   console.error(`[${pregunta}] ${base} ${etiqueta} ${escenario} ${politica} · victoria ${Math.round(fila.victoria*100)}% · ${Date.now()-t} ms`);
  }
  const fila={pregunta,base,llegadasColonia:cambios.llegadasColonia,rescate:cambios.rescate??''};
  for(const p of politicas){fila[p]=(vict[p+'A']+vict[p+'B'])/2;fila[p+'A']=vict[p+'A'];fila[p+'B']=vict[p+'B'];}
  if(politicas.includes('objetivo-repartido')&&politicas.includes('cooperativa'))fila.ventajaRepartido=fila['objetivo-repartido']-fila.cooperativa;
  combos.push(fila);return fila;
 };
 const filas=[];
 for(const base of Object.keys(BASES))for(const llegadasColonia of VARIANTES)filas.push(await correr('llegadas',base,{llegadasColonia},POLITICAS,llegadasColonia));
 const mejor=elegirMejorVariante(filas);
 for(const rescate of ['retirarse','rescatar'])await correr('rescate',mejor.base,{llegadasColonia:mejor.llegadasColonia,rescate,medico:'jugable-heridas'},['cooperativa','objetivo-repartido'],rescate);
 await writeFile(salida+'/resumen.csv',aCsv(celdas));
 await writeFile(salida+'/ventaja.csv',aCsv(combos));
 await writeFile(salida+'/README.md',`# Resultados SP-04 — cuarta corrida (regla B)\n\nGenerados con \`node lab/sp04/cuarta-corrida.mjs --partidas ${n}\` (${celdas.length} celdas, semillas semillaC14(1..${n}), ${Math.round((Date.now()-inicio)/1000)} s). Informe: docs/111-laboratorio-sp04-cuarta-corrida.md.\n\n- \`resumen.csv\`: una fila por celda (pregunta × base × variante × escenario × política).\n- \`ventaja.csv\`: una fila por combinación: victoria de cada política (media de A y B y por escenario) y ventaja del corredor repartido frente a la cooperativa.\n\nMejor variante (criterio en elegirMejorVariante): ${mejor.base} · ${mejor.llegadasColonia} (${mejor.cumple?'cumple':'no cumple'} ventaja ≤ 5 puntos con la cooperativa entre 35 y 55 %).\n`);
 console.error('Listo:',salida,'· mejor variante',mejor.base,mejor.llegadasColonia,mejor.cumple?'(cumple)':'(no cumple)',Math.round((Date.now()-inicio)/1000)+' s');
}
async function ejemplo(){
 const semilla=Number(opcion('ejemplo')),cfg={...P1,escenario:opcion('escenario','A'),politica:opcion('politica','cooperativa'),llegadasColonia:opcion('llegadasColonia','min3')};
 if(opcion('comidaInicial')!==undefined)cfg.comidaInicial=Number(opcion('comidaInicial'));
 for(const k of ['rescate','medico'])if(opcion(k)!==undefined)cfg[k]=opcion(k);
 const r=await jugarPartida({semilla,...cfg});mostrarPartida(r,semilla);
 console.log('\nGuardia por fase de colonia: '+r.colonia.map(x=>'R'+x.ronda+(x.guardia?' sí':' no')).join(' · '));
 console.log('Desbordes de la colonia: '+(r.desbordesColonia.map(d=>'R'+d.ronda+' '+d.victima).join(' · ')||'ninguno')+' · llegadas extra '+r.llegadasExtraColonia+' · indefensos perdidos '+r.indefensosPerdidos);
}
if(esPrincipal(import.meta.url)){if(args.includes('--ejemplo'))await ejemplo();else await todo();}
