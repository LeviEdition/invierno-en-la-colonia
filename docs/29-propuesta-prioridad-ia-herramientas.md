# 29 — Propuesta de prioridad IA: herramientas y crisis (#5)

**Fecha:** 27/10/2026. **Rama:** `fix/estabilizacion-v9-9`. **Revisión de diseño:** código de `9041d95` (último cambio ejecutable `c19916f`), catálogo, `botTurn()`, `CrisisManager`, `resolveCrisis()`, flujo de fin de turno, prueba TODO y [issue #5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5).

**Estado: propuesta pendiente de decisión explícita del creador.** Se solicitó elegir entre aprobar la política completa, conservar siempre el equipo o ajustar la propuesta. No se recibió aprobación al registrar este estado; no se cambió código ni se inició la implementación. Esta revisión de diseño se documenta conforme al acuerdo del usuario de registrar cada revisión y actualizar el tablero.

## Hechos comprobados

- La IA equipa herramientas antes de su bloque actual de aportes; ese bloque solo revisa la mano y puede omitir el equipo. Es el comportamiento registrado en #5.
- Una carta válida aporta un punto, desde mano o equipo. El aporte consume la carta. La crisis requiere alcanzar todo el umbral: una aportación insuficiente no reduce su penalización.
- Palanca, linterna y herramientas de reparación dan beneficios durante las acciones. Donar equipo tiene un costo real para los próximos turnos.
- El humano ya terminó cuando actúa la IA; después del turno IA se procesa colonia. Aun así, la IA puede encontrar herramientas durante sus búsquedas: no se puede concluir que faltarán materiales definitivamente antes de esas acciones.
- El bloque actual de aportes ocurre antes de buscar y no vuelve a revisar herramientas al final del turno.
- Dos aportes adicionales permiten ganar una moral, pero la IA actual no busca ese bonus. No modificarlo es un límite propuesto para este arreglo.

Estos hechos no determinan por sí solos qué estrategia debe preferir la IA. No se afirma que #5 haya causado una derrota evitada por donar una sola herramienta si faltaban dos.

## Política recomendada, todavía no aprobada

Para **crisis que requieren herramientas**, la IA:

1. Utiliza sus herramientas en sus acciones normales.
2. Justo antes de colonia, si la partida sigue en marcha, cuenta lo ya aportado y las herramientas propias en mano y equipo de supervivientes vivos, incluidas las obtenidas al buscar.
3. Si con ellas puede completar la crisis, dona exactamente lo que falta: primero mano, después equipo, incluso la última herramienta equipada si es necesaria.
4. Si no puede completar la crisis, conserva todas las herramientas disponibles. Si ya se cumplió, conserva las restantes.
5. No dona cartas extra para buscar el bonus de moral.

No toma cartas o equipo del grupo humano. No cambia las reglas de aportes del jugador ni el comportamiento de comida, medicina, combustible, selección de botín o uso de herramientas. No añade puntuaciones estratégicas de valor de equipo. Si se aprueba, el desempate entre herramientas equivalentes debe ser estable y verificable; no se atribuye aquí una valoración óptima.

La implementación posterior debe evitar aportes parciales de herramientas en el bloque anterior; añadir solo una comprobación final no bastaría si antes ya consumió material sin alcanzar el objetivo. Esto es una consecuencia de la política propuesta, no un cambio aplicado.

## Casos para acordar y convertir después en pruebas

| Situación al terminar las acciones | Resultado propuesto |
| --- | --- |
| Crisis 1/2; una herramienta en mano | Donar esa carta y llegar a 2/2 |
| Crisis 0/2; una en mano y una equipada | Donar ambas, aunque se pierda el equipo |
| Crisis 0/2; solo una herramienta entre mano/equipo | Conservarla: no alcanza para salvar esta crisis |
| Crisis ya cumplida | No consumir más herramientas |
| Comenzó con una herramienta y encontró otra al buscar; crisis 0/2 | Recontar al final y aportar las dos |

**Validaciones propuestas, aún no ejecutadas:** consumo exacto y sin duplicaciones, prioridad mano/equipo, equipo de vivos y solo de la IA, conservación si no alcanza, ausencia de bonus, inclusión de cartas encontradas, no donación tras fin de partida y regresiones de equipamiento/crisis existentes. El diseño no reemplaza escribir pruebas de regresión antes de corregir.

## Costo, alternativas y límites

La propuesta evita perder materiales en una crisis que no se puede cumplir con lo disponible y aprovecha el equipo durante el turno. Puede sacrificar una herramienta muy útil para evitar una penalización pequeña: es una prioridad cooperativa sencilla, no una IA óptima ni una mejora de balance demostrada.

**Alternativa:** conservar siempre el equipo y donar solo desde la mano si alcanza. Protege beneficios futuros, pero acepta fallar algunas crisis que el equipo podría resolver. También puede acordarse otra política, con sus ejemplos explícitos, antes de programar.

La revisión independiente de solo lectura coincide en el umbral, el costo de aportes parciales y la utilidad de contar al final; ninguna recomendación de los revisores constituye una decisión del creador. No se ejecutaron nuevas pruebas del motor o navegador: solo se revisaron código, documentación e incidencia. El [CI de `9041d95`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40558263686) continúa aprobado; no valida esta propuesta no implementada.

## Segunda revisión crítica de continuidad — 27/10/2026

**Alcance:** nueva lectura en GitHub de `botTurn()`, `stashLoot()`, `ItemEngine`, `CrisisManager`, `resolveCrisis()`, controlador de turno, issue #5 y estado CI. Sin ejecutar el juego ni editar ejecutables/pruebas. Estado previo: HEAD `e7d0a48`, PR #14 abierto y en borrador, base `refactor/arquitectura`; `main` en `d9068f4`, blob V9.9 `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. Los tres refs se compararon con sus SHA conocidos y coincidieron.

**Hallazgo técnico adicional:** `stashLoot()` equipa de inmediato una herramienta encontrada por la IA si el personaje carece de otra del tipo. Por eso tampoco basta con contar las cartas de la mano después de buscar. `CrisisManager.add()` registra aportes válidos; debe comprobarse éxito de cada aporte **antes** de retirar la carta de mano/equipo. `fromEquipment()` sirve como referencia del contrato, pero una ruta específica de IA no debe usar inventario ajeno ni controles de interacción del humano.

**Evaluación estratégica:** la propuesta de completar cualquier crisis alcanzable es deliberadamente simple, **no óptima demostrada**. Donar la última palanca o linterna para evitar -1 moral puede perjudicar búsquedas futuras; una crisis que añade zombis puede justificar el sacrificio. Las herramientas equipadas tienen utilidades diferentes. Alternativa B: proteger siempre el equipo aunque se pierdan crisis superables. Alternativa C: priorizar por severidad de crisis y utilidad futura, con mayor superficie de reglas, pruebas y riesgo de balance.

**Recomendación a decidir por el creador:** política A del informe (usar durante las acciones; al final, si alcanza para completar, donar lo necesario desde mano y después equipo propio de vivos; en caso contrario conservar; sin bonus), añadiendo selección determinista/documentada entre equipos y sin atribuirle optimización. No introducir puntuación estratégica por carta ni umbrales de severidad durante estabilización C. **Es una recomendación, no aprobación.** La decisión sigue pendiente; no iniciar regresiones ni implementación todavía.

**CI comprobada para el commit anterior, no para esta política:** [run 40559396788](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40559396788), job `pruebas` completed/success; logs con checkout de `e7d0a48`, 288 pruebas declaradas, 285 aprobadas, 0 fallidas, 3 TODO (#4, #6, #5). No se corrió una suite nueva ni Chromium/Android en esta segunda revisión. La documentación de este bloque tiene commits posteriores a la verificación inicial; sus checks no deben asumirse aprobados sin consulta independiente.

**Límites:** revisión estática dirigida, no simulación de balance ni partida natural; no se ha demostrado que donar siempre el último equipo mejore la tasa de victoria. No se modifican código, reglas, pruebas, issues, PR ni `main`. Única tarea pendiente: recibir y registrar aprobación/ajuste/rechazo de esta política para #5.

## Registro y siguiente paso

Se actualizan este informe, tablero18 y registro25; no cambia la cobertura de matriz04. `git diff --check`; solo documentación. El PR14 sigue abierto en borrador, sin fusión ni cierre de #5. `main` conserva `d9068f4`. La documentación se entrega en la rama de estabilización y su CI se comprueba por el SHA del commit documental.

**Siguiente tarea única: resolver la decisión de diseño #5 con el creador y registrar su respuesta.** Si aprueba la política, el paso posterior será preparar su implementación y regresiones; no se inicia dentro de esta revisión. Las decisiones de #4 y #6 siguen pendientes.
