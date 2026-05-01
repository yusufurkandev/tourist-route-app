import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function Settings() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        try {
          const rawUser = await AsyncStorage.getItem("user");

          if (!rawUser) return;

          let parsedUser = JSON.parse(rawUser);

          // 🔥 EKSİK USER FIX (username/email yoksa backend’den çek)
          if (!parsedUser.username || !parsedUser.email) {
            try {
              const res = await fetch(`http://192.168.1.130:5000/user/${parsedUser.id}`);
              const data = await res.json();

              if (data.success) {
                parsedUser = data.user;

                await AsyncStorage.setItem(
                  "user",
                  JSON.stringify(parsedUser)
                );
              }
            } catch (e) {
              console.log("USER FETCH ERROR:", e);
            }
          }

          if (!isActive) return;

          setUser(parsedUser);

          const savedImage = await AsyncStorage.getItem(
            `profileImage_${parsedUser.id}`
          );

          if (savedImage && isActive) {
            setImage(savedImage);
          } else {
            setImage(null);
          }

        } catch (e) {
          console.log("LOAD ERROR:", e);
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace('/');
  };

  const pickImage = async () => {
    try {
      if (!user || !user.id) {
        Alert.alert("Hata", "Kullanıcı bulunamadı");
        return;
      }

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("İzin gerekli", "Galeri izni vermelisin");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;

        setImage(uri);

        await AsyncStorage.setItem(
          `profileImage_${user.id}`,
          uri
        );
      }

    } catch (err) {
      console.log("IMAGE ERROR:", err);
      Alert.alert("Hata", "Fotoğraf seçilemedi");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.profileCard}>

        <Image
          source={
            image
              ? { uri: image }
              : { uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }
          }
          style={styles.avatar}
        />

        <Text style={styles.name}>
          {user?.name || "Kullanıcı"}
        </Text>

        <Text style={styles.username}>
          @{user?.username || "-"}
        </Text>

        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.changePhoto}>
            Fotoğrafı değiştir
          </Text>
        </TouchableOpacity>

      </View>

      <View style={styles.card}>

        <View style={styles.row}>
          <Text style={styles.label}>Ad Soyad</Text>
          <Text style={styles.value}>{user?.name || "-"}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>E-mail</Text>
          <Text style={styles.value}>{user?.email || "-"}</Text>
        </View>

      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => router.push('/edit-profile')}
      >
        <Text style={styles.editText}>Hesap Bilgilerini Düzenle</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Uygulama Versiyonu</Text>
          <Text style={styles.value}>v1.0.0</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
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

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 25,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 12,
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },

  username: {
    marginTop: 4,
    color: '#64748b',
  },

  changePhoto: {
    marginTop: 6,
    fontSize: 12,
    color: '#3b82f6',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    marginBottom: 20,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  row: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  label: {
    color: '#94a3b8',
    fontSize: 13,
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 15,
  },

  editBtn: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,

    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  editText: {
    color: '#fff',
    fontWeight: '700',
  },

  logoutBtn: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',

    shadowColor: '#ff3b3b',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  logoutText: {
    color: '#ff3b3b',
    fontWeight: '700',
    fontSize: 15,
  },

});