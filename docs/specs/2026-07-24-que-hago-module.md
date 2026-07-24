# Spec — Módulo "¿Qué hago?" (recomendaciones offline)

**Fecha:** 2026-07-24
**Estado:** Aprobada
**Ticket del backlog:** E5-01

## Historia de usuario

**Como** ciudadano en zona de riesgo hidrometeorológico
**quiero** ver recomendaciones claras de antes/durante/después por tipo de evento, incluso sin conexión
**para** saber cómo actuar en una emergencia sin depender de la red

## Conversación

- **Alcance: solo el módulo de recomendaciones.** El épica E5 completa incluye directorio de emergencia (E5-02) y puntos de encuentro (E5-03), pero esos son tickets separados con AC propios. Este ciclo cubre únicamente E5-01.
- **3 tipos de evento confirmados por el proposal.** `docs/proposal/mvp-proposal.md` (sección F3) fija los tres tipos: inundación, creciente súbita, avenida torrencial. No se inventan tipos adicionales.
- **Contenido real: riesgo de fabricación.** La spec original de E5-01 exige "lenguaje claro validado por el equipo social del SAMA". Ese contenido no existe todavía en este repo ni fue provisto por el usuario, y esta es una app de alertas de emergencia real — inventar texto de protección civil y presentarlo como si viniera de Dagran sería activamente engañoso (mismo problema que se identificó con la lista de municipios en E1-03). Se decidió construir la estructura completa (navegación, componentes, datos tipados, accesibilidad) con contenido de marcador de posición explícitamente etiquetado como pendiente de validación, en las 9 combinaciones evento×fase. El wireframe del proposal menciona dos ítems de ejemplo ("Conozca su ruta", "Kit de emergencia") pero no queda claro a qué combinación evento×fase pertenecen exactamente — no se usan para evitar que un ítem parezca contenido real cuando no lo es.
- **Sin ruta nueva.** Todo vive en el tab existente `app/(tabs)/que-hago.tsx`: selector de evento (3 botones) arriba, selector de fase (Antes/Durante/Después) debajo, contenido de la combinación activa abajo. Sin `useState` persistido — la selección vive solo en memoria del componente.
- **Accesibilidad desde el inicio.** Los selectores de evento y fase usan `accessibilityRole="tab"` + `accessibilityState={{ selected }}` + `minHeight: 44`, aplicando las mismas convenciones que se acaban de mergear en E1-05, en vez de dejarlo para un ciclo posterior.
- **Sin sincronización remota.** E2-04 (endpoint de sincronización de contenido) depende del BFF, que vive en otro repo y no existe todavía. Este ciclo es 100% contenido empaquetado en la app (`constants/QueHago.ts`).

## Criterios de aceptación

- [x] CA1: la pantalla "¿Qué hago?" muestra un selector con los 3 tipos de evento (inundación, creciente súbita, avenida torrencial).
- [x] CA2: la pantalla muestra un selector de fase (Antes/Durante/Después).
- [x] CA3: al cargar la pantalla, hay un evento y una fase seleccionados por defecto (inundación / antes), y se muestra el contenido correspondiente.
- [x] CA4: cambiar el evento seleccionado actualiza el contenido mostrado a la combinación evento×fase correcta, sin perder la fase activa.
- [x] CA5: cambiar la fase seleccionada actualiza el contenido mostrado a la combinación evento×fase correcta, sin perder el evento activo.
- [x] CA6: todo el contenido es local (sin llamadas de red) — la pantalla funciona igual con el dispositivo en modo avión.
- [x] CA7: los botones de evento y de fase tienen `accessibilityRole="tab"`, `accessibilityState={{ selected }}` y un área tocable ≥ 44px.
- [x] CA8: el contenido de las 9 combinaciones evento×fase está presente pero marcado explícitamente como pendiente de validación (no se presenta como recomendación oficial verificada).

## Restricciones

- No agregar dependencias nuevas.
- Copy visible en español; identificadores de código en inglés.
- TypeScript estricto; sin `any`.
- No tocar `app/_layout.tsx`, `app/alerta/[id].tsx`, ni ninguna otra pantalla fuera de `app/(tabs)/que-hago.tsx`.
- No modificar `constants/Colors.ts` ni `constants/AlertColors.ts` (sin cambios de tokens en este ciclo).
- Mantener el test existente de `accessibilityRole="header"` en el título (agregado en E1-05).

## No-objetivos

- Directorio de emergencia por municipio (E5-02).
- Puntos de encuentro (E5-03).
- Sincronización remota de contenido vía backend (E2-04) — depende del BFF, fuera de este repo.
- Contenido real validado por el equipo social del SAMA — placeholder explícito hasta que exista.
- Persistir la última selección de evento/fase entre sesiones (no lo pide ningún AC; se resetea al valor por defecto en cada visita al tab).

## Verificación

Compila/typecheck → lint → unitarias (Jest + RNTL: render inicial, cambio de evento, cambio de fase, roles/estados de accesibilidad de los selectores) → ejecución real (verificación visual en simulador, ya que no hay herramienta de tap sintético disponible en este entorno — se documenta como limitación conocida, igual que en ciclos anteriores). Feature de tamaño mediano con estado de UI nuevo pero sin flujo multi-pantalla — spec con historia + criterios de aceptación es suficiente, sin necesitar escenarios Gherkin.
