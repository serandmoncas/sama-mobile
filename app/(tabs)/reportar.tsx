import { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { File, Paths } from 'expo-file-system';
import * as Location from 'expo-location';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';
import {
  ANTIOQUIA_CENTER,
  ANTIOQUIA_ZOOM,
  CATEGORIES,
  MAX_PHOTO_BYTES,
} from '@/constants/Reportar';
import {
  addReport,
  getReports,
  type ReportCategory,
  type Report,
} from '@/lib/reportes';

async function compressPhoto(originalUri: string): Promise<string> {
  let width: number | undefined = undefined;
  let finalUri = originalUri;

  for (let attempt = 0; attempt < 5; attempt++) {
    const context = width
      ? ImageManipulator.manipulate(originalUri).resize({ width })
      : ImageManipulator.manipulate(originalUri);
    const image = await context.renderAsync();
    const result = await image.saveAsync({
      compress: 0.6,
      format: SaveFormat.JPEG,
    });
    const file = new File(result.uri);
    if (file.size !== null && file.size <= MAX_PHOTO_BYTES) {
      finalUri = result.uri;
      break;
    }
    finalUri = result.uri;
    width = Math.round((width ?? image.width) * 0.7);
  }

  const destination = new File(Paths.document, `reporte-${Date.now()}.jpg`);
  const source = new File(finalUri);
  source.copy(destination);
  return destination.uri;
}

export default function ReportarScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [lngLat, setLngLat] = useState<[number, number] | null>(null);
  const [alias, setAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const theme = useColorScheme();
  const colors = Colors[theme];

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getReports().then((list) => {
        if (!cancelled) setReports(list);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || cancelled) return;
        const position = await Location.getCurrentPositionAsync();
        if (cancelled) return;
        setLngLat(
          (current) =>
            current ?? [position.coords.longitude, position.coords.latitude],
        );
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handlePickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!photoUri || !category || !lngLat) {
      setError('Falta foto, categoría o ubicación.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const compressedPhoto = await compressPhoto(photoUri);
      await addReport({
        photoUri: compressedPhoto,
        category,
        lngLat,
        alias: alias.trim() || null,
        phone: phone.trim() || null,
      });
      setPhotoUri(null);
      setCategory(null);
      setAlias('');
      setPhone('');
      setReports(await getReports());
    } catch (err) {
      console.error('Error al guardar el reporte:', err);
      setError('No se pudo guardar el reporte, intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title} accessibilityRole="header">
          Reportar
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Foto</Text>
          <View style={styles.rowButtons}>
            <Pressable
              testID="boton-tomar-foto"
              onPress={handleTakePhoto}
              accessibilityRole="button"
              accessibilityLabel="Tomar foto"
              style={[styles.button, { borderColor: colors.border }]}
            >
              <Text>Tomar foto</Text>
            </Pressable>
            <Pressable
              testID="boton-elegir-galeria"
              onPress={handlePickFromGallery}
              accessibilityRole="button"
              accessibilityLabel="Elegir de galería"
              style={[styles.button, { borderColor: colors.border }]}
            >
              <Text>Elegir de galería</Text>
            </Pressable>
          </View>
          {photoUri && (
            <Image
              testID="foto-preview"
              source={{ uri: photoUri }}
              style={styles.preview}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Categoría</Text>
          <View style={styles.rowButtons}>
            {CATEGORIES.map((item) => {
              const isSelected = item.id === category;
              return (
                <Pressable
                  key={item.id}
                  testID={`categoria-${item.id}`}
                  onPress={() => setCategory(item.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.categoryTab,
                    {
                      borderColor: isSelected ? colors.tint : colors.border,
                      backgroundColor: isSelected
                        ? colors.surface
                        : 'transparent',
                    },
                  ]}
                >
                  <Text style={isSelected ? { color: colors.tint } : undefined}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ubicación</Text>
          <View style={styles.miniMapContainer}>
            <Map
              testID="mini-mapa"
              style={styles.miniMap}
              mapStyle="https://tiles.openfreemap.org/styles/liberty"
              onPress={(event) => {
                setLngLat(event.nativeEvent.lngLat);
              }}
            >
              <Camera
                initialViewState={{
                  center: lngLat ?? ANTIOQUIA_CENTER,
                  zoom: ANTIOQUIA_ZOOM,
                }}
              />
              {lngLat && (
                <Marker testID="pin-ubicacion" lngLat={lngLat}>
                  <FontAwesome name="map-marker" size={32} color="#d32f2f" />
                </Marker>
              )}
            </Map>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Alias (opcional)</Text>
          <TextInput
            testID="input-alias"
            value={alias}
            onChangeText={setAlias}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />
          <Text style={styles.sectionLabel}>Teléfono (opcional)</Text>
          <TextInput
            testID="input-telefono"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />
        </View>

        {error && (
          <Text testID="error-formulario" style={styles.errorText}>
            {error}
          </Text>
        )}

        <Pressable
          testID="boton-enviar"
          onPress={handleSubmit}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel="Enviar reporte"
          style={[
            styles.enviarButton,
            { backgroundColor: colors.tint, opacity: submitting ? 0.5 : 1 },
          ]}
        >
          <Text style={styles.enviarButtonLabel}>
            {submitting ? 'Guardando...' : 'Enviar reporte'}
          </Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mis reportes</Text>
          {reports.length === 0 ? (
            <Text>Aún no has enviado ningún reporte.</Text>
          ) : (
            reports.map((report) => (
              <View key={report.id} style={styles.reporteRow}>
                <Text>
                  {CATEGORIES.find((c) => c.id === report.category)?.label}
                </Text>
                <Text style={styles.reporteEstado}>
                  Pendiente de envío — el panel de Dagran no existe todavía
                </Text>
              </View>
            ))
          )}
        </View>
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
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.subtitle,
  },
  rowButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  categoryTab: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMapContainer: {
    height: 220,
    borderRadius: 8,
    overflow: 'hidden',
  },
  miniMap: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
  },
  errorText: {
    color: 'red',
  },
  enviarButton: {
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enviarButtonLabel: {
    ...Typography.body,
    color: 'white',
    fontWeight: '600',
  },
  reporteRow: {
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  reporteEstado: {
    ...Typography.caption,
  },
});
