import { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import {
  Users,
  Building2,
  MessageSquare,
  BarChart3,
  Shield,
  LogOut,
  ChevronRight,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useAdminAuthStore, type Review } from '@/lib/store';
import { db, type DBUser } from '@/lib/database';

function StatCard({ icon, label, value, subValue, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <View
      className="bg-white rounded-2xl p-4 flex-1 mx-1"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      <View className="w-10 h-10 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: `${color}20` }}>
        {icon}
      </View>
      <Text className="text-[#1A1F36] text-2xl font-bold">{value}</Text>
      <Text className="text-[#9CA3AF] text-sm mt-1">{label}</Text>
      {subValue && <Text className="text-[#00D4AA] text-xs mt-1">{subValue}</Text>}
    </View>
  );
}

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const admin = useAdminAuthStore((s) => s.admin);
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);
  const adminLogout = useAdminAuthStore((s) => s.adminLogout);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    totalLocations: number;
    totalReviews: number;
    pendingReviews: number;
    respondedReviews: number;
    averageRating: number;
  } | null>(null);
  const [recentUsers, setRecentUsers] = useState<DBUser[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!isAdminAuthenticated) return;
      loadData();
    }, [isAdminAuthenticated])
  );

  const loadData = async () => {
    try {
      const [statsData, users, reviews] = await Promise.all([
        db.getStats(),
        db.getUsers(),
        db.getReviews(),
      ]);
      setStats(statsData);
      setRecentUsers(users.slice(0, 3));
      setRecentReviews(
        [...reviews]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
      );
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    adminLogout();
    router.replace('/admin-login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responded': return '#10B981';
      case 'ai_generated': return '#8B5CF6';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'responded': return <CheckCircle size={14} color="#10B981" />;
      case 'ai_generated': return <Star size={14} color="#8B5CF6" />;
      case 'pending': return <Clock size={14} color="#F59E0B" />;
      default: return <AlertCircle size={14} color="#6B7280" />;
    }
  };

  if (!isAdminAuthenticated) {
    return null;
  }

  if (loading || !stats) {
    return (
      <View className="flex-1 bg-[#F7F8FA] items-center justify-center">
        <ActivityIndicator size="large" color="#00D4AA" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F7F8FA]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-[#0F172A]">
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={require('../../../public/real-logo.png')}
              style={{ width: 36, height: 36 }}
              contentFit="contain"
            />
            <View className="ml-3">
              <View className="flex-row items-center">
                <Shield size={14} color="#F59E0B" />
                <Text className="text-[#F59E0B] text-xs font-semibold ml-1">ADMIN</Text>
              </View>
              <Text className="text-white text-lg font-bold">ReputeHQ</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setShowLogoutConfirm(true)}
            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center active:opacity-70"
          >
            <LogOut size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-6">
          <Text className="text-[#1A1F36] text-2xl font-bold">
            Welcome, {admin?.name ?? 'Admin'}
          </Text>
          <Text className="text-[#9CA3AF] mt-1">
            Here's an overview of your platform
          </Text>
        </Animated.View>

        {/* Stats Row 1 */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} className="flex-row mb-3">
          <StatCard
            icon={<Users size={20} color="#00D4AA" />}
            label="Total Users"
            value={stats.totalUsers}
            subValue={`${stats.activeUsers} active`}
            color="#00D4AA"
          />
          <StatCard
            icon={<Building2 size={20} color="#8B5CF6" />}
            label="Businesses"
            value={stats.totalLocations}
            color="#8B5CF6"
          />
        </Animated.View>

        {/* Stats Row 2 */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} className="flex-row mb-6">
          <StatCard
            icon={<MessageSquare size={20} color="#F59E0B" />}
            label="Total Reviews"
            value={stats.totalReviews}
            subValue={`${stats.pendingReviews} pending`}
            color="#F59E0B"
          />
          <StatCard
            icon={<TrendingUp size={20} color="#10B981" />}
            label="Avg Rating"
            value={stats.averageRating.toFixed(1)}
            color="#10B981"
          />
        </Animated.View>

        {/* Recent Users */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[#1A1F36] text-lg font-semibold">Recent Users</Text>
            <Pressable className="flex-row items-center active:opacity-70">
              <Text className="text-[#00D4AA] text-sm font-medium">View All</Text>
              <ChevronRight size={16} color="#00D4AA" />
            </Pressable>
          </View>
          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            }}
          >
            {recentUsers.map((user, index) => (
              <View
                key={user.id}
                className={`px-4 py-4 flex-row items-center ${
                  index < recentUsers.length - 1 ? 'border-b border-[#F3F4F6]' : ''
                }`}
              >
                <View className="w-10 h-10 bg-[#1A1F36] rounded-full items-center justify-center">
                  <Text className="text-white font-semibold">{user.name.charAt(0)}</Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-[#1A1F36] font-medium">{user.name}</Text>
                  <Text className="text-[#9CA3AF] text-sm">{user.email}</Text>
                </View>
                <View
                  className={`px-2 py-1 rounded-full ${
                    user.status === 'active'
                      ? 'bg-green-100'
                      : user.status === 'pending'
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium capitalize ${
                      user.status === 'active'
                        ? 'text-green-700'
                        : user.status === 'pending'
                        ? 'text-yellow-700'
                        : 'text-red-700'
                    }`}
                  >
                    {user.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Recent Reviews */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[#1A1F36] text-lg font-semibold">Recent Reviews</Text>
            <Pressable className="flex-row items-center active:opacity-70">
              <Text className="text-[#00D4AA] text-sm font-medium">View All</Text>
              <ChevronRight size={16} color="#00D4AA" />
            </Pressable>
          </View>
          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            }}
          >
            {recentReviews.map((review, index) => (
              <View
                key={review.id}
                className={`px-4 py-4 flex-row items-center ${
                  index < recentReviews.length - 1 ? 'border-b border-[#F3F4F6]' : ''
                }`}
              >
                <View className="flex-1">
                  <Text className="text-[#1A1F36] font-medium">{review.locationName}</Text>
                  <View className="flex-row items-center mt-1">
                    <View className="flex-row items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          color={i < review.rating ? '#FBBF24' : '#E5E7EB'}
                          fill={i < review.rating ? '#FBBF24' : 'transparent'}
                        />
                      ))}
                    </View>
                    <Text className="text-[#9CA3AF] text-sm ml-2">by {review.authorName}</Text>
                  </View>
                </View>
                <View className="flex-row items-center px-2 py-1 rounded-full" style={{ backgroundColor: `${getStatusColor(review.status)}20` }}>
                  {getStatusIcon(review.status)}
                  <Text className="text-xs font-medium ml-1 capitalize" style={{ color: getStatusColor(review.status) }}>
                    {review.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <Text className="text-[#1A1F36] text-lg font-semibold mb-3">Quick Actions</Text>
          <View className="flex-row">
            <Pressable
              className="flex-1 bg-[#0F172A] rounded-2xl p-4 mr-2 active:opacity-90"
            >
              <BarChart3 size={24} color="#00D4AA" />
              <Text className="text-white font-semibold mt-3">Analytics</Text>
              <Text className="text-white/60 text-sm mt-1">View reports</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-[#0F172A] rounded-2xl p-4 ml-2 active:opacity-90"
            >
              <Users size={24} color="#F59E0B" />
              <Text className="text-white font-semibold mt-3">Manage Users</Text>
              <Text className="text-white/60 text-sm mt-1">View all users</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-8">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <Text className="text-[#1A1F36] text-xl font-bold text-center">Admin Sign Out</Text>
            <Text className="text-[#6B7280] text-center mt-3">
              Are you sure you want to sign out of the admin panel?
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
