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
