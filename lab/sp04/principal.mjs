// ¿Este módulo es el que se ejecutó con `node archivo.mjs`? Compara rutas y no URLs:
// en Windows la letra de unidad puede llegar en otra caja (C: frente a c:).
import {fileURLToPath} from 'node:url';import {resolve} from 'node:path';
const normal=p=>{const r=resolve(p);return process.platform==='win32'?r.toLowerCase():r;};
export const esPrincipal=url=>!!process.argv[1]&&normal(fileURLToPath(url))===normal(process.argv[1]);
