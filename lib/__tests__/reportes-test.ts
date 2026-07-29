jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { addReport, getReports } from '../reportes';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('getReportes es [] por defecto', async () => {
  expect(await getReports()).toEqual([]);
});

test('agregarReporte persiste el reporte con estado pendiente', async () => {
  const report = await addReport({
    photoUri: 'file:///documento/reporte-1.jpg',
    categoria: 'nivel_rio',
    lngLat: [-75.5, 6.9],
    alias: null,
    phone: null,
  });

  expect(report.status).toBe('pendiente');
  expect(report.id).toBeTruthy();
  expect(report.date).toBeTruthy();

  const reports = await getReports();
  expect(reports).toEqual([report]);
});

test('agregarReporte acumula varios reportes', async () => {
  await addReport({
    photoUri: 'file:///documento/reporte-1.jpg',
    categoria: 'nivel_rio',
    lngLat: [-75.5, 6.9],
    alias: null,
    phone: null,
  });
  await addReport({
    photoUri: 'file:///documento/reporte-2.jpg',
    categoria: 'deslizamiento',
    lngLat: [-75.6, 7.0],
    alias: 'Juan',
    phone: '3001234567',
  });

  const reports = await getReports();
  expect(reports).toHaveLength(2);
  expect(reports[1].alias).toBe('Juan');
});
