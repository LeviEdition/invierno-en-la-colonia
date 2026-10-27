# 03 — Caracterización del movimiento y la exposición (V9.9)

## Propósito

Antes de refactorizar, comprobar **qué hace hoy** el juego. Las nuevas pruebas (`tests/movimiento-exposicion.test.mjs`) ejecutan las funciones originales. No hemos modificado `invierno_colonia_v9_9.html`.

## Recorrido de una acción de movimiento

En la V9.9, `doMove()` (aprox. línea 855) sigue este recorrido:

1. Comprueba que la partida esté activa y que el jugador pueda interactuar; descarta mordeduras o selección de líder pendientes.
2. Comprueba que el personaje esté vivo, que no se haya movido ya, que el destino sea distinto y que exista capacidad disponible.
3. Cambia `p.loc`, marca `p.moved=true` y registra el mensaje.
4. Si el personaje tiene la habilidad `silent` disponible, evita la exposición; si no, llama a `expose(p, 'movimiento')`.
5. Si no hay mordedura pendiente, puede activar una encrucijada de movimiento.
6. Verifica victoria/derrota y actualiza la interfaz.

**Hallazgo:** el movimiento normal no consume dados ni alimentos en esta implementación. Sí limita a **uno por turno para cada superviviente**.

## Movimiento con combustible

`ItemEngine.moveWithFuel()` (aprox. línea 637) mueve a un personaje vivo si el destino tiene capacidad, no se movió ya y posee la carta de combustible seleccionada.

- Consume una carta de combustible.
- Añade un residuo.
- Marca el movimiento como realizado.
- Evita la tirada de exposición.
- No consume un dado.

En la V9.9 hay, por tanto, **dos rutas diferentes para ejecutar la misma acción**: `doMove()` y `moveWithFuel()`. En la futura refactorización convendrá centralizar las validaciones comunes.

## Tabla de exposición actual

`expose(p, reason)` utiliza `die()`, que genera un número entre 1 y 6 mediante `Math.random()`.

| Dado | Resultado |
| --- | --- |
| 1 | Mordedura: el personaje muere y puede iniciarse una cadena de contagio entre otros personajes de su localidad |
| 2 | +1 congelación |
| 3 | +1 herida |
| 4, 5, 6 | Sin daño |

Si un personaje acumula tres daños entre heridas y congelación, muere. La habilidad `resilient` evita la primera exposición adversa de la ronda, y queda marcada como usada.

**Nota:** esta tabla describe la implementación actual; la propagación de mordedura y la muerte por acumulación se analizarán más a fondo en una próxima etapa.

## Diez pruebas nuevas

1. Movimiento válido, sin consumir dados ni comida.
2. Intento de moverse a la localidad actual.
3. Intento de entrar en una localidad llena.
4. Segundo movimiento del mismo superviviente durante el turno.
5. Intento de mover un superviviente fallecido.
6. Exposición sin daños (dados 4, 5 y 6).
7. Congelación (2) o herida (3).
8. Mordedura (1) de un personaje aislado.
9. Habilidad resistente de Sol aplicada una vez.
10. Movimiento con combustible, residuo y ausencia de exposición.

**Resultado de esta batería:** 10/10 pruebas superadas en Node.js 22 sobre una copia de la V9.9 idéntica al archivo de GitHub (SHA del blob `4ebaedad13d63c7a6762c524a52c0dd9695687b1`). La prueba subida a GitHub coincide con el archivo ejecutado (SHA `fb4e6ee694b8f999cc285e215e3f088a4c456e70`).

## Cómo conseguimos pruebas deterministas

Para probar una tirada concreta, el test proporciona un `Math.random()` controlado dentro de un entorno aislado (`node:vm`). **No modifica `die()` ni las probabilidades del juego**.

Solo sustituimos elementos de presentación —dibujado del tablero, avisos visuales y apertura de la ventana de muerte—, porque estas pruebas no tienen navegador. El registro, la modificación de recursos, las reglas de exposición y las muertes siguen ejecutándose a través del código original.

Esto revela un acoplamiento: la resolución de mordeduras llega a invocar directamente `DeathDirector.open()`, una operación del DOM. El motor futuro debería **emitir un evento de muerte** y dejar la animación a la interfaz.

## Límites y puntos para revisar

- Estas pruebas comprueban el estado del juego, **no** que se vea y se comporte correctamente la interfaz gráfica.
- No cubren todavía cadenas completas de mordedura, el reinicio de movimientos en rondas posteriores o las interacciones con encrucijadas pendientes.
- `doMove()` y `moveWithFuel()` validan parte de las mismas condiciones en lugares diferentes.
- La selección `target` y varias situaciones pendientes están almacenadas en variables globales.
- Conviene evaluar explícitamente el bloqueo de acciones durante encrucijadas abiertas; este grupo de pruebas las neutraliza para estudiar únicamente movimiento y exposición.

## Ejecución local

Actualizar la rama y ejecutar:

```powershell
git pull --ff-only
npm test
```

Al sumarse a las diez pruebas previas, la suite completa **debería mostrar 20 pruebas**. Conviene confirmarlo en el equipo local antes de dar esa verificación por cerrada.

## Próximo paso

Caracterizar una cadena de mordedura con varios supervivientes y después el inicio de la ronda siguiente (restablecimiento de `moved`). Recién entonces decidiremos cómo separar las acciones del DOM.
