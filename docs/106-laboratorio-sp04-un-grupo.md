# 106 — Laboratorio SP-04: economía de un solo grupo sobre el motor real

16/11/2026 (numerado 102 en su rama; renumerado 106 el 17/11, porque el 102 es el del D12). Segunda corrida: [107](107-laboratorio-sp04-segunda-corrida.md). Rama `experiment/sp04-laboratorio-un-grupo`, creada desde `main` (`a898a9a`, Hito 3 cerrado). Código en `lab/sp04/`; resultados agregados en `lab/sp04/resultados/`. No se tocan `src/`, la referencia V9.9, los tags ni el mapa.

**Pregunta de diseño (docs/63 §5K):** ¿cuántas acciones y recursos necesita un solo grupo para que abastecer la colonia y avanzar hacia el objetivo sean alternativas viables que compitan entre sí?

**Respuesta corta (DATOS):** con las reglas y la economía de dados de V9.9 tal cual, y un solo grupo, las dos alternativas casi nunca compiten. En la mayoría de las rondas el abastecimiento «exige» todos los dados, pero esa exigencia es blanda: la política que la ignora y corre hacia las muestras gana dos de cada tres partidas, porque las muertes son baratas (−1 moral) y la amenaza se encoge con el grupo. Una política que solo abastece no gana nunca. Lo que no está en V9.9 y haría competir a las alternativas es que una muerte cueste más que un punto de moral y que la amenaza no escale con el tamaño del grupo; eso queda como experimento propuesto, no como regla.

Todo lo que sigue se reproduce con un solo comando:

```bash
node lab/sp04/correr.mjs
```

(74 celdas × 500 partidas, unos 5 minutos; escribe `lab/sp04/resultados/resumen.csv` y `por-ronda.csv`). Una partida concreta, ronda por ronda: `node lab/sp04/correr.mjs --ejemplo <semilla> --escenario A --politica cooperativa`.

---

## 1. Método

### 1.1 Arnés

- Motor real: `createEngine` de `src/application/reference-engine.mjs`, importado como módulo, sin DOM ni navegador. Los efectos de vista son funciones vacías.
- Azar: el mismo LCG32 de `test-support/game-fixture.mjs`, inyectado como `Math.random`. Misma semilla y misma configuración ⇒ misma partida (prueba `tests/sp04-arnes.test.mjs`).
- Bucle de partida: copia del de `test-support/run-game.mjs` (decisiones pendientes primero, después una acción del turno; «terminar turno» espera la resolución asíncrona del motor).
- Semillas: la partida *i* de cada celda usa `i·2654435761 mod 2³²` (la de C14). Todas las celdas comparten semillas: la partida *i* arranca con el mismo objetivo, los mismos mazos y los mismos dados en todas las variantes y políticas. Con semillas consecutivas el primer sorteo (el objetivo) caía siempre en la misma franja y «Última esperanza» no aparecía nunca; por eso se dispersan.

### 1.2 Línea base: V9.9 de dos grupos

Mismo motor, modo «1 jugador + IA», IA de referencia (`src/agents/reference-agent.mjs`) conectada por `connectAutomation`. **Calibración:** para las semillas de `tests/partidas-completas-c14.test.mjs`, el arnés reproduce las partidas de `runGame` comando por comando: misma secuencia de acciones, mismas muertes, misma ronda final, misma moral, comida y muestras (prueba «línea base de dos grupos coincide con runGame»). Esto garantiza que el arnés no altera el motor.

### 1.3 Variante «un grupo»

Construida solo con las inyecciones de `createEngine` y los setters del contexto que el motor entrega a `rulesFactory` (la misma superficie que usan la extensión del mapa y las pruebas):

