# 18 — Tablero operativo y control de etapas (fuente única del próximo paso)

**Última revisión:** 27/10/2026. **Proyecto:** Invierno en la Colonia. **Rama de auditoría:** `refactor/arquitectura`.
**Documento operativo**: a diferencia de los documentos conceptuales, este archivo determina qué hacemos **ahora**, qué queda estacionado y qué evidencia habilita cambiar de fase.

> **NORMA DE TRABAJO:** una etapa activa, una tarea activa. No empezar una fase posterior porque surgió una idea interesante; anotar la idea y retomar lo previsto. Cambiar prioridades exige una decisión explícita registrada aquí.

## 1. Estado comprobado y alcance

- **Estable:** `main`, `invierno_colonia_v9_9.html`, SHA Git blob `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. El archivo es idéntico en `main` y `refactor/arquitectura` al revisar.
- **Auditoría:** PR [#1](https://github.com/LeviEdition/invierno-en-la-colonia/pull/1) abierto y en borrador; no fusionar por ahora.
- **Pruebas:** 174 ejecutables aprobadas, 0 fallidas y 3 `test.todo`, mediante GitHub Actions (última ejecución verificada antes de este documento). Las pruebas automatizadas usan mayormente DOM simulado; **no sustituyen pruebas reales de interfaz**.
- **Problemas registrados:** [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2), [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3), [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4), [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5), [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6), [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7). El #4 requiere resolver una ambigüedad de reglas, no presumir que es un bug.
- **Narrativa:** visión, objetivos, campañas y bocetos registrados en `docs/12`–`docs/17`. Son **propuestas y decisiones de diseño**, no código ni campañas implementadas.

## 2. Etapa activa: A — Completar auditoría funcional de V9.9

**Objetivo:** saber qué hace realmente el juego, qué falla y qué no se ha probado, antes de intervenir sus reglas o extraer módulos.

### Orden operativo dentro de A

| Orden | Bloque | Resultado necesario | Situación |
| --- | --- | --- | --- |
| A1 | Caracterización automatizada de reglas y encrucijadas | Pruebas reproducibles del motor y matriz documentada | **Avanzado, no exhaustivo** |
| **A2** | **Modo de dos jugadores en el mismo dispositivo** | Dados/manos separados, pase de turno, interacciones y bloqueo de datos privados, casos pendientes | **ACTIVO — siguiente tarea** |
| A3 | Interfaz, modales y secuencias de acciones | Pruebas de decisiones, cierre/apertura de diálogos, sucesión, mordeduras, esperas de IA y pantallas de pase | Pendiente |
| A4 | Integración de partidas completas | Reproducir al menos una victoria y una derrota, modos local e IA, con finales y casos excepcionales | Pendiente |
| A5 | Verificación en navegador real y móvil | Lista manual/evidencia de escritorio y Android, táctil, desplazamiento horizontal, accesibilidad y rendimiento básico | Pendiente |
| A6 | Cierre de cobertura | Matriz de 21 subsistemas actualizada con evidencia y límites explícitos; lista priorizada de defectos sin resolver | Pendiente |

**Importante:** A2 y A3 pueden compartir escenarios; no marcar una interacción visual como validada solo por probar funciones con DOM simulado.

### Tarea concreta A2-01 — Privacidad y aislamiento de J1/J2

**Alcance**: revisar `TurnController`, `showPass()`, `confirmPass()`, `paint()`, inventarios, dados y modales en modo local.

**Casos mínimos**:
1. J1 termina y aparece pantalla de pase antes de mostrar datos privados de J2.
2. J2 comienza con su mano, dados y personaje seleccionados; no puede usar la reserva de J1.
3. Con la pantalla de pase visible, las acciones privadas no son ejecutables.
4. Estado pendiente (encrucijada, curación, búsqueda, transferencia y elección de líder) no revela datos al jugador equivocado ni permite saltarse decisiones indebidamente.
5. J2 termina, se procesa una sola fase de colonia y se restablece el pase a J1.
6. Si la prueba es con DOM simulado, registrar qué falta verificar visualmente en navegador.

**Entregables**: archivo(s) de tests de caracterización, documento de hallazgos, incidencias si existen, actualización de la matriz y ejecución de `npm test`.

**Criterio de terminado para A2-01**: todos los casos reproducibles están probados o identificados como *solo manuales*; los defectos tienen reproducción, impacto y seguimiento; CI pasa; la V9.9 original conserva el SHA.

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
- Actualizar esta tarea, la matriz y la documentación pertinente; incluir enlaces a commit/prueba/incidencia.
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

Si surge una idea mientras estamos auditando:

> «Tiene sentido discutirla, pero estamos en **A2-01**. La registro en el estacionamiento y seguimos con la auditoría. ¿Querés cambiar explícitamente la prioridad?»

Solo cambiar la etapa activa con una decisión consciente; registrar motivo, riesgos, estado de la tarea interrumpida y cómo retomarla. No es necesario prohibir las conversaciones creativas: **conversar no equivale a cambiar la etapa ni a comenzar a programar**.

## 7. Ubicación de la información

- **Qué hacemos ahora:** este archivo `docs/18-tablero-operativo.md`.
- **Qué subsistemas faltan auditar:** `docs/04-matriz-auditoria-funcional.md`.
- **Por qué y cómo refactorizaremos después:** `docs/01-plan-refactorizacion.md`.
- **Norma de evaluación objetiva:** `docs/15-protocolo-revision-critica.md`.
- **Propuestas narrativas (estacionadas):** `docs/12`–`docs/17`.
- **Defectos/decisiones por resolver:** GitHub Issues.

**Próxima acción única: A2-01, privacidad y aislamiento del modo local J1/J2.**
