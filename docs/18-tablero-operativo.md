# 18 — Tablero operativo (fuente única del próximo paso)

> Arriba está solo lo vigente. Cada entrega reemplaza las secciones1 a5; el detalle va en el informe numerado y el PR. El histórico anterior al16/11 sigue en [18-historico-tablero.md](18-historico-tablero.md).

**Actualizado:**16/11/2026, America/Montevideo · **Rama de esta entrega:** `feature/dado-exposicion-d12` · **Base remota verificada:** `main` en `a898a9a` (Hito3 integrado por PR25) · **Último cambio de producto:** [D12 de exposición](102-dado-exposicion-d12.md). Esta entrega no modifica `main`, no fusiona ni publica.

## 1. Dónde estamos

| Hito o entrega | Estado | Referencia |
|---|---|---|
| 1 — Fidelidad y D1/D2 | **Cerrado** (29/10) | [62](62-hitos-referencia-fiel-y-juego-propio.md), [71](71-integracion-main-y-cierre-d1-d2.md) |
| 2 — Referencia V9.9 modular | **Cerrado**, preservada con su comportamiento y HTML original | [72](72-preservacion-referencia-modular.md) |
| 3 — Mapa jugable | **Cerrado y aceptado** (16/11), integrado en `main` por PR25; se conservan las correcciones de muerte y ficha móvil | [99](99-experiencia-unificada-del-mapa.md), [100](100-avisos-y-zoom-nativo.md), [101](101-muerte-durante-accion-propia.md) |
| D12 de exposición | **Implementado en rama nueva:** movimiento y combate comparten tirada uniforme, dodecaedro con símbolos y registro del mismo resultado | [102](102-dado-exposicion-d12.md) |
| Singleplayer SP-00 aSP-08 | **Diseño en papel.** Puerta técnica cumplida | [63](63-hoja-de-ruta-planificacion-singleplayer.md) |

## 2. Próxima tarea única

**Revisar jugando el D12 en movimiento y combate.** El rescate del médico queda para el siguiente encargo y reutilizará esta tirada; no se implementa ni se inicia ahora.

## 3. Cola ordenada

1. Rescate del médico, cuando llegue su encargo: reutilizar la tirada/resultado D12.
2. SP-03/SP-04: laboratorio sobre acciones, recursos y competencia entre abastecer y avanzar el objetivo, pendiente de decisión del creador.
3. Mantenimiento propuesto: consolidar el producto fuera de `prototypes/` y retirar evidencia pesada del repositorio.
4. Mejoras menores del mapa (hallazgos4 y5) y recorrido completo de una partida con clics reales.
5. Reservas del Hito3: Samsung Galaxy A15 físico y dos jugadores locales manuales.

## 4. Hallazgos abiertos

| # | Hallazgo | Estado | Próximo paso |
|---|---|---|---|
| 1 | Aviso de combate en fichas ajenas | **Implementado** en `985bdf1`, CI verde en `179653c`; capturas correctas (Leo congelación 1, Iris 0) | Confirmar jugando |
| 2 | Zoom máximo = tamaño del mapa | **Aceptado por ahora** (16/11): 1:1 sobre el fondo de 1671×941 | Revisar si en el teléfono alcanza para tocar retratos y accesos; arte de mayor resolución queda como deuda |
| 3 | Moverse/Buscar/Atacar poco visibles en móvil | **Corregido** (16/11, solo CSS móvil): en la ficha del superviviente propio las acciones van primero y «Inventario y equipo» al final. La batería de cámara y avisos comprueba en 852×393 y 393×852 que la primera acción se ve sin desplazar la ficha | Ver en el teléfono cuando se pueda |
| 4 | Selector de localidad desincronizado | **Aceptado como menor** (16/11): no afecta decisiones | Después del cierre |
| 5 | Aviso móvil tapa título y botones de la ficha ampliada durante 5 s | **Aceptado como menor** (16/11): el aviso caduca solo | Después del cierre |
| 6 | La partida se trababa si un superviviente moría en su propia acción (panel vacío sobre «Fallecimientos») | **Corregido** ([101](101-muerte-durante-accion-propia.md)): el botón lleva a confirmar la muerte, al contagio o a la sucesión. Batería nueva en 1365×768 y 393×852 | Confirmado jugando (16/11) |
| 7 | Dado D12 de exposición | Implementado:6 caras lisas,3 heridas,2 congelaciones,1 mordedura; acción sigueD6 | Revisión manual en tablero/teléfono |

