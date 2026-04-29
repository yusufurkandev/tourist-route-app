import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Preferences2() {

  const router = useRouter();

  // 🔥 1. SAYFADAN GELEN VERİLER
  const params = useLocalSearchParams();
  const { travelType, interest, duration } = params;

  // 🔥 BU SAYFADAKİ SEÇİMLER
  const [transport, setTransport] = useState('');
  const [budget, setBudget] = useState('');
  const [density, setDensity] = useState('');

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

  // 🔥 TEMPO YERİNE YOĞUNLUK
  const densityOptions = [
    { label: 'Az (2-3 yer)', icon: '🐢' },
    { label: 'Orta (4-6 yer)', icon: '🚶' },
    { label: 'Yoğun (7+ yer)', icon: '🏃' },
  ];

  return (
    <View style={styles.container}>

      {/* PROGRESS */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>Adım 2 / 2</Text>
      </View>

      <View style={styles.content}>

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
                  density === item.label && styles.selected
                ]}
                onPress={() => setDensity(item.label)}
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
          // 🔥 VALIDATION
          if (!transport || !budget || !density) {
            alert("Lütfen tüm seçimleri yapın");
            return;
          }

          // 🔥 TÜM VERİLERİ BİRLEŞTİR
          const allData = {
            travelType,
            interest,
            duration,
            transport,
            budget,
            density,
          };

          console.log("KULLANICI VERİLERİ:", allData);

          // 🔥 SONRAKİ ADIM (ROTA)
          router.push('/route');
        }}
      >
        <Text style={styles.buttonText}>Rota Oluştur</Text>
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