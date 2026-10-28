# 43 — C10 / issue #7: prioridades contextuales en encrucijadas

**Fecha:** 28/10/2026. **Base:** `6fdb774`. **Rama:** `fix/estabilizacion-v9-9`. **Estado:** código, pruebas locales, Chromium y revisión independiente completos; pendiente CI y aceptación del creador.

## Decisión autorizada y alcance

El creador aprobó la política contextual del informe42 y R3→apagar, con desempate numérico estable. Autorizó implementar, crear commits y subir a la rama existente. No fusionar PR14, tocar `main`, cerrar #7 ni empezar #13/narrativa. Los informes41/42 conservan las propuestas anteriores; las aprobaciones actuales sustituyen sus preguntas pendientes.

La IA considera solo opciones permitidas; compara victoria real (sin derrota simultánea), continuación frente a derrota, menos muertes inmediatas (incluidos indefensos), cobertura de alimento según población posterior y cocinero, mejora de moral si inicialmente≤3, progreso de muestras, desempate numérico y orden estable de opciones. La necesidad de alimentación corresponde al estado al finalizar la consecuencia, sin predecir acciones posteriores.

## Implementación y motivos

La heurística de expresiones regulares se sustituye por `evaluateCrossOptions()` y `chooseCrossOption()`. Se ejecutan los mismos callbacks sobre copias JSON independientes del estado serializable actual. Un contexto explícito aísla zombis, muerte, reclutamiento y verificación: no se cambia la variable global `game`, ni se invocan avisos, modales, colas de muerte o selección de interfaz al evaluar. Los predicados de elegibilidad están anexos a cada opción; texto, título y etiquetas ya no determinan reglas ni decisiones. Las condiciones de activación siguen en el flujo existente.

`gameOutcome()` comparte el orden de condiciones con `verify()`; `feedingNeed()` se comparte con colonia. Se reutilizan `addZombie`, `kill`, `recruit`, reemplazos y revisión de líder mediante un contexto opcional; sin contexto mantienen su comportamiento vivo. La evaluación no elige sucesores humanos ni genera estados pendientes globales. El orden de mazos mezclados al morir se omite durante evaluación, porque no afecta las consecuencias inmediatas evaluadas; la resolución real conserva la mezcla.

Los reclutamientos exploran los candidatos realmente disponibles sin llamar a `Math.random`. Cada opción toma su peor resultado inmediato: evita asumir un cocinero o reemplazo favorable. Esto es una elección conservadora de implementación ante azar, no planificación de varios turnos ni garantía de inteligencia óptima.

El desempate usa `0,5×Δcomida + Δmoral + 0,5×Δbarricadas − Δzombis + 0,5×ΔvalorObjetos − 0,5×Δruido − 0,1×Δresiduos`. Los objetos cuentan por unidad; comida en cartas cuenta por cantidad indicada por el catálogo. Se incluyen manos de ambos grupos y equipo vivo; no se asigna una personalidad ni una valoración específica por carta. Son coeficientes simples de desempate, posteriores a todas las urgencias, sin afirmación de balance óptimo.

## Pruebas y revisión

TDD inicial:43 tests de encrucijadas; antes32 aprobados/11 fallidos, después43 aprobados/0 fallidos. Los fallos incluyen R2/R3/M2/S1 y dependencia de texto, además de pruebas para la API de evaluación todavía inexistente. R1/M1 ya coincidían con la heurística previa: son controles de aceptación, no se presentan como defectos nuevos.

Ampliación inicial:50/50 encrucijadas, con seis referencias, elegibilidad, efectos condicionales, muertes/desbordamientos, empate, no mutación/consumo de azar/interfaz, cambios de texto, cocinero/población posterior y reemplazo del último superviviente. Cuatro tests parametrizados comprueban52 opciones×3 estados×2 dueños×2 modos=624 combinaciones; cada resolución permitida debe coincidir con uno de sus resultados evaluados. No son624tests declarados por Node.

Experimento temporal independiente adicional compara las624 combinaciones entre HTML previo de `6fdb774` y HTML actual: estados mecánicos, elegibilidad, resolución, selección y pendientes de muerte/liderazgo equivalentes. No se modifica el archivo histórico. Suite completa inicial 349/349. Resultado final: **358/358 aprobadas, 0 fallidas/canceladas/omitidas/TODO**, incluidas **52 pruebas de encrucijadas**. Los dos casos adicionales comprueban derrota por falta de reemplazos frente a muestras completas y ejecución con acceso global prohibido.

## Límites

