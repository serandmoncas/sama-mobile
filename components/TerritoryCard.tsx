import { Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from './useColorScheme';
import { Text } from './Themed';
import { AlertLevelChip } from './AlertLevelChip';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';
import type { AlertLevel } from '@/constants/AlertColors';

type TerritoryCardProps = {
  name: string;
  alertLevel: AlertLevel;
  onPress?: () => void;
};

export function TerritoryCard({
  name,
  alertLevel,
  onPress,
}: TerritoryCardProps) {
  const theme = useColorScheme();
  const colors = Colors[theme];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={styles.name}>{name}</Text>
      <AlertLevelChip level={alertLevel} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  name: {
    ...Typography.subtitle,
  },
});
