# Matriz de auditoría funcional — V9.9

**Propósito:** revisar exhaustivamente lo que YA existe en Invierno en la Colonia antes de extraer módulos del motor. No confundir funcionalidades previstas (2D isométrico, historias persistentes, modo online) con funcionalidades ya implementadas.

**Tablero de ejecución:** [18 — Tablero operativo](18-tablero-operativo.md). **Etapa histórica de esta matriz:** A, auditoría V9.9; **A6 cerrada con reservas en [informe 24](24-cierre-auditoria-y-prioridades.md):** Android físico no validado, pero el creador autoriza continuar a C1 de estabilización. Los 21 subsistemas quedaron clasificados; V9.9 estable intacta. Los documentos de narrativa son diseño futuro y no cambian esta prioridad.

**Fecha de inicio:** 27/10/2026 · **Rama:** `refactor/arquitectura` · **Base:** `invierno_colonia_v9_9.html`

## Cierre de cobertura A6 (con limitaciones documentadas)

Los **21 subsistemas** se mantienen clasificados: 01–19 con cobertura parcial (incluidos defectos abiertos en varios); **20–21 no implementados**, fuera del alcance de V9.9. En [el informe final](24-cierre-auditoria-y-prioridades.md) figuran las 12 incidencias (#2–#13), orden propuesto y excepciones. Se aceptó **continuar sin checklist físico A5-02** por autorización explícita del creador tras partidas satisfactorias, **sin declarar que la prueba móvil física ocurrió**. Al cerrar A6, la siguiente tarea era **C1/#11**, en rama separada. El estado actual de estabilización figura en las actualizaciones siguientes y en el tablero operativo.

## Actualización de estabilización C5

En `fix/estabilizacion-v9-9`, #8 y #10 tienen guardias de transición y regresiones correctivas en `tests/modo-local-privacidad.test.mjs` y `tests/modales-estados-pendientes.test.mjs`. El pase/inicio y el aviso de muerte bloquean `finishTurn()` sin mutar estado; después de confirmar, una nueva orden permite continuar. Suite local: **252 aprobadas, 0 fallidas, 3 TODO**. Chromium verificó bloqueo y continuación en local/IA, sin errores JS. [Evidencia y límites](25-registro-estabilizacion.md#c5--8-y-10-guardias-de-fin-de-turno).

Esto actualiza los defectos #8/#10 de los subsistemas 16/18 **en la rama de estabilización**, sin borrar los hallazgos históricos de auditoría que siguen abajo. `main` conserva la versión original. Entrega y CI C5/C6 confirmados abajo; revisión final posterior con hallazgos en informe 26. C6 se registra en la actualización siguiente.

## Actualización de estabilización C6

El defecto #9 (subsistema 18) queda corregido en la rama de estabilización: la curación pendiente bloquea las acciones normales mediante `playable()`, conservando elegir paciente/cancelar. **21 casos C6**, 15 de ellos fallidos antes del arreglo, cubren cinco entradas de inventario en J1, J2 y humano contra IA y la recuperación posterior. Suite local actual: **272 aprobadas, 0 fallidas y 3 TODO** (275 declaradas). Chromium verificó seis recorridos dirigidos sin errores JS. [Registro y límites](25-registro-estabilizacion.md#c6--9-acciones-durante-curación-pendiente). CI remoto aprobado para la entrega indicada abajo; `main` sin cambios. La revisión final posterior detectó la combinación bloqueada botín/curación; ver informe 26 y siguiente tarea C6-R1. Ningún defecto adicional implementado.

## Entrega de estabilización C5/C6

Código y regresiones en [d4a6b3f](https://github.com/LeviEdition/invierno-en-la-colonia/commit/d4a6b3f45dc5c2563420980acf436a15e694775a), documentación de entrega en [64dcc2c](https://github.com/LeviEdition/invierno-en-la-colonia/commit/64dcc2c90714a5eab6c8dd1e1b4bd3d10d814dd3); el PR #14 apunta a este último al revisar. `main` conserva el blob original. **CI remoto confirmado:** [ejecución sobre `64dcc2c`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40552240429), 275 declaradas, 272 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO. El bloqueo de red a la API se resolvió permitiendo `api.github.com`; diagnóstico y acciones en [registro 25](25-registro-estabilizacion.md#revisión-documental-y-resolución-de-acceso--27102026).

**Revisión documental, 27/10/2026:** se actualizaron las referencias obsoletas a CI sin confirmar; no se repitieron pruebas ni se amplió cobertura funcional. El usuario exige registrar cada revisión en tablero y documentación ([protocolo 15](15-protocolo-revision-critica.md#registro-obligatorio-de-cada-revisión-y-trabajo)). En aquel momento la revisión final de código C5/C6 estaba pendiente; su resultado posterior se registra abajo. No atribuir aprobación del PR a un resultado CI verde.

## Revisión final C5/C6 — 27/10/2026

[Informe 26](26-revision-final-c5-c6.md): **R1/P2 (regresión C6, subsistemas 07/18)**, botín y curación simultáneos impiden elegir botín; **R2/P2 (residual C5 preexistente, subsistemas 02/06/16)**, la cola de fallecimiento no bloquea fin de turno antes de abrir el aviso. Las protecciones de pase, muerte visible y curación aislada mantienen sus pruebas; no cubren estas combinaciones. 65/65 pruebas relevantes verdes; CI de `247f819` aprobado. Ocho experimentos Chromium confirmaron hallazgos, no una certificación de funcionamiento. Solo documentación modificada en la revisión; `main` intacta, PR en borrador sin aprobación de integración. Siguiente tarea única **C6-R1**, no iniciada aquí; R2 pendiente posterior. Android físico y TalkBack siguen sin validación formal.

## Corrección C6-R1 — 27/10/2026

R1 de la revisión anterior (subsistemas 07/18) corregido en [a5043fa](https://github.com/LeviEdition/invierno-en-la-colonia/commit/a5043fadbaa686ed9d5c4cdc8c43ab90806baa52): se rechaza iniciar curación mientras se elige botín. Seis regresiones antes fallidas pasan; las rutas de ruido, elección, curar/cancelar, aislamiento de manos y nueva búsqueda permanecen verificadas. Suite: **281 declaradas, 278 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO**; modales 48/48. Chromium verificó 12 recorridos en escritorio y ventana estrecha, sin errores JS. [Informe 27 y límites](27-correccion-c6-r1.md). Revisión independiente sin defectos en el ajuste.

**CI remoto confirmado:** [GitHub Actions sobre `a5043fa`](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40556617672), `completed/success`; logs: **281 declaradas, 278 aprobadas, 0 fallidas/canceladas/omitidas y 3 TODO**.

R2 de C5 (muerte en cola) sigue pendiente; es la siguiente tarea única propuesta, sin iniciar. No se certifican todas las combinaciones, Android físico ni TalkBack. `main` intacta y PR #14 sin fusionar. El resultado de revisión 26 anterior se conserva como evidencia histórica; C6-R1 lo actualiza para R1.

## Estados de auditoría

- **Parcialmente probado (P):** hay pruebas automatizadas, pero faltan escenarios importantes.
- **Pendiente (N):** aún no hay pruebas de comportamiento suficientes.
- **Problema confirmado (B):** fallo reproducido; se registra sin cambiar reglas.
- **No implementado (F):** objetivo futuro; fuera de la auditoría de la versión actual.

Ningún subsistema debería declararse **completo** solo por pasar una prueba unitaria. La validación final incluye reglas, integraciones entre turnos y pruebas manuales en navegador y celular.

## Inventario de funcionalidades

| Nº | Subsistema | Casos que revisaremos | Estado inicial |
| --- | --- | --- | --- |
| 01 | Inicio y objetivos | modos, selección de objetivos, valores iniciales, reparto de personajes, mazos y reinicio | **P**: seis pruebas de estado inicial |
| 02 | Turnos y rondas | orden humano/IA o J1/J2, reinicios, fases, conteo de rondas y fin | **P**: J1/J2 y ciclo humano→IA→colonia→ronda siguiente (sin encrucijadas ni DOM real) |
| 03 | Dados y comida para mejorarlos | umbrales, selección, consumo, agotamiento, mejora por cada jugador | **B**: jugador 2 local bloqueado al agotarse los dados de J1; [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3) |
| 04 | Movimiento | límites por turno, capacidad, inmovilidad, combustible, excepciones | **P**: cinco pruebas |
| 05 | Exposición | caras del dado, lesiones, congelación, protección por habilidad | **P**: cuatro pruebas |
| 06 | Mordeduras y muerte | orden de afectados, IA frente a humano, decisiones, moral, equipamiento y reemplazos | **P**: propagación, sacrificio, riesgo y daños |
| 07 | Búsqueda | requisitos de dado, mazos, elección, ruido, cartas devueltas y mazo agotado | **P**: 13 pruebas de búsqueda y comportamiento de cartas; integración visual pendiente |
| 08 | Catálogo y uso de objetos | comida, medicina, herramientas, armas, combustible, notas, efectos y residuos | **P**: catálogo, consumibles, manual, armas y herramientas principales; otros efectos e integraciones pendientes |
| 09 | Equipamiento e intercambios | equipar, límites, transferir, devolución/caída al morir, habilidades de equipo | **P**: límites, transferencias y equipo al morir; **definición pendiente [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4)** |
| 10 | Habilidades e influencia | habilidades de personajes, usos por ronda, líderes, sucesión e influencia | **P**: elección y sucesión de líderes J1/J2/IA, influencia, resistencia y ataque; inconsistencia local [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) |
| 11 | Barricadas y zombis | colocación, capacidad, llegada, desbordamiento, eliminación, atraer y limpiar | **P**: ataques, defensa, desbordamiento, indefensos, atraer y limpiar; combinaciones completas pendientes |
| 12 | Fase de colonia | consumo de comida, hambre acumulada, basura, crisis, zombis y ruido | **P**: alimentación, hambre, basura, crisis, oleadas y ruido; secuencia con IA probada sin narrativa |
| 13 | Crisis y contribuciones | selección de tipo, cartas válidas, premio de sobreaporte, penalizaciones | **P**: aportes desde mano/equipo, rechazo de categoría, sobreaporte, éxito/fallo de moral; penalizaciones restantes pendientes |
| 14 | Encrucijadas narrativas | activación, disponibilidad de opciones, gastos, efectos e IA | **P + B**: 26 pruebas de cartas, disparadores, actor, elecciones J1/J2/IA y efectos; errores [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2) y [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) |
| 15 | Inteligencia artificial | selección de acciones, objetos, búsqueda/combate, encrucijadas, bloqueos | **P**: 20 pruebas de equipamiento, decisiones, desplazamiento, combate y turno completo; narrativa y DOM pendientes; [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5) |
| 16 | Dos jugadores en mismo dispositivo | privacidad en pantalla de pase, manos, dados, selección, líder y cambio de turnos | **P + B**: [20 pruebas específicas A2-01](19-auditoria-modo-local.md) de manos/dados, pase y estados pendientes; **B**: dados [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3), liderazgo [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) y salto por llamada interna [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8); pantalla de pase visualmente cubierta en Chromium A5-01; foco de teclado no aislado [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12); Android físico pendiente |
| 17 | Victoria, derrota y situaciones límite | objetivos, moral cero, sin supervivientes, límite de rondas, estados pendientes | **P + B**: [A4: 23 pruebas](21-auditoria-integracion-a4.md), victorias/derrotas, rescates y partidas dirigidas de 10 rondas; fallo de fin de IA [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11), integración visual pendiente |
| 18 | Interfaz y accesibilidad | clics, modales, perfil, avisos, cartas, contraste, tamaño táctil y foco | **P + B**: [A3: 21 pruebas simuladas](20-auditoria-modales-a3.md); [A5-01: Chromium real](22-auditoria-navegador-a5.md) comprobó menús, búsqueda, encrucijadas y modales. Defectos de contrato [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9), [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) y foco de teclado [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12); lector de pantalla pendiente |
| 19 | Móvil y rendimiento | vista vertical, sin scroll horizontal, render y animaciones, dispositivos modestos | **P + B**: A5-01 emulación 393×852, 320×640 y 852×393 sin overflow horizontal ni errores JS; [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13) dados táctiles de 26×25 px. **Android físico, rendimiento y gestos reales: N** |
| 20 | Guardado, reconexión y multijugador por red | persistencia general, servidor autoritativo, WebSockets | **F**: objetivos futuros, no presentes en V9.9 |
| 21 | Narrativa persistente (prioridad creativa) y escenas 2D | historia principal, arcos conectados, memoria de decisiones, consecuencias, personajes, sprites y escenas | **F**: diseño narrativo inicial en documentos 12 y 13; **no implementado** todavía en V9.9 |

## Orden recomendado de trabajo

### Bloque 1 — Base y salud del motor (en curso)
- [x] Inicio de partida, modo local inicial y objetivos.
- [x] Movimiento, combustible y exposición básica.
- [x] Mordeduras y decisiones humanas; comportamiento automático de IA.
- [x] Reinicio de movimiento y habilidades por ronda; crisis simples.
- [x] Caracterización de turnos J1/J2 y humano/IA sin encrucijadas ni DOM real; sigue pendiente integración narrativa/visual.
- [x] Caracterización inicial de victorias, derrotas, reemplazos de emergencia y rescates (30 pruebas nuevas).

### Bloque 2 — Recursos, objetos y acciones
- [x] Caracterización inicial de búsqueda, ruido, mazos y elección de cartas (17 pruebas, junto con efectos básicos de objetos).
- [x] Caracterización parcial de objetos consumibles, armas, herramientas, transferencias y equipo al morir (22 pruebas nuevas).
- [ ] Completar dados, comida, ataque, barricadas, atraer zombis y limpieza (ataque y parte de barricadas ya probados).

### Bloque 3 — Fase de colonia e IA
- [x] Caracterización inicial de alimentación, hambre, basura, crisis y oleadas (28 pruebas nuevas); completar escenarios de integración.
- [x] Primera caracterización del turno IA: equipamiento, recursos, movimiento, acciones y vuelta a ronda siguiente (20 pruebas); narrativa todavía pendiente.
- [x] Parte de los casos límite: sin capacidad, sin cartas, sin dados, sin supervivientes y roster agotado; faltan interacciones narrativas/visuales.

### Bloque 4 — Narrativa y modos de juego
- [x] Primera auditoría de encrucijadas: 26 cartas, efectos, requisitos, J1/J2 e IA (26 pruebas; integración visual pendiente).
- [x] Caracterización inicial de líderes e influencia (J1, J2 e IA), con inconsistencia [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) pendiente de definir.
- [x] Caracterización automatizada de privacidad de manos y dados en modo local (A2-01: 20 pruebas); verificación visual real pendiente A5.

### Bloque 4B — Núcleo narrativo prioritario (diseño, NO implementación)
- [x] Establecer la narrativa y el impacto de decisiones como eje del juego.
- [x] Documentar sistema de historias conectadas, memoria y consecuencias diferidas.
- [x] Proponer un arco piloto de cuatro episodios para validar tono, agencia y efectos persistentes.
- [ ] Aprobar el arco piloto y diseñar el estado serializable antes de programarlo.
- [ ] Validar dos rutas jugables con diferencias narrativas observables y consecuencias al menos dos rondas después.

### Bloque 5 — Integración y experiencia de usuario
- [x] A4: 23 pruebas dirigidas de integración, incluidas victorias, derrotas y partidas de 10 rondas; no confundir con partida sin recursos manipulados.
- [ ] Una partida natural reproducible en navegador hasta victoria/derrota, sin alterar recursos ni mazos.
- [x] A3: 21 pruebas automáticas de modales y estados pendientes (DOM simulado).
- [x] A5-01: pruebas visuales/automatizadas en Chromium real de escritorio, 1365×768 (sin errores JS en los recorridos elegidos).
- [x] A5-01: emulación táctil Chromium en 393×852, 320×640 y 852×393; es emulación, no celular físico.
- [ ] A5-02: pruebas reales en Android físico con [guía específica](23-guia-prueba-android-a5.md).
- [x] A5-01: ausencia de desplazamiento horizontal **de página** en cuatro tamaños seleccionados; revisión inicial de foco/tamaños documentada.
- [ ] Accesibilidad completa (teclado y TalkBack), rendimiento y ergonomía en dispositivo físico.

## Problemas confirmados durante la auditoría

1. [#2 — Encrucijadas rechazan objetos disponibles](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2). Las manos contienen objetos, pero ciertas restricciones/efectos buscan cadenas.
2. [#3 — Mejora de dados en el jugador 2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3). `boostDie()` consulta la reserva de dados del jugador 1 para validar el turno del segundo.
3. [#4 — Transferencias entre grupos](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4): el equipo se puede transferir al otro grupo aunque el texto de la interfaz diga «propio». Definir si es una regla permitida antes de cambiarla.
4. [#5 — Herramientas de IA y crisis](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5): la IA equipa herramientas y luego no considera contribuirlas desde el equipo a la crisis.
5. [#6 — Liderazgo inicial de J2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6): J2 puede elegir líder después de actuar, mientras J1 queda bloqueado.
6. [#7 — Decisiones narrativas de IA basadas en texto](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7): la IA no reconoce ciertos riesgos por diferencias de redacción.
7. [#8 — Lógica de pase sin guardia interna](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8): `finishTurn()` permite avanzar mediante llamada directa mientras el pase está activo; no demostrado a través de controles normales.
8. [#9 — Acción de inventario durante curación pendiente](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9): por invocación interna, `playItem()` no bloquea la curación.
9. [#10 — Fin de turno durante aviso de muerte](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10): llamada interna a `finishTurn()` puede avanzar sin confirmar fallecimiento.
10. [#11 — IA alcanza meta y pierde antes de verificar](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11): victoria con notas puede llegar demasiado tarde si la colonia reduce la moral a cero.
11. [#12 — Foco de teclado escapa de setup/pase](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12): confirmado en Chromium; riesgo de accesibilidad y posible exposición a lectores de pantalla, no filtración visual demostrada.
12. [#13 — Dados con área táctil demasiado pequeña](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13): 26×25 px en vistas móviles emuladas.
11. **Comportamiento de diseño a revisar** (no se declara bug): una mordedura iniciada en el turno humano puede hacer que la IA sacrifique automáticamente a su superviviente con menor influencia, cortando la cadena antes de pedir una decisión humana.

## Reglas para reportar resultados

Cada funcionalidad tendrá: **precondición → acción → estado esperado → resultado real → evidencia** (prueba automatizada o escenario manual). Los defectos se registran por separado y se corrigen en cambios específicos; no se insertan correcciones silenciosas durante la refactorización.

**Resultado histórico de A4:** la suite contenía **238 pruebas ejecutables aprobadas** (194 previas, 21 de modales A3 y 23 de integración A4), más **3 TODO** (#4, #5 y #6): **241 declaradas, 0 fallidas**. [Ejecución histórica comprobada](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40528489536). GitHub Actions verifica el conjunto. La cantidad de pruebas **no equivale a cobertura funcional completa**, y el motor narrativo persistente sigue siendo una propuesta por aprobar.
