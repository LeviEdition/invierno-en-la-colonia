# 47 — C13: integración profunda

**28/10/2026, Montevideo. Basef9429d1 con CI40682067180 success371/371.** Implementación y validación local/revisión aprobadas; CI del nuevo commit es gate de C14. No se cambian reglas ni estrategia.

## Matriz priorizada por riesgo

| Riesgo | Cadena y propiedad comprobada | Evidencia |
| --- | --- | --- |
| Alto | Reinicio durante esperas de encrucijada/mordedura; todas se liberan sin actuar sobre partida nueva | Dos tests de esperas múltiples, C12-R1 y recorrido Chromium |
| Alto | Terminal con decisiones pendientes; no acciones tardías ni efectos de IA después del final | Limpieza terminal y botTurn tras ended; tests |
| Alto | Encrucijada gana muestra y mata dos líderes; derrota por moral domina victoria; sucesiones se cancelan legítimamente | Dos escenarios morales2/3 con callbacks reales |
| Alto | Muerte del último humano por mordedura; descarte, reemplazo y líder únicos | Expose/biteNext/recruit reales; test |
| Alto | Resolución crea otra decisión: movimiento/exposición/muerte/sucesión/encrucijada | Test con paint real y UI Chromium393/1365 |
| Medio | Transferencia, atracción o muerte en cola impiden consumo de carta/comida/dado; confirmar propio diálogo sigue permitido | Tres escenarios nuevos, sin repetir las21regresionesC6 |
| Medio | Mejorar dado durante botín/encrucijada/sucesión no consume recursos | Tres escenarios nuevos |
| Medio | Confirmación repetida de botín/transferencia no duplica cartas ni gasta dos veces un dado | Tests encadenados y UI transferencia→ruido→botín |
| Medio | Receptor muerto invalida transferencia; cancelar libera; mordedura tiene prioridad sobre sucesión/cancelaciones | Tests y revalidación independiente |
| Medio | PreviewC10 no muta cola múltiple, avisos o esperas | Snapshot de estado y pendientes antes/después |

Los escenarios preparados son pruebas de integración del motor, no partidas completas naturales ni jugadores reales. El soporte DOM mínimo no certifica geometría o foco. Los recorridos de navegador usan botones/DOM reales y estados iniciales preparados.

## Fallos confirmados y correcciones técnicas

La primera batería de15escenarios falló9veces: comandos normales gastaban recursos durante transferencia/atracción/muerte en cola; mejorar dado eludía decisiones de botín/encrucijada/sucesión; reinicio perdía esperas múltiples de bite/cross; botTurn invocada tras terminal todavía aplicaba congelación. No se afirma que los casos de llamada interna fueran explotables por clic normal.

`decisionKind()` reutiliza la prioridad que ya tenía show. `playable()` representa comandos normales sin decisión; `canResolve(tipo)` permite solamente la resolución correspondiente. No cambia los costes, las consecuencias o elecciones de IA. La prioridad no es una regla nueva: el modal ya impedía físicamente las acciones competidoras. Las dos pruebas antiguas C9 ahora confirman el aviso de muerte mediante funciones reales antes de intentar actuar con sucesión del otro, sin alterar sus asserts.

Bite/cross usan listas de esperas, liberadas al resolver, reiniciar o cancelar por terminal. `cancelPendingDecisions()` liquida decisiones de una partida terminada sin gastar recursos. Se añadió otra regresión roja para la limpieza terminal. BotTurn rechaza una partida ya terminada.

## Revisión crítica independiente

El revisor encontró dos huecos que los387tests iniciales no mostraban:

1. **P2, UI:** movimiento que mata al líder y activa una encrucijada dejaba la siguiente decisión oculta después de elegir sucesor. Confirmado en Chromium; recuperable por menú, pero con Acciones/Terminar deshabilitados.
2. **P2, prioridad:** chooseLeader y cancelaciones podían alterar pendientes mientras una mordedura tenía prioridad (contratos por llamadas internas; no exploit visual afirmado).

Cinco regresiones rojas adicionales los reproducen. Paint ahora refleja la siguiente decisión pendiente cuando no hay pase/muerte/terminal; confirmar el último aviso vuelve a pintar. La sucesión rechaza mordedura pendiente y las cancelaciones validan su propio diálogo. No se sustituye el motor ni se crea una arquitectura de escenas.

**Revalidación independiente aprobada:** cadena Chrome393 abre encrucijada automáticamente y recupera acciones al resolver; cuatro intentos fuera de prioridad dejan estado intacto. Suite independiente392/392,0fallos/TODO; sin otros defectos confirmados en el alcance.

## Resultado y límites

-21pruebas nuevas permanentes; suite final **392/392**,0fallidas/canceladas/omitidas/TODO.
-63pruebas del componente integración/liderazgo aprobadas antes de las cinco últimas; la suite final incluye todas.
-**6recorridos Chromium**,393×852/1365×768,0errores: transferencia→búsqueda→ruido→botín→encrucijada→muerte→derrota; movimiento→muerte→sucesión→siguiente encrucijada visible; espera→reinicio. [JSON](evidencias/c13-chromium.json), [script](../scripts/check-c13-browser.mjs).
-No pruebas físicas/TalkBack ni balance. No se afirma cubrir toda combinación posible o que funciones internas privadas constituyan una frontera de seguridad para red.

**Checkpoint:** revisión/pruebas aprobadas; crear commit y verificar su CI antes de C14. En C14 se conserva create, azar, mazos, paint y reglas reales; el nuevo modo natural del fixture evita borrar la encrucijada inicial. La estrategia del controlador de pruebas será independiente del juego y explícita.
