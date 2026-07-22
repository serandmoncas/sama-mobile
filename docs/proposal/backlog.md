# Backlog del MVP — App móvil SAMA
### Anexo técnico a la propuesta v1.0 · Julio de 2026

Convenciones: estimaciones en **puntos** (1 pt ≈ ½ día ideal de una persona). Prioridad: **P0** = imprescindible para el MVP, **P1** = importante, **P2** = deseable dentro del MVP si el cronograma lo permite. Los tickets están agrupados en épicas alineadas con las fases del cronograma (sección 6 de la propuesta).

**Resumen:** 9 épicas · 48 tickets · 190 pts (~95 días-persona ideales, consistente con las 16 semanas del equipo propuesto una vez incluidos gestión, reuniones y contingencia).

---

## Épica E0 — Descubrimiento y fundaciones (Fase 0) — 24 pts

**E0-01 · Taller de arranque y mapa de actores** — P0 · 2 pts
Como equipo del proyecto, necesitamos alinear con Dagran/G-LIMA objetivos, roles y canales de decisión.
✓ Acta con objetivos del MVP, interlocutores nombrados y calendario de ceremonias. ✓ Definición conjunta de los 3 municipios piloto.

**E0-02 · Inventario y prueba de fuentes de datos SAMA** — P0 · 5 pts · **bloqueante de E2/E4**
Como arquitecto, necesito acceder y probar los servicios reales (ArcGIS REST del geoportal, telemetría, feed de alertas) para confirmar la integración.
✓ Documento con endpoints, formatos, frecuencia de actualización y latencia medida de cada fuente. ✓ Decisión registrada: ¿existe feed estructurado de alertas? (activa o descarta E4-07). ✓ Credenciales/convenio de acceso gestionados.

**E0-03 · Prototipo navegable en Figma** — P0 · 5 pts
Como diseñador, debo convertir los wireframes en un prototipo navegable de las 5 pantallas núcleo.
✓ Prototipo cubre: inicio, mapa, detalle estación, detalle alerta, ¿qué hago?, reporte. ✓ Validado en sesión con Dagran y ≥ 1 sesión con usuarios/líderes comunitarios. ✓ Guía visual (colores institucionales, tipografía, semáforo de alertas) aprobada.

**E0-04 · Definición del protocolo de niveles de alerta en la app** — P0 · 3 pts
Como Dagran, necesito que los niveles mostrados en la app correspondan exactamente al protocolo oficial.
✓ Tabla nivel → color → texto → comportamiento (sonido/vibración) firmada por Dagran. ✓ Textos de alerta revisados por el equipo social del SAMA (lenguaje claro).

**E0-05 · Monorepo, CI/CD y entornos** — P0 · 5 pts
Como equipo, necesitamos repositorio (app + BFF), pipelines y entornos dev/staging.
✓ Monorepo con app Expo (TypeScript) y BFF NestJS esqueleto. ✓ CI: lint, tests, build en cada PR. ✓ EAS Build configurado; entorno staging desplegado. ✓ README de onboarding.

> **Nota de implementación (ADR-0001):** este ítem se adaptó a repos separados — `sama-mobile` (esta app) y un futuro repo del BFF — en vez de monorepo. Ver `docs/adr/0001-repos-separados-app-bff.md`.

**E0-06 · Backlog priorizado definitivo y acta de alcance** — P0 · 2 pts
✓ Este backlog ajustado con lo aprendido en E0-02/E0-03, re-estimado y firmado.

**E0-07 · Política de tratamiento de datos (Ley 1581)** — P1 · 2 pts
✓ Texto legal de tratamiento de datos y permisos (ubicación, cámara) revisado; pantallas de consentimiento especificadas.

---

## Épica E1 — Esqueleto de la app y sistema de diseño (Fase 1) — 21 pts

**E1-01 · Navegación y estructura base** — P0 · 3 pts
✓ Tabs: Inicio, Mapa, Alertas, ¿Qué hago?, Reportar. ✓ Deep links (abrir detalle de alerta desde push). ✓ Splash e íconos.

**E1-02 · Sistema de diseño en código** — P0 · 5 pts
✓ Tokens (colores, tipografía, espaciado) desde la guía de E0-03. ✓ Componentes: botón, tarjeta de territorio, chip de nivel de alerta, banner de estado de datos ("hace 35 min"). ✓ Modo de alto contraste y escalado de fuente del sistema respetados.

