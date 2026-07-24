import { StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import {
  setNotificationsGranted,
  setOnboardingCompleted,
} from '@/lib/onboarding';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';

async function finish() {
  await setOnboardingCompleted();
  router.replace('/(tabs)');
}

export default function NotificacionesScreen() {
  async function handlePermitir() {
    let granted = false;
    try {
      const result = await Notifications.requestPermissionsAsync();
      granted = result.granted;
    } catch {
      granted = false;
    } finally {
      await setNotificationsGranted(granted);
      await finish();
    }
  }

  async function handleAhoraNo() {
    await finish();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Recibe alertas al instante
      </Text>
      <Text style={styles.body}>
        Activa las notificaciones para enterarte apenas se emita una alerta en
        tu municipio. Puedes cambiar esto después desde los ajustes de tu
        celular.
      </Text>
      <Button label="Permitir" onPress={handlePermitir} />
      <Button label="Ahora no" variant="secondary" onPress={handleAhoraNo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  title: {
    ...Typography.title,
    textAlign: 'center',
  },
  body: {
    ...Typography.body,
    textAlign: 'center',
  },
});
