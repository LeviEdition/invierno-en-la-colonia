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

**Prueba manual de aceptación del Hito 3 por el creador**, con la lista de la sección 5. Primero, repetir el caso de Mara (hallazgo 6), que trababa la partida y está corregido en [101](101-muerte-durante-accion-propia.md). El CI de `179653c` está verde con las ocho baterías ([run 43862505431](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/43862505431)); falta el CI de la corrección, con la batería nueva de muertes.

## 3. Cola ordenada

1. **Confirmar jugando la corrección de muertes durante acciones** (hallazgo 6): Mara sola, contagio y muerte del líder, en escritorio y en el teléfono.
2. **Acciones visibles en la ficha móvil** (hallazgo 3). Encargo pendiente de redactar tras la prueba manual.
3. **Correcciones que salgan de la prueba manual**, solo las que afecten decisiones de juego.
4. **Cierre del Hito 3:** aceptación del creador → PR único de la pila H3 hacia `main` → tag de versión del mapa. Requiere indicación expresa.
5. **Mantenimiento antes de abrir el singleplayer** (propuesto, a decidir): consolidar el producto del mapa fuera de `prototypes/`, retirar prototipos intermedios conservándolos por tag, y sacar la evidencia pesada del repositorio.
6. **SP-03/SP-04:** primera pregunta, cuántas acciones y recursos necesita un solo grupo para que abastecer la colonia y avanzar el objetivo compitan entre sí. Propuesta: responderla con simulaciones sobre el motor real.

## 4. Hallazgos abiertos

| # | Hallazgo | Estado | Próximo paso |
|---|---|---|---|
| 1 | Aviso de combate en fichas ajenas | **Implementado** en `985bdf1`, CI verde en `179653c`; capturas correctas (Leo congelación 1, Iris 0) | Confirmar jugando |
| 2 | Zoom máximo = tamaño del mapa | **Implementado** como 1:1 sobre el fondo de 1671×941 | Decidir si se acepta: en 2560×1440 no hay zoom y en 1365×768 hay un solo paso |
| 3 | Moverse/Buscar/Atacar poco visibles en móvil | **Abierto.** En 393×852 la ficha muestra selector, inventario, retrato, atributos y dados antes que las acciones | Confirmar con el teléfono y encargar |
| 4 | Selector de localidad desincronizado | **Por verificar.** La captura de zoom máximo dice "Hospital" con la vista centrada en la Colonia | Verificar en la prueba manual |
| 5 | Aviso móvil tapa título y botones de la ficha ampliada durante 5 s | **Por verificar** | Verificar en la prueba manual |
| 6 | La partida se trababa si un superviviente moría en su propia acción (panel vacío sobre «Fallecimientos») | **Corregido** ([101](101-muerte-durante-accion-propia.md)): el botón lleva a confirmar la muerte, al contagio o a la sucesión. Batería nueva en 1365×768 y 393×852 | Confirmar jugando; CI de la corrección pendiente |

## 5. Lista de aceptación del Hito 3 (H3.6)

- [x] CI de `179653c` verde con las ocho baterías ([run 43862505431](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/43862505431)).
- [ ] Partida completa humano + IA en escritorio.
- [ ] Partida completa humano + IA en el Samsung Galaxy A15.
- [ ] Partida de dos jugadores locales con pase de dispositivo, sin filtrar manos, dados ni registro.
- [ ] Mordedura, muerte y sucesión reales durante una partida, incluida la muerte del atacante en su propia acción (hallazgo 6).
- [ ] Desde el mapa se entiende de quién es el turno, qué pide la crisis, el objetivo y qué puede hacer el personaje seleccionado.
- [ ] Ninguna acción se repite por animación, doble toque o recuperación.
- [ ] Hallazgos 3 a 6 resueltos o aceptados.
- [ ] Decisión sobre el zoom 1:1.

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
