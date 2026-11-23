# 120 — Interfaz v2, sesión 2: recursos, rótulos, papel rasgado, transiciones y encrucijada

23/11/2026. Rama `feature/interfaz-v2-sesion-2`, desde `feature/interfaz-v2-sesion-1` (PR #38, [119](119-interfaz-v2-sesion-1.md)). Decisiones en [109 §4, §5 y §8](109-guia-de-estilo.md). Foco en escritorio (1365×768); 852×393 y 393×852 solo se verificaron para que no se rompan.

```bash
npm run check:build && npm test     # 886 pruebas
npm run check:mapa-build
```

**Alcance:** parte A del encargo y, al final, la parte B (ajustes de la sesión 1).

## Qué cambió

**Recursos como chapas.** En la barra de estado, moral, comida, indefensos y residuos son chapas redondas con ícono SVG propio, sin imágenes. Los íconos son una fogata, una lata, una persona y una bolsa. La fogata va en Lámpara y las demás en Hielo. La proyección da un solo número de indefensos (`g.helpless`), así que hay un solo ícono, sin distinguir adulto de chico. Ronda, turno y hambre siguen como texto. Cada chapa conserva su `dt` para lectores de pantalla.

**Rótulos de localidad.** Aparecen al mover el mouse sobre el mapa, al tocarlo, al desplazarlo o al cambiar el zoom. Se desvanecen a los 2,8 s sin interacción, con 220 ms de transición. La localidad seleccionada (o la de la ficha seleccionada) conserva el suyo.
- Reemplazan al rótulo fijo que tenía solo la colonia, que conserva su posición.
- Viven en una capa propia (`#locality-labels`), para que el desvanecido sea una transición y no un salto.
- Los marcadores de ruido de la sesión 1 no cambiaron.

**Papel rasgado.** Borde superior e inferior irregular con `clip-path`, sin ilustraciones. Va en los rótulos de localidad, el aviso temporal (`#map-notice`), la barra de resultado de la encrucijada y los recuadros de consulta (`#info-dialog`: registro, objetivo, crisis, ayuda). No se crearon recuadros de pensamiento ni de consecuencia.

**Transiciones.**
- **Entrada** (CSS, 200 ms): ficha, menú y diálogos.
- **Salida** (180 ms): el panel real se oculta en el acto, así que la lógica, el foco y las pruebas lo ven cerrado enseguida. Encima se desvanece una copia inerte, sin ids, datos ni roles y sin recibir toques, con el estilo calculado copiado.
  - La copia se engancha a `el.hidden=true` y `dialog.close()` del código existente, sin cambiar a quien los llama.
  - La ficha sale entera, con su fondo.
- **Cambio de localidad** (220 ms): la cámara lógica llega al destino en el acto. Solo el dibujo recorre el camino, y los toques usan la cámara dibujada. Arrastrar o hacer zoom corta el recorrido.
- **Movimiento reducido:** con la preferencia del sistema o el ajuste del juego, no hay animaciones, copias ni recorrido. El ajuste del juego ahora también se refleja en `body[data-motion]`.

**Encrucijada en viñeta.**
- **Disposición:** título, zona de imagen de borde a borde (21:8, como mucho el 44 % del alto) con zona segura central (109 §5: 25 % a cada lado, 8 % arriba y abajo) y narración. Después vienen «Elegí una opción.» y las opciones, iguales en reposo, que se marcan en Lámpara solo al pasar, enfocar o tocar (§2.1).
- **Consecuencias después de decidir (§4.3):** los botones ya no muestran «opción — consecuencia». Al elegir, cuando el motor publica su evento `cross` (título, opción y efecto), aparece la barra de resultado bajo la imagen («**Aislar al enfermo** · Sin costo de objetos; -1 moral.»). «Continuar» solo cierra esta vista y no vuelve a llamar al motor. Lo mismo vale para la decisión de la IA.
- **Opción no disponible:** lo dice sin revelar el efecto («No disponible con lo que tiene el grupo ahora.»).
- **Privacidad:** en el pase, la preparación, las muertes o una partida nueva, la vista de resultado se descarta y nunca se recupera.
- **Arte:** no hay ilustraciones de encrucijadas. «Al otro lado» (`assets/guia-de-estilo/`) es una pantalla compuesta, con título, narración y botones dentro de la imagen y la paleta violeta que 109 manda reemplazar, de una escena que no está en el mazo, así que no sirve como imagen de la viñeta. La zona queda con un degradado neutro, lista para el arte.

**Dados con puntos.** La reserva, la búsqueda y el ataque ya los dibujaban con puntos. Faltaban los botones de dado del diálogo de juego (limpiar, atraer, mejorar, regresar); ahora llevan el mismo dibujo. El D12 no se tocó.

## Qué se comprobó

- **886 pruebas, 0 fallos** (881 de la línea base). Cinco nuevas en `tests/interfaz-v2-sesion-2.test.mjs`:
  - las cuatro chapas, una sola de indefensos y la fogata en Lámpara;
  - los rótulos: anclas, apagado y selección;
  - las transiciones: duraciones, movimiento reducido, copias inertes sin ids y la salida sin espera;
  - la encrucijada: sin consecuencia antes de decidir y resultado solo con un evento nuevo;
  - los dados con puntos sin el D12.

  La prueba de la sesión 1 sobre la Lámpara ahora admite exactamente sus dos usos: la fogata y la opción enfocada.
- `check:build` y `check:mapa-build` en verde.

## Qué informa una herramienta

Recorrido corto con Edge local (Playwright 1.57 como paquete npm, modo QA, movimiento normal) en 1365×768, 852×393 y 393×852. En los tres tamaños:
- Hay cuatro chapas con datos reales.
- Siete rótulos se encienden con el mouse o el toque y a los 3,5 s quedan apagados. En escritorio queda encendido el de la localidad seleccionada.
- Al cerrar el menú, el real está oculto en el acto, hay una copia inerte sin ids ni duplicados y a los 450 ms no queda ninguna.
- La encrucijada muestra solo los nombres de las opciones. Un doble clic sobre una opción produce un solo resultado, con la consecuencia en la barra, y no consume azar extra.
- «Continuar» cierra sin cambiar la moral.
- No hay errores de página ni desplazamiento horizontal.

En escritorio, el cambio de localidad deja cuadros pendientes y luego termina.

Capturas en 1365×768:
- [mapa con rótulos y chapas](evidencias/interfaz-v2/120-mapa-1365x768.jpg)
- [encrucijada antes de decidir](evidencias/interfaz-v2/120-encrucijada-1365x768.jpg)
- [resultado](evidencias/interfaz-v2/120-resultado-1365x768.jpg)

## Qué falta

- **Baterías de navegador** sin correr localmente ni modificar. En `check-map-experience`, `check-map-migration` y los ayudantes h344, los recorridos ya pulsan cualquier `[id^=play-cross-]`, así que cierran la vista de resultado (`play-cross-continue`). Fuente de verdad: el CI del PR.
- **Tipografías** (Alegreya Sans, Bitter): siguen sin incluirse. La encrucijada usa Georgia como serif provisoria.
- **En escritorio, jugando:**
  - si 2,8 s es buen tiempo para los rótulos;
  - si las copias de salida se notan bien o distraen;
  - el ritmo del cambio de localidad;
  - cómo se lee la viñeta vacía hasta que haya arte.

  Nada de lo visual está aprobado hasta verlo.

## Parte B — ajustes de la sesión 1 (escritorio)

- **7. Marcas de daño ancladas a su ficha.** Cada ficha con daño tiene un globo propio, centrado sobre ella y con una punta que baja hasta la ficha. Adentro van las marcas apiladas: ♥ en Sangre fría y ❄ en Escarcha, cada una solo si es mayor que 0. `damageBubble` ajusta la letra (8–11 px) para que el globo no sea más ancho que la ficha.
- **8. Margen de cámara con la ficha abierta.** Mientras la ficha está abierta, la cámara puede correrse hacia el lado que la ficha tapa tanto como mide la ficha. Solo es horizontal; el zoom máximo 1,5 y las posiciones no cambian. Al cerrar la ficha, la cámara vuelve a los bordes normales con el mismo recorrido suave. Sin ficha abierta, `constrainCamera` da exactamente lo de antes.
- **9. Pino anclado.** El pino nace dentro del extremo izquierdo de la barra inferior, sobre la chapa, y el texto le deja lugar.
- **10. «Bruno» y «Sol» cortados a 852×393.** Era real, no un artefacto de la captura. «Grupo y líderes» se abre dentro de la ficha; al cerrarse, la ficha quedaba desplazada 279 px sobre la lista de la localidad. Ahora vuelve arriba al cerrarse un panel de contexto y al cambiar de superviviente o de localidad (antes solo al cambiar de superviviente).

**Comprobado:**
- **890 pruebas, 0 fallos**, con nueve nuevas: el globo cabe en la ficha de 24 a 66 px, el margen corre solo lo que tapa la ficha y ningún acceso ni retrato de ninguna localidad queda bajo la ficha, el pino y la vuelta arriba de la ficha. `check:build` y `check:mapa-build` en verde.
- **Con Edge a 1365×768**, con cinco fichas dañadas en la colonia: cada globo queda centrado y dentro de su ficha, sin solapes. Con la ficha abierta, el supermercado a zoom 1,5 no tiene puntos tapados.
- **A 852×393**, después del recorrido de inicio, la ficha queda arriba (antes, desplazada 279 px).
- Sin errores de página.

**Capturas:**
- [colonia con seis fichas](evidencias/interfaz-v2/120-colonia-seis-fichas-1365x768.jpg)
- [supermercado enfocado con la ficha abierta](evidencias/interfaz-v2/120-supermercado-ficha-abierta-1365x768.jpg)

**Falta:** las baterías de navegador (CI del PR) y verlo jugando en escritorio.
