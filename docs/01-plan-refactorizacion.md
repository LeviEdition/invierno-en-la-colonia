# Plan de refactorización — por etapas, sin apuro

> **Ejecución actual:** la fuente de verdad de **etapa activa, tarea única y criterios de terminado** es [el tablero operativo](18-tablero-operativo.md). Esta hoja conserva parte del historial de A/B/C; **D1/D2 están integradas yvalidadas en main** mediante PR15/merge6b8bfca. La preservación formal está autorizada: tag anotado publicado y release en preparación, con validación de adjuntos pendiente según [informe72](72-preservacion-referencia-modular.md). No se autoriza implementar el juego propio. [Cierre71](71-integracion-main-y-cierre-d1-d2.md). Este documento es planificación general, no autorización para empezar fases en paralelo.

## Objetivos

1. Comprender el código antes de moverlo.
2. Conservar el comportamiento jugable de la V9.9.
3. Hacer que el motor de reglas funcione sin depender de HTML ni del DOM.
4. Poder ejecutar pruebas automáticas reproducibles.
5. Hacer de la **narrativa persistente el centro de la experiencia**: decisiones, personajes, memoria, consecuencias diferidas y arcos que cambian con la partida.
6. Desarrollar después una presentación 2D que muestre esos cambios, y a largo plazo multijugador online.

## Ruta de tres hitos: adaptación fiel y modular → preservación → juego propio

