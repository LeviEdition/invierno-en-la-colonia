# Laboratorio SP-04 — economía de un solo grupo sobre el motor real

Arnés sin DOM que juega partidas completas con `createEngine` (`src/application/reference-engine.mjs`) y azar por semilla. No modifica `src/` ni la referencia V9.9: la variante de un grupo se arma con las inyecciones del motor (`stateFactory`, `rulesFactory`, `turnsFactory`, `automation`) y con los setters del contexto que el motor entrega a `rulesFactory`, la misma superficie que usan la extensión del mapa y las pruebas.

Informes: primera corrida [docs/106-laboratorio-sp04-un-grupo.md](../../docs/106-laboratorio-sp04-un-grupo.md) · segunda corrida [docs/107-laboratorio-sp04-segunda-corrida.md](../../docs/107-laboratorio-sp04-segunda-corrida.md) · tercera corrida [docs/110-laboratorio-sp04-tercera-corrida.md](../../docs/110-laboratorio-sp04-tercera-corrida.md).

## Comandos

```bash
node lab/sp04/correr.mjs                                   # plan completo: 74 celdas × 500 partidas, escribe lab/sp04/resultados/
node lab/sp04/correr.mjs --partidas 200                    # mismo plan, partidas 1..200
node lab/sp04/correr.mjs --ejemplo 17 --escenario B        # una partida ronda por ronda (semilla 17)
node --test tests/sp04-arnes.test.mjs                      # reproducibilidad, calibración contra C14, un grupo, escenarios

# Segunda corrida (docs/107)
node lab/sp04/segunda-corrida.mjs                          # 124 celdas × 500 partidas, ~2 min, escribe resultados/segunda-corrida/
node lab/sp04/segunda-corrida.mjs --criterio v1            # la cadena con el primer criterio, en segunda-corrida/criterio-v1/
node lab/sp04/segunda-corrida.mjs --ejemplo 147926525 --politica cooperativa --moralMuerte 2 --equipoMuerto perdido
node --test tests/sp04-palancas.test.mjs                   # D12, cada palanca, rescate, criterio

# Tercera corrida (docs/110)
node lab/sp04/tercera-corrida.mjs                          # 68 celdas × 500 partidas, ~1 min, escribe resultados/tercera-corrida/
node lab/sp04/tercera-corrida.mjs --ejemplo 1013904226 --dados mas-uno --politica objetivo-repartido
node --test tests/sp04-tercera.test.mjs                    # política repartida, cocinero, médico jugable
```

Opciones de `--ejemplo`: `--politica cooperativa|ia-referencia|abastecer|objetivo`, `--variante dos-grupos|un-grupo`, `--dados v99|mas-uno|doble`, `--crisis N`, `--comida v99|ligera|estricta`, `--zombis v99|mitad|doble`.

## Archivos

| Archivo | Qué hace |
|---|---|
| `azar.mjs` | LCG32 por semilla, el mismo de `test-support/game-fixture.mjs`. |
| `motor-laboratorio.mjs` | Crea el motor para `dos-grupos` (V9.9 con la IA de referencia) o `un-grupo`; parámetros de dados, crisis, comida y zombis; observadores que anotan dados, muertes, crisis, colonia y reclutas sin alterar nada. |
| `politicas.mjs` | `cooperativa` (puerto del controlador de C14), `ia-referencia` (la IA de referencia en el bando del jugador), `abastecer` y `objetivo` (perfiles simples). |
| `escenarios.mjs` | A–E2 de docs/63 §5K, un cambio por vez. |
| `competencia.mjs` | Clasifica cada ronda: competida, obligada-abastecer, solo-abastecer, solo-objetivo, holgada. |
| `partida.mjs` | Bucle de una partida (igual que `test-support/run-game.mjs`). |
| `metricas.mjs` | Agregados por celda y por ronda; CSV. |
| `correr.mjs` | Plan principal y barrido; ejemplo ronda por ronda. |
| `palancas.mjs` | Segunda corrida: D12 (réplica de `map-exposure` sin `mapPlay`), indefensos, comida inicial, crisis agravada, moral por muerte, equipo del muerto, duración del objetivo y rescate del médico. Con valores V9.9 no instala nada. |
| `segunda-corrida.mjs` | Etapas encadenadas de docs/107, criterio de elección, calibración contra la primera corrida y ejemplos con cualquier palanca. |
| `tercera-corrida.mjs` | Tercera corrida (docs/110): corredor repartido, indefensos compensados (cocinero, dados, comida) y médico jugable con su pasiva. |
| `principal.mjs` | Detecta si el módulo se ejecutó con `node` (comparando rutas; en Windows las URL difieren en la letra de unidad). |
| `resultados/` | Solo CSV agregados; nunca registros por partida. Primera corrida en la raíz; segunda en `segunda-corrida/`. |
