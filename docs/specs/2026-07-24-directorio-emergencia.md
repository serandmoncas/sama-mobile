# Spec — Directorio de emergencia

**Fecha:** 2026-07-24
**Estado:** Aprobada
**Ticket del backlog:** E5-02

## Historia de usuario

**Como** ciudadano en una emergencia
**quiero** ver los teléfonos de CMGRD, Bomberos y Defensa Civil de mi municipio y poder llamar directamente
**para** contactar ayuda sin tener que buscar el número en otro lado

## Conversación

- **Independiente de la cobertura de estaciones SAMA.** El ciclo anterior (`docs/specs/2026-07-24-municipios-expansion.md`) amplió el selector de municipios a 28, distinguiendo cuáles tienen estaciones SAMA confirmadas. El directorio de emergencia es un servicio municipal distinto — todo municipio colombiano tiene su propio CMGRD por ley, tenga o no estaciones SAMA. Por eso el directorio necesita datos para los 28 municipios, no solo los 3 piloto.
- **Teléfonos: sin fuente confiable, confirmado con búsqueda real.** Se investigó si existía un listado público confiable de teléfonos de CMGRD/Bomberos/Defensa Civil por municipio y no se encontró ninguno, ni siquiera para los municipios piloto ya establecidos (ver la conversación de `docs/specs/2026-07-24-municipios-expansion.md`). Los 28 municipios muestran `telefono: null` hasta que Dagran confirme datos reales.
- **Botón de llamada: decisión de seguridad.** Cuando el teléfono es `null`, el botón de llamada aparece deshabilitado con el texto "Número pendiente de verificación" — nunca un botón que aparente funcionar y marque un número inventado. Es el mismo criterio que ya se aplicó al contenido de "¿Qué hago?", pero aquí el riesgo es mayor: un botón de llamada de emergencia que no hace nada real en medio de una emergencia real.
- **Ubicación: mismo tab, debajo de las recomendaciones.** El proposal original agrupa el directorio de emergencia dentro de "¿Qué hago?" (F3), junto a las recomendaciones antes/durante/después (ya construidas en E5-01). Se agrega como una sección nueva al final de `app/(tabs)/que-hago.tsx`, con scroll (la pantalla completa necesita `ScrollView` ahora; antes no le hacía falta con solo el contenido de recomendaciones).
- **Alcance: solo los municipios del usuario.** Igual que Inicio, el directorio muestra solo los municipios que el usuario seleccionó en onboarding (reutilizando `getSelectedMunicipios` con `useFocusEffect` para refrescar si el usuario cambia su selección entre visitas). Si no ha seleccionado ninguno todavía, se muestra el mismo mensaje que usa Inicio ("Aún no has añadido ningún municipio.").

## Criterios de aceptación

- [x] CA1: `constants/Directorio.ts` expone un directorio con 3 entidades (CMGRD, Bomberos, Defensa Civil) para cada uno de los 28 municipios, generado a partir de la lista de municipios existente (no listado a mano), con `telefono: null` en todos los casos hoy.
- [x] CA2: la pantalla "¿Qué hago?" muestra una sección "Directorio de emergencia" debajo del contenido de recomendaciones, con scroll.
- [x] CA3: el directorio solo muestra los municipios que el usuario seleccionó en onboarding, y se actualiza si la selección cambia entre visitas al tab.
- [x] CA4: si el usuario no ha seleccionado ningún municipio, se muestra un mensaje en vez de una sección vacía.
- [x] CA5: cuando el teléfono de una entidad es `null`, su botón de llamada aparece deshabilitado con el texto "Número pendiente de verificación".
- [x] CA6: cuando el teléfono de una entidad no es `null`, su botón de llamada usa `Linking.openURL('tel:...')`.
- [x] CA7: todo el contenido es local salvo la selección de municipios (ya cacheada localmente) — no hay llamadas de red nuevas.
- [x] CA8: los elementos interactivos (filas de entidad, botón de llamada) siguen las convenciones de accesibilidad ya establecidas (`accessibilityRole`, `accessibilityState` si aplica, `minHeight: 44`).

## Restricciones

- No agregar dependencias nuevas (`Linking` es parte de `react-native`).
- Copy visible en español; identificadores de código en inglés.
- TypeScript estricto; sin `any`.
- No inventar teléfonos reales — todos los valores de `telefono` quedan en `null` en este ciclo.
- No tocar `app/_layout.tsx`, `app/alerta/[id].tsx`, ni ninguna otra pantalla fuera de `app/(tabs)/que-hago.tsx`.
- No modificar `constants/Colors.ts` ni `constants/AlertColors.ts`.
- Mantener el contenido de recomendaciones de E5-01 intacto — esta spec solo agrega una sección nueva al final de la pantalla.

## No-objetivos

- Teléfonos reales verificados con Dagran (pendiente, fuera de alcance).
- Puntos de encuentro (E5-03, ticket aparte).
- "Editable desde panel admin" (segundo AC del ticket original de backlog) — depende del BFF, que no existe todavía.
- Confirmación antes de llamar (no lo pide ningún AC; se puede agregar en un ciclo futuro si Dagran lo pide).

## Verificación

Compila/typecheck → lint → unitarias (Jest + RNTL: directorio filtra por municipios seleccionados, mensaje de estado vacío, botón deshabilitado con teléfono `null`, botón funcional con teléfono real usando un mock de `Linking`, roles/estados de accesibilidad) → ejecución real (verificación visual en simulador, limitación conocida de tap sintético igual que en ciclos anteriores). Feature de tamaño medio que extiende una pantalla existente — spec con historia + criterios de aceptación es suficiente.
