# Evidencia — mapa horizontal y ambientación

05/11/2026. Base694b645, originales4f05c8f, implementación5b3a661 y correcciones hasta **4f821d65983fd1ce4fb2883e178c66c46ce868d4**. Head documental/CI final en PR25. **No aceptación manual ni teléfono físico.**

## Revisar la composición

- [Vista general PC](pc/general.png), [852 horizontal](852x393/general.png), [740 horizontal](740x360/general.png).
- PC: [escuela](pc/escuela.png), [biblioteca](pc/biblioteca.png), [hospital](pc/hospital.png), [colonia](pc/colonia.png), [supermercado](pc/supermercado.png), [gasolinera](pc/gasolinera.png), [comisaría](pc/comisaria.png).
- [Hospital852](852x393/hospital.png), [comisaría740](740x360/comisaria.png).
- [Máximos sintéticos](pc/capacidad-maxima.png), [colonia12](pc/colonia12.png): misma vista con proyección QA,36 fichas y36 accesos —18 zombis+18 barricadas—; **no es la preparación de una partida**.
- [Video viento/vegetación/luces y movimiento real](viento-luces-y-movimiento.webm), [secuencia temporal](secuencia-temporal.jpg), [muestras de reloj/anclajes/fuentes](video.json). Grabación1364×768/25FPS/26s; no garantiza esa fluidez de render ni60FPS. Se inspeccionaron capturas y cuadros temporales propios; no sustituyen la reproducción del video o la revisión del creador.

## Resultados ejecutados

[Base605](base-605.log), [suite618](suite-618.log), [oráculo40](oraculo-40.log). [Acciones](acciones.json) en1365×768,852×393,740×360: cancelar, doble clic, dados, ataque/exposición, construir, mover, buscar/ruido/Inventario y cámara estable. [Bordes13](bordes.json): muerte/decisiones, constructor, equipo/J2, ocupación, perdido/obsoleto/tardío, reducido, reconstrucción y atribución nativa. [Movimiento5](movimiento.json), [cámara9](camara.json), [escena3](escena.json): siete localidades, accesos completos, máximos, tacto/teclado/pinza, pausa controlada/reinicio sin acumulación y ausencia de errores. [Producto normal sin QA](producto-sin-qa.json), [originales](originales.json).

Las huellas32×38 de los36 accesos se compararon con el alfa de vegetación original: cobertura máxima de píxeles alfa>32 **0,329%**, menor del1% admitido para ruido residual; no es una prueba de colisiones/reglas. Se inspeccionó la representación máxima, no solo el conteo.

## Coste observado

Linux, Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo; AMD EPYC9V74, ANGLE/Vulkan/SwiftShader **por software**. DPR1 PC, DPR2/tacto emulado horizontales. Secuencial, mismo estado/cámara/DPR por perfil;500ms de calentamiento y dos muestras de1500ms. Se contó POST_RENDER en extremos y TaskDuration/heap de CDP. Son muestras cortas de un entorno compartido, sin inferir GPU/VRAM o teléfono real. Video separado de la medida. [Datos completos](medicion-resumen.json).

|Viewport|Apagado, renders/s|Suave|Tormenta|
|---|---:|---:|---:|
|1365×768|0.0|14.5|12.3|
|852×393|0.0|12.2|13.9|
|740×360|0.0|15.4|14.7|

En software **no se sostiene el límite configurado de30FPS**. No se presenta como rendimiento móvil aprobado; hay que revisar GPU/teléfono reales. Apagado da0 renders continuos en reposo y sigue respondiendo bajo demanda. Los perfiles no mutan partida ni secuencia RNG.

Primera [malla densa](malla-densa-diagnostico.json):4032 vértices; entrega256/216 triángulos, ocho grupos locales y superficies estáticas simples. El diagnóstico motivó optimizar; no es un A/B con hardware dedicado o un porcentaje de mejora garantizado.

Texturas principales con POT/mipmaps **≈58,67MiB estimados**, más texturas procedurales, máscaras de edificios/luces y superficies auxiliares. El resumen registra bytes de canvases derivados por instancia; no se suman como VRAM medida. Se comparte una textura de vegetación entre grupos, sin ocho copias del PNG. Los132 objetos de partículas mantienen pool fijo. Los conteos GL/listeners y un contexto se comprueban al reconstruir; desactivar efectos no libera todas las texturas, detiene el trabajo continuo.

## Evidencia previa y reservas

`rojos/` conserva contrato inicialmente ausente, zoom mal limitado, apagado fuente1/mancha0, panel que interceptaba el hospital y máscara dura. Los errores de arnés por punto anterior/pausa y shaders se identifican como tales, **no fallos del motor**. Las imágenes rojas son historia, no la entrega actual. El rojo/verde de accesos completos se conserva también en sus logs.

Resolución1672×941 y borde/color generativo residual siguen limitando el acercamiento. Se preservan originales y referencia completa. Sin Windows físico, teléfono, VRAM o certificación nueva de bfcache; las pruebas de visibilidad/reconexión se etiquetan controladas. El CI del head final y su artifact descargado se registran en la descripción del PR25; estos JSON son evidencia local distinta.
