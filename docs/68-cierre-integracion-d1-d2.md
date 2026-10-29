# 68 — Auditoría final de integración D1/D2

Fecha:29/10/2026 (America/Montevideo). Encargo del creador: auditar la entrega y preparar integración hacia main, **sin abrir ni fusionar PR**, sin tags/releases y sin arquitectura adicional para singleplayer. No continuar perfeccionamiento genérico; corregir solo bloqueos reproducibles, documentar mejoras/deuda aceptada.

## Estado inicial

Árbol limpio, rama `refactor/d1-d2-arquitectura` en`ee73d29b3285a186b805f5def4c07dd28d4a3ef9`. Remoto confirma main`0b75d01aba013cd029d9d0dd0bdbd20791be15fc`, rama técnica sin cambios y D1 original`ba9a423`. Se leyeron18,60,62,67. Diff:70 archivos contra57872ee (bloques D2/adopción);104 contra main (incluye D1.0/D1.1, experimentos y documentación histórica). El HTML entre main y57872ee solo cambia inyección de mezclador del catálogo:6 líneas añadidas/4 retiradas, sin otra regla modificada. Se comprobará comportamiento contra el oráculo y directamente con main.

## Hallazgos iniciales (pendientes de corregir/verificar)

| ID | Clasificación | Reproducción y efecto | Tratamiento |
| --- | --- | --- | --- |
| B1 | Bloqueante | `Object.getPrototypeOf(view.controls).group.call(view.controls)` devuelve el grupo real; escribir wounds=2 modifica snapshot sin comando. | Fachada de consultas de controles, sin prototipo del controlador real; prueba roja→verde. |
| B2 | Bloqueante | `view.crossroadsDeck.find(...rescate de la plaza...).choices[0][2](view.game)` recluta de3 a4 sin resolver carta. | Entregar datos de presentación y elegibilidad calculada por reglas, sin callbacks; prueba roja→verde. |
| F1 | Mejora futura | Contexto interno amplio y enlaces vivos de compatibilidad. | Conservar; no ampliar refactor. |
| H1 | Deuda heredada aceptada | Paquete V9.9 representa dos grupos, turnos y objetivos actuales. | No cambiar; adaptación singleplayer solo cuando su funcionalidad esté autorizada. |
| H2 | Deuda heredada aceptada | VM en fixtures históricos; emulación no sustituye Android físico/TalkBack/otros navegadores. | Conservar pruebas y declarar límites. |

No se afirma cierre ni aprobación mientras haya bloqueos o validaciones pendientes. Cada corrección tendrá commit separado. Las recomendaciones finales, pruebas por SHA y propuesta de PR se registrarán al terminar.

## Corrección B1

La prueba nueva falla enee73d29 porque no se rechaza la escritura a través del prototipo. La corrección entrega una fachada congelada de consultas (side/local/interactive/group/hand/dice/display), sin el prototipo del controlador interno. Las consultas siguen siendo vivas y conservan identidad de actores; sus resultados permanecen protegidos incluso al invocarlas mediante descriptores. No se reescribe el motor ni se cambia la representación del estado.

Rojo→verde dirigido:1/1. Baseline reejecutada462/462 y npm ci/check:build aprobados. Suite tras B1:463/463,0 fallos/omisiones/cancelaciones; build reproducible. B2 aún bloquea el cierre; pendientes gates completos sobre implementación final.

## Corrección B2

Dos pruebas nuevas rojas: se podía reclutar sin comando y no existía una proyección de presentación segura. Se retiran crossroadsDeck/crossOptionAllowed de las capacidades de la vista; el motor ofrece crossroadsView con textos, cantidad de historias y opciones permitidas calculadas por las mismas reglas reales. Los callbacks originales permanecen privados e intactos. La IA y los fixtures QA siguen usando sus entradas internas autorizadas; el renderer recibe únicamente los datos que dibuja.

Dirigidas B1/B2:3/3 verdes. Suite465/465,0 fallos/omisiones/cancelaciones; check:build y diffcheck aprobados. Prueba de elegibilidad demuestra comida1→opción de provisiones no disponible y comida3→disponible, sin consumir RNG ni modificar estado. No se introdujo un sistema narrativo ni cambió efecto alguno de carta. Pendiente validación integral en navegador y por SHA.

## Hallazgo B3 — construcción fallida deja listeners

**Bloqueante de ciclo de vida confirmado:** el segundo createApplication sobre el mismo documento lanza «ya están conectados» pero deja6 listeners visuales:16 en vez de10. También una inicialización que falla después de conectar deja los10 listeners yel registro marcado, impidiendo reconexión limpia. Dos pruebas rojas reproducen ambos defectos.

La corrección limpia únicamente recursos instalados por el intento fallido (sus listeners y, si llegó a instalarlo, su registro de comandos); no desconecta la aplicación anterior. Tests de ciclo3/3 verdes, suite467/467 ybuild reproducible. Sin cambio de reglas ni de flujo exitoso. B1/B2/B3 cerrados en implementación; faltan validaciones finales ydictamen.
