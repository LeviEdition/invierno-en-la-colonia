# 18 — Tablero operativo (fuente única del próximo paso)

> **Cómo se usa este documento.** Arriba está solo lo vigente: dónde estamos, la única tarea siguiente, la cola ordenada y los hallazgos abiertos. Cada entrega actualiza estas secciones **reemplazando** su contenido, no agregando un bloque nuevo. El detalle de cada entrega va en su informe numerado y en el PR. Los bloques fechados anteriores al 16/11/2026 están en [18-historico-tablero.md](18-historico-tablero.md) y no se editan.

**Actualizado:** 26/11/2026 · **main:** `b78ba3b` (PR #44: interfaz v2, sesiones 1 a 7) · **Tag vigente:** `v0.10.0-mapa-horizontal` · **Rama en revisión:** `feature/interfaz-v2-sesion-8` (PR #45)

## 1. Dónde estamos

| Hito o entrega | Estado | Referencia |
|---|---|---|
| 1 — Fidelidad aceptada y D1/D2 integradas | **Cerrado** (29/10) | [62](62-hitos-referencia-fiel-y-juego-propio.md), [71](71-integracion-main-y-cierre-d1-d2.md) |
| 2 — Referencia V9.9 modular preservada | **Cerrado** (29/10), tag `v0.9.9-referencia-modular` | [72](72-preservacion-referencia-modular.md) |
| 3 — Identidad visual y mapa jugable | **Cerrado** (16/11), tag `v0.10.0-mapa-horizontal` | [75](75-plan-hito-3-identidad-visual.md), [99](99-experiencia-unificada-del-mapa.md) |
| Laboratorio SP-04 | **Cerrado** (17/11) | [111](111-laboratorio-sp04-cuarta-corrida.md), [115](115-laboratorio-sp04-septima-corrida.md) |
| Interfaz v2 — sesiones 1 a 7 | **Integradas en `main`** (#44, `b78ba3b`), con el plantel ajustado y las fichas del hito (#43) | [119](119-interfaz-v2-sesion-1.md)–[126](126-interfaz-v2-sesion-7.md), [124](124-fichas-hito-contenido.md) |
| Interfaz v2 — sesión 8 | **En revisión** (PR #45, borrador): «objetos a carbón» y D12 en 3D, más los ajustes de la revisión visual (barra, chapa galvanizada también en zoom y menú, botones apagados legibles y carta de búsqueda provisoria) | [127](127-interfaz-v2-sesion-8.md), [128](128-interfaz-v2-sesion-8-ajustes.md) |
| Singleplayer (SP-00 a SP-08) | **Diseño en papel**; capítulo piloto «La última guardia» en ficha | [63](63-hoja-de-ruta-planificacion-singleplayer.md), [105](105-ficha-capitulo-la-ultima-guardia.md) |

El mapa permite preparar, jugar y terminar una partida completa (contra la IA, dos jugadores locales y, con `?dev`, un grupo) con un único motor. Vive en `app/mapa/` (`npm run dev:mapa` → `http://127.0.0.1:8779/app/mapa/`).

## 2. Próxima tarea única

**Revisar en el PR #45 los ajustes de la sesión 8 ([128](128-interfaz-v2-sesion-8-ajustes.md)).**

1. Lanzar el recorrido completo por `workflow_dispatch` (con vídeo y Chromium en Linux), además del CI del PR.
2. Jugar en escritorio y decidir sobre la barra, la chapa con zoom y menú, los botones apagados y la carta de búsqueda.
3. Decidir el hallazgo 34 (cartas de búsqueda apiladas): corregirlo ensancha el papel de la búsqueda, sobre una manta ya aprobada.
4. Decidir si se fusiona con el hallazgo 33 abierto.

## 3. Ruta por pasos

Regla: **antes de cada fusión, el recorrido completo en verde** (hallazgo 28).

1. **Cerrado:** fusión de #43 y #44; recorrido completo en verde en `main`.
2. **En revisión:** interfaz v2, sesión 8: objetos a carbón y D12 en 3D ([127](127-interfaz-v2-sesion-8.md)) y sus ajustes ([128](128-interfaz-v2-sesion-8-ajustes.md)).
3. **Hito 1a:** plantel de 31; daño por un solo punto con límite por personaje; muerte −2; límite de equipo; 3 de 5; habilidades automáticas.
4. **Hitos 1b y 1c:** habilidades de botón y reacciones.
5. **Hito 2:** objetos, encuentros, muestras, inventario con ilustraciones y la carta al pasar el mouse.
6. **Sesión 9:** fin de ronda en el mapa.
7. **Laboratorio de balance.**
8. **«La última guardia»** como capítulo jugable.
9. **Calidad:** sonido, viento en los pinos, arte de encrucijadas y prueba en el Galaxy A15.

## 4. Hallazgos abiertos

| # | Hallazgo | Estado | Próximo paso |
|---|---|---|---|
| 33 | **`check-map-death-decisions` intermitente en la sesión 8** | A 393×852 al atacar, el clic en el dado no deja ninguno elegido: 2 fallas en las 4 corridas del informe 127 y 1 en las 5 de verificación del 128. Seis corridas de investigación (30 intentos) sin reproducirlo; descartados mapa oscurecido, adornos, D12, desplazamiento, animación, aviso de girar y freno del doble clic ([128](128-interfaz-v2-sesion-8-ajustes.md)) | Si vuelve en el CI, registrar los eventos de esa corrida: queda sin descartar una actualización tardía del estado o un escucha global que coma el clic |
| 34 | Cartas de búsqueda apiladas | Desde la sesión 8, dos o tres cartas quedan en columna y la segunda se corta (436 px útiles, hacen falta 456) ([128](128-interfaz-v2-sesion-8-ajustes.md)) | Decisión del creador: ensanchar el papel 24 px |
| 31 | Notas del mapa sin ancla y aviso de herida con otro estilo | Las notas a lápiz siguen arriba al centro; el aviso de herida sale como etiqueta oscura lisa sobre las polaroids | Anclarlas a la ficha y unificar el estilo |
| 35 | Expediente de localidad sin material propio | La pestaña Colonia sigue sin objeto asignado | Definir su material |
| 36 | Detalles de la dirección a carbón | Los botones apagados de los papeles centrales bajan la opacidad; el dado que no sirve se muestra al 35 %; con la crisis plegada, las cintas tapan parte del rótulo | Revisar juntos en el próximo ajuste visual |
| 32 | Ritmo del D12 3D con GPU real | Medido solo con SwiftShader (GPU emulada): 15 dibujos en 1,2 s y ninguno quieto ([127](127-interfaz-v2-sesion-8.md)) | Medir en escritorio con GPU y en el A15 |
| 29 | Mapa en teléfono vertical | En vertical sigue la pila anterior con «Girá el teléfono»; los materiales no se aplican ahí | Decidir si el vertical necesita disposición propia |

## 5. Verificación de la interfaz v2, sesión 8 (rama `feature/interfaz-v2-sesion-8`)

- [x] **990 pruebas, 0 fallos**: 6 nuevas en `interfaz-v2-sesion-8` (leen estilos y marcado).
- [x] `check:build` y `check:mapa-build` en verde; `src/` sin cambios.
- [x] Medido con Edge a 1365×768: contraste sobre los materiales reales de 4,5:1 o más en los rótulos medidos; «VÍVERES» sin superponerse a ningún control. A 852×393 sin desborde horizontal.
- [x] Local con Edge, sin vídeo: pasan sobre el estado final las diez baterías restantes del recorrido y `check-map-reglas-de-prueba`.
- [ ] `check-map-death-decisions`: 4 de 5 corridas en verde; **no se lograron las cinco seguidas** (hallazgo 33).
- [ ] CI: recorrido completo por `workflow_dispatch` y oráculo `test:poc` (EPERM en Windows).
- [ ] Ver jugando en escritorio y en el Galaxy A15; decisión de merge del creador.

## 6. Decisiones vigentes de mapa e interfaz

- Mapa invernal ilustrado, perspectiva oblicua 2.5D, cámara con desplazamiento y zoom; zombis a escala humana.
- Siete localidades; 33 accesos compartidos por zombis y barricadas (colonia 12, escuela 4, hospital 4, supermercado 4, comisaría 4, gasolinera 2, biblioteca 3). Las plazas de supervivientes son una capacidad distinta.
- Crisis y objetivo legibles sin abrir un modal. Menú: Inventario, Grupo y líderes, Ajustes, Ayuda y atajos, Nueva partida; el registro es una pestaña del legajo ([126](126-interfaz-v2-sesion-7.md)).
- Una sola barra para actuar y un expediente para leer ([126](126-interfaz-v2-sesion-7.md)): todas las acciones de turno salen de la barra (principales siempre visibles, el resto en «Más»); el expediente solo informa (más «Equipar» y «Dar a…») y se abre con el retrato o E. Las acciones con coste muestran el gasto antes de confirmar.
- Mordeduras, sucesión y pase privado conservan su atención; las acciones rutinarias informan sin pedir «Continuar».
- Resultado rutinario: aviso temporal único sobre el mapa y entrada en el Registro; cada ficha muestra su propio estado.
- Zoom máximo: 1,5 respecto del tamaño lógico del mundo (1671×941), con la textura 2× ([112](112-mapa-doble-resolucion.md)). El enfoque de localidad llega a 1,5 y, con la interfaz v2, encuadra en el área libre de paneles.
- Un solo motor determina costes, tiradas y consecuencias; la interfaz solo presenta.
- Exposición del mapa: D12 uniforme 6/3/2/1, con símbolos; un resultado compartido entre efecto, animación, etiqueta y Registro. Los dados de acción y de riesgo de contagio conservan el D6. Rescate del médico pendiente de próximo encargo.
- Dispositivos de prueba: escritorio y Samsung Galaxy A15.
- Guía de estilo para arte, paleta, tipografía y escenas narrativas nuevas: [109](109-guia-de-estilo.md) (17/11). El mapa aprobado no se redibuja; el filtro frío aprobado (109 §8) se aplica en render.
- Interfaz v2 ([109 §8](109-guia-de-estilo.md)): teléfono horizontal como plataforma principal; mapa a pantalla completa con paneles flotantes; daño (♥, ❄) y ruido siempre visibles en el mapa ([119](119-interfaz-v2-sesion-1.md)). Recursos como chapas con ícono, rótulos de localidad que aparecen con la interacción, papel rasgado, transiciones de 150–250 ms que nunca retrasan una acción y encrucijadas en viñeta con las consecuencias solo después de decidir ([120](120-interfaz-v2-sesion-2.md)).

- Objetos a carbón ([109 §8.1](109-guia-de-estilo.md), [128](128-interfaz-v2-sesion-8-ajustes.md)): recursos, zoom y menú en chapa galvanizada; botones de la barra en papel crema; el estado apagado se reconoce sin bajar la opacidad del texto.

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
