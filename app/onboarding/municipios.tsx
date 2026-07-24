import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import { useColorScheme } from '@/components/useColorScheme';
import { MUNICIPIOS, tieneCoberturaConfirmada } from '@/constants/Municipios';
import { getSelectedMunicipios, setSelectedMunicipios } from '@/lib/onboarding';
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
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          style={styles.volver}
        >
          <Text style={{ color: colors.tint }}>Volver</Text>
        </Pressable>
      )}
      <Text style={styles.title} accessibilityRole="header">
        Elige tu municipio
      </Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
        {MUNICIPIOS.map((name) => {
          const isSelected = selected.includes(name);
          const coberturaConfirmada = tieneCoberturaConfirmada(name);
          return (
            <Pressable
              key={name}
              testID={`municipio-${name}`}
              onPress={() => toggle(name)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${name}, ${isSelected ? 'seleccionado' : 'no seleccionado'}`}
              style={[
                styles.row,
                {
                  borderColor: colors.border,
                  backgroundColor: isSelected ? colors.surface : 'transparent',
                },
              ]}
            >
              <View style={styles.rowText}>
                <Text>{name}</Text>
                {!coberturaConfirmada && (
                  <Text style={styles.coverageNotice}>
                    Cobertura de estaciones aún no confirmada
                  </Text>
                )}
              </View>
              <Text>{isSelected ? '✓' : ''}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  list: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
  },
  rowText: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  coverageNotice: {
    ...Typography.caption,
  },
  volver: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
  },
});
