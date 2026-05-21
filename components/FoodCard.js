import React, { useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableWithoutFeedback, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const FoodCard = ({ item, isFavorite, onFavoritePress, onAddToCart, onPress, colors }) => {
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

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {/* Floating Favorite Heart Button */}
        <TouchableOpacity
          style={[styles.favoriteBtn, { backgroundColor: colors.glass }]}
          onPress={onFavoritePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? '#D45B5B' : colors.subtext}
          />
        </TouchableOpacity>

        {/* Hero Food Image */}
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

        {/* Rating Pill overlay */}
        <View style={styles.ratingBadge}>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={10} color="#D4A04A" />
            <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.body}>
          <Text style={[styles.category, { color: colors.accent }]} numberOfLines={1}>
            {item.category || 'Food'}
          </Text>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Delivery time metadata */}
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={12} color={colors.subtext} />
            <Text style={[styles.metaText, { color: colors.subtext }]}>
              {item.deliveryTime || '25 mins'}
            </Text>
          </View>

          {/* Footer containing Price & Add button */}
          <View style={styles.footerRow}>
            <Text style={[styles.price, { color: colors.text }]}>
              ${(item.price || 12.99).toFixed(2)}
            </Text>
            {onAddToCart ? (
              <TouchableOpacity
                onPress={onAddToCart}
                activeOpacity={0.8}
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="add" size={16} color="#FFF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '47%',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 115,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    color: '#F5F0E8',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },
  body: {
    padding: 12,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    fontSize: 11,
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FoodCard;
