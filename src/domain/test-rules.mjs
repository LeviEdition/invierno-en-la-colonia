// Reglas de prueba del singleplayer. Todas apagadas por defecto: con la
// configuración base el motor resuelve exactamente igual que la referencia.
// El panel de desarrollo solo elige valores; las consecuencias viven en el motor.
export const COMIDA_INICIAL=Object.freeze([6,8,10]);
export const TEST_RULE_DEFAULTS=Object.freeze({comidaInicial:6,laNoche:false,regreso:false,crisisParcial:false});
// La noche pertenece al singleplayer: en dos jugadores locales la opción no existe.
export const nightAvailable=mode=>mode==='ai'||mode==='solo';
// Mitad de lo pedido redondeando hacia arriba: a partir de ahí el aporte es parcial.
export const partialThreshold=need=>Math.ceil(need/2);
// La consecuencia parcial es la mitad redondeando hacia abajo.
export const halvedConsequence=amount=>Math.floor(amount/2);
export function normalizeTestRules(patch,base=TEST_RULE_DEFAULTS){
 const rules={...TEST_RULE_DEFAULTS,...base};
 for(const [key,value] of Object.entries(patch||{})){
  if(!Object.hasOwn(TEST_RULE_DEFAULTS,key))throw TypeError('Regla de prueba desconocida: '+key);
  if(key==='comidaInicial'){
   if(!COMIDA_INICIAL.includes(value))throw RangeError('comidaInicial admite '+COMIDA_INICIAL.join(', ')+': '+value);
   rules[key]=value;
  }else{
   if(typeof value!=='boolean')throw TypeError('La regla '+key+' es un interruptor: '+value);
   rules[key]=value;
  }
 }
 return Object.freeze(rules);
}
export const testRulesActive=rules=>Object.entries(TEST_RULE_DEFAULTS).some(([key,value])=>rules[key]!==value);
// Resumen para el registro de la partida.
export function describeTestRules(rules){
 const parts=[];
 if(rules.comidaInicial!==TEST_RULE_DEFAULTS.comidaInicial)parts.push('comida inicial '+rules.comidaInicial);
 if(rules.laNoche)parts.push('La noche');
 if(rules.regreso)parts.push('Regresar a la colonia');
 if(rules.crisisParcial)parts.push('Crisis parcial');
 return parts.join(' · ');
}
