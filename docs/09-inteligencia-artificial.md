# 09 — Auditoría del turno de inteligencia artificial (V9.9)

**Estado:** caracterización parcial de la estrategia de IA y del ciclo de turnos. **Rama:** `refactor/arquitectura`. La versión jugable `invierno_colonia_v9_9.html` no se modificó.

## 1. Funciones responsables

- `botTurn()` (aprox. línea 1034): ejecuta la política de decisiones de los supervivientes controlados por la IA.
- `finishTurn()` (aprox. línea 1130): cuando termina el turno humano, coordina el turno automatizado, la fase de colonia y el inicio de la siguiente ronda.
- `ItemEngine`, `beginSearch()`, `expose()`, `CrisisManager`: ejecutan las mismas reglas de objetos, búsqueda, riesgo y crisis que utilizan los jugadores humanos.

Una característica positiva es que `botTurn()` utiliza directamente **`game.botDice`**, sin copiar el arreglo. Así los dados realmente desaparecen de la reserva cuando se gastan.

## 2. Orden actual de decisiones

La estrategia es **determinista a partir del estado de la partida y los dados**; no es un modelo de aprendizaje automático.

1. Aplica congelación y verifica muertes/reemplazos.
2. Prepara una posible encrucijada narrativa y espera su resolución.
3. Utiliza habilidades gratuitas, como curar heridas o congelaciones.
4. Equipa armas y herramientas de la mano que puedan equiparse.
5. Contribuye cartas de la mano a la crisis actual, hasta cumplir su necesidad.
6. Usa medicinas, alimentos si faltan, notas de laboratorio y manuales según reglas concretas.
7. Intenta mover cada superviviente una vez, priorizando localidades según su aptitud de búsqueda y espacios disponibles.
8. Si encuentra combustible, puede gastar una carta para evitar la exposición del movimiento.
9. Mientras le queden dados, prioriza: **buscar → atacar → construir barricadas → limpiar residuos**.
10. Si no existe una acción posible, finaliza dejando los dados restantes sin gastar.

Las tiradas de exposición, los resultados de búsquedas y los eventos narrativos siguen dependiendo del azar. La estrategia de selección de acciones es una secuencia de reglas condicionales, **no una evaluación general de todos los posibles futuros**.

## 3. Qué agregamos a las pruebas

`tests/ia-turnos.test.mjs` incorpora **20 pruebas ejecutables**:

- Equipar armas automáticamente y conservar sobrantes si todos ya llevan arma.
- Aportar cartas del tipo de la crisis desde la mano.
- Curar, alimentar, investigar y utilizar manuales cuando corresponde.
- Habilidad automática de Ada.
- Elegir destinos de exploración.
- Usar combustible y, sin él, aplicar exposición (Sol evita la primera adversidad con su habilidad).
- Buscar, recuperar objetos y entregar muestras al objetivo.
- Gastar dados atacando o construyendo, limpiar como alternativa, y conservar dados cuando no hay acciones posibles.
- Reclutar reemplazo si se agotó un grupo de la IA y todavía hay candidatos disponibles.
- Resolver un ciclo completo: **humano → IA → colonia → siguiente ronda**, y derrota por agotamiento del tiempo.

Las **20 pruebas pasaron** en Node.js 22 y la suite de GitHub Actions terminó con conclusión `success`.

## 4. Qué aislamos y qué no

Para estas pruebas se ejecutan las funciones originales `botTurn()`, `ItemEngine`, `finishTurn()` y sus reglas sobre un estado real de V9.9, con resultados aleatorios controlados.

**Solo se sustituyen**:
- Llamadas a la presentación, porque Node.js no tiene DOM real.
- Las pausas visuales de 1.750 ms.
- La activación de encrucijadas: en esta batería se deshabilita para estudiar específicamente la política de juego de la IA.

Por tanto, **esta batería NO demuestra** que la IA resuelva bien las encrucijadas, que no se bloquee en una secuencia de modales ni que las animaciones sean correctas. Eso necesita una etapa separada de pruebas de integración visual y narrativa.

## 5. Hallazgo confirmado: IA y herramientas de crisis

[#5 — La IA no aporta herramientas equipadas a una crisis](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5)

Cuando la IA tiene una herramienta equipable (`repairkit`) y aparece una crisis de tipo `herramienta`, la IA puede **equiparla primero** y después dejar de considerarla para los aportes a la crisis, porque el bucle de contribuciones solo examina la mano.

Esto se reprodujo en la V9.9 original. No significa que una sola carta alcanzara para completar una crisis de necesidad 2: demuestra que la IA **omite una aportación disponible**. Registramos un `test.todo()` para definir cómo debería priorizar equipar, donar o conservar.

También continúan pendientes:
- [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2): cartas y opciones de encrucijadas.
- [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3): mejora de dados del segundo jugador.
- [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4): transferencias entre grupos y su regla prevista.

**No se modificaron mecánicas ni se corrigieron errores durante estas pruebas.**

## 6. Estado de cobertura

La suite acumula **118 pruebas ejecutables aprobadas**, más **2 TODO** (transferencias entre grupos y aportación de equipo por IA).

Esto amplía la cobertura de motor, pero **no permite afirmar que la auditoría global esté completa**. Falta revisar encrucijadas narrativas, líderes, todas las condiciones de victoria/derrota, la ejecución visual en navegadores y la interacción móvil.

## 7. Próxima etapa

Auditar **victorias, derrotas, reemplazos y estados límite**, y luego encrucijadas con decisiones humanas/IA. Finalmente repetir escenarios completos en navegador, para verificar que no se producen esperas o pantallas bloqueadas.

## 8. Cómo verlo en tu VS Code

```powershell
git switch refactor/arquitectura
git pull --ff-only
npm test
```

Para estudiar el motor: buscá `async function botTurn()` y `async function finishTurn()` en el archivo HTML original. Para comparar resultados, abrí `tests/ia-turnos.test.mjs`.
