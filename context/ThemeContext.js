import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    // Load persisted theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('user-theme');
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        } else {
          setIsDark(systemColorScheme === 'dark');
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    try {
      const nextTheme = !isDark;
      setIsDark(nextTheme);
      await AsyncStorage.setItem('user-theme', nextTheme ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const colors = isDark
    ? {
        primary: '#D4A04A',          // Warm gold
        secondary: '#C28B3A',        // Deeper gold
        background: '#121210',       // Rich dark
        card: '#1C1B18',             // Dark warm card
        text: '#F5F0E8',             // Cream white text
        subtext: '#9B978E',          // Muted warm gray
        border: '#2E2D28',           // Subtle dark border
        shadow: 'rgba(0, 0, 0, 0.4)',
        glass: 'rgba(28, 27, 24, 0.75)',
        inputBg: '#232220',          // Dark warm input
        accent: '#7BAE6E',           // Subtle sage green
        white: '#F5F0E8',
        success: '#7BAE6E',          // Sage green
        error: '#D45B5B',            // Soft red
        tabBar: '#151513',
        highlight: '#E8C97A',        // Soft yellow highlight
        cardAlt: '#242320',          // Alternate card shade
        gradient1: '#D4A04A',        // Gradient start
        gradient2: '#C28B3A',        // Gradient end
      }
    : {
        primary: '#C28B3A',          // Warm brown-gold
        secondary: '#A8742E',        // Deeper warm tone
        background: '#FAF7F2',       // Cream white
        card: '#FFFFFF',             // Pure white cards
        text: '#1A1A18',             // Near-black typography
        subtext: '#7A7670',          // Warm gray
        border: '#EDE8E0',           // Beige border
        shadow: 'rgba(30, 25, 15, 0.06)',
        glass: 'rgba(255, 253, 248, 0.85)',
        inputBg: '#F5F1EB',          // Warm beige input
        accent: '#6B9E5B',           // Subtle green
        white: '#FFFFFF',
        success: '#6B9E5B',          // Sage green
        error: '#C94C4C',            // Muted red
        tabBar: '#FFFFFF',
        highlight: '#F2D98A',        // Soft yellow
        cardAlt: '#F7F3ED',          // Light beige alternate
        gradient1: '#D4A04A',        // Gradient start
        gradient2: '#E8C97A',        // Gradient end
      };

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
