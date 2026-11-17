# 107 — Laboratorio SP-04, segunda corrida: que la muerte pese a la colonia y abastecer importe

17/11/2026. Rama `experiment/sp04-laboratorio-un-grupo`, con `main` traído por merge (`5a7a1ba`: D12 integrado por el PR #27, fichas 104 y 105). Primera corrida: [106](106-laboratorio-sp04-un-grupo.md). Código en `lab/sp04/`; resultados agregados en `lab/sp04/resultados/segunda-corrida/`. No se tocan `src/`, la referencia V9.9, el mapa ni los CSV de la primera corrida. **Ninguna cifra de este informe es una regla aprobada.**

**Pregunta:** con las decisiones del creador del 17/11 (la muerte golpea a la colonia y se pierden equipo y habilidades; la exposición usa el D12), ¿qué combinación de indefensos, comida inicial, crisis, costo de muerte y duración del objetivo hace que correr a las muestras deje de dominar sin que la política que abastece baje del ~35 % de victoria? ¿Hace falta la alternativa A del rescate ([105 §5.1](105-ficha-capitulo-la-ultima-guardia.md))?

**Respuesta corta (DATOS):**

1. **Con la métrica pedida, correr no dominó nunca.** La ventaja de correr (victoria de «objetivo» − victoria de «cooperativa») ya era negativa en la configuración de la primera corrida (−11,7 puntos con D6). Es negativa en 28 de las 29 combinaciones de la cadena v2 y en las 26 de la cadena v1 (`ventaja.csv`); la excepción (+1,2) es una celda donde las dos políticas pierden más del 94 %. Lo que la primera corrida mostró como «correr domina» era que correr ganaba sin costo frente a abastecer a secas; frente a la cooperativa, que también corre pero deja un defensor y aporta a la crisis, no.
2. **El D12 amplía esa brecha:** la cooperativa sube de 59,6 % a 70,4 % y «objetivo» queda igual (47,9 → 47,5 %), porque las mordeduras bajan a la mitad (16,5 → 8,5 % de las exposiciones) y las heridas, que la cooperativa cura, suben (15 → 24 %).
3. **Moral −2 por muerte** baja unos 7 puntos a la cooperativa y unos 5 a «objetivo». Además, multiplica por seis las partidas de «objetivo» que terminan por una muerte doble (4 → 26–29 %). **El destino del equipo no mueve a la cooperativa** (±2 puntos). «Perdido» le da a «objetivo» unos 4 puntos, consistente con que en V9.9 el equipo del muerto diluye el mazo donde cae.
4. **Los indefensos son la palanca más fuerte y castigan sobre todo a quien abastece**, por el hambre. Dos indefensos le quitan a la cooperativa ~33 puntos (68,7 → 35,7 %) y cuatro la dejan en 12 %. La brecha se achica: con cuatro indefensos y sin comida, correr y abastecer empatan en la derrota.
5. **La duración decide si correr sirve:** con 6 rondas, «objetivo» gana el 55 %; con 8, el 16 %; con 10, el 2 %. La crisis agravada pesa poco (−3 puntos).
6. **Rescate del médico simplificado:** siempre retirarse gana a siempre rescatar por 7 a 15 puntos de victoria de la cooperativa, también con la muerte barata de V9.9. **La alternativa A no cambia nada medible** (≤ 0,4 puntos de victoria). El problema de 105 §5.1, que rescatar sea gratis, no aparece: aquí rescatar cuesta demasiado.

Todo se reproduce con:

```bash
node lab/sp04/segunda-corrida.mjs                  # 124 celdas × 500 partidas, ~2 min; escribe lab/sp04/resultados/segunda-corrida/
node lab/sp04/segunda-corrida.mjs --criterio v1    # la cadena con el primer criterio (§1.5), en segunda-corrida/criterio-v1/
node --test tests/sp04-arnes.test.mjs tests/sp04-palancas.test.mjs
```

Una partida concreta: `node lab/sp04/segunda-corrida.mjs --ejemplo <semilla> --politica cooperativa --moralMuerte 2 --equipoMuerto perdido …` (cualquier palanca de §1.3 como opción; por defecto la base de la etapa 1).

---

## 1. Método

### 1.1 Lo que se conserva de la primera corrida

Arnés, motor real sin DOM, LCG32, semillas `semillaC14(1..500)` compartidas por todas las celdas, variante «un grupo» y escenarios A (tres sanos) y B (muere Iris al empezar), todo como en [106 §1](106-laboratorio-sp04-un-grupo.md). Solo las políticas **cooperativa** y **objetivo**.

### 1.2 Dado D12 en el laboratorio

El laboratorio arma el motor sin la extensión del mapa, así que por defecto la exposición es el D6 de V9.9. Con `exposicion: 'd12'` se reemplaza `expose` con el setter del contexto por una réplica de `resolveMapExposure` (`src/domain/map-exposure.mjs`) sin `mapPlay`. La réplica usa `rollExposureDie` de `src/domain/exposure-die.mjs`, toma una sola muestra de azar del motor y aplica las mismas consecuencias: herida, congelación, muerte por tres daños, y mordedura con contagio. Resistencia evita el efecto. El riesgo de contagio sigue en D6, como en el mapa.

**Calibración.** Con D6 y las palancas en V9.9, la configuración de la primera corrida reproduce exactamente `lab/sp04/resultados/resumen.csv`: victoria, causas de fin, ronda final, muertes, crisis, hambre y clases de ronda. El script lo comprueba en cada ejecución y aborta si algo difiere. La prueba de [106 §1.2](106-laboratorio-sp04-un-grupo.md) contra `runGame` sigue pasando, y la cadena se reproduce byte a byte en dos ejecuciones.

### 1.3 Palancas (`lab/sp04/palancas.mjs`)

Todas se aplican con inyecciones de `createEngine` o setters del contexto, sin tocar `src/`. Con los valores de V9.9 no se instala nada.

| Palanca | Valores | Dónde actúa | Nota |
|---|---|---|---|
| Indefensos iniciales | 0 (V9.9) · 2 · 4 | `stateFactory` | Comen, ocupan la colonia y atraen ⌈(habitantes + indefensos)/2⌉ zombis aunque no haya supervivientes |
| Comida inicial | 6 (V9.9) · 3 · 0 | `stateFactory` | |
| Crisis fallida | V9.9 · agravada | `resolveCrisis` | Agravada: además de la consecuencia de V9.9, muere un indefenso (−1 moral); si no hay, el superviviente vivo de menor influencia recibe una herida (y muere si llega a tres daños) |
| Moral por muerte de superviviente | −1 (V9.9) · −2 | `kill` | El extra se descuenta antes que el −1 del motor, para que el reemplazo de emergencia vea la moral final. Indefenso: −1 siempre. La muerte del escenario B también cuesta −2 |
| Equipo del muerto | V9.9 · perdido · mazo | `kill` | V9.9: a la mano si muere en la colonia; mezclado en el mazo del lugar si muere afuera. **Mazo:** igual que V9.9 afuera; en la colonia **se pierde**, porque la colonia no tiene mazo y el motor no permite buscar ahí (`search` exige estar fuera). Recuperarlo requeriría una acción nueva |
| Duración del objetivo | 6 · 8 · 10 rondas | `stateFactory` | Se fija el objetivo de esa duración (6 → 5 muestras, 8 → 7, 10 → 9) después del sorteo del motor, así que el azar consumido no cambia |
| Dados por ronda | 1 + vivos (V9.9) · 2 + vivos · 2 × vivos | `newRound` | Los de la primera corrida |
| Rescate del médico | — · retirarse · rescatar · rescatar-A | bucle de partida | §1.6 |

### 1.4 Políticas que saben de los indefensos

Con `conoceIndefensos`, que vale para toda la segunda corrida salvo la calibración, cambian tres cosas, y solo cuando hay indefensos. Una prueba comprueba que, sin indefensos, la partida es idéntica.

- **Cooperativa:** al decidir si ataca en la colonia, cuenta las llegadas como ⌈(habitantes + indefensos)/2⌉ y no como «supervivientes en la colonia». Su defensor ya se quedaba en casa.
- **Objetivo:** si la colonia está por desbordarse, su mejor atacante vuelve (o se queda) a defenderla y los demás siguen corriendo. «Por desbordarse» quiere decir que los accesos libres más las barricadas (capacidad − zombis) no alcanzan para las llegadas previstas más dos zombis de una crisis fallida. Ya atacaba ante un desbordamiento inminente contando a los indefensos.
- **Evaluador de rondas** (competida, obligada, holgada): con indefensos, la colonia entra en la demanda de defensa aunque no haya supervivientes en ella.

Ninguna política cambia su conducta por el costo de la muerte: la cooperativa siempre arriesga la mordedura y «objetivo» sacrifica según la tabla de la IA.

### 1.5 Encadenamiento y criterio de «mejor combinación»

Etapas en el orden de prioridad del encargo. Cada una parte de la mejor combinación de la anterior:

| Etapa | Qué varía | Base |
|---|---|---|
| 0 | D6 · D12 | Configuración de la primera corrida (objetivo sorteado) |
| 1 | moral −1/−2 × equipo V9.9/perdido/mazo (+ la base con D6 como referencia) | D12, 2 indefensos, comida 6, crisis V9.9, 8 rondas, 1 + vivos |
| 2 | indefensos 0/2/4 × comida 6/3/0 | mejor de 1 |
| 3 | crisis V9.9/agravada × duración 6/8/10 | mejor de 2 |
| 4 | dados 1+vivos / 2+vivos / 2×vivos | mejor de 3 |
| 5 | retirarse / rescatar / rescatar-A, más un diagnóstico «médico que no come» | mejor de 4, y la misma con muerte V9.9 (−1, equipo V9.9) |

*Ventaja* = victoria de «objetivo» − victoria de la cooperativa, promediando A y B.

- **Criterio v1 (el primero que fijé):** entre las combinaciones con la cooperativa en ≥ 35 %, la de menor ventaja. **Se descartó al ver los datos:** la ventaja es negativa en todas partes y achicarla más premia lo que facilita el juego. La cadena v1 terminó en 0 indefensos, comida 6, moral −1, equipo V9.9, 10 rondas y dados dobles, con la cooperativa en 87 %. Está en `criterio-v1/` para quien quiera comparar.
- **Criterio v2 (vigente):** *factibles* son las combinaciones con la cooperativa en ≥ 35 % y ventaja ≤ 0. Entre las que están a ≤ 5 puntos de la menor ventaja factible (el ruido de 500 partidas, [106 §6](106-laboratorio-sp04-un-grupo.md)), gana **la más exigente**: la de menor victoria cooperativa. Busca la configuración más dura en la que abastecer todavía paga.

El criterio cambió *después* de ver la primera cadena. Por eso se publican las dos y la elección de cada etapa no se presenta como la «correcta». Las tablas de §2 muestran todas las celdas para que se pueda elegir con otro criterio.

### 1.6 Rescate del médico simplificado

Modelo mínimo de [105 §5](105-ficha-capitulo-la-ultima-guardia.md), sin hospital, horda ni pista:

- Al empezar el turno de la **ronda 5**, el superviviente vivo con más daños (a igualdad, el de menor influencia) llega a la puerta con **dos daños**. Se le suben las heridas hasta sumar dos, igual en todas las variantes.
- **Retirarse:** no pasa nada más y no hay médico.
- **Rescatar:** una tirada de exposición D12 (la réplica de §1.2). Herida o congelación lo matan (tercer daño) y la mordedura lo mata y contagia a quien esté en el mismo lugar. Muere el 50 % de las veces, salvo Resistencia. El médico se incorpora siempre.
- **Médico:** no tira dados, no atrae zombis ni corre peligro. **Come** como un habitante más de la colonia. Desde la ronda siguiente cura **una herida por ronda** al superviviente herido de mayor influencia que esté en la colonia (105 §6).
- **Alternativa A:** si el rescatista murió, el médico no cura durante 2 rondas (cura desde la 8).
- **Diagnóstico:** «rescatar» con un médico que no come, para separar el costo de su comida del de la muerte del rescatista.

Si la partida termina antes de la ronda 5, no hay rescate. Las tasas condicionadas («con rescate») miran solo las partidas que llegaron: son las mismas en las tres variantes, porque hasta la ronda 5 las partidas son idénticas.

### 1.7 Métricas nuevas

Además de las de [106 §1.7](106-laboratorio-sp04-un-grupo.md):

- **Ventaja de correr** (§1.5), en `ventaja.csv`.
- **Supervivientes vivos al final** y **victoria con al menos 2 vivos**.
- **Indefensos perdidos por partida**: por desbordamiento en la colonia y por crisis agravada.
- **Muerte doble:** dos o más muertes propias en la misma ronda y la misma fase (turno del jugador o fase de colonia). *Por contagio* si alguna es mordedura, su propagación o el sacrificio para cortarla. **Partida que termina por una muerte doble:** derrota en la misma ronda que una muerte doble.
- **Rondas competidas, obligadas y holgadas**, como en la primera corrida (con la corrección de indefensos de §1.4).
- Reparto de caras de exposición, **equipo perdido**, **moral final** y las métricas del rescate.

---

## 2. DATOS

500 partidas por celda. Victorias en %; «A/B» es el escenario. Fuente: `lab/sp04/resultados/segunda-corrida/resumen.csv` y `ventaja.csv`. Ninguna partida quedó incompleta. Diferencias de menos de 4–5 puntos no son concluyentes.

### 2.1 Etapa 0 — efecto del D12 sobre la configuración de la primera corrida

| Dado | Cooperativa A/B | Objetivo A/B | Ventaja | Mordedura · herida · congelación (por exposición) | Muertes propias coop. A | Muertes dobles por contagio, coop. A |
|---|---|---|---|---|---|---|
| D6 (= primera corrida) | 59,2 / 60,0 | 46,6 / 49,2 | −11,7 | 16,5 % · 16,0 % · 16,5 % | 2,18 | 0,41 |
| D12 | 71,8 / 69,0 | 44,2 / 50,8 | −22,9 | 8,9 % · 24,5 % · 15,7 % | 1,53 | 0,25 |

El D12 favorece a quien abastece: menos mordeduras (y menos contagios en grupo), más heridas, y Mara las cura. A «objetivo», que muere sobre todo por desbordamientos en la Biblioteca (§2.7), el dado casi no le cambia nada. En la base de la etapa 1 (2 indefensos, 8 rondas), el D6 deja a la cooperativa en 34,7 % y el D12 en 42,1 %.

### 2.2 Etapa 1 — costo de la muerte (D12, 2 indefensos, comida 6, crisis V9.9, 8 rondas)

| Moral por muerte | Equipo | Cooperativa A/B | Objetivo A/B | Coop. media | Obj. media | Ventaja | «Objetivo» que termina por muerte doble (A) |
|---|---|---|---|---|---|---|---|
| −1 | V9.9 | 50,0 / 34,2 | 14,8 / 14,2 | 42,1 | 14,5 | −27,6 | 4,2 % |
| −1 | perdido | 51,6 / 34,0 | 18,8 / 18,2 | 42,8 | 18,5 | −24,3 | 4,8 % |
| −1 | mazo | 49,0 / 33,4 | 14,8 / 14,2 | 41,2 | 14,5 | −26,7 | 4,2 % |
| −2 | V9.9 | 42,4 / 27,4 | 8,6 / 9,2 | 34,9 | 8,9 | −26,0 | 25,8 % |
| **−2** | **perdido** (elegida) | 44,2 / 27,2 | 11,0 / 11,0 | 35,7 | 11,0 | −24,7 | 28,2 % |
| −2 | mazo | 42,2 / 26,8 | 8,6 / 9,2 | 34,5 | 8,9 | −25,6 | 25,8 % |
| −1 (D6) | V9.9 | 39,4 / 30,0 | 15,0 / 11,8 | 34,7 | 13,4 | −21,3 | 6,6 % |

- **Moral −2:** −7 puntos para la cooperativa y −5 para «objetivo». La muerte se nota sobre todo en *cómo* pierde quien corre: un desbordamiento que mata a dos en la Biblioteca cuesta −4 y cierra la partida. Con −1, el 4 % de sus partidas termina así; con −2, el 26–28 %.
- **Equipo:** la cooperativa pierde 0,7–1,1 objetos por partida con «perdido» y no lo nota (±2 puntos). «Objetivo» pierde unos 2 y gana ~4 puntos de victoria. Es consistente con que, en V9.9 y en «mazo», el equipo de quien muere en la Biblioteca se mezcla en ese mazo y diluye las muestras: con «perdido» encuentra más muestras o notas por ronda (0,92 → 0,98 dados con −1; 1,22 → 1,27 con −2). «Mazo» y V9.9 dan lo mismo, porque las dos políticas casi no mueren con equipo dentro de la colonia.

### 2.3 Etapa 2 — indefensos × comida inicial (moral −2, equipo perdido, 8 rondas)

| Indefensos | Comida | Cooperativa A/B | Objetivo A/B | Coop. media | Obj. media | Ventaja | Hambre coop. A | Indefensos perdidos coop. A |
|---|---|---|---|---|---|---|---|---|
| 0 | 6 | 71,4 / 66,0 | 18,6 / 21,6 | 68,7 | 20,1 | −48,6 | 39 % | 0,01 |
| **0** | **3** (elegida) | 66,8 / 61,0 | 17,0 / 16,0 | 63,9 | 16,5 | −47,4 | 50 % | 0,01 |
| 0 | 0 | 55,6 / 46,8 | 18,0 / 13,8 | 51,2 | 15,9 | −35,3 | 74 % | 0 |
| 2 | 6 | 44,2 / 27,2 | 11,0 / 11,0 | 35,7 | 11,0 | −24,7 | 74 % | 0,12 |
| 2 | 3 | 36,0 / 19,4 | 7,8 / 7,8 | 27,7 | 7,8 | −19,9 | 88 % | 0,07 |
| 2 | 0 | 26,2 / 9,6 | 7,6 / 8,2 | 17,9 | 7,9 | −10,0 | 97 % | 0,04 |
| 4 | 6 | 18,8 / 5,0 | 5,4 / 5,0 | 11,9 | 5,2 | −6,7 | 93 % | 0,54 |
| 4 | 3 | 11,8 / 2,8 | 5,8 / 5,2 | 7,3 | 5,5 | −1,8 | 98 % | 0,33 |
| 4 | 0 | 6,8 / 1,6 | 6,2 / 4,6 | 4,2 | 5,4 | +1,2 | 99 % | 0,14 |

- Los indefensos **casi no mueren** (0,0–0,5 por partida): el desbordamiento de la colonia es raro con un defensor en casa. Lo que cuesta es **el hambre**: cada dos indefensos suman una comida por fase. Con 2 indefensos y comida 6, la cooperativa pasa hambre en el 74 % de las partidas, frente al 39 % sin indefensos.
- **Los indefensos achican la brecha:** castigan a quien se queda en la colonia y la alimenta. «Objetivo» deja la colonia vacía y come menos, así que los indefensos le cuestan menos en términos absolutos.
- **Escenario B** (dos supervivientes desde el inicio) sufre mucho más con indefensos: 27 % frente a 44 % en A, con 2 indefensos y comida 6.

### 2.4 Etapa 3 — crisis × duración (0 indefensos, comida 3, moral −2, equipo perdido)

| Crisis | Rondas | Cooperativa A/B | Objetivo A/B | Coop. media | Obj. media | Ventaja |
|---|---|---|---|---|---|---|
| V9.9 | 6 (5 muestras) | 81,6 / 79,0 | 52,0 / 57,6 | 80,3 | 54,8 | −25,5 |
| V9.9 | 8 (7) | 66,8 / 61,0 | 17,0 / 16,0 | 63,9 | 16,5 | −47,4 |
| V9.9 | 10 (9) | 42,8 / 29,8 | 2,6 / 2,2 | 36,3 | 2,4 | −33,9 |
| agravada | 6 | 81,0 / 78,0 | 50,6 / 55,8 | 79,5 | 53,2 | −26,3 |
| **agravada** | **8** (elegida) | 64,8 / 57,2 | 16,4 / 15,4 | 61,0 | 15,9 | −45,1 |
| agravada | 10 | 32,4 / 25,6 | 2,6 / 2,0 | 29,0 | 2,3 | −26,7 |

- **Con 6 rondas correr todavía rinde** (55 %); con 8 ya no (16 %) y con 10 no sirve (2 %). La primera corrida lo había visto con el objetivo sorteado ([106 §2.5](106-laboratorio-sp04-un-grupo.md)); aquí se confirma con el objetivo fijado.
- **La crisis agravada pesa poco** (−1 a −7 puntos). Sin indefensos iniciales hiere al de menor influencia o mata a los indefensos que llegan por encrucijadas (0,4–0,5 por partida).

### 2.5 Etapa 4 — dados (0 indefensos, comida 3, crisis agravada, moral −2, equipo perdido, 8 rondas)

| Dados | Cooperativa A/B | Objetivo A/B | Ventaja | Coop. A: competida / obligada / holgada |
|---|---|---|---|---|
| **1 + vivos** (elegida) | 64,8 / 57,2 | 16,4 / 15,4 | −45,1 | 4,5 % / 69 % / 16 % |
| 2 + vivos | 84,0 / 78,6 | 37,6 / 44,8 | −40,1 | 17 % / 45 % / 26 % |
| 2 × vivos | 90,4 / 87,6 | 56,8 / 57,2 | −32,0 | 28 % / 7 % / 52 % |

Los dados extra suben las rondas en las que hay que elegir (4,5 → 28 %), pero ayudan más a quien corre: «objetivo» gana 41 puntos con dados dobles, la cooperativa 26. Como en la primera corrida, más dados no hacen competir las alternativas en el resultado; facilitan el juego.

### 2.6 Rescate del médico (base elegida: D12, 0 indefensos, comida 3, crisis agravada, 8 rondas)

Victoria de la cooperativa. Entre paréntesis, la victoria **condicionada** a llegar al rescate en la ronda 5 (64 % de las partidas en A y 80 % en B).

| Costo de muerte | Variante | Coop. A | Coop. B | Rescatista muere | Curas del médico (A) | Moral final con rescate (A) |
|---|---|---|---|---|---|---|
| −2, perdido | retirarse | 64,0 (63,6) | 54,6 (57,0) | — | — | 2,99 |
| −2, perdido | rescatar | 56,6 (52,0) | 42,4 (41,8) | 49 % | 0,19 | 2,17 |
| −2, perdido | rescatar-A | 56,2 (51,4) | 42,0 (41,3) | 49 % | 0,11 | 2,15 |
| −2, perdido | rescatar, médico que no come | 60,4 (57,9) | 46,8 (47,3) | 49 % | 0,20 | 2,51 |
| −1, V9.9 | retirarse | 68,6 (60,4) | 63,6 (61,0) | — | — | 3,54 |
| −1, V9.9 | rescatar | 61,6 (51,2) | 49,0 (44,8) | 46 % | 0,43 | 2,77 |
| −1, V9.9 | rescatar-A | 61,4 (50,9) | 48,8 (44,6) | 46 % | 0,24 | 2,75 |

- **Rescatar siempre cuesta** a la cooperativa 7–15 puntos de victoria y casi un punto de moral final, con la muerte cara y con la barata.
- **¿De dónde viene ese costo?** Del total en A (7,4 puntos), unos 3,8 son la comida del médico y unos 3,6 la muerte del rescatista. En B el reparto es 4,4 y 7,8.
- **El médico cura poco:** 0,1–0,5 heridas por partida. Solo cura en la colonia, donde la cooperativa deja un defensor y Mara ya cura.
- **A** reduce las curas a la mitad, pero no mueve la victoria (≤ 0,4 puntos) ni la moral final (≤ 0,04).
- Para «objetivo» el rescate casi no existe: llega a la ronda 5 en el 9–17 % de las partidas con muerte cara.

### 2.7 Supervivientes, indefensos, muertes dobles y competencia (escenario A)

| Combinación | Política | Vivos al final | Victoria con ≥ 2 vivos | Muertes propias | Muertes dobles (por contagio) | Termina por muerte doble | Competida / obligada / holgada |
|---|---|---|---|---|---|---|---|
| Primera corrida, D6 | cooperativa | 2,25 | 58 % | 2,18 | 0,45 (0,41) | 2 % | 5 % / 50 % / 17 % |
| Primera corrida, D6 | objetivo | 1,06 | 17 % | 5,22 | 1,35 (0,47) | 8 % | 10 % / 78 % / 10 % |
| P1 (§3) | cooperativa | 2,34 | 43 % | 1,67 | 0,30 (0,25) | 8 % | 4 % / 68 % / 16 % |
| P1 | objetivo | 0,60 | 6 % | 3,97 | 1,11 (0,22) | 28 % | 18 % / 55 % / 11 % |
| P2 (§3) | cooperativa | 2,29 | 60 % | 1,85 | 0,28 (0,21) | 8 % | 5 % / 69 % / 16 % |
| P2 | objetivo | 0,62 | 6 % | 3,88 | 1,07 (0,21) | 32 % | 19 % / 66 % / 12 % |
| P3 (§3) | cooperativa | 2,53 | 42 % | 1,82 | 0,35 (0,27) | 9 % | 4 % / 72 % / 13 % |
| P3 | objetivo | 0,50 | 1 % | 4,22 | 1,16 (0,22) | 32 % | 18 % / 66 % / 11 % |

- **Las muertes dobles de «objetivo» no son contagio:** de ~1,1 por partida, solo 0,2 son mordeduras. El resto son desbordamientos en la Biblioteca, donde la política amontona al grupo (capacidad 4; llega un zombi por cada superviviente).
- **La cooperativa casi siempre gana con al menos dos vivos:** su victoria y su «victoria con ≥ 2 vivos» difieren en 1–4 puntos. «Objetivo» gana sobre todo con un superviviente.
- **Las rondas «competidas» siguen siendo raras** con 1 + vivos dados (4–5 % para la cooperativa). El evaluador dice que abastecer exige todos los dados en el 68–72 % de las rondas; la diferencia de victoria muestra que esa exigencia ahora sí se cobra.

---

## 3. RECOMENDACIONES (propuestas, ninguna aprobada)

### 3.1 Combinaciones más prometedoras

Las tres tienen D12, moral −2 por superviviente, equipo perdido y 1 + vivos dados. Las tres cumplen: correr no domina (ventaja ≤ −24) y la cooperativa queda en ≥ 35 %.

**P1 — «La última guardia» como está escrita:** 2 indefensos, comida 6, crisis V9.9, 8 rondas.
- Cooperativa 35,7 % (A 44 %, B 27 %), objetivo 11 %, ventaja −24,7.
- Es lo que pide 105 §10.2: indefensos, 8 rondas y muerte cara. Está justo en el piso: B queda en 27 % y el hambre aparece en el 74 % de las partidas.
- *Jugada de ejemplo* (semilla 147926525, A, «Encontrar la cura»; `--ejemplo 147926525 --politica cooperativa --moralMuerte 2 --equipoMuerto perdido`):
  - **Ronda 2, competida.** Hay 4 dados, demanda de abastecer 3 y de objetivo 2. La cooperativa gasta dos dados en que Mara ataque en la colonia y dos en que Iris busque en la Biblioteca (dos muestras).
  - **Rondas 3–4, obligadas.** Repite el reparto (dos ataques y dos búsquedas) con la comida en 0 y gana en la ronda 4 con los tres vivos y moral 10.
  - **Misma semilla con «objetivo»:** los tres van a la Biblioteca y Mara hace casi todas las búsquedas. En la fase de colonia de la ronda 2 muere Leo por desbordamiento (−2) y en la 3 mueren Iris y Mara juntas (−4). Derrota por moral en la ronda 5 con 5 de 7 muestras.

**P2 — Colonia sin indefensos y con poca comida:** 0 indefensos, comida 3, crisis agravada, 8 rondas (la elegida por la cadena v2).
- Cooperativa 61 % (A 65 %, B 57 %), objetivo 16 %, ventaja −45.
- Es la brecha más ancha con victoria cómoda: buena candidata si los indefensos se dejan para más adelante en la campaña.
- *Jugada de ejemplo* (semilla 2027808452; `--ejemplo 2027808452 --politica cooperativa --indefensos 0 --comidaInicial 3 --crisisFallida agravada --moralMuerte 2 --equipoMuerto perdido`):
  - **Rondas 2 y 3, competidas** (demanda 3 + 2 con 4 dados). La cooperativa reparte dos ataques y dos búsquedas cada vez; en la 3 la crisis de medicina falla y se pierde comida.
  - **Ronda 4, obligada** (demanda de abastecer 6): hambre, moral 10 → 8.
  - **Victoria en la ronda 5** con los tres vivos. La misma semilla con «objetivo» pierde cuatro supervivientes por desbordamiento en la Biblioteca y termina por moral en la ronda 4.

**P3 — Objetivo largo:** 0 indefensos, comida 3, crisis V9.9, 10 rondas.
- Cooperativa 36 % (A 43 %, B 30 %), objetivo 2 %. Correr no sirve nunca.
- Es un capítulo de resistencia: la moral baja por hambre ronda tras ronda.
- *Jugada de ejemplo* (semilla 2802362286; `--ejemplo 2802362286 --politica cooperativa --indefensos 0 --comidaInicial 3 --moralMuerte 2 --equipoMuerto perdido --rondasObjetivo 10`):
  - Cinco muestras en dos rondas. La ronda 2 es competida y desde la 3 todas son obligadas.
  - Hambre en las rondas 3 y 4 (moral 9 → 6) y seis crisis fallidas seguidas, de la ronda 2 a la 7 (tres le quitan comida, dos moral y una hiere); moral 4 en la ronda 7.
  - Llega un recluta y la cooperativa gana en la ronda 8 con 9 muestras y cuatro vivos.

### 3.2 Por palanca

1. **Moral −2 por superviviente:** recomendable. Sin vencedor claro en victoria, pero hace que la muerte se sienta en la colonia: una muerte doble termina la partida un tercio de las veces para quien se arriesga.
2. **Equipo del muerto:** decidir por narrativa; los datos son neutrales para quien abastece. «Perdido» es la más simple y ayuda un poco a quien corre (no ensucia el mazo). «Mazo» equivale a V9.9 salvo en la colonia, donde hoy no se puede recuperar nada.
3. **Indefensos:** es la palanca más cara. Si el capítulo arranca con indefensos, compensar con comida 6. Medir antes «2 indefensos + 2 + vivos dados» o «2 indefensos + cocinero» (§5).
4. **Duración:** 8 rondas. Con 6 correr vuelve a rendir; con 10 el capítulo se vuelve una prueba de resistencia.
5. **Crisis agravada:** opcional; su efecto es chico. Tiene sentido si hay indefensos, como amenaza visible.
6. **Dados:** mantener 1 + vivos. Los dados extra facilitan sobre todo correr.

### 3.3 Alternativa A del rescate: respuesta explícita

**No adoptar A.** En este modelo no cambia la victoria (≤ 0,4 puntos) ni la moral final (≤ 0,04), con la muerte cara y con la barata.

El problema que A quería resolver (rescatar siempre conviene) **no aparece**: siempre retirarse gana a siempre rescatar por 7–15 puntos. La mitad del costo es la muerte del rescatista y la otra mitad, que el médico es una boca más y cura poco.

Con estas cifras, un jugador razonable **siempre se retira**, lo que incumple el criterio de [105 §9](105-ficha-capitulo-la-ultima-guardia.md) desde el lado opuesto. Para que la decisión sea real, el médico tiene que valer más que una muerte. Propuestas a medir:

- que no consuma comida mientras cura;
- que cure en cualquier lugar donde esté el grupo;
- que cure una herida por ronda sin límite de lugar desde la ronda siguiente.

El diagnóstico «médico que no come» recupera la mitad de la diferencia y todavía no alcanza.

---

## 4. Límites

- **La política «objetivo» es ingenua:** amontona a todos en la Biblioteca y muere por desbordamiento. Un jugador que corra repartiendo a su gente probablemente gane más. La «ventaja de correr» mide *esta* forma de correr. Nada de lo anterior prueba que correr bien no domine.
- **Ninguna política cambia su conducta por el costo de la muerte** (§1.4). Un jugador que sabe que una muerte vale −2 juega distinto.
- **El criterio de elección cambió** después de ver la primera cadena (§1.5). Las tablas muestran todas las celdas.
- **El rescate es un modelo mínimo:** no hay hospital, horda (M3), testigo (M4) ni válvulas (M6). El médico es abstracto. Sus cifras dicen hacia dónde va la decisión, no cuánto vale en el capítulo real.
- **Equipo «mazo» en la colonia** se trata como perdido porque no existe buscar en la colonia.
- 500 partidas por celda: diferencias menores a 4–5 puntos no son concluyentes (por ejemplo, las tres variantes de equipo con la misma moral).

## 5. Lo que faltó

- **El rescate sobre P1** (con indefensos): se midió sobre la base de la cadena (P2) y su gemela con muerte V9.9, no sobre la configuración del capítulo.
- **Indefensos con más dados o comida extra:** la etapa 4 barrió los dados sobre la base sin indefensos que eligió la cadena.
- **Una política «objetivo» que reparta al grupo**, y políticas que tengan en cuenta el costo de la muerte.
- **Variantes del médico** que valgan más (§3.3).

## 6. Entrega

- **Código** (`lab/sp04/`):
  - nuevos: `palancas.mjs` (palancas y rescate), `segunda-corrida.mjs` (etapas, criterio, calibración y ejemplos) y `principal.mjs` (arreglo del arranque del CLI en Windows: el `--ejemplo` de `correr.mjs` no imprimía nada por la caja de la letra de unidad);
  - modificados: `motor-laboratorio.mjs`, `politicas.mjs`, `competencia.mjs`, `partida.mjs`, `metricas.mjs` y `correr.mjs`. Ninguno cambia la primera corrida, según la calibración.
- **Resultados:** `lab/sp04/resultados/segunda-corrida/` (`resumen.csv`, `ventaja.csv`, `por-ronda.csv`, `README.md`) y `criterio-v1/`. Los CSV de la primera corrida no se tocan.
- **Pruebas:** `tests/sp04-palancas.test.mjs`, 9 pruebas nuevas: reproducibilidad con D12, identidad con V9.9, una muestra por exposición D12, cada palanca, el rescate con y sin A, y el criterio. `npm test`: 748/749 en Windows. La que falla es `tests/evidencias-enlazadas.test.mjs`, que en Windows arma mal la ruta (`URL.pathname`); su lógica pasa con una copia de ruta corregida y en Linux (CI) pasa. Es el mismo archivo que en `main`.
- **Numeración:** el informe de la primera corrida pasó de 102 a [106](106-laboratorio-sp04-un-grupo.md) y se corrigieron sus enlaces (README del laboratorio, CLI, resultados e [informe 104](104-informe-avances-singleplayer.md)).
- Sin cambios en `src/`, la referencia V9.9, el mapa ni los tags.
