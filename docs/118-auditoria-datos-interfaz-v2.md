# Auditoría de datos del mapa para la interfaz v2

Rama `feature/reglas-de-prueba` · código leído en `1e37467`. Las rutas abreviadas del mapa parten de `app/mapa/`. **P** designa `estado/projection.mjs` → `projectVisibleState`. Los números ausentes se proyectan como `null`.

**Recorrido y privacidad.** `estado/reference-observer.mjs` → `observeReferenceView` agrupa avisos como `draw` y `showPass` en una microtarea. `motor/reference-host.mjs` envía `broker.project(state)` por el puerto. `main.mjs` → `receive` entrega el estado a la vista. En el pase, P devuelve listas vacías. Si el adaptador gestiona el ciclo, `ciclo/broker.mjs` → `snapshot` puede releer el tablero público con `readPublic()` conservando el bloqueo. Los datos A y B son públicos en local. Para mantenerlos visibles durante el pase, consumir solo esos campos. Manos, dados y registro privado quedan ocultos. `juego/broker.mjs` → `snapshot` vacía `log` y `last` y suprime `play.events` en el pase.

**Noche y regreso.** El host escucha `subscribeCycle`. `ciclo/broker.mjs` → `capturePresentation` guarda `before` y `presentation` por tirada nocturna, antes de agrupar los envíos. Para `return-home`, `juego/broker.mjs` → `handle` captura ambos estados y el evento `move`. `experiencia/event-presentations.mjs` → `update` ordena su presentación e interrumpe la cola en el pase. Una animación puede mostrar un estado anterior al último recibido.

### A. Supervivientes

P recorre `g.humans` y `g.bots`. El segundo grupo representa a J2 en local o a la IA cuando corresponde. Si está vacío, se omite. La selección nocturna en `src/domain/reference-night.mjs` → `continueNight` usa `game.humans`.

| Dato | Llega al mapa | Dónde | Público o privado | Cuándo se actualiza | Falta |
|---|---|---|---|---|---|
| Heridas actuales | Sí, en vivos | P → `characters[].wounds` | Público | Tras daño o cura, incluida la exposición nocturna y la herida por frío al inicio del turno. El regreso especial conserva el total. | Nada para vivos. |
| Congelaciones actuales | Sí, en vivos | P → `characters[].frost` | Público | Tras exposición o cura, incluida cada tirada nocturna. El regreso especial conserva el total. | Nada para vivos. |
| Está muerto | Parcial | P filtra `!p.dead`. `src/application/map-cycle.mjs` → `facts` sí incluye `people[].dead` en los estados del paso. Movimiento y ataque también pueden entregar `actorAfter.dead`. | Público | Al resolverse la muerte, también de noche. El regreso especial no tira exposición. | Para consultar fallecidos en cualquier momento, proyectar sus identificadores por separado. La ausencia de una ficha no certifica muerte. |
| Localidad | Sí, en vivos | P → `characters[].locationId` y `locations[].characterIds` | Público | Al mover. `src/application/reference-engine.mjs` → `returnHome` fija `loc=0` (`place-0`). La noche conserva el lugar de quienes siguen vivos. | Nada para vivos. Última localidad de un fallecido solo si se añade al contrato persistente. |

### B. Localidades

| Dato | Llega al mapa | Dónde | Público o privado | Cuándo se actualiza | Falta |
|---|---|---|---|---|---|
| Ruido actual | Sí | P → `locations[].noise` desde `z.noise` | Público | Al hacerlo y al resolver el paso de ruido de colonia, antes de «La noche». Se limpia por localidad procesada. Volver no lo cambia. | Nada. |
| Máximo y umbral de ruido | Parcial | `src/application/reference-engine.mjs` → `addNoiseSearch` corta en 4. Llega `canNoise` para la búsqueda, condicionado también por el mazo. Con cada ficha, la resolución de colonia comprueba `d<=3` en un D6. | Reglas públicas | Son reglas fijas. El permiso de búsqueda cambia con la operación. | P no expone los valores numéricos. El tope de fichas y el umbral de la tirada son distintos. |
| Zombis | Sí | P → `locations[].zombies` desde `z.z` | Público | Tras ataque o llegada, también por población o ruido en colonia. El regreso no añade zombis por sí mismo. | Nada. |
| Barricadas | Sí | P → `locations[].barricades` desde `z.b` | Público | Al construir o interceptar una llegada, también en colonia. El regreso no altera la cantidad. | Nada. |

**Dibujo actual.** `map-view.mjs` → `updateUI` escribe heridas y congelaciones en `#character-state` al seleccionar al superviviente y ruido en `#locality-exterior` al seleccionar la localidad. El render de la escena carece de un indicador permanente de esos tres valores. `busqueda/search-panel.mjs` muestra además el ruido de la operación y `ciclo/presentation.mjs` → `describeCycleStep` muestra cambios del paso.

### Lo mínimo a cambiar, de menor a mayor riesgo

1. **Consumo de datos existentes.** Para los vivos y las cantidades por localidad alcanza la proyección actual. Usar sus valores públicos, incluidos `occupied`, `available`, `exteriorAvailable` y `night.watch` cuando correspondan. Mantener la privacidad del pase sin recuperar el último estado completo.
2. **Límites y fallecidos.** Si se necesitan los límites numéricos, exponer los del motor. Si se necesita un listado actual de bajas, añadirlo a P sin cambiar el significado de `characters` ni el conteo de ocupantes. No deducir muerte del daño ni permiso de búsqueda del ruido.
3. **Daño nuevo desde la última ronda.** No hay un campo proyectado con esa semántica. Los cambios de un paso son transitorios. `frostFresh` es interno y `src/application/reference-turns.mjs` → `applyFrost` lo consume para la gracia nocturna. Si v2 necesita esa distinción, acordar el límite exacto de ronda y exponer desde el motor la última ronda de alta de cada tipo de daño. Comparar totales en la interfaz perdería altas seguidas de curación.
