# 102 — Laboratorio SP-04: economía de un solo grupo sobre el motor real

16/11/2026. Rama `experiment/sp04-laboratorio-un-grupo`, creada desde `main` (`a898a9a`, Hito 3 cerrado). Código en `lab/sp04/`; resultados agregados en `lab/sp04/resultados/`. No se tocan `src/`, la referencia V9.9, los tags ni el mapa.

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
