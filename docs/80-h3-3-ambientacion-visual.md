# 80 — H3.3: ambientación visual de invierno

03/11/2026, America/Montevideo. [PR19 en borrador](https://github.com/LeviEdition/invierno-en-la-colonia/pull/19), rama `experiment/h3-3-taller-visual`. **Aprobación visual pendiente; H3.3 abierto.** Sin H3.4, motor, merge o publicación de versión.

> **Registro histórico:** el creador consideró esta intensidad prácticamente imperceptible. La calibración y el valor inicial Baja descritos aquí quedan sustituidos por la [revisión81](81-h3-3-visibilidad-ambientacion.md). Se conserva esta evidencia sin reescribir sus resultados.

## Base y alcance

Inicio limpio en `c61be77ae71d371e7c1b148bd51eff7e32d3c07f`, igual al remoto; PR19 OPEN/draft hacia PR18. No AGENTS.md aplicable. Revisados README, protocolo15, tablero,74–79 y código gráfico. Conservados originales, capacidades y comportamiento de la maqueta. No se modifica main, referencia/tag/release, SP-03, Canvas o Phaser H3.2.

Encargo: añadir nieve, viento, humo con salida coherente y luces leves, aislados de selección/estado, con accesibilidad y mediciones. La **corrección de capacidades exteriores permanece aplazada**; no se cambia su configuración de33 fichas/36 espacios ni se interpreta como aceptación reglamentaria. No sonido, actores animados, cámara automática, sombras nuevas pintadas, redistribución horizontal o arte regenerado.

## Efectos y anclajes comprobados

Todos los puntos se expresan en el PNG original1448×1086, sin editarlo ni añadir fuentes externas de arte. Se inspeccionó el mapa ampliado mediante capturas del navegador; las ampliaciones de diagnóstico no son derivados de producto.

| Efecto | Configuración y ubicación | Reserva |
| --- | --- | --- |
| Nieve |96 objetos máximos,48 en baja; tamaño1,2–3,8 unidades, velocidad8–18 unidades/s y opacidad variable |Campo completo del mundo, no repoblado en cada viewport |
| Viento |Ráfagas sinusoidales lentas, periodos17 y10,7s, modifican nieve/humo;6 estelas máximas/3 en baja |Estelas solo en zonas configuradas despejadas |
| Humo |18 objetos máximos/9 en baja; subida5–8 unidades/s, vida9–14s |Solo colonia; ascenso/dispersión suaves |
| Luces |4 polígonos, periodos8,7/12,1/10,4/13,6s y fases diferentes |Superposición localizada sobre arte ya iluminado, sin variación global |

**Humo de colonia:** boca superior de la chimenea de ladrillo oeste, **(738,310)**. En el hospital hay conductos/equipos de ventilación, pero no una chimenea de combustión inequívoca: **se omite su emisor**, en lugar de colocar humo sobre una salida inventada. [Inspección colonia](evidencias/h33-ambientacion/colonia-arte.png) · [hospital](evidencias/h33-ambientacion/hospital-arte.png).

Luces del hospital: cristales interiores de ventanas oeste `[182,447]–[195,461]` y este `[359,450]–[371,464]`. Colonia: cristal de entrada `[913,470]–[920,478]` y ventana oeste `[748,456]–[760,471]`. Coordenadas, periodos, fases, amplitudes y colores están en JSON. No se agregan destellos ni halos de brillo global.

Estelas en tres rectángulos abiertos, conservando la proyección del mapa: calle central oeste `(190,672,260,28)`, central este `(935,672,300,28)` y calle sur/comisaría `(590,982,235,24)`. Cada partícula permanece enteramente dentro de su zona; no se trazan estelas por fachadas. No hay colisiones físicas nuevas.

El contraste de la estela se calibró tras una muestra aislada de viento con0 píxeles modificados sobre terreno claro; nieve/humo/luces sí produjeron cambios. Eso no demuestra ausencia total del viento en todas las fases, pero justificó ajustar solo color/opacidad y añadir verificación de píxeles para cada efecto. Se mantiene fina, blanda y localizada; aprobación perceptual pendiente. Una repetición a escala lejana volvió a quedar bajo el umbral de rasterización en320px: la prueba visual aislada se fija en Normal y acerca la zona de estela mediante la cámara real, sin exigir que un detalle menor de un píxel siga siendo perceptible. [Evidencia del umbral](evidencias/h33-ambientacion/estela-umbral-rojo.json). Los efectos lejanos/baja pueden ser imperceptibles; no se amplían artificialmente en píxeles CSS.

## Arquitectura, tiempo y recursos

- `atmosphere.json`: emisores, omisión documentada, zonas, colores, niveles, límites, velocidades y capas.
- `atmosphere-model.mjs`: movimiento exclusivamente visual, delta transcurrido acotado a50ms, sin recuperar tiempo oculto. RNG local con semilla propia, tomada de crypto al crear; no usa RNG del motor ni `Math.random` compartido.
- `atmosphere-view.mjs`: pool fijo120 imágenes +1 Graphics, una textura radial64² generada por código. Reutiliza objetos/recursos; no crea emisores o nodos por fotograma.
- Renderer existente: extensión opcional, misma escena/cámara/contexto WebGL. `Scene.update` avanza solo la ambientación, no llama reglas, selección, render del motor ni reconstruye los nodos del mapa cada frame. Los modos técnicos no instalan esa extensión.
- Un solo loop gráfico de Phaser, con API pública **`TimeStep.setFPSLimit` de4.2.1** y límite nominal30FPS cuando hay efectos. Al apagar todo se retira ese límite y se duerme tras el siguiente render, recuperando la demanda por interacción.

Las partículas, humo, estelas y luces están en coordenadas de mundo y usan la cámara ya existente. No se añade otra cámara o canvas de primer plano sobre HTML. Se mantienen enteras dentro del mapa y se desvanecen en una banda18 unidades junto al borde; la nieve envuelve el campo completo, sin saltos de distribución al pan/zoom. No se usó `setMask`, que en4.2.1 no funciona para WebGL sin filtros nuevos; mantener un campo acotado evita esa infraestructura adicional.

Capas: mapa0, espacios1, luces2, estelas2,5, actores3, humo4, nieve6, fichas7, diagnóstico100. Así las fichas permanecen por encima de las partículas. No se activa `setInteractive` en efectos; el hit-test y los controles existentes conservan su única ruta de entrada.

Costo adicional fijo: **120 objetos de partículas +1 Graphics**, una textura radial **16KiB RGBA base** (estimación, no VRAM medida), sin nuevos PNG, lecturas de red o superficies POT grandes. El pool permanece asignado al apagar para reutilizarlo; se detiene su trabajo continuo. Al desmontar se retiran121 objetos, textura y backing del canvas auxiliar; después se destruye la instancia habitual y su contexto. Las siete texturas de arte y sus mipmaps conservan el costo anterior≈58,67MiB estimados más auxiliares.

## Controles y accesibilidad

En el panel: **Ambientación** → total, Nieve/Viento/Humo/Luces y Baja/Normal. Todos son controles HTML con teclado/estado `aria-pressed`, mínimo44px y scroll del panel cuando hace falta. Estado anunciado como texto. No sonido ni entradas de partículas.

Entrada normal: efectos activos en **Baja**. `prefers-reduced-motion: reduce`: inicia apagado; activación expresa disponible. Un cambio de preferencia a reducir detiene los efectos; no se reactivan solos al quitar esa preferencia. Reiniciar/bfcache reconstruye los valores iniciales, sin guardar opciones en partidas ni almacenamiento.

`visibilitychange` pausa explícitamente; al volver se conserva la fase visual, sin catch-up o ráfaga de partículas nuevas. La pérdida de contexto gráfico también pausa hasta restauración. Callbacks de interfaz/MediaQuery/visibilidad se cancelan con el AbortController de cada instancia.

## Pruebas y condiciones

Seis pruebas nuevas, escritas primero [en rojo](evidencias/h33-ambientacion/modelo-rojo.log): contrato/zonas, movimiento reducido, RNG reproducible/pool estable, tiempo/pausa/delta, controles independientes y límites/luces lentas. Simulación de3600 pasos con las mismas referencias de objetos, comparación30/60Hz y muestreo1800 pasos de límites. Resultado Node final **507/507**, sin omitir las501 anteriores. [Log](evidencias/h33-ambientacion/npm-test.log).

Build V9.9 y builds/checks Phaser/taller reproducibles. Guard de bundling mantiene fuera `src/` y las entradas de los prototipos de referencia. No nueva dependencia ni cambio de Phaser/esbuild/lockfile. Bundle principal1.453.352 bytes/gzip9 392.538, SHA-256 `85c0013b9c96928282f1480e9019a7ab82d5fc96de3d08c660bd0cbfd1353f40`; técnico `265c882ad84347168be8df5a1d9ce421d5a1845b1d3948fe0bd683e6401454a7`. H3.2 conserva `7e7b90ab465bc4b7113ffb20c4c0780a9c0e9d0db1d0cfab83659b46632f5e54`. [Build](evidencias/h33-ambientacion/build.json). Se conservan gates Canvas, H3.2, técnico, kit técnico, maqueta y texturas; se añade el gate de ambientación. Las comparaciones estáticas apagan efectos mediante su control HTML, preservando sus criterios; el gate nuevo prueba defaults y controles/interacciones con efectos en marcha.

Chromium local154.0.8037.57 headless, Playwright1.57.0 externo, Linux/Node24.19.0, CPU reportada AMD EPYC9V74 con4 hilos disponibles para el proceso, **ANGLE/SwiftShader software**. Tres tamaños:1365×768/DPR1,393×852/DPR2 y320×640/DPR2. No throttling de red/CPU aplicado; recursos calientes para medir. Equipo y método completos en [JSON](evidencias/h33-ambientacion/ambientacion.json); esto no mide un teléfono físico, VRAM, consumo eléctrico o FPS de hardware móvil.

Comprobaciones: vista general y hospital/colonia, siete edificios/retratos seleccionables con efectos, arrastre/rueda/pinza sin capturar entrada, apagado total y por tipo, baja/normal, ausencia de invasión del letterbox, cambios de píxeles por efecto, cinco reinicios adicionales por tamaño, pool/contextos/listeners estables y disposición final sin objetos GL/contextos/observers/timers. Sin errores normales de consola. Movimiento reducido inicial, opt-in explícito y cambio de preferencia durante sesión.

**Límite de visibilidad:** se intentó una segunda pestaña real y bringToFront. Este headless mantuvo `document.hidden=false`; no demuestra ocultación real. Se verificó aparte evento/estado controlado: contador/tiempo congelados mientras oculta, reanudación sin recuperar el lapso. El JSON distingue `realTabHidden=false` de `controlledOverride=true`. La prueba de cambio real de pestaña en navegador/dispositivo del creador sigue pendiente. No se cuenta la suspensión bfcache histórica como sustituto.

### Medición comparativa

Semilla QA fija0x33c01 inyectada únicamente en la extracción Uint32 de la fuente visual, sin cambiar producción; mismo documento, DPR, mapa/cámara y recursos; apagado/baja/normal, tres ventanas de reposo de1s por modo más un recorrido de entrada idéntico. Fotogramas contados con timestamps del mismo muestreo; `Performance.getMetrics` aporta TaskDuration/ScriptDuration/heap. TaskDuration se normaliza por el intervalo real de métricas; incluye instrumentación y trabajo de ese proceso, no tiempo GPU. El recorrido registra su duración real, que puede aumentar por carga del entorno. Se fuerza GC antes de cada ventana; el heap final puede incluir transitorios y no es una prueba de ausencia de fugas. El recorrido contiene12 gestos con pausas75ms, por lo que los renders/s de apagado expresan demanda de entradas, no FPS máximos ni menor fluidez. No confundir rAF o FPS codificados del video con fotogramas renderizados.

| Viewport CSS / DPR | Efectos | Renders/s en reposo, mediana3 | TaskDuration ms/s, mediana3 |
| --- | --- | ---: | ---: |
|1365×768 /1|Apagado|0.0|3.0|
|1365×768 /1|Baja|30.2|791.0|
|1365×768 /1|Normal|30.2|872.7|
|393×852 /2|Apagado|0.0|3.1|
|393×852 /2|Baja|30.4|766.5|
|393×852 /2|Normal|30.7|831.7|
|320×640 /2|Apagado|0.0|3.8|
|320×640 /2|Baja|29.9|556.4|
|320×640 /2|Normal|30.4|663.4|

| Viewport CSS | Efectos | Recorrido, ms | Renders/s durante entradas | TaskDuration ms/s |
| --- | --- | ---: | ---: | ---: |
|1365×768|off|1416|9.9|293.5|
|1365×768|low|2592|29.7|908.6|
|1365×768|normal|3212|28.0|990.3|
|393×852|off|1425|9.8|299.5|
|393×852|low|2330|30.0|890.3|
|393×852|normal|2444|29.9|894.6|
|320×640|off|1297|10.8|230.4|
|320×640|low|1483|30.3|611.2|
|320×640|normal|1859|30.1|693.2|

Los efectos obligan a redibujar el mapa mientras están activos; apagar recupera0 renders de reposo, pero conserva recursos asignados para el próximo uso. La medición se realizó secuencialmente, no en paralelo con otros gates. No extrapolar CPU del renderer software a una GPU/teléfono ni declarar presupuesto móvil aprobado. La suavidad y conveniencia energética requieren revisión en hardware real.

## Evidencia visual

Capturas nativas inspeccionadas: [general baja](evidencias/h33-ambientacion/1365-general-baja.png), [hospital](evidencias/h33-ambientacion/1365-hospital-normal.png), [colonia](evidencias/h33-ambientacion/1365-colonia-normal.png), [móvil393](evidencias/h33-ambientacion/393-colonia-normal.png), [móvil320](evidencias/h33-ambientacion/320-hospital-normal.png). [Metadatos/hash](evidencias/h33-ambientacion/capturas.json). La aprobación visual no se deduce de estas aserciones.

[Video corto de colonia](evidencias/h33-ambientacion/colonia-ambientacion.mp4): intensidad **Normal**, solo canvas, sin sonido; la entrada predeterminada sigue siendo Baja. Captura MediaRecorder del canvas y conversión de presentación con padding de un píxel para dimensiones pares, sin recortar/escalar el contenido; no grabación física ni benchmark. Se inspeccionaron fotogramas separados y cadencia/estado por instrumentos; la valoración perceptual continua del viento y humo queda al creador con el clip. Una captura fija no demuestra suavidad.

Los siete JSON finales y el build se conservan en [evidencias](evidencias/h33-ambientacion/). CI del **head exacto**, artifact descargado y comparación de hashes se registran en la [descripción del PR19](https://github.com/LeviEdition/invierno-en-la-colonia/pull/19), diferenciados de las mediciones locales y evitando autorreferencia del SHA de este informe.

## Prueba local desde VS Code/PowerShell

Carpeta del clon con package.json y package-lock.json; detener el servidor propio anterior con Ctrl+C:

```powershell
git switch experiment/h3-3-taller-visual
git pull --ff-only
npm.cmd ci
npm.cmd run dev:workshop
```

Abrir **http://127.0.0.1:8772/prototypes/hospital-workshop/**, terminal abierta. Centrar Hospital/Colonia, seleccionar edificio/retrato y desplegar Ambientación. Probar Baja/Normal, un efecto a la vez y apagado completo. Con movimiento reducido del sistema inicia apagado. Cambiar de pestaña y volver forma parte de la revisión física pendiente.

Si aparece EADDRINUSE8772: cerrar el servidor propio anterior en su terminal o usar `$env:WORKSHOP_PORT="8773"` antes de `npm.cmd run dev:workshop`, y abrir el mismo camino en **8773**. No matar procesos ajenos. No Python, doble clic/file:// o CDN. Rutas Canvas/H3.2 y `tecnico.html` continúan disponibles en el mismo servidor. [Guía](../prototypes/hospital-workshop/README.md).

## Revisión crítica y pendientes

Se revisaron separación del estado visual, origen del RNG, límites/pool, objetos y listeners por reinicio, capas, anclajes, zonas despejadas, APIs oficiales4.2.1, pausa/delta, preferencias y apagado a demanda. Los controles de selección y los datos del fixture no se avanzan por fotograma. No se cambió el adaptador protegido `HospitalGame`. Esta revisión propia no equivale a auditoría externa ni aceptación artística.

Reservas: humo de hospital omitido; emisores/polígonos ligados al arte actual; animación continua añade costo de redibujado; dispositivo físico/visibilidad real/consumo pendientes; calibración artística de cantidad, color y suavidad abierta. Se conserva el mapa completo y la corrección de espacios exteriores aplazada. **Única siguiente tarea: revisión visual del creador de esta pasada.** PR19 sigue draft, H3.3 no cerrado; no merge, motor ni H3.4.