| Pieza | Qué cambia | Por qué |
|---|---|---|
| `stateFactory` | Estado sin bots, sin mano ni dados de la IA | No hay segundo grupo |
| `rulesFactory` | `gameOutcome`: «sin supervivientes» mira solo al grupo del jugador. `feedingNeed`: fórmula de comida del barrido | V9.9 termina la partida si cualquiera de los dos bandos se queda sin gente |
| `turnsFactory` | `newRound` del laboratorio: idéntica secuencia a la de V9.9, sin dados de IA, con la fórmula de dados y la exigencia de crisis configurables | Barrido |
| `automation` | Turno de IA vacío | El ciclo del motor sigue siendo humano → IA → colonia; la IA no hace nada ni consume azar |
| `replaceLastSurvivors` | Solo para el grupo del jugador | V9.9 reemplaza de emergencia al último superviviente de cada bando; se conserva esa regla para el grupo único |
| `colony`/`addZombie` | Multiplicador de llegadas en la fase de colonia (solo en el barrido) | «Entrada de zombis» |

Todo lo demás es V9.9: crisis, alimentación, residuos, ruido, encrucijadas, mordeduras, sucesión, reclutamiento por cartas y rescates.

**Qué NO se pudo variar sin tocar `src/`:** nada de lo pedido. La única aproximación es la entrada de zombis, que se escala sobre todas las llegadas de la fase de colonia (población, ruido y crisis fallida) porque el conteo de llegadas vive dentro de `colony()`.

### 1.4 Políticas del jugador (condicionan todo lo demás)

Ninguna «ve» el futuro ni los mazos: usan solo lo que el motor expone al jugador. Las cuatro comparten las decisiones pendientes (confirmar muertes, sucesor por influencia, encrucijada con el evaluador del motor `chooseCrossOption`, tratamiento, atracción, transferencia).

| Política | Origen | Cómo juega |
|---|---|---|
| **cooperativa** | Puerto literal del `testController` de `test-support/autoplay-controller.mjs` (C14) | Entrega muestras y notas en cuanto las tiene; aporta a la crisis desde la mano; habilidades gratis; cura, come si `comida < necesidad+3`, equipa; deja **un defensor** (mejor ataque) en la colonia y manda al resto a biblioteca, hospital, supermercado…; limpia si hay ≥8 residuos; ataca donde hay riesgo de desbordamiento; busca con el mejor buscador; mejora un dado con comida si sobra; después ataca, barrica, limpia. Mordedura: siempre arriesga. |
| **ia-referencia** | La IA de `src/agents/reference-agent.mjs` trasladada al bando del jugador, mismo orden y mismas puntuaciones | Habilidades gratis; equipa; recorre la mano desde el final (crisis, curar al más herido, comer si `comida < ⌈en casa/2⌉+1`, notas/muestras, manual); **mueve a todos** cada ronda hacia mazos con cartas (búsqueda ≤3 → hospital, biblioteca, supermercado; si no → supermercado, comisaría, gasolinera, escuela); con los dados: buscar con el primero que pueda, si no atacar, si no barricar, si no limpiar; herramientas a la crisis solo si alcanzan. Botín con la tabla de la IA (muestra que gana 12, herramienta que completa 11, muestra 10, superviviente 9, comida escasa 8…). Mordedura: sacrifica si la siguiente víctima vale ≥5 de influencia más. |
| **abastecer** | Variante de ia-referencia | Un defensor en la colonia; los demás a supermercado, escuela, gasolinera (mazos con comida); come si `comida < necesidad+3`; dados: atacar cualquier zombi propio, buscar en mazos de comida, barricar, buscar, limpiar; botín: comida y crisis primero. |
| **objetivo** | Variante de ia-referencia | Todos a biblioteca, hospital, escuela (muestras y notas); come solo si `comida < necesidad`; dados: buscar en mazos de muestras, atacar **solo** ante desbordamiento inminente, mejorar dado con comida para alcanzar la búsqueda, buscar donde sea, barricar, limpiar; botín: muestra 12, notas 11. |

Advertencia: `ia-referencia` es la IA jugando «como humano»; en V9.9 la IA no elige botín (recibe la mejor carta directamente) ni decide mordeduras por su grupo del mismo modo. Es la adaptación más fiel posible, no la IA tal cual.

### 1.5 Escenarios (docs/63 §5K), un cambio por vez

