jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getNotificationsGranted,
  getOnboardingCompleted,
  getSelectedMunicipios,
  setNotificationsGranted,
  setOnboardingCompleted,
  setSelectedMunicipios,
} from '../onboarding';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('getOnboardingCompleted es false por defecto', async () => {
  expect(await getOnboardingCompleted()).toBe(false);
});

test('setOnboardingCompleted lo deja en true', async () => {
  await setOnboardingCompleted();
  expect(await getOnboardingCompleted()).toBe(true);
});

test('getSelectedMunicipios es [] por defecto', async () => {
  expect(await getSelectedMunicipios()).toEqual([]);
});

test('setSelectedMunicipios persiste la lista', async () => {
  await setSelectedMunicipios(['Zaragoza', 'Turbo']);
  expect(await getSelectedMunicipios()).toEqual(['Zaragoza', 'Turbo']);
});

test('getNotificationsGranted es false por defecto', async () => {
  expect(await getNotificationsGranted()).toBe(false);
});

test('setNotificationsGranted persiste el valor', async () => {
  await setNotificationsGranted(true);
  expect(await getNotificationsGranted()).toBe(true);

  await setNotificationsGranted(false);
  expect(await getNotificationsGranted()).toBe(false);
});
