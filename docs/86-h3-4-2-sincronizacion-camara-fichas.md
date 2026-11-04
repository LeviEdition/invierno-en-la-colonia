# 86 — H3.4.2: corregir el entrecortado de fichas al desplazar el mapa

04/11/2026, America/Montevideo. Continuación del [PR22](https://github.com/LeviEdition/invierno-en-la-colonia/pull/22), rama `experiment/h3-4-2-movimiento-mapa`, base `experiment/h3-4-1-estado-real`. Se conserva85 como evidencia histórica. **No se aprueba H3.4.2 ni se avanza a otra etapa.**

## Estado inicial y problema confirmado

HEAD/remote **`74b40e0b1094f63d6f0d9f638bb60157cbd80864`**, árbol limpio y PR22 abierto/draft. Leídos instrucciones, README, tablero, protocolo15, informe85 y código de cámara/renderizado. Sin AGENTS.md aplicable. No se descarta trabajo ni se cambia main. Al iniciar, la API del CI de74b40 todavía indicaba `in_progress` pese a sus pasos/artifact aprobados. Durante esta corrección el [run41876510858](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/41876510858) finalmente cerró **success**, comprobado de nuevo. Queda resuelta aquella reserva externa; su resultado es histórico y no se atribuye al nuevo código.

El creador aportó `20261104-1736-30.3794952.mp4`:970×422,30FPS,146 cuadros,≈4,87s. Muestra **movimiento relativo de los retratos respecto del techo** durante el arrastre. Se conserva el archivo original y su hash en la evidencia. Un rastreo auxiliar de la ficha S respecto de una chimenea, contrastado visualmente en recortes alineados, detectó variaciones de hasta≈11px de la grabación. Es una medición orientativa por plantillas en video comprimido, no precisión subpíxel ni una medida de rendimiento físico.

La reproducción propia anterior a corregir confirmó **30 actualizaciones de posición/tamaño de una ficha estática sin que Phaser hubiera presentado otro cuadro del mapa**. La nueva prueba quedó roja y guardó video/trazas antes del arreglo.

**Causa:**85 dejó los retratos, bordes y etiquetas juntos en HTML, pero actualizaba su cámara desde `requestAnimationFrame`. Phaser dibuja el mapa con su propio ciclo, limitado nominalmente a30FPS cuando hay ambientación. Las coordenadas eran coherentes en reposo; durante el gesto se mostraban en instantes distintos. Los retratos adelantaban al fondo y luego este los alcanzaba. Es una regresión de esa separación visual, **no movimiento del motor ni error de identidad**. Las pruebas anteriores comprobaban correspondencia tras los gestos y estabilidad durante el viaje, sin exigir sincronía de capas mientras cambiaba la cámara. Ese límite de cobertura queda corregido.

## Corrección mínima

Implementación **`8665740bb8241e4fd1d431eda131dfbd9a9d2897`**, documentación en commit posterior. Único archivo de producto modificado: **`prototypes/movement-map/map-view.mjs`**.

1. Al enviar un modelo a Phaser se conserva una copia de cámara/viewport de ese modelo.
2. Un listener de la **API pública `Phaser.Core.Events.POST_RENDER`**, instalado mediante la fábrica de escena ya disponible, publica esa cámara para las capas HTML después de dibujar el cuadro correspondiente.
3. El RAF de la interfaz usa la **última cámara presentada**, mientras se espera otro cuadro de Phaser. Aplica también a bordes, J1/J2, etiquetas de excedentes y polígonos de destinos. Los clics y nombres al señalar usan la cámara visible.
4. La ficha que realmente viaja mantiene su interpolación visual y el orden de exposición/consecuencias de85. No se sincronizan reglas ni se ejecutan comandos desde el evento gráfico.
5. El callback no reescribe el DOM cuando no hay una cámara/modelo nuevo. Se retira mediante el AbortController al desmontar o fallar el arranque. No añade otro RAF, timer, contexto o manejador de entrada.

No se eleva el límite de FPS ni el número de partículas; no se sustituye Phaser ni se modifica su adaptador protegido. Se conserva el renderizado bajo demanda cuando los efectos están apagados. Las fuentes y bundles de los prototipos anteriores permanecen intactos. Sin cambios de motor, reglas, dados, azar, IA, capacidades, narrativa, guardados, PNG, lockfile, main o referencia/tag/release.

## Validación

Linux, Node24.19.0, Chromium154.0.8037.57, Playwright1.57 externo, SwiftShader por software. Escritorio1365×768/DPR1 y móviles **emulados**393×852/320×640/DPR2. No se hizo una prueba nueva en teléfono físico.

| Comprobación | Resultado propio |
| --- | --- |
| Reproducción roja |30 desfases durante un arrastre/zoom de referencia con Tormenta. Video, trazas y error de aserción conservados. |
| Nuevo gate de cámara | **9 combinaciones**:3 viewports×apagado/Suave/Tormenta. Ratón/arrastre, rueda, tacto CDP y pinza. **0 actualizaciones de cámara de la ficha sin nuevo cuadro del mapa**, con movimiento efectivo en todos los casos. |
| Selección y partida |Clic sobre la ficha visible después del gesto selecciona su ID; una sola ficha por ID, misma partida/RNG, sin errores normales ni desplazamiento horizontal. |
| Reposo |Observer de mutaciones:0 escrituras de fichas durante350ms tras estabilizar, incluso con nieve animada. Apagado:0 cuadros de mapa en esa ventana. No es un benchmark de consumo sostenido. |
| Suite y construcción | **555/555**, sin fallos/omisiones/canceladas; check:build, check:movement-map-build, check:state-map-build, check:workshop-build, check:hospital-build y diff --check aprobados. Sin nuevas dependencias. |
| Regresión de experiencia | **5/5**:recorrido de1500ms, blanco/herida/congelación, muerte después de revelar y decisión que espera al jugador. Cámara/área estables y sin duplicación. |
| Recuperación | **5/5**:cambio de vista, visibilidad/reconexión controladas, solicitud obsoleta y movimiento reducido. Sin repetir movimiento ni tirada. |
| Regresión H3.4.2 | **3 tamaños +9 casos** aprobados, incluida limpieza/reinicios, doble confirmación, pérdida de respuesta, J2, sucesión/mordedura y producto sin QA. |

El motor no cambió respecto de74b40: su oráculo40/40 anterior es **evidencia reutilizada**, no una ejecución local nueva de esta corrección. CI conserva la ejecución del oráculo sobre el nuevo head, los gates H3.4.1 y el benchmark secuencial existentes; añade `check-h342-camera-browser.mjs` y su artifact. Run, SHA, resultados descargados y estado global se verifican en el PR22 después del push. Un CI histórico no se atribuye a este cambio.

[Videos antes/después, muestra del creador, trazas y resultados](evidencias/h342-camara/README.md). Se inspeccionaron cuadros consecutivos de los videos de pan y el recorte alineado del video aportado. La nueva comprobación temporal mide el desfase de capas; **no demuestra60FPS, ausencia de tirones generales por falta de GPU ni fluidez de un teléfono físico**. El límite30FPS y el coste de la ambientación siguen siendo reservas conocidas.

## Revisión crítica

Se revisaron el orden entre RAF y POST_RENDER, inmutabilidad de las cámaras copiadas, selección por coordenadas visibles, animación propia de actores, apagado/reanudación y limpieza del listener. Se descartó subir FPS o forzar redibujado continuo para tapar el síntoma. Tampoco se modificó el renderer compartido: la extensión usa su punto de creación de escena existente y un evento público, evitando alterar los prototipos de comparación.

Un riesgo de la primera implementación del arreglo era actualizar etiquetas con cada cuadro de nieve aun en reposo. Se añadió el control por cámara enviada y la prueba de cero escrituras. La revisión es **propia**, no una nueva revisión humana independiente. No se inventan problemas de reglas ni se abren otras acciones.

## Probar y siguiente paso

En VSCode, terminal en la carpeta del repositorio y rama H3.4.2. Detener el servidor anterior con Ctrl+C antes de reiniciarlo:

```powershell
git pull --ff-only
npm.cmd run dev:movement-map
```

Abrir **http://127.0.0.1:8776/prototypes/movement-map/** y recargar con Ctrl+Shift+R. Preparar V9.9 → Ver mapa → centrar Colonia → arrastrar y usar rueda/pinza. Comparar con efectos apagados, Suave y Tormenta; seleccionar retratos y probar el movimiento confirmado. Si es la primera instalación, ejecutar antes `npm.cmd ci`. [Guía completa y LAN](../prototypes/movement-map/README.md). Sin Python.

**Única siguiente tarea:** revisión del creador de este arreglo en el PR22, que permanece draft. Sin merge, cambios en main ni avance a otra acción/hito.
