import React, { useEffect, useRef, useContext } from 'react';
import { StyleSheet, Text, View, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

export const SplashScreen = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(titleSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#1A1A18', '#2C2518', '#3D321E']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Animated Logo Icon */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Ionicons name="fast-food" size={64} color="#D4A04A" />
          </Animated.View>

          {/* Animated Text */}
          <Animated.View
            style={[
              styles.textWrapper,
              { opacity: fadeAnim, transform: [{ translateY: titleSlide }] },
            ]}
          >
            <Text style={styles.title}>QuickBite</Text>
            <Text style={styles.tagline}>Gourmet food at your doorstep</Text>
          </Animated.View>
        </View>

        {/* Subtle footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(212, 160, 74, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 74, 0.25)',
  },
  textWrapper: {
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#F5F0E8',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(245, 240, 232, 0.6)',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(245, 240, 232, 0.3)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default SplashScreen;
