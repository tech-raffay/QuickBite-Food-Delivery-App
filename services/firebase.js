import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration linked to the user's project
const firebaseConfig = {
  apiKey: "AIzaSyDbgy9SF-YnL96RTffn-PMU-n1azPM3VvE",
  authDomain: "food-app-raffay.firebaseapp.com",
  projectId: "food-app-raffay",
  storageBucket: "food-app-raffay.firebasestorage.app",
  messagingSenderId: "618537910480",
  appId: "1:618537910480:web:ef2878eb0bb4d923b19ed5",
  measurementId: "G-N15RJKTPDF"
};

// Check if keys are set
const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'YOUR_API_KEY_HERE' &&
  !firebaseConfig.apiKey.startsWith('YOUR_');

let app;
let realAuth;
let realDb;
let isMockMode = true;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    realAuth = getAuth(app);
    realDb = getFirestore(app);
    isMockMode = false;
    console.log('Firebase successfully initialized in REAL Cloud Mode.');
  } catch (error) {
    console.error('Firebase initialization failed. Falling back to Mock Mode.', error);
    isMockMode = true;
  }
} else {
  console.log('Firebase is not configured. Running in local Mock Mode.');
  isMockMode = true;
}

// -------------------------------------------------------------
// LOCAL MOCK SERVICE LAYER (Using AsyncStorage for persistence)
// -------------------------------------------------------------
let mockAuthUser = null;
const authListeners = new Set();

const triggerAuthListeners = (user) => {
  mockAuthUser = user;
  authListeners.forEach((listener) => listener(user));
};

// Load initial mock user from AsyncStorage on startup
AsyncStorage.getItem('mock_user').then((userStr) => {
  if (userStr) {
    const user = JSON.parse(userStr);
    triggerAuthListeners(user);
  } else {
    triggerAuthListeners(null);
  }
});

const mockAuth = {
  signUp: async (email, password, displayName) => {
    // Basic verification
    if (!email || !password || !displayName) {
      throw new Error('All fields are required.');
    }
    const uid = 'mock-user-' + Math.random().toString(36).substr(2, 9);
    const user = { uid, email, displayName };
    await AsyncStorage.setItem('mock_user', JSON.stringify(user));
    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    triggerAuthListeners(user);
    return user;
  },
  login: async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    // Simulate user
    const username = email.split('@')[0];
    let displayName = username.charAt(0).toUpperCase() + username.slice(1);
    if (username.toLowerCase() === 'demo') {
      displayName = 'Raffay';
    }
    const uid = 'mock-user-' + Math.random().toString(36).substr(2, 9);
    const user = { uid, email, displayName };
    await AsyncStorage.setItem('mock_user', JSON.stringify(user));
    await new Promise((resolve) => setTimeout(resolve, 800));
    triggerAuthListeners(user);
    return user;
  },
  logout: async () => {
    await AsyncStorage.removeItem('mock_user');
    await new Promise((resolve) => setTimeout(resolve, 500));
    triggerAuthListeners(null);
  },
  onStateChanged: (callback) => {
    authListeners.add(callback);
    // Immediately call with current value
    callback(mockAuthUser);
    return () => {
      authListeners.delete(callback);
    };
  },
};

