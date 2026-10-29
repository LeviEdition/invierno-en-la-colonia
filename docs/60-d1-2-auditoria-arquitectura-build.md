# 60 — D1.2: auditoría independiente de arquitectura y sistema de construcción (SIN IMPLEMENTACIÓN)

**Fecha:** 28/10/2026. **Autorización del creador:** evaluar formalmente la organización en archivos y comparar el ensamblador actual con arquitectura de módulos y una construcción estándar, antes de nuevas extracciones. **Esta etapa es de análisis, no autoriza modificar motor/build/test, fusionar PR o publicar.**
**Instantánea de partida:** `main` = `0b75d01aba013cd029d9d0dd0bdbd20791be15fc`; `refactor/d1-catalogo` = `0876e65b68f873164345ee4e9c98bb26a6cb0708`, al iniciar la auditoría. Los cambios documentales posteriores avanzan solo la rama D1.

## 1. Hechos verificables sobre el código

- `src/item-catalog.mjs` ya contiene la clase `ItemCatalog` y sus datos, importable en Node sin `game` ni DOM. Inyección del mezclador en el constructor. **Esta extracción es útil y no debe revertirse.**
- `src/invierno.template.html` todavía contiene unas **156.656 unidades UTF-16 de texto**, de las cuales el contenido del script principal representa aprox. **100.386**; `invierno_colonia_v9_9.html` generado tiene aprox. **161.531**. Los tamaños son caracteres de texto medidos al leer los archivos, **no bytes comprimidos ni métricas de rendimiento**.
- La plantilla tiene un único `<script>` y **52 apariciones de `onclick=`**, incluidas las insertadas como cadenas en el render; también una `onchange=`. Varias acciones dependen de símbolos visibles en el contexto global del script clásico: `startGame`, `search`, `show`, `chooseLoot`, `paint`, `game`, etc. El número es conteo de fragmentos de fuente, no cantidad garantizada de botones montados simultáneamente.
- `scripts/build-game.mjs` **no realiza bundling**: sustituye un marcador textual de la plantilla por `src/item-catalog.mjs` después de cambiar literalmente la firma `export class ItemCatalog {` y crea `const catalog=new ItemCatalog(cards=>mix(cards));`. El resultado es autocontenido y se comprueba byte a byte mediante `npm run check:build`, pero el procedimiento es frágil ante cambios de sintaxis, nombres o nuevos imports.
- `package.json` no introduce dependencias externas de compilación. El CI comprueba `check:build` y ejecuta `npm test`; `main` no ha recibido los cambios D1.
- Auditoría de D1.0 detectó **15 de 19** archivos de pruebas que extraen scripts del HTML y **14 de 19** que afirman tener exactamente un script embebido. `test-support/game-fixture.mjs` ejecuta script clásico mediante `vm.runInContext` y elimina arranque del DOM con regex; esta adaptación también está acoplada al formato monolítico. Pasar a un bundle con IIFE/ESM requerirá migrar adaptadores, no solo el HTML.
- Evidencia **anterior** a esta auditoría (no ejecutar ni atribuir como pruebas nuevas): [Node D1.1 40721061387](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40721061387), 433/433; [Chromium D1.1 40720568450](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40720568450), 5/5 partidas completas, C16 3/3, HTML `file://` en ambos modos; 0 errores JS/invariantes reportadas en esos recorridos.

## 2. Alternativas examinadas

| Estrategia | Fortalezas | Problemas y costo de migración | Dictamen |
| --- | --- | --- | --- |
| **A. Mantener ensamblador textual** actual | Sin dependencias, un HTML offline y 433 pruebas compatibles; simple para una sola clase | Frágil ante exports/imports, dependencias y orden de carga; fomenta más lógica monolítica; duplicación fuente/artefacto | **Conservar provisionalmente**, no expandir como arquitectura final |
| **B. ES modules sin empaquetador** | Imports explícitos; desarrollo simple en servidor | `file://` y módulos locales requieren validación por navegador; distribución de múltiples archivos; handlers inline pierden acceso a funciones de ámbito de módulo; fixtures fallan | **No adoptar directamente** |
| **C. ES modules + esbuild (bundle IIFE)** | Imports reales; empaquetado pequeño, rápido, sin framework UI; puede incrustarse bundle en HTML único; inyección de dependencias | La salida IIFE encierra símbolos y no mantiene handlers globales automáticamente. Requiere puente de UI explícito o eventos `addEventListener`, migración de fixtures y CI; dependencia de compilación; no es reemplazo instantáneo | **Recomendado como experimento acotado (spike)** |
| **D. Vite + plugin de archivo único** | DX de app web, gestor de assets, dev-server y estructura ESM; plugin `vite-plugin-singlefile` permite HTML offline | Mayor toolchain y plugin externo; Vite usa `index.html` como entrada, migración de handlers/fixtures igualmente obligatoria; plugin tiene limitaciones para recursos públicos, rutas y chunks; más piezas de mantenimiento | **Candidato si la UI/recursos crecen**, no opción obligada para D1 actual |

