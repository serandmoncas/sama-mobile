import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';
import {
  CONTENIDO,
  EVENTOS,
  FASES,
  type EventoId,
  type Fase,
} from '@/constants/QueHago';
import { DIRECTORIO } from '@/constants/Directorio';
import { getSelectedMunicipios } from '@/lib/onboarding';

export default function QueHagoScreen() {
  const [evento, setEvento] = useState<EventoId>(EVENTOS[0].id);
  const [fase, setFase] = useState<Fase>(FASES[0].id);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const theme = useColorScheme();
  const colors = Colors[theme];

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getSelectedMunicipios().then((selected) => {
        if (!cancelled) setMunicipios(selected);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title} accessibilityRole="header">
          ¿Qué hago?
        </Text>
        <View style={styles.selectorRow}>
          {EVENTOS.map((item) => {
            const isSelected = item.id === evento;
            return (
              <Pressable
                key={item.id}
                testID={`evento-${item.id}`}
                onPress={() => setEvento(item.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.tab,
                  {
                    borderColor: isSelected ? colors.tint : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    backgroundColor: isSelected
                      ? colors.surface
                      : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    isSelected && { color: colors.tint, fontWeight: '700' },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.selectorRow}>
          {FASES.map((item) => {
            const isSelected = item.id === fase;
            return (
              <Pressable
                key={item.id}
                testID={`fase-${item.id}`}
                onPress={() => setFase(item.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.tab,
                  {
                    borderColor: isSelected ? colors.tint : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    backgroundColor: isSelected
                      ? colors.surface
                      : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    isSelected && { color: colors.tint, fontWeight: '700' },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.content}>
          {CONTENIDO[evento][fase].map((item, index) => (
            <Text key={index} style={styles.contentItem}>
              {item}
            </Text>
          ))}
        </View>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Directorio de emergencia
        </Text>
        {municipios.length === 0 ? (
          <Text>Aún no has añadido ningún municipio.</Text>
        ) : (
          municipios.map((municipio) => (
            <View key={municipio} style={styles.municipioBlock}>
              <Text style={styles.municipioTitle}>{municipio}</Text>
              {DIRECTORIO[municipio].map((entidad) => (
                <View key={entidad.id} style={styles.entidadRow}>
                  <Text style={styles.entidadLabel}>{entidad.label}</Text>
                  <Pressable
                    testID={`llamar-${municipio}-${entidad.id}`}
                    disabled={!entidad.telefono}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !entidad.telefono }}
                    accessibilityLabel={
                      entidad.telefono
                        ? `Llamar a ${entidad.label}, ${entidad.telefono}`
                        : `${entidad.label}, número pendiente de verificación`
                    }
                    onPress={
                      entidad.telefono
                        ? () => Linking.openURL(`tel:${entidad.telefono}`)
                        : undefined
                    }
                    style={[
                      styles.callButton,
                      {
                        borderColor: colors.border,
                        opacity: entidad.telefono ? 1 : 0.5,
                      },
                    ]}
                  >
                    <Text style={styles.callButtonLabel}>
                      {entidad.telefono ?? 'Número pendiente de verificación'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    ...Typography.title,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: Spacing.xs,
  },
  tabLabel: {
    ...Typography.caption,
    textAlign: 'center',
  },
  content: {
    gap: Spacing.sm,
  },
  contentItem: {
    ...Typography.body,
  },
  sectionTitle: {
    ...Typography.subtitle,
  },
  municipioBlock: {
    gap: Spacing.sm,
  },
  municipioTitle: {
    ...Typography.subtitle,
  },
  entidadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  entidadLabel: {
    ...Typography.body,
  },
  callButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
  callButtonLabel: {
    ...Typography.caption,
  },
});
