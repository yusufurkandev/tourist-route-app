import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  filterByInterest,
  sortByDistance,
  scorePlaces,
  selectTopPlaces,
  buildRoute,
  splitIntoDaysByCount
} from '../utils/algorithm';

const cityCoords: Record<string, { lat: number; lon: number }> = {
  Istanbul: { lat: 41.0082, lon: 28.9784 },
  Ankara: { lat: 39.9334, lon: 32.8597 },
  Izmir: { lat: 38.4237, lon: 27.1428 },
  Antalya: { lat: 36.8969, lon: 30.7133 },
  Bursa: { lat: 40.1885, lon: 29.0610 },
  Adana: { lat: 37.0, lon: 35.3213 },
  Gaziantep: { lat: 37.0662, lon: 37.3833 },
};

export default function RouteScreen() {

  const params = useLocalSearchParams();
  const router = useRouter();

  const [places, setPlaces] = useState<any[]>([]);
  const [days, setDays] = useState<any[][]>([]);

  const city = params.city as string;
  const interest = params.interest as string;
  const duration = params.duration as string;
  const budget = params.budget as string;
  const transport = params.transport as string;

  const density = parseInt(params.density as string) || 5;

  // 🔥 API
  useEffect(() => {
    fetch(`http://192.168.1.130:5000/places?city=${city}`)
      .then(res => res.json())
      .then(data => setPlaces(data))
      .catch(err => console.log(err));
  }, [city]);

  // 🔥 ALGORİTMA
  useEffect(() => {

    if (!places || places.length === 0) return;

    const filtered = interest
      ? filterByInterest(places, interest)
      : places;

    const userLat = cityCoords[city]?.lat || 41;
    const userLon = cityCoords[city]?.lon || 29;

    const sorted = sortByDistance(filtered, userLat, userLon);

    const scored = scorePlaces(
      sorted,
      { duration, budget, transport },
      userLat,
      userLon
    );

    const selected = selectTopPlaces(scored, density);

    const route = buildRoute(selected, userLat, userLon);

    // 🔥 GÜN SAYISI
    let totalDays = 1;
    if (duration === "2 Gün") totalDays = 2;
    if (duration === "3 Gün") totalDays = 3;

    const splitted = splitIntoDaysByCount(route, totalDays);

    setDays(splitted);

  }, [places]);

  if (days.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>Planın Hazır 🎉</Text>

      {days.map((day, dayIndex) => (
        <View key={dayIndex}>

          <Text style={styles.dayTitle}>
            Gün {dayIndex + 1}
          </Text>

          {day.map((place, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.step}>
                {index + 1}. Durak
              </Text>

              <Text style={styles.name}>
                {place.name}
              </Text>

              <Text>{place.categories?.join(", ")}</Text>
            </View>
          ))}

        </View>
      ))}

      {/* 🔥 YENİ BUTON */}
      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => {

          router.push({
            pathname: '/map',
            params: {
              days: JSON.stringify(days),
              currentDay: 0,
              transport: transport
            }
          });

        }}
      >
        <Text style={styles.mapButtonText}>
          Gezi Başlasın 🚀
        </Text>
      </TouchableOpacity>

    </ScrollView>
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
    marginBottom: 15,
  },

  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#007AFF',
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
    marginTop: 30,
    marginBottom: 40,
  },

  mapButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});