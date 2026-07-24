import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
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

export default function QueHagoScreen() {
  const [evento, setEvento] = useState<EventoId>(EVENTOS[0].id);
  const [fase, setFase] = useState<Fase>(FASES[0].id);
  const theme = useColorScheme();
  const colors = Colors[theme];

  return (
    <View style={styles.container}>
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
                  borderColor: colors.border,
                  backgroundColor: isSelected ? colors.surface : 'transparent',
                },
              ]}
            >
              <Text style={styles.tabLabel}>{item.label}</Text>
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
                  borderColor: colors.border,
                  backgroundColor: isSelected ? colors.surface : 'transparent',
                },
              ]}
            >
              <Text style={styles.tabLabel}>{item.label}</Text>
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
});
