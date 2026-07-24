# Spec — Onboarding sin cuenta

**Fecha:** 2026-07-24
**Estado:** Aprobada
**Ticket del backlog:** E1-03

## Historia de usuario

**Como** ciudadano
**quiero** usar la app sin registrarme, eligiendo mi(s) municipio(s) de interés
**para** empezar a recibir información relevante sin fricción de cuentas ni contraseñas

## Conversación

- **Lista de municipios.** El ticket original no especifica de dónde sale la lista. No existe un listado oficial y verificado de los ~36 municipios instrumentados por el SAMA en ningún documento del proyecto — solo los 3 municipios piloto están confirmados en la propuesta (Zaragoza, Carepa, Turbo). Se decidió usar solo esos 3, hardcodeados, para no fabricar información falsa sobre cobertura real de instrumentación en una app de alertas de riesgo. La lista completa queda pendiente de E0-02 (validación de fuentes de datos con Dagran/G-LIMA).
- **Persistencia.** Se usa `@react-native-async-storage/async-storage` (estándar de la comunidad RN/Expo) para guardar la selección de municipios y la bandera de onboarding completado. Esto es independiente de la decisión de MMKV/SQLite para caché de datos de API que le corresponde a E1-04 — son problemas distintos (preferencia del usuario vs. caché de respuestas del backend).
- **Permiso de notificaciones.** Se pide el permiso real del sistema operativo (vía `expo-notifications`) durante el onboarding, aunque todavía no exista backend para registrar el token — eso es trabajo de E4-01. Este ciclo solo establece el permiso y registra localmente si el usuario lo concedió o no.
- **Pantalla de Inicio.** Se actualiza para mostrar los municipios elegidos como `TerritoryCard` (con nivel de alerta "verde" fijo, ya que no hay datos reales de alerta sin el BFF) en vez de dejar el placeholder "Aún no has añadido ningún municipio". Sin esto, no habría forma visible de confirmar que la selección se guardó correctamente — mala señal para un criterio que dice "selección persistida localmente". Esto no es el trabajo completo de E3-04 (que añade el peor nivel de alerta real, orden por severidad, etc.) — solo hace visible el resultado de este ticket.
- **Re-acceso al selector de municipios.** El wireframe original de Inicio ya incluía un botón "+ Añadir municipio". Ese botón reabre la misma pantalla de selección usada en el onboarding, en modo standalone — no repite la bienvenida ni el paso de permiso de notificaciones, que son de una sola vez.
- **Onboarding solo la primera vez.** Se guarda una bandera `onboardingCompleted` en AsyncStorage; si ya existe, la app abre directo en los tabs sin pasar por bienvenida/notificaciones de nuevo.
- **Continuar con 0 municipios seleccionados.** El botón "Continuar" de la pantalla de selección está habilitado incluso sin ninguna selección — coherente con "registro sin fricción" (ya mencionado en la propuesta) y con que los municipios se pueden añadir después desde Inicio.

## Criterios de aceptación

- [ ] CA1: al abrir la app por primera vez (sin `onboardingCompleted` guardado), se muestra la pantalla de bienvenida, no los tabs.
- [ ] CA2: la pantalla de selección de municipios muestra los 3 municipios piloto (Zaragoza, Carepa, Turbo), permite selección múltiple, y el botón "Continuar" está habilitado sin importar cuántos estén seleccionados.
- [ ] CA3: la pantalla de notificaciones dispara el permiso real del sistema operativo al tocar "Permitir"; tocar "Ahora no" continúa sin pedirlo. En ambos casos el flujo continúa a los tabs.
- [ ] CA4: al completar el onboarding (por cualquiera de los dos caminos de CA3), `onboardingCompleted` queda en `true` y los municipios elegidos quedan guardados en AsyncStorage.
- [ ] CA5: en una apertura posterior de la app (con `onboardingCompleted = true`), se abre directo en los tabs, sin pasar por bienvenida/municipios/notificaciones.
- [ ] CA6: la pantalla de Inicio muestra un `TerritoryCard` (nivel "verde") por cada municipio guardado; si no hay ninguno guardado, muestra el placeholder original ("Aún no has añadido ningún municipio").
- [ ] CA7: el botón "+ Añadir municipio" en Inicio abre la pantalla de selección de municipios en modo standalone; guardar ahí actualiza la lista visible en Inicio sin pasar por bienvenida ni notificaciones.
- [ ] CA8: el flujo completo funciona sin conceder el permiso de notificaciones (tocar "Ahora no" en CA3 no bloquea nada).

## Restricciones

- No agregar backend/BFF ni registrar tokens de push — eso es E4-01.
- No expandir la lista de municipios más allá de los 3 pilotos confirmados.
- Copy visible en español; identificadores de código en inglés.
- TypeScript estricto; sin `any`.
- Persistencia con `@react-native-async-storage/async-storage`, instalada vía `npx expo install` para la versión compatible con el SDK.
- Los componentes del sistema de diseño (`Button`, `TerritoryCard`) se reutilizan tal cual existen — no se modifican en este ciclo salvo que se encuentre un defecto real.

## No-objetivos

- Lista completa de los ~36 municipios (pendiente de E0-02).
- Registro del token de push en un backend (E4-01).
- Selección por cuenca (solo por municipio, como dice el ticket original).
- Nivel de alerta real en `TerritoryCard` (nivel "verde" fijo por ahora; E3-04 lo completa).
- Editar o quitar municipios individualmente desde Inicio (el botón "+ Añadir municipio" reabre el selector completo, que ya permite deseleccionar; no hay un gesto de swipe-to-delete ni similar en este ciclo).

## Verificación

Compila/typecheck → lint → unitarias (Jest + RNTL: `lib/onboarding.ts` con AsyncStorage mockeado, cada pantalla, el guard+render de Inicio) → ejecución real (correr el flujo completo en el simulador ya disponible: primera apertura → bienvenida → municipios → notificaciones → tabs → confirmar Inicio muestra las tarjetas → reabrir la app y confirmar que salta directo a tabs). Dado que es una "feature con estado/flujo" (varias pantallas secuenciales con persistencia), esta spec incluye historia + criterios de aceptación + restricciones, sin necesitar escenarios Gherkin completos dado que los criterios ya son suficientemente concretos.