Se aplican tras crear la partida y antes de la primera acción, sobre el mismo estado inicial (mismo objetivo, mazos y dados por semilla). Los dados de la ronda 1 ya están tirados cuando se aplica el escenario, como ocurriría con una muerte al empezar.

| Escenario | Cambio | Nota |
|---|---|---|
| A | Tres supervivientes sanos (Mara médica, Leo mecánico, Iris exploradora) | Estado V9.9 |
| B | Muere Iris (exploradora: mejor búsqueda, peor ataque) con `kill` del motor | −1 moral, como toda muerte |
| C | B + Leo con 1 herida y 1 congelación | La congelación hiere cada inicio de ronda; Mara puede curar 1 herida por ronda |
| D | B + una carta «Superviviente encontrado» en la mano | Acceso garantizado a un reclutamiento si la colonia tiene lugar |
| E1 / E2 | A + uno / dos supervivientes incorporados con `recruit` | Sorteo del plantel con el azar de la partida |

### 1.6 Barrido (solo un grupo, política ia-referencia, escenarios A y B)

| Parámetro | Valores | Dónde actúa |
|---|---|---|
| Dados por ronda | `v99` = 1 + vivos · `mas-uno` = 2 + vivos · `doble` = 2 × vivos | `newRound` |
| Exigencia de crisis | 1 · 2 (V9.9) · 3 cartas | `newRound` |
| Comida por fase | `v99` = ⌈(en casa + indefensos)/2⌉ − cocinero · `ligera` = ⌊…/2⌋ · `estricta` = uno por cabeza | `feedingNeed` |
| Entrada de zombis | `v99` · `mitad` · `doble` de las llegadas de la fase de colonia | `colony` |

Dados × crisis se cruzan (9 celdas); comida y zombis se varían por separado sobre V9.9 (4 celdas). Ninguna combinación es una regla propuesta.

### 1.7 Métricas

Solo cuentan los dados del grupo del jugador (en la línea base, la IA queda fuera).

- **Fin:** ronda y causa (victoria, moral 0, rondas agotadas, sin supervivientes).
- **Dados por ronda:** total; **abastecer** = ataque, barricada, limpieza, atracción y búsquedas que conservaron comida, medicina, combustible, herramienta, arma, manual o superviviente; **objetivo** = búsquedas que conservaron muestra o notas; **otros** = búsqueda en mazo vacío; **no usados** al terminar el turno. Mejorar un dado gasta comida, no dado, y se cuenta aparte.
- **Comida:** porcentaje de partidas con hambre y ronda de la primera hambre. **Crisis fallidas** por partida.
- **Muertes** propias por partida (sin contar la del escenario) y ronda de la primera.
- **Tras la primera muerte en juego:** *espiral* = otra muerte propia en las dos rondas siguientes, o fin por moral/sin supervivientes en esas dos rondas; *recupera* = gana, o llega al final sin otra muerte. No son excluyentes.
- **Un superviviente hace todo:** cuota de dados del personaje más usado (0,33 sería reparto perfecto entre tres).
- **Viabilidad de la decisión**, evaluada al consumir el primer dado de la ronda (ya hechos los movimientos), en «dados equivalentes»: *demanda de abastecer* = ataques necesarios para evitar desbordamientos donde hay propios + cartas de crisis que la mano no cubre + 1 si la comida no alcanza; *demanda de objetivo* = propios fuera de la colonia en un mazo que todavía contiene muestras o notas (techo: el laboratorio ve el mazo, el jugador no). Con *D* dados: **competida** si las dos demandas son positivas y no caben; **obligada-abastecer** si abastecer sola ya exige todos los dados; **solo-abastecer** / **solo-objetivo** si una demanda es cero; **holgada** si caben las dos o no hay ninguna.

---

## 2. DATOS

500 partidas por celda, semillas compartidas. Porcentajes sobre 500 partidas; «dados» son promedios por ronda jugada. Todas las cifras salen de `lab/sp04/resultados/resumen.csv` y `por-ronda.csv`. Ninguna partida quedó incompleta.

### 2.1 Dos grupos (V9.9) frente a un grupo, escenario A, por política

