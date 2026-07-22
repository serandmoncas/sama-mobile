# Propuesta de MVP — Aplicación móvil SAMA
## Sistema de Alerta y Monitoreo de Antioquia en el bolsillo de cada antioqueño

**Preparada para:** Dagran — Departamento Administrativo de Gestión del Riesgo de Desastres de Antioquia
**Preparada por:** Sergio Monsalve
**Fecha:** Julio de 2026
**Versión:** 1.0 (borrador para discusión)

---

## 1. Resumen ejecutivo

El SAMA (Sistema de Alerta y Monitoreo de Antioquia) es hoy un referente nacional en gestión del riesgo: más de 36 municipios instrumentados, ~118 equipos de monitoreo (estaciones meteorológicas, pluviómetros, sensores de nivel, cámaras y alarmas comunitarias) y más de 2.600 alertas generadas entre 2023 y 2024. Sin embargo, su cara pública principal es el Geoportal web, un canal que exige que el ciudadano busque la información de forma activa.

En una emergencia por creciente súbita, los minutos cuentan y **la información debe llegar al ciudadano, no al revés**. Esta propuesta plantea el desarrollo de un MVP de aplicación móvil (Android y iOS) construida en React Native que convierta al SAMA en un canal directo de protección de la vida: **alertas push georreferenciadas por municipio y cuenca, consulta de estaciones en tiempo real y recomendaciones claras de actuación y evacuación**.

**Alcance del MVP en una frase:** una app ciudadana que notifica alertas de lluvia y nivel de agua del territorio que el usuario elige (o donde se encuentra), muestra el estado de las estaciones SAMA en un mapa y le dice a la persona qué hacer antes, durante y después de una emergencia.

**Parámetros generales propuestos** (detallados en las secciones 6 y 7):

| Parámetro | Propuesta |
|---|---|
| Plataformas | Android + iOS desde una sola base de código (React Native) |
| Duración del MVP | 16 semanas (4 fases) |
| Equipo | 3–4 personas (núcleo pequeño y senior) |
| Inversión estimada | COP $170M – $230M (rango, ver sección 7) |
| Piloto sugerido | 3 municipios con instrumentación madura (p. ej. Zaragoza, Carepa, Turbo) |

---

## 2. Contexto y problema

### 2.1 Lo que ya existe

- **Instrumentación:** red de estaciones meteorológicas, pluviómetros, sensores de nivel, cámaras y alarmas comunitarias en ~36 municipios, operada por el Dagran con apoyo de la Universidad de Antioquia (G-LIMA) y corporaciones como Corpourabá.
- **Geoportal SAMA:** plataforma pública web con datos en tiempo real, montada sobre el ecosistema ArcGIS Online de la Gobernación de Antioquia.
- **Componente comunitario:** más de 6.000 personas capacitadas en 65 comunidades; la comunidad ya conoce el sistema y confía en él.

### 2.2 La brecha

1. **El canal es "pull", no "push".** El geoportal requiere que el ciudadano entre a consultar. En una creciente súbita nocturna, nadie está mirando un portal web.
2. **La web móvil no es el medio natural del territorio.** En zonas rurales con conectividad intermitente, una app con notificaciones push, contenido cacheado y bajo consumo de datos es mucho más resiliente que un portal.
3. **La alerta sin instrucción no protege.** El valor no está solo en decir "el río está subiendo", sino en decir **qué hacer**: rutas, puntos de encuentro, teléfonos de emergencia del municipio.
4. **No hay canal de doble vía.** Los ciudadanos que ya participan en los procesos comunitarios del SAMA no tienen una forma digital sencilla de reportar lo que observan en campo.

### 2.3 Por qué ahora

El sistema ya genera las alertas (1.603 por lluvia y 1.075 por nivel entre mayo 2023 y septiembre 2024); el costo marginal de llevarlas al celular del ciudadano es bajo comparado con la inversión ya hecha en instrumentación. La app es la **última milla** de una infraestructura que ya funciona.

---

## 3. Alcance funcional del MVP

Principio rector: **hacer pocas cosas, que protejan vidas, y hacerlas muy bien.** Todo lo que no contribuya directamente a que una alerta llegue y se entienda queda fuera del MVP (ver 3.3).

### 3.1 Funcionalidades incluidas (MVP)

**F1. Alertas push georreferenciadas** — el corazón del MVP
- Suscripción por municipio y/o cuenca (multi-selección: "mi casa", "la finca", "donde estudian mis hijos").
- Opción de alertas por ubicación actual (geolocalización opt-in).
- Niveles de alerta visualmente inequívocos (verde / amarilla / naranja / roja) con vibración y sonido diferenciado para alerta roja.
- Historial de alertas recibidas.

