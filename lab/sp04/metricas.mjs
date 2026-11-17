// Agregados por celda (escenario × variante × política × parámetros). Solo cuenta
// dados del grupo del jugador; en la línea base de dos grupos la IA queda fuera.
const media=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
const r3=x=>x===null||x===undefined?'':Math.round(x*1000)/1000;
export const clasesCompetencia=['competida','obligada-abastecer','solo-abastecer','solo-objetivo','holgada'];
export function agregar(partidas){
 const n=partidas.length,fallidas=partidas.filter(p=>!p.completa);
 const tasa=f=>partidas.filter(f).length/n;
 const rondasJugadas=partidas.map(p=>p.rondas.filter(r=>r.dadosTotal!==null).length);
 const dadosPorRonda=cat=>media(partidas.map(p=>p.dados.filter(d=>d.categoria===cat).length/Math.max(1,p.rondas.length)));
 const dadosPorRondaTotal=media(partidas.map(p=>media(p.rondas.map(r=>r.dadosTotal||0))??0));
 const noUsados=media(partidas.map(p=>media(p.rondas.map(r=>r.noUsados||0))??0));
 const colapso=partidas.map(p=>p.colonia.find(x=>x.hambreNueva)?.ronda).filter(x=>x);
 const primeraMuerte=partidas.map(p=>p.muertes.filter(m=>m.lado==='human'&&m.causa!=='escenario de laboratorio')[0]).map(m=>m?.ronda).filter(x=>x);
 const recuperacion=recuperacionTrasMuerte(partidas);
 const maxCuota=media(partidas.map(p=>{const propios=p.dados.filter(d=>d.personaje);if(!propios.length)return null;const cuenta={};for(const d of propios)cuenta[d.personaje]=(cuenta[d.personaje]||0)+1;return Math.max(...Object.values(cuenta))/propios.length;}).filter(x=>x!==null));
 const rondas=partidas.flatMap(p=>p.rondas.filter(r=>r.competencia));
 const clases=Object.fromEntries(clasesCompetencia.map(k=>[k,rondas.length?rondas.filter(r=>r.competencia.clase===k).length/rondas.length:null]));
 return {
  partidas:n,incompletas:fallidas.length,
  victoria:tasa(p=>p.resultado==='victory'),moral:tasa(p=>p.resultado==='morale'),tiempo:tasa(p=>p.resultado==='time'),sinSupervivientes:tasa(p=>p.resultado==='survivors'),
  rondaFin:media(partidas.map(p=>p.rondaFin)),
  dadosTotalPorRonda:dadosPorRondaTotal,dadosAbastecerPorRonda:dadosPorRonda('abastecer'),dadosObjetivoPorRonda:dadosPorRonda('objetivo'),dadosOtrosPorRonda:media(partidas.map(p=>p.dados.filter(d=>!['abastecer','objetivo'].includes(d.categoria)).length/Math.max(1,p.rondas.length))),noUsadosPorRonda:noUsados,
  mejorasComidaPorPartida:media(partidas.map(p=>p.mejorasComida)),
  partidasConHambre:colapso.length/n,rondaColapsoComida:media(colapso),
  crisisFallidasPorPartida:media(partidas.map(p=>p.crisis.filter(k=>!k.exito).length)),crisisPorPartida:media(partidas.map(p=>p.crisis.length)),
  muertesPropiasPorPartida:media(partidas.map(p=>p.muertes.filter(m=>m.lado==='human'&&m.causa!=='escenario de laboratorio').length)),partidasConMuerte:primeraMuerte.length/n,rondaPrimeraMuerte:media(primeraMuerte),
  reclutasPorPartida:media(partidas.map(p=>p.reclutas.filter(r=>r.lado==='human').length)),
  ...recuperacion,
  cuotaMaximaPersonaje:maxCuota,
  rondasEvaluadas:rondas.length,...Object.fromEntries(Object.entries(clases).map(([k,v])=>['rondas_'+k,v])),
 };
}
// Tras la primera muerte en partida (no la del escenario): ¿se recupera o entra en
// espiral? espiral = otra muerte propia en las dos rondas siguientes, o fin por moral
// o sin supervivientes en esas dos rondas. recupera = gana o llega al final sin otra
// muerte propia.
function recuperacionTrasMuerte(partidas){
 const con=[];
 for(const p of partidas){
  const propias=p.muertes.filter(m=>m.lado==='human'&&m.causa!=='escenario de laboratorio');if(!propias.length)continue;
  const r1=propias[0].ronda,segunda=propias.slice(1).find(m=>m.ronda<=r1+2);
  const finCerca=p.resultado!=='victory'&&p.resultado!=='time'&&p.rondaFin<=r1+2;
  const espiral=!!segunda||finCerca;
  const recupera=p.resultado==='victory'||propias.length===1&&p.resultado==='time';
  con.push({espiral,recupera,victoria:p.resultado==='victory'});
 }
 const n=con.length;
 return {partidasConMuerteEnJuego:n,espiralTrasMuerte:n?con.filter(x=>x.espiral).length/n:null,recuperaTrasMuerte:n?con.filter(x=>x.recupera).length/n:null,victoriaTrasMuerte:n?con.filter(x=>x.victoria).length/n:null};
}
export function porRonda(partidas){
 const filas=[];
 const maxRonda=Math.max(...partidas.map(p=>p.rondas.length));
 for(let ronda=1;ronda<=maxRonda;ronda++){
  const rs=partidas.map(p=>p.rondas.find(r=>r.ronda===ronda)).filter(r=>r&&r.dadosTotal!==null);if(!rs.length)continue;
  const dados=cat=>media(partidas.map(p=>p.rondas.some(r=>r.ronda===ronda&&r.dadosTotal!==null)?p.dados.filter(d=>d.ronda===ronda&&d.categoria===cat).length:null).filter(x=>x!==null));
  const conClase=rs.filter(r=>r.competencia);
  filas.push({ronda,partidasVivas:rs.length/partidas.length,vivos:media(rs.map(r=>r.vivos)),dadosTotal:media(rs.map(r=>r.dadosTotal)),abastecer:dados('abastecer'),objetivo:dados('objetivo'),noUsados:media(rs.map(r=>r.noUsados||0)),comida:media(rs.map(r=>r.comida)),moral:media(rs.map(r=>r.moral)),muestras:media(rs.map(r=>r.muestras)),
   ...Object.fromEntries(clasesCompetencia.map(k=>[k,conClase.length?conClase.filter(r=>r.competencia.clase===k).length/conClase.length:null]))});
 }
 return filas;
}
export function aCsv(filas){
 if(!filas.length)return '';
 const columnas=Object.keys(filas[0]);
 return [columnas.join(','),...filas.map(f=>columnas.map(k=>{const v=f[k];return typeof v==='number'?r3(v):v===null||v===undefined?'':String(v);}).join(','))].join('\n')+'\n';
}