| Política | Variante | Victoria | Moral 0 | Rondas agotadas | Ronda fin | Dados/ronda | abastecer | objetivo | sin usar | Hambre (partidas) | Crisis fallidas | Muertes propias | Cuota máx. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| cooperativa | dos grupos | **64 %** | 31 % | 5 % | 5,0 | 3,74 | 2,51 | 1,10 | 0,01 | 25 % | 1,8 | 2,0 | 0,70 |
| cooperativa | un grupo | **59 %** | 31 % | 10 % | 5,8 | 3,69 | 2,47 | 1,06 | 0,03 | 49 % | 4,1 | 2,2 | 0,70 |
| objetivo | dos grupos | 56 % | 44 % | 1 % | 4,3 | 3,08 | 1,62 | 1,28 | 0,07 | 10 % | 1,3 | 4,2 | 0,77 |
| objetivo | un grupo | 47 % | 47 % | 6 % | 5,2 | 2,91 | 1,56 | 1,17 | 0,06 | 20 % | 3,5 | 5,2 | 0,70 |
| ia-referencia | dos grupos | 3 % | 82 % | 15 % | 5,7 | 2,84 | 2,24 | 0,28 | 0,28 | 16 % | 2,3 | 4,9 | 0,63 |
| ia-referencia | un grupo | 0 % | 34 % | 66 % | 7,4 | 2,87 | 2,32 | 0,22 | 0,33 | 18 % | 4,5 | 5,0 | 0,62 |
| abastecer | dos grupos | 0 % | 65 % | 35 % | 6,8 | 2,87 | 2,82 | 0,03 | 0,02 | 49 % | 3,2 | 3,2 | 0,59 |
| abastecer | un grupo | 0 % | 43 % | 57 % | 7,4 | 2,98 | 2,92 | 0,03 | 0,03 | 72 % | 5,9 | 3,2 | 0,57 |

Lectura:

- **Quitar el segundo grupo cuesta poco en victorias (64 → 59 % con la mejor política) pero cambia de dónde viene la derrota.** En V9.9 la IA comparte la economía: su comida y sus aportes van a la misma reserva y a la misma crisis, y sus muestras al mismo objetivo. Sin ella, el hambre pasa del 25 % al 49 % de las partidas y las crisis fallidas de 1,8 a 4,1 por partida. A cambio desaparecen sus muertes, que también cuestan moral (3,4 muertes de la IA por partida en la línea base, cada una −1 moral). El saldo es casi neutro.
- **La IA de referencia, jugando como humano, no gana nunca** (0–3 %): mueve a todos los supervivientes cada ronda (una exposición por cabeza y ronda), los amontona en el mismo mazo y deja un tercio de los dados sin usar. Como IA de V9.9 muere igual de seguido (4,4 bajas por partida en la línea base jugada con ella de un lado y cooperativa del otro), pero ahí sus muertes las paga el jugador en moral y no en dados propios. Conviene no tomarla como «jugador medio».
- **Un superviviente hace todo:** la cuota del personaje más usado es 0,70 en A y 0,79 en B/C (0,33 sería reparto parejo). En el ejemplo de §3, Mara con palanca y pistola usa 4 de cada 4 dados; Leo e Iris solo construyen y se exponen. Es el riesgo de 63 §8 confirmado con números: el reparto de dados no sigue a los roles, sigue al que tiene mejor requisito.

### 2.2 Escenarios (un grupo)

Victoria por escenario y política; entre paréntesis, muertes propias por partida.

| Escenario | cooperativa | objetivo | ia-referencia | abastecer |
|---|---|---|---|---|
| A · tres sanos | 59 % (2,2) | 47 % (5,2) | 0 % (5,0) | 0 % (3,2) |
| B · muere Iris | 60 % (1,4) | 49 % (4,2) | 0 % (3,7) | 0 % (2,0) |
| C · B + Leo lesionado | 58 % (1,6) | 49 % (4,2) | 0 % (3,7) | 0 % (2,1) |
| D · B + carta de rescate | 60 % (1,4) | 42 % (5,0) | 0 % (5,0) | 0 % (3,0) |
| E1 · cuatro | 60 % (2,8) | 41 % (6,1) | 0 % (6,1) | 0 % (4,1) |
| E2 · cinco | 61 % (3,6) | 38 % (6,8) | 1 % (7,1) | 0 % (5,1) |

