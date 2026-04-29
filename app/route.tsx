import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { 
  getPlacesByCity, 
  filterByInterest, 
  sortByDistance,
  scorePlaces,
  selectTopPlaces,
  buildRoute // 🔥 EKLENDİ
} from '../utils/algorithm';

// 📍 ŞEHİR KOORDİNATLARI
const cityCoords: any = {
  Istanbul: { lat: 41.0082, lon: 28.9784 },
  Ankara: { lat: 39.9334, lon: 32.8597 },
  Izmir: { lat: 38.4237, lon: 27.1428 },
  Antalya: { lat: 36.8969, lon: 30.7133 },
  Bursa: { lat: 40.1885, lon: 29.0610 },
  Adana: { lat: 37.0000, lon: 35.3213 },
  Gaziantep: { lat: 37.0662, lon: 37.3833 },
};

export default function RouteScreen() {

  const params = useLocalSearchParams();

  const city = typeof params.city === 'string' ? params.city : "Istanbul";
  const interest = typeof params.interest === 'string' ? params.interest : "";
  const duration = typeof params.duration === 'string' ? params.duration : "";
  const budget = typeof params.budget === 'string' ? params.budget : "";
  const transport = typeof params.transport === 'string' ? params.transport : "";

  const density = parseInt(params.density as string) || 5;

  // 🔥 1. şehir
  const cityPlaces = getPlacesByCity(city);

  // 🔥 2. kategori
  const filteredPlaces = interest
    ? filterByInterest(cityPlaces, interest)
    : cityPlaces;

  // 🔥 3. konum
  const userLat = cityCoords[city]?.lat || 41.0082;
  const userLon = cityCoords[city]?.lon || 28.9784;

  // 🔥 4. mesafe
  const sortedPlaces = sortByDistance(filteredPlaces, userLat, userLon);

  // 🔥 5. skor
  const scoredPlaces = scorePlaces(sortedPlaces, {
    duration,
    budget,
    transport
  });

  // 🔥 6. limit
  const finalPlaces = selectTopPlaces(scoredPlaces, density);

  // 🔥 7. GERÇEK ROTA
  const routePlaces = buildRoute(finalPlaces, userLat, userLon);

  console.log("FINAL LENGTH:", routePlaces.length);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Önerilen Rota</Text>
      <Text style={styles.subtitle}>
        {city} {interest ? `- ${interest}` : ""}
      </Text>

      <FlatList
        data={routePlaces} // 🔥 ARTIK BU
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>

            {/* 🔥 DURAK NUMARASI */}
            <Text style={styles.step}>
              {index + 1}. Durak
            </Text>

            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.category}</Text>
            <Text>{item.duration}</Text>

            <Text>⭐ Skor: {String(item.score)}</Text>
          </View>
        )}
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
});