# 96 — Capacidades exteriores e inventario desde el mapa

La distribución visual de de4d1c8 fue aceptada expresamente. Misma rama/PR25 draft; remoto/local limpios y CI43439050557 success verificados. Sin cambios posteriores al iniciar. No se modifica el fondo, las posiciones, las escalas ni la distribución aceptada.

## Bloque1 — capacidades verificadas

`config/horizontal-capacities.json` define los33 accesos: colonia12, supermercado/hospital/comisaría/escuela4, gasolinera2 y biblioteca3. El host horizontal y la configuración de presentación usan esa fuente; la construcción rechaza una geometría con otra cantidad de casillas. Las plazas de supervivientes conservan12/4. El host de acciones y la referencia estable conservan sus datos12/4; el HTML estable sigue reproducible y sin cambios.

Auditoría de reglas: incorporación de zombis, accesos libres, constructor, barricadas pagadas, hacha/manual, atracción, encrucijadas, oleadas, consultas, proyección e IA usan `zcap`/`openAccess`; no se sustituyen sus resoluciones. A saturación, un zombi rompe una barricada si existe; sin ella, se mantiene la selección de víctima y consecuencias originales. No se elimina un zombi existente.

No hay persistencia de partidas, importador ni API de restauración: `snapshot` solo consulta; reconectar recupera la misma instancia viva. Recargar el host requiere preparar otra partida. Los estados anteriores incompatibles que se proyecten conservan todos los conteos, libres negativos y aviso de excedentes; no hay truncamiento ni desbordamiento retroactivo. Las nuevas incorporaciones siguen la regla de saturación con la capacidad vigente. Una futura importación requerirá una política explícita, fuera de este encargo.

Verificación previa a inventario:655/655, tres regresiones nuevas sobre las siete localidades, pureza/rechazo sin coste, mezcla llena, incorporación, barricada y desbordamiento. HTML estable reproducible. Chromium1365×768/852×393: gasolinera1Z+1B y biblioteca2Z+1B, libres0 y capacidad compartida exacta. Escenarios controlados en motor real, móvil emulado.

## Bloque2 — auditoría inicial

V9.9 permite usar comida, medicina, tratamiento térmico, muestras, manuales, notas, rescates recuperados y combustible contextual; equipar armas/herramientas y transferir equipo a un superviviente de la misma localidad según las condiciones del motor. Retirar equipo a la mano y sustituirlo directamente no existen: `unequipItem` solo informa que debe transferirse. El intercambio entre jugadores queda fuera de este flujo. La implementación reutilizará estas operaciones, con confirmación y revalidación.
