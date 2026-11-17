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

**Versión final (creador, 17/11):** el médico se encuentra antes de ir al hospital y ese encuentro es el disparador del capítulo; después acompaña al grupo y el rescate ocurre en la puerta del hospital. **Dónde y cómo (M1, adoptada):** en el Supermercado, la primera vez que un superviviente busca ahí desde la ronda 2.

**Origen del apellido (creador, 17/11):** el médico sabe que Elena se apellida Varela porque eran colegas. Si el médico acompaña al grupo al hospital, se puede ir directo al registro (menos búsquedas, menos ruido y, por M3, una horda menor en la puerta); si no está con el grupo (por ejemplo, llegó por la válvula de M6 y se quedó en la colonia), hay que pasar por el tablón de Admisión.

## 4. Secuencia y disparadores

| Paso | Disparador | Qué conoce la colonia después | Estado |
|---|---|---|---|
| 0. Encuentro con el médico | Primera búsqueda en el Supermercado desde la ronda 2 (M1); válvula en la ronda 4 (M6) | El médico acompaña al grupo; la colonia conoce el rastro de Elena Varela y el motivo para ir al hospital | Acordado (17/11) |
| 1. Pista en Admisión | Un superviviente del grupo, con el médico, busca o se mueve a Admisión del hospital | El mensaje del tablón identifica el último traslado de Maternidad | Acordado |
| 1b. Atajo por registro | El médico está con el grupo y aporta el apellido «Varela» (colega de Elena) | Consulta directa del registro, sin pasar por el tablón | Acordado |
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
3. La alternativa A de §5.1 se decide con el laboratorio.

## 9. Criterio de aceptación del capítulo jugable (para el futuro encargo)

- Se puede llegar a la pista por el tablón o por el registro, en distinto orden, y el diario la muestra.
- Si quien encontró la pista muere después de comunicarla, la campaña continúa.
- En la puerta, «Retirarse» es una opción que un jugador razonable elige en algunas partidas.
- La tirada del rescate es una sola, se ve en el dado y coincide con el Registro.
- El capítulo termina con el médico incorporado o con su destino desconocido, y la colonia conserva lo que supo.

---

## 10. Mejoras y cronología (propuesta de Claude, decidida por el creador el 17/11/2026)

**Adoptadas:** M1, M3, M4, M5, M6 y M7. **No adoptada:** M2. **Alternativa A del rescate (§5.1):** se decide con la segunda corrida del laboratorio, midiendo el rescate con y sin A.

### 10.1 Mejoras

| # | Estado | Mejora | Problema que resuelve | Qué experimenta el jugador |
|---|---|---|---|---|
| M1 | **Adoptada** | **El médico aparece al abastecer:** encuentro de campaña en el **Supermercado**, la primera vez que un superviviente busca ahí desde la ronda 2. Estaba juntando medicamentos y comida | El laboratorio mostró que abastecer no tiene incentivo; así la historia avanza también por abastecer, no solo por el objetivo | «Fui a buscar comida porque no quedaba, y encontré al médico» |
| M2 | No adoptada | **El apellido se gana:** el médico solo sabe «Elena, de Maternidad». El apellido «Varela» aparece en un cuaderno en la **Biblioteca** (búsqueda de notas) | Hoy no está definido de dónde sale el apellido; así el atajo del registro premia explorar y une historia con objetivo | «Si paso antes por la Biblioteca, en el hospital voy directo al registro y busco menos» |
| M3 | **Adoptada** | **Buscar en el hospital hace ruido y el peligro de la puerta depende de eso:** el rescate se dispara cuando el médico entra a Maternidad y la horda llega; su gravedad depende de los zombis en los accesos del hospital | Conecta el clímax con decisiones previas, en lugar de un evento fijo | «Busqué tres veces sin el apellido; ahora la puerta está llena» |
| M4 | **Adoptada** | **Comunicar con testigo:** la pista se comunica al instante si hay otro superviviente o el médico en la misma localidad; si no, cuando quien la encontró vuelve a la colonia | Le da forma jugable a «comunicar antes del rescate» y usa los testigos del Director (SP-05) | «Mando a dos juntos al hospital: si uno cae, el otro ya sabe» |
| M5 | **Adoptada** | **Retirarse siembra el capítulo siguiente:** si el grupo abandona al médico, sobrevive y lo captura la secta; así la secta sabe de la colonia | Resuelve la causa pendiente de la secta y da la consecuencia visible varias rondas después que pide la hoja de ruta | En el capítulo 2: «La secta sabe dónde estamos. El médico se lo dijo» |
| M6 | **Adoptada** | **Válvulas de avance:** si en la ronda 4 nadie buscó en el Supermercado, el médico llega herido a las puertas de la colonia; si en la ronda 6 nadie entró al hospital, el médico va solo y el rescate ocurre igual | Evita que el capítulo se trabe por un orden de juego imprevisto, sin quitar libertad | El capítulo avanza siempre, pero llegar tarde tiene costo |
| M7 | **Adoptada** | **Crisis alineadas por el Director:** crisis de comida en el acto I (empuja al Supermercado) y de medicina en el acto III (hace visible el valor del médico) | Las crisis acompañan la historia en lugar de competir con ella | «Justo cuando falta medicina, tengo un médico, si lo salvo» |

