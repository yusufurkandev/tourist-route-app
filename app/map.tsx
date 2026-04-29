import { View, StyleSheet, TouchableOpacity, Text, Linking } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useEffect, useState } from 'react';

export default function MapScreen() {

  const params = useLocalSearchParams();
  const routePlaces = JSON.parse(params.route as string);

  const mapRef = useRef<MapView>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  // 🔥 AUTO ZOOM
  useEffect(() => {
    if (mapRef.current && routePlaces.length > 0) {
      mapRef.current.fitToCoordinates(
        routePlaces.map((p: any) => ({
          latitude: p.lat,
          longitude: p.lon,
        })),
        {
          edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
          animated: true,
        }
      );
    }
  }, []);

  // 📍 TEK NOKTA NAV
  const openNavigation = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.openURL(url);
  };

  // 🗺️ FULL ROTA
  const openFullRoute = () => {
    if (routePlaces.length < 2) return;

    const origin = `${routePlaces[0].lat},${routePlaces[0].lon}`;
    const destination = `${routePlaces[routePlaces.length - 1].lat},${routePlaces[routePlaces.length - 1].lon}`;

    const waypoints = routePlaces
      .slice(1, -1)
      .map((p: any) => `${p.lat},${p.lon}`)
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving&waypoints=${waypoints}`;

    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      
      <MapView ref={mapRef} style={styles.map}>

        {/* 📍 MARKER */}
        {routePlaces.map((place: any, index: number) => {

          const isStart = index === 0;
          const isEnd = index === routePlaces.length - 1;

          return (
            <Marker
              key={index}
              coordinate={{
                latitude: place.lat,
                longitude: place.lon,
              }}
              onPress={() => setSelectedPlace(place)} // 🔥 ARTIK BURASI
            >
              <View style={styles.markerWrapper}>
                
                <View style={[
                  styles.marker,
                  isStart && styles.startMarker,
                  isEnd && styles.endMarker
                ]}>
                  <Text style={styles.markerText}>
                    {index + 1}
                  </Text>
                </View>

                <View style={[
                  styles.markerArrow,
                  isStart && styles.startArrow,
                  isEnd && styles.endArrow
                ]} />

              </View>
            </Marker>
          );
        })}

        {/* 🔵 ROTA */}
        <Polyline
          coordinates={routePlaces.map((p: any) => ({
            latitude: p.lat,
            longitude: p.lon,
          }))}
          strokeColor="#007AFF"
          strokeWidth={5}
        />

      </MapView>

      {/* 🔥 ALT KART */}
      {selectedPlace && (
        <View style={styles.bottomCard}>
          
          <Text style={styles.cardTitle}>
            {selectedPlace.name}
          </Text>

          <Text style={styles.cardText}>
            📍 {selectedPlace.category}
          </Text>

          <Text style={styles.cardText}>
            ⏱️ {selectedPlace.duration}
          </Text>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => openNavigation(selectedPlace.lat, selectedPlace.lon)}
          >
            <Text style={styles.navButtonText}>
              Navigasyona Git
            </Text>
          </TouchableOpacity>

        </View>
      )}

      {/* 🔥 FULL ROTA BUTON */}
      <TouchableOpacity style={styles.routeButton} onPress={openFullRoute}>
        <Text style={styles.routeButtonText}>Tüm Rotayı Aç</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  map: { flex: 1 },

  markerWrapper: {
    alignItems: 'center',
  },

  marker: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 5,
  },

  markerText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#007AFF',
  },

  startMarker: { backgroundColor: '#34C759' },
  startArrow: { borderTopColor: '#34C759' },

  endMarker: { backgroundColor: '#FF3B30' },
  endArrow: { borderTopColor: '#FF3B30' },

  // 🔥 ALT KART
  bottomCard: {
    position: 'absolute',
    bottom: 90,
    left: 15,
    right: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    elevation: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  cardText: {
    color: '#666',
    marginBottom: 3,
  },

  navButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
  },

  navButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  routeButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 12,
  },

  routeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});