- **El tamaño del grupo es casi neutro para ganar.** Con la cooperativa, dos, tres, cuatro o cinco supervivientes ganan entre el 58 y el 61 %. Perder a Iris al empezar (B) o lesionar a Leo (C) no mueve la aguja. Con «objetivo», más gente es peor (47 → 38 %), porque cada persona extra es una exposición más por ronda.
- Por qué no hay espiral por dados en V9.9: la amenaza escala con el grupo. Los zombis llegan uno por superviviente fuera de la colonia y ⌈habitantes/2⌉ a la colonia; la comida se consume por habitante. Un grupo más chico tira menos dados, pero también atrae menos zombis y come menos. Es exactamente la «división por dos automática» que 63 §8 pide no aplicar en el diseño propio; en V9.9 ya está.
- **La carta de rescate (D) no ayuda** a ninguna política: la cooperativa no la juega (no estaba en su repertorio C14) y las otras reclutan a alguien que muere con la misma facilidad.

### 2.3 Tras la primera muerte en juego (un grupo, cooperativa)

| Escenario | Partidas con muerte | Ronda de la primera | Espiral | Recupera | Victoria igual |
|---|---|---|---|---|---|
| A | 75 % | 2,4 | 67 % | 47 % | 46 % |
| B | 57 % | 3,5 | 61 % | 35 % | 37 % |
| E2 | 92 % | 1,8 | 84 % | 57 % | 56 % |

Una muerte en juego suele traer otra en las dos rondas siguientes (espiral 61–84 %), pero eso no impide ganar: casi la mitad de las partidas con muertes se ganan igual. La espiral existe en bajas, no en resultado, porque el objetivo se alcanza antes de que la moral se agote (ronda final media 5–6 sobre 6–10).

### 2.4 Viabilidad de la decisión (un grupo, escenario A)

Reparto de rondas por clase (definiciones en §1.7):

| Política | competida | obligada-abastecer | solo-abastecer | solo-objetivo | holgada |
|---|---|---|---|---|---|
| cooperativa | **5 %** | 50 % | 23 % | 4 % | 17 % |
| objetivo | 10 % | 78 % | 0 % | 2 % | 10 % |
| ia-referencia | 4 % | 79 % | 5 % | 4 % | 9 % |
| abastecer | 4 % | 26 % | 46 % | 4 % | 20 % |

Por ronda, cooperativa (A, un grupo): ronda 1 holgada en el 72 % de las partidas (nadie salió todavía, la crisis se cubre con la mano inicial); ronda 2 es la única con competencia real (18 % competida, 57 % obligada); de la ronda 3 en adelante, obligada-abastecer en el 62–72 % y competida ≤ 1 %. La comida media cae de 5,9 a 1,9 en la ronda 4 y a 0,6 en la 6; las muestras suben 1 por ronda hasta la 4 y después 0,4.

**Interpretación (DATOS):** con 1 + vivos dados, el abastecimiento «pide» todos los dados en la mitad de las rondas y la decisión real aparece solo en la ronda 2. Pero la exigencia es blanda: la política «objetivo» ignora el 78 % de rondas «obligadas», pierde 5 supervivientes por partida y gana el 47 %. El motor cobra una muerte a −1 moral (más los dados que se van con la persona, compensados por la amenaza que se achica). Mientras una muerte cueste eso, abastecer y avanzar no compiten como alternativas: avanzar domina y abastecer es solo lo que se hace con el dado que sobra o cuando el desbordamiento es inminente.

Dos cosas más que condicionan esto: con «objetivo» e «ia-referencia» la colonia queda vacía en el 70 % de las fases (nadie come, no llegan zombis a la colonia: consumo 0 y llegadas 0), y 3,5 de sus muertes por partida son desbordamientos en la Biblioteca (capacidad 4) donde se amontonan. La cooperativa, con un defensor en casa, tiene 0,2 muertes por desbordamiento y 1,9 por exposición.

