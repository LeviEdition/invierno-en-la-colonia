// Única construcción del producto: módulos reales → IIFE → HTML autocontenido.
import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export async function buildGame({template,entryPoint='src/main.mjs',workingDir=root,test=false}={}){
 template??=await readFile(resolve(workingDir,'src/invierno.template.html'),'utf8');
 const marker='/* __GAME_BUNDLE__ */';
 if(template.split(marker).length!==2)throw Error('Debe existir exactamente un marcador de aplicación');
 const result=await build({absWorkingDir:workingDir,entryPoints:[entryPoint],outfile:'game.js',bundle:true,
  format:'iife',platform:'browser',target:'es2022',write:false,sourcemap:false,minify:false,minifySyntax:true,
  charset:'utf8',legalComments:'none',metafile:true,define:{__GAME_TEST__:String(test)}});
 if(result.outputFiles.length!==1)throw Error('Se requiere un único bundle');
 const embedded=result.outputFiles[0].text.replaceAll('</script','<\\/script');
 const html=template.replace(marker,()=>embedded);
 if((html.match(/<script(?:\s[^>]*)?>/g)||[]).length!==1||/<script\s+[^>]*(?:src=|type=["']module)/.test(html))throw Error('HTML no autocontenido');
 return {html,embedded,metafile:result.metafile};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const output=resolve(root,'invierno_colonia_v9_9.html');const {html}=await buildGame();
 if(process.argv.includes('--check')){
  if(await readFile(output,'utf8')!==html||html!==(await buildGame()).html)throw Error('HTML desactualizado o no reproducible: npm run build');
  console.log('Build reproducible: un HTML autocontenido');
 }else{await writeFile(output,html);console.log('Generado invierno_colonia_v9_9.html');}
}
