# 18 — Tablero operativo y control de etapas (fuente única del próximo paso)

**Última revisión:** 27/10/2026. **Proyecto:** Invierno en la Colonia. **Rama activa de ajustes:** `fix/estabilizacion-v9-9` (base de auditoría `refactor/arquitectura`).
**Documento operativo**: a diferencia de los documentos conceptuales, este archivo determina qué hacemos **ahora**, qué queda estacionado y qué evidencia habilita cambiar de fase.

> **NORMA DE TRABAJO:** una etapa activa, una tarea activa. No empezar una fase posterior porque surgió una idea interesante; anotar la idea y retomar lo previsto. Cambiar prioridades exige una decisión explícita registrada aquí.

> **REGISTRO OBLIGATORIO (acuerdo del usuario, 27/10/2026):** al terminar cada revisión, actualizar este tablero. Documentar acciones, decisiones, cambios, resultados, evidencia y límites en el registro pertinente, aunque no se haya modificado código. Véase [protocolo](15-protocolo-revision-critica.md#registro-obligatorio-de-cada-revisión-y-trabajo).

## 1. Estado comprobado y alcance

- **Estable:** `main`, `invierno_colonia_v9_9.html`, SHA Git blob `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. El archivo es idéntico en `main` y `refactor/arquitectura` al revisar.
- **Auditoría:** PR [#1](https://github.com/LeviEdition/invierno-en-la-colonia/pull/1) abierto y en borrador; no fusionar por ahora.
- **Pruebas en rama de estabilización:** C5/C6, **272 aprobadas, 0 fallidas/canceladas/omitidas y 3 `test.todo`** (275 declaradas), confirmadas en los logs de [GitHub Actions para `64dcc2c`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552240429). Las verificaciones dirigidas de Chromium están documentadas en C4–C6; Android físico/TalkBack siguen pendientes.
- **Problemas registrados:** [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2), [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3), [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4), [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5), [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6), [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) y [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8), [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9), [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) y [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11), [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12) y [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13). El #4 requiere resolver una ambigüedad de reglas, no presumir que es un bug.
- **Narrativa:** visión, objetivos, campañas y bocetos registrados en `docs/12`–`docs/17`. Son **propuestas y decisiones de diseño**, no código ni campañas implementadas.

## Entrega C5/C6 para revisión

Código y pruebas subidos en [d4a6b3f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/d4a6b3f45dc5c2563420980acf436a15e694775a); documentación de entrega en [64dcc2c](https://github.com/LeviEdition/invierno-en-la-colonia/commit/64dcc2c90714a5eab6c8dd1e1b4bd3d10d814dd3). Al revisar, la rama y el [PR #14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14) apuntan a `64dcc2c`; está abierto, en borrador y con base `refactor/arquitectura`, sin revisiones formales registradas. `main` sigue en `d9068f4` y conserva el blob estable `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. Sin fusión, cierre de issues ni publicación de versión.

**CI remoto confirmado:** [código `d4a6b3f`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552155171) y [entrega `64dcc2c`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552240429), ambos `completed/success`. Los logs de la entrega confirman 275 declaradas, 272 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO. La revisión final de C5/C6 se registra abajo con hallazgos; CI verde no equivale a aprobación.

### Revisión documental y resolución de acceso — 27/10/2026

Se comprobaron rama/PR/`main`, metadatos de CI y conteos en sus logs, y se corrigieron las referencias actuales que aún decían «CI sin confirmar». El rechazo previo provenía del proxy (`Tunnel connection failed: 403 Forbidden`): faltaba permitir `api.github.com`. Se guardó ese dominio en el borrador de configuración; el usuario aplicó el cambio y las consultas de API ahora funcionan. No hizo falta solicitar un token ni modificar el juego.

Por instrucción del usuario se incorporó la obligación de actualizar el tablero tras **cada revisión** y documentar todo trabajo significativo en [protocolo 15](15-protocolo-revision-critica.md#registro-obligatorio-de-cada-revisión-y-trabajo), este tablero, [registro 25](25-registro-estabilizacion.md#revisión-documental-y-resolución-de-acceso--27102026) y matriz 04. Una revisión paralela de documentación detectó las referencias obsoletas; no se delegaron cambios de código. Esta actualización solo modifica esos cuatro documentos: se comprueba `git diff --check`, sin repetir pruebas locales de código que no cambió. Los nuevos commits documentales se comprobarán en Actions por su SHA, sin atribuirles por anticipado el resultado de `64dcc2c`.

**Resultado y límites de aquella revisión documental:** acceso y CI de la entrega confirmados; documentación sincronizada. No se realizó entonces una nueva prueba de navegador o dispositivo físico ni una revisión final de código; la revisión de código posterior figura abajo. #5 sigue siendo una propuesta de trabajo posterior que requiere acordar la prioridad de la IA; no está iniciada ni autorizada su implementación.

## 2. Etapa activa C — estabilización; revisión C5/C6 con hallazgos

**Objetivo:** saber qué hace realmente el juego, qué falla y qué no se ha probado, antes de intervenir sus reglas o extraer módulos.

### Orden operativo dentro de A

| Orden | Bloque | Resultado necesario | Situación |
| --- | --- | --- | --- |
| A1 | Caracterización automatizada de reglas y encrucijadas | Pruebas reproducibles del motor y matriz documentada | **Avanzado, no exhaustivo** |
| A2 | Modo de dos jugadores en el mismo dispositivo | Dados/manos separados, pase de turno, interacciones y bloqueo de datos privados, casos pendientes | **Cerrado como caracterización automatizada (20 pruebas); visual pendiente A5** |
| A3 | Interfaz, modales y secuencias de acciones | Pruebas de decisiones, cierre/apertura de diálogos, sucesión, mordeduras, esperas de IA y pantallas de pase | **21 pruebas automatizadas cerradas; interfaz real pendiente A5** |
| A4 | Integración de partidas completas | Reproducir al menos una victoria y una derrota, modos local e IA, con finales y casos excepcionales | **23 pruebas automatizadas cerradas, incluidas partidas dirigidas de 10 rondas; naturalidad/balance pendientes** |
| A5 | Verificación en navegador real y móvil | Lista manual/evidencia de escritorio y Android, táctil, desplazamiento horizontal, accesibilidad y rendimiento básico | **A5-01 completado; A5-02 físico diferido y documentado (no aprobado)** |
| **A6** | **Cierre de cobertura** | Matriz de 21 subsistemas actualizada con evidencia y límites explícitos; lista priorizada de defectos sin resolver | **Documentado con reservas en [24](24-cierre-auditoria-y-prioridades.md). Usuario autoriza pasar a ajustes.** |

**Importante:** A2 y A3 pueden compartir escenarios; no marcar una interacción visual como validada solo por probar funciones con DOM simulado.

### A2-01 — Completada como caracterización automatizada

**Resultado:** 20 pruebas nuevas; privacidad de manos y dados, pase de turno y estados pendientes caracterizados. **194 pruebas aprobadas, 0 fallidas y 3 TODO**. Defectos: [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3) previo y [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8) nuevo. No corregimos reglas. **La validación visual real, foco, pantalla táctil y uso del celular siguen pendientes de A5**.

**Evidencia:** [docs/19-auditoria-modo-local.md](19-auditoria-modo-local.md) y [suite CI](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40524535143).

### A3-01 — Cerrada como caracterización automatizada

**Resultado:** [informe](20-auditoria-modales-a3.md), 21 tests, defectos de contrato [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9) y [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10). Pruebas visuales pendientes.

### A4 — Cerrada como integración automatizada dirigida

**Resultado:** [informe](21-auditoria-integracion-a4.md), 23 tests, recorridos de victoria/derrota, dos partidas dirigidas de 10 rondas, defecto de victoria de IA [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11).

**Advertencia:** no se comprobó el balance de campañas bajo azar y recursos naturales; no se evaluó la interfaz real. **A4 automatizado completo no significa auditoría A completa.**

### A5-01 — Verificación en Chromium y emulación táctil ejecutada

**Evidencia:** [informe A5-01](22-auditoria-navegador-a5.md), 40 comprobaciones principales en cuatro viewports (1365×768, 393×852, 320×640 y 852×393) y 12 comprobaciones especiales en tres viewports. Menú, búsqueda, botín, encrucijadas, muerte, pase e inventario J2 funcionan en el navegador; sin errores JS ni desbordamiento horizontal de página en esos tamaños.

**Defectos nuevos confirmados:** [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12), foco de teclado sale de setup/pase; [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13), dados flotantes de 26×25 px para uso táctil. No se corrigieron. **Las pruebas de móvil fueron emuladas: no Android real.**

### A5-02 — Verificación física diferida; no ejecutada

**Alcance:** ejecutar [guía manual](23-guia-prueba-android-a5.md) en al menos un teléfono Android. Validar apertura, scroll vertical, acciones, dados, modales, mano del segundo jugador, pase privado, orientación y respuesta táctil. Registrar observado/esperado, modelo, navegador y capturas de fallos si se producen.

**Estado:** sin checklist de Android físico. El usuario indica que ha jugado repetidas veces con buen funcionamiento y autoriza avanzar. Se conserva como **riesgo pendiente**; no se afirma dispositivo, navegador ni pasos verificables. [Guía futura](23-guia-prueba-android-a5.md).

### A6 — Lista de prioridades documentada; B1 y C1 habilitadas

**Informe de cierre y priorización:** [24 — Cierre de auditoría V9.9](24-cierre-auditoria-y-prioridades.md). 238 pruebas ejecutables verdes, 3 TODO y 12 incidencias registradas (#2–#13), incluida una regla genuinamente ambigua (#4). A5-02 queda pendiente y no bloquea una **rama aislada** de correcciones por autorización expresa del creador.

**B1 (clasificación):** defectos de expectativa inequívoca #11, #2 y #3 pueden corregirse sin crear reglas nuevas. #4 y #6 precisan acordar comportamiento. El resto conserva clasificación y orden sugerido en el documento 24.

### Estabilización C1–C3 — completada en rama aislada y PR en borrador

En `fix/estabilizacion-v9-9` fueron corregidos **[#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11)** (victoria IA al alcanzar muestras), **[#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2)** (cartas de recursos y consumo de encrucijadas) y **[#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3)** (dados J2). Cada cambio incluyó regresiones y la [suite CI](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40537729389) finalizó con **245 aprobadas, 0 fallidas y 3 TODO** (**248 declaradas**).

**Evidencia:** [registro C1–C4](25-registro-estabilizacion.md) y [PR #14 en borrador](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14). **No fusionar ni sustituir `main` sin revisión**. Los defectos #4, #6 y #7 requieren decisiones y no se alteraron.

### C4 — Foco de diálogos (#12): implementado y verificado

Se enfoca el diálogo de inicio/pase, se confina Tab/Shift+Tab, se hace inerte el tablero durante el pase y se devuelve el foco al contenido al cerrar. **Cinco regresiones nuevas**, suite 250/0/3 TODO; Chromium verificó Tab, Shift+Tab y Enter en 1365×768, 393×852 y 320×640. [Registro](25-registro-estabilizacion.md). No se afirma validación con TalkBack o Android físico.

### C5 — Guardias de transición de turno (#8 y #10): revisada, caso residual pendiente

**Estado confirmado al comenzar:** rama y referencia Git del PR #14 en `5b3a663`, C4 cerrada; `main` en `d9068f4`. La consulta del PR mediante API devolvió `Forbidden`: no se confirmó en vivo su estado ni sus checks.

**Precondición → acción → esperado → evidencia:** pase (incluido inicio) o aviso de fallecimiento activo → llamar `finishTurn()` o el atajo del menú → no cambiar partida, ronda, selección ni diálogo → tres regresiones locales fallaron antes del arreglo. Se reemplazaron las dos caracterizaciones del defecto por expectativas correctas y se añadieron inicio y fallecimiento en IA (cuatro casos C5). Tras confirmar, una nueva orden sí avanza; no se difiere una orden bloqueada.

**Corrección mínima:** añadir `passScreenActive` y `deathDirector.active` a la guardia inicial de `finishTurn()`, sin cambiar reglas ni el gestor de foco. **Validación local:** 45/45 pruebas en los dos archivos afectados; `npm test`: **252 aprobadas, 0 fallidas y 3 TODO** (255 declaradas). Chromium sobre la rama real verificó bloqueo durante fallecimiento en local/IA, Continuar y avance posterior; en local también llamadas repetidas durante pase, confirmación y llegada a ronda 2. Sin errores JS. Escenarios dirigidos, no partida completa ni Android físico.

Cambios entregados en el PR #14 para revisión, sin fusionar ni modificar `main`. CI remoto de C5/C6 confirmado en la entrega registrada arriba; los resultados de implementación anteriores son históricos. Detalles en [registro C5](25-registro-estabilizacion.md#c5--8-y-10-guardias-de-fin-de-turno).

### C6 — Acciones durante curación pendiente (#9): revisada, regresión pendiente

**Autorización:** el usuario indica «continuemos» después de confirmar C6 como siguiente tarea. Se conservaron los cambios locales de C5; `main` y los remotos no se modificaron.

**Precondición → acción → esperado → observado:** selección de paciente activa → consumir/equipar/aportar desde mano o equipo/iniciar transferencia mediante llamadas internas → conservar estado hasta curar o cancelar → 15 regresiones fallaron antes del arreglo, cinco por cada contexto (J1, J2, humano contra IA).

**Solución mínima:** `playable()` exige también ausencia de `pendingHeal`. `chooseHeal()` conserva la comprobación de `controls.interactive` para poder resolver la elección sin habilitar las acciones normales. Elegir paciente y cancelar mantienen sus reglas y liberan el bloqueo.

**Evidencia:** 21 casos C6 (15 de bloqueo y 6 de recuperación) reemplazan una caracterización del fallo. Suite completa `npm test`: **272 aprobadas, 0 fallidas, 0 canceladas, 0 omitidas y 3 TODO previos** (275 declaradas). Archivo de modales: 42/42 aprobadas. Chromium sobre el HTML real comprobó seis recorridos dirigidos: curar/cancelar en J1, J2 y humano contra IA, rechazo de consumo durante la elección y consumo habilitado después; sin errores JS. No valida partida completa, Android físico ni TalkBack.

Tablero, registro y matriz actualizados. Al terminar la implementación, los cambios aún estaban sin commit ni subida; la entrega posterior se registra arriba. CI remoto C6 confirmado en la entrega registrada arriba. No se cierra automáticamente #9 ni se fusiona. [Registro](25-registro-estabilizacion.md#c6--9-acciones-durante-curación-pendiente).

### Revisión final C5/C6 — realizada con hallazgos, 27/10/2026

**Alcance:** `5b3a663..247f819`, dos revisiones independientes de solo lectura y comprobación de reproducciones en Node/Chromium. [Informe 26 con precondiciones, acciones, esperado/observado y límites](26-revision-final-c5-c6.md).

- **R1, regresión C6/P2:** llamada interna `search(); special(); chooseLoot(0)` crea botín y curación simultáneos; el nuevo `playable()` impide resolver el botín y el modal no ofrece curar/cancelar. Comparado antes/después y reproducido en J1, J2 y humano contra IA. Impide recomendar integrar C6 sin corrección.
- **R2, residual C5/P2:** `kill(Leo); finishTurn()` en la misma pila avanza antes de la microtarea que abre la muerte. Preexistente; el bloqueo con diálogo ya visible sí funciona. No se afirma una explotación mediante clic normal.

**Resultados:** 65/65 pruebas relevantes aprobadas; CI de `247f819` [aprobado](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40554797945). Los ocho experimentos de Chromium confirmaron los casos, sin errores JS; no cuentan como ocho pruebas funcionales aprobadas. Las pruebas existentes no cubren estas combinaciones. No hubo modificaciones de código ni nuevas regresiones incorporadas a la suite en esta revisión: se entrega diagnóstico, no una corrección. PR #14 sigue en borrador, sin aprobación formal ni fusión; `main` intacta.

### Siguiente tarea única — C6-R1: bloqueo botín/curación

Añadir regresión de decisiones superpuestas, aplicar un ajuste mínimo que preserve la resolución/cancelación y verificar modo local e IA. No iniciada en este bloque. R2 se conserva como residual posterior; no iniciar #5 ni otras correcciones.

## 3. Etapas posteriores: una por vez

| Etapa | Propósito | Criterio para habilitar la siguiente |
| --- | --- | --- |
| **A — Auditar** | Caracterizar reglas, interfaces, turnos e integración | Matriz de cobertura actualizada, lista de pruebas manuales ejecutadas y defectos identificados; límites explícitos |
| **B — Definir reglas y priorizar defectos** | Resolver ambigüedades y clasificar fallos por gravedad | Comportamiento esperado escrito para cada corrección prioritaria; decidir qué se corrige ahora y qué se pospone |
| **C — Corregir y estabilizar** | Corregir defectos aprobados en cambios aislados con regresiones | Pruebas automáticas verdes + pruebas de humo manuales + estado jugable estable comprobado |
| **D — Refactorizar sin alterar comportamiento** | Separar estado, reglas, comandos, turnos, IA y vista en módulos | Equivalencia de comportamiento y pruebas preservadas; ningún cambio inadvertido de mecánicas |
| **E — Prototipo narrativo persistente** | Implementar una historia conectada que condicione recursos/objetivo y recuerde decisiones | Dos rutas jugables con resultados diferentes, consecuencias diferidas, pruebas y estados alternativos cuando mueren personajes |
| **F — Campañas y presentación** | Expandir campañas, personajes, epílogos, arte 2D y después juego online | Criterios y pruebas propios por subetapa, acordados al iniciar |

**Compuerta:** no dar por terminada A solo por tener muchas pruebas. Hay que demostrar cobertura en navegador real. No empezar a programar E mientras A siga abierta, salvo autorización explícita para cambiar la ruta.

## 4. Protocolo obligatorio para cada bloque

**Antes de trabajar:**
- Decir: etapa activa, ID de tarea, alcance y *qué no se va a tocar*.
- Revisar los archivos originales pertinentes, supuestos y pruebas ya existentes. Confirmar primero lo básico antes de cambiar configuración.
- Definir condiciones reproducibles de éxito y fracaso.

**Durante:**
- Una tarea a la vez y cambios pequeños.
- Documentar hallazgos con **precondición → acción → esperado → observado → prueba**.
- Si aparece una pregunta de reglas no acordada, detener solo esa decisión y consultarla; no corregirla inventando criterios.
- Toda idea interesante fuera de la etapa va al **estacionamiento**. No derivar hacia su implementación.
- Distinguir fallo confirmado, restricción técnica, propuesta creativa e hipótesis.

**Para cerrar:**
- Ejecutar pruebas del bloque y suite `npm test` si se modificaron pruebas/código.
- Comprobar resultado de GitHub Actions y SHA de V9.9 cuando haya commits.
- Actualizar este tablero tras cada revisión, incluso sin cambios de código; registrar acciones, decisiones, cambios, resultados y límites en la documentación pertinente. Actualizar la matriz cuando corresponda e incluir enlaces a commit/prueba/incidencia.
- Explicar en lenguaje claro **qué se verificó, qué NO se verificó y cuál es la única siguiente tarea**.
- No iniciar esa tarea siguiente en el mismo bloque de trabajo sin confirmación del usuario.

## 5. Registro de decisiones, defectos e ideas

**Decisiones aprobadas:** normas que el usuario confirmó. Registrar en la documentación de diseño respectiva; si afectan el comportamiento, requieren aceptación explícita antes de programarlas.

**Defectos:** GitHub Issues, con evidencia y severidad, separados de cambios de diseño. Un fallo de seguridad/privacidad o pérdida de datos puede ameritar prioridad especial; hay que informarlo.

**Ideas estacionadas (no etapa activa):**
- Narrativa central con decisiones grises, público +16 y consecuencias reales.
- Campañas con objetivos fijos, duración variable, historias secundarias y epílogos distintos.
- «Encontrar la cura»: investigación, científicos, secta antagonista y muestras disponibles mediante la trama.
- Modo cooperativo online en celulares diferentes; escenas isométricas y presentación visual.
- Arco piloto «Los que quedaron afuera», solo borrador y no canon.

Los detalles están en `docs/12`–`docs/17`. **No abrir nuevos frentes para ampliarlos durante la auditoría.**

## 6. Regla para desviaciones y cambio de prioridad

Si surge una idea fuera de la tarea activa:

> «Es una idea para la hoja de ruta, pero ahora estamos en **C6-R1 (bloqueo botín/curación)**. La registro y seguimos con la estabilización. ¿Querés cambiar explícitamente la prioridad?»

Solo cambiar la etapa activa con una decisión consciente; registrar motivo, riesgos, estado de la tarea interrumpida y cómo retomarla. No es necesario prohibir las conversaciones creativas: **conversar no equivale a cambiar la etapa ni a comenzar a programar**.

## 7. Ubicación de la información

- **Qué hacemos ahora:** este archivo `docs/18-tablero-operativo.md`.
- **Qué subsistemas faltan auditar:** `docs/04-matriz-auditoria-funcional.md`.
- **Por qué y cómo refactorizaremos después:** `docs/01-plan-refactorizacion.md`.
- **Norma de evaluación objetiva:** `docs/15-protocolo-revision-critica.md`.
- **Propuestas narrativas (estacionadas):** `docs/12`–`docs/17`.
- **Defectos/decisiones por resolver:** GitHub Issues.

**Próxima acción única: C6-R1 — corregir el bloqueo botín/curación, con regresión y ajuste mínimo. Revisión final realizada con hallazgos documentados; corrección no iniciada. No iniciar #5 ni fusionar.**
