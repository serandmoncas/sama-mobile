import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import { TerritoryCard } from '@/components/TerritoryCard';
import {
  getOnboardingCompleted,
  getSelectedMunicipios,
} from '@/lib/onboarding';
import Spacing from '@/constants/Spacing';

export default function InicioScreen() {
  const [status, setStatus] = useState<
    'loading' | 'needs-onboarding' | 'ready'
  >('loading');
  const [municipios, setMunicipios] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const completed = await getOnboardingCompleted();
        if (cancelled) return;
        if (!completed) {
          setStatus('needs-onboarding');
          return;
        }
        const selected = await getSelectedMunicipios();
        if (cancelled) return;
        setMunicipios(selected);
        setStatus('ready');
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  if (status === 'loading') {
    return <View style={styles.container} />;
  }

  if (status === 'needs-onboarding') {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Mis territorios
      </Text>
      {municipios.length === 0 ? (
        <Text>Aún no has añadido ningún municipio.</Text>
      ) : (
        municipios.map((name) => (
          <TerritoryCard key={name} name={name} alertLevel="verde" />
        ))
      )}
      <Button
        label="+ Añadir municipio"
        variant="secondary"
        onPress={() => router.push('/onboarding/municipios?standalone=true')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
