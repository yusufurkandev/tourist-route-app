import { View, StyleSheet, TouchableOpacity, Text, Linking } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

export default function MapScreen() {

  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);

  const transport = params.transport as string;

  const [currentDay, setCurrentDay] = useState(
    parseInt(params.currentDay as string) || 0
  );

  let days: any[][] = [];

  // 🔥 JSON PARSE (GÜNLER)
  try {
    days = params.days ? JSON.parse(params.days as string) : [];
  } catch (e) {
    console.log("JSON PARSE ERROR:", e);
  }

  const routePlaces = days[currentDay] || [];

  console.log("CURRENT DAY:", currentDay);
  console.log("ROUTE:", routePlaces);

  // 🔥 AUTO ZOOM
  useEffect(() => {
    if (routePlaces.length > 0 && mapRef.current) {
      const coords = routePlaces.map((p) => ({
        latitude: p.lat,
        longitude: p.lng
      }));

      mapRef.current.fitToCoordinates(coords, {
        edgePadding: {
          top: 80,
          right: 80,
          bottom: 80,
          left: 80
        },
        animated: true
      });
    }
  }, [routePlaces]);

  // 🔥 GOOGLE MAPS
  const openInMaps = () => {
    if (routePlaces.length === 0) return;

    const origin = `${routePlaces[0].lat},${routePlaces[0].lng}`;
    const destination = `${routePlaces[routePlaces.length - 1].lat},${routePlaces[routePlaces.length - 1].lng}`;

    const waypoints = routePlaces
      .slice(1, -1)
      .map(p => `${p.lat},${p.lng}`)
      .join('|');

    let travelMode = "driving";

    if (transport === "Yürüyüş") travelMode = "walking";
    else if (transport === "Toplu Taşıma") travelMode = "transit";

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=${travelMode}`;

    Linking.openURL(url);
  };

  // 🔥 SONRAKİ GÜN
  const nextDay = () => {
    if (currentDay < days.length - 1) {
      setCurrentDay(currentDay + 1);
    }
  };

  if (routePlaces.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>

      {/* 🔥 GÜN BAŞLIK */}
      <Text style={styles.dayTitle}>
        Gün {currentDay + 1}
      </Text>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: routePlaces[0].lat,
          longitude: routePlaces[0].lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >

        {/* 📍 MARKER */}
        {routePlaces.map((place, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: place.lat,
              longitude: place.lng
            }}
            title={`${index + 1}. ${place.name}`}
          />
        ))}

        {/* 🔥 ROTA */}
        <Polyline
          coordinates={routePlaces.map((p) => ({
            latitude: p.lat,
            longitude: p.lng
          }))}
          strokeWidth={4}
        />

      </MapView>

      {/* 🔥 GOOGLE MAPS */}
      <TouchableOpacity style={styles.mapsButton} onPress={openInMaps}>
        <Text style={styles.mapsButtonText}>
          Google Maps'te Aç
        </Text>
      </TouchableOpacity>

      {/* 🔥 SONRAKİ GÜN */}
      {currentDay < days.length - 1 && (
        <TouchableOpacity style={styles.nextButton} onPress={nextDay}>
          <Text style={styles.mapsButtonText}>
            Günü Bitir → Sonraki Gün
          </Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  dayTitle: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    fontWeight: 'bold'
  },

  mapsButton: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#34A853',
    padding: 15,
    borderRadius: 12,
  },

  nextButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
  },

  mapsButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});