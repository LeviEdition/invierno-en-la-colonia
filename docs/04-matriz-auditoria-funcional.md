# Matriz de auditoría funcional — V9.9

**Propósito:** revisar exhaustivamente lo que YA existe en Invierno en la Colonia antes de extraer módulos del motor. No confundir funcionalidades previstas (2D isométrico, historias persistentes, modo online) con funcionalidades ya implementadas.

**Fecha de inicio:** 27/10/2026 · **Rama:** `refactor/arquitectura` · **Base:** `invierno_colonia_v9_9.html`

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
| 10 | Habilidades e influencia | habilidades de personajes, usos por ronda, líderes, sucesión e influencia | **P**: resistencia, ataque de Bruno y reinicio de habilidades; líderes y sucesión pendientes |
| 11 | Barricadas y zombis | colocación, capacidad, llegada, desbordamiento, eliminación, atraer y limpiar | **P**: ataques, defensa, desbordamiento, indefensos, atraer y limpiar; combinaciones completas pendientes |
| 12 | Fase de colonia | consumo de comida, hambre acumulada, basura, crisis, zombis y ruido | **P**: alimentación, hambre, basura, crisis, oleadas y ruido; secuencia con IA probada sin narrativa |
| 13 | Crisis y contribuciones | selección de tipo, cartas válidas, premio de sobreaporte, penalizaciones | **P**: aportes desde mano/equipo, rechazo de categoría, sobreaporte, éxito/fallo de moral; penalizaciones restantes pendientes |
| 14 | Encrucijadas narrativas | activación, disponibilidad de opciones, gastos, efectos e IA | **B**: cartas válidas rechazadas en varias opciones; [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2) |
| 15 | Inteligencia artificial | selección de acciones, objetos, búsqueda/combate, encrucijadas, bloqueos | **P**: 20 pruebas de equipamiento, decisiones, desplazamiento, combate y turno completo; narrativa y DOM pendientes; [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5) |
| 16 | Dos jugadores en mismo dispositivo | privacidad en pantalla de pase, manos, dados, selección, líder y cambio de turnos | **P**: estado inicial; **B**: ver #3 |
| 17 | Victoria, derrota y situaciones límite | objetivos, moral cero, sin supervivientes, límite de rondas, estados pendientes | **P**: derrota por agotamiento de rondas; otros finales y estados límite pendientes |
| 18 | Interfaz y accesibilidad | clics, modales, perfil, avisos, cartas, contraste, tamaño táctil y foco | **N**: pruebas manuales en navegador |
| 19 | Móvil y rendimiento | vista vertical, sin scroll horizontal, render y animaciones, dispositivos modestos | **N**: pruebas manuales en celular |
| 20 | Guardado, reconexión y multijugador por red | persistencia general, servidor autoritativo, WebSockets | **F**: objetivos futuros, no presentes en V9.9 |
| 21 | Escenarios isométricos y narrativa diferida | sprites, fondos, historias conectadas, consecuencias persistentes | **F**: objetivos futuros, no presentes en V9.9 |

## Orden recomendado de trabajo

### Bloque 1 — Base y salud del motor (en curso)
- [x] Inicio de partida, modo local inicial y objetivos.
- [x] Movimiento, combustible y exposición básica.
- [x] Mordeduras y decisiones humanas; comportamiento automático de IA.
- [x] Reinicio de movimiento y habilidades por ronda; crisis simples.
- [x] Caracterización de turnos J1/J2 y humano/IA sin encrucijadas ni DOM real; sigue pendiente integración narrativa/visual.
- [ ] Derrotas, victorias y reemplazos.

### Bloque 2 — Recursos, objetos y acciones
- [x] Caracterización inicial de búsqueda, ruido, mazos y elección de cartas (17 pruebas, junto con efectos básicos de objetos).
- [x] Caracterización parcial de objetos consumibles, armas, herramientas, transferencias y equipo al morir (22 pruebas nuevas).
- [ ] Completar dados, comida, ataque, barricadas, atraer zombis y limpieza (ataque y parte de barricadas ya probados).

### Bloque 3 — Fase de colonia e IA
- [x] Caracterización inicial de alimentación, hambre, basura, crisis y oleadas (28 pruebas nuevas); completar escenarios de integración.
- [x] Primera caracterización del turno IA: equipamiento, recursos, movimiento, acciones y vuelta a ronda siguiente (20 pruebas); narrativa todavía pendiente.
- [ ] Casos límite: sin capacidad, sin cartas, sin dados, sin supervivientes.

### Bloque 4 — Narrativa y modos de juego
- [ ] Encrucijadas: activación, opciones, restricciones y resultados.
- [ ] Líderes, influencia y sucesión.
- [ ] Privacidad de manos y dados en modo local.

### Bloque 5 — Integración y experiencia de usuario
- [ ] Una partida reproducible desde inicio hasta victoria/derrota.
- [ ] Pruebas visuales en navegador de escritorio.
- [ ] Pruebas reales en pantalla móvil vertical y con interacción táctil.
- [ ] Rendimiento, accesibilidad y ausencia de desplazamiento horizontal.

## Problemas confirmados durante la auditoría

1. [#2 — Encrucijadas rechazan objetos disponibles](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2). Las manos contienen objetos, pero ciertas restricciones/efectos buscan cadenas.
2. [#3 — Mejora de dados en el jugador 2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3). `boostDie()` consulta la reserva de dados del jugador 1 para validar el turno del segundo.
3. [#4 — Transferencias entre grupos](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4): el equipo se puede transferir al otro grupo aunque el texto de la interfaz diga «propio». Definir si es una regla permitida antes de cambiarla.
4. [#5 — Herramientas de IA y crisis](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5): la IA equipa herramientas y luego no considera contribuirlas desde el equipo a la crisis.
5. **Comportamiento de diseño a revisar** (no se declara bug): una mordedura iniciada en el turno humano puede hacer que la IA sacrifique automáticamente a su superviviente con menor influencia, cortando la cadena antes de pedir una decisión humana.

## Reglas para reportar resultados

Cada funcionalidad tendrá: **precondición → acción → estado esperado → resultado real → evidencia** (prueba automatizada o escenario manual). Los defectos se registran por separado y se corrigen en cambios específicos; no se insertan correcciones silenciosas durante la refactorización.

La suite ahora contiene **118 pruebas ejecutables** (4 estructurales, 6 de estado inicial, 10 de movimiento/exposición, 11 de rondas/mordeduras/crisis, 17 de búsqueda/objetos, 22 de combate/equipamiento, 28 de colonia/turnos y 20 de IA), más **dos TODO** de decisiones pendientes (#4 y #5). GitHub Actions verifica el conjunto. La cantidad de pruebas **no equivale a cobertura funcional completa**.
