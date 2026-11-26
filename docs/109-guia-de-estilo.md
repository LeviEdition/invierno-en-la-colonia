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
| **Caveat** | Lápiz: el Objetivo, lo escrito a mano en el legajo y las notas del mapa (frases cortas) |
| **Stardos Stencil** | Esténcil: los números de la chapa, «Terminar turno», «VÍVERES» en el tablón y el tipo de las cartas de búsqueda |
| **Special Elite** | Máquina de escribir: el rótulo oficial del legajo |
| **Permanent Marker** | Marcador: el título de la crisis |

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
- **Materiales:** desde la sesión 8, dirección **«objetos a carbón»** (§8.1). La chapa corrugada, el papel viejo y la sombra dura de las sesiones 2 a 7 quedan reemplazados por un objeto distinto por panel.
- **Papel rasgado** para los recuadros de texto (pensamiento, consecuencia «X recordará eso») y los rótulos de las localidades.
- **Papel viejo en los paneles de lectura** (informe 122): reemplazado en la sesión 8 por los objetos de §8.1. El papel queda en los papeles centrales (búsqueda, construir, cartas), en la hoja del Objetivo y en las notas del mapa.
- **Sangre seca sobre el papel:** marrón oxidado desaturado (referencia `#6A2E22`), oscuro y apagado, nunca el rojo de señal (Sangre fría `#B5473F`): no se lee como herida. Va en capa aparte del papel, para moverla o quitarla sin rehacerlo. Solo en esquinas y bordes, jamás debajo de un número, nombre, botón o dado; como máximo una mancha de borde por panel (la tarjeta de Crisis lleva una más grande). Posiciones fijas por tipo de panel, sorteadas con semilla.
- **Recurso en peligro:** la chapa lleva anillo y su número en insignia, en Sangre fría (`#B5473F`), solo cuando el motor lo indica (hoy, la comida que no alcanza para la próxima fase de colonia y los residuos desde el tope del motor, `wasteLimit`, hoy 10). Desde los ajustes 2 de la sesión 7, el número queda en su lugar, en Sangre fría, sin insignia.
- **Tipografía:** variables `--fuente-texto` (Alegreya Sans) y `--fuente-titulo` (Bitter), autoalojadas (§3).
- **Paneles plegables** (informe 123): las tarjetas de Objetivo y Crisis, la fila de recursos y la ficha se pliegan y despliegan tocando el panel mismo, sin pestañas ni flechas (informe 125): plegado, cualquier parte de la tira lo despliega; desplegado, lo pliegan su encabezado o el papel libre (la ficha, solo su encabezado). Los controles internos (dados, botones, retrato, chapas con globo) nunca pliegan. La única señal es el cursor de mano y un leve aclarado del papel al pasar el mouse; para teclado, cada panel tiene un botón real invisible que muestra el foco sobre el panel entero. Plegadas quedan como una tira que sigue informando («Objetivo 4/7 · ronda 2/8», «Crisis 1/2», recursos con ícono y número). La barra de acción nunca desaparece: plegada conserva retrato, dados y «Terminar turno». Una crisis nueva despliega su tarjeta una vez. La tecla «H» pliega o despliega todo. El estado se recuerda entre partidas.
- **Globos de las chapas:** al pasar el mouse, con el foco de teclado o con una pulsación larga, cada chapa muestra en papel su nombre y una línea de descripción (los textos de la ficha V9). El globo va debajo de la chapa, sin taparla ni salir de la pantalla.
- **Cámara** (informe 123): el zoom mínimo cubre el área, así que el mapa nunca deja franjas. El enfoque de una localidad la lleva a cerca del 70 % del área libre, con tope en la resolución del fondo (2).
- **Recursos como chapas redondas con ícono:** fogata (moral), lata (comida), adulto y chico (indefensos), bolsa (residuos), cuenco (hambre). Desde los ajustes 2 de la sesión 7 son sellos de tinta sobre la barra de papel, con la etiqueta corta debajo del número (ver «Barra superior»).
- **Dados de acción con puntos**, como dados reales; el D12 conserva su forma y sus símbolos.
- **Rótulos de las localidades:** aparecen al mover el mouse sobre el mapa, al tocarlo o al desplazarlo, y se desvanecen tras unos segundos sin interacción; la localidad seleccionada conserva el suyo.
- **Movimiento:** los paneles entran y salen con transiciones fluidas, no de golpe; el cambio de localidad es rápido pero suave. Se respeta la preferencia de movimiento reducido. Desde el informe 122: fundido y 8–12 px desde el borde de donde viene cada panel, 200 ms de entrada y 180 ms de salida, solo opacidad y transformaciones, interrumpibles; con movimiento reducido, sin desplazamiento ni escala.
- **Resultados de encrucijadas** en viñetas grandes, de borde a borde, con la barra de resultado debajo.
- **Una sola barra para actuar** (informe 126). La barra de abajo es el único lugar de acción de turno. De izquierda a derecha:
  - **grupo** (ajustes): los retratos de todo el grupo flotan en círculos sobre el borde superior izquierdo de la barra; el activo lleva anillo Lámpara y tocar otro lo hace activo. Sin retrato, iniciales en tinta sobre papel, nunca un círculo vacío. Se pliegan con la barra;
  - **superviviente activo:** retrato, nombre, localidad, heridas y congelación, y tres ranuras de equipo (herramienta, arma, libro), con borde punteado si están vacías;
  - **dados**, y «+1 (1 comida)» solo cuando el motor permite mejorar uno;
  - **acciones:** Buscar, Atacar y Moverse, siempre visibles, y «Más»;
  - **«Terminar turno»**, separado por una línea de puntos.

  Una acción apagada sigue a la vista y muestra en el globo de papel el motivo que da el motor. Si el motor no da motivo, no tiene globo.
