export type EventoId = 'inundacion' | 'creciente_subita' | 'avenida_torrencial';
export type Fase = 'antes' | 'durante' | 'despues';

export const EVENTOS: { id: EventoId; label: string }[] = [
  { id: 'inundacion', label: 'Inundación' },
  { id: 'creciente_subita', label: 'Creciente súbita' },
  { id: 'avenida_torrencial', label: 'Avenida torrencial' },
];

export const FASES: { id: Fase; label: string }[] = [
  { id: 'antes', label: 'Antes' },
  { id: 'durante', label: 'Durante' },
  { id: 'despues', label: 'Después' },
];

function marcador(eventoLabel: string, faseLabel: string): string[] {
  return [
    `[Contenido pendiente de validación por el equipo social del SAMA — ${eventoLabel} / ${faseLabel}]`,
  ];
}

export const CONTENIDO: Record<EventoId, Record<Fase, string[]>> = {
  inundacion: {
    antes: marcador('Inundación', 'Antes'),
    durante: marcador('Inundación', 'Durante'),
    despues: marcador('Inundación', 'Después'),
  },
  creciente_subita: {
    antes: marcador('Creciente súbita', 'Antes'),
    durante: marcador('Creciente súbita', 'Durante'),
    despues: marcador('Creciente súbita', 'Después'),
  },
  avenida_torrencial: {
    antes: marcador('Avenida torrencial', 'Antes'),
    durante: marcador('Avenida torrencial', 'Durante'),
    despues: marcador('Avenida torrencial', 'Después'),
  },
};