**F2. Mapa de estaciones en tiempo real**
- Mapa del departamento con las estaciones SAMA (pluviómetros, sensores de nivel, cámaras).
- Detalle por estación: última lectura, tendencia de las últimas 24–72 h (gráfica simple), estado del sensor.
- Filtros por tipo de estación y por cuenca.

**F3. "¿Qué hago?" — módulo de recomendaciones**
- Contenido offline (empaquetado en la app) de preparación y respuesta: antes / durante / después, por tipo de evento (inundación, creciente súbita, avenida torrencial).
- Directorio de emergencia por municipio: líneas del consejo municipal de gestión del riesgo, bomberos, defensa civil.
- Puntos de encuentro por municipio piloto (cargados con el Dagran durante la fase de contenido).

**F4. Reporte ciudadano (versión mínima)**
- Formulario simple: foto + ubicación + categoría (nivel del río, deslizamiento, obstrucción de cauce) + descripción corta.
- Los reportes llegan a un panel interno básico para el equipo Dagran (moderación y verificación manual).
- Este módulo siembra la doble vía sin comprometer el alcance: en el MVP no hay publicación pública de reportes.

**F5. Fundamentos transversales**
- Funcionamiento con conectividad intermitente: última información conocida cacheada con marca de tiempo visible ("datos de hace 35 min").
- Accesibilidad: textos grandes, alto contraste, lenguaje claro (nivel de lectura general), compatibilidad con lectores de pantalla.
- Analítica de uso anónima para medir el piloto (aperturas de alerta, tiempo hasta apertura).

### 3.2 Usuarios y casos de uso principales

| Usuario | Caso de uso | Funcionalidad |
|---|---|---|
| Habitante de zona ribereña | Recibir alerta roja a las 2 a. m. y saber si evacuar | F1 + F3 |
| Líder comunitario capacitado por SAMA | Monitorear la quebrada de su vereda y reportar lo que ve | F2 + F4 |
| Consejo municipal de gestión del riesgo | Verificar reportes ciudadanos y estado de sensores | F2 + panel de F4 |
| Familiar en Medellín | Seguir la situación del municipio donde vive su familia | F1 (multi-municipio) + F2 |

### 3.3 Explícitamente fuera del MVP (candidatos a fase 2)

Chat o mensajería comunitaria; publicación pública de reportes ciudadanos; predicción hidrológica en la app (los modelos siguen en el backend del SAMA); versión institucional completa para gestores del riesgo; soporte multilenguaje (se deja preparada la estructura); integración con alarmas físicas comunitarias; widgets de pantalla de inicio.

---

## 4. Arquitectura técnica

### 4.1 Vista general

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA MÓVIL (React Native)                │
│  App Android / iOS — Expo + TypeScript                      │
│  UI (mapa, alertas, contenido offline) · caché local        │
│  (SQLite/MMKV) · Expo Notifications (FCM/APNs)              │
└───────────────▲─────────────────────────────▲───────────────┘
                │ HTTPS/JSON                  │ Push
┌───────────────┴─────────────────────────────┴───────────────┐
│              BACKEND INTERMEDIO (BFF) — Node.js/NestJS      │
│  API REST/JSON versionada · normalización de datos          │
│  Motor de suscripciones y despacho de notificaciones (FCM)  │
│  Caché (Redis) · Panel admin básico (reportes ciudadanos)   │
│  PostgreSQL + PostGIS (suscripciones, reportes, catálogo)   │
└───────────────▲─────────────────────────────────────────────┘
                │ Integración (REST / servicios ArcGIS)
┌───────────────┴─────────────────────────────────────────────┐
│                 FUENTES DE DATOS SAMA (existentes)          │
│  Geoportal / ArcGIS Online de la Gobernación · telemetría   │
│  de estaciones · sistema de alertas del Dagran/G-LIMA       │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Decisiones y justificación

**React Native con Expo + TypeScript.** Una sola base de código para Android y iOS reduce costo y tiempo ~40% frente a desarrollo nativo doble. Expo aporta actualizaciones OTA (EAS Update) — crítico para corregir contenido o errores sin esperar revisión de tiendas — y un pipeline de builds (EAS Build) reproducible. Android es prioridad 1 por penetración en el territorio; iOS sale de la misma base.

**Backend intermedio (BFF) propio.** No se conecta la app directamente a los servicios del geoportal, por tres razones: (1) **desacople** — si el Dagran cambia de plataforma GIS, la app no se toca; (2) **eficiencia** — respuestas compactas y cacheadas para redes 3G rurales, en lugar de payloads GIS pesados; (3) **el push lo exige** — las suscripciones por municipio/cuenca y el despacho de notificaciones necesitan un servidor propio de todos modos. Stack: Node.js (NestJS), PostgreSQL + PostGIS, Redis, desplegado en nube (según lineamientos de la Gobernación; compatible con contenedores en cualquier proveedor).

