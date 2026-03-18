import { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Star,
  TrendingUp,
  MessageSquare,
  Clock,
  ChevronRight,
  Bell,
  Sparkles,
  Building2,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useAuthStore, useBusinessStore, useReviewsStore, type Review } from '@/lib/store';
import { db } from '@/lib/database';
import { useState } from 'react';

// Star rating component
function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color={star <= rating ? '#FBBF24' : '#E5E7EB'}
          fill={star <= rating ? '#FBBF24' : 'transparent'}
        />
      ))}
    </View>
  );
}

// Stat card component
function StatCard({
  icon,
  label,
  value,
  trend,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  color: string;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500)}
      className="flex-1 bg-white rounded-2xl p-4 mr-3 shadow-sm"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: `${color}15` }}
      >
        {icon}
      </View>
      <Text className="text-2xl font-bold text-[#1A1F36]">{value}</Text>
      <Text className="text-[#6B7280] text-sm mt-1">{label}</Text>
      {trend && (
        <View className="flex-row items-center mt-2">
          <TrendingUp size={12} color="#10B981" />
          <Text className="text-[#10B981] text-xs ml-1 font-medium">{trend}</Text>
        </View>
      )}
    </Animated.View>
  );
}

// Review preview card
function ReviewPreviewCard({ review, delay }: { review: Review; delay: number }) {
  const getStatusColor = () => {
    switch (review.status) {
      case 'pending':
        return '#F59E0B';
      case 'ai_generated':
        return '#8B5CF6';
      case 'responded':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = () => {
    switch (review.status) {
      case 'pending':
        return 'Needs Response';
      case 'ai_generated':
        return 'AI Ready';
      case 'responded':
        return 'Responded';
      default:
        return 'Unknown';
    }
  };

  return (
    <Animated.View entering={FadeInRight.delay(delay).duration(500)}>
      <Pressable
        onPress={() => router.push(`/review/${review.id}`)}
        className="bg-white rounded-2xl p-4 mb-3 active:opacity-90"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
      >
        <View className="flex-row items-start">
          {review.authorAvatar ? (
            <Image
              source={{ uri: review.authorAvatar }}
              className="w-12 h-12 rounded-full"
              contentFit="cover"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-[#1A1F36] items-center justify-center">
              <Text className="text-white font-semibold text-lg">
                {review.authorName.charAt(0)}
              </Text>
            </View>
          )}
          <View className="flex-1 ml-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-[#1A1F36]">{review.authorName}</Text>
              <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: `${getStatusColor()}15` }}
              >
                <Text className="text-xs font-medium" style={{ color: getStatusColor() }}>
                  {getStatusLabel()}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mt-1">
              <StarRating rating={review.rating} size={14} />
              <Text className="text-[#6B7280] text-xs ml-2">{review.locationName}</Text>
            </View>
            <Text
              numberOfLines={2}
              className="text-[#4B5563] text-sm mt-2 leading-5"
            >
              {review.content}
            </Text>
          </View>
        </View>
        {review.status === 'pending' && (
          <Pressable
            onPress={() => router.push(`/review/${review.id}`)}
            className="bg-[#00D4AA] rounded-xl py-3 mt-4 flex-row items-center justify-center active:opacity-90"
          >
            <Sparkles size={18} color="#ffffff" />
            <Text className="text-white font-semibold ml-2">Generate AI Response</Text>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const setLocations = useBusinessStore((s) => s.setLocations);
  const setReviews = useReviewsStore((s) => s.setReviews);
  const locations = useBusinessStore((s) => s.locations);
  const reviews = useReviewsStore((s) => s.reviews);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;

      const loadData = async () => {
        try {
          const userLocations = await db.getLocationsByOwner(user.id);
          setLocations(userLocations);

          if (userLocations.length > 0) {
            const allReviews: Review[] = [];
            for (const location of userLocations) {
              const locationReviews = await db.getReviewsByLocation(location.id);
              allReviews.push(...locationReviews);
            }
            setReviews(allReviews);
          } else {
            setReviews([]);
          }
        } catch (error) {
          console.error('Error loading data:', error);
        }
      };

      loadData();
    }, [user?.id, setLocations, setReviews])
  );

  const onRefresh = async () => {
    if (!user?.id) return;

    setRefreshing(true);
    try {
      // Fetch locations for this user
      const userLocations = await db.getLocationsByOwner(user.id);
      setLocations(userLocations);

      // Fetch reviews for all user's locations
      if (userLocations.length > 0) {
        const allReviews: Review[] = [];
        for (const location of userLocations) {
          const locationReviews = await db.getReviewsByLocation(location.id);
          allReviews.push(...locationReviews);
        }
        setReviews(allReviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate stats
  const totalReviews = locations.reduce((sum, loc) => sum + loc.totalReviews, 0);
  const avgRating = locations.length > 0
    ? (locations.reduce((sum, loc) => sum + loc.averageRating, 0) / locations.length).toFixed(1)
    : '0.0';
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const responseRate = totalReviews > 0
    ? Math.round((reviews.filter((r) => r.status === 'responded').length / reviews.length) * 100)
    : 0;

  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <View className="flex-1 bg-[#F7F8FA]">
      {/* Header */}
      <LinearGradient
        colors={['#1A1F36', '#2D3555']}
        style={{ paddingTop: insets.top }}
      >
        <View className="px-6 py-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white/60 text-sm">Good morning</Text>
              <Text className="text-white text-xl font-bold mt-1">
                {user?.name?.split(' ')[0] ?? 'there'}
              </Text>
            </View>
            <Pressable
              onPress={() => {}}
              className="w-10 h-10 bg-white/10 rounded-full items-center justify-center active:opacity-70"
            >
              <Bell size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D4AA" />
        }
      >
        {/* Stats */}
        <View className="px-6 -mt-1">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 16 }}
            style={{ flexGrow: 0 }}
          >
            <StatCard
              icon={<Star size={20} color="#FBBF24" />}
              label="Avg Rating"
              value={avgRating}
              trend="+0.2 this month"
              color="#FBBF24"
              delay={100}
            />
            <StatCard
              icon={<MessageSquare size={20} color="#00D4AA" />}
              label="Total Reviews"
              value={totalReviews.toString()}
              trend="+12% growth"
              color="#00D4AA"
              delay={200}
            />
            <StatCard
              icon={<Clock size={20} color="#F59E0B" />}
              label="Pending"
              value={pendingCount.toString()}
              color="#F59E0B"
              delay={300}
            />
            <StatCard
              icon={<TrendingUp size={20} color="#8B5CF6" />}
              label="Response Rate"
              value={`${responseRate}%`}
              color="#8B5CF6"
              delay={400}
            />
          </ScrollView>
        </View>

        {/* Recent Reviews or Empty State */}
        <View className="px-6 mt-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[#1A1F36] text-lg font-bold">Recent Reviews</Text>
            {recentReviews.length > 0 && (
              <Pressable
                onPress={() => router.push('/(tabs)/reviews')}
                className="flex-row items-center active:opacity-70"
              >
                <Text className="text-[#00D4AA] text-sm font-semibold mr-1">View All</Text>
                <ChevronRight size={16} color="#00D4AA" />
              </Pressable>
            )}
          </View>

          {locations.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(500).duration(500)}
              className="bg-white rounded-2xl p-6 items-center"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
            >
              <View className="w-16 h-16 bg-[#00D4AA]/10 rounded-full items-center justify-center mb-4">
                <Building2 size={32} color="#00D4AA" />
              </View>
              <Text className="text-[#1A1F36] text-lg font-semibold text-center">
                Connect Your Business
              </Text>
              <Text className="text-[#6B7280] text-sm text-center mt-2 mb-4">
                Link your Google Business Profile to start managing reviews with AI
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/locations')}
                className="bg-[#00D4AA] rounded-xl px-6 py-3 flex-row items-center active:opacity-90"
              >
                <Building2 size={18} color="#ffffff" />
                <Text className="text-white font-semibold ml-2">Add Location</Text>
              </Pressable>
            </Animated.View>
          ) : recentReviews.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(500).duration(500)}
              className="bg-white rounded-2xl p-6 items-center"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
            >
              <View className="w-16 h-16 bg-[#F59E0B]/10 rounded-full items-center justify-center mb-4">
                <MessageSquare size={32} color="#F59E0B" />
              </View>
              <Text className="text-[#1A1F36] text-lg font-semibold text-center">
                No Reviews Yet
              </Text>
              <Text className="text-[#6B7280] text-sm text-center mt-2">
                Reviews from your connected platforms will appear here
              </Text>
            </Animated.View>
          ) : (
            recentReviews.map((review, index) => (
              <ReviewPreviewCard key={review.id} review={review} delay={500 + index * 100} />
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-6 mt-6">
          <Text className="text-[#1A1F36] text-lg font-bold mb-4">Quick Actions</Text>
          <View className="flex-row">
            <Pressable
              onPress={() => router.push('/(tabs)/locations')}
              className="flex-1 bg-white rounded-2xl p-4 mr-3 active:opacity-90"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
            >
              <View className="w-10 h-10 bg-[#1A1F36]/10 rounded-xl items-center justify-center mb-3">
                <MessageSquare size={20} color="#1A1F36" />
              </View>
              <Text className="text-[#1A1F36] font-semibold">Connect Platform</Text>
              <Text className="text-[#6B7280] text-sm mt-1">Add Google or Trustpilot</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              className="flex-1 bg-white rounded-2xl p-4 active:opacity-90"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
            >
              <View className="w-10 h-10 bg-[#00D4AA]/10 rounded-xl items-center justify-center mb-3">
                <Sparkles size={20} color="#00D4AA" />
              </View>
              <Text className="text-[#1A1F36] font-semibold">AI Settings</Text>
              <Text className="text-[#6B7280] text-sm mt-1">Customize responses</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
