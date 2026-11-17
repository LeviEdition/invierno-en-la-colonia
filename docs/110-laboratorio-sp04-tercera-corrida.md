# 110 — Laboratorio SP-04, tercera corrida: corredor que reparte, indefensos compensados y médico jugable

17/11/2026. Rama `experiment/sp04-laboratorio-un-grupo` ([PR #32](https://github.com/LeviEdition/invierno-en-la-colonia/pull/32), borrador), con `main` traído por merge (`d9f9274`). Antecedentes: [106](106-laboratorio-sp04-un-grupo.md), [107](107-laboratorio-sp04-segunda-corrida.md) y [105 §5–6](105-ficha-capitulo-la-ultima-guardia.md). **Ninguna cifra es una regla aprobada.**

```bash
node lab/sp04/tercera-corrida.mjs        # 68 celdas × 500 partidas, ~1 min; escribe lab/sp04/resultados/tercera-corrida/
node lab/sp04/tercera-corrida.mjs --ejemplo 1013904226 --dados mas-uno [--politica objetivo-repartido]
node --test tests/sp04-tercera.test.mjs
```

**Base P1** (107 §3.1): D12, 2 indefensos, comida 6, crisis V9.9, 8 rondas («Encontrar la cura», 7 muestras), moral −2 por superviviente, equipo perdido y 1 + vivos dados. Escenarios A (tres sanos) y B (muere Iris al empezar), 500 partidas por celda, mismas semillas que en 106 y 107. Las tres políticas saben de los indefensos (107 §1.4). P1 reproduce exactamente las cifras de 107 para la cooperativa y «objetivo». Los CSV de 107 se regeneraron después de los cambios y son idénticos byte a byte.

## Método (lo nuevo)

- **`objetivo-repartido`:** juega como «objetivo» (dados, botín, vuelta a defender la colonia con indefensos), pero reparte al grupo.
  - Cada superviviente va al mazo de muestras o notas (Biblioteca, Hospital, Escuela; si ninguno sirve, Supermercado, Comisaría, Gasolinera) con menos compañeros.
  - Un mazo sirve si tiene cartas, si queda plaza y si los accesos absorben las llegadas de la próxima fase: un zombi por superviviente presente, sin superar capacidad − zombis.
  - Si ninguno sirve, vuelve a la colonia.
- **Cocinero:** Tomás es el único cocinero del plantel. Dos variantes:
  - *reemplaza a Leo*: grupo de 3, aísla el efecto del cocinero, pero se pierde el constructor;
  - *se suma*: grupo de 4, que agrega también un dado y una boca.
- **Médico jugable** (105 §6), solo si se rescata en la ronda 5:
  - El rescate es el de 107 §1.6: el rescatista llega con dos daños y hace una tirada D12; el médico se incorpora aunque el rescatista muera.
  - Entra con `recruit` del motor, que elige plantel y lugar con su azar. Después se le fija la identidad: «Médico», ataque 4, búsqueda 3, influencia 70 y ninguna habilidad del motor.
  - Suma su dado, se mueve, se expone, come y su muerte cuesta −2.
  - **Pasiva:** desde la ronda siguiente, al empezar cada ronda, cura al aliado más herido de su misma localidad, nunca a sí mismo; a igualdad, al de mayor influencia. Variante *heridas*: solo heridas. Variante *heridas o congelación*: cura primero la congelación, que hiere cada ronda.
  - Las políticas no buscan juntarse con él a propósito.
- **Diagnóstico fuera del encargo:** `cooperativa-repartida`, la cooperativa con el mismo destino repartido, para saber si lo que gana es correr o repartir.

## DATOS

### Pregunta 1 — ¿Correr bien domina? (P1)

| Política | Victoria A / B | Media | Ventaja frente a la cooperativa | Muertes por desbordamiento (A) | Partidas con hambre (A) | Reclutas por partida (A) | Vivos al final (A) |
|---|---|---|---|---|---|---|---|
| cooperativa | 44,2 / 27,2 | 35,7 | — | 0,28 | 74 % | 1,0 | 2,3 |
| objetivo (amontona) | 11,0 / 11,0 | 11,0 | −24,7 | 3,28 | 31 % | 1,6 | 0,6 |
| **objetivo-repartido** | 59,6 / 71,0 | **65,3** | **+29,6** | 0,29 | 40 % | 1,9 | 3,3 |
| cooperativa-repartida (diagnóstico) | 44,8 / 42,4 | 43,6 | — (repartido: +21,7) | 0,41 | 75 % | 1,1 | 2,6 |

**Sí, correr domina cuando no se amontona:** el corredor repartido gana 30 puntos más que la cooperativa y casi no pierde gente.

Repartir ayuda a la cooperativa en B (27 → 42 %), pero el corredor sigue 22 puntos arriba. La diferencia que queda es la colonia. Quien deja un defensor en casa pasa hambre en el 74–84 % de las partidas: come y atrae ⌈(habitantes + indefensos)/2⌉ zombis. Quien la deja vacía solo alimenta a los indefensos, y vuelve a defender únicamente cuando hay peligro. Además, buscar en más mazos da más cartas de rescate: 1,9 reclutas por partida frente a 1,0.

### Pregunta 2 — Indefensos compensados

| Compensación sobre P1 | Cooperativa A / B (media) | Objetivo | Repartido A / B (media) | Ventaja del repartido |
|---|---|---|---|---|
| ninguna (P1) | 44,2 / 27,2 (35,7) | 11,0 | 59,6 / 71,0 (65,3) | +29,6 |
| cocinero reemplaza a Leo | 52,0 / 11,6 (31,8) | 8,7 | 60,2 / 64,4 (62,3) | +30,5 |
| cocinero se suma | 53,6 / 27,0 (40,3) | 10,4 | 39,4 / 55,4 (47,4) | +7,1 |
| 2 + vivos dados | 79,6 / 70,0 (74,8) | 40,5 | 68,8 / 84,6 (76,7) | +1,9 |
| comida 8 | 51,6 / 33,6 (42,6) | 13,1 | 62,0 / 72,6 (67,3) | +24,7 |

**Ninguna deja a la cooperativa cerca del 50 % sin que correr domine.**

- **2 + vivos dados:** empata a los dos (diferencia dentro del ruido), pero con la cooperativa en 75 %.
- **Cocinero que se suma:** el término medio, con la cooperativa en 40 % y una ventaja de +7 para el corredor.
- **Cocinero que reemplaza a Leo:** hunde a B (12 %). Con Iris muerta, el grupo queda en Mara y Tomás, sin constructor.

### Pregunta 3 — Médico jugable: retirarse frente a rescatar

Victoria; entre paréntesis, rescatar − retirarse en puntos.

| Base · variante | Cooperativa A / B | Objetivo A / B | Repartido A / B | Médico muere | Curas por partida con médico |
|---|---|---|---|---|---|
| P1 · retirarse | 43,8 / 27,0 | 11,0 / 10,8 | 58,4 / 70,0 | — | — |
| P1 · rescatar (heridas) | 43,6 (−0,2) / 20,4 (**−6,6**) | 13,0 (+2,0) / 12,2 (+1,4) | 58,4 (0,0) / 66,2 (−3,8) | 13–24 % | 0,02–0,17 |
| P1 · rescatar (heridas o congelación) | igual que «heridas» | igual | igual | igual | 0,02–0,16 |
| comida 8 · retirarse | 51,8 / 32,6 | 12,8 / 13,2 | 60,8 / 72,0 | — | — |
| comida 8 · rescatar (heridas) | 48,8 (−3,0) / 28,8 (−3,8) | 15,0 (+2,2) / 14,6 (+1,4) | 60,2 (−0,6) / 69,2 (−2,8) | 14–20 % | 0,00–0,23 |
| comida 8 · rescatar (heridas o congelación) | 49,2 (−2,6) / 29,0 (−3,6) | igual que «heridas» | igual | igual | 0,00–0,22 |

La base extra de la pregunta 3 es «comida 8»: la compensación con la cooperativa más cerca del 50 %.

- **La decisión queda pareja:** con cada variante de la pasiva, rescatar y retirarse quedan a menos de 5 puntos en 11 de 12 celdas. La excepción es la cooperativa en P1, escenario B (−6,6). En 107, con el médico abstracto, retirarse ganaba por 7–15.
- El rescatista muere el 38–51 % de las veces. El médico se incorpora en el 95–100 % de los rescates: falla solo si la colonia está llena o la partida terminó.
- **La pasiva casi no actúa:** como mucho 0,23 curas por partida, y las dos variantes dan lo mismo. El equilibrio viene de que el médico es un superviviente más, con su dado, que compensa la muerte probable del rescatista.

### Pregunta 4 — Prueba de evidencias en Windows

`tests/evidencias-enlazadas.test.mjs` usa ahora `fileURLToPath`. Pasa en Windows y en POSIX da la misma ruta que antes (`/home/…/repo/`). `npm test`: **754/754 en Windows**.

### Jugada de ejemplo — P1 con 2 + vivos dados (semilla 1013904226, A)

Es la única compensación en la que correr no domina.

- **Cooperativa:**
  - Mara defiende la colonia y Iris busca en la Biblioteca. Una carta de rescate trae a un cuarto superviviente en la ronda 1.
  - **Ronda 2, competida:** 6 dados; demanda de abastecer 5, de objetivo 3. Gasta tres seises en que Mara ataque en la colonia y tres dados en que Iris busque (dos muestras y unas notas).
  - **Rondas 3–4, obligadas:** el mismo patrón: tres o cuatro ataques en casa, una o dos búsquedas y una limpieza. Sin hambre ni muertes, **gana en la ronda 4** con cuatro vivos.
- **Repartido, misma semilla:** reparte a todos entre mazos y la colonia queda con los dos indefensos.
  - Mara muere por mordedura en la ronda 3.
  - La colonia se desborda en las fases de colonia de las rondas 4 y 5 (mueren Damián y Leo, −4 de moral) y la comida llega a 0.
  - Derrota por moral en la ronda 5, con 2 de 7 muestras.

Es la partida que el diseño busca: defender a los indefensos paga. Con 1 + vivos dados, en cambio, el corredor gana así el 65 % de las veces.

## RECOMENDACIONES (propuestas)

1. **El problema de fondo no se arregla con compensaciones.** Mientras la colonia vacía no coma ni atraiga más que lo que traen los indefensos, correr repartido domina. Probar antes de seguir ajustando cifras (los dos son cambios de regla y requieren decisión del creador):
   - **los supervivientes comen estén donde estén**;
   - **llegadas a la colonia que no dependan de quién está en ella**.
2. **Pregunta 2:** si hay que elegir ya, «cocinero que se suma» es el término medio (cooperativa 40 %, ventaja del corredor +7). «2 + vivos dados» empata a las políticas, pero hace el capítulo fácil.
3. **Médico jugable: adoptarlo.** Vuelve pareja la decisión de la puerta, que es lo que pide 105 §9, y la consecuencia narrativa de retirarse (M5, la secta) puede inclinarla.
   - Para la pasiva alcanza con **solo heridas**, que es más simple: «heridas o congelación» no agrega nada medible.
   - Se diferencia de Mara en que es automática y depende de dónde esté. Su valor en estos números viene de ser un superviviente más, no de curar.
   - Un jugador que lo junte a propósito con los heridos le sacará más que estas políticas.

## Lo que faltó

- Medir las dos reglas de la recomendación 1.
- Políticas que aprovechen la pasiva del médico (juntarlo con heridos).
- El rescate con el corredor repartido como política principal, más allá de la tabla.
