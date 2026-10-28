# 52 — Revisión de aceptación administrativa de la etapa C (C1–C16)

**28/10/2026, Montevideo.** Alcance autorizado por «Prosigamos» tras fijar el orden de trabajo y dejar la siguiente tarea operativa de C: **revisar nueve issues abiertos y preparar su aceptación**, sin interpretar la continuación como autorización para cerrarlos, fusionar el PR ni declarar `main` actualizada.

## Acta posterior al dictamen: aceptación y nueve cierres ejecutados

**Cambio de estado posterior, autorizado expresamente por el creador el 28/10/2026 («Vamos con eso»):** se ejecutó y verificó el **cierre `completed` de #2/#3/#7/#8/#9/#10/#11/#12/#13**, con comentario individual de pruebas y aclaración «resuelto en PR14, no integrado en main». **0 issues abiertos** al consultar GitHub. **Etapa C cerrada/aceptada técnicamente con reservas**, sin código, merge ni publicación. Los párrafos siguientes son la revisión **anterior** a esta autorización y conservan su valor histórico. Ver [acta 53](53-cierre-formal-etapa-c.md) para los vínculos a todos los comentarios individuales, estado y próximo paso D0 (análisis de integración sin merge).

## Dictamen ejecutivo

**Recomendación técnica:** los nueve issues abiertos (#2, #3, #7, #8, #9, #10, #11, #12, #13) **pueden proponerse para cierre administrativo** por el comportamiento original que describen; los parches y regresiones están en `fix/estabilizacion-v9-9`, no en `main`. Se recomienda **aceptar C1–C16 en su alcance de estabilización** con reservas verificadas, pero **C permanece formalmente abierta hasta decisión expresa del creador**. No equivale a certificar fidelidad completa al juego de mesa ni a aprobar promoción a versión pública.

**Comprobaciones actuales:** PR [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) abierto/draft, head al iniciar revisión `85146b855ce3fc62de83ff220c4e8ec9b417bb44`, base `refactor/arquitectura`, `main=d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb`. Último CI de esa instantánea [40700529935](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40700529935) `completed/success`, **408/408** declarado; ejecutable sin modificaciones desde C16. C14 y C15 comprobaron 40 configuraciones completas del motor y cinco recorridos UI, no pruebas humanas. [Chromium C16](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40695882583) cubrió tres viewports y 78 pasos de teclado.

## Nueve issues abiertos: decisión propuesta con trazabilidad

| Issue | Defecto original y contrato | Solución en rama / evidencia principal | Recomendación |
| --- | --- | --- | --- |
| [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2) | Encrucijadas rechazaban cartas de medicina, combustible y herramientas | C2, `crossHandIndex()` por tipo real y pruebas de cartas/consumo/J2; [informe45](45-auditoria-pendientes-estabilizacion.md) y suite | **Cerrar por corrección en la rama**, sujeto a aceptación |
| [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3) | J2 no podía aumentar su dado cuando J1 no tenía dados | C3, `boostDie()` usa `actionDice()`; 3 regresiones y botones Chromium del modo local documentados en45 | **Cerrar por corrección actual**. El futuro cambio F-10/F-12 al sistema de atributos no reabre este bug histórico automáticamente |
| [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) | IA comparaba texto de consecuencias en vez de estado/efectos | C10, evaluación mecánica de opciones y prioridades contextuales; [informe43](43-c10-encrucijadas-prioridades.md), 624 comparaciones y 16 recorridos navegador | **Cerrar por eliminar la dependencia de palabras**. No significa que la IA tenga personalidad, memoria o Director de Juego |
| [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8) | `finishTurn()` permitía saltar pase local | C5, guardia `passScreenActive`, pruebas de repetición y pase; [informe45](45-auditoria-pendientes-estabilizacion.md) | **Cerrar por guardia comprobada** |
| [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9) | `playItem()` consumía carta con curación pendiente | C6 y C6-R1, `playable()` y prioridad de elecciones, regresiones contra bloqueo de botín; [informe26](26-revision-final-c5-c6.md), informe45 | **Cerrar**, sin confundir prueba de un contrato interno con posibilidad de explotación por clic ordinario |
| [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) | `finishTurn()` avanzaba durante muerte en pantalla/cola | C5/C5-R2, guardia `deathDirector.active` y `pending.length`; C12/C13/C15 refuerzan secuencias; [informe45](45-auditoria-pendientes-estabilizacion.md) | **Cerrar por guardia comprobada** |
| [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11) | IA completaba objetivo con notas, pero se demoraba `verify()` hasta colonia | C1, `verify()` tras notas y salida inmediata, pruebas antes de hambre/moral; [informe45](45-auditoria-pendientes-estabilizacion.md) | **Cerrar por corrección**, respetando la prioridad actual de derrota simultánea |
| [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12) | Setup y pase dejaban salir foco detrás del diálogo | C4, aislamiento `inert`, Tab/Shift+Tab y restauración; C16 extiende a ayuda/muerte; [informe50](50-c16-foco-dialogos.md) y Chromium C16 | **Cerrar en su alcance**: no afirmar Android físico, TalkBack ni certificación WCAG |
| [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13) | Dados de 26×25 px difíciles de tocar | C11, dados de 44×44 px y 8px de separación, corrección R1 para pantallas bajas; [informe44](44-c11-dados-tactiles.md), seis viewports | **Cerrar en el alcance de geometría Chromium**, pendiente prueba ergonómica real en dispositivo |

**Criterio compartido:** issues creados contra el ejecutable original en `main`; el cierre, si el creador lo autoriza, debe decir explícitamente «resuelto en rama/PR14, pendiente de integrar/publicar». Nunca decir «corregido en producción» o «corregido en main» antes de una integración verificada. Las correcciones de C12/C13/C15/C16 incluyen H1 y A1 descubiertos posteriormente; no reabrir los issues anteriores por diferencias de alcance.

## Hallazgo de integración adicional, no un bug de juego

La comparación remota `refactor/arquitectura...fix/estabilizacion-v9-9` informa **divergencia: 145 commits por delante, 1 por detrás**. La rama base posee el commit `0933c703ea0af1ab39cc5506e29a42ef1240de91` (`docs: conservar un solo informe A6 canónico de prioridades`), que solo afecta `docs/24-cierre-auditoria-a6.md`. No se encontró evidencia de conflicto mecánico por ese commit, pero **no se debe fusionar automáticamente** sin decidir cómo reconciliar el documento y revisar de nuevo el diff/CI. El PR toca aproximadamente 94 archivos según la comparación: revisión de integración independiente antes de cualquier merge.

## Reservas explícitas

- **Cobertura física:** no se probó en Android real, lector de pantalla TalkBack, otros navegadores ni condiciones de rendimiento prolongadas. Chromium emulado valida los recorridos concretos, no conformidad universal.
- **Balance y juego humano:** 40 configuraciones reproducibles de controlador y cinco recorridos UI, no playtesting humano ni prueba de dificultad óptima.
- **Fidelidad:** V9.9 omite/adapta sistemas del juego original (por diseño) y tiene decisiones futuras F pendientes. El hito «muy parecido a Dead of Winter» es **posterior al cierre técnico de C** y requiere comparación/reglas y aceptación explícita de divergencias. No confundir éxito del motor con fidelidad completa.
- **Roadmap:** F-14 (5 candidatos aleatorios, seleccionar 3 y líder manual), alternancia de inicio, dados/atributos/comida y modo singleplayer/Director son decisiones de diseño separadas; no implementadas en C ni autorizadas por «Prosigamos» para cambios ejecutables.
- **Administración:** issues siguen abiertos, PR draft, `main` intacta; no se cierran issues ni se promueve software sin aprobación.

## Próxima acción única (recomendada)

**Solicitar la aceptación explícita del creador para cerrar administrativamente los nueve issues como «resueltos en PR14, pendientes de integración» y marcar C1–C16 aceptada técnicamente con reservas**. Tras esa decisión, publicar comentarios de cierre individualizados con vínculo a pruebas y documentación, actualizar tablero/registro, comprobar estado y CI. Luego preparar, **por separado**, el plan de reconciliación de la rama base y el hito de versión fiel/estable; no iniciar D ni implementación narrativa automáticamente.

**Archivos alterados en esta revisión:** este informe52, tablero18, registro25 y nota de matriz04 si procede. Ningún cambio al HTML, tests, PR, issues, `main` ni al motor. La CI de documentación del commit final se consulta por SHA; el resultado del CI previo no se imputa a un commit posterior.
