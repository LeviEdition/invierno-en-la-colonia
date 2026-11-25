# 124 — Fichas del hito de contenido: plantel, objetos, inventario y reacciones

23/11/2026. Decisiones del creador para migrar al motor el plantel de 31 supervivientes (`Supervivientes.xlsx`) y el catálogo de objetos (`Items_IEC.xlsx`), detrás de una bandera de prueba y con el oráculo V9.9 en 40/40. Nada de esto está implementado todavía.

**Fuentes de verdad:**
- Las **cartas de personaje** son la referencia; la planilla se ajustó a ellas (23/11): Ataque/Búsqueda de 10 supervivientes, textos de Tiza y Mara («Yo te cubro», en su misma localidad). Las habilidades de las cartas están aprobadas.
- Las **muestras** son una capa por campaña: la hoja «Muestras por campaña» de `Items_IEC.xlsx` (9, 12 y 15 cartas de Muestra biológica para objetivos de 5, 7 y 9 muestras), sumadas a los mazos base de 20 solo en esas campañas.
- Lo que el texto de una carta no resuelva y no esté acá **se pregunta al creador**; no se decide al implementar.

**Entregas previstas:**
1. Plantel de 31, grupo inicial, reglas generales (tandas 1 y 2, regla 9) y reacciones.
2. Objetos, encuentros, muestras, inventario nuevo y carta al pasar el mouse.

## Tanda 1 (23/11)

1. **Congelación = herida común a efectos de muerte.** Heridas y congelaciones suman al mismo contador. Con 2 heridas, 1 congelación lo mata (3). Aplica a Tiza igual que a todos. (Iván: su límite es 4 combinado, según su carta.)
2. **Tiza corta la propagación.** Si muerden a alguien y Tiza es la siguiente en recibir la mordedura por propagación, sufre solo 1 herida común y la propagación termina ahí. Si muerden a Tiza directamente: 1 herida, sin propagación.
3. **Las pasivas se combinan.** Ejemplo aprobado: Roque cede la guardia a Raúl y Raúl omite la tirada nocturna. Lo mismo con Paula.
4. **Ver cartas extra se acumula; se conserva una sola.** Habilidades pasivas e ítems suman cartas para mirar (Darío + Lidia + linterna + ruido…). Se conserva 1 carta, salvo que un efecto diga explícitamente que se pueden conservar más; en ese caso el motor debe permitirlo.

## Tanda 2 (23/11)

5. **Gracia de la congelación nocturna para quien la recibe.** Quien reciba la congelación nocturna (también si la absorbe Mara) no recibe la herida de inicio de turno de forma inmediata (regla frostFresh). Pero si esa congelación es su tercer daño acumulado, muere en el acto por acumulación.
6. **Grupo inicial: se ofrecen 5 supervivientes al azar y el jugador elige 3.** Queda por probar si conviene iniciar con 3 o con 4 (el motor debe permitir configurar ese número para el laboratorio). La reserva para reclutar son los que no están en juego.
7. **Muerte: −2 de moral** (hoy el motor resta 1). El equipo del muerto vuelve a la pila de búsqueda de su localidad; si muere en la colonia, vuelve a la mano del jugador. (El motor ya hace esto último y hoy mezcla el equipo en el mazo de la localidad.)
8. **Gael con una sola plaza libre: vuelve solo**, como un Regresar común.

## Tanda 3 (23/11)

9. **Límite de equipo: uno de cada tipo equipable por superviviente.** Como máximo 1 herramienta, 1 arma y 1 libro equipados a la vez. Los descartables no cuentan.
10. **Planos sin cambios.** Por la regla 9, un superviviente lleva un solo plano a la vez (ocupa su lugar de libro).
11. **Rifle de caza sin cambios:** 1 copia; elimina 1 zombi en cualquier localidad, incluida la colonia, sin mover al portador ni tirar exposición.
12. **Encuentros con plazas justas:** si la carta exige que entren todos y no caben, se retira y se revela otra. No se acepta a medias.

## Presentación del inventario (aprobada 23/11)

- **Equipo en la barra de acción:** tres ranuras fijas por superviviente (herramienta, arma, libro). Vacía: ícono con borde punteado. Ocupada: miniatura de la ilustración. «Una vez por ronda» ya usado: gris, como un dado gastado.
- **Mochila del grupo:** fila de miniaturas (recorte de la ilustración + nombre corto), copias apiladas con número (Lata ×3), orden fijo por categoría (alimentos, medicamentos, combustibles, armas, herramientas, libros). Plegable como los demás paneles.
- **Carta completa al pasar el mouse** (pulsación larga en teléfono); mismo componente que la carta de personaje en la miniatura.
- **Acciones de contexto:** al elegir una carta, solo los botones que el motor permite en ese momento (Usar, Equipar, Dar a…, Aportar a crisis).
- **Búsqueda:** las cartas reveladas se muestran grandes, lado a lado, para elegir.
- **Técnica:** en el juego se usa solo la ilustración; papel y texto se dibujan en vivo con datos del motor, reutilizando el diseño del editor de objetos (Bitter, Alegreya Sans, papel, huellas).
- **Cuándo:** segunda entrega del hito de contenido (objetos y encuentros), junto con la carta de personaje al pasar el mouse.

## Reacciones: efectos que se usan en una situación específica (aprobada 23/11)

- **Automáticas (siempre convienen):** se aplican solas y se avisan con un globo. Raúl omite la tirada nocturna; Tiza corta el contagio; Iván aguanta 4; planos reducen la Búsqueda.
- **Decisiones (tienen costo):** el juego pausa y pregunta. Mara cubre; Roque cede la guardia; Paula hace el relevo; Anselmo cambia congelación por herida; Apósito, Garrafa, Termo.
- Las habilidades que se usan en el propio turno (Esteban, Julián, Lucía…) no son reacciones: son botones en la barra.
- **La pregunta:** papel chico anclado al lugar del mapa donde ocurre, que dice qué va a pasar y qué está en juego (si alguien muere, se avisa). Ej.: «Iris va a recibir 1 herida. Mara puede cubrirla (una vez por ronda). Mara tiene 2 heridas: si la cubre, muere. [Mara la recibe] [Que la reciba Iris]». Si hay varias opciones para el mismo hecho, van en el mismo papel, nunca en diálogos seguidos.
- **Implementación:** el motor frena y publica una «reacción pendiente» (mismo patrón que la búsqueda y la curación pendientes) con las opciones legales; la interfaz solo dibuja. Solo se pregunta si la reacción es legal y está disponible. La tirada ya se hizo: se pregunta antes de aplicar el resultado; no consume azar extra; doble clic no repite; la decisión queda en el registro.
- De noche, la pregunta aparece en la localidad que se está resolviendo. La IA decide sola con una prioridad simple; en el pase de dispositivo se pregunta al dueño del grupo.
- **Más adelante, si molesta:** selector por personaje «Preguntar / Usar siempre / No usar». No desde el principio.
- **Cuándo:** primera entrega del hito de contenido.
