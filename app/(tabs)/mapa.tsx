import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Location from 'expo-location';
import { Camera, Map, UserLocation } from '@maplibre/maplibre-react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const ANTIOQUIA_CENTER: [number, number] = [-75.5, 6.9];
const ANTIOQUIA_ZOOM = 7;

export default function MapaScreen() {
  const [locationGranted, setLocationGranted] = useState(false);
  const theme = useColorScheme();
  const colors = Colors[theme];

  async function handleLocationPress() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationGranted(status === 'granted');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Mapa de estaciones
      </Text>
      <View style={styles.mapContainer}>
        <Map style={styles.map} mapStyle={MAP_STYLE}>
          <Camera
            initialViewState={{
              center: ANTIOQUIA_CENTER,
              zoom: ANTIOQUIA_ZOOM,
            }}
            trackUserLocation={locationGranted ? 'default' : undefined}
          />
          {locationGranted && <UserLocation />}
        </Map>
        <Pressable
          testID="boton-mi-ubicacion"
          onPress={handleLocationPress}
          accessibilityRole="button"
          accessibilityLabel="Mi ubicación"
          style={[
            styles.locationButton,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <FontAwesome name="location-arrow" size={20} color={colors.tint} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...Typography.title,
    textAlign: 'center',
    padding: Spacing.lg,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
