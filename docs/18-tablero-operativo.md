# 18 — Tablero operativo (fuente única del próximo paso)

> **Cómo se usa este documento.** Arriba está solo lo vigente: dónde estamos, la única tarea siguiente, la cola ordenada y los hallazgos abiertos. Cada entrega actualiza estas secciones **reemplazando** su contenido, no agregando un bloque nuevo. El detalle de cada entrega va en su informe numerado y en el PR. Los bloques fechados anteriores al 16/11/2026 están en [18-historico-tablero.md](18-historico-tablero.md) y no se editan.

**Actualizado:** 23/11/2026 · **main:** `4d5f1a1` (PR #34 mapa 2×, #37 reglas de prueba, #36 limpieza de `node_modules`) · **Tag vigente:** `v0.10.0-mapa-horizontal` · **Rama en revisión:** `feature/interfaz-v2-sesion-1` ([119](119-interfaz-v2-sesion-1.md))

## 1. Dónde estamos

| Hito o entrega | Estado | Referencia |
|---|---|---|
| 1 — Fidelidad aceptada y D1/D2 integradas | **Cerrado** (29/10) | [62](62-hitos-referencia-fiel-y-juego-propio.md), [71](71-integracion-main-y-cierre-d1-d2.md) |
| 2 — Referencia V9.9 modular preservada | **Cerrado** (29/10), tag `v0.9.9-referencia-modular` | [72](72-preservacion-referencia-modular.md) |
| 3 — Identidad visual y mapa jugable | **Cerrado** (16/11), tag `v0.10.0-mapa-horizontal` | [75](75-plan-hito-3-identidad-visual.md), [99](99-experiencia-unificada-del-mapa.md) |
| Laboratorio SP-04 | **Cerrado** (17/11): la noche por localidad, el regreso con un dado y la crisis parcial; comida inicial a definir jugando | [111](111-laboratorio-sp04-cuarta-corrida.md), [115](115-laboratorio-sp04-septima-corrida.md) |
| Mapa en doble resolución | **Integrado en `main`** (PR #34): textura 3342×1882, zoom máximo y enfoque 1,5 | [112](112-mapa-doble-resolucion.md) |
| Reglas de prueba y modo «un grupo» | **Integrado en `main`** (PR #37), apagadas por defecto y disponibles con `?dev`. Falta probarlas jugando | [116](116-ficha-regla-la-noche.md), [117](117-reglas-de-prueba-y-un-grupo.md), [118](118-auditoria-datos-interfaz-v2.md) |
| Interfaz v2 — sesión 1 | **En revisión** (rama `feature/interfaz-v2-sesion-1`): mapa a pantalla completa con paneles flotantes, filtro frío, chapa, nieve y pinos, daño y ruido siempre visibles, tope de ruido desde el motor | [119](119-interfaz-v2-sesion-1.md), [109 §8](109-guia-de-estilo.md) |
| Singleplayer (SP-00 a SP-08) | **Diseño en papel**; capítulo piloto «La última guardia» en ficha | [63](63-hoja-de-ruta-planificacion-singleplayer.md), [105](105-ficha-capitulo-la-ultima-guardia.md) |

El mapa permite preparar, jugar y terminar una partida completa (contra la IA, dos jugadores locales y, con `?dev`, un grupo) con un único motor. Vive en `app/mapa/` (`npm run dev:mapa` → `http://127.0.0.1:8779/app/mapa/`).

## 2. Próxima tarea única

**Revisar la interfaz v2, sesión 1 ([119](119-interfaz-v2-sesion-1.md)).**

1. Abrir el PR borrador de `feature/interfaz-v2-sesion-1` y esperar los cuatro checks (pruebas, engine, browser, horizontal).
2. Lanzar una vez el recorrido completo: Actions → «Mapa — baterías de navegador» → Run workflow, con esa rama.
3. Jugar un rato en escritorio y en el A15 y decidir sobre:
   - la legibilidad de las marcas de daño a 11 px;
   - el ruido 0 sin dibujar;
   - cuánto mapa tapan las barras;
   - el filtro y los materiales en la pantalla real.

## 3. Cola ordenada

1. **Interfaz v2, sesión 2** ([109 §8](109-guia-de-estilo.md)):
   - recursos como chapas con ícono;
   - dados con puntos;
   - rótulos que aparecen con la interacción;
   - papel rasgado;
   - transiciones;
   - viñetas de encrucijadas;
   - tipografías de la guía incluidas en el repositorio.
2. **Probar jugando las reglas de prueba** ([117](117-reglas-de-prueba-y-un-grupo.md)) para fijar la comida inicial en 6 u 8 y la duda de la ficha [116](116-ficha-regla-la-noche.md).
3. **Implementar «La última guardia»** como capítulo jugable, con los valores que se fijen en 2.
4. **Mejoras menores del mapa:** hallazgos 4 y 5, batería de CI con partida entera de clics reales.
5. **Reservas del Hito 3:** Samsung Galaxy A15 físico y dos jugadores locales manuales.

## 4. Hallazgos abiertos

| # | Hallazgo | Estado | Próximo paso |
|---|---|---|---|
| 1 | Aviso de combate en fichas ajenas | **Implementado** en `985bdf1` | Confirmar jugando |
| 2 | Zoom máximo = tamaño del mapa | **Resuelto** en `main` (PR #34): textura 2× y zoom máximo 1,5 | Probar en el teléfono la memoria de la textura (4096×2048) |
| 3 | Moverse/Buscar/Atacar poco visibles en móvil | **Corregido** (16/11, solo CSS móvil) | Ver en el teléfono |
| 4 | Selector de localidad desincronizado | **Aceptado como menor** (16/11) | Mejoras menores |
| 5 | Aviso móvil tapa título y botones de la ficha ampliada durante 5 s | **Aceptado como menor** (16/11) | Revisar con la disposición v2 |
| 7 | D12 de exposición sin probar a mano | Integrado; baterías automáticas en tres tamaños | Partida manual y teléfono físico |
| 8 | Enfoque de localidad | **1,5** (17/11). Con v2, en el área libre de paneles ([119](119-interfaz-v2-sesion-1.md)) | Probar en escritorio y A15 |
| 9 | «Regresar a la colonia» cuenta como movimiento | **Resuelto** (18/11) | Confirmar jugando que el coste de un dado alcanza |
| 11 | Marcas de daño a 11 px, debajo del mínimo de 14 px de la guía | Decisión de la sesión para que quepan en fichas de 16 px en la vista general | Decisión del creador tras verlo en el A15 |
| 12 | Tipografías de la guía (Alegreya Sans, Bitter) no incluidas | Siguen las del sistema | Sesión 2 |
| 13 | En escritorio, con la ficha abierta, un acceso del supermercado queda bajo la ficha al enfocarlo | El borde del mapa no deja correr más la cámara; con la ficha cerrada no pasa | Ver jugando si molesta |
| 14 | El oráculo del motor (`test:poc`) no corre en Windows | El script crea un enlace simbólico (EPERM) | Lo corre el CI; revisar aparte si conviene una unión de directorio |

## 5. Verificación de la interfaz v2, sesión 1 (rama `feature/interfaz-v2-sesion-1`)

- [x] **881 pruebas, 0 fallos** (9 nuevas): contrato de proyección del ruido y su tope, privacidad en bloqueos, qué se dibuja con 0 y con valores, enfoque en el área libre, filtro frío y página.
- [x] Tope de ruido: una constante del motor usada en sus cuatro sitios, expuesta como `noiseLimit` y proyectada por localidad; mismo valor (4).
- [x] Filtro frío en un solo lugar, horneado en la textura del fondo; el canvas no se filtra entero y ningún archivo de arte cambió.
- [x] `check:build` y `check:mapa-build` en verde; HTML de referencia regenerado desde `src/`.
- [x] Dos capturas (852×393 y 1365×768) con marcas en su lugar, sin errores de página ni desplazamiento horizontal.
- [ ] **Oráculo del motor**: no corre localmente; job `engine` del CI.
- [ ] **Baterías de navegador**: no se corrieron localmente ni se modificaron; CI del PR y recorrido completo a mano una vez.
- [ ] Prueba jugando en escritorio y en el Samsung Galaxy A15.
- [ ] Decisión de merge del creador.


## 6. Decisiones vigentes de mapa e interfaz

- Mapa invernal ilustrado, perspectiva oblicua 2.5D, cámara con desplazamiento y zoom; zombis a escala humana.
- Siete localidades; 33 accesos compartidos por zombis y barricadas (colonia 12, escuela 4, hospital 4, supermercado 4, comisaría 4, gasolinera 2, biblioteca 3). Las plazas de supervivientes son una capacidad distinta.
- Crisis y objetivo legibles sin abrir un modal. Menú: Inventario, Grupo y líderes, Registro, Ajustes, Ayuda, Nueva partida.
- Ficha contextual para la selección; las acciones con coste muestran el gasto antes de confirmar.
- Mordeduras, sucesión y pase privado conservan su atención; las acciones rutinarias informan sin pedir «Continuar».
- Resultado rutinario: aviso temporal único sobre el mapa y entrada en el Registro; cada ficha muestra su propio estado.
- Zoom máximo: 1,5 respecto del tamaño lógico del mundo (1671×941), con la textura 2× ([112](112-mapa-doble-resolucion.md)). El enfoque de localidad llega a 1,5 y, con la interfaz v2, encuadra en el área libre de paneles.
- Un solo motor determina costes, tiradas y consecuencias; la interfaz solo presenta.
- Exposición del mapa: D12 uniforme 6/3/2/1, con símbolos; un resultado compartido entre efecto, animación, etiqueta y Registro. Los dados de acción y de riesgo de contagio conservan el D6. Rescate del médico pendiente de próximo encargo.
- Dispositivos de prueba: escritorio y Samsung Galaxy A15.
- Guía de estilo para arte, paleta, tipografía y escenas narrativas nuevas: [109](109-guia-de-estilo.md) (17/11). El mapa aprobado no se redibuja; el filtro frío aprobado (109 §8) se aplica en render.
- Interfaz v2 ([109 §8](109-guia-de-estilo.md)): teléfono horizontal como plataforma principal; mapa a pantalla completa con paneles flotantes; daño (♥, ❄) y ruido siempre visibles en el mapa ([119](119-interfaz-v2-sesion-1.md)).

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
