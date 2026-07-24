export type AlertLevel = 'verde' | 'amarilla' | 'naranja' | 'roja';

// Colores semánticos de nivel de alerta. Fijos (no varían con el tema
// claro/oscuro de la app) — son insignias de estado, como un semáforo real.
// Contraste verificado contra WCAG AA (≥4.5:1) para el par fondo/texto:
//   verde:    #15803D + blanco  → 5.01:1
//   amarilla: #FACC15 + negro   → 13.71:1
//   naranja:  #C2410C + blanco  → 5.18:1
//   roja:     #B91C1C + blanco  → 6.47:1
// Provisional: reemplazar cuando exista la guía visual validada de E0-03.
export default {
  verde: { background: '#15803D', text: '#FFFFFF' },
  amarilla: { background: '#FACC15', text: '#000000' },
  naranja: { background: '#C2410C', text: '#FFFFFF' },
  roja: { background: '#B91C1C', text: '#FFFFFF' },
} satisfies Record<AlertLevel, { background: string; text: string }>;
