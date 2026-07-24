import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';
const SELECTED_MUNICIPIOS_KEY = 'selectedMunicipios';
const NOTIFICATIONS_GRANTED_KEY = 'notificationsGranted';

export async function getOnboardingCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
  return value === 'true';
}

export async function setOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
}

export async function getNotificationsGranted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(NOTIFICATIONS_GRANTED_KEY);
  return value === 'true';
}

export async function setNotificationsGranted(granted: boolean): Promise<void> {
  await AsyncStorage.setItem(
    NOTIFICATIONS_GRANTED_KEY,
    granted ? 'true' : 'false',
  );
}

export async function getSelectedMunicipios(): Promise<string[]> {
  const value = await AsyncStorage.getItem(SELECTED_MUNICIPIOS_KEY);
  return value ? JSON.parse(value) : [];
}

export async function setSelectedMunicipios(
  municipios: string[],
): Promise<void> {
  await AsyncStorage.setItem(
    SELECTED_MUNICIPIOS_KEY,
    JSON.stringify(municipios),
  );
}
