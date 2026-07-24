import { Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from './useColorScheme';
import { Text, View } from './Themed';
import { AlertLevelChip, LEVEL_LABELS } from './AlertLevelChip';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';
import type { AlertLevel } from '@/constants/AlertColors';

type TerritoryCardProps = {
  name: string;
  alertLevel: AlertLevel;
  onPress?: () => void;
  testID?: string;
  coberturaConfirmada?: boolean;
};

export function TerritoryCard({
  name,
  alertLevel,
  onPress,
  testID,
  coberturaConfirmada = true,
}: TerritoryCardProps) {
  const theme = useColorScheme();
  const colors = Colors[theme];

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${name}, nivel ${LEVEL_LABELS[alertLevel].toLowerCase()}`}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {!coberturaConfirmada && (
          <Text style={styles.coverageNotice}>
            Cobertura de estaciones aún no confirmada
          </Text>
        )}
      </View>
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
  info: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  name: {
    ...Typography.subtitle,
  },
  coverageNotice: {
    ...Typography.caption,
  },
});
