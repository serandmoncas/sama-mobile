import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import { useColorScheme } from '@/components/useColorScheme';
import { PILOT_MUNICIPIOS } from '@/constants/Municipios';
import {
  getSelectedMunicipios,
  setSelectedMunicipios,
} from '@/lib/onboarding';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';

export default function MunicipiosScreen() {
  const { standalone } = useLocalSearchParams<{ standalone?: string }>();
  const isStandalone = standalone === 'true';
  const [selected, setSelected] = useState<string[]>([]);
  const theme = useColorScheme();
  const colors = Colors[theme];

  useEffect(() => {
    getSelectedMunicipios().then(setSelected);
  }, []);

  function toggle(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
  }

  async function handleContinue() {
    await setSelectedMunicipios(selected);
    if (isStandalone) {
      router.back();
    } else {
      router.push('/onboarding/notificaciones');
    }
  }

  return (
    <View style={styles.container}>
      {isStandalone && (
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.tint }}>Volver</Text>
        </Pressable>
      )}
      <Text style={styles.title}>Elige tu municipio</Text>
      {PILOT_MUNICIPIOS.map((name) => {
        const isSelected = selected.includes(name);
        return (
          <Pressable
            key={name}
            testID={`municipio-${name}`}
            onPress={() => toggle(name)}
            style={[
              styles.row,
              {
                borderColor: colors.border,
                backgroundColor: isSelected ? colors.surface : 'transparent',
              },
            ]}
          >
            <Text>{name}</Text>
            <Text>{isSelected ? '✓' : ''}</Text>
          </Pressable>
        );
      })}
      <Button label="Continuar" onPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    ...Typography.title,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
});
