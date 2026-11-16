# Laboratorio SP-04 — economía de un solo grupo sobre el motor real

Arnés sin DOM que juega partidas completas con `createEngine` (`src/application/reference-engine.mjs`) y azar por semilla. No modifica `src/` ni la referencia V9.9: la variante de un grupo se arma con las inyecciones del motor (`stateFactory`, `rulesFactory`, `turnsFactory`, `automation`) y con los setters del contexto que el motor entrega a `rulesFactory`, la misma superficie que usan la extensión del mapa y las pruebas.

Informe y lectura de resultados: [docs/102-laboratorio-sp04-un-grupo.md](../../docs/102-laboratorio-sp04-un-grupo.md).

## Comandos

```bash
node lab/sp04/correr.mjs                                   # plan completo: 74 celdas × 500 partidas, escribe lab/sp04/resultados/
node lab/sp04/correr.mjs --partidas 200                    # mismo plan, semillas 1..200
node lab/sp04/correr.mjs --ejemplo 17 --escenario B        # una partida ronda por ronda (semilla 17)
node --test tests/sp04-arnes.test.mjs                      # reproducibilidad, calibración contra C14, un grupo, escenarios
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
| `resultados/` | Solo CSV agregados; nunca registros por partida. |
