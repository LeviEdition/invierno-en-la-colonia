# Fichas sobre la localidad y casillas paralelas

13/11/2026. Corrección desde **449b43660818d04705f78aa39d31041831e9984b**, remoto/local comprobados sin avances; su CI42696632195 terminó success. Misma rama y PR25 en borrador contra H3.4.4. El nuevo pedido ubica las fichas **superpuestas a cada localidad**, reemplazando la disposición flotante al norte de la entrega anterior.

| Vista | Antes,449b436 | Después |
|---|---|---|
|Colonia con6 fichas|[Fuera del recinto](../pertenencia-y-vista-general/despues/colonia-6-foco.png)|[Dentro del patio](despues/colonia-6-foco.png)|
|Colonia con12 fichas|[Dos filas al norte](../pertenencia-y-vista-general/despues/colonia-12-foco.png)|[Fila centrada en el patio](despues/colonia-12-foco.png)|
|Escuela|[Fichas al norte](../pertenencia-y-vista-general/despues/max-zombies-escuela.png)|[Sobre edificio; casillas paralelas a fachada](despues/max-zombies-escuela.png)|
|Hospital|[Fichas al norte](../pertenencia-y-vista-general/despues/max-zombies-hospital.png)|[Sobre las alas; frente y lateral alineados](despues/max-zombies-hospital.png)|
|Supermercado|[Fichas al norte](../pertenencia-y-vista-general/despues/max-zombies-supermercado.png)|[Sobre estructura; dos pares paralelos al frente](despues/max-zombies-supermercado.png)|
|Gasolinera|[Fichas al norte](../pertenencia-y-vista-general/despues/max-zombies-gasolinera.png)|[Sobre edificio/cubierta; par alineado](despues/max-zombies-gasolinera.png)|
|Comisaría|[Fichas al norte](../pertenencia-y-vista-general/despues/max-zombies-comisaria.png)|[Sobre las alas; pares según cada zócalo](despues/max-zombies-comisaria.png)|

También: [colonia1](despues/colonia-1-foco.png), [biblioteca](despues/max-zombies-biblioteca.png), [vista general escritorio](despues/general-1365x768.png), [vista general móvil](despues/general-852x393.png) y [colonia12 móvil](despues/movil-colonia-12-foco.png).

Se conservan tamaños36/42px fuente, IDs, retratos, orden relativo y centrado según ocupación. Colonia usa una fila dentro del patio sin cubrir el portón; el rótulo queda en la cubierta. Las demás fichas cubren parte de su propio edificio conforme al pedido y evitan entradas, cruz, emblema, vehículos y surtidores. Las protecciones específicas están en `test-support/horizontal-portrait-protected.json`: sustituyen la exclusión anterior de toda la fachada propia. El archivo original de obstáculos permanece idéntico; sus exclusiones de otras localidades siguen comprobándose.

Las casillas mantienen orden, cantidad, escala y emplazamientos válidos. Cambia su pendiente y la rotación de sus elipses según los cantos trazados en `test-support/horizontal-alignment.json`. El lateral del hospital se alinea con el zócalo de esa ala. Las12 de colonia permanecen intactas. Un primer ajuste de escuela rozó el edificio con el cuerpo de su último zombi; se desplazó toda esa fila1,3px hacia fuera, sin modificar obstáculos ni tolerancias. La selección conserva44px CSS también sobre el edificio propio; los márgenes de fichas no capturan las casillas exteriores.

Validación final: [652/652 pruebas](suite-652.txt), [35 dirigidas](dirigidas-35.txt), [HTML reproducible](check-html.txt), [presentación Chromium](presentacion.json) y [recorrido de acciones](acciones.json). Escritorio1365×768 y móvil852×393: colonia1/6/12, máximos33Z/33B/17Z+16B con vecinos completos,66 clics/taps de casillas y14 de fichas superpuestas, panel, foco, pan/zoom, vista general completa y excedentes. El recorrido conserva movimiento, ataque/exposición, barricadas y búsqueda, sin doble ejecución ni alteraciones del estado/azar por presentación.

[Auditoría](auditoria.json): fondo aprobado, obstáculos originales, motor, recursos y lockfile sin cambios. Se mantienen33 exteriores visuales; gasolinera2/biblioteca3 frente a4/4 del motor, con excedentes explícitos. No cambia ninguna regla ni resultado. No se vuelven a ejecutar auditorías extensas de viento/rendimiento. Chromium154/Node24.19.0, SwiftShader, DPR1 escritorio y DPR2/tacto emulado móvil; sin teléfono físico. La aceptación visual queda pendiente. CI del nuevo SHA exacto y sus capturas completas se enlazan en PR25; sin cambios en main, fusión o publicación.

Para probar en VS Code: detener el servidor con Ctrl+C, actualizar esta rama con `git pull --ff-only origin experiment/mapa-horizontal-ambientacion-h3`, ejecutar `npm.cmd run dev:horizontal-map`, abrir http://127.0.0.1:8779/prototypes/horizontal-map/ y recargar con Ctrl+Shift+R.
