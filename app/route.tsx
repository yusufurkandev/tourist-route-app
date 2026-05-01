import {
  View,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,
  Linking
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useEffect, useState } from 'react';
import * as Location from 'expo-location'; // ✅ EKLENDİ

// ✅ TYPE
type Place = {
  lat: number;
  lng: number;
  name: string;
  [key: string]: any;
};

export default function MapScreen() {

  const params = useLocalSearchParams();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [routePlaces, setRoutePlaces] = useState<Place[]>([]);
  const [animatedCoords, setAnimatedCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [visibleMarkers, setVisibleMarkers] = useState<Place[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null); // ✅ EKLENDİ

  const dropAnim = useRef(new Animated.Value(0)).current;

  const currentDay = parseInt(params.currentDay as string) || 0;

  // ✅ USER LOCATION (EKLENDİ)
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    })();
  }, []);

  // 🔥 SAFE PARSE
  useEffect(() => {
    try {
      const raw = params.days;
      if (!raw) return;

      const parsedDays = JSON.parse(raw as string);

      if (!Array.isArray(parsedDays)) return;
      if (!parsedDays[currentDay]) return;

      const clean: Place[] = parsedDays[currentDay].filter(
        (p: Place) => p && p.lat && p.lng
      );

      setRoutePlaces(clean);

    } catch (e) {
      console.log("JSON ERROR:", e);
    }
  }, []);

  // 🔥 START LOCATION (DOKUNMADIM)
  const startLocation =
    routePlaces.length > 0
      ? {
          latitude: routePlaces[0].lat,
          longitude: routePlaces[0].lng,
        }
      : {
          latitude: 41.0082,
          longitude: 28.9784,
        };

  // 🚀 ROTA ANİMASYONU
  useEffect(() => {

    if (routePlaces.length === 0) return;

    setAnimatedCoords([]);

    let i = 0;

    const interval = setInterval(() => {

      const place = routePlaces[i];
      if (!place) return;

      setAnimatedCoords(prev => [
        ...prev,
        {
          latitude: place.lat,
          longitude: place.lng,
        },
      ]);

      i++;
      if (i >= routePlaces.length) clearInterval(interval);

    }, 300);

    return () => clearInterval(interval);

  }, [routePlaces]);

  // 📍 MARKER ANİMASYONU
  useEffect(() => {

    if (routePlaces.length === 0) return;

    setVisibleMarkers([]);

    let i = 0;

    const interval = setInterval(() => {

      const place = routePlaces[i];
      if (!place) return;

      setVisibleMarkers(prev => [...prev, place]);

      dropAnim.setValue(-20);
      Animated.spring(dropAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

      i++;
      if (i >= routePlaces.length) clearInterval(interval);

    }, 400);

    return () => clearInterval(interval);

  }, [routePlaces]);

  // 🔥 AUTO FIT
  useEffect(() => {

    if (!mapRef.current || animatedCoords.length < 2) return;

    mapRef.current.fitToCoordinates(animatedCoords, {
      edgePadding: {
        top: 100,
        right: 50,
        bottom: 150,
        left: 50,
      },
      animated: true,
    });

  }, [animatedCoords]);

  // 🚀 GOOGLE MAPS (SADECE BURASI GÜNCELLENDİ)
  const openNavigation = () => {

    if (!routePlaces || routePlaces.length === 0) return;

    const origin = userLocation
      ? `${userLocation.latitude},${userLocation.longitude}`
      : `${routePlaces[0].lat},${routePlaces[0].lng}`;

    const destination = `${routePlaces[routePlaces.length - 1].lat},${routePlaces[routePlaces.length - 1].lng}`;

    const waypoints = routePlaces
      .slice(1, -1)
      .map(p => `${p.lat},${p.lng}`)
      .join('|');

    let travelMode = "driving";

    if (params.transport === "Yürüyüş") travelMode = "walking";
    if (params.transport === "Toplu taşıma") travelMode = "transit";

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=${travelMode}`;

    Linking.openURL(url);
  };

  // 🚨 SAFE SCREEN
  if (routePlaces.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Rota verisi bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >

        <Marker coordinate={startLocation} title="Başlangıç" pinColor="blue" />

        <Polyline
          coordinates={animatedCoords}
          strokeWidth={5}
          strokeColor="#007AFF"
        />

        {visibleMarkers.map((place, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: place.lat,
              longitude: place.lng,
            }}
            title={place.name}
          >
            <Animated.View
              style={[
                styles.marker,
                {
                  transform: [{ translateY: dropAnim }],
                },
              ]}
            >
              <Text style={styles.markerText}>
                {index + 1}
              </Text>
            </Animated.View>
          </Marker>
        ))}

      </MapView>

      {/* 🔥 ALT PANEL */}
      <View style={styles.bottomPanel}>

        <Text style={styles.dayText}>
          Gün {currentDay + 1}
        </Text>

        <View style={styles.buttonsRow}>

          {currentDay > 0 && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/map',
                  params: {
                    days: params.days,
                    currentDay: (currentDay - 1).toString(),
                    transport: params.transport
                  }
                })
              }
            >
              <Text style={styles.button}>← Önceki Gün</Text>
            </TouchableOpacity>
          )}

          {currentDay < JSON.parse(params.days as string).length - 1 && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/map',
                  params: {
                    days: params.days,
                    currentDay: (currentDay + 1).toString(),
                    transport: params.transport
                  }
                })
              }
            >
              <Text style={styles.button}>Sonraki Gün →</Text>
            </TouchableOpacity>
          )}

        </View>

        {/* 🌍 GOOGLE MAPS */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={openNavigation}
        >
          <Text style={styles.googleButtonText}>
            Haritada Göster 🌍
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: { flex: 1 },
  map: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  marker: {
    backgroundColor: '#007AFF',
    padding: 6,
    borderRadius: 20,
    minWidth: 28,
    alignItems: 'center',
  },

  markerText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  bottomPanel: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  dayText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 10,
  },

  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  button: {
    color: '#007AFF',
    fontWeight: '600',
  },

  googleButton: {
    marginTop: 12,
    backgroundColor: '#34A853',
    padding: 12,
    borderRadius: 10,
  },

  googleButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },

});