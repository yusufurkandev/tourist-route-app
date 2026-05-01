import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Preferences2() {

  const router = useRouter();

  const params = useLocalSearchParams();
  const { city, travelType, interest, duration } = params;

  const [transport, setTransport] = useState('');
  const [budget, setBudget] = useState('');
  const [density, setDensity] = useState<number>(0); // 🔥 NUMBER

  const transportOptions = [
    { label: 'Yürüyüş', icon: '🚶' },
    { label: 'Araba', icon: '🚗' },
    { label: 'Toplu Taşıma', icon: '🚌' },
  ];

  const budgetOptions = [
    { label: 'Düşük', icon: '💸' },
    { label: 'Orta', icon: '💰' },
    { label: 'Yüksek', icon: '💎' },
  ];

  // 🔥 EN ÖNEMLİ KISIM (VALUE EKLEDİK)
  const densityOptions = [
    { label: 'Az (2-3 yer)', value: 3, icon: '🐢' },
    { label: 'Orta (4-6 yer)', value: 5, icon: '🚶' },
    { label: 'Yoğun (7+ yer)', value: 8, icon: '🏃' },
  ];

  return (
    <View style={styles.container}>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* PROGRESS */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Adım 2 / 2</Text>
        </View>

        {/* ŞEHİR */}
        <View style={styles.cityContainer}>
          <Text style={styles.cityLabel}>Seçilen Şehir</Text>
          <Text style={styles.cityValue}>📍 {city}</Text>
        </View>

        {/* ULAŞIM */}
        <View style={styles.card}>
          <Text style={styles.title}>Ulaşım türünüz?</Text>

          <View style={styles.row}>
            {transportOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  transport === item.label && styles.selected
                ]}
                onPress={() => setTransport(item.label)}
              >
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* BÜTÇE */}
        <View style={styles.card}>
          <Text style={styles.title}>Bütçe tercihiniz?</Text>

          <View style={styles.row}>
            {budgetOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  budget === item.label && styles.selected
                ]}
                onPress={() => setBudget(item.label)}
              >
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* YOĞUNLUK */}
        <View style={styles.card}>
          <Text style={styles.title}>Günde kaç yer gezmek istersiniz?</Text>

          <View style={styles.row}>
            {densityOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  density === item.value && styles.selected
                ]}
                onPress={() => setDensity(item.value)} // 🔥 VALUE SET
              >
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* BUTON */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            if (!transport || !budget || !density) {
              alert("Lütfen tüm seçimleri yapın");
              return;
            }

            router.push({
              pathname: '/loading',
              params: {
                city,
                travelType,
                interest,
                duration,
                transport,
                budget,
                density: density.toString(), // 🔥 STRING GÖNDERİYORUZ
              },
            });
          }}
        >
          <Text style={styles.buttonText}>Rota Oluştur</Text>
        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },

  content: {
    padding: 20,
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

  cityContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
  },

  cityLabel: {
    fontSize: 12,
    color: '#777',
  },

  cityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00a884',
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
    marginTop: 20,
    marginBottom: 30,
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