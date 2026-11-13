# Evidencia — ajustes visuales del mapa horizontal

06/11/2026, UTC. Antes:8113b557604bc5da1249a67fdeded11c2e97ea0f. Después: commit de esta entrega y CI exacto en [PR25](https://github.com/LeviEdition/invierno-en-la-colonia/pull/25). [Informe91](../../91-ajustes-visuales-mapa-horizontal.md). No aceptación artística, merge ni prueba física móvil.

## Composición y contornos

- General: [antes](antes/general.png) / [después](despues/general.png).
- Hospital: [antes](antes/hospital.png) / [después](despues/hospital.png), mismo viewport1365×768, DPR1 y encuadre.
- Colonia: [antes](antes/colonia.png) / [después](despues/colonia.png). **El encuadre cambia expresamente** para incluir los accesos exteriores; no sirve para atribuir diferencias de nitidez. Antes estaban en una fila dentro del patio; después cuatro al norte/cuatro al sur/dos por lateral.
- Contornos restantes: [escuela](despues/escuela.jpg), [biblioteca](despues/biblioteca.jpg), [supermercado](despues/supermercado.jpg), [gasolinera](despues/gasolinera.jpg), [comisaría](despues/comisaria.jpg). JPEG de revisión; los PNG completos se generan en el artifact CI.
- [Colonia12/ocupación máxima sintética](despues/colonia12.png): doce fichas, seis zombis y seis barricadas, misma vista con proyección QA. No es una preparación o regla nueva.
- Colonia en [852×393](852x393/colonia.jpg), [740×360](740x360/colonia.jpg), [393×852](393x852/colonia.jpg), [320×640](320x640/colonia.jpg). En vertical estrecho se recorren los laterales con pan; no se comprimen los espacios para hacerlos caber simultáneamente.

Los marcos se trazaron sobre el original con cuadrícula y se inspeccionaron las siete capturas. Las pruebas verifican los datos, no una equivalencia semántica pixel a pixel con una segmentación inexistente del PNG. La revisión final corresponde al creador.

## Copas y titileos

[Video47s](copas-luces-movimiento.webm), [hoja temporal](secuencia-temporal.jpg), [140 muestras](video.json), [comparación numérica del modelo](comparacion-modelo.json). La hoja toma un cuadro cada2s, de izquierda a derecha y arriba abajo; el video permite revisar el movimiento entre cuadros. El archivo codifica25FPS con cuadros repetidos cuando corresponde: no significa que Phaser haya renderizado25/30FPS.

La grabación comprueba desplazamiento máximo de vértices≈13,40px fuente, bases inmóviles, cámara estable y fuente/mancha con idéntica intensidad. Las tres luces registran mínimos≈0,03 y máximos≈0,835. Se inspeccionaron capturas y secuencia temporal; no se certifica fluidez de GPU o teléfono reales. El video incluye finalmente un movimiento real con RNG controlado solo en el host QA.

La comparación numérica evalúa60s a10ms con el mismo viento; no mide píxeles renderizados o VRAM. Árbol oeste: intervalo de desplazamiento≈1,35px fuente antes frente a≈12,01 después. No cambia la cantidad de geometría.

## Pruebas y reproducción

[Instalación](npm-ci.txt), [base618](base-618.txt), [rojo inicial](pruebas-rojas.txt), [suite623](suite-623.txt), [oráculo40](oraculo-40.txt), [check HTML](check-build.txt), [siete builds/checks](siete-builds.txt), [originales/hashes](originales.json).

[Acciones3 tamaños](acciones.json), [bordes13](bordes.json), [movimiento5](movimiento.json), [cámara9 casos en3 tamaños](camara.json), [escena5 tamaños](escena.json). Conservan cancelación, ejecución única, decisiones, daño/muerte, RNG, cámara, imágenes y fichas estables. La escena verifica35 consultas de localidad, pan/zoom/pinza/teclado, capacidad sintética, reinicios sin acumulación, pausa controlada y movimiento reducido; todos los accesos conservan el umbral anterior de vegetación: máximo **0,411%** de la huella32×38 con alfa>32, por debajo del1% admitido para ruido residual.

La repetición roja de movimiento se conserva: [JSON](reproducciones/movimiento-timeout.json), [video](reproducciones/movimiento-timeout.webm), [secuencia24–28s](reproducciones/exposicion-timeout.jpg) y [escena operativa al terminar](reproducciones/tras-timeout.png). El video muestra revelación3, herida y llegada. El arnés pausaba650ms y codificaba un PNG antes de esperar esa fase: podía perderla. Se verifica ahora el mismo dado en la traza RAF que ya recoge todas las fases; no se cambian los tiempos del producto ni se retiran las aserciones de consecuencias, cámara o RNG. La repetición verde usa directorio nuevo. Se distingue este rojo de un fallo del juego.

Comandos reproducibles: guía del informe91 y scripts `check-horizontal-map-browser.mjs`, `check-h344-*-browser.mjs`, `record-horizontal-map.mjs`. El workflow `horizontal-map.yml` configura origin, módulos QA, viewports y punto de selección de forma explícita. Repite además las cuatro baterías sobre el mapa H3.4.4 anterior. El nuevo CI se consulta por SHA exacto en PR25;42123438903 es solo la evidencia anterior.

## Coste observado

[Datos completos](escena.json), [resumen](medicion-resumen.json). Linux, AMD EPYC9V74, Node24.19.0, Chromium154.0.8037.57 y Playwright1.57 externo; ANGLE/SwiftShader **por software**. DPR1 escritorio y DPR2/tacto emulado en los otros tamaños. Secuencial por perfil y viewport, misma partida/cámara/DPR,500ms de calentamiento y dos muestras de1500ms; POST_RENDER y CDP TaskDuration/heap. Entorno compartido, muestras cortas; no benchmark de teléfono ni VRAM medida.

|Viewport|Apagado, renders/s|Suave|Tormenta|
|---|---:|---:|---:|
|1365×768|0,00|15,15|15,04|
|852×393|0,00|10,40|9,95|
|740×360|0,00|14,79|13,36|
|393×852|0,00|10,96|9,23|
|320×640|0,00|18,15|17,42|

No se sostiene30FPS en este render por software. Las medidas anteriores del informe90 son otra ejecución: no se atribuye a estos cambios una mejora de velocidad por comparar números históricos. Se comprueba el presupuesto estructural:132 partículas,256 vértices/216 triángulos, superficies auxiliares y texturas originales conservadas; sin nuevo render loop ni listeners. Apagado mantiene0 renders continuos en reposo.

`manifest.json` lista bytes y SHA-256 de los archivos de evidencia. El manifiesto no se incluye a sí mismo ni al README. Los originales del producto siguen en su manifiesto propio y no se modifican.
