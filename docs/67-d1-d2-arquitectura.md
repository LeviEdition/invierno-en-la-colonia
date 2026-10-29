# 67 — Continuación D1 y D2 (29/10/2026)

## Autorización y límites

El creador indicó: «Avanza todo incluso d2, manteniendo las reglas de alcance y de autorización». Autoriza continuar las etapas técnicas después del checkpoint D1.2b. Los límites anteriores de detener cada subetapa quedan superados por esta autorización; siguen prohibidos cambios de reglas/balance, SP-02, singleplayer, narrativa, fusiones, releases y modificaciones de main. No crear una versión oficial de referencia (hito 2).

Rama de trabajo: `refactor/d1-d2-arquitectura`, desde `57872ee279e924460a126aecbcd0ee7141b5e078`, árbol inicialmente limpio. Remoto main `0b75d01`, D1 `ba9a423`, sin diferencias con los SHA conocidos. PR14 **ya está fusionado** según GitHub; corresponde a estabilización histórica, no es un PR de esta refactorización. Esta tarea no realizó esa fusión.

## Referencia y compuertas

`npm ci`, `npm run check:build` y `npm test`: referencia local aprobada, 451 pruebas, cero fallos/omisiones. Se conserva checkout temporal detached de 57872ee para comparación independiente: no comparar dos builds del mismo código y llamarlo preservación. No se crea tag ni release.

Secuencia: completar contratos de eventos/build (D1), separar estado/reglas/transiciones y presentación por puertos (D2), separar automatismos como cliente opcional, conservar adaptadores de las pruebas históricas, comparar 40 configuraciones completas contra 57872ee; validar interfaz, offline y CI sobre SHA entregado. Cada bloque debe poder revertirse.

Riesgos confirmados: paint procesa rescates, funciones de reglas abren/cierra modales y DeathDirector escribe DOM; extraer archivos sin separar esos efectos no sería completar D2. Se conservará el orden de cada efecto. Contexto interno de compatibilidad no será API pública del motor ni se publicará en window.

## Resultados

En curso. Las pruebas de la implementación y el CI final todavía no se han ejecutado. La emulación móvil no sustituye Android físico. El entorno administrado bloquea file://; se verificará también en Actions, sin eludir la política local.

## Bloque 1 — separación del motor, todavía sin cambiar distribución

Se extrajeron fábricas de datos/estado/reglas/objetos/crisis, transiciones de turno, cola de muertes y presentación. `reference-engine.mjs` conserva los comandos y enlaces privados de compatibilidad; ningún acceso se publica en window. El motor importa reglas/turnos, pero no DOM, presentación ni agente. Los efectos visuales son puertos opcionales. El renderer observa una vista viva protegida contra escritura. `paint` sigue siendo un refresco de aplicación que procesa rescates en los mismos puntos; `draw` solo presenta.

Adaptador de pruebas separado, construido desde los mismos módulos: reemplaza extracción/regex del script en 15 fixtures sin cambiar aserciones de mecánicas. El test de IA sustituye explícitamente el puerto pause en vez de reescribir texto. El producto no importa el adaptador. La distribución principal aún es la de referencia durante este bloque; no se declara adoptado todo el build.

Validación inicial de extracción: 451/451. Nuevas pruebas de frontera: primero dos fallos reales (vista podía escribir; modo IA sin cliente permitido), luego 3/3; suite total 454/454, sin omisiones. Comparación estricta de 40 partidas (20 por modo) contra checkout57872ee: **40/40 idénticas**, excluyendo exclusivamente metadatos source. Incluye trace.step, mensajes y eventos; no se normalizó el orden de acciones para obtener igualdad. La última extracción de datos/clases conserva 454/454; se repetirá comparación en el artefacto integrado.

Revisión crítica propia: el estado de referencia aún contiene humans/bots y reglas de dos grupos, por fidelidad al comportamiento aprobado. La fábrica de estado y el paquete de reglas son dependencias sustituibles; no se implementa una regla de un grupo. Agente extraído pero todavía requiere endurecer sus capacidades para dejar de escribir directamente. Antes de dar D2 terminado se migrarán eventos globales, se adoptará el artefacto modular y se validará esa separación. No se afirma revisión por una segunda persona/agente.
