# Evidencia — vegetación natural y confort

06/11/2026 UTC. Base **64bbe2c53b93a1efb61f5bbe474c25edaa2f50fa**; entrega en [PR25 draft](https://github.com/LeviEdition/invierno-en-la-colonia/pull/25). [Informe92](../../92-vegetacion-natural-y-confort-del-mapa.md). No aceptación visual/manual ni prueba física móvil.

## Comparación visual

Misma partida de preparación local y DPR por viewport; ambientación apagada mediante movimiento reducido para comparar composición. Las capturas tienen el tamaño completo del navegador. En móvil DPR2 los PNG miden1704×786; no se comparan sus píxeles físicos como si fueran DPR1. El espacio ganado y el indicador de zoom nativo son cambios intencionados; las capturas generales de interfaz no pretenden mantener idéntico campo visible.

|Vista|Antes64bbe2c|Después|
|---|---|---|
|1365×768 ficha abierta|[Antes](antes/1365-abierta.png)|[Después](despues/1365-place-0-focus.png)|
|1365×768 ficha cerrada|[Columna reservada](antes/1365-cerrada.png)|[Ancho recuperado](despues/1365-place-0-closed.png)|
|1920×1080 abierta|[Antes](antes/1920-abierta.png)|[Después](despues/1920-place-0-focus.png)|
|1920×1080 cerrada|[Columna reservada](antes/1920-cerrada.png)|[Ancho recuperado](despues/1920-place-0-closed.png)|
|852×393 horizontal|[Antes](antes/852.png)|[Barras compactas](despues/852-place-0-focus.png)|

[Vista general1365](despues/1365-general.png), [1920](despues/1920-general.png), [852](despues/852-general.png); [hospital cercano](despues/1365-place-2-focus.png), [hospital móvil](despues/852-place-2-focus.png); [biblioteca y cabina](despues/1365-biblioteca.png), [biblioteca móvil](despues/852-biblioteca.png). [Siete localidades, miniaturas identificadas](despues/siete-localidades.jpg); los PNG completos de los siete focos por viewport se conservan en el artifact de CI.

La [pareja base](baseline-misma-escala.png)/[candidata](candidate-misma-escala.png) del benchmark usa exclusivamente el canvas1055×563 a DPR1, **misma cámara, zoom y partida**, sin efectos. Permite revisar muestreo sin atribuir al nuevo encuadre una mejora de detalle. Los originales no ganaron resolución; las diferencias de casillas/máscaras forman parte del cambio solicitado.

## Movimiento y reproducciones

[Video breve](vegetacion-camara.webm): fragmentos de la grabación final a velocidad normal, sin interpolar ni acelerar. El primer fragmento muestra viento solo para leer las ramas sin nieve delante; el último incluye pan/zoom y varios cambios de ficha. Los cortes y tiempos exactos se indican en [edición](video-edicion.json). El video completo, sin cortes, se conserva en el artifact de CI; el [JSON temporal](video.json) exige22s de reloj visual y variación de varias ráfagas. La grabación y las trazas son de software; no equivalen a fluidez física de teléfono.

[Secuencia de ramas a igual escala](secuencia-ramas.jpg): seis recortes230×350 de los instantes14/18/22/26/30/34s del video original, sin ampliar, dispuestos de izquierda a derecha. Las capturas no sustituyen observar el movimiento. Los logs de texto solo normalizan espacios finales; no se eliminan fallos ni aserciones.

La raíz y la franja inferior permanecen en0 en todas las muestras; las puntas cambian. Se verifican topología del batch, número de instancias, pausa/apagado y ausencia de consumo de estado/RNG. [Regresión temporal anterior de luces/tormenta](video-regresion.json) conserva sus140 muestras, además del nuevo recorrido.

Reproducciones preservadas:

- [Copas fijadas en el techo y frecuencia sin efecto](reproducciones/copas-fijas.txt): dos pruebas rojas de la base, antes del cambio de envolvente.
- [Cuñas de una primera malla con orden incorrecto](reproducciones/malla-sin-ordenar.png): defecto introducido durante el desarrollo y corregido mediante ordenación pública de triángulos, no problema atribuido al original.
- [Franja intermedia del resize](reproducciones/franja-intermedia.json): el canvas ya no se estiraba, pero el contenedor podía ampliar un cuadro antes de su dibujo. El gate final compara padre, CSS y backing/DPR por fotograma.
- [Foco antes de presentar el panel](reproducciones/foco-antes-del-cuadro.json), [salida](reproducciones/foco-antes-del-cuadro.txt): la prueba de Constructor exigía foco síncrono; mantiene la aserción y espera el cuadro que revela la ficha.
- [Selector usado con un cierre aún pendiente](reproducciones/panel-aun-pendiente.json), [salida](reproducciones/panel-aun-pendiente.txt): dos RAF del navegador no garantizan un cuadro de Phaser. El arnés espera la igualdad entre panel solicitado/presentado antes de continuar, sin retirar las aserciones de alineación ni aumentar sus umbrales.

## Pruebas y coste

[Instalación reproducible](npm-ci.txt), [base623](base-623.txt), [suite629](suite-629.txt), [check HTML](check-build.txt), [oráculo40](oraculo-40.txt), [siete builds/checks](siete-builds.txt), [manifiesto de originales](originales.json). El build [horizontal](horizontal-map-build.json) mantiene el mismo host que [H3.4.4](action-map-build.json) y el visor no importa el motor. El código de reglas y los PNG/lockfile no cambian.

[Acciones](acciones.json), [bordes](bordes.json), [movimiento](movimiento.json), [cámara](camara.json), [escena](escena.json), [confort](confort.json), [video](video.json) y [benchmark](comparacion.json). El gate de confort conserva los fotogramas de resize y cubre siete focos por tamaño, Escape/foco, estilo de accesos, independencia de estado/RNG y filtros. El gate de escena conserva capacidad sintética, controles táctiles/pinza/teclado, pausa controlada, movimiento reducido, reinicios/listeners/GL y originales.

La comparación aislada ejecuta64bbe2c desde un worktree separado y la candidata secuencialmente: canvas1055×563, DPR1, igual cámara/partida,500ms de calentamiento y dos muestras de1500ms por perfil. POST_RENDER y CDP TaskDuration/heap; entorno compartido y muestras cortas. [Datos completos](comparacion.json), [resumen](medicion-resumen.json). No se interpreta una comparación de tamaños distintos como mejora del renderer.

|Perfil|Base64bbe2c, renders/s|Candidata, renders/s|
|---|---:|---:|
|Apagado|0,00|0,00|
|Suave|14,44|10,64|
|Tormenta|13,65|10,98|

En esta ejecución:≈26%/20% menos cuadros por segundo, coste que permanece como reserva. Las máscaras aumentan256→522 vértices y216→416 triángulos; nueve meshes y132 partículas. AuxiliaresRGBA6344200→5790524bytes (≈8,7% menos), con originales y mipmaps conservados. No se alcanza30FPS en este entorno y no se declara resuelta la fluidez en dispositivos reales. Una exploración previa dio una magnitud de coste distinta; estas dos muestras por perfil no constituyen un análisis estadístico.

Linux, AMD EPYC9V74, Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo, ANGLE/Vulkan/SwiftShader por software. Las superficies auxiliares son bytes RGBA lógicos contabilizados por sus dimensiones, sin sus mipmaps; **no VRAM medida** ni toda la memoria del proceso. No se promete30FPS ni rendimiento físico móvil. El artifact del head exacto se comprueba y enlaza en PR25; su Chromium/Node pueden diferir y se identifican allí por separado.

Para repetir: guía del informe92 y scripts `check-horizontal-map-comfort-browser.mjs`, `measure-horizontal-map.mjs`, `record-horizontal-comfort.mjs`, además de todas las baterías anteriores. El workflow añade1920 sin quitar1365/852/740, conserva verticales y ejecuta también las cuatro regresiones de H3.4.4. El benchmark en CI mide únicamente la candidata; el par histórico se ejecutó localmente con `HORIZONTAL_BASELINE_ORIGIN=http://127.0.0.1:8783` y el checkout64bbe2c.

`manifest.json` identifica bytes/SHA-256 de la evidencia, excluyéndose a sí mismo y a este README. Los originales tienen su propio manifiesto sin cambios. **Única siguiente tarea: revisión visual del creador, sin merge.**
