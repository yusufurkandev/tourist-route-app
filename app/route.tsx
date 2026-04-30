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

// 📍 ŞEHİR KOORDİNATLARI
const cityCoords: Record<string, { lat: number; lon: number }> = {
  Istanbul: { lat: 41.0082, lon: 28.9784 },
  Ankara: { lat: 39.9334, lon: 32.8597 },
  Izmir: { lat: 38.4237, lon: 27.1428 },
  Antalya: { lat: 36.8969, lon: 30.7133 },
  Bursa: { lat: 40.1885, lon: 29.0610 },
  Adana: { lat: 37.0, lon: 35.3213 },
  Gaziantep: { lat: 37.0662, lon: 37.3833 },
};

// 🔥 TYPE TANIMI (hataları çözer)
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

  const density = parseInt(params.density as string) || 5;

  // 🔥 API
  useEffect(() => {
    fetch(`http://192.168.1.130:5000/places?city=Kayseri`)
      .then(res => res.json())
      .then((data: Place[]) => {
        console.log("API DATA:", data);
        setPlaces(data);
      })
      .catch(err => console.log(err));
  }, [city]);

  // 🔥 ALGORİTMA
  useEffect(() => {
    if (places.length === 0) return;

    const filteredPlaces = interest
      ? filterByInterest(places, interest)
      : places;

    const userLat = cityCoords[city]?.lat || 41.0082;
    const userLon = cityCoords[city]?.lon || 28.9784;

    const sortedPlaces = sortByDistance(filteredPlaces, userLat, userLon);

    const scoredPlaces = scorePlaces(sortedPlaces, {
      duration,
      budget,
      transport
    });

    const finalPlaces = selectTopPlaces(scoredPlaces, density);

    const route = buildRoute(finalPlaces, userLat, userLon);

    console.log("ROUTE:", route);

    setRoutePlaces(route);

  }, [places]);

  // 🔥 LOADING
  if (routePlaces.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
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
            <Text>⭐ Skor: {item.score ?? "-"}</Text>
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