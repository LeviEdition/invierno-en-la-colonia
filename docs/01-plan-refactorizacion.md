# Plan de refactorización — por etapas, sin apuro

> **Ejecución actual:** la fuente de verdad de **etapa activa, tarea única y criterios de terminado** es [el tablero operativo](18-tablero-operativo.md). **Estamos en A — Auditoría funcional; siguiente tarea A2-01, privacidad J1/J2.** Este documento es la planificación general, no una autorización para avanzar a distintas fases en paralelo.

## Objetivos

1. Comprender el código antes de moverlo.
2. Conservar el comportamiento jugable de la V9.9.
3. Hacer que el motor de reglas funcione sin depender de HTML ni del DOM.
4. Poder ejecutar pruebas automáticas reproducibles.
5. Hacer de la **narrativa persistente el centro de la experiencia**: decisiones, personajes, memoria, consecuencias diferidas y arcos que cambian con la partida.
6. Desarrollar después una presentación 2D que muestre esos cambios, y a largo plazo multijugador online.

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
- [x] GitHub Actions habilitado: suite de regresión ampliada a **174 pruebas y 3 TODO**, ejecución completa sujeta al control automático de la rama.
- [x] Defectos anteriores a la refactorización (#2, #3, #5, #6 y #7) y una definición pendiente sobre transferencias (#4); sin alterar la V9.9.
- Inicio de partida, objetivo, personajes, localidades y mazos.
- Consumo y requisitos de dados.
- Movimiento, exposición, heridas y muerte.
- Búsqueda, objetos, crisis y fase de colonia.
- Turnos IA y modo local.

En esta etapa **no corregimos silenciosamente reglas**: si encontramos un defecto, lo registramos para decidir una corrección explícita.

## Compuertas de ejecución entre etapas

Antes de comenzar una fase nueva, cerrar la anterior con evidencia y registrar una decisión de avance.

1. **A — Auditoría completa:** falta modo local, pruebas visuales, integración y móvil. Documentar problemas y límites; no corregirlos a escondidas.
2. **B — Decisiones y prioridad de defectos:** acordar qué es error y qué es regla deseada; clasificar impacto.
3. **C — Estabilización:** corregir solo fallos priorizados, ejecutar regresiones y comprobar que el juego funciona en navegador real.
4. **D — Refactorización:** separar módulos conservando el comportamiento.
5. **E — Prototipo narrativo:** implementar memoria y un arco conectado validable.
6. **F — Ampliación de campañas y presentación:** después de demostrar que funciona el núcleo.

Las etapas originales C/D/E/F que aparecen debajo contienen los detalles técnicos; el [tablero operativo](18-tablero-operativo.md) determina su ejecución efectiva.

## Etapa C — Primer módulo independiente

Extraer un componente pequeño y con pocas dependencias, probablemente el catálogo de objetos.

- Definir su interfaz pública.
- Mantener los datos y resultados originales.
- Crear pruebas unitarias.
- Confirmar que la interfaz sigue funcionando.

**Criterio de aceptación:** el módulo puede probarse por separado, sin alterar la partida original.

## Etapa D — Motor desacoplado

Separar progresivamente:
- Estado de partida y creación inicial.
- Comandos (`mover`, `buscar`, `atacar`, etc.) y validaciones.
- Resolución de turnos, crisis y efectos.
- IA como cliente de las mismas reglas.
- Presentación, modales y animaciones como consumidores de eventos.

Principio: **dibujar no modifica el estado del juego**.

## Línea prioritaria N — Narrativa primero (diseño ya iniciado)

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

**Prioridad creativa no equivale a etapa activa:** la narrativa ya orienta nuestras decisiones arquitectónicas y sus propuestas quedaron documentadas. **El diseño pendiente y la implementación narrativa están estacionados hasta completar la auditoría, definir defectos, estabilizar y alcanzar una interfaz de motor suficientemente segura.** No comenzar un arco nuevo por entusiasmo mientras sigamos en A. Cualquier excepción requiere cambiar el tablero operativo de manera explícita.

## Etapa E — Motor de historia y persistencia

Una vez validado el arco piloto, extender el motor narrativo para registrar hechos, promesas, relaciones, arcos, consecuencias diferidas y versiones de guardado. El sistema deberá usar las mismas reglas de estado que las acciones de tablero y alimentar la presentación 2D.

## Etapa F — Presentación 2D y red

- Añadir escenas isométricas como una capa visual independiente.
- Diseñar sprites y recursos reutilizables según una biblia visual.
- Más adelante, ejecutar el motor autoritativo en el servidor y conectar clientes mediante WebSockets.

No comenzar la **presentación 2D ni la red** antes de validar un prototipo narrativo persistente y una interfaz segura del motor. No es necesario esperar a refactorizar todo el juego para diseñar la narrativa: la historia guía los contratos técnicos desde ahora.

## Flujo de trabajo Git

1. `main`: versión estable que funciona.
2. Ramas `refactor/*` y `feature/*`: cambios aislados.
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
