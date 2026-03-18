import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, TextInput, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Star,
  MapPin,
  Eye,
  MessageSquare,
  Filter,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAdminAuthStore, type Review } from '@/lib/store';
import { db } from '@/lib/database';
import { AdminWebLayout } from '@/components/AdminWebLayout';

export default function AdminReviewsWeb() {
  const router = useRouter();
  const isAdminAuthenticated = useAdminAuthStore((s) => s.isAdminAuthenticated);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'ai_generated' | 'responded'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
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
  }, [reviews, searchQuery, statusFilter, ratingFilter]);

  const loadReviews = async () => {
    try {
      const data = await db.getReviews();
      // Sort by date descending
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReviews(sorted);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

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

    if (ratingFilter !== null) {
      filtered = filtered.filter((r) => r.rating === ratingFilter);
    }

    setFilteredReviews(filtered);
  };

  const handleView = (review: Review) => {
    setSelectedReview(review);
    setViewModalVisible(true);
  };

  const handleEdit = (review: Review) => {
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
      await loadReviews();
      setEditModalVisible(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Error updating review:', error);
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
      await loadReviews();
      setEditModalVisible(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Error publishing response:', error);
    }
  };

  const handleDelete = (review: Review) => {
    setSelectedReview(review);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedReview) return;
    try {
      await db.deleteReview(selectedReview.id);
      await loadReviews();
      setDeleteModalVisible(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
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
        return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'ai_generated':
        return { bg: 'bg-purple-100', text: 'text-purple-700' };
      default:
        return { bg: 'bg-orange-100', text: 'text-orange-700' };
    }
  };

  if (!isAdminAuthenticated) return null;

  if (loading) {
    return (
      <AdminWebLayout title="Reviews" subtitle="Loading...">
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#00D4AA" />
        </View>
      </AdminWebLayout>
    );
  }

  return (
    <AdminWebLayout title="Reviews" subtitle={`Manage ${reviews.length} customer reviews`}>
      {/* Filters */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100"
      >
        <View className="flex-row items-center gap-4 mb-4">
          {/* Search */}
          <View className="flex-1 flex-row items-center bg-gray-50 rounded-lg px-4 py-2">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by author, content, or location..."
              className="flex-1 ml-3 text-[#1A1F36]"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View className="flex-row items-center gap-4">
          {/* Status Filter */}
          <View className="flex-row items-center gap-2">
            <Filter size={16} color="#9CA3AF" />
            <Text className="text-gray-500 text-sm">Status:</Text>
            {(['all', 'pending', 'ai_generated', 'responded'] as const).map((status) => (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg ${
                  statusFilter === status ? 'bg-cyan-500' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    statusFilter === status ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {status === 'ai_generated' ? 'AI Ready' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Rating Filter */}
          <View className="flex-row items-center gap-2 ml-4">
            <Star size={16} color="#9CA3AF" />
            <Text className="text-gray-500 text-sm">Rating:</Text>
            <Pressable
              onPress={() => setRatingFilter(null)}
              className={`px-3 py-1.5 rounded-lg ${
                ratingFilter === null ? 'bg-cyan-500' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  ratingFilter === null ? 'text-white' : 'text-gray-600'
                }`}
              >
                All
              </Text>
            </Pressable>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Pressable
                key={rating}
                onPress={() => setRatingFilter(rating)}
                className={`px-3 py-1.5 rounded-lg flex-row items-center ${
                  ratingFilter === rating ? 'bg-cyan-500' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    ratingFilter === rating ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {rating}
                </Text>
                <Star
                  size={12}
                  color={ratingFilter === rating ? 'white' : '#F59E0B'}
                  fill={ratingFilter === rating ? 'white' : '#F59E0B'}
                  style={{ marginLeft: 2 }}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Reviews Table */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Table Header */}
        <View className="flex-row bg-gray-50 px-6 py-4 border-b border-gray-100">
          <Text className="w-32 font-semibold text-gray-600">Author</Text>
          <Text className="flex-1 font-semibold text-gray-600">Review</Text>
          <Text className="w-24 font-semibold text-gray-600">Location</Text>
          <Text className="w-20 font-semibold text-gray-600 text-center">Rating</Text>
          <Text className="w-20 font-semibold text-gray-600 text-center">Status</Text>
          <Text className="w-24 font-semibold text-gray-600 text-center">Date</Text>
          <Text className="w-28 font-semibold text-gray-600 text-center">Actions</Text>
        </View>

        {/* Table Body */}
        {filteredReviews.map((review, index) => {
          const statusStyle = getStatusStyle(review.status);
          return (
            <View
              key={review.id}
              className={`flex-row items-center px-6 py-4 ${
                index < filteredReviews.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              {/* Author */}
              <View className="w-32">
                <Text className="font-medium text-[#1A1F36]" numberOfLines={1}>
                  {review.authorName}
                </Text>
              </View>

              {/* Review Content */}
              <View className="flex-1 pr-4">
                <Text className="text-gray-600 text-sm" numberOfLines={2}>
                  {review.content}
                </Text>
              </View>

              {/* Location */}
              <View className="w-24">
                <View className="flex-row items-center">
                  <MapPin size={12} color="#9CA3AF" />
                  <Text className="ml-1 text-gray-500 text-sm" numberOfLines={1}>
                    {review.locationName}
                  </Text>
                </View>
              </View>

              {/* Rating */}
              <View className="w-20 items-center">
                {renderStars(review.rating)}
              </View>

              {/* Status */}
              <View className="w-20 items-center">
                <View className={`px-2 py-1 rounded-full ${statusStyle.bg}`}>
                  <Text className={`text-xs font-medium ${statusStyle.text}`}>
                    {review.status === 'ai_generated' ? 'AI Ready' : review.status}
                  </Text>
                </View>
              </View>

              {/* Date */}
              <View className="w-24 items-center">
                <Text className="text-gray-500 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {/* Actions */}
              <View className="w-28 flex-row justify-center gap-2">
                <Pressable
                  onPress={() => handleView(review)}
                  className="p-2 rounded-lg bg-gray-50"
                >
                  <Eye size={16} color="#6B7280" />
                </Pressable>
                <Pressable
                  onPress={() => handleEdit(review)}
                  className="p-2 rounded-lg bg-blue-50"
                >
                  <Edit2 size={16} color="#3B82F6" />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(review)}
                  className="p-2 rounded-lg bg-red-50"
                >
                  <Trash2 size={16} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          );
        })}

        {filteredReviews.length === 0 && (
          <View className="py-12 items-center">
            <Text className="text-gray-400">No reviews found</Text>
          </View>
        )}
      </Animated.View>

      {/* View Modal */}
      <Modal visible={viewModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-2xl w-[500px] max-h-[80%]">
            <View className="flex-row justify-between items-center p-6 border-b border-gray-100">
              <Text className="text-xl font-bold text-[#1A1F36]">Review Details</Text>
              <Pressable onPress={() => setViewModalVisible(false)}>
                <X size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <ScrollView className="p-6">
              {selectedReview && (
                <>
                  <View className="flex-row items-center mb-4">
                    <View className="w-12 h-12 rounded-full bg-cyan-100 items-center justify-center">
                      <Text className="text-cyan-600 font-bold text-lg">
                        {selectedReview.authorName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-semibold text-[#1A1F36]">
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

                  <View className="mb-4">
                    <View className="flex-row items-center mb-2">
                      <MapPin size={14} color="#9CA3AF" />
                      <Text className="ml-1 text-gray-500">{selectedReview.locationName}</Text>
                      <Text className="ml-2 text-gray-400">via {selectedReview.platform}</Text>
                    </View>
                    <Text className="text-[#1A1F36] leading-6">{selectedReview.content}</Text>
                  </View>

                  {(selectedReview.aiResponse || selectedReview.publishedResponse) && (
                    <View className="bg-cyan-50 rounded-xl p-4 mt-4">
                      <View className="flex-row items-center mb-2">
                        <MessageSquare size={14} color="#00D4AA" />
                        <Text className="ml-2 font-medium text-cyan-700">
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
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-2xl w-[500px] p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-[#1A1F36]">Edit Response</Text>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <X size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            {selectedReview && (
              <>
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <Text className="font-medium text-[#1A1F36] mb-1">
                    {selectedReview.authorName}'s Review
                  </Text>
                  <View className="flex-row items-center mb-2">
                    {renderStars(selectedReview.rating)}
                  </View>
                  <Text className="text-gray-600 text-sm">{selectedReview.content}</Text>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-600 mb-2">Response</Text>
                  <TextInput
                    value={editResponse}
                    onChangeText={setEditResponse}
                    className="bg-gray-50 rounded-lg px-4 py-3 text-[#1A1F36] min-h-[120px]"
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
                    className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                  >
                    <Text className="font-semibold text-gray-600">Save Draft</Text>
                  </Pressable>
                  <Pressable
                    onPress={handlePublish}
                    className="flex-1 bg-cyan-500 rounded-xl py-3 items-center flex-row justify-center"
                  >
                    <Check size={18} color="white" />
                    <Text className="text-white font-semibold ml-2">Publish</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-2xl w-[360px] p-6">
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
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
              >
                <Text className="font-semibold text-gray-600">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                className="flex-1 bg-red-500 rounded-xl py-3 items-center"
              >
                <Text className="font-semibold text-white">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AdminWebLayout>
  );
}
