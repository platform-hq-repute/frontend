import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Users,
  Building2,
  MessageSquare,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useAdminAuthStore } from '@/lib/store';
import { db, type DBUser, type DBLocation } from '@/lib/database';
import type { Review } from '@/lib/store';
import { AdminWebLayout } from '@/components/AdminWebLayout';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
  delay?: number;
}

function StatCard({ title, value, change, positive, icon, delay = 0 }: StatCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400)}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-1 min-w-[200px]"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="bg-cyan-50 p-3 rounded-lg">{icon}</View>
        {change && (
          <View className={`flex-row items-center px-2 py-1 rounded-full ${positive ? 'bg-green-50' : 'bg-red-50'}`}>
            {positive ? (
              <ArrowUpRight size={14} color="#10B981" />
            ) : (
              <ArrowDownRight size={14} color="#EF4444" />
            )}
            <Text className={`text-xs font-medium ml-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-3xl font-bold text-[#1A1F36]">{value}</Text>
      <Text className="text-gray-500 mt-1">{title}</Text>
    </Animated.View>
  );
}

export default function AdminDashboardWeb() {
  const router = useRouter();
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);
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

  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.replace('/admin-login');
      return;
    }
    loadData();
  }, [isAdminAuthenticated]);

  const loadData = async () => {
    try {
      const [statsData, users, reviews] = await Promise.all([
        db.getStats(),
        db.getUsers(),
        db.getReviews(),
      ]);
      setStats(statsData);
      setRecentUsers(users.slice(0, 5));
      setRecentReviews(
        [...reviews]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      );
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminAuthenticated) {
    return null;
  }

  if (loading || !stats) {
    return (
      <AdminWebLayout title="Dashboard" subtitle="Loading...">
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#00D4AA" />
        </View>
      </AdminWebLayout>
    );
  }

  const responseRate = stats.totalReviews > 0
    ? Math.round((stats.respondedReviews / stats.totalReviews) * 100)
    : 0;

  return (
    <AdminWebLayout title="Dashboard" subtitle="Overview of your platform metrics">
      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change="+12%"
          positive
          icon={<Users size={24} color="#00D4AA" />}
          delay={0}
        />
        <StatCard
          title="Active Businesses"
          value={stats.totalLocations}
          change="+8%"
          positive
          icon={<Building2 size={24} color="#00D4AA" />}
          delay={100}
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews}
          change="+23%"
          positive
          icon={<MessageSquare size={24} color="#00D4AA" />}
          delay={200}
        />
        <StatCard
          title="Response Rate"
          value={`${responseRate}%`}
          change="+5%"
          positive
          icon={<TrendingUp size={24} color="#00D4AA" />}
          delay={300}
        />
      </View>

      {/* Secondary Stats */}
      <View className="flex-row flex-wrap gap-4 mb-8">
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          className="bg-gradient-to-r bg-amber-50 rounded-xl p-5 flex-1 min-w-[180px] border border-amber-100"
        >
          <View className="flex-row items-center mb-2">
            <Star size={20} color="#F59E0B" fill="#F59E0B" />
            <Text className="ml-2 text-amber-600 font-medium">Avg. Rating</Text>
          </View>
          <Text className="text-2xl font-bold text-amber-700">{stats.averageRating}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          className="bg-orange-50 rounded-xl p-5 flex-1 min-w-[180px] border border-orange-100"
        >
          <View className="flex-row items-center mb-2">
            <Clock size={20} color="#F97316" />
            <Text className="ml-2 text-orange-600 font-medium">Pending</Text>
          </View>
          <Text className="text-2xl font-bold text-orange-700">{stats.pendingReviews}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(600).duration(400)}
          className="bg-green-50 rounded-xl p-5 flex-1 min-w-[180px] border border-green-100"
        >
          <View className="flex-row items-center mb-2">
            <CheckCircle size={20} color="#10B981" />
            <Text className="ml-2 text-green-600 font-medium">Responded</Text>
          </View>
          <Text className="text-2xl font-bold text-green-700">{stats.respondedReviews}</Text>
        </Animated.View>
      </View>

      {/* Tables Row */}
      <View className="flex-row gap-6">
        {/* Recent Users */}
        <Animated.View
          entering={FadeInRight.delay(300).duration(400)}
          className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-[#1A1F36]">Recent Users</Text>
            <Pressable onPress={() => router.push('/admin/users' as any)}>
              <Text className="text-cyan-500 font-medium">View All</Text>
            </Pressable>
          </View>
          <View className="p-4">
            {recentUsers.map((user, index) => (
              <View
                key={user.id}
                className={`flex-row items-center py-3 ${
                  index < recentUsers.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <View className="w-10 h-10 rounded-full bg-cyan-100 items-center justify-center">
                  <Text className="text-cyan-600 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-medium text-[#1A1F36]">{user.name}</Text>
                  <Text className="text-gray-500 text-sm">{user.email}</Text>
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
        <Animated.View
          entering={FadeInRight.delay(400).duration(400)}
          className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-[#1A1F36]">Recent Reviews</Text>
            <Pressable onPress={() => router.push('/admin/reviews' as any)}>
              <Text className="text-cyan-500 font-medium">View All</Text>
            </Pressable>
          </View>
          <View className="p-4">
            {recentReviews.map((review, index) => (
              <View
                key={review.id}
                className={`py-3 ${
                  index < recentReviews.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-medium text-[#1A1F36]">{review.authorName}</Text>
                  <View className="flex-row items-center">
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text className="ml-1 text-sm text-gray-600">{review.rating}</Text>
                  </View>
                </View>
                <Text className="text-gray-500 text-sm" numberOfLines={1}>
                  {review.content}
                </Text>
                <View className="flex-row items-center mt-2">
                  <Text className="text-xs text-gray-400">{review.locationName}</Text>
                  <View
                    className={`ml-2 px-2 py-0.5 rounded-full ${
                      review.status === 'responded'
                        ? 'bg-green-100'
                        : review.status === 'ai_generated'
                        ? 'bg-purple-100'
                        : 'bg-orange-100'
                    }`}
                  >
                    <Text
                      className={`text-xs capitalize ${
                        review.status === 'responded'
                          ? 'text-green-700'
                          : review.status === 'ai_generated'
                          ? 'text-purple-700'
                          : 'text-orange-700'
                      }`}
                    >
                      {review.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </AdminWebLayout>
  );
}
