jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { agregarReporte, getReportes } from '../reportes';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('getReportes es [] por defecto', async () => {
  expect(await getReportes()).toEqual([]);
});

test('agregarReporte persiste el reporte con estado pendiente', async () => {
  const reporte = await agregarReporte({
    fotoUri: 'file:///documento/reporte-1.jpg',
    categoria: 'nivel_rio',
    lngLat: [-75.5, 6.9],
    alias: null,
    telefono: null,
  });

  expect(reporte.estado).toBe('pendiente');
  expect(reporte.id).toBeTruthy();
  expect(reporte.fecha).toBeTruthy();

  const reportes = await getReportes();
  expect(reportes).toEqual([reporte]);
});

test('agregarReporte acumula varios reportes', async () => {
  await agregarReporte({
    fotoUri: 'file:///documento/reporte-1.jpg',
    categoria: 'nivel_rio',
    lngLat: [-75.5, 6.9],
    alias: null,
    telefono: null,
  });
  await agregarReporte({
    fotoUri: 'file:///documento/reporte-2.jpg',
    categoria: 'deslizamiento',
    lngLat: [-75.6, 7.0],
    alias: 'Juan',
    telefono: '3001234567',
  });

  const reportes = await getReportes();
  expect(reportes).toHaveLength(2);
  expect(reportes[1].alias).toBe('Juan');
});
