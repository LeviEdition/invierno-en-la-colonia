# 08 — Fase de colonia y ciclo de turnos (auditoría V9.9)

**Rama de trabajo:** `refactor/arquitectura` · **Versión base:** `invierno_colonia_v9_9.html` · **Objetivo:** caracterizar el comportamiento antes de refactorizar.

## 1. Qué resuelve la fase de colonia

`colony()` ejecuta esta secuencia:

1. Calcula cuántas personas hay dentro de la colonia: supervivientes vivos allí + indefensos.
2. Exige `Math.ceil(habitantes/2)` comidas; si hay un cocinero vivo dentro, resta una (mínimo 0).
3. Si alcanza la comida, la descuenta. Si no, incrementa `game.hunger` y quita una cantidad de moral igual al hambre acumulada **sin consumir los alimentos disponibles**.
4. Por cada diez residuos (`Math.floor(waste/10)`) quita una unidad de moral.
5. Resuelve la crisis activa: aportaciones, éxito y premios o consecuencias del fracaso.
6. Agrega zombis: en la colonia, `Math.ceil(habitantes/2)`; afuera, uno por cada superviviente vivo presente.
7. Resuelve cada ficha de ruido con una tirada individual: los valores 1–3 atraen un zombi y 4–6 no; después limpia el ruido.
8. Ejecuta `verify()` para detectar finales de partida.

**Observación de reglas:** las fichas de hambre no se reinician cuando se consigue comida. Esa es la implementación actual, y podría revisarse durante el diseño de reglas, pero **no se modifica silenciosamente**.

## 2. Zombis, barricadas y desbordamiento

`addZombie(i)` distingue tres situaciones:

- Si queda un acceso libre, agrega un zombi.
- Si los accesos están llenos y existe una barricada, elimina la barricada (sin agregar zombi).
- Si no hay acceso ni barricada, mata al superviviente vivo de **menor influencia** en esa localidad; si es la colonia sin supervivientes pero con indefensos, pierde un indefenso y una moral.

En una localidad exterior vacía y llena, el desbordamiento informa el incidente sin quitar moral.

## 3. Acciones adicionales comprobadas

- `clean()`: requiere un superviviente en la colonia y residuos disponibles; retira hasta tres residuos y utiliza un dado.
- `attract()`: requiere accesos libres en destino y al menos un zombi en otra localidad; utiliza un dado para iniciar una acción que puede transferir hasta dos zombis mediante `chooseAttract(src)`.
- Los destinos u orígenes inválidos no deben modificar las cantidades de zombis.

Estas acciones tienen **estado transitorio** (por ejemplo, `pendingAttract`) y dependen de los controles visuales para elegir los resultados. Será necesario desacoplarlas al modularizar el motor.

## 4. Ciclo de turnos

En modo local (dos jugadores en el mismo dispositivo), `finishTurn()`:

1. Al terminar J1, selecciona J2, aplica congelación a J2 y muestra la pantalla de pase. **No** ejecuta la fase de colonia.
2. Al terminar J2, ejecuta `colony()`, espera los eventos de muertes y avanza el contador de ronda.
3. Si se agotó el máximo de rondas, registra derrota por tiempo; de lo contrario, llama a `newRound()` y devuelve el turno a J1.

La función rechaza cerrar el turno mientras existan decisiones pendientes como búsqueda, mordedura, curación, transferencia, atracción, elección de líder o encrucijada.

En modo humano + IA, la rama de ejecución es diferente: `finishTurn()` llama a `botTurn()`, después resuelve `colony()` y prepara la ronda siguiente. **Aún falta probar exhaustivamente esta secuencia con la IA real.**

## 5. Nuevas pruebas

Se agregó `tests/colonia-turnos.test.mjs` con **28 pruebas** que incluyen:

- Comida para cinco y seis habitantes, ahorro del cocinero, comida insuficiente y dos fases de hambre consecutivas.
- Residuos de 9, 10 y 20; penalizaciones por fallos de crisis de comida, zombis y heridas.
- Entrada bloqueada por barricadas, muerte por desbordamiento, localidad sin habitantes y muerte de indefensos.
- Limpieza con y sin condiciones válidas.
- Atracción de zombis, orígenes inválidos y ausencia de objetivos.
- Cambio J1→J2; finalización J2→colonia→ronda siguiente; pantalla de pase.
- Congelación al comenzar el turno de J2.
- Decisiones pendientes que impiden terminar el turno.
- Derrota al superar el límite de rondas.

### Resultado técnico

- **28 pruebas aprobadas, ninguna fallida** al ejecutarlas con Node.js 22 sobre la V9.9 original.
- El archivo publicado en GitHub coincide exactamente con el probado localmente (SHA del blob Git: `de2fee2510569d41b83a767beb422d84c0fd41c7`).
- La batería histórica tenía **70 pruebas aprobadas y una TODO**; ahora la suite debe contener **98 aprobadas y una TODO**. GitHub Actions verifica el total automáticamente.
- Estas pruebas aíslan la presentación mediante un DOM simulado. No prueban todavía la pantalla real ni animaciones.

## 6. Qué falta por cubrir

- Una vuelta completa del turno con IA ejecutando su estrategia real.
- Daños, muertes, bloqueos y encrucijadas producidos durante el turno automatizado.
- Ciclo completo desde creación de partida hasta victoria o derrota con acciones reales.
- Recuperación de interfaz tras secuencias de decisiones pendientes.
- Comprobación visual y táctil en navegadores.

## 7. Concepto de arquitectura: coordinación versus reglas

`finishTurn()` mezcla coordinación (pasar J1/J2, esperar IA, abrir pantalla de pase), reglas (alimentación y zombis) y presentación (`paint()`, `showPass()`). Podemos preservar su comportamiento separando:

- **Controlador de turnos:** decide cuándo se ejecuta cada fase.
- **Motor de reglas:** aplica las consecuencias sobre el estado.
- **Eventos y presentación:** muestran el pase de dispositivo, crisis, combates y muertes.

Esta es una propuesta técnica para una etapa posterior, no una refactorización realizada.

## 8. Cómo revisar en VS Code

```powershell
git switch refactor/arquitectura
git pull --ff-only
npm test
```

Después buscá `function colony()` y `async function finishTurn()` dentro de `invierno_colonia_v9_9.html`, y comparalas con las pruebas de `tests/colonia-turnos.test.mjs`.

**Próxima etapa sugerida:** estrategia de IA, ciclo humano→IA→colonia y reglas de victoria/derrota.
