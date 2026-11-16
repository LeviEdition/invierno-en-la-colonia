# Fondo aprobado — evidencia local

09/11/2026. [Informe94](../../94-integracion-fondo-aprobado.md). Las capturas representan el fondo original1671×941 y la misma vista de producto, con proyecciones QA aisladas para máximos. No son preparaciones de partida ni aprobación artística. Escritorio1365×768/DPR1; horizontal852×393/DPR2/tacto emulado. Chromium154/SwiftShader por software.

- [General escritorio](1365x768/general.png) · [general móvil](852x393/general.png).
- [Colonia12 zombis](1365x768/max-zombies-colonia.png) · [12 barricadas](1365x768/max-barricades-colonia.png) · [mixta móvil](852x393/max-mixed-colonia.png).
- [Escuela4 zombis](1365x768/max-zombies-escuela.png) · [4 barricadas](1365x768/max-barricades-escuela.png) · [mixta móvil](852x393/max-mixed-escuela.png).
- Los siete enfoques normales están en ambas carpetas, incluyendo hospital y supermercado completos.
- [Composición](composicion.json):3 tamaños(1365/1920/852),21 enfoques normales,12 escenarios máximos y84 capturas máximas generadas. Se conservan aquí los ejemplos anteriores; CI conserva la batería completa en su artifact.66 volúmenes alternativos, cuerpos separados y sin sólidos,33 exteriores compartidos; máximo33Z/33B y mixto17Z+16B, incluidos biblioteca2Z+1B enteros.36 supervivientes según motor, identidad/retratos estables.
- [Confort](confort.json): panel310px, zoom/ancla reversibles, resize/backing/DPR juntos, selección, cancelación y filtros en tres tamaños.
- [Suite644](suite-644.txt), conservando [suite643 previa](suite-643.txt) · [oráculo40](oraculo-40.txt) · [HTML reproducible](check-build.txt).
- [Reproducciones](reproducciones): centro de escuela fuera de general móvil antes de ajustar el ancla; ancla de prueba del ancho anterior; reset del arnés antes de cambiar viewport. Este último compara cámaras de dos tamaños distintos: se corrige el orden del arnés(reset después del resize), sin reducir la igualdad exigida para el mismo viewport.

`manifest.json` enumera bytes/SHA de la evidencia inicial. [Acciones reales](acciones.json): escritorio y horizontal; movimiento, búsqueda, ataque/exposición y barricadas, cancelación sin efectos y ejecución única. [Escena6 tamaños/42 consultas](escena.json), [movimiento4](movimiento.json), [bordes13](bordes.json), [cámara9](camara.json) y [excedentes36Z](excedentes.json) aprobados localmente. Tres regresiones nuevas en644 incluyen selección de apoyos/cuerpos: [rojo](reproducciones/casilla-no-seleccionable-rojo.txt) y [verde](casillas-seleccionables-verde.txt). Se repite composición con clic/tap y CI sobre el head final. No se reutiliza el alfa de árboles del fondo anterior: su prueba no representa este nuevo PNGRGB con vegetación integrada; se usan sólidos manuales, volúmenes, separación y revisión de capturas.
