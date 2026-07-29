import AsyncStorage from '@react-native-async-storage/async-storage';

const REPORTS_KEY = 'reportesPendientes';

export type ReportCategory =
  'nivel_rio' | 'deslizamiento' | 'obstruccion' | 'otro';

export type Report = {
  id: string;
  photoUri: string;
  categoria: ReportCategory;
  lngLat: [number, number];
  alias: string | null;
  phone: string | null;
  date: string;
  status: 'pendiente';
};

export async function getReports(): Promise<Report[]> {
  const value = await AsyncStorage.getItem(REPORTS_KEY);
  return value ? JSON.parse(value) : [];
}

export async function addReport(
  data: Omit<Report, 'id' | 'date' | 'status'>,
): Promise<Report> {
  const reports = await getReports();
  const report: Report = {
    ...data,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: new Date().toISOString(),
    status: 'pendiente',
  };
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify([...reports, report]));
  return report;
}
