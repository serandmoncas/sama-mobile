import { ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import { AlertLevelChip } from '@/components/AlertLevelChip';
import { TerritoryCard } from '@/components/TerritoryCard';
import { DataFreshnessBanner } from '@/components/DataFreshnessBanner';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';
import type { AlertLevel } from '@/constants/AlertColors';

const ALERT_LEVELS: AlertLevel[] = ['verde', 'amarilla', 'naranja', 'roja'];

export default function DesignSystemCatalogScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.section}>Button</Text>
      <View style={styles.row}>
        <Button label="Primario" onPress={() => {}} />
        <Button label="Secundario" onPress={() => {}} variant="secondary" />
        <Button label="Deshabilitado" onPress={() => {}} disabled />
      </View>

      <Text style={styles.section}>AlertLevelChip</Text>
      <View style={styles.row}>
        {ALERT_LEVELS.map((level) => (
          <AlertLevelChip key={level} level={level} />
        ))}
      </View>

      <Text style={styles.section}>TerritoryCard</Text>
      <View style={styles.column}>
        {ALERT_LEVELS.map((level) => (
          <TerritoryCard key={level} name={`Municipio ${level}`} alertLevel={level} />
        ))}
      </View>

      <Text style={styles.section}>DataFreshnessBanner</Text>
      <View style={styles.column}>
        <DataFreshnessBanner lastUpdated={new Date()} />
        <DataFreshnessBanner lastUpdated={new Date(Date.now() - 20 * 60000)} />
        <DataFreshnessBanner lastUpdated={new Date(Date.now() - 3 * 3600000)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  section: {
    ...Typography.title,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  column: {
    gap: Spacing.md,
  },
});
