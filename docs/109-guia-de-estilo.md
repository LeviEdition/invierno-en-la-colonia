# 109 — Guía de estilo: arte, paleta, tipografía y escenas narrativas

17/11/2026. Decisiones del creador para todo el arte y la interfaz nuevos del juego. Se aplica a las viñetas de encrucijadas y encuentros, a la interfaz del mapa y a los paneles. El mapa ilustrado ya aprobado (perspectiva oblicua 2.5D, doc [75](75-plan-hito-3-identidad-visual.md)) no se redibuja; su ajuste de color hacia esta paleta se evalúa aparte (§7).

**Referencia visual:** [prototipo de encrucijada «Al otro lado»](../assets/guia-de-estilo/referencia-encrucijada-al-otro-lado.png). La técnica, el encuadre y el tono de esa imagen son el estándar; su paleta violeta y naranja se reemplaza por la de §2.

## 1. Tipo de arte

| Aspecto | Decisión |
|---|---|
| Técnica | Ilustración pintada a mano, con pinceladas visibles y textura de papel. No dibujo de línea limpia ni realismo fotográfico |
| Formato narrativo | Viñetas de cómic breves: una escena amplia y un primer plano de reacción, separadas por un marco fino, sobre un fondo de papel oscuro texturado |
| Figuras | Proporciones realistas; rostros expresivos pero contenidos (miedo, duda, cansancio, determinación); ropa de invierno pesada |
| Luz | Mundo frío y en penumbra. La única luz cálida es la Lámpara (§2) y marca lo que importa: la rendija bajo una puerta, una ventana, una linterna |
| Texto en la viñeta | Pensamiento o diálogo breve en cursiva (Alegreya) sobre la imagen, sin globos |
| Coherencia | Las caras de las viñetas coinciden con los retratos del mapa; la nieve usa los tonos de la paleta |

## 2. Paleta

| Nombre | Código | Uso |
|---|---|---|
| Noche | `#0F141A` | Fondo más profundo, sombras |
| Pizarra | `#1C242D` | Paneles, fondo de tarjetas y viñetas |
| Acero | `#33404C` | Bordes, separadores, sombras de la ilustración |
| Azul invierno | `#55697B` | Cielo, sombras de nieve, botones en reposo |
| Niebla | `#8A97A3` | Texto secundario y rótulos chicos, lejanía |
| Hielo | `#B9C7D3` | Nieve en sombra, texto de apoyo |
| Nieve | `#EEF2F5` | Nieve iluminada y texto principal |
| **Lámpara** | `#F2C14E` | **Único acento cálido** (§2.1) |
| Sangre fría | `#B5473F` | Señal de heridas y daño (símbolo de gota del D12) |
| Escarcha | `#7FC4E8` | Señal de congelación (símbolo de copo del D12) |

### 2.1 Regla de la Lámpara

El amarillo solo marca lo que importa: esperanza, peligro, lo que hay que mirar o la acción seleccionada. Si aparece en todos lados, pierde fuerza. **Nunca destaca una opción de una decisión narrativa en reposo**: las opciones se ven iguales y la Lámpara solo aparece al pasar el mouse, al enfocarlas o al tocarlas. Destacar una sugeriría que es la correcta.

### 2.2 Contraste

- Texto largo (narración, descripciones): Nieve sobre Pizarra o Noche.
- Niebla solo para rótulos chicos (por ejemplo «ENCRUCIJADA»), no para párrafos.
- Sangre fría y Escarcha son señales, no colores de texto largo.

## 3. Tipografía

| Tipografía | Uso |
|---|---|
| **Bitter** | Títulos de escena, nombres de supervivientes y botones de **decisión narrativa** |
| **Alegreya** | Narración y diálogos; cursiva para lo que se piensa o dice en voz alta |
| **Alegreya Sans** | Todo lo mecánico: acciones del tablero, estadísticas, etiquetas, ronda y recursos |

