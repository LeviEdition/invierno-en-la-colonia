# 105 — Ficha de capítulo: «La última guardia» (campaña *Una luz de esperanza*)

17/11/2026. Ficha de diseño del primer capítulo piloto, a partir del [informe 104](104-informe-avances-singleplayer.md). Sirve para implementar y probar **un solo capítulo** sin convertir hipótesis de balance en reglas. Cada línea indica si es **acordado** (decisión del creador registrada en 104) o **pendiente**.

## 1. Propósito

Probar dentro de una partida real que la campaña avanza por lo que los supervivientes **observan, deducen o comunican**, y que una muerte no corta la historia: lo comunicado queda en la colonia. Es también la primera prueba del Director con memoria (SP-05) y de un encuentro activado por condiciones (SP-03).

## 2. Términos

- **Encuentro (en la campaña):** escena activada cuando coinciden una acción, un lugar y hechos que la colonia conoce. *No* es el «Encuentro» de [63 §6.2B–C](63-hoja-de-ruta-planificacion-singleplayer.md), que designa historias secundarias reutilizables de personajes. Ver la nota de 63.
- **Conocimiento de la colonia:** pistas comunicadas, testigos, decisiones, bajas y personas incorporadas que conserva el Director (acordado, SP-05). Lo que un superviviente descubre y comunica sobrevive a su muerte.

## 3. Elenco y lugares

| Elemento | Papel | Estado |
|---|---|---|
| La colonia | Protagonista de la campaña; un relevo de líder continúa la historia con los hechos acumulados | Acordado |
| El médico | El grupo lo encuentra **antes** de ir al hospital: ese encuentro dispara el capítulo. Acompaña al grupo al hospital, donde queda en peligro y hay que rescatarlo. Al incorporarse habilita Atención médica | Acordado (17/11) |
| Elena Varela | Investigadora desaparecida con cuadernos sobre una posible cura; objetivo de la pista | Acordado |
| Hospital: Admisión y tablón | Lugar donde se identifica el último traslado de Maternidad | Acordado |
| Registro del hospital | Consultable directamente si alguien de la colonia conoce el apellido «Varela» | Acordado |
| Escuela | Destino del vehículo del traslado; su llegada queda abierta para el capítulo siguiente | Acordado |

**Versión final (creador, 17/11):** el médico se encuentra antes de ir al hospital y ese encuentro es el disparador del capítulo; después acompaña al grupo y el rescate ocurre en la puerta del hospital. **Pendiente:** dónde y cómo se lo encuentra (localidad y condición).

## 4. Secuencia y disparadores

| Paso | Disparador | Qué conoce la colonia después | Estado |
|---|---|---|---|
| 0. Encuentro con el médico | Encuentro de campaña previo al hospital (localidad y condición pendientes) | El médico acompaña al grupo; la colonia conoce el rastro de Elena Varela y el motivo para ir al hospital | Acordado (17/11) |
| 1. Pista en Admisión | Un superviviente del grupo, con el médico, busca o se mueve a Admisión del hospital | El mensaje del tablón identifica el último traslado de Maternidad | Acordado |
| 1b. Atajo por registro | Alguien de la colonia conoce el apellido «Varela» | Consulta directa del registro, sin pasar por el tablón | Acordado |
| 2. Destino | Pista del paso 1 o 1b | El vehículo salió rumbo a la escuela; su llegada es una pregunta abierta | Acordado |
| 3. Comunicación | El hallazgo se comunica **antes** del rescate | La pista queda en la colonia aunque quien la encontró muera | Acordado |
| 4. Puerta del hospital | Decisión de rescate (§5) | Médico rescatado o destino desconocido | Acordado, con problema abierto |

El jugador puede investigar en distinto orden (acordado, SP-07): objetivo visible y diario con las pistas conocidas.

## 5. Decisión central: la puerta del hospital

