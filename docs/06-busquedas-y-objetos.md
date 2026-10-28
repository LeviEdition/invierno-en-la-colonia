# 06 — Búsqueda, ruido, mazos y objetos (V9.9)

**Estado:** caracterización parcial del motor. El archivo jugable `invierno_colonia_v9_9.html` permanece intacto.

## 1. Cómo funciona una búsqueda

La entrada `search()` valida al superviviente activo y su ubicación. Si está fuera de la colonia, tiene mazo disponible y se seleccionó un dado que cumple `effectiveSearch(p)`, consume exactamente **un dado** y llama a `beginSearch(p, side)`.

La búsqueda revela inicialmente una carta. Si el personaje tiene la habilidad de exploración (`scout`), revela dos. Una linterna equipada puede revelar **una carta adicional sin ruido**, una vez por ronda.

El jugador humano elige una carta con `chooseLoot(i)`; el resto vuelve **al fondo** del mazo. La IA elige según prioridades definidas en el motor y devuelve las cartas no elegidas.

## 2. El ruido es «forzar la suerte»

Mientras una búsqueda está pendiente, `addNoiseSearch()` permite revelar **hasta cuatro cartas extra**, siempre que queden cartas en el mazo.

Cada uso de esta acción aumenta `game.zones[loc].noise` en uno. Durante la fase de colonia, `colony()` tira un dado por cada ficha de ruido:

| Resultado | Consecuencia |
| --- | --- |
| 1, 2 o 3 | Aparece un zombi |
| 4, 5 o 6 | No aparece zombi |

Las fichas de ruido se limpian después de resolver sus tiradas. El sistema guarda ruido por localidad, no por superviviente.

## 3. Reglas de objetos comprobadas

- Hay seis mazos exteriores con veinte cartas cada uno y definiciones conocidas en `ItemCatalog`.
- Las cartas de muestra conservan `finderId`, permitiendo asociar su uso al personaje que las halló.
- Las cartas de rescate elegidas reclutan inmediatamente en la colonia cuando hay plaza; no van a la mano.
- Comida y medicina aplican sus efectos, consumen carta y generan residuos.
- Un superviviente no puede equipar dos herramientas de la misma categoría; si se rechaza el equipamiento, no se consume la carta.
- Usar un manual puede quitar hasta dos residuos y construir una barricada; como se consume, genera un residuo nuevo.
- En una búsqueda con dos cartas visibles, la IA con habilidad `scout` prioriza una muestra frente a una ración, y devuelve la otra carta.

**Alcance limitado:** faltan muchas combinaciones de los diecisiete objetos diferenciados: escopeta, rifle, hacha, habilidades de especialista, interacción entre equipo y acción, donación a crisis y transferencia de equipo.

## 4. Nuevas pruebas automáticas

Se agregó `tests/busqueda-objetos.test.mjs` con **17 pruebas de caracterización**:

1. Composición básica y tamaños de mazos.
2. Prohibición de buscar en la colonia.
3. Dado de búsqueda insuficiente.
4. Dado correcto y selección pendiente.
5. Elección y retorno de descartes al fondo.
6. Límite de cuatro ruidos.
7. Mazo vacío.
8. Bloqueo de una segunda búsqueda sin elegir la primera.
9. Habilidad de Iris.
10. Linterna una vez por ronda.
11. Identidad de quien encontró una muestra.
12. Reclutamiento inmediato.
13. Prioridad de muestras de la IA con dos cartas reveladas.
14. Resolución de ruido con dados.
15. Consumibles de comida y medicina.
16. Restricción de dos herramientas.
17. Manual de fortificación y residuos.

Las 17 nuevas pruebas pasaron en Node.js 22 sobre la copia de la V9.9 original. El archivo de pruebas subido a GitHub es idéntico al ejecutado localmente (Git blob `0afb0f517ca26886cab3986283ae433b08b58dc4`).

## 5. Hallazgos arquitectónicos

**La búsqueda ya distingue partes reutilizables**, como `drawItem()` (extraer), `stashLoot()` (resolver carta) y `beginSearch()` (iniciar). Es un buen candidato a módulo del motor.

Sin embargo, `beginSearch()` abre directamente modales a través de `show('lootChoice')`, y `chooseLoot()` cierra la ventana usando `document.getElementById`. La separación entre lógica y presentación sigue siendo incompleta.

En una futura arquitectura, la acción `search` produciría un evento `loot_revealed` y `chooseLoot` uno `loot_chosen`. El renderizador sería responsable de mostrar/cerrar la elección, sin alterar los dados o mazos.

**No se corrigieron reglas durante esta etapa.** Los defectos #2 y #3 siguen registrados y pendientes. No se identificó un defecto nuevo confirmado en estas 17 situaciones; eso no garantiza que no existan otros.

## 6. Siguiente bloque recomendado

Probar combate y equipamiento (pistola, rifle, escopeta, hacha, linterna, palanca), luego transferencias de objetos y aportes a crisis. Después auditar el ciclo completo del turno y la IA.

## 7. Cómo ver estas pruebas en tu equipo

```powershell
git switch refactor/arquitectura
git pull --ff-only
npm test
```

Tras agregar este bloque, la suite debe contener **48 pruebas** (4 + 6 + 10 + 11 + 17). La comprobación conjunta se realiza mediante GitHub Actions; no debe confundirse con prueba visual o partida completa.
