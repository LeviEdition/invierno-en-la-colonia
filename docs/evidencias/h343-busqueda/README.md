# Evidencia — Buscar desde el mapa (H3.4.3)

[Informe87](../../87-h3-4-3-busqueda-mapa.md). Base **c8d4e59321bac099306c99f53d18caba3fcd9e9d**, implementación **4138153963bba8201a2f0635f42990f1b20f240f**; informe/evidencia en commit posterior. [Manifest](manifest.json) identifica tamaños y SHA256; las rutas /tmp conservadas en JSON son las ubicaciones originales de los arneses.

## Qué se comprobó

- [Línea base555](linea-base-suite.txt), check reproducible y cinco JSON `linea-base-*.json`: pruebas propias de c8d4 antes de modificar. No son la revisión independiente histórica545/1141b89.
- [Suite576/576](suite.txt), [oráculo40/40](oraculo.json). [Rojos motor](rojo-motor.txt), [broker](rojo-protocolo.txt), [controlador](rojo-controlador.txt): el contrato nuevo todavía no existía; no implican errores de reglas anteriores. [Motor dirigido](motor-dirigido.txt),9 casos.
- [Búsqueda3 tamaños](busqueda.json): normal+ruido, un consumo/robo por solicitud, cancelar puro, dados repetidos, mapa/cámara/selección estables, J1/J2 privado y ausencia de errores/desbordamiento.
- [Recuperación/privacidad9 casos](recuperacion-privacidad.json) y [tres reinicios](reinicios.json) y [foco visible tras cuatro ruidos](foco-verde.json): referencia, visibilidad/reconexión controladas, respuesta perdida sin reenvío, obsoleto, explorador, movimiento reducido/audiooff, encrucijada deliberada, búsqueda J2; operación/RNG sin duplicados, listeners estables y foco visible con cinco cartas en320px. No se declara bfcache real nuevo.
- [Movimiento5](regresion-movimiento.json) y [cámara9](camara.json) en **la entrada nueva**:1500ms/exposición/muerte/decisión, POST_RENDER, pan/zoom/pinza y reposo. No basta con probar solo el prototipo anterior.
- Regresiones de entradas conservadas: [H3.4.1](h341.json)/[bordes9](h341-limites.json), [H3.4.2](h342.json)/[bordes9](h342-limites.json). CI conserva además los demás gates anteriores, en ejecución secuencial.
- [Build producto](build.json) y [QA](build-qa.json). Sin motor en visor, sin Phaser en host; QA separado y solo loopback. Ningún PNG original cambia.

## Grabaciones y capturas

Cada video contiene **una búsqueda normal completa y una segunda con ruido**, además del movimiento previo y pase posterior. No se edita el resultado del juego.

| Tamaño | Recorrido grabado | Hallazgo | Elección con ruido |
| --- | --- | --- | --- |
|1365×768|[Video](1365/busqueda-normal-y-ruido.webm)|[Captura](1365/hallazgo.png)|[Captura](1365/ruido-eleccion.png)|
|393×852, emulado|[Video](393/busqueda-normal-y-ruido.webm)|[Captura](393/hallazgo.png)|[Captura](393/ruido-eleccion.png)|
|320×640, emulado|[Video](320/busqueda-normal-y-ruido.webm)|[Captura](320/hallazgo.png)|[Captura](320/ruido-eleccion.png)|

[Dado/confirmación](1365/dado-confirmar.png), [carta conservada](1365/carta-conservada.png). Las listas móviles permiten scroll interno: no se exige que todas las cartas quepan simultáneamente. Cada carpeta contiene `frames.json`, traza RAF con fase, cámara, tamaño de escena, instancias, fichas y cartas visibles. Las aserciones exigen modo mapa y encuadre estable, una ficha por actor y0 cartas durante presentación.

[Secuencia normal](secuencia-busqueda.jpg) y [secuencia con ruido](secuencia-ruido.jpg):20 cuadros de200ms del video final de escritorio, mismo tamaño entre cuadros. Inspeccionadas junto con las capturas móviles. No se observa cambio fugaz a V9.9 en estos recorridos; la traza confirma continuidad. La carta solo aparece después de la pausa breve. Una grabación25FPS y este muestreo no certifican ausencia de cualquier artefacto en otro hardware.

## Fallos conservados y corrección

- [Video rojo: muerte](regresion-muerte-antes.webm), [resultado](regresion-muerte-antes.json), [error](regresion-muerte-antes.txt): en la primera integración la barrera por muerte cortaba la exposición aceptada. Se corrigió limpiar lo privado sin interrumpir esa secuencia. El gate de movimiento final comprueba los cinco casos y no se debilita.
- [Timeout de otra repetición concurrente](timeout-concurrente.json)/[log](timeout-concurrente.txt): perdió la ventana corta `reveal` con varios Chromium activos. Repetición secuencial aprobada. No se etiqueta como un segundo defecto funcional reproducido.
- [Primer arnés](arnes-inicial.txt): semilla del recorrido normal disparó una encrucijada de movimiento; se esperaba `idle` indebidamente. Se separó el caso normal de los casos de decisión, sin cambiar reglas.

- [Foco rojo](foco-rojo.json)/[log](foco-rojo.txt) y [verde](foco-verde.json)/[captura320](foco-ruido320.png): tras varios ruidos, el botón enfocado quedaba fuera del área visible. Se ajusta solo el scroll interno al enfocar, sin desplazar cámara/escenario. Comprobado con cuatro incrementos táctiles y cinco cartas.

## Entorno, reproducción y reservas

Linux, Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo; SwiftShader por software.1365/DPR1 y393/320 DPR2 con tacto emulado. Sin teléfono físico ni medición de VRAM. Reconexión y visibilidad controladas se identifican como tales. No hay benchmark nuevo de FPS sostenidos; no cambian pools de partículas ni texturas.

Para jugar: [guía Windows/VSCode/LAN](../../../prototypes/search-map/README.md). Para repetir los gates usar el workflow `.github/workflows/h3-4-3-search-map.yml`: iniciar `node scripts/serve-search-map.mjs --qa`, después los cuatro scripts `check-h343-*.mjs`, secuencialmente. Aquí se usaron `PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright-core/index.mjs`, `PLAYWRIGHT_BROWSERS_PATH=/tmp/h342-playwright`, Chromium `/usr/bin/chromium`; son rutas de QA del entorno, no requisitos para jugar en Windows.

El CI del head exacto, enlace al run, artifact descargado y comprobación se registran en la descripción del nuevo PR, distinguiéndolo de estos resultados locales y del CI de la base. Falta revisión visual del creador; no se fusiona ni inicia otra acción.
