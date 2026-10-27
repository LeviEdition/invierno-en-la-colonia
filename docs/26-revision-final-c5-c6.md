# 26 — Revisión final de C5/C6: hallazgos pendientes

**Fecha:** 27/10/2026. **Rama:** `fix/estabilizacion-v9-9`. **PR:** [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14), abierto y en borrador, base `refactor/arquitectura`. **Revisión:** `5b3a663..247f819`; el cambio ejecutable de C5/C6 está en `d4a6b3f` y los commits posteriores revisados solo cambian documentación.

**Resultado de la revisión original:** revisión realizada, con una regresión C6 que impide recomendar su integración y un caso residual C5. No se modificó el juego, no se fusionó, no se cerraron incidencias ni se inició #5. Esta revisión documentada no es una aprobación formal en GitHub.

## Seguimiento posterior — 27/10/2026

**R1 corregido y revisado en C6-R1:** [a5043fa](https://github.com/LeviEdition/invierno-en-la-colonia/commit/a5043fadbaa686ed9d5c4cdc8c43ab90806baa52), seis regresiones nuevas y validaciones en [informe 27](27-correccion-c6-r1.md). La descripción y resultados de esta revisión se conservan como históricos del rango `5b3a663..247f819`, no como fallo vigente de R1 después del arreglo. **R2 sigue pendiente**, propuesto como siguiente tarea sin iniciar. El estado operativo actual figura en [tablero 18](18-tablero-operativo.md).

## Alcance y método

Se revisaron la guardia `finishTurn()`, `DeathDirector`, `playable()`, `special()`, `chooseHeal()`, `chooseLoot()`, selección de modales, cancelación y sus pruebas. Dos revisiones independientes de solo lectura analizaron C5 y C6; se comprobaron los hallazgos por separado en Node y Chromium. No se auditó todo el PR ni se reabrieron C1–C4.

Se comparó el comportamiento actual con `5b3a663`. Los experimentos no editan el checkout: usan el HTML actual y el original leído con `git show`, y preparación de estado en memoria. Los scripts y logs temporales no son pruebas de regresión incorporadas a la suite. Las secuencias mínimas de abajo permiten reproducirlos sin depender de esos archivos temporales.

## R1 — P2: C6 bloquea botín si se inicia una curación durante otra decisión

**Tipo:** regresión introducida por C6. **Incidencia relacionada:** [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9). **Ubicación del código revisado:** `invierno_colonia_v9_9.html`, líneas 407 (`special`), 426 (`playable`), 821–822 (`chooseLoot`) y 1219 (prioridad de modales).

**Precondición:** partida iniciada, sin encrucijada pendiente, personaje médico/enfermero seleccionado; paciente herido/con congelación en su localidad; búsqueda con botín pendiente.

**Acción reproducible mediante llamadas internas**, después de iniciar una partida y despejar su diálogo de encrucijada:

```js
game.crossPending = false;
game.crossResolved = true;
hide();
selected = 0;
const group = controls.group();
group[0].loc = group[1].loc = 1;
group[1].wounds = group[1].frost = 1;
game.dice = [6];
game.botDice = [6];
game.decks[1] = [catalog.create('ration')];
search();
special();
chooseLoot(0);
```

Para probar J2, usar modo local y asignar `game.turn='ai'` antes de preparar el escenario; su primer personaje es la enfermera Ada. Para J1 y humano contra IA, `game.turn='human'`.

**Esperado:** una orden incompatible no debe convertir una elección resoluble en un bloqueo. Se puede impedir iniciar la curación durante el botín o permitir resolver la elección que ya estaba abierta, sin habilitar consumos ajenos a ella.

**Observado:** `special()` crea `pendingHeal` aunque existe `pendingLoot`; `show()` conserva el modal `lootChoice`. C6 hace `playable()=false`, así que `chooseLoot()` retorna sin resolver. El modal visible no ofrece paciente ni «Cancelar sin usar habilidad» y «Cerrar» tampoco libera la decisión. El bloqueo puede deshacerse mediante funciones internas, pero no mediante los controles visibles de ese modal.

**Comparación:** en `5b3a663`, la misma secuencia permite elegir botín (`pendingLoot=false`). En `247f819`, quedan `pendingLoot=true`, `pendingHeal=true`, `opened='lootChoice'`. No se afirma que el comportamiento anterior resolviera correctamente todos los diálogos: el cambio observado es la imposibilidad nueva de elegir botín.

**Evidencia y límite:** Node confirmó antes/después; Chromium real, viewport 1365×768, reprodujo ambas versiones en J1, J2 y humano contra IA (seis escenarios). Tras crear la combinación mediante llamadas internas se pulsó el botón real «Conservar», y en la versión actual también «Cerrar». No se demostró una secuencia iniciada exclusivamente con clics normales ni se afirma un bloqueo en toda partida.

**Recomendación:** tarea única siguiente **C6-R1**, primero una regresión de esta combinación, después un ajuste mínimo de permisos/inicio de curación y pruebas de resolución/cancelación. No introducir un gestor general de estados en este arreglo.

## R2 — P2: C5 no protege la muerte encolada antes de abrir el diálogo

**Tipo:** endurecimiento interno residual, preexistente; no es una regresión introducida por C5. [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) con diálogo visible está corregido, pero [la prioridad de validación](24-cierre-auditoria-y-prioridades.md) incluye diálogo y cola. **Ubicación revisada:** `record()` línea 709, `wait()` línea 723 y guardia `finishTurn()` línea 1176.

**Precondición → acción:** partida en marcha, J1, sin otras decisiones pendientes; ejecutar en la misma pila JavaScript:

```js
kill(game.humans[1], 'revisión de cola');
void finishTurn();
```

**Esperado para el endurecimiento:** la muerte ya encolada debe impedir avanzar hasta confirmar el aviso. **Observado:** `record()` encola el fallecimiento y programa una microtarea; hasta ejecutarla, `active=false` y `pending.length=1`. La guardia mira solo `active`: el turno pasa a `ai`. Después abre el aviso de muerte. En local aparece también la pantalla de pase; confirmar ambas libera los diálogos, pero no deshace el turno ya avanzado.

**Evidencia y límite:** reproducción en Node con `queueMicrotask` real y en Chromium, modos local e IA, capturando el estado antes de que ejecute la microtarea. No se demostró un salto mediante clics normales; entre eventos de usuario se vacían las microtareas. Este caso no invalida el bloqueo comprobado cuando el diálogo ya está visible.

**Recomendación posterior a C6-R1:** valorar cubrir también `deathDirector.pending.length` en la guardia, con regresión síncrona. No se implementa dentro de esta revisión.

## Validaciones y resultados

- **Pruebas existentes relevantes:** 65/65 aprobadas en `modales-estados-pendientes` y `modo-local-privacidad`; incluyen los 21 casos C6. No cubren la combinación botín/curación ni la ventana de microtarea de R2. Son resultados de recorridos cubiertos, no evidencia de ausencia de los hallazgos.
- **Suite completa:** [GitHub Actions sobre `247f819`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40554797945), `completed/success`. La entrega anterior tiene [logs de 275 declaradas, 272 aprobadas y 3 TODO](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552240429). La revisión no modificó ejecutables ni requirió repetir localmente la suite completa.
- **Experimentos Chromium de esta revisión:** seis comparaciones R1 (antes/actual en tres contextos) y dos reproducciones R2 (local/IA), sin errores JavaScript. Los experimentos confirmaron los defectos descritos; no se cuentan como ocho pruebas del juego aprobadas.
- **Protecciones originales:** las regresiones existentes y la lectura de código mantienen evidencia de bloqueo durante pase/diálogo de muerte activo y consumo/equipo/aportes durante una curación aislada, con recuperación tras confirmar/cancelar. No se afirma que cubran todas las combinaciones de decisiones.
- **Documentación:** se actualizan este informe, tablero 18, registro 25 y matriz 04; `git diff --check`. La documentación se entrega en la rama de estabilización; su ejecución CI se identifica por el SHA de ese nuevo commit y no se da por aprobada de antemano.
- **Protección de estable:** `main` continúa en `d9068f4`, blob HTML `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. No hubo cambio de reglas, código, pruebas, workflow, red, credenciales ni revisión formal de GitHub en este bloque.

**Siguiente tarea al cerrar la revisión original (histórico): C6-R1 — corregir el bloqueo botín/curación con regresión y ajuste mínimo.** No se inició en aquella revisión; el seguimiento de arriba registra su corrección posterior. R2 queda documentado por separado; #5 y las demás propuestas siguen sin iniciar. Android físico, TalkBack, balance y partidas naturales completas mantienen sus límites anteriores.
