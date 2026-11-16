# 18 — Tablero operativo (fuente única del próximo paso)

> **Cómo se usa este documento.** Arriba está solo lo vigente: dónde estamos, la única tarea siguiente, la cola ordenada y los hallazgos abiertos. Cada entrega actualiza estas secciones **reemplazando** su contenido, no agregando un bloque nuevo. El detalle de cada entrega va en su informe numerado y en el PR. Los bloques fechados anteriores al 16/11/2026 están en [18-historico-tablero.md](18-historico-tablero.md) y no se editan.

**Actualizado:** 16/11/2026 · **Rama del Hito 3:** `experiment/mapa-horizontal-ambientacion-h3`, integrada en `main` por el [PR #25](https://github.com/LeviEdition/invierno-en-la-colonia/pull/25) · **Tag:** `v0.10.0-mapa-horizontal` · **Último cambio de producto:** corrección de muertes durante acciones ([101](101-muerte-durante-accion-propia.md)) · **main:** `826199d` (29/10/2026, sin cambios desde la preservación de la referencia)

## 1. Dónde estamos

| Hito | Estado | Referencia |
|---|---|---|
| 1 — Fidelidad aceptada y D1/D2 integradas | **Cerrado** (29/10) | [62](62-hitos-referencia-fiel-y-juego-propio.md), [71](71-integracion-main-y-cierre-d1-d2.md) |
| 2 — Referencia V9.9 modular preservada | **Cerrado** (29/10), tag `v0.9.9-referencia-modular` | [72](72-preservacion-referencia-modular.md) |
| 3 — Identidad visual y mapa jugable | **Cerrado** (16/11): aceptado por el creador, integrado en `main` y marcado con `v0.10.0-mapa-horizontal` | [75](75-plan-hito-3-identidad-visual.md), [99](99-experiencia-unificada-del-mapa.md), [100](100-avisos-y-zoom-nativo.md), [101](101-muerte-durante-accion-propia.md) |
| Singleplayer (SP-00 a SP-08) | **Diseño en papel; laboratorio SP-04 entregado** sobre el motor real, sin reglas aprobadas | [63](63-hoja-de-ruta-planificacion-singleplayer.md), [102](102-laboratorio-sp04-un-grupo.md) |

El mapa permite preparar, jugar y terminar una partida completa (humano + IA y dos jugadores locales) con un único motor. La pila de ramas H3.2 → mapa horizontal quedó integrada en `main`; los PR apilados #18 a #24 se cerraron como incluidos, y #16 y #20 se cerraron sin fusionar (experimentos superados, ramas conservadas).

## 2. Próxima tarea única

**Leer el informe [102](102-laboratorio-sp04-un-grupo.md) y decidir qué línea de balance se prueba primero** (dados, crisis, comida o reclutamiento), o pedir más corridas del laboratorio. El laboratorio SP-04 está en la rama `experiment/sp04-laboratorio-un-grupo` (`lab/sp04/`), reproduce cualquier cifra con `node lab/sp04/correr.mjs` y tiene la línea base de dos grupos calibrada comando por comando contra las partidas completas de C14. Ninguna regla queda aprobada.

## 3. Cola ordenada

1. **SP-04, decisión del creador** sobre el informe 102: qué parámetro se explora en profundidad y con qué política de jugador como referencia.
2. **SP-04, segunda vuelta** (si se pide): escenarios con reclutamiento buscable, objetivo fijo por semilla, políticas mixtas, y entrada de zombis independiente de la ocupación de la colonia.
3. **Mantenimiento** (propuesto, a decidir): consolidar el producto del mapa fuera de `prototypes/`, retirar prototipos intermedios conservándolos por tag, y sacar la evidencia pesada del repositorio.
4. **Mejoras menores del mapa** que no afectan decisiones: hallazgos 4 y 5, y una batería de CI que juegue una partida entera desde el mapa con clics reales.
5. **Reservas del Hito 3:** prueba física en el Samsung Galaxy A15 y prueba manual de dos jugadores locales cuando haya ocasión.

## 4. Hallazgos abiertos

| # | Hallazgo | Estado | Próximo paso |
|---|---|---|---|
| 1 | Aviso de combate en fichas ajenas | **Implementado** en `985bdf1`, CI verde en `179653c`; capturas correctas (Leo congelación 1, Iris 0) | Confirmar jugando |
| 2 | Zoom máximo = tamaño del mapa | **Aceptado por ahora** (16/11): 1:1 sobre el fondo de 1671×941 | Revisar si en el teléfono alcanza para tocar retratos y accesos; arte de mayor resolución queda como deuda |
| 3 | Moverse/Buscar/Atacar poco visibles en móvil | **Corregido** (16/11, solo CSS móvil): en la ficha del superviviente propio las acciones van primero y «Inventario y equipo» al final. La batería de cámara y avisos comprueba en 852×393 y 393×852 que la primera acción se ve sin desplazar la ficha | Ver en el teléfono cuando se pueda |
| 4 | Selector de localidad desincronizado | **Aceptado como menor** (16/11): no afecta decisiones | Después del cierre |
| 5 | Aviso móvil tapa título y botones de la ficha ampliada durante 5 s | **Aceptado como menor** (16/11): el aviso caduca solo | Después del cierre |
| 6 | La partida se trababa si un superviviente moría en su propia acción (panel vacío sobre «Fallecimientos») | **Corregido** ([101](101-muerte-durante-accion-propia.md)): el botón lleva a confirmar la muerte, al contagio o a la sucesión. Batería nueva en 1365×768 y 393×852 | Confirmado jugando (16/11) |

## 5. Lista de aceptación del Hito 3 (H3.6) — completa el 16/11

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
