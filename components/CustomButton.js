import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const CustomButton = ({
  title,
  onPress,
  type = 'primary', // 'primary', 'secondary', 'outline', 'text'
  colors,
  style,
  textStyle,
  icon,
  disabled = false,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const renderContent = () => {
    if (type === 'primary') {
      return (
        <LinearGradient
          colors={['#C28B3A', '#D4A04A', '#E8C97A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, styles.buttonCommon]}
        >
          {icon}
          <Text style={[styles.textPrimary, textStyle]}>{title}</Text>
        </LinearGradient>
      );
    }

    if (type === 'secondary') {
      return (
        <LinearGradient
          colors={['#6B9E5B', '#7BAE6E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, styles.buttonCommon]}
        >
          {icon}
          <Text style={[styles.textPrimary, textStyle]}>{title}</Text>
        </LinearGradient>
      );
    }

    if (type === 'outline') {
      return (
        <View
          style={[
            styles.buttonCommon,
            styles.outline,
            { borderColor: colors?.primary || '#C28B3A' },
          ]}
        >
          {icon}
          <Text style={[styles.textOutline, { color: colors?.primary || '#C28B3A' }, textStyle]}>
            {title}
          </Text>
        </View>
      );
    }

    // Text type button
    return (
      <View style={[styles.textButton]}>
        {icon}
        <Text style={[styles.textOnly, { color: colors?.primary || '#C28B3A' }, textStyle]}>
          {title}
        </Text>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={!disabled ? onPress : null}
      onPressIn={!disabled ? handlePressIn : null}
      onPressOut={!disabled ? handlePressOut : null}
    >
      <Animated.View
        style={[
          styles.container,
          style,
          { transform: [{ scale: scaleValue }], opacity: disabled ? 0.5 : 1 },
        ]}
      >
        {renderContent()}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  buttonCommon: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  gradient: {
    width: '100%',
  },
  outline: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  textPrimary: {
    color: '#1A1A18',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textOutline: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textOnly: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CustomButton;
