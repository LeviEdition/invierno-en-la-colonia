# Plan de refactorización — por etapas, sin apuro

## Objetivos

1. Comprender el código antes de moverlo.
2. Conservar el comportamiento jugable de la V9.9.
3. Hacer que el motor de reglas funcione sin depender de HTML ni del DOM.
4. Poder ejecutar pruebas automáticas reproducibles.
5. Preparar una capa narrativa persistente, presentación 2D y, a largo plazo, multijugador online.

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
- [x] Matriz de auditoría funcional en 21 áreas, con estados y prioridad.
- [x] GitHub Actions habilitado: suite de regresión ampliada a 98 pruebas, más una TODO.
- [x] Dos defectos reproducibles (#2 y #3) y una definición pendiente sobre transferencias (#4), sin alterar la V9.9.
- Inicio de partida, objetivo, personajes, localidades y mazos.
- Consumo y requisitos de dados.
- Movimiento, exposición, heridas y muerte.
- Búsqueda, objetos, crisis y fase de colonia.
- Turnos IA y modo local.

En esta etapa **no corregimos silenciosamente reglas**: si encontramos un defecto, lo registramos para decidir una corrección explícita.

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

## Etapa E — Persistencia y narrativa

Guardar partidas con una versión de esquema, IDs estables para eventos y consecuencias diferidas. La historia narrará cambios reales en el tablero, no solo texto o moral.

## Etapa F — Presentación 2D y red

- Añadir escenas isométricas como una capa visual independiente.
- Diseñar sprites y recursos reutilizables según una biblia visual.
- Más adelante, ejecutar el motor autoritativo en el servidor y conectar clientes mediante WebSockets.

No se abordarán las etapas E y F antes de estabilizar el motor.

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

El primer control solo comprueba estructura y sintaxis del archivo base: **no sustituye todavía pruebas de una partida**.