// ---------- Segunda corrida (docs/107) ----------
// Se agregan aparte para que los CSV de la primera corrida conserven sus columnas.
const causasContagio=['mordedura','propagación de mordedura','sacrificio para detener la mordedura'];
export function agregarSegunda(partidas){
 const n=partidas.length,tasa=f=>partidas.filter(f).length/n;
 const propias=p=>p.muertes.filter(m=>m.lado==='human'&&m.causa!=='escenario de laboratorio');
 // Muerte doble: dos o más muertes propias en la misma ronda y la misma fase (turno
 // del jugador o fase de colonia). «Por contagio» si alguna es mordedura o su cadena.
 const dobles=p=>{const grupos={};for(const m of propias(p))(grupos[m.ronda+'/'+m.fase]||=[]).push(m);return Object.values(grupos).filter(g=>g.length>=2).map(g=>({ronda:g[0].ronda,contagio:g.some(m=>causasContagio.includes(m.causa))}));};
 const derrota=p=>p.resultado==='morale'||p.resultado==='survivors';
 const exps=partidas.flatMap(p=>p.exposiciones);
 const efecto=e=>exps.length?exps.filter(x=>x.efecto===e).length/exps.length:null;
 const conRescate=partidas.filter(p=>p.rescate?.ocurrio);
 const tasaEn=(xs,f)=>xs.length?xs.filter(f).length/xs.length:null;
 return {
  vivosFin:media(partidas.map(p=>p.vivosFin)),
  victoriaCon2Vivos:tasa(p=>p.resultado==='victory'&&p.vivosFin>=2),
  moralFin:media(partidas.map(p=>p.moralFin)),
  indefensosIniciales:media(partidas.map(p=>p.inicial.indefensos)),
  indefensosPerdidos:media(partidas.map(p=>p.indefensosPerdidos)),
  indefensosPorCrisis:media(partidas.map(p=>p.indefensosPorCrisis)),
  indefensosFin:media(partidas.map(p=>p.indefensosFin)),
  equipoPerdido:media(partidas.map(p=>p.equipoPerdido)),
  muertesDoblesPorPartida:media(partidas.map(p=>dobles(p).length)),
  muertesDoblesContagioPorPartida:media(partidas.map(p=>dobles(p).filter(d=>d.contagio).length)),
  partidasConMuerteDoble:tasa(p=>dobles(p).length>0),
  partidasTerminanPorMuerteDoble:tasa(p=>derrota(p)&&dobles(p).some(d=>d.ronda===p.rondaFin)),
  exposicionesPorPartida:media(partidas.map(p=>p.exposiciones.length)),
  exposicionSinEfecto:efecto('none'),exposicionHerida:efecto('wound'),exposicionCongelacion:efecto('frost'),exposicionMordedura:efecto('bite'),exposicionEvitada:efecto('avoided'),
  rescateOcurre:conRescate.length/n,
  rescatistaMuere:tasaEn(conRescate,p=>p.rescate.rescatistaMuere),
  curasMedico:conRescate.length?media(conRescate.map(p=>p.rescate.curas)):null,
  victoriaConRescate:tasaEn(conRescate,p=>p.resultado==='victory'),
  moralFinConRescate:conRescate.length?media(conRescate.map(p=>p.moralFin)):null,
 };
}

// ---------- Tercera corrida (docs/110) ----------
// Médico jugable: incorporado, muerto, curas. Aparte, para no cambiar columnas de 107.
export function agregarTercera(partidas){
 const conRescate=partidas.filter(p=>p.rescate?.ocurrio),conMedico=partidas.filter(p=>p.rescate?.medico);
 const tasaEn=(xs,f)=>xs.length?xs.filter(f).length/xs.length:null;
 return {
  medicoIncorporado:tasaEn(conRescate,p=>p.rescate.medico),
  medicoMuere:tasaEn(conMedico,p=>p.muertes.some(m=>m.nombre==='Médico')),
  curasPorPartidaConMedico:conMedico.length?media(conMedico.map(p=>p.rescate.curas)):null,
  muertesDesbordamiento:media(partidas.map(p=>p.muertes.filter(m=>/^desbordamiento/.test(m.causa)).length)),
 };
}
