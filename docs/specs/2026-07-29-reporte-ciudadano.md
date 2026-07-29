# Spec — Formulario de reporte ciudadano con cola local

**Fecha:** 2026-07-29
**Estado:** Aprobada
**Ticket del backlog:** E6-01 + E6-02

## Historia de usuario

**Como** ciudadano
**quiero** reportar lo que observo (foto + categoría + ubicación) en menos de un minuto, incluso sin conexión
**para** avisarle al Dagran de una situación de riesgo sin depender de tener señal en ese momento

## Conversación

- **Alcance: E6-01 y E6-02 combinados.** El AC original de E6-02 pide que la cola offline "se envíe automáticamente al reconectar" — pero el BFF no existe todavía (mismo bloqueo documentado en ciclos anteriores), así que no hay ningún servidor real al que enviar nada. Se decidió construir el formulario completo (E6-01) junto con la persistencia local (E6-02) en un solo ciclo, ya que un formulario sin persistencia perdería el reporte del usuario al cerrar la app — pero los reportes quedan explícitamente marcados como **"Pendiente de envío — el panel de Dagran no existe todavía"**, nunca simulados como enviados. El envío real es trabajo futuro cuando exista el BFF (E6-03).
- **Compresión de foto verificada, no solo "esperada".** El AC pide que la foto quede comprimida a menos de 500KB. Se decidió verificar el tamaño real del archivo tras la selección y redimensionar con `expo-image-manipulator` (dependencia nueva) hasta cumplir el límite de verdad, en vez de solo bajar el parámetro `quality` del selector y esperar que alcance.
- **Origen de la foto: dos botones explícitos.** "Tomar foto" (cámara) y "Elegir de galería" (selector nativo), en vez de un solo botón con menú de acción — más simple de implementar y de probar.
- **Ubicación: automática con ajuste manual.** Al abrir el formulario se pide el permiso de ubicación automáticamente (reutilizando `expo-location`, ya instalado desde E3-01) y se coloca un pin en un mini-mapa (reutilizando MapLibre, también ya instalado). El usuario puede tocar el mapa para mover el pin. Si el permiso se niega, el mapa arranca centrado en Antioquia sin pin — el usuario debe ubicarlo a mano, ya que la ubicación es obligatoria para enviar el reporte.
- **Estado de la cola visible en la misma pantalla.** En vez de una pantalla o tab nuevo, la lista de reportes pendientes se muestra debajo del formulario, en el mismo tab "Reportar" — satisface el "estado visible para el usuario" del AC de E6-02 sin agregar navegación nueva.
- **Fotos guardadas localmente, no en AsyncStorage directamente.** El archivo de imagen comprimido se guarda en el directorio de documentos del dispositivo (persistente entre sesiones); AsyncStorage solo guarda los metadatos del reporte (categoría, coordenadas, alias, teléfono, la URI local de la foto, fecha, estado) — evita inflar AsyncStorage con datos binarios.

## Criterios de aceptación

- [ ] CA1: el tab "Reportar" muestra un formulario con foto, categoría, ubicación, alias y teléfono (en vez del placeholder actual).
- [ ] CA2: el usuario puede tomar una foto con la cámara o elegir una de la galería.
- [ ] CA3: la foto queda comprimida a menos de 500KB de verdad (verificado leyendo el tamaño real del archivo, no solo confiando en el parámetro de calidad del selector).
- [ ] CA4: hay un selector de categoría con las 4 opciones del backlog: nivel del río, deslizamiento, obstrucción, otro.
- [ ] CA5: al abrir el formulario se pide el permiso de ubicación automáticamente; si se concede, se coloca un pin inicial en la posición del usuario sobre un mini-mapa.
- [ ] CA6: el usuario puede tocar el mini-mapa para mover el pin y ajustar la ubicación manualmente, sin importar si el permiso automático se concedió o no.
- [ ] CA7: alias y teléfono son campos de texto opcionales.
- [ ] CA8: al enviar, se valida que existan foto, categoría y ubicación (alias/teléfono no se validan, son opcionales); si falta algo, no se guarda el reporte y se indica qué falta.
- [ ] CA9: un reporte válido se guarda en una cola local persistente (sobrevive a cerrar y reabrir la app), con estado "Pendiente de envío — el panel de Dagran no existe todavía" — nunca se marca como enviado de verdad.
- [ ] CA10: la cola de reportes pendientes es visible en la misma pantalla "Reportar", debajo del formulario.
- [ ] CA11: los elementos interactivos siguen las convenciones de accesibilidad ya establecidas (`accessibilityRole`, `accessibilityLabel`/`accessibilityState` según aplique, `minHeight` de 44px en botones).

## Restricciones

- Dependencias nuevas explícitamente permitidas en este ciclo: `expo-image-picker` y `expo-image-manipulator`. `expo-location` y `@maplibre/maplibre-react-native` ya existen desde E3-01, se reutilizan sin cambios de configuración adicionales salvo lo que requiera el plugin de `expo-image-picker` en `app.json`.
- No implementar ningún envío de red real — no hay servidor al que enviar los reportes todavía.
- Copy visible en español; identificadores de código en inglés.
- TypeScript estricto; sin `any`.
- No tocar `app/_layout.tsx`, `app/alerta/[id].tsx`, `app/(tabs)/mapa.tsx`, ni ninguna otra pantalla fuera de `app/(tabs)/reportar.tsx`.
- No modificar `constants/Colors.ts` ni `constants/AlertColors.ts`.

## No-objetivos

- Envío real de reportes a un backend (depende del BFF, E6-03, fuera de alcance).
- Panel de moderación para Dagran (E6-03, otro repo/otro ciclo).
- Anti-abuso (rate limiting, detección de duplicados — E6-04).
- Reintentos automáticos de envío al reconectar (no aplica sin backend real; cuando exista, la cola ya construida aquí es la base para implementarlo).
- Edición o eliminación de reportes ya guardados en la cola (fuera del alcance de este ciclo; se puede agregar después si se necesita).

## Verificación

Compila/typecheck → lint → unitarias (Jest + RNTL: formulario completo con `expo-image-picker`/`expo-image-manipulator`/`expo-location`/MapLibre mockeados, validación de campos requeridos, compresión de foto simulada, guardado en la cola local vía AsyncStorage, estado "pendiente" visible, ajuste manual del pin) → ejecución real (build de desarrollo nativa en simulador — ya establecida desde E3-01 — con verificación visual del formulario y, si es posible, del flujo de foto+ubicación). No hay tap sintético disponible en este entorno (limitación ya documentada en ciclos anteriores), así que la interacción real (tocar botones, arrastrar el pin) se verifica solo con pruebas automatizadas mockeadas, no con taps reales en el dispositivo.