- **Abanico de «Más»:** un papel rasgado sobre la barra con las demás acciones de turno que el motor permite en ese momento (barricada, limpiar residuos, atraer, regresar, habilidad, «Cartas»). Se cierra al elegir, con Esc o tocando fuera.
- **Tira de la acción en curso:** una línea de papel sobre la barra que dice qué falta («Buscar en Biblioteca · elegí un dado de 3 o más») y lleva «Cancelar (Esc)». Los dados que el motor acepta se marcan en Lámpara y los demás se apagan.
- **Papel al centro:** lo que resuelve una acción (dados, cartas reveladas grandes y lado a lado, curación, crisis, fin de turno) va en papel rasgado al centro, sin tapar la barra. El movimiento no tapa el mapa: su confirmación es un papel chico justo sobre la barra.
- **Expediente** (la antigua ficha): solo información. Desde los ajustes 2 de la sesión 7 es un legajo con pestañas (ver «Legajo»); «Ajustes» y «Ayuda y atajos» están en el menú. Se abre y se cierra con el retrato o la tecla E, y se cierra también con Esc. Cerrado no ocupa pantalla. Tocar una ficha del mapa no lo abre: la hace activa en la barra.
- **Atajos de escritorio:**
  - B buscar, A atacar, M moverse;
  - E expediente;
  - 1–4 elegir dado en la acción en curso;
  - Espacio terminar turno (si el foco no está en un botón);
  - H plegar.

  Ninguno actúa con Ctrl, Alt o Mayús, dentro de un campo de texto, con una ventana obligatoria abierta ni durante el pase de dispositivo.
