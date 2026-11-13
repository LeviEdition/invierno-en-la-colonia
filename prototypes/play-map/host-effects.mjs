// El host horizontal ejecuta el motor sin dibujar ni montar la pantalla V9.
// El observador conserva sus notificaciones/gates; los diálogos viven en el mapa.
export function createMapHostEffects(context){
 const noop=()=>{};
 return {draw(){context.playable();},paintDice:noop,renderModal:noop,toast:noop,resetToasts:noop,showSetup:noop,hideHandover:noop,showPass:noop,hidePass:noop,openDeath:noop,closeDeath:noop,openBackdrop:noop,closeBackdrop:noop,dispose:noop};
}
