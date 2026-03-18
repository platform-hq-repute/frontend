import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Shield,
  Key,
  Bell,
  Database,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAdminAuthStore } from '@/lib/store';
import { db } from '@/lib/database';
import { AdminWebLayout } from '@/components/AdminWebLayout';

export default function AdminSettingsWeb() {
  const router = useRouter();
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);
  const adminEmail = useAdminAuthStore((s) => s.admin?.email);
  const adminRole = useAdminAuthStore((s) => s.admin?.role);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  React.useEffect(() => {
    if (!isAdminAuthenticated) {
      router.replace('/admin-login');
    }
  }, [isAdminAuthenticated]);

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      await db.reset();
      setResetModalVisible(false);
    } catch (error) {
      console.error('Error resetting database:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleChangePassword = () => {
    // In a real app, this would validate and update the password
    if (passwordForm.new !== passwordForm.confirm) {
      return;
    }
    setPasswordModalVisible(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  if (!isAdminAuthenticated) return null;

  return (
    <AdminWebLayout title="Settings" subtitle="Manage admin settings and preferences">
      <View className="max-w-3xl">
        {/* Admin Profile */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <View className="flex-row items-center mb-6">
            <Shield size={24} color="#00D4AA" />
            <Text className="text-lg font-bold text-[#1A1F36] ml-3">Admin Profile</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-cyan-100 items-center justify-center">
              <Text className="text-cyan-600 font-bold text-2xl">
                {adminEmail?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="ml-4">
              <Text className="font-semibold text-[#1A1F36] text-lg">{adminEmail}</Text>
              <View className="flex-row items-center mt-1">
                <View className="bg-cyan-100 px-2 py-0.5 rounded-full">
                  <Text className="text-cyan-700 text-sm font-medium capitalize">
                    {adminRole?.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Security Settings */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <View className="flex-row items-center mb-6">
            <Key size={24} color="#00D4AA" />
            <Text className="text-lg font-bold text-[#1A1F36] ml-3">Security</Text>
          </View>

          <Pressable
            onPress={() => setPasswordModalVisible(true)}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View>
              <Text className="font-medium text-[#1A1F36]">Change Password</Text>
              <Text className="text-gray-500 text-sm mt-1">
                Update your admin password
              </Text>
            </View>
            <View className="bg-gray-100 px-4 py-2 rounded-lg">
              <Text className="text-gray-600 font-medium">Change</Text>
            </View>
          </Pressable>

          <View className="flex-row items-center justify-between py-4">
            <View>
              <Text className="font-medium text-[#1A1F36]">Two-Factor Authentication</Text>
              <Text className="text-gray-500 text-sm mt-1">
                Add an extra layer of security
              </Text>
            </View>
            <View className="bg-yellow-100 px-3 py-1.5 rounded-lg">
              <Text className="text-yellow-700 font-medium text-sm">Coming Soon</Text>
            </View>
          </View>
        </Animated.View>

        {/* Notification Settings */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <View className="flex-row items-center mb-6">
            <Bell size={24} color="#00D4AA" />
            <Text className="text-lg font-bold text-[#1A1F36] ml-3">Notifications</Text>
          </View>

          <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View>
              <Text className="font-medium text-[#1A1F36]">New User Alerts</Text>
              <Text className="text-gray-500 text-sm mt-1">
                Get notified when new users register
              </Text>
            </View>
            <View className="w-12 h-7 bg-cyan-500 rounded-full justify-center px-1">
              <View className="w-5 h-5 bg-white rounded-full ml-auto" />
            </View>
          </View>

          <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View>
              <Text className="font-medium text-[#1A1F36]">Negative Review Alerts</Text>
              <Text className="text-gray-500 text-sm mt-1">
                Get notified for reviews with rating below 3
              </Text>
            </View>
            <View className="w-12 h-7 bg-cyan-500 rounded-full justify-center px-1">
              <View className="w-5 h-5 bg-white rounded-full ml-auto" />
            </View>
          </View>

          <View className="flex-row items-center justify-between py-4">
            <View>
              <Text className="font-medium text-[#1A1F36]">Weekly Reports</Text>
              <Text className="text-gray-500 text-sm mt-1">
                Receive weekly platform summary
              </Text>
            </View>
            <View className="w-12 h-7 bg-gray-200 rounded-full justify-center px-1">
              <View className="w-5 h-5 bg-white rounded-full" />
            </View>
          </View>
        </Animated.View>

        {/* Database Settings */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <View className="flex-row items-center mb-6">
            <Database size={24} color="#00D4AA" />
            <Text className="text-lg font-bold text-[#1A1F36] ml-3">Database</Text>
          </View>

          <Pressable
            onPress={() => setResetModalVisible(true)}
            className="flex-row items-center justify-between py-4"
          >
            <View>
              <Text className="font-medium text-[#1A1F36]">Reset Database</Text>
              <Text className="text-gray-500 text-sm mt-1">
                Reset all data to initial seed data (for testing)
              </Text>
            </View>
            <View className="bg-red-50 px-4 py-2 rounded-lg flex-row items-center">
              <RefreshCw size={16} color="#EF4444" />
              <Text className="text-red-600 font-medium ml-2">Reset</Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>

      {/* Reset Database Modal */}
      <Modal visible={resetModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-2xl w-[400px] p-6">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <AlertTriangle size={32} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-[#1A1F36]">Reset Database?</Text>
              <Text className="text-gray-500 text-center mt-2">
                This will delete all current data and restore the initial seed data. This action cannot be undone.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setResetModalVisible(false)}
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
              >
                <Text className="font-semibold text-gray-600">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleResetDatabase}
                disabled={isResetting}
                className="flex-1 bg-red-500 rounded-xl py-3 items-center"
              >
                <Text className="font-semibold text-white">
                  {isResetting ? 'Resetting...' : 'Reset'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-2xl w-[400px] p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-[#1A1F36]">Change Password</Text>
              <Pressable onPress={() => setPasswordModalVisible(false)}>
                <X size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-600 mb-2">Current Password</Text>
              <TextInput
                value={passwordForm.current}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, current: text })}
                className="bg-gray-50 rounded-lg px-4 py-3 text-[#1A1F36]"
                secureTextEntry
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-600 mb-2">New Password</Text>
              <TextInput
                value={passwordForm.new}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, new: text })}
                className="bg-gray-50 rounded-lg px-4 py-3 text-[#1A1F36]"
                secureTextEntry
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-600 mb-2">Confirm New Password</Text>
              <TextInput
                value={passwordForm.confirm}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, confirm: text })}
                className="bg-gray-50 rounded-lg px-4 py-3 text-[#1A1F36]"
                secureTextEntry
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Pressable
              onPress={handleChangePassword}
              className="bg-cyan-500 rounded-xl py-3 items-center flex-row justify-center"
            >
              <Check size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Update Password</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </AdminWebLayout>
  );
}
