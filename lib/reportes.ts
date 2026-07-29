import AsyncStorage from '@react-native-async-storage/async-storage';

const REPORTES_KEY = 'reportesPendientes';

export type CategoriaReporte =
  'nivel_rio' | 'deslizamiento' | 'obstruccion' | 'otro';

export type Reporte = {
  id: string;
  fotoUri: string;
  categoria: CategoriaReporte;
  lngLat: [number, number];
  alias: string | null;
  telefono: string | null;
  fecha: string;
  estado: 'pendiente';
};

export async function getReportes(): Promise<Reporte[]> {
  const value = await AsyncStorage.getItem(REPORTES_KEY);
  return value ? JSON.parse(value) : [];
}

export async function agregarReporte(
  datos: Omit<Reporte, 'id' | 'fecha' | 'estado'>,
): Promise<Reporte> {
  const reportes = await getReportes();
  const reporte: Reporte = {
    ...datos,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    fecha: new Date().toISOString(),
    estado: 'pendiente',
  };
  await AsyncStorage.setItem(
    REPORTES_KEY,
    JSON.stringify([...reportes, reporte]),
  );
  return reporte;
}
