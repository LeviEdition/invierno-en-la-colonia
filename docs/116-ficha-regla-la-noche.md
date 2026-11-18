# 116 — Ficha de la regla «La noche»

18/11/2026. Regla aprobada por el creador, implementada como **regla de prueba** (apagada por defecto) para confirmar sus valores jugando. Rama `feature/reglas-de-prueba`. Detalle de la entrega en [117](117-reglas-de-prueba-y-un-grupo.md).

## Qué hace

Al final de cada ronda, **después de la fase de colonia**, cada localidad exterior con al menos un superviviente del grupo humano recibe **una tirada del D12 de exposición del mapa**.

| Caras | Resultado |
|---|---|
| 6 de 12 | Sin efecto |
| 3 de 12 | Herida |
| 2 de 12 | Congelación |
| 1 de 12 | Mordedura |

Es el mismo D12 que ya usan movimiento y combate en el mapa ([102](102-dado-exposicion-d12.md)). Los dados de acción y el riesgo de contagio conservan su D6.

## Lo aprobado

- **Una tirada por localidad exterior ocupada**, no por superviviente. Dos personas en el mismo lugar reciben una sola tirada entre las dos.
- **La recibe el de menor influencia** de esa localidad. El empate se resuelve por el **orden del grupo** (el primero de `game.humans`).
- **La colonia nunca tira.** Dormir bajo techo no expone.
- **El grupo de la IA no tira.** La regla es del singleplayer.
- **La mordedura sigue el flujo normal existente**: muerte, contagio a los acompañantes de la localidad, decisión de sacrificar o arriesgar, sucesión del liderazgo y avisos. No hay un camino aparte.
- Si una mordedura queda pendiente de decisión, **la noche se detiene**: las localidades que faltaban no tiran esa noche. La ronda siguiente no abre hasta resolverla.
- **Solo para el singleplayer**: aplica en modo contra la IA (solo al grupo humano) y en modo «un grupo». **En dos jugadores locales la opción no existe.**

## Regresar a la colonia

Acompaña a «La noche» porque es su contrapeso: sin una forma de volver, quedarse afuera sería una trampa.

- Acción para un superviviente humano **fuera de la colonia**, **haya movido o no**.
- **Cuesta un dado de acción de cualquier valor.**
- **No tira exposición** y **solo lleva a la colonia**.
- **El movimiento normal a la colonia no cambia**: sigue siendo gratis y con exposición.

## A confirmar jugando

- **Comida inicial: 6 u 8.** El laboratorio midió la regla con un grupo solo y encontró que 6 deja la partida muy ajustada cuando alguien muere de noche ([113](113-laboratorio-sp04-quinta-corrida.md)); con 8 y 10 la cooperativa vuelve al rango objetivo ([115](115-laboratorio-sp04-septima-corrida.md)). El panel ofrece 6, 8 y 10 para decidir en la mesa. **Ninguna cifra está fijada.**
- **Si «Regresar a la colonia» debe marcar al superviviente como movido.** Hoy **no** lo marca: es una acción con dado, no un movimiento, así que no bloquea un movimiento posterior. El dado que cuesta ya limita el ir y venir. Queda por ver si en la mano se siente abusivo.
- **Si una tirada por localidad es suficiente tensión** o conviene una por superviviente.

## Dónde vive

Las consecuencias están en el motor único: `src/domain/reference-night.mjs` (a quién le toca y en qué orden) y `src/application/reference-engine.mjs` (cuándo se resuelve, al cerrar `colony()`). La interfaz solo rotula: «dormirá afuera» y «hace guardia esta noche» en la ficha, y el resultado de cada tirada como aviso normal.
