# 11 — Auditoría narrativa de las encrucijadas de V9.9

**Estado:** análisis del comportamiento real, sin modificar mecánicas. **Rama:** `refactor/arquitectura`.

## 1. Inventario y estructura actual

La versión V9.9 incluye **26 encrucijadas** dentro del arreglo global `crossroadsDeck`:

| Disparador (`when`) | Historias |
| --- | ---: |
| `round` — inicio de turno | 6 |
| `move` — movimiento | 6 |
| `search` — búsqueda | 10 |
| `attack` — combate | 4 |

Cada carta tiene un título, un texto, dos opciones y efectos inmediatos ejecutados por funciones JavaScript dentro de `choices`. Algunas poseen `require` para exigir influencia, liderazgo o localidad específica.

`crossDraw()` extrae una carta sin repetir hasta agotar el mazo y luego vuelve a mezclar. El sistema mantiene **una carta oculta por turno**: se revela solo si coincide la clase de acción y se cumplen requisitos. Si no ocurre el disparador, la historia puede no aparecer.

`crossTrigger()` guarda el ID del actor, comprueba el propietario de la carta, bloquea nuevas activaciones cuando ya hay una opción pendiente o resuelta, y abre el modal. `resolveCross()` aplica inmediatamente una de las dos consecuencias y llama a `verify()`.

En modo local, J2 selecciona su opción. En modo humano + IA, la IA elige y espera a que el usuario pulse «Continuar turno».

## 2. Qué funciona y vale la pena conservar

- Los acontecimientos se conectan con acciones reales del tablero.
- Hay requisitos contextuales de habilidades, influencia y localidad.
- Las decisiones pueden afectar alimentos, moral, zombis, barricadas, indefensos, reclutamiento y cartas.
- El propietario de la historia determina qué mano recibe los objetos.
- Una opción ya resuelta no puede aplicarse dos veces durante el mismo turno.
- El modo local permite que cada jugador tome decisiones propias.
- Ya existe una presentación visual capaz de mostrar la decisión automatizada de la IA.

Esto es una **semilla narrativa útil**. No es necesario tirarla y empezar de cero.

## 3. Problemas y límites comprobados

### Historia sin memoria persistente

La V9.9 no tiene en `game` campos estructurados de historial de decisiones, banderas de historia, relaciones, facciones, promesas, arcos narrativos o eventos programados para rondas futuras. Las cartas alteran recursos en el momento y luego se descartan. El registro `game.log` conserva mensajes recientes, pero no constituye un historial consultable por reglas futuras.

**Resultado:** decisiones importantes pueden sentirse como anécdotas aisladas. Incluso las opciones con consecuencias fuertes no generan explícitamente episodios posteriores condicionados por aquella elección.

### Cartas reconocidas incorrectamente

[#2 — Requisitos de objetos en las encrucijadas](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2): `crossOptionAllowed()` consulta `hand.includes('medicina')` o `hand.includes('combustible')`, aunque en la mano inicial se guardan objetos como `{kind:'medicina',cardId:'bandage'}`. Se bloquean opciones válidas. Algunos efectos usan `indexOf()` con el mismo error.

Además, algunas recompensas narrativas agregan **cadenas de texto** a la mano, mientras otras agregan objetos creados con `catalog.create()`. El catálogo interpreta parte de los formatos antiguos, pero la mezcla dificulta validaciones y pruebas; debemos normalizarla después de acordar la solución, sin romper partidas.

### Elección de IA basada en redacción

[#7 — La IA interpreta descripciones, no consecuencias](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7): en `crossTrigger()` se busca una opción cuyo texto no contenga cuatro expresiones regulares de costos. En la carta `La radio encendida`, la IA elige atraer **dos zombis** porque la frase «llegan 2 zombis» no coincide con «+2 zombis».

No es una valoración contextual del riesgo ni de las convicciones del personaje.

### Consecuencias sin continuidad

Los efectos suelen ser ajustes numéricos inmediatos. Faltan personajes secundarios memorables, deudas, conflictos entre facciones, alianzas, traiciones, información, opciones ligadas al historial y finales de arco.

El requisito de «una carta oculta por turno» limita la frecuencia de apariciones. En un juego guiado por narrativa, las escenas centrales deben poder activarse por su **relevancia dramática**, no solamente cuando se extrae por azar una carta compatible.

## 4. Pruebas agregadas

`tests/encrucijadas.test.mjs` contiene **26 pruebas de caracterización**, incluyendo:

- Estructura del mazo y extracción sin reemplazo.
- Desencadenantes correctos y erróneos, propietario y partida finalizada.
- Actor responsable, liderazgo, influencia y localidades.
- Elección humana y protección contra aplicación duplicada.
- Validación de comida y capacidad de colonia.
- Consecuencias de negociar, aceptar refugiados y ayudar en el hospital.
- Recompensas narrativas en formatos antiguos.
- Reproducción de opciones incorrectamente bloqueadas por el defecto #2.
- Resolución de IA, caso de riesgo mal interpretado (#7).
- Decisiones manuales de J2 y destino de objetos.
- Ausencia de estado narrativo persistente.

**Resultado local:** 26 aprobadas, cero fallidas sobre copia idéntica de la V9.9. GitHub Actions ejecutará la suite acumulada. Las pruebas de los bugs documentan **el comportamiento anterior a la corrección**, no un objetivo que debamos preservar.

## 5. Siguiente decisión de diseño

Como el proyecto será **narrativo primero**, proponemos crear un sistema de historias conectadas y consecuencias diferidas ANTES de desarrollar escenas isométricas. El documento `docs/12-vision-narrativa-persistente.md` describe el diseño propuesto, y `docs/13-arco-piloto.md` desarrolla un ejemplo.

**Ninguna historia nueva ni estructura persistente se ha implementado todavía.** Primero validaremos su tono y alcance con el usuario.

## 6. Comprobación local

```powershell
git switch refactor/arquitectura
git pull --ff-only
npm test
```

El siguiente bloque de trabajo ya no debería limitarse a agregar encrucijadas aleatorias: corresponde diseñar y probar el primer **arco conectado con memoria**, como una pequeña pieza vertical del futuro videojuego.
