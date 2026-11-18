// Séptima corrida del laboratorio SP-04 (docs/115): corrección de reserva e improvisar.
// node lab/sp04/septima-corrida.mjs                           (500 partidas × celda)
// node lab/sp04/septima-corrida.mjs --ejemplo 1234567
// Variantes: noche/localidad + regreso + comida 10 × (normal | parcial | adapt4 | adapt3 | adapt4-sin-reserva)
// Políticas: cooperativa-prudente · objetivo-repartido-prudente (y sus variantes sin-reserva)
import {mkdir,writeFile} from 'node:fs/promises';
import {agregar,agregarSegunda,agregarTercera,agregarCuarta,agregarQuinta,agregarSexta,aCsv} from './metricas.mjs';
import {correrCelda} from './segunda-corrida.mjs';
import {P1} from './tercera-corrida.mjs';
import {jugarPartida} from './partida.mjs';
import {mostrarPartida} from './correr.mjs';
import {esPrincipal} from './principal.mjs';

const args=process.argv.slice(2),opcion=(k,d)=>{const i=args.indexOf('--'+k);return i>=0?args[i+1]:d;};
export const ESCENARIOS=['A','B'];

const BASE={...P1,nocheAfuera:'localidad',regreso:true,comidaInicial:10};

export const VARIANTES_SEPTIMA=[
 {id:'c10-normal',         label:'Noche/loc · comida 10 · crisis normal',    cambios:{}},
 {id:'c10-parcial',        label:'Noche/loc · comida 10 · crisisParcial',     cambios:{crisisParcial:true}},
 {id:'c10-adapt4',         label:'Noche/loc · comida 10 · parcial+imp≥4',    cambios:{crisisParcial:true,improvisar:true,improvisarUmbral:4}},
 {id:'c10-adapt3',         label:'Noche/loc · comida 10 · parcial+imp≥3',    cambios:{crisisParcial:true,improvisar:true,improvisarUmbral:3}},
 {id:'c10-adapt4-sinres',  label:'Noche/loc · comida 10 · parcial+imp≥4 sin reserva', cambios:{crisisParcial:true,improvisar:true,improvisarUmbral:4}},
];

// Políticas por variante. La variante sinres usa políticas sin-reserva.
const POLITICAS_SINRES=['cooperativa-prudente-sin-reserva','objetivo-repartido-prudente-sin-reserva'];
const POLITICAS_STD=['cooperativa-prudente','objetivo-repartido-prudente'];
function politicasDe(variante){return variante.id.endsWith('-sinres')?POLITICAS_SINRES:POLITICAS_STD;}

async function todo(){
 const n=Number(opcion('partidas',500)),salida=opcion('salida','lab/sp04/resultados/septima-corrida'),inicio=Date.now();
 await mkdir(salida,{recursive:true});
 const celdas=[],combos=[];
 for(const v of VARIANTES_SEPTIMA){
  const baseCfg={...BASE,...v.cambios};
  const politicas=politicasDe(v);
  const vict={};
  for(const escenario of ESCENARIOS)for(const politica of politicas){
   const t=Date.now(),partidas=await correrCelda({...baseCfg,escenario,politica},n);
   const fila={variante:v.id,escenario,politica,...agregar(partidas),...agregarSegunda(partidas),...agregarTercera(partidas),...agregarCuarta(partidas),...agregarQuinta(partidas),...agregarSexta(partidas)};
   celdas.push(fila);vict[politica+escenario]=fila.victoria;
   console.error(`[${v.id}] ${escenario} ${politica} · victoria ${Math.round(fila.victoria*100)}% · ${Date.now()-t} ms`);
  }
  const fila={variante:v.id};
  for(const p of politicas){fila[p]=(vict[p+'A']+vict[p+'B'])/2;fila[p+'A']=vict[p+'A'];fila[p+'B']=vict[p+'B'];}
  const cp=fila['cooperativa-prudente']??fila['cooperativa-prudente-sin-reserva'];
  const orp=fila['objetivo-repartido-prudente']??fila['objetivo-repartido-prudente-sin-reserva'];
  if(cp!=null&&orp!=null)fila.ventajaPrudente=orp-cp;
  combos.push(fila);
 }
 await writeFile(salida+'/resumen.csv',aCsv(celdas));
 await writeFile(salida+'/ventaja.csv',aCsv(combos));
 await writeFile(salida+'/README.md',`# Resultados SP-04 — séptima corrida\n\nGenerados con \`node lab/sp04/septima-corrida.mjs --partidas ${n}\` (${celdas.length} celdas, ${Math.round((Date.now()-inicio)/1000)} s). Informe: docs/115.\n`);
 console.error('Listo:',salida,Math.round((Date.now()-inicio)/1000)+'s');
}

async function ejemplo(){
 const semilla=Number(opcion('ejemplo'));
 const cfg={
  ...BASE,
  escenario:opcion('escenario','A'),
  politica:opcion('politica','cooperativa-prudente'),
  crisisParcial:true,improvisar:true,improvisarUmbral:3,
 };
 const r=await jugarPartida({semilla,...cfg});mostrarPartida(r,semilla);
 console.log('\nAfuera al caer la noche: '+(r.afueraAlCaerNoche.map(x=>'R'+x.ronda+'×'+x.cantidad).join(' · ')||'ninguno'));
 console.log('Improvisaciones: '+r.improvisaciones+' · Regresos: '+r.regresos);
 const parc=r.crisis.filter(k=>k.parcial).length,exit=r.crisis.filter(k=>k.exito).length,fall=r.crisis.filter(k=>!k.exito&&!k.parcial).length;
 console.log('Crisis: '+exit+' éxito · '+parc+' parcial · '+fall+' fallo (de '+r.crisis.length+' rondas)');
 // Mostrar si se aportó la última carta de algún tipo
 const aportaciones=r.traza.filter(a=>a.startsWith('aportar-crisis'));
 console.log('Aportaciones a crisis: '+aportaciones.length+' ('+aportaciones.join(', ')+')');
}

if(esPrincipal(import.meta.url)){if(args.includes('--ejemplo'))await ejemplo();else await todo();}