**E1-03 · Onboarding sin cuenta** — P0 · 5 pts
Como ciudadano, quiero usar la app sin registrarme, eligiendo mi(s) municipio(s).
✓ Flujo: bienvenida → selección de municipio(s) → permiso de notificaciones (con explicación) → inicio. ✓ Funciona sin conceder ningún permiso. ✓ Selección persistida localmente.

**E1-04 · Capa de datos local y caché offline** — P0 · 5 pts
✓ MMKV/SQLite para última respuesta de cada endpoint con timestamp. ✓ Toda pantalla muestra datos cacheados + banner de antigüedad cuando no hay red. ✓ Reintentos con backoff.

**E1-05 · Accesibilidad base** — P1 · 3 pts
✓ Labels de lector de pantalla en las 5 pantallas núcleo. ✓ Contraste AA verificado. ✓ Targets táctiles ≥ 44 px.

---

## Épica E2 — BFF e integración de datos SAMA (Fase 1) — 29 pts

**E2-01 · API base del BFF y modelo de datos** — P0 · 5 pts
✓ NestJS + PostgreSQL/PostGIS con entidades: municipio, cuenca, estación, lectura, alerta, suscripción, reporte. ✓ API REST versionada (/v1) con OpenAPI. ✓ Seeds de municipios y cuencas del piloto.

**E2-02 · Conector de estaciones (ArcGIS/fuente validada en E0-02)** — P0 · 8 pts · depende de E0-02
Como BFF, debo ingerir lecturas de estaciones y normalizarlas.
✓ Ingesta programada con tolerancia a caídas de la fuente. ✓ Normalización de unidades y estados de sensor (activo/intermitente/caído). ✓ Alerta interna si una fuente deja de responder > 30 min.

**E2-03 · Endpoints de estaciones para la app** — P0 · 5 pts
✓ GET estaciones (GeoJSON compacto, filtrable por tipo/cuenca/bbox). ✓ GET detalle con serie 72 h re-muestreada. ✓ Respuestas < 50 KB típico; caché Redis con TTL por tipo de dato.

**E2-04 · Catálogo de contenido "¿Qué hago?" y directorios** — P0 · 3 pts
✓ CMS mínimo (tablas + panel admin) para recomendaciones, directorios de emergencia y puntos de encuentro por municipio. ✓ Endpoint de sincronización con versionado para descarga/actualización offline en la app.

**E2-05 · Observabilidad y salud** — P0 · 3 pts
✓ Logs estructurados, métricas (latencia, errores, frescura de datos por fuente), endpoint /health. ✓ Alertas a canal del equipo si staging/prod degradan.

**E2-06 · Seguridad del BFF** — P0 · 3 pts
✓ Rate limiting, CORS, cabeceras seguras. ✓ Autenticación por API key de app + JWT para panel admin con roles. ✓ Revisión de dependencias en CI.

**E2-07 · Despliegue productivo del BFF** — P1 · 2 pts
✓ Contenedores + IaC básica reproducible en el proveedor que defina la Gobernación. ✓ Backups automáticos de base de datos.

---

## Épica E3 — Mapa y estaciones en tiempo real (Fase 1) — 21 pts

**E3-01 · Mapa base con MapLibre** — P0 · 5 pts
✓ Mapa de Antioquia con tiles configurados, gestos estándar, ubicación del usuario (opt-in). ✓ Rendimiento fluido en gama baja (probado en dispositivo Android de referencia ≤ 2 GB RAM).

**E3-02 · Capa de estaciones con clustering** — P0 · 5 pts
✓ Íconos por tipo (nivel/pluvio/cámara) y color por estado. ✓ Clustering al alejar el zoom. ✓ Filtros por tipo y cuenca.

**E3-03 · Detalle de estación con gráfica** — P0 · 5 pts
Como usuario, quiero ver la tendencia de la estación para entender si la situación empeora.
✓ Bottom sheet con última lectura, flecha de tendencia y gráfica 24/72 h. ✓ Umbrales de referencia visibles cuando existan (definidos con Dagran). ✓ Imagen de cámara (si la estación tiene) con timestamp.

**E3-04 · Tarjetas "Mis territorios" en Inicio** — P0 · 3 pts
✓ Resumen por municipio suscrito: peor nivel de alerta activo + estado general de estaciones. ✓ Orden por severidad. ✓ Acceso directo al mapa centrado en ese municipio.

