import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Plus,
  MapPin,
  Star,
  MessageSquare,
  Clock,
  ChevronRight,
  Check,
  X,
  Link2,
  ExternalLink,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useBusinessStore, useReviewsStore, useAuthStore, Location } from '@/lib/store';
import { db } from '@/lib/database';

function LocationCard({ location, isSelected, onSelect }: {
  location: Location;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const reviews = useReviewsStore((s) => s.reviews);
  const locationReviews = reviews.filter((r) => r.locationId === location.id);
  const pendingCount = locationReviews.filter((r) => r.status === 'pending').length;

  return (
    <Pressable
      onPress={onSelect}
      className={`bg-white rounded-2xl p-5 mb-4 border-2 ${
        isSelected ? 'border-[#00D4AA]' : 'border-transparent'
      } active:opacity-95`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-[#1A1F36] rounded-xl items-center justify-center">
              <MapPin size={20} color="#ffffff" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[#1A1F36] font-semibold text-base">{location.name}</Text>
              <Text className="text-[#9CA3AF] text-sm mt-0.5" numberOfLines={1}>
                {location.address}
              </Text>
            </View>
          </View>
        </View>
        {isSelected && (
          <View className="w-6 h-6 bg-[#00D4AA] rounded-full items-center justify-center">
            <Check size={14} color="#ffffff" strokeWidth={3} />
          </View>
        )}
      </View>

      {/* Stats */}
      <View className="flex-row mt-5 pt-4 border-t border-[#F3F4F6]">
        <View className="flex-1 flex-row items-center">
          <Star size={16} color="#FBBF24" fill="#FBBF24" />
          <Text className="text-[#1A1F36] font-semibold ml-1.5">{location.averageRating}</Text>
          <Text className="text-[#9CA3AF] text-sm ml-1">rating</Text>
        </View>
        <View className="flex-1 flex-row items-center">
          <MessageSquare size={16} color="#00D4AA" />
          <Text className="text-[#1A1F36] font-semibold ml-1.5">{location.totalReviews}</Text>
          <Text className="text-[#9CA3AF] text-sm ml-1">reviews</Text>
        </View>
        <View className="flex-1 flex-row items-center">
          <Clock size={16} color="#F59E0B" />
          <Text className="text-[#1A1F36] font-semibold ml-1.5">{pendingCount}</Text>
          <Text className="text-[#9CA3AF] text-sm ml-1">pending</Text>
        </View>
      </View>

      {/* Quick Action */}
      {pendingCount > 0 && (
        <Pressable
          onPress={() => {
            onSelect();
            router.push('/(tabs)/reviews');
          }}
          className="flex-row items-center justify-center mt-4 py-3 bg-[#F7F8FA] rounded-xl active:opacity-70"
        >
          <Text className="text-[#1A1F36] font-medium">View {pendingCount} pending reviews</Text>
          <ChevronRight size={16} color="#1A1F36" className="ml-1" />
        </Pressable>
      )}
    </Pressable>
  );
}

function ConnectPlatformCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-5 border-2 border-dashed border-[#E5E7EB] active:opacity-70"
    >
      <View className="items-center py-4">
        <View className="w-14 h-14 bg-[#00D4AA]/10 rounded-full items-center justify-center mb-4">
          <Plus size={28} color="#00D4AA" />
        </View>
        <Text className="text-[#1A1F36] font-semibold text-base">Add Location</Text>
        <Text className="text-[#9CA3AF] text-sm text-center mt-1">
          Connect Google Business Profile
        </Text>
      </View>
    </Pressable>
  );
}

export default function LocationsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const locations = useBusinessStore((s) => s.locations);
  const setLocations = useBusinessStore((s) => s.setLocations);
  const selectedLocationId = useBusinessStore((s) => s.selectedLocationId);
  const selectLocation = useBusinessStore((s) => s.selectLocation);
  const addLocation = useBusinessStore((s) => s.addLocation);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch locations from database on mount
  useEffect(() => {
    const loadLocations = async () => {
      if (!user?.id) return;
      try {
        const userLocations = await db.getLocationsByOwner(user.id);
        setLocations(userLocations);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };
    loadLocations();
  }, [user?.id, setLocations]);

  const handleSelectLocation = (id: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    selectLocation(selectedLocationId === id ? null : id);
  };

  const handleConnectGoogle = async () => {
    if (!user?.id) return;

    setIsConnecting(true);

    // Simulate OAuth flow - in production this would use actual Google Business Profile API
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Create a new location in the database
      const newLocation = await db.createLocation({
        name: 'New Business Location',
        address: 'Enter your business address',
        googlePlaceId: `ChIJ${Date.now()}`,
        averageRating: 0,
        totalReviews: 0,
        pendingResponses: 0,
        ownerId: user.id,
        ownerName: user.name,
        status: 'active',
      });

      addLocation(newLocation);
      setShowConnectModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error creating location:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F7F8FA]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-white border-b border-[#F3F4F6]">
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-[#1A1F36]">Locations</Text>
              <Text className="text-[#9CA3AF] text-sm mt-1">
                {locations.length} {locations.length === 1 ? 'location' : 'locations'} connected
              </Text>
            </View>
          </View>
        </View>

        {/* All Locations Filter */}
        <Pressable
          onPress={() => handleSelectLocation(null)}
          className="mx-6 mb-4 flex-row items-center justify-between px-4 py-3 bg-[#F7F8FA] rounded-xl active:opacity-70"
        >
          <View className="flex-row items-center">
            <MapPin size={18} color="#6B7280" />
            <Text className="text-[#1A1F36] font-medium ml-2">All Locations</Text>
          </View>
          {selectedLocationId === null && (
            <View className="w-5 h-5 bg-[#00D4AA] rounded-full items-center justify-center">
              <Check size={12} color="#ffffff" strokeWidth={3} />
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Cards */}
        {locations.map((location, index) => (
          <Animated.View key={location.id} entering={FadeInDown.delay(index * 100).duration(400)}>
            <LocationCard
              location={location}
              isSelected={selectedLocationId === location.id}
              onSelect={() => handleSelectLocation(location.id)}
            />
          </Animated.View>
        ))}

        {/* Add Location Card */}
        <Animated.View entering={FadeInDown.delay(locations.length * 100).duration(400)}>
          <ConnectPlatformCard onPress={() => setShowConnectModal(true)} />
        </Animated.View>
      </ScrollView>

      {/* Connect Platform Modal */}
      <Modal
        visible={showConnectModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowConnectModal(false)}
      >
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
            <Pressable
              onPress={() => setShowConnectModal(false)}
              className="w-10 h-10 items-center justify-center rounded-full bg-[#F7F8FA] active:opacity-70"
            >
              <X size={20} color="#1A1F36" />
            </Pressable>
            <Text className="text-lg font-semibold text-[#1A1F36]">Connect Platform</Text>
            <View className="w-10" />
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
            {/* Google Business Profile */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <Pressable
                onPress={handleConnectGoogle}
                disabled={isConnecting}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-5 active:opacity-90"
              >
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-[#4285F4]/10 rounded-xl items-center justify-center">
                    <Text className="text-2xl">G</Text>
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-[#1A1F36] font-semibold text-lg">
                      Google Business Profile
                    </Text>
                    <Text className="text-[#9CA3AF] text-sm mt-1">
                      Connect your Google reviews
                    </Text>
                  </View>
                  <View className="w-10 h-10 bg-[#F7F8FA] rounded-full items-center justify-center">
                    <ExternalLink size={18} color="#6B7280" />
                  </View>
                </View>

                {isConnecting && (
                  <View className="mt-4 pt-4 border-t border-[#F3F4F6]">
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-[#00D4AA] mr-2" />
                      <Text className="text-[#00D4AA] text-sm font-medium">
                        Connecting to Google...
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            </Animated.View>

            {/* Trustpilot - Coming Soon */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} className="mt-4">
              <View className="bg-[#F7F8FA] rounded-2xl p-5 opacity-60">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-[#00B67A]/10 rounded-xl items-center justify-center">
                    <Star size={24} color="#00B67A" fill="#00B67A" />
                  </View>
                  <View className="flex-1 ml-4">
                    <View className="flex-row items-center">
                      <Text className="text-[#1A1F36] font-semibold text-lg">Trustpilot</Text>
                      <View className="ml-2 px-2 py-0.5 bg-[#6B7280]/20 rounded">
                        <Text className="text-[#6B7280] text-xs font-medium">Coming Soon</Text>
                      </View>
                    </View>
                    <Text className="text-[#9CA3AF] text-sm mt-1">
                      Connect your Trustpilot reviews
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Info */}
            <View className="mt-8 p-4 bg-[#1A1F36]/5 rounded-xl">
              <View className="flex-row items-start">
                <Link2 size={18} color="#6B7280" className="mt-0.5" />
                <Text className="text-[#6B7280] text-sm ml-3 flex-1 leading-5">
                  Connecting your platforms allows ReputeHQ to fetch your reviews and post responses
                  on your behalf. You can disconnect at any time.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
