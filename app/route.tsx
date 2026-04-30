import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

import {
  filterByInterest,
  sortByDistance,
  scorePlaces,
  selectTopPlaces,
  buildRoute,
  splitIntoDaysSmart
} from '../utils/algorithm';

export default function RouteScreen() {

  const params = useLocalSearchParams();
  const router = useRouter();

  const [places, setPlaces] = useState<any[]>([]);
  const [days, setDays] = useState<any[][]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const city = params.city as string;
  const interest = params.interest as string;
  const duration = params.duration as string;
  const budget = params.budget as string;
  const transport = params.transport as string;

  const density = parseInt(params.density as string) || 5;

  // 🔥 KONUM (FINAL)
  useEffect(() => {

    const getLocation = async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log("Konum izni reddedildi");
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      console.log("USER LOCATION:", location.coords);

      setUserLocation(location.coords);
    };

    getLocation();

  }, []);

  // 🔥 API
  useEffect(() => {
    fetch(`http://192.168.1.130:5000/places?city=${city}`)
      .then(res => res.json())
      .then(data => setPlaces(data))
      .catch(err => console.log(err));
  }, [city]);

  // 🔥 ALGORİTMA
  useEffect(() => {

    if (!places.length || !userLocation) return;

    const filtered = interest
      ? filterByInterest(places, interest)
      : places;

    const userLat = userLocation.latitude;
    const userLon = userLocation.longitude;

    const sorted = sortByDistance(filtered, userLat, userLon);

    const scored = scorePlaces(
      sorted,
      { duration, budget, transport },
      userLat,
      userLon
    );

    const selected = selectTopPlaces(scored, density);

    const route = buildRoute(selected, userLat, userLon);

    let totalDays = 1;
    if (duration === "2 Gün") totalDays = 2;
    if (duration === "3 Gün") totalDays = 3;

    let splitted = splitIntoDaysSmart(route, totalDays);

    splitted = splitted.filter(day => day.length > 0);

    setDays(splitted);
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

              <Text style={styles.category}>
                {place.categories?.join(", ")}
              </Text>
            </View>
          ))}

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

  category: {
    color: '#555',
    marginTop: 4,
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