- **Casilla de tirada** (un solo componente para todos los dados animados del mapa): papel, título arriba («La noche en Biblioteca · Leo», «Exposición · Leo»), el dado centrado y «Tirando…» o el resultado abajo.
- **«Cartas»** (antes «Usar carta», en el abanico): papel al centro con dos secciones, «De uso» y «Equipables» (las que el motor deja equipar al superviviente activo, cada una con «Equipar»). Una sección vacía no se muestra. «Equipar» sigue también en el expediente.
- **Íconos de las ranuras:** herramienta, arma y libro con el mismo trazo (2 px, puntas redondas). El libro tiene tapas, lomo y canto de hojas.
- **Papel real:** relieve de arrugas y grano de un escaneo (`assets/interfaz/papel-fuente/`), grises en soft-light sobre el crema, con una variable por capa (`--papel-arrugas`, `--papel-grano`). Los bordes rasgados se generan con código: irregulares, con fibras y alguna muesca, distintos por panel y fijos (semilla por panel). La sangre seca y el oscurecido de bordes siguen en sus capas.
- **Tipografía en toda la interfaz:** la base de la página es Alegreya Sans, también en la barra superior, el zoom, el menú, los avisos y los rótulos. Los títulos y los números destacados (chapas, ronda, turno, contadores) van en Bitter.
- **Un solo estilo de botón** (ajustes 2), con material de la sesión 8: en la barra, **etiquetas de cartón** con muesca y ojal; en los papeles centrales, tinta sobre papel con borde fino. La sombra es siempre **blanda**, de lámpara, hacia abajo: la sombra dura desplazada se retiró. Apagados: desaturados. Lámpara sólido solo para «Terminar turno» (tabla pintada) y la acción principal de cada papel.
- **Papel de búsqueda:** mide según la cantidad de cartas (1, 2 o 3). Toda la carta es el botón «Conservar …».
- **Nada sobre el papel central:** mientras está abierto, Objetivo y Crisis se pliegan solas, sin cambiar lo guardado, y los rótulos del mapa quedan debajo.
- **Objetivo y Crisis:** del mismo ancho, en columna, debajo de la barra del zoom con el mismo margen. Plegadas, sus tiras también. Textos: «0 de 9 muestras · ronda 1 de 10» y «Si falla: 1 herida al de menor influencia en la colonia» (con artículo en todas las consecuencias).
- **Papeles centrales: opciones alineadas** (ajustes 2). Las opciones del mismo tipo (dados, cartas, destinos, supervivientes, elecciones) miden lo mismo y van en su propia fila o grilla. Las acciones van abajo a la derecha, a la misma altura, con textos cortos («Mejorar · 1 comida», «Cancelar»). Un solo título por papel y una línea de explicación. Los dados son casillas cuadradas iguales con puntos, como en la barra; el elegido lleva borde Lámpara, sin la palabra «seleccionado». Sin desplegables de «forma de…»: una alternativa sin dado (habilidad) es una casilla más del mismo tamaño («Sin dado · Manos hábiles»), y debajo va una línea en lenguaje claro, con singular y plural correctos («Construye 1 barricada en Biblioteca · quedan 2 accesos libres»). La acción principal apagada dice en su globo qué falta («Elegí un dado»).
- **Cartas de tamaño único** (ajustes 2): 220 × 336 px en búsqueda, «Cartas» y mochila, medidas para el texto más largo previsto (220 caracteres, «Hacha de bombero»), con la letra de siempre (15 px). Las cortas quedan con aire abajo, el lugar de la futura ilustración. Las copias iguales van en una sola ficha con «×N». Un papel que no entra muestra «Más abajo ▾» con un fundido en el borde y se desplaza con rueda, teclado y tacto.
- **Barra superior** (ajustes 2): papel rasgado, como tarjetas y barra; ronda, turno y recursos van en sellos de tinta con el número en Bitter y la etiqueta corta debajo (Ronda, Turno, Moral, Comida, Indefensos, Residuos, Hambre). La moral es la chapa más grande, con anillo. El zoom y el menú también son papel.
- **Legajo** (ajustes 2): pestañas arriba (Superviviente, Mochila, Colonia, Registro). Superviviente: foto con clip, apenas torcida, con «Legajo n.º X»; nombre en Bitter, oficio, rol, localidad y grupo; si hace guardia esta noche, un **sello de tinta azul oscura** «Guardia · recibe la tirada esta noche» (nunca rojo); Influencia, Ataque y Búsqueda en tres medallones; el daño con los símbolos del mapa en casillas llenas o vacías hasta el límite de muerte, y «muere a los N»; la habilidad a la vista, con su tipo (automática, botón o reacción) y si está disponible o ya se usó; tres ranuras de equipo iguales a las de la barra. Sin dados (están en la barra) ni desplegable de superviviente (se cambia tocando el grupo). Queda lugar para la ilustración y una o dos líneas de historia, que no se muestran mientras no haya datos. Se cierra con una «×» de papel, como cualquier botón; si no entra, se desplaza con «Más abajo ▾» (ajustes 3). «Ya se movió» va en su propia línea, debajo del daño. Si la habilidad es de botón, la ficha trae el botón con su verbo («Curar sin dado», «Construir sin dado»), apagado con el motivo cuando no se puede (ajustes 5).
- **Toque doble** (ajustes 2): el primer toque sobre un superviviente (mapa o grupo flotante) lo hace activo; uno sobre el que ya es activo abre su legajo. El retrato de la barra y la tecla E siguen abriéndolo. Nunca ejecuta una acción, y en el pase de dispositivo no abre nada.

