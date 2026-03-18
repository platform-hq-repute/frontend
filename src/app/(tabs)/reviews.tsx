import { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import {
  Star,
  Filter,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useReviewsStore, useBusinessStore, Review } from '@/lib/store';

type FilterType = 'all' | 'pending' | 'ai_generated' | 'responded';
type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1';

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

function FilterChip({
  label,
  isActive,
  onPress,
  count,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  count?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
        isActive ? 'bg-[#1A1F36]' : 'bg-white border border-[#E5E7EB]'
      }`}
    >
      <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-[#4B5563]'}`}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View
          className={`ml-2 px-2 py-0.5 rounded-full ${
            isActive ? 'bg-white/20' : 'bg-[#F3F4F6]'
          }`}
        >
          <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-[#6B7280]'}`}>
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const getStatusConfig = () => {
    switch (review.status) {
      case 'pending':
        return { color: '#F59E0B', bg: '#FEF3C7', icon: Clock, label: 'Needs Response' };
      case 'ai_generated':
        return { color: '#8B5CF6', bg: '#EDE9FE', icon: Sparkles, label: 'AI Ready' };
      case 'responded':
        return { color: '#10B981', bg: '#D1FAE5', icon: CheckCircle2, label: 'Responded' };
      default:
        return { color: '#6B7280', bg: '#F3F4F6', icon: Clock, label: 'Unknown' };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Pressable
      onPress={() => router.push(`/review/${review.id}`)}
      className="bg-white mx-4 mb-3 rounded-2xl p-4 active:opacity-95"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          {review.authorAvatar ? (
            <Image
              source={{ uri: review.authorAvatar }}
              className="w-10 h-10 rounded-full"
              contentFit="cover"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-[#1A1F36] items-center justify-center">
              <Text className="text-white font-semibold">{review.authorName.charAt(0)}</Text>
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="font-semibold text-[#1A1F36]">{review.authorName}</Text>
            <View className="flex-row items-center mt-0.5">
              <StarRating rating={review.rating} size={12} />
              <Text className="text-[#9CA3AF] text-xs ml-2">{formatDate(review.createdAt)}</Text>
            </View>
          </View>
        </View>
        <View
          className="flex-row items-center px-2.5 py-1.5 rounded-full"
          style={{ backgroundColor: config.bg }}
        >
          <StatusIcon size={12} color={config.color} />
          <Text className="text-xs font-medium ml-1" style={{ color: config.color }}>
            {config.label}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text className="text-[#4B5563] text-sm leading-5" numberOfLines={3}>
        {review.content}
      </Text>

      {/* Location Tag */}
      <View className="flex-row items-center mt-3 pt-3 border-t border-[#F3F4F6]">
        <View className="bg-[#F3F4F6] px-3 py-1.5 rounded-full">
          <Text className="text-[#6B7280] text-xs font-medium">{review.locationName}</Text>
        </View>
        <View className="bg-[#F3F4F6] px-3 py-1.5 rounded-full ml-2">
          <Text className="text-[#6B7280] text-xs font-medium capitalize">{review.platform}</Text>
        </View>
      </View>

      {/* Quick Action for Pending */}
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
  );
}

export default function ReviewsScreen() {
  const insets = useSafeAreaInsets();
  const reviews = useReviewsStore((s) => s.reviews);
  const locations = useBusinessStore((s) => s.locations);
  const selectedLocationId = useBusinessStore((s) => s.selectedLocationId);

  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter counts
  const counts = useMemo(() => ({
    all: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    ai_generated: reviews.filter((r) => r.status === 'ai_generated').length,
    responded: reviews.filter((r) => r.status === 'responded').length,
  }), [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by location
    if (selectedLocationId) {
      result = result.filter((r) => r.locationId === selectedLocationId);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Filter by rating
    if (ratingFilter !== 'all') {
      result = result.filter((r) => r.rating === parseInt(ratingFilter));
    }

    // Sort by date
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [reviews, selectedLocationId, statusFilter, ratingFilter]);

  return (
    <View className="flex-1 bg-[#F7F8FA]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-white border-b border-[#F3F4F6]">
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-[#1A1F36]">Reviews</Text>
            <Pressable
              onPress={() => setShowFilters(!showFilters)}
              className="flex-row items-center px-4 py-2 bg-[#F7F8FA] rounded-xl active:opacity-70"
            >
              <Filter size={18} color="#6B7280" />
              <Text className="text-[#6B7280] font-medium ml-2">Filter</Text>
              <ChevronDown
                size={16}
                color="#6B7280"
                style={{ marginLeft: 4, transform: [{ rotate: showFilters ? '180deg' : '0deg' }] }}
              />
            </Pressable>
          </View>
        </View>

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
          style={{ flexGrow: 0 }}
        >
          <FilterChip
            label="All"
            isActive={statusFilter === 'all'}
            onPress={() => setStatusFilter('all')}
            count={counts.all}
          />
          <FilterChip
            label="Pending"
            isActive={statusFilter === 'pending'}
            onPress={() => setStatusFilter('pending')}
            count={counts.pending}
          />
          <FilterChip
            label="AI Ready"
            isActive={statusFilter === 'ai_generated'}
            onPress={() => setStatusFilter('ai_generated')}
            count={counts.ai_generated}
          />
          <FilterChip
            label="Responded"
            isActive={statusFilter === 'responded'}
            onPress={() => setStatusFilter('responded')}
            count={counts.responded}
          />
        </ScrollView>

        {/* Rating Filter (collapsible) */}
        {showFilters && (
          <Animated.View entering={FadeIn.duration(200)} className="px-6 pb-4">
            <Text className="text-sm font-medium text-[#6B7280] mb-2">Filter by Rating</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
            >
              {(['all', '5', '4', '3', '2', '1'] as const).map((rating) => (
                <Pressable
                  key={rating}
                  onPress={() => setRatingFilter(rating)}
                  className={`flex-row items-center px-3 py-2 rounded-lg mr-2 ${
                    ratingFilter === rating ? 'bg-[#FBBF24]/20' : 'bg-[#F7F8FA]'
                  }`}
                >
                  {rating !== 'all' && <Star size={14} color="#FBBF24" fill="#FBBF24" />}
                  <Text
                    className={`text-sm font-medium ml-1 ${
                      ratingFilter === rating ? 'text-[#1A1F36]' : 'text-[#6B7280]'
                    }`}
                  >
                    {rating === 'all' ? 'All Ratings' : rating}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <FlashList
          data={filteredReviews}
          renderItem={({ item }) => <ReviewCard review={item} />}
          keyExtractor={(item) => item.id}
          estimatedItemSize={180}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="flex-1 items-center justify-center px-8"
        >
          <View className="w-20 h-20 bg-[#F3F4F6] rounded-full items-center justify-center mb-4">
            <Search size={32} color="#9CA3AF" />
          </View>
          <Text className="text-[#1A1F36] text-lg font-semibold text-center">No reviews found</Text>
          <Text className="text-[#6B7280] text-center mt-2">
            Try adjusting your filters or check back later for new reviews.
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
