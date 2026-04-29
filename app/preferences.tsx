import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function Preferences() {

  const router = useRouter();

  const [travelType, setTravelType] = useState('');
  const [interest, setInterest] = useState('');
  const [duration, setDuration] = useState('');

  // 1️⃣ KİMİNLE
  const travelOptions = [
    { label: 'Yalnız', icon: '🧍' },
    { label: 'Eş/Sevgili', icon: '❤️' },
    { label: 'Aile', icon: '👨‍👩‍👧' },
    { label: 'Arkadaş', icon: '👥' },
  ];

  // 2️⃣ İLGİ ALANI (YENİ)
  const interestOptions = [
    { label: 'Tarihi Yerler', icon: '🏛️' },
    { label: 'Doğa', icon: '🌳' },
    { label: 'Müze & Kültür', icon: '🖼️' },
    { label: 'Yemek & Kafe', icon: '🍽️' },
  ];

  // 3️⃣ SÜRE
  const durationOptions = [
    { label: 'Yarım Gün', icon: '⏰' },
    { label: '1 Gün', icon: '🌞' },
    { label: '2 Gün', icon: '📅' },
    { label: '3+ Gün', icon: '🧳' },
  ];

  return (
    <View style={styles.container}>

      {/* PROGRESS */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <Text style={styles.progressText}>Adım 1 / 2</Text>
      </View>

      <View style={styles.content}>

        {/* SORU 1 */}
        <View style={styles.card}>
          <Text style={styles.title}>Kiminle gidiyorsun?</Text>

          <View style={styles.row}>
            {travelOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  travelType === item.label && styles.selected
                ]}
                onPress={() => setTravelType(item.label)}
              >
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SORU 2 (YENİ) */}
        <View style={styles.card}>
          <Text style={styles.title}>İlgi alanın nedir?</Text>

          <View style={styles.row}>
            {interestOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  interest === item.label && styles.selected
                ]}
                onPress={() => setInterest(item.label)}
              >
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SORU 3 */}
        <View style={styles.card}>
          <Text style={styles.title}>Gezi süresi ne kadar?</Text>

          <View style={styles.row}>
            {durationOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  duration === item.label && styles.selected
                ]}
                onPress={() => setDuration(item.label)}
              >
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </View>

      {/* BUTON */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          if (!travelType || !interest || !duration) {
            alert("Lütfen tüm seçimleri yapın");
            return;
          }

          router.push({
            pathname: '/preferences2',
            params: {
              travelType,
              interest,
              duration,
            },
          });
        }}
      >
        <Text style={styles.buttonText}>Sonraki Adım</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f4f7',
  },

  progressContainer: {
    marginBottom: 10,
  },

  progressBar: {
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 10,
  },

  progressFill: {
    height: 8,
    backgroundColor: '#00a884',
    borderRadius: 10,
  },

  progressText: {
    marginTop: 5,
    textAlign: 'center',
    color: '#666',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  option: {
    width: '48%',
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
  },

  selected: {
    backgroundColor: '#ff3b3b',
  },

  optionText: {
    fontWeight: 'bold',
  },

  icon: {
    fontSize: 20,
  },

  button: {
    backgroundColor: '#00a884',
    padding: 15,
    borderRadius: 12,
  },

  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
});