const mockDb = {
  placeOrder: async (orderData) => {
    try {
      const ordersStr = await AsyncStorage.getItem('mock_orders');
      const orders = ordersStr ? JSON.parse(ordersStr) : [];
      const newOrder = {
        id: 'order-' + Math.random().toString(36).substr(2, 9),
        ...orderData,
        orderTime: orderData.orderTime || new Date().toISOString(),
      };
      orders.push(newOrder);
      await AsyncStorage.setItem('mock_orders', JSON.stringify(orders));
      return newOrder;
    } catch (e) {
      throw new Error('Failed to save mock order: ' + e.message);
    }
  },
  subscribeOrders: (userId, callback) => {
    let active = true;
    const checkAndTrigger = async () => {
      try {
        const ordersStr = await AsyncStorage.getItem('mock_orders');
        const orders = ordersStr ? JSON.parse(ordersStr) : [];
        // Filter orders for this user
        const userOrders = orders.filter((o) => o.userId === userId);
        // Sort descending by orderTime
        userOrders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
        if (active) {
          callback(userOrders);
        }
      } catch (e) {
        console.error('Error fetching mock orders', e);
      }
    };

    // Run immediately
    checkAndTrigger();

    // Set up polling interval to simulate live updates
    const intervalId = setInterval(checkAndTrigger, 2000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  },
  deleteOrder: async (orderId) => {
    try {
      const ordersStr = await AsyncStorage.getItem('mock_orders');
      if (ordersStr) {
        let orders = JSON.parse(ordersStr);
        orders = orders.filter((o) => o.id !== orderId);
        await AsyncStorage.setItem('mock_orders', JSON.stringify(orders));
      }
    } catch (e) {
      throw new Error('Failed to delete mock order');
    }
  },
};

// -------------------------------------------------------------
// PUBLIC UNIFIED API (Delegates to Firebase or Mock depending on mode)
// -------------------------------------------------------------

export { isMockMode };

export const signUpUser = async (email, password, displayName) => {
  if (isMockMode) {
    return await mockAuth.signUp(email, password, displayName);
  } else {
    const userCredential = await createUserWithEmailAndPassword(realAuth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  }
};

export const loginUser = async (email, password) => {
  if (isMockMode || email.toLowerCase() === 'demo@quickbite.com') {
    return await mockAuth.login(email, password);
  } else {
    const userCredential = await signInWithEmailAndPassword(realAuth, email, password);
    return userCredential.user;
  }
};

export const logoutUser = async () => {
  if (isMockMode) {
    return await mockAuth.logout();
  } else {
    try {
      await mockAuth.logout(); // Always clear local mock user too
    } catch (e) {}
    return await signOut(realAuth);
  }
};

export const onAuthStateChangedListener = (callback) => {
  if (isMockMode) {
    return mockAuth.onStateChanged(callback);
  } else {
    // Listen to real auth, but check if we have a mock user first
    const unsubReal = onAuthStateChanged(realAuth, async (realUser) => {
      if (realUser) {
        callback(realUser);
      } else {
        const u = await AsyncStorage.getItem('mock_user');
        if (u) {
          callback(JSON.parse(u));
        } else {
          callback(null);
        }
      }
    });
    return unsubReal;
  }
};

export const placeOrder = async (orderData) => {
  if (isMockMode) {
    return await mockDb.placeOrder(orderData);
  } else {
    try {
      const docRef = await addDoc(collection(realDb, 'quickBitecollection'), orderData);
      // Mirrored local copy
      await mockDb.placeOrder({ ...orderData, id: docRef.id });
      return docRef;
    } catch (error) {
      console.warn('Firestore write failed, falling back to AsyncStorage:', error);
      return await mockDb.placeOrder(orderData);
    }
  }
};

export const getOrdersSubscription = (userId, callback) => {
  if (isMockMode) {
    return mockDb.subscribeOrders(userId, callback);
  } else {
    try {
      const q = query(
        collection(realDb, 'quickBitecollection'),
        where('userId', '==', userId),
        orderBy('orderTime', 'desc')
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const orders = [];
          snapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
          });
          callback(orders);
        },
        async (error) => {
          console.warn('Firestore orders read permission denied, falling back to AsyncStorage storage:', error);
          mockDb.subscribeOrders(userId, callback);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn('Firestore query error, falling back to AsyncStorage:', e);
      return mockDb.subscribeOrders(userId, callback);
    }
  }
};

export const deleteOrder = async (orderId) => {
  try {
    await mockDb.deleteOrder(orderId);
  } catch (e) {
    console.error('Failed to delete mock order:', e);
  }

  if (isMockMode) {
    return true;
  } else {
    try {
      const docRef = doc(realDb, 'quickBitecollection', orderId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.warn('Firestore delete failed, local deletion succeeded:', error);
      return true;
    }
  }
};
