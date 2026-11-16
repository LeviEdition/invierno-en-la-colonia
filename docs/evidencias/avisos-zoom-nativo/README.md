# Aviso temporal y zoom nativo

Aceptación local: **737/737**, ocho baterías aprobadas. [Resultados y hashes](verificacion-local.json), [cuatro tamaños, dieciséis acercamientos y seis ataques](aceptacion-local.json). La comprobación final del SHA remoto, CI y artifact completo se enlaza en [PR25](https://github.com/LeviEdition/invierno-en-la-colonia/pull/25). [Implementación y alcance](../../100-avisos-y-zoom-nativo.md).

La aceptación nueva usa Chromium con emulación táctil y DPR1/2. Inicia una partida real y prueba botón, rueda, teclado y pinza mediante CDP; después prepara explícitamente fixtures QA con Leo en Hospital, un dado6 y exposición2. No se presenta como una partida normal sin fixtures. El recorrido de experiencia separado sí usa el producto normal: seis casos, tres tamaños con movimiento habitual/reducido. Sin teléfono físico.

|Tamaño CSS|Aviso con Iris elegida durante la animación|Leo después de caducar|Iris después de caducar|
|---|---|---|---|
|1365×768|[Atacante Leo](1365x768/resultado-true.png)|[Congelación1](1365x768/ficha-h1-true.png)|[Congelación0](1365x768/ficha-h2-true.png)|
|852×393, DPR2|[Aviso sobre ficha expandida](852x393/resultado-true.png)|[Congelación1](852x393/ficha-h1-true.png)|[Congelación0](852x393/ficha-h2-true.png)|
|393×852, DPR2|[Atacante conservado](393x852/resultado-true.png)|[Congelación1](393x852/ficha-h1-true.png)|[Congelación0](393x852/ficha-h2-true.png)|

Las fichas largas se desplazan con su scroll real para mostrar el estado; las capturas conservan la imagen original del navegador. El aviso se lee en el mapa y caduca sin pulsar nada. Alternar Leo/Iris después de caducar no lo revive. Los seis ataques incrementan el Registro una vez cada uno y las consultas no alteran el estado ni el azar. [Registro tras el primer ataque](registro-primer-ataque.png): localidad, víctima en singular y cara de exposición. El segundo caso ejecuta otro ataque deliberado; su incremento1→2 no se trata como duplicación.

[Máximo100% y botón deshabilitado](hospital-maximo.png), [ventana2560×1440 con mapa nativo centrado](vista-general-nativa.png). Los cuatro métodos alcanzan zoom1 en los cuatro tamaños; las dimensiones originales son1671×941. La textura reserva2048×1024 para mipmaps: ese padding no forma parte de la ilustración ni de su tamaño dibujado. La prueba calcula el cociente CSS con el contenido original y la escala del renderer, independiente del DPR. El enfoque queda sujeto al mismo máximo; Vista general incluye los siete edificios completos. Abrir/cerrar ficha mantiene escala y solo ajusta los bordes. Redimensionar una ventana en Vista general vuelve a calcular el encuadre, con tope nativo.

Las siete regresiones previas conservan sus controles de costes, efectos únicos, estado, azar, privacidad, decisiones y recuperación: presentación2, capacidades4, inventario2, ciclo10, migración14, experiencia6 y acciones2. La nueva batería añade cuatro tamaños/seis ataques; el CI conserva las ocho y sus capturas e informes completos. Las pruebas de ficha que exigían mover el centro del mundo se sustituyen por una expectativa independiente de bordes, manteniendo las tolerancias anteriores. El arnés observa el nacimiento del aviso para evitar que una captura lenta o dos lecturas separadas confundan su caducidad con un resultado vacío.

Referencia HTML y PNG aprobados conservan sus hashes. Sin cambios de reglas, costes, IA, capacidades, posiciones o arte; sin main, fusión ni publicación. La revisión de comodidad queda en manos del creador.

Cierre posterior: [50 dirigidas](dirigidas-50.txt) y [escritorio con observación de fase/aviso y resize real](cierre-escritorio.json), aprobados. La telemetría registra el cambio a Iris durante `presenting`, el aviso después de la secuencia y su visibilidad sobre la ficha. El CI del SHA de entrega repite estos controles en los cuatro tamaños.
