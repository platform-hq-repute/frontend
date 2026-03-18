import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { api } from '@/lib/api';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.signup(name.trim(), email.trim(), password);

      if (response.success) {
        setSuccessMessage('Account created! Please check your email to verify your account.');
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Signup failed';
      setErrorMessage(errorMsg);
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1A1F36]">
      <LinearGradient
        colors={['#1A1F36', '#2D3555']}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 20,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
            <Pressable
              onPress={() => router.back()}
              className="px-6 mb-4 flex-row items-center active:opacity-70"
            >
              <ArrowLeft size={24} color="#ffffff" />
            </Pressable>

            {/* Header */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(600)}
              className="px-8 mb-10"
            >
              {/* Logo */}
              <Image
                source={require('../../public/real-logo.png')}
                style={{ width: 56, height: 56, marginBottom: 16 }}
                contentFit="contain"
              />
              <Text className="text-[#00D4AA] text-lg font-semibold mb-2">
                ReputeHQ
              </Text>
              <Text className="text-white text-3xl font-bold mb-2">
                Create account
              </Text>
              <Text className="text-white/60 text-base">
                Start managing your reviews today
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(600)}
              className="px-8"
            >
              {/* Name Input */}
              <View className="mb-4">
                <Text className="text-white/80 text-sm font-medium mb-2 ml-1">
                  Full Name
                </Text>
                <View className="bg-white/10 rounded-xl flex-row items-center px-4">
                  <User size={20} color="rgba(255,255,255,0.5)" />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="John Smith"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    autoCapitalize="words"
                    autoCorrect={false}
                    className="flex-1 py-4 px-3 text-white text-base"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-white/80 text-sm font-medium mb-2 ml-1">
                  Work Email
                </Text>
                <View className="bg-white/10 rounded-xl flex-row items-center px-4">
                  <Mail size={20} color="rgba(255,255,255,0.5)" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@company.com"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 py-4 px-3 text-white text-base"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="text-white/80 text-sm font-medium mb-2 ml-1">
                  Password
                </Text>
                <View className="bg-white/10 rounded-xl flex-row items-center px-4">
                  <Lock size={20} color="rgba(255,255,255,0.5)" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a strong password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    secureTextEntry={!showPassword}
                    className="flex-1 py-4 px-3 text-white text-base"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={20} color="rgba(255,255,255,0.5)" />
                    ) : (
                      <Eye size={20} color="rgba(255,255,255,0.5)" />
                    )}
                  </Pressable>
                </View>
                <Text className="text-white/40 text-xs mt-2 ml-1">
                  Must be at least 8 characters
                </Text>
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <View className="bg-red-500/20 rounded-lg p-3 mb-4">
                  <Text className="text-red-400 text-sm text-center">{errorMessage}</Text>
                </View>
              ) : null}

              {/* Success Message */}
              {successMessage ? (
                <View className="bg-green-500/20 rounded-lg p-4 mb-4">
                  <View className="flex-row items-center justify-center mb-2">
                    <CheckCircle size={20} color="#22C55E" />
                    <Text className="text-green-400 text-sm font-semibold ml-2">Success!</Text>
                  </View>
                  <Text className="text-green-400 text-sm text-center">{successMessage}</Text>
                </View>
              ) : null}

              {/* Sign Up Button */}
              <Pressable
                onPress={handleSignup}
                disabled={isLoading}
                className="bg-[#00D4AA] rounded-xl py-4 flex-row items-center justify-center mb-6 active:opacity-90"
              >
                <Text className="text-[#1A1F36] text-base font-semibold mr-2">
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Text>
                {!isLoading && <ArrowRight size={20} color="#1A1F36" />}
              </Pressable>

              {/* Terms */}
              <Text className="text-white/40 text-xs text-center leading-5 mb-8">
                By creating an account, you agree to our{' '}
                <Text className="text-white/60">Terms of Service</Text> and{' '}
                <Text className="text-white/60">Privacy Policy</Text>
              </Text>

              {/* Sign In Link */}
              <View className="flex-row justify-center">
                <Text className="text-white/60 text-base">
                  Already have an account?{' '}
                </Text>
                <Pressable onPress={() => router.back()}>
                  <Text className="text-[#00D4AA] text-base font-semibold">
                    Sign In
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
