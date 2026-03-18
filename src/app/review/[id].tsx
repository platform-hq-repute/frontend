import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Star,
  Sparkles,
  Send,
  RefreshCw,
  Check,
  Edit3,
  Clock,
  MessageSquare,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useReviewsStore, useBusinessStore, Review } from '@/lib/store';
import { generateAIReviewResponse, generateFallbackResponse } from '@/lib/openai';
import { db } from '@/lib/database';

function StarRating({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color={star <= rating ? '#FBBF24' : '#E5E7EB'}
          fill={star <= rating ? '#FBBF24' : 'transparent'}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );
}

export default function ReviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const reviews = useReviewsStore((s) => s.reviews);
  const updateReview = useReviewsStore((s) => s.updateReview);
  const aiSettings = useBusinessStore((s) => s.aiSettings);

  const review = reviews.find((r) => r.id === id);

  const [response, setResponse] = useState(review?.aiResponse ?? review?.publishedResponse ?? '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (review) {
      setResponse(review.aiResponse ?? review.publishedResponse ?? '');
    }
  }, [review?.aiResponse, review?.publishedResponse]);

  if (!review) {
    return (
      <View className="flex-1 bg-[#F7F8FA] items-center justify-center">
        <Text className="text-[#6B7280]">Review not found</Text>
      </View>
    );
  }

  const handleGenerateResponse = async () => {
    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Try OpenAI first, fall back to template if not configured
      let aiResponse: string;
      try {
        aiResponse = await generateAIReviewResponse({
          review,
          tone: aiSettings.tone,
          maxLength: aiSettings.maxLength,
        });
      } catch (error) {
        console.log('OpenAI not available, using fallback:', error);
        aiResponse = generateFallbackResponse(review, aiSettings.tone);
      }

      setResponse(aiResponse);

      // Update local state
      updateReview(review.id, { aiResponse, status: 'ai_generated' });

      // Sync to database
      await db.updateReview(review.id, { aiResponse, status: 'ai_generated' });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishResponse = async () => {
    if (!response.trim()) return;

    setIsPublishing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const respondedAt = new Date().toISOString();

      // Update local state
      updateReview(review.id, {
        publishedResponse: response,
        status: 'responded',
        respondedAt,
      });

      // Sync to database
      await db.updateReview(review.id, {
        publishedResponse: response,
        status: 'responded',
        respondedAt,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error publishing response:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#10B981';
    if (rating === 3) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 bg-[#F7F8FA]">
        {/* Header */}
        <View style={{ paddingTop: insets.top }} className="bg-white border-b border-[#F3F4F6]">
          <View className="flex-row items-center px-4 py-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-[#F7F8FA] active:opacity-70"
            >
              <ArrowLeft size={20} color="#1A1F36" />
            </Pressable>
            <Text className="text-lg font-semibold text-[#1A1F36] ml-3">Review Details</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Review Card */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              className="mx-4 mt-4 bg-white rounded-2xl p-5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
              }}
            >
              {/* Author Info */}
              <View className="flex-row items-center">
                {review.authorAvatar ? (
                  <Image
                    source={{ uri: review.authorAvatar }}
                    className="w-14 h-14 rounded-full"
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-14 h-14 rounded-full bg-[#1A1F36] items-center justify-center">
                    <Text className="text-white font-bold text-xl">
                      {review.authorName.charAt(0)}
                    </Text>
                  </View>
                )}
                <View className="ml-4 flex-1">
                  <Text className="text-lg font-semibold text-[#1A1F36]">{review.authorName}</Text>
                  <View className="flex-row items-center mt-1">
                    <StarRating rating={review.rating} size={16} />
                    <View
                      className="ml-3 px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${getRatingColor(review.rating)}15` }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: getRatingColor(review.rating) }}
                      >
                        {review.rating}/5
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Meta Info */}
              <View className="flex-row items-center mt-4 pt-4 border-t border-[#F3F4F6]">
                <View className="flex-row items-center">
                  <Clock size={14} color="#9CA3AF" />
                  <Text className="text-[#9CA3AF] text-sm ml-1">{formatDate(review.createdAt)}</Text>
                </View>
                <View className="w-1 h-1 rounded-full bg-[#D1D5DB] mx-3" />
                <View className="bg-[#F3F4F6] px-2.5 py-1 rounded-full">
                  <Text className="text-[#6B7280] text-xs font-medium">{review.locationName}</Text>
                </View>
                <View className="bg-[#F3F4F6] px-2.5 py-1 rounded-full ml-2">
                  <Text className="text-[#6B7280] text-xs font-medium capitalize">{review.platform}</Text>
                </View>
              </View>

              {/* Review Content */}
              <View className="mt-4 pt-4 border-t border-[#F3F4F6]">
                <Text className="text-[#374151] text-base leading-6">{review.content}</Text>
              </View>
            </Animated.View>

            {/* Response Section */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(400)}
              className="mx-4 mt-4"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-[#1A1F36]">Your Response</Text>
                {review.status === 'responded' && (
                  <View className="flex-row items-center px-3 py-1.5 bg-[#D1FAE5] rounded-full">
                    <Check size={14} color="#10B981" />
                    <Text className="text-[#10B981] text-sm font-medium ml-1">Published</Text>
                  </View>
                )}
              </View>

              {/* Response Editor */}
              <View
                className="bg-white rounded-2xl p-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                }}
              >
                {response || isEditing ? (
                  <>
                    <TextInput
                      value={response}
                      onChangeText={setResponse}
                      placeholder="Write your response..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      editable={review.status !== 'responded'}
                      className="text-[#374151] text-base leading-6 min-h-[120px]"
                      textAlignVertical="top"
                    />
                    {review.status !== 'responded' && (
                      <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-[#F3F4F6]">
                        <Text className="text-[#9CA3AF] text-sm">
                          {response.length} characters
                        </Text>
                        <View className="flex-row">
                          <Pressable
                            onPress={handleGenerateResponse}
                            disabled={isGenerating}
                            className="flex-row items-center px-4 py-2 rounded-xl bg-[#F3F4F6] mr-2 active:opacity-70"
                          >
                            <RefreshCw
                              size={16}
                              color="#6B7280"
                              style={{ transform: [{ rotate: isGenerating ? '360deg' : '0deg' }] }}
                            />
                            <Text className="text-[#6B7280] font-medium ml-1.5">Regenerate</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </>
                ) : (
                  <View className="items-center py-8">
                    <View className="w-16 h-16 bg-[#00D4AA]/10 rounded-full items-center justify-center mb-4">
                      <MessageSquare size={28} color="#00D4AA" />
                    </View>
                    <Text className="text-[#1A1F36] font-semibold text-center">
                      No response yet
                    </Text>
                    <Text className="text-[#6B7280] text-sm text-center mt-1 mb-4">
                      Generate an AI response or write your own
                    </Text>
                    <View className="flex-row">
                      <Pressable
                        onPress={handleGenerateResponse}
                        disabled={isGenerating}
                        className="flex-row items-center px-5 py-3 rounded-xl bg-[#00D4AA] mr-3 active:opacity-90"
                      >
                        <Sparkles size={18} color="#ffffff" />
                        <Text className="text-white font-semibold ml-2">
                          {isGenerating ? 'Generating...' : 'Generate with AI'}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setIsEditing(true)}
                        className="flex-row items-center px-5 py-3 rounded-xl bg-[#F3F4F6] active:opacity-70"
                      >
                        <Edit3 size={18} color="#6B7280" />
                        <Text className="text-[#6B7280] font-semibold ml-2">Write</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* AI Settings Info */}
            {review.status !== 'responded' && (
              <Animated.View
                entering={FadeInDown.delay(300).duration(400)}
                className="mx-4 mt-4 bg-[#1A1F36]/5 rounded-xl p-4"
              >
                <Text className="text-[#6B7280] text-sm">
                  AI is set to <Text className="font-semibold text-[#1A1F36]">{aiSettings.tone}</Text> tone.{' '}
                  <Pressable onPress={() => router.push('/(tabs)/settings')}>
                    <Text className="text-[#00D4AA] font-semibold">Change settings</Text>
                  </Pressable>
                </Text>
              </Animated.View>
            )}
          </ScrollView>

          {/* Bottom Action Bar */}
          {review.status !== 'responded' && response && (
            <Animated.View
              entering={FadeInUp.duration(300)}
              style={{ paddingBottom: insets.bottom + 8 }}
              className="bg-white border-t border-[#F3F4F6] px-4 pt-4"
            >
              <Pressable
                onPress={handlePublishResponse}
                disabled={isPublishing || !response.trim()}
                className="bg-[#00D4AA] rounded-xl py-4 flex-row items-center justify-center active:opacity-90"
              >
                <Send size={20} color="#ffffff" />
                <Text className="text-white font-semibold text-base ml-2">
                  {isPublishing ? 'Publishing...' : 'Publish Response'}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
