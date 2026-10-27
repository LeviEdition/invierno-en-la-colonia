# 07 — Auditoría de combate, armas, equipo y aportes a crisis

**Versión de referencia:** `invierno_colonia_v9_9.html`. **Rama:** `refactor/arquitectura`. **Alcance:** pruebas del comportamiento actual, no cambios de reglas.

## 1. Cómo se resuelve un ataque

La función `attack()` comprueba que haya zombis en la localidad y que el superviviente activo tenga un dado con valor suficiente. Usa `consume(effectiveAttack(p))` para retirar **exactamente un dado**; después delega el combate en `itemEngine.attack(p, side)`.

`effectiveAttack()` considera:

- Valor de ataque propio del personaje.
- Bonificación de la habilidad `fighter` (−1 al requisito).
- Bonificación de rifle **o** hacha (−1 al requisito).
- Mínimo permitido de 1.

Una acción sin zombis o con dado insuficiente se rechaza sin gastar el dado.

## 2. Qué hace el equipamiento

| Objeto | Comportamiento actual caracterizado |
| --- | --- |
| Pistola | Evita exposición del primer ataque de cada ronda; uso reiniciado por `newRound()` |
| Escopeta | Elimina hasta dos zombis con un dado; el ataque sigue requiriendo exposición |
| Rifle | Reduce en uno el requisito de ataque; evita exposición una vez por ronda **fuera** de la colonia |
| Hacha | Reduce en uno el requisito de ataque; al atacar desde la colonia puede colocar una barricada una vez por ronda si hay espacio |
| Palanca | Reduce en uno el requisito de búsqueda |
| Herramientas de reparación | Permiten colocar una barricada adicional por acción de construir |
| Otras herramientas | Su uso completo se ha estudiado en el bloque de búsqueda (linterna) y sigue parcialmente pendiente |

**Detalle de arquitectura:** estas bonificaciones se calculan en el momento de actuar; no alteran permanentemente las estadísticas base del personaje.

## 3. Transferencia de equipamiento

`startTransfer()` ofrece destinatarios que están vivos, se encuentran en la misma localidad y no tienen otro equipo de la misma categoría. `chooseTransfer()` mueve el objeto del equipamiento del origen al destino.

**Inconsistencia reproducida:** la lista puede incluir personajes del **otro grupo**. El texto de la interfaz, en cambio, habla de `superviviente propio`. En una ejecución de prueba, una pistola pasó de Mara (`h0`) a Ada (`a0`).

Se registró el seguimiento [#4 — Transferencias entre grupos](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4). **No se corrigió**: debemos decidir antes si los intercambios cooperativos entre grupos están permitidos o no. El archivo de pruebas contiene un `test.todo()`, no una aserción que convierta ese comportamiento discutible en contrato permanente.

## 4. Donaciones a crisis y equipamiento perdido

El motor `CrisisManager` acepta únicamente cartas de la categoría que exige la crisis. Puede recibirlas:

- Directamente desde la mano del jugador activo.
- Desde el equipamiento de un superviviente del grupo activo.

Los aportes no generan residuos. Una crisis con necesidad 2 admite hasta 4 objetos; llegar a 4 permite ganar +1 moral al resolverla.

Al morir un superviviente:

- **Dentro de la colonia:** su equipo vuelve a la mano de su grupo.
- **Fuera de la colonia:** el equipo se mezcla con el mazo de la localidad.

## 5. Qué pruebas se añadieron

`tests/combate-equipamiento.test.mjs` contiene **22 pruebas ejecutadas y aprobadas**, más **una prueba TODO** para la regla pendiente de transferencias cruzadas. Cobertura:

1. Ataque básico, dado insuficiente y localidad sin zombis.
2. Escopeta contra uno o varios zombis.
3. Pistola: primer ataque protegido, segundo sin protección y reinicio por ronda.
4. Rifle dentro y fuera de la colonia.
5. Hacha dentro y fuera de la colonia.
6. Palanca y herramientas de reparación.
7. Transferencia válida y rechazo de equipo de igual categoría.
8. Crisis: categoría correcta, donaciones desde equipamiento, límite y sobreaporte.
9. Muerte y destino de equipo dentro o fuera de la colonia.
10. Habilidad de combate de Bruno en modo local.
11. Barricadas sin capacidad disponible.

**Verificación local:** `node --test tests/combate-equipamiento.test.mjs` con Node.js 22 → 22 aprobadas, 0 fallidas, 1 TODO. El archivo subido a GitHub tiene exactamente el mismo blob Git SHA que el ejecutado: `e9cafe4ab9a26fed7a626a06c547e6e69fd032de`.

## 6. Limitaciones

Estas pruebas aíslan visualización y usan azar controlado mediante `node:vm`. **No equivalen a una partida completa**: falta validar múltiples ataques en situaciones de encrucijada o mordedura pendiente, interacciones con IA, cambios de líder, escenas visuales y experiencia táctil.

La suite acumulada pasa de 48 a **70 pruebas ejecutables** (4 + 6 + 10 + 11 + 17 + 22), más **1 TODO**. GitHub Actions verificará el conjunto; el conteo total del ejecutor puede mostrar 71 casos, de los cuales uno está pendiente.

## 7. Hallazgo para nuestra futura arquitectura

`attack()` coordina requisitos y gastos; `ItemEngine.attack()` aplica efectos. Ya existe una separación parcial.

Una arquitectura más robusta permitiría que una acción `attack({survivorId, dieIndex})` devolviera cambios y eventos de juego, por ejemplo `zombies_defeated`, `exposure_rolled` o `barricade_built`. El renderizador recibiría los eventos para mostrar animaciones. **Eso es una propuesta futura, no una modificación implementada.**

## Siguiente bloque

Auditar **ciclo completo de turnos y fase de colonia** (alimentación, hambre, residuos, oleadas, sobrepoblación, limpieza, atraer zombis) y después la **IA y condiciones de victoria o derrota**.
