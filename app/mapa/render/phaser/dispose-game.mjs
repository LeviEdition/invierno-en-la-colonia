import Phaser from 'phaser';
import {retireHospitalGame} from './game.mjs';

// Revisar este teardown junto al adaptador ANTES de cambiar Phaser.
// Phaser4.2.1: Game.destroy solo marca pendingDestroy. Procesarlo mediante
// step evita depender de un rAF que puede estar suspendido en pagehide.
export function disposeGame(game,canvas){
 const renderer=game?.renderer,gl=renderer?.gl||(game?.canvas===canvas?canvas.getContext('webgl'):null);
 const errors=[];const attempt=fn=>{try{fn();}catch(error){errors.push(error.message);}};
 if(game){
  retireHospitalGame(game);
  game.loop?.stop();
  if(game.scene?.systemScene){
   attempt(()=>{game.destroy(true);game.step(performance.now(),0);});
  }else{
   // El constructor puede fallar antes de READY: Game.destroy presupone una
   // systemScene y TextureManager.destroy presupone stamp, aún inexistentes.
   // Cortar primero READY impide arrancar desde cargas internas tardías.
   game.textures?.removeAllListeners();game.events.removeAllListeners();
   for(const manager of [game.input,game.scale,game.sound,game.plugins,game.cache])if(manager)attempt(()=>manager.destroy());
   if(game.textures){
    for(const texture of Object.values(game.textures.list))attempt(()=>texture.destroy());
    Phaser.Display.Canvas.CanvasPool.remove(game.textures);
   }
   if(renderer?.baseDrawingContext)attempt(()=>renderer.destroy());
   else if(renderer){
    canvas.removeEventListener('webglcontextlost',renderer.contextLostHandler);
    canvas.removeEventListener('webglcontextrestored',renderer.contextRestoredHandler);
    renderer.removeAllListeners();
   }
   // Los Image.onload internos que eventualmente terminen ya no tienen READY
   // ni renderer donde subir texturas. Sus referencias CPU quedan para GC.
   game.renderer=null;game.scene=null;game.loop?.destroy();
  }
 }
 // Incluye la textura temporal no registrada en wrappers por esta versión.
 gl?.getExtension('WEBGL_lose_context')?.loseContext();canvas.remove();
 return {cleanupErrors:errors};
}
