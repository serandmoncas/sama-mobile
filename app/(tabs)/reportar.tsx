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
  CATEGORIAS,
  MAX_FOTO_BYTES,
} from '@/constants/Reportar';
import {
  agregarReporte,
  getReportes,
  type CategoriaReporte,
  type Reporte,
} from '@/lib/reportes';

async function comprimirFoto(uriOriginal: string): Promise<string> {
  let ancho: number | undefined = undefined;
  let uriFinal = uriOriginal;

  for (let intento = 0; intento < 5; intento++) {
    const contexto = ancho
      ? ImageManipulator.manipulate(uriOriginal).resize({ width: ancho })
      : ImageManipulator.manipulate(uriOriginal);
    const imagen = await contexto.renderAsync();
    const resultado = await imagen.saveAsync({
      compress: 0.6,
      format: SaveFormat.JPEG,
    });
    const archivo = new File(resultado.uri);
    if (archivo.size !== null && archivo.size <= MAX_FOTO_BYTES) {
      uriFinal = resultado.uri;
      break;
    }
    uriFinal = resultado.uri;
    ancho = Math.round((ancho ?? imagen.width) * 0.7);
  }

  const destino = new File(Paths.document, `reporte-${Date.now()}.jpg`);
  const origen = new File(uriFinal);
  origen.copy(destino);
  return destino.uri;
}

export default function ReportarScreen() {
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<CategoriaReporte | null>(null);
  const [lngLat, setLngLat] = useState<[number, number] | null>(null);
  const [alias, setAlias] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const theme = useColorScheme();
  const colors = Colors[theme];

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getReportes().then((lista) => {
        if (!cancelled) setReportes(lista);
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
        const posicion = await Location.getCurrentPositionAsync();
        if (cancelled) return;
        setLngLat(
          (actual) =>
            actual ?? [posicion.coords.longitude, posicion.coords.latitude],
        );
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  async function handleTomarFoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!resultado.canceled && resultado.assets[0]) {
      setFotoUri(resultado.assets[0].uri);
    }
  }

  async function handleElegirGaleria() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const resultado = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
    });
    if (!resultado.canceled && resultado.assets[0]) {
      setFotoUri(resultado.assets[0].uri);
    }
  }

  async function handleEnviar() {
    if (!fotoUri || !categoria || !lngLat) {
      setError('Falta foto, categoría o ubicación.');
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const fotoComprimida = await comprimirFoto(fotoUri);
      await agregarReporte({
        fotoUri: fotoComprimida,
        categoria,
        lngLat,
        alias: alias.trim() || null,
        telefono: telefono.trim() || null,
      });
      setFotoUri(null);
      setCategoria(null);
      setAlias('');
      setTelefono('');
      setReportes(await getReportes());
    } catch {
      setError('No se pudo guardar el reporte, intenta de nuevo.');
    } finally {
      setEnviando(false);
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
              onPress={handleTomarFoto}
              accessibilityRole="button"
              accessibilityLabel="Tomar foto"
              style={[styles.button, { borderColor: colors.border }]}
            >
              <Text>Tomar foto</Text>
            </Pressable>
            <Pressable
              testID="boton-elegir-galeria"
              onPress={handleElegirGaleria}
              accessibilityRole="button"
              accessibilityLabel="Elegir de galería"
              style={[styles.button, { borderColor: colors.border }]}
            >
              <Text>Elegir de galería</Text>
            </Pressable>
          </View>
          {fotoUri && (
            <Image
              testID="foto-preview"
              source={{ uri: fotoUri }}
              style={styles.preview}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Categoría</Text>
          <View style={styles.rowButtons}>
            {CATEGORIAS.map((item) => {
              const isSelected = item.id === categoria;
              return (
                <Pressable
                  key={item.id}
                  testID={`categoria-${item.id}`}
                  onPress={() => setCategoria(item.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.categoriaTab,
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
            value={telefono}
            onChangeText={setTelefono}
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
          onPress={handleEnviar}
          disabled={enviando}
          accessibilityRole="button"
          accessibilityLabel="Enviar reporte"
          style={[
            styles.enviarButton,
            { backgroundColor: colors.tint, opacity: enviando ? 0.5 : 1 },
          ]}
        >
          <Text style={styles.enviarButtonLabel}>
            {enviando ? 'Guardando...' : 'Enviar reporte'}
          </Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mis reportes</Text>
          {reportes.length === 0 ? (
            <Text>Aún no has enviado ningún reporte.</Text>
          ) : (
            reportes.map((reporte) => (
              <View key={reporte.id} style={styles.reporteRow}>
                <Text>
                  {CATEGORIAS.find((c) => c.id === reporte.categoria)?.label}
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
  categoriaTab: {
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