**E3-05 · Estados vacíos y de error del mapa** — P1 · 3 pts
✓ Mensajes claros cuando no hay estaciones en la zona, la fuente está caída o no hay red (con datos cacheados).

---

## Épica E4 — Alertas push (Fase 2) — 34 pts

**E4-01 · Motor de suscripciones** — P0 · 5 pts
✓ Registro de token FCM/APNs asociado a municipios/cuencas elegidos (sin cuenta). ✓ Suscripción a tópicos por territorio; actualización al cambiar selección. ✓ Baja automática de tokens inválidos.

**E4-02 · Ingesta del feed de alertas SAMA** — P0 · 5 pts · depende de E0-02
✓ Consumo del feed (push o polling ≤ 30 s) con deduplicación e idempotencia. ✓ Mapeo al protocolo de niveles de E0-04. ✓ Registro auditable de cada alerta ingerida.

**E4-03 · Despacho de notificaciones** — P0 · 8 pts
Como sistema, debo entregar la alerta a todos los suscritos del territorio en menos de 60 segundos.
✓ Despacho por tópicos FCM con prioridad alta; canal de notificación Android "Alertas SAMA" con sonido propio para nivel rojo. ✓ Reintentos y cola persistente (no se pierde despacho si el BFF se reinicia). ✓ Prueba de carga: 50.000 destinatarios < 60 s. ✓ Trazabilidad: métricas de enviadas/entregadas por alerta.

**E4-04 · Pantalla de detalle de alerta** — P0 · 5 pts
✓ Nivel, evento, territorio, hora de emisión y vigencia. ✓ Bloque "Qué hacer ahora" según tipo de evento + punto de encuentro del municipio. ✓ Botón de llamada a línea de emergencia local. ✓ Accesible desde push (deep link) incluso sin red (contenido esencial en el payload).

**E4-05 · Historial y centro de alertas** — P0 · 3 pts
✓ Lista de alertas recibidas/vigentes por territorio con estado (activa/finalizada). ✓ Badge en tab cuando hay alerta activa.

**E4-06 · Alertas por ubicación actual (opt-in)** — P1 · 5 pts
✓ Con permiso de ubicación, la app registra el municipio actual (geocodificación en BFF) y lo suscribe temporalmente. ✓ Nunca se almacena historial de ubicaciones; solo el municipio vigente. ✓ Explicación clara del permiso.

**E4-07 · [CONDICIONAL] Emisión manual de alertas para operador Dagran** — P0* · 3 pts
Solo si E0-02 concluye que no existe feed estructurado de alertas.
✓ Formulario en panel admin: territorio, nivel, tipo de evento, texto → dispara E4-03. ✓ Doble confirmación para nivel rojo; auditoría de quién emitió.

---

## Épica E5 — Contenido "¿Qué hago?" (Fase 1–2) — 13 pts

**E5-01 · Módulo de recomendaciones offline** — P0 · 5 pts
✓ Contenido por tipo de evento con pestañas antes/durante/después, empaquetado en la app y actualizable vía E2-04. ✓ Disponible 100% sin red. ✓ Lenguaje claro validado por el equipo social del SAMA.

**E5-02 · Directorio de emergencia por municipio** — P0 · 3 pts
✓ Teléfonos de CMGRD, bomberos, defensa civil por municipio piloto con botón de llamada directa. ✓ Editable desde panel admin.

**E5-03 · Puntos de encuentro por municipio piloto** — P1 · 3 pts
✓ Puntos cargados con Dagran, visibles en mapa y en detalle de alerta. ✓ Editable desde panel admin.

**E5-04 · Carga inicial de contenido real** — P0 · 2 pts
✓ Sesiones de levantamiento con Dagran; contenido de los 3 municipios piloto cargado y revisado.

---

## Épica E6 — Reporte ciudadano (Fase 2) — 16 pts

**E6-01 · Formulario de reporte** — P0 · 5 pts
Como ciudadano, quiero reportar lo que observo (foto + categoría + ubicación) en menos de 1 minuto.
✓ Foto desde cámara o galería (comprimida < 500 KB). ✓ Categorías: nivel del río, deslizamiento, obstrucción, otro. ✓ Ubicación automática con ajuste manual en mini-mapa. ✓ Alias y teléfono opcionales.

