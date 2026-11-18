# 113 — Laboratorio SP-04, quinta corrida: la noche fuera de la colonia

17/11/2026. Rama `experiment/sp04-noche`, desde `origin/experiment/sp04-cuarta-corrida` (`e44f326`, regla B). Antecedente: [111](111-laboratorio-sp04-cuarta-corrida.md). No toca `src/`: las palancas viven en `lab/sp04/`. **Ninguna cifra es una regla aprobada.**

```bash
node lab/sp04/quinta-corrida.mjs        # 500 partidas × celda, ~77 s; escribe lab/sp04/resultados/quinta-corrida/
node lab/sp04/quinta-corrida.mjs --ejemplo 1936384585 --nocheAfuera localidad --regreso true [--comida todos]
node --test tests/sp04-quinta.test.mjs  # 9 tests
```

## Método

Mismas bases, semillas y volumen que [111](111-laboratorio-sp04-cuarta-corrida.md): P1 y P1·comida8, 500 partidas, `semillaC14(1..500)`, escenarios A y B. Cuatro políticas: `cooperativa`, `cooperativa-repartida`, `objetivo`, `objetivo-repartido`.

**Palancas nuevas (apagadas por defecto):**

- `nocheAfuera = 'localidad'`: al terminar la fase de colonia de cada ronda, por cada localidad (distinta de la colonia) con al menos un superviviente, una tirada D12 de exposición. Le toca al superviviente de **menor influencia** de esa localidad. Empate: primero en el orden de `c.game.humans`.
- `nocheAfuera = 'unica'`: una sola tirada si hay alguien afuera; le toca al de menor influencia entre todos los que están fuera. Si una mordedura queda pendiente, se detienten las tiradas restantes de esa noche.
- `regreso = true`: al final del turno (antes de «terminar-turno»), la política cooperativa puede devolver a la colonia al superviviente de **menor influencia** de los que están afuera, consumiendo el dado de menor valor. Regla declarada: vuelve si está fuera y es el de menor influencia; la cooperativa nunca excluye localidades de esta decisión (no persigue objetivo). **El corredor nunca regresa** (elección de la política).
- `comida = 'todos'` (regla A): todos los supervivientes comen estén donde estén — `⌈(vivos + indefensos)/2⌉`, igual que V9.9 pero sin filtrar por localidad.

**Variantes:**

| # | Nombre | Configuración |
|---|---|---|
| 1 | Base (como 111) | — |
| 2 | Regla A | `comida='todos'` |
| 3 | Noche/localidad + regreso | `nocheAfuera='localidad'`, `regreso=true` |
| 4 | Noche/única + regreso | `nocheAfuera='unica'`, `regreso=true` |
| 5 | Mejor de 3 o 4 + regla B mínimo 2 | variante 3 + `llegadasColonia='min2'` |

## DATOS

### Victoria por variante (media de A y B, %)

| Variante | Base | Cooperativa | Coop-repartida | Objetivo | Obj-repartido | Ventaja rep–coop |
|---|---|---|---|---|---|---|
| **1 — Base** | P1 | 35,7 | 43,6 | 11,0 | 65,3 | **+29,6** |
| **1 — Base** | P1·com8 | 42,6 | 49,9 | 13,1 | 67,3 | **+24,7** |
| **2 — Regla A** | P1 | 28,9 | 36,2 | 7,7 | 55,6 | **+26,7** |
| **2 — Regla A** | P1·com8 | 33,1 | 41,1 | 9,4 | 61,4 | **+28,3** |
| **3 — Noche/loc** | P1 | 25,4 | 22,6 | 9,0 | 33,0 | **+7,6** |
| **3 — Noche/loc** | P1·com8 | 29,6 | 25,4 | 10,4 | 35,7 | **+6,1** |
| **4 — Noche/única** | P1 | 25,4 | 32,1 | 9,2 | 50,7 | **+25,3** |
| **4 — Noche/única** | P1·com8 | 29,6 | 36,6 | 10,6 | 54,4 | **+24,8** |
| **5 — Mejor+reglaB** | P1 | 25,2 | 22,4 | 5,5 | 24,5 | **−0,7** |
| **5 — Mejor+reglaB** | P1·com8 | 29,2 | 25,2 | 6,9 | 27,1 | **−2,1** |

La base reproduce las cifras de 111 (35,7 vs 35,7 %, 65,3 vs 65,3 %). Calibración correcta.

### Noche/localidad: métricas de noche (P1·comida8, media de A y B)

| Política | Afuera al caer la noche | Fases con alguien afuera | Muertes de noche/partida | Regresos/partida |
|---|---|---|---|---|
| cooperativa | 1,93 | 77 % | 0,34 | 0,08 |
| cooperativa-repartida | 1,77 | 82 % | 0,73 | 0,06 |
| objetivo | 2,09 | 60 % | 0,19 | 0 |
| objetivo-repartido | 2,52 | 88 % | 0,92 | 0 |

