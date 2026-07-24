import { StyleSheet, Text, View } from 'react-native';
import AlertColors, { type AlertLevel } from '@/constants/AlertColors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';

const LEVEL_LABELS: Record<AlertLevel, string> = {
  verde: 'Verde',
  amarilla: 'Amarilla',
  naranja: 'Naranja',
  roja: 'Roja',
};

type AlertLevelChipProps = {
  level: AlertLevel;
};

export function AlertLevelChip({ level }: AlertLevelChipProps) {
  const colors = AlertColors[level];

  return (
    <View style={[styles.chip, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>
        {LEVEL_LABELS[level]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
