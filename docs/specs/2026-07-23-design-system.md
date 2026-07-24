# Spec — Sistema de diseño en código

**Fecha:** 2026-07-23
**Estado:** Aprobada
**Ticket del backlog:** E1-02

## Historia de usuario

**Como** desarrollador del equipo SAMA
**quiero** tokens de color/tipografía/espaciado y un set inicial de componentes reutilizables (botón, tarjeta de territorio, chip de nivel de alerta, banner de frescura de datos)
**para** que las pantallas futuras (F1–F5) se construyan sobre una base visual consistente en vez de estilos ad-hoc por pantalla.

## Conversación

- El ticket original (E1-02 en `docs/proposal/backlog.md`) dice que los tokens salen de la guía visual de E0-03 (prototipo Figma validado con Dagran). E0-03 no existe todavía — es trabajo de descubrimiento pendiente que depende de sesiones con el equipo del Dagran y no se puede ejecutar como ticket de ingeniería. Se decidió avanzar con valores por defecto razonables (paleta semáforo estándar, tipografía del sistema), marcados explícitamente como provisionales, para no bloquear el resto del trabajo de app. Cuando exista la guía de E0-03, los tokens se actualizan — la spec y el código son el único lugar que necesita cambiar (los componentes consumen los tokens, no colores hardcodeados).
- Ubicación en el código: se decidió extender `constants/` (ya existe con `Colors.ts` desde el harness) en vez de crear un directorio nuevo `src/design-system/` — la spec original del harness mencionaba `src/`, pero esa parte ya se corrigió (ver `docs/specs/2026-07-22-harness-bootstrap-design.md`, corrección del 2026-07-22) porque el repo real nunca usó `src/`. Seguir el patrón existente evita una segunda convención de carpetas conviviendo con la primera.
- Accesibilidad: el ticket pide "modo de alto contraste y escalado de fuente del sistema respetados". Se interpretó como: (a) todos los pares texto/fondo de los tokens cumplen WCAG AA (≥4.5:1) por diseño, no por una detección en tiempo real del toggle de alto contraste del sistema (la API de React Native para eso es inconsistente entre iOS/Android y sería sobre-ingeniería para este ciclo); (b) ningún componente desactiva `allowFontScaling` (su default en RN ya es `true`), así que el escalado de fuente del sistema funciona sin código adicional.
- Alcance de wiring: los 4 componentes son una librería standalone con props genéricas — no se conectan a las 5 pantallas de tabs existentes en este ciclo. Eso es trabajo de tickets futuros (E1-03 onboarding, E3-04 tarjetas de "Mis territorios", E4-04/E4-05 pantallas de alerta) cuando haya datos reales que mostrar. Se agrega una pantalla de catálogo fuera de la navegación de tabs para verificación visual.
- Rama: este trabajo vive en `design-system`, creada desde `harness/bootstrap` (que a su vez tiene un PR #1 abierto y sin mergear contra `main`) — se decidió así en vez de esperar el merge del harness, para no bloquear el avance. El PR de este ciclo apuntará a `harness/bootstrap`.

## Criterios de aceptación

- [ ] CA1: existen tokens de color para los 4 niveles de alerta (verde/amarilla/naranja/roja) y para superficies/texto/bordes en modo claro y oscuro, cada uno con contraste AA documentado frente a su fondo.
- [ ] CA2: existe una escala tipográfica (título, subtítulo, cuerpo, caption) y una escala de espaciado (4/8/12/16/24/32), ambas como constantes exportadas y consumidas por los componentes de este ciclo (no hardcodeadas dentro de cada componente).
- [ ] CA3: `Button` soporta variante `primary` y `secondary`, estado `disabled`, dispara `onPress` al tocarlo, y no lo hace cuando está `disabled`.
- [ ] CA4: `AlertLevelChip` muestra el color y el texto correctos para cada uno de los 4 niveles de alerta.
- [ ] CA5: `TerritoryCard` renderiza el nombre del municipio recibido por prop y el `AlertLevelChip` correspondiente a su nivel de alerta.
- [ ] CA6: `DataFreshnessBanner` recibida una fecha `lastUpdated`, muestra el texto relativo correcto en español: "hace instantes" (<1 min), "hace X min" (1–59 min), "hace X h" (≥60 min, redondeado a horas enteras).
- [ ] CA7: `Button`, `TerritoryCard` y `DataFreshnessBanner` respetan el modo claro/oscuro del sistema (vía el mismo mecanismo que `components/Themed.tsx` ya usa). `AlertLevelChip` queda explícitamente fuera de este criterio: sus colores son semánticos y fijos por diseño (ver Conversación) — no cambian con el tema, igual que un semáforo real no cambia de color de día o de noche.
- [ ] CA8: ningún componente de texto de este ciclo desactiva `allowFontScaling`.
- [ ] CA9: existe una pantalla de catálogo (fuera de los tabs de navegación) que muestra los 4 componentes con al menos 2–3 variantes visibles cada uno.

## Restricciones

- No agregar dependencias nuevas de theming/UI (nada de react-native-paper, tamagui, restyle, etc.) — plain TypeScript + `StyleSheet`, seguir el patrón ya establecido por `components/Themed.tsx`.
- Los tokens y componentes viven en `constants/` y `components/` (no crear `src/design-system/`).
- Copy visible en español; identificadores de código en inglés (convención ya establecida en `CLAUDE.md`).
- TypeScript estricto; sin `any`.
- No tocar las 5 pantallas de tabs existentes (`app/(tabs)/*.tsx`) ni `app/alerta/[id].tsx` en este ciclo.

## No-objetivos

- Detección en tiempo real del toggle de alto contraste del sistema.
- Fuentes custom (se usa la fuente del sistema).
- Conectar los componentes a datos reales o a las pantallas existentes.
- Colores/tipografía institucionales finales del Dagran (pendientes de E0-03).

## Verificación

Compila/typecheck → lint → unitarias (Jest + React Native Testing Library, una por componente según CA3–CA6) → ejecución real (abrir la pantalla de catálogo en Expo Go y confirmar visualmente que los 4 componentes se ven correctos en claro y oscuro). Dado el tamaño del cambio (feature pequeña, sin flujo con estado), esta spec usa el nivel "historia + criterios de aceptación en lista" de la guía de metodología, sin necesitar escenarios Gherkin.
