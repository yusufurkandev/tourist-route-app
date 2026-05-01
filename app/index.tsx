import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
  Animated,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const logoAnim = useRef(new Animated.Value(0)).current;

  // 🔥 GERÇEK LOGIN
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Eksik Bilgi", "Kullanıcı adı ve şifre gir");
      return;
    }

    try {
      const res = await fetch("http://192.168.1.130:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {

        await AsyncStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        router.replace('/home');

      } else {
        Alert.alert("Hata", data.error || "Giriş başarısız");
      }

    } catch (err) {
      Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamadı");
    }
  };

  // 🔥 KEYBOARD ANIMATION
  useEffect(() => {

    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(logoAnim, {
        toValue: -40,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(logoAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };

  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      {/* 🔥 LOGO */}
      <Animated.View
        style={[
          styles.topLogo,
          { transform: [{ translateY: logoAnim }] }
        ]}
      >
        <Image
          source={require('../assets/images/logo.png')} // 🔥 FIX
          style={styles.topLogoImage}
        />
      </Animated.View>

      <View style={styles.wrapper}>

        <View style={styles.header}>

          <Text style={styles.logo}>RouteAI</Text>

          <Text style={styles.tagline}>
            Akıllı rotanı saniyeler içinde oluştur
          </Text>

        </View>

        <View style={styles.card}>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Kullanıcı adı"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Şifre"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabın yok mu?</Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.link}> Kayıt Ol</Text>
            </TouchableOpacity>
          </View>

        </View>

      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#eef4ff',
  },

  topLogo: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
  },

  topLogoImage: {
    width: 190,
    height: 190,
    resizeMode: 'contain',
  },

  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  header: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 120,
  },

  logo: {
    fontSize: 40,
    fontWeight: '900',
    color: '#1e3a8a',
    letterSpacing: 1,
  },

  tagline: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },

  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 25,

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  inputContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    marginBottom: 14,
    paddingHorizontal: 14,
  },

  input: {
    paddingVertical: 14,
    color: '#0f172a',
    fontSize: 15,
  },

  button: {
    marginTop: 10,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',

    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },

  footerText: {
    color: '#64748b',
  },

  link: {
    marginLeft: 5,
    color: '#3b82f6',
    fontWeight: '600',
  },

});