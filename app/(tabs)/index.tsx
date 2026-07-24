import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function InicioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis territorios</Text>
      <Text>Aún no has añadido ningún municipio.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
