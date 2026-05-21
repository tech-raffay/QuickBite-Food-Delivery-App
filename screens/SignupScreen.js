import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { signUpUser, isMockMode } from '../services/firebase';
import CustomButton from '../components/CustomButton';

export const SignupScreen = ({ navigation }) => {
  const { colors, isDark } = useContext(ThemeContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const validate = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUpUser(email, password, name);
      if (isMockMode) {
        Alert.alert('Demo Registration Success', `Welcome ${name}! Running in offline Demo Mode.`);
      } else {
        Alert.alert('Success', 'Account created successfully!');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Signup Failed', error.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, icon, value, setValue, focused, setFocused, options = {}) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.subtext }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.inputBg,
            borderColor: focused ? colors.primary : 'transparent',
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={focused ? colors.primary : colors.subtext}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={options.placeholder || ''}
          placeholderTextColor={colors.subtext}
          secureTextEntry={options.secure && !showPassword}
          autoCapitalize={options.autoCapitalize || 'none'}
          keyboardType={options.keyboardType || 'default'}
          value={value}
          onChangeText={setValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {options.showToggle && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.subtext}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Sign up to get fresh food delivered to you instantly.
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
          ]}
        >
          {renderInput('Full Name', 'person-outline', name, setName, nameFocused, setNameFocused, {
            placeholder: 'Enter your full name',
            autoCapitalize: 'words',
          })}
          {renderInput('Email Address', 'mail-outline', email, setEmail, emailFocused, setEmailFocused, {
            placeholder: 'Enter your email',
            keyboardType: 'email-address',
          })}
          {renderInput('Password', 'lock-closed-outline', password, setPassword, passwordFocused, setPasswordFocused, {
            placeholder: 'Create password',
            secure: true,
            showToggle: true,
          })}
          {renderInput('Confirm Password', 'lock-closed-outline', confirmPassword, setConfirmPassword, confirmFocused, setConfirmFocused, {
            placeholder: 'Confirm password',
            secure: true,
          })}

          <CustomButton
            title={loading ? 'Registering...' : 'Sign Up'}
            onPress={handleSignup}
            colors={colors}
            type="primary"
            disabled={loading}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.subtext }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: { marginTop: 60, marginBottom: 24 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 8, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, lineHeight: 20 },
  card: {
    borderRadius: 22, borderWidth: 1, padding: 22,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06,
    shadowRadius: 12, elevation: 3, marginBottom: 24,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: {
    height: 50, borderRadius: 14, flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 14, borderWidth: 1.5,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, height: '100%' },
  eyeBtn: { padding: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  footerText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: '700' },
});

export default SignupScreen;
