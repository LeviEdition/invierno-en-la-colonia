// D1.2a: alternativa aislada; build-game.mjs y el HTML de referencia se conservan.
import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,dirname} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const marker='/* __D1_ITEM_CATALOG__ */';
export async function buildPoc({template,entryPoint='src/catalog-poc-entry.mjs',workingDir=root}={}){
 template??=await readFile(resolve(workingDir,'src/invierno.template.html'),'utf8');
 if(template.split(marker).length!==2)throw Error('Debe existir exactamente un marcador de catálogo');
 const bundle=await build({absWorkingDir:workingDir,entryPoints:[entryPoint],outfile:'catalog-poc.js',
  bundle:true,format:'iife',globalName:'CatalogModule',platform:'browser',target:'es2022',
  write:false,sourcemap:false,minify:false,charset:'utf8',legalComments:'none',metafile:true});
 if(bundle.outputFiles.length!==1)throw Error('Se requiere un único bundle');
 // Puente limitado al catálogo: el namespace del bundle no se publica en window.
 // Los handlers y el resto del script clásico permanecen en su ámbito anterior.
 const embedded='const catalog = (() => {\n'+bundle.outputFiles[0].text+
  '\nif(typeof document!=="undefined")CatalogModule.bindHandoverControls(document,{startGame,confirmPass});'+
  '\nreturn new CatalogModule.ItemCatalog(cards=>mix(cards));\n})();';
 const html=template.replace(marker,()=>embedded);
 if((html.match(/<script(?:\s[^>]*)?>/g)||[]).length!==1||/<script\s+[^>]*src=/.test(html))throw Error('HTML no autocontenido');
 return {html,embedded,metafile:bundle.metafile};
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const destination=resolve(root,'dist/invierno-esbuild-poc.html');
 const {html}=await buildPoc();
 if(process.argv.includes('--check')){
  const saved=await readFile(destination,'utf8');
  const again=(await buildPoc()).html;
  if(saved!==html||html!==again)throw Error('PoC desactualizado o no determinista; ejecutar npm run build:poc');
  console.log('PoC reproducible: un HTML, sin modificar la referencia');
 }else{
  await mkdir(dirname(destination),{recursive:true});await writeFile(destination,html);
  console.log('Generado dist/invierno-esbuild-poc.html (experimental)');
 }
}