**E6-02 · Cola offline de reportes** — P0 · 3 pts
✓ Si no hay red, el reporte queda en cola y se envía automáticamente al reconectar, con estado visible para el usuario.

**E6-03 · Panel de moderación para Dagran** — P0 · 5 pts
✓ Lista web de reportes con foto, mapa, filtros por municipio/categoría/estado. ✓ Flujo: nuevo → en verificación → verificado/descartado, con notas internas. ✓ Roles (operador/admin).

**E6-04 · Anti-abuso básico** — P1 · 3 pts
✓ Rate limit por dispositivo, detección de duplicados cercanos (misma zona/categoría/hora), bloqueo manual desde panel.

---

## Épica E7 — Calidad, piloto y publicación (Fase 3) — 26 pts

**E7-01 · Suite de pruebas automatizadas** — P0 · 5 pts
✓ Unit tests en lógica crítica del BFF (suscripciones, despacho, ingesta) ≥ 80% cobertura. ✓ Tests de componentes clave de la app; smoke E2E (Maestro/Detox) del flujo onboarding → alerta.

**E7-02 · Analítica y monitoreo de la app** — P0 · 3 pts
✓ Crashlytics/Sentry. ✓ Eventos anónimos: alerta recibida/abierta, tiempo a apertura, uso por pantalla. ✓ Dashboard simple para el informe del piloto.

**E7-03 · Pruebas de campo en condiciones reales** — P0 · 5 pts
✓ Matriz de dispositivos (énfasis Android gama baja). ✓ Pruebas con red 3G/intermitente y modo avión en municipio piloto. ✓ Informe con defectos priorizados.

**E7-04 · Piloto cerrado con comunidad** — P0 · 5 pts
Como Dagran, quiero validar la app con líderes comunitarios reales antes de publicarla masivamente.
✓ ≥ 60 usuarios en 3 municipios durante ≥ 2 semanas (distribución por APK/TestFlight + taller de instalación aprovechando la red comunitaria del SAMA). ✓ Simulacro de alerta coordinado con Dagran. ✓ Encuesta de comprensión y utilidad; hallazgos convertidos en tickets.

**E7-05 · Endurecimiento post-piloto** — P0 · 5 pts
✓ Resolución de todos los defectos P0/P1 del piloto. ✓ Crash-free ≥ 99%. ✓ Re-verificación de criterios de éxito del MVP (sección 6 de la propuesta).

**E7-06 · Publicación en tiendas** — P0 · 3 pts
✓ Fichas de Google Play y App Store (textos, capturas, clasificación) a nombre de la cuenta institucional. ✓ Cumplimiento de políticas de permisos/ubicación de ambas tiendas. ✓ Lanzamiento por etapas en Play (staged rollout).

---

## Épica E8 — Cierre y transferencia (Fase 3) — 6 pts

**E8-01 · Documentación técnica y manual de operación** — P0 · 3 pts
✓ Arquitectura, runbooks (qué hacer si cae una fuente, cómo rotar credenciales), manual del panel admin.

**E8-02 · Transferencia de conocimiento al Dagran** — P0 · 2 pts
✓ ≥ 2 sesiones grabadas (técnica y operativa). ✓ Entrega de accesos, repositorio y tablero.

**E8-03 · Informe final del piloto** — P0 · 1 pt
✓ Métricas vs. criterios de éxito, aprendizajes y backlog recomendado para la fase 2.

---

## Distribución del esfuerzo

| Épica | Pts | Fase |
|---|---|---|
| E0 Descubrimiento y fundaciones | 24 | 0 |
| E1 Esqueleto y sistema de diseño | 21 | 1 |
| E2 BFF e integración de datos | 29 | 1 |
| E3 Mapa y estaciones | 21 | 1 |
| E4 Alertas push | 34 | 2 |
| E5 Contenido "¿Qué hago?" | 13 | 1–2 |
| E6 Reporte ciudadano | 16 | 2 |
| E7 Calidad, piloto y publicación | 26 | 3 |
| E8 Cierre y transferencia | 6 | 3 |
| **Total** | **190** | |

Dependencias críticas: **E0-02** desbloquea E2-02 y E4-02 (integración de datos) — por eso la fase 0 es innegociable. E4-03 (despacho) es el ticket de mayor riesgo técnico y se aborda al inicio de la fase 2 con su prueba de carga.
