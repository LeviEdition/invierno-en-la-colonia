// Azar reproducible: el mismo LCG32 que usa test-support/game-fixture.mjs.
// x = (1664525·x + 1013904223) mod 2^32; random = x / 2^32.
export const descripcionAzar='LCG32: x=(1664525*x+1013904223) modulo 2^32; random=x/2^32';
export function crearAzar(semilla){
 let x=semilla>>>0,llamadas=0;
 const math=Object.create(Math);
 math.random=()=>{llamadas++;x=(Math.imul(1664525,x)+1013904223)>>>0;return x/4294967296;};
 return {Math:math,llamadas:()=>llamadas,estado:()=>x};
}
// Semilla de la partida i, igual que en tests/partidas-completas-c14.test.mjs.
export const semillaC14=i=>Math.imul(i,2654435761)>>>0;
