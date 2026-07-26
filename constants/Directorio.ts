import { MUNICIPIOS } from './Municipios';

export type EntidadId = 'cmgrd' | 'bomberos' | 'defensa_civil';

export type EntidadDirectorio = {
  id: EntidadId;
  label: string;
  telefono: string | null;
};

const ENTIDADES: { id: EntidadId; label: string }[] = [
  { id: 'cmgrd', label: 'CMGRD' },
  { id: 'bomberos', label: 'Bomberos' },
  { id: 'defensa_civil', label: 'Defensa Civil' },
];

export const DIRECTORIO: Record<string, EntidadDirectorio[]> =
  Object.fromEntries(
    MUNICIPIOS.map((municipio) => [
      municipio,
      ENTIDADES.map((entidad) => ({ ...entidad, telefono: null })),
    ]),
  );
