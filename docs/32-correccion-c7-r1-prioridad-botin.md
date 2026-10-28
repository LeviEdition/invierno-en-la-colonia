# 32 — C7-R1: elegir herramienta salvadora al buscar (issue #5)

**Fecha:** 27/10/2026 · **Etapa:** C / estabilización · **Rama:** `fix/estabilizacion-v9-9` · **PR:** [#14](https://github.com/LeviEdition/invierno-en-la-colonia/pull/14), borrador, base `refactor/arquitectura`. **Estado:** implementación y pruebas de regresión remotas aprobadas. Sin fusión a `main`, issue #5 abierto; aún no se realizó revisión crítica *posterior* independiente de este parche.

## Decisión expresa

Tras la revisión crítica de [informe31](31-revision-critica-c7.md), el creador **aprobó C7-R1**: al elegir entre objetos revelados en una búsqueda, la IA debe priorizar una **herramienta cuando adquirirla permita completar en esa ronda una crisis de herramientas**, computando los aportes humanos anteriores y los objetos que ya posee la IA (mano y equipo propio de supervivientes vivos). **Excepción:** una muestra que produce victoria inmediata por el objetivo general prevalece. No se autorizó reordenar aportes de comida, medicina y combustible, ni búsqueda dirigida por localidad, ni modificar la política A de donaciones.

La mejora se limita a la **elección entre cartas ya reveladas** por una búsqueda permitida; no garantiza encontrar una herramienta si el mazo no la ofrece. Si ya se puede completar la crisis sin la nueva carta, o una herramienta extra no alcanza para completarla, se conserva la puntuación habitual del botín. El máximo de aportes y el sacrificio de herramientas siguen definidos por C7.

## Reproducción: precondición → acción → esperado → observado

**H1 del informe31.** Crisis `herramienta` 0/2, IA con linterna equipada y sin otras herramientas; una búsqueda con linterna revela `sample` y `crowbar`.

- **Acción:** `beginSearch(p,'ai')` seguido por la evaluación final `botContributeTools()`.
- **Esperado:** elegir palanca, que junto con linterna alcanza los dos aportes; no obtener la muestra; superar la crisis.
- **Antes:** seleccionaba muestra por 10 puntos frente a 3 de herramienta, devolvía la palanca al mazo y fallaba 0/2.
- **Después:** la palanca recibe prioridad condicional y se completa 2/2; se conserva la muestra en el mazo. No se afecta la obtención inmediata de victoria al seleccionar una muestra final.

**Regresiones antes del parche:** en [commit de tests `5debdbd`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/5debdbd49289b1e464e9df7a8384b6a41f95c0fc), [CI 40575929242](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40575929242) devolvió **305 declaradas, 300 aprobadas, 3 fallidas y 2 TODO**. Las tres fallidas corresponden a la prioridad salvadora en el caso equipado, aporte parcial humano y turno IA integrado; los controles de victoria ya pasaban.

## Cambio implementado

[Commit ejecutable `f1e75ed`](https://github.com/LeviEdition/invierno-en-la-colonia/commit/f1e75edc28a317a3d6745079d19e07558987a10a): modifica solamente el cálculo `score` dentro de la rama IA de `beginSearch()`, conservando los demás puntajes y la búsqueda/consumo/equipamiento existentes.

- **Prioridad 12:** carta `muestra` si incorporarla inmediatamente completa `game.goal`, con `+2` para investigador que aún no utilizó su bono de primera muestra.
- **Prioridad 11:** `herramienta` si `needed>0` y `held+1===needed`, donde `needed` es el faltante después de contribuciones y `held` suma herramientas de la mano y del equipo propio vivo de IA.
- **Puntuación anterior:** para todo el resto, incluida muestra que aún no gana, cuando una sola herramienta revelada no basta o la crisis ya está cubierta.
- **Después de elegir:** `stashLoot()` y `botContributeTools()` siguen con sus propias responsabilidades; se elige una carta y se devuelven las no seleccionadas al mazo. El modo local humano no se modifica.

**Consecuencia explícita:** si muestra y herramienta compiten y la muestra NO permite victoria inmediata, puede elegirse la herramienta que salva la crisis; esa prioridad expresa es la decisión del creador, no una afirmación de optimización estadística.

## Pruebas y evidencia

Se añadieron **ocho regresiones activas** a `tests/ia-turnos.test.mjs`:
1. Linterna equipada + palanca revelada completan crisis; muestra descartada al mazo.
2. Muestra que completa victoria prevalece sobre herramienta salvadora.
3. Victoria por muestra duplicada mediante investigador prevalece.
4. Una herramienta insuficiente no reemplaza preferencia por muestra.
5. Aporte parcial del humano 1/2 + palanca revelada permite completar.
6. Cuando la IA ya posee herramientas suficientes, conserva preferencia por muestra.
7. Crisis de otra categoría conserva puntuación anterior.
8. Integración de `botTurn()`: búsqueda, selección y donación ocurren antes de colonia.

**CI después:** [GitHub Actions 40576075140](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40576075140), `completed/success` con checkout de `f1e75edc28a317a3d6745079d19e07558987a10a`: **305 declaradas, 303 aprobadas, cero fallidas/canceladas/omitidas y 2 TODO** (#4 y #6). Los ocho casos C7-R1 pasan, igual que la regresión C7 y suite anterior.

## Límites y próximo paso

La verificación se basó en suite Node con DOM simulado en CI, no una corrida nueva de Chromium, Android físico, TalkBack o simulación de balance. Las pruebas no cubren todos los cruces de crisis, investigadores, botines, supervivientes y muertes; el motor continúa monolítico. La preferencia de botín no dirige el movimiento hacia zonas con alta probabilidad de herramientas, ni puede encontrar cartas ocultas.

**No se declara C7-R1 completamente revisada ni #5 cerrado por CI verde.** Se recomienda como **único siguiente bloque** una revisión crítica posterior y acotada a C7-R1 para evaluar el orden de prioridades, evitar efectos colaterales en botines y comprobar continuidad de C7, antes de elegir otro issue o considerar integración a `main`.

## Continuidad: revisión posterior de C7-R1 — 27/10/2026

Se realizó la revisión crítica independiente de código por inspección, evidencia CI y cobertura de regresiones registrada en [informe33](33-revision-critica-c7-r1.md). **No se identificaron nuevos defectos dentro del cambio de puntuación aprobado**; H1 está cubierto por ocho regresiones y `gainSample()` verifica la excepción de victoria por investigador. [CI 40576507329](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40576507329) confirmó de nuevo **305 declaradas, 303 aprobadas, 0 fallidas, 2 TODO** sobre el commit auditado de documentación `46564a5`. Sin pruebas dinámicas nuevas, sin parche adicional ni cambio de reglas.

**Reserva:** falta validar en navegador real encrucijadas, pausa/modal y fin de turno porque la suite IA sustituye esos componentes. Se mantiene #5 abierto, PR #14 en borrador y `main` intacta. Próximo bloque único: smoke test manual de C7/C7-R1 con juego real antes de una eventual decisión de cierre o integración.