- Botones de decisión narrativa en Bitter y acciones del tablero en Alegreya Sans: el jugador distingue sin pensarlo una decisión de historia de una de juego.
- Cifras de estadísticas y contadores con números alineados y de ancho fijo (`font-variant-numeric: lining-nums tabular-nums`); Alegreya Sans usa por defecto números de alturas desparejas.
- Las tres tienen licencia SIL OFL: se incluyen en el repositorio (con su licencia) y no se cargan desde un servicio externo, para que el juego funcione sin conexión.
- Tamaños mínimos en el teléfono: 16 px para narración, 14 px para etiquetas.
- Descartada: Roboto Slab (duplica el papel de Bitter).
- **Incluidas desde el informe 123:** Bitter 600 y 700, Alegreya Sans 400, 500 y 700, en `assets/fuentes/` (woff2, latino y latino extendido, con `OFL.txt`). Se usan con `--fuente-titulo` y `--fuente-texto` y `font-display: swap`. Alegreya (con serifa, para la narración) sigue pendiente; mientras tanto, la narración usa Alegreya Sans.

## 4. Escenas narrativas

### 4.1 Encrucijadas y encuentros

Definiciones en [63](63-hoja-de-ruta-planificacion-singleplayer.md) (nota del 17/11): **encrucijada**, impacto leve (una decisión, efecto inmediato y acotado, sin arrastre, máximo una por ronda); **encuentro**, impacto mayor (personas concretas, consecuencias persistentes; avanza la historia principal o una secundaria). Si una escena es una u otra se decide por su impacto al desarrollarla: *¿cambia algo después de esta ronda?* Si cambia, es un encuentro.

| | Encrucijadas | Encuentros |
|---|---|---|
| Protagonista | Genérica: la vive cualquier superviviente presente | Por personaje: se activa si ese personaje está y se cumplen condiciones (como en *Dead of Winter*) |
| Arte | Viñeta de escena genérica + viñeta de reacción del superviviente presente | Viñetas propias del personaje y de la escena |

### 4.2 Estructura de una encrucijada

1. **Viñeta de escena genérica:** el personaje de espaldas, en silueta o sin rostro identificable, para que sirva con cualquier superviviente.
2. **Viñeta de reacción:** el rostro del superviviente que realmente está ahí, tomado de su **set de expresiones** (miedo, duda, determinación, tristeza). Un set por superviviente, reutilizado en todas las encrucijadas: 16 supervivientes × 4 expresiones = 64 retratos.
3. **Narración** breve en Alegreya.
4. **Opciones** en Bitter, iguales en reposo (§2.1).
5. **Viñeta o línea de resultado** después de decidir (§4.3).

### 4.3 Consecuencias: anticipadas por la narración, mostradas después

Decisión del creador: las consecuencias **no se muestran antes de decidir**, para que el jugador piense en la situación y no en las cifras. Es una excepción explícita a la regla de interfaz de mostrar el costo antes de confirmar, que sigue valiendo para mover, buscar, atacar y las demás acciones del tablero.

Dos condiciones para que sea justo:

- **La narración anticipa cada tipo de consecuencia, aunque no su tamaño.** Si ayudar suma bocas que alimentar, la narración lo sugiere («se oyen dos voces»); si hay riesgo de herida, también («los muertos se acercan»). Una encrucijada nunca mata sin aviso: eso sería un encuentro.
- **Después de decidir, el resultado se muestra claro**, para que el jugador aprenda el mundo. Ejemplo:

> *Abrís. Una madre y su hijo entran tiritando. Un muerto alcanza a Mara antes de cerrar.*
> **Indefensos +2 · Moral +1 · Mara: herida**

## 5. Celular

- Las viñetas se reacomodan: en horizontal, una al lado de la otra; en el teléfono vertical, apiladas, con la narración debajo y las opciones a lo ancho, una sobre otra.
- Cada viñeta se ilustra con una **zona segura central** donde está lo importante (la mano en el picaporte, la luz bajo la puerta), para que no se pierda al recortar o apilar.
- Teléfono de referencia: Samsung Galaxy A15.

## 6. Interfaz del mapa

- Paneles en Pizarra con bordes en Acero; texto en Nieve; rótulos en Niebla.
- Acción seleccionada con borde y texto en Lámpara.
- Señales de estado: heridas en Sangre fría, congelación en Escarcha, igual que los símbolos del D12.

