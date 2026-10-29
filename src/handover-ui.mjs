// Primer contrato UI: solo inicio y confirmación de pase. No recibe estado del juego.
const installations=new WeakSet();
const routes=[
 ['#setupScreen [onclick="startGame(\'ai\')"]','ai'],
 ['#setupScreen [onclick="startGame(\'local\')"]','local'],
 ['#passScreen [onclick="confirmPass()"]',null],
];
export function bindHandoverControls(root,{startGame,confirmPass}){
 if(typeof startGame!=='function'||typeof confirmPass!=='function')throw TypeError('Se requieren los comandos startGame y confirmPass');
 if(installations.has(root))throw Error('Los controles de inicio/pase ya están conectados');
 const listener=event=>{
  const button=event.target?.closest?.('button');
  if(!button||button.disabled)return;
  const route=routes.find(([selector])=>button.matches(selector));if(!route)return;
  // Captura antes del atributo legado: no ejecutar dos veces el mismo comando.
  event.preventDefault();event.stopImmediatePropagation();
  if(route[1]===null)confirmPass();else startGame(route[1]);
 };
 root.addEventListener('click',listener,true);
 let disposed=false;
 const dispose=()=>{
  if(disposed)return;disposed=true;root.removeEventListener('click',listener,true);installations.delete(root);
 };
 installations.add(root);return dispose;
}
