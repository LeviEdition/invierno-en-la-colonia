import test from 'node:test';
import assert from 'node:assert/strict';
import {waitForStartup} from '../prototypes/hospital-phaser/startup.mjs';

test('H3.2 cierre: timeout acotado y rechazo tardío no reabre una espera terminada',async()=>{
 let reject;const pending=new Promise((_,r)=>reject=r);
 await assert.rejects(waitForStartup(pending,{deadline:performance.now()+20}),{code:'STARTUP_TIMEOUT'});
 reject(Error('Fallo tardío ya retirado'));await new Promise(resolve=>setTimeout(resolve,5));
});
test('H3.2 cierre: abortar cancela una carga pendiente y conserva su motivo',async()=>{
 const controller=new AbortController(),reason=new DOMException('Página abandonada','AbortError');
 const pending=waitForStartup(new Promise(()=>{}),{signal:controller.signal});controller.abort(reason);
 await assert.rejects(pending,error=>error===reason);
 await assert.rejects(waitForStartup(Promise.resolve('tarde'),{signal:controller.signal}),error=>error===reason);
});
test('H3.2 cierre: cancelación previa consume también el rechazo de una descarga tardía',async()=>{
 const controller=new AbortController();controller.abort();
 await assert.rejects(waitForStartup(Promise.reject(Error('Descarga tardía')),{signal:controller.signal}),{name:'AbortError'});
 await new Promise(resolve=>setTimeout(resolve,5));
});
