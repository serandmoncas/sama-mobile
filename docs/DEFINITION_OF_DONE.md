# Definition of Done

Checklist aplicable a cualquier ticket de este repo antes de considerarlo
entregado (adaptado de la guía de metodología del proyecto, Parte VIII y XIII).

- [ ] Todos los criterios de aceptación de la spec están cubiertos por prueba.
- [ ] Pasó los niveles aplicables: compila/typecheck → unitarias → integración → E2E,
      según lo que ese ticket necesite.
- [ ] Se ejecutó de verdad al menos una vez (no solo compiló) — corrido a mano o
      verificado con una prueba automática real.
- [ ] Los fallos, si los hubo durante el desarrollo, se reportaron con su salida real
      — nunca "debería funcionar".
- [ ] Las decisiones y _gotchas_ no obvios quedaron registrados (ADR si es una decisión
      de arquitectura; comentario si es un detalle puntual).
- [ ] La spec quedó actualizada si se aprendió algo que la cambia.
- [ ] El ticket se cerró con detalle suficiente para que alguien externo entienda
      qué se hizo y por qué.
- [ ] Las acciones irreversibles (merge a main, push, borrar, publicar) tuvieron
      aprobación explícita del humano — nunca delegadas al agente.
