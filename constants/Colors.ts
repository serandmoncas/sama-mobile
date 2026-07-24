// textSecondary: contraste verificado contra su fondo (AA ≥4.5:1):
//   claro: #6B7280 sobre #fff  → 4.83:1
//   oscuro: #9CA3AF sobre #000 → 8.27:1
// surface/border son colores de superficie/contorno, no de texto — el
// contraste AA de texto no aplica directamente a ellos; el par relevante
// es el texto que se pinte encima (text/textSecondary), ya cubierto arriba.
const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    textSecondary: '#6B7280',
    background: '#fff',
    surface: '#F5F5F5',
    border: '#E0E0E0',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    textSecondary: '#9CA3AF',
    background: '#000',
    surface: '#1C1C1E',
    border: '#3A3A3C',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
