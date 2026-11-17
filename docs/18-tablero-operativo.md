# 18 — Tablero operativo (fuente única del próximo paso)

> **Cómo se usa este documento.** Arriba está solo lo vigente: dónde estamos, la única tarea siguiente, la cola ordenada y los hallazgos abiertos. Cada entrega actualiza estas secciones **reemplazando** su contenido, no agregando un bloque nuevo. El detalle de cada entrega va en su informe numerado y en el PR. Los bloques fechados anteriores al 16/11/2026 están en [18-historico-tablero.md](18-historico-tablero.md) y no se editan.

**Actualizado:** 17/11/2026 · **main:** `f6a57d2` (PR #26 integrado: el mapa vive en `app/mapa/`) · **Tag vigente:** `v0.10.0-mapa-horizontal` · **Rama en revisión:** `feature/dado-exposicion-d12` ([PR #27](https://github.com/LeviEdition/invierno-en-la-colonia/pull/27), borrador), ya adaptada a `app/mapa/` · **Último cambio de regla aceptado:** [D12 de exposición](102-dado-exposicion-d12.md)

## 1. Dónde estamos

| Hito o entrega | Estado | Referencia |
|---|---|---|
| 1 — Fidelidad aceptada y D1/D2 integradas | **Cerrado** (29/10) | [62](62-hitos-referencia-fiel-y-juego-propio.md), [71](71-integracion-main-y-cierre-d1-d2.md) |
| 2 — Referencia V9.9 modular preservada | **Cerrado** (29/10), tag `v0.9.9-referencia-modular`; sigue con su D6 de exposición | [72](72-preservacion-referencia-modular.md) |
| 3 — Identidad visual y mapa jugable | **Cerrado** (16/11), integrado en `main` (PR #25) y marcado con `v0.10.0-mapa-horizontal` | [75](75-plan-hito-3-identidad-visual.md), [99](99-experiencia-unificada-del-mapa.md), [100](100-avisos-y-zoom-nativo.md), [101](101-muerte-durante-accion-propia.md) |
| Mantenimiento: mapa como producto | **Integrado en `main`** (PR #26): `app/mapa/`, `npm run dev:mapa`, prototipos retirados | [103](103-consolidacion-mapa-producto.md) |
| D12 de exposición | **Integrado en `main`** (PR #27, 17/11), aprobado por el creador jugando: 6 sin efecto, 3 heridas, 2 congelaciones, 1 mordedura en movimiento y combate del mapa | [102](102-dado-exposicion-d12.md) |
| Singleplayer (SP-00 a SP-08) | **Diseño en papel.** Laboratorio SP-04 entregado en su rama; capítulo piloto «La última guardia» en ficha, con propuesta de mejoras y cronología pendiente de aprobación | [63](63-hoja-de-ruta-planificacion-singleplayer.md), [104](104-informe-avances-singleplayer.md), [105](105-ficha-capitulo-la-ultima-guardia.md) |

El mapa permite preparar, jugar y terminar una partida completa (humano + IA y dos jugadores locales) con un único motor. Vive en `app/mapa/` (`npm run dev:mapa` → `http://127.0.0.1:8779/app/mapa/`). Movimiento y combate comparten una única tirada D12 por exposición; los dados de acción y el riesgo de contagio siguen en D6.

## 2. Próxima tarea única

**SP-04, segunda corrida del laboratorio** (cola 1). El diseño en papel de «La última guardia» quedó decidido el 17/11 ([105 §10](105-ficha-capitulo-la-ultima-guardia.md): M1, M3–M7 adoptadas, M2 no); el médico conoce el apellido «Varela» por ser colega de Elena.

## 3. Cola ordenada

1. **SP-04, segunda corrida del laboratorio** sobre `main` con el D12: indefensos fijos, comida inicial (6/3/0), crisis agravada, costo de muerte para la colonia (moral −1/−2 por superviviente; equipo perdido o que queda donde murió) y objetivos de 6, 8 y 10 rondas, con las políticas cooperativa y objetivo; repetir el barrido de dados; variante del rescate del médico con y sin la alternativa A ([105 §5](105-ficha-capitulo-la-ultima-guardia.md)). Su informe se renumera al integrarse (el 102 es del D12).
2. **Implementar «La última guardia»** como capítulo jugable, después de 1. Reutiliza la tirada D12 y su resultado estructurado.
3. **Mejoras menores del mapa** que no afectan decisiones: hallazgos 4 y 5, y una batería de CI que juegue una partida entera con clics reales.
4. **Reservas del Hito 3:** Samsung Galaxy A15 físico y dos jugadores locales manuales.

## 4. Hallazgos abiertos

| # | Hallazgo | Estado | Próximo paso |
|---|---|---|---|
| 1 | Aviso de combate en fichas ajenas | **Implementado** en `985bdf1`, CI verde en `179653c`; capturas correctas (Leo congelación 1, Iris 0) | Confirmar jugando |
| 2 | Zoom máximo = tamaño del mapa | **Aceptado por ahora** (16/11): 1:1 sobre el fondo de 1671×941 | Revisar si en el teléfono alcanza para tocar retratos y accesos; arte de mayor resolución queda como deuda |
| 3 | Moverse/Buscar/Atacar poco visibles en móvil | **Corregido** (16/11, solo CSS móvil) | Ver en el teléfono cuando se pueda |
| 4 | Selector de localidad desincronizado | **Aceptado como menor** (16/11): no afecta decisiones | Mejoras menores |
| 5 | Aviso móvil tapa título y botones de la ficha ampliada durante 5 s | **Aceptado como menor** (16/11): el aviso caduca solo | Mejoras menores |
| 6 | La partida se trababa si un superviviente moría en su propia acción | **Corregido** ([101](101-muerte-durante-accion-propia.md)) | Confirmado jugando (16/11) |
| 7 | D12 de exposición sin probar a mano | Baterías automáticas en tres tamaños; falta partida manual y teléfono físico | Revisión del PR #27 |

## 5. Verificación y aceptación del D12 (PR #27)

- [x] Regla 6/3/2/1 con una sola muestra de azar por exposición; cara mostrada = cara registrada = efecto aplicado (pruebas unitarias y batería `check-exposure-d12-browser.mjs`).
- [x] Referencia V9.9 intacta: el build preservado mantiene su HTML y su D6.
- [x] Adaptado a `app/mapa/` sobre `main` `f6a57d2` (detalle en [102](102-dado-exposicion-d12.md)).
- [ ] CI del PR #27 en verde sobre el SHA adaptado.
- [ ] Movimiento y combate revisados jugando en escritorio.
- [ ] Samsung Galaxy A15 físico (reserva, como en el Hito 3).
- [ ] Decisión de merge del creador.

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
