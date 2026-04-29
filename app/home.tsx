import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <View style={styles.topSection}>
        <Text style={styles.title}>Şehri Keşfet</Text>
        <Text style={styles.subtitle}>
          Sana özel en iyi gezi rotalarını oluştur
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Akıllı Rota Planlama</Text>
        <Text style={styles.cardText}>
          Tercihlerine, zamanına ve ulaşım şekline göre en uygun rotayı oluştururuz.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/city')}
      >
        <Text style={styles.buttonText}>Planlamaya Başla</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    padding: 20,
    justifyContent: 'center',
  },

  topSection: {
    marginBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },

  card: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 16,
    marginBottom: 40,

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  cardText: {
    color: '#777',
    lineHeight: 20,
  },

  button: {
    backgroundColor: '#ff3b3b',
    padding: 18,
    borderRadius: 14,

    shadowColor: '#ff3b3b',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});