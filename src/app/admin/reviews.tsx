import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Search,
  Edit2,
  Trash2,
  Check,
  Star,
  MapPin,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  Sparkles,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAdminAuthStore, type Review } from '@/lib/store';
import { db } from '@/lib/database';

export default function AdminReviewsScreen() {
  const insets = useSafeAreaInsets();
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'ai_generated' | 'responded'>('all');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editResponse, setEditResponse] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.replace('/admin-login');
      return;
    }
    loadReviews();
  }, [isAdminAuthenticated]);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchQuery, statusFilter]);

  const loadReviews = async () => {
    try {
      const data = await db.getReviews();
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReviews(sorted);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReviews();
  }, []);

  const filterReviews = () => {
    let filtered = [...reviews];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.authorName.toLowerCase().includes(query) ||
          r.content.toLowerCase().includes(query) ||
          r.locationName.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    setFilteredReviews(filtered);
  };

  const handleView = (review: Review) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReview(review);
    setViewModalVisible(true);
  };

  const handleEdit = (review: Review) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReview(review);
    setEditResponse(review.aiResponse || review.publishedResponse || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedReview) return;
    try {
      await db.updateReview(selectedReview.id, {
        aiResponse: editResponse,
        status: editResponse ? 'ai_generated' : 'pending',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadReviews();
      setEditModalVisible(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Error updating review:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePublish = async () => {
    if (!selectedReview) return;
    try {
      await db.updateReview(selectedReview.id, {
        publishedResponse: editResponse,
        status: 'responded',
        respondedAt: new Date().toISOString(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadReviews();
      setEditModalVisible(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Error publishing response:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDelete = (review: Review) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedReview(review);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedReview) return;
    try {
      await db.deleteReview(selectedReview.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadReviews();
      setDeleteModalVisible(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const renderStars = (rating: number, size = 14) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            color={star <= rating ? '#F59E0B' : '#E5E7EB'}
            fill={star <= rating ? '#F59E0B' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const getStatusStyle = (status: Review['status']) => {
    switch (status) {
      case 'responded':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle size={14} color="#10B981" /> };
      case 'ai_generated':
        return { bg: 'bg-purple-100', text: 'text-purple-700', icon: <Sparkles size={14} color="#8B5CF6" /> };
      default:
        return { bg: 'bg-orange-100', text: 'text-orange-700', icon: <Clock size={14} color="#F97316" /> };
    }
  };

  const getStatusLabel = (status: Review['status']) => {
    switch (status) {
      case 'responded': return 'Responded';
      case 'ai_generated': return 'AI Ready';
      default: return 'Pending';
    }
  };

  if (!isAdminAuthenticated) return null;

  if (loading) {
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
        <View className="px-5 py-4">
          <View className="flex-row items-center">
            <MessageSquare size={24} color="#F59E0B" />
            <Text className="text-white text-xl font-bold ml-3">Reviews</Text>
          </View>
          <Text className="text-white/60 text-sm mt-1">{reviews.length} customer reviews</Text>
        </View>
      </View>

      {/* Search & Filter */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2.5 mb-3">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search reviews..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-[#1A1F36]"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <View className="flex-row gap-2">
            {(['all', 'pending', 'ai_generated', 'responded'] as const).map((status) => (
              <Pressable
                key={status}
                onPress={() => {
                  Haptics.selectionAsync();
                  setStatusFilter(status);
                }}
                className={`px-4 py-2 rounded-full ${
                  statusFilter === status ? 'bg-[#F59E0B]' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    statusFilter === status ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {status === 'ai_generated' ? 'AI Ready' : status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Reviews List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />
        }
      >
        {filteredReviews.map((review, index) => {
          const statusStyle = getStatusStyle(review.status);
          return (
            <Animated.View
              key={review.id}
              entering={FadeInDown.delay(index * 50).duration(400)}
              className="bg-white rounded-2xl p-4 mb-3"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
              }}
            >
              {/* Header */}
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-[#F59E0B]/10 items-center justify-center">
                  <Text className="text-[#F59E0B] font-bold">
                    {review.authorName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-[#1A1F36] font-semibold">{review.authorName}</Text>
                  <View className="flex-row items-center mt-0.5">
                    {renderStars(review.rating, 12)}
                    <Text className="text-gray-400 text-xs ml-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View className={`flex-row items-center px-2 py-1 rounded-full ${statusStyle.bg}`}>
                  {statusStyle.icon}
                  <Text className={`text-xs font-medium ml-1 ${statusStyle.text}`}>
                    {getStatusLabel(review.status)}
                  </Text>
                </View>
              </View>

              {/* Location */}
              <View className="flex-row items-center mb-2">
                <MapPin size={12} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm ml-1">{review.locationName}</Text>
              </View>

              {/* Content */}
              <Text className="text-gray-700 text-sm leading-5" numberOfLines={3}>
                {review.content}
              </Text>

              {/* Actions */}
              <View className="flex-row justify-end mt-3 pt-3 border-t border-gray-100">
                <Pressable
                  onPress={() => handleView(review)}
                  className="p-2 rounded-lg bg-gray-50 mr-2 active:opacity-70"
                >
                  <Eye size={18} color="#6B7280" />
                </Pressable>
                <Pressable
                  onPress={() => handleEdit(review)}
                  className="p-2 rounded-lg bg-blue-50 mr-2 active:opacity-70"
                >
                  <Edit2 size={18} color="#3B82F6" />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(review)}
                  className="p-2 rounded-lg bg-red-50 active:opacity-70"
                >
                  <Trash2 size={18} color="#EF4444" />
                </Pressable>
              </View>
            </Animated.View>
          );
        })}

        {filteredReviews.length === 0 && (
          <View className="py-12 items-center">
            <MessageSquare size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4">No reviews found</Text>
          </View>
        )}
      </ScrollView>

      {/* View Modal */}
      <Modal visible={viewModalVisible} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setViewModalVisible(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl max-h-[80%]"
            style={{ paddingBottom: insets.bottom + 16 }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mt-3 mb-4" />
            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
              {selectedReview && (
                <>
                  <View className="flex-row items-center mb-4">
                    <View className="w-12 h-12 rounded-full bg-[#F59E0B]/10 items-center justify-center">
                      <Text className="text-[#F59E0B] font-bold text-lg">
                        {selectedReview.authorName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-semibold text-[#1A1F36] text-lg">
                        {selectedReview.authorName}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        {renderStars(selectedReview.rating)}
                        <Text className="ml-2 text-gray-500 text-sm">
                          {new Date(selectedReview.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center mb-3">
                    <MapPin size={14} color="#9CA3AF" />
                    <Text className="ml-1 text-gray-500">{selectedReview.locationName}</Text>
                    <Text className="ml-2 text-gray-400">via {selectedReview.platform}</Text>
                  </View>

                  <Text className="text-[#1A1F36] leading-6 mb-4">{selectedReview.content}</Text>

                  {(selectedReview.aiResponse || selectedReview.publishedResponse) && (
                    <View className="bg-[#00D4AA]/10 rounded-xl p-4 mb-4">
                      <View className="flex-row items-center mb-2">
                        <MessageSquare size={14} color="#00D4AA" />
                        <Text className="ml-2 font-medium text-[#00D4AA]">
                          {selectedReview.publishedResponse ? 'Published Response' : 'AI Generated Response'}
                        </Text>
                      </View>
                      <Text className="text-gray-700 leading-6">
                        {selectedReview.publishedResponse || selectedReview.aiResponse}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setEditModalVisible(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl"
            style={{ paddingBottom: insets.bottom + 16 }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mt-3 mb-4" />
            <View className="px-6">
              <Text className="text-xl font-bold text-[#1A1F36] mb-4">Edit Response</Text>

              {selectedReview && (
                <>
                  <View className="bg-gray-50 rounded-xl p-3 mb-4">
                    <Text className="font-medium text-[#1A1F36] mb-1">
                      {selectedReview.authorName}'s Review
                    </Text>
                    <View className="flex-row items-center mb-2">
                      {renderStars(selectedReview.rating, 12)}
                    </View>
                    <Text className="text-gray-600 text-sm" numberOfLines={3}>
                      {selectedReview.content}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-600 mb-2">Response</Text>
                    <TextInput
                      value={editResponse}
                      onChangeText={setEditResponse}
                      className="bg-gray-100 rounded-xl px-4 py-3 text-[#1A1F36] min-h-[100px]"
                      multiline
                      textAlignVertical="top"
                      placeholder="Write a response to this review..."
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text className="text-gray-400 text-xs mt-1 text-right">
                      {editResponse.length} characters
                    </Text>
                  </View>

                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={handleSaveEdit}
                      className="flex-1 bg-gray-100 rounded-xl py-3.5 items-center active:opacity-70"
                    >
                      <Text className="font-semibold text-gray-600">Save Draft</Text>
                    </Pressable>
                    <Pressable
                      onPress={handlePublish}
                      className="flex-1 bg-[#00D4AA] rounded-xl py-3.5 items-center flex-row justify-center active:opacity-90"
                    >
                      <Check size={18} color="white" />
                      <Text className="text-white font-semibold ml-2">Publish</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-3xl w-full p-6">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
                <Trash2 size={32} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-[#1A1F36]">Delete Review?</Text>
              <Text className="text-gray-500 text-center mt-2">
                Are you sure you want to delete this review from {selectedReview?.authorName}?
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setDeleteModalVisible(false)}
                className="flex-1 bg-gray-100 rounded-xl py-3.5 items-center active:opacity-70"
              >
                <Text className="font-semibold text-gray-600">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                className="flex-1 bg-red-500 rounded-xl py-3.5 items-center active:opacity-90"
              >
                <Text className="font-semibold text-white">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
