# Evidencia de experiencia H3.4.2

Informe [85](../../85-h3-4-2-experiencia-movimiento.md). Fuente inicial **1141b893aff88c8e1137c727e50c55b76e178a58**; implementación **3713aa4cf437d70351f46e21cb61be1a2453b1d3**; documentación en commit posterior. Medios reales, sin cambios de arte. [Tamaños y SHA-256](medios.json).

## Antes / después

| Caso | Antes,1141 | Después,3713 |
| --- | --- | --- |
| Sin daño | [Video](antes/blank/movimiento.webm), [traza](antes/blank/trace.json), [contacto](antes/blank/contact-sheet.png) | [Video](despues/blank/movimiento.webm), [RAF](despues/blank/frames.json), [viaje](despues/blank/travel.png), [resultado](despues/blank/exposure.png) |
| Herida | [Video](antes/wound/movimiento.webm), [traza](antes/wound/trace.json), [contacto](antes/wound/contact-sheet.png) | [Video393 emulado](despues/wound/movimiento.webm), [RAF](despues/wound/frames.json), [exposición](despues/wound/exposure.png) |
| Decisión | [Video](antes/decision/movimiento.webm), [traza](antes/decision/trace.json), [contacto](antes/decision/contact-sheet.png) | [Video](despues/decision/movimiento.webm), [espera explícita](despues/decision/awaiting.png) |
| Congelación | No grabada como línea base adicional | [Video320 emulado](despues/frost/movimiento.webm), [confirmación compacta](despues/frost/confirm.png), [exposición](despues/frost/exposure.png) |
| Muerte | No grabada como línea base adicional | [Video](despues/death/movimiento.webm), [mordedura revelada](despues/death/reveal.png), [espera sin ficha fallecida](despues/death/awaiting.png) |

[Análisis previo,365 cuadros](analisis-antes.json) y [posterior,1168 cuadros](analisis-despues.json): cada cuadro del video decodificado a25FPS, desviación de píxeles en una región del mapa para detectar un vaciado global. En las ventanas examinadas no se encontró un cuadro de baja textura que lo indique. La región y el reloj aproximado limitan ese detector: **no certifica por sí solo que ningún retrato parpadee**, ni un display físico o sucesos de menos de40ms.

Las trazas RAF comprueban por separado una sola ficha/imagen cargada por actor, posición/cámara y fases. Hojas de cuadros **adyacentes**, sin salto temporal, revisadas en las ventanas críticas: [inicio/recorrido](despues/blank/cuadros-1.png), [resultado/consecuencia sin daño](despues/blank/cuadros-3.png), [resultado/muerte](despues/death/cuadros-3.png). Los PNG individuales conservan el tamaño de captura; las hojas se reducen solo para comparar continuidad, no para juzgar nitidez del arte. Los videos completos permiten avanzar cuadro a cuadro. Comparación anterior/posterior: cambió el encuadre inicial de prueba (anterior acercado a colonia, posterior general para mostrar destinos); **la estabilidad se compara dentro de cada recorrido**, no se afirma identidad de encuadre entre esas grabaciones.

La repetición de cuadros de la grabación y el FPS del reloj de presentación dependen de Chromium/SwiftShader y del grabador. La duración nominal1500ms se verifica con el reloj unitario y los datos RAF; un video25FPS no garantiza la suavidad de un monitor real.

## Resultados

- [555 pruebas](suite.txt), [10 dirigidas](pruebas-dirigidas.txt), [rojo previo de metadatos](rojo-metadatos.txt).
- [Oráculo40/40](oraculo.json).
- [5 recorridos de experiencia](experiencia.json), [5 recuperaciones](recuperacion.json).
- [Regresión H3.4.2:3 tamaños](regresion-h342.json), [9 casos](casos-h342.json).
- [Regresión H3.4.1:3 tamaños](regresion-h341.json), [9 casos](casos-h341.json).

Node24.19.0 / Chromium154.0.8037.57 / Playwright1.57, Linux, GPU software SwiftShader.1365×768/DPR1;393×852 y320×640/DPR2 con entrada táctil emulada. Audio inicialmente apagado. Cambios de visibilidad/reconexión de la nueva secuencia son **controlados**, separados de navegación real. Sin teléfono físico ni VRAM medida. Campos `/tmp/...` de los JSON identifican rutas originales de ejecución; los medios seleccionados están copiados arriba. El artifact de CI conserva todas las capturas/videos de esa ejecución independiente.

## Reproducción de verificaciones

Para jugar: seguir [guía Windows/VSCode](../../../prototypes/movement-map/README.md), sin Python ni herramientas de QA. Para repetir automatización en un entorno de desarrollo con Chromium/Playwright1.57 y FFmpeg de Playwright externos:

```sh
npm ci
npm run build
npm run check:build
npm test
npm run test:poc
node scripts/serve-movement-map.mjs --qa
```

Mantener ese servidor **solo loopback**; otra terminal, desde la raíz:

```sh
node scripts/check-h342-experience-browser.mjs
node scripts/check-h342-experience-recovery.mjs
node scripts/check-h342-browser.mjs
node scripts/check-h342-edge-browser.mjs
```

El workflow `.github/workflows/h3-4-2-movement-map.yml` contiene la instalación exacta de Chromium/FFmpeg, `CHROMIUM_PATH` y los gates H3.4.1/medición. En este entorno se usaron `PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright-core/index.mjs`, `PLAYWRIGHT_BROWSERS_PATH=/tmp/h342-playwright` y `/usr/bin/chromium`. No son rutas requeridas en Windows. El producto no contiene semillas ni globals QA.

Para extraer todos los cuadros de cualquiera de los videos con FFmpeg externo:

```sh
ffmpeg -i movimiento.webm cuadro-%04d.png
```

El CI del **head exacto**, su artifact y comprobación posterior a descargar se registran en el [PR22](https://github.com/LeviEdition/invierno-en-la-colonia/pull/22). No se reutiliza el resultado de1141 como si validara3713 o su documentación final. La aceptación visual sigue pendiente del creador.