No se prueban partidas completas naturales, balance exhaustivo, Android físico ni TalkBack. La política es inmediata, no calcula alimentación después de futuras acciones ni simula una fase completa de colonia. Las futuras cartas que agreguen operaciones nuevas deben propagar el contexto y ampliar las pruebas de conformidad/aislamiento. El recorrido de azar es finito para las cartas actuales (reclutamiento/reemplazos); nuevas consecuencias con bucles o azar adicional necesitan revisar ese contrato. El `pendingLeader` global único sigue como reserva preexistente, fuera del arreglo #7.


## Resultados de aceptación

| Caso | Decisión de IA | Resultado comprobado al confirmar |
| --- | --- | --- |
| R1 | Confiar en la señal | Comida 1→3: cubre la necesidad de 3; llegan dos zombis |
| R2 | Apagar la radio | Moral 2→3, con comida 8 suficiente |
| R3 | Apagar la radio | Ninguna opción cubre3 comidas; prioriza moral 2→3 |
| M1 | Investigar | Muestras 4→5/5 y victoria real, sin muerte |
| M2 | Evitar | Conserva moral 1 y a Leo vivo; investigar perdería pese a llegar a 5 muestras |
| S1 | Racionar | Comida 3→5; la guardia no daría barricada ni moral sin acceso |

Los seis escenarios pasan en Node y Chromium. No hay excepciones en la política por nombres de estas cartas.

## Chromium e interfaz

**Chromium 154.0.8037.57**, real/headless, escritorio 1365×768 y móvil emulado 393×852 con táctil. **16 recorridos aprobados (8 por viewport)**: R1/R2/R3/M1/M2/S1, J1 local y J2 local después del pase de dispositivo. Se comprueban elección visible, estado sin efectos antes de confirmar, botón real de continuar, resolución única/liberación de espera IA, elección manual y opción sin medicina deshabilitada. Cero excepciones JS; sin desbordamiento horizontal al finalizar el recorrido local. No se sustituye la interfaz con stubs en estos recorridos. Los estados iniciales sí se preparan por código para reproducibilidad.

Script conservado: [check-issue7-browser.mjs](../scripts/check-issue7-browser.mjs). Evidencia: [resultados Chromium](evidencias/c10-issue7-chromium.json). Reproducción: servir la raíz con `python -m http.server 8765 --bind 127.0.0.1`, luego ejecutar `PLAYWRIGHT_MODULE=/ruta/a/playwright-core/index.mjs node scripts/check-issue7-browser.mjs`; admite `CHROMIUM_PATH` y `ISSUE7_URL`. No agrega dependencias de npm ni afecta `npm test`. Se ejecutó dos veces; el segundo recorrido corresponde al HTML final.

## Segunda revisión crítica independiente

Un segundo agente revisó código y política sin editar archivos. Buscó acceso global oculto, mutaciones, divergencia entre evaluación/resolución, reglas duplicadas, decisiones contrarias a prioridades, condiciones terminales y regresiones de modos. **Sin defectos confirmados** en el alcance revisado. 312 evaluaciones independientes con Proxy que prohíbe acceso al `game` global y spies que rechazan azar/mensajes/muerte: aprobadas. Tres bordes adicionales: objetivo con último humano muerto y roster agotado→derrota, rescate con diez candidatos y necesidad de alimento variable, radio con desbordamiento/moral 1→evitar. La suite que revisó pasó 356/356 antes de los últimos dos controles añadidos; la suite final pasó 358/358.

Observación menor: se eliminó `isLeader(p)` redundante en muerte (el personaje ya estaba muerto y la consulta siempre devolvía falso). Se mantuvo la condición por ID del líder; sin cambio de regla. No fue necesario corregir un defecto funcional nuevo. Las52 opciones y el contexto quedaron cubiertos por conformidad/aislamiento; las reglas no se duplican en un simulador aparte.

## Control de versiones y recomendación

Al preparar publicación se incorporaron por fast-forward los commits documentales remotos `7b4de9b`/`f202184`, conservando las decisiones de continuidad y estos informes. Se resolvieron conflictos de docs18/25, sin modificar el motor remoto ni reescribir commits. La base de código de las pruebas sigue siendo la misma que `6fdb774`.

CI de entrega y SHA: se completarán tras publicar a la rama autorizada. [PR14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) permanece abierto/borrador hacia `refactor/arquitectura`. `main` remoto conserva `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb`; no se cierra [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7). No se trabajó #13 ni narrativa.

**Recomendación:** listo técnicamente para aceptación del creador si CI confirma la entrega, con los límites indicados. Después de su revisión puede cerrarse administrativamente #7 mediante autorización separada; esta entrega no lo cierra ni promueve V9.9 a estable.
