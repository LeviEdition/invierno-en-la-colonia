// Plan completo del laboratorio SP-04. Reproduce todas las cifras del informe 102:
//   node lab/sp04/correr.mjs                      (500 partidas por celda)
//   node lab/sp04/correr.mjs --partidas 200       (más rápido, mismas semillas 1..200)
//   node lab/sp04/correr.mjs --ejemplo 17 --escenario B --politica ia-referencia
// Semillas: la partida i de cada celda usa semillaC14(i) = i·2654435761 mod 2^32
// (semillas consecutivas harían que el primer sorteo, el objetivo, cayera siempre en
// la misma franja). Todas las celdas comparten semillas, así que el estado inicial
// de cada partida es idéntico entre variantes y políticas. Solo se escriben
// agregados; nunca registros por partida.
import {mkdir,writeFile} from 'node:fs/promises';
import {jugarPartida} from './partida.mjs';
import {agregar,porRonda,aCsv} from './metricas.mjs';
import {nombresDePoliticas} from './politicas.mjs';
import {escenarios,nombresDeEscenarios} from './escenarios.mjs';
import {formulasDados,formulasComida,factoresZombis} from './motor-laboratorio.mjs';
import {semillaC14} from './azar.mjs';

const args=process.argv.slice(2),opcion=(k,d)=>{const i=args.indexOf('--'+k);return i>=0?args[i+1]:d;};
const partidasPorCelda=Number(opcion('partidas',500)),salida=opcion('salida','lab/sp04/resultados');

export function planPrincipal(){
 const celdas=[];
 for(const escenario of nombresDeEscenarios)for(const variante of ['dos-grupos','un-grupo'])for(const politica of nombresDePoliticas)celdas.push({bloque:'principal',escenario,variante,politica,dados:'v99',crisis:2,comida:'v99',zombis:'v99'});
 return celdas;
}
export function planBarrido(){
 const celdas=[],base={bloque:'barrido',variante:'un-grupo',politica:'ia-referencia'};
 for(const escenario of ['A','B']){
  for(const dados of Object.keys(formulasDados))for(const crisis of [1,2,3])celdas.push({...base,escenario,dados,crisis,comida:'v99',zombis:'v99'});
  for(const comida of Object.keys(formulasComida).filter(k=>k!=='v99'))celdas.push({...base,escenario,dados:'v99',crisis:2,comida,zombis:'v99'});
  for(const zombis of Object.keys(factoresZombis).filter(k=>k!=='v99'))celdas.push({...base,escenario,dados:'v99',crisis:2,comida:'v99',zombis});
 }
 return celdas;
}
export async function correrCelda(celda,n){
 const partidas=[];
 for(let i=1;i<=n;i++)partidas.push(await jugarPartida({semilla:semillaC14(i),...sinBloque(celda)}));
 return partidas;
}
const sinBloque=({bloque,...resto})=>resto;
const clave=c=>[c.bloque,c.escenario,c.variante,c.politica,c.dados,'crisis'+c.crisis,c.comida,c.zombis].join('/');

async function ejemplo(){
 const semilla=Number(opcion('ejemplo')),r=await jugarPartida({semilla,escenario:opcion('escenario','A'),politica:opcion('politica','ia-referencia'),variante:opcion('variante','un-grupo'),dados:opcion('dados','v99'),crisis:Number(opcion('crisis',2)),comida:opcion('comida','v99'),zombis:opcion('zombis','v99')});
 console.log('Semilla',semilla,'·',r.inicial.objetivo,'·',r.inicial.necesidad,'muestras en',r.inicial.rondas,'rondas · resultado:',r.resultado,'en la ronda',r.rondaFin);
 for(const ronda of r.rondas){
  const k=r.crisis.find(x=>x.ronda===ronda.ronda),col=r.colonia.find(x=>x.ronda===ronda.ronda),comp=ronda.competencia;
  console.log(`\nRonda ${ronda.ronda} · vivos ${ronda.vivos} · dados ${ronda.dadosTotal} · comida ${ronda.comida} · moral ${ronda.moral} · muestras ${ronda.muestras}`+(k?` · crisis ${k.tipo} (${k.aportes}/${k.necesidad}, ${k.exito?'superada':'fallida: '+k.fallo})`:''));
  if(comp)console.log(`  demanda abastecer ${comp.demandaAbastecer} (defensa ${comp.defensa}, crisis ${comp.crisis}, comida ${comp.comida}) · demanda objetivo ${comp.demandaObjetivo} · ${comp.clase}`);
  const i=r.traza.indexOf('— ronda '+ronda.ronda),j=r.traza.indexOf('— ronda '+(ronda.ronda+1));
  console.log('  '+r.traza.slice(i+1,j<0?undefined:j).join(' · '));
  console.log('  dados: '+r.dados.filter(d=>d.ronda===ronda.ronda).map(d=>`${d.nombre} ${d.accion}${d.detalle?'→'+d.detalle:''} (${d.valor}, ${d.categoria})`).join(' · ')+(ronda.noUsados?` · sin usar ${ronda.noUsados}`:''));
  if(col)console.log(`  colonia: comida ${col.comidaAntes}→${col.comidaDespues} (necesidad ${col.necesidad}${col.hambreNueva?', HAMBRE':''}) · moral ${col.moralAntes}→${col.moralDespues}`);
  for(const m of r.muertes.filter(m=>m.ronda===ronda.ronda&&m.causa!=='escenario de laboratorio'))console.log(`  ☠ ${m.nombre}: ${m.causa}`);
 }
}
async function todo(){
 await mkdir(salida,{recursive:true});
 const celdas=[...planPrincipal(),...planBarrido()],resumen=[],rondas=[],inicio=Date.now();
 for(const [k,celda] of celdas.entries()){
  const t=Date.now(),partidas=await correrCelda(celda,partidasPorCelda),a=agregar(partidas);
  resumen.push({...celda,...a});
  for(const fila of porRonda(partidas))rondas.push({...celda,...fila});
  console.error(`${k+1}/${celdas.length} ${clave(celda)} · victoria ${Math.round(a.victoria*100)}% · ${Date.now()-t} ms`);
 }
 await writeFile(salida+'/resumen.csv',aCsv(resumen));
 await writeFile(salida+'/por-ronda.csv',aCsv(rondas));
 await writeFile(salida+'/README.md',`# Resultados SP-04\n\nGenerados con \`node lab/sp04/correr.mjs --partidas ${partidasPorCelda}\` (${celdas.length} celdas, semillas semillaC14(1..${partidasPorCelda}), ${Math.round((Date.now()-inicio)/1000)} s).\n\n- \`resumen.csv\`: una fila por celda con los agregados de la partida completa.\n- \`por-ronda.csv\`: una fila por celda y ronda (dados, comida, moral y clase de decisión).\n\nLas columnas se describen en docs/102-laboratorio-sp04-un-grupo.md.\n`);
 console.error('Listo:',salida);
}
if(import.meta.url===new URL(process.argv[1],'file://').href){if(args.includes('--ejemplo'))await ejemplo();else await todo();}
