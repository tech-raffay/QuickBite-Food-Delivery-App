import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, ActivityIndicator } from 'react-native';

export const LoadingSpinner = ({ colors, size = 'large', type = 'spinner' }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (type === 'spinner') {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else if (type === 'skeleton') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 0.4,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [type]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (type === 'skeleton') {
    return (
      <View style={styles.skeletonContainer}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.skeletonCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pulseValue,
              },
            ]}
          >
            <View style={[styles.skeletonImage, { backgroundColor: colors.border }]} />
            <View style={styles.skeletonDetails}>
              <View style={[styles.skeletonLineShort, { backgroundColor: colors.border }]} />
              <View style={[styles.skeletonLineLong, { backgroundColor: colors.border }]} />
              <View style={[styles.skeletonLineShort, { backgroundColor: colors.border, width: '40%' }]} />
            </View>
          </Animated.View>
        ))}
      </View>
    );
  }

  // standard spinner
  return (
    <View style={styles.spinnerContainer}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <ActivityIndicator size={size} color={colors.primary} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    height: 110,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
  },
  skeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  skeletonDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  skeletonLineLong: {
    height: 14,
    borderRadius: 7,
    marginVertical: 6,
    width: '90%',
  },
  skeletonLineShort: {
    height: 14,
    borderRadius: 7,
    marginVertical: 4,
    width: '60%',
  },
});

export default LoadingSpinner;
