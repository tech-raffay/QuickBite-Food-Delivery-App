import React, { useState, useEffect, useContext } from 'react';
import { Platform, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { onAuthStateChangedListener } from '../services/firebase';

// Import Screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FoodDetailsScreen from '../screens/FoodDetailsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/CartScreen';

// Stack and Tab Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Modern Minimal Bottom Tab Navigation
const MainTabNavigator = () => {
  const { colors, isDark } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          // Floating elevated shadow
          shadowColor: isDark ? '#000' : '#1A1A18',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? { backgroundColor: color + '15', borderRadius: 16, width: 46, height: 28, justifyContent: 'center', alignItems: 'center' } : { width: 46, height: 28, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? { backgroundColor: color + '15', borderRadius: 16, width: 46, height: 28, justifyContent: 'center', alignItems: 'center' } : { width: 46, height: 28, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? { backgroundColor: color + '15', borderRadius: 16, width: 46, height: 28, justifyContent: 'center', alignItems: 'center' } : { width: 46, height: 28, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={focused ? 'heart' : 'heart-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? { backgroundColor: color + '15', borderRadius: 16, width: 46, height: 28, justifyContent: 'center', alignItems: 'center' } : { width: 46, height: 28, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigation Structure
export const AppNavigator = () => {
  const { colors } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Listen to Firebase/Mock Authentication state
    const unsubscribe = onAuthStateChangedListener((authUser) => {
      setUser(authUser);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  // Display blank splash placeholder if loading/initializing auth
  if (initializing) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Main Logged-In Flow
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="FoodDetails"
            component={FoodDetailsScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
        </>
      ) : (
        // Authentication Flow
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