## 8. Interfaz v2 (decisiones del creador, 17/11/2026)

Referencia visual: el lienzo de diseño «Invierno en la Colonia — dirección de interfaz» (claude.ai).

- **Plataforma principal: teléfono en horizontal** (referencia 852×393). Escritorio usa la misma disposición, con el mapa como protagonista y los paneles más livianos. En vertical se muestra un aviso para girar el teléfono.
- **El mapa manda:** ocupa toda la pantalla; los paneles flotan sobre él, compactos.
- **Mapa en tonos fríos:** se aprueba el filtro de color sobre la ilustración existente (saturación 0,5, tono −28°, brillo 0,85, contraste 1,05), sin redibujarla. Cierra el pendiente de §7.
- **Materiales:** chapa corrugada y oxidada en barras y marcos; ~~nieve acumulada en los bordes superiores~~ (retirada de los paneles en el informe 122: queda solo en el mapa); pinos del mapa en algunas esquinas (`assets/interfaz/`). **El óxido es un material, no una señal:** es textura apagada y nunca marca algo importante; la regla de la Lámpara (§2.1) sigue valiendo. Sin guirnaldas de luces.
- **Papel rasgado** para los recuadros de texto (pensamiento, consecuencia «X recordará eso») y los rótulos de las localidades.
- **Papel viejo en los paneles de lectura** (informe 122): la barra de acción, las tarjetas de Objetivo y Crisis y la ficha lateral son papel crema amarillento que oscurece hacia los bordes, con fibra y grano finos, un pliegue suave y el borde rasgado. Tres variantes (barra, tarjeta chica, ficha). El texto va en tinta `#2B2219` (secundario `#4E4134`); los botones sobre el papel son chapa oscura con sombra dura `3px 3px 0 #07090C`, y «Terminar turno» va en Lámpara sólida. La nieve queda solo en el mapa: ningún panel la lleva. Las texturas se generan una vez (`scripts/generar-papel.mjs`).
- **Sangre seca sobre el papel:** marrón oxidado desaturado (referencia `#6A2E22`), oscuro y apagado, nunca el rojo de señal (Sangre fría `#B5473F`): no se lee como herida. Va en capa aparte del papel, para moverla o quitarla sin rehacerlo. Solo en esquinas y bordes, jamás debajo de un número, nombre, botón o dado; como máximo una mancha de borde por panel (la tarjeta de Crisis lleva una más grande). Posiciones fijas por tipo de panel, sorteadas con semilla.
- **Recurso en peligro:** la chapa lleva anillo y su número en insignia, en Sangre fría (`#B5473F`), solo cuando el motor lo indica (hoy, la comida que no alcanza para la próxima fase de colonia).
- **Tipografía:** variables `--fuente-texto` (Alegreya Sans) y `--fuente-titulo` (Bitter), autoalojadas (§3).
- **Paneles plegables** (informe 123): las tarjetas de Objetivo y Crisis, la fila de recursos y la ficha se pliegan y despliegan tocando el panel mismo, sin pestañas ni flechas (informe 125): plegado, cualquier parte de la tira lo despliega; desplegado, lo pliegan su encabezado o el papel libre (la ficha, solo su encabezado). Los controles internos (dados, botones, retrato, chapas con globo) nunca pliegan. La única señal es el cursor de mano y un leve aclarado del papel al pasar el mouse; para teclado, cada panel tiene un botón real invisible que muestra el foco sobre el panel entero. Plegadas quedan como una tira que sigue informando («Objetivo 4/7 · R8», «Crisis 1/2», recursos con ícono y número). La barra de acción nunca desaparece: plegada conserva retrato, dados y «Terminar turno». Una crisis nueva despliega su tarjeta una vez. La tecla «H» pliega o despliega todo. El estado se recuerda entre partidas.
- **Globos de las chapas:** al pasar el mouse, con el foco de teclado o con una pulsación larga, cada chapa muestra en papel su nombre y una línea de descripción (los textos de la ficha V9). El globo va debajo de la chapa, sin taparla ni salir de la pantalla.
- **Cámara** (informe 123): el zoom mínimo cubre el área, así que el mapa nunca deja franjas. El enfoque de una localidad la lleva a cerca del 70 % del área libre, con tope en la resolución del fondo (2).
- **Recursos como chapas redondas con ícono:** fogata (moral, en Lámpara), lata (comida), adulto y chico (indefensos), bolsa (residuos).
- **Dados de acción con puntos**, como dados reales; el D12 conserva su forma y sus símbolos.
- **Rótulos de las localidades:** aparecen al mover el mouse sobre el mapa, al tocarlo o al desplazarlo, y se desvanecen tras unos segundos sin interacción; la localidad seleccionada conserva el suyo.
- **Movimiento:** los paneles entran y salen con transiciones fluidas, no de golpe; el cambio de localidad es rápido pero suave. Se respeta la preferencia de movimiento reducido. Desde el informe 122: fundido y 8–12 px desde el borde de donde viene cada panel, 200 ms de entrada y 180 ms de salida, solo opacidad y transformaciones, interrumpibles; con movimiento reducido, sin desplazamiento ni escala.
- **Resultados de encrucijadas** en viñetas grandes, de borde a borde, con la barra de resultado debajo.
- **Una sola barra para actuar** (informe 126). La barra de abajo es el único lugar de acción de turno. De izquierda a derecha:
  - **grupo:** miniaturas redondas; la activa lleva borde Lámpara;
  - **superviviente activo:** retrato, nombre, localidad, heridas y congelación, y tres ranuras de equipo (herramienta, arma, libro), con borde punteado si están vacías;
  - **dados**, y «+1 (1 comida)» solo cuando el motor permite mejorar uno;
  - **acciones:** Buscar, Atacar y Moverse, siempre visibles, y «Más»;
  - **«Terminar turno»**, separado por una línea de puntos.

  Una acción apagada sigue a la vista y muestra en el globo de papel el motivo que da el motor. Si el motor no da motivo, no tiene globo.