| Opción | Consecuencia | Estado |
|---|---|---|
| Retirarse | El superviviente queda en la localidad del hospital. El destino del médico es desconocido | Acordado |
| Ayudar estando a una herida de morir | El primer intento revela la gravedad y abre una segunda decisión; todavía puede retirarse | Acordado |
| Comprometerse con el rescate | El médico escapa. **Una única tirada de exposición** (D12 del [PR #27](https://github.com/LeviEdition/invierno-en-la-colonia/pull/27)) resuelve qué le pasa al rescatista. Si ambos sobreviven, vuelven juntos y el superviviente queda disponible la ronda siguiente. Si muere, el médico vuelve solo | Acordado, con problema abierto |

### 5.1 Problema abierto: morir en el rescate no cuesta nada

Con el D12, un rescatista a una herida de morir muere en el 50 % de las tiradas (herida 25 % + congelación 17 % + mordedura 8 %). Si muere, la colonia pierde un superviviente pero gana al médico y Atención médica; si vive, tiene a los dos. Mandar al herido es siempre la mejor jugada y «Retirarse» deja de ser una opción real. Es el mismo patrón que encontró el laboratorio SP-04: una muerte cuesta poco.

Alternativas para que la muerte del rescatista pese dentro del encuentro (**pendiente de decisión del creador**):

| Alternativa | Qué experimenta el jugador | Ventaja | Riesgo |
|---|---|---|---|
| A. El médico vuelve herido o en shock y no ayuda durante 1–2 rondas | «Lo salvé, pero me costó a Leo y todavía no puedo usarlo» | Simple; reutiliza heridas | Puede sentirse como castigo diferido poco visible |
| B. Moral extra por la muerte del rescatista (por ejemplo, −1 adicional) | La colonia reacciona a que el líder mandó a alguien a morir | Coherente con «la muerte debe pesar»; fácil de medir | Si el costo general de muerte ya sube, puede duplicarse |
| C. El médico desconfía del líder que lo mandó y no atiende al líder durante el capítulo | La relación con el rescatado cambia por la decisión | Consecuencia narrativa persistente (SP-05) | El informe 104 descartó la reputación personal con el líder para el piloto |

Recomendación de Claude: **A**, porque no reabre la reputación personal que el piloto descartó.

**Efecto de la dirección del 17/11 sobre la muerte (ver §5.2):** si una muerte cuesta más moral a la colonia y el equipo del rescatista se pierde o queda en el hospital, ganar al médico deja de ser gratis y «Retirarse» vuelve a ser razonable. En ese caso A pasa a ser opcional. Medir en el laboratorio con y sin A.

### 5.2 Dirección del creador sobre la muerte (17/11)

- La muerte de un superviviente golpea a **la colonia**, que es la protagonista: más pérdida de moral por cada muerte (cifra a medir; candidata −2 por superviviente, −1 por indefenso).
- Al morir, la colonia **pierde el equipo y las habilidades** del personaje. Hoy el motor devuelve el equipo a la mano si muere en la colonia y lo mezcla en el mazo de la localidad si muere afuera. Variantes a medir: equipo perdido del todo, o equipo que queda donde murió (recuperable volviendo).
- Riesgo a vigilar: una mordedura con contagio puede costar dos muertes en un turno.

## 6. Recompensa: Atención médica

- Cura una herida normal a un superviviente herido presente en la colonia, priorizando al de mayor influencia (propuesta, informe 104).
- **Pendiente:** frecuencia y primera activación. Con el D12 las heridas suben del 17 % al 25 % por exposición, así que el médico vale más; la frecuencia tiene que evitar que las heridas se vuelvan triviales. Medir en el laboratorio.

## 7. Fuera de este capítulo

- Llamado por radio: posibilidad para el capítulo siguiente.
- Intervención de la secta: requiere una causa que explique cómo obtuvo información sobre la colonia.
- Llegada del vehículo a la escuela: capítulo siguiente.

## 8. Dependencias antes de implementar

1. **D12 integrado** (PR #27).
2. **Segunda corrida del laboratorio** con el D12: indefensos, comida inicial, crisis agravada, costo de muerte y duración del objetivo; más una variante del rescate para medir cuánto conviene sacrificar al rescatista con cada alternativa de §5.1.
3. **Decisión del creador** sobre §5.1 (si A sigue haciendo falta) y sobre dónde y cómo se encuentra al médico (§3).

## 9. Criterio de aceptación del capítulo jugable (para el futuro encargo)

- Se puede llegar a la pista por el tablón o por el registro, en distinto orden, y el diario la muestra.
- Si quien encontró la pista muere después de comunicarla, la campaña continúa.
- En la puerta, «Retirarse» es una opción que un jugador razonable elige en algunas partidas.
- La tirada del rescate es una sola, se ve en el dado y coincide con el Registro.
- El capítulo termina con el médico incorporado o con su destino desconocido, y la colonia conserva lo que supo.