## 5. Verificación y aceptación

D12:769/769 pruebas locales, doce caras deterministas desde movimiento y combate, galería a82px,24 acciones de navegador en tres tamaños, regresiones de combate y ocho casos de muerte aprobados. El CI del SHA de entrega y su artifact se registran en el PR del encargo. Inspección de capturas realizada; falta jugarlo manualmente y probar el teléfono físico.

La aceptación del Hito3 se conserva (16/11):

- [x] CI verde con todas las baterías sobre `1bc5037` ([run 43876444225](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/43876444225)).
- [x] Partida completa humano + IA en escritorio (16/11, victoria).
- [x] Teléfono: aceptado por el creador el 16/11 sobre la base de la emulación y las baterías móviles; prueba física pendiente como reserva.
- [x] Dos jugadores locales: aceptado sobre las baterías automáticas de privacidad y pase; prueba manual pendiente como reserva.
- [x] Mordedura, muerte y sucesión reales durante una partida (16/11, escritorio).
- [x] Desde el mapa se entiende de quién es el turno, la crisis, el objetivo y las acciones (partida ganada en escritorio, 16/11).
- [x] Ninguna acción repetida: cubierto por las baterías y sin casos en la partida manual.
- [x] Hallazgos 3 y 6 corregidos; 4 y 5 aceptados como mejoras menores posteriores.
- [x] Decisión sobre el zoom 1:1: aceptado por ahora (16/11).

## 6. Decisiones vigentes de mapa e interfaz

- Mapa invernal ilustrado, perspectiva oblicua 2.5D, cámara con desplazamiento y zoom; zombis a escala humana.
- Siete localidades; 33 accesos compartidos por zombis y barricadas (colonia 12, escuela 4, hospital 4, supermercado 4, comisaría 4, gasolinera 2, biblioteca 3). Las plazas de supervivientes son una capacidad distinta.
- Crisis y objetivo legibles sin abrir un modal. Menú: Inventario, Grupo y líderes, Registro, Ajustes, Ayuda, Nueva partida.
- Ficha contextual para la selección; las acciones con coste muestran el gasto antes de confirmar.
- Mordeduras, sucesión y pase privado conservan su atención; las acciones rutinarias informan sin pedir «Continuar».
- Resultado rutinario: aviso temporal único sobre el mapa y entrada en el Registro; cada ficha muestra su propio estado.
- Zoom máximo: 1 píxel de la ilustración por píxel CSS.
- Un solo motor determina costes, tiradas y consecuencias; la interfaz solo presenta.
- Exposición del mapa: D12 uniforme6/3/2/1, con símbolos; un resultado compartido entre efecto, animación, etiqueta y Registro. Los dados de acción y de riesgo de contagio conservan el D6. Rescate del médico pendiente de próximo encargo.
- Dispositivos de prueba: escritorio y Samsung Galaxy A15.

## 7. Reservas conocidas

- Lo móvil está validado solo con emulación de Chromium; falta el teléfono físico.
- Los presupuestos de rendimiento de [75 §7](75-plan-hito-3-identidad-visual.md) (60 fps en PC, 30 fps en el móvil mínimo) nunca se midieron.
- La resolución del arte (1671×941) limita el zoom útil en pantallas grandes.
- El repositorio pesa unos 600 MB, de los cuales 543 MB son evidencia en `docs/evidencias/`.

## 8. Reglas de mantenimiento

- Una entrega actualiza las secciones 1 a 5 y, si cambia una decisión, la 6. No agrega bloques fechados.
- El informe numerado de la entrega guarda el detalle; el tablero solo enlaza.
- Las capturas y JSON de evidencia van al artifact del CI o al PR; al repositorio solo las capturas finales que se citan en un informe.
- Fusiones, tags y publicaciones requieren indicación expresa del creador.