**Decisiones vigentes:** [61 — matriz F solo para el juego propio](61-alcance-matriz-f-juego-propio.md) y [62 — D1/D2 integradas ypreservación en curso](62-hitos-referencia-fiel-y-juego-propio.md). La V9.9 estabilizada está **aceptada como suficientemente fiel en las mecánicas para ser nuestra referencia**, con las diferencias ya documentadas en el [informe 49](49-c15-auditoria-final.md#comparación-con-dead-of-winter). La ruta vigente es:

- **Hito 1 — completado e integrado:** la fidelidad funcional se acepta para el alcance de esta adaptación (no significa equivalencia idéntica de todo el reglamento). **D1 yD2 completadas**, integradas con aprobación del creador y467/467 más regresión de partidas/navegador sobre main; se preservan las reglas actuales. **No realizar otra RF desde cero ni exigir nuevos cambios de fidelidad** para iniciar el juego propio.
- **Matriz F:** compara mecánicas con el juego de mesa **para decidir cómo funcionará nuestro videojuego propio**. `F-14` (cinco candidatos → elegir tres → líder manual) y otras filas *Conservar/Cambiar* **no se implementan en la V9.9 ni durante la refactorización D**.
- **Hito 2 — referencia preservada:** después de aceptar la adaptación suficientemente fiel y modular, guardar una instantánea identificable con su código, ejecutable, criterios de fidelidad, resultados de prueba y desviaciones aprobadas; autorizada el29/10/2026, en curso según72; no se declara completada antes de verificar la publicación.
- **Hito 3 — juego propio futuro:** desde esa referencia preservada, abrir línea de desarrollo separada; revalidar decisiones F según su aporte al singleplayer e incorporar gradualmente cambios propios y narrativa E.
- **No confundir etiquetas:** las filas **F-01, F-14, etc.** son IDs de la *matriz F de comparación/diseño*. La **etapa F** histórica de este plan es presentación 2D, campañas/red y modalidades posteriores, no la implementación automática de esas filas.
- **Informe 49 ≠ matriz F:** el informe 49 **ya contrastó la referencia** con el reglamento, y sus diferencias conocidas están aceptadas para este alcance; F registra conservar/cambiar/pendiente **para nuestro juego propio**. Una eventual auditoría RF complementaria solo se abre por hallazgo o nueva autorización, no como fase obligatoria.

## Criterio transversal de calidad y revisión (acordado)

**Calidad por encima de aprobación:** el asistente no debe confirmar una idea solo para acompañar al usuario. Cada propuesta relevante se evalúa con argumentos sobre coherencia narrativa, agencia del jugador, dificultad, balance, implementación, riesgos, costo y valor.

- Destacar fortalezas **solo con motivos específicos**.
- Identificar debilidades, contradicciones y riesgos, incluso cuando el boceto resulte interesante.
- Recomendar conservar, mejorar, prototipar, posponer o descartar, fundamentando por qué.
- Diferenciar hechos comprobados en V9.9 de hipótesis creativas, y validar propuestas mediante pruebas y partidas reproducibles.
- Aplicar el mismo criterio crítico a las ideas del asistente y a las del usuario.
- No modificar reglas ni `main` sin decisión explícita.

**Documento de referencia:** [Protocolo de revisión crítica y control de calidad](15-protocolo-revision-critica.md).

## Etapa A — Línea base (actual)

- [x] Guardar V9.9 intacta en `main`.
- [x] Crear rama `refactor/arquitectura`.
- [x] Identificar los principales módulos actuales y puntos de acoplamiento.
- [x] Incorporar un control automático inicial de **sintaxis y estructura** (4 comprobaciones; ejecutadas con Node.js en copia verificada de la V9.9).
- [ ] Ejecutarlo en el equipo local con Node.js.
- [ ] Registrar una pequeña lista de pruebas manuales de las mecánicas actuales.

**Criterio de aceptación:** la V9.9 original permanece intacta y conocemos qué verifican —y qué no verifican— las pruebas.

## Etapa B — Caracterización de las reglas

Antes de reorganizar acciones, escribir pruebas del comportamiento actual:
- [x] Primer bloque de caracterización: inicio de partida, tres objetivos, dos modos, mazos y reinicio (6 pruebas nuevas).
- [x] Segundo bloque: movimiento, movimientos inválidos, combustible y exposición (10 pruebas nuevas).
- [x] Tercer bloque: reinicio de ronda, congelación, daños, cadenas de mordedura y crisis simples (11 pruebas nuevas).
- [x] Cuarto bloque: búsquedas, ruido, mazos y efectos iniciales de objetos (17 pruebas nuevas).
- [x] Quinto bloque: combate, armas, equipamiento, transferencias y aportes a crisis (22 pruebas nuevas; una TODO).
- [x] Sexto bloque: fase de colonia, alimentación, hambre, residuos, barricadas, oleadas, limpieza, atracción y turnos locales (28 pruebas nuevas).
- [x] Séptimo bloque: IA, política de selección de acciones, consumo de recursos y ciclo humano→IA→colonia→nueva ronda (20 pruebas nuevas, sin narrativa).
- [x] Octavo bloque: victorias, derrotas, líderes, sucesión, reemplazos de emergencia y rescates (30 pruebas nuevas; una TODO).
- [x] Noveno bloque: 26 encrucijadas, disparadores, requisitos, decisiones humanas/IA y defectos de texto (26 pruebas nuevas).
- [x] Matriz de auditoría funcional en 21 áreas, con estados y prioridad.
- [x] GitHub Actions habilitado: suite de regresión ampliada a **238 pruebas aprobadas, 0 fallidas y 3 TODO**, ejecución completa sujeta al control automático de la rama.
- [x] Defectos anteriores a la refactorización (#2, #3, #5, #6 y #7), una definición pendiente sobre transferencias (#4) y un nuevo hallazgo de pase (#8); sin alterar la V9.9.
- [x] Auditoría automatizada A2-01 del modo local: 20 casos, evidencia y límites documentados en `docs/19-auditoria-modo-local.md`; pruebas visuales pendientes A5.
- [x] Auditoría automatizada A3 de modales y estados pendientes: 21 casos, defectos #9/#10 y límites en `docs/20-auditoria-modales-a3.md`.
- [x] Auditoría automatizada A4 de integración: 23 casos, partidas dirigidas y hallazgo #11 en `docs/21-auditoria-integracion-a4.md`.
- [x] A5-01 en Chromium real (escritorio y tres tamaños emulados móviles): 40 comprobaciones y 12 complementarias, sin errores JS ni desbordamiento horizontal; hallazgos de foco #12 y controles táctiles #13 en `docs/22-auditoria-navegador-a5.md`.
- [ ] A5-02: observaciones de al menos un Android físico siguiendo `docs/23-guia-prueba-android-a5.md`.
- Inicio de partida, objetivo, personajes, localidades y mazos.
- Consumo y requisitos de dados.
- Movimiento, exposición, heridas y muerte.
- Búsqueda, objetos, crisis y fase de colonia.
- Turnos IA y modo local.

En esta etapa **no corregimos silenciosamente reglas**: si encontramos un defecto, lo registramos para decidir una corrección explícita.

## Compuertas de ejecución entre etapas

Antes de comenzar una fase nueva, cerrar la anterior con evidencia y registrar una decisión de avance.

1. **A — Auditoría completa:** A2/A3/A4 tienen pruebas automatizadas; faltan observaciones de Android físico (A5-02), evaluación de accesibilidad/rendimiento y cierre de cobertura (A6). Documentar problemas y límites; no corregirlos a escondidas.
2. **B — Decisiones y prioridad de defectos:** acordar qué es error y qué es regla deseada; clasificar impacto.
3. **C — Estabilización:** corregir solo fallos priorizados, ejecutar regresiones y comprobar que el juego funciona en navegador real.
4. **D1/D2 — Refactorización conservadora completada:** separación de módulos **sin cambiar reglas** y sin introducir decisiones de la matriz F; validar arquitectura, tests, navegador y partidas completas.
5. **Preservar la referencia:** una vez completadas D1/D2, guardar su SHA/versión, build y evidencias con autorización. **La fidelidad mecánica actual ya está aceptada** y el informe 49 documenta diferencias; no hay etapa RF obligatoria.
6. **Juego propio — matriz F y E:** desde esa referencia, seleccionar los cambios F valiosos para singleplayer y prototipar memoria narrativa y un arco conectado, en línea de desarrollo separada.
7. **Etapa F de expansión (NO la matriz F):** ampliación de campañas, presentación y red después de demostrar que funciona el núcleo.

Las etapas originales C/D/E/F que aparecen debajo contienen los detalles técnicos; el [tablero operativo](18-tablero-operativo.md) determina su ejecución efectiva.

## Criterios originales D1 (cumplidos; ver71) — Primer módulo independiente

Extraer un componente pequeño y con pocas dependencias, probablemente el catálogo de objetos.

- Definir su interfaz pública.
- Mantener los datos y resultados originales.
- Crear pruebas unitarias.
- Confirmar que la interfaz sigue funcionando.

**Criterio de aceptación:** el módulo puede probarse por separado, sin alterar la partida original. **La refactorización no debe alterar la fidelidad mecánica aceptada por el creador y contrastada en el informe 49.**

## Criterios originales D2 (cumplidos; ver71) — Motor desacoplado, todavía sobre la referencia

**Objetivo: preservar el comportamiento actual aprobado de V9.9, sin aplicar cambios de la matriz F ni alteraciones de reglas ocultas dentro de D.** Separar progresivamente:
- Estado de partida y creación inicial.
- Comandos (`mover`, `buscar`, `atacar`, etc.) y validaciones.
- Resolución de turnos, crisis y efectos.
- IA como cliente de las mismas reglas.
- Presentación, modales y animaciones como consumidores de eventos.

Principio: **dibujar no modifica el estado del juego**.

## Visión narrativa (documentada, estacionada durante la auditoría)

**Dirección creativa establecida:** las decisiones y sus repercusiones en personas, relaciones y conflictos son el centro del videojuego. La estrategia de recursos debe generar dilemas significativos.

- [x] Auditar encrucijadas existentes y detectar carencia de memoria narrativa.
- [x] Escribir visión narrativa persistente: `docs/12-vision-narrativa-persistente.md`.
- [x] Preparar un ejemplo de arco conectado (no canon): `docs/13-arco-piloto.md`.
- [ ] Conversar con el usuario el tono, el conflicto principal y las consecuencias del arco piloto.
- [x] Acordar campañas de duración variable, con hitos narrativos integrados a los recursos mecánicos y condición inicial de victoria; especificación: `docs/16-progresion-narrativa-mecanica.md`.
- [x] Preparar **primer borrador** de mapa jugable con hitos, rutas de muestras y contingencias en `docs/17-mapa-campana-encontrar-cura.md`.
- [ ] **Revisar y aprobar con el usuario** el mapa, el peso de la secta, las rutas alternativas y el ritmo de campaña; el borrador no es canon.
- [ ] Aprobar el modelo mínimo de estado narrativo serializable y efectos.
- [ ] Implementar **un solo arco vertical** con decisiones diferenciadas y repercusiones a varias rondas, con pruebas, en una rama separada y sin cambiar la V9.9 estable.
- [ ] Comprobar persistencia, muerte de actores, reactivación, continuidad y finales variables.

**Principio actualizado:** la narrativa **no es opcional para ganar la campaña**. Atravesar la trama principal y obtener recursos mecánicos son requisitos interrelacionados desde la carta inicial, aunque las rutas y los epílogos cambien. Algunas campañas serán más cortas y mecánicas, otras más largas y narrativas. Las historias secundarias independientes no deben bloquear la victoria.

**Prioridad creativa no equivale a etapa activa:** la narrativa orienta nuestras decisiones arquitectónicas, pero su implementación pertenece al **Hito 3**. D1/D2 ya se cerraron; no comenzar un arco nuevo ni cambios F antes de preservar formalmente la referencia yautorizar el desarrollo propio. Consultar el tablero operativo para la siguiente tarea autorizada.

## Detalle futuro E — Motor de historia y persistencia

Una vez validado el arco piloto, extender el motor narrativo para registrar hechos, promesas, relaciones, arcos, consecuencias diferidas y versiones de guardado. El sistema deberá usar las mismas reglas de estado que las acciones de tablero y alimentar la presentación 2D.

## Detalle futuro F — Presentación 2D y red

- Añadir escenas isométricas como una capa visual independiente.
- Diseñar sprites y recursos reutilizables según una biblia visual.
- Más adelante, ejecutar el motor autoritativo en el servidor y conectar clientes mediante WebSockets.

No comenzar la **presentación 2D ni la red** antes de validar un prototipo narrativo persistente y una interfaz segura del motor. No es necesario esperar a refactorizar todo el juego para diseñar la narrativa: la historia guía los contratos técnicos desde ahora.

## Flujo de trabajo Git

1. `main`: línea técnica de referencia existente, **no todavía un hito de fidelidad final certificado**. Tras completar RF y pruebas, decidir con autorización cómo preservar un SHA/versión fiel antes de crear la variante propia.
2. Ramas `refactor/*` y `feature/*`: cambios aislados; **la futura versión propia tendrá línea de desarrollo separada** cuando se apruebe, sin contaminar D1/D2 con filas F.
3. Commits pequeños y descriptivos.
4. Pull request: explicar **qué cambió, por qué y cómo se probó**.
5. Revisar antes de fusionar con `main`.

## Cómo ejecutar el control inicial

Cuando Node.js esté instalado, desde la raíz del repositorio:

```powershell
node --version
npm test
```

La suite incluye actualmente pruebas de caracterización del motor y de encrucijadas, pero todavía necesita **pruebas visuales reales** de una partida en navegador. El control estructural original por sí solo no era suficiente.
