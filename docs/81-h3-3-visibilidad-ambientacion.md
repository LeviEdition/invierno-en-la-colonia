# 81 — H3.3: ambientación claramente visible

03/11/2026, America/Montevideo. [PR19 en borrador](https://github.com/LeviEdition/invierno-en-la-colonia/pull/19), rama `experiment/h3-3-taller-visual`. **Pendiente de revisión visual del creador; H3.3 abierto, sin H3.4 ni merge.**

> **Revisión posterior del creador:** luces y viento todavía insuficientes; humo solicitado más negro y sonido de ventisca autorizado. El [informe82](82-h3-3-luces-viento-y-ventisca.md) registra la nueva pasada. Esta evidencia y sus métricas se conservan como historia, no como aceptación visual.

## Motivo y base

El creador describe los efectos de80 como «prácticamente imperceptibles» y pide mucha más presencia. Esa observación sustituye la calibración inicial sutil, sin ampliar el alcance a reglas, arte, capacidades exteriores o motor. Se conserva80 como evidencia histórica.

Inicio limpio en `d003e9f475c3579d0cc22f00df1020669c92030f`, igual al remoto, PR19 OPEN/draft hacia PR18. Instrucciones, tablero y documentación vigente revisados; no AGENTS.md aplicable. Main `826199d96645b95869509995772c914290d63ac7`, referencia/tag/release, originales, Canvas, H3.2 y SP-03 preservados. No nuevas dependencias, renderer, listeners o bucles.

## Diagnóstico y cambios

La nieve anterior medía1,2–3,8 unidades del mapa: en vista general móvil podía quedar por debajo de un píxel CSS. Su opacidad18–46%, multiplicada por una textura radial blanda y por Baja, reducía todavía más el contraste. El gate previo comprobaba algún píxel distinto en un acercamiento; esa prueba demostraba rasterización, pero no detectaba que la vista general resultara casi imperceptible. No era falta de un PNG ni un error de instalación.

| Elemento | Cambio |
| --- | --- |
| Nieve |4–7 unidades, opacidad65–95%, velocidad18–34 unidades/s; textura16² con núcleo firme para conservar presencia al reducir |
| Viento |Estelas70–120×5–9 unidades, opacidad28–48%; deriva/ráfagas reforzadas y graduales |
| Humo |Partículas10–16 unidades que se expanden al ascender, opacidad24–40%, tono más oscuro, subida7–11 unidades/s y vida10–16s |
| Luces |Mayor intensidad y variación lenta, mezcla aditiva y cuatro halos suaves locales; ninguna modificación global del brillo |
| Entrada |**Normal** por defecto; Baja sigue disponible. Movimiento reducido sigue iniciando apagado y requiere activación expresa |

Los anclajes no cambian: humo solo en chimenea oeste de colonia(738,310); hospital omitido por salida no inequívoca. Dos luces sobre cristales de hospital y dos de colonia; mismas tres zonas despejadas para estelas. Coordenadas y periodos8,7–13,6s conservados. [Configuración](../prototypes/hospital-workshop/mockup/atmosphere.json). No animación de actores ni cámara automática.

Se conserva el pool de120 partículas; no se aumenta densidad indiscriminadamente. La nieve queda bajo las fichas, y todo usa la transformación del mundo existente. La interfaz no recibe partículas ni entrada nueva. La mezcla ADD=1 usa la API pública de Phaser4.2.1, sin tocar HospitalGame ni filtros globales.

## Comparación antes/después

Mismos PNG, cámara, tamaño CSS, DPR y semilla visual0x33c01; Normal en ambas versiones. Bundle anterior `85c0013b9c96928282f1480e9019a7ab82d5fc96de3d08c660bd0cbfd1353f40`, reconstrucción nueva identificada en [build.json](evidencias/h33-visibilidad/build.json). La referencia apagada de cada captura permite contar solo cambios dentro del canvas. Se registra el tiempo observado: las fases no son exactamente iguales, por lo que los cocientes son muestras comparativas, no una medida perceptual universal.

**Señal técnica:** píxeles cuyo cambio máximo de canal frente a apagado alcanza8/255. No es porcentaje de mejora artística ni prueba de legibilidad por sí sola. El nuevo gate requiere al menos500 en cada vista general; las muestras anteriores solo alcanzan86–172. [Muestra roja y criterio aplicado](evidencias/h33-visibilidad/visibilidad-rojo.json). Se obtuvo con el bundle anterior en Chromium y luego se aplicó el criterio a sus conteos: no se afirma haber ejecutado el gate nuevo completo sobre el commit histórico.

| Vista / tamaño CSS | Antes, píxeles fuertes | Después | Cociente de la muestra |
| --- | ---: | ---: | ---: |
|general /1365×768|172|2172|12.6×|
|colonia /1365×768|568|3415|6.0×|
|general /393×852|150|1898|12.7×|
|colonia /393×852|335|2723|8.1×|
|general /320×640|86|1379|16.0×|
|colonia /320×640|191|1657|8.7×|

[Conteos/cámaras y tiempos](evidencias/h33-visibilidad/comparacion.json) · [antes](evidencias/h33-visibilidad/antes.json) · [después](evidencias/h33-visibilidad/despues.json). Para repetir la captura existe `capturar-comparacion.mjs` en la misma carpeta: requiere Playwright QA externo, `PLAYWRIGHT_MODULE`/`CHROMIUM_PATH`, servidor en8772 y `VIS_OUTPUT` para la salida; `VIS_BUNDLE` permite servir un bundle histórico reconstruido sin modificar el checkout. No se carga desde el producto.

[Antes, vista general](evidencias/h33-visibilidad/antes-1365-general-normal.png) · [Después, vista general](evidencias/h33-visibilidad/despues-1365-general-normal.png) · [Antes, colonia](evidencias/h33-visibilidad/antes-1365-colonia-normal.png) · [Después, colonia](evidencias/h33-visibilidad/despues-1365-colonia-normal.png) · [General móvil320](evidencias/h33-visibilidad/despues-320-general-normal.png).

[Video de colonia](evidencias/h33-visibilidad/colonia-ambientacion.mp4), aproximadamente8s, Normal, solo canvas/sin sonido. Se conserva tamaño de captura, con padding si hace falta para codificación; no se amplifica el efecto mediante escalado del video. Fotogramas separados e instrumentación inspeccionados; la valoración continua de suavidad queda al creador. Una imagen fija no demuestra movimiento. El MP4 mide7,89s y su cadencia codificada media es≈15,6FPS bajo captura software; no equivale al contador de renders≈30/s medido sin grabación. [Metadatos](evidencias/h33-visibilidad/video.json).

## Validación y recursos

**507/507 pruebas Node**, sin fallos, omitidas ni TODO; se conservan las seis de ambientación, con arranque Normal y validación de halos. Build/check V9.9, Phaser y taller reproducibles, contrato del kit aprobado. [Tests](evidencias/h33-visibilidad/npm-test.log) · [Build/checks](evidencias/h33-visibilidad/build-checks.log).

Chromium154.0.8037.57 headless, Playwright1.57.0 externo, Linux/Node24.19.0, AMD EPYC9V74,4 hilos disponibles, ANGLE/SwiftShader **software**. Tres tamaños1365×768/DPR1,393×852/DPR2 y320×640/DPR2. [Ambientación final](evidencias/h33-visibilidad/ambientacion.json): tres vistas generales superan el umbral (2036/1825/1205 píxeles fuertes), siete localidades/retratos, pan/rueda/pinza, efectos separados, límites del mapa, controles44px y sin overflow. Cinco reinicios por tamaño, pool/contextos/listeners estables,125 objetos liberados y0 contextos/objetos GL/observers/timers tras desmontar; cero errores normales. Preferencia reducida/opt-in/cambio observado aprobados. [Maqueta estática](evidencias/h33-visibilidad/maqueta.json) también aprobada en los tres tamaños, conservando sus criterios al apagar efectos por el control HTML. Canvas, H3.2, técnico, kit técnico y texturas no se modifican: se conserva su evidencia histórica de80/CI del commit base `d003e9f475c3579d0cc22f00df1020669c92030f`; no se presentan como nuevas ejecuciones locales. CI repite los siete gates sobre el head final.

Pool120 reutilizado, ahora **125 objetos**:120 partículas,4 halos y1 Graphics. Texturas procedurales64²+16²: **17408 bytes RGBA base estimados**, incremento1024 bytes y4 objetos respecto de80; no VRAM medida. Sin PNG nuevos ni incremento de las siete texturas grandes. El costo principal sigue siendo redibujar mapa y escena mientras la animación está activa.

Apagado total y efectos individuales, pausa/delta acotado, movimiento reducido/activación expresa/cambio de preferencia, reinicios sin crecimiento y desmontaje se siguen comprobando. Apagado recupera demanda, sin loop de reposo. No se infiere ausencia de fugas solo del heap.

| Viewport CSS / DPR | Modo | Renders/s reposo, mediana3 | TaskDuration ms/s, mediana3 |
| --- | --- | ---: | ---: |
|1365×768/1|off|0.0|3.2|
|1365×768/1|low|30.3|772.2|
|1365×768/1|normal|29.9|989.8|
|393×852/2|off|0.0|3.4|
|393×852/2|low|30.5|730.1|
|393×852/2|normal|29.6|889.5|
|320×640/2|off|0.0|3.9|
|320×640/2|low|30.8|646.4|
|320×640/2|normal|30.5|693.3|

El costo con efectos activos es considerable en este renderer software, especialmente Normal en escritorio. La medición no permite atribuir diferencias entre corridas exclusivamente a los cuatro halos; no se afirma costo nulo ni rendimiento móvil aprobado. Los recorridos y duraciones quedan en el JSON, separados del reposo.

Las cifras son del proceso del navegador bajo instrumentación y renderizado software, no rendimiento de una GPU o teléfono. La ventana de navegación contiene entradas programadas y pausas, no mide FPS máximos. Mismo método de80, recursos calientes, GC antes de cada muestra y ejecución secuencial; condiciones completas en JSON.

**Visibilidad de pestaña:** este Chromium headless no expone ocultación real al cambiar de pestaña (`realTabHidden=false`). Se conserva explícitamente la prueba alternativa controlada de pausa/reanudación sin catch-up; la prueba real queda pendiente. No teléfonos físicos, consumo energético ni aprobación perceptual automatizada.

CI sobre el **head completo entregado**, artifact descargado y resultados se registran en la [descripción del PR19](https://github.com/LeviEdition/invierno-en-la-colonia/pull/19), separados de las mediciones locales y sin referencia circular al SHA de este documento.

## Abrir la nueva versión

En VS Code, terminal del clon con package.json y package-lock.json. Conservar cambios propios y detener el servidor anterior con **Ctrl+C**, después:

```powershell
git switch experiment/h3-3-taller-visual
git pull --ff-only
npm.cmd ci
npm.cmd run dev:workshop
```

Abrir **http://127.0.0.1:8772/prototypes/hospital-workshop/** y recargar con Ctrl+F5. Si usás otro puerto, respetar el impreso en la terminal. `dev:workshop` vuelve a generar el bundle: abrir un servidor antiguo sin reconstruir no incorpora el cambio. En Ambientación, confirmar Normal/activado; si Windows prefiere movimiento reducido, activar expresamente los efectos. Baja y apagado siguen disponibles.

Si8772 está ocupado, detener el servidor propio o usar `$env:WORKSHOP_PORT="8774"` antes del comando y abrir la misma ruta en8774. No Python ni cambio de políticas PowerShell. Para red local: `npm.cmd run dev:workshop -- --host 0.0.0.0`, usar la URL LAN que imprime el servidor, misma Wi-Fi y permiso del firewall local. Esta instrucción no constituye una prueba física.

El primer recorrido completo detectó una carrera del arnés: dos `emulateMedia` consecutivos podían no producir ningún evento, dejando vigente la activación expresa anterior. La prueba dirigida registra0 eventos en ese caso y dos eventos cuando espera cada transición; la aplicación apaga correctamente al recibir `reduce`. Se corrige solo la espera QA para observar la notificación real, sin cambiar la aplicación ni sustituir el evento por una llamada interna. [Fallo conservado](evidencias/h33-visibilidad/arnes-movimiento-fallo.json) · [Reproducción dirigida](evidencias/h33-visibilidad/arnes-movimiento-probe.log).

## Revisión y límites

Revisados capas, mezcla aditiva localizada, limpieza de ambas texturas y cuatro halos, independencia de RNG/estado, controles y demanda cuando está apagado. Los límites de objetos del gate se ajustan a125 y se comprueba su liberación real; el pool sigue120. No se ha reducido cobertura ni cambiado los criterios Canvas/geométricos existentes. Revisión propia, no independiente por otro agente.

La intensidad reforzada responde a la observación, pero **no se declara resuelta la aceptación artística por pasar tests**. Cantidad, trayectoria, humo/luces y sensación de invierno deben revisarse en movimiento. En móvil el campo entero sigue minificando los detalles; se conserva zoom para inspeccionar. Hospital sin humo, prueba física/visibilidad real/energía pendientes, capacidades exteriores aplazadas. **Siguiente paso único: revisión visual del creador en PR19; H3.3 sigue abierto.**