### 2.5 Objetivo sorteado (un grupo, A)

| Objetivo | cooperativa | objetivo | ia-referencia |
|---|---|---|---|
| Operación antídoto (5 muestras, 6 rondas) | 74 % | 80 % | 1 % |
| Encontrar la cura (7, 8) | 65 % | 49 % | 0 % |
| Última esperanza (9, 10) | 40 % | 11 % | 0 % |

Cuanto más larga la partida, menos sirve correr: «objetivo» pasa del 80 % al 11 % y la cooperativa, que sí abastece, del 74 % al 40 %. La duración del objetivo es la palanca que hace que abastecer importe.

### 2.6 Barrido (un grupo, ia-referencia, escenario A)

Victoria / moral 0 / rondas agotadas · dados por ronda (sin usar) · crisis fallidas · muertes · rondas competidas / obligadas / holgadas.

| Dados | Crisis | Victoria | Moral | Agotadas | Dados (sin usar) | Crisis fall. | Muertes | competida | obligada | holgada |
|---|---|---|---|---|---|---|---|---|---|---|
| v99 (1+n) | 1 | 0 % | 27 % | 73 % | 2,85 (0,34) | 2,7 | 5,1 | 3 % | 73 % | 8 % |
| v99 | 2 | 0 % | 34 % | 66 % | 2,87 (0,33) | 4,5 | 5,0 | 4 % | 79 % | 9 % |
| v99 | 3 | 0 % | 39 % | 61 % | 2,88 (0,33) | 5,4 | 4,9 | 9 % | 80 % | 4 % |
| mas-uno (2+n) | 1 | 1 % | 26 % | 73 % | 3,95 (0,45) | 2,3 | 5,5 | 14 % | 39 % | 28 % |
| mas-uno | 2 | 1 % | 36 % | 63 % | 3,97 (0,44) | 4,1 | 5,5 | 9 % | 55 % | 25 % |
| mas-uno | 3 | 1 % | 44 % | 55 % | 3,98 (0,43) | 4,9 | 5,4 | 9 % | 65 % | 16 % |
| doble (2n) | 1 | 11 % | 25 % | 64 % | 4,10 (0,36) | 2,2 | 5,2 | **21 %** | 46 % | 15 % |
| doble | 2 | 10 % | 34 % | 57 % | 4,14 (0,36) | 3,8 | 5,1 | 16 % | 57 % | 17 % |
| doble | 3 | 11 % | 39 % | 51 % | 4,15 (0,35) | 4,7 | 5,1 | 9 % | 66 % | 15 % |

| Comida / zombis (v99, crisis 2) | Victoria | Moral | Hambre | Muertes | Espiral | Recupera | competida |
|---|---|---|---|---|---|---|---|
| comida ligera (⌊/2⌋) | 0 % | 33 % | 13 % | 5,0 | 94 % | 0 % | 4 % |
| comida estricta (1 por cabeza) | 0 % | 43 % | 34 % | 4,9 | 94 % | 0 % | 5 % |
| zombis mitad | **17 %** | 12 % | 3,2 | 3,2 | 72 % | 21 % | 8 % |
| zombis doble | 0 % | 83 % | 14 % | 7,0 | 100 % | 0 % | 3 % |

Escenario B da las mismas formas con 2–3 puntos menos de muertes; está en el CSV.

- **Más dados no hacen competir las alternativas por sí solos.** Con `doble` (6 dados para 3 vivos) las rondas competidas suben del 4 al 16–21 % y las holgadas del 9 al 15–17 %, pero un tercio de los dados sigue sin usarse: esta política no tiene en qué gastarlos. Las muertes no bajan.
- **La exigencia de crisis mueve el tipo de derrota, no la decisión:** de 1 a 3 cartas, moral 0 pasa del 27 al 39 % y las crisis fallidas de 2,7 a 5,4; las rondas competidas suben al 9 % solo porque la crisis cuenta como demanda.
- **La comida casi no pesa** con esta política porque deja la colonia vacía: «estricta» duplica el hambre (34 %) y suma 9 puntos de derrotas por moral, nada más.
- **La entrada de zombis es la palanca más sensible:** a la mitad, las muertes bajan de 5,0 a 3,2, la espiral del 94 al 72 %, aparece recuperación (21 %) y hasta esta política gana el 17 %. Al doble, moral 0 en el 83 %.

