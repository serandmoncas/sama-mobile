import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';

export default function BienvenidaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">SAMA</Text>
      <Text style={styles.subtitle}>
        Alertas de riesgo hidrometeorológico para tu municipio, directo a tu
        celular.
      </Text>
      <Button
        label="Comenzar"
        onPress={() => router.push('/onboarding/municipios')}
      />
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
    fontSize: 34,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
});
