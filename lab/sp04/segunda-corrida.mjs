// Segunda corrida del laboratorio SP-04 (docs/107). Reproduce todas sus cifras:
//   node lab/sp04/segunda-corrida.mjs                    (500 partidas por celda)
//   node lab/sp04/segunda-corrida.mjs --partidas 100     (más rápido, semillas 1..100)
//   node lab/sp04/segunda-corrida.mjs --criterio v1      (cadena con el primer criterio, en criterio-v1/)
//   node lab/sp04/segunda-corrida.mjs --ejemplo 17 --politica objetivo --indefensos 2 --rondasObjetivo 8 ...
// Mismas semillas que la primera corrida (semillaC14). Un grupo, escenarios A y B,
// políticas cooperativa y objetivo, ambas sabiendo de los indefensos.
//
// Etapas, en el orden de prioridad del encargo. Cada etapa parte de la mejor
// combinación de la anterior según elegirMejor():
//   0. Calibración: configuración de la primera corrida con D6 (debe coincidir con
//      lab/sp04/resultados/resumen.csv) y con D12 (cuánto cambia el dado).
//   1. D12 + moral por muerte (−1/−2) × equipo del muerto (v99/perdido/mazo), objetivo
//      de 8 rondas, 2 indefensos, comida 6. Más la misma base con D6 como referencia.
//   2. Indefensos (0/2/4) × comida inicial (6/3/0) sobre la mejor de 1.
//   3. Crisis fallida (v99/agravada) × duración del objetivo (6/8/10) sobre la mejor de 2.
//   4. Dados (v99/mas-uno/doble) sobre la mejor de 3.
//   5. Rescate del médico (retirarse/rescatar/rescatar-A) sobre la mejor de 4 y sobre
//      la misma con la muerte barata de V9.9 (moral −1, equipo v99). Diagnóstico:
//      rescatar con un médico que no come.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {jugarPartida} from './partida.mjs';
import {agregar,agregarSegunda,porRonda,aCsv} from './metricas.mjs';
import {semillaC14} from './azar.mjs';
import {palancasBase} from './palancas.mjs';
import {mostrarPartida} from './correr.mjs';
import {esPrincipal} from './principal.mjs';

const args=process.argv.slice(2),opcion=(k,d)=>{const i=args.indexOf('--'+k);return i>=0?args[i+1]:d;};
export const ESCENARIOS=['A','B'],POLITICAS=['cooperativa','objetivo'],UMBRAL_COOPERATIVA=.35;
const fijo={variante:'un-grupo',dados:'v99',crisis:2,comida:'v99',zombis:'v99'};
export const baseEtapa1=Object.freeze({...fijo,...palancasBase,exposicion:'d12',indefensos:2,comidaInicial:6,rondasObjetivo:8,conoceIndefensos:true});

// Clave estable de una combinación (sin escenario ni política).
const ejes=['variante','dados','crisis','comida','zombis','exposicion','indefensos','comidaInicial','crisisFallida','moralMuerte','equipoMuerto','rondasObjetivo','rescate','medicoCome','conoceIndefensos'];
export const claveCombinacion=c=>ejes.map(k=>k+'='+(c[k]??'-')).join(';');

