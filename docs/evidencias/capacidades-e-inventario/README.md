# Capacidades e inventario — evidencia

Distribución de de4d1c8 aceptada; misma rama/PR25 draft. Capacidades cerradas y verificadas en c1f2666 antes del inventario. [Informe y tabla completa de operaciones](../../96-capacidades-e-inventario.md).

| Vista | Escritorio1365×768 | Móvil852×393 emulado |
|---|---|---|
|Gasolinera saturada,1Z+1B/libres0|[Captura](1365x768/gasolinera-saturada.png)|[Captura](852x393/gasolinera-saturada.png)|
|Biblioteca saturada,2Z+1B/libres0|[Captura](1365x768/biblioteca-saturada.png)|[Captura](852x393/biblioteca-saturada.png)|
|Mano compartida e inventario|[Captura](1365x768/inventario.png)|[Captura](852x393/inventario.png)|
|Tratamiento: objetivo, efecto y coste|[Captura](1365x768/tratamiento-confirmar.png)|[Captura; scroll interno](852x393/tratamiento-confirmar.png)|
|Equipamiento confirmado|[Captura](1365x768/equipo-resultado.png)|[Captura](852x393/equipo-resultado.png)|
|Buscar→inventario→usar/equipar→buscar con modificador|[Vídeo MP4](1365x768/recorrido.mp4)|[Vídeo MP4](852x393/recorrido.mp4)|

Vídeos breves del recorrido completo, sin acelerar ni recortar; [duración y hash escritorio](1365x768/video.json) y [móvil](852x393/video.json). Las cartas/ubicaciones/herida/dado2 se preparan en el motor real mediante instrumentación exclusiva QA; el aviso del escenario controlado permanece visible. No representan una partida normal ni un teléfono físico. La prueba de respuesta perdida adicional se realiza en escritorio.

[Suite666/666](suite-666.txt), [capacidades655/655 antes de inventario](capacidades-655.txt), [once dirigidas de inventario](inventario-11.txt), [HTML estable reproducible](check-html.txt), [mapa reproducible](check-mapa.txt), [capacidades en Chromium](capacidades.json), [inventario en Chromium](inventario.json) y [regresión de acciones](acciones.json).

El recorrido nuevo verifica obtención de carta, identidad de copia, tratamiento real con descarte/residuo y sin dado, palanca equipada y búsqueda posterior exitosa con dado2/requisito2 frente a base3. Comprueba doble confirmación, cancelación con Escape sin cambios, objetivo inválido con confirmación impedida, recuperación sin reenvío, cámara/selección estables y controles44px. Los JSON de navegador conservan las rutas originales de los archivos temporales; los vídeos para revisión están arriba y los originales completos quedan en el artifact del CI.

[Regresión detectada y corregida](regresion-buscar-inventario.json): revisión del cliente anterior a reconocer el resultado de búsqueda; rechazo sin consumo. El recorrido final conserva ese paso, sin aumentar esperas ni quitar aserciones. [Auditoría](auditoria.json): PNG, HTML estable, lockfile y geometría aceptada idénticos; solo se retira del archivo geométrico la capacidad duplicada y se toma la configuración compartida.

Node24.19.0/Chromium154/SwiftShader, DPR1 escritorio y DPR2/tacto emulado móvil. Referencia, main y reglas fuera de las dos capacidades autorizadas conservadas. Aceptación manual del inventario pendiente; intercambios entre jugadores y decisiones generales continúan en V9.9. CI exacto y artifact se enlazan en PR25, sin fusión o publicación.
