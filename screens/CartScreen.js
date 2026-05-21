import React, { useContext } from 'react';
import {
  StyleSheet, Text, View, FlatList, SafeAreaView, StatusBar,
  TouchableOpacity, Image, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { CartContext } from '../context/CartContext';
import CustomButton from '../components/CustomButton';
import EmptyStateCard from '../components/EmptyStateCard';

export const CartScreen = ({ navigation }) => {
  const { colors, isDark } = useContext(ThemeContext);
  const { cartItems, addToCart, removeFromCart, getSubtotal, checkout } = useContext(CartContext);

  const deliveryFee = cartItems.length > 0 ? 2.99 : 0;
  const total = getSubtotal() + deliveryFee;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add items first.');
      return;
    }
    try {
      await checkout();
      Alert.alert('Order Placed! 🎉', 'Your food is being prepared.',
        [{ text: 'Track Order', onPress: () => navigation.navigate('Orders') }]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Checkout failed.');
    }
  };

  return (
    <SafeAreaView style={[styles.c, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Your Basket</Text>
        <View style={{ width: 22 }} />
      </View>

      {cartItems.length === 0 ? (
        <EmptyStateCard icon="basket-outline" title="Basket is Empty"
          description="Browse the menu and add your favorite meals."
          buttonTitle="Browse Menu" onButtonPress={() => navigation.goBack()} colors={colors} />
      ) : (
        <>
          <FlatList data={cartItems} keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image source={{ uri: item.image }} style={styles.img} />
                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.price, { color: colors.primary }]}>${(item.price || 12.99).toFixed(2)}</Text>
                </View>
                <View style={[styles.qtyRow, { backgroundColor: colors.cardAlt || colors.inputBg }]}>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.qtyBtn}>
                    <Ionicons name="remove" size={16} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyVal, { color: colors.text }]}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => addToCart(item, 1)} style={styles.qtyBtn}>
                    <Ionicons name="add" size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <View style={[styles.summary, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.subtext }]}>Subtotal</Text>
              <Text style={[styles.val, { color: colors.text }]}>${getSubtotal().toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.subtext }]}>Delivery</Text>
              <Text style={[styles.val, { color: colors.text }]}>${deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalVal, { color: colors.text }]}>${total.toFixed(2)}</Text>
            </View>
            <CustomButton title="Place Order" onPress={handleCheckout} colors={colors} type="primary" />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '800' },
  list: { padding: 16, paddingBottom: 250 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, padding: 12, marginBottom: 12 },
  img: { width: 56, height: 56, borderRadius: 14, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '800' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 4, height: 36 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  qtyVal: { fontSize: 14, fontWeight: '700', paddingHorizontal: 10 },
  summary: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14 },
  val: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalVal: { fontSize: 18, fontWeight: '900' },
});

export default CartScreen;
