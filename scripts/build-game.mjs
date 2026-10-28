// D1.1 — Genera el único HTML jugable desde fuentes separadas, sin dependencias.
import {readFile,writeFile} from 'node:fs/promises';

const templateUrl=new URL('../src/invierno.template.html',import.meta.url);
const catalogUrl=new URL('../src/item-catalog.mjs',import.meta.url);
const outputUrl=new URL('../invierno_colonia_v9_9.html',import.meta.url);
const marker='/* __D1_ITEM_CATALOG__ */';

export function assembleHtml(template,catalogSource){
  if(template.split(marker).length!==2)throw Error('Debe existir exactamente un marcador de catálogo');
  const signature='export class ItemCatalog {';
  if(catalogSource.split(signature).length!==2)throw Error('Exportación de ItemCatalog inesperada');
  const embedded=catalogSource.replace(signature,'class ItemCatalog {').trimEnd()+'\\nconst catalog=new ItemCatalog(cards=>mix(cards));';
  const html=template.replace(marker,embedded);
  if((html.match(/<script(?:\\s[^>]*)?>/g)||[]).length!==1)throw Error('El artefacto debe contener un solo script embebido');
  if(/<script\\s+[^>]*src=/.test(html))throw Error('HTML no autocontenido');
  return html;
}

const template=await readFile(templateUrl,'utf8');
const catalog=await readFile(catalogUrl,'utf8');
const output=assembleHtml(template,catalog);
if(process.argv.includes('--check')){
  const committed=await readFile(outputUrl,'utf8');
  if(committed!==output){console.error('HTML desactualizado: ejecutar npm run build y versionar el resultado');process.exitCode=1;}
  else console.log('Build reproducible: HTML autocontenido actualizado');
}else{
  await writeFile(outputUrl,output);
  console.log('Generado invierno_colonia_v9_9.html');
}
