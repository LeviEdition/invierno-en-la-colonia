# 91 — Revisión visual del mapa horizontal: copas, accesos, contornos y luces

> Historia conservada. La revisión posterior de vegetación, panel, interfaz y lectura se registra en [informe92](92-vegetacion-natural-y-confort-del-mapa.md), sin sustituir esta evidencia.

06/11/2026, UTC (05/11 en Montevideo). Entrega experimental para revisión del creador en [PR25](https://github.com/LeviEdition/invierno-en-la-colonia/pull/25), conservado en borrador contra H3.4.4. No aceptación manual, merge ni cierre de etapa.

## Base y alcance

Árbol limpio y rama `experiment/mapa-horizontal-ambientacion-h3` sincronizada con **8113b557604bc5da1249a67fdeded11c2e97ea0f** antes de editar. PR25 abierto/draft, base `experiment/h3-4-4-ataque-barricadas-mapa`/694b645. Sin AGENTS.md aplicable; revisión de README, tablero18, protocolo15 e informe90. La evidencia anterior se conserva como historia. El SHA final, run y artifact del nuevo head se registran en PR25 sin referencia circular al SHA de este documento.

La solicitud autoriza exclusivamente los cuatro ajustes de presentación. No cambia capacidades, acciones, costes, exposición, azar, partidas o arte original. Main826199d9 y referencia publicada62e4e851 permanecen protegidas.

## Hallazgos y cambios

### Vegetación

Confirmado: las amplitudes anteriores1,7–2,8 producían, después de la envolvente de deformación y la cámara, movimientos muy pequeños en la vista general. Los ocho grupos conservan sus regiones, bases, fases y viento; sus amplitudes pasan a15–26. No se traslada la capa completa: se deforman las mismas copas con raíces y bordes inmóviles. Sin nuevos meshes, texturas, partículas, timers, listeners ni bucle propio.

La comparación numérica de60s con idéntico viento Tormenta y pasos10ms registra el desplazamiento del centro de cada copa antes/después. Es una evaluación del modelo en píxeles fuente, **no una medición de píxeles renderizados ni FPS**. El árbol oeste pasa de un intervalo de≈1,35 a≈12,01px fuente; la vista general reduce ambas magnitudes por el mismo factor de cámara. La instrumentación ahora informa el viento efectivo del perfil, igual al aplicado a los vértices; antes informaba el viento sin ese multiplicador.

### Accesos exteriores

Confirmado: los doce accesos de colonia estaban en el patio. Ahora rodean el recinto por fuera: cuatro al norte, cuatro al sur y dos por cada lateral. Se agrupan en filas identificadas y equidistantes dentro de cada tramo; la perspectiva y las zonas despejadas del dibujo condicionan su separación del edificio. No se exige una circunferencia que atraviese hospital, supermercado o vegetación.

Las seis localidades exteriores mantienen cuatro espacios compartidos. Escuela, biblioteca, supermercado y gasolinera usan filas regulares; hospital y comisaría mantienen dos delante y dos junto a su esquina/lateral visible. Se aprovecha terreno despejado: ningún recurso se borra para obtener espacio. Se conserva el orden determinista de ocupación y el total36; zombi y barricada continúan compartiendo cada acceso.

Se comprueban24 puntos de cada contorno de colonia contra el perímetro del recinto, no solo su centro. Las huellas32×38 de los36 accesos se contrastan con el alfa original de vegetación, manteniendo el límite anterior del1% de ruido residual. Una primera colocación norte680,315 tocaba vegetación; se corrigió antes de entregar, sin relajar el límite.

Se amplía el encuadre de colonia para incluir su perímetro en horizontal. En vertical estrecho no caben simultáneamente los dos extremos con el mínimo de cobertura del PNG: se conserva pan y se comprueba que cada acceso es alcanzable. La prueba mantiene cobertura, centro, visibilidad vertical y todos los accesos completos en horizontal; en vertical verifica además los límites del desplazamiento hasta cada acceso. No se comprime la geometría ni se cambia una capacidad para acomodarla al viewport.

### Contornos amarillos

Confirmado: el polígono amplio que facilitaba el clic también se dibujaba como marco. Se añade `outlinePolygon`, trazado sobre el arte, con salientes de techos, cuerpos y vehículos contiguos; el de colonia sigue el recinto y el cerco. Se usa tanto al consultar como al proponer un destino.

Se preserva el área anterior de clic y se incluyen los salientes nuevos para que se puedan seleccionar. Los recortes que protegen fachadas frente a vegetación conservan su máscara anterior: ajustar un marco no recompone silenciosamente las capas del mapa. Los otros prototipos, sin `outlinePolygon`, conservan su comportamiento. Una prueba dirigida cubre el pequeño cuerpo superior del hospital, antes fuera del área de clic.

Los trazados se revisaron con ampliaciones y cuadrícula del original, corrigiendo puntos de chimeneas y cercos tras las primeras capturas. Son datos manuales sobre un PNG aplanado: no se afirma segmentación automática ni coincidencia certificada de cada píxel antialias. La precisión final del encaje queda visible en las capturas para revisión del creador.

### Luces

La variación anterior era lenta y tenue; no reproducía los fallos intermitentes solicitados. Las tres fuentes existentes —entrada del hospital y ventanas oeste/este de colonia— alternan tramos estables con episodios cortos de tres descensos rápidos de intensidad. Cada ciclo calcula su inicio y duración mediante ruido visual propio por fuente, sin consultar ni consumir azar del motor.

Configuración por luz en `environment.json`: semilla visual, periodo, fase, intensidad base, variación, duración, número de descensos y profundidad. Periodos6,3–8,7s; episodios de≈0,70–0,94s, con varios segundos estables entre ellos. Fuentes independientes, sin parpadeo global ni sincronización forzada. La fuente y la mancha usan exactamente el mismo nivel. No se añadió luz a otras ventanas ni cambió el PNG.

Se conserva apagado individual/total, movimiento reducido al iniciar, pausa al ocultar y reanudación sin tiempo acumulado. Desactivado vuelve al renderizado bajo demanda. Sonido opcional sigue apagado al iniciar. La semilla es de presentación: el patrón es reproducible al reiniciar el visor, irregular durante la ejecución e independiente del estado y RNG de la partida.

## Comprobaciones y evidencia

La [carpeta de evidencia](evidencias/mapa-horizontal-ajustes/README.md) distingue capturas antes/después, muestras temporales, resultados y reservas. Las pruebas automáticas verifican geometría/estado; no sustituyen la revisión artística ni la suavidad observada en el equipo del creador.

- Instalación reproducible `npm ci --cache /tmp/iec-npm-cache`.
- Línea base618/618; entrega623/623, cinco nuevas pruebas significativas.
- `npm run check:build`, siete builds/checks de prototipos y oráculo57872ee:40/40 configuraciones iguales.
- Chromium: escena5 tamaños, acciones3 tamaños, bordes13, movimiento5 y cámara9 en la evidencia adjunta. CI del nuevo head exacto en PR25; el verde anterior42123438903 no respalda este ajuste.
- Originales intactos y hashes/alfa verificados; visor sin importaciones del motor y host idéntico al de H3.4.4. Sin archivos `src/`, lockfile ni PNG modificados.

Una repetición agotó la espera de `reveal` después de pausar650ms y codificar una captura. La secuencia del video confirma exposición, resultado3/herida y llegada completada: no hubo escena bloqueada. El arnés esperaba una fase que ya había terminado durante la captura. Se retira esa espera artificial y se comprueba el dado de revelación en la traza RAF existente, conservando todas las aserciones de fases, heridas diferidas, cámara, número de fichas y RNG. Si el PNG se toma después de la fase, se identifica como `after-exposure.png`; no se presenta como captura de un instante que ya pasó. Se conserva el rojo y se repite la batería en un directorio nuevo para separar intentos. No se alteraron tiempos o consecuencias del producto.

Linux, Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo; AMD EPYC9V74, ANGLE/SwiftShader por software. Escritorio1365×768/DPR1;852×393,740×360,393×852 y320×640/DPR2/tacto emulado. No teléfono físico, GPU real medida, VRAM medida, garantía30/60FPS ni nueva certificación de bfcache. La representación vertical mantiene sus regresiones pertinentes.

El pool sigue en132 partículas y la vegetación en256 vértices/216 triángulos. No aumentan las superficies auxiliares por las amplitudes, marcos o titileo. Las medidas de render se presentan como muestras cortas, con estado/cámara/DPR iguales por perfil; el render por software no permite extrapolar fluidez móvil.

## Probar, revisar y revertir

[Guía Windows/VSCode/LAN](../prototypes/horizontal-map/README.md). Actualizar la rama con `git pull --ff-only`, detener el servidor anterior con Ctrl+C, ejecutar **`npm.cmd run dev:horizontal-map`** y abrir **http://127.0.0.1:8779/prototypes/horizontal-map/**. Recargar con Ctrl+Shift+R. Para una instalación nueva, primero `npm.cmd ci` en la carpeta con ambos package*.json.

Comprobar especialmente: ocho copas con Viento/Tormenta, raíces estables; doce casillas por fuera del cerco al centrar colonia; contornos de las siete localidades y sus salientes; titileos independientes en hospital/colonia durante15–20s; apagar Luces y apagar todo; pan/zoom/selección y las cuatro acciones. En vertical recorrer los dos lados del recinto con arrastre. No se declara aprobada esa revisión por el usuario.

La reversión es un `git revert` del commit de esta entrega identificado en PR25, sin mover tags, resetear historia o fusionar. Se conserva la entrega anterior8113b557 y su evidencia.

**Única siguiente tarea:** revisión visual del creador de estos cuatro ajustes. Sin nuevas mecánicas, mapa propio, editor de encrucijadas, merge o avance de etapa.