**Notificaciones push.** Firebase Cloud Messaging (Android) y APNs (iOS) vía Expo Notifications. Tópicos por municipio/cuenca para despacho masivo eficiente + tokens individuales para alertas por geolocalización. Objetivo de latencia: < 60 segundos entre emisión de la alerta en el SAMA y recepción en el dispositivo.

**Mapas.** MapLibre GL (open source, sin costos de licencia por uso) con tiles de un proveedor económico o de la propia infraestructura ArcGIS de la Gobernación. Capa de estaciones servida por el BFF en GeoJSON compacto.

**Supuesto clave y riesgo principal (transparencia):** el MVP asume que el Dagran/G-LIMA puede exponer al BFF (a) el feed de alertas emitidas y (b) las lecturas de estaciones, vía servicios ArcGIS REST existentes, base de datos o un endpoint acordado. **La fase 0 valida exactamente esto** antes de comprometer el cronograma. Si no existe un feed estructurado de alertas, el MVP incluye como alternativa un módulo mínimo de emisión manual de alertas para el operador del Dagran (contemplado en el backlog como ticket condicional).

### 4.3 Seguridad y datos personales

- Registro **sin fricción**: la app funciona sin crear cuenta; solo se pide municipio de interés. El reporte ciudadano pide un alias y teléfono opcional.
- Cumplimiento de la Ley 1581 de 2012 (habeas data): minimización de datos, política de tratamiento visible, geolocalización estrictamente opt-in y nunca almacenada como historial de ubicaciones.
- Cifrado en tránsito (TLS), tokens de push protegidos, panel admin con autenticación y roles.

---

## 5. Wireframes del MVP (bocetos)

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ ⛅ SAMA        ⚙️   │  │ 🗺️ Mapa             │  │ 🔴 ALERTA ROJA      │
│─────────────────────│  │─────────────────────│  │─────────────────────│
│ MIS TERRITORIOS     │  │  [mapa Antioquia]   │  │ Creciente súbita    │
│ ┌─────────────────┐ │  │   ● estación nivel  │  │ Río Nechí — Zaragoza│
│ │ Zaragoza    🔴  │ │  │   ▲ pluviómetro     │  │ Emitida: 02:14 a.m. │
│ │ Nivel: subiendo │ │  │   ◆ cámara          │  │─────────────────────│
│ └─────────────────┘ │  │─────────────────────│  │ QUÉ HACER AHORA:    │
│ ┌─────────────────┐ │  │ Filtros:            │  │ 1. Aléjese del río  │
│ │ Carepa      🟢  │ │  │ [Nivel][Lluvia][📷] │  │ 2. Punto encuentro: │
│ └─────────────────┘ │  │─────────────────────│  │    Escuela La Y     │
│ [+ Añadir municipio]│  │ Est. Río Nechí      │  │ 3. Lleve documentos │
│─────────────────────│  │ 3.2 m ↑ hace 10 min │  │─────────────────────│
│ 🏠  🗺️  🔔  ❓  📤 │  │ [ver gráfica 72h]   │  │ [📞 Emergencias]    │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
   Inicio                    Mapa + detalle           Detalle de alerta

┌─────────────────────┐  ┌─────────────────────┐
│ ❓ ¿Qué hago?       │  │ 📤 Reportar         │
│─────────────────────│  │─────────────────────│
│ [Inundación]        │  │ [📷 Tomar foto]     │
│ [Creciente súbita]  │  │ Categoría:          │
│ [Avenida torrencial]│  │ (•) Nivel del río   │
│─────────────────────│  │ ( ) Deslizamiento   │
│ ANTES │DURANTE│DESP.│  │ ( ) Obstrucción     │
│ ✓ Conozca su ruta   │  │ Descripción:        │
│ ✓ Kit de emergencia │  │ [____________]      │
│ ✓ Acuerde punto de  │  │ 📍 Ubicación auto   │
│   encuentro familiar│  │─────────────────────│
│ (disponible offline)│  │ [Enviar al Dagran]  │
└─────────────────────┘  └─────────────────────┘
    Contenido offline        Reporte ciudadano
