import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

import {
  filterByInterest,
  scorePlaces,
  selectTopPlaces,
  buildSmartRoute,
  splitIntoDaysSmart,
  assignTimeSlots
} from '../utils/algorithm';

export default function RouteScreen() {

  const params = useLocalSearchParams();
  const router = useRouter();

  const [days, setDays] = useState<any[][]>([]);
  const [plannedDays, setPlannedDays] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");

  const city = params.city as string;
  const interest = params.interest as string;
  const duration = params.duration as string;
  const budget = params.budget as string;
  const transport = params.transport as string;
  const density = parseInt(params.density as string) || 5;

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      setUserLocation(location.coords);
    };

    getLocation();
  }, []);

  useEffect(() => {
    fetch(`http://192.168.1.130:5000/places?city=${city}`)
      .then(res => res.json())
      .then(data => setPlaces(data))
      .catch(err => console.log(err));
  }, [city]);

  useEffect(() => {

    if (!places.length || !userLocation) return;

    const filtered = interest
      ? filterByInterest(places, interest)
      : places;

    const userLat = userLocation.latitude;
    const userLon = userLocation.longitude;

    const prefs = { duration, budget, transport };

    const scored = scorePlaces(filtered, prefs, userLat, userLon);
    const selected = selectTopPlaces(scored, density);

    const route = buildSmartRoute(
      { lat: userLat, lng: userLon },
      selected,
      prefs
    );

    let totalDays = 1;
    if (duration === "2 Gün") totalDays = 2;
    if (duration === "3 Gün") totalDays = 3;

    let splitted = splitIntoDaysSmart(route, totalDays);
    splitted = splitted.filter(day => day.length > 0);

    setDays(splitted);

    const planned = splitted.map(day => assignTimeSlots(day));
    setPlannedDays(planned);

    setSummary(`
${city} için sana özel ${totalDays} günlük rota oluşturduk ✨

• ${interest || "Genel keşif"} odaklı
• ${transport} ulaşımına uygun
• ${route.length} nokta içeriyor

Minimum mesafe, maksimum deneyim hedeflendi.
    `);

    setLoading(false);

  }, [places, userLocation]);

  if (loading || days.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Plan hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <Text style={styles.title}>✨ Senin İçin Planlandı</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{summary}</Text>
      </View>

      {plannedDays.map((day, dayIndex) => (
        <View key={dayIndex} style={styles.dayContainer}>

          <Text style={styles.dayTitle}>
            Gün {dayIndex + 1}
          </Text>

          {/* SABAH */}
          {day.morning.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.timeTitle}>🌅 Sabah</Text>
              {day.morning.map((place: any, index: number) => (
                <Card key={index} place={place} index={index} />
              ))}
            </View>
          )}

          {/* ÖĞLEN */}
          {day.afternoon.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.timeTitle}>☀️ Öğlen</Text>
              {day.afternoon.map((place: any, index: number) => (
                <Card key={index} place={place} index={index} />
              ))}
            </View>
          )}

          {/* AKŞAM */}
          {day.evening.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.timeTitle}>🌙 Akşam</Text>
              {day.evening.map((place: any, index: number) => (
                <Card key={index} place={place} index={index} />
              ))}
            </View>
          )}

        </View>
      ))}

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
          Geziyi Başlat 🚀
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// 🔥 MODERN CARD
function Card({ place, index }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.step}>{index + 1}. Durak</Text>
      <Text style={styles.name}>{place.name}</Text>
      <Text style={styles.category}>
        {place.categories?.join(", ")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f7fb',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 15,
  },

  summaryBox: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  summaryText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },

  dayContainer: {
    marginBottom: 25,
  },

  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#007AFF',
  },

  section: {
    marginTop: 12,
  },

  timeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 8,
    color: '#555',
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  step: {
    fontSize: 12,
    color: '#00a884',
    marginBottom: 4,
    fontWeight: '600',
  },

  name: {
    fontWeight: '700',
    fontSize: 16,
  },

  category: {
    color: '#666',
    marginTop: 4,
    fontSize: 13,
  },

  mapButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 40,
  },

  mapButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
  },
});