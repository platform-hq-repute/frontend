import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  Sparkles,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Check,
  X,
  MessageSquare,
  Zap,
  Coffee,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useAuthStore, useBusinessStore, useReviewsStore, AISettings } from '@/lib/store';

type ToneOption = AISettings['tone'];

const toneOptions: { value: ToneOption; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'professional',
    label: 'Professional',
    description: 'Formal and business-appropriate',
    icon: <MessageSquare size={20} color="#1A1F36" />,
  },
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Warm and personable with emojis',
    icon: <Coffee size={20} color="#1A1F36" />,
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Relaxed and conversational',
    icon: <Zap size={20} color="#1A1F36" />,
  },
];

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider mb-2 px-1">
        {title}
      </Text>
      <View className="bg-white rounded-2xl overflow-hidden">{children}</View>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  isLast = false,
  showChevron = true,
  rightContent,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
  showChevron?: boolean;
  rightContent?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-4 active:bg-[#F7F8FA] ${
        !isLast ? 'border-b border-[#F3F4F6]' : ''
      }`}
      disabled={!onPress}
    >
      <View className="w-9 h-9 bg-[#F7F8FA] rounded-xl items-center justify-center">{icon}</View>
      <View className="flex-1 ml-3">
        <Text className="text-[#1A1F36] text-base">{label}</Text>
      </View>
      {rightContent ? (
        rightContent
      ) : (
        <>
          {value && <Text className="text-[#9CA3AF] text-sm mr-2">{value}</Text>}
          {showChevron && onPress && <ChevronRight size={18} color="#D1D5DB" />}
        </>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const aiSettings = useBusinessStore((s) => s.aiSettings);
  const updateAISettings = useBusinessStore((s) => s.updateAISettings);
  const clearBusinessData = useBusinessStore((s) => s.clearBusinessData);
  const clearReviews = useReviewsStore((s) => s.setReviews);

  const [showToneModal, setShowToneModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleToneChange = (tone: ToneOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateAISettings({ tone });
    setShowToneModal(false);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    clearBusinessData();
    clearReviews([]);
    logout();
    router.replace('/login');
  };

  const toggleAutoPublish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateAISettings({ autoPublish: !aiSettings.autoPublish });
  };

  return (
    <View className="flex-1 bg-[#F7F8FA]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-white border-b border-[#F3F4F6]">
        <View className="px-6 py-4">
          <Text className="text-2xl font-bold text-[#1A1F36]">Settings</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-6">
          <View
            className="bg-white rounded-2xl p-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            }}
          >
            <View className="flex-row items-center">
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  className="w-16 h-16 rounded-full"
                  contentFit="cover"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-[#1A1F36] items-center justify-center">
                  <Text className="text-white text-2xl font-semibold">
                    {user?.name?.charAt(0) ?? 'U'}
                  </Text>
                </View>
              )}
              <View className="ml-4 flex-1">
                <Text className="text-[#1A1F36] text-lg font-semibold">{user?.name ?? 'User'}</Text>
                <Text className="text-[#9CA3AF] text-sm mt-0.5">{user?.email ?? ''}</Text>
              </View>
              <ChevronRight size={20} color="#D1D5DB" />
            </View>
          </View>
        </Animated.View>

        {/* AI Settings */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <SettingsSection title="AI Response Settings">
            <SettingsRow
              icon={<Sparkles size={18} color="#00D4AA" />}
              label="Response Tone"
              value={aiSettings.tone.charAt(0).toUpperCase() + aiSettings.tone.slice(1)}
              onPress={() => setShowToneModal(true)}
            />
            <SettingsRow
              icon={<Zap size={18} color="#F59E0B" />}
              label="Auto-publish Responses"
              onPress={toggleAutoPublish}
              showChevron={false}
              isLast
              rightContent={
                <Switch
                  value={aiSettings.autoPublish}
                  onValueChange={toggleAutoPublish}
                  trackColor={{ false: '#E5E7EB', true: '#00D4AA' }}
                  thumbColor="#ffffff"
                />
              }
            />
          </SettingsSection>
        </Animated.View>

        {/* Security */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <SettingsSection title="Security">
            <SettingsRow
              icon={<Shield size={18} color="#00D4AA" />}
              label="Two-Factor Authentication"
              value=""
              onPress={() => router.push('/security-settings')}
              isLast
            />
          </SettingsSection>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <SettingsSection title="Notifications">
            <SettingsRow
              icon={<Bell size={18} color="#8B5CF6" />}
              label="Push Notifications"
              value="Enabled"
              onPress={() => {}}
              isLast
            />
          </SettingsSection>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <SettingsSection title="Support">
            <SettingsRow
              icon={<HelpCircle size={18} color="#6B7280" />}
              label="Help Center"
              onPress={() => {}}
            />
            <SettingsRow
              icon={<Shield size={18} color="#6B7280" />}
              label="Privacy Policy"
              onPress={() => {}}
              isLast
            />
          </SettingsSection>
        </Animated.View>

        {/* Account */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <SettingsSection title="Account">
            <Pressable
              onPress={() => setShowLogoutConfirm(true)}
              className="flex-row items-center px-4 py-4 active:bg-[#F7F8FA]"
            >
              <View className="w-9 h-9 bg-[#FEE2E2] rounded-xl items-center justify-center">
                <LogOut size={18} color="#EF4444" />
              </View>
              <Text className="flex-1 ml-3 text-[#EF4444] text-base">Sign Out</Text>
            </Pressable>
          </SettingsSection>
        </Animated.View>

        {/* App Version with Logo */}
        <View className="items-center mt-4">
          <Image
            source={require('../../../public/real-logo.png')}
            style={{ width: 32, height: 32, marginBottom: 8 }}
            contentFit="contain"
          />
          <Text className="text-[#D1D5DB] text-xs">ReputeHQ v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Tone Selection Modal */}
      <Modal
        visible={showToneModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowToneModal(false)}
      >
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
            <Pressable
              onPress={() => setShowToneModal(false)}
              className="w-10 h-10 items-center justify-center rounded-full bg-[#F7F8FA] active:opacity-70"
            >
              <X size={20} color="#1A1F36" />
            </Pressable>
            <Text className="text-lg font-semibold text-[#1A1F36]">Response Tone</Text>
            <View className="w-10" />
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
            <Text className="text-[#6B7280] text-sm mb-6">
              Choose how you want AI to communicate in review responses.
            </Text>

            {toneOptions.map((option, index) => (
              <Animated.View
                key={option.value}
                entering={FadeInDown.delay(index * 100).duration(400)}
              >
                <Pressable
                  onPress={() => handleToneChange(option.value)}
                  className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
                    aiSettings.tone === option.value
                      ? 'border-[#00D4AA] bg-[#00D4AA]/5'
                      : 'border-[#E5E7EB] bg-white'
                  } active:opacity-90`}
                >
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center ${
                      aiSettings.tone === option.value ? 'bg-[#00D4AA]/20' : 'bg-[#F7F8FA]'
                    }`}
                  >
                    {option.icon}
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-[#1A1F36] font-semibold text-base">{option.label}</Text>
                    <Text className="text-[#9CA3AF] text-sm mt-0.5">{option.description}</Text>
                  </View>
                  {aiSettings.tone === option.value && (
                    <View className="w-6 h-6 bg-[#00D4AA] rounded-full items-center justify-center">
                      <Check size={14} color="#ffffff" strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-8">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <Text className="text-[#1A1F36] text-xl font-bold text-center">Sign Out</Text>
            <Text className="text-[#6B7280] text-center mt-3">
              Are you sure you want to sign out of ReputeHQ?
            </Text>
            <View className="flex-row mt-6">
              <Pressable
                onPress={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3.5 bg-[#F3F4F6] rounded-xl mr-2 active:opacity-70"
              >
                <Text className="text-[#6B7280] font-semibold text-center">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleLogout}
                className="flex-1 py-3.5 bg-[#EF4444] rounded-xl ml-2 active:opacity-90"
              >
                <Text className="text-white font-semibold text-center">Sign Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
