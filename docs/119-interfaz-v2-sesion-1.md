# 119 — Interfaz v2, sesión 1: disposición, filtro frío, daño y ruido siempre visibles

23/11/2026. Rama `feature/interfaz-v2-sesion-1`, desde `main` (`4d5f1a1`) más el commit de decisiones `a754964` traído con *cherry-pick* (guía de estilo [109 §8](109-guia-de-estilo.md) y `assets/interfaz/`). Datos según la auditoría [118](118-auditoria-datos-interfaz-v2.md).

```bash
npm run check:build && npm test     # 881 pruebas
npm run check:mapa-build
```

## Qué cambió

**Disposición.** El mapa ocupa todo el área de juego y los paneles flotan encima. Ningún panel cambió lo que hace ni sus acciones; solo su lugar:

| Panel | Lugar en horizontal |
|---|---|
| Cámara (localidad, −, +, restablecer) | Arriba a la izquierda |
| Ronda, turno, moral, comida, hambre, residuos | Arriba, al lado de la cámara. No recibe toques: lo que hay debajo sigue siendo mapa |
| Menú | Arriba a la derecha |
| Ficha | A la derecha, entre el menú y la barra inferior. Cerrada, queda el botón «Ficha» abajo a la derecha |
| Objetivo, crisis, aportar, terminar turno | Barra inferior de borde a borde, dejando lugar al botón de la ficha |

Escritorio usa la misma disposición, con columnas un poco más anchas (360 y 340 px) y paneles más translúcidos. En un teléfono vertical (600 px de ancho o menos) se conserva la disposición apilada anterior y aparece «Girá el teléfono: el juego está pensado en horizontal», que no bloquea toques.

Todo vive en `app/mapa/estilos/interfaz-v2.css`, cargada al final y activa con `data-interfaz="v2"` en el `body`. Sin ese atributo vuelve la disposición anterior.

**Enfoque de localidad.** Al elegir una localidad, la cámara la encuadra en el área que dejan libre los paneles (`focusLocality` acepta un margen opcional; sin margen da exactamente lo de antes). La vista general sigue usando toda la pantalla. A 852×393, ningún acceso ni retrato de ninguna localidad enfocada queda bajo una barra (prueba unitaria con la geometría real).

**Filtro frío.** Saturación 0,5, tono −28°, brillo 0,85 y contraste 1,05, con las matrices de la especificación CSS. Se calcula una sola vez sobre una copia en memoria de la textura del fondo. No se aplica `filter` al canvas entero, así que zombis, barricadas, retratos y el contorno de selección (Lámpara) conservan su color. Un solo lugar: `MAP_COLOR_FILTER` en `app/mapa/render/cold-filter.mjs`, y con `null` vuelve la ilustración original. Ningún archivo de arte cambió.

**Materiales.** Chapa de `assets/interfaz/` bajo un velo de Noche en barras y marcos: es textura apagada y no marca nada. Nieve colgando del borde superior de la barra de estado, la barra inferior y la ficha. Dos pinos chicos: uno sobre la esquina izquierda de la barra inferior y otro sobre la ficha. Sin guirnaldas. El servidor ahora publica `/assets/interfaz/`.

**Daño siempre visible.** Sobre cada ficha del mapa, sin seleccionarla: ♥ en Sangre fría con el número de heridas y ❄ en Escarcha con el de congelaciones, apilados (herida abajo). Cada símbolo aparece solo si su número es mayor que 0, así que una ficha sana no muestra nada. Los números son `characters[].wounds` y `frost` de la proyección. El detalle al seleccionar la ficha («Heridas: 2 · Congelación: 1») no cambió.

**Ruido siempre visible.** Sobre cada edificio con ruido: un altavoz, un punto lleno por ficha y huecos hasta el tope (●●●○ = 3 de 4). Sin ruido no se dibuja nada.

**Tope de ruido desde el motor.** El 4 era un literal repetido en cuatro lugares del motor. Ahora es la constante `NOISE_LIMIT` (`src/domain/reference-state.mjs`), la usan esos cuatro lugares, sale como capacidad de solo lectura `noiseLimit` y la proyección la entrega en `locations[].noiseLimit`. El valor y el comportamiento no cambian. El HTML de referencia se regeneró desde `src/`.

**Privacidad del pase.** Las marcas leen la proyección, que en el pase, la preparación, las muertes y las decisiones llega con listas vacías: no se dibuja nada y no se recupera ningún estado anterior.

