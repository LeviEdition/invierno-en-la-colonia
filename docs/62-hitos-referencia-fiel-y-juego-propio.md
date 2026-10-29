# 62 — Ruta oficial: fidelidad mecánica aceptada → D1/D2 → referencia preservada → juego propio

**Decisión vigente del creador (28/10/2026; actualización posterior al diseño inicial del hito RF).** Este documento complementa la [dirección de producto (51)](51-rumbo-fidelidad-e-identidad.md), el [alcance de la matriz F (61)](61-alcance-matriz-f-juego-propio.md) y el [tablero operativo (18)](18-tablero-operativo.md).

## Decisión: la fidelidad mecánica de la referencia ya es suficiente para nuestro objetivo

**Aceptamos la V9.9 estabilizada como una adaptación MECÁNICAMENTE SUFICIENTEMENTE FIEL a la experiencia central de *Dead of Winter* para utilizarla como referencia.** No pretendemos una copia reglamentaria exhaustiva. El primer hito se completó al **integrar yvalidar D1/D2 en main** (PR15, merge6b8bfca; [informe71](71-integracion-main-y-cierre-d1-d2.md)). No se exige una nueva auditoría de fidelidad ni otro paquete de modificaciones mecánicas como puerta de entrada obligatoria al juego propio.

Esta aceptación **es una decisión de alcance del creador** sustentada en el trabajo ya realizado, **no una certificación de equivalencia exacta de todas las reglas**:

