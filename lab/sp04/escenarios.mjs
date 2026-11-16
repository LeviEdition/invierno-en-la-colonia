// Escenarios de docs/63 §5K. Se aplican después de crear la partida y antes de la
// primera acción, sobre el grupo del jugador; cada uno cambia una sola cosa respecto
// del anterior. Los estados iniciales son idénticos entre variantes y políticas.
export const escenarios={
 A:{titulo:'Tres supervivientes sanos',aplicar(){}},
 B:{titulo:'Muerte temprana de Iris (exploradora)',aplicar(c){matar(c,'h2');}},
 C:{titulo:'B + Leo lesionado (1 herida y 1 congelación)',aplicar(c){matar(c,'h2');const leo=c.game.humans.find(p=>p.id==='h1');leo.wounds=1;leo.frost=1;}},
 D:{titulo:'B + una carta de superviviente encontrado en la mano (acceso a reclutar)',aplicar(c){matar(c,'h2');c.game.items.push(c.catalog.create('rescue'));}},
 E1:{titulo:'A + un superviviente incorporado al inicio',aplicar(c){reclutar(c,1);}},
 E2:{titulo:'A + dos supervivientes incorporados al inicio',aplicar(c){reclutar(c,2);}},
};
export const nombresDeEscenarios=Object.keys(escenarios);
// La muerte pasa por kill del motor: resta moral, registra el fallecimiento y revisa
// el liderazgo, igual que una muerte en partida.
function matar(c,id){const p=c.game.humans.find(p=>p.id===id);if(!p||p.dead)throw Error('Escenario: '+id+' no está disponible');c.kill(p,'escenario de laboratorio');}
// Reclutar usa el sorteo del motor sobre el plantel: consume azar, como en partida.
function reclutar(c,n){for(let i=0;i<n;i++)if(!c.recruit('human'))throw Error('Escenario: no se pudo reclutar');}
export function aplicarEscenario(c,nombre){
 const e=escenarios[nombre];if(!e)throw Error('Escenario desconocido: '+nombre);
 e.aplicar(c);c.verify();c.paint();
}
