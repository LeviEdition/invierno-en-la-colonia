# 18 — Tablero operativo (fuente única del próximo paso)

> **Cómo se usa este documento.** Arriba está solo lo vigente: dónde estamos, la única tarea siguiente, la cola ordenada y los hallazgos abiertos. Cada entrega actualiza estas secciones **reemplazando** su contenido, no agregando un bloque nuevo. El detalle de cada entrega va en su informe numerado y en el PR. Los bloques fechados anteriores al 16/11/2026 están en [18-historico-tablero.md](18-historico-tablero.md) y no se editan.

**Actualizado:** 17/11/2026 · **main:** `27ef968` (PR #32: laboratorio SP-04 integrado) · **Tag vigente:** `v0.10.0-mapa-horizontal` · **Ramas en revisión:** `feature/mapa-2x` ([112](112-mapa-doble-resolucion.md)) y `experiment/sp04-noche` (quinta corrida, noche fuera de la colonia, [113](113-laboratorio-sp04-quinta-corrida.md))

## 1. Dónde estamos

| Hito o entrega | Estado | Referencia |
|---|---|---|
| 1 — Fidelidad aceptada y D1/D2 integradas | **Cerrado** (29/10) | [62](62-hitos-referencia-fiel-y-juego-propio.md), [71](71-integracion-main-y-cierre-d1-d2.md) |
| 2 — Referencia V9.9 modular preservada | **Cerrado** (29/10), tag `v0.9.9-referencia-modular`; sigue con su D6 de exposición | [72](72-preservacion-referencia-modular.md) |
| 3 — Identidad visual y mapa jugable | **Cerrado** (16/11), integrado en `main` (PR #25) y marcado con `v0.10.0-mapa-horizontal` | [75](75-plan-hito-3-identidad-visual.md), [99](99-experiencia-unificada-del-mapa.md), [100](100-avisos-y-zoom-nativo.md), [101](101-muerte-durante-accion-propia.md) |
| Mantenimiento: mapa como producto | **Integrado en `main`** (PR #26): `app/mapa/`, `npm run dev:mapa`, prototipos retirados | [103](103-consolidacion-mapa-producto.md) |
| D12 de exposición | **Integrado en `main`** (PR #27, 17/11), aprobado por el creador jugando: 6 sin efecto, 3 heridas, 2 congelaciones, 1 mordedura en movimiento y combate del mapa | [102](102-dado-exposicion-d12.md) |
| Singleplayer (SP-00 a SP-08) | **Diseño en papel.** Laboratorio SP-04 con cuatro corridas en `main` (106, 107, 110) y en su rama (111); quinta corrida en `experiment/sp04-noche` ([113](113-laboratorio-sp04-quinta-corrida.md)); capítulo piloto «La última guardia» en ficha | [63](63-hoja-de-ruta-planificacion-singleplayer.md), [105](105-ficha-capitulo-la-ultima-guardia.md) |
| Mapa en doble resolución | **En revisión** (rama `feature/mapa-2x`): textura 3342×1882, zoom máximo 1,5 | [112](112-mapa-doble-resolucion.md) |

El mapa permite preparar, jugar y terminar una partida completa (humano + IA y dos jugadores locales) con un único motor. Vive en `app/mapa/` (`npm run dev:mapa` → `http://127.0.0.1:8779/app/mapa/`). Movimiento y combate comparten una única tirada D12 por exposición; los dados de acción y el riesgo de contagio siguen en D6.

## 2. Próxima tarea única

**Revisar el mapa en doble resolución** ([112](112-mapa-doble-resolucion.md)) y **decidir sobre la quinta corrida del laboratorio** ([113](113-laboratorio-sp04-quinta-corrida.md)). La quinta corrida muestra que la **noche/localidad + regreso** es el mecanismo más efectivo: la ventaja del corredor baja de +24,7 a +6,1 puntos (P1·comida8), pero la cooperativa cae a 29,6 % (por debajo del rango objetivo de 35–55 %). La propuesta de la corrida: medir noche/localidad con `comidaInicial = 10 ó 12` para volver a subir la cooperativa. Decisión pendiente del creador.

## 3. Cola ordenada

1. **Revisar mapa 2× (112):** CI del PR → prueba en escritorio y en el Samsung Galaxy A15 → decisión de merge (requiere indicación expresa).
2. **Decisión sobre la quinta corrida del laboratorio (113):** noche/localidad funciona bien pero necesita ajuste de comida; propuesta en §113.
3. **Sexta corrida del laboratorio (si se aprueba):** noche/localidad + comidaInicial 10 ó 12 para meter la cooperativa en el rango 35–55 %.
4. **Implementar «La última guardia»** como capítulo jugable, con la combinación que salga de 3.
5. **Rótulos de las localidades y dado centrado** (encargo listo; guía de estilo [109](109-guia-de-estilo.md)).
6. **Mejoras menores del mapa:** hallazgos 4 y 5, batería de CI con partida entera de clics reales.
7. **Reservas del Hito 3:** Samsung Galaxy A15 físico y dos jugadores locales manuales.

## 4. Hallazgos abiertos

| # | Hallazgo | Estado | Próximo paso |
|---|---|---|---|
| 1 | Aviso de combate en fichas ajenas | **Implementado** en `985bdf1` | Confirmar jugando |
| 2 | Zoom máximo = tamaño del mapa | **Resuelto en rama** (`feature/mapa-2x`): textura 2× y zoom máximo 1,5 | Probar en el teléfono y decidir merge |
| 3 | Moverse/Buscar/Atacar poco visibles en móvil | **Corregido** (16/11, solo CSS móvil) | Ver en el teléfono cuando se pueda |
| 4 | Selector de localidad desincronizado | **Aceptado como menor** (16/11) | Mejoras menores |
| 5 | Aviso móvil tapa título y botones de la ficha ampliada durante 5 s | **Aceptado como menor** (16/11) | Mejoras menores |
| 6 | La partida se trababa si un superviviente moría en su propia acción | **Corregido** ([101](101-muerte-durante-accion-propia.md)) | Confirmado jugando (16/11) |
| 7 | D12 de exposición sin probar a mano | Integrado en `main`; baterías automáticas en tres tamaños | Partida manual y teléfono físico |
| 8 | La cooperativa cae en noche/localidad aunque ya tiene mucha gente en casa | Observado en 113: probablemente el P1 tiene comida ajustada (6) y una muerte de noche basta para colapsar | Medir con comidaInicial 10 u 12 |

## 5. Verificación de la quinta corrida (rama `experiment/sp04-noche`)

- [x] 9 tests en verde (`sp04-quinta.test.mjs`): noche registrada, tiradas por localidad, regreso consume dado, objetivo nunca regresa, regla A cómputo correcto, reproducibilidad.
- [x] Sin palancas nuevas el resultado es idéntico a la cuarta corrida (calibración V9.9).
- [x] Simulación completa: 500 partidas × 10 celdas de variantes × 2 escenarios × 4 políticas = 160 celdas, ~77 s, 0 partidas incompletas.
- [x] `npm test` pendiente (se corre al final del encargo).
- [ ] CI del PR (incluye baterías sin vídeo).
- [ ] Decisión del creador sobre si avanzar con noche/localidad + más comida.

## 6. Decisiones vigentes de mapa e interfaz

- Mapa invernal ilustrado, perspectiva oblicua 2.5D, cámara con desplazamiento y zoom; zombis a escala humana.
- Siete localidades; 33 accesos compartidos por zombis y barricadas (colonia 12, escuela 4, hospital 4, supermercado 4, comisaría 4, gasolinera 2, biblioteca 3). Las plazas de supervivientes son una capacidad distinta.
- Crisis y objetivo legibles sin abrir un modal. Menú: Inventario, Grupo y líderes, Registro, Ajustes, Ayuda, Nueva partida.
- Ficha contextual para la selección; las acciones con coste muestran el gasto antes de confirmar.
- Mordeduras, sucesión y pase privado conservan su atención; las acciones rutinarias informan sin pedir «Continuar».
- Resultado rutinario: aviso temporal único sobre el mapa y entrada en el Registro; cada ficha muestra su propio estado.
- Zoom máximo: 1 píxel de la ilustración por píxel CSS.
- Un solo motor determina costes, tiradas y consecuencias; la interfaz solo presenta.
- Exposición del mapa: D12 uniforme 6/3/2/1, con símbolos; un resultado compartido entre efecto, animación, etiqueta y Registro. Los dados de acción y de riesgo de contagio conservan el D6. Rescate del médico pendiente de próximo encargo.
- Dispositivos de prueba: escritorio y Samsung Galaxy A15.
- Guía de estilo para arte, paleta, tipografía y escenas narrativas nuevas: [109](109-guia-de-estilo.md) (17/11). El mapa aprobado no se redibuja; su ajuste de color se evalúa aparte.

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
