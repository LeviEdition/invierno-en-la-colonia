# 18 — Tablero operativo (fuente única del próximo paso)

> **Cómo se usa este documento.** Arriba está solo lo vigente: dónde estamos, la única tarea siguiente, la cola ordenada y los hallazgos abiertos. Cada entrega actualiza estas secciones **reemplazando** su contenido, no agregando un bloque nuevo. El detalle de cada entrega va en su informe numerado y en el PR. Los bloques fechados anteriores al 16/11/2026 están en [18-historico-tablero.md](18-historico-tablero.md) y no se editan.

**Actualizado:** 24/11/2026 · **main:** `4d5f1a1` (PR #34 mapa 2×, #37 reglas de prueba, #36 limpieza de `node_modules`) · **Tag vigente:** `v0.10.0-mapa-horizontal` · **Ramas en revisión, apiladas:** `feature/interfaz-v2-sesion-1` (PR #38, [119](119-interfaz-v2-sesion-1.md)) → `feature/interfaz-v2-sesion-2` (PR #39, [120](120-interfaz-v2-sesion-2.md)) → `feature/interfaz-v2-sesion-3` (PR #40, [121](121-interfaz-v2-sesion-3.md)) → `feature/interfaz-v2-sesion-4` ([122](122-interfaz-v2-sesion-4.md)) → `feature/interfaz-v2-sesion-5` ([123](123-interfaz-v2-sesion-5.md)) → `feature/interfaz-v2-sesion-6` ([125](125-interfaz-v2-sesion-6.md)) → `feature/interfaz-v2-sesion-7` ([126](126-interfaz-v2-sesion-7.md))

## 1. Dónde estamos

| Hito o entrega | Estado | Referencia |
|---|---|---|
| 1 — Fidelidad aceptada y D1/D2 integradas | **Cerrado** (29/10) | [62](62-hitos-referencia-fiel-y-juego-propio.md), [71](71-integracion-main-y-cierre-d1-d2.md) |
| 2 — Referencia V9.9 modular preservada | **Cerrado** (29/10), tag `v0.9.9-referencia-modular` | [72](72-preservacion-referencia-modular.md) |
| 3 — Identidad visual y mapa jugable | **Cerrado** (16/11), tag `v0.10.0-mapa-horizontal` | [75](75-plan-hito-3-identidad-visual.md), [99](99-experiencia-unificada-del-mapa.md) |
| Laboratorio SP-04 | **Cerrado** (17/11): la noche por localidad, el regreso con un dado y la crisis parcial; comida inicial a definir jugando | [111](111-laboratorio-sp04-cuarta-corrida.md), [115](115-laboratorio-sp04-septima-corrida.md) |
| Mapa en doble resolución | **Integrado en `main`** (PR #34) | [112](112-mapa-doble-resolucion.md) |
| Reglas de prueba y modo «un grupo» | **Integrado en `main`** (PR #37), apagadas por defecto y disponibles con `?dev`. Falta probarlas jugando | [116](116-ficha-regla-la-noche.md), [117](117-reglas-de-prueba-y-un-grupo.md), [118](118-auditoria-datos-interfaz-v2.md) |
| Interfaz v2 — sesión 1 | **En revisión** (PR #38, CI verde): mapa a pantalla completa, paneles flotantes, filtro frío, materiales, daño y ruido siempre visibles | [119](119-interfaz-v2-sesion-1.md) |
| Interfaz v2 — sesión 2 | **En revisión** (PR #39, borrador), partes A y B, foco en escritorio: recursos como chapas, rótulos que aparecen con la interacción, papel rasgado, transiciones, encrucijada en viñeta con consecuencias después de decidir, dados con puntos en todos los botones; marcas de daño ancladas a su ficha, margen de cámara con la ficha abierta, pino anclado y ficha que vuelve arriba | [120](120-interfaz-v2-sesion-2.md) |
| Interfaz v2 — sesión 3 | **En revisión** (PR #40), con ajustes: ventanas en el tono de la Lámpara; parpadeo errático con semilla, ahora siempre (de día tenue); noche más marcada mientras se presentan las tiradas nocturnas, con el D12 bajo la localidad que tira; marcas de daño en una fila | [121](121-interfaz-v2-sesion-3.md) |
| Interfaz v2 — sesión 5 | **En revisión** (rama `feature/interfaz-v2-sesion-5`): paneles plegables con «H», globos en las chapas, zoom que cubre el mapa, enfoque más cercano (tope 2), luces más notorias, tres contornos corregidos y Bitter y Alegreya Sans autoalojadas | [123](123-interfaz-v2-sesion-5.md) |
| Interfaz v2 — sesión 6 | **En revisión** (rama `feature/interfaz-v2-sesion-6`), con ajustes: los paneles se pliegan y despliegan tocándolos, sin pestañas con flecha, incluido el texto de las tarjetas y las chapas; el detalle de Objetivo y Crisis va en globos; tirada de dados de 1200 ms con freno y pausa final, que un toque adelanta | [125](125-interfaz-v2-sesion-6.md) |
| Interfaz v2 — sesión 7 | **En revisión** (rama `feature/interfaz-v2-sesion-7`), con ajustes. Base: la barra es el único lugar de acción, con abanico, tira y papel al centro; el expediente es de solo lectura y hay atajos. Ajustes: el grupo flota en círculos sobre la barra; «Cartas» con dos secciones, «De uso» y «Equipables»; la misma casilla de papel para todas las tiradas; papel con relieve, grano y bordes con semilla; Alegreya Sans y Bitter en toda la interfaz; el papel de búsqueda se ajusta a la cantidad de cartas; nada se monta sobre el papel central. Ajustes 2: residuos en peligro desde el motor (`wasteLimit`), papeles centrales con opciones alineadas y acciones abajo a la derecha, cartas de tamaño único y copias agrupadas, un solo estilo de botón, barra superior de papel con etiquetas, expediente como legajo con pestañas y toque doble para abrirlo. Ajustes 3: las doce baterías del recorrido completo pasan localmente; cinco errores del juego corregidos (casilla tapada por el grupo, ficha tapada por Objetivo y Crisis, dos toques comidos por el anti-doble-toque, repaso del ciclo que no se reabría). Ajustes 4: `check-map-experience` espera mientras el ciclo está oculto (preparación, pase, tirada), que es lo que la cortaba en el CI | [126](126-interfaz-v2-sesion-7.md) |
| Interfaz v2 — sesión 4 | **En revisión** (rama `feature/interfaz-v2-sesion-4`): barra de acción permanente con superviviente, dados y acciones; tarjetas de Objetivo y Crisis; papel viejo con sangre seca en vez de nieve en los paneles; transiciones de paneles; comida en peligro desde el motor | [122](122-interfaz-v2-sesion-4.md) |
| Singleplayer (SP-00 a SP-08) | **Diseño en papel**; capítulo piloto «La última guardia» en ficha | [63](63-hoja-de-ruta-planificacion-singleplayer.md), [105](105-ficha-capitulo-la-ultima-guardia.md) |

El mapa permite preparar, jugar y terminar una partida completa (contra la IA, dos jugadores locales y, con `?dev`, un grupo) con un único motor. Vive en `app/mapa/` (`npm run dev:mapa` → `http://127.0.0.1:8779/app/mapa/`).

## 2. Próxima tarea única

**Revisar las sesiones 5 a 7 de la interfaz v2 ([123](123-interfaz-v2-sesion-5.md), [125](125-interfaz-v2-sesion-6.md), [126](126-interfaz-v2-sesion-7.md)).**

1. Abrir los PR de `feature/interfaz-v2-sesion-5` (base: sesión 4), `-6` (base: 5) y `-7` (base: 6) y esperar el CI. En la sesión 7, lanzar además el recorrido completo por `workflow_dispatch` (hallazgo 28): localmente pasa entero.
2. Jugar en escritorio y decidir sobre la sesión 7 y sus dos rondas de ajustes:
   - la barra única, el abanico y el grupo flotante;
   - la barra superior de papel con etiquetas, y la moral;
   - los papeles centrales con opciones alineadas («Mejorar dado», búsqueda, cartas);
   - las cartas de tamaño único, «×N» y el aviso «Más abajo»;
   - el legajo: pestañas, sello de guardia y medallones;
   - el toque doble sobre un superviviente;
   - la intensidad del papel (`--papel-arrugas`, `--papel-grano`).
3. Siguen pendientes de las sesiones 5 y 6:
   - el plegado por toque y si alcanza la señal de cursor y tono;
   - la tirada lenta y el toque que la adelanta;
   - «H», el enfoque con tope 2, el zoom que cubre, los destellos, los contornos y las tipografías.
4. Decidir si el motor expone el límite de muerte, como `wasteLimit` (hallazgo 26), y si el teléfono vertical necesita una disposición propia (hallazgo 29).

## 3. Cola ordenada

1. **Decisión de merge de las sesiones 1 a 7** de la interfaz v2, en ese orden (requiere indicación expresa). Sigue pendiente ver jugando la noche, el D12 y los globos de la sesión 3.
2. **Fichas del hito de contenido documentadas en 124** (rama `docs/plantel-y-muestras`).
3. **Pendiente: prueba acotada de viento** en 2–3 pinos recortados del fondo (mecerse rígidos desde la base, ráfagas, nieve que se desprende); el efecto viejo de deformación queda descartado.
4. **Arte de encrucijadas:** viñetas genéricas y sets de expresiones con la paleta de 109 para llenar la zona de imagen.
5. **Probar jugando las reglas de prueba** ([117](117-reglas-de-prueba-y-un-grupo.md)) para fijar la comida inicial y la duda de [116](116-ficha-regla-la-noche.md).
6. **Implementar «La última guardia»** como capítulo jugable.
7. **Mejoras menores del mapa:** hallazgos 4 y 5, batería de CI con partida entera de clics reales.
8. **Reservas del Hito 3:** Samsung Galaxy A15 físico y dos jugadores locales manuales (el teléfono queda en pausa por decisión del creador).

## 4. Hallazgos abiertos

| # | Hallazgo | Estado | Próximo paso |
|---|---|---|---|
| 1 | Aviso de combate en fichas ajenas | **Implementado** en `985bdf1` | Confirmar jugando |
| 2 | Zoom máximo = tamaño del mapa | **Resuelto** en `main` (PR #34) | Probar en el teléfono la memoria de la textura (4096×2048) |
| 3 | Moverse/Buscar/Atacar poco visibles en móvil | **Corregido** (16/11, solo CSS móvil) | Ver en el teléfono |
| 4 | Selector de localidad desincronizado | **Aceptado como menor** (16/11) | Mejoras menores |
| 5 | Aviso móvil tapa título y botones de la ficha ampliada durante 5 s | **Aceptado como menor** (16/11) | Revisar con la disposición v2 |
| 7 | D12 de exposición sin probar a mano | Integrado; baterías automáticas en tres tamaños | Partida manual |
| 8 | Enfoque de localidad | Contorno a ~70 % del área libre, tope 2 por resolución; zoom manual 1,5; mínimo que cubre ([123](123-interfaz-v2-sesion-5.md)) | Probar en escritorio y en el A15 |
| 9 | «Regresar a la colonia» cuenta como movimiento | **Resuelto** (18/11) | Confirmar jugando que el coste de un dado alcanza |
| 11 | Marcas de daño de 8 a 11 px, debajo del mínimo de 14 px de la guía | En un globo de una fila anclado a cada ficha; si toca al de la vecina, sube un nivel ([121](121-interfaz-v2-sesion-3.md)) | Decisión del creador al verlo |
| 12 | Tipografías de la guía | Bitter y Alegreya Sans incluidas, OFL 1.1, 205 KB ([123](123-interfaz-v2-sesion-5.md)); Alegreya (narración) sigue pendiente | Decidir si hace falta Alegreya |
| 14 | El oráculo del motor (`test:poc`) no corre en Windows | Enlace simbólico rechazado (EPERM) | Lo corre el CI |
| 16 | El creador no veía la noche | Se disparaba en partida real, pero breve y sutil (0,65 s a pleno, sombra 0,5). Reforzada; comprobada en una partida real automatizada (3,4 s, sombra 0,65) y con una prueba del camino real | Verlo jugando |
| 18 | D12 nocturno anclado bajo la localidad | Probado a 1365×768; en el teléfono la tarjeta puede quedar corrida por el área libre | Ver en el teléfono cuando se retome |
| 17 | `luces.json` se detecta en la textura 1× | Válido mientras el arte 2× no se desplace respecto de la 1× | Regenerar (`node scripts/detectar-luces.mjs`) si cambia el arte |
| 19 | Residuos en peligro | **Resuelto** (ajustes 2 de la sesión 7): `WASTE_LIMIT` en el dominio, capacidad `wasteLimit`; la chapa se pone roja desde 10 ([126](126-interfaz-v2-sesion-7.md)) | Ver jugando |
| 26 | Límite de muerte sin capacidad del motor | El legajo muestra «muere a los 3» con `DEATH_DAMAGE`; el motor tiene el 3 literal (exposición, crisis parcial) y una prueba los compara | Decidir si se expone como `wasteLimit` |
| 27 | `check-map-inventory` y `check-map-migration` | **Resuelto** (ajustes 3): las cartas de uso pasan por «Cartas» y el equipo por «Inventario»; el menú no cambió ([126](126-interfaz-v2-sesion-7.md)) | — |
| 28 | **El recorrido completo no corre en los PR** | Solo corre por `workflow_dispatch`; no corrió desde que empezó la interfaz v2 y acumuló catorce fallas, cinco de ellas del juego ([126](126-interfaz-v2-sesion-7.md), ajustes 3) | Correrlo antes de cada fusión |
| 29 | Mapa en teléfono vertical | La v2 es horizontal y en vertical muestra «Girá el teléfono» sobre la pila anterior, pero la pila creció: el mapa pasó de 590 px (sesión 5) a 323 (ajustes 2) a 393×852 | Decidir si el vertical necesita disposición propia |
| 20 | Tocar una ficha del mapa abre la ficha lateral | **Decidido** (sesión 7): la hace activa en la barra y no abre el expediente, que se abre solo con el retrato o E. También se aplicó a los edificios: si el jugador eligió una localidad, el expediente la muestra al abrirlo ([126](126-interfaz-v2-sesion-7.md)) | Confirmar jugando lo de los edificios |
| 22 | Acciones apagadas sin motivo del motor | Superviviente ajeno, turno ajeno, acción en curso y códigos `reason` sin texto quedan apagados sin globo; «Usar carta» trae motivo por carta, no global ([126](126-interfaz-v2-sesion-7.md)) | Decidir si el motor debe exponer un motivo global |
| 23 | Barra completa a 1365 px | Ranuras, dados, acciones y «Terminar turno» entran sin desbordar; el grupo flota sobre la barra en todos los tamaños (en el teléfono, más chico y oculto mientras hay una tira de acción); debajo de 1250 px se oculta el estado del ciclo, y en el teléfono también las ranuras | Ver jugando y en el A15 |
| 24 | Retratos provisionales | Solo cuatro supervivientes tienen retrato (`h0`, `h1`, `a0`, `a1`). Por eso el tercero del grupo (Iris, `h2`) salía como un círculo oscuro vacío; ahora muestra sus iniciales sobre papel ([126](126-interfaz-v2-sesion-7.md), ajustes) | Arte de retratos para el resto del plantel |
| 25 | Contraste del papel nuevo | La tinta queda por encima de AA en el 99 % del papel, en el peor caso combinado; en motas sueltas del grano (0,1 % de los píxeles) baja a unos 3,6:1 local | Ver jugando; bajar `--papel-grano` si molesta |
| 21 | Plegado por toque y globos con pulsación larga | Sin pestañas; el toque pliega también sobre el texto de las tarjetas y las chapas (`data-fold-pass`); la pulsación larga muestra el globo sin plegar. Probado con Edge en escritorio y 852×393 emulado ([125](125-interfaz-v2-sesion-6.md)) | Probar en el A15 |
| 15 | Zona de imagen de la encrucijada sin arte | «Al otro lado» es una pantalla compuesta y no sirve como imagen | Arte de encrucijadas (cola 2) |

## 5. Verificación de la interfaz v2, sesión 7 y ajustes (rama `feature/interfaz-v2-sesion-7`)

- [x] **970 pruebas, 0 fallos**: 7 nuevas en `interfaz-v2-sesion-7-ajustes-3` (una de los ajustes 4); 3 anteriores se ajustaron al código nuevo (contornos, cierre del abanico y del retrato).
- [x] `check:build` y `check:mapa-build` en verde. `src/` no cambió en los ajustes 3.
- [x] **Recorrido completo local con Edge**, las doce baterías del paso en el orden del workflow y con sus variables. Las que graban vídeo corrieron sin vídeo (no hay ffmpeg). Detalle y tamaños en [126](126-interfaz-v2-sesion-7.md), ajustes 3.
- [x] Contornos: el paso usa el SHA completo de `26fe4ec` y falla si no puede dibujar el «antes»; localmente salen los siete.
- [x] Ajustes 4: `check-map-experience` arreglada y pasando con Edge, normal y con la CPU 4× más lenta; también feedback-camera, death-decisions, exposure-d12, map-2x y h344.
- [ ] CI: el recorrido completo por `workflow_dispatch` (con vídeo; en run 45624263281 ya pasaban presentación a migración y contornos) y el oráculo `test:poc` (EPERM en Windows).
- [ ] Ver jugando en escritorio y en el Galaxy A15.
- [ ] Decisión de merge del creador.

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
