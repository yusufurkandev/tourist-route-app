import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleRegister = () => {
    if (!name || !username || !email || !password || !confirm) return;

    if (password !== confirm) {
      alert("Şifreler uyuşmuyor");
      return;
    }

    router.push('/');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      <View style={styles.wrapper}>

        {/* 🔥 HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>RouteAI</Text>
          <Text style={styles.tagline}>
            Yeni hesabını oluştur
          </Text>
        </View>

        {/* 🔥 CARD */}
        <View style={styles.card}>

          {/* 👤 İSİM */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Ad Soyad"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          {/* 👤 USERNAME */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Kullanıcı adı"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
          </View>

          {/* 📧 EMAIL */}
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

          {/* 🔒 ŞİFRE */}
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

          {/* 🔒 ŞİFRE TEKRAR */}
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

          {/* 🔥 BUTTON */}
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>

          {/* 🔥 ALT */}
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