// Criterio de «mejor combinación» (documentado en 107 §1.5). ventaja = victoria
// objetivo − victoria cooperativa, promedio de A y B; cooperativa = su victoria media.
// v1 (primer criterio): entre las que dejan a la cooperativa en ≥35 %, la de menor
//    ventaja. Como la ventaja resultó negativa en todas las celdas, v1 premia lo que
//    facilita el juego y la cadena deriva hacia configuraciones fáciles (107 §2.2).
// v2 (vigente): factibles = cooperativa ≥35 % y ventaja ≤ 0. Dentro de 5 puntos de la
//    menor ventaja factible (ruido de 500 partidas), la más exigente: la de menor
//    victoria cooperativa. Si ninguna es factible, la de más victoria cooperativa.
export const BANDA_RUIDO=.05;
export function elegirMejor(filas,criterio='v2'){
 if(criterio==='v1'){
  const ok=filas.filter(f=>f.cooperativa>=UMBRAL_COOPERATIVA);
  return (ok.length?ok.slice().sort((a,b)=>a.ventaja-b.ventaja||b.cooperativa-a.cooperativa):filas.slice().sort((a,b)=>b.cooperativa-a.cooperativa))[0];
 }
 if(criterio!=='v2')throw Error('Criterio desconocido: '+criterio);
 const factibles=filas.filter(f=>f.cooperativa>=UMBRAL_COOPERATIVA&&f.ventaja<=0);
 if(!factibles.length)return filas.slice().sort((a,b)=>b.cooperativa-a.cooperativa)[0];
 const mejor=Math.min(...factibles.map(f=>f.ventaja));
 return factibles.filter(f=>f.ventaja<=mejor+BANDA_RUIDO+1e-9).sort((a,b)=>a.cooperativa-b.cooperativa||a.ventaja-b.ventaja)[0];
}
// Resume una combinación: victoria por política (promedio de escenarios) y ventaja.
export function resumirCombinacion(celdas,combo){
 const v=(pol,esc)=>celdas.find(c=>c.combo===claveCombinacion(combo)&&c.politica===pol&&c.escenario===esc).victoria;
 const media=f=>ESCENARIOS.reduce((s,e)=>s+f(e),0)/ESCENARIOS.length;
 return {combo,cooperativa:media(e=>v('cooperativa',e)),objetivo:media(e=>v('objetivo',e)),ventaja:media(e=>v('objetivo',e)-v('cooperativa',e)),porEscenario:Object.fromEntries(ESCENARIOS.map(e=>[e,{cooperativa:v('cooperativa',e),objetivo:v('objetivo',e)}]))};
}

export async function correrCelda(celda,n){
 const partidas=[];
 for(let i=1;i<=n;i++){const r=await jugarPartida({semilla:semillaC14(i),...celda});if(!r.completa)throw Error('Partida incompleta '+JSON.stringify(celda)+' semilla '+semillaC14(i)+': '+r.error);partidas.push(r);}
 return partidas;
}

