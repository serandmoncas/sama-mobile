# ADR-0001: Repos separados para la app y el BFF

**Estado:** Aceptada
**Fecha:** 2026-07-22

## Contexto

El backlog original (ticket E0-05 en `docs/proposal/backlog.md`) propone un monorepo
con la app Expo/TypeScript y el esqueleto del BFF NestJS juntos desde el inicio.

Dos factores pesan en contra de esa opción para este proyecto:

1. El repo ya existe con el nombre `sama-mobile`, no `sama-monorepo` — la intención
   original parece ser un repo de app.
2. El ticket E0-02 (inventario y prueba de las fuentes de datos del Dagran/G-LIMA)
   es un riesgo abierto que bloquea el trabajo de integración del BFF (E2-02, E4-02)
   pero no bloquea el trabajo de esqueleto de la app (navegación, sistema de diseño,
   capa offline). Compartir un monorepo acopla el estado de ambos aunque su avance
   real sea independiente en las primeras semanas.

## Decisión

`sama-mobile` contiene únicamente la app cliente Expo/TypeScript. El BFF NestJS
vivirá en un repositorio aparte (nombre a definir, p. ej. `sama-bff`), creado cuando
arranque el trabajo de la épica E2.

## Consecuencias

- Cuando cambie el contrato de la API entre app y BFF, el cambio requiere coordinar
  dos PRs en dos repos en vez de uno — costo aceptado a cambio de desacoplar las
  cadencias de release (la app pasa por revisión de tiendas; el BFF se despliega
  continuo).
- El CI de este repo (`sama-mobile`) no necesita ejecutar ni el toolchain de NestJS
  ni levantar PostgreSQL/PostGIS — se mantiene simple y rápido.
- Cuando se cree el repo del BFF, su propio README/CLAUDE.md deberá enlazar de vuelta
  a este ADR para que quede claro por qué son dos repos y no uno.