**Fundamento externo verificado:** esbuild documenta `bundle`, formatos `iife`/ESM y la encapsulación de variables top-level en `iife` (<https://esbuild.github.io/api/>, <https://esbuild.github.io/faq/>); Vite usa HTML como entrada de aplicación y transforma rutas/recursos durante build (<https://vite.dev/guide/>, <https://vite.dev/guide/build>); `vite-plugin-singlefile` integra JS/CSS en un HTML, pero declara límites de assets y rutas (<https://www.npmjs.com/package/vite-plugin-singlefile>). **No se instalaron ni ejecutaron estas herramientas en el proyecto, por lo que el dictamen no equivale a un PoC verificado.**

## 3. Criterio de elección propuesto

**No revertir D1.1, no escoger Vite por anticipado, no masificar extractores textuales.** El costo decisivo no es el paquete de build: son los contratos implícitos con HTML, funciones globales, eventos y los 14 fixtures. El candidato con menor complejidad inicial es **esbuild como PoC descartable en la rama D1**, pero solo se adoptaría después de demostrar que:
1. `import/export` reales y ensamblado funcionan y el HTML final sigue autocontenido/operativo por `file://`.
2. La API de eventos expuesta para la UI es explícita y mínima. **No** exponer todos los detalles de `game` en `window` para simular el pasado.
3. Las pruebas del motor se vuelven menos dependientes de extraer texto de `<script>` del HTML, sin rebajar aserciones ni omitir fallos. Algunos smoke tests pueden seguir evaluando el artefacto final.
4. La generación tiene entradas claras, orden determinista, lockfile y reproducibilidad `npm ci`; CI sigue verificando artefacto y regresiones.
5. La migración se hace por adaptadores pequeños con comparaciones antes/después y rollback sencillo. No mover IA/turnos/eventos narrativos simultáneamente.

Si el PoC es desproporcionado o rompe demasiados contratos, **seguir con el build actual temporalmente** y migrar primero los adaptadores de test/interfaz. Vite tendría sentido después de evidencia de necesidad: interfaz 2D con assets, depuración/hot reload y despliegue web más complejo, no por prestigio del framework.

## 4. Arquitectura objetivo razonable (NO crear carpetas vacías)

- `src/domain/`: catálogos, entidades, acciones puras y estado/validaciones del mundo; **sin DOM, jugador IA ni narrador como dependencia obligatoria**.
- `src/application/`: orquestación de comandos, rondas y puertos de RNG/efectos; el estado del juego es el contrato compartido.
- `src/presentation/`: render, modales, entrada del usuario y suscripción a cambios; sin mutar reglas durante el render.
- `src/narrative/` solo cuando exista primer prototipo aprobado: hechos, memoria persistente, desencadenantes y consecuencias diferidas; el Director emite intenciones/eventos y el motor aplica transiciones.
- `src/agents/` opcional: políticas de IA como clientes del mismo motor de comandos, **no un segundo bando obligatorio**.
- `tests/` unitarios puros, contratos de integración, pruebas de UI y de artefacto distribuible.

Estos nombres son **propuesta de límites**, no obligación de crear un archivo por clase ni recrear hoy el futuro Director. La identidad final singleplayer exige que reglas/estado no dependan de dos bandos fijos; la IA aliada actual queda como compatibilidad hasta que haya un rediseño autorizado.

## 5. Plan de migración de riesgo contenido (propuesto; no autorizado como código)

**D1.2a — PoC de empaquetado, aislado:** crear una rama o commits identificables dentro de `refactor/d1-catalogo`, sin tocar `main`. Probar bundling esbuild con el catálogo y un pequeño punto de entrada, sin modificar las reglas. Medir complejidad y diffs, ensayar `file://` y servidor HTTP, registrar decisiones. No fusionar.

**D1.2b — Contrato UI/fixtures:** enumerar handlers de atributos `onclick/onchange`; diseñar `window.GameUI` (provisional) o registro de eventos, con compatibilidad acotada. Adaptar **primero** cargador compartido de pruebas para ejecutar fuente/bundle, sin reemplazar la suite completa; mantener casos que verifican un HTML autocontenido.

**D1.2c — Compuertas:** caracterización D1.0 (17 cartas/6×20/semillas/orden RNG), **433/433** de base como mínimo, pruebas nuevas, C14 cinco partidas, C16 tres resoluciones, `file://` en local/IA, 0 `pageerror`, no alteraciones narrativas ni mecánicas; salida reproducible en CI. Si una migración exige relajar las aserciones, **rechazarla y documentar el bloqueo**.

**D1.2d — Decisión independiente:** conservar script/build actual o adoptar bundler demostrado, con costo real, reporte de diffs, tests y rollback. Solo entonces planificar siguientes extracciones, y con autorización separada futura evaluar integración hacia `main`.

## 6. Riesgos y autocrítica

- **Alto:** una IIFE/ESM no hace visibles automáticamente `startGame/search/show` a los atributos `onclick`. Más herramientas no solucionan el acoplamiento por sí mismas.
- **Alto:** romper los 14 fixtures al cambiar el formato de script puede simular una regresión falsa; adaptar tests sin perder cobertura es una tarea sustantiva.
- **Alto:** necesidad futura singleplayer: extraer sin pensar en estado/acciones puede perpetuar dependencias `humans/bots`; impedir nuevas dependencias de ese tipo en módulos de dominio.
- **Medio:** mantener fuente + artefacto generado duplica texto en Git; **el build check mitiga divergencia, no el costo de revisión ni errores semánticos**.
- **Medio:** múltiples dependencias de empaquetado (Vite + plugin) aportan mantenimiento; se justifican por necesidades comprobadas.
- **Medio:** conservar compatibilidad del archivo `file://` es una **preferencia útil actual, no un requisito eterno del producto**; la posibilidad futura de aplicación web y sincronización online puede cambiar la distribución.

**Autocrítica:** D1.1 resolvió correctamente una separación local, pero priorizó la compatibilidad con el HTML único sin evaluar formalmente la arquitectura del proyecto completo. El ensamblador textual fue útil como puente; extenderlo sin límite sería una decisión técnicamente pobre.

## Dictamen

**D1.2 AUDITORÍA FINALIZADA: ACEPTAR D1.1 COMO PASO TRANSITORIO Y POSPONER SU MERGE A `main` HASTA RESOLVER LA ELECCIÓN DE BUILD.** Recomendar **PoC pequeño de esbuild antes de extraer un segundo módulo**; no adoptar esbuild, Vite ni módulos de UI sin pruebas y comparación. Es razonable que el PoC termine en descarte si los costos son superiores al beneficio.

**Única próxima tarea a autorizar expresamente:** D1.2a — PoC comparativo y reversible de bundling con esbuild, todavía sin rediseñar reglas, sin merge a `main`, sin D2/F/E y con informe de viabilidad. `main` no se modificó por esta auditoría.


## Seguimiento D1.2a — 29/10/2026

El creador autorizó el PoC acotado y exigió detenerse antes de D1.2b. [Informe65](65-d1-2a-experimento-esbuild.md): rama experimental desde ba9a423, referencia intacta, ESM/IIFE solo catálogo,439/439 referencia y438/439 candidato por una aserción de forma preservada.40 partidas de motor comparadas, cinco UI y tres tamaños; file local bloqueado en ambas variantes, pero4/4 aperturas offline aprobadas en CI181903c. Referencia439/439 CI verde; PoC438/439 deja CI rojo; navegador5UI/3viewports aprobado. La recomendación de esta auditoría era una propuesta, no permiso para migrar UI/fixtures completos; no se hizo esa migración. No adoptar ni fusionar por el resultado parcial.