async function todo(){
 const n=Number(opcion('partidas',500)),criterio=opcion('criterio','v2'),inicio=Date.now();
 const salida=opcion('salida',criterio==='v2'?'lab/sp04/resultados/segunda-corrida':'lab/sp04/resultados/segunda-corrida/criterio-'+criterio);
 await mkdir(salida,{recursive:true});
 const celdas=[],rondas=[],cache=new Map(),bitacora=[];
 const correr=async(etapa,combo)=>{
  for(const escenario of ESCENARIOS)for(const politica of POLITICAS){
   const celda={...combo,escenario,politica},k=claveCombinacion(combo)+'|'+escenario+'|'+politica;
   if(cache.has(k)){const previa=cache.get(k);if(!previa.etapas.includes(etapa))previa.etapas.push(etapa);continue;}
   const t=Date.now(),partidas=await correrCelda(celda,n),fila={etapas:[etapa],combo:claveCombinacion(combo),escenario,politica,...columnas107(combo),...agregar(partidas),...agregarSegunda(partidas)};
   cache.set(k,fila);celdas.push(fila);
   for(const r of porRonda(partidas))rondas.push({etapa,combo:fila.combo,escenario,politica,...r});
   console.error(`[${etapa}] ${escenario} ${politica} ${fila.combo} · victoria ${Math.round(fila.victoria*100)}% · ${Date.now()-t} ms`);
  }
  return resumirCombinacion(celdas,combo);
 };
 const etapa=async(nombre,combos)=>{const filas=[];for(const c of combos)filas.push(await correr(nombre,c));const mejor=elegirMejor(filas,criterio);bitacora.push({etapa:nombre,filas,mejor});return mejor.combo;};

 // 0. Calibración y efecto del dado sobre la configuración de la primera corrida.
 const primera={...fijo,...palancasBase,conoceIndefensos:false};
 await etapa('0-calibracion',[primera,{...primera,exposicion:'d12'}]);
 await verificarCalibracion(celdas.filter(c=>c.etapas.includes('0-calibracion')&&c.exposicion==='d6'));
 // 1. D12 + costo de muerte.
 const combos1=[];for(const moralMuerte of [1,2])for(const equipoMuerto of ['v99','perdido','mazo'])combos1.push({...baseEtapa1,moralMuerte,equipoMuerto});
 await correr('1-referencia-d6',{...baseEtapa1,exposicion:'d6'});
 const mejor1=await etapa('1-muerte',combos1);
 // 2. Indefensos × comida inicial.
 const combos2=[];for(const indefensos of [0,2,4])for(const comidaInicial of [6,3,0])combos2.push({...mejor1,indefensos,comidaInicial});
 const mejor2=await etapa('2-indefensos-comida',combos2);
 // 3. Crisis × duración.
 const combos3=[];for(const crisisFallida of ['v99','agravada'])for(const rondasObjetivo of [6,8,10])combos3.push({...mejor2,crisisFallida,rondasObjetivo});
 const mejor3=await etapa('3-crisis-duracion',combos3);
 // 4. Dados.
 const mejor4=await etapa('4-dados',['v99','mas-uno','doble'].map(dados=>({...mejor3,dados})));
 // 5. Rescate del médico, con el costo de muerte elegido y con el de V9.9.
 for(const [nombre,base] of [['5-rescate',mejor4],['5-rescate-muerte-v99',{...mejor4,moralMuerte:1,equipoMuerto:'v99'}]])
  await etapa(nombre,['retirarse','rescatar','rescatar-A'].map(rescate=>({...base,rescate})));
 // Diagnóstico: el mismo rescate con un médico que no come, para separar el costo de
 // su comida del costo de la muerte del rescatista.
 await correr('5-diagnostico-medico-no-come',{...mejor4,rescate:'rescatar',medicoCome:false});

 const ventaja=bitacora.flatMap(b=>b.filas.map(f=>({etapa:b.etapa,elegida:f===b.mejor,combo:claveCombinacion(f.combo),cooperativa:f.cooperativa,objetivo:f.objetivo,ventaja:f.ventaja,cooperativaA:f.porEscenario.A.cooperativa,objetivoA:f.porEscenario.A.objetivo,cooperativaB:f.porEscenario.B.cooperativa,objetivoB:f.porEscenario.B.objetivo,cumpleUmbral:f.cooperativa>=UMBRAL_COOPERATIVA})));
 await writeFile(salida+'/resumen.csv',aCsv(celdas.map(({etapas,...f})=>({etapas:etapas.join('+'),...f}))));
 await writeFile(salida+'/ventaja.csv',aCsv(ventaja));
 await writeFile(salida+'/por-ronda.csv',aCsv(rondas));
 const elegidas=bitacora.map(b=>`- ${b.etapa}: \`${claveCombinacion(b.mejor.combo)}\` (cooperativa ${pct(b.mejor.cooperativa)}, objetivo ${pct(b.mejor.objetivo)}, ventaja ${pct(b.mejor.ventaja)})`).join('\n');
 await writeFile(salida+'/README.md',`# Resultados SP-04 — segunda corrida\n\nGenerados con \`node lab/sp04/segunda-corrida.mjs --partidas ${n}${criterio==='v2'?'':' --criterio '+criterio}\` (${celdas.length} celdas, semillas semillaC14(1..${n}), ${Math.round((Date.now()-inicio)/1000)} s). Informe: docs/107-laboratorio-sp04-segunda-corrida.md. Los CSV de la primera corrida (\`../resumen.csv\`, \`../por-ronda.csv\`) no se tocan.\n\n- \`resumen.csv\`: una fila por celda (combinación × escenario × política), con los agregados de la primera corrida y los nuevos.\n- \`ventaja.csv\`: una fila por combinación y etapa: victoria cooperativa y objetivo (promedio de A y B y por escenario), ventaja de correr y si la cooperativa alcanza el 35 %.\n- \`por-ronda.csv\`: una fila por celda y ronda.\n\nCriterio de elección: ${criterio} (ver elegirMejor y docs/107 §1.5).\n\nCombinación elegida en cada etapa:\n\n${elegidas}\n`);
 console.error('Listo:',salida,Math.round((Date.now()-inicio)/1000)+' s');
}
// Las palancas de la tercera corrida (cocinero, médico jugable) no son columnas de
// 107: se omiten para que sus CSV sigan siendo idénticos byte a byte.
const columnas107=({cocinero,medico,...resto})=>resto;
const pct=x=>Math.round(x*1000)/10+' %';

