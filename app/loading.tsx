import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {

  const router = useRouter();
  const params = useLocalSearchParams();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  // ☁️ CLOUD POSITIONS
  const cloud1 = useRef(new Animated.Value(-150)).current;
  const cloud2 = useRef(new Animated.Value(width)).current;
  const cloud3 = useRef(new Animated.Value(-200)).current;
  const cloud4 = useRef(new Animated.Value(width + 100)).current;
  const cloud5 = useRef(new Animated.Value(-250)).current;

  const messages = [
    "📍 Konumun analiz ediliyor...",
    "🧠 En iyi rotalar senin için seçiliyor...",
    "🗺️ Rota akıllı şekilde oluşturuluyor...",
    "✨ Sana özel gezi planı hazırlanıyor..."
  ];

  const [index, setIndex] = useState(0);

  const animateText = () => {
    fadeAnim.setValue(0);
    translateY.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    animateText();
  }, [index]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev < messages.length - 1) return prev + 1;
        return prev;
      });
    }, 1700);

    return () => clearInterval(interval);
  }, []);

  // ☁️ MULTI CLOUD ANIMATION
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(cloud1, {
          toValue: width,
          duration: 12000,
          useNativeDriver: true,
        }),
        Animated.timing(cloud2, {
          toValue: -150,
          duration: 15000,
          useNativeDriver: true,
        }),
        Animated.timing(cloud3, {
          toValue: width,
          duration: 18000,
          useNativeDriver: true,
        }),
        Animated.timing(cloud4, {
          toValue: -200,
          duration: 20000,
          useNativeDriver: true,
        }),
        Animated.timing(cloud5, {
          toValue: width,
          duration: 22000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace({
        pathname: "/route",
        params: params
      });
    }, 7000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>

      <View style={styles.sky} />

      {/* ☁️ BULUTLAR */}
      <Animated.View style={[styles.cloudBig, { transform: [{ translateX: cloud1 }], top: height * 0.15 }]} />
      <Animated.View style={[styles.cloud, { transform: [{ translateX: cloud2 }], top: height * 0.35 }]} />
      <Animated.View style={[styles.cloudSmall, { transform: [{ translateX: cloud3 }], top: height * 0.55 }]} />
      <Animated.View style={[styles.cloud, { transform: [{ translateX: cloud4 }], top: height * 0.75 }]} />
      <Animated.View style={[styles.cloudSmall, { transform: [{ translateX: cloud5 }], top: height * 0.25 }]} />

      {/* ✨ TEXT */}
      <Animated.Text
        style={[
          styles.text,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}
      >
        {messages[index]}
      </Animated.Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sky: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#eaf4ff',
  },

  cloudBig: {
    position: 'absolute',
    width: 160,
    height: 70,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    opacity: 0.9,
  },

  cloud: {
    position: 'absolute',
    width: 130,
    height: 55,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    opacity: 0.85,
  },

  cloudSmall: {
    position: 'absolute',
    width: 90,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    opacity: 0.8,
  },

  text: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3a5f',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 28,
  },

});