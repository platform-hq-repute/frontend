import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { useAdminAuthStore } from '@/lib/store';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  { id: 'businesses', label: 'Businesses', icon: Building2, path: '/admin/businesses' },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare, path: '/admin/reviews' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export function AdminWebLayout({ children, title, subtitle }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const adminLogout = useAdminAuthStore((s) => s.adminLogout);
  const adminName = useAdminAuthStore((s) => s.admin?.name);
  const adminRole = useAdminAuthStore((s) => s.admin?.role);

  const handleLogout = () => {
    adminLogout();
    router.replace('/admin-login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname.startsWith(path);
  };

  return (
    <View className="flex-1 flex-row bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <Animated.View
          entering={SlideInLeft.duration(200)}
          exiting={SlideOutLeft.duration(200)}
          className="w-64 bg-[#1A1F36]"
          style={{ minHeight: 800 }}
        >
          {/* Logo */}
          <View className="p-6 border-b border-white/10">
            <View className="flex-row items-center">
              <Image
                source={require('../../public/real-logo.png')}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
              <View className="ml-3">
                <Text className="text-white text-xl font-bold">ReputeHQ</Text>
                <Text className="text-cyan-400 text-xs">Admin Panel</Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <ScrollView className="flex-1 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(item.path as any)}
                  className={`mx-3 mb-1 px-4 py-3 rounded-lg flex-row items-center ${
                    active ? 'bg-cyan-500/20' : 'hover:bg-white/5'
                  }`}
                >
                  <Icon
                    size={20}
                    color={active ? '#00D4AA' : '#9CA3AF'}
                  />
                  <Text
                    className={`ml-3 font-medium ${
                      active ? 'text-cyan-400' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </Text>
                  {active && (
                    <View className="ml-auto">
                      <ChevronRight size={16} color="#00D4AA" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Admin Info & Logout */}
          <View className="p-4 border-t border-white/10">
            <View className="bg-white/5 rounded-lg p-3 mb-3">
              <Text className="text-white font-medium">{adminName ?? 'Admin'}</Text>
              <Text className="text-gray-400 text-xs capitalize">
                {adminRole?.replace('_', ' ') ?? 'Admin'}
              </Text>
            </View>
            <Pressable
              onPress={handleLogout}
              className="flex-row items-center px-4 py-3 rounded-lg bg-red-500/10"
            >
              <LogOut size={20} color="#EF4444" />
              <Text className="ml-3 text-red-400 font-medium">Sign Out</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Main Content */}
      <View className="flex-1">
        {/* Top Bar */}
        <View className="bg-white border-b border-gray-200 px-6 py-4 flex-row items-center">
          <Pressable
            onPress={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-gray-100 mr-4"
          >
            {sidebarOpen ? (
              <X size={20} color="#1A1F36" />
            ) : (
              <Menu size={20} color="#1A1F36" />
            )}
          </Pressable>
          <View>
            <Text className="text-2xl font-bold text-[#1A1F36]">{title}</Text>
            {subtitle && (
              <Text className="text-gray-500 text-sm">{subtitle}</Text>
            )}
          </View>
        </View>

        {/* Page Content */}
        <ScrollView className="flex-1 p-6">
          {children}
        </ScrollView>
      </View>
    </View>
  );
}
