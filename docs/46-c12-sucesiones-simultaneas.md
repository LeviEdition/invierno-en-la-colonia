# 46 — C12: sucesiones simultáneas

**28/10/2026, Montevideo. Base43f7c11; rama fix/estabilizacion-v9-9.** H1 corregido; revisión independiente aprobada tras corregir R1/R2. CI f9429d1/40682067180 aprobado371/371 antes de C13; gate registrado al final.

## Referencia y autorización

Misión del creador: C12→C15 en orden, avanzar automáticamente con pruebas/documentación/revisión/CI aprobados. Correcciones técnicas localizadas autorizadas; cambios de reglas o refactor importante requieren detener la parte afectada. No main, fusión, cierres de issues ni D/E/F.

Checkout limpio; avance directo5f5514d→43f7c11 (solo18/25 del otro chat). PR14 abierto/draft a refactor/arquitectura; main remoto conserva d9068f4. Informe15 y tablero/registro/43/44/45 revisados; referencia npm358/358 y CI43f7c11/40678862713 success. H1 seguía vigente antes del parche.

## Corrección

`pendingLeaderSides` conserva una petición por dueño, sin duplicados. `pendingLeader/pendingLeaderSide` pasan a ser proyección de la petición que puede atender el controlador actual. Elegir un sucesor elimina solo su petición. La elección humana sigue siendo manual y por dueño; IA y único candidato conservan selección automática. No cambian influencia, víctimas, reclutamientos o costes.

Varios consumidores pueden esperar la resolución; todos se liberan al quedar vacía la cola, al finalizar o reiniciar. El preview C10 no toca la cola: sus operaciones continúan aisladas mediante env. Los fixtures que asignaban las banderas antiguas ahora solicitan explícitamente la sucesión, sin cambiar expectativas.

## TDD y revisión independiente

Primera batería:10casos, **8 fallidos/2 aprobados antes;10/10 después**. Cubre ambos órdenes de muerte, crisis real de45, solicitudes en momentos distintos, selección J1/J2 tras pase, repetición, único candidato, IA/reemplazo, mordedura resuelta mediante chooseBite, reinicio, moral y límite de rondas. `test-support/game-fixture.mjs` carga el motor real; DOM mínimo y mensajes/tiempos omitidos, no se atribuyen a estos tests geometría o foco real.

El revisor independiente confirmó **R1/P1**: liberar una espera de sucesión al reiniciar permitía que botTurn antigua consumiera una nota de la partida nueva. También **R2/P2**: una espera liberada por victoria podía continuar equipando después de ended. Se añadieron tres regresiones rojas (reinicio IA, terminal IA y colonia suspendida por muerte/reinicio). Se corrigió comprobando identidad de partida y terminal al reanudar; los finally antiguos tampoco limpian flags de partidas nuevas. El adaptador del test de política IA mantiene su aislamiento explícito de pause; las regresiones nuevas usan pause real.

El revisor volvió a ejecutar sus reproducciones originales (ninguna modifica ya estado nuevo/terminal), ambos finishTurn con reinicio/finally y la suite. **Sin defectos confirmados pendientes en C12**,371/371 aprobados. No se ocultó el hallazgo detrás del verde inicial.

## Evidencia final

- Suite completa371/371,0fallidas/canceladas/omitidas/TODO;13pruebas C12 permanentes.
- Chromium real:6casos (393×852 y1365×768; cada orden local de muerte y sucesión automática IA),0excepciones. Crisis real, aviso de fallecimiento, pase y botones de selección reales. [JSON](evidencias/c12-chromium.json), [script](../scripts/check-c12-browser.mjs).
- Se conservan los contratos C9/C10 y los asserts existentes. No Android físico/TalkBack ni prueba de balance.

**Checkpoint:** C12 técnicamente aprobado por revisión y pruebas locales/navegador. Crear commit/push y comprobar SHA/CI; solo entonces C13. Issues no se cierran; H1 deja de estar pendiente en código, pero la aceptación y el cierre oficial de C siguen perteneciendo al creador.

**Gate remoto confirmado:** commitf9429d1, [CI40682067180](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40682067180) completed/success,371/371 según logs. C13 habilitada automáticamente por el encargo.
