// Oráculo histórico independiente. Nunca comparar dos salidas del mismo motor como referencia.
import {mkdtemp,readFile,writeFile,mkdir,symlink,unlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url)),reference=process.env.REFERENCE_COMMIT||'57872ee279e924460a126aecbcd0ee7141b5e078';
const out=process.env.D12A_OUTPUT_DIR||'/tmp/d1d2-regressions';await mkdir(out,{recursive:true});
const temporary=await mkdtemp(join(tmpdir(),'invierno-oracle-')),checkout=join(temporary,'reference');
async function run(command,args,cwd=root,env=process.env){
 const child=spawn(command,args,{cwd,env,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';
 child.stdout.on('data',s=>stdout+=s);child.stderr.on('data',s=>stderr+=s);
 const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve);});return {code,stdout,stderr};
}
let added=false;
try{
 const git=await run('git',['worktree','add','--detach',checkout,reference]);if(git.code)throw Error(git.stderr);added=true;
 await symlink(join(root,'node_modules'),join(checkout,'node_modules'),'dir');
 const variants=await Promise.all([['reference',checkout],['candidate',root]].map(async([name,cwd])=>{
  const tests=await run(process.execPath,['--test','--test-reporter=tap'],cwd);await writeFile(join(out,name+'-suite.tap'),tests.stdout+tests.stderr);
  const games=await run(process.execPath,['scripts/run-c14-games.mjs'],cwd,{...process.env,C14_COUNT:'20',C14_OUTPUT_DIR:join(out,name)});await writeFile(join(out,name+'-games.log'),games.stdout+games.stderr);
  const count=key=>Number(tests.stdout.match(new RegExp('^# '+key+' (\\d+)$','m'))?.[1]??NaN);
  return {name,tests:{exitCode:tests.code,tests:count('tests'),pass:count('pass'),fail:count('fail'),skipped:count('skipped'),cancelled:count('cancelled')},gameExit:games.code,
   records:(await readFile(join(out,name,'partidas.jsonl'),'utf8')).trim().split('\n').map(JSON.parse)};
 }));
 const digest=record=>{const {source,...behavior}=record;return createHash('sha256').update(JSON.stringify(behavior)).digest('hex');};
 const [before,after]=variants;if(before.records.length!==40||after.records.length!==40)throw Error('Se requieren40 partidas por variante');
 const comparison=before.records.map((record,i)=>({mode:record.mode,seed:record.seed,beforeDigest:digest(record),afterDigest:digest(after.records[i]),equal:digest(record)===digest(after.records[i])}));
 const summary={reference,variants:variants.map(({records,...variant})=>variant),excludedFields:['source (hashes de HTML/script/adaptador)'],comparison,equal:comparison.filter(x=>x.equal).length};
 await writeFile(join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({reference,variants:summary.variants,configurations:40,equal:summary.equal,out},null,2));
 if(summary.equal!==40||variants.some(v=>v.tests.exitCode||v.gameExit||v.tests.skipped||v.tests.cancelled))process.exitCode=1;
}finally{
 if(added){await unlink(join(checkout,'node_modules')).catch(()=>{});const removed=await run('git',['worktree','remove',checkout]);if(removed.code)throw Error('No se eliminó checkout temporal: '+removed.stderr);}
 await rm(temporary,{recursive:true,force:true});
}