### 10.2 Cronología propuesta (8 rondas)

Las rondas son ventanas, no fechas fijas: el jugador puede adelantarse. Duración de 8 rondas porque el laboratorio mostró que con objetivos de 6 correr domina y con 10 abastecer importa; se confirma con la segunda corrida.

| Acto | Rondas | Qué pasa | Decisión del jugador | Presión de supervivencia |
|---|---|---|---|---|
| I. La colonia aguanta | 1–2 | Arranque con tres supervivientes, indefensos y poca comida. Crisis de comida | Quién sale a abastecer y quién defiende | Comida baja, indefensos que comer |
| II. El médico | 2–4 | Encuentro en el Supermercado (M1). El médico cuenta lo de Elena y Maternidad. Válvula en R4 (M6) | Incorporarlo al grupo que va al hospital o mandarlo a la colonia primero | El médico es una boca más hasta que ayude |
| III. El hospital | 4–6 | Admisión y tablón, o registro directo con el apellido. Pista del traslado a la escuela. Se comunica según M4. Crisis de medicina (M7) | Cuántas veces buscar y con quién; dejar o no un testigo | El ruido carga los accesos del hospital (M3) |
| IV. La puerta | 5–7 | El médico entra a Maternidad y la horda llega. Decisión central (§5): retirarse, ayudar con la segunda decisión, o comprometerse. Una tirada D12 | Arriesgar o no al rescatista | Costo de muerte para la colonia (§5.2) |
| V. Regreso | 6–8 | Vuelta a la colonia. Atención médica disponible desde la ronda siguiente. Diario con la pista de la escuela | Usar la primera curación en quién | La colonia sigue comiendo y defendiéndose |
| Cierre | 8 | El capítulo termina si la colonia conoce el destino del traslado y sigue en pie. Gancho: la radio, y si se retiró, la secta (M5) | — | — |

### 10.3 Desenlaces posibles

| Desenlace | Condición | Qué se lleva el capítulo 2 |
|---|---|---|
| Rescate completo | Médico y rescatista vuelven | Atención médica, grupo entero, pista de la escuela |
| Rescate con baja | El rescatista muere | Atención médica, menos moral, equipo perdido o en el hospital |
| Retirada | El grupo abandona al médico | Sin Atención médica; la secta conoce la colonia (M5) |
| Pista sin médico | Válvula de la ronda 6 y rescate fallido | Pista de la escuela; destino del médico desconocido |
| Derrota | Moral 0 o sin supervivientes antes de la pista | Repetir el capítulo |
