// Datos nuevos por instancia: ninguna partida comparte arrays mutables.
export function createReferenceData(){
const places=['Colonia','Supermercado','Hospital','Comisaría','Gasolinera','Escuela','Biblioteca'];
const icons=['⌂','▣','✚','✦','⚙','▤','▥'];
const em={comida:'🥫',medicina:'✚',arma:'🔫',herramienta:'⛏️',combustible:'⛽',muestra:'◈',educacion:'📖',superviviente:'👤'};
const capacity=[12,4,4,4,4,4,4],zcap=[12,4,4,4,4,4,4];
const objectives=[{name:'Encontrar la cura',description:'Reunir 7 muestras de investigación para salvar a la colonia.',need:7,rounds:8},{name:'Operación antídoto',description:'Reunir 5 muestras antes de que se agoten las 6 rondas.',need:5,rounds:6},{name:'Última esperanza',description:'Recuperar 9 muestras antes de que termine la ronda 10.',need:9,rounds:10}];
const roster=[
{name:'Mara',job:'Médica',attack:4,search:3,influence:76,skill:'medic',skillName:'Primeros auxilios',skillDesc:'Una vez por ronda cura 1 herida de un superviviente en su localidad, sin dado.'},
{name:'Leo',job:'Mecánico',attack:3,search:4,influence:58,skill:'builder',skillName:'Manos hábiles',skillDesc:'Una vez por ronda construye una barricada sin usar dado.'},
{name:'Iris',job:'Exploradora',attack:5,search:2,influence:67,skill:'scout',skillName:'Ojo experto',skillDesc:'Al buscar, roba dos objetos y elige uno.'},
{name:'Ada',job:'Enfermera',attack:4,search:3,influence:73,skill:'nurse',skillName:'Contra el frío',skillDesc:'Una vez por ronda elimina una congelación de un superviviente en su localidad.'},
{name:'Bruno',job:'Policía',attack:2,search:4,influence:80,skill:'fighter',skillName:'Puntería',skillDesc:'Necesita un punto menos en el dado para atacar.'},
{name:'Sol',job:'Superviviente',attack:4,search:2,influence:45,skill:'resilient',skillName:'Resistencia',skillDesc:'Una vez por ronda puede evitar un resultado adverso de exposición.'},
{name:'Tomás',job:'Cocinero',attack:5,search:3,influence:36,skill:'cook',skillName:'Raciones',skillDesc:'Si está en la colonia durante la fase de comida, reduce el consumo en una unidad.'},
{name:'Elena',job:'Investigadora',attack:5,search:2,influence:89,skill:'researcher',skillName:'Análisis',skillDesc:'La primera muestra que obtiene durante la partida cuenta doble.'},
{name:'Raúl',job:'Bombero',attack:2,search:5,influence:66,skill:'guard',skillName:'Defensa firme',skillDesc:'Al construir barricadas con un dado coloca dos, si hay accesos.'},
{name:'Clara',job:'Bibliotecaria',attack:5,search:2,influence:55,skill:'librarian',skillName:'Catálogo',skillDesc:'En la biblioteca, búsqueda requiere un punto menos.'},
{name:'Nico',job:'Paramédico',attack:4,search:3,influence:61,skill:'paramedic',skillName:'Tratamiento',skillDesc:'Al usar medicina, cura hasta dos daños del personaje seleccionado.'},
{name:'Valeria',job:'Vigilante',attack:2,search:4,influence:74,skill:'silent',skillName:'Paso sigiloso',skillDesc:'Su primer movimiento de cada ronda no requiere exposición.'},
{name:'Hugo',job:'Carpintero',attack:3,search:4,influence:52,skill:'builder',skillName:'Refuerzo rápido',skillDesc:'Una vez por ronda construye una barricada sin usar dado.'},
{name:'Luz',job:'Bióloga',attack:5,search:2,influence:85,skill:'researcher',skillName:'Análisis',skillDesc:'La primera muestra que obtiene durante la partida cuenta doble.'},
{name:'Damián',job:'Soldado',attack:2,search:5,influence:82,skill:'fighter',skillName:'Entrenamiento',skillDesc:'Necesita un punto menos en el dado para atacar.'},
{name:'Celia',job:'Veterinaria',attack:4,search:3,influence:70,skill:'medic',skillName:'Cuidados',skillDesc:'Una vez por ronda cura 1 herida de un superviviente en su localidad, sin dado.'}
];
return {places,icons,em,capacity,zcap,objectives,roster};
}
