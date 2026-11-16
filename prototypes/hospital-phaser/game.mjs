import Phaser from 'phaser';
const retiredGames=new WeakSet();
export function retireHospitalGame(game){retiredGames.add(game);}

// Adaptador exclusivo de Phaser 4.2.1. Su VisibilityHandler deja un listener
// document-level al destruir Game y pisa window.onblur/onfocus. Conservamos el
// arranque WebGL de Game.start (método protegido), con suscripciones cancelables.
// Omite HEADLESS, prefijos de navegadores antiguos y broadcasts HIDDEN/BLUR:
// este PoC usa WebGL, document.hidden estándar, sin consumidores efectivos (NoAudio tiene handlers NOOP).
// PAUSE/RESUME y reloj/foco siguen pasando por Game.onHidden/onVisible/etc.
// No existe una opción pública para desactivar solo VisibilityHandler4.2.1.
// Revisar ANTES de cambiar versión/consumidores; justificación en informe76.
export class HospitalGame extends Phaser.Game {
 start(){
  // Un callback de boot tardío no puede reactivar una instancia ya retirada.
  if(retiredGames.has(this))return;
  this.isRunning=true;this.config.postBoot(this);this.loop.start(this.step.bind(this));
  const controller=new AbortController(),options={signal:controller.signal};
  document.addEventListener('visibilitychange',()=>document.hidden?this.onHidden():this.onVisible(),options);
  window.addEventListener('blur',()=>this.onBlur(),options);
  window.addEventListener('focus',()=>this.onFocus(),options);
  this.events.once(Phaser.Core.Events.DESTROY,()=>controller.abort());
 }
}
