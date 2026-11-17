# 18 — Tablero operativo (fuente única del próximo paso)

> **Cómo se usa este documento.** Arriba está solo lo vigente: dónde estamos, la única tarea siguiente, la cola ordenada y los hallazgos abiertos. Cada entrega actualiza estas secciones **reemplazando** su contenido, no agregando un bloque nuevo. El detalle de cada entrega va en su informe numerado y en el PR. Los bloques fechados anteriores al 16/11/2026 están en [18-historico-tablero.md](18-historico-tablero.md) y no se editan.

**Actualizado:** 17/11/2026 · **main:** `27ef968` (PR #32: laboratorio SP-04 integrado) · **Tag vigente:** `v0.10.0-mapa-horizontal` · **Ramas en revisión:** `feature/mapa-2x` (mapa en doble resolución, [112](112-mapa-doble-resolucion.md)) y `experiment/sp04-cuarta-corrida` (regla B, informe 111 en su rama)

## 1. Dónde estamos

| Hito o entrega | Estado | Referencia |
|---|---|---|
| 1 — Fidelidad aceptada y D1/D2 integradas | **Cerrado** (29/10) | [62](62-hitos-referencia-fiel-y-juego-propio.md), [71](71-integracion-main-y-cierre-d1-d2.md) |
| 2 — Referencia V9.9 modular preservada | **Cerrado** (29/10), tag `v0.9.9-referencia-modular`; sigue con su D6 de exposición | [72](72-preservacion-referencia-modular.md) |
| 3 — Identidad visual y mapa jugable | **Cerrado** (16/11), integrado en `main` (PR #25) y marcado con `v0.10.0-mapa-horizontal` | [75](75-plan-hito-3-identidad-visual.md), [99](99-experiencia-unificada-del-mapa.md), [100](100-avisos-y-zoom-nativo.md), [101](101-muerte-durante-accion-propia.md) |
| Mantenimiento: mapa como producto | **Integrado en `main`** (PR #26) | [103](103-consolidacion-mapa-producto.md) |
| D12 de exposición | **Integrado en `main`** (PR #27, 17/11) | [102](102-dado-exposicion-d12.md) |
| Mapa en doble resolución | **En revisión** (rama `feature/mapa-2x`): textura 3342×1882 (WebP, 1,1 MB) mostrada a la mitad sobre el mundo de 1671×941; zoom máximo 1,5; accesos y posiciones sin cambios | [112](112-mapa-doble-resolucion.md) |
| Singleplayer (SP-00 a SP-08) | **Diseño en papel.** Laboratorio SP-04 con tres corridas en `main` (106, 107, 110) y una cuarta en su rama (regla B); capítulo piloto «La última guardia» en ficha | [63](63-hoja-de-ruta-planificacion-singleplayer.md), [105](105-ficha-capitulo-la-ultima-guardia.md), [110](110-laboratorio-sp04-tercera-corrida.md) |

El mapa permite preparar, jugar y terminar una partida completa (humano + IA y dos jugadores locales) con un único motor. Vive en `app/mapa/` (`npm run dev:mapa` → `http://127.0.0.1:8779/app/mapa/`).

## 2. Próxima tarea única

**Revisar el mapa en doble resolución** ([112](112-mapa-doble-resolucion.md), PR en borrador hacia `main`): verlo en escritorio y en el teléfono, sobre todo a zoom máximo (150 %), y decidir el merge. Solo cambia la textura del fondo y el zoom máximo; el enfoque de localidad conserva su tope de antes. En paralelo sigue pendiente la decisión sobre la cuarta corrida del laboratorio (regla B, rama `experiment/sp04-cuarta-corrida`).

## 3. Cola ordenada

1. **Mapa 2× (112):** CI del PR → prueba del creador en escritorio y en el Samsung Galaxy A15 → decisión de merge (requiere indicación expresa).
2. **Decisión sobre la cuarta corrida** del laboratorio (regla B) y, si se pide, una quinta con «todos comen estén donde estén».
3. **Implementar «La última guardia»** como capítulo jugable, con la combinación que salga de 2.
4. **Rótulos de las localidades y dado centrado** (encargo listo; guía de estilo [109](109-guia-de-estilo.md)).
5. **Mejoras menores del mapa** que no afectan decisiones: hallazgos 4 y 5, y una batería de CI que juegue una partida entera con clics reales.
6. **Reservas del Hito 3:** Samsung Galaxy A15 físico y dos jugadores locales manuales.

## 4. Hallazgos abiertos

| # | Hallazgo | Estado | Próximo paso |
|---|---|---|---|
| 1 | Aviso de combate en fichas ajenas | **Implementado** en `985bdf1` | Confirmar jugando |
| 2 | Zoom máximo = tamaño del mapa | **Resuelto en rama** (`feature/mapa-2x`): textura 2× y zoom máximo 1,5 respecto del mundo | Probar en el teléfono que alcanza para tocar retratos y accesos, y la memoria de la textura (4096×2048) |
| 3 | Moverse/Buscar/Atacar poco visibles en móvil | **Corregido** (16/11, solo CSS móvil) | Ver en el teléfono cuando se pueda |
| 4 | Selector de localidad desincronizado | **Aceptado como menor** (16/11) | Mejoras menores |
| 5 | Aviso móvil tapa título y botones de la ficha ampliada durante 5 s | **Aceptado como menor** (16/11) | Mejoras menores |
| 6 | La partida se trababa si un superviviente moría en su propia acción | **Corregido** ([101](101-muerte-durante-accion-propia.md)) | Confirmado jugando (16/11) |
| 7 | D12 de exposición sin probar a mano | Integrado; baterías automáticas en tres tamaños | Partida manual y teléfono físico |
| 8 | Enfoque de localidad con el mapa 2× | **Conservado en 1** (`focusMaxZoom`): sin tope propio acercaba a 1,5 casi todas las localidades | Decidir si el enfoque también debe acercar más |

## 5. Verificación del mapa 2× (rama `feature/mapa-2x`)

- [x] Textura de 3342×1882 decodificada y mostrada a escala 0,5; mundo en 1671×941 (batería `check-map-2x-browser.mjs`).
- [x] Los 33 accesos, zombis, barricadas y retratos en las mismas posiciones de pantalla que en `main` a zoom de ajuste (1365×768, 852×393, 393×852).
- [x] Zoom máximo 1,5 con rótulo «150 %»; capturas a zoom máximo en 852×393 y 1365×768.
- [x] `check:build`, `test`, `check:mapa-build` y las baterías sin vídeo, en local.
- [ ] CI del PR en verde (incluye las baterías con vídeo y el artifact con las capturas).
- [ ] Revisión del creador en escritorio y en el Samsung Galaxy A15.
- [ ] Decisión de merge del creador.

## 6. Decisiones vigentes de mapa e interfaz

- Mapa invernal ilustrado, perspectiva oblicua 2.5D, cámara con desplazamiento y zoom; zombis a escala humana.
- Siete localidades; 33 accesos compartidos por zombis y barricadas (colonia 12, escuela 4, hospital 4, supermercado 4, comisaría 4, gasolinera 2, biblioteca 3). Las plazas de supervivientes son una capacidad distinta.
- Crisis y objetivo legibles sin abrir un modal. Menú: Inventario, Grupo y líderes, Registro, Ajustes, Ayuda, Nueva partida.
- Ficha contextual para la selección; las acciones con coste muestran el gasto antes de confirmar.
- Mordeduras, sucesión y pase privado conservan su atención; las acciones rutinarias informan sin pedir «Continuar».
- Resultado rutinario: aviso temporal único sobre el mapa y entrada en el Registro; cada ficha muestra su propio estado.
- Zoom máximo: 1,5 respecto del tamaño lógico del mundo (1671×941), con la textura 2× (en revisión, [112](112-mapa-doble-resolucion.md)); en `main`, 1 píxel de la ilustración por píxel CSS. El enfoque de localidad conserva su tope de 1.
- Un solo motor determina costes, tiradas y consecuencias; la interfaz solo presenta.
- Exposición del mapa: D12 uniforme 6/3/2/1, con símbolos; un resultado compartido entre efecto, animación, etiqueta y Registro. Los dados de acción y de riesgo de contagio conservan el D6. Rescate del médico pendiente de próximo encargo.
- Dispositivos de prueba: escritorio y Samsung Galaxy A15.
- Guía de estilo para arte, paleta, tipografía y escenas narrativas nuevas: [109](109-guia-de-estilo.md) (17/11). El mapa aprobado no se redibuja; su ajuste de color se evalúa aparte.

## 7. Reservas conocidas

- Lo móvil está validado solo con emulación de Chromium; falta el teléfono físico.
- Los presupuestos de rendimiento de [75 §7](75-plan-hito-3-identidad-visual.md) (60 fps en PC, 30 fps en el móvil mínimo) nunca se midieron.
- La resolución del arte (1671×941) limita el zoom útil en pantallas grandes; la textura 2× de [112](112-mapa-doble-resolucion.md) lo resuelve si se integra, a costa de una textura de 4096×2048 en GPU.
- El repositorio pesa unos 600 MB, de los cuales 543 MB son evidencia en `docs/evidencias/`.

## 8. Reglas de mantenimiento

- Una entrega actualiza las secciones 1 a 5 y, si cambia una decisión, la 6. No agrega bloques fechados.
- El informe numerado de la entrega guarda el detalle; el tablero solo enlaza.
- Las capturas y JSON de evidencia van al artifact del CI o al PR; al repositorio solo las capturas finales que se citan en un informe.
- Fusiones, tags y publicaciones requieren indicación expresa del creador.
