import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useAdminAuthStore } from '@/lib/store';
import { db } from '@/lib/database';

export default function AdminLoginScreenWeb() {
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
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting admin login for:', email);
      const admin = await db.validateAdminLogin(email, password);
      console.log('Login result:', admin);

      if (admin) {
        setAdmin({
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        });
        setIsLoading(false);
        router.replace('/admin');
      } else {
        setError('Invalid admin credentials');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: '100%', maxWidth: 440 }}>
            {/* Back Button */}
            <Pressable
              onPress={() => router.back()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 32,
              }}
            >
              <ArrowLeft size={24} color="#ffffff" />
              <Text style={{ color: '#ffffff', marginLeft: 8, fontSize: 16 }}>Back</Text>
            </Pressable>

            {/* Header */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(600)}
              style={{ marginBottom: 40 }}
            >
              {/* Logo */}
              <Image
                source={require('../../public/real-logo.png')}
                style={{ width: 64, height: 64, marginBottom: 20 }}
                contentFit="contain"
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Shield size={22} color="#F59E0B" />
                <Text style={{ color: '#F59E0B', fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
                  Admin Portal
                </Text>
              </View>
              <Text style={{ color: '#ffffff', fontSize: 36, fontWeight: '700', marginBottom: 8 }}>
                Admin Login
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>
                Access the ReputeHQ admin dashboard
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInDown.delay(200).duration(600)}>
              {/* Error Message */}
              {error ? (
                <Animated.View
                  entering={FadeInDown.duration(300)}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderWidth: 1,
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                  }}
                >
                  <Text style={{ color: '#f87171', fontSize: 14, textAlign: 'center' }}>{error}</Text>
                </Animated.View>
              ) : null}

              {/* Email Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 }}>
                  Admin Email
                </Text>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                }}>
                  <Mail size={20} color="rgba(255,255,255,0.5)" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="admin@reputehq.com"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      paddingHorizontal: 12,
                      color: '#ffffff',
                      fontSize: 16,
                    }}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: 28 }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 }}>
                  Password
                </Text>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                }}>
                  <Lock size={20} color="rgba(255,255,255,0.5)" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter admin password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    secureTextEntry={!showPassword}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      paddingHorizontal: 12,
                      color: '#ffffff',
                      fontSize: 16,
                    }}
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
                style={{
                  backgroundColor: '#F59E0B',
                  borderRadius: 12,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 32,
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '600', marginRight: 8 }}>
                  {isLoading ? 'Signing in...' : 'Access Admin Panel'}
                </Text>
                {!isLoading && <ArrowRight size={20} color="#0F172A" />}
              </Pressable>

              {/* Back to User Login */}
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>
                  Not an admin?{' '}
                </Text>
                <Pressable onPress={() => router.push('/login')}>
                  <Text style={{ color: '#00D4AA', fontSize: 16, fontWeight: '600' }}>
                    User Login
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