## Decisiones tomadas en la sesión (a confirmar)

- **Marcas de daño a 11 px**, por debajo del mínimo de 14 px para etiquetas de la guía. En la vista general del teléfono las fichas miden unos 16 px y están pegadas; a 12 px las marcas de fichas vecinas se pisaban. Al acercar la cámara crecen las fichas, pero no las marcas.
- **Ruido 0 no se dibuja**, igual que el daño 0. El tope se ve como huecos cuando hay al menos una ficha.
- **Marcadores de ruido en Nieve y Niebla**, no en Lámpara: hay ruido en varias localidades a la vez y el amarillo perdería fuerza.
- **Teléfono vertical con la disposición anterior** más el aviso, para no romper los recorridos de 393×852.

## Qué se comprobó

- **881 pruebas, 0 fallos** (872 de la línea base). Nueve nuevas en `tests/interfaz-v2.test.mjs`:
  - Contrato de proyección: `noiseLimit` igual al tope del motor en las siete localidades; el ruido coincide con el del motor; proyectar no cambia la partida ni consume azar.
  - Bloqueos: en el pase, la preparación, las muertes y las decisiones no hay localidades ni supervivientes, y no aparece `noiseLimit`.
  - Motor: ya no tiene literales del tope.
  - Qué se dibuja según `wounds`, `frost` y `noise`, con 0, nulos, negativos y no enteros.
  - Margen de enfoque y área libre.
  - Filtro: valores aprobados, gris que sigue gris, alfa intacta, ningún `filter` sobre el canvas.
  - Página: hoja cargada al final, colores 109, sin guirnaldas.
- La prueba del servidor confirma que publica `assets/interfaz/`.
- `check:build` y `check:mapa-build` en verde.

## Qué informa una herramienta

- **Dos capturas** con Edge local (Playwright 1.57 como paquete npm, sin descargar navegadores). Se tomaron sobre una partida de dos jugadores con heridas, congelación y ruido puestos a mano en el modo QA:
  - Teléfono horizontal, 852×393: [119-interfaz-v2-852x393.jpg](evidencias/interfaz-v2/119-interfaz-v2-852x393.jpg)
  - Escritorio, 1365×768: [119-interfaz-v2-1365x768.jpg](evidencias/interfaz-v2/119-interfaz-v2-1365x768.jpg)

  En los dos tamaños hay cuatro marcas de daño y tres de ruido donde corresponde, cero errores de página y nada de desplazamiento horizontal.
- **Oráculo del motor (`npm run test:poc`) sin correr en local:** el script crea un enlace simbólico y Windows lo rechaza (EPERM), también sin estos cambios. Lo corre el job `engine` del CI.

## Qué falta

- **Baterías de navegador:** no se corrieron localmente. No se modificó ninguna porque la revisión de sus aserciones no mostró ninguna que dependa de la disposición vieja:
  - el cartel QA sigue por encima del canvas;
  - el mapa es más alto que los umbrales;
  - los botones miden al menos 44 px;
  - abrir o cerrar la ficha conserva la escala;
  - las casillas se tocan con la ficha cerrada y la localidad enfocada en el área libre.

  La fuente de verdad es el CI del PR (pruebas, engine, browser, horizontal) y **el recorrido completo lanzado a mano una vez** desde Actions → «Mapa — baterías de navegador» → Run workflow, eligiendo esta rama. Desde este entorno no hay acceso a GitHub para abrir el PR ni lanzar el workflow: queda para el creador.
- **Tipografía:** Alegreya Sans y Bitter no están en el repositorio y la guía pide incluirlas con su licencia, no cargarlas de un servicio externo. Las cifras ya usan números tabulares. Siguen las fuentes del sistema.
- **En escritorio, con la ficha abierta**, un acceso del supermercado queda bajo la ficha al enfocarlo: el borde del mapa no deja correr más la cámara. Con la ficha cerrada no pasa.
- **Jugando, en escritorio y en el Samsung Galaxy A15:**
  - si las barras dejan ver suficiente mapa;
  - si las marcas de 11 px se leen;
  - si el filtro frío y la chapa se ven bien en la pantalla real;
  - si el aviso vertical alcanza;
  - el coste del filtro al arrancar, que recorre una vez los 6,3 millones de píxeles de la textura.

  Nada de lo visual está aprobado hasta verlo.