El corredor repartido tiene el mayor riesgo nocturno (88 % de las fases con alguien afuera, ~0,9 muertes/partida de noche) y nunca regresa — esa es exactamente la decisión que la palanca hace costosa. La cooperativa tiene ~0,34 muertes/partida de noche aunque la mayoría vuelve a la colonia; las fases con alguien afuera siguen siendo altas (77 %) porque un superviviente se queda buscando.

### Regresos en detalle (noche/localidad, P1·comida8, cooperativa)

Regresos: 0,08/partida en promedio. Se disparan en el escenario B (donde un superviviente muere al inicio y queda solo uno) a 0,10/partida. Los regresos existen pero son escasos porque la cooperativa ya tiende a mantener gente en casa; la palanca tiene más peso sobre el corredor (que nunca la usa).

### Causas de derrota (noche/localidad, P1·comida8, media A y B, %)

| Política | Moral | Tiempo | Sin supervivientes |
|---|---|---|---|
| cooperativa | 67 % | 0 % | 0 % |
| cooperativa-repartida | 72 % | 0,3 % | 0 % |
| objetivo | 90 % | 0 % | 0 % |
| objetivo-repartido | 67 % | 0,3 % | 0 % |

La causa principal sigue siendo la moral, igual que en corridas anteriores. Las muertes de noche son la nueva forma de llegar a ese estado.

## ANÁLISIS

**Noche/localidad es claramente el mecanismo más efectivo.** Corta la ventaja del corredor de +24,7 a +6,1 puntos (P1·comida8), un descenso de 18 puntos — el mayor de todas las variantes.

**Por qué funciona:** el corredor repartido distribuye gente en 2–3 localidades; con noche/localidad recibe 2–3 tiradas D12 por ronda. Con 1/12 de probabilidad de mordedura por tirada y ~0,9 muertes/partida, el corredor pierde supervivientes antes de acumular suficientes muestras. La cooperativa concentra a su gente y solo expone a 1 superviviente por noche cuando sale a buscar.

**Noche/única (variante 4) no funciona bien.** Una sola tirada por noche, independientemente de cuántos estén afuera, elimina el incentivo de concentrarse: el corredor que dispersa a 3 personas no sufre más que el que manda a 1. La ventaja baja solo de +24,7 a +24,8 (P1·comida8) — prácticamente nada.

**Regla A (variante 2) no resuelve el problema.** La pérdida del ahorro de comida del corredor debería cerrar la brecha, pero la cooperativa también cae (de 42,6 a 33,1 % con P1·com8). La caída inesperada de la cooperativa sugiere que, con `comida='todos'`, las políticas cooperativas que salen a buscar también sufren la carga alimentaria. El cierre neto es de −3,8 puntos en la ventaja (25,3 → 21,5 promedio).

**Variante 5 (noche/localidad + regla B) es excesiva.** La victoria general colapsa (corredor: 24–27 %, cooperativa: 25–29 %). El juego se vuelve difícil de ganar para todos y la diferencia se elimina por aplastamiento, no por balance. No es un resultado útil como regla.

**El criterio sigue sin cumplirse.** Ninguna variante alcanza ventaja ≤ 5 puntos con cooperativa ≥ 35 % al mismo tiempo. La más cercana es noche/localidad + P1·com8: ventaja 6,1 puntos y cooperativa 29,6 %. Faltan ~6 puntos de cooperativa para llegar al rango objetivo.

## RECOMENDACIONES (propuestas)

1. **Noche/localidad es la palanca correcta.** Reduce la ventaja del corredor más que cualquier otra combinación probada, con una mecánica narrativamente coherente (quedarse afuera de noche es peligroso). Se propone adoptarla como regla base para los próximos experimentos.

2. **Ajustar la comida, no la fórmula.** La cooperativa cae porque el P1 base (comida 6) es ajustado y la noche les quita supervivientes que necesitaba para alimentarse. Medir noche/localidad con `comidaInicial = 10` ó `12` debería subir la cooperativa sin cambiar la presión sobre el corredor (que no come en casa de todas formas).

3. **No usar regla A sola.** Baja a todos sin reducir la brecha de forma útil.

4. **No combinar todavía con regla B.** La combinación aplasta las tasas de victoria; conviene afinar la comida antes de agregar más presión.

## Lo que faltó

- Noche/localidad con comida 10 o 12: es la combinación más prometedora para meter a la cooperativa en el rango 35–55 %.
- Noche/localidad + regla A combinadas: podría compensar si la caída de la cooperativa con regla A viene del lado del buscador, no del defensor.
- Validación del retorno en el teléfono físico (Samsung Galaxy A15): este laboratorio no toca el mapa.
- Una política que decida la guardia según la amenaza prevista (todas las actuales usan reglas fijas).
