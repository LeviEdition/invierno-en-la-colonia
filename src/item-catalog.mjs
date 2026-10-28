// D1.1 — Fuente independiente. Datos heredados de V9.9, sin cambios de reglas.
// El mezclador se inyecta; el catálogo no conoce Math.random, game ni el DOM.
export class ItemCatalog {
 constructor(shuffle){
  this.shuffle=shuffle;
  this.definitions=Object.freeze({
   ration:{name:'Ración de comida',kind:'comida',icon:'🥫',desc:'Agrega 1 comida a la reserva.',effect:'food',amount:1},
   canned:{name:'Caja de conservas',kind:'comida',icon:'🥫',desc:'Agrega 2 comidas a la reserva.',effect:'food',amount:2},
   bandage:{name:'Vendas',kind:'medicina',icon:'✚',desc:'Cura 1 herida o congelación al personaje seleccionado.',effect:'heal',amount:1},
   medkit:{name:'Botiquín completo',kind:'medicina',icon:'✚',desc:'Cura hasta 2 daños del personaje seleccionado.',effect:'heal',amount:2},
   antifrost:{name:'Tratamiento térmico',kind:'medicina',icon:'✚',desc:'Elimina hasta 2 congelaciones del personaje seleccionado.',effect:'frost',amount:2},
   gascan:{name:'Bidón de combustible',kind:'combustible',icon:'⛽',desc:'Mueve al personaje seleccionado sin tirar exposición.',effect:'move'},
   pistol:{name:'Pistola',kind:'arma',icon:'🔫',desc:'Equipada: evita la exposición del primer ataque de cada ronda.',effect:'equip'},
   shotgun:{name:'Escopeta',kind:'arma',icon:'🔫',desc:'Equipada: elimina hasta 2 zombis por ataque con una exposición.',effect:'equip'},
   rifle:{name:'Rifle de precisión',kind:'arma',icon:'🔫',desc:'Equipado: reduce en 1 el requisito de ataque y evita una exposición por ronda si atacás fuera de la colonia.',effect:'equip'},
   hatchet:{name:'Hacha',kind:'arma',icon:'🔫',desc:'Equipada: reduce en 1 el requisito de ataque y permite construir una barricada después de atacar en la colonia, una vez por ronda.',effect:'equip'},
   crowbar:{name:'Palanca',kind:'herramienta',icon:'⛏️',desc:'Equipada: reduce en 1 el requisito de búsqueda.',effect:'equip'},
   flashlight:{name:'Linterna',kind:'herramienta',icon:'⛏️',desc:'Equipada: revela una carta extra al buscar una vez por ronda sin generar ruido.',effect:'equip'},
   repairkit:{name:'Herramientas de reparación',kind:'herramienta',icon:'⛏️',desc:'Equipadas: construí una barricada adicional por acción de construcción.',effect:'equip'},
   manual:{name:'Manual de fortificación',kind:'educacion',icon:'📖',desc:'Se consume para retirar 2 residuos y colocar una barricada en la localidad del personaje.',effect:'manual'},
   notes:{name:'Notas de laboratorio',kind:'educacion',icon:'📖',desc:'Se consumen para obtener una muestra de investigación.',effect:'research'},
   sample:{name:'Muestra biológica',kind:'muestra',icon:'◈',desc:'Entregala al objetivo general. Se recuerda quién la encontró.',effect:'sample'},
   rescue:{name:'Superviviente encontrado',kind:'superviviente',icon:'👤',desc:'Al elegir esta carta se incorpora automáticamente un superviviente a la colonia.',effect:'rescue'}
  });
  this.defaults=Object.freeze({comida:'ration',medicina:'bandage',combustible:'gascan',arma:'pistol',herramienta:'crowbar',muestra:'sample',superviviente:'rescue',educacion:'manual'});
  /* Cada localidad tiene veinte cartas; distribución intencionalmente inspirada, no copiada, del juego original. */
  this.distribution=Object.freeze({
   1:{ration:6,canned:3,bandage:2,gascan:1,flashlight:1,crowbar:1,rescue:2,sample:2,manual:1,pistol:1},
   2:{bandage:5,medkit:4,antifrost:2,ration:1,gascan:1,notes:2,rescue:2,manual:1,flashlight:1,crowbar:1},
   3:{pistol:4,rifle:2,shotgun:1,hatchet:2,gascan:2,ration:1,repairkit:2,rescue:2,bandage:2,sample:2},
   4:{gascan:6,flashlight:2,repairkit:2,ration:2,shotgun:1,crowbar:1,rescue:2,bandage:2,sample:2},
   5:{ration:5,manual:3,notes:3,bandage:2,gascan:1,repairkit:2,rescue:2,sample:1,pistol:1},
   6:{notes:5,manual:4,sample:4,ration:1,bandage:1,flashlight:1,rescue:2,crowbar:1,gascan:1}
  });
  for(let i=1;i<=6;i++){const n=Object.values(this.distribution[i]).reduce((a,b)=>a+b,0);if(n!==20)throw Error('Mazo incorrecto '+i+' = '+n);}
 }
 resolve(it){const id=typeof it==='string'?(this.definitions[it]?it:this.defaults[it]):(it?.cardId||this.defaults[it?.kind]);return this.definitions[id]?{id,...this.definitions[id]}:null;}
 create(id,meta={}){const def=this.resolve(id);if(!def)throw Error('Carta desconocida '+id);return {kind:def.kind,cardId:def.id,...meta};}
 deck(loc){const cards=[];for(const [id,n] of Object.entries(this.distribution[loc]))for(let j=0;j<n;j++)cards.push(this.create(id));if(typeof this.shuffle!=='function')throw new TypeError('Mezclador requerido para crear el mazo');return this.shuffle(cards);}
 legend(loc){const totals=new Map();for(const [id,n] of Object.entries(this.distribution[loc])){const k=this.definitions[id].kind;totals.set(k,(totals.get(k)||0)+n);}return [...totals].sort((a,b)=>b[1]-a[1]);}
 label(it){const d=this.resolve(it);return d?d.icon+' '+d.name:'Objeto desconocido';}
}
