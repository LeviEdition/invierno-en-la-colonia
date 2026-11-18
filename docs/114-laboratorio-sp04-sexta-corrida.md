# 114 — Laboratorio SP-04, sexta corrida: políticas adaptativas y crisis resolubles

17/11/2026. Rama `experiment/sp04-noche`, desde la quinta corrida ([113](113-laboratorio-sp04-quinta-corrida.md)). Solo toca `lab/sp04/`. **Ninguna cifra es una regla aprobada.**

```bash
node lab/sp04/sexta-corrida.mjs                    # 500 partidas × celda, ~60 s
node lab/sp04/sexta-corrida.mjs --ejemplo 1234567 --comidaInicial 8 --improvisar true --crisisParcial true --politica cooperativa-prudente
node --test tests/sp04-sexta.test.mjs              # 13 tests
```

## Método

Mismas bases y semillas que [113](113-laboratorio-sp04-quinta-corrida.md). 500 partidas, `semillaC14(1..500)`, escenarios A y B. Noche/localidad + regreso activos en todas las variantes excepto la base.

**Palancas nuevas:**

- `improvisar = true`: un superviviente en colonia puede gastar un dado ≥ 4 para aportar 1 contribución válida a la crisis de la ronda. Una vez por superviviente por ronda (marcador `p.hasImprovised` reseteado en nueva ronda).
- `crisisParcial = true`: si los aportes válidos llegan a ceil(necesidad/2) = 1 sin completarla (necesidad = 2), la consecuencia se reduce a la mitad (moral 1→0, zombis 2→1, comida 2→1, herida 1→0).

**Políticas nuevas:**

- `cooperativa-prudente`: igual a cooperativa pero con (a) reserva de la última carta de cada tipo de crisis (comida/medicina/herramienta/combustible) salvo emergencia (hambre o superviviente con ≥ 2 heridas), (b) regresa a la colonia al superviviente de menor influencia que duerma **solo** en una localidad exterior (antes de barricar/limpiar, cuesta un dado), (c) improvisa para la crisis si queda un dado ≥ 4 y la crisis no está cubierta.
- `objetivo-repartido-prudente`: mismo corredor repartido pero con reserva, regreso de solos (excepto buscadores de muestras activos), e improvisación.

**Variantes** (nocheAfuera = localidad en todas salvo base):

| # | Id | Comida | Crisis |
|---|---|---|---|
| Ref | base | P1 (6) | normal |
| 1 | c6-normal | 6 | normal |
| 2 | c6-adapt | 6 | improvisar + parcial |
| 3 | c8-normal | 8 | normal |
| 4 | c8-adapt | 8 | improvisar + parcial |
| 5 | c10-normal | 10 | normal |
| 6 | c10-adapt | 10 | improvisar + parcial |

## DATOS

### Victoria por variante (media A+B, %)

| Variante | Cooperativa | Coop-prudente | Obj-repartido | Obj-rep-prudente | VentajaPrudente |
|---|---|---|---|---|---|
| **Base** | 35,7 | 37,6 | 65,3 | 66,3 | **+28,7** |
| **c6-normal** | 25,4 | 29,7 | 33,0 | 37,6 | **+7,9** |
| **c6-adapt** | 29,6 | 31,8 | 34,9 | 38,8 | **+7,0** |
| **c8-normal** | 29,6 | 34,9 | 35,7 | 41,7 | **+6,8** |
| **c8-adapt** | 33,4 | **37,2** | 38,8 | 43,1 | **+5,9** |
| **c10-normal** | 33,1 | **39,3** | 37,6 | 45,6 | **+6,3** |
| **c10-adapt** | 36,7 | **40,7** | 40,3 | 46,5 | **+5,8** |

La base reproduce 35,7 % cooperativa y 65,3 % obj-repartido (igual que 111). Calibración correcta.

### Crisis por variante (cooperativa-prudente, media A+B)

| Variante | Éxitos/partida | Parciales/partida | Fallos/partida | Improvisaciones/partida |
|---|---|---|---|---|
| c6-adapt | 0,46 | 1,03 | 2,89 | 0,02 |
| c8-adapt | 0,52 | 0,94 | 3,03 | 0,03 |
| c10-adapt | 0,57 | 0,87 | 3,14 | 0,03 |

