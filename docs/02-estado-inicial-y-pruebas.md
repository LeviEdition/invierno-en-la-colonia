# 02 — Cómo se crea una partida y cómo la probamos

## Qué estudiamos

Una partida se prepara con `create()` (aprox. línea 689 de la V9.9). Esta función:

1. Reinicia las variables temporales de la interfaz y las acciones pendientes.
2. Elige al azar uno de los tres objetivos.
3. Construye el objeto `game`: recursos, supervivientes, localidades, manos, líderes y demás datos.
4. Completa los atributos de cada superviviente mediante `addCharacter()`.
5. Crea los seis mazos de exploración usando `catalog.deck()`.
6. Invoca `newRound()`, que prepara crisis, dados, encrucijada y comprobaciones de inicio.

La función `create()` **no equivale a dibujar**. Sin embargo, actualmente depende indirectamente de funciones que actualizan la pantalla. Este acoplamiento es una de las razones para modularizar.

## Qué son las pruebas de caracterización

Son comprobaciones que fijan **lo que hace hoy la V9.9**, no necesariamente todo lo que deberían hacer las reglas ideales del juego.

El archivo `tests/estado-inicial.test.mjs` ejecuta el JavaScript original en un contexto aislado con `node:vm`. Se evitan solo los efectos visuales y la inicialización automática de la pantalla: se siguen ejecutando `create()`, `newRound()`, los constructores y las reglas reales.

Inyectamos un `Math.random()` controlado para que el resultado sea reproducible. Así comprobamos las tres misiones posibles sin depender de la suerte.

## Qué se comprueba

- Recursos y ronda de inicio.
- Identidad, atributos y ubicación de los seis supervivientes.
- Siete localidades, zombis iniciales y veinte cartas en cada mazo exterior.
- Manos de siete cartas, dados, líderes y crisis.
- Selección de los tres objetivos disponibles.
- Configuración del modo de dos jugadores locales.
- Reinicio de recursos al comenzar otra partida.

## Qué NO se comprueba todavía

- Que las cartas se puedan jugar correctamente durante una partida.
- Que el juego cumpla todas las reglas de *Dead of Winter*.
- La navegación visual, botones, animaciones o experiencia móvil.
- Transiciones completas entre rondas, IA y multijugador online.

Las pruebas de caracterización son un **cinturón de seguridad**, no una certificación de ausencia de errores.

## Para ejecutarlas

Con Node.js instalado, en la raíz del repositorio:

```powershell
npm test
```

El resultado esperado en esta etapa es **10 pruebas aprobadas**: las cuatro estructurales previas y seis nuevas del inicio de partida.

## Para explorar en VS Code

Buscá `function create()` en `invierno_colonia_v9_9.html` y seguí las llamadas `addCharacter()`, `catalog.deck()` y `newRound()`.

**Ejercicio de lectura (sin editar):** ¿por qué para los dados se usa `1 + cantidad de supervivientes vivos`? ¿Y qué ventaja tiene que el catálogo de cartas esté centralizado en `ItemCatalog`?
