import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Tourist Route Planner</Text>
        <Text style={styles.subtitle}>
          Discover the best routes tailored just for you
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/city')}
      >
        <Text style={styles.buttonText}>Start Planning</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },

  header: {
    marginBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },

  button: {
    backgroundColor: '#ff3b3b',
    padding: 18,
    borderRadius: 12,
    
    // shadow iOS
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

    // shadow Android
    elevation: 5,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});