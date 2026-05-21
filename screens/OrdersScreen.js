import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet, Text, View, FlatList, SafeAreaView, StatusBar,
  TouchableOpacity, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { getOrdersSubscription, deleteOrder } from '../services/firebase';
import EmptyStateCard from '../components/EmptyStateCard';
import LoadingSpinner from '../components/LoadingSpinner';

export const OrdersScreen = ({ navigation }) => {
  const { colors, isDark } = useContext(ThemeContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    const setup = async () => {
      try {
        const userStr = await AsyncStorage.getItem('mock_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          unsubscribe = getOrdersSubscription(user.uid, (list) => {
            setOrders(list);
            setLoading(false);
          });
        } else { setLoading(false); }
      } catch (e) { setLoading(false); }
    };
    setup();
    return () => unsubscribe();
  }, []);

  const handleDelete = (id) => {
    Alert.alert('Cancel Order', 'Cancel this order?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try { await deleteOrder(id); } catch (e) { Alert.alert('Error', 'Failed.'); }
      }},
    ]);
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatus = (iso) => {
    const m = (Date.now() - new Date(iso).getTime()) / 60000;
    if (m < 2) return { text: 'Placed', color: '#D4A04A' };
    if (m < 5) return { text: 'Preparing', color: '#5AABBD' };
    if (m < 10) return { text: 'On the Way', color: '#5A8FBD' };
    return { text: 'Delivered', color: '#6B9E5B' };
  };

  return (
    <SafeAreaView style={[styles.c, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Your Orders</Text>
      </View>
      {loading ? <LoadingSpinner colors={colors} /> : orders.length === 0 ? (
        <EmptyStateCard icon="receipt-outline" title="No Orders Yet"
          description="Your order history will appear here."
          buttonTitle="Order Now" onButtonPress={() => navigation.navigate('Home')} colors={colors} />
      ) : (
        <FlatList data={orders} keyExtractor={(i) => i.id} contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const s = getStatus(item.orderTime);
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.top}>
                  <View style={styles.foodRow}>
                    {item.image && <Image source={{ uri: item.image }} style={styles.img} />}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.fname, { color: colors.text }]} numberOfLines={1}>{item.foodName}</Text>
                      <Text style={[{ color: colors.subtext, fontSize: 12 }]}>{formatDate(item.orderTime)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 8 }}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.div, { backgroundColor: colors.border }]} />
                <View style={styles.bot}>
                  <View>
                    <Text style={[{ color: colors.subtext, fontSize: 12, fontWeight: '600' }]}>Qty: {item.quantity}</Text>
                    <Text style={[styles.price, { color: colors.text }]}>${parseFloat(item.price).toFixed(2)}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: s.color + '18' }]}>
                    <View style={[styles.dot, { backgroundColor: s.color }]} />
                    <Text style={[{ color: s.color, fontSize: 12, fontWeight: '700' }]}>{s.text}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: '800' },
  list: { padding: 16 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  foodRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  img: { width: 48, height: 48, borderRadius: 10, marginRight: 12 },
  fname: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  div: { height: 1, marginVertical: 12 },
  bot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '800' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
});

export default OrdersScreen;
