import Phaser from 'phaser';

// Adaptador exclusivo de Phaser 4.2.1. Su VisibilityHandler deja un listener
// document-level al destruir Game y pisa window.onblur/onfocus. Conservamos el
// arranque WebGL de Game.start (método protegido), con suscripciones cancelables.
// Revisar este adaptador antes de cambiar la versión; no es lógica del juego.
export class HospitalGame extends Phaser.Game {
 start(){
  this.isRunning=true;this.config.postBoot(this);this.loop.start(this.step.bind(this));
  const controller=new AbortController(),options={signal:controller.signal};
  document.addEventListener('visibilitychange',()=>document.hidden?this.onHidden():this.onVisible(),options);
  window.addEventListener('blur',()=>this.onBlur(),options);
  window.addEventListener('focus',()=>this.onFocus(),options);
  this.events.once(Phaser.Core.Events.DESTROY,()=>controller.abort());
 }
}
