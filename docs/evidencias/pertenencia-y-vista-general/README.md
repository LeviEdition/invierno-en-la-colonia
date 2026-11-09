# Pertenencia y vista general — comparación

09/11/2026, America/Montevideo. Antes:5f3e319, head remoto/local limpio y CI42622337005 success comprobados. Sin commits posteriores. Misma rama/PR25 draft; fondo, reglas, main y capacidades del motor conservados.

| Problema | Antes | Después |
|---|---|---|
|General móvil completa|[Recortada](antes/general-852x393.png)|[Con márgenes laterales](despues/general-852x393.png)|
|Seis fichas de colonia|[Fila cargada hacia escuela](antes/colonia-6-foco.png)|[Grupo centrado con rótulo](despues/colonia-6-foco.png)|
|Doce fichas y cuatro posteriores|[Fila ancha y reparto3+1](antes/colonia-12-foco.png)|[Dos filas y posteriores repartidas](despues/colonia-12-foco.png)|
|Supermercado|[Cuarta aislada; salientes imprecisos](antes/max-zombies-supermercado.png)|[Dos pares; cubierta/carritos trazados](despues/max-zombies-supermercado.png)|
|Gasolinera|[Apoyo sobre vegetación](antes/max-zombies-gasolinera.png)|[Par sobre nieve limpia](despues/max-zombies-gasolinera.png)|
|Comisaría|[Apoyo sobre arbusto](antes/max-zombies-comisaria.png)|[Pareja derecha desplazada a nieve](despues/max-zombies-comisaria.png)|
|Hospital/colonia simultáneos|[Cubiertas con saltos](antes/max-zombies-hospital.png)|[Techos revisados; lateral separado](despues/max-zombies-hospital.png)|
|Escuela/colonia simultáneas|[Chimeneas mal delimitadas](antes/max-zombies-escuela.png)|[Contorno revisado; cuatro en patio](despues/max-zombies-escuela.png)|

También: [colonia1](despues/colonia-1-foco.png), [12 en móvil](despues/movil-colonia-12-foco.png), [12 barricadas](despues/max-barricades-colonia.png), [mixto](despues/max-mixed-colonia.png), [excedente gasolinera](despues/movil-excedente-4.png) y [biblioteca](despues/movil-excedente-6.png).

Fichas36/42px fuente conservadas. Colonia centra cada fila según ocupación; conserva IDs, orden relativo y retratos. Solo recentra al cambiar ocupación; seleccionar o repetir estado no mueve fichas. El destino de llegada coincide con la distribución final. Las cuatro posteriores van en(624,315)/(765,302)/(895,301)/(1045,315), sin cuerpos sobre techo/chimenea. La vista general incluye el PNG completo; los enfoques, pan y zoom permiten jugar de cerca. Objetivos de fichas/casillas mantienen44px CSS con prioridad para lo dibujado y cercanía en márgenes superpuestos. Vacías visibles y selección con más grosor/contraste. El cartel QA ocupa una franja propia fuera del mapa.

Validación: [650/650](suite-650.txt), [42 dirigidas](dirigidas-42.txt), [HTML reproducible](check-html.txt), [Chromium1365×768/852×393](presentacion.json) y [recorrido de movimiento, ataque/exposición, barricada y búsqueda](acciones.json). En ambos tamaños: colonia1/6/12, máximos33Z/33B/17Z+16B con vecinos completos,66 clics/taps de casillas en total, seis aperturas/cierres de panel, pan/zoom/restablecer y caso de excedentes. Estado/azar sin mutación por presentación. El workflow se concentra en estos escenarios por el encargo de validación acotada.

[Auditoría de obstáculos y arte](obstaculos-y-arte.json): todos los obstáculos/exclusiones existentes intactos; solo se agregaron dos arbustos trazados sobre el PNG. Sus posiciones anteriores quedan rojas. No se ajustaron los polígonos para obtener verde.

[Un intento móvil](reproducciones/espera-movil.json) agotó la espera original de30s al finalizar movimiento durante ejecuciones concurrentes. El vídeo es parcial, sin duración declarada; [último fotograma decodificable](reproducciones/espera-ultimo-fotograma.png) en revelación5/sin daño. La causa no se determinó concluyentemente. La ejecución final de los mismos escenarios y límite pasó; no se aumentó la espera ni se omitieron aserciones. El arnés conserva ahora estado de presentación/captura si vuelve a fallar.

Chromium154, Node24.19.0, Playwright externo, SwiftShader por software. DPR1 escritorio y DPR2/tacto emulado móvil; sin teléfono físico. Aprobación técnica separada de aceptación visual: los trazados son manuales sobre el fondo aprobado. Revisar las comparaciones antes de aceptar; sin fusión ni publicación. CI del nuevo head se registra en PR25, separado del verde anterior.
