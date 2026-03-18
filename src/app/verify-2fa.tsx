import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield, ArrowLeft, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

export default function Verify2FAScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const setUser = useAuthStore((s) => s.setUser);

  const handleVerify = async () => {
    if (!code.trim() || code.length < 6) {
      setErrorMessage('Please enter a valid 6-digit code');
      return;
    }

    if (!userId) {
      setErrorMessage('Invalid session. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.verify2FA(userId, code.trim());

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
      const errorMsg = error instanceof Error ? error.message : 'Verification failed';
      setErrorMessage(errorMsg);
      console.error('2FA verify error:', error);
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
          style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}
        >
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="px-6 mb-8 flex-row items-center active:opacity-70"
          >
            <ArrowLeft size={24} color="#ffffff" />
          </Pressable>

          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            className="px-8 mb-10"
          >
            <View className="w-16 h-16 bg-[#00D4AA]/20 rounded-2xl items-center justify-center mb-6">
              <Shield size={32} color="#00D4AA" />
            </View>
            <Text className="text-white text-3xl font-bold mb-2">
              Two-Factor Auth
            </Text>
            <Text className="text-white/60 text-base">
              Enter the 6-digit code from your authenticator app
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            className="px-8"
          >
            {/* Code Input */}
            <View className="mb-6">
              <Text className="text-white/80 text-sm font-medium mb-2 ml-1">
                Verification Code
              </Text>
              <TextInput
                value={code}
                onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="number-pad"
                maxLength={6}
                className="bg-white/10 rounded-xl py-5 px-4 text-white text-2xl text-center tracking-[8px] font-semibold"
              />
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View className="bg-red-500/20 rounded-lg p-3 mb-4">
                <Text className="text-red-400 text-sm text-center">{errorMessage}</Text>
              </View>
            ) : null}

            {/* Verify Button */}
            <Pressable
              onPress={handleVerify}
              disabled={isLoading || code.length < 6}
              className={`rounded-xl py-4 flex-row items-center justify-center mb-6 ${
                code.length >= 6 ? 'bg-[#00D4AA]' : 'bg-white/20'
              }`}
            >
              <Text className={`text-base font-semibold mr-2 ${
                code.length >= 6 ? 'text-[#1A1F36]' : 'text-white/50'
              }`}>
                {isLoading ? 'Verifying...' : 'Verify'}
              </Text>
              {!isLoading && code.length >= 6 && <ArrowRight size={20} color="#1A1F36" />}
            </Pressable>

            {/* Help Text */}
            <Text className="text-white/40 text-sm text-center">
              You can also use a backup code if you don't have access to your authenticator app
            </Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
