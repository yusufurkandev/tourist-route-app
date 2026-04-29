import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function City() {
  const router = useRouter();

  const cities = [
    "Istanbul",
    "Ankara",
    "Izmir",
    "Antalya",
    "Kapadokya"
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your City</Text>

      {cities.map((city, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() => router.push('/preferences')}
        >
          <Text style={styles.cityText}>{city}</Text>
          <Text style={styles.subtitle}>Tap to explore routes</Text>
        </TouchableOpacity>
      ))}
    </View>
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

    // shadow (iOS)
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

    // shadow (Android)
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