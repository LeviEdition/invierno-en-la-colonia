import test from 'node:test';import assert from 'node:assert/strict';
import {readdirSync,readFileSync,statSync} from 'node:fs';import {join,normalize,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
// La evidencia pesada va al artifact del CI. Al repositorio solo entra lo que un
// informe cita: cada archivo de docs/evidencias debe estar enlazado desde algún
// documento (docs/*.md, README, CLAUDE) o desde un fixture de test-support.
// fileURLToPath y no URL.pathname: en Windows pathname da «/c:/…» y la ruta queda «c:\c:\…».
const raiz=fileURLToPath(new URL('../',import.meta.url));
const listar=d=>readdirSync(d).flatMap(n=>{const p=join(d,n);return statSync(p).isDirectory()?listar(p):[p];});
const relativo=p=>p.slice(raiz.length).replaceAll('\\','/');
const documentos=[...listar(join(raiz,'docs')).filter(p=>p.endsWith('.md')),join(raiz,'README.md'),join(raiz,'CLAUDE.md')];
const patrones=new Set();
for(const d of documentos)for(const m of readFileSync(d,'utf8').matchAll(/evidencias\/[^\s)\]"'>`]+/g)){const ref=m[0].split('#')[0].replace(/[.,;:]+$/,'');patrones.add(ref.startsWith('docs/')?ref:relativo(normalize(join(relativo(d).startsWith('docs/evidencias/')?dirname(d):join(raiz,'docs'),ref))));}
for(const f of listar(join(raiz,'test-support')).filter(p=>p.endsWith('.json')))for(const m of readFileSync(f,'utf8').matchAll(/docs\/evidencias\/[^"\s]+/g))patrones.add(m[0]);
const comodin=p=>new RegExp('^'+p.split('*').map(s=>s.replace(/[.+?^${}()|[\]\\]/g,'\\$&')).join('[^/]*')+'$');
const enlazado=f=>[...patrones].some(p=>f===p||f.startsWith(p.replace(/\/$/,'')+'/')||p.includes('*')&&comodin(p).test(f));
test('Evidencia: todo archivo de docs/evidencias está citado por un documento o fixture',()=>{
 const sueltos=listar(join(raiz,'docs/evidencias')).map(relativo).filter(f=>!enlazado(f));
 assert.deepEqual(sueltos,[],'Capturas y JSON sin cita van al artifact del CI, no al repositorio');
});
