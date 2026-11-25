// Casilla de tirada (ajustes de la sesión 7): un solo componente para todos los dados animados
// del mapa —la noche, la exposición al moverse, atacar o construir—. Papel, título arriba,
// dado al medio y «Tirando…» o el resultado abajo. Solo arma los textos con lo que ya trae la
// respuesta del motor; la duración, el freno y el salto con un toque siguen en la secuencia.
export function rollCardText({kind,stage,name,place,reveal='',summary='',travel=''}){
 const who=name||'superviviente';
 if(kind==='exposure')return {title:'La noche en '+(place||'—')+' · '+who,result:['travel','roll'].includes(stage)?'Tirando…':reveal};
 if(stage==='travel')return {title:travel,result:''};
 return {title:'Exposición · '+who,result:stage==='roll'?'Tirando…':stage==='reveal'?reveal:summary};
}
