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

  // 🔥 AUTO LOGIN (EKLENDİ)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          router.replace('/home');
        }
      } catch (e) {
        console.log("AsyncStorage ERROR:", e);
      }
    };

    checkUser();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("⚠️ Eksik Bilgi", "Kullanıcı adı ve şifre gir");
      return;
    }

    try {
      const res = await fetch("http://192.168.1.130:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {

        try {
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
        } catch (e) {
          console.log("SAVE ERROR:", e);
        }

        Alert.alert(
          "🎉 Giriş Başarılı",
          "Hoş geldin!",
          [
            {
              text: "Devam",
              onPress: () => router.replace('/home')
            }
          ]
        );

      } else {
        Alert.alert(
          "❌ Giriş Hatası",
          data.error || "Kullanıcı adı veya şifre yanlış"
        );
      }

    } catch (err) {
      console.log("LOGIN ERROR:", err);
      Alert.alert("🚫 Bağlantı Hatası", "Sunucuya ulaşılamadı");
    }
  };

  // 🔥 KEYBOARD ANIMATION (DOKUNULMADI)
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

      {/* 🔥 LOGO (DOKUNULMADI) */}
      <Animated.View
        style={[
          styles.topLogo,
          { transform: [{ translateY: logoAnim }] }
        ]}
      >
        <Image
          source={require('D:\\Projects\\graduation-project\\tourist-route-app\\assets\\images\\logo.png')}
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
    width: 200,
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