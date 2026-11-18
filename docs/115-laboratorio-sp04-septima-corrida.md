# 115 — Laboratorio SP-04, séptima corrida: corrección de reserva e improvisar

17/11/2026. Rama `experiment/sp04-noche`, desde la sexta corrida ([114](114-laboratorio-sp04-sexta-corrida.md)). Solo toca `lab/sp04/`. **Ninguna cifra es una regla aprobada.**

```bash
node lab/sp04/septima-corrida.mjs                    # 500 partidas × celda, ~23 s
node lab/sp04/septima-corrida.mjs --ejemplo 42       # partida única con umbral 3
node --test tests/sp04-septima.test.mjs              # 9 tests
```

## Correcciones aplicadas

**Bug 1 — reserva bloqueaba aportar a la crisis.** `bloqueadoPorReserva` impedía contribuir la última carta de un tipo a la crisis. La reserva existe precisamente para conservar esas cartas para la crisis; bloquearlas allí era contradictorio. Corregido: la reserva aplica a usar/equipar/comer, nunca a `aportar-crisis`.

**Bug 2 — improvisar se evaluaba después de buscar/atacar.** Los dados útiles (≥ 4 ó ≥ 3) se consumían en ataques y búsquedas antes de llegar al paso de improvisación. Corregido: si la crisis no está cubierta al llegar al paso de dados, improvisar se evalúa primero.

**Palanca nueva:** `improvisarUmbral` (3 ó 4, default 4) — controla el valor mínimo de dado requerido.

**Variantes sin reserva:** `cooperativa-prudente-sin-reserva` y `objetivo-repartido-prudente-sin-reserva`.

## Método

Misma base que [113](113-laboratorio-sp04-quinta-corrida.md) y [114](114-laboratorio-sp04-sexta-corrida.md): `semillaC14(1..500)`, escenarios A y B, noche/localidad + regreso + comida 10 en todas las variantes. 500 partidas × 5 variantes × 2 escenarios × 2 políticas = 100 celdas.

## DATOS

### Victoria por variante (media A+B, %)

| Variante | Coop-prudente | Coop-prud A | Coop-prud B | Obj-rep-prudente | Obj-rep-prud A | Obj-rep-prud B | Ventaja |
|---|---|---|---|---|---|---|---|
| **c10-normal** | **38,6** | 54,8 | 22,4 | 42,5 | 41,8 | 43,2 | **+3,9** |
| **c10-parcial** | **41,8** | 57,2 | 26,4 | 44,9 | 44,4 | 45,4 | **+3,1** |
| c10-adapt4 | 16,1 | 28,6 | 3,6 | 44,8 | 44,2 | 45,4 | +28,7 |
| c10-adapt3 | 13,3 | 23,6 | 3,0 | 44,8 | 44,2 | 45,4 | +31,5 |
| c10-adapt4-sinres¹ | 11,0 | 15,0 | 7,0 | 47,5 | 48,0 | 47,0 | +36,6 |

¹ Políticas `cooperativa-prudente-sin-reserva` y `objetivo-repartido-prudente-sin-reserva`.

**c10-normal** y **c10-parcial** cumplen el criterio (coop-prudente 35–55 %, ventaja ≤ 8 pp).

### Crisis por variante (cooperativa-prudente, media A+B)

| Variante | Éxitos/partida | Parciales/partida | Fallos/partida | Improvisaciones/partida |
|---|---|---|---|---|
| c10-normal | 0,92 | 0,00 | 3,50 | 0,00 |
| c10-parcial | 0,95 | 1,61 | 1,97 | 0,00 |
| c10-adapt4 | 2,67 | 2,39 | 0,45 | 4,63 |
| c10-adapt3 | 2,85 | 2,62 | 0,24 | 5,27 |
| c10-adapt4-sinres | 2,20 | 3,04 | 0,57 | 4,80 |

## ANÁLISIS

**Bug 2 corregido: improvisar ahora dispara 4–5 veces por partida** (vs 0,03 antes). La mecánica funciona como fue diseñada. Sin embargo, el efecto sobre el resultado es el contrario al esperado.

**Paradoja de improvisar:** con adapt4, las crisis se cubren casi completamente (éxitos + parciales ~5/partida, fallos ~0,5) pero la victoria de cooperativa-prudente cae de 38,6 % a 16,1 %. Con adapt3, la cobertura es todavía mejor pero la victoria baja a 13,3 %.

**Causa:** improvisar consume dados ≥ 4 (o ≥ 3) *antes* del ataque a los zombis. La cooperativa-prudente depende de esos dados para defender la colonia. Al usarlos para improvisar, los zombis se acumulan → desbordamientos → muertes → derrota. El juego en su mecánica no depende de cubrir todas las crisis: perder 3–4 de moral por ronda (el fallo típico) es tolerable si la colonia no colapsa. Pero perder la defensa sí es fatal.

**El corredor no sufre la misma caída** (44–45 % con o sin adapt) porque la mayor parte de sus supervivientes está fuera de la colonia; los que quedan en casa tienen menos presión de ataque y los dados libres son menores.

**crisisParcial sola sí es beneficiosa.** c10-parcial (+3,2 pp respecto a c10-normal) reduce fallos totales a ~2/partida sin sacrificar dados de ataque. Es el incremento más limpio.

**Sin reserva es catastrófico para la cooperativa** (11 %): al no guardar cartas y además usar dados para improvisar, la colonia queda sin defensa en todos los frentes.

**Escenario B diverge porque Iris muere al inicio.** Escenario B = "muerte temprana de Iris (exploradora)": arranca con 2 supervivientes, moral reducida y sin la buscadora principal. La cooperativa necesita a Iris para buscar comida y muestras; sin ella, cae a 22–26 %. El corredor tiene más piezas intercambiables y mantiene 43–45 % en ambos escenarios.

## RECOMENDACIONES

1. **Combinación a aprobar: noche/localidad + comida 10 + crisisParcial + políticas prudentes** (c10-parcial). Cooperativa-prudente 41,8 %, ventaja +3,1 pp. Ambos dentro del criterio. La mecánica crisisParcial mejora sin efectos secundarios.

2. **Improvisar no se recomienda** con las políticas actuales. La mecánica es correcta en diseño, pero choca con la estrategia cooperativa: esa política prioriza la supervivencia de la colonia sobre la cobertura de crisis. Para que improvisar sea útil habría que rediseñar cuándo se activa (p. ej., solo si no hay zombis en la colonia, o solo con dados "malos" ≤ 3 que no sirven para atacar).

3. **Escenario B con Iris muerta** es el factor más adverso para la cooperativa. Antes de aprobar cualquier combinación, considerar si vale la pena diferenciar el criterio por escenario o aceptar que el promedio A+B sea el indicador.

## Lo que faltó

- Medir improvisar con condición "solo si no hay zombis en la colonia" o con umbral ≤ que el ataque del defensor.
- Verificar si la divergencia A/B es menor con políticas distintas o con más comida.
- Validación manual en el teléfono físico (Samsung Galaxy A15): este laboratorio no toca el mapa.
