import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Shield,
  ArrowLeft,
  Lock,
  Smartphone,
  Check,
  Copy,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

type SetupStep = 'initial' | 'scanning' | 'verifying' | 'backup' | 'complete';

export default function SecuritySettingsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState<SetupStep>('initial');
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Disable modal
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState('');

  useEffect(() => {
    // Check if 2FA is already enabled (from user data or localStorage)
    const storedUser = localStorage?.getItem?.('reputehq_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setIs2FAEnabled(userData.two_factor_enabled || false);
    }
  }, []);

  const startSetup = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.setup2FA(user.id);
      if (response.success && response.qrCode && response.manualEntryKey) {
        setQrCode(response.qrCode);
        setManualKey(response.manualEntryKey);
        setSetupStep('scanning');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        setError(response.error || 'Failed to start 2FA setup');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!user?.id || verifyCode.length !== 6) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.verify2FASetup(user.id, verifyCode);
      if (response.success && response.backupCodes) {
        setBackupCodes(response.backupCodes);
        setSetupStep('backup');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Update stored user
        const storedUser = localStorage?.getItem?.('reputehq_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.two_factor_enabled = true;
          localStorage?.setItem?.('reputehq_user', JSON.stringify(userData));
        }
      } else {
        setError(response.error || 'Invalid verification code');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const finishSetup = () => {
    setIs2FAEnabled(true);
    setSetupStep('initial');
    setVerifyCode('');
    setQrCode('');
    setManualKey('');
    setBackupCodes([]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const disable2FA = async () => {
    if (!user?.id || !disablePassword) return;
    setDisableLoading(true);
    setDisableError('');

    try {
      const response = await api.disable2FA(user.id, disablePassword);
      if (response.success) {
        setIs2FAEnabled(false);
        setShowDisableModal(false);
        setDisablePassword('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Update stored user
        const storedUser = localStorage?.getItem?.('reputehq_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.two_factor_enabled = false;
          localStorage?.setItem?.('reputehq_user', JSON.stringify(userData));
        }
      } else {
        setDisableError(response.error || 'Failed to disable 2FA');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      setDisableError(err instanceof Error ? err.message : 'Failed to disable 2FA');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setDisableLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const copyAllBackupCodes = async () => {
    const codesText = backupCodes.join('\n');
    await Clipboard.setStringAsync(codesText);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View className="flex-1 bg-[#F7F8FA]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-[#1A1F36]">
        <View className="flex-row items-center px-4 py-4">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3 active:opacity-70"
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">Security Settings</Text>
            <Text className="text-white/60 text-sm">Manage your account security</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Initial View - 2FA Status */}
        {setupStep === 'initial' && (
          <>
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              className="bg-white rounded-2xl p-5 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className={`w-14 h-14 rounded-2xl items-center justify-center ${is2FAEnabled ? 'bg-[#00D4AA]/10' : 'bg-[#F59E0B]/10'}`}>
                  <Shield size={28} color={is2FAEnabled ? '#00D4AA' : '#F59E0B'} />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-[#1A1F36] text-lg font-bold">Two-Factor Authentication</Text>
                  <View className="flex-row items-center mt-1">
                    <View className={`w-2 h-2 rounded-full mr-2 ${is2FAEnabled ? 'bg-[#00D4AA]' : 'bg-[#F59E0B]'}`} />
                    <Text className={`text-sm font-medium ${is2FAEnabled ? 'text-[#00D4AA]' : 'text-[#F59E0B]'}`}>
                      {is2FAEnabled ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text className="text-[#6B7280] text-sm leading-5 mb-5">
                {is2FAEnabled
                  ? 'Your account is protected with two-factor authentication. You\'ll need to enter a code from your authenticator app when signing in.'
                  : 'Add an extra layer of security to your account by requiring a verification code in addition to your password when signing in.'}
              </Text>

              {is2FAEnabled ? (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowDisableModal(true);
                  }}
                  className="bg-red-50 rounded-xl py-4 items-center active:opacity-80"
                >
                  <Text className="text-red-500 font-semibold">Disable Two-Factor Authentication</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={startSetup}
                  disabled={loading}
                  className="bg-[#00D4AA] rounded-xl py-4 flex-row items-center justify-center active:opacity-90"
                >
                  {loading ? (
                    <ActivityIndicator color="#1A1F36" />
                  ) : (
                    <>
                      <Lock size={20} color="#1A1F36" />
                      <Text className="text-[#1A1F36] font-semibold ml-2">Enable Two-Factor Authentication</Text>
                    </>
                  )}
                </Pressable>
              )}

              {error ? (
                <View className="mt-4 bg-red-50 rounded-xl p-3">
                  <Text className="text-red-500 text-sm text-center">{error}</Text>
                </View>
              ) : null}
            </Animated.View>

            {/* Info Card */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(400)}
              className="bg-white rounded-2xl p-5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
              }}
            >
              <Text className="text-[#1A1F36] font-semibold mb-3">How it works</Text>
              <View className="flex-row items-start mb-3">
                <View className="w-6 h-6 rounded-full bg-[#1A1F36] items-center justify-center mr-3">
                  <Text className="text-white text-xs font-bold">1</Text>
                </View>
                <Text className="flex-1 text-[#6B7280] text-sm leading-5">
                  Download an authenticator app like Google Authenticator or Authy
                </Text>
              </View>
              <View className="flex-row items-start mb-3">
                <View className="w-6 h-6 rounded-full bg-[#1A1F36] items-center justify-center mr-3">
                  <Text className="text-white text-xs font-bold">2</Text>
                </View>
                <Text className="flex-1 text-[#6B7280] text-sm leading-5">
                  Scan the QR code or enter the setup key manually
                </Text>
              </View>
              <View className="flex-row items-start">
                <View className="w-6 h-6 rounded-full bg-[#1A1F36] items-center justify-center mr-3">
                  <Text className="text-white text-xs font-bold">3</Text>
                </View>
                <Text className="flex-1 text-[#6B7280] text-sm leading-5">
                  Enter the 6-digit code to verify and enable 2FA
                </Text>
              </View>
            </Animated.View>
          </>
        )}

        {/* Scanning Step */}
        {setupStep === 'scanning' && (
          <>
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              className="bg-white rounded-2xl p-5 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-[#1A1F36] items-center justify-center mr-3">
                  <Text className="text-white text-sm font-bold">1</Text>
                </View>
                <Text className="text-[#1A1F36] text-lg font-bold">Scan QR Code</Text>
              </View>

              <Text className="text-[#6B7280] text-sm mb-5">
                Open your authenticator app and scan this QR code:
              </Text>

              {qrCode ? (
                <View className="bg-[#F7F8FA] rounded-xl p-4 items-center mb-4">
                  <Image
                    source={{ uri: qrCode }}
                    style={{ width: 200, height: 200 }}
                    contentFit="contain"
                  />
                </View>
              ) : null}

              <Text className="text-[#6B7280] text-xs text-center mb-2">Or enter this code manually:</Text>
              <Pressable
                onPress={() => copyToClipboard(manualKey.replace(/\s/g, ''))}
                className="bg-[#F7F8FA] rounded-xl p-4 flex-row items-center justify-center active:opacity-70"
              >
                <Text className="text-[#1A1F36] font-mono text-sm tracking-wider">{manualKey}</Text>
                <Copy size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
              </Pressable>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(200).duration(400)}
              className="bg-white rounded-2xl p-5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-[#1A1F36] items-center justify-center mr-3">
                  <Text className="text-white text-sm font-bold">2</Text>
                </View>
                <Text className="text-[#1A1F36] text-lg font-bold">Enter Verification Code</Text>
              </View>

              <Text className="text-[#6B7280] text-sm mb-4">
                Enter the 6-digit code from your authenticator app:
              </Text>

              <TextInput
                value={verifyCode}
                onChangeText={(text) => setVerifyCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                placeholderTextColor="#D1D5DB"
                keyboardType="number-pad"
                maxLength={6}
                className="bg-[#F7F8FA] rounded-xl py-4 px-4 text-[#1A1F36] text-2xl text-center tracking-[8px] font-semibold mb-4"
              />

              {error ? (
                <View className="bg-red-50 rounded-xl p-3 mb-4">
                  <Text className="text-red-500 text-sm text-center">{error}</Text>
                </View>
              ) : null}

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setSetupStep('initial');
                    setVerifyCode('');
                    setError('');
                  }}
                  className="flex-1 bg-[#F3F4F6] rounded-xl py-4 items-center active:opacity-70"
                >
                  <Text className="text-[#6B7280] font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={verifySetup}
                  disabled={loading || verifyCode.length !== 6}
                  className={`flex-1 rounded-xl py-4 items-center ${
                    verifyCode.length === 6 ? 'bg-[#00D4AA] active:opacity-90' : 'bg-[#E5E7EB]'
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color={verifyCode.length === 6 ? '#1A1F36' : '#9CA3AF'} />
                  ) : (
                    <Text className={`font-semibold ${verifyCode.length === 6 ? 'text-[#1A1F36]' : 'text-[#9CA3AF]'}`}>
                      Verify & Enable
                    </Text>
                  )}
                </Pressable>
              </View>
            </Animated.View>
          </>
        )}

        {/* Backup Codes Step */}
        {setupStep === 'backup' && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            className="bg-white rounded-2xl p-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            }}
          >
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#00D4AA]/10 items-center justify-center mb-3">
                <Check size={32} color="#00D4AA" />
              </View>
              <Text className="text-[#1A1F36] text-xl font-bold">Save Your Backup Codes</Text>
            </View>

            <View className="bg-[#FEF3C7] rounded-xl p-4 mb-4 flex-row items-start">
              <AlertTriangle size={20} color="#D97706" style={{ marginRight: 10, marginTop: 2 }} />
              <Text className="flex-1 text-[#92400E] text-sm leading-5">
                Save these backup codes in a safe place. You can use them to sign in if you lose access to your authenticator app. Each code can only be used once.
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2 mb-4">
              {backupCodes.map((code, index) => (
                <Pressable
                  key={index}
                  onPress={() => copyToClipboard(code)}
                  className="bg-[#F7F8FA] rounded-lg px-4 py-2 active:opacity-70"
                >
                  <Text className="font-mono text-[#1A1F36] text-sm">{code}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={copyAllBackupCodes}
              className="bg-[#F3F4F6] rounded-xl py-3 flex-row items-center justify-center mb-4 active:opacity-70"
            >
              <Copy size={16} color="#6B7280" />
              <Text className="text-[#6B7280] font-medium ml-2">Copy All Codes</Text>
            </Pressable>

            <Pressable
              onPress={finishSetup}
              className="bg-[#00D4AA] rounded-xl py-4 items-center active:opacity-90"
            >
              <Text className="text-[#1A1F36] font-semibold">I've Saved My Backup Codes</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>

      {/* Disable 2FA Modal */}
      <Modal visible={showDisableModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-3xl w-full p-6">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <Shield size={32} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-[#1A1F36]">Disable 2FA?</Text>
              <Text className="text-[#6B7280] text-center mt-2">
                This will remove the extra layer of security from your account.
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-[#374151] mb-2">Enter your password to confirm:</Text>
              <View className="flex-row items-center bg-[#F7F8FA] rounded-xl px-4">
                <TextInput
                  value={disablePassword}
                  onChangeText={setDisablePassword}
                  placeholder="Your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  className="flex-1 py-3.5 text-[#1A1F36]"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </Pressable>
              </View>
            </View>

            {disableError ? (
              <View className="bg-red-50 rounded-xl p-3 mb-4">
                <Text className="text-red-500 text-sm text-center">{disableError}</Text>
              </View>
            ) : null}

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowDisableModal(false);
                  setDisablePassword('');
                  setDisableError('');
                }}
                className="flex-1 bg-[#F3F4F6] rounded-xl py-3.5 items-center active:opacity-70"
              >
                <Text className="font-semibold text-[#6B7280]">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={disable2FA}
                disabled={disableLoading || !disablePassword}
                className={`flex-1 rounded-xl py-3.5 items-center ${
                  disablePassword ? 'bg-red-500 active:opacity-90' : 'bg-red-200'
                }`}
              >
                {disableLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-semibold text-white">Disable</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
