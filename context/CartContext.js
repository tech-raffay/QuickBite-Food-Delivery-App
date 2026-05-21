import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { placeOrder } from '../services/firebase';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load persisted cart on startup
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('user-cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    };
    loadCart();
  }, []);

  const saveCart = async (newItems) => {
    try {
      setCartItems(newItems);
      await AsyncStorage.setItem('user-cart', JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  };

  const addToCart = (item, quantity = 1) => {
    const existingIndex = cartItems.findIndex((i) => i.id === item.id);
    let updatedItems = [...cartItems];

    if (existingIndex > -1) {
      updatedItems[existingIndex].quantity += quantity;
    } else {
      updatedItems.push({
        id: item.id,
        name: item.name,
        price: item.price || 12.99, // Fallback if API lacks price
        image: item.image,
        category: item.category,
        quantity: quantity,
      });
    }
    saveCart(updatedItems);
  };

  const removeFromCart = (itemId) => {
    const updatedItems = cartItems.filter((item) => item.id !== itemId);
    saveCart(updatedItems);
  };

  const updateQuantity = (itemId, change) => {
    const updatedItems = cartItems
      .map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantity + change;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    saveCart(updatedItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const checkout = async (userId, userEmail) => {
    if (cartItems.length === 0) throw new Error('Cart is empty');

    let finalUid = userId;
    let finalEmail = userEmail;

    if (!finalUid || !finalEmail) {
      try {
        const u = await AsyncStorage.getItem('mock_user');
        if (u) {
          const parsed = JSON.parse(u);
          if (!finalUid) finalUid = parsed.uid;
          if (!finalEmail) finalEmail = parsed.email;
        }
      } catch (e) {
        console.error('Error fetching mock_user in checkout', e);
      }
    }

    // Place each item in Firestore/AsyncStorage as an order
    for (const item of cartItems) {
      await placeOrder({
        userId: finalUid || 'anonymous',
        userEmail: finalEmail || 'guest@quickbite.com',
        foodName: item.name,
        quantity: item.quantity,
        price: item.price * item.quantity,
        image: item.image,
        orderTime: new Date().toISOString(),
      });
    }
    clearCart();
    return { success: true };
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
