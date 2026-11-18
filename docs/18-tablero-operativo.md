# 18 — Tablero operativo (fuente única del próximo paso)

> **Cómo se usa este documento.** Arriba está solo lo vigente: dónde estamos, la única tarea siguiente, la cola ordenada y los hallazgos abiertos. Cada entrega actualiza estas secciones **reemplazando** su contenido, no agregando un bloque nuevo. El detalle de cada entrega va en su informe numerado y en el PR. Los bloques fechados anteriores al 16/11/2026 están en [18-historico-tablero.md](18-historico-tablero.md) y no se editan.

**Actualizado:** 18/11/2026 · **main:** `d872dcf` (PR #33 y #35: laboratorio SP-04 cerrado, corridas 4 a 7) · **Tag vigente:** `v0.10.0-mapa-horizontal` · **Ramas en revisión:** `feature/mapa-2x` ([112](112-mapa-doble-resolucion.md)) y `feature/reglas-de-prueba` ([116](116-ficha-regla-la-noche.md), [117](117-reglas-de-prueba-y-un-grupo.md))

## 1. Dónde estamos

| Hito o entrega | Estado | Referencia |
|---|---|---|
| 1 — Fidelidad aceptada y D1/D2 integradas | **Cerrado** (29/10) | [62](62-hitos-referencia-fiel-y-juego-propio.md), [71](71-integracion-main-y-cierre-d1-d2.md) |
| 2 — Referencia V9.9 modular preservada | **Cerrado** (29/10), tag `v0.9.9-referencia-modular`; sigue con su D6 de exposición | [72](72-preservacion-referencia-modular.md) |
| 3 — Identidad visual y mapa jugable | **Cerrado** (16/11), integrado en `main` (PR #25) y marcado con `v0.10.0-mapa-horizontal` | [75](75-plan-hito-3-identidad-visual.md), [99](99-experiencia-unificada-del-mapa.md), [100](100-avisos-y-zoom-nativo.md), [101](101-muerte-durante-accion-propia.md) |
| Mantenimiento: mapa como producto | **Integrado en `main`** (PR #26): `app/mapa/`, `npm run dev:mapa`, prototipos retirados | [103](103-consolidacion-mapa-producto.md) |
| D12 de exposición | **Integrado en `main`** (PR #27, 17/11), aprobado jugando | [102](102-dado-exposicion-d12.md) |
| Laboratorio SP-04 | **Cerrado** (17/11, PR #33 y #35). Conclusión aprobada por el creador: la noche por localidad, el regreso con un dado y el éxito parcial de la crisis; improvisar descartado; comida inicial a definir jugando | [111](111-laboratorio-sp04-cuarta-corrida.md), [113](113-laboratorio-sp04-quinta-corrida.md), [114](114-laboratorio-sp04-sexta-corrida.md), [115](115-laboratorio-sp04-septima-corrida.md) |
| Mapa en doble resolución | **En revisión** (rama `feature/mapa-2x`, PR #34): textura 3342×1882, zoom máximo 1,5, enfoque de localidad hasta 1,5 | [112](112-mapa-doble-resolucion.md) |
| Reglas de prueba y modo «un grupo» | **En revisión** (rama `feature/reglas-de-prueba`): comida inicial 6/8/10, «La noche», «Regresar a la colonia» y crisis parcial, todas apagadas por defecto, más el modo de un solo grupo. Falta probar jugando y el CI | [116](116-ficha-regla-la-noche.md), [117](117-reglas-de-prueba-y-un-grupo.md) |
| Singleplayer (SP-00 a SP-08) | **Diseño en papel**; capítulo piloto «La última guardia» en ficha. Las reglas que lo sostienen ya existen como opción de prueba | [63](63-hoja-de-ruta-planificacion-singleplayer.md), [105](105-ficha-capitulo-la-ultima-guardia.md) |

El mapa permite preparar, jugar y terminar una partida completa (humano + IA y dos jugadores locales) con un único motor. Vive en `app/mapa/` (`npm run dev:mapa` → `http://127.0.0.1:8779/app/mapa/`).

## 2. Próxima tarea única

**Probar jugando las reglas de prueba** ([117](117-reglas-de-prueba-y-un-grupo.md)) para **fijar la comida inicial en 6 u 8**. Abrir el juego con `?dev=1`, activar «La noche», «Regresar a la colonia» y la crisis parcial en el panel de partida nueva, y jugar en modo contra la IA y en «Un grupo (sin IA)». Lo que hay que sentir está en la ficha ([116](116-ficha-regla-la-noche.md)): si una tirada por localidad da la tensión justa y si regresar sin marcar al superviviente como movido se siente abusivo.

## 3. Cola ordenada

1. **Probar las reglas jugando (117):** fijar comida inicial y confirmar las dudas de la ficha ([116](116-ficha-regla-la-noche.md)). El CI del PR valida las baterías de navegador, que no se corrieron localmente.
2. **Mapa 2× (112):** prueba del creador en escritorio y en el A15 → decisión de merge (requiere indicación expresa).
3. **Interfaz v2** (rama `feature/interfaz-v2`; decisiones en [109 §8](109-guia-de-estilo.md)), sobre el mapa 2× ya integrado.
4. **Implementar «La última guardia»** como capítulo jugable, con los valores que se fijen en 1.
5. **Llevar el modo «un grupo» al mapa:** hoy se elige desde la pantalla del motor; el visor sigue ofreciendo los dos modos actuales.
6. **Mejoras menores del mapa:** hallazgos 4 y 5, batería de CI con partida entera de clics reales.
7. **Reservas del Hito 3:** Samsung Galaxy A15 físico y dos jugadores locales manuales.

## 4. Hallazgos abiertos

| # | Hallazgo | Estado | Próximo paso |
|---|---|---|---|
| 1 | Aviso de combate en fichas ajenas | **Implementado** en `985bdf1` | Confirmar jugando |
| 2 | Zoom máximo = tamaño del mapa | **Resuelto en rama** (`feature/mapa-2x`): textura 2× y zoom máximo 1,5 | Probar en el teléfono que alcanza para tocar retratos y accesos, y la memoria de la textura (4096×2048) |
| 3 | Moverse/Buscar/Atacar poco visibles en móvil | **Corregido** (16/11, solo CSS móvil) | Ver en el teléfono cuando se pueda |
| 4 | Selector de localidad desincronizado | **Aceptado como menor** (16/11) | Mejoras menores |
| 5 | Aviso móvil tapa título y botones de la ficha ampliada durante 5 s | **Aceptado como menor** (16/11) | Mejoras menores |
| 6 | La partida se trababa si un superviviente moría en su propia acción | **Corregido** ([101](101-muerte-durante-accion-propia.md)) | Confirmado jugando (16/11) |
| 7 | D12 de exposición sin probar a mano | Integrado en `main`; baterías automáticas en tres tamaños | Partida manual y teléfono físico |
| 8 | Enfoque de localidad con el mapa 2× | **1,5** (`focusMaxZoom`), decisión del creador 17/11: centrar y acercar un poco más | Probar en escritorio y A15 |
| 9 | «Regresar a la colonia» no marca al superviviente como movido | **Decidido así** (18/11): es una acción con dado, no un movimiento; el dado que cuesta ya limita el ir y venir | Confirmar jugando que no se siente abusivo ([116](116-ficha-regla-la-noche.md)) |
| 10 | `node_modules` está versionado como enlace simbólico | Detectado 18/11: `npm ci` lo reemplaza por un directorio y aparece como borrado en `git status`; no se incluyó en ningún commit | Revisar aparte si debe dejar de estar versionado |

## 5. Verificación de las reglas de prueba y el modo «un grupo» (rama `feature/reglas-de-prueba`)

- [x] 45 pruebas unitarias nuevas del motor (31 de reglas, 14 del modo); **838 en total, 0 fallos**.
- [x] Con todo apagado, una partida con semilla fija es idéntica; los modos contra la IA y dos jugadores locales conservan grupo, mano, dados y líder de la IA.
- [x] La noche: una tirada por localidad exterior ocupada, nunca en la colonia ni por el grupo de la IA; menor influencia con empate por orden del grupo; las cuatro caras del D12; no existe en dos jugadores locales.
- [x] Mordedura nocturna en el flujo normal de muerte y sucesión; con acompañantes deja la decisión abierta y corta la noche.
- [x] Regresar cuesta un dado de cualquier valor, no tira exposición y **no consume azar**; el movimiento normal no cambia.
- [x] Crisis parcial en sus cuatro consecuencias; apagada, media crisis sigue fallando entera.
- [x] Un grupo: dos rondas pasan del turno del jugador a la colonia sin turno de la IA ni avisos que la mencionen; semilla fija, partida idéntica.
- [x] `check:build` y `check:mapa-build` en verde; HTML regenerado desde `src/`.
- [ ] **Batería de navegador nueva (`check-reglas-de-prueba-browser.mjs`): no se corrió localmente** (sin Chromium en el entorno). El CI del PR es la fuente de verdad.
- [ ] Prueba jugando en escritorio y en el Samsung Galaxy A15; comida inicial a fijar.
- [ ] Decisión de merge del creador.


## 6. Decisiones vigentes de mapa e interfaz

- Mapa invernal ilustrado, perspectiva oblicua 2.5D, cámara con desplazamiento y zoom; zombis a escala humana.
- Siete localidades; 33 accesos compartidos por zombis y barricadas (colonia 12, escuela 4, hospital 4, supermercado 4, comisaría 4, gasolinera 2, biblioteca 3). Las plazas de supervivientes son una capacidad distinta.
- Crisis y objetivo legibles sin abrir un modal. Menú: Inventario, Grupo y líderes, Registro, Ajustes, Ayuda, Nueva partida.
- Ficha contextual para la selección; las acciones con coste muestran el gasto antes de confirmar.
- Mordeduras, sucesión y pase privado conservan su atención; las acciones rutinarias informan sin pedir «Continuar».
- Resultado rutinario: aviso temporal único sobre el mapa y entrada en el Registro; cada ficha muestra su propio estado.
- Zoom máximo: 1,5 respecto del tamaño lógico del mundo (1671×941), con la textura 2× (en revisión, [112](112-mapa-doble-resolucion.md)); en `main`, 1 píxel de la ilustración por píxel CSS. El enfoque de localidad llega a 1,5.
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