- **Abanico de «Más»:** un papel rasgado sobre la barra con las demás acciones de turno que el motor permite en ese momento (barricada, limpiar residuos, atraer, regresar, habilidad, usar carta). Se cierra al elegir, con Esc o tocando fuera.
- **Tira de la acción en curso:** una línea de papel sobre la barra que dice qué falta («Buscar en Biblioteca · elegí un dado de 3 o más») y lleva «Cancelar (Esc)». Los dados que el motor acepta se marcan en Lámpara y los demás se apagan.
- **Papel al centro:** lo que resuelve una acción (dados, cartas reveladas grandes y lado a lado, curación, crisis, fin de turno) va en papel rasgado al centro, sin tapar la barra. El movimiento no tapa el mapa: su confirmación es un papel chico justo sobre la barra.
- **Expediente** (la antigua ficha): solo información. Muestra los datos del superviviente, la mano y el equipo (con «Equipar» y «Dar a…», que actúan sobre la carta), el registro y los ajustes. Se abre y se cierra con el retrato o la tecla E, y se cierra también con Esc. Cerrado no ocupa pantalla. Tocar una ficha del mapa no lo abre: la hace activa en la barra.
- **Atajos de escritorio:**
  - B buscar, A atacar, M moverse;
  - E expediente;
  - 1–4 elegir dado en la acción en curso;
  - Espacio terminar turno (si el foco no está en un botón);
  - H plegar.

  Ninguno actúa con Ctrl, Alt o Mayús, dentro de un campo de texto, con una ventana obligatoria abierta ni durante el pase de dispositivo.
- **Dado nocturno:** centrado en su casilla de papel: título arriba («La noche en Biblioteca · Leo»), el D12 al medio y «Tirando…» o el resultado abajo.
- **Objetivo y Crisis:** del mismo ancho, en columna. Plegadas, sus tiras también.

## 7. Pendiente

- ~~Ajuste de color del mapa~~: resuelto en §8 (filtro frío aprobado).
- Sets de expresiones de los supervivientes y viñetas de la primera encrucijada con la paleta nueva.
