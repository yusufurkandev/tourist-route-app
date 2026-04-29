import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getPlacesByCity, filterByInterest } from '../utils/algorithm';

export default function RouteScreen() {

  const params = useLocalSearchParams();

  const {
    city = "Istanbul",
    interest,
  } = params;

  // 🔥 1. şehir filtresi
  const cityPlaces = getPlacesByCity(city);

  // 🔥 2. kategori filtresi
  const filteredPlaces = filterByInterest(cityPlaces, interest);

  console.log("TÜM VERİ:", params);
  console.log("FİLTRELİ:", filteredPlaces);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Önerilen Rota</Text>
      <Text style={styles.subtitle}>
        {city} - {interest}
      </Text>

      <FlatList
        data={filteredPlaces}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.category}</Text>
            <Text>{item.duration}</Text>
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

  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});