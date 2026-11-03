# 83 — H3.4.1: mapa de consulta de una partida real

03/11/2026, America/Montevideo. Rama `experiment/h3-4-1-estado-real`, basada en **`0d7afce6abe476fef183c2e4dde148a313fd434a`**, último head remoto verificado de H3.3/PR19. Árbol inicial limpio; PR19 draft sin merge. Main826199d9 y referencia/tag/release preservados. Sin AGENTS.md aplicable.

## Autorización y límites

El creador acepta H3.3 como dirección visual, incluida la ambientación, y autoriza **H3.4.1**, inicialmente de consulta. Detalles artísticos/dispositivos físicos permanecen pendientes y no bloquean esta integración. Esto supera la espera de autorización descrita en82, sin reescribir su evidencia. PR20 es documental, sobre otra base histórica de H3.3: no se fusiona ni se sobrescribe.

Nueva rama/PR en borrador contra H3.3. Preservar la maqueta independiente. No acciones desde el mapa, reglas nuevas, cambios de balance, IA, guardados, motor alternativo, main ni merge. Preparación y acciones continúan en la interfaz existente. No avanzar a la siguiente fase.

## Contrato inspeccionado antes de implementar

- `createApplication` compone **una instancia** de `createEngine`, `createUi`, `createAgent` y el registro de comandos. Inicializa con el flujo de preparación existente.
- `createEngine.snapshot()` produce una copia completa, con manos y mazos internos: **no es el DTO a enviar al mapa**.
- `connectPresentation(factory)` admite **un receptor y lo sustituye**. No hay `subscribe` múltiple; no se usará una segunda conexión que elimine la interfaz existente.
- El receptor recibe capacidades de vista y contexto vivo protegido. Las consultas explícitas de equipo/catálogo/atributos permiten presentar datos reales.
- `paint()` procesa rescates y decisiones: **no se llama desde la cámara, la ambientación o un bucle del visor**.
- Incluso `playable()` llama a `leaderChoiceReady()` y sincroniza solicitudes de líder. El adaptador no añade esas llamadas; registra el resultado de las que la interfaz anterior ya realiza al dibujar sus dados.
- Motor: localidades por índice0–6 (Colonia, Supermercado, Hospital, Comisaría, Gasolinera, Escuela, Biblioteca), grupos `human`/`ai`, capacidades actuales12/4 y accesos12/4. La maqueta tiene posiciones provisionales distintas en gasolinera/biblioteca: no se cambian los límites del motor para adaptarlos al dibujo.
- Dados disponibles se consumen del array; no hay historial separado de usados. No se inventará. Las manos, mazos y futuras encrucijadas no se revelarán al visor.

## Adaptación acotada prevista

Una fábrica de presentación opcional en `createApplication`, con el mismo `createUi` por defecto, permite encadenar observación sin sustituir el receptor. La interfaz original se ejecuta en un host propio, con su preparación, decisiones y comandos intactos. El mapa recibe solo una proyección pública por canal de mensajes de origen verificado; no recibe motor, comandos ni enlaces internos.

Las notificaciones se coalescen después de la llamada de presentación existente. Los eventos de preparación, pase y diálogos mantienen el bloqueo y la ocultación correspondiente; no se saltean elecciones obligatorias. El visor conserva selección/cámara/ambientación fuera del motor. El ajuste de arquitectura debe demostrar conservación del receptor y limpieza mediante pruebas; la implementación y los resultados se registrarán debajo.

**Estado de este checkpoint:** inspección y primera prueba TDD de la fábrica de presentación (rojo→verde); H3.4.1 todavía en implementación. No se declara terminada ni CI aprobado para esta rama.
