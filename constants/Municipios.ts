// Municipios con estaciones SAMA confirmadas — ver docs/specs/2026-07-24-onboarding.md.
export const MUNICIPIOS_CON_COBERTURA_CONFIRMADA = [
  'Zaragoza',
  'Carepa',
  'Turbo',
] as const;

// Valle de Aburrá + los 15 más poblados del resto de Antioquia (población DANE,
// ver docs/specs/2026-07-24-municipios-expansion.md). Seleccionables en la app,
// pero sin estaciones SAMA confirmadas todavía — se muestra un aviso.
export const MUNICIPIOS_SIN_COBERTURA_CONFIRMADA = [
  'Medellín',
  'Bello',
  'Itagüí',
  'Envigado',
  'Sabaneta',
  'La Estrella',
  'Caldas',
  'Copacabana',
  'Girardota',
  'Barbosa',
  'Apartadó',
  'Rionegro',
  'Caucasia',
  'Chigorodó',
  'Necoclí',
  'El Carmen de Viboral',
  'Marinilla',
  'La Ceja',
  'Guarne',
  'El Bagre',
  'Puerto Berrío',
  'Yarumal',
  'Tarazá',
  'Andes',
  'Urrao',
] as const;

export const MUNICIPIOS = [
  ...MUNICIPIOS_CON_COBERTURA_CONFIRMADA,
  ...MUNICIPIOS_SIN_COBERTURA_CONFIRMADA,
] as const;

export function tieneCoberturaConfirmada(municipio: string): boolean {
  return (MUNICIPIOS_CON_COBERTURA_CONFIRMADA as readonly string[]).includes(
    municipio,
  );
}
