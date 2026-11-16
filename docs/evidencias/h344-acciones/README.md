# Evidencia — H3.4.4: ataque y barricadas

[Informe88](../../88-h3-4-4-ataque-barricadas-mapa.md). Base **4357df8d60d45bf13ed966add489e79c0f27ad45**, implementación **b8b9214a00786acab29c7933618a3c8ef7e9637a**, ajuste de atribución **1419077d507eac9a0052e655ee03c680f23165de**. Informe/evidencia en commit documental posterior. [Manifest de tamaños y SHA256](manifest.json). Los JSON conservan las rutas /tmp originales del arnés.

**H3.4.3 y H3.4.4 no tienen aceptación manual del creador.** CI/pruebas automatizadas y esta inspección visual propia no sustituyen esa revisión.

## Resultados y rojos

- Base propia: [576/576](linea-base-suite.txt), [check](linea-base-check.txt), [búsqueda3](linea-base-busqueda.json) y [bordes11](linea-base-bordes.json). [Fallo inicial del arnés](linea-base-arnes-rojo.json)/[log](linea-base-arnes-rojo.txt): el caso de respuesta perdida capturó el estado antes de ejecutar el host. Esperar la operación real corrigió esa carrera; se conservaron las aserciones de no repetición. No fue un defecto confirmado del juego.
- [Suite605/605](suite.txt), [29 pruebas nuevas dirigidas](motor-protocolo-controlador.txt), [oráculo40/40](oraculo.json), referencia451 y candidata605. Sin fallos/omisiones/canceladas. Los rojos `rojo-motor/protocolo/controlador/constructor.txt` corresponden a contratos ausentes antes de implementar; no se atribuyen a reglas previas.
- [Recorrido integrado5 viewports](recorrido.json): ataque/herida/construcción/mover/buscar/ruido/inventario, cancelación y duplicados, dados repetidos, orden de exposición, opacidad gradual real del sprite, cámara/área/una instancia estables, sin errores normales ni desbordamiento horizontal.
- [11 bordes](bordes11.json), [movimiento reducido y reconstrucción](movimiento-reducido-reconstruccion.json) y [actor recuperado](actor-verde.json): **13 casos únicos**, con reinicio/reconexión repetidos en la revisión final. Constructor gratuito, muerte, encrucijada deliberada, pistola una vez, hospital lleno, J2/herramientas, respuesta perdida, obsoleto, reinicio, visibilidad, reconexión, movimiento reducido y atribución. No se afirma que fueran una sola ejecución local; CI los ejecuta juntos en el head entregado.
- [Movimiento/exposición5](movimiento.json), [cámara9](camara.json), regresión H3.4.3 [3 tamaños](regresion-busqueda.json)+[11 casos](regresion-busqueda-bordes.json). Cámara: tres tamaños×apagado/Suave/Tormenta,0 cambios de ficha sin cuadro de mapa,0 escrituras de fichas en reposo y0 renders continuos al apagar.
- [Build producto](build.json)/[QA](build-qa.json), visor sin motor/host único y QA separado. El workflow compara seis builds y repite las15 baterías de navegador anteriores/nuevas.

Defectos propios reproducidos y corregidos: [panel bloqueado al buscar](panel-bloqueado-rojo.json)/[log](panel-bloqueado-rojo.txt), [carrera de foco](foco-rojo.json)/[log](foco-rojo.txt), [título con actor equivocado](actor-rojo.json)/[log](actor-rojo.txt)→[verde](actor-verde.json). El recorrido integrado posterior y las pruebas por teclado permanecen exigentes; no se eliminaron aserciones para conseguir verde.

## Capturas y video

| Vista | Confirmación | Exposición | Barricada |
| --- | --- | --- | --- |
|1365×768 PC|[Captura](1365x768/ataque-confirmar.png)|[Captura](1365x768/exposicion.png)|[Captura](1365x768/barricada.png)|
|740×360 horizontal emulado|[Captura](740x360/ataque-confirmar.png)|[Captura](740x360/exposicion.png)|[Captura](740x360/barricada.png)|
|852×393 horizontal emulado|—|—|[Captura](852x393/barricada.png)|
|393×852 vertical emulado|—|—|[Captura](393x852/barricada.png)|
|320×640 vertical emulado|—|—|[Captura](320x640/barricada.png)|

- [Video corto: ataque, exposición y construcción](ataque-exposicion-barricada.webm). Extracto del recorrido PC, mismo encuadre y orden temporal, sin alterar resultados. [Secuencia de200ms](secuencia-accion.jpg), inspeccionada junto a capturas PC/horizontal/vertical. El actor permanece vivo hasta revelar; se actualiza la herida; la barricada aparece gradualmente; no hay regreso fugaz a V9.9 en ese recorrido.
- [Recorrido completo740×360](740x360/recorrido-completo.webm), incluye preparación y las cuatro acciones, sin montaje. [Muerte y decisión](muerte-y-decision.webm), grabación dirigida de implementación: se conserva la víctima durante exposición y después espera la transición explícita. La última revisión cambió texto/foco/atribución, sin alterar esa secuencia; CI conserva una grabación nueva del head exacto.
- [Hospital lleno1z+3b](hospital-lleno.png), [habilidad gratuita ya usada](habilidad-usada.png).

Cada carpeta tiene `frames.json`: extracción **sin remuestreo** de campos de la traza RAF original, con su SHA256 original, tiempo/fase/cámara/rectángulo/actor/daños/conteos/opacidad real del renderer. La traza completa se conserva en el artifact CI. Las aserciones se ejecutan antes de reducir el archivo. Se observa una sola ficha/instancia y el mismo encuadre/área; una captura fija no demuestra continuidad temporal.

## Reproducción y reservas

Linux, Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo; SwiftShader. PC/DPR1 y móviles DPR2 con tacto emulado, incluyendo los dos horizontales solicitados. Sin teléfono físico, medición de VRAM ni garantía60FPS. Video25FPS y muestreo200ms no descartan cualquier artefacto subcuadro de otras GPU. Visibilidad/reconexión son controladas; no se certifica bfcache real nuevo.

[Guía de Windows/VSCode/LAN](../../../prototypes/action-map/README.md). Para QA: instalar herramientas externas como en `.github/workflows/h3-4-4-action-map.yml`, iniciar `node scripts/serve-action-map.mjs --qa` y ejecutar los cuatro `check-h344-*.mjs` secuencialmente. Aquí se usaron `PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright-core/index.mjs`, `PLAYWRIGHT_BROWSERS_PATH=/tmp/h342-playwright` y `/usr/bin/chromium`; no son requisitos para jugar en Windows.

El nuevo PR draft registra SHA final, run global, artifact descargado/digest y comparación con los seis builds locales. El CI de la base no se presenta como CI de esta entrega. No se fusiona ni se inicia otra acción.
