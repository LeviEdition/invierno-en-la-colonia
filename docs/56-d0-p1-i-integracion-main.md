# 56 — D0-P1-I: integración y validación posterior de PR #1 en main

**Fecha:** 28/10/2026. **Autorización expresa:** el creador autorizó actualizar PR1, fijar SHA, fusionar exclusivamente en `main`, ejecutar Node + Chromium y documentar; prohibió releases, D1 y cambios F.

## Operación y trazabilidad
- [PR #1](https://github.com/LeviEdition/invierno-en-la-colonia/pull/1) actualizado desde descripción antigua (238 tests/etapa A) a estado vigente de C1–C16, CI y reservas.
- Origen `refactor/arquitectura` pre-merge: `fe901a57da22650330f5bc96b98e9b538f2e34b2`; destino `main` pre-merge: `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb`. Se confirmó base y cabeza antes de operar.
- PR1 pasó de borrador a listo para revisión; fusionado mediante **merge commit**, no rebase ni force-push.
- **SHA de fusión de PR1 en main:** `96e2b6c3dd19d5f11846820e51948af245c99e71`.
- Se ajustó exclusivamente el workflow `.github/workflows/d0-i-v-chromium.yml` para incluir eventos push a `main`, generando `58d3c8acf0b792c34d5317db725635495fbf5863`. No se modificó el HTML, sus reglas ni pruebas de motor.

## Validaciones posteriores
- [GitHub Actions 40713073359](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40713073359), **SHA exacto de integración `96e2b6c3`**: `completed/success`. Logs del job 122903287438: **408/408 aprobadas, cero fallos, cero canceladas, cero omitidas, cero TODO**.
- [Chromium 40713131565](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40713131565), SHA `58d3c8acf` sobre `main`, HTML sin alteraciones desde merge: `completed/success`. C16: **3/3 tamaños** (320×640, 393×852, 1365×768) para setup, ayuda, pase, fallecimiento, confinamiento y retorno de foco, sucesión; **0 pageerrors**.
- C14 Chromium automatizado: **5/5 partidas completas**, cero excepciones, cero violaciones de invariantes, cero interrupciones: IA victoria ronda 4, IA derrota moral ronda 6; local victoria ronda 2, derrota moral ronda 4, victoria ronda 3. Estados finales sin decisiones pendientes.
- [Artifact Chromium 12825993763](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40713131565/artifacts/12825993763): archivos de evidencia y capturas.

## Evaluación crítica y límites
- **Integración técnica D0-P1-I completada y verificada en su alcance.** No es certificación de calidad universal ni cumplimiento fiel del reglamento original.
- Persisten reservas Android físico, TalkBack, Safari/Firefox y pruebas de balance humano.
- El script histórico `check-c15-terminal-browser.mjs` exige reproducir una fuga de foco que C16 corrigió, por lo que no forma parte del gate Chromium vigente. Las verificaciones terminales Node sí están incluidas.
- Se utilizó Chromium real dentro de GitHub Actions porque el contenedor local no lograba descargar el repositorio; no declarar test físico ni browser local.
- **Sin release/tag/publicación, D1 ni cambios F.** El futuro singleplayer con Director de Juego tampoco se implementó.

## Dictamen y siguiente tarea única
**D0-P1-I CERRADA** con validación automatizada Node + Chromium y reservas explícitas. `main` ahora contiene V9.9 estabilizada como referencia técnica, aunque la arquitectura sigue siendo HTML monolítico.

**ÚNICA PRÓXIMA TAREA PROPUESTA:** definir y autorizar la puerta de trabajo posterior a la promoción (D1, primer módulo de bajo acoplamiento, sugerido catálogo de objetos), manteniendo aparte cualquier rediseño F y Director de Juego. No iniciar implementación sin decisión del creador.
