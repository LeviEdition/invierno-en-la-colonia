// ¿Abastecer y avanzar el objetivo compiten de verdad en esta ronda?
// Se evalúa con el estado del grupo al consumir su primer dado (ya hechos los
// movimientos), o al terminar el turno si no usó ninguno. Todo en «dados equivalentes».
//
// demandaAbastecer = dados de ataque para evitar desbordamientos donde hay propios
//                    + aportes de crisis que la mano no cubre
//                    + 1 si la comida no alcanza para la próxima alimentación.
// demandaObjetivo  = supervivientes fuera de la colonia en un mazo que todavía
//                    contiene muestras o notas (el laboratorio ve el mazo; es un
//                    techo de lo que podría buscarse para el objetivo).
// Clasificación con D dados disponibles:
//   holgada            ambas demandas caben (A+O ≤ D) o no hay ninguna
//   competida          A>0, O>0 y A+O > D: hay que elegir
//   obligada-abastecer A ≥ D con O>0: no queda margen para el objetivo
//   solo-abastecer     O = 0, A > 0           solo-objetivo  A = 0, O > 0
export function evaluarCompetencia(c){
 const g=c.game,propios=g.humans.filter(p=>!p.dead),dados=g.dice.length;
 let defensa=0;
 for(const loc of new Set(propios.map(p=>p.loc))){
  const z=g.zones[loc],llegan=loc===0?Math.ceil((c.alive().filter(x=>x.loc===0).length+g.helpless)/2):c.alive().filter(x=>x.loc===loc).length;
  defensa+=Math.max(0,z.z+z.b+llegan-c.zcap[loc]+1);
 }
 const k=g.crisis,enMano=c.currentHand().filter(it=>c.kind(it)===k.type).length;
 const crisis=Math.max(0,k.need-k.contributions.length-enMano);
 const comida=g.food<c.feedingNeed(g)?1:0;
 const demandaAbastecer=defensa+crisis+comida;
 const demandaObjetivo=propios.filter(p=>p.loc!==0&&(g.decks[p.loc]||[]).some(it=>['sample','notes'].includes(c.catalog.resolve(it)?.id))).length;
 let clase;
 if(!demandaAbastecer&&!demandaObjetivo)clase='holgada';
 else if(!demandaObjetivo)clase='solo-abastecer';
 else if(!demandaAbastecer)clase='solo-objetivo';
 else if(demandaAbastecer>=dados)clase='obligada-abastecer';
 else if(demandaAbastecer+demandaObjetivo>dados)clase='competida';
 else clase='holgada';
 return {dados,defensa,crisis,comida,demandaAbastecer,demandaObjetivo,clase};
}
