import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';

// TYPE
type Place = {
  lat: number;
  lng: number;
  name: string;
  [key: string]: any;
};

export default function RouteScreen() {

  const params = useLocalSearchParams();
  const router = useRouter();

  let days: Place[][] = [];

  // 🔥 SAFE PARSE
  try {
    if (params.days) {
      days = JSON.parse(params.days as string);
    }
  } catch (e) {
    console.log("JSON ERROR:", e);
  }

  // 🔥 STABLE DATA (SHUFFLE KALDIRILDI)
  const processedDays = useMemo(() => {
    return days.map(day => {

      const cleanDay = [...day].slice(0, 6); // 🔥 sadece limit, sıralama korunuyor

      return {
        morning: cleanDay.slice(0, 2),
        afternoon: cleanDay.slice(2, 4),
        evening: cleanDay.slice(4, 6)
      };
    });
  }, [params.days]);

  if (!days || days.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Rota verisi bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>

      <ScrollView style={styles.container}>

        {processedDays.map((day, index) => {

          const renderPlaces = (places: Place[]) =>
            places.map((p, i) => (
              <View key={i} style={styles.placeCard}>
                <Text style={styles.placeText}>{p.name}</Text>
              </View>
            ));

          return (
            <View key={index} style={styles.card}>

              <Text style={styles.dayTitle}>
                📅 Gün {index + 1}
              </Text>

              {/* SABAH */}
              {day.morning.length > 0 && (
                <>
                  <Text style={styles.section}>🌅 Sabah</Text>
                  <View style={styles.placeContainer}>
                    {renderPlaces(day.morning)}
                  </View>
                </>
              )}

              {/* ÖĞLE */}
              {day.afternoon.length > 0 && (
                <>
                  <Text style={styles.section}>🌤 Öğle</Text>
                  <View style={styles.placeContainer}>
                    {renderPlaces(day.afternoon)}
                  </View>
                </>
              )}

              {/* AKŞAM */}
              {day.evening.length > 0 && (
                <>
                  <Text style={styles.section}>🌙 Akşam</Text>
                  <View style={styles.placeContainer}>
                    {renderPlaces(day.evening)}
                  </View>
                </>
              )}

            </View>
          );
        })}

      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() =>
            router.push({
              pathname: '/map',
              params: {
                days: params.days,
                currentDay: "0",
                transport: params.transport
              }
            })
          }
        >
          <Text style={styles.mapButtonText}>
            Tüm Rotayı Haritada Göster 🗺️
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f4f7ff',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 18,
    marginBottom: 18,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#4f8cff',
  },

  dayTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    color: '#1f3c88'
  },

  section: {
    marginTop: 12,
    fontWeight: '700',
    color: '#6b85b5',
    fontSize: 14
  },

  placeContainer: {
    marginTop: 8,
  },

  placeCard: {
    backgroundColor: '#e8f0ff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
  },

  placeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f3c88',
  },

  bottomContainer: {
    padding: 15,
    backgroundColor: '#ffffff'
  },

  mapButton: {
    backgroundColor: '#4f8cff',
    padding: 15,
    borderRadius: 12,
  },

  mapButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16
  },

});