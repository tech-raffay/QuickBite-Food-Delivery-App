import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { CartContext } from '../context/CartContext';
import { fetchMealDetails } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomButton from '../components/CustomButton';

export const FoodDetailsScreen = ({ route, navigation }) => {
  const { mealId } = route.params;
  const { colors, isDark } = useContext(ThemeContext);
  const { addToCart } = useContext(CartContext);

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadMealData = async () => {
      setLoading(true);
      try {
        const details = await fetchMealDetails(mealId);
        setMeal(details);
        const favStr = await AsyncStorage.getItem('user-favorites');
        const favorites = favStr ? JSON.parse(favStr) : [];
        setIsFavorite(favorites.some((f) => f.id === mealId));
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Could not load details for this meal.');
      } finally {
        setLoading(false);
      }
    };
    loadMealData();
  }, [mealId]);

  const handleToggleFavorite = async () => {
    if (!meal) return;
    try {
      const favStr = await AsyncStorage.getItem('user-favorites');
      let favorites = favStr ? JSON.parse(favStr) : [];
      const index = favorites.findIndex((f) => f.id === meal.id);
      if (index > -1) {
        favorites.splice(index, 1);
        setIsFavorite(false);
        Alert.alert('Removed', 'Removed from favorites!');
      } else {
        favorites.push(meal);
        setIsFavorite(true);
        Alert.alert('Added', 'Added to favorites!');
      }
      await AsyncStorage.setItem('user-favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = () => {
    if (!meal) return;
    addToCart(meal, quantity);
    Alert.alert(
      'Cart Updated',
      `Added ${quantity}x ${meal.name} to your basket!`,
      [{ text: 'Continue Shopping' }, { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner colors={colors} />
      </SafeAreaView>
    );
  }

  if (!meal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorView}>
          <Text style={{ color: colors.text }}>Meal details not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Floating Header */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
          onPress={handleToggleFavorite}
        >
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#D45B5B' : '#FFF'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Hero Image */}
        <Image source={{ uri: meal.image }} style={styles.heroImage} />

        {/* Content Area */}
        <View style={[styles.infoWrapper, { backgroundColor: colors.background }]}>
          {/* Category & Rating */}
          <View style={styles.headerInfo}>
            <View style={[styles.catBadge, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.catText, { color: colors.accent }]}>{meal.category}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#D4A04A" />
              <Text style={[styles.ratingVal, { color: colors.text }]}>{meal.rating}</Text>
              <Text style={[styles.reviewCount, { color: colors.subtext }]}>(250+)</Text>
            </View>
          </View>

          {/* Name & Price */}
          <Text style={[styles.title, { color: colors.text }]}>{meal.name}</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceText, { color: colors.text }]}>
              ${(meal.price || 12.99).toFixed(2)}
            </Text>
            <View style={[styles.qtySelector, { backgroundColor: colors.cardAlt || colors.inputBg }]}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
                <Ionicons name="remove" size={18} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.qtyVal, { color: colors.text }]}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyBtn}>
                <Ionicons name="add" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {meal.ingredients.map((ing, idx) => (
                <View key={idx} style={[styles.ingredientChip, { backgroundColor: colors.cardAlt || colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.ingName, { color: colors.text }]}>{ing.name}</Text>
                  <Text style={[styles.ingMeasure, { color: colors.primary }]}>{ing.measure}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Instructions</Text>
            <Text style={[styles.instructionsText, { color: colors.subtext }]}>
              {meal.instructions}
            </Text>
          </View>

          {/* Reviews */}
          <View style={[styles.section, { marginBottom: 100 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
            {[
              { author: 'Jane Doe', score: 5, comment: 'Simply incredible taste! Highly recommended!' },
              { author: 'John Smith', score: 4, comment: 'Very fresh and fast delivery.' },
            ].map((rev, idx) => (
              <View key={idx} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewAuthor, { color: colors.text }]}>{rev.author}</Text>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: rev.score }).map((_, i) => (
                      <Ionicons key={i} name="star" size={11} color="#D4A04A" />
                    ))}
                  </View>
                </View>
                <Text style={[styles.reviewComment, { color: colors.subtext }]}>{rev.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.totalLabel, { color: colors.subtext }]}>Total</Text>
          <Text style={[styles.totalPrice, { color: colors.text }]}>
            ${((meal.price || 12.99) * quantity).toFixed(2)}
          </Text>
        </View>
        <CustomButton
          title="Add to Basket"
          onPress={handleAddToCart}
          colors={colors}
          type="primary"
          style={styles.addCartBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  floatingHeader: {
    position: 'absolute', top: 48, left: 20, right: 20, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  scrollBody: { flexGrow: 1 },
  heroImage: { width: '100%', height: 300 },
  infoWrapper: {
    marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 22, paddingTop: 28,
  },
  headerInfo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  catBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  catText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingVal: { fontSize: 14, fontWeight: '700', marginLeft: 4 },
  reviewCount: { fontSize: 12, marginLeft: 4 },
  title: { fontSize: 24, fontWeight: '900', lineHeight: 30, marginBottom: 16, letterSpacing: -0.3 },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
  },
  priceText: { fontSize: 24, fontWeight: '800' },
  qtySelector: {
    flexDirection: 'row', alignItems: 'center', height: 42, borderRadius: 20, paddingHorizontal: 6,
  },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  qtyVal: { fontSize: 16, fontWeight: '700', paddingHorizontal: 16 },
  section: { marginVertical: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12, letterSpacing: -0.2 },
  ingredientChip: {
    borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 10, alignItems: 'center',
  },
  ingName: { fontSize: 13, fontWeight: '700' },
  ingMeasure: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  instructionsText: { fontSize: 14, lineHeight: 22 },
  reviewCard: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewAuthor: { fontSize: 13, fontWeight: '700' },
  reviewStars: { flexDirection: 'row' },
  reviewComment: { fontSize: 13, lineHeight: 18 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
    borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 24,
  },
  totalLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  totalPrice: { fontSize: 20, fontWeight: '800' },
  addCartBtn: { width: 170, marginVertical: 0 },
});

export default FoodDetailsScreen;
