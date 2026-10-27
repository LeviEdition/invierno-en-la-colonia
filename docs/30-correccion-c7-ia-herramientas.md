# 30 — C7 / Issue #5: prioridad cooperativa de herramientas de IA en crisis

**Fecha:** 27/10/2026 · **Rama:** `fix/estabilizacion-v9-9` · **PR:** [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14), en borrador, base `refactor/arquitectura`. **Estado:** implementación C7 realizada, pruebas automatizadas y CI aprobados sobre el commit ejecutable, revisión crítica independiente posterior pendiente. Nada fusionado a `main`.

## Autorización de diseño

El creador aprobó explícitamente la **política A** de [informe29](29-propuesta-prioridad-ia-herramientas.md): resolver siempre una crisis de herramientas cuando la IA pueda completar los aportes restantes; considerar lo ya aportado por el humano; usar primero la mano, luego equipo de supervivientes vivos de IA; selección determinista; no buscar bonus de moral; nunca usar objetos humanos. También propuso que la IA **primero busque ítems y después valore si puede salvar la crisis**. Esta secuencia quedó incluida.

**Distinción sobre aportes parciales:** hay cooperación y no hay traidor, pero en modo humano + IA V9.9 el humano juega antes; tras la IA se resuelve colonia sin otro turno del humano. Una aportación parcial insuficiente al final de la IA no permite esperar una aportación humana posterior esa misma ronda. Para herramientas se conserva el material si lo disponible no alcanza. Los humanos sí pueden realizar aportes parciales antes de la IA y esta completa el faltante si puede; modo local J2 sigue utilizando las reglas humanas existentes.

## Precondición → acción → esperado → observado

- **Estado anterior:** IA equipa primero herramientas desde mano, dona herramientas remanentes de mano *antes* de buscar, omite equipo e ítems adquiridos después en las búsquedas.
- **Acción problemática:** crisis de herramientas 1/2 por aporte humano; IA con palanca equipada y mano vacía; ejecutar `botTurn()`.
- **Esperado aprobado:** la IA dona 1 desde equipo, deja crisis 2/2 y evita la penalización. Si fuera 0/2 con una sola herramienta, la conserva porque no alcanza; si busca una segunda herramienta, evalúa ambas antes de colonia.
- **Observado antes del arreglo:** no alcanza el aporte objetivo en el caso reproducido. Las pruebas de regresión nuevas se ejecutaron sobre la versión anterior: [CI rojo por diseño 0f0c690](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40571566484), **297 declaradas, 288 aprobadas, 7 fallidas y 2 TODO**. La ejecución del commit de ajuste de un fixture `bb9b4c5` también resultó fallida antes del parche; no se toman estos fallos previstos como regresiones del parche.

## Corrección mínima y límites exactos

- En [commit `4166716`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/416671673c81c4aa88d91d06209a53855efb69c8), `botTurn()` conserva la lógica de equipamiento, consumibles, desplazamientos, búsquedas y combate.
- Excluye **solo** `herramienta` del bloque temprano de donaciones; `comida`, `medicina` y `combustible` conservan su funcionamiento.
- Introduce `botContributeTools()` al final de `botTurn()`, inmediatamente antes de colonia: calcula faltante desde contribuciones válidas, inventaría herramientas de `game.botItems` y `game.bots` vivos; si alcanza, usa `CrisisManager.add()` y consume una carta por aporte correcto, sin donar extras. Prioridad: mano de IA en orden de array; después supervivientes IA vivos en orden de `game.bots`, primero el equipamiento disponible de cada uno. Orden reproducible, **no** una valoración táctica sofisticada.
- No toma cartas ni equipos humanos, ni de muertos; no dona después de victoria; no modifica la penalización de crisis, el máximo de aportes humano, los turnos locales ni `main`.
- **Precisión sobre la sugerencia de búsqueda:** antes de valorar la crisis, la IA realiza sus búsquedas normales y puede encontrar una herramienta que se equipe automáticamente. **No busca específicamente herramientas ni cambia la puntuación para elegir botín.** Por ejemplo, ante una muestra y una herramienta reveladas puede preferir la muestra. Modificar esa prioridad sería una decisión de diseño adicional y no está incluida en C7.

## Pruebas registradas

`tests/ia-turnos.test.mjs`: se sustituye el TODO #5 por diez regresiones activas: aporte humano previo 1/2, mano antes de equipo, combinación de fuentes, conservar cuando no alcanza, no bonus, herramienta hallada/equipada durante búsqueda, orden determinista, aislamiento humano y muerto, salida por victoria y secuencia integrada antes de colonia.

**CI del código ejecutable:** [Actions 40571819429](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40571819429): `completed/success`, checkout `416671673c81c4aa88d91d06209a53855efb69c8`, **297 tests declarados, 295 aprobados, 0 fallidos y 2 TODO** (#4 y #6). Los diez nuevos casos C7 pasaron. Las regresiones originales también están cubiertas por la suite completa.

**Límites verificables:** suite Node con DOM simulado y tiempo de animación aislado, no una nueva corrida manual en Chromium, Android físico, TalkBack o partidas aleatorias para evaluar balance. El hecho de que CI pase no demuestra que esta política sea óptima ni que el juego carezca de errores. Los checks de los commits de documentación posteriores deben comprobarse por separado.

## Registro de trabajo y siguiente tarea única

Tras la aprobación, se leyó el código y los tests existentes, se publicaron primero regresiones rojas, se corrigió únicamente la donación de herramientas de IA y se comprobaron los logs del CI remoto verde. `main` estaba en `d9068f4` al inicio, conservando blob HTML `4ebaedad13d63c7a6762c524a52c0dd9695687b1`; PR #14 quedó en borrador y base `refactor/arquitectura`; no se cerró el issue #5 ni se fusionó nada.

**Tarea siguiente única recomendada:** revisión crítica de solo lectura sobre C7 (con énfasis en prioridad de botín frente a herramientas, frontera fin de turno y no regresiones), antes de considerar su integración. No abrir #4/#6/#7, etapa D ni una nueva política estratégica mientras C7 no esté revisado.
