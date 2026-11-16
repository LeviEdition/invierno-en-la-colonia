# Invierno en la Colonia

Proyecto de videojuego de supervivencia en desarrollo gradual. Primero usamos una adaptación funcional de *Dead of Winter* como referencia; después construiremos una experiencia original principalmente singleplayer, con Director de Juego y consecuencias narrativas persistentes.

## Estado actual

El estado vigente, la próxima tarea y los hallazgos abiertos están en el **[tablero operativo](docs/18-tablero-operativo.md)**. Resumen al 16/11/2026: la referencia V9.9 está preservada (hitos 1 y 2 cerrados) y el mapa horizontal, que permite jugar partidas completas, quedó aceptado e integrado en `main` (Hito 3 cerrado, tag `v0.10.0-mapa-horizontal`). El singleplayer está en diseño ([hoja de ruta 63](docs/63-hoja-de-ruta-planificacion-singleplayer.md)).

Documentos de referencia: [rumbo y hitos (62)](docs/62-hitos-referencia-fiel-y-juego-propio.md) · [plan del Hito 3 (75)](docs/75-plan-hito-3-identidad-visual.md) · [experiencia unificada del mapa (99)](docs/99-experiencia-unificada-del-mapa.md) · [dirección de producto (51)](docs/51-rumbo-fidelidad-e-identidad.md) · [matriz F (61)](docs/61-alcance-matriz-f-juego-propio.md). El historial de entregas y las guías de ramas anteriores están en el [tablero histórico](docs/18-historico-tablero.md).

## Jugar el mapa horizontal

Está en `main`. Requiere Node 22 o posterior. En VS Code, PowerShell, en la carpeta del repositorio:

```powershell
git fetch origin
git switch main
git pull --ff-only
npm.cmd ci
npm.cmd run dev:horizontal-map
```

Abrir **http://127.0.0.1:8779/prototypes/horizontal-map/** y elegir Jugar con IA o Dos jugadores en este dispositivo. Ctrl+C detiene el servidor; después de actualizar, reiniciarlo y recargar. [Guía para Windows, VS Code, celular en la red local y pruebas manuales](prototypes/horizontal-map/README.md) · [originales y configuración del arte](assets/mapa-horizontal/README.md).

## Descargar la referencia y jugar offline

Descargá [invierno_colonia_v9_9.html](https://github.com/LeviEdition/invierno-en-la-colonia/releases/download/v0.9.9-referencia-modular/invierno_colonia_v9_9.html) desde la release y abrilo directamente en Chromium, mediante doble clic o «Abrir archivo». No requiere servidor, Node ni Internet para jugar. Conserva los modos contra IA y dos jugadores locales.

El [manifiesto publicado](https://github.com/LeviEdition/invierno-en-la-colonia/releases/download/v0.9.9-referencia-modular/manifest-v0.9.9-referencia-modular.json) identifica archivo, tamaño, commit y SHA-256:

```text
43b8883ad4821e4b50c40791615c5ef6c0b3030476409b4e1c6da4dbd872d692  invierno_colonia_v9_9.html
```

Para recuperar el código, clonar el repositorio con historial completo y ejecutar `git checkout --detach v0.9.9-referencia-modular` antes de los comandos de construcción siguientes. El [informe72](docs/72-preservacion-referencia-modular.md#recuperar-y-reconstruir) y las notas de la release incluyen el procedimiento completo. Solo se distribuyen HTML de producto y manifiesto; el HTML QA de `dist/` queda fuera.

La validación cubre Node y Chromium automatizado; no certifica equivalencia reglamentaria completa con *Dead of Winter*, Android físico, TalkBack, otros motores de navegador ni balance humano.

## Desarrollo y construcción

Requiere Node22 o posterior. Ejecutar `npm ci`, `npm run build`, `npm run check:build` y `npm test`. El lockfile fija esbuild0.28.2 y, para los experimentos visuales H3.2/H3.3, Phaser4.2.1. El HTML V9.9 conserva su distribución sin dependencias externas. Editar módulos `src/` y la plantilla, nunca el HTML generado a mano. `npm run build` empaqueta módulos reales en una IIFE y la inserta en un único HTML autocontenido. La salida conserva la apertura offline.

El motor se importa desde `src/application/reference-engine.mjs`, admite reloj/RNG y efectos inyectados, y expone `start`, `dispatch` y `snapshot`. Un motor local funciona sin DOM ni cliente IA. La aplicación conecta vista y agente de referencia por capacidades explícitas; el estado mutable no se publica en window. El paquete de reglas V9.9 sigue representando dos grupos: no existe un nuevo modo singleplayer.

`npm test` construye automáticamente el adaptador Node separado (`dist/reference-test-runtime.js`). Los fixtures históricos conservan VM y sus aserciones; ya no extraen ni reescriben funciones del HTML. `npm run test:poc` es un alias histórico que ahora compara contra el commit57872ee en un checkout temporal, incluyendo451 tests históricos y40 partidas por variante. Requiere historial Git completo.

Para Chromium, ejecutar `node scripts/build-browser-scenario.mjs` y servir la raíz en8765. Los scripts de escenarios usan `dist/invierno-test.html` (instrumentación QA separada); `check-production-replays.mjs` repite las entradas sobre el HTML de producto, sin acceso al estado interno. Ver comandos y límites en el informe67.
