import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Settings,
  LogOut,
  Shield,
  User,
  Bell,
  Lock,
  HelpCircle,
  ChevronRight,
  Mail,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useAdminAuthStore } from '@/lib/store';

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const admin = useAdminAuthStore((s) => s.admin);
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);
  const adminLogout = useAdminAuthStore((s) => s.adminLogout);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    adminLogout();
    router.replace('/login');
  };

  if (!isAdminAuthenticated) {
    return null;
  }

  const settingsItems = [
    {
      icon: <User size={20} color="#00D4AA" />,
      title: 'Account',
      subtitle: 'Manage your admin account',
      onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    },
    {
      icon: <Bell size={20} color="#F59E0B" />,
      title: 'Notifications',
      subtitle: 'Configure alert preferences',
      onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    },
    {
      icon: <Lock size={20} color="#8B5CF6" />,
      title: 'Security',
      subtitle: 'Password & 2FA settings',
      onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    },
    {
      icon: <HelpCircle size={20} color="#3B82F6" />,
      title: 'Help & Support',
      subtitle: 'Get help with ReputeHQ',
      onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    },
  ];

  return (
    <View className="flex-1 bg-[#F7F8FA]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-[#0F172A]">
        <View className="px-5 py-4">
          <View className="flex-row items-center">
            <Settings size={24} color="#9CA3AF" />
            <Text className="text-white text-xl font-bold ml-3">Settings</Text>
          </View>
          <Text className="text-white/60 text-sm mt-1">Admin preferences</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Admin Profile Card */}
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
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-[#0F172A] items-center justify-center">
              <Text className="text-white font-bold text-2xl">
                {admin?.name?.charAt(0).toUpperCase() ?? 'A'}
              </Text>
            </View>
            <View className="flex-1 ml-4">
              <View className="flex-row items-center">
                <Shield size={14} color="#F59E0B" />
                <Text className="text-[#F59E0B] text-xs font-semibold ml-1 uppercase">
                  {admin?.role?.replace('_', ' ') ?? 'Admin'}
                </Text>
              </View>
              <Text className="text-[#1A1F36] text-lg font-bold mt-1">
                {admin?.name ?? 'Admin User'}
              </Text>
              <View className="flex-row items-center mt-1">
                <Mail size={12} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm ml-1">
                  {admin?.email ?? 'admin@reputehq.com'}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Logo */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          className="bg-white rounded-2xl p-5 mb-4 items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
          }}
        >
          <Image
            source={require('../../../public/real-logo.png')}
            style={{ width: 64, height: 64 }}
            contentFit="contain"
          />
          <Text className="text-[#1A1F36] text-lg font-bold mt-3">ReputeHQ</Text>
          <Text className="text-gray-500 text-sm">Admin Dashboard v1.0</Text>
        </Animated.View>

        {/* Settings List */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="bg-white rounded-2xl overflow-hidden mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
          }}
        >
          {settingsItems.map((item, index) => (
            <Pressable
              key={item.title}
              onPress={item.onPress}
              className={`flex-row items-center px-5 py-4 active:bg-gray-50 ${
                index < settingsItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center">
                {item.icon}
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-[#1A1F36] font-semibold">{item.title}</Text>
                <Text className="text-gray-500 text-sm mt-0.5">{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color="#D1D5DB" />
            </Pressable>
          ))}
        </Animated.View>

        {/* Sign Out Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowLogoutConfirm(true);
            }}
            className="bg-red-50 rounded-2xl py-4 flex-row items-center justify-center active:opacity-80"
          >
            <LogOut size={20} color="#EF4444" />
            <Text className="text-red-500 font-semibold ml-2">Sign Out</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutConfirm} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-3xl w-full p-6">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <LogOut size={32} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-[#1A1F36]">Sign Out?</Text>
              <Text className="text-gray-500 text-center mt-2">
                Are you sure you want to sign out of the admin panel?
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-100 rounded-xl py-3.5 items-center active:opacity-70"
              >
                <Text className="font-semibold text-gray-600">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleLogout}
                className="flex-1 bg-red-500 rounded-xl py-3.5 items-center active:opacity-90"
              >
                <Text className="font-semibold text-white">Sign Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
