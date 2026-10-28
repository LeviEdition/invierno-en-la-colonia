# 53 — Cierre administrativo formal de la etapa C (C1–C16)

**Fecha:** 28/10/2026 (Montevideo). **Autorización explícita:** el creador respondió «Vamos con eso» a la propuesta de cerrar los nueve issues como corregidos en PR14 y **dar por aceptada técnicamente C1–C16 con reservas**, dejando la integración para una revisión separada.

## Decisión ejecutada

**Etapa C: CERRADA y ACEPTADA TÉCNICAMENTE EN SU ALCANCE DE ESTABILIZACIÓN**, con reservas explícitas. No significa que `main` contenga los arreglos, que V9.9 esté liberada, que se haya logrado fidelidad total a `Dead of Winter` o que se haya empezado D.

**Issues pendientes cerrados y verificados:** 9/9, todos con `state=closed`, `state_reason=completed`, fecha de cierre de GitHub y **comentario individual con evidencia**.

| Issue | Estado confirmado | Evidencia del cierre |
| --- | --- | --- |
| [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2) | closed/completed | [Comentario de aceptación](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2#issuecomment-6471154075) |
| [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3) | closed/completed | [Comentario de aceptación](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3#issuecomment-6471157538) |
| [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) | closed/completed | [Comentario de aceptación](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7#issuecomment-6471161367) |
| [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8) | closed/completed | [Comentario de aceptación](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8#issuecomment-6471172696) |
| [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9) | closed/completed | [Comentario de aceptación](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9#issuecomment-6471175813) |
| [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) | closed/completed | [Comentario de aceptación](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10#issuecomment-6471190270) |
| [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11) | closed/completed | [Comentario de aceptación](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11#issuecomment-6471204630) |
| [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12) | closed/completed | [Comentario de aceptación](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12#issuecomment-6471209501) |
| [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13) | closed/completed | [Comentario de aceptación](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13#issuecomment-6471212659) |

Se reconsultaron los nueve individualmente a GitHub, todos tienen un comentario nuevo y `closed_at`; la lista de issues abiertos del repositorio devolvió **cero issues** (excluyendo PRs). Los issues #4, #5 y #6 ya estaban cerrados por autorizaciones anteriores y no se alteraron ahora. El cierre se refiere a cada contrato original y está condicionado a la **integración futura del PR** para llegar a una rama distribuible.

**Intervención de código de este cierre:** ninguna. No se cambiaron reglas, HTML, tests ni CSS; no se reabrieron incidencias ni se crearon tareas automáticas. El PR [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) sigue **open/draft** hacia `refactor/arquitectura`; `main` mantiene `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb`, sin modificaciones.

## Evidencia técnica que habilita la aceptación

- Última suite ejecutable examinada antes del cierre: [CI 40701666201](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40701666201) `completed/success`, **408/408**, cero fallidas/omitidas/TODO. La operación de cierre modifica issues y documentos, no motor.
- [C14](48-c14-partidas-completas.md) y [C15](49-c15-auditoria-final.md): 40 configuraciones completas del motor (20 por modo), 5 partidas UI en Chromium, regresiones de liderazgo, decisiones, recursos, finales y terminales.
- [C16](50-c16-foco-dialogos.md): [Chromium CI 40695882583](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40695882583), 3 viewports, 78 pasos de teclado, 0 errores JS/overflow; [evidencia contrastada](evidencias/c16-chromium-verificado.json).
- Justificación de cada issue: [revisión administrativa 52](52-aceptacion-administrativa-etapa-c.md) y [auditoría de pendientes 45](45-auditoria-pendientes-estabilizacion.md). El CI final de documentación posterior debe comprobarse por el SHA concreto.

## Reservas que NO bloquean el cierre administrativo de C

1. **No certificado:** Android físico, TalkBack/otros lectores, otros navegadores y requisitos de accesibilidad extensos.
2. **No validado:** equilibrio y dificultad con sesiones de juego humano; el controlador automático solo ejercita sus escenarios.
3. **No demostrado:** equivalencia completa con el juego de mesa. Las elecciones de la matriz F, incluida F-14 (cinco candidatos → elegir tres → líder manual), permanecen fuera de C y sin implementación.
4. **Integración pendiente:** el PR está **divergido de la base** (comparación previa: ahead 145/behind 1, con commit documental `0933c70` en `refactor/arquitectura`). Antes de cualquier merge, recuperar la última situación y reconciliar documentación A6, revisar el diff y el CI de la composición. Esta tarea no se autoriza automáticamente con el cierre.
5. **No publicada:** versión estable integrable a usuarios. `main` original no cambia por cerrar issues.

## Siguiente tarea única

**D0 — evaluación de integración sin merge:** comprobar la relación de las ramas, el commit documental ausente, el alcance del diff de PR14, preservación de tests/CI y posibles riesgos de integración; preparar propuesta concreta para el creador. **No fusionar PR14 ni promover estable** sin aprobación independiente; tampoco iniciar modificaciones de reglas F, refactor arquitectónico D o Director de Juego E.

El orden de producto ratificado en [51](51-rumbo-fidelidad-e-identidad.md) continúa vigente: **primero versión fiel y estable como referencia; después identidad propia, fundamentalmente singleplayer y narrativa dirigida por Director de Juego**.

## Límites del acto

Se aceptó formalmente el **trabajo técnico de C1–C16**, no las futuras funcionalidades ni las divergencias con reglamento. Todo comentario de cierre aclara expresamente «corregido en rama, pendiente de integrar». El acto fue autorizado por conversación, realizado vía GitHub y después comprobado mediante relectura de los nueve issues y búsqueda de abiertos.