### 8.1 Objetos a carbón (decisión del creador, 25/11/2026; informes 127 a 129)

La interfaz deja de ser «el mismo papel en todos lados». Cada panel es un **objeto distinto del mundo de la colonia**: encontrado, improvisado y gastado. Atmósfera a carbón: oscura, fría y granulada, con los objetos conservando su color pero apagado, como bajo una sola lámpara. Es un juego adulto de supervivencia.

**Queda fuera:**
- **Cómic:** contornos negros gruesos, sombras duras planas, onomatopeyas, globos de historieta, cartuchos de narrador.
- **Lo acogedor:** pizarras escolares, chinches de colores, fieltro verde, letra redondita.

**Reglas generales**
- **Sombras blandas de lámpara**, difusas y hacia abajo (`--sombra-lampara`); nunca la sombra dura desplazada.
- **Bordes ennegrecidos de hollín** (sombra interior suave), rasgados o gastados según el material. El giro leve, la intensidad del hollín, las manchas y la esquina quemada son fijos por objeto: salen de una semilla (`experiencia/carbon.mjs`), nunca de `Math.random`.
- **Mapa más oscuro:** menos saturación y brillo sobre la textura del fondo, viñeta negra en los bordes y grano de carbón generado. Todo se regula con variables CSS: `--mapa-saturacion`, `--mapa-brillo`, `--mapa-vineta` y `--mapa-grano`. Fichas, Lámpara y noche no pasan por ese filtro; la noche sigue encima, más azul y con escarcha.
- **Lámpara** `#F2C14E`, solo para resaltar: selección, «Terminar turno» y la acción principal. El **rojo de peligro** se usa solo como señal (comida o residuos en peligro, crisis), en un rojo óxido apagado (`#2F0802` sobre la chapa galvanizada, `#6E1F15` en marcador sobre cartón).
- **Botones** (informe 129): ningún botón queda con el fondo oscuro genérico bajo texto oscuro; sobre papel son etiquetas de papel crema. Todo texto de botón llega a 4,5:1.
- **Apagado** (barra, legajo, papeles, zoom y menú; informes 128 y 129): nunca se baja la opacidad del texto. Excepción anotada: el dado que no sirve para la acción en curso. Se reconoce por la falta de sombra (queda apoyado), el material apagado y el cursor de «no permitido». El texto mantiene 4,5:1 o más.
- **Sangre y óxido** como rastro en los bordes, nunca bajo el texto. Todo texto llega a contraste AA sobre su material; la tabla está en `MATERIALS` y una prueba la controla.
- **Tipografías nuevas** (§3): Caveat (lápiz), Stardos Stencil (esténcil), Special Elite (máquina de escribir) y Permanent Marker (marcador), solo para frases cortas. Bitter y Alegreya Sans siguen para títulos y reglas.

