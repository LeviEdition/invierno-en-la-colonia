// Inyección exclusivamente QA: el bundle de producto no contiene estos fallos.
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {projectRoot} from '../scripts/build-hospital-phaser.mjs';
export async function startupFaultBundle(fault='none'){
 const once=code=>`if(!window.h32FaultUsed){window.h32FaultUsed=true;${code}}`;
 const result=await build({absWorkingDir:projectRoot,entryPoints:['prototypes/hospital-phaser/main.mjs'],bundle:true,format:'esm',platform:'browser',target:'es2022',write:false,plugins:[{name:'h32-startup-fault',setup(builder){
  builder.onLoad({filter:/hospital-phaser.*\.mjs$/},async({path})=>{
   path=path.replaceAll('\\','/');
   let contents=await readFile(path,'utf8');
   if(path.endsWith('/renderer.mjs')){
    contents=contents.replace('game=instance;','game=instance;window.h32QaGame=instance;');
    let injection='';
    if(fault==='async-create')injection=once("throw Error('H32_ASYNC_CREATE');");
    if(fault==='never-create')injection=once('return;');
    if(fault==='late-create')injection=once('window.h32LateCreate=()=>this.create();window.h32LateDue=Date.now()+17000;setTimeout(()=>{window.h32LateRan=(window.h32LateRan||0)+1;window.h32LateCreate();},17000);return;');
    if(injection){if(!contents.includes('    world=this;'))throw Error('No se encontró frontera create');contents=contents.replace('    world=this;',injection+'\n    world=this;');}
   }
   if(path.endsWith('/game.mjs')){
    if(fault==='sync-constructor')contents=contents.replace(' start(){',` constructor(config){super(config);window.h32QaGame=this;${once("throw Error('H32_SYNC_CONSTRUCTOR');")}}\n start(){`);
    if(fault==='async-start')contents=contents.replace(' start(){',` start(){${once("throw Error('H32_ASYNC_START');")}`);
    if(fault==='late-start')contents=contents.replace(' start(){',` start(){${once('window.h32LateStart=()=>this.start();window.h32LateDue=Date.now()+17000;setTimeout(()=>{window.h32LateRan=(window.h32LateRan||0)+1;window.h32LateStart();},17000);return;')}`);
   }
   return {contents,loader:'js'};
  });
 }}]});return result.outputFiles[0].text;
}