---

## 3. Dos rondas concretas

Semilla 387276917, un grupo, cooperativa, escenario A, objetivo «Operación antídoto» (5 muestras en 6 rondas). Se reproduce con `node lab/sp04/correr.mjs --ejemplo 387276917 --escenario A --politica cooperativa`.

**Ronda 2 — la única competida.** Vivos 4 (Mara reclutó a alguien en la ronda 1), 5 dados, comida 6, moral 9, muestras 2, crisis de comida ya cubierta con la mano. Demanda de abastecer 3 (tres ataques para evitar el desbordamiento de la Biblioteca, donde están casi todos), demanda de objetivo 3 (tres propios en un mazo con muestras). 3 + 3 > 5: hay que elegir. La política gasta 5, 4 y 5 en tres ataques de Mara, un 2 en buscar (muestra) y otro 2 en buscar (ración). Resultado: sin muertes, 3 muestras.

**Ronda 3 — obligada.** 5 dados, comida 2, moral 11, muestras 3, crisis de medicina sin cubrir. Demanda de abastecer 5 (defensa 3 + crisis 2) ≥ 5 dados: según la definición no queda margen. La política ataca dos veces y busca tres (manual, notas, rescate); la crisis falla (dos zombis a la colonia), llega un recluta. Ronda 4: 6 dados, demanda de abastecer 9, tres ataques y una búsqueda que saca la quinta muestra. **Victoria en la ronda 4.** En las tres rondas «obligadas», Mara usó 12 de los 16 dados.

Misma semilla con «objetivo»: en la ronda 1 manda a los tres a la Biblioteca, Mara busca cuatro veces (rescate, muestra, notas, muestra), una mordedura mata al recluta y sacrifica a Leo para cortar el contagio; la colonia queda vacía (consumo 0). Ronda 2 y 3, dos personas, 3 dados cada una, todo a buscar. **Victoria en la ronda 3** con dos muertos. Es la partida de 4 rondas y cero muertes contra la de 3 rondas y dos muertos: el motor valora igual las dos.

Semilla 3189639203, cooperativa, mismo objetivo: ronda 2 competida (demanda 3 + 2 con 4 dados), elige dos ataques y dos búsquedas sin muestra; de la ronda 3 a la 6 todo obligado, cuatro crisis fallidas seguidas (dos heridas, comida, moral), Leo muere por daños en la 4, Mara e Iris por mordedura en la 5; termina por rondas agotadas con 4 de 5 muestras. Aquí la espiral es completa: sin especialista de curación las heridas de crisis se acumulan.

---

## 4. Lo que responde y lo que no

**Pregunta:** cuántas acciones y recursos necesita un solo grupo para que abastecer y avanzar compitan.

**Respuesta con números:**

1. Con V9.9 tal cual (1 + vivos dados, crisis de 2, comida ⌈/2⌉), un solo grupo de tres gana el 59 % con la mejor política probada, cinco puntos menos que con la IA al lado. No es inviable; el grupo único no «muere de hambre» por la ausencia de la IA.
2. Las alternativas no compiten: 5 % de rondas competidas, 50 % obligadas. Y la obligación no obliga: ignorarla cuesta bajas, no la partida. La estrategia dominante es correr a las muestras.
3. Ninguno de los cuatro parámetros barridos crea la competencia por sí solo. Más dados la suben a un 16–21 % de las rondas; la entrada de zombis es lo que más cambia las bajas y la recuperación; la crisis y la comida cambian el tipo de derrota.
4. Lo que el barrido no toca y los datos señalan como causa: el precio de una muerte (−1 moral y nada más), el escalado de la amenaza con el tamaño del grupo, la colonia vacía sin consumo ni llegadas, y objetivos cortos (6 rondas) que premian el sprint.