- La [comparación oficial documentada en el informe 49](49-c15-auditoria-final.md#comparación-con-dead-of-winter) examinó **14 áreas mecánicas** contra el reglamento del juego base, con páginas citadas y evidencia real del código.
- La estabilización C está integrada a `main` y se ha probado con partidas completas. Las **433/433 pruebas** posteriores de D1.1 demuestran regresión satisfactoria dentro de su cobertura, **no fidelidad idéntica**.
- **Diferencias conocidas y aceptadas para el alcance de la referencia**, registradas en el informe 49: iniciativa/primer jugador fijo, colonia con entradas agregadas, crisis y cooperativo simplificados, objetivos y momento de victoria adaptados, y contenido propio. No se programarán automáticamente para reproducir el juego de mesa.
- Quedan **reservas técnicas y de experiencia**: pruebas Android físico/TalkBack, navegadores alternativos, balance con jugadores humanos y equivalencia de contenido completo. Se documentan, pero no constituyen una nueva etapa RF obligatoria.
- Si surge un **defecto funcional grave confirmado**, se evalúa como incidencia puntual con autorización, incluso durante o después de D. No se convierte una diferencia de diseño aceptada en bug de forma retroactiva.

## Hito 1 — COMPLETADO: fidelidad aceptada yD1/D2 integradas

**Fidelidad aceptada ytrabajo de ingeniería integrado por autorización del creador.** Los siguientes fueron los criterios exigidos, cumplidos yvalidados según71:

1. **D1 — Modularización inicial:** mantener el catálogo separado, resolver mediante un PoC pequeño si conviene introducir `esbuild` y elegir un build reproducible. No replicar sustituciones textuales para cada sistema.
2. **D2 — Motor desacoplado:** separar progresivamente estado, reglas, validaciones, acciones, turnos, UI y automatismos. Ninguna capa central de supervivencia debe depender necesariamente del DOM ni de que exista siempre un grupo de IA.
3. **Preservación de comportamiento:** las extracciones D1/D2 NO alteran intencionalmente reglas de V9.9. Las diferencias del informe 49 se conservan mientras no haya una decisión específica y separada.
4. **Pruebas por cambios pequeños:** tests unitarios/integración, partidas completas, navegador, empaquetado y archivo offline si se conserva ese formato, con límites y resultados por SHA. No eliminar pruebas para facilitar el refactor.
5. **Evaluar escalabilidad de verdad:** comprobar interfaces entre motor, presentación y automatismos; poder construir después el singleplayer y Director de Juego sin reescribir todo. No basta con crear muchos archivos.
6. **Cierre del hito:** D1/D2 integradas solo después de auditoría, CI y autorización; ninguna integración automática a `main`.

**Criterio de terminado del hito 1:** referencia mecánica aceptada (YA DECIDIDO) **+ D1/D2 terminadas, probadas, aceptadas eintegradas** (COMPLETADO, PR15/6b8bfca). No pedir un proyecto RF nuevo antes de avanzar; la comparación del informe 49 sigue disponible para consultas concretas.

## Hito 2 — Preservación autorizada, en curso

Al cerrar D1/D2, decidir expresamente cómo congelar una referencia reproducible con SHA, código fuente, build, pruebas y diferencias mecánicas aceptadas, antes de alterar deliberadamente las reglas.

- Mantener las pruebas históricas para reconocer regresiones.
- Conservar documentación del funcionamiento, reservas técnicas y modo de distribución.
- Publicación autorizada el29/10/2026: tag anotado sobre62e4e851, release con HTML ymanifiesto. [Informe72](72-preservacion-referencia-modular.md). No crear rama del juego propio ni alterar referencias publicadas.

**Puerta:** referencia estable y modular, reproducible, con respaldo de pruebas y preservación autorizada por el creador. **No depende de una nueva auditoría RF.**

## Hito 3 — Desarrollar *Invierno en la Colonia* con identidad propia

**Planificación conceptual paralela:** [63 — Hoja de ruta del singleplayer](63-hoja-de-ruta-planificacion-singleplayer.md). Sus bloques SP registran diseño y decisiones pendientes mientras se terminan D1/D2; **no autorizan implementación** hasta preservar la referencia.

Desde esa referencia preservada y en línea separada de desarrollo:

- Revisar la **matriz F (F-01, F-14, etc.)**, que documenta qué conservar, modificar o descartar **en el juego propio**, nunca como correcciones obligatorias de V9.9.
- Evolucionar hacia una experiencia principalmente **singleplayer** donde la persona dirige a sus supervivientes y el **Director de Juego** genera amenazas, eventos, facciones y consecuencias persistentes sin asumir un segundo grupo de IA obligatorio.
- Validar un ciclo jugable y un arco narrativo de consecuencias diferidas pequeño antes de expandir campañas, visuales o cooperativo online.
- Introducir reglas nuevas en entregas pequeñas, con pruebas específicas del producto propio; no reescribir la evidencia histórica de la adaptación de referencia.

## Nomenclatura y orden operativo

- **Informe 49** = comparación de fidelidad **ya realizada**. No relanzarla como RF-001 por defecto.
- **Matriz F** (F-01, F-14...) = comparación y decisiones **para nuestra versión propia**.
- **Etapa F del plan histórico** = presentación, campañas/red/cooperativo posterior; no es la matriz F.
- **RF** fue una propuesta anterior de auditoría adicional. **Queda pospuesta y NO es requisito de la ruta vigente**. Solo se retoma por un hallazgo concreto o nueva decisión del creador.

**Ruta oficial:** `V9.9 estabilizada + fidelidad mecánica aceptada → cerrar D1 → cerrar D2 → preservar referencia modular → desarrollar juego propio (matriz F + singleplayer/Director) → expansión`.

**Próxima tarea vigente:** completar publicación y verificación de la referencia autorizada. Después, diseño SP-03 (ciclo de ronda) y SP-04 (balance de un solo grupo), sin implementación autorizada. Los seguimientos fechados inferiores conservan decisiones históricas superadas.

**Alcance de esta acta:** decisión de producto y documentación, no modificación de ejecutable ni certificación de equivalencia literal.

## Seguimiento técnico29/10/2026 — D1/D2 implementadas en rama de revisión

El creador amplió autorización a D1/D2. [Informe67](67-d1-d2-arquitectura.md):151be08/34a6274,462/462 yCI exacto aprobados,40comparaciones históricas iguales ycompuertas de navegador/offline. La implementación técnica está entregada; aceptación humana e integración del hito1 pendientes. Esta evidencia no autoriza crear la referencia oficial del hito2 ni comenzar singleplayer/narrativa. Se mantienen las reservas yseparación de producto anteriores.

## Cierre técnico focalizado29/10/2026

El creador decidió no ampliar arquitectura para singleplayer en esta etapa. Auditoría[68](68-cierre-integracion-d1-d2.md):3 defectos de frontera/ciclo corregidos,467/467 ycompuertas completasCI aprobadas sobre6277e62;40registros iguales a cada referencia, incluido main. Integración técnicamente recomendada conservando historia del oráculo;[PR69 preparado](69-pr-propuesto-d1-d2.md), **no abierto/fusionado**. Hito1 técnicamente listo para revisión; aceptación/apertura/merge pendientes. No se inició hito2 ni juego propio; reservas mantenibles se resolverán al implementar funcionalidades concretas.

## Reconciliación y apertura autorizada del PR15 —29/10/2026

El encargo posterior autorizó reconciliar la documentación SP-03 de833eae7 yabrir PR tras validar. [PR15 abierto](https://github.com/LeviEdition/invierno-en-la-colonia/pull/15), preapertura7d6a68a con467/467 yCI completo aprobado. Código yHTML del cierre auditado intactos; planificación conceptual no implementada. [Informe70](70-reconciliacion-documental-y-pr-d1-d2.md) distingue acuerdos ypropuestas. Hito1 espera revisión final/merge autorizado; hito2 yjuego propio no iniciados. No se fusionó ni cambió main.

## Cierre de integración29/10/2026

El creador aprobó el merge convencional del head7f3ac7c. PR15 integrado en6b8bfca, padres0b75d01/7f3ac7c,57872ee conservado.467/467,40+40 comparaciones yCI completo sobre main aprobados; acuerdos/propuestas SP-03 preservados en63. [Informe71](71-integracion-main-y-cierre-d1-d2.md). Hito1 cerrado. Hito2 es el siguiente paso, **todavía sin crear tags/releases ni ramas del juego propio**. El cierre documental posterior no añade mecánicas ni cambia el ejecutable.
