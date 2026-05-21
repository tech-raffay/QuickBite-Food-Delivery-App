import React, { useContext } from 'react';
import { StyleSheet, Text, View, ImageBackground, StatusBar, Dimensions } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import CustomButton from '../components/CustomButton';
import { LinearGradient } from 'expo-linear-gradient';

const { height, width } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }) => {
  const { colors, isDark } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Large visual background image */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
        }}
        style={styles.heroImage}
        resizeMode="cover"
      >
        {/* Sleek bottom gradient overlay */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(0, 0, 0, 0.3)',
            isDark ? '#121210' : '#FAF7F2',
          ]}
          locations={[0, 0.5, 0.95]}
          style={StyleSheet.absoluteFillObject}
        />
      </ImageBackground>

      {/* Details and Actions Area */}
      <View style={styles.content}>
        <View style={styles.textWrapper}>
          <Text style={[styles.title, { color: colors.text }]}>
            Order Delicious{'\n'}Food Fast
          </Text>
          <Text style={[styles.description, { color: colors.subtext }]}>
            Browse the best cuisines from top local restaurants and get them delivered hot and fresh in minutes.
          </Text>
        </View>

        <View style={styles.actionWrapper}>
          <CustomButton
            title="Log In to Your Account"
            onPress={() => navigation.navigate('Login')}
            colors={colors}
            type="primary"
            style={styles.loginBtn}
          />
          <CustomButton
            title="Create an Account"
            onPress={() => navigation.navigate('Signup')}
            colors={colors}
            type="outline"
            style={styles.signupBtn}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroImage: {
    width: width,
    height: height * 0.52,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingBottom: 44,
    marginTop: -10,
  },
  textWrapper: {
    marginTop: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 38,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionWrapper: {
    width: '100%',
  },
  loginBtn: {
    marginBottom: 6,
  },
  signupBtn: {
    marginTop: 2,
  },
});

export default WelcomeScreen;