```

En la fase 0 estos bocetos se convierten en un prototipo navegable en Figma, validado con el equipo del Dagran y, idealmente, con líderes comunitarios de un municipio piloto.

---

## 6. Plan de trabajo: fases y cronograma (16 semanas)

```
Semana        1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16
Fase 0        ██ ██
Fase 1              ██ ██ ██ ██ ██ ██
Fase 2                                ██ ██ ██ ██
Fase 3                                            ██ ██ ██ ██
```

**Fase 0 — Descubrimiento y validación técnica (semanas 1–2)**
Talleres con Dagran/G-LIMA; inventario y prueba real de las fuentes de datos (servicios ArcGIS, feed de alertas); prototipo Figma validado; definición del protocolo de niveles de alerta en la app; acta de alcance cerrado. *Entregable: documento de arquitectura validada + prototipo + backlog priorizado definitivo.*

**Fase 1 — Núcleo de la app (semanas 3–8)**
BFF con integración de estaciones; app con mapa en tiempo real, detalle de estación con gráficas, módulo "¿Qué hago?" offline y estructura de navegación. *Entregable: build interna (TestFlight / APK) con F2 y F3 funcionales sobre datos reales.*

**Fase 2 — Alertas push y reporte ciudadano (semanas 9–12)**
Motor de suscripciones, integración del feed de alertas, despacho FCM/APNs, pantallas de alerta, historial; formulario de reporte ciudadano y panel admin básico. *Entregable: build candidata con F1 y F4 completas; prueba de carga de despacho de notificaciones.*

**Fase 3 — Piloto, endurecimiento y publicación (semanas 13–16)**
Piloto cerrado en 3 municipios con líderes comunitarios (aprovechando la red social ya construida por el SAMA); corrección sobre retroalimentación real; pruebas de campo con conectividad limitada; publicación en Google Play y App Store; entrega de documentación y transferencia de conocimiento al Dagran. *Entregable: app publicada + informe de piloto con métricas + manual de operación.*

**Criterios de éxito del MVP (medibles en el piloto)**
- ≥ 80% de las alertas emitidas llegan al dispositivo en < 60 s.
- ≥ 50% de usuarios del piloto abren la alerta en < 10 min.
- App funcional (última información cacheada) sin conectividad.
- ≥ 30 reportes ciudadanos recibidos y gestionados durante el piloto.
- Crash-free rate ≥ 99% en las builds del piloto.

---

## 7. Equipo y estimación de inversión

### 7.1 Equipo propuesto (núcleo pequeño y senior)

| Rol | Dedicación | Duración |
|---|---|---|
| Líder técnico / desarrollador React Native senior | 100% | 16 semanas |
| Desarrollador backend (Node.js/PostGIS) | 100% | 14 semanas |
| Desarrollador React Native | 100% | 12 semanas (fases 1–3) |
| Diseñador UX/UI | 50% | 8 semanas (concentrado en fases 0–1) |
| QA / pruebas de campo | 50% | 8 semanas (fases 2–3) |

### 7.2 Estimación de inversión (COP, orden de magnitud)

| Concepto | Rango estimado |
|---|---|
| Equipo de desarrollo (según 7.1, tarifas mercado colombiano) | $150M – $200M |
| Diseño UX/UI y validación con comunidad | $12M – $18M |
| Infraestructura año 1 (nube BFF, base de datos, FCM, tiles de mapa) | $6M – $10M |
| Cuentas de tiendas, certificados, herramientas (Figma, EAS, monitoreo) | $2M – $4M |
| **Total MVP** | **$170M – $230M** |

Notas: (1) rangos ajustables según modalidad de contratación (equipo propio, freelance, mixto) y tarifas que se acuerden; (2) la infraestructura recurrente pos-MVP se estima en $500K – $900K/mes a escala de piloto; el costo de FCM/APNs es cero; (3) frente a la inversión ya realizada en instrumentación (miles de millones de pesos), el MVP representa la fracción que convierte esa infraestructura en protección directa al ciudadano.

---

## 8. Evolución posterior al MVP (visión)

Fase 2 (post-piloto): expansión a todos los municipios instrumentados; módulo institucional para consejos municipales de gestión del riesgo; publicación curada de reportes ciudadanos; widgets y integración con alarmas comunitarias físicas. Fase 3: predicción en la app (aprovechando los modelos hidrológicos de la UdeA), multilenguaje, integración con otros sistemas departamentales y nacionales (UNGRD).

---

## 9. Próximos pasos propuestos

1. Reunión de presentación de esta propuesta con el equipo Dagran (60 min).
2. Sesión técnica con G-LIMA/operadores del geoportal para validar acceso a datos (fase 0 depende de esto).
3. Ajuste de alcance/presupuesto según retroalimentación y firma de acta de inicio.

---

*Documento acompañado por el anexo **"Backlog del MVP — tickets detallados"** con las épicas, historias de usuario, criterios de aceptación y estimaciones que soportan el cronograma de la sección 6.*
