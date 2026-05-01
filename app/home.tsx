import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) {
        setUser(JSON.parse(data));
      }
    };
    getUser();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* 🔥 HEADER */}
      <View style={styles.header}>

        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} // 🔥 placeholder profil
          style={styles.profileImage}
        />

        <Text style={styles.welcome}>
          Hoş geldin{user?.name ? `, ${user.name}` : ''} 👋
        </Text>

        <Text style={styles.subtitle}>
          Bugün keşfetmeye hazır mısın?
        </Text>

      </View>

      {/* 🔥 ANA KART */}
      <TouchableOpacity
        style={styles.mainCard}
        onPress={() => router.push('/city')}
      >
        <Text style={styles.mainIcon}>🗺️</Text>

        {/* 🔥 TAŞMA FIX */}
        <View style={styles.mainTextContainer}>
          <Text style={styles.mainTitle}>Rota Oluştur</Text>
          <Text style={styles.mainDesc}>
            Sana özel gezi planını oluştur.
          </Text>
        </View>
      </TouchableOpacity>

      {/* 🔥 ALT KARTLAR */}
      <View style={styles.row}>

        <TouchableOpacity
          style={styles.smallCard}
          onPress={() => router.push('/favorites')}
        >
          <Text style={styles.smallIcon}>⭐</Text>
          <Text style={styles.smallText}>Favoriler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.smallCard}
          onPress={() => router.push('/history')}
        >
          <Text style={styles.smallIcon}>🕘</Text>
          <Text style={styles.smallText}>Geçmiş</Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.fullCard}
        onPress={() => router.push('/settings')}
      >
        <Text style={styles.smallIcon}>⚙️</Text>
        <Text style={styles.smallText}>Ayarlar</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#eef4ff',
    padding: 20,
  },

  header: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },

  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 12,
  },

  welcome: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e3a8a',
  },

  subtitle: {
    marginTop: 6,
    color: '#64748b',
  },

  mainCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#3b82f6',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,

    shadowColor: '#3b82f6',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },

  mainIcon: {
    fontSize: 34,
    marginRight: 15, // 🔥 gap yerine güvenli spacing
  },

  // 🔥 TAŞMA FIX
  mainTextContainer: {
    flex: 1,
  },

  mainTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  mainDesc: {
    color: '#dbeafe',
    fontSize: 13,
    marginTop: 4,
    flexWrap: 'wrap', // 🔥 taşma engel
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  smallCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  fullCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  smallIcon: {
    fontSize: 24,
    marginBottom: 6,
  },

  smallText: {
    fontWeight: '600',
    color: '#0f172a',
  },

});