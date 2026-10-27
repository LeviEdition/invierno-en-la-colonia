# 24 — A6: cierre de auditoría V9.9 y lista priorizada de defectos

**Fecha:** 27/10/2026. **Estado:** A6 **cerrada con reservas explícitas**, para iniciar estabilización; no equivale a certificación total ni a corrección de defectos. No hay cambios en V9.9 estable.

## Evidencia disponible y criterio de cierre

- **Fuente auditada:** `invierno_colonia_v9_9.html`, SHA blob `4ebaedad13d63c7a6762c524a52c0dd9695687b1`, idéntico en `main` y `refactor/arquitectura`.
- **Pruebas de caracterización Node:** **238 aprobadas, 0 fallidas, 3 TODO** (241 declaradas), [CI](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40535133447). Todas las pruebas que describen el bug **esperan el comportamiento actual defectuoso**; cuando se corrija, hay que actualizar esas pruebas a expectativas correctas.
- **Interfaz:** [A5-01](22-auditoria-navegador-a5.md) cubrió Chromium real y emulación táctil en cuatro tamaños; no encontró errores JS en recorridos elegidos ni desbordamiento horizontal total, y encontró dos fallas de accesibilidad/usabilidad.
- **Confirmación de usuario:** el jugador informa haber utilizado **esta versión varias veces y con funcionamiento generalmente bueno**. Esto es una observación de experiencia real, **sin registro de dispositivo, checklist A5-02 ni evidencia de pruebas específicas**; no se presenta como A5-02 completada.
- **Reserva de auditoría aceptada para seguir:** A5-02 en Android físico estructurado, TalkBack/teclado, medición de rendimiento, pruebas con azar natural y balance continúan **pendientes**. El usuario autorizó expresamente continuar en vez de detener la ingeniería por esas comprobaciones.
- **Inventario funcional:** [21 subsistemas](04-matriz-auditoria-funcional.md); existen pruebas de inicio, turnos, dados, movimientos, lesiones, muerte, búsquedas, consumibles, equipo, habilidades, barricadas, colonia, crisis, encrucijadas, IA, modo local, finales, modales e interfaz. Persistencia, juego online y narrativa persistente son objetivos **futuros**, no faltas de cobertura de V9.9.

**Decisión de proceso:** cerrar **A6 documental** con alcance y riesgos registrados, pasar a **B (clasificación/decisión) y luego C (correcciones pequeñas)**. No declarar «A5-02 aprobada» ni «100 % auditado».

## Lista de incidencias y prioridad propuesta

La prioridad es una **recomendación técnica basada en impacto y confianza**, no una orden de implementar todo junto.

