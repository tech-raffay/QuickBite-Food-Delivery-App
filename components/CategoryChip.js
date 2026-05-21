import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const CategoryChip = ({ name, active, onPress, colors }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.92,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const renderChip = () => {
    if (active) {
      return (
        <LinearGradient
          colors={[colors.gradient1 || '#D4A04A', colors.gradient2 || '#E8C97A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeChip}
        >
          <Text style={styles.activeText}>{name}</Text>
        </LinearGradient>
      );
    }

    return (
      <View
        style={[
          styles.inactiveChip,
          {
            backgroundColor: colors.cardAlt || colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.inactiveText, { color: colors.subtext }]}>{name}</Text>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
        {renderChip()}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
    marginVertical: 8,
  },
  activeChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4A04A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  inactiveChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeText: {
    color: '#1A1A18',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  inactiveText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default CategoryChip;
