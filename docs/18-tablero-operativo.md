# 18 — Tablero operativo (fuente única del próximo paso)

> **Cómo se usa este documento.** Arriba está solo lo vigente: dónde estamos, la única tarea siguiente, la cola ordenada y los hallazgos abiertos. Cada entrega actualiza estas secciones **reemplazando** su contenido, no agregando un bloque nuevo. El detalle de cada entrega va en su informe numerado y en el PR. Los bloques fechados anteriores al 16/11/2026 están en [18-historico-tablero.md](18-historico-tablero.md) y no se editan.

**Actualizado:** 16/11/2026 · **Rama de trabajo:** `experiment/mapa-horizontal-ambientacion-h3` · **PR:** [#25 (borrador)](https://github.com/LeviEdition/invierno-en-la-colonia/pull/25) · **Último cambio de producto:** corrección de muertes durante acciones ([101](101-muerte-durante-accion-propia.md)) · **main:** `826199d` (29/10/2026, sin cambios desde la preservación de la referencia)

## 1. Dónde estamos

| Hito | Estado | Referencia |
|---|---|---|
| 1 — Fidelidad aceptada y D1/D2 integradas | **Cerrado** (29/10) | [62](62-hitos-referencia-fiel-y-juego-propio.md), [71](71-integracion-main-y-cierre-d1-d2.md) |
| 2 — Referencia V9.9 modular preservada | **Cerrado** (29/10), tag `v0.9.9-referencia-modular` | [72](72-preservacion-referencia-modular.md) |
| 3 — Identidad visual y mapa jugable | **En aceptación.** H3.1–H3.5 cubiertos en la práctica por la migración al mapa horizontal; falta H3.6 (validación y cierre) | [75](75-plan-hito-3-identidad-visual.md), [99](99-experiencia-unificada-del-mapa.md), [100](100-avisos-y-zoom-nativo.md), [101](101-muerte-durante-accion-propia.md) |
| Singleplayer (SP-00 a SP-08) | **Diseño en papel.** La puerta técnica de [63 §7](63-hoja-de-ruta-planificacion-singleplayer.md) (D1/D2 + referencia preservada) ya está cumplida | [63](63-hoja-de-ruta-planificacion-singleplayer.md) |

El mapa permite preparar, jugar y terminar una partida completa (humano + IA y dos jugadores locales) con un único motor. La rama de trabajo acumula 87 commits sobre `main`, apilados sobre las ramas H3.2 a H3.4.4, ninguna integrada.

## 2. Próxima tarea única

**Cerrar el Hito 3**, autorizado por el creador el 16/11 con la lista de la sección 5 completa. Falta que el CI de la corrección de acciones móviles salga verde; después, PR único hacia `main` y tag. El creador ganó una partida completa en escritorio con mordedura, muerte y sucesión, y aceptó el zoom 1:1 por ahora.

## 3. Cola ordenada

1. **Cierre del Hito 3** (autorizado por el creador el 16/11): CI verde → PR único de la pila H3 hacia `main` con merge convencional → cerrar los PR apilados → tag `v0.10.0-mapa-horizontal`.
2. **Mantenimiento antes de abrir el singleplayer** (propuesto, a decidir): consolidar el producto del mapa fuera de `prototypes/`, retirar prototipos intermedios conservándolos por tag, y sacar la evidencia pesada del repositorio.
3. **SP-03/SP-04:** primera pregunta, cuántas acciones y recursos necesita un solo grupo para que abastecer la colonia y avanzar el objetivo compitan entre sí. Laboratorio de simulación sobre el motor real (informe 102 previsto).
4. **Mejoras menores del mapa** que no afectan decisiones: hallazgos 4 y 5, y una batería de CI que juegue una partida entera desde el mapa con clics reales.

## 4. Hallazgos abiertos

| # | Hallazgo | Estado | Próximo paso |
|---|---|---|---|
| 1 | Aviso de combate en fichas ajenas | **Implementado** en `985bdf1`, CI verde en `179653c`; capturas correctas (Leo congelación 1, Iris 0) | Confirmar jugando |
| 2 | Zoom máximo = tamaño del mapa | **Aceptado por ahora** (16/11): 1:1 sobre el fondo de 1671×941 | Revisar si en el teléfono alcanza para tocar retratos y accesos; arte de mayor resolución queda como deuda |
| 3 | Moverse/Buscar/Atacar poco visibles en móvil | **Corregido** (16/11, solo CSS móvil): en la ficha del superviviente propio las acciones van primero y «Inventario y equipo» al final. La batería de cámara y avisos comprueba en 852×393 y 393×852 que la primera acción se ve sin desplazar la ficha | Ver en el teléfono cuando se pueda |
| 4 | Selector de localidad desincronizado | **Aceptado como menor** (16/11): no afecta decisiones | Después del cierre |
| 5 | Aviso móvil tapa título y botones de la ficha ampliada durante 5 s | **Aceptado como menor** (16/11): el aviso caduca solo | Después del cierre |
| 6 | La partida se trababa si un superviviente moría en su propia acción (panel vacío sobre «Fallecimientos») | **Corregido** ([101](101-muerte-durante-accion-propia.md)): el botón lleva a confirmar la muerte, al contagio o a la sucesión. Batería nueva en 1365×768 y 393×852 | Confirmado jugando (16/11) |

## 5. Lista de aceptación del Hito 3 (H3.6)

- [x] CI de `179653c` verde con las ocho baterías ([run 43862505431](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/43862505431)).
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
