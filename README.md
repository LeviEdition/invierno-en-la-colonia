# Invierno en la Colonia

Proyecto de videojuego de supervivencia en desarrollo gradual. Primero usamos una adaptación funcional de *Dead of Winter* como referencia; después construiremos una experiencia original principalmente singleplayer, con Director de Juego y consecuencias narrativas persistentes.

## Rumbo acordado

1. **Fidelidad mecánica de la V9.9: ACEPTADA para nuestro objetivo.** La estabilización C está integrada y la [comparación de 14 áreas con el reglamento oficial](docs/49-c15-auditoria-final.md#comparación-con-dead-of-winter) documenta semejanzas y diferencias. El creador acepta esta fidelidad **suficiente**, sin exigir copia literal, reauditoría RF desde cero ni reproducir todas las reglas oficiales. Las reservas sobre Android físico, accesibilidad y balance siguen documentadas.
2. **D1 y D2: integradas y validadas en main.** Estado, reglas, acciones, turnos, IA/interfaz separados;467 pruebas ycomparaciones de partidas preservan el comportamiento de referencia. **No modificar reglas ni introducir mecánicas nuevas** durante este refactor.
3. **Preservar la referencia resultante.** Una vez aceptada la arquitectura, conservar una versión identificable y reproducible (SHA, build y pruebas) con autorización.
4. **Comenzar nuestro juego propio.** En otra línea de desarrollo, revisar la **matriz F** (F-01, F-14, etc.) e implementar cambios propios, singleplayer, Director y narrativa persistente por etapas.

**Distinguir conceptos:** el informe 49 es la comparación mecánica ya realizada; una nueva matriz RF **no es requisito**. La matriz **F** registra decisiones de diseño **para el juego propio**, no bugs de la V9.9. La etapa F histórica (ampliación/presentación/red) tampoco es esa matriz.

## Documentación y estado

- [Tablero operativo — próxima tarea](docs/18-tablero-operativo.md)
- [Decisión vigente — D1/D2 cerradas y preservación formal pendiente](docs/62-hitos-referencia-fiel-y-juego-propio.md)
- [Hoja de ruta del singleplayer — bloques SP-00 a SP-08, acuerdos y pendientes](docs/63-hoja-de-ruta-planificacion-singleplayer.md)
- [Dirección de producto](docs/51-rumbo-fidelidad-e-identidad.md)
- [Alcance de la matriz F del juego propio](docs/61-alcance-matriz-f-juego-propio.md)
- [Plan general](docs/01-plan-refactorizacion.md)

El [PR15](https://github.com/LeviEdition/invierno-en-la-colonia/pull/15) se integró mediante merge convencional `6b8bfcadfeb99d16a10b6f4576f3b061584ee1f9`, preservando historia yoráculo57872ee. [Informe71](docs/71-integracion-main-y-cierre-d1-d2.md) registra la validación posterior:467/467,40/40 contra cada referencia, partidas Chromium yoffline aprobados. SP-03 permanece conceptual ysin cambios respecto del head aprobado.

**Próximo paso:** preservar formalmente la versión modular de referencia con autorización específica. Todavía no hay nuevo tag/release ni rama del juego propio; no comenzar mecánicas singleplayer o Director narrativo.

## Desarrollo y construcción

Requiere Node22 o posterior. Ejecutar `npm ci`, `npm run build`, `npm run check:build` y `npm test`. El lockfile fija esbuild0.28.2; no hay dependencias de ejecución externas. Editar módulos `src/` y la plantilla, nunca el HTML generado a mano. `npm run build` empaqueta módulos reales en una IIFE y la inserta en un único HTML autocontenido. La salida conserva la apertura offline.

El motor se importa desde `src/application/reference-engine.mjs`, admite reloj/RNG y efectos inyectados, y expone `start`, `dispatch` y `snapshot`. Un motor local funciona sin DOM ni cliente IA. La aplicación conecta vista y agente de referencia por capacidades explícitas; el estado mutable no se publica en window. El paquete de reglas V9.9 sigue representando dos grupos: no existe un nuevo modo singleplayer.

`npm test` construye automáticamente el adaptador Node separado (`dist/reference-test-runtime.js`). Los fixtures históricos conservan VM y sus aserciones; ya no extraen ni reescriben funciones del HTML. `npm run test:poc` es un alias histórico que ahora compara contra el commit57872ee en un checkout temporal, incluyendo451 tests históricos y40 partidas por variante. Requiere historial Git completo.

Para Chromium, ejecutar `node scripts/build-browser-scenario.mjs` y servir la raíz en8765. Los scripts de escenarios usan `dist/invierno-test.html` (instrumentación QA separada); `check-production-replays.mjs` repite las entradas sobre el HTML de producto, sin acceso al estado interno. Ver comandos y límites en el informe67.
