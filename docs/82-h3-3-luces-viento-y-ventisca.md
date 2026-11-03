# 82 — H3.3: luces asincrónicas, humo negro, viento y sonido de ventisca

03/11/2026, America/Montevideo. [PR19 draft](https://github.com/LeviEdition/invierno-en-la-colonia/pull/19), rama `experiment/h3-3-taller-visual`. **Revisión visual/acústica del creador pendiente; H3.3 abierto.** Sin merge, motor o H3.4.

## Encargo vigente y base

Mientras se validaba25d5144, el creador precisó: «Las luces no se nota nada», titilar asincrónico, humo más negro y viento visible; pidió además sonido de ventisca. **Esta petición autoriza el sonido ambiental de esta revisión y sustituye su exclusión anterior**, sin ampliar a música, voces, efectos de acciones ni integración del motor. Se mantiene el control explícito y silencio inicial.

Base limpia `25d51446ad20f35185ee8894ece06890cfa8947a`. Su [CI41698612565](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/41698612565) terminó success, pero no implica aceptación visual ni valida los cambios posteriores de82. Informe81 y su evidencia quedan conservados. Instrucciones/tablero revisados, sin AGENTS.md aplicable; PR19 OPEN/draft hacia PR18. Main826199d9, referencia/tag/release, PNG originales, Canvas, H3.2, SP-03, capacidades y estado de juego intactos.

## Hallazgos y solución

**Luces:** las ventanas ya están iluminadas en el PNG del mapa. Una superposición cálida tenue solo podía aumentar ese brillo: el contraste temporal era insuficiente. Ahora se atenúan los cristales con una capa oscura localizada y se iluminan con mezcla aditiva/halo, sin tocar el PNG. Cada ventana combina dos ondas continuas de fase propia; periodos base3,7/5,9/4,7/6,3s, segunda componente menor, sin saltos o destellos rápidos ni cambio global del escenario. Contraste amplio, no variación sincronizada. Al apagar Luces se retiran tanto atenuación como iluminación y se ve el arte original.

**Humo:** color casi negro `#15171c`, opacidad48–70%, partículas12–20 unidades que se expanden y ascienden. Mismo emisor, boca de chimenea oeste de colonia(738,310). Hospital sigue sin emisor por salida ambigua. El humo se desvanece al nacer/dispersarse, no es una mancha fija ni una salida inventada.

**Viento:** se sustituye la elipse muy difusa por tres trazos curvos de extremos suaves, generados en una textura128×32. Estelas100–180×10–16 unidades, opacidad65–90% y ráfagas graduales más marcadas. Mismas tres calles configuradas, sin fachadas. Al reforzarlas en zonas acotadas se reprodujo otro problema: reiniciar la edad al cruzar el borde podía impedir que alcanzaran su fase visible. Se conserva la fase mientras el desvanecimiento espacial oculta la envoltura; no se introduce movimiento o colisión de juego.

**Nieve:** conserva tamaño/contraste de81; la trayectoria responde al viento reforzado. Fichas por encima, FX sin entrada propia y la misma transformación del mapa. El pool sigue120, sin aumentar indiscriminadamente la cantidad.

## Sonido opcional

`atmosphere-audio.mjs` crea una ventisca procedural mediante Web Audio nativo: ruido filtrado y ráfaga lenta que varía amplitud/filtro. Sin archivos externos, dependencias, otro motor, rAF, intervalos ni RNG de la partida. Phaser mantiene `audio.noAudio=true`; el pequeño módulo es dueño exclusivo de su contexto y nodos.

- **Inicia apagado y no crea AudioContext hasta la activación expresa.** Botón «Ventisca: sonido…», volumen HTML0–100% con teclado, inicial40%.
- Sonido independiente de las animaciones: se puede escuchar con movimiento reducido y mapa en reposo. El control general apaga visuales y sonido. Activar el general enciende visuales; el audio requiere siempre su propio botón.
- Ocultar pestaña/perder contexto pausa el audio; al volver reanuda la misma instancia si seguía habilitada. Apagado suspende; reinicio/pagehide destruye nodos, cierra contexto y vuelve al silencio inicial, sin guardar preferencias.
- Error de Web Audio anunciado en texto accesible; no impide usar el mapa. Se puede reintentar desde el mismo botón. Una continuación tardía no publica estado tras desmontar.
- Un contexto máximo por instancia, ocho nodos y buffer mono4s. El buffer es una estimación de muestras en memoria, no toda la memoria nativa del subsistema. No contexto/loop de audio en el arranque silencioso.

## Pruebas y evidencia

TDD: [luces en rojo](evidencias/h33-luces-viento-audio/luces-rojo.log) por variación insuficiente; [viento en rojo](evidencias/h33-luces-viento-audio/viento-rojo.log) por reinicio prematuro; [audio en rojo](evidencias/h33-luces-viento-audio/audio-rojo.log), contrato todavía ausente. Después11 casos dirigidos verdes: se conservan los seis anteriores y se añaden dos visuales/tres de audio. Amplitud por luz>0,45 durante12s y fases separadas; variación continua sin saltos, límites/pool/RNG, pausa y controles. Audio: creación perezosa, volumen, reutilización/pausa, cierre y fallo/reintento/resume tardío.

**512/512 Node**, cero fallos, omitidas o TODO. [Log](evidencias/h33-luces-viento-audio/npm-test.log). Builds/checks V9.9, Phaser, taller y contrato del kit aprobados. [Registro](evidencias/h33-luces-viento-audio/build-checks.log) · [Build](evidencias/h33-luces-viento-audio/build.json). No se reduce cobertura ni se modifica el adaptador HospitalGame.

[Gate de ambientación](evidencias/h33-luces-viento-audio/ambientacion.json) y [maqueta estática](evidencias/h33-luces-viento-audio/maqueta.json) aprobados en1365×768/DPR1,393×852/DPR2 y320×640/DPR2. Chromium154.0.8037.57, Playwright1.57.0 externo, Linux/Node24.19.0, AMD EPYC9V74/4 hilos disponibles y ANGLE/SwiftShader **software**. Sin teléfono físico ni throttling aplicado.

Luces:12 muestras temporales con los demás efectos apagados; rangos observados0,59–0,74 por ventana y diferencias reales de píxeles de hasta105–118/255 entre tiempos, con cámara fija. La verificación mide temporalidad del render, no solo datos de la simulación. Estelas aisladas:2995/936/854 píxeles con cambio de canal≥8/255 en acercamientos preparados, superando50; no se interpreta como puntuación artística. General, cámara/pinza/pan, selección de siete edificios/retratos, controles y límites del mapa conservados; sin overflow ni errores normales.

Audio: silencio/contexto ausente inicial, gesto real de activación, señal digital no nula, volumen por teclado, control general, funcionamiento sin render continuo del mapa, pausa/reanudación controlada y **seis contextos cerrados por viewport** al reiniciar. Error de API ausente anunciado, mapa operativo y reintento real recuperado tras restaurar la API en QA. Fuente/loop/nodos cerrados y recursos GL/listeners estables tras cinco reinicios por tamaño.

El intento de ocultación nativa sigue sin exponer `document.hidden` en este headless: `realTabHidden=false`, alternativa controlada rotulada. No se presenta como cambio real de pestaña. La preferencia de movimiento reducido inicia visuales apagados y admite sonido sin encenderlos. Las referencias Canvas/H3.2/técnico/kit/texturas permanecen idénticas; evidencia local histórica y CI previos diferenciados. El CI final repite los siete gates sobre el nuevo head.

[Ventanas, tiempo A](evidencias/h33-luces-viento-audio/luces-hospital-0.png) · [tiempo B](evidencias/h33-luces-viento-audio/luces-hospital-4.png) · [tiempo C](evidencias/h33-luces-viento-audio/luces-hospital-8.png): misma cámara, sin viento/nieve/humo, capturas durante la prueba temporal. [Colonia y humo negro](evidencias/h33-luces-viento-audio/1365-colonia-normal.png) · [estelas aisladas](evidencias/h33-luces-viento-audio/1365-viento-aislado.png), captura dirigida adicional a la prueba, con su [cámara/estado](evidencias/h33-luces-viento-audio/viento-captura.json).

[Video colonia](evidencias/h33-luces-viento-audio/colonia-ambientacion.mp4):≈7,85s, Normal, captura del canvas sin sonido; padding sin escalar. Se inspeccionan fotogramas separados y métricas, no se afirma revisión perceptual continua. Cadencia codificada≈16,4FPS bajo captura software, distinta de los renders medidos sin grabar. [Metadatos](evidencias/h33-luces-viento-audio/video.json).

[Muestra sonora de ventisca](evidencias/h33-luces-viento-audio/ventisca-muestra.mp3):12s del mismo grafo procedural/volumen40%, render OfflineAudioContext a44,1kHz y conversión MP3 sin normalización de volumen. RMS digital≈0,030 y pico≈0,155, sin clipping digital observado. [Datos](evidencias/h33-luces-viento-audio/audio-muestra.json). No grabación de altavoces ni escucha física; el timbre/volumen real quedan para el creador.

## Costo y revisión crítica

Pool120 conservado, **126 objetos gráficos** (120 partículas,4 halos y2 Graphics). Tres texturas procedurales64²+16²+128×32: **33792 bytes RGBA base estimados**, incremento16KiB frente a81; no VRAM medida. Mismos siete recursos grandes. El costo dominante sigue siendo redibujar la escena al animar. Audio apagado no crea contexto; una vez activado, apagar suspende y conserva el buffer para reutilizarlo hasta desmontar.

| Viewport CSS | Modo visual; audio apagado | Renders/s reposo, mediana3 | TaskDuration ms/s, mediana3 |
| --- | --- | ---: | ---: |
|1365×768|off|0.0|4.4|
|1365×768|low|31.9|923.1|
|1365×768|normal|28.9|994.1|
|393×852|off|0.0|3.8|
|393×852|low|30.1|795.1|
|393×852|normal|30.4|807.5|
|320×640|off|0.0|3.6|
|320×640|low|29.9|538.3|
|320×640|normal|30.4|678.2|

Mismo documento/semilla/cámara/DPR/recursos calientes, tres intervalos de1s por modo y recorrido de entrada programado; GC antes de muestra y métricas normalizadas del proceso. La medición sigue mostrando costo considerable en software; no mide GPU/teléfono ni consumo. El costo CPU adicional del audio no se aísla en esta tabla. Su buffer observado a44,1kHz es705600 bytes,≈0,67MiB más nodos/buffers nativos no medidos; apagado inicial0 contextos. No VRAM ni presupuesto móvil aprobado.

Se revisan separación visual/sonora respecto de la partida, fases/espacios de viento, cristales localizados, limpieza gráfica/sonora, consentimiento de audio, preferencia de movimiento reducido, controles y navegación. Revisión propia, no auditoría independiente de otro agente. No se afirma haber escuchado altavoces físicos por medir una señal digital o producir una muestra. La textura de viento y el titilar son provisionales para revisión, no arte o audio definitivos.

## Probar desde VS Code

En la carpeta del clon, conservar cambios propios y detener el servidor anterior con Ctrl+C:

```powershell
git switch experiment/h3-3-taller-visual
git pull --ff-only
npm.cmd run dev:workshop
```

Si es un clon nuevo, primero `npm.cmd ci` (Node22+). Abrir **http://127.0.0.1:8772/prototypes/hospital-workshop/** o el puerto que imprima la terminal, y Ctrl+F5. No Python. En Ambientación, Normal, comparar Luces activadas/apagadas y observar unos segundos las dos ventanas del hospital; centrar Colonia para humo negro y estelas en calles. Activar **Ventisca: sonido** y ajustar volumen. El sonido nunca empieza solo; movimiento reducido tampoco habilita animaciones por activar audio.

Puerto ocupado: detener el servidor propio o `$env:WORKSHOP_PORT="8774"` y volver a iniciar, usando8774 en la URL. Para celular en la misma Wi-Fi, `npm.cmd run dev:workshop -- --host 0.0.0.0`, URL LAN impresa y permiso de firewall local. No se declara prueba en teléfono físico. Taller técnico `tecnico.html` y referencias Canvas/Phaser permanecen disponibles.

CI del **nuevo head exacto**, artifact descargado y hashes se registran en la [descripción del PR19](https://github.com/LeviEdition/invierno-en-la-colonia/pull/19), diferenciados del CI previo25d5144 y de la medición local, sin autorreferencia al SHA de este informe.

**Pendientes:** aceptación visual y acústica, hardware móvil/consumo y visibilidad nativa de pestaña; humo hospital omitido, capacidades exteriores aplazadas. No se declara H3.3 aprobado. **Único siguiente paso: revisión del creador de esta pasada.**
