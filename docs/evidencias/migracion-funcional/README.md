# Migración funcional — evidencia

Rama `experiment/mapa-horizontal-ambientacion-h3`, PR25 en borrador, desde31ffaf6. [Matriz final, bloques y revisión manual](../../98-paridad-funcional-del-mapa.md). El SHA/run/artifact exactos de entrega se registran en el PR; no se atribuye al head nuevo el verde histórico de31ffaf6.

Los escenarios usan el motor real y las mismas33 capacidades experimentales. **QA controlada**, no una demostración de balance: azar fijo; local/IA/interrupciones/cartas/finales preparan recursos para reproducir sus casos. `normal` solo usa la preparación original, sin parches de estado, y completa dos rondas hasta comenzar la tercera. Todos se inician desde el diálogo del mapa. Los nuevos recorridos usan la preferencia de movimiento reducido; las regresiones anteriores conservan sus animaciones normales y sus aserciones de fases. Móvil852×393 con tacto/DPR2 emulado; escritorio1365×768/DPR1. Sin teléfono físico ni aceptación manual.

## Recorridos

La matriz local combina la pasada completa de14 casos con la repetición de las dos cadenas de interrupciones tras vincular el panel a su revisión autoritativa; `sourceBatches` lo detalla. CI vuelve a ejecutar los14 juntos sobre el head. Cada carpeta conserva capturas y un vídeo completo de su escenario desde la preparación. MP4 convertidos del WebM original, sin recortar ni acelerar. Si una dimensión es impar se añade hasta un píxel de relleno para H264; duración/hash/dimensiones en `videos.json`. El artifact de CI conserva los WebM originales, las capturas y los resultados de su propio SHA.

|Recorrido|Escritorio|Móvil emulado|
|---|---|---|
|Preparación → dos rondas completas → inicio ronda3, sin parches de estado|[Vídeo](1365x768/normal/recorrido.mp4) · [ronda3](1365x768/normal/rondas-sin-fixture.png)|[Vídeo](852x393/normal/recorrido.mp4) · [ronda3](852x393/normal/rondas-sin-fixture.png)|
|Acciones restantes, transferencia local, varias rondas y otra partida|[Vídeo](1365x768/local/recorrido.mp4) · [preparación](1365x768/local/preparacion.png) · [transferencia](1365x768/local/transferencia-local.png)|[Vídeo](852x393/local/recorrido.mp4) · [preparación](852x393/local/preparacion.png) · [transferencia](852x393/local/transferencia-local.png)|
|Humano + IA original, encrucijada de IA y nueva ronda|[Vídeo](1365x768/ai/recorrido.mp4) · [ronda2](1365x768/ai/ia-ronda-2.png)|[Vídeo](852x393/ai/recorrido.mp4) · [ronda2](852x393/ai/ia-ronda-2.png)|
|Contagio encadenado, tirada real, muerte de líder y sucesión|[Vídeo](1365x768/interruptions/recorrido.mp4) · [tirada](1365x768/interruptions/propagacion-tirada-real.png) · [sucesión](1365x768/interruptions/sucesion.png)|[Vídeo](852x393/interruptions/recorrido.mp4) · [tirada](852x393/interruptions/propagacion-tirada-real.png) · [sucesión](852x393/interruptions/sucesion.png)|
|Encrucijada, requisito ilegal deshabilitado, opción legal una vez|[Vídeo](1365x768/cross/recorrido.mp4) · [captura](1365x768/cross/encrucijada.png)|[Vídeo](852x393/cross/recorrido.mp4) · [captura](852x393/cross/encrucijada.png)|
|Victoria, nueva partida y segundo final desde J2 sin filtrar J1|[Vídeo](1365x768/victory/recorrido.mp4) · [victoria](1365x768/victory/victoria.png)|[Vídeo](852x393/victory/recorrido.mp4) · [victoria](852x393/victory/victoria.png)|
|Derrota por tiempo, causa final y ausencia de ronda extra|[Vídeo](1365x768/defeat/recorrido.mp4) · [derrota](1365x768/defeat/derrota.png)|[Vídeo](852x393/defeat/recorrido.mp4) · [derrota](852x393/defeat/derrota.png)|

En `local` escritorio se pierde deliberadamente la respuesta de limpieza, se consulta el mismo estado, se reconecta el puerto y se reconstruye el visor. Se exige mismo estado/azar/cámara y un solo consumo; el incremento de montajes es esa reconstrucción técnica, no otro motor. Nueva partida invalida la generación y no recarga el host.

## Comprobaciones

- `suite.txt`:719/719. `dirigidas.txt`:35/35; comparación con el motor sin instrumentación y capacidades equivalentes. Costes/orden/azar, cartas legales/ilegales, mordedura con sacrificio/riesgo, tratamientos, atracción parcial/saturada, dados, liderazgo, transferencias, privacidad, duplicación/obsolescencia/resultado desconocido y nueva partida durante IA.
- `migracion.json`:14 recorridos, más sondeo aislado que comprueba que la guardia rechaza un retorno V9 inyectado. Cada recorrido exige cero intentos de presentación V9, cero clics heredados, iframe interno oculto, ausencia de navegación/popup hacia V9 y ausencia de tablero/preparación V9 en su DOM.
- `ciclo.json`:diez recorridos anteriores, incluida la mordedura antes resuelta en V9, ahora con diálogo propio; se mantienen cámara, revisión sin azar y continuidad.
- `presentacion.json`, `capacidades.json`, `inventario.json`, `acciones.json`:regresiones anteriores conservadas. Los helpers horizontales preparan por el mapa; no se retiran aserciones de acciones, fases, cámara o capacidad.
- `referencia.txt`, `mapa.txt`:HTML estable y mapa reproducibles. PNG/scene/capacidades/plazas/lockfile intactos. HTML estable SHA256 `28ee788a65d64271f3ce28bd2ff73d26dc2644aa798e51bf925f3914317be9ac`; PNG aprobado `0c5268c189068b5eb7bf51a1fbc871a87782b75e02dc86fe6d21aeeb272e4222`.

Se conservan en `hallazgos.json` los fallos detectados durante implementación: recibo terminal oculto, lectura anticipada del líder antes de recibir confirmación y espera errónea de visibilidad de un iframe que debe estar oculto en el sondeo. Se corrigió la causa; no se ampliaron esperas ni se relajaron aserciones. Las comparaciones de reglas y la guardia sin V9 se conservan.

Node24.19.0 y Chromium154 local. CI usa Node22 y Playwright1.57.0 y vuelve a construir/ejecutar todo en su SHA. La evidencia local se incorpora al commit; el artifact enlazado en PR25 es la evidencia de la ejecución exacta del head remoto.

No hay guardado persistente nuevo. Reconectar/reconstruir conserva la partida si vive el host; recargar la aplicación pierde la instancia y vuelve a preparación. Una excepción sin recibo determinable bloquea repetir la operación, sin éxito inventado ni reinicio silencioso.
