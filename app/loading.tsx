import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {

  const router = useRouter();
  const params = useLocalSearchParams();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ☁️ BULUTLAR
  const clouds = [
    useRef(new Animated.Value(height)).current,
    useRef(new Animated.Value(height + 120)).current,
    useRef(new Animated.Value(height + 240)).current,
  ];

  const frontCloudY = useRef(new Animated.Value(height)).current;
  const frontCloudScale = useRef(new Animated.Value(1)).current;

  const messages = [
    "📍 Konum analiz ediliyor...",
    "🧠 En iyi rota hazırlanıyor...",
    "🗺️ Plan oluşturuluyor...",
    "✨ Senin için hazırlanıyor..."
  ];

  const [index, setIndex] = useState(0);

  // ✨ TEXT
  const animateText = () => {
    fadeAnim.setValue(0);
    textY.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(textY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    animateText();
  }, [index]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => prev < messages.length - 1 ? prev + 1 : prev);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  // ☁️ ANİMASYON
  useEffect(() => {

    clouds.forEach((c, i) => {
      Animated.loop(
        Animated.timing(c, {
          toValue: -200,
          duration: 5000 + i * 1200,
          useNativeDriver: true,
        })
      ).start();
    });

    Animated.loop(
      Animated.parallel([
        Animated.timing(frontCloudY, {
          toValue: -300,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(frontCloudScale, {
          toValue: 1.7,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

  }, []);

  // 🚀 ROUTE
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace({
        pathname: "/route",
        params: params
      });
    }, 6500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>

      {/* 🌈 SKY (GRADIENT HİSSİ) */}
      <View style={styles.sky} />

      {/* ☀️ GÜNEŞ GLOW */}
      <View style={styles.sun} />

      {/* ☁️ ARKA BULUTLAR */}
      {clouds.map((c, i) => (
        <Animated.View
          key={i}
          style={[
            styles.cloudWrapper,
            {
              transform: [{ translateY: c }],
              left: (i * 100) % width,
              opacity: 0.5 + i * 0.1
            }
          ]}
        >
          <Cloud />
        </Animated.View>
      ))}

      {/* ☁️ ÖN BULUT */}
      <Animated.View
        style={[
          styles.frontCloud,
          {
            transform: [
              { translateY: frontCloudY },
              { scale: frontCloudScale }
            ]
          }
        ]}
      >
        {/* 🔥 iOS BLUR */}
        {Platform.OS === 'ios' ? (
          <BlurView intensity={60} style={styles.blurCloud}>
            <Cloud large />
          </BlurView>
        ) : (
          // Android fallback
          <View style={styles.androidBlur}>
            <Cloud large />
          </View>
        )}
      </Animated.View>

      {/* ✨ TEXT */}
      <Animated.Text
        style={[
          styles.text,
          {
            opacity: fadeAnim,
            transform: [{ translateY: textY }]
          }
        ]}
      >
        {messages[index]}
      </Animated.Text>

    </Animated.View>
  );
}

// ☁️ BULUT
function Cloud({ large = false }: any) {
  return (
    <View style={[styles.cloudContainer, large && { transform: [{ scale: 2 }] }]}>
      <View style={styles.c1} />
      <View style={styles.c2} />
      <View style={styles.c3} />
      <View style={styles.c4} />
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

  sun: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: '#ffd166',
    borderRadius: 100,
    top: 80,
    right: 40,
    opacity: 0.3,
  },

  cloudWrapper: {
    position: 'absolute',
  },

  frontCloud: {
    position: 'absolute',
  },

  blurCloud: {
    overflow: 'hidden',
    borderRadius: 100,
  },

  androidBlur: {
    opacity: 0.4,
  },

  cloudContainer: {
    width: 140,
    height: 70,
  },

  c1: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    left: 30,
  },
  c2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    left: 0,
    top: 10,
  },
  c3: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    left: 70,
    top: 15,
  },
  c4: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    left: 50,
    top: 25,
  },

  text: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3a5f',
    textAlign: 'center',
    paddingHorizontal: 30,
  },

});