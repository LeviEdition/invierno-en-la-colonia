// Sexta corrida del laboratorio SP-04 (docs/114): políticas adaptativas y crisis resolubles.
// node lab/sp04/sexta-corrida.mjs                           (500 partidas × celda)
// node lab/sp04/sexta-corrida.mjs --ejemplo 1234567 --comidaInicial 8 --improvisar true --crisisParcial true --politica cooperativa-prudente
// Variantes: base · noche/loc×comida6 · noche/loc×comida8 · noche/loc×comida10 (× crisis normal | improvisar+parcial)
// Políticas: cooperativa · cooperativa-prudente · objetivo-repartido · objetivo-repartido-prudente
import {mkdir,writeFile} from 'node:fs/promises';
import {agregar,agregarSegunda,agregarTercera,agregarCuarta,agregarQuinta,agregarSexta,aCsv} from './metricas.mjs';
import {correrCelda} from './segunda-corrida.mjs';
import {P1} from './tercera-corrida.mjs';
import {jugarPartida} from './partida.mjs';
import {mostrarPartida} from './correr.mjs';
import {esPrincipal} from './principal.mjs';

const args=process.argv.slice(2),opcion=(k,d)=>{const i=args.indexOf('--'+k);return i>=0?args[i+1]:d;};
export const ESCENARIOS=['A','B'];
export const POLITICAS_SEXTA=['cooperativa','cooperativa-prudente','objetivo-repartido','objetivo-repartido-prudente'];

// Configuración base (igual a P1 con noche/localidad + regreso).
const NOCHE={nocheAfuera:'localidad',regreso:true};
const SIN_NOCHE={};
// Las prudentes ignoran el regreso de quinta corrida (usan el suyo propio).

export const VARIANTES_SEXTA=[
 {id:'base',         label:'Base (sin noche ni crisis)',         cambios:{...SIN_NOCHE},                             comidaInicial:null},
 {id:'c6-normal',    label:'Noche/loc · comida 6 · crisis normal',cambios:{...NOCHE},                               comidaInicial:6},
 {id:'c6-adapt',     label:'Noche/loc · comida 6 · improvisar+parcial',cambios:{...NOCHE,improvisar:true,crisisParcial:true},comidaInicial:6},
 {id:'c8-normal',    label:'Noche/loc · comida 8 · crisis normal',cambios:{...NOCHE},                               comidaInicial:8},
 {id:'c8-adapt',     label:'Noche/loc · comida 8 · improvisar+parcial',cambios:{...NOCHE,improvisar:true,crisisParcial:true},comidaInicial:8},
 {id:'c10-normal',   label:'Noche/loc · comida 10 · crisis normal',cambios:{...NOCHE},                              comidaInicial:10},
 {id:'c10-adapt',    label:'Noche/loc · comida 10 · improvisar+parcial',cambios:{...NOCHE,improvisar:true,crisisParcial:true},comidaInicial:10},
];

async function todo(){
 const n=Number(opcion('partidas',500)),salida=opcion('salida','lab/sp04/resultados/sexta-corrida'),inicio=Date.now();
 await mkdir(salida,{recursive:true});
 const celdas=[],combos=[];
 const correr=async(variante,cambios,comidaInicial,politicas)=>{
  const baseCfg={...P1,...(comidaInicial!=null?{comidaInicial}:{}),...cambios};
  const vict={};
  for(const escenario of ESCENARIOS)for(const politica of politicas){
   const t=Date.now(),partidas=await correrCelda({...baseCfg,escenario,politica},n);
   const fila={variante,comidaInicial,escenario,politica,...agregar(partidas),...agregarSegunda(partidas),...agregarTercera(partidas),...agregarCuarta(partidas),...agregarQuinta(partidas),...agregarSexta(partidas)};
   celdas.push(fila);vict[politica+escenario]=fila.victoria;
   console.error(`[${variante}] ci=${comidaInicial??'P1'} ${escenario} ${politica} · victoria ${Math.round(fila.victoria*100)}% · ${Date.now()-t} ms`);
  }
  const fila={variante,comidaInicial};
  for(const p of politicas){fila[p]=(vict[p+'A']+vict[p+'B'])/2;fila[p+'A']=vict[p+'A'];fila[p+'B']=vict[p+'B'];}
  // ventaja corredor-prudente − cooperativa-prudente
  const cp=fila['cooperativa-prudente'],orp=fila['objetivo-repartido-prudente'];
  if(cp!=null&&orp!=null)fila.ventajaPrudente=orp-cp;
  combos.push(fila);return fila;
 };
 for(const v of VARIANTES_SEXTA)await correr(v.id,v.cambios,v.comidaInicial,POLITICAS_SEXTA);
 await writeFile(salida+'/resumen.csv',aCsv(celdas));
 await writeFile(salida+'/ventaja.csv',aCsv(combos));
 await writeFile(salida+'/README.md',`# Resultados SP-04 — sexta corrida\n\nGenerados con \`node lab/sp04/sexta-corrida.mjs --partidas ${n}\` (${celdas.length} celdas, ${Math.round((Date.now()-inicio)/1000)} s). Informe: docs/114.\n`);
 console.error('Listo:',salida,Math.round((Date.now()-inicio)/1000)+'s');
}

async function ejemplo(){
 const semilla=Number(opcion('ejemplo'));
 const cfg={
  ...P1,
  escenario:opcion('escenario','A'),
  politica:opcion('politica','cooperativa-prudente'),
  nocheAfuera:'localidad',regreso:true,
 };
 if(opcion('comidaInicial')!=null)cfg.comidaInicial=Number(opcion('comidaInicial'));
 if(opcion('improvisar')==='true')cfg.improvisar=true;
 if(opcion('crisisParcial')==='true')cfg.crisisParcial=true;
 const r=await jugarPartida({semilla,...cfg});mostrarPartida(r,semilla);
 console.log('\nAfuera al caer la noche: '+(r.afueraAlCaerNoche.map(x=>'R'+x.ronda+'×'+x.cantidad).join(' · ')||'ninguno'));
 console.log('Improvisaciones: '+r.improvisaciones+' · Regresos: '+r.regresos);
 const parc=r.crisis.filter(k=>k.parcial).length,exit=r.crisis.filter(k=>k.exito).length,fall=r.crisis.filter(k=>!k.exito&&!k.parcial).length;
 console.log('Crisis: '+exit+' éxito · '+parc+' parcial · '+fall+' fallo (de '+r.crisis.length+' rondas)');
}

if(esPrincipal(import.meta.url)){if(args.includes('--ejemplo'))await ejemplo();else await todo();}
