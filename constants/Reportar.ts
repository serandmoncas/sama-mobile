import type { CategoriaReporte } from '@/lib/reportes';

export const CATEGORIAS: { id: CategoriaReporte; label: string }[] = [
  { id: 'nivel_rio', label: 'Nivel del río' },
  { id: 'deslizamiento', label: 'Deslizamiento' },
  { id: 'obstruccion', label: 'Obstrucción' },
  { id: 'otro', label: 'Otro' },
];

export const ANTIOQUIA_CENTER: [number, number] = [-75.5, 6.9];
export const ANTIOQUIA_ZOOM = 7;

export const MAX_FOTO_BYTES = 500_000;