// La configuración de la primera corrida con D6 tiene que dar exactamente lo mismo
// que lab/sp04/resultados/resumen.csv (bloque principal, un grupo). Solo se puede
// comparar con 500 partidas, que es como se generó ese CSV.
async function verificarCalibracion(filas){
 const n=filas[0].partidas;if(n!==500){console.error('Calibración contra la primera corrida: se omite (requiere 500 partidas por celda, hay '+n+')');return;}
 const [cab,...lineas]=(await readFile('lab/sp04/resultados/resumen.csv','utf8')).trim().split('\n'),cols=cab.split(',');
 const previas=lineas.map(l=>Object.fromEntries(l.split(',').map((v,i)=>[cols[i],v])));
 const comparar=['victoria','moral','tiempo','rondaFin','muertesPropiasPorPartida','crisisFallidasPorPartida','partidasConHambre','rondas_competida','rondas_obligada-abastecer','rondas_holgada'];
 for(const f of filas){
  const p=previas.find(x=>x.bloque==='principal'&&x.variante==='un-grupo'&&x.escenario===f.escenario&&x.politica===f.politica);
  for(const k of comparar){const a=String(Math.round(f[k]*1000)/1000),b=p[k];if(a!==b)throw Error(`Calibración rota: ${f.escenario} ${f.politica} ${k} = ${a}, primera corrida ${b}`);}
 }
 console.error('Calibración: la configuración de la primera corrida con D6 reproduce resumen.csv en '+filas.length+' celdas.');
}

async function ejemplo(){
 const semilla=Number(opcion('ejemplo')),num=k=>opcion(k)===undefined?undefined:opcion(k)==='-'?null:Number(opcion(k));
 const cfg={...baseEtapa1,escenario:opcion('escenario','A'),politica:opcion('politica','cooperativa')};
 for(const k of ['exposicion','crisisFallida','equipoMuerto','rescate','dados'])if(opcion(k)!==undefined)cfg[k]=opcion(k);
 for(const k of ['indefensos','comidaInicial','moralMuerte','rondasObjetivo'])if(num(k)!==undefined)cfg[k]=num(k);
 const r=await jugarPartida({semilla,...cfg});
 console.log('Configuración:',claveCombinacion(cfg),'· escenario',cfg.escenario,'· política',cfg.politica);
 mostrarPartida(r,semilla);
 if(r.rescate?.ocurrio)console.log(`\nRescate: ${r.rescate.rescatista} · ${cfg.rescate} · cara ${r.rescate.cara??'—'} · ${r.rescate.rescatistaMuere?'muere':'vive'} · curas del médico ${r.rescate.curas}`);
 console.log(`\nIndefensos perdidos ${r.indefensosPerdidos} · equipo perdido ${r.equipoPerdido} · moral final ${r.moralFin}`);
}
if(esPrincipal(import.meta.url)){if(args.includes('--ejemplo'))await ejemplo();else await todo();}
