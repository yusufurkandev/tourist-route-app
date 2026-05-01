import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleRegister = async () => {
    if (!name || !username || !email || !password || !confirm) {
      Alert.alert("⚠️ Eksik Bilgi", "Lütfen tüm alanları doldurun");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("📧 Geçersiz Email", "Email adresi '@' içermelidir");
      return;
    }

    if (username.length < 3) {
      Alert.alert("👤 Kullanıcı Adı", "Kullanıcı adı en az 3 karakter olmalı");
      return;
    }

    if (password.length < 6) {
      Alert.alert("🔒 Şifre", "Şifre en az 6 karakter olmalı");
      return;
    }

    if (password !== confirm) {
      Alert.alert("🔒 Şifre Hatası", "Şifreler uyuşmuyor");
      return;
    }

    try {
      const res = await fetch("http://192.168.1.130:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password
        })
      });

      const data = await res.json();

      // 🔥 SADECE BURASI DÜZELTİLDİ
      if (res.ok) {
        Alert.alert(
          "🎉 Başarılı",
          "Hesabın oluşturuldu!",
          [
            {
              text: "Tamam",
              onPress: () => router.push("/")
            }
          ]
        );
      } else {
        Alert.alert(
          "❌ Kayıt Hatası",
          data.error || "Bir hata oluştu"
        );
      }

    } catch (err) {
      console.log("REGISTER ERROR:", err);
      Alert.alert("🚫 Bağlantı Hatası", "Sunucuya ulaşılamadı");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      <View style={styles.wrapper}>

        <View style={styles.header}>
          <Text style={styles.logo}>RouteAI</Text>
          <Text style={styles.tagline}>
            Yeni hesabını oluştur
          </Text>
        </View>

        <View style={styles.card}>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Ad Soyad"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

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
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
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

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Şifreyi tekrar gir"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabın var mı?</Text>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text style={styles.link}> Giriş Yap</Text>
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

  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  header: {
    alignItems: 'center',
    marginBottom: 25,
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