**Objeto por panel**

| Panel | Objeto | Detalles |
|---|---|---|
| Recursos (arriba), zoom y menú | **Chapa galvanizada** gris fría y oscura, atornillada, con hollín en los extremos y alrededor de los tornillos y mugre irregular (flor de zinc y mugre generadas con semilla en `experiencia/carbon.mjs`) | Cuatro tornillos en recursos, zoom y menú desplegable; dos en «Menú ▾». Controles como piezas estampadas. Números grandes en esténcil oscuro y etiqueta chica debajo. El óxido es solo señal: comida en peligro y residuos desde el límite. Comida en peligro: número en rojo óxido con un círculo a mano. Residuos: además del número, rayas de conteo raspadas en grupos de cinco. Ronda «3/10», separada por una línea. |
| Objetivo | **Hoja arrancada y doblada en cuatro** | Pliegues visibles, papel de siempre. A lápiz (Caveat) salvo el título (Bitter). Escarcha en una esquina, marca redonda de taza en el borde, apenas torcida. |
| Crisis | **Cartón** (`materiales/carton.webp`) con dos tiras de cinta americana gris | Título en marcador rojo óxido (Permanent Marker); detalle y consecuencia en Alegreya Sans. Una crisis nueva entra deslizándose y se asienta (sin movimiento reducido). |
| Legajo | **Carpeta manila de la policía, reutilizada** | Encabezado a máquina (Special Elite) «POLICÍA PROVINCIAL · LEGAJO N.º X», tachado; encima, a mano, «La Colonia — Mara». Foto como polaroid con clip metálico. Sello de guardia en tinta azul oscura, torcido. Medallones con los colores de las cartas: Influencia acero `#5D6B78`, Ataque sangre fría `#8E2F2A`, Búsqueda Lámpara `#D0A23A`. La habilidad en una ficha rayada con clip, con su botón. Pestañas como lengüetas de la carpeta. |
| Grupo flotante | **Polaroids** pegadas con cinta, levemente torcidas | La activa, con marco Lámpara. Una del grupo, siempre la misma, tiene la esquina quemada. |
| Barra de acción | **Tablón de cajón** (`materiales/tablas-gastadas.webp`) | «VÍVERES» en esténcil desvaído, fija contra las acciones (no se mueve cuando se oculta «Mejorar dado»; si no entra, no se muestra). En escritorio la barra no se pliega. Ranuras de equipo como huecos oscuros. Dados de acción sobre **lona azul**, de la familia de la manta, con los puntos en tinta oscura fija. Botones como **etiquetas de papel crema** con muesca. «Terminar turno», una tabla pintada de Lámpara con letra de esténcil: único acento cálido de la barra. |
| Papeles centrales | **Papel**, con sombra blanda y hollín | Regla de alineación de los ajustes 2. En la búsqueda, las cartas se apoyan sobre una **manta azul tejida**; dos y tres cartas entran en fila. Carta de búsqueda, provisoria hasta el hito 2: papel con textura, tipo en esténcil arriba y un recuadro vacío para la ilustración (no se inventan ilustraciones). |
| Avisos del mapa | **Nota chica a lápiz, clavada** | No es un globo. Por ahora sigue en su lugar de siempre, arriba al centro; falta llevarla junto a la ficha (informe 127). |
| Dado D12 | **D12 de hueso en 3D** (Three.js, chunk aparte) | Marfil gastado con los símbolos tallados y la pintura medio saltada: roja, salvo el copo de la congelación en celeste (Escarcha); cae en la cara que dio el motor. Los dados de acción siguen en 2D. |

## 7. Pendiente

- ~~Ajuste de color del mapa~~: resuelto en §8 (filtro frío aprobado).
- Sets de expresiones de los supervivientes y viñetas de la primera encrucijada con la paleta nueva.
