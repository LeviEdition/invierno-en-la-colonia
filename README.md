# Invierno en la Colonia

Proyecto de videojuego de supervivencia en desarrollo gradual. Primero usamos una adaptación funcional de *Dead of Winter* como referencia; después construiremos una experiencia original principalmente singleplayer, con Director de Juego y consecuencias narrativas persistentes.

## Rumbo acordado

1. **Fidelidad mecánica de la V9.9: ACEPTADA para nuestro objetivo.** La estabilización C está integrada y la [comparación de 14 áreas con el reglamento oficial](docs/49-c15-auditoria-final.md#comparación-con-dead-of-winter) documenta semejanzas y diferencias. El creador acepta esta fidelidad **suficiente**, sin exigir copia literal, reauditoría RF desde cero ni reproducir todas las reglas oficiales. Las reservas sobre Android físico, accesibilidad y balance siguen documentadas.
2. **D1 y D2: integradas y validadas en main.** Estado, reglas, acciones, turnos, IA/interfaz separados;467 pruebas ycomparaciones de partidas preservan el comportamiento de referencia. **No modificar reglas ni introducir mecánicas nuevas** durante este refactor.
3. **Referencia estable y modular preservada.** Tag anotado `v0.9.9-referencia-modular` sobre `62e4e85150b2416ccf07d671c186b5c421993b0b`, con [release pública](https://github.com/LeviEdition/invierno-en-la-colonia/releases/tag/v0.9.9-referencia-modular), HTML offline y manifiesto descargados y verificados. [Informe72](docs/72-preservacion-referencia-modular.md).
4. **Comenzar nuestro juego propio.** En otra línea de desarrollo, revisar la **matriz F** (F-01, F-14, etc.) e implementar cambios propios, singleplayer, Director y narrativa persistente por etapas.

**Distinguir conceptos:** el informe 49 es la comparación mecánica ya realizada; una nueva matriz RF **no es requisito**. La matriz **F** registra decisiones de diseño **para el juego propio**, no bugs de la V9.9. La etapa F histórica (ampliación/presentación/red) tampoco es esa matriz.

## Documentación y estado

- [Tablero operativo — próxima tarea](docs/18-tablero-operativo.md)
- [Decisión vigente — D1/D2 cerradas y referencia preservada](docs/62-hitos-referencia-fiel-y-juego-propio.md)
- [Hoja de ruta del singleplayer — bloques SP-00 a SP-08, acuerdos y pendientes](docs/63-hoja-de-ruta-planificacion-singleplayer.md)
- [Dirección de producto](docs/51-rumbo-fidelidad-e-identidad.md)
- [Alcance de la matriz F del juego propio](docs/61-alcance-matriz-f-juego-propio.md)
- [Plan general](docs/01-plan-refactorizacion.md)

El [PR15](https://github.com/LeviEdition/invierno-en-la-colonia/pull/15) se integró mediante merge convencional `6b8bfcadfeb99d16a10b6f4576f3b061584ee1f9`, preservando historia yoráculo57872ee. [Informe71](docs/71-integracion-main-y-cierre-d1-d2.md) registra la validación posterior:467/467,40/40 contra cada referencia, partidas Chromium yoffline aprobados. SP-03 permanece conceptual ysin cambios respecto del head aprobado.

**Etapa de referencia cerrada:** D1/D2 integradas y preservación formal completada. **Próximo trabajo:** diseño SP-03 (ciclo de ronda), seguido de SP-04 (balance de un solo grupo), en una entrega separada; no hay implementación autorizada. SP-03 permanece intacto y no se creó rama del juego propio. Los commits documentales posteriores al tag no cambian la referencia preservada.

## Prueba visual del hospital — rama de revisión

[PR16 en borrador](https://github.com/LeviEdition/invierno-en-la-colonia/pull/16): escena 2.5D independiente de V9.9, con tres PNG originales, demostraciones delante/detrás/esquina y cámara por arrastre/zoom. En la rama `prototype/hospital-2-5d`, servir la raíz con `python3 -m http.server 8770 --bind 127.0.0.1` y abrir **http://127.0.0.1:8770/prototypes/hospital/**. No necesita instalar dependencias para visualizarla.

**[Abrir la vista previa web sin instalar herramientas](https://raw.githack.com/LeviEdition/invierno-en-la-colonia/901a21ea23311dc0860c4e5363836e352ae29d66/prototypes/hospital/index.html)**, mediante RawGitHack y fijada al commit901a21e. El enlace127.0.0.1 de las instrucciones locales requiere que el servidor esté ejecutándose en el mismo equipo donde se abre el navegador.

[Instrucciones, pruebas, capturas y límites](docs/73-prototipo-visual-hospital-2-5d.md). No se conecta con reglas ni reemplaza la interfaz o distribución offline de referencia. Validación táctil emulada, sin prueba en teléfono físico.

## Descargar la referencia y jugar offline

Descargá [invierno_colonia_v9_9.html](https://github.com/LeviEdition/invierno-en-la-colonia/releases/download/v0.9.9-referencia-modular/invierno_colonia_v9_9.html) desde la release y abrilo directamente en Chromium, mediante doble clic o «Abrir archivo». No requiere servidor, Node ni Internet para jugar. Conserva los modos contra IA y dos jugadores locales.

El [manifiesto publicado](https://github.com/LeviEdition/invierno-en-la-colonia/releases/download/v0.9.9-referencia-modular/manifest-v0.9.9-referencia-modular.json) identifica archivo, tamaño, commit y SHA-256:

```text
43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692  invierno_colonia_v9_9.html
```

Para recuperar el código, clonar el repositorio con historial completo y ejecutar `git checkout --detach v0.9.9-referencia-modular` antes de los comandos de construcción siguientes. El [informe72](docs/72-preservacion-referencia-modular.md#recuperar-y-reconstruir) y las notas de la release incluyen el procedimiento completo. Solo se distribuyen HTML de producto y manifiesto; el HTML QA de `dist/` queda fuera.

La validación cubre Node y Chromium automatizado; no certifica equivalencia reglamentaria completa con *Dead of Winter*, Android físico, TalkBack, otros motores de navegador ni balance humano.

## Desarrollo y construcción

Requiere Node22 o posterior. Ejecutar `npm ci`, `npm run build`, `npm run check:build` y `npm test`. El lockfile fija esbuild0.28.2; no hay dependencias de ejecución externas. Editar módulos `src/` y la plantilla, nunca el HTML generado a mano. `npm run build` empaqueta módulos reales en una IIFE y la inserta en un único HTML autocontenido. La salida conserva la apertura offline.

El motor se importa desde `src/application/reference-engine.mjs`, admite reloj/RNG y efectos inyectados, y expone `start`, `dispatch` y `snapshot`. Un motor local funciona sin DOM ni cliente IA. La aplicación conecta vista y agente de referencia por capacidades explícitas; el estado mutable no se publica en window. El paquete de reglas V9.9 sigue representando dos grupos: no existe un nuevo modo singleplayer.

`npm test` construye automáticamente el adaptador Node separado (`dist/reference-test-runtime.js`). Los fixtures históricos conservan VM y sus aserciones; ya no extraen ni reescriben funciones del HTML. `npm run test:poc` es un alias histórico que ahora compara contra el commit57872ee en un checkout temporal, incluyendo451 tests históricos y40 partidas por variante. Requiere historial Git completo.

Para Chromium, ejecutar `node scripts/build-browser-scenario.mjs` y servir la raíz en8765. Los scripts de escenarios usan `dist/invierno-test.html` (instrumentación QA separada); `check-production-replays.mjs` repite las entradas sobre el HTML de producto, sin acceso al estado interno. Ver comandos y límites en el informe67.
