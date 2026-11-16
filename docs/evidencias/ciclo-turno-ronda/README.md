# Ciclo de turno y ronda — evidencia

Base303bf26, misma rama y PR25 draft. [Orden auditado, bloques A/B/C/D y tabla de flujos](../../97-ciclo-de-turno-y-ronda.md). El ciclo ordinario está integrado; mordeduras, encrucijadas y otras decisiones nativas pendientes conservan retorno explícito a V9. No se presenta como integración de todo caso obligatorio.

| Recorrido / captura | Escritorio1365×768 | Móvil852×393 emulado |
|---|---|---|
|Ronda local: aportar→actuar→ambos cierres→colonia→ronda nueva|[Vídeo completo](1365x768/ronda-local.mp4)|[Vídeo completo](852x393/ronda-local.mp4)|
|Humano→IA original→colonia→ronda nueva|[Vídeo completo](1365x768/ronda-ai.mp4)|[Vídeo completo](852x393/ronda-ai.mp4)|
|Pase privado|[Captura](1365x768/local-pase.png)|[Captura](852x393/local-pase.png)|
|Consecuencias reales de colonia|[Captura](1365x768/local-colonia.png)|[Captura](852x393/local-colonia.png)|
|Control de ronda nueva|[Captura](1365x768/local-nueva-ronda.png)|[Captura](852x393/local-nueva-ronda.png)|
|Fallecimiento obligatorio|[Captura](1365x768/death-fallecimiento.png)|[Captura](852x393/death-fallecimiento.png)|
|Sucesión elegida por el jugador|[Captura](1365x768/death-sucesion.png)|[Captura](852x393/death-sucesion.png)|
|Derrota por tiempo|[Captura](1365x768/time-fin-partida.png)|[Captura](852x393/time-fin-partida.png)|
|Mordedura: retorno explícito a V9|[Captura](1365x768/bite-retorno.png)|[Captura](852x393/bite-retorno.png)|
|Fallecimientos después de resolver la mordedura|[Captura](1365x768/bite-fallecimiento.png)|[Captura](852x393/bite-fallecimiento.png)|
|Después de actuar la IA|[Captura](1365x768/ai-nueva-ronda.png)|[Captura](852x393/ai-nueva-ronda.png)|

Vídeos sin recortar ni acelerar; duración y hashes en [local escritorio](1365x768/video-local.json), [IA escritorio](1365x768/video-ai.json), [local móvil](852x393/video-local.json) e [IA móvil](852x393/video-ai.json). Las capturas y vídeos locales preceden a ajustes menores de texto y cierre de menús; el artifact del CI del SHA exacto contiene los recorridos de la entrega final.

**Escenarios controlados:** recursos, cartas, encrucijadas y posiciones particulares se preparan mediante instrumentación QA sobre el motor real. El cartel los identifica; no son una partida normal. El caso de IA ejecuta el agente original, con una reserva acotada y sus pausas nativas acortadas mediante el control existente. Se comprueban cambios reales, no una reproducción de resultados simulados por la vista.

[684/684 pruebas](suite-684.txt), [18 dirigidas](dirigidas-18.txt), [HTML estable reproducible](check-html.txt), [mapa reproducible](check-mapa.txt), [diez recorridos del ciclo](ciclo.json), [regresión de inventario](inventario.json) y [regresión de acciones](acciones.json). Los JSON conservan rutas temporales originales; los vídeos para revisar están arriba y los originales en el artifact del CI.

Comparación con el motor sin instrumentación, con las mismas33 capacidades: estado, consecuencias y azar iguales en alimentación suficiente/insuficiente, residuos, crisis válida/excepcional/fallida, ruido, saturación de gasolinera/biblioteca, muertes, sucesión, nueva ronda y final. Se verifica que una derrota corta los pasos restantes, la IA no se repite, reiniciar durante su pausa invalida el trabajo anterior y revisar/confirmar el recibo no ejecuta reglas.

En escritorio: respuesta perdida al terminar turno, reconstrucción de WebGL/visor y reconexión del puerto durante una revisión pendiente, sin nuevos efectos/RNG y con cámara conservada. Ambos tamaños comprueban cancelación, aportes y cierres dobles, pase con manos/dados ocultos, continuidad de cámara/zoom, controles44px y control devuelto en ronda2.

[Regresiones conservadas](regresiones.json): revisión desactualizada al actuar tras aportar; panel de búsqueda ocultado indebidamente por la barrera del ciclo; línea base de cámara anterior al cambio de tamaño del cartel QA. Corregidas sin aumentar esperas, quitar aserciones ni cambiar tolerancias de cámara. [Auditoría de arte, geometría, capacidades, lockfile y referencia estable](auditoria.json): idénticos a la base.

Recuperación limitada a la instancia viva: reconstruir el visor/reconectar conserva resultado y partida; recargar el host completo requiere preparar otra. No hay guardado persistente nuevo. Node24.19.0/Chromium154/SwiftShader, tacto y DPR2 emulados; sin teléfono físico. Aceptación manual pendiente. CI y artifact del head exacto se registran en PR25; sin main, fusión o publicación.

[Rojo](mordedura-rojo.txt) y [verde](mordedura-verde.txt) de prioridad: V9 retiene las muertes mientras se resuelve la mordedura. Los dos recorridos añadidos verifican el retorno explícito, la elección manual original y la continuidad posterior en el mapa. El JSON de ciclo combina los ocho recorridos generales y estos dos casos posteriores a la corrección; el CI final repite los diez en una sola ejecución.
