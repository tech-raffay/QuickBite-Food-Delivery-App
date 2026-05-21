import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// RestaurantCard is display-only — NOT clickable, NOT navigable
export const RestaurantCard = ({ item, colors }) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      {/* Banner image of the restaurant */}
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

      {/* Rating overlay badge */}
      <View style={styles.ratingBadge}>
        <View style={styles.ratingPill}>
          <Ionicons name="star" size={11} color="#D4A04A" />
          <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
        </View>
      </View>

      {/* Restaurant metadata body */}
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={[styles.address, { color: colors.subtext }]} numberOfLines={1}>
          {item.address}
        </Text>

        {/* Divider line */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Delivery & Time Details */}
        <View style={styles.footerRow}>
          <View style={styles.detailItem}>
            <Ionicons name="bicycle-outline" size={14} color={colors.subtext} />
            <Text style={[styles.detailText, { color: colors.subtext }]}>
              {item.deliveryFee === '$0.00' ? 'Free' : item.deliveryFee}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.subtext} />
            <Text style={[styles.detailText, { color: colors.subtext }]}>
              {item.deliveryTime}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color={colors.subtext} />
            <Text style={[styles.detailText, { color: colors.primary }]}>
              {item.distance}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    color: '#F5F0E8',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  body: {
    padding: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default RestaurantCard;
