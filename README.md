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
- [H3.1 — Auditoría de identidad visual](docs/74-h3-1-auditoria-identidad-visual.md)
- [Plan propuesto H3.1–H3.6](docs/75-plan-hito-3-identidad-visual.md)
- [Decisión vigente — D1/D2 cerradas y referencia preservada](docs/62-hitos-referencia-fiel-y-juego-propio.md)
- [Hoja de ruta del singleplayer — bloques SP-00 a SP-08, acuerdos y pendientes](docs/63-hoja-de-ruta-planificacion-singleplayer.md)
- [Dirección de producto](docs/51-rumbo-fidelidad-e-identidad.md)
- [Alcance de la matriz F del juego propio](docs/61-alcance-matriz-f-juego-propio.md)
- [Plan general](docs/01-plan-refactorizacion.md)

El [PR15](https://github.com/LeviEdition/invierno-en-la-colonia/pull/15) se integró mediante merge convencional `6b8bfcadfeb99d16a10b6f4576f3b061584ee1f9`, preservando historia yoráculo57872ee. [Informe71](docs/71-integracion-main-y-cierre-d1-d2.md) registra la validación posterior:467/467,40/40 contra cada referencia, partidas Chromium yoffline aprobados. SP-03 permanece conceptual ysin cambios respecto del head aprobado.

**Referencia cerrada:** D1/D2 y V9.9 modular preservadas. H3.1 fue aceptada con la dirección de tablero ilustrado por capas y mapa continuo de siete localidades. Esta rama contiene **H3.2, experimento técnico del hospital con Phaser4.2.1**, pendiente de revisión. PR16/17 no están fusionados. SP-03/SP-04 y reglas permanecen intactos; H3.3 no comenzó.

## Probar H3.2 desde VS Code, sin Python

En esta rama `experiment/h3-2-phaser-hospital`, abrir la carpeta del repositorio en VS Code y **Terminal → Nueva terminal**. Con Node22 o posterior instalado:

```sh
npm ci
npm run dev:hospital
```

Mantener la terminal abierta y abrir en el navegador del mismo equipo:

- Phaser: http://127.0.0.1:8771/prototypes/hospital-phaser/
- Referencia Canvas: http://127.0.0.1:8771/prototypes/hospital/

El comando genera el bundle con esbuild y sirve ambos experimentos; Ctrl+C lo detiene. Si el puerto8771 está ocupado, cerrar el servidor anterior o usar otro puerto: PowerShell `$env:HOSPITAL_PORT=8772; npm run dev:hospital`, bash `HOSPITAL_PORT=8772 npm run dev:hospital`; sustituir8771 por8772 en los enlaces. Los cambios JS requieren volver a ejecutar el comando y recargar. No abrir este prototipo mediante doble clic/file://: usa módulos y PNG locales servidos por HTTP.

**Alternativa con Live Server:** ejecutar `npm ci` y `npm run build:hospital`, abrir `prototypes/hospital-phaser/index.html` → «Open with Live Server», desde la raíz completa del repositorio. Para comparar, abrir `prototypes/hospital/index.html` en el mismo servidor. No se usa CDN ni se exige Python; Internet hace falta para la instalación inicial de dependencias, no para la escena ya construida.

Controles HTML: Delante/Detrás/Esquina, Mostrar ocultos, selección, zoom, flechas y restablecer. Arrastre, rueda y pinza sobre la escena; teclado con foco en el canvas: flechas, +/−,0,Enter,Escape. «Restablecer vista» reinicia la cámara; «Reiniciar escena» libera el renderer y carga el estado inicial. Sin WebGL se muestra un aviso y el enlace a Canvas, sin fallback automático de Phaser.

Se reutilizan sin cambios los PNG, pivotes, controles y cámara del [commit auditado PR16](https://github.com/LeviEdition/invierno-en-la-colonia/tree/ba1d93a4ae73a91a6f07660584e2374b53043a67), copiados con manifiesto de hashes, sin merge. Canvas conserva sus archivos originales. [Informe76: comparación, pruebas, costos y reservas](docs/76-h3-2-phaser-hospital.md) · [H3.1](docs/74-h3-1-auditoria-identidad-visual.md) · [plan](docs/75-plan-hito-3-identidad-visual.md).

La escena es independiente del juego. Cambiar renderer no aprueba proporciones, encaje con el suelo ni calidad artística: corresponde a H3.3. El mapa continuo es el objetivo acordado, todavía no construido.

## Descargar la referencia y jugar offline

Descargá [invierno_colonia_v9_9.html](https://github.com/LeviEdition/invierno-en-la-colonia/releases/download/v0.9.9-referencia-modular/invierno_colonia_v9_9.html) desde la release y abrilo directamente en Chromium, mediante doble clic o «Abrir archivo». No requiere servidor, Node ni Internet para jugar. Conserva los modos contra IA y dos jugadores locales.

El [manifiesto publicado](https://github.com/LeviEdition/invierno-en-la-colonia/releases/download/v0.9.9-referencia-modular/manifest-v0.9.9-referencia-modular.json) identifica archivo, tamaño, commit y SHA-256:

```text
43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692  invierno_colonia_v9_9.html
```

Para recuperar el código, clonar el repositorio con historial completo y ejecutar `git checkout --detach v0.9.9-referencia-modular` antes de los comandos de construcción siguientes. El [informe72](docs/72-preservacion-referencia-modular.md#recuperar-y-reconstruir) y las notas de la release incluyen el procedimiento completo. Solo se distribuyen HTML de producto y manifiesto; el HTML QA de `dist/` queda fuera.

La validación cubre Node y Chromium automatizado; no certifica equivalencia reglamentaria completa con *Dead of Winter*, Android físico, TalkBack, otros motores de navegador ni balance humano.

## Desarrollo y construcción

Requiere Node22 o posterior. Ejecutar `npm ci`, `npm run build`, `npm run check:build` y `npm test`. El lockfile fija esbuild0.28.2 y, solo para H3.2, Phaser4.2.1. El HTML V9.9 conserva su distribución sin dependencias externas. Editar módulos `src/` y la plantilla, nunca el HTML generado a mano. `npm run build` empaqueta módulos reales en una IIFE y la inserta en un único HTML autocontenido. La salida conserva la apertura offline.

El motor se importa desde `src/application/reference-engine.mjs`, admite reloj/RNG y efectos inyectados, y expone `start`, `dispatch` y `snapshot`. Un motor local funciona sin DOM ni cliente IA. La aplicación conecta vista y agente de referencia por capacidades explícitas; el estado mutable no se publica en window. El paquete de reglas V9.9 sigue representando dos grupos: no existe un nuevo modo singleplayer.

`npm test` construye automáticamente el adaptador Node separado (`dist/reference-test-runtime.js`). Los fixtures históricos conservan VM y sus aserciones; ya no extraen ni reescriben funciones del HTML. `npm run test:poc` es un alias histórico que ahora compara contra el commit57872ee en un checkout temporal, incluyendo451 tests históricos y40 partidas por variante. Requiere historial Git completo.

Para Chromium, ejecutar `node scripts/build-browser-scenario.mjs` y servir la raíz en8765. Los scripts de escenarios usan `dist/invierno-test.html` (instrumentación QA separada); `check-production-replays.mjs` repite las entradas sobre el HTML de producto, sin acceso al estado interno. Ver comandos y límites en el informe67.
