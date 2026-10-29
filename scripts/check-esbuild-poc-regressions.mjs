// Ejecuta TODA la suite intacta sobre el HTML alternativo, en una copia temporal.
// Un fallo se propaga como salida no cero: nunca se convierte en aprobación del PoC.
import {cp,mkdtemp,writeFile,readFile,mkdir,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=process.env.D12A_OUTPUT_DIR||'/tmp/d12a-poc-regressions';
const candidate=await readFile(resolve(root,'dist/invierno-esbuild-poc.html'));
const sandbox=await mkdtemp(join(tmpdir(),'invierno-d12a-'));
await mkdir(output,{recursive:true});
async function execute(args,cwd,env=process.env){
 const child=spawn(process.execPath,args,{cwd,env,stdio:['ignore','pipe','pipe']});
 let stdout='',stderr='';child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);
 const code=await new Promise((done,reject)=>{child.on('error',reject);child.on('close',done);});
 return {code,stdout,stderr};
}
try{
 for(const path of ['tests','test-support','src','scripts','package.json'])await cp(resolve(root,path),join(sandbox,path),{recursive:true});
 await symlink(resolve(root,'node_modules'),join(sandbox,'node_modules'),'dir');
 await writeFile(join(sandbox,'invierno_colonia_v9_9.html'),candidate);
 const {code:exitCode,stdout,stderr}=await execute(['--test','--test-reporter=tap'],sandbox);
 await writeFile(join(output,'suite.tap'),stdout);await writeFile(join(output,'stderr.log'),stderr);
 const count=key=>Number(stdout.match(new RegExp('^# '+key+' (\\d+)$','m'))?.[1]??NaN);
 const summary={artifact:'dist/invierno-esbuild-poc.html',htmlSha256:createHash('sha256').update(candidate).digest('hex'),
  sameTestsAndAssertions:true,exitCode,tests:count('tests'),pass:count('pass'),fail:count('fail'),
  cancelled:count('cancelled'),skipped:count('skipped'),todo:count('todo'),
  failedTests:[...stdout.matchAll(/^not ok \d+ - (.+)$/gm)].map(m=>m[1])};
 // Comparación adicional del motor real: no reemplaza ni filtra el fallo de suite.
 const games=[];
 for(const [label,cwd] of [['reference',root],['candidate',sandbox]]){
  const destination=resolve(output,label);
  const run=await execute(['scripts/run-c14-games.mjs'],cwd,{...process.env,C14_COUNT:'20',C14_OUTPUT_DIR:destination});
  await writeFile(join(output,label+'-games.log'),run.stdout+run.stderr);
  if(run.code!==0)throw Error('Partidas interrumpidas en '+label+'; consultar evidencia');
  games.push((await readFile(join(destination,'partidas.jsonl'),'utf8')).trim().split('\n').map(line=>JSON.parse(line)));
 }
 const digest=record=>{const {source,...behavior}=record;return createHash('sha256').update(JSON.stringify(behavior)).digest('hex');};
 const comparison=games[0].map((before,i)=>{
  const after=games[1][i];
  if(before.mode!==after.mode||before.seed!==after.seed)throw Error('Configuraciones no comparables');
  return {mode:before.mode,seed:before.seed,result:after.final.result,rounds:after.roundsPlayed,
   beforeDigest:digest(before),afterDigest:digest(after),equal:digest(before)===digest(after)};
 });
 await writeFile(join(output,'comparison.json'),JSON.stringify({excludedFields:['source (hashes de HTML/script)'],comparison},null,2)+'\n');
 summary.engineGames={configurations:comparison.length,equalBehavior:comparison.filter(x=>x.equal).length,
  meaning:'mismos estados finales, acciones, eventos, mensajes e invariantes; solo se excluyen hashes de fuente'};
 await writeFile(join(output,'summary.json'),JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify(summary,null,2));process.exitCode=(exitCode!==0||comparison.some(x=>!x.equal))?1:0;
}finally{await rm(sandbox,{recursive:true,force:true});}
