import React, { useContext, useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, StatusBar, TouchableOpacity,
  Switch, Image, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { logoutUser, getOrdersSubscription } from '../services/firebase';

export const ProfileScreen = () => {
  const { colors, isDark, toggleTheme } = useContext(ThemeContext);
  const [name, setName] = useState('Raffay');
  const [email, setEmail] = useState('raffay@quickbite.com');
  const [stats, setStats] = useState({ orders: 0, favorites: 0 });

  useFocusEffect(useCallback(() => {
    const load = async () => {
      try {
        const u = await AsyncStorage.getItem('mock_user');
        let uid = 'anonymous';
        if (u) {
          const p = JSON.parse(u);
          let displayName = p.displayName || 'Raffay';
          if (displayName.toLowerCase() === 'demo') {
            displayName = 'Raffay';
          }
          setName(displayName);
          setEmail(p.email || 'raffay@quickbite.com');
          uid = p.uid;
        }
        const f = await AsyncStorage.getItem('user-favorites');
        const favs = f ? JSON.parse(f) : [];
        const unsub = getOrdersSubscription(uid, (o) => { setStats({ orders: o.length, favorites: favs.length }); unsub(); });
      } catch (e) {}
    };
    load();
  }, []));

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => { try { await logoutUser(); } catch (e) {} }},
    ]);
  };

  const SettingRow = ({ icon, iconBg, label, onPress, trailing }) => (
    <TouchableOpacity
      style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={onPress ? 0.7 : 1} onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color="#FFF" />
        </View>
        <Text style={[styles.settingText, { color: colors.text }]}>{label}</Text>
      </View>
      {trailing || <Ionicons name="chevron-forward" size={16} color={colors.subtext} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.c, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image
            source={require('../assets/pfp.png')}
            style={[styles.avatar, { borderColor: colors.primary }]}
            resizeMode="cover"
          />
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.email, { color: colors.subtext }]}>{email}</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { val: stats.orders, label: 'Orders' },
            { val: stats.favorites, label: 'Favorites' },
            { val: 12, label: 'Reviews' },
          ].map((s, i) => (
            <View key={i} style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statVal, { color: colors.primary }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          <SettingRow icon="moon-outline" iconBg="#7B68AE" label="Dark Mode"
            trailing={<Switch value={isDark} onValueChange={toggleTheme}
              trackColor={{ false: '#ccc', true: colors.primary }} thumbColor="#FFF" />}
          />
          <SettingRow icon="location-outline" iconBg="#6B9E5B" label="Delivery Addresses"
            onPress={() => Alert.alert('Address', '123 Gourmet St, Food Town')} />
          <SettingRow icon="card-outline" iconBg="#D4A04A" label="Payment Methods"
            onPress={() => Alert.alert('Payment', 'Integrated with checkout.')} />
          <SettingRow icon="help-circle-outline" iconBg="#5A8FBD" label="Help & Support" />
        </View>

        <TouchableOpacity
          style={[styles.logoutRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleLogout} activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  c: { flex: 1 },
  profileHeader: { alignItems: 'center', marginTop: 30, marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 14, borderWidth: 2.5, overflow: 'hidden' },
  name: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  email: { fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 28 },
  statBox: { width: '30%', paddingVertical: 14, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    height: 56, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, marginBottom: 10,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingText: { fontSize: 15, fontWeight: '600' },
  logoutRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 54, borderRadius: 16, borderWidth: 1, marginHorizontal: 20, marginTop: 8, marginBottom: 40,
  },
  logoutText: { fontSize: 15, fontWeight: '700', marginLeft: 8 },
});

export default ProfileScreen;
