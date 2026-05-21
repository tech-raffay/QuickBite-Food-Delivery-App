import React, { useState, useContext, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, SafeAreaView, StatusBar,
  TouchableOpacity, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import EmptyStateCard from '../components/EmptyStateCard';

export const FavoritesScreen = ({ navigation }) => {
  const { colors, isDark } = useContext(ThemeContext);
  const [favorites, setFavorites] = useState([]);

  const loadFavorites = async () => {
    try {
      const str = await AsyncStorage.getItem('user-favorites');
      setFavorites(str ? JSON.parse(str) : []);
    } catch (e) { console.error(e); }
  };

  useFocusEffect(useCallback(() => { loadFavorites(); }, []));

  const removeFavorite = async (id) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    await AsyncStorage.setItem('user-favorites', JSON.stringify(updated));
    Alert.alert('Removed', 'Item removed from favorites.');
  };

  const clearAllFavorites = () => {
    if (favorites.length === 0) return;
    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all saved favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('user-favorites');
              setFavorites([]);
              Alert.alert('Cleared', 'All favorites have been cleared.');
            } catch (e) {
              console.error(e);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.c, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
          <Text style={[styles.count, { color: colors.subtext }]}>{favorites.length} items</Text>
        </View>
        {favorites.length > 0 ? (
          <TouchableOpacity onPress={clearAllFavorites} style={styles.clearAllBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.error} style={{ marginRight: 4 }} />
            <Text style={[styles.clearAllText, { color: colors.error }]}>Clear All</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {favorites.length === 0 ? (
        <EmptyStateCard icon="heart-outline" title="No Favorites"
          description="Tap the heart on any dish to save it here."
          buttonTitle="Browse Food" onButtonPress={() => navigation.navigate('Home')}
          colors={colors} />
      ) : (
        <FlatList data={favorites} keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('FoodDetails', { mealId: item.id })}
            >
              <Image source={{ uri: item.image }} style={styles.img} />
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.cat, { color: colors.accent }]}>{item.category}</Text>
                <Text style={[styles.price, { color: colors.text }]}>${(item.price || 12.99).toFixed(2)}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFavorite(item.id)} style={styles.removeBtn}>
                <Ionicons name="heart-dislike-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800' },
  count: { fontSize: 13, fontWeight: '600' },
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, padding: 12, marginBottom: 12 },
  img: { width: 64, height: 64, borderRadius: 14, marginRight: 14 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  cat: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  price: { fontSize: 15, fontWeight: '800' },
  removeBtn: { padding: 10 },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D45B5B' + '25',
    backgroundColor: '#D45B5B' + '08',
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default FavoritesScreen;