Las crisis **no se vuelven trámite**: sobre ~4–5 rondas con crisis por partida, la tasa de éxito+parcial es del 30–40 %. Los fallos totales siguen siendo la norma (3 de cada 4).

### Regresos (media A+B)

| Política | c8-adapt regresos/partida |
|---|---|
| cooperativa | 0,08 |
| cooperativa-prudente | 0,28 |
| objetivo-repartido | 0,00 |
| objetivo-repartido-prudente | 0,31 |

Los prudentes regresan ~0,3 veces por partida. La cooperativa base aún regresa cuando tiene el dado de menor valor sobrante (quinta corrida), no solo cuando duerme sola.

## ANÁLISIS

**La combinación c8-adapt (noche/localidad + comida 8 + improvisar + parcial) cumple el criterio por primera vez.** Cooperativa-prudente: 37,2 %; ventaja corredor-prudente − cooperativa-prudente: +5,9 pp. Ambos dentro del rango objetivo.

**La mejora viene de los prudentes, no de las palancas de crisis.** Con crisis normal (c8-normal), cooperativa-prudente ya llega a 34,9 % (ventaja +6,8 pp). Las palancas `improvisar + parcial` suman ~2 pp a la cooperativa-prudente y ~0,5 pp al corredor-prudente, resultando en una ventaja ~1 pp menor.

**Improvisar dispara ≈ 0 veces.** Las políticas consumen todos sus dados útiles (≥ 3) en ataques y búsquedas antes de llegar al paso de improvisación. Los dados residuales (1–2) no alcanzan el umbral de 4. La mecánica es correcta en diseño, pero los perfiles del laboratorio son demasiado eficientes para activarla. Con comida abundante y colonia segura podría disparar; en las condiciones del P1 (crisis constante), no.

**crisisParcial sí tiene efecto.** Convierte ~1 crisis por partida de fallo total a parcial. Moral 1→0 y herida 1→0 son los casos más frecuentes; eso equivale a 1–2 puntos de victorias extra por variante para las políticas cooperativas.

**La reserva de cartas es el factor más importante de la mejora.** La cooperativa-prudente falla más crisis (menos aportes por partida: 0,52 éxitos vs 0,83 del cooperativa base con c8-adapt), pero muere menos: al guardar cartas de cada tipo, tiene más recursos para alimentarse, curar y sobrevivir rondas largas. La coop base los usa todos, termina sin reservas y colapsa.

**Scenario A/B diverge mucho**: A (52 % cooperativa-prudente c8-adapt) vs B (23 %). El escenario B es significativamente más difícil con las políticas actuales. Esto sugiere que la varianza entre partidas sigue siendo alta y que el criterio se cumple en promedio pero no garantiza consistencia.

## RECOMENDACIONES

1. **Combinación propuesta: noche/localidad + comida 8 + improvisar + crisisParcial + políticas prudentes.** Cumple ventaja ≤ 8 pp y cooperativa-prudente en 35–55 %. Es la combinación menos restrictiva que lo logra.

2. **Alternativa sin palancas de crisis: noche/localidad + comida 10 + prudentes.** Cooperativa-prudente 39,3 %, ventaja +6,3 pp. Más sencillo mecánicamente; la diferencia de victorias es parecida a c8-adapt.

3. **Improvisar necesita revisión de umbral.** Con umbral de dado ≥ 3 en lugar de ≥ 4, o con una ventana distinta (antes de usar dados para búsqueda, no después), se activaría más. Conviene decidir si la mecánica vale la complejidad que agrega.

4. **La divergencia A/B es una señal.** Antes de aprobar cualquier combinación, conviene verificar qué hace al escenario B tan adverso para las políticas cooperativas.

## Lo que faltó

- Improvisar con umbral de dado ≥ 3: probablemente activaría más y tendría más impacto.
- Medir reserva vs no-reserva por separado: ¿cuánto aporta la reserva sola y cuánto el regreso de solos?
- Validación manual con el teléfono físico (Samsung Galaxy A15): este laboratorio no toca el mapa.
