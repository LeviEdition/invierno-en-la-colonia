# 111 — Laboratorio SP-04, cuarta corrida: llegadas a la colonia aunque esté vacía (regla B)

17/11/2026. Rama `experiment/sp04-cuarta-corrida`, desde `main` (`27ef968`, laboratorio fusionado por el PR #32). Antecedente: [110](110-laboratorio-sp04-tercera-corrida.md). No toca `src/`: la regla es una palanca del laboratorio. **Ninguna cifra es una regla aprobada.**

```bash
node lab/sp04/cuarta-corrida.mjs        # 72 celdas × 500 partidas, ~1 min; escribe lab/sp04/resultados/cuarta-corrida/
node lab/sp04/cuarta-corrida.mjs --ejemplo 1936384585 --llegadasColonia min2 --comidaInicial 8 [--politica objetivo-repartido]
node --test tests/sp04-cuarta.test.mjs
```

## Método

- **Regla B** (`llegadasColonia` en `lab/sp04/palancas.mjs`): las llegadas de población a la colonia en la fase de colonia. Parten de las de V9.9, ⌈(supervivientes en casa + indefensos)/2⌉.

  | Variante | Llegadas |
  |---|---|
  | V9.9 | las de V9.9 |
  | mínimo 2 | máx(V9.9, 2) |
  | mínimo 3 | máx(V9.9, 3) |
  | fijo 3 | siempre 3 |

  Funciona así:
  - Al terminar la crisis, el laboratorio cuenta los habitantes como lo hace `colony()` y hace llegar los zombis de la variante con el `addZombie` del motor. El desbordamiento mata a un superviviente (−2) o a un indefenso (−1) con la regla del motor.
  - Después saltea exactamente las llegadas que el motor calcula a continuación.
  - Ruido y crisis fallida suman como siempre.
- Las cuatro políticas y el evaluador de rondas prevén las llegadas con la variante vigente.
- **Bases:** P1 (D12, 2 indefensos, comida 6, crisis V9.9, 8 rondas, moral −2, equipo perdido, 1 + vivos dados) y P1 con comida 8. Escenarios A y B, 500 partidas por celda.
- **Políticas:** cooperativa, cooperativa-repartida, objetivo y objetivo-repartido ([110](110-laboratorio-sp04-tercera-corrida.md)).
- **Mejor variante:** ventaja del repartido sobre la cooperativa ≤ 5 puntos y cooperativa entre 35 y 55 %. Si ninguna cumple, la de menor ventaja con la cooperativa en ≥ 35 %.
- **Guardia:** fase de colonia que empieza con al menos un superviviente en la colonia.
- **Termina por desborde:** derrota en una ronda en la que un desborde de la colonia mató a alguien.
- La variante V9.9 reproduce las cifras de 110, y los CSV de 107 y 110 se regeneran idénticos byte a byte.

## DATOS

### ¿Con qué variante deja de dominar el corredor repartido?

Victoria, media de A y B (%).

| Base | Llegadas | Cooperativa | Cooperativa repartida | Objetivo | Objetivo repartido | Ventaja del repartido |
|---|---|---|---|---|---|---|
| P1 | V9.9 | 35,7 | 43,6 | 11,0 | 65,3 | +29,6 |
| P1 | mínimo 2 | 35,3 | 43,1 | 7,8 | 57,2 | +21,9 |
| P1 | mínimo 3 | 20,7 | 23,2 | 7,6 | 46,2 | +25,5 |
| P1 | fijo 3 | 20,7 | 23,2 | 7,6 | 46,5 | +25,8 |
| P1 · comida 8 | V9.9 | 42,6 | 49,9 | 13,1 | 67,3 | +24,7 |
| P1 · comida 8 | **mínimo 2** | **42,0** | 49,3 | 8,8 | **59,4** | **+17,4** |
| P1 · comida 8 | mínimo 3 | 26,6 | 29,0 | 9,1 | 49,0 | +22,4 |
| P1 · comida 8 | fijo 3 | 26,6 | 29,0 | 9,1 | 49,2 | +22,6 |

**Ninguna variante cumple.** La que más acerca es «comida 8 · mínimo 2»: cooperativa 42 %, pero el corredor sigue 17 puntos arriba.

- **Mínimo 2** le quita al corredor ~8 puntos y casi nada a la cooperativa (≤ 0,6).
- **Mínimo 3 y fijo 3** castigan a los dos (cooperativa −15 a −16, corredor −18 a −19) y la ventaja vuelve a subir. Dan prácticamente lo mismo: con indefensos, la colonia rara vez trae más de 3.

### Indefensos, guardia y desbordes (P1, escenario A; con comida 8 da la misma forma)

| Política | Indefensos perdidos por partida<br>V9.9 / mín. 2 / mín. 3 | Fases de colonia con guardia<br>V9.9 / mín. 2 / mín. 3 | Partidas que terminan por desborde de la colonia<br>V9.9 / mín. 2 / mín. 3 | Partidas con hambre (mín. 2) |
|---|---|---|---|---|
| cooperativa | 0,12 / 0,17 / 0,61 | 92 % / 92 % / 82 % | 5 % / 7 % / 17 % | 74 % |
| cooperativa-repartida | 0,15 / 0,23 / 0,64 | 89 % / 89 % / 77 % | 5 % / 8 % / 21 % | 75 % |
| objetivo | 0,01 / 0,02 / 0,05 | 16 % / 31 % / 52 % | 5 % / 8 % / 26 % | 44 % |
| objetivo-repartido | 0,15 / 0,28 / 0,56 | 27 % / 42 % / 52 % | 8 % / 15 % / 24 % | 43 % |

- La regla B hace que el corredor deje guardia más seguido: 27 % → 52 % de las fases de colonia con mínimo 3. También le cuesta indefensos (0,15 → 0,56) y partidas por desborde (8 → 24 %).
- La cooperativa sigue con hambre en el 74 % de las partidas y el corredor en el 36–43 %. **Lo que queda de la ventaja es la comida:** quien deja a alguien en la colonia lo alimenta.
- Mínimo 3 también golpea a quien deja guardia: la colonia de la cooperativa pasa de 2 llegadas por fase a 3, y pierde 0,6 indefensos por partida.

### Rescate del médico jugable en la mejor variante (P1 · comida 8 · mínimo 2, pasiva de solo heridas)

| Política | Retirarse A / B | Rescatar A / B | Rescatar − retirarse | Rescatista muere | Médico muere | Curas por partida con médico |
|---|---|---|---|---|---|---|
| cooperativa | 51,2 / 31,4 | 48,8 / 27,2 | −2,4 / −4,2 | 48–51 % | 13–16 % | 0,20–0,23 |
| objetivo-repartido | 56,2 / 60,4 | 58,2 / 59,2 | +2,0 / −1,2 | 43–46 % | 14–18 % | 0,02–0,04 |

La decisión sigue pareja (≤ 5 puntos en las cuatro celdas), como en 110.

### Jugada de ejemplo — P1 · comida 8 · mínimo 2, semilla 1936384585, escenario A

- **Cooperativa:**
  - Hay guardia en la colonia en las cuatro fases de colonia. En la ronda 2 una mordedura mata a Mara y a Clara durante el turno. De la ronda 3 a la 5, Iris, Celia y Leo reparten los dados entre atacar y barricar, e Iris sigue buscando muestras.
  - La colonia no se desborda nunca: con dos vivos en casa y dos indefensos, llegan las 2 de V9.9 y la regla no agrega nada.
  - **Gana en la ronda 5** con tres vivos, aunque la comida llega a 0.
- **Objetivo repartido, misma semilla:**
  - Deja la colonia vacía las rondas 1 a 3. La regla trae 2 zombis por fase en lugar de 1 (3 llegadas extra en la partida).
  - Vuelve a montar guardia en las rondas 4 y 5, con la colonia ya cargada y la comida en 1.
  - En la fase de colonia de la ronda 5, el hambre (−4) y el desborde que mata a Leo (−2) bajan la moral de 7 a 3. Derrota por moral en la ronda 6.
- **La decisión que importa es quién se queda y desde cuándo:** la guardia temprana evita el desborde, pero cuesta comida y un buscador.

## RECOMENDACIONES (propuestas)

1. **La regla B sola no alcanza.** Con mínimo 2 el corredor pierde 8 puntos sin dañar a la cooperativa: es la forma razonable de la regla si se adopta. Mínimo 3 y fijo 3 castigan más a quien defiende que a quien corre y no conviene usarlos.
2. **Medir la regla A, «todos comen estén donde estén»,** sola y combinada con mínimo 2. Es la otra mitad de la recomendación 1 de 110. La cooperativa sigue con hambre en el 74 % de las partidas contra el 36–43 % del corredor; esa diferencia es la que sostiene los 17 puntos que quedan.
3. **Médico jugable:** sin cambios respecto de 110; la decisión de la puerta sigue pareja.

## Lo que faltó

La regla A y su combinación con la B, y una política que decida la guardia según la amenaza prevista (todas las de hoy siguen reglas fijas).
