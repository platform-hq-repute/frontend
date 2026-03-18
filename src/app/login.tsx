import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.login(email, password);

      if (response.requires2FA && response.userId) {
        // Navigate to 2FA verification screen
        router.push({
          pathname: '/verify-2fa',
          params: { userId: response.userId }
        });
        return;
      }

      if (response.success && response.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          avatar: response.user.avatar,
        });
        router.replace('/(tabs)');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed';

      if (errorMsg.includes('verify your email')) {
        setErrorMessage('Please verify your email before signing in');
      } else {
        setErrorMessage(errorMsg);
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Google OAuth not implemented yet
    setErrorMessage('Google sign-in coming soon');
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
              paddingTop: insets.top + 40,
              paddingBottom: insets.bottom + 20,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
                Welcome back
              </Text>
              <Text className="text-white/60 text-base">
                Sign in to manage your reviews
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(600)}
              className="px-8"
            >
              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-white/80 text-sm font-medium mb-2 ml-1">
                  Email
                </Text>
                <View className="bg-white/10 rounded-xl flex-row items-center px-4">
                  <Mail size={20} color="rgba(255,255,255,0.5)" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 py-4 px-3 text-white text-base"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-white/80 text-sm font-medium mb-2 ml-1">
                  Password
                </Text>
                <View className="bg-white/10 rounded-xl flex-row items-center px-4">
                  <Lock size={20} color="rgba(255,255,255,0.5)" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
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
              </View>

              {/* Forgot Password */}
              <Pressable className="self-end mb-4">
                <Text className="text-[#00D4AA] text-sm font-medium">
                  Forgot password?
                </Text>
              </Pressable>

              {/* Error Message */}
              {errorMessage ? (
                <View className="bg-red-500/20 rounded-lg p-3 mb-4">
                  <Text className="text-red-400 text-sm text-center">{errorMessage}</Text>
                </View>
              ) : null}

              {/* Sign In Button */}
              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                className="bg-[#00D4AA] rounded-xl py-4 flex-row items-center justify-center mb-6 active:opacity-90"
              >
                <Text className="text-[#1A1F36] text-base font-semibold mr-2">
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Text>
                {!isLoading && <ArrowRight size={20} color="#1A1F36" />}
              </Pressable>

              {/* Divider */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-white/20" />
                <Text className="text-white/40 mx-4 text-sm">or continue with</Text>
                <View className="flex-1 h-px bg-white/20" />
              </View>

              {/* Google Sign In */}
              <Pressable
                onPress={handleGoogleSignIn}
                disabled={isLoading}
                className="bg-white rounded-xl py-4 flex-row items-center justify-center mb-8 active:opacity-90"
              >
                <Text className="text-[#1A1F36] text-base font-semibold">
                  Continue with Google
                </Text>
              </Pressable>

              {/* Sign Up Link */}
              <View className="flex-row justify-center mb-6">
                <Text className="text-white/60 text-base">
                  Don't have an account?{' '}
                </Text>
                <Pressable onPress={() => router.push('/signup')}>
                  <Text className="text-[#00D4AA] text-base font-semibold">
                    Sign Up
                  </Text>
                </Pressable>
              </View>

              {/* Admin Login Link */}
              <Pressable
                onPress={() => router.push('/admin-login')}
                className="flex-row items-center justify-center py-3 active:opacity-70"
              >
                <Shield size={16} color="#F59E0B" />
                <Text className="text-[#F59E0B] text-sm font-medium ml-2">
                  Admin Login
                </Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
