# 05 — Rondas, mordeduras y crisis: qué está haciendo el motor

## De `create()` a `newRound()`

`create()` configura una partida; `newRound()` prepara el turno de la ronda actual. Esta última:

1. Devuelve el turno al primer jugador.
2. Restablece `moved` y `skillUsed` en **ambos grupos**.
3. Reinicia usos de equipamiento.
4. Genera una crisis y los dados, en función de los supervivientes vivos.
5. Prepara una encrucijada.
6. Aplica heridas por congelación al grupo cuyo turno comienza.

**Detalle clave:** `newRound()` no incrementa el número de ronda; ese aumento ocurre en el controlador que finaliza los turnos.

## Cómo funciona una mordedura

Una tirada de exposición de 1 mata al personaje afectado e inicia una posible cadena entre **los demás personajes de su localidad**, ordenados por influencia de menor a mayor.

Cada superviviente afectado puede:
- **Sacrificarse:** muere, pero la cadena se detiene.
- **Arriesgarse:** si saca 4, 5 o 6 sobrevive y se detiene; con 1, 2 o 3 muere y sigue la cadena.

En modo humano + IA, la IA decide automáticamente por sus personajes. Esto puede detener la cadena antes de que el jugador humano vea una opción. **Es el comportamiento actual, no una mejora acordada**.

## Qué cubren las pruebas nuevas

El archivo `tests/rondas-mordeduras.test.mjs` ejecuta las reglas originales sobre un entorno simulado sin interfaz gráfica. Prueba:

1. Reinicio de habilidades y movimiento.
2. Reposición de dados en función de los supervivientes vivos.
3. Herida aplicada por congelación.
4. Muerte por acumulación de tres daños.
5. Inicio de decisión humana ante mordedura.
6. Sacrificio para detenerla.
7. Tirada exitosa para detenerla.
8. Tirada fallida y siguiente víctima.
9. Resolución automática de la IA en un grupo mixto.
10. Crisis exitosa.
11. Crisis fallida con penalización de moral.

## Primeros defectos reales de la V9.9

### Error #2: encrucijadas y cartas

`game.items` almacena objetos de carta, por ejemplo `{kind:'medicina', cardId:'bandage'}`. Algunas encrucijadas buscan directamente la cadena `'medicina'` con `includes()` o `indexOf()`.

**Comprobado:** existen vendas, combustible y herramientas en la mano inicial, pero las tres condiciones examinadas devuelven `false`.

Seguimiento: https://github.com/LeviEdition/invierno-en-la-colonia/issues/2

### Error #3: dados del jugador 2

En `boostDie()` se valida `game.dice.length`, que pertenece al jugador 1. Cuando J1 gastó sus dados, J2 no puede mejorar los suyos aunque tenga dados y comida.

**Comprobado:** con `game.dice=[]`, `game.botDice=[2]` y `game.food=6`, la acción se rechaza.

Seguimiento: https://github.com/LeviEdition/invierno-en-la-colonia/issues/3

No se modificó la lógica del juego: ambos errores son anteriores a la refactorización y se corregirán mediante cambios separados, con sus pruebas de regresión.

## Calidad y límites

- El código productivo permanece idéntico al de `main`.
- La suite suma **31 comprobaciones** automatizadas (4+6+10+11), ejecutadas en GitHub Actions con conclusión correcta.
- La matriz global sigue siendo parcial: faltan búsquedas, objetos, IA completa, turnos completos, interfaz y navegador real.
- La simulación del DOM usada en estas pruebas **no** sustituye una comprobación en el navegador.

## Ejercicio de lectura

Abrí `invierno_colonia_v9_9.html` y buscá `biteNext()`. Localizá:
- Dónde se selecciona la próxima víctima.
- Dónde el código le pregunta a un jugador y dónde la IA actúa automáticamente.
- Dónde las reglas intentan abrir una ventana visual.

La última pregunta nos lleva al objetivo arquitectónico: **las reglas deben producir resultados; la presentación debe decidir cómo mostrarlos**.
