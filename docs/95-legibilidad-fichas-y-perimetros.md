# 95 — Fichas, casillas visibles y perímetros

09/11/2026, America/Montevideo. Revisión visual solicitada por el creador tras probar94. Base remota/locale442f90, árbol limpio, CI42618164383 success comprobado; misma rama y PR25 draft. Sin AGENTS.md aplicable. La aprobación del fondo no implica aceptación de su distribución anterior.

## Ajuste

- Fichas exteriores30→42px fuente; colonia24→36px. Se ubican por encima de las localidades; colonia12 en una fila superior, conservando orden e identidad. No se dibujan dentro del patio. El enfoque incluye las fichas ampliadas.
- Cuatro apoyos posteriores de colonia pasan de y276–283 a316–317: próximos al tramo trasero del cerco, tres en el ala oeste y uno en el este para no apoyar cuerpos sobre el techo central/chimenea. Los lados se acercan también al cerco. Los delanteros conservan la mínima separación necesaria para que el cuerpo completo quede fuera de la valla.
- Se acercan apoyos de hospital, gasolinera, biblioteca, supermercado y comisaría a los frentes útiles. Escuela ya ocupa la franja inmediata frente a fachada. No se altera la escala de actores, las33 capacidades visuales ni los IDs/índices. El cuerpo de biblioteca impide aproximar más su tercera posición sin invadir un elemento de entrada: se conserva el margen necesario.
- Vacías ajenas más visibles incluso al alejarse: alfa base0,52 en lugar de0,10 y trazo0,95 en lugar de0,65, con halo existente y contorno continuo para no perderse entre segmentos. Selección y ocupación mantienen su jerarquía. Se habilita solo en el mapa horizontal; prototipos previos sin cambios de contraste.
- Se corrigen puntos de los marcos en aleros, chimeneas, equipos de cubierta y esquinas de las siete localidades. Contorno y clic siguen separados; colonia usa un área interior menor y su silueta detallada, evitando seleccionar el rectángulo de nieve detrás. La prueba del saliente hospitalario usa un punto de la silueta revisada, manteniendo la comprobación fuera del rectángulo interior.

## Verificación

No se modifica el fondo, motor, capacidades de partida, reglas, resultados o main. Se mantiene la discrepancia2/3 visual frente a4 del motor, con conteos/excedentes completos. Enfoques calculados con cuerpos, elipses y fichas ampliadas. Los sólidos de QA siguen el contorno revisado; no son colisiones ni nuevas reglas.

Primer ensayo rojo: un cuerpo de biblioteca invade entrada, una barricada trasera de colonia roza la silueta y la última ficha ampliada alcanza biblioteca. Se corrigen posiciones/geometría sin reducir actores ni tolerancias. La fila superior de colonia usa45px entre centros para dejar margen a las fichas36px. Los controles geométricos dirigidos pasan36/36. Suite644/644, oráculo40/40 y siete builds/checks aprobados. Confort Chromium3 tamaños aprobado. Composición Chromium final3 tamaños/21 enfoques/12 máximos/84 capturas/21 clics-taps aprobada. CI del nuevo head se registra en PR25 al concluir; no se atribuye el verde anterior a este nuevo trabajo.

Capturas y resultados: [evidencia95](evidencias/legibilidad-perimetros/README.md). Chromium/SwiftShader por software y móvil emulado. El trazado sigue siendo manual sobre un PNG: las capturas son para revisión del creador, no una certificación artística automática.

**Única siguiente tarea al terminar verificación:** revisión visual de fichas, vacías, proximidad de los actores y contornos. Sin fusión, publicación o cambios de main.