**Lo que no responde:** cómo juega un jugador humano. Las cuatro políticas son fijas y simples; la cooperativa es la que mejor usa los dados pero concentra todo en Mara, y ninguna planifica a dos rondas. Un humano probablemente haga mejor que las cuatro; la pregunta de si las alternativas compiten es de reglas, no de habilidad, y ahí los datos son consistentes entre políticas.

---

## 5. RECOMENDACIONES (propuestas, ninguna aprobada)

Para que abastecer y avanzar compitan, los experimentos siguientes deberían apuntar a lo que el barrido no cubrió, en este orden:

1. **Costo de la muerte.** Probar en el laboratorio una penalización mayor que −1 moral (por ejemplo, −2, o perder la mano del muerto, o una ronda de luto sin un dado). Es la variable que vuelve «obligado» lo obligado. Requiere un setter sobre `kill` (existe) y una política que lo sepa.
2. **Amenaza que no escale con el grupo.** Llegadas fijas por localidad o mínimo de llegadas a la colonia aunque esté vacía. Elimina el refugio de la colonia vacía y la neutralidad del tamaño. Requiere reemplazar `colony()` en el laboratorio (tiene setter).
3. **Duración del objetivo.** Objetivos de 8–10 rondas ya hacen que abastecer importe (2.5); con 6 rondas no. Decidir el rango de rondas de las campañas antes de ajustar dados.
4. **Reparto de dados por rol.** La cuota máxima de 0,70–0,79 sugiere que, si se quiere que importe quién hace qué, el requisito por atributo (F-10) o los límites por personaje tienen que entrar en el laboratorio antes de dar por bueno el reparto libre.
5. **Dados:** `mas-uno` y `doble` no se justifican con estos datos: suman dados sin usar. Mantener 1 + vivos hasta tener los puntos 1–3.
6. **Reclutamiento:** el escenario D no cambia nada; antes de diseñar vías de reclutamiento conviene arreglar el precio de la muerte, si no los reclutas son dados descartables.

Siguiente corrida sugerida, si el creador la pide: costo de muerte × llegadas fijas, escenarios A y B, políticas cooperativa y objetivo, objetivos fijos por semilla.

---

## 6. Riesgos y límites del laboratorio

- **Políticas fijas.** Todo resultado es «con esta política». Las cuatro se documentan en §1.4; la cooperativa es la referencia porque ya validó cientos de partidas en C14.
- **Demandas de decisión** (§1.7) son una definición del laboratorio, con el mazo a la vista. Sirven para comparar celdas entre sí, no como verdad del jugador.
- **Entrada de zombis** se escala sobre todas las llegadas de la fase de colonia, no solo sobre las de población.
- **Muertes del escenario** restan moral como cualquier muerte (B, C y D arrancan con moral 8). Los dados de la ronda 1 ya están tirados cuando se aplica el escenario.
- **500 partidas por celda**: diferencias de menos de 4–5 puntos porcentuales no son concluyentes. El plan de 1000 se interrumpió por pedido del creador; cualquier celda se puede subir con `--partidas`.
- **La IA de referencia como humano** no es la IA de V9.9: elige botín y mordeduras con sus propias tablas, pero el motor le da al jugador decisiones que a la IA no le da.
- **Un grupo conserva el reemplazo de emergencia** del último superviviente (regla V9.9). Nunca se dio «sin supervivientes» en las 37 000 partidas porque el plantel de 16 no se agota.

---

## 7. Entrega

- `lab/sp04/` (arnés, políticas, escenarios, métricas, CLI), `lab/sp04/resultados/` (CSV agregados), `tests/sp04-arnes.test.mjs` (reproducibilidad, calibración contra C14, un grupo, escenarios).
- `npm test` en verde con las cuatro pruebas nuevas.
- Sin cambios en `src/`, `invierno_colonia_v9_9.html`, tags, pruebas existentes ni mapa. Sin PR hacia `main`.
