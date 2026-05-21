import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { CartContext } from '../context/CartContext';
import { fetchMeals, fetchRestaurants } from '../services/api';
import { isMockMode } from '../services/firebase';
import SearchBar from '../components/SearchBar';
import CategoryChip from '../components/CategoryChip';
import FoodCard from '../components/FoodCard';
import RestaurantCard from '../components/RestaurantCard';
import LoadingSpinner from '../components/LoadingSpinner';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Beef', 'Chicken', 'Dessert', 'Seafood', 'Vegetarian'];

export const DashboardScreen = ({ navigation }) => {
  const { colors, isDark } = useContext(ThemeContext);
  const { cartItems, addToCart } = useContext(CartContext);

  const [userName, setUserName] = useState('Raffay');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const mockUserStr = await AsyncStorage.getItem('mock_user');
        if (mockUserStr) {
          const user = JSON.parse(mockUserStr);
          let name = user.displayName || user.email.split('@')[0];
          if (name.toLowerCase() === 'demo') {
            name = 'Raffay';
          }
          setUserName(name);
        }
      } catch (e) {
        console.error('Failed to get user data', e);
      }
    };
    getUserData();
  }, []);

  const loadFavorites = async () => {
    try {
      const favStr = await AsyncStorage.getItem('user-favorites');
      if (favStr) setFavorites(JSON.parse(favStr));
      else setFavorites([]);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadData = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const [mealsData, restData] = await Promise.all([
        fetchMeals(searchQuery),
        fetchRestaurants(),
      ]);
      setMeals(mealsData);
      setFilteredMeals(mealsData);
      setRestaurants(restData);
    } catch (error) {
      console.error(error);
      Alert.alert('Connection Error', 'Failed to fetch the latest menu items. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredMeals(meals);
      return;
    }
    try {
      const results = await fetchMeals(text);
      setFilteredMeals(results);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredMeals(meals);
    } else {
      const filtered = meals.filter(
        (meal) => meal.category && meal.category.toLowerCase() === category.toLowerCase()
      );
      setFilteredMeals(filtered);
    }
  };

  const handleToggleFavorite = async (meal) => {
    try {
      const favStr = await AsyncStorage.getItem('user-favorites');
      let currentFavs = favStr ? JSON.parse(favStr) : [];
      const index = currentFavs.findIndex((f) => f.id === meal.id);

      if (index > -1) {
        currentFavs.splice(index, 1);
        Alert.alert('Removed', `${meal.name} removed from favorites.`);
      } else {
        currentFavs.push(meal);
        Alert.alert('Added', `${meal.name} added to favorites!`);
      }

      setFavorites(currentFavs);
      await AsyncStorage.setItem('user-favorites', JSON.stringify(currentFavs));
    } catch (e) {
      console.error(e);
    }
  };

  const getCartTotalCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.subtext }]}>Hello,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{userName} 👋</Text>
        </View>
        <View style={styles.headerRight}>
          {isMockMode && (
            <View style={[styles.demoBadge, { backgroundColor: colors.highlight }]}>
              <Text style={styles.demoText}>Demo</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="basket-outline" size={22} color={colors.text} />
            {getCartTotalCount() > 0 ? (
              <View style={[styles.badgeContainer, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{getCartTotalCount()}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search foods (e.g. Pizza, Pasta)..."
          colors={colors}
        />

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              name={cat}
              active={selectedCategory === cat}
              onPress={() => handleSelectCategory(cat)}
              colors={colors}
            />
          ))}
        </ScrollView>

        {loading ? (
          <LoadingSpinner colors={colors} type="skeleton" />
        ) : (
          <>
            {/* Trending Carousel */}
            {filteredMeals.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Now</Text>
                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={filteredMeals.slice(0, 5)}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => navigation.navigate('FoodDetails', { mealId: item.id })}
                      style={[styles.trendingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <Image source={{ uri: item.image }} style={styles.trendingImage} />
                      <View style={styles.trendingTextContainer}>
                        <Text style={[styles.trendingName, { color: colors.text }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={[styles.trendingPrice, { color: colors.primary }]}>
                          ${(item.price || 12.99).toFixed(2)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Popular Foods Grid */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Dishes</Text>
              </View>
              {filteredMeals.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.subtext }]}>
                  No meals found. Try a different search.
                </Text>
              ) : (
                <View style={styles.foodsGrid}>
                  {filteredMeals.slice(0, 8).map((meal) => (
                    <FoodCard
                      key={meal.id}
                      item={meal}
                      colors={colors}
                      isFavorite={favorites.some((f) => f.id === meal.id)}
                      onFavoritePress={() => handleToggleFavorite(meal)}
                      onAddToCart={() => {
                        addToCart(meal, 1);
                        Alert.alert('Added to Cart', `${meal.name} has been added to your basket.`);
                      }}
                      onPress={() => navigation.navigate('FoodDetails', { mealId: meal.id })}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Recommended Restaurants — display-only, NOT clickable */}
            {restaurants.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Restaurants</Text>
                </View>
                {restaurants.slice(0, 6).map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    item={restaurant}
                    colors={colors}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  greeting: { fontSize: 13, fontWeight: '500' },
  userName: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  demoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  demoText: { color: '#1A1A18', fontSize: 10, fontWeight: '700' },
  iconButton: {
    width: 44, height: 44, borderRadius: 14, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  badgeContainer: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FFF',
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  scrollBody: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  categoriesScroll: { marginBottom: 4 },
  sectionContainer: { marginVertical: 6 },
  trendingCard: {
    width: width * 0.62,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 14,
  },
  trendingImage: { width: '100%', height: 100 },
  trendingTextContainer: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingName: { fontSize: 13, fontWeight: '700', flex: 1, marginRight: 8 },
  trendingPrice: { fontSize: 14, fontWeight: '800' },
  foodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyText: { fontSize: 14, textAlign: 'center', marginVertical: 20 },
});

export default DashboardScreen;
