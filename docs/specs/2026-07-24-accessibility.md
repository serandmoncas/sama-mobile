# Spec — Accesibilidad base

**Fecha:** 2026-07-24
**Estado:** Aprobada
**Ticket del backlog:** E1-05

## Historia de usuario

**Como** ciudadano que usa un lector de pantalla o tiene dificultad para tocar elementos pequeños
**quiero** que la app anuncie correctamente cada elemento interactivo y tenga targets táctiles de tamaño adecuado
**para** poder usar la app de forma independiente, incluyendo en una emergencia

## Conversación

- **Alcance: tabs + onboarding.** El ticket original dice "las 5 pantallas núcleo" (los tabs), pero hoy los únicos elementos interactivos reales de la app viven en las 3 pantallas de onboarding (checkboxes de municipio, botón "Volver"). Los 5 tabs son mayormente texto estático sin elementos interactivos propios. Se decidió incluir onboarding en el alcance de este ciclo — dejarlo fuera habría dejado sin auditar las únicas pantallas con brechas de accesibilidad reales hoy.
- **Contraste AA ya resuelto.** Los tokens de color (`constants/Colors.ts`, `constants/AlertColors.ts`) ya documentan sus ratios de contraste AA desde el ciclo del sistema de diseño. Este ciclo no cambia ningún color — solo confirma que no se introduce ningún color nuevo sin verificar. No hay trabajo de tokens en este ciclo.
- **Targets táctiles: gaps reales encontrados.** Las filas de selección de municipio (`app/onboarding/municipios.tsx`) alcanzan ~44px solo por la combinación casual de padding + altura de texto por defecto (sin `minHeight` explícito, no garantizado si cambia el escalado de fuente del sistema). El botón "Volver" en modo standalone no tiene padding en absoluto — su área tocable es mucho menor a 44px. `components/Button.tsx` ya tiene `minHeight: 44` desde el ciclo del sistema de diseño, no necesita cambios.
- **Testing de tamaño de target táctil.** No es posible medir el tamaño de layout renderizado real en el entorno de Jest (no hay motor de layout real). La verificación se hace revisando que el estilo declare `minHeight: 44` explícitamente, no midiendo píxeles renderizados.

## Criterios de aceptación

- [x] CA1: las filas de selección de municipio tienen `minHeight` ≥ 44px declarado explícitamente en su estilo.
- [x] CA2: el botón "Volver" (modo standalone de municipios) tiene un área tocable ≥ 44px (vía padding), no solo el tamaño del texto.
- [x] CA3: cada fila de municipio tiene `accessibilityRole="checkbox"`, `accessibilityState={{ checked: <bool> }}`, y un `accessibilityLabel` que combina el nombre del municipio y su estado de selección.
- [x] CA4: el botón "Volver" tiene `accessibilityRole="button"`.
- [x] CA5: el título principal de cada una de las 8 pantallas (5 tabs + 3 de onboarding) tiene `accessibilityRole="header"`.
- [x] CA6: `TerritoryCard` tiene un `accessibilityLabel` explícito que combina el nombre del municipio y su nivel de alerta, en vez de depender del orden de lectura por defecto de sus elementos hijos.
- [x] CA7: ningún color nuevo se introduce en este ciclo sin ratio de contraste AA documentado (verificación, no cambio de tokens existentes).

## Restricciones

- No cambiar ningún color/token existente — ya están verificados AA desde el sistema de diseño.
- No agregar dependencias nuevas.
- Copy visible en español; identificadores de código en inglés.
- TypeScript estricto; sin `any`.
- No tocar `app/_layout.tsx`, `app/alerta/[id].tsx`, ni la lógica de negocio de ninguna pantalla (solo atributos de accesibilidad y estilos de touch target).

## No-objetivos

- Auditoría de contraste de colores nuevos (no se introducen colores nuevos en este ciclo).
- Soporte de accesibilidad para `AlertLevelChip`/`DataFreshnessBanner` de forma independiente (ya se leen correctamente como parte de `TerritoryCard`; no están usados solos en ninguna pantalla real todavía).
- Pruebas con un lector de pantalla real (VoiceOver/TalkBack) en dispositivo — se verifica con las queries de accesibilidad de React Native Testing Library (`getByRole`, `getByLabelText`), que reflejan los mismos atributos que un lector de pantalla real usa.

## Verificación

Compila/typecheck → lint → unitarias (Jest + RNTL: queries `getByRole`/`getByLabelText` para roles/estados/labels; verificación de `minHeight: 44` en los estilos de los elementos con target táctil corregido) → ejecución real (no aplica prueba con lector de pantalla físico en este ciclo, ver No-objetivos). Feature pequeña sin flujo con estado nuevo — spec con historia + criterios de aceptación es suficiente, sin necesitar escenarios Gherkin.
