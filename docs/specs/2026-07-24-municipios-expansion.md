# Spec — Ampliación de municipios con aviso de cobertura

**Fecha:** 2026-07-24
**Estado:** Aprobada
**Ticket del backlog:** nuevo (prerequisito compartido para E5-02, E3-01, E6-01)

## Historia de usuario

**Como** ciudadano de cualquiera de los municipios grandes de Antioquia (no solo los 3 pilotos)
**quiero** poder elegir mi municipio en el onboarding, entendiendo si SAMA ya tiene estaciones reales ahí o no
**para** no asumir que tengo monitoreo real donde todavía no lo hay

## Conversación

- **Origen.** El usuario pidió agregar los municipios del Valle de Aburrá y los 15 más poblados del departamento a la lista de municipios seleccionables, como paso previo a construir E5-02 (directorio), E3-01 (mapa) y E6-01 (reporte ciudadano) — los tres dependen de qué municipios existen en `constants/Municipios.ts`.
- **Por qué es su propio ciclo.** La app hoy solo tiene estaciones SAMA confirmadas en 3 municipios piloto (Zaragoza, Carepa, Turbo) — así se documentó explícitamente en `docs/specs/2026-07-24-onboarding.md`. Ampliar la lista de selección sin dejarlo claro dejaría "elegir" municipios sin ningún monitoreo real detrás, lo cual es engañoso en una app de alertas. Esto toca 2 pantallas ya shippeadas (`app/onboarding/municipios.tsx`, `app/(tabs)/index.tsx`) y un componente compartido (`TerritoryCard`), por lo que se decidió tratarlo como un ciclo separado en vez de mezclarlo dentro de E5-02.
- **Lista de municipios: verificada con el usuario.** Se buscó población de Antioquia (DANE) y se encontró que la fuente mezcla proyecciones de 2019 y 2024 — no hay precisión exacta al dígito, pero el conjunto de nombres es geográficamente consistente con las subregiones reales de Antioquia. El usuario confirmó la lista final de 28 municipios: los 3 pilotos + los 10 del Valle de Aburrá + los 15 más poblados del resto del departamento. Cubre aproximadamente 79-80% de la población de Antioquia (Valle de Aburrá solo ya es ~59%).
- **Teléfonos de emergencia: no aplica a este ciclo.** Se investigó si había una fuente pública confiable de teléfonos de CMGRD/Bomberos/Defensa Civil por municipio (relevante para el siguiente ciclo, E5-02) y no se encontró ninguna, ni siquiera para los municipios piloto ya establecidos. Ese hallazgo se traslada a la spec de E5-02, no afecta a este ciclo.
- **Aviso de cobertura: en dos lugares.** Se decidió mostrar el aviso "Cobertura de estaciones aún no confirmada" tanto en el selector de onboarding (para que el usuario lo sepa antes de elegir) como en la tarjeta de territorio en Inicio (porque es la pantalla que el usuario ve cada vez que abre la app, no solo una vez en onboarding).

## Criterios de aceptación

- [ ] CA1: `constants/Municipios.ts` expone la lista completa de 28 municipios (3 con cobertura confirmada + 25 sin cobertura confirmada), y una función que indica si un municipio dado tiene cobertura confirmada.
- [ ] CA2: la pantalla de selección de municipios (onboarding y modo standalone) muestra los 28 municipios, con scroll (ya no caben todos sin desbordar la pantalla).
- [ ] CA3: en el selector, cada municipio sin cobertura confirmada muestra el texto "Cobertura de estaciones aún no confirmada" debajo de su nombre.
- [ ] CA4: `TerritoryCard` acepta un nuevo prop opcional para indicar si la cobertura está confirmada, y muestra el mismo aviso cuando no lo está; no mostrar nada cuando el prop no se pasa (compatibilidad con usos existentes).
- [ ] CA5: en Inicio, cada `TerritoryCard` de un municipio seleccionado recibe el estado de cobertura correcto según `constants/Municipios.ts`.
- [ ] CA6: los 3 municipios piloto (Zaragoza, Carepa, Turbo) siguen funcionando exactamente igual que antes (sin aviso de cobertura no confirmada).

## Restricciones

- No agregar dependencias nuevas.
- Copy visible en español; identificadores de código en inglés.
- TypeScript estricto; sin `any`.
- No inventar teléfonos ni datos de estaciones — este ciclo solo agrega nombres de municipios (dato público verificable) y el aviso de cobertura.
- No tocar `app/_layout.tsx`, `app/alerta/[id].tsx`, ni la lógica de onboarding más allá de la lista de municipios y el aviso.
- Mantener accesibilidad ya establecida en E1-05 (`accessibilityRole`, `accessibilityState`, `minHeight: 44`) en todo lo que se modifique.

## No-objetivos

- Teléfonos de emergencia por municipio (E5-02, ciclo siguiente).
- Datos reales de estaciones/alertas para los municipios nuevos (depende de E0-02/E2, fuera de alcance).
- Cambiar qué municipios son "piloto" a efectos de negocio — siguen siendo solo Zaragoza, Carepa y Turbo; los otros 25 son seleccionables pero explícitamente sin cobertura confirmada.

## Verificación

Compila/typecheck → lint → unitarias (Jest + RNTL: selector muestra 28 municipios y hace scroll, aviso de cobertura aparece solo en los 25 no confirmados, `TerritoryCard` con y sin el nuevo prop, Inicio pasa el estado correcto) → ejecución real (verificación visual en simulador, limitación conocida de tap sintético igual que en ciclos anteriores). Cambio de tamaño medio que toca pantallas ya shippeadas — spec con historia + criterios de aceptación es suficiente.
