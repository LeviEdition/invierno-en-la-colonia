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

## 7. Pendiente

- **Ajuste de color del mapa aprobado:** el mapa es violeta y la paleta nueva es azul y gris. Probar un ajuste de color sobre la ilustración existente, sin redibujarla, y decidir si se adopta.
- Sets de expresiones de los supervivientes y viñetas de la primera encrucijada con la paleta nueva.
