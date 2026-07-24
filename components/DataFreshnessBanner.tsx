import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';

export function formatRelativeTime(lastUpdated: Date, now: Date = new Date()): string {
  const diffMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);

  if (diffMinutes < 1) {
    return 'hace instantes';
  }
  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  return `hace ${diffHours} h`;
}

type DataFreshnessBannerProps = {
  lastUpdated: Date;
  /** Injectable for tests; defaults to the real current time. */
  now?: Date;
};

export function DataFreshnessBanner({ lastUpdated, now }: DataFreshnessBannerProps) {
  const theme = useColorScheme();
  const colors = Colors[theme];

  return (
    <View style={styles.banner}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {formatRelativeTime(lastUpdated, now)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  text: {
    ...Typography.caption,
  },
});