| Orden | Issue | Problema | Clase | Prioridad | Decisión antes de corregir |
|---:|---|---|---|---|---|
| 1 | [#11](https://github.com/LeviEdition/invierno-en-la-colonia/issues/11) | IA obtiene todas las muestras, pero puede perder por moral antes de verificar | **Bug confirmado de consistencia de finales** | **P0 / alta** | Evaluar victoria cuando se consigue el objetivo, de forma simétrica para humano e IA |
| 2 | [#2](https://github.com/LeviEdition/invierno-en-la-colonia/issues/2) | Encrucijadas ignoran cartas de medicina, combustible o herramienta que realmente existen en la mano | **Bug confirmado de funcionalidad** | **P1 / alta** | Validar cartas estructuradas por tipo y consumir exactamente una copia válida |
| 3 | [#3](https://github.com/LeviEdition/invierno-en-la-colonia/issues/3) | J2 no puede mejorar dados si J1 no tiene | **Bug confirmado de equidad entre jugadores** | **P1 / alta** | Validar reserva de dados activa (`actionDice()`) |
| 4 | [#12](https://github.com/LeviEdition/invierno-en-la-colonia/issues/12) | Teclado sale de diálogo inicial o pase hacia tablero | **Bug confirmado de accesibilidad** | **P1 / media-alta** | Enfocar modal y aislar elementos de fondo; comprobar Tab y Enter en Chromium |
| 5 | [#8](https://github.com/LeviEdition/invierno-en-la-colonia/issues/8) | `finishTurn()` puede saltarse pase al llamarla directamente | **Defensa interna faltante** | **P2 / media** | Guardias centralizadas de transición de turno; no impedir control legítimo |
| 6 | [#10](https://github.com/LeviEdition/invierno-en-la-colonia/issues/10) | `finishTurn()` avanza con diálogo de muerte visible por llamada interna | **Defensa interna faltante** | **P2 / media** | Mismo contrato de transición; verificar diálogo y cola de muerte |
| 7 | [#9](https://github.com/LeviEdition/invierno-en-la-colonia/issues/9) | `playItem()` acepta llamada interna durante curación pendiente | **Defensa interna faltante** | **P2 / media** | Definir comandos permitidos durante elecciones y bloquear los demás |
| 8 | [#5](https://github.com/LeviEdition/invierno-en-la-colonia/issues/5) | IA no considera herramientas ya equipadas al donar a crisis | **Defecto estratégico** | **P2 / media** | Especificar prioridad equipar vs donar antes de cambiar IA |
| 9 | [#6](https://github.com/LeviEdition/invierno-en-la-colonia/issues/6) | J1 y J2 bloquean la selección inicial de líder en momentos distintos | **Inconsistencia confirmada; norma por decidir** | **P2 / media** | ¿Primera acción congela líder de ambos o se puede elegir durante primera ronda? |
| 10 | [#13](https://github.com/LeviEdition/invierno-en-la-colonia/issues/13) | Botones de dado de 26×25 px | **Problema confirmado de ergonomía móvil** | **P2 / media** | Ampliar hitbox táctil y medir layout en 320 px / 393 px |
| 11 | [#7](https://github.com/LeviEdition/invierno-en-la-colonia/issues/7) | IA decide encrucijadas con expresiones del texto narrativo | **Diseño frágil, falla reproducible** | **P3 / diferible** | Opciones con consecuencias estructuradas y política de IA después de arquitectura |
| 12 | [#4](https://github.com/LeviEdition/invierno-en-la-colonia/issues/4) | Se pueden transferir objetos al otro grupo | **Regla ambigüa; no clasificar como bug aún** | **Decisión pendiente** | Transferencias entre grupos permitidas o prohibidas; requiere decisión explícita del creador |

### Lo que NO se debe hacer

- No «arreglar» **#4** o **#6** inventando reglas. Primero consultar la intención de diseño.
- No modificar `main` ni fusionar PR de auditoría sin revisión.
- No rediseñar IA narrativa (#7) dentro de un hotfix de búsqueda/objetos.
- No interpretar 0 tests fallidos como ausencia de defectos: buena parte de la suite documenta comportamientos erróneos.
- No dar por terminada validación móvil física o accesibilidad completa a partir de emulación.

## Plan de corrección y compuertas

**B1 — Decisiones seguras sin ambigüedad:** se autoriza iniciar prototipos para #11, #2 y #3 porque su resultado esperado está objetivamente fundamentado. Mantener la consulta para #4 y #6. Priorización: #11 primero.

**C1 — Primera corrección, #11:**
1. Trabajar en una **rama de estabilización distinta**, nacida de `refactor/arquitectura`.
2. Mantener el archivo V9.9 estable **sin cambios en `main` ni en la rama de auditoría**; documentar el parche por commit y PR en borrador.
3. Cambiar solo los puntos donde se valida el progreso de muestras; añadir/actualizar regresiones de humano e IA.
4. Ejecutar `npm test` con todas las pruebas y comprobar GitHub Actions.
5. Verificar victoria con faltante de comida y comparar con derrota por moral antes de la victoria.
6. No empezar el siguiente bug hasta documentar el resultado del primero.

**C2/C3 posteriores:** #2 y #3, cada uno en cambio pequeño con pruebas. Después continuar según prioridades y decisiones humanas.

**Criterio para declarar estabilizado:** todos los defectos priorizados acordados quedan corregidos, suite verde, navegador real revisado, y cualquier excepción restante se declara. **No promover el código reparado como versión estable hasta aprobación.**

## Hoja de ruta resultante

**A6 (cierre técnico-documental)** → **B1 (prioridad y criterios)** → **C1 (#11)** → C2 (#2) → C3 (#3) → demás ajustes por prioridad → D (refactor de motor) → E (narrativa persistente).

**Nota de rigor:** la auditoría A ha acabado **a efectos de avanzar al desarrollo** por decisión del creador y con reservas registradas; cualquier defecto nuevo encontrado en pruebas posteriores reabre la incidencia concreta, no obliga a repetir la auditoría completa.
