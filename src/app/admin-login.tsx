import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useAdminAuthStore } from '@/lib/store';
import { db } from '@/lib/database';

export default function AdminLoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const setAdmin = useAdminAuthStore((s) => s.setAdmin);

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);

    try {
      const admin = await db.validateAdminLogin(email, password);

      if (admin) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setAdmin({
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        });
        setIsLoading(false);
        router.replace('/admin');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Invalid admin credentials');
        setIsLoading(false);
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0F172A]">
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
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
              <View className="flex-row items-center mb-2">
                <Shield size={20} color="#F59E0B" />
                <Text className="text-[#F59E0B] text-lg font-semibold ml-2">
                  Admin Portal
                </Text>
              </View>
              <Text className="text-white text-3xl font-bold mb-2">
                Admin Login
              </Text>
              <Text className="text-white/60 text-base">
                Access the ReputeHQ admin dashboard
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(600)}
              className="px-8"
            >
              {/* Error Message */}
              {error ? (
                <Animated.View
                  entering={FadeInDown.duration(300)}
                  className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6"
                >
                  <Text className="text-red-400 text-sm text-center">{error}</Text>
                </Animated.View>
              ) : null}

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-white/80 text-sm font-medium mb-2 ml-1">
                  Admin Email
                </Text>
                <View className="bg-white/10 rounded-xl flex-row items-center px-4">
                  <Mail size={20} color="rgba(255,255,255,0.5)" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="admin@reputehq.com"
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
                    placeholder="Enter admin password"
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

              {/* Sign In Button */}
              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                className="bg-[#F59E0B] rounded-xl py-4 flex-row items-center justify-center mb-8 active:opacity-90"
              >
                <Text className="text-[#0F172A] text-base font-semibold mr-2">
                  {isLoading ? 'Signing in...' : 'Access Admin Panel'}
                </Text>
                {!isLoading && <ArrowRight size={20} color="#0F172A" />}
              </Pressable>

              {/* Back to User Login */}
              <View className="flex-row justify-center mt-8">
                <Text className="text-white/60 text-base">
                  Not an admin?{' '}
                </Text>
                <Pressable onPress={() => router.push('/login')}>
                  <Text className="text-[#00D4AA] text-base font-semibold">
                    User Login
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
