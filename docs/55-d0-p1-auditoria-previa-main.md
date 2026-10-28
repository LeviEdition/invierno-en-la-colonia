# 55 — D0-P1: auditoría independiente de PR #1 hacia main (SIN MERGE)

**Fecha:** 28/10/2026. **Alcance autorizado:** auditorías correspondientes para preparar integración de PR; esta revisión es diagnóstico y preparación, sin autorización expresa inequívoca de fusionar PR1 a `main`. Se mantiene `main` intacta.

## Estado contrastado

- [PR #1](https://github.com/LeviEdition/invierno-en-la-colonia/pull/1): `refactor/arquitectura` → `main`, abierto/borrador, `mergeable=true`.
- Base `main`: `d9068f4aa8d3a10bbbf1e0a8a2527744cc6952cb`.
- Cabeza auditada `refactor/arquitectura`: `aa191fe5dbef5145f73b9f0cc894187452285baf`.
- GitHub compare: **ahead 251 / behind 0**, **125 archivos modificados** y 251 commits. No se detectan conflictos Git al consultar; no es prueba del resultado de un merge.
- `invierno_colonia_v9_9.html`: +452/−182 líneas; blob de la cabeza `d192afb43ab216d0b63ed49fd24f1d830d03f4e7`; blob en `main` `4ebaedad13d63c7a6762c524a52c0dd9695687b1`. El cambio ejecutable no es una refactorización estructural: se conserva HTML monolítico.
- Se revisó comparación por archivo, índice y patches del PR (125); incluyen documentación A/B/C/D0, pruebas, utilidades de navegador, workflow CI y HTML principal. En PR14 se había revisado en detalle la superficie ejecutable de C; no se rehicieron todos los 251 commits individualmente aquí.

## Evidencia de calidad vigente

- [CI del merge PR14, 40709698250](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40709698250): comprobados logs **408/408, 0 fallos/skip/TODO**.
- [Chromium D0-I-V 40711789374](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40711789374): **5/5 partidas completas** (dos IA, tres local), C16 **3/3 viewports** para foco/pase/muerte/sucesión, sin errores JS ni violaciones de invariantes. Evidencia [artifact 12827075968](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40711789374/artifacts/12827075968).
- [CI 40712244509](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40712244509) y [40712251185](https://github.com/LeviEdition/invierno-en-la-colonia/actions/runs/40712251185) constan `completed/success` para la cabeza auditada. El workflow regular corre `npm test`, no Chromium.
- Primera corrida específica de browser falló por contrato **obsoleto** de C15 (esperaba una fuga de foco corregida en C16). El runner posterior omitió ese script, **no** es lícito declarar que toda la batería C15 browser está aprobada.
- La descripción de PR1 está **obsoleta**: dice 238 pruebas, 3 TODO, A5/A6 aún abiertas, ningún cambio de reglas/código. Debe reemplazarse con la evidencia real antes de una posible fusión.

## Riesgos / puertas de promoción

1. **Integración de gran alcance:** PR1 equivale a promover el historial entero de auditoría/estabilización, no únicamente PR14 y no una arquitectura modular.
2. **Sin conflictos declarados ≠ merge verificado:** con aprobación expresa, fijar SHA de cabeza, integrar a `main` con método revisable, comprobar nuevo SHA de `main` y volver a ejecutar Node **sobre ese SHA**, además de recorrido Chromium para los dos modos.
3. **Alcance de pruebas:** automatización con semillas y controles no equivale a playtesting humano; Android físico, TalkBack, otros navegadores, rendimiento y balance no certificados. Debe decidirse si esas reservas son bloqueantes para denominación «estable pública» aunque no impidan la mera integración técnica.
4. **No confundir con rediseño:** decisiones F-01/F-10/F-12/F-14/F-15 y Director singleplayer todavía son diseños pendientes, no defectos que deban mezclarse con promoción.
5. **Higiene del PR:** actualizar descripción y título si corresponde; registrar que C1–C16 cerró, PR14 fue fusionado y D0-I-V pasó. No interpretar estado draft como autorización para promoción.

## Dictamen

**APTO PARA PROPONER INTEGRACIÓN CONTROLADA DE PR1 A `main`, CON RESERVAS Y CON APROBACIÓN EXPRESA APARTE.** No existe conflicto Git informado ni fallo automatizado vigente demostrado. La batería de navegador y regresión cubre casos representativos, no certifica exhaustividad ni Android físico. No publicar release ni declarar estabilidad universal de dispositivos.

**ÚNICA SIGUIENTE TAREA:** D0-P1-I, tras autorización expresa: refrescar PR1, inspeccionar SHA/diff final, cambiar draft a ready si GitHub lo exige, fusionar solo PR1 → `main` con control de SHA, probar CI 408/408 en destino y Chromium representativo, registrar evidencia y definir promoción/versión estable separadamente. No comenzar D1 ni F en el mismo lote.

**Acciones realizadas en esta auditoría:** lectura de PR1, compare de ambas ramas, patches, blobs HTML, workflow y estado de Actions; emisión del presente dictamen. Ninguna fusión, cambios de motor, tags ni releases.
