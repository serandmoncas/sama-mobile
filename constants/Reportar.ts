import type { ReportCategory } from '@/lib/reportes';

export const CATEGORIES: { id: ReportCategory; label: string }[] = [
  { id: 'nivel_rio', label: 'Nivel del río' },
  { id: 'deslizamiento', label: 'Deslizamiento' },
  { id: 'obstruccion', label: 'Obstrucción' },
  { id: 'otro', label: 'Otro' },
];

export const ANTIOQUIA_CENTER: [number, number] = [-75.5, 6.9];
export const ANTIOQUIA_ZOOM = 7;

export const MAX_PHOTO_BYTES = 500_000;
