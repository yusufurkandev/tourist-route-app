import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { 
  filterByInterest, 
  sortByDistance,
  scorePlaces,
  selectTopPlaces,
  buildRoute
} from '../utils/algorithm';

const cityCoords: Record<string, { lat: number; lon: number }> = {
  Istanbul: { lat: 41.0082, lon: 28.9784 },
  Ankara: { lat: 39.9334, lon: 32.8597 },
  Izmir: { lat: 38.4237, lon: 27.1428 },
  Antalya: { lat: 36.8969, lon: 30.7133 },
  Bursa: { lat: 40.1885, lon: 29.0610 },
  Adana: { lat: 37.0, lon: 35.3213 },
  Gaziantep: { lat: 37.0662, lon: 37.3833 },
};

type Place = {
  id: number;
  name: string;
  city: string;
  lat: number;
  lng: number;
  category: string;
  duration: number;
  cost: number;
  popularity: number;
  score?: number;
};

// 🔥 SKOR FORMAT
function formatScore(score: number | undefined) {
  if (!score) return "0";

  if (score >= 1000000) {
    return (score / 1000000).toFixed(1) + "M";
  }

  if (score >= 1000) {
    return (score / 1000).toFixed(1) + "K";
  }

  return score.toFixed(1);
}

export default function RouteScreen() {

  const params = useLocalSearchParams();
  const router = useRouter();

  const [places, setPlaces] = useState<Place[]>([]);
  const [routePlaces, setRoutePlaces] = useState<Place[]>([]);

  const city = typeof params.city === 'string' ? params.city : "Istanbul";
  const interest = typeof params.interest === 'string' ? params.interest : "";
  const duration = typeof params.duration === 'string' ? params.duration : "";
  const budget = typeof params.budget === 'string' ? params.budget : "";
  const transport = typeof params.transport === 'string' ? params.transport : "";

  const density = Number(params.density) > 0 ? Number(params.density) : 5;

  // 🔥 API
  useEffect(() => {
    fetch(`http://192.168.1.130:5000/places?city=${city}`)
      .then(res => res.json())
      .then((data: Place[]) => {
        console.log("API DATA:", data);
        setPlaces(data);
      })
      .catch(err => console.log("API ERROR:", err));
  }, [city]);

  // 🔥 ALGORİTMA
  useEffect(() => {
    if (places.length === 0) return;

    try {
      let working = places;

      const filtered = interest
        ? filterByInterest(working, interest)
        : working;

      if (filtered.length > 0) {
        working = filtered;
      }

      const userLat = cityCoords[city]?.lat || 41.0082;
      const userLon = cityCoords[city]?.lon || 28.9784;

      const sorted = sortByDistance(working, userLat, userLon);

      const scored = scorePlaces(
        sorted,
        {
          duration,
          budget,
          transport
        },
        userLat,
        userLon
    );

      const finalPlaces =
        scored.length > 0
          ? selectTopPlaces(scored, density)
          : sorted.slice(0, density);

      const route = buildRoute(finalPlaces, userLat, userLon);

      setRoutePlaces(route.length > 0 ? route : finalPlaces);

    } catch (err) {
      console.log("ALGORITHM ERROR:", err);
      setRoutePlaces(places);
    }

  }, [places]);

  // 🔥 LOADING
  if (places.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Veri çekiliyor...</Text>
      </View>
    );
  }

  if (routePlaces.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Rota oluşturulamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Önerilen Rota</Text>
      <Text style={styles.subtitle}>
        {city} {interest ? `- ${interest}` : ""}
      </Text>

      <FlatList
        data={routePlaces}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.step}>{index + 1}. Durak</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.category}</Text>
            <Text>{item.duration} dk</Text>
            <Text>⭐ Skor: {formatScore(item.score)}</Text>
          </View>
        )}

        ListFooterComponent={
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => {
              router.push({
                pathname: '/map',
                params: {
                  route: JSON.stringify(routePlaces)
                }
              });
            }}
          >
            <Text style={styles.mapButtonText}>
              Haritada Göster
            </Text>
          </TouchableOpacity>
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f4f7',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  step: {
    fontSize: 12,
    color: '#00a884',
    marginBottom: 5,
    fontWeight: 'bold',
  },

  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  mapButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },

  mapButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});