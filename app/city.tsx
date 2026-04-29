import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function City() {
  const router = useRouter();

  const cities = [
    "Istanbul",
    "Ankara",
    "Izmir",
    "Antalya",
    "Bursa",
    "Adana",
    "Gaziantep",
    "Trabzon",
    "Konya",
    "Kayseri",
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Şehir Seç</Text>

      {cities.map((city, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: '/preferences',
              params: { city },
            })
          }
        >
          <Text style={styles.cityText}>{city}</Text>
          <Text style={styles.subtitle}>Rotaları keşfet</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 4,
  },
  cityText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 5,
    color: '#777',